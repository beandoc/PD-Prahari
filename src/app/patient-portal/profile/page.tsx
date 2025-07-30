
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, Pill, Inbox, Video, ShieldAlert, SlidersHorizontal, Activity, CalendarClock, Heart, Droplet, Users2 } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, addMonths, differenceInMonths, differenceInYears } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { PatientData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { db, onSnapshot } from '@/lib/firebase';

const getPDVintage = (startDate: string) => {
    if (!startDate) return 'N/A';
    const start = parseISO(startDate);
    const now = new Date();
    const years = differenceInYears(now, start);
    const months = differenceInMonths(now, start) % 12;
    let vintage = '';
    if (years > 0) {
        vintage += `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
        if (vintage) vintage += ', ';
        vintage += `${months} month${months > 1 ? 's' : ''}`;
    }
    return vintage || 'Just started';
};


export default function PatientProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const patientId = sessionStorage.getItem('loggedInPatientId');
      if (!patientId) {
          toast({ title: "Not logged in", description: "Redirecting to login.", variant: "destructive" });
          router.push('/patient-login');
          return;
      }
      
      const patientDocRef = doc(db, 'patients', patientId);
      const unsubscribe = onSnapshot(patientDocRef, (docSnap) => {
          if (docSnap.exists()) {
              setPatient(docSnap.data() as PatientData);
          } else {
             toast({ title: "Error", description: "Could not load patient data.", variant: "destructive" });
             router.push('/patient-login');
          }
          setIsLoading(false);
      }, (error) => {
          console.error("Error fetching real-time patient data:", error);
          toast({ title: "Error", description: "Could not load real-time data.", variant: "destructive" });
          setIsLoading(false);
      });
      
      return () => unsubscribe();
  }, [router, toast]);

  if (isLoading || !patient) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-10 w-1/3" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                      <Skeleton className="h-64 w-full" />
                      <Skeleton className="h-48 w-full" />
                  </div>
                  <div className="lg:col-span-1 space-y-6">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-48 w-full" />
                  </div>
              </div>
          </div>
      );
  }

  const latestAdequacy = patient.pdAdequacy.length > 0 ? patient.pdAdequacy.sort((a,b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())[0] : null;
  const lastTransferSetChangeDate = patient.pdStartDate ? new Date(patient.pdStartDate) : new Date();
  const nextTransferSetChangeDueDate = addMonths(lastTransferSetChangeDate, 6);


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-muted-foreground mt-1">Your personal health summary and quick actions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="text-primary" /> Personal &amp; Clinical Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1"><p className="font-medium">Name</p><p className="text-muted-foreground">{patient.firstName} {patient.lastName}</p></div>
                <div className="space-y-1"><p className="font-medium">Nephro ID</p><p className="text-muted-foreground">{patient.nephroId}</p></div>
                <div className="space-y-1"><p className="font-medium">Age</p><p className="text-muted-foreground">{patient.age} years</p></div>
                <div className="space-y-1"><p className="font-medium">Gender</p><p className="text-muted-foreground">{patient.gender}</p></div>
                <div className="space-y-1"><p className="font-medium">Primary Nephrologist</p><p className="text-muted-foreground">{patient.physician}</p></div>
                <div className="space-y-1 md:col-span-3"><p className="font-medium">Native Kidney Disease</p><p className="text-muted-foreground">{patient.underlyingKidneyDisease}</p></div>
                 <div className="flex items-center gap-2 text-muted-foreground"><Users2 className="h-4 w-4" /><span>{patient.pdExchangeType}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><CalendarClock className="h-4 w-4" /><span>PD Vintage: {getPDVintage(patient.pdStartDate || '')}</span></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="text-indigo-500" /> Key Health Metrics</CardTitle>
                <CardDescription>An overview of your recent vitals and lab results.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-3 bg-slate-50 border rounded-lg text-center">
                  <p className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-1"><Heart className="h-3 w-3" /> Last BP</p>
                  <p className="text-lg font-bold">{patient.vitals[0]?.systolicBP || 'N/A'}/{patient.vitals[0]?.diastolicBP || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg text-center">
                  <p className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-1"><Droplet className="h-3 w-3" /> Last UF</p>
                  <p className="text-lg font-bold">{patient.pdEvents[0]?.ultrafiltrationML || 'N/A'} <span className="text-sm font-normal">mL</span></p>
              </div>
               <div className="p-3 bg-slate-50 border rounded-lg text-center">
                  <p className="text-xs font-medium text-muted-foreground">Kt/V</p>
                  <p className="text-lg font-bold">{latestAdequacy?.totalKtV?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg text-center">
                  <p className="text-xs font-medium text-muted-foreground">Hemoglobin</p>
                  <p className="text-lg font-bold">{patient.labResults.find(lr => lr.testName === 'Hemoglobin')?.resultValue || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Pill className="text-red-500" /> Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Medication</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Frequency</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patient.medications.map((med) => (
                        <TableRow key={med.medicationId}>
                            <TableCell className="font-medium">{med.medicationName}</TableCell>
                            <TableCell>{med.dosage}</TableCell>
                            <TableCell>{med.frequency}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-yellow-600" /> Peritonitis History</CardTitle>
              <CardDescription>A summary of past PD-related infections.</CardDescription>
            </CardHeader>
            <CardContent>
                {patient.peritonitisEpisodes && patient.peritonitisEpisodes.length > 0 ? (
                     <div className="space-y-4">
                        {patient.peritonitisEpisodes.map((episode) => (
                            <div key={episode.episodeId} className="border p-4 rounded-lg bg-slate-50">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold">Diagnosis Date: {format(parseISO(episode.diagnosisDate), 'PPP')}</p>
                                    <Badge variant={episode.outcome === 'Resolved' ? 'secondary' : 'destructive'} className={episode.outcome === 'Resolved' ? 'bg-green-100 text-green-800' : ''}>
                                        {episode.outcome}
                                    </Badge>
                                </div>
                                <p className="text-sm"><span className="font-medium">Organism:</span> {episode.organismIsolated}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No history of peritonitis found.</p>
                )}
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
          {patient.contactInfo && (
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-blue-800"><Phone /> Clinic Contacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div>
                        <p className="font-semibold text-blue-700">{patient.contactInfo.clinicName}</p>
                        <p className="text-blue-600">{patient.contactInfo.clinicPhone}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-blue-700">PD Coordinator: {patient.contactInfo.coordinatorName}</p>
                        <p className="text-blue-600">{patient.contactInfo.coordinatorPhone}</p>
                    </div>
                </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/patient-portal/daily-log">
                        <Inbox className="mr-2 h-4 w-4" /> Go to Daily Log
                    </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/dashboard/telehealth">
                        <Video className="mr-2 h-4 w-4" /> Start Video Call
                    </Link>
                </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><SlidersHorizontal className="text-teal-600" /> PD Parameters</CardTitle>
                 <CardDescription>Key details about your peritoneal dialysis setup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="p-3 bg-slate-50 border rounded-lg text-sm"><p className="font-medium">Transporter Status</p><p className="text-muted-foreground">{patient.membraneTransportType || 'N/A'}</p></div>
                <div className="p-3 bg-slate-50 border rounded-lg text-sm"><p className="font-medium">Last Transfer Set Change</p><p className="text-muted-foreground">{patient.pdStartDate ? format(lastTransferSetChangeDate, 'PPP') : 'N/A'}</p></div>
                <div className="p-3 bg-slate-50 border rounded-lg text-sm"><p className="font-medium">Next Change Due</p><p className="text-muted-foreground">{patient.pdStartDate ? format(nextTransferSetChangeDueDate, 'PPP') : 'N/A'}</p></div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
