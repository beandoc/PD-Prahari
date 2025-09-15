
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Droplets, TrendingUp, BarChart as BarChartIcon } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PDEvent } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

// Dynamically import the chart component
const PatientHistoryChart = dynamic(() => import('@/components/charts/patient-history-chart').then(mod => mod.PatientHistoryChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});

interface HistoryViewProps {
    patientId: string;
    initialEvents: PDEvent[];
    initialDailyUfData: { date: string; uf: number; }[];
}

export function HistoryView({ patientId, initialEvents, initialDailyUfData }: HistoryViewProps) {
  const [allEvents, setAllEvents] = useState<PDEvent[]>(initialEvents);
  const [dailyUfData, setDailyUfData] = useState(initialDailyUfData);

  useEffect(() => {
    const latestEventDate = allEvents.length > 0 ? new Date(allEvents[0].exchangeDateTime) : new Date(0);
    const patientDocRef = doc(db, 'patients', patientId);

    const unsubscribe = onSnapshot(patientDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const patientData = docSnap.data();
        const freshEvents = (patientData.pdEvents || []) as PDEvent[];
        const newEvents = freshEvents.filter(e => new Date(e.exchangeDateTime) > latestEventDate);

        if (newEvents.length > 0) {
            const combinedEvents = [...newEvents, ...allEvents].sort((a,b) => new Date(b.exchangeDateTime).getTime() - new Date(a.exchangeDateTime).getTime());
            setAllEvents(combinedEvents);

            const dailyUf: Record<string, number> = {};
            combinedEvents.forEach(event => {
                const day = format(startOfDay(new Date(event.exchangeDateTime)), 'yyyy-MM-dd');
                dailyUf[day] = (dailyUf[day] || 0) + event.ultrafiltrationML;
            });
            
            const updatedDailyUfData = Object.entries(dailyUf)
                .map(([date, uf]) => ({
                    date: format(new Date(date), 'MMM d'),
                    uf
                }))
                .slice(0, 30)
                .reverse();
            setDailyUfData(updatedDailyUfData);
        }
      }
    });
    
    return () => unsubscribe();
  }, [patientId, allEvents]);

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Daily Ultrafiltration Trend (Last 30 Days)
            </CardTitle>
            <CardDescription>
                This chart shows the total fluid removed each day. Consistent UF is important for your health.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {dailyUfData.length > 0 ? (
                <PatientHistoryChart data={dailyUfData} />
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                  <BarChartIcon className="h-12 w-12 mb-4" />
                  <p className="font-semibold">Not enough data to display a trend.</p>
                  <p className="text-sm mt-1">Start logging your exchanges to see your progress here.</p>
                </div>
            )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-blue-500" />
            Recent Exchange Logs
          </CardTitle>
          <CardDescription>
            A detailed and scrollable view of your historical PD exchange logs.
           </CardDescription>
        </CardHeader>
        <CardContent>
             <ScrollArea className="h-[400px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>PD Strength</TableHead>
                            <TableHead className="text-right">Dwell (hr)</TableHead>
                            <TableHead className="text-right">Fill (mL)</TableHead>
                            <TableHead className="text-right">Drain (mL)</TableHead>
                            <TableHead className="text-right">UF (mL)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allEvents.length > 0 ? allEvents.map(event => (
                            <TableRow key={event.exchangeId}>
                                <TableCell className="py-3">{format(new Date(event.exchangeDateTime), 'yyyy-MM-dd HH:mm')}</TableCell>
                                <TableCell className="py-3">{event.dialysateType}</TableCell>
                                <TableCell className="py-3 text-right">{event.dwellTimeHours}</TableCell>
                                <TableCell className="py-3 text-right">{event.fillVolumeML}</TableCell>
                                <TableCell className="py-3 text-right">{event.drainVolumeML}</TableCell>
                                <TableCell className={cn("py-3 text-right font-semibold", event.ultrafiltrationML >=0 ? 'text-green-600' : 'text-red-600')}>{event.ultrafiltrationML}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">No PD logs found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
