import type { PatientData } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PatientHeaderProps {
  patient: PatientData;
}

export default function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <header className="bg-card border-b p-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-end gap-4">
            <h1 className="text-3xl font-bold text-foreground">
                {patient.firstName} {patient.lastName}
            </h1>
             <p className="text-lg text-muted-foreground">
                ({patient.nephroId})
             </p>
          </div>
          <Card className="shadow-none border-dashed">
            <CardContent className="flex items-center gap-x-6 gap-y-2 flex-wrap p-3">
              <div>
                 <div className="text-xs text-muted-foreground">Age</div>
                 <div className="font-semibold">{patient.age} yrs</div>
              </div>
               <div>
                 <div className="text-xs text-muted-foreground">Gender</div>
                 <div className="font-semibold">{patient.gender || 'N/A'}</div>
              </div>
              <div>
                 <div className="text-xs text-muted-foreground">Status</div>
                 <div className="font-semibold"><Badge variant={patient.currentStatus === 'Active PD' ? 'secondary' : 'outline'} className="text-sm">{patient.currentStatus}</Badge></div>
              </div>
               <div>
                 <div className="text-xs text-muted-foreground">Primary Nephrologist</div>
                 <div className="font-semibold">{patient.physician || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>
      </div>
    </header>
  );
}
