
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format, addDays, parseISO, isToday, differenceInDays, addWeeks, isAfter } from 'date-fns';
import { UserPlus, UserCog, ShieldAlert, Home, AlertCircle, Droplets, ShoppingBag, MessageSquare, CalendarCheck, FilterX, User, ArrowRight, FlaskConical, Stethoscope, BookOpen, Clock } from 'lucide-react';
import type { PatientData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { getLiveAllPatientData } from '@/app/actions';

type FilterType = 'awaiting_insertion' | 'in_training' | 'peritonitis_tx' | 'todays_appointments' | 'all';

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
    type: 'symptom' | 'supply' | 'cloudy' | 'exit_site' | 'doctor_note';
    details: string;
    date: Date;
}

const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
        case 'symptom': return <AlertCircle className="h-4 w-4 text-orange-500" />;
        case 'supply': return <ShoppingBag className="h-4 w-4 text-blue-500" />;
        case 'cloudy': return <Droplets className="h-4 w-4 text-yellow-500" />;
        case 'exit_site': return <AlertCircle className="h-4 w-4 text-red-500" />;
        case 'doctor_note': return <Stethoscope className="h-4 w-4 text-indigo-500" />;
    }
}

export default function NurseDashboardPage() {
    const [allPatientData, setAllPatientData] = useState<PatientData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [urgentAlerts, setUrgentAlerts] = useState<AlertItem[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    
    useEffect(() => {
        const data = getLiveAllPatientData();
        setAllPatientData(data);

        const alerts: AlertItem[] = [];
        data.forEach(p => {
            // @ts-ignore - This is a temporary property for demonstration
            if (p.newCloudyAlert) {
                // @ts-ignore
                alerts.push({ patient: p, type: 'cloudy', details: p.newCloudyAlert.details, date: p.newCloudyAlert.date });
            }
        });
        
        alerts.push({ patient: data[2], type: 'doctor_note', details: 'Dr. Parikshit: Please schedule a follow-up PET test for Priya D.', date: new Date() });
        alerts.push({ patient: data[0], type: 'exit_site', details: 'Patient reports redness and pain at exit site.', date: addDays(new Date(), -1) });
        alerts.push({ patient: data[1], type: 'symptom', details: 'Patient reports mild ankle edema.', date: addDays(new Date(), -1) });

        setUrgentAlerts(alerts.sort((a, b) => b.date.getTime() - a.date.getTime()));
        setIsLoading(false);
    }, []);

    const {
        patientsAwaitingInsertion,
        patientsInTraining,
        patientsOnPeritonitisTx,
        todaysAppointmentsList,
        upcomingHomeVisits,
        upcomingPetTests,
    } = useMemo(() => {
        if (isLoading) return { patientsAwaitingInsertion: [], patientsInTraining: [], patientsOnPeritonitisTx: [], todaysAppointmentsList: [], upcomingHomeVisits: [], upcomingPetTests: [] };

        const now = new Date();
        const patientsAwaitingInsertion = allPatientData.filter(p => p.currentStatus === 'Awaiting Catheter');
        const patientsInTraining = allPatientData
            .filter(p => p.pdStartDate && differenceInDays(now, parseISO(p.pdStartDate)) <= 90 && p.currentStatus === 'Active PD')
            .map(p => ({
                ...p,
                trainingDay: differenceInDays(now, parseISO(p.pdStartDate!)) + 1
            }));
        const patientsOnPeritonitisTx = allPatientData.map(p => {
            const activeEpisode = p.peritonitisEpisodes.find(ep => ep.outcome === 'In Treatment');
            if (activeEpisode) {
                return {
                    ...p,
                    activeEpisode: {
                        ...activeEpisode,
                        treatmentDay: differenceInDays(now, parseISO(activeEpisode.diagnosisDate)) + 1
                    }
                };
            }
            return null;
        }).filter((p): p is PatientData & { activeEpisode: any } => p !== null);

        const todaysAppointmentsList = allPatientData.filter(p => 
            p.clinicVisits?.nextAppointment && isToday(parseISO(p.clinicVisits.nextAppointment))
        );

        const upcomingHomeVisits = allPatientData
            .filter(p => p.lastHomeVisitDate)
            .map(p => ({
                ...p,
                nextVisitDue: addDays(parseISO(p.lastHomeVisitDate!), 90) // Assuming a 90-day cycle
            }))
            .filter(p => p.nextVisitDue > now && p.nextVisitDue < addDays(now, 30))
            .sort((a, b) => a.nextVisitDue.getTime() - b.nextVisitDue.getTime());

        const upcomingPetTests = allPatientData
            .filter(p => p.pdStartDate && p.pdAdequacy.length === 0)
            .map(p => ({
                ...p,
                petTestDueDate: addWeeks(parseISO(p.pdStartDate), 8)
            }))
            .filter(p => isAfter(p.petTestDueDate, now) && p.petTestDueDate < addDays(now, 60))
            .sort((a, b) => a.petTestDueDate.getTime() - b.petTestDueDate.getTime());

        return { patientsAwaitingInsertion, patientsInTraining, patientsOnPeritonitisTx, todaysAppointmentsList, upcomingHomeVisits, upcomingPetTests };

    }, [allPatientData, isLoading]);

    const filteredPatients = useMemo(() => {
        switch (activeFilter) {
            case 'awaiting_insertion': return patientsAwaitingInsertion;
            case 'in_training': return patientsInTraining;
            case 'peritonitis_tx': return patientsOnPeritonitisTx;
            case 'todays_appointments': return todaysAppointmentsList;
            default: return [];
        }
    }, [activeFilter, patientsAwaitingInsertion, patientsInTraining, patientsOnPeritonitisTx, todaysAppointmentsList]);

    const filterTitles: Record<FilterType, string> = {
        all: 'Patient List',
        awaiting_insertion: 'Patients Awaiting Catheter Insertion',
        in_training: 'Patients in Training (First 90 Days)',
        peritonitis_tx: 'Patients on Active Peritonitis Treatment',
        todays_appointments: "Today's Scheduled Appointments"
    };

    if (isLoading) {
        return (
             <div className="space-y-6">
                 <Skeleton className="h-12 w-1/3" />
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                     {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 w-full lg:col-span-1" />
                    <Skeleton className="h-64 w-full lg:col-span-2" />
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
                <MetricCard title="Patients in Training (90d)" value={patientsInTraining.length} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} onClick={() => setActiveFilter('in_training')} isActive={activeFilter === 'in_training'} />
                <MetricCard title="Active Peritonitis Tx" value={patientsOnPeritonitisTx.length} icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />} onClick={() => setActiveFilter('peritonitis_tx')} isActive={activeFilter === 'peritonitis_tx'} />
                <MetricCard title="Today's Appointments" value={todaysAppointmentsList.length} icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />} onClick={() => setActiveFilter('todays_appointments')} isActive={activeFilter === 'todays_appointments'} />
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
                                    {activeFilter === 'peritonitis_tx' ? (
                                        <>
                                            <TableHead>Organism/Culture</TableHead>
                                            <TableHead>Treatment/Day</TableHead>
                                            <TableHead>Latest Cell Count</TableHead>
                                        </>
                                    ) : activeFilter === 'todays_appointments' ? (
                                        <>
                                            <TableHead>Appointment Time</TableHead>
                                            <TableHead>Nephrologist</TableHead>
                                            <TableHead>Visit Reason</TableHead>
                                        </>
                                    ) : (
                                        <>
                                            <TableHead>Status</TableHead>
                                            {activeFilter === 'in_training' && <TableHead>Training Progress</TableHead>}
                                            <TableHead>Nephrologist</TableHead>
                                        </>
                                    )}
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPatients.length > 0 ? filteredPatients.map(p => (
                                    <TableRow key={p.patientId}>
                                        <TableCell>
                                            <Link href={`/dashboard/patients/${p.patientId}`} className="font-medium hover:underline">
                                                {p.firstName} {p.lastName}
                                            </Link>
                                            <p className="text-sm text-muted-foreground">{p.nephroId}</p>
                                        </TableCell>
                                        {activeFilter === 'peritonitis_tx' ? (
                                            <>
                                                <TableCell>
                                                    <p className="font-medium">{p.activeEpisode.organismIsolated}</p>
                                                    <p className="text-sm text-muted-foreground">Culture Pending</p>
                                                </TableCell>
                                                <TableCell>
                                                    <p>{p.activeEpisode.treatmentRegimen}</p>
                                                    <Badge variant="destructive">Day {p.activeEpisode.treatmentDay}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <p>1200 cells/mm³</p>
                                                    <p className="text-xs text-muted-foreground">95% Neutrophils</p>
                                                </TableCell>
                                            </>
                                        ) : activeFilter === 'todays_appointments' ? (
                                             <>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        {p.clinicVisits?.nextAppointment ? format(parseISO(p.clinicVisits.nextAppointment), 'p') : 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{p.physician}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">Routine Follow-up</TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell>
                                                    <Badge variant={p.currentStatus === 'Active PD' ? 'secondary' : 'outline'}>{p.currentStatus}</Badge>
                                                </TableCell>
                                                {activeFilter === 'in_training' && (
                                                    <TableCell>
                                                        {p.trainingDay ? `Day ${p.trainingDay} of 90` : 'N/A'}
                                                    </TableCell>
                                                )}
                                                <TableCell>{p.physician}</TableCell>
                                            </>
                                        )}
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/dashboard/nurse-checklist?patientId=${p.patientId}`}>
                                                    {activeFilter === 'peritonitis_tx' ? "Manage" : "View Checklist"} <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No patients match this filter.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-red-500" />
                            Notifications & Alerts
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
                                        <TableCell>{p.nextVisitDue ? format(p.nextVisitDue, 'PPP') : 'N/A'}</TableCell>
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
                            <FlaskConical className="h-5 w-5 text-purple-600" />
                            Upcoming PET Tests (Due within 60 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {upcomingPetTests.length > 0 ? upcomingPetTests.map(p => (
                                    <TableRow key={p.patientId}>
                                        <TableCell>
                                            <Link href={`/dashboard/patients/${p.patientId}`} className="font-medium hover:underline">
                                                {p.firstName} {p.lastName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{p.petTestDueDate ? format(p.petTestDueDate, 'PPP') : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/dashboard/pet-test?patientId=${p.patientId}`}>
                                                    Enter Data
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">No PET tests due soon.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
