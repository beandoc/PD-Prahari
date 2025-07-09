
'use client';

import { allPatientData } from '@/data/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { generatePatientAlerts } from '@/lib/alerts';
import type { Alert } from '@/lib/alerts';
import Link from 'next/link';
import { AlertTriangle, Droplets, TrendingUp, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { format, subDays, startOfMonth, differenceInDays } from 'date-fns';

// --- Data Processing ---
// Note: In a real app, this processing would be more robust and likely done on a server/API.

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


export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
       <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Clinic Analytics
          </h1>
          <p className="text-muted-foreground">
            An overview of patient trends, compliance, and clinical risks.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>Logging Compliance (Last 30d)</CardTitle>
                    <CardDescription>Patient: {allPatientData[0].firstName} {allPatientData[0].lastName}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-5xl font-bold text-green-600">
                        {complianceRate.toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Logged on {daysWithLogs} of the last 30 days.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Exchange Adherence (Last 30d)</CardTitle>
                    <CardDescription>Based on days with any logs.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-2">
                     <div className="text-5xl font-bold text-blue-600">
                        {totalExchangesDone} / {totalExchangesExpected}
                    </div>
                    <p className="text-sm text-muted-foreground">Total exchanges performed vs. expected.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Active Alerts</CardTitle>
                    <CardDescription>Across all patients in the clinic.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-red-500">{patientsWithStatus.filter(p => p.status === 'critical').length}</div>
                        <p className="text-sm font-medium text-red-500">Critical</p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-500">{patientsWithStatus.filter(p => p.status === 'warning').length}</div>
                        <p className="text-sm font-medium text-yellow-500">Warning</p>
                    </div>
                </CardContent>
            </Card>
        </div>

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
