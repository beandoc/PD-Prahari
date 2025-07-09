import { patientData } from '@/data/mock-data';
import PatientHeader from '@/components/dashboard/patient-header';
import VitalsCard from '@/components/dashboard/vitals-card';
import LabResultsCard from '@/components/dashboard/lab-results-card';
import PDExchangeCard from '@/components/dashboard/pd-exchange-card';
import MedicationsCard from '@/components/dashboard/medications-card';
import AIMedicationTool from '@/components/dashboard/ai-medication-tool';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <PatientHeader patient={patientData} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <VitalsCard vitals={patientData.vitals} />
            <LabResultsCard labResults={patientData.labResults} />
            <PDExchangeCard pdEvents={patientData.pdEvents} />
          </div>
          <div className="flex flex-col gap-6 lg:col-span-1">
            <MedicationsCard medications={patientData.medications} />
            <AIMedicationTool patientData={patientData} />
          </div>
        </div>
      </main>
    </div>
  );
}
