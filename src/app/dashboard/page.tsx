
import { getLiveAllPatientData } from '@/app/actions';
import DoctorDashboardClient from '@/components/dashboard/doctor-dashboard-client';

/**
 * This is a React Server Component (RSC).
 * It fetches the initial data on the server and passes it to the client component.
 * This makes the initial page load much faster as the HTML is pre-rendered with data.
 */
export default async function DoctorDashboard() {
    const initialPatientData = await getLiveAllPatientData();

    return (
        <DoctorDashboardClient initialPatientData={initialPatientData} />
    );
}
