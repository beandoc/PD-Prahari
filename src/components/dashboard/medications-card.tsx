
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pill, CheckCircle, AlertTriangle, PlusCircle, Pencil } from 'lucide-react';
import type { Medication } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface MedicationsCardProps {
  medications: Medication[];
}

export default function MedicationsCard({ medications: initialMedications }: MedicationsCardProps) {
  const [medications, setMedications] = useState(initialMedications);
  
  const displayedMedications = useMemo(() => {
    const esaNames = ["erythropoietin", "mircera", "darbepoetin", "oxemia"];
    const hasESA = medications.some(med => 
        esaNames.some(esa => med.medicationName.toLowerCase().includes(esa))
    );

    const newMedicationList = [...medications];

    if (!hasESA) {
        newMedicationList.push({
            medicationId: 'ESA-placeholder',
            medicationName: 'Erythropoietin (EPO)',
            dosage: 'Not Prescribed',
            frequency: '',
            startDate: '',
            status: 'warning',
            prescribingDoctor: ''
        });
    }

    return newMedicationList;
  }, [medications]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <div className="bg-red-100 rounded-full p-1.5">
              <Pill className="h-4 w-4 text-red-500" />
            </div>
            <span>Current Medications</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {displayedMedications.map((med) => (
            <li key={med.medicationId} className={cn(
                "flex items-center justify-between rounded-lg p-3 border group",
                med.status === 'warning' ? 'bg-yellow-50/70 border-yellow-200' : 'bg-white'
            )}>
              <div>
                <p className="font-semibold">{med.medicationName}</p>
                <p className="text-sm text-muted-foreground">{med.dosage} {med.frequency}</p>
              </div>
              <div className="flex items-center gap-2">
                {med.status === 'ok' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {med.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 fill-yellow-400" />}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
