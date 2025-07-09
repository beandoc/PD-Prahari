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
import { Droplets } from 'lucide-react';
import type { PDEvent } from '@/lib/types';
import { format } from 'date-fns';

interface PDExchangeCardProps {
  pdEvents: PDEvent[];
}

export default function PDExchangeCard({ pdEvents }: PDExchangeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-6 w-6" />
          PD Exchange Data
        </CardTitle>
        <CardDescription>
          Recent peritoneal dialysis exchange logs.
        </CardDescription>
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
            {pdEvents.map((event) => (
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
