
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Droplets } from 'lucide-react';
import type { PDEvent } from '@/lib/types';
import { format } from 'date-fns';

interface PDExchangeCardProps {
  pdEvents: PDEvent[];
}

export default function PDExchangeCard({ pdEvents }: PDExchangeCardProps) {
  const allEvents = [...pdEvents].sort((a,b) => new Date(b.exchangeDateTime).getTime() - new Date(a.exchangeDateTime).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-6 w-6" />
          PD Exchange History
        </CardTitle>
        <CardDescription>
          A complete log of all recorded PD exchanges.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
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
                {allEvents.length > 0 ? allEvents.map((event) => (
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
                            No PD exchange data found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
