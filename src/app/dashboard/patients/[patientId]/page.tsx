
'use client';

import type { PatientData } from '@/lib/types';
import { getSyncedPatientData } from '@/app/actions';
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
import { useState, useEffect, useCallback, use } from 'react';
import { doc } from 'firebase/firestore';
import { db, onSnapshot } from '@/lib/firebase';

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
        setPatientData(docSnap.data() as PatientData);
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
            <CareTeamNotesCard patient={patientData} />
            <ClinicVisitsCard patient={patientData} />
            <NutritionLifestyleCard data={patientData.nutritionLifestyle} />
            <PatientEducationCard topics={patientData.patientEducation} />
        </div>
      </main>
    </div>
  );
}

export default function PatientDetailPage({ params }: { params: { patientId: string } }) {
  // The 'use' hook is the new recommended way to access params in Next.js App Router.
  const resolvedParams = use(Promise.resolve(params));
  return <PatientDetailView patientId={resolvedParams.patientId} />;
}
