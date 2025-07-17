
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pill, AlertTriangle, PlusCircle, Trash2, Check, X } from 'lucide-react';
import type { Medication, PatientData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updatePatientMedications } from '@/lib/data-sync';

interface MedicationsCardProps {
  patient: PatientData;
}

const EditMedicationDialog = ({ patient, onUpdate }: { patient: PatientData, onUpdate: (meds: Medication[]) => void }) => {
    const [meds, setMeds] = useState<Medication[]>(patient.medications);
    const { toast } = useToast();

    const handleFieldChange = (index: number, field: keyof Medication, value: string) => {
        const newMeds = [...meds];
        // @ts-ignore
        newMeds[index][field] = value;
        setMeds(newMeds);
    };

    const addNewMed = () => {
        setMeds([...meds, {
            medicationId: `new-${Date.now()}`,
            medicationName: '',
            dosage: '',
            frequency: '',
            startDate: new Date().toISOString(),
            status: 'ok',
        }]);
    };

    const removeMed = (index: number) => {
        setMeds(meds.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        const validMeds = meds.filter(m => m.medicationName.trim() && m.dosage.trim() && m.frequency.trim());
        updatePatientMedications(patient.patientId, validMeds);
        onUpdate(validMeds);
        toast({
            title: "Medications Updated",
            description: "The patient's medication list has been saved.",
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Edit Medications
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Medications for {patient.firstName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                    {meds.map((med, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 border rounded-lg">
                           <div className="col-span-4 space-y-1"><Label>Name</Label><Input value={med.medicationName} onChange={e => handleFieldChange(index, 'medicationName', e.target.value)} /></div>
                           <div className="col-span-3 space-y-1"><Label>Dosage</Label><Input value={med.dosage} onChange={e => handleFieldChange(index, 'dosage', e.target.value)} /></div>
                           <div className="col-span-4 space-y-1"><Label>Frequency</Label><Input value={med.frequency} onChange={e => handleFieldChange(index, 'frequency', e.target.value)} /></div>
                           <div className="col-span-1"><Button variant="destructive" size="icon" onClick={() => removeMed(index)}><Trash2 className="h-4 w-4"/></Button></div>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addNewMed} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Medication
                    </Button>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <DialogClose asChild><Button onClick={handleSave}>Save Changes</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function MedicationsCard({ patient }: MedicationsCardProps) {
  const [medications, setMedications] = useState(patient.medications);

  const handleUpdate = (newMeds: Medication[]) => {
      setMedications(newMeds);
  }

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
           <EditMedicationDialog patient={patient} onUpdate={handleUpdate} />
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
                {med.status === 'ok' && <Check className="h-5 w-5 text-green-500" />}
                {med.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
