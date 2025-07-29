
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital, ClipboardCheck, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { postDataUpdate } from '@/lib/broadcast';

interface ConsultationActionsCardProps {
    patientId: string;
}

export default function ConsultationActionsCard({ patientId }: ConsultationActionsCardProps) {
    const { toast } = useToast();
    const router = useRouter();

    const handleCompleteConsultation = () => {
        toast({
            title: "Consultation Completed",
            description: "Patient's status has been updated on the dashboard.",
        });
        
        // Use sessionStorage to mark as completed for this session
        if (typeof window !== 'undefined') {
            const completed = new Set(JSON.parse(sessionStorage.getItem('completedConsultations') || '[]'));
            completed.add(patientId);
            sessionStorage.setItem('completedConsultations', JSON.stringify(Array.from(completed)));
            
            // Notify other tabs that data has changed
            postDataUpdate();
        }

        router.push('/dashboard');
    };
    
  return (
    <Card className="bg-slate-50 border-dashed">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Consultation Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={handleCompleteConsultation} size="lg" key="complete-consultation">
            <CheckCircle className="mr-2 h-4 w-4" /> Complete Consultation
        </Button>
        <Button asChild variant="secondary" key="admit-patient">
          <Link href="#">
            <Hospital className="mr-2 h-4 w-4" /> Admit Patient
          </Link>
        </Button>
        <Button asChild variant="outline" key="pd-nurse-review">
          <Link href={`/dashboard/nurse-checklist?patientId=${patientId}`}>
            <ClipboardCheck className="mr-2 h-4 w-4" /> PD Nurse Review
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
