'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Droplets } from 'lucide-react';

interface FlaggedUfPatient {
    patientId: string;
    firstName: string;
    lastName: string;
    baselineUf: number;
    recentUf: number;
}

interface UfCarouselProps {
    flaggedUfPatients: FlaggedUfPatient[];
}

export function UfCarousel({ flaggedUfPatients }: UfCarouselProps) {
    const [ufIndex, setUfIndex] = useState(0);

    if (!flaggedUfPatients || flaggedUfPatients.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Droplets className="text-blue-500" />
                        Patients with Decreasing Ultrafiltration
                    </CardTitle>
                    <CardDescription>
                        No patients with a significant drop in UF detected.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center text-center text-muted-foreground h-[200px]">
                        <p>UF trends for all patients appear stable.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    const handleNextUf = () => setUfIndex((prev) => (prev + 1) % flaggedUfPatients.length);
    const handlePrevUf = () => setUfIndex((prev) => (prev - 1 + flaggedUfPatients.length) % flaggedUfPatients.length);
    const currentUfPatient = flaggedUfPatients[ufIndex];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Droplets className="text-blue-500" />
                    Patients with Decreasing Ultrafiltration
                </CardTitle>
                <CardDescription>
                    Showing {ufIndex + 1} of {flaggedUfPatients.length} patients with a significant drop in UF.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Patient</p>
                            <Link href={`/dashboard/patients/${currentUfPatient.patientId}`} className="font-bold text-lg hover:underline">
                                {currentUfPatient.firstName} {currentUfPatient.lastName}
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                                <div>
                                <p className="text-sm text-muted-foreground">Baseline UF (Avg)</p>
                                <p className="font-semibold">{currentUfPatient.baselineUf.toFixed(0)} mL/day</p>
                            </div>
                            <div className="text-red-600">
                                <p className="text-sm font-semibold text-red-800">Recent UF (Avg 14d)</p>
                                <p className="font-bold">{currentUfPatient.recentUf.toFixed(0)} mL/day</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm" onClick={handlePrevUf} disabled={flaggedUfPatients.length <= 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNextUf} disabled={flaggedUfPatients.length <= 1}>
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}