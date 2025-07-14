
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { allPatientData } from '@/data/mock-data';
import Link from 'next/link';
import { format, addDays, parseISO, isToday, differenceInDays } from 'date-fns';
import { UserPlus, UserCog, ShieldAlert, Home, AlertCircle, Droplets, ShoppingBag, MessageSquare, CalendarCheck, FilterX, User, ArrowRight } from 'lucide-react';
import type { PatientData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type FilterType = 'awaiting_insertion' | 'in_training' | 'peritonitis_tx' | 'all';

interface MetricCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    onClick: () => void;
    isActive: boolean;
}

const MetricCard = ({ title, value, icon, onClick, isActive }: MetricCardProps) => (
    <Card 
        className={cn("cursor-pointer hover:bg-muted/50 transition-colors", isActive && "ring-2 ring-primary")}
        onClick={onClick}
    >
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
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
        // --- Generate dummy alerts for demonstration on the client side ---
        const alerts: AlertItem[] = [
            { patient: allPatientData[0], type: 'exit_site', details: 'Patient reports redness and pain at exit site.', date: addDays(new Date(), -1) },
            { patient: allPatientData[2], type: 'cloudy', details: 'Reported cloudy effluent bag this morning.', date: new Date() },
            { patient: allPatientData[1], type: 'symptom', details: 'New symptom: mild ankle edema.', date: addDays(new Date(), -2) },
        ];
        setUrgentAlerts(alerts);
    }, []);

    // --- Data processing for dashboard metrics and filters ---
    const {
        patientsAwaitingInsertion,
        patientsInTraining,
        patientsOnPeritonitisTx,
        todaysAppointments,
        upcomingHomeVisits
    } = useMemo(() => {
        const now = new Date();
        const patientsAwaitingInsertion = allPatientData.filter(p => p.currentStatus === 'Awaiting Catheter');
        const patientsInTraining = allPatientData.filter(p => p.pdStartDate && differenceInDays(now, parseISO(p.pdStartDate)) <= 90 && p.currentStatus === 'Active PD');
        const patientsOnPeritonitisTx = allPatientData.filter(p => 
            p.peritonitisEpisodes.some(ep => ep.outcome !== 'Resolved' && differenceInDays(now, parseISO(ep.diagnosisDate)) <= 30)
        );
        const todaysAppointments = allPatientData.filter(p => 
            p.clinicVisits?.nextAppointment && isToday(parseISO(p.clinicVisits.nextAppointment))
        ).length;

        const upcomingHomeVisits = allPatientData
            .filter(p => p.lastHomeVisitDate)
            .map(p => ({
                ...p,
                nextVisitDue: addDays(parseISO(p.lastHomeVisitDate!), 90) // Assuming a 90-day cycle
            }))
            .filter(p => p.nextVisitDue > now && p.nextVisitDue < addDays(now, 30))
            .sort((a, b) => a.nextVisitDue.getTime() - b.nextVisitDue.getTime());

        return { patientsAwaitingInsertion, patientsInTraining, patientsOnPeritonitisTx, todaysAppointments, upcomingHomeVisits };

    }, []);

    const filteredPatients = useMemo(() => {
        switch (activeFilter) {
            case 'awaiting_insertion': return patientsAwaitingInsertion;
            case 'in_training': return patientsInTraining;
            case 'peritonitis_tx': return patientsOnPeritonitisTx;
            default: return [];
        }
    }, [activeFilter, patientsAwaitingInsertion, patientsInTraining, patientsOnPeritonitisTx]);

    const filterTitles: Record<FilterType, string> = {
        all: 'Patient List',
        awaiting_insertion: 'Patients Awaiting Catheter Insertion',
        in_training: 'Patients in Training (Last 90 Days)',
        peritonitis_tx: 'Patients on Active Peritonitis Treatment'
    };

    if (!isClient) {
        return (
             <div className="space-y-6">
                 <Skeleton className="h-12 w-1/3" />
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                     {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                 </div>
            </div>
        )
    }

    
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold">PD Nurse Dashboard</h1>
                <p className="text-muted-foreground">Your daily overview for proactive patient care.</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Awaiting Catheter Insertion" value={patientsAwaitingInsertion.length} icon={<UserPlus className="h-4 w-4 text-muted-foreground" />} onClick={() => setActiveFilter('awaiting_insertion')} isActive={activeFilter === 'awaiting_insertion'} />
                <MetricCard title="Patients in Training (90d)" value={patientsInTraining.length} icon={<UserCog className="h-4 w-4 text-muted-foreground" />} onClick={() => setActiveFilter('in_training')} isActive={activeFilter === 'in_training'} />
                <MetricCard title="Active Peritonitis Tx" value={patientsOnPeritonitisTx.length} icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />} onClick={() => setActiveFilter('peritonitis_tx')} isActive={activeFilter === 'peritonitis_tx'} />
                <MetricCard title="Today's Appointments" value={todaysAppointments} icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />} onClick={() => {}} isActive={false} />
            </div>

            {activeFilter !== 'all' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{filterTitles[activeFilter]}</CardTitle>
                            <Button variant="ghost" onClick={() => setActiveFilter('all')}>
                                <FilterX className="mr-2 h-4 w-4" /> Clear Filter
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Physician</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPatients.length > 0 ? filteredPatients.map(p => (
                                    <TableRow key={p.patientId}>
                                        <TableCell>
                                            <p className="font-medium">{p.firstName} {p.lastName}</p>
                                            <p className="text-sm text-muted-foreground">{p.nephroId}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={p.currentStatus === 'Active PD' ? 'secondary' : 'outline'}>{p.currentStatus}</Badge>
                                        </TableCell>
                                        <TableCell>{p.physician}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/dashboard/nurse-checklist?patientId=${p.patientId}`}>
                                                    View Checklist <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No patients match this filter.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

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
                               <li className="text-center h-24 flex items-center justify-center text-muted-foreground">No urgent alerts.</li> 
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
