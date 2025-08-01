
'use client';

import { useState, useMemo } from 'react';
import type { PatientData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { subDays, isAfter, format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface InfectionHotspotCardProps {
    patients: PatientData[];
}

interface FlaggedPatient {
    patientId: string;
    firstName: string;
    lastName: string;
    type: 'Peritonitis' | 'Exit Site Infection';
    date: Date;
}

export default function InfectionHotspotCard({ patients }: InfectionHotspotCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const flaggedPatients = useMemo(() => {
        const sixMonthsAgo = subDays(new Date(), 180);
        const results: FlaggedPatient[] = [];

        patients.forEach(patient => {
            patient.peritonitisEpisodes.forEach(episode => {
                const episodeDate = parseISO(episode.diagnosisDate);
                if (isAfter(episodeDate, sixMonthsAgo)) {
                    results.push({
                        patientId: patient.patientId,
                        firstName: patient.firstName,
                        lastName: patient.lastName,
                        type: 'Peritonitis',
                        date: episodeDate
                    });
                }
            });

            if (patient.esiCount && patient.esiCount > 0 && patient.lastHomeVisitDate) {
                 const esiDate = parseISO(patient.lastHomeVisitDate); // Approximate date
                 if (isAfter(esiDate, sixMonthsAgo)) {
                     results.push({
                        patientId: patient.patientId,
                        firstName: patient.firstName,
                        lastName: patient.lastName,
                        type: 'Exit Site Infection',
                        date: esiDate
                     });
                 }
            }
        });

        return results.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [patients]);
    
    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % flaggedPatients.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + flaggedPatients.length) % flaggedPatients.length);
    };

    if (flaggedPatients.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span>Infection Hotspot</span>
                    </CardTitle>
                    <CardDescription>Recent peritonitis or ESI cases.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">No recent infections in the last 6 months.</p>
                </CardContent>
            </Card>
        );
    }
    
    const currentPatient = flaggedPatients[currentIndex];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span>Infection Hotspot</span>
                </CardTitle>
                <CardDescription>
                    Recent peritonitis or ESI cases ({currentIndex + 1} of {flaggedPatients.length})
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                    <div>
                        <p className="text-sm text-muted-foreground">Patient</p>
                        <Link href={`/dashboard/patients/${currentPatient.patientId}`} className="font-bold text-lg hover:underline">
                            {currentPatient.firstName} {currentPatient.lastName}
                        </Link>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Issue</p>
                        <Badge variant="destructive">{currentPatient.type}</Badge>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-semibold">{format(currentPatient.date, 'PPP')}</p>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={handlePrev} disabled={flaggedPatients.length <= 1}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNext} disabled={flaggedPatients.length <= 1}>
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
