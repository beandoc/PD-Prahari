
'use client';

import { useState } from 'react';
import { allPatientData } from '@/data/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PdLogsPage() {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    
    // Use the first patient's data as a default for this page
    const patientData = allPatientData[0];

    const pdEvents = patientData.pdEvents;
    const pageCount = Math.ceil(pdEvents.length / pageSize);
    const paginatedEvents = pdEvents.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    const startItem = pdEvents.length > 0 ? pageIndex * pageSize + 1 : 0;
    const endItem = pdEvents.length > 0 ? Math.min((pageIndex + 1) * pageSize, pdEvents.length) : 0;

    return (
        <div className="min-h-screen bg-[#2a4a6c] text-white p-4 sm:p-6 md:p-8 font-body">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <div className="bg-[#1fa5b4] p-3 rounded-md">
                        <Droplets className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">Peritoneal Dialysis for {patientData.firstName} {patientData.lastName}</h1>
                </header>

                <Tabs defaultValue="logs" className="w-full">
                    <TabsList className="bg-transparent p-0 border-b border-gray-700 w-full justify-start rounded-none">
                        <TabsTrigger value="prescription" className="text-gray-300 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 rounded-none pb-3 px-4 transition-none">Prescription</TabsTrigger>
                        <TabsTrigger value="logs" className="text-gray-300 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 rounded-none pb-3 px-4 transition-none">Patient PD logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="prescription" className="mt-6">
                        <Card className="bg-[#1c3a5e] border-none text-white">
                            <CardContent className="p-6">
                                <div className="border-b border-gray-700 pb-4 mb-4">
                                     <h2 className="text-xl font-semibold">Current Prescription</h2>
                                </div>
                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    <div><p className="text-sm text-gray-400 mb-1">Exchange</p><p className="font-medium">4x Daily</p></div>
                                    <div><p className="text-sm text-gray-400 mb-1">PD Strength</p><p className="font-medium">Mixed Dextrose</p></div>
                                    <div><p className="text-sm text-gray-400 mb-1">Dwell Time</p><p className="font-medium">4 hours</p></div>
                                    <div><p className="text-sm text-gray-400 mb-1">Dwell Vol</p><p className="font-medium">2000 mL</p></div>
                                    <div><p className="text-sm text-gray-400 mb-1">Exchange Time</p><p className="font-medium">30 mins</p></div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="logs" className="mt-6">
                        <Card className="bg-[#1c3a5e] border-none text-white">
                            <CardContent className="p-4 sm:p-6">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-gray-700 hover:bg-transparent">
                                                <TableHead className="text-white font-semibold">Date</TableHead>
                                                <TableHead className="text-white font-semibold">Exchange</TableHead>
                                                <TableHead className="text-white font-semibold">PD Strength</TableHead>
                                                <TableHead className="text-white font-semibold">Dwell Time</TableHead>
                                                <TableHead className="text-white font-semibold text-right">Dwell Volume</TableHead>
                                                <TableHead className="text-white font-semibold text-right">Drain Volume</TableHead>
                                                <TableHead className="text-white font-semibold text-right">Filtration</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedEvents.length > 0 ? paginatedEvents.map(event => (
                                                <TableRow key={event.exchangeId} className="border-b border-gray-700 hover:bg-[#2a4a6c]/50">
                                                    <TableCell className="py-3">{format(new Date(event.exchangeDateTime), 'yyyy-MM-dd HH:mm')}</TableCell>
                                                    <TableCell className="py-3">Manual</TableCell>
                                                    <TableCell className="py-3">{event.dialysateType}</TableCell>
                                                    <TableCell className="py-3">{event.dwellTimeHours} hr</TableCell>
                                                    <TableCell className="py-3 text-right">{event.fillVolumeML} mL</TableCell>
                                                    <TableCell className="py-3 text-right">{event.drainVolumeML} mL</TableCell>
                                                    <TableCell className={cn("py-3 text-right font-semibold", event.ultrafiltrationML >=0 ? 'text-green-400' : 'text-red-400')}>{event.ultrafiltrationML} mL</TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow className="hover:bg-transparent">
                                                    <TableCell colSpan={7} className="text-center py-16 text-gray-400">No PD logs found.</TableCell>
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
                                            <SelectTrigger className="h-8 w-[70px] bg-transparent border-gray-500 hover:bg-gray-700/50">
                                                <SelectValue placeholder={pageSize} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1c3a5e] text-white border-gray-600">
                                                {[5, 10, 20].map(size => (
                                                    <SelectItem key={size} value={`${size}`} className="focus:bg-gray-700/50">{size}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="font-medium text-gray-300">
                                       {startItem}-{endItem} of {pdEvents.length}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button variant="outline" className="h-8 w-8 p-0 bg-transparent border-gray-500 hover:bg-gray-700/50 disabled:opacity-50 disabled:text-gray-500" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" className="h-8 w-8 p-0 bg-transparent border-gray-500 hover:bg-gray-700/50 disabled:opacity-50 disabled:text-gray-500" onClick={() => setPageIndex(p => p - 1)} disabled={pageIndex === 0}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" className="h-8 w-8 p-0 bg-transparent border-gray-500 hover:bg-gray-700/50 disabled:opacity-50 disabled:text-gray-500" onClick={() => setPageIndex(p => p + 1)} disabled={pageIndex >= pageCount - 1}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" className="h-8 w-8 p-0 bg-transparent border-gray-500 hover:bg-gray-700/50 disabled:opacity-50 disabled:text-gray-500" onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex >= pageCount - 1}>
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
