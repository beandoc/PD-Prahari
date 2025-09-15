
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSyncedPatientData } from '@/app/actions';
import { History, TrendingUp, Droplets } from 'lucide-react';
import type { PDEvent, PatientData } from '@/lib/types';
import { format, startOfDay } from 'date-fns';
import { HistoryView } from '@/components/patient-portal/history-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// This component acts as a client-side entry point.
// Its primary job is to handle the sessionStorage authentication check.
export default function ClientHistoryPage() {
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
