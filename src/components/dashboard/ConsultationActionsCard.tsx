
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital, ClipboardCheck, Save } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface ConsultationActionsCardProps {
    patientId: string;
}

export default function ConsultationActionsCard({ patientId }: ConsultationActionsCardProps) {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Consultation Saved",
            description: "All changes for this consultation have been saved.",
        });
        // In a real app, this would trigger a data submission to the backend.
    };
    
  return (
    <Card className="bg-slate-50 border-dashed">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Consultation Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={handleSave} size="lg">
            <Save className="mr-2 h-4 w-4" /> Save Consultation
        </Button>
        <Button asChild variant="secondary">
          <Link href="#">
            <Hospital className="mr-2 h-4 w-4" /> Admit Patient
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/dashboard/nurse-checklist?patientId=${patientId}`}>
            <ClipboardCheck className="mr-2 h-4 w-4" /> Send to PD Nurse for Checklist
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
