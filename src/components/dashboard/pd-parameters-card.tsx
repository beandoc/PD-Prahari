

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PatientData } from '@/lib/types';
import { SlidersHorizontal } from 'lucide-react';
import { parseISO, differenceInMonths, differenceInYears } from 'date-fns';

interface PDParametersCardProps {
    patient: PatientData;
}

const getPDVintage = (startDate?: string) => {
    if (!startDate) return 'N/A';
    const start = parseISO(startDate);
    const now = new Date();
    const years = differenceInYears(now, start);
    const months = differenceInMonths(now, start) % 12;
    let vintage = '';
    if (years > 0) {
        vintage += `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
        if (vintage) vintage += ', ';
        vintage += `${months} month${months > 1 ? 's' : ''}`;
    }
    return vintage || 'Just started';
};


export default function PDParametersCard({ patient }: PDParametersCardProps) {
    const { prescription, membraneTransportType, pdExchangeType, pdStartDate } = patient;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                    PD Parameters & Prescription
                </CardTitle>
                <CardDescription>
                    Key dialysis parameters and the current prescribed regimen for the patient.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold text-base mb-2">Patient Parameters</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-slate-50 border rounded-lg">
                            <p className="font-medium text-muted-foreground">Transporter Status</p>
                            <p className="font-semibold">{membraneTransportType || 'N/A'}</p>
                        </div>
                         <div className="p-3 bg-slate-50 border rounded-lg">
                            <p className="font-medium text-muted-foreground">Exchange Type</p>
                            <p className="font-semibold">{pdExchangeType || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 border rounded-lg">
                            <p className="font-medium text-muted-foreground">PD Vintage</p>
                            <p className="font-semibold">{getPDVintage(pdStartDate)}</p>
                        </div>
                    </div>
                </div>

                {prescription?.regimen ? (
                <div>
                    <h4 className="font-semibold text-base mb-2">Prescribed Regimen</h4>
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Exchange</TableHead>
                                    <TableHead>Dialysate</TableHead>
                                    <TableHead>Fill Volume</TableHead>
                                    <TableHead>Dwell Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prescription.regimen.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.dialysateType}</TableCell>
                                        <TableCell>{item.fillVolumeML} mL</TableCell>
                                        <TableCell>{item.dwellTimeHours} hours</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                ) : (
                    <div className="text-center text-muted-foreground p-4 bg-slate-50 border rounded-lg">
                        No active PD prescription regimen found for this patient.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
