
'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  Search,
} from 'lucide-react';
import { allPatientData } from '@/data/mock-data';
import type { PatientData } from '@/lib/types';
import { generatePatientAlerts } from '@/lib/alerts';
import type { Alert } from '@/lib/alerts';

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

  return (
    <>
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
                      <TableRow key={patient.patientId} className={alerts.length > 0 ? 'bg-yellow-50/50' : ''}>
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
      </Tabs>
    </>
  );
}
