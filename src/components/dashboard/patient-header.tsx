import type { Patient } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

interface PatientHeaderProps {
  patient: Patient;
}

const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export default function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <header className="z-10 border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">ShareSource</h1>
          </div>
          <Card className="hidden sm:block">
            <CardContent className="flex items-center gap-4 p-3">
              <div className="font-medium">
                {patient.firstName} {patient.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {calculateAge(patient.dateOfBirth)} y/o {patient.gender}
              </div>
              <div className="text-sm text-muted-foreground">
                Status: <span className="font-semibold text-accent-foreground">{patient.currentStatus}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </header>
  );
}
