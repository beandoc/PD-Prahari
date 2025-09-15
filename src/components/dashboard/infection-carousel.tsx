'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface FlaggedPatient {
    patientId: string;
    firstName: string;
    lastName: string;
    type: 'Peritonitis' | 'Exit Site Infection';
    date: Date;
}

interface InfectionCarouselProps {
    flaggedInfectionPatients: FlaggedPatient[];
}

export function InfectionCarousel({ flaggedInfectionPatients }: InfectionCarouselProps) {
    const [infectionIndex, setInfectionIndex] = useState(0);

    if (!flaggedInfectionPatients || flaggedInfectionPatients.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-yellow-500" />
                        Infective complications (last 6 months)
                    </CardTitle>
                    <CardDescription>No patients with recent infections.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center justify-center text-center text-muted-foreground h-[200px]">
                        <p>No peritonitis or ESI cases in the last 6 months.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    const handleNextInfection = () => setInfectionIndex((prev) => (prev + 1) % flaggedInfectionPatients.length);
    const handlePrevInfection = () => setInfectionIndex((prev) => (prev - 1 + flaggedInfectionPatients.length) % flaggedInfectionPatients.length);
    const currentInfection = flaggedInfectionPatients[infectionIndex];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-yellow-500" />
                    Infective complications (last 6 months)
                </CardTitle>
                <CardDescription>
                    Showing {infectionIndex + 1} of {flaggedInfectionPatients.length} patients with recent infections.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Patient</p>
                            <Link href={`/dashboard/patients/${currentInfection.patientId}`} className="font-bold text-lg hover:underline">
                                {currentInfection.firstName} {currentInfection.lastName}
                            </Link>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Issue</p>
                            <Badge variant="destructive">{currentInfection.type}</Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-semibold">{format(currentInfection.date, 'PPP')}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm" onClick={handlePrevInfection} disabled={flaggedInfectionPatients.length <= 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNextInfection} disabled={flaggedInfectionPatients.length <= 1}>
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}