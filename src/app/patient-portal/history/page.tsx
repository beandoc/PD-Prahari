
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as BarChartIcon } from 'recharts';
import { Droplets, History, TrendingUp, Loader2 } from 'lucide-react';
import type { PatientData, PDEvent } from '@/lib/types';
import { format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { db, onSnapshot } from '@/lib/firebase';

export default function LogHistoryPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [patientData, setPatientData] = useState<PatientData | null>(null);
    const [dailyUfData, setDailyUfData] = useState<{ date: string; uf: number; }[]>([]);
    const [allEvents, setAllEvents] = useState<PDEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const patientId = sessionStorage.getItem('loggedInPatientId');
        if (!patientId) {
            toast({ title: "Not logged in", description: "Redirecting to login.", variant: "destructive" });
            router.push('/patient-login');
            return;
        }

        const patientDocRef = doc(db, 'patients', patientId);
        const unsubscribe = onSnapshot(patientDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as PatientData;
                setPatientData(data);
                const events = [...data.pdEvents].sort((a, b) => new Date(b.exchangeDateTime).getTime() - new Date(a.exchangeDateTime).getTime());
                
                const dailyUf: Record<string, number> = {};
                events.forEach(event => {
                    const day = format(startOfDay(new Date(event.exchangeDateTime)), 'yyyy-MM-dd');
                    dailyUf[day] = (dailyUf[day] || 0) + event.ultrafiltrationML;
                });
                
                const calculatedDailyUfData = Object.entries(dailyUf)
                    .map(([date, uf]) => ({
                        date: format(new Date(date), 'MMM d'),
                        uf
                    }))
                    .slice(0, 30) // Show last 30 days
                    .reverse();

                setDailyUfData(calculatedDailyUfData);
                setAllEvents(events);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching real-time patient data:", error);
            toast({ title: "Error", description: "Could not load real-time data.", variant: "destructive" });
            setIsLoading(false);
        });
        
        return () => unsubscribe();
    }, [router, toast]);

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
            <Card>
                 <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                     <Skeleton className="h-[400px] w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
       <header>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><History />Log History</h1>
          <p className="text-muted-foreground mt-2">A record of your previously submitted daily logs and health trends.</p>
        </header>

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
              <LineChart data={dailyUfData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Total UF (mL)', angle: -90, position: 'insideLeft' }}/>
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="uf" stroke="hsl(var(--primary))" name="Total Daily UF (mL)" activeDot={{ r: 8 }} />
              </LineChart>
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
    </div>
  );
}
