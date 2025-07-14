
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

const MedicationForm = ({ medication, onSave, onCancel }: { medication: Partial<Medication> | null, onSave: (med: Partial<Medication>) => void, onCancel: () => void }) => {
  const [medData, setMedData] = useState(medication || { medicationName: '', dosage: '', frequency: '' });

  const handleSave = () => {
    onSave(medData);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="medicationName" className="text-right">Medication</Label>
        <Input id="medicationName" value={medData.medicationName} onChange={(e) => setMedData({ ...medData, medicationName: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dosage" className="text-right">Dosage</Label>
        <Input id="dosage" value={medData.dosage} onChange={(e) => setMedData({ ...medData, dosage: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="frequency" className="text-right">Frequency</Label>
        <Input id="frequency" value={medData.frequency} onChange={(e) => setMedData({ ...medData, frequency: e.target.value })} className="col-span-3" />
      </div>
       <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Medication</Button>
        </DialogFooter>
    </div>
  );
};


export default function MedicationsCard({ medications: initialMedications }: MedicationsCardProps) {
  const [medications, setMedications] = useState(initialMedications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Partial<Medication> | null>(null);

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

  const handleEdit = (med: Medication) => {
    setEditingMed(med);
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingMed({});
    setIsDialogOpen(true);
  };
  
  const handleSave = (medData: Partial<Medication>) => {
    if (editingMed && 'medicationId' in editingMed && editingMed.medicationId) {
      // Editing existing
      setMedications(meds => meds.map(m => m.medicationId === editingMed.medicationId ? { ...m, ...medData } : m));
    } else {
      // Adding new
      const newMed = { ...medData, medicationId: `MED-${Date.now()}`, startDate: new Date().toISOString(), status: 'ok' } as Medication;
      setMedications(meds => [...meds, newMed]);
    }
    setIsDialogOpen(false);
    setEditingMed(null);
  };


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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
               <Button variant="ghost" size="sm" onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
            </DialogTrigger>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>{editingMed && editingMed.medicationId ? 'Edit Medication' : 'Add New Medication'}</DialogTitle>
                </DialogHeader>
                <MedicationForm 
                  medication={editingMed} 
                  onSave={handleSave}
                  onCancel={() => setIsDialogOpen(false)}
                />
            </DialogContent>
          </Dialog>
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
                {med.status !== 'warning' && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleEdit(med)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
