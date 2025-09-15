
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Droplets, TrendingUp, BarChart as BarChartIcon } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PDEvent } from '@/lib/types';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DynamicLineChart = dynamic(() => 
  import('recharts').then(mod => mod.LineChart), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" />
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
    // This listener now only needs to fetch events NEWER than what we already have.
    const latestEventDate = allEvents.length > 0 ? new Date(allEvents[0].exchangeDateTime) : new Date(0);
    
    // In a subcollection model, this query is very efficient.
    // In the current model, this still requires a client-side read of the whole document.
    // The architectural benefit comes from setting up the listener correctly for a future migration.
    const patientDocRef = doc(db, 'patients', patientId);

    const unsubscribe = onSnapshot(patientDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const patientData = docSnap.data();
        const freshEvents = (patientData.pdEvents || []) as PDEvent[];
        const newEvents = freshEvents.filter(e => new Date(e.exchangeDateTime) > latestEventDate);

        if (newEvents.length > 0) {
            console.log("New real-time events received:", newEvents);
            const combinedEvents = [...newEvents, ...allEvents].sort((a,b) => new Date(b.exchangeDateTime).getTime() - new Date(a.exchangeDateTime).getTime());
            setAllEvents(combinedEvents);

            // Recalculate UF data
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
                <ResponsiveContainer width="100%" height={300}>
                    <DynamicLineChart data={dailyUfData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Total UF (mL)', angle: -90, position: 'insideLeft' }}/>
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="uf" stroke="hsl(var(--primary))" name="Total Daily UF (mL)" activeDot={{ r: 8 }} />
                    </DynamicLineChart>
                </ResponsiveContainer>
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
