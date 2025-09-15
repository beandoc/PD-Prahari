
// We remove 'use client'. This is now a Server Component.
import { getSyncedPatientData } from '@/app/actions';
import { History, TrendingUp, Droplets } from 'lucide-react';
import type { PDEvent, PatientData } from '@/lib/types';
import { format, startOfDay } from 'date-fns';
import { HistoryView } from '@/components/patient-portal/history-view';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function getPatientIdFromServer(): Promise<string | null> {
    // In a real app with proper auth, you'd get this from a secure, httpOnly cookie.
    // For this demo, we'll read it from the headers which we can't do,
    // so we will simulate this by assuming the logic is in place.
    // This is a placeholder for server-side session management.
    // const patientId = sessionStorage.getItem('loggedInPatientId'); // This is client-side code
    // A real implementation would be something like:
    // const session = await getIronSession(cookies());
    // if (!session.patientId) redirect('/patient-login');
    // return session.patientId;
    
    // For this context, we will assume a function can get it, but we can't implement it fully
    // without a real auth mechanism. We will have to pass it down from a client component
    // or use a temporary solution. The user's code relies on sessionStorage, so we must
    // adapt the page to still use a client-side check and pass data to the view.
    // Re-evaluating based on constraints: We cannot get sessionStorage on the server.
    // The user's proposal is architecturally sound but requires an auth pattern (cookies)
    // that isn't implemented. I will stick to the original client-side pattern but
    // apply the component separation and dynamic loading benefits.
    return null;
}


export default function LogHistoryPage() {
  // Since we cannot get the patientId on the server without a proper auth system (like cookies),
  // we will keep the top-level page as a client component to access sessionStorage,
  // but we will still delegate the heavy lifting and display to the HistoryView component.
  // This is a compromise based on the current auth implementation.
  
  // The user's original page.tsx was a client component, I will restore that and create the new view component.
  return (
     <ClientHistoryPage />
  );
}


function ClientHistoryPage() {
    'use client';

    const [patient, setPatient] = useState<PatientData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const patientId = sessionStorage.getItem('loggedInPatientId');
        if (!patientId) {
            router.push('/patient-login');
            return;
        }

        getSyncedPatientData(patientId).then(data => {
            if (data) {
                setPatient(data);
            } else {
                setError("Failed to load patient data.");
            }
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setError("An error occurred while fetching data.");
            setIsLoading(false);
        });

    }, [router]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-8 w-2/3" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (error || !patient) {
        return <div className="text-destructive">{error || "Could not load patient information."}</div>
    }

    // Process initial data here before passing to the view component
    const initialEvents = [...patient.pdEvents].sort((a, b) => new Date(b.exchangeDateTime).getTime() - new Date(a.exchangeDateTime).getTime());
    
    const dailyUf: Record<string, number> = {};
    initialEvents.forEach(event => {
        const day = format(startOfDay(new Date(event.exchangeDateTime)), 'yyyy-MM-dd');
        dailyUf[day] = (dailyUf[day] || 0) + event.ultrafiltrationML;
    });
    
    const initialDailyUfData = Object.entries(dailyUf)
        .map(([date, uf]) => ({
            date: format(new Date(date), 'MMM d'),
            uf
        }))
        .slice(0, 30)
        .reverse();

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><History />Log History</h1>
                <p className="text-muted-foreground mt-2">A record of your previously submitted daily logs and health trends.</p>
            </header>
            
            <HistoryView 
                patientId={patient.patientId}
                initialEvents={initialEvents}
                initialDailyUfData={initialDailyUfData}
            />
        </div>
    );
}

// Previous content of history/page.tsx moved to a client component wrapper
// to allow for data fetching based on sessionStorage, then passing to the
// new optimized HistoryView component.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
