
import type { PatientData } from '@/lib/types';
import { getSyncedPatientData } from '@/lib/data-sync';
import PatientHeader from '@/components/dashboard/patient-header';
import PeritonitisHistoryCard from '@/components/dashboard/PeritonitisTrackingCard';
import MedicationsCard from '@/components/dashboard/medications-card';
import NutritionLifestyleCard from '@/components/dashboard/NutritionLifestyleCard';
import ClinicVisitsCard from '@/components/dashboard/ClinicVisitsCard';
import PatientEducationCard from '@/components/dashboard/PatientEducationCard';
import VitalsCard from '@/components/dashboard/vitals-card';
import LabResultsCard from '@/components/dashboard/lab-results-card';
import PDExchangeCard from '@/components/dashboard/pd-exchange-card';
import PDParametersCard from '@/components/dashboard/pd-parameters-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

'use client';

// This is the dedicated Client Component that handles state and data fetching.
// It receives the patientId as a simple string prop.
function PatientDetailView({ patientId }: { patientId: string }) {
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getSyncedPatientData(patientId);
      setPatientData(data);
    }
    fetchData();
  }, [patientId]);
  
  if (!patientData) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-16 w-1/2" />
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
      <main className="flex-1 p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <VitalsCard vitals={patientData.vitals} pdEvents={patientData.pdEvents} />
            <PDParametersCard patient={patientData} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <LabResultsCard labResults={patientData.labResults} />
                <PDExchangeCard pdEvents={patientData.pdEvents} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 <MedicationsCard medications={patientData.medications} />
                 <PeritonitisHistoryCard episodes={patientData.peritonitisEpisodes} admissions={patientData.admissions || []}/>
            </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <ClinicVisitsCard data={patientData.clinicVisits} admissions={patientData.admissions || []} />
            <NutritionLifestyleCard data={patientData.nutritionLifestyle} />
            <PatientEducationCard topics={patientData.patientEducation} />
        </div>
      </main>
    </div>
  );
}


// This default export is the page component. It is a Server Component by default.
// Its only job is to handle the server-side params and pass them to the Client Component.
export default async function PatientDetailPage({ params }: { params: { patientId: string } }) {
  const { patientId } = params;
  // It then renders the Client Component, passing the ID as a prop.
  return <PatientDetailView patientId={patientId} />;
}
