// We remove 'use client' to make this a Server Component by default.
// No more useState, useEffect, or useMemo needed here.

import { getLiveAllPatientData, getPeritonitisRate, getClinicKpis } from '@/app/actions';
import type { PatientData, PDEvent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { generatePatientAlerts } from '@/lib/alerts';
import Link from 'next/link';
import { AlertTriangle, BarChart3, Users, CalendarX, CalendarCheck, UserPlus, ShieldAlert, TrendingDown, ListTodo, Repeat } from 'lucide-react';
import { format, subDays, isAfter, startOfDay, parseISO } from 'date-fns';
import { UfCarousel } from '@/components/dashboard/uf-carousel';
import { InfectionCarousel } from '@/components/dashboard/infection-carousel';

// Helper functions can remain the same or be moved to a separate utils file.
const calculatePeritonitisRisk = (patient: PatientData): number => {
    let score = 0;
    if (patient.peritonitisEpisodes.some(ep => isAfter(parseISO(ep.diagnosisDate), subDays(new Date(), 180)))) {
        score += 50;
    }
    if (patient.esiCount && patient.esiCount > 0) {
        score += 25;
    }
    const latestAlbumin = patient.labResults.find(lr => lr.testName === 'Albumin');
    if (latestAlbumin && latestAlbumin.resultValue < 3.5) {
        score += 15;
    }
    if (patient.pdExchangeType === 'Assisted') {
        score += 10;
    }
    return Math.min(100, score + Math.random() * 5);
};

const getDailyUf = (events: PDEvent[]): Record<string, number> => {
    const dailyUfMap: Record<string, number> = {};
    events.forEach(event => {
        const day = startOfDay(new Date(event.exchangeDateTime)).toISOString().split('T')[0];
        dailyUfMap[day] = (dailyUfMap[day] || 0) + event.ultrafiltrationML;
    });
    return dailyUfMap;
};

const getAverageUf = (dailyUfMap: Record<string, number>): number => {
    const values = Object.values(dailyUfMap);
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
};


// Make the component async to use await for data fetching.
export default async function AnalyticsPage() {
  
  // Fetch all data directly on the server. These requests run in parallel.
  const allPatientDataPromise = getLiveAllPatientData();
  const peritonitisRatePromise = getPeritonitisRate();
  const clinicKpisPromise = getClinicKpis();

  const [allPatientData, peritonitisRate, clinicKpis] = await Promise.all([
    allPatientDataPromise,
    peritonitisRatePromise,
    clinicKpisPromise,
  ]);

  // Perform all heavy data calculations on the server.
  const patientsWithStatus = allPatientData.map(patient => {
    const alerts = generatePatientAlerts(patient);
    let status: 'critical' | 'warning' | 'stable' = 'stable';
    if (alerts.some(a => a.severity === 'critical')) {
        status = 'critical';
    } else if (alerts.length > 0) {
        status = 'warning';
    }
    return { ...patient, alerts, status };
  }).sort((a, b) => {
        if (a.status === 'critical' && b.status !== 'critical') return -1;
        if (b.status === 'critical' && a.status !== 'critical') return 1;
        if (a.status === 'warning' && b.status !== 'warning') return -1;
        if (b.status === 'warning' && a.status !== 'warning') return 1;
        return 0;
    });

  const sixMonthsAgo = subDays(new Date(), 180);
  const flaggedInfectionPatients = allPatientData.flatMap(patient => {
    const infections: { patientId: string; firstName: string; lastName: string; type: 'Peritonitis' | 'Exit Site Infection'; date: Date; }[] = [];
    patient.peritonitisEpisodes.forEach(episode => {
      const episodeDate = parseISO(episode.diagnosisDate);
      if (isAfter(episodeDate, sixMonthsAgo)) {
        infections.push({ patientId: patient.patientId, firstName: patient.firstName, lastName: patient.lastName, type: 'Peritonitis', date: episodeDate });
      }
    });
    if (patient.esiCount && patient.esiCount > 0 && patient.lastHomeVisitDate) {
        const esiDate = parseISO(patient.lastHomeVisitDate);
        if (isAfter(esiDate, sixMonthsAgo)) {
            infections.push({ patientId: patient.patientId, firstName: patient.firstName, lastName: patient.lastName, type: 'Exit Site Infection', date: esiDate });
        }
   }
    return infections;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const twoWeeksAgo = subDays(new Date(), 14);
  const flaggedUfPatients = allPatientData.map(patient => {
        if (!patient.pdEvents || patient.pdEvents.length < 14) return null;
        const recentEvents = patient.pdEvents.filter(e => isAfter(parseISO(e.exchangeDateTime), twoWeeksAgo));
        const baselineEvents = patient.pdEvents.filter(e => !isAfter(parseISO(e.exchangeDateTime), twoWeeksAgo));
        if (baselineEvents.length === 0 || recentEvents.length === 0) return null;
        const recentAvg = getAverageUf(getDailyUf(recentEvents));
        const baselineAvg = getAverageUf(getDailyUf(baselineEvents));
        if (baselineAvg > 100 && recentAvg < baselineAvg * 0.75) {
             return { patientId: patient.patientId, firstName: patient.firstName, lastName: patient.lastName, baselineUf: baselineAvg, recentUf: recentAvg };
        }
        return null;
    }).filter(p => p !== null);

  const peritonitisRiskList = allPatientData
      .map(p => ({
        ...p,
        riskScore: calculatePeritonitisRisk(p),
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3);
  
  return (
    <div className="space-y-8">
       <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Clinic Analytics
          </h1>
          <p className="text-muted-foreground">
            A high-level overview of clinic performance and patient metrics.
          </p>
        </header>
        
        <Card>
            <CardHeader>
                <CardTitle>Clinic-Wide KPIs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                <div className="p-4 bg-slate-50 rounded-lg text-center"><Users className="h-6 w-6 text-blue-500 mx-auto mb-2" /><p className="text-3xl font-bold">{clinicKpis.totalActivePDPatients}</p><p className="text-sm text-muted-foreground">Total PD Patients</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><CalendarX className="h-6 w-6 text-red-500 mx-auto mb-2" /><p className="text-3xl font-bold">{clinicKpis.missedVisits}</p><p className="text-sm text-muted-foreground">Missed Visits</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><CalendarCheck className="h-6 w-6 text-green-500 mx-auto mb-2" /><p className="text-3xl font-bold">{clinicKpis.thisWeekAppointments}</p><p className="text-sm text-muted-foreground">This Week's Appts</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><UserPlus className="h-6 w-6 text-indigo-500 mx-auto mb-2" /><p className="text-3xl font-bold">{clinicKpis.newPDPatientsLastMonth}</p><p className="text-sm text-muted-foreground">New Patients</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><Repeat className="h-6 w-6 text-yellow-500 mx-auto mb-2" /><p className="text-3xl font-bold">{peritonitisRate !== null ? (isFinite(peritonitisRate) ? peritonitisRate.toFixed(2) : 'High') : 'N/A'}</p><p className="text-sm text-muted-foreground">Peritonitis Rate</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><TrendingDown className="h-6 w-6 text-gray-600 mx-auto mb-2" /><p className="text-3xl font-bold">{clinicKpis.dropouts}</p><p className="text-sm text-muted-foreground">Dropouts</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><ListTodo className="h-6 w-6 text-purple-500 mx-auto mb-2" /><p className="text-3xl font-bold">{clinicKpis.awaitingInsertion}</p><p className="text-sm text-muted-foreground">Awaiting Insertion</p></div>
            </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                         <ShieldAlert className="text-red-500" />
                        Peritonitis Risk Score
                    </CardTitle>
                    <CardDescription>
                        Top 3 patients with the highest risk, predicted by ML model.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {peritonitisRiskList.map(p => (
                            <li key={p.patientId} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                                <Link href={`/dashboard/patients/${p.patientId}`} className="font-semibold hover:underline">
                                    {p.firstName} {p.lastName}
                                </Link>
                                <Badge variant="destructive" className="text-base">{p.riskScore.toFixed(0)}</Badge>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            
            <UfCarousel flaggedUfPatients={flaggedUfPatients as any[]} />
            <InfectionCarousel flaggedInfectionPatients={flaggedInfectionPatients} />

        </div>

        <Card>
            <CardHeader>
                <CardTitle>Patient Status Overview</CardTitle>
                <CardDescription>Live status of all patients based on recent data and alerts.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Nephrologist</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Alerts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patientsWithStatus.map(patient => (
                            <TableRow key={patient.patientId} className={patient.status === 'critical' ? 'bg-red-50/50' : patient.status === 'warning' ? 'bg-yellow-50/50' : ''}>
                                <TableCell>
                                    <Link href={`/dashboard/patients/${patient.patientId}`} className="font-medium hover:underline">
                                        {patient.lastName}, {patient.firstName}
                                    </Link>
                                </TableCell>
                                <TableCell>{patient.physician}</TableCell>
                                <TableCell>
                                    <Badge variant={patient.status === 'stable' ? 'secondary' : 'outline'} className={patient.status === 'critical' ? 'bg-red-500 text-white' : patient.status === 'warning' ? 'bg-yellow-400 text-black' : ''}>
                                        {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {patient.alerts.length > 0 ? `${patient.alerts.length} Active` : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
    </div>
  );
}
