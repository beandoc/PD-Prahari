
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
} from 'lucide-react';
import { addDays, format, startOfWeek, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { allPatientData } from '@/data/mock-data';
import type { PatientData, PDEvent } from '@/lib/types';

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

const getDailyStatus = (patient: PatientData, day: Date): React.ReactNode => {
  const eventsToday = patient.pdEvents.filter(event => isSameDay(new Date(event.exchangeDateTime), day));
  if (eventsToday.length === 0) {
    return <span className="text-muted-foreground">--</span>;
  }

  const hasComplication = eventsToday.some(e => e.complications);
  if (hasComplication) {
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  }

  const isUFNegative = eventsToday.some(e => e.ultrafiltrationML < 0);
   if (isUFNegative) {
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  }

  return <div className="text-green-600 font-bold text-xs">{eventsToday.length}</div>;
};

export default function DoctorDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const weekStartsOn = 1; // Monday
  const start = startOfWeek(currentDate, { weekStartsOn });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

  return (
    <div className="p-4 md:p-8">
      <Tabs defaultValue="clinical">
        <TabsList className="mb-4">
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
                                <SelectItem value="garcia">Dr. Garcia, Chris</SelectItem>
                                <SelectItem value="pong">Dr. Pong, Jay</SelectItem>
                                <SelectItem value="abdullah">Dr. Abdullah, Majed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="sm">All Patients</Button>
                         <Button variant="ghost" size="sm">My Patients List</Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-sm">
                            {format(weekDays[0], 'dd LLL yyyy')} - {format(weekDays[6], 'dd LLL yyyy')}
                        </span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Patient</TableHead>
                      {weekDays.map(day => (
                        <TableHead key={day.toISOString()} className="text-center">
                          {format(day, 'eeee')}
                          <br />
                          <span className="text-xs font-normal text-muted-foreground">{format(day, 'd')}</span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPatientData.map(patient => (
                      <TableRow key={patient.patientId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                             <Link href={`/dashboard/patients/${patient.patientId}`}>
                                <PlusCircle className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                            </Link>
                            <div>
                                <Link href={`/dashboard/patients/${patient.patientId}`} className="font-medium hover:underline">
                                    {patient.lastName}, {patient.firstName}
                                </Link>
                                <div className="text-sm text-muted-foreground">{format(new Date(patient.dateOfBirth), 'dd LLLL yyyy')}</div>
                                <div className="text-sm text-muted-foreground">Physician: {patient.physician}</div>
                            </div>
                          </div>
                        </TableCell>
                        {weekDays.map(day => (
                          <TableCell key={day.toISOString()} className="text-center">
                            <div className="flex justify-center">
                                {getDailyStatus(patient, day)}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
