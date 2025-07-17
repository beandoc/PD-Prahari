
'use client';

import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { allPatientData } from '@/data/mock-data';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CalendarCard from '@/components/dashboard/calendar-card';
import NotificationsCard from '@/components/dashboard/notifications-card';
import InfectionHotspotCard from '@/components/dashboard/InfectionHotspotCard';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

export default function DoctorDashboard() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'review' | 'notLogged'>('all');
  const [date, setDate] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const totalPatients = allPatientData.length;

  const patientsWithCriticalAlerts = useMemo(() => {
    return allPatientData.filter(patient => {
      const alerts = generatePatientAlerts(patient);
      return alerts.some(alert => alert.severity === 'critical');
    }).length;
  }, []);

  const imagesForReview = useMemo(() => {
    return allPatientData.reduce((count, patient) => {
      return count + (patient.uploadedImages?.filter(img => img.requiresReview).length || 0);
    }, 0);
  }, []);
  
  const nonCompliantToday = useMemo(() => {
    return allPatientData.filter(patient => {
       if (patient.currentStatus !== 'Active PD') return false;
       if (patient.pdEvents.length === 0) return true;
       const latestEvent = [...patient.pdEvents].sort((a,b) => new Date(b.exchangeDateTime).getTime() - new Date(a.exchangeDateTime).getTime())[0];
       const latestEventDate = new Date(latestEvent.exchangeDateTime);
       return differenceInDays(startOfToday(), latestEventDate) >= 1;
    }).length;
  }, []);

   const todaysAppointments = useMemo(() => {
    return allPatientData.filter(p => 
      p.clinicVisits?.nextAppointment && isToday(new Date(p.clinicVisits.nextAppointment))
    );
  }, []);

  const allPatientsSorted = useMemo(() => {
    return [...allPatientData].sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, []);

  const filteredAllPatients = useMemo(() => {
    if (!searchTerm) {
        return allPatientsSorted;
    }
    return allPatientsSorted.filter(p => 
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nephroId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allPatientsSorted]);


  return (
    <div className="space-y-6">
       <header>
            <h1 className="text-3xl font-bold">Hello Dr. Sachin</h1>
            <p className="text-muted-foreground">Here is a summary of your clinic's activity today.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPatients}</div>
                        <p className="text-xs text-muted-foreground">managed in this clinic</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{patientsWithCriticalAlerts}</div>
                        <p className="text-xs text-muted-foreground">require immediate attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Images for Review</CardTitle>
                        <Camera className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{imagesForReview}</div>
                        <p className="text-xs text-muted-foreground">newly uploaded photos</p>
                    </CardContent>
                </Card>
                <Card>
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
            <Tabs defaultValue="appointments">
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
                                    <TableHead>Status</TableHead>
                                    <TableHead>Alerts</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {todaysAppointments.map(patient => {
                                    const alerts = generatePatientAlerts(patient);
                                    return (
                                    <TableRow key={patient.patientId} className={alerts.some(a => a.severity === 'critical') ? 'bg-red-50/50' : ''}>
                                    <TableCell>
                                        <Link href={`/dashboard/patients/${patient.patientId}`} className="font-medium hover:underline">
                                            {patient.lastName}, {patient.firstName}
                                        </Link>
                                        <div className="text-sm text-muted-foreground">{patient.nephroId}</div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(patient.clinicVisits.nextAppointment), 'p')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={patient.currentStatus === 'Active PD' ? 'secondary' : 'outline'}>{patient.currentStatus}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <AlertsCell alerts={alerts} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/dashboard/patients/${patient.patientId}`}>Start Consultation</Link>
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
                                    Showing {filteredAllPatients.length} of {allPatientData.length} patients.
                                </CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
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
                                <TableHead>Physician</TableHead>
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
                                Send a broadcast message to PD Nurses or Patients.
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
                                        <SelectItem value="nurses">All PD Nurses</SelectItem>
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
