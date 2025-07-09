
'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  Search,
  Users,
  Camera,
  ClipboardX,
  PlusCircle,
} from 'lucide-react';
import { allPatientData } from '@/data/mock-data';
import type { PatientData } from '@/lib/types';
import { generatePatientAlerts } from '@/lib/alerts';
import type { Alert } from '@/lib/alerts';
import { differenceInDays } from 'date-fns';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const totalPatients = allPatientData.length;

  const patientsWithCriticalAlerts = allPatientData.filter(patient => {
    const alerts = generatePatientAlerts(patient);
    return alerts.some(alert => alert.severity === 'critical');
  }).length;

  const imagesForReview = allPatientData.reduce((count, patient) => {
    return count + (patient.uploadedImages?.filter(img => img.requiresReview).length || 0);
  }, 0);
  
  const nonCompliantToday = allPatientData.filter(patient => {
     if (patient.pdEvents.length === 0) return true;
     // Sort to find the most recent event
     const latestEvent = patient.pdEvents.sort((a,b) => new Date(b.exchangeDateTime).getTime() - new Date(a.exchangeDateTime).getTime())[0];
     const latestEventDate = new Date(latestEvent.exchangeDateTime);
     const today = new Date();
     return differenceInDays(today, latestEventDate) >= 1;
  }).length;

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
            <Tabs defaultValue="clinical">
              <TabsList>
                <TabsTrigger value="clinical">Clinical</TabsTrigger>
                <TabsTrigger value="adequacy">Adequacy</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="clinic_settings">Clinic Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="clinical">
                <Card>
                  <CardHeader>
                      <div className="flex items-center justify-between">
                          <div>
                              <CardTitle>Patients</CardTitle>
                              <CardDescription>
                                  A list of patients under your care. Total: {allPatientData.length}
                              </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                              <div className="relative">
                                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input type="search" placeholder="Patient Search..." className="pl-8" />
                              </div>
                              <Select>
                                  <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Attending Physician" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="all">All</SelectItem>
                                      <SelectItem value="atul">Dr. Atul</SelectItem>
                                      <SelectItem value="parikshit">Dr. Parikshit</SelectItem>
                                      <SelectItem value="sachin">Dr. Sachin</SelectItem>
                                  </SelectContent>
                              </Select>
                               <Button asChild>
                                <Link href="/registration">
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add Patient
                                </Link>
                              </Button>
                          </div>
                      </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg">
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
                          {allPatientData.map(patient => {
                            const alerts = generatePatientAlerts(patient);
                            return (
                            <TableRow key={patient.patientId} className={alerts.filter(a => a.severity === 'critical').length > 0 ? 'bg-red-50/50' : (alerts.length > 0 ? 'bg-yellow-50/50' : '')}>
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
               <TabsContent value="adequacy">
                    <Card>
                        <CardHeader>
                            <CardTitle>Adequacy</CardTitle>
                            <CardDescription>
                            Review patient dialysis adequacy metrics.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Adequacy data and visualizations will be displayed here.</p>
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
                        <CardContent>
                            <p className="text-muted-foreground">Report generation options will be available here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="clinic_settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Clinic Settings</CardTitle>
                            <CardDescription>
                            Manage clinic-wide settings and configurations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Settings for the clinic will be managed from this section.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <CalendarCard />
            <NotificationsCard />
          </div>
        </div>
    </div>
  );
}
