
'use client';

import { useState, useMemo, useEffect } from 'react';
import { allPatientData } from '@/data/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PatientData, PDEvent, Prescription } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function PdLogsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [patientData, setPatientData] = useState<PatientData | null>(null);
    const [sortedPatients, setSortedPatients] = useState<PatientData[]>([]);

    useEffect(() => {
        const sorted = [...allPatientData].sort((a, b) => a.firstName.localeCompare(b.firstName));
        setSortedPatients(sorted);
        if (sorted.length > 0) {
            const firstPatientId = sorted[0].patientId;
            setSelectedPatientId(firstPatientId);
            setPatientData(sorted[0]);
        }
        setIsLoading(false);
    }, []);

    const handlePatientChange = (patientId: string) => {
        setSelectedPatientId(patientId);
        setPatientData(allPatientData.find(p => p.patientId === patientId) || null);
        setPageIndex(0); // Reset to first page when patient changes
    };

    const { prescription, pdEvents }: { prescription: Prescription | null; pdEvents: PDEvent[] } = useMemo(() => {
        if (!patientData) {
            return { prescription: null, pdEvents: [] };
        }
        return {
            prescription: patientData.prescription,
            pdEvents: patientData.pdEvents,
        };
    }, [patientData]);

    const pageCount = Math.ceil((pdEvents?.length || 0) / pageSize);
    const paginatedEvents = pdEvents?.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize) || [];
    const startItem = (pdEvents?.length || 0) > 0 ? pageIndex * pageSize + 1 : 0;
    const endItem = (pdEvents?.length || 0) > 0 ? Math.min((pageIndex + 1) * pageSize, pdEvents.length) : 0;


    if (isLoading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-10 w-1/4" />
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                    <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold">Peritoneal Dialysis Logs</h1>
                    <p className="text-muted-foreground">
                        {patientData ? `Viewing logs for ${patientData.firstName} ${patientData.lastName}` : 'Select a patient to view logs.'}
                    </p>
                </div>
                 <div className="w-full sm:w-auto sm:min-w-[250px]">
                    <Select onValueChange={handlePatientChange} value={selectedPatientId}>
                        <SelectTrigger><SelectValue placeholder="Select a patient..." /></SelectTrigger>
                        <SelectContent>
                            {sortedPatients.map(p => (
                                <SelectItem key={p.patientId} value={p.patientId}>
                                    {p.firstName} {p.lastName} ({p.nephroId})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </header>
            
            {!patientData ? (
                 <Card>
                    <CardContent className="p-16 text-center text-muted-foreground">
                        Please select a patient to view their data.
                    </CardContent>
                 </Card>
            ) : (
                <Tabs defaultValue="logs" className="w-full">
                    <TabsList>
                        <TabsTrigger value="prescription">Prescription</TabsTrigger>
                        <TabsTrigger value="logs">Patient PD logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="prescription" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Prescription</CardTitle>
                                {patientData.currentStatus !== 'Active PD' && (
                                     <CardDescription>
                                        This patient does not have an active PD prescription. Current Status: {patientData.currentStatus}
                                     </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                {prescription && patientData.currentStatus === 'Active PD' ? (
                                    <>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
                                            <div><p className="text-sm text-muted-foreground mb-1">Exchange</p><p className="font-medium">{prescription.exchange}</p></div>
                                            <div><p className="text-sm text-muted-foreground mb-1">PD Strength</p><p className="font-medium">{prescription.pdStrength}</p></div>
                                            <div><p className="text-sm text-muted-foreground mb-1">Dwell Time</p><p className="font-medium">{prescription.dwellTimeHours} hours</p></div>
                                            <div><p className="text-sm text-muted-foreground mb-1">Dwell Vol</p><p className="font-medium">{prescription.dwellVolumeML} mL</p></div>
                                            <div><p className="text-sm text-muted-foreground mb-1">Exchange Time</p><p className="font-medium">{prescription.exchangeTimeMinutes} mins</p></div>
                                        </div>
                                        {prescription.regimen && prescription.regimen.length > 0 ? (
                                            <>
                                                <h4 className="font-semibold text-lg mt-4 mb-2">Prescribed Regimen Details</h4>
                                                <div className="border rounded-lg">
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
                                            </>
                                        ) : (
                                            <p className="text-center text-muted-foreground py-4">No detailed regimen found for this patient.</p>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center bg-slate-50 rounded-md">
                                        <Info className="h-8 w-8 mb-2" />
                                        <p className="font-semibold">No Active Prescription</p>
                                        <p className="text-sm">A prescription will be available once the patient begins PD therapy.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="logs" className="mt-4">
                        <Card>
                            <CardContent className="p-4 sm:p-6">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Exchange</TableHead>
                                                <TableHead>PD Strength</TableHead>
                                                <TableHead>Dwell Time</TableHead>
                                                <TableHead className="text-right">Dwell Volume</TableHead>
                                                <TableHead className="text-right">Drain Volume</TableHead>
                                                <TableHead className="text-right">Filtration</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedEvents.length > 0 ? paginatedEvents.map(event => (
                                                <TableRow key={event.exchangeId}>
                                                    <TableCell className="py-3">{format(new Date(event.exchangeDateTime), 'yyyy-MM-dd HH:mm')}</TableCell>
                                                    <TableCell className="py-3">Manual</TableCell>
                                                    <TableCell className="py-3">{event.dialysateType}</TableCell>
                                                    <TableCell className="py-3">{event.dwellTimeHours} hr</TableCell>
                                                    <TableCell className="py-3 text-right">{event.fillVolumeML} mL</TableCell>
                                                    <TableCell className="py-3 text-right">{event.drainVolumeML} mL</TableCell>
                                                    <TableCell className={cn("py-3 text-right font-semibold", event.ultrafiltrationML >=0 ? 'text-green-600' : 'text-red-600')}>{event.ultrafiltrationML} mL</TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">No PD logs found for this patient.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-y-4 gap-x-2 sm:gap-x-6 pt-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium">Items per page:</p>
                                        <Select
                                            value={`${pageSize}`}
                                            onValueChange={(value) => {
                                                setPageSize(Number(value))
                                                setPageIndex(0)
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-[70px]">
                                                <SelectValue placeholder={pageSize} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[5, 10, 20].map(size => (
                                                    <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="font-medium text-muted-foreground">
                                       {startItem}-{endItem} of {pdEvents.length}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPageIndex(p => p - 1)} disabled={pageIndex === 0}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPageIndex(p => p + 1)} disabled={pageIndex >= pageCount - 1}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex >= pageCount - 1}>
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
