
'use client';

import { useState, useMemo, useEffect } from 'react';
import { getLiveAllPatientData } from '@/lib/data-sync';
import type { Patient, PatientData, PDEvent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { generatePatientAlerts } from '@/lib/alerts';
import Link from 'next/link';
import { AlertTriangle, Droplets, TrendingUp, Users, CalendarX, CalendarCheck, UserPlus, ShieldAlert, TrendingDown, ListTodo, BarChart3, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { format, subDays, isWithinInterval, startOfWeek, endOfWeek, subMonths, startOfMonth, subYears, isAfter, startOfDay, parseISO, differenceInMonths, differenceInWeeks, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getPeritonitisRate } from '@/app/actions';


interface FlaggedPatient {
    patientId: string;
    firstName: string;
    lastName: string;
    type: 'Peritonitis' | 'Exit Site Infection';
    date: Date;
}

interface FlaggedUfPatient {
    patientId: string;
    firstName: string;
    lastName: string;
    baselineUf: number;
    recentUf: number;
}

// --- ML Model Simulation ---
// In a real application, this would be an API call to a proper ML model.
// For this prototype, we simulate the model's output.
const calculatePeritonitisRisk = (patient: PatientData): number => {
    let score = 0;
    // Recent peritonitis is a major factor
    if (patient.peritonitisEpisodes.some(ep => isAfter(parseISO(ep.diagnosisDate), subMonths(new Date(), 6)))) {
        score += 50;
    }
    // ESI is a known risk factor
    if (patient.esiCount && patient.esiCount > 0) {
        score += 25;
    }
    // Lower albumin can indicate higher risk
    const latestAlbumin = patient.labResults.find(lr => lr.testName === 'Albumin');
    if (latestAlbumin && latestAlbumin.resultValue < 3.5) {
        score += 15;
    }
    // Assisted PD can sometimes be a risk factor
    if (patient.pdExchangeType === 'Assisted') {
        score += 10;
    }
    return Math.min(100, score + Math.random() * 5); // Add some noise
};
// --- End of ML Simulation ---

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


export default function AnalyticsPage() {
  const [allPatientData, setAllPatientData] = useState<PatientData[]>([]);
  const [infectionIndex, setInfectionIndex] = useState(0);
  const [ufIndex, setUfIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [peritonitisRate, setPeritonitisRate] = useState<number | null>(null);

  useEffect(() => {
    const data = getLiveAllPatientData();
    setAllPatientData(data);
    getPeritonitisRate().then(rate => {
        setPeritonitisRate(rate);
        setIsLoading(false);
    });
  }, []);

  const {
      patientsWithStatus,
      totalActivePDPatients,
      thisWeekAppointments,
      newPDPatientsLastMonth,
      dropouts,
      awaitingInsertion,
      missedVisits,
      flaggedInfectionPatients,
      flaggedUfPatients,
      peritonitisRiskList,
  } = useMemo(() => {
    const today = new Date();
    const isToday = (date: Date) => {
        return differenceInDays(startOfDay(date), startOfDay(new Date())) === 0;
    };

    if (isLoading) return { patientsWithStatus: [], totalActivePDPatients: 0, thisWeekAppointments: 0, newPDPatientsLastMonth: 0, dropouts: 0, awaitingInsertion: 0, missedVisits: 0, flaggedInfectionPatients: [], flaggedUfPatients: [], peritonitisRiskList: [] };

    
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
    
    const totalActivePDPatients = allPatientData.filter(p => p.currentStatus === 'Active PD').length;

    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
    const thisWeekAppointments = allPatientData.filter(p => {
        if (!p.clinicVisits?.nextAppointment) return false;
        const apptDate = parseISO(p.clinicVisits.nextAppointment);
        return isWithinInterval(apptDate, { start: startOfThisWeek, end: endOfThisWeek });
    }).length;

    const startOfLastMonth = startOfMonth(subMonths(today, 1));
    const endOfLastMonth = startOfMonth(today);
    const newPDPatientsLastMonth = allPatientData.filter(p => {
        if (!p.pdStartDate) return false;
        const startDate = parseISO(p.pdStartDate);
        return isWithinInterval(startDate, { start: startOfLastMonth, end: endOfLastMonth });
    }).length;

    const dropoutStatuses: Patient['currentStatus'][] = ['Deceased', 'Transferred to HD', 'Catheter Removed', 'Transplanted'];
    const dropouts = allPatientData.filter(p => dropoutStatuses.includes(p.currentStatus)).length;
    const awaitingInsertion = allPatientData.filter(p => p.currentStatus === 'Awaiting Catheter').length;
    
    const missedVisits = allPatientData.filter(p => {
        if (!p.clinicVisits?.nextAppointment || p.clinicVisits.nextAppointment === '') {
            return false;
        }
        const appointmentDate = parseISO(p.clinicVisits.nextAppointment);
        return isAfter(today, appointmentDate) && !isToday(appointmentDate);
    }).length; 

    const flaggedInfections: FlaggedPatient[] = [];
    const sixMonthsAgo = subMonths(new Date(), 6);
    allPatientData.forEach(patient => {
        patient.peritonitisEpisodes.forEach(episode => {
            const episodeDate = parseISO(episode.diagnosisDate);
            if (isAfter(episodeDate, sixMonthsAgo)) {
                flaggedInfections.push({ patientId: patient.patientId, firstName: patient.firstName, lastName: patient.lastName, type: 'Peritonitis', date: episodeDate });
            }
        });
        if (patient.esiCount && patient.esiCount > 0 && patient.lastHomeVisitDate) {
             const esiDate = parseISO(patient.lastHomeVisitDate); // Approximate date
             if (isAfter(esiDate, sixMonthsAgo)) {
                 flaggedInfections.push({ patientId: patient.patientId, firstName: patient.firstName, lastName: patient.lastName, type: 'Exit Site Infection', date: esiDate });
             }
        }
    });

    const flaggedUf: FlaggedUfPatient[] = [];
    const twoWeeksAgo = subDays(new Date(), 14);
    allPatientData.forEach(patient => {
        if (!patient.pdEvents || patient.pdEvents.length < 14) return;
        const recentEvents = patient.pdEvents.filter(e => isAfter(parseISO(e.exchangeDateTime), twoWeeksAgo));
        const baselineEvents = patient.pdEvents.filter(e => !isAfter(parseISO(e.exchangeDateTime), twoWeeksAgo));
        if (baselineEvents.length === 0 || recentEvents.length === 0) return;
        const recentAvg = getAverageUf(getDailyUf(recentEvents));
        const baselineAvg = getAverageUf(getDailyUf(baselineEvents));
        if (baselineAvg > 100 && recentAvg < baselineAvg * 0.75) {
             flaggedUf.push({ patientId: patient.patientId, firstName: patient.firstName, lastName: patient.lastName, baselineUf: baselineAvg, recentUf: recentAvg });
        }
    });

    const peritonitisRiskList = allPatientData
      .map(p => ({
        ...p,
        riskScore: calculatePeritonitisRisk(p),
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3);

    return {
        patientsWithStatus, totalActivePDPatients, thisWeekAppointments, newPDPatientsLastMonth,
        dropouts, awaitingInsertion, missedVisits,
        flaggedInfectionPatients: flaggedInfections.sort((a, b) => b.date.getTime() - a.date.getTime()),
        flaggedUfPatients: flaggedUf,
        peritonitisRiskList
    };
  }, [allPatientData, isLoading]);

    const handleNextInfection = () => setInfectionIndex((prev) => (prev + 1) % flaggedInfectionPatients.length);
    const handlePrevInfection = () => setInfectionIndex((prev) => (prev - 1 + flaggedInfectionPatients.length) % flaggedInfectionPatients.length);
    const currentInfection = flaggedInfectionPatients[infectionIndex];

    const handleNextUf = () => setUfIndex((prev) => (prev + 1) % flaggedUfPatients.length);
    const handlePrevUf = () => setUfIndex((prev) => (prev - 1 + flaggedUfPatients.length) % flaggedUfPatients.length);
    const currentUfPatient = flaggedUfPatients[ufIndex];

    if (isLoading) {
        return (
            <div className="space-y-8">
                 <Skeleton className="h-12 w-1/3" />
                 <Card>
                    <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                        {Array.from({length: 7}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                    </CardContent>
                 </Card>
                 <div className="grid gap-6 lg:grid-cols-3">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                 </div>
                 <Skeleton className="h-96 w-full" />
            </div>
        )
    }


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
                <div className="p-4 bg-slate-50 rounded-lg text-center"><Users className="h-6 w-6 text-blue-500 mx-auto mb-2" /><p className="text-3xl font-bold">{totalActivePDPatients}</p><p className="text-sm text-muted-foreground">Total PD Patients</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><CalendarX className="h-6 w-6 text-red-500 mx-auto mb-2" /><p className="text-3xl font-bold">{missedVisits}</p><p className="text-sm text-muted-foreground">Missed Visits</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><CalendarCheck className="h-6 w-6 text-green-500 mx-auto mb-2" /><p className="text-3xl font-bold">{thisWeekAppointments}</p><p className="text-sm text-muted-foreground">This Week's Appts</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><UserPlus className="h-6 w-6 text-indigo-500 mx-auto mb-2" /><p className="text-3xl font-bold">{newPDPatientsLastMonth}</p><p className="text-sm text-muted-foreground">New Patients</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><Repeat className="h-6 w-6 text-yellow-500 mx-auto mb-2" /><p className="text-3xl font-bold">{peritonitisRate !== null ? (isFinite(peritonitisRate) ? peritonitisRate.toFixed(2) : 'High') : 'N/A'}</p><p className="text-sm text-muted-foreground">Peritonitis Rate</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><TrendingDown className="h-6 w-6 text-gray-600 mx-auto mb-2" /><p className="text-3xl font-bold">{dropouts}</p><p className="text-sm text-muted-foreground">Dropouts</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><ListTodo className="h-6 w-6 text-purple-500 mx-auto mb-2" /><p className="text-3xl font-bold">{awaitingInsertion}</p><p className="text-sm text-muted-foreground">Awaiting Insertion</p></div>
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Droplets className="text-blue-500" />
                        Patients with Decreasing Ultrafiltration
                    </CardTitle>
                    {flaggedUfPatients.length > 0 ? (
                        <CardDescription>
                           Showing {ufIndex + 1} of {flaggedUfPatients.length} patients with a significant drop in UF.
                        </CardDescription>
                    ) : (
                         <CardDescription>
                           No patients with a significant drop in UF detected.
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                     {flaggedUfPatients.length > 0 ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Patient</p>
                                    <Link href={`/dashboard/patients/${currentUfPatient.patientId}`} className="font-bold text-lg hover:underline">
                                        {currentUfPatient.firstName} {currentUfPatient.lastName}
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <p className="text-sm text-muted-foreground">Baseline UF (Avg)</p>
                                        <p className="font-semibold">{currentUfPatient.baselineUf.toFixed(0)} mL/day</p>
                                    </div>
                                    <div className="text-red-600">
                                        <p className="text-sm font-semibold text-red-800">Recent UF (Avg 14d)</p>
                                        <p className="font-bold">{currentUfPatient.recentUf.toFixed(0)} mL/day</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <Button variant="outline" size="sm" onClick={handlePrevUf} disabled={flaggedUfPatients.length <= 1}>
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleNextUf} disabled={flaggedUfPatients.length <= 1}>
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center text-center text-muted-foreground h-[200px]">
                            <p>UF trends for all patients appear stable.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-yellow-500" />
                        Infective complications (last 6 months)
                    </CardTitle>
                    {flaggedInfectionPatients.length > 0 ? (
                        <CardDescription>
                           Showing {infectionIndex + 1} of {flaggedInfectionPatients.length} patients with recent infections.
                        </CardDescription>
                    ) : (
                         <CardDescription>
                           No patients with recent infections.
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                     {flaggedInfectionPatients.length > 0 ? (
                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Patient</p>
                                    <Link href={`/dashboard/patients/${currentInfection.patientId}`} className="font-bold text-lg hover:underline">
                                        {currentInfection.firstName} {currentInfection.lastName}
                                    </Link>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Issue</p>
                                    <Badge variant="destructive">{currentInfection.type}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-semibold">{format(currentInfection.date, 'PPP')}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <Button variant="outline" size="sm" onClick={handlePrevInfection} disabled={flaggedInfectionPatients.length <= 1}>
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleNextInfection} disabled={flaggedInfectionPatients.length <= 1}>
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center text-center text-muted-foreground h-[200px]">
                            <p>No peritonitis or ESI cases in the last 6 months.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
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
