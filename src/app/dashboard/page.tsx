
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Search,
  Users,
  Camera,
  ClipboardX,
  PlusCircle,
  FilterX,
  Download,
  Calendar as CalendarIcon,
  MessageCircle,
  Send,
  CheckCircle,
} from 'lucide-react';
import { getLiveAllPatientData } from '@/app/actions';
import type { PatientData } from '@/lib/types';
import { generatePatientAlerts } from '@/lib/alerts';
import type { Alert } from '@/lib/alerts';
import { differenceInDays, startOfToday, format, isToday } from 'date-fns';
import type { DateRange } from "react-day-picker";


import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import CalendarCard from '@/components/dashboard/calendar-card';
import NotificationsCard from '@/components/dashboard/notifications-card';
import InfectionHotspotCard from '@/components/dashboard/InfectionHotspotCard';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';


const AlertsCell = ({ alerts }: { alerts: Alert[] }) => {
  if (alerts.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            <AlertTriangle className={`h-5 w-5 ${criticalAlerts > 0 ? 'text-red-500' : 'text-yellow-500'}`} />
            <span className="font-bold">{alerts.length}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs z-50" side="top">
          <div className="p-2 space-y-2">
            <h4 className="font-semibold">Active Alerts</h4>
            <ul className="space-y-2">
              {alerts.map(alert => (
                <li key={alert.id} className="flex items-start gap-2 text-xs">
                  <div className="mt-0.5">{alert.icon}</div>
                  <p>{alert.message}</p>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const getPatientsNotLoggedToday = (patients: PatientData[]) => {
    return patients.filter(patient => {
       if (patient.currentStatus !== 'Active PD') return false;
       if (patient.pdEvents.length === 0) return true;
       const latestEvent = [...patient.pdEvents].sort((a,b) => new Date(b.exchangeDateTime).getTime() - new Date(a.exchangeDateTime).getTime())[0];
       const latestEventDate = new Date(latestEvent.exchangeDateTime);
       return differenceInDays(startOfToday(), latestEventDate) >= 1;
    });
}


export default function DoctorDashboard() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'review' | 'notLogged'>('all');
  const [date, setDate] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [allPatientData, setAllPatientData] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [completedConsultations, setCompletedConsultations] = useState<Set<string>>(new Set());

  useEffect(() => {
    getLiveAllPatientData().then(data => {
        setAllPatientData(data);
        
        // Check for a recently completed patient from session storage
        const completedId = sessionStorage.getItem('justCompletedPatient');
        if (completedId) {
            setCompletedConsultations(prev => {
                const newSet = new Set(prev);
                newSet.add(completedId);
                sessionStorage.setItem('completedConsultations', JSON.stringify(Array.from(newSet)));
                return newSet;
            });
            sessionStorage.removeItem('justCompletedPatient');
        } else {
             const storedCompleted = sessionStorage.getItem('completedConsultations');
            if (storedCompleted) {
                setCompletedConsultations(new Set(JSON.parse(storedCompleted)));
            }
        }
        
        setIsLoading(false);
    });
  }, []);

  const {
      totalPatients,
      patientsWithCriticalAlerts,
      imagesForReview,
      nonCompliantToday
  } = useMemo(() => {
    if (isLoading) return { totalPatients: 0, patientsWithCriticalAlerts: 0, imagesForReview: 0, nonCompliantToday: 0 };
    return {
      totalPatients: allPatientData.length,
      patientsWithCriticalAlerts: allPatientData.filter(p => generatePatientAlerts(p).some(a => a.severity === 'critical')).length,
      imagesForReview: allPatientData.reduce((count, p) => count + (p.uploadedImages?.filter(img => img.requiresReview).length || 0), 0),
      nonCompliantToday: getPatientsNotLoggedToday(allPatientData).length
    };
  }, [allPatientData, isLoading]);
  
  const todaysAppointments = useMemo(() => {
    if (isLoading) return [];
    return allPatientData.filter(p => 
      p.clinicVisits?.nextAppointment && isToday(new Date(p.clinicVisits.nextAppointment))
    );
  }, [allPatientData, isLoading]);


  const filteredAllPatients = useMemo(() => {
    let patients = [...allPatientData].sort((a, b) => a.lastName.localeCompare(b.lastName));

    if (activeFilter === 'critical') {
        patients = patients.filter(p => generatePatientAlerts(p).some(a => a.severity === 'critical'));
    } else if (activeFilter === 'review') {
        patients = patients.filter(p => p.uploadedImages?.some(img => img.requiresReview));
    } else if (activeFilter === 'notLogged') {
        patients = getPatientsNotLoggedToday(patients);
    }
    
    if (searchTerm) {
        return patients.filter(p => 
            p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.nephroId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return patients;
  }, [searchTerm, allPatientData, activeFilter]);

  const handleFilterClick = (filter: 'all' | 'critical' | 'review' | 'notLogged') => {
    setActiveFilter(filter);
    setActiveTab('all_patients');
  }

  const filterDescriptions = {
      all: `Showing ${filteredAllPatients.length} of ${allPatientData.length} patients.`,
      critical: `Showing ${filteredAllPatients.length} patient(s) with critical alerts.`,
      review: `Showing ${filteredAllPatients.length} patient(s) with images for review.`,
      notLogged: `Showing ${filteredAllPatients.length} patient(s) who haven't logged today.`
  };
  
  if (isLoading) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-10 w-1/3" />
              <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6">
                      <Skeleton className="h-28 w-full" />
                      <Skeleton className="h-96 w-full" />
                  </div>
                  <div className="lg:col-span-1 space-y-6">
                      <Skeleton className="h-64 w-full" />
                  </div>
              </div>
          </div>
      )
  }


  return (
    <div className="space-y-6">
       <header>
            <h1 className="text-3xl font-bold">Hello Dr. Sachin</h1>
            <p className="text-muted-foreground">Here is a summary of your clinic's activity today.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card as="button" onClick={() => handleFilterClick('all')} className="text-left hover:bg-muted/50 transition-colors w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPatients}</div>
                        <p className="text-xs text-muted-foreground">managed in this clinic</p>
                    </CardContent>
                </Card>
                <Card as="button" onClick={() => handleFilterClick('critical')} className="text-left hover:bg-muted/50 transition-colors w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{patientsWithCriticalAlerts}</div>
                        <p className="text-xs text-muted-foreground">require immediate attention</p>
                    </CardContent>
                </Card>
                <Card as="button" onClick={() => handleFilterClick('review')} className="text-left hover:bg-muted/50 transition-colors w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Images for Review</CardTitle>
                        <Camera className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{imagesForReview}</div>
                        <p className="text-xs text-muted-foreground">newly uploaded photos</p>
                    </CardContent>
                </Card>
                <Card as="button" onClick={() => handleFilterClick('notLogged')} className="text-left hover:bg-muted/50 transition-colors w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Not Logged Today</CardTitle>
                        <ClipboardX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{nonCompliantToday}</div>
                        <p className="text-xs text-muted-foreground">patients missed today's log</p>
                    </CardContent>
                </Card>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="appointments">Today's Appointments</TabsTrigger>
                <TabsTrigger value="all_patients">All Patients</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="notifications">Push Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                      <CardTitle>Today's Appointments ({todaysAppointments.length})</CardTitle>
                      <CardDescription>Patients scheduled for CAPD OPD consultation today.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {todaysAppointments.length > 0 ? (
                        <div className="border rounded-lg overflow-x-auto">
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Patient</TableHead>
                                    <TableHead>Appointment Time</TableHead>
                                    <TableHead>Consultation Status</TableHead>
                                    <TableHead>Alerts</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {todaysAppointments.map(patient => {
                                    const alerts = generatePatientAlerts(patient);
                                    const isCompleted = completedConsultations.has(patient.patientId);
                                    return (
                                    <TableRow key={patient.patientId} className={isCompleted ? 'bg-green-50/50' : (alerts.some(a => a.severity === 'critical') ? 'bg-red-50/50' : '')}>
                                    <TableCell>
                                        <Link href={`/dashboard/patients/${patient.patientId}`} className="font-medium hover:underline">
                                            {patient.lastName}, {patient.firstName}
                                        </Link>
                                        <div className="text-sm text-muted-foreground">{patient.nephroId}</div>
                                    </TableCell>
                                    <TableCell>
                                        {patient.clinicVisits?.nextAppointment ? format(new Date(patient.clinicVisits.nextAppointment), 'p') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {isCompleted ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Completed
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">Pending</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <AlertsCell alerts={alerts} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild disabled={isCompleted}>
                                            <Link href={`/dashboard/patients/${patient.patientId}`}>
                                                {isCompleted ? 'Viewed' : 'Start Consultation'}
                                            </Link>
                                        </Button>
                                    </TableCell>
                                    </TableRow>
                                )})}
                                </TableBody>
                            </Table>
                        </div>
                     ) : (
                        <div className="text-center text-muted-foreground p-8 border rounded-lg border-dashed">
                            No appointments scheduled for today.
                        </div>
                     )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="all_patients">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>All Patients</CardTitle>
                                <CardDescription>
                                   {filterDescriptions[activeFilter]}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                                {activeFilter !== 'all' && (
                                    <Button variant="outline" onClick={() => setActiveFilter('all')}>
                                        <FilterX className="mr-2 h-4 w-4" />
                                        Clear Filter
                                    </Button>
                                )}
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        type="search" 
                                        placeholder="Search by name or ID..." 
                                        className="pl-8 w-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button asChild className="w-full sm:w-auto">
                                <Link href="/registration">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Patient
                                </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px]">Patient</TableHead>
                                <TableHead>Nephrologist</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Alerts</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {filteredAllPatients.map(patient => {
                                const alerts = generatePatientAlerts(patient);
                                return (
                                <TableRow key={patient.patientId} className={alerts.some(a => a.severity === 'critical') ? 'bg-red-50/50' : (alerts.length > 0 ? 'bg-yellow-50/50' : '')}>
                                <TableCell>
                                    <Link href={`/dashboard/patients/${patient.patientId}`} className="font-medium hover:underline">
                                        {patient.lastName}, {patient.firstName}
                                    </Link>
                                    <div className="text-sm text-muted-foreground">{patient.nephroId}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-muted-foreground">{patient.physician}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={patient.currentStatus === 'Active PD' ? 'secondary' : 'outline'}>{patient.currentStatus}</Badge>
                                </TableCell>
                                <TableCell>
                                    <AlertsCell alerts={alerts} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/dashboard/patients/${patient.patientId}`}>View</Link>
                                    </Button>
                                </TableCell>
                                </TableRow>
                            )})}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>

               <TabsContent value="reports">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reports</CardTitle>
                            <CardDescription>
                            Generate and view clinical reports.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 border rounded-lg space-y-4">
                                <h4 className="font-semibold">PET Report</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div className="space-y-1"><Label>Patient</Label><Select><SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger><SelectContent>{allPatientData.map(p => <SelectItem key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName}</SelectItem>)}</SelectContent></Select></div>
                                     <div className="space-y-1"><Label>Test Date</Label><Select><SelectTrigger><SelectValue placeholder="Select Date" /></SelectTrigger><SelectContent><SelectItem value="2025-06-01">June 1, 2025</SelectItem></SelectContent></Select></div>
                                     <Button className="self-end"><Download className="mr-2 h-4 w-4" />Download</Button>
                                </div>
                            </div>
                             <div className="p-4 border rounded-lg space-y-4">
                                <h4 className="font-semibold">Discharge Report</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div className="space-y-1"><Label>Patient</Label><Select><SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger><SelectContent>{allPatientData.map(p => <SelectItem key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName}</SelectItem>)}</SelectContent></Select></div>
                                      <div className="space-y-1"><Label>Date Range</Label><Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                              "w-full justify-start text-left font-normal",
                                              !date && "text-muted-foreground"
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? (
                                              date.to ? (
                                                <>
                                                  {format(date.from, "LLL dd, y")} -{" "}
                                                  {format(date.to, "LLL dd, y")}
                                                </>
                                              ) : (
                                                format(date.from, "LLL dd, y")
                                              )
                                            ) : (
                                              <span>Pick a date range</span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={date?.from}
                                            selected={date}
                                            onSelect={setDate}
                                            numberOfMonths={2}
                                          />
                                        </PopoverContent>
                                      </Popover>
                                      </div>
                                     <Button className="self-end"><Download className="mr-2 h-4 w-4" />Download</Button>
                                </div>
                            </div>
                             <div className="p-4 border rounded-lg space-y-4">
                                <h4 className="font-semibold">CAPD Procedure Notes</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div className="space-y-1"><Label>Patient</Label><Select><SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger><SelectContent>{allPatientData.map(p => <SelectItem key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName}</SelectItem>)}</SelectContent></Select></div>
                                     <div className="md:col-span-2"><Button className="w-full self-end mt-5"><Download className="mr-2 h-4 w-4" />Download</Button></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Push Notifications</CardTitle>
                            <CardDescription>
                                Send a broadcast message to the PD Coordinator or Patients.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <div className="space-y-2">
                                <Label>Select Recipient Group</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a group..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nurses">PD Coordinator</SelectItem>
                                        <SelectItem value="patients">All Patients</SelectItem>
                                        <SelectItem value="specific_patient">A Specific Patient</SelectItem>
                                    </SelectContent>
                                </Select>
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="notification-message">Message</Label>
                                <Textarea id="notification-message" placeholder="Type your notification here. It will be sent to the selected group." rows={5} />
                           </div>
                           <Button className="w-full">
                                <Send className="mr-2 h-4 w-4" />
                                Send Notification
                           </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <InfectionHotspotCard patients={allPatientData} />
            <CalendarCard />
            <NotificationsCard />
          </div>
        </div>
    </div>
  );
}
