
import { allPatientData } from '@/data/mock-data';
import PatientHeader from '@/components/dashboard/patient-header';
import PeritonitisHistoryCard from '@/components/dashboard/PeritonitisTrackingCard';
import MedicationsCard from '@/components/dashboard/medications-card';
import NutritionLifestyleCard from '@/components/dashboard/NutritionLifestyleCard';
import ClinicVisitsCard from '@/components/dashboard/ClinicVisitsCard';
import PatientEducationCard from '@/components/dashboard/PatientEducationCard';
import VitalsCard from '@/components/dashboard/vitals-card';
import LabResultsCard from '@/components/dashboard/lab-results-card';
import PDExchangeCard from '@/components/dashboard/pd-exchange-card';
import AIMedicationTool from '@/components/dashboard/ai-medication-tool';

export default function PatientDetailPage({ params }: { params: { patientId: string } }) {
  const patientData = allPatientData.find(p => p.patientId === params.patientId);

  if (!patientData) {
    return <div className="p-8">Patient not found.</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <PatientHeader patient={patientData} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <VitalsCard vitals={patientData.vitals} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <LabResultsCard labResults={patientData.labResults} />
                <PDExchangeCard pdEvents={patientData.pdEvents.slice(0, 4)} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 <MedicationsCard medications={patientData.medications} />
                 <PeritonitisHistoryCard episodes={patientData.peritonitisEpisodes} />
            </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <AIMedicationTool patientData={patientData} />
            <ClinicVisitsCard data={patientData.clinicVisits} />
            <NutritionLifestyleCard data={patientData.nutritionLifestyle} />
            <PatientEducationCard topics={patientData.patientEducation} />
        </div>
      </main>
    </div>
  );
}
