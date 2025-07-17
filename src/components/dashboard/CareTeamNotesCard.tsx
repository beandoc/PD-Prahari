
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquareQuote } from 'lucide-react';
import type { PatientData } from '@/lib/types';

interface CareTeamNotesCardProps {
  patient: PatientData;
  className?: string;
}

export default function CareTeamNotesCard({ patient, className }: CareTeamNotesCardProps) {
  const hasNotes = patient.nurseCounselingNotes || patient.additionalNotes;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="bg-cyan-100 rounded-full p-1.5">
            <MessageSquareQuote className="h-4 w-4 text-cyan-600" />
          </div>
          <span>Care Team Notes</span>
        </CardTitle>
        <CardDescription>
          Remarks and counseling notes from the care team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

    