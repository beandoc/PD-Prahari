import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pill } from 'lucide-react';
import type { Medication } from '@/lib/types';
import { Separator } from '../ui/separator';

interface MedicationsCardProps {
  medications: Medication[];
}

export default function MedicationsCard({ medications }: MedicationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-6 w-6" />
          Medications
        </CardTitle>
        <CardDescription>Current prescribed medications.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {medications.map((med, index) => (
            <li key={med.medicationId}>
              <div className="flex justify-between">
                <p className="font-semibold">{med.medicationName}</p>
                <p className="text-sm text-muted-foreground">{med.dosage}</p>
              </div>
              <p className="text-sm">{med.frequency}</p>
              {index < medications.length - 1 && <Separator className="mt-4" />}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
