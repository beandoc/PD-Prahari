
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquareQuote, PlusCircle, Pencil } from 'lucide-react';
import type { PatientData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updatePatientNotes } from '@/app/actions';


interface CareTeamNotesCardProps {
  patient: PatientData;
  className?: string;
}

export default function CareTeamNotesCard({ patient, className }: CareTeamNotesCardProps) {
  const [doctorNote, setDoctorNote] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveNote = async () => {
    if (!doctorNote.trim()) {
      toast({
        title: "Note is empty",
        description: "Please enter a note before saving.",
        variant: "destructive",
      });
      return;
    }
    await updatePatientNotes(patient.patientId, doctorNote);
    toast({
      title: "Note Saved",
      description: "The doctor's note has been added to the patient's record.",
    });
    setDoctorNote('');
    setIsDialogOpen(false);
  };
  
  const openDialogWithDefault = () => {
    setDoctorNote("Patient doing well, advised to continue same treatment.");
    setIsDialogOpen(true);
  }

  const hasNotes = patient.nurseCounselingNotes || patient.additionalNotes || patient.doctorNotes;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="bg-cyan-100 rounded-full p-1.5">
                <MessageSquareQuote className="h-4 w-4 text-cyan-600" />
              </div>
              <span>Care Team Notes</span>
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={openDialogWithDefault}><Pencil className="mr-2 h-4 w-4" /> Add Today's Note</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Today's Consultation Note for {patient.firstName}</DialogTitle>
                  <DialogDescription>
                    Enter your clinical notes for today's consultation. This will be visible to the care team.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="doctor-note">Today's Note</Label>
                  <Textarea 
                    id="doctor-note"
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                    placeholder="e.g., Patient doing well, advised to continue same treatment."
                    rows={5}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleSaveNote}>Save Note</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
        <CardDescription>
          Remarks and counseling notes from the care team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {patient.doctorNotes && (
          <div className="p-3 bg-blue-50 border-l-4 border-blue-300">
            <h4 className="text-sm font-semibold text-blue-800">Doctor's Remarks</h4>
            <p className="text-sm mt-1 whitespace-pre-wrap">{patient.doctorNotes}</p>
          </div>
        )}
        {patient.nurseCounselingNotes && (
          <div className="p-3 bg-slate-50 border rounded-lg">
            <h4 className="text-sm font-semibold text-muted-foreground">Nurse Counseling Remarks</h4>
            <p className="text-sm mt-1 whitespace-pre-wrap">{patient.nurseCounselingNotes}</p>
          </div>
        )}
        {patient.additionalNotes && (
           <div className="p-3 bg-slate-50 border rounded-lg">
            <h4 className="text-sm font-semibold text-muted-foreground">Additional Patient Notes</h4>
            <p className="text-sm mt-1 whitespace-pre-wrap">{patient.additionalNotes}</p>
          </div>
        )}
        {!hasNotes && (
            <p className="text-sm text-muted-foreground text-center py-4">No care team notes have been added for this patient yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
