import { patientData } from '@/data/mock-data';
import PatientHeader from '@/components/dashboard/patient-header';
import PeritonitisTrackingCard from '@/components/dashboard/PeritonitisTrackingCard';
import MedicationsCard from '@/components/dashboard/medications-card';
import NutritionLifestyleCard from '@/components/dashboard/NutritionLifestyleCard';
import ClinicVisitsCard from '@/components/dashboard/ClinicVisitsCard';
import PatientEducationCard from '@/components/dashboard/PatientEducationCard';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <PatientHeader patient={patientData} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <PeritonitisTrackingCard data={patientData.peritonitisTracking} />
          <MedicationsCard medications={patientData.medications} />
          <NutritionLifestyleCard data={patientData.nutritionLifestyle} />
          <ClinicVisitsCard data={patientData.clinicVisits} className="lg:col-span-2" />
          <PatientEducationCard topics={patientData.patientEducation} />
        </div>
      </main>
    </div>
  );
}
