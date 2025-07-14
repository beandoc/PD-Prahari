
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { allPatientData } from '@/data/mock-data';
import Link from 'next/link';
import { format, addDays, parseISO, isToday } from 'date-fns';
import { UserPlus, UserCog, ShieldAlert, Home, AlertCircle, Droplets, ShoppingBag, MessageSquare, CalendarCheck } from 'lucide-react';
import type { PatientData } from '@/lib/types';

interface MetricCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
}

const MetricCard = ({ title, value, icon }: MetricCardProps) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

interface AlertItem {
    patient: PatientData;
    type: 'symptom' | 'supply' | 'cloudy' | 'exit_site';
    details: string;
    date: Date;
}

const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
        case 'symptom': return <AlertCircle className="h-4 w-4 text-orange-500" />;
        case 'supply': return <ShoppingBag className="h-4 w-4 text-blue-500" />;
        case 'cloudy': return <Droplets className="h-4 w-4 text-yellow-500" />;
        case 'exit_site': return <MessageSquare className="h-4 w-4 text-red-500" />;
    }
}

export default function NurseDashboardPage() {
    const [urgentAlerts, setUrgentAlerts] = useState<AlertItem[]>([]);

    useEffect(() => {
        // --- Generate dummy alerts for demonstration on the client side ---
        const alerts: AlertItem[] = [
            { patient: allPatientData[0], type: 'exit_site', details: 'Patient reports redness and pain at exit site.', date: addDays(new Date(), -1) },
            { patient: allPatientData[2], type: 'cloudy', details: 'Reported cloudy effluent bag this morning.', date: new Date() },
            { patient: allPatientData[1], type: 'symptom', details: 'New symptom: mild ankle edema.', date: addDays(new Date(), -2) },
        ];
        setUrgentAlerts(alerts);
    }, []);

    // --- Data processing for dashboard metrics ---
    const patientsAwaitingInsertion = allPatientData.filter(p => p.currentStatus === 'Awaiting Catheter').length;
    
    // Assuming 'training' status doesn't exist, we'll use new patients as a proxy
    const patientsInTraining = allPatientData.filter(p => p.pdStartDate && new Date(p.pdStartDate) > addDays(new Date(), -90)).length;
    
    const patientsOnPeritonitisTx = allPatientData.filter(p => 
        p.peritonitisEpisodes.some(ep => ep.outcome !== 'Resolved' && new Date(ep.diagnosisDate) > addDays(new Date(), -30))
    ).length;

    const todaysAppointments = allPatientData.filter(p => 
        p.clinicVisits?.nextAppointment && isToday(parseISO(p.clinicVisits.nextAppointment))
    ).length;

    const upcomingHomeVisits = allPatientData
        .filter(p => p.lastHomeVisitDate)
        .map(p => ({
            ...p,
            nextVisitDue: addDays(parseISO(p.lastHomeVisitDate!), 90) // Assuming a 90-day cycle
        }))
        .filter(p => p.nextVisitDue > new Date() && p.nextVisitDue < addDays(new Date(), 30))
        .sort((a, b) => a.nextVisitDue.getTime() - b.nextVisitDue.getTime());

    
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold">PD Nurse Dashboard</h1>
                <p className="text-muted-foreground">Your daily overview for proactive patient care.</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Awaiting Catheter Insertion" value={patientsAwaitingInsertion} icon={<UserPlus className="h-4 w-4 text-muted-foreground" />} />
                <MetricCard title="Patients in Training (90d)" value={patientsInTraining} icon={<UserCog className="h-4 w-4 text-muted-foreground" />} />
                <MetricCard title="Active Peritonitis Tx" value={patientsOnPeritonitisTx} icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />} />
                <MetricCard title="Today's Appointments" value={todaysAppointments} icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5 text-green-600" />
                            Upcoming Home Visits (Next 30 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Phone</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {upcomingHomeVisits.length > 0 ? upcomingHomeVisits.map(p => (
                                    <TableRow key={p.patientId}>
                                        <TableCell>
                                            <Link href={`/dashboard/patients/${p.patientId}`} className="font-medium hover:underline">
                                                {p.firstName} {p.lastName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{format(p.nextVisitDue, 'PPP')}</TableCell>
                                        <TableCell>{p.contactPhone}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">No home visits due soon.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Urgent Patient Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {urgentAlerts.length > 0 ? urgentAlerts.map((alert, index) => (
                                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border">
                                    <div className="pt-1">{getAlertIcon(alert.type)}</div>
                                    <div>
                                        <p className="text-sm">
                                            <Link href={`/dashboard/patients/${alert.patient.patientId}`} className="font-semibold hover:underline">
                                                {alert.patient.firstName} {alert.patient.lastName}
                                            </Link>
                                            : {alert.details}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{format(alert.date, 'PPP HH:mm')}</p>
                                    </div>
                                </li>
                            )) : (
                               <li className="text-center h-24 text-muted-foreground">No urgent alerts.</li> 
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
