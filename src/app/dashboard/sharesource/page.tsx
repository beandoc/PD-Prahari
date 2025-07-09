
'use client';

import { allPatientData } from '@/data/mock-data';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { generatePatientAlerts } from '@/lib/alerts';
import Link from 'next/link';
import { AlertTriangle, Droplets, TrendingUp, Users, CalendarX, CalendarCheck, UserPlus, ShieldAlert, TrendingDown, ListTodo, BarChart3 } from 'lucide-react';
import { format, subDays, isWithinInterval, startOfWeek, endOfWeek, subMonths, startOfMonth, subYears } from 'date-fns';

// --- Data Processing ---

// 1. Fluid Management Data (demonstrated for the first patient)
const fluidData = allPatientData[0].vitals.map(vital => {
    const date = new Date(vital.measurementDateTime);
    const dailyEvents = allPatientData[0].pdEvents.filter(event => new Date(event.exchangeDateTime).toDateString() === date.toDateString());
    const dailyUF = dailyEvents.reduce((acc, curr) => acc + curr.ultrafiltrationML, 0);
    return {
        date: format(date, 'MMM d'),
        weight: vital.weightKG,
        uf: dailyUF,
    };
}).reverse();

// 2. Peritonitis Indicators (demonstrated for the first patient)
const peritonitisData = allPatientData[0].pdEvents
    .filter(event => new Date(event.exchangeDateTime) >= subDays(new Date(), 30))
    .reduce((acc, event) => {
        const date = format(new Date(event.exchangeDateTime), 'MMM d');
        if (!acc[date]) {
            acc[date] = { date, cloudy: 0, clear: 0 };
        }
        if (event.isEffluentCloudy) {
            acc[date].cloudy += 1;
        } else {
            acc[date].clear += 1;
        }
        return acc;
    }, {} as Record<string, { date: string; cloudy: number; clear: number }>);

const peritonitisChartData = Object.values(peritonitisData).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


// 3. Compliance Data (demonstrated for the first patient)
const expectedExchangesPerDay = 4;
const thirtyDaysAgo = subDays(new Date(), 30);
const recentEvents = allPatientData[0].pdEvents.filter(e => new Date(e.exchangeDateTime) >= thirtyDaysAgo);
const daysWithLogs = new Set(recentEvents.map(e => new Date(e.exchangeDateTime).toDateString())).size;
const complianceRate = (daysWithLogs / 30) * 100;
const totalExchangesDone = recentEvents.length;
const totalExchangesExpected = daysWithLogs * expectedExchangesPerDay;


// 4. Patient Status Overview
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
    if (a.status === 'critical') return -1;
    if (b.status === 'critical') return 1;
    if (a.status === 'warning') return -1;
    if (b.status === 'warning') return 1;
    return 0;
});

// --- NEW KPI Calculations ---
const today = new Date();
const totalActivePDPatients = allPatientData.filter(p => p.currentStatus === 'Active PD').length;

const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
const thisWeekAppointments = allPatientData.filter(p => {
    if (!p.clinicVisits?.nextAppointment) return false;
    const apptDate = new Date(p.clinicVisits.nextAppointment);
    return isWithinInterval(apptDate, { start: startOfThisWeek, end: endOfThisWeek });
}).length;

const startOfLastMonth = startOfMonth(subMonths(today, 1));
const endOfThisMonth = startOfMonth(today); // end of last month is start of this month
const newPDPatientsLastMonth = allPatientData.filter(p => {
    const startDate = new Date(p.pdStartDate);
    return isWithinInterval(startDate, { start: startOfLastMonth, end: endOfThisMonth });
}).length;

const oneYearAgo = subYears(today, 1);
const activePeritonitisEpisodes = allPatientData.reduce((acc, patient) => {
    const recentEpisodes = patient.peritonitisEpisodes.filter(ep => new Date(ep.diagnosisDate) >= oneYearAgo).length;
    return acc + recentEpisodes;
}, 0);

const dropoutStatuses: Patient['currentStatus'][] = ['Deceased', 'Transferred to HD', 'Catheter Removed', 'Transplanted'];
const dropouts = allPatientData.filter(p => dropoutStatuses.includes(p.currentStatus)).length;

const awaitingInsertion = allPatientData.filter(p => p.currentStatus === 'Awaiting Catheter').length;

const missedVisits = 2; // Placeholder as mock data doesn't contain past appointments

export default function AnalyticsPage() {
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
                <div className="p-4 bg-slate-50 rounded-lg text-center"><CalendarX className="h-6 w-6 text-red-500 mx-auto mb-2" /><p className="text-3xl font-bold">{missedVisits}</p><p className="text-sm text-muted-foreground">Missed Visits (2mo)</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><CalendarCheck className="h-6 w-6 text-green-500 mx-auto mb-2" /><p className="text-3xl font-bold">{thisWeekAppointments}</p><p className="text-sm text-muted-foreground">This Week's Appts</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><UserPlus className="h-6 w-6 text-indigo-500 mx-auto mb-2" /><p className="text-3xl font-bold">{newPDPatientsLastMonth}</p><p className="text-sm text-muted-foreground">New Patients (1mo)</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><ShieldAlert className="h-6 w-6 text-yellow-500 mx-auto mb-2" /><p className="text-3xl font-bold">{activePeritonitisEpisodes}</p><p className="text-sm text-muted-foreground">Peritonitis (1yr)</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><TrendingDown className="h-6 w-6 text-gray-600 mx-auto mb-2" /><p className="text-3xl font-bold">{dropouts}</p><p className="text-sm text-muted-foreground">Dropouts</p></div>
                <div className="p-4 bg-slate-50 rounded-lg text-center"><ListTodo className="h-6 w-6 text-purple-500 mx-auto mb-2" /><p className="text-3xl font-bold">{awaitingInsertion}</p><p className="text-sm text-muted-foreground">Awaiting Insertion</p></div>
            </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Droplets className="text-blue-500" />
                        Fluid Management Trends
                    </CardTitle>
                    <CardDescription>
                        Daily weight vs. total ultrafiltration for {allPatientData[0].firstName}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={fluidData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'UF (mL)', angle: -90, position: 'insideRight' }}/>
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} name="Weight (kg)" />
                            <Line yAxisId="right" type="monotone" dataKey="uf" stroke="#82ca9d" name="UF (mL)" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-red-500" />
                        Peritonitis Indicators (Last 30d)
                    </CardTitle>
                    <CardDescription>
                       Frequency of cloudy vs. clear effluent for {allPatientData[0].firstName}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={peritonitisChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="clear" stackId="a" fill="#82ca9d" name="Clear Bags" />
                            <Bar dataKey="cloudy" stackId="a" fill="#ffc658" name="Cloudy Bags" />
                        </BarChart>
                    </ResponsiveContainer>
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
                        <TableHead>Physician</TableHead>
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
