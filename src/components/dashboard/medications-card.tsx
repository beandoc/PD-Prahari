import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pill, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Medication } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MedicationsCardProps {
  medications: Medication[];
}

export default function MedicationsCard({ medications }: MedicationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="bg-red-100 rounded-full p-1.5">
            <Pill className="h-4 w-4 text-red-500" />
          </div>
          <span>Current Medications</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {medications.map((med) => (
            <li key={med.medicationId} className={cn(
                "flex items-center justify-between rounded-lg p-3 border",
                med.status === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
            )}>
              <div>
                <p className="font-semibold">{med.medicationName}</p>
                <p className="text-sm text-muted-foreground">{med.dosage} {med.frequency}</p>
              </div>
              {med.status === 'ok' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {med.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 fill-yellow-400" />}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
