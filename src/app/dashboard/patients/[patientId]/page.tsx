
'use client';

import type { PatientData } from '@/lib/types';
import { updatePatientData } from '@/app/actions';
import PatientHeader from '@/components/dashboard/patient-header';
import InfectionHistoryCard from '@/components/dashboard/PeritonitisTrackingCard';
import MedicationsCard from '@/components/dashboard/medications-card';
import NutritionLifestyleCard from '@/components/dashboard/NutritionLifestyleCard';
import ClinicVisitsCard from '@/components/dashboard/ClinicVisitsCard';
import PatientEducationCard from '@/components/dashboard/PatientEducationCard';
import VitalsCard from '@/components/dashboard/vitals-card';
import LabResultsCard from '@/components/dashboard/lab-results-card';
import PDExchangeCard from '@/components/dashboard/pd-exchange-card';
import PDParametersCard from '@/components/dashboard/pd-parameters-card';
import CareTeamNotesCard from '@/components/dashboard/CareTeamNotesCard';
import ConsultationActionsCard from '@/components/dashboard/ConsultationActionsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { db, onSnapshot } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Edit } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function PatientDetailView({ patientId }: { patientId: string }) {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const patientDocRef = doc(db, 'patients', patientId);

    const unsubscribe = onSnapshot(patientDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PatientData;
        setPatientData(data);
      } else {
        console.error("No such patient!");
        setPatientData(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch patient data in real-time:", error);
      setPatientData(null);
      setLoading(false);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [patientId]);
  
  if (loading || !patientData) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-16 w-full md:w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                 <Skeleton className="h-96 w-full" />
                 <Skeleton className="h-64 w-full" />
            </div>
             <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <PatientHeader patient={patientData} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <VitalsCard vitals={patientData.vitals} pdEvents={patientData.pdEvents} patient={patientData} />
            <PDParametersCard patient={patientData} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <LabResultsCard patient={patientData} />
                <PDExchangeCard pdEvents={patientData.pdEvents} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 <MedicationsCard patient={patientData} />
                 <InfectionHistoryCard 
                    episodes={patientData.peritonitisEpisodes} 
                    admissions={patientData.admissions || []}
                    esiCount={patientData.esiCount}
                    lastEsiDate={patientData.lastHomeVisitDate}
                 />
            </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <ConsultationActionsCard patientId={patientData.patientId} />
            <ClinicalInfoEditor patient={patientData} />
            <CareTeamNotesCard patient={patientData} />
            <ClinicVisitsCard patient={patientData} />
            <NutritionLifestyleCard data={patientData.nutritionLifestyle} />
            <PatientEducationCard topics={patientData.patientEducation} />
        </div>
      </main>
    </div>
  );
}

function ClinicalInfoEditor({ patient }: { patient: PatientData }) {
    const { toast } = useToast();
    const [pdStartDate, setPdStartDate] = useState<Date | undefined>(
        patient.pdStartDate ? parseISO(patient.pdStartDate) : undefined
    );
    const [transportType, setTransportType] = useState(patient.membraneTransportType || '');

    const handleSave = async () => {
        if (!pdStartDate && !transportType) {
            toast({ title: "No changes to save.", variant: "destructive"});
            return;
        }

        const dataToUpdate: Partial<PatientData> = {};
        if (pdStartDate) dataToUpdate.pdStartDate = pdStartDate.toISOString();
        if (transportType) dataToUpdate.membraneTransportType = transportType as any;

        const result = await updatePatientData(patient.patientId, dataToUpdate);

        if (result.success) {
            toast({ title: "Clinical Info Updated", description: "Patient data has been saved." });
        } else {
            toast({ title: "Update Failed", description: result.error, variant: "destructive" });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Edit className="h-4 w-4" />
                  Edit Clinical Info
                </CardTitle>
                <CardDescription>Update key clinical dates and parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>PD Start Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !pdStartDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {pdStartDate ? format(pdStartDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={pdStartDate} onSelect={setPdStartDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label>Membrane Transport Type</Label>
                    <Select onValueChange={setTransportType} value={transportType}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="High-Average">High-Average</SelectItem>
                            <SelectItem value="Low-Average">Low-Average</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSave} className="w-full">Save Clinical Info</Button>
            </CardContent>
        </Card>
    )
}

export default function PatientDetailPage({ params }: { params: { patientId: string } }) {
  return <PatientDetailView patientId={params.patientId} />;
}
