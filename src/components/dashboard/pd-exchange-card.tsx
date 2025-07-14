import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Droplets, Info } from 'lucide-react';
import type { PDEvent } from '@/lib/types';
import { format, subDays, startOfDay, differenceInCalendarDays } from 'date-fns';

interface PDExchangeCardProps {
  pdEvents: PDEvent[];
}

export default function PDExchangeCard({ pdEvents }: PDExchangeCardProps) {
    const recentEvents = pdEvents.slice(0, 4);

    // Calculate missed log percentage over the last 30 days
    const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));
    const today = startOfDay(new Date());
    const totalDays = differenceInCalendarDays(today, thirtyDaysAgo) + 1;

    const loggedDays = new Set(
        pdEvents
            .filter(event => new Date(event.exchangeDateTime) >= thirtyDaysAgo)
            .map(event => startOfDay(new Date(event.exchangeDateTime)).toISOString())
    );

    const missedDays = totalDays - loggedDays.size;
    const missedPercentage = totalDays > 0 ? (missedDays / totalDays) * 100 : 0;


  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                 <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-6 w-6" />
                  PD Exchange Data
                </CardTitle>
                <CardDescription>
                  Recent logs and compliance overview.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-2 text-xs">
                <Info className="h-4 w-4 text-yellow-600"/>
                <div>
                    <p className="font-semibold text-yellow-800">Missed Logs (30d)</p>
                    <p className="font-bold text-yellow-700">{missedPercentage.toFixed(0)}%</p>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Dialysate</TableHead>
              <TableHead className="text-right">Fill (mL)</TableHead>
              <TableHead className="text-right">Drain (mL)</TableHead>
              <TableHead className="text-right">UF (mL)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentEvents.length > 0 ? recentEvents.map((event) => (
              <TableRow key={event.exchangeId}>
                <TableCell className="font-medium">
                  {format(new Date(event.exchangeDateTime), 'MMM d, HH:mm')}
                </TableCell>
                <TableCell>{event.dialysateType}</TableCell>
                <TableCell className="text-right">
                  {event.fillVolumeML}
                </TableCell>
                <TableCell className="text-right">
                  {event.drainVolumeML}
                </TableCell>
                <TableCell
                  className={`text-right font-bold ${
                    event.ultrafiltrationML >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {event.ultrafiltrationML}
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No recent PD exchange data found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
