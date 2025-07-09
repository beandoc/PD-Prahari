
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User } from 'lucide-react';
import { allPatientData } from '@/data/mock-data';

export default function PatientProfilePage() {
  const patient = allPatientData[0]; // Using first patient for demonstration

  return (
    <div className="p-4 sm:p-6 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" />
                    My Profile
                </CardTitle>
                <CardDescription>
                    This is your personal information. Please contact the clinic if any details are incorrect.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                    <p className="font-medium">Name</p>
                    <p className="text-muted-foreground">{patient.firstName} {patient.lastName}</p>
                </div>
                <div className="space-y-1">
                    <p className="font-medium">Nephro ID</p>
                    <p className="text-muted-foreground">{patient.nephroId}</p>
                </div>
                 <div className="space-y-1">
                    <p className="font-medium">Date of Birth</p>
                    <p className="text-muted-foreground">{patient.dateOfBirth}</p>
                </div>
                 <div className="space-y-1">
                    <p className="font-medium">Gender</p>
                    <p className="text-muted-foreground">{patient.gender}</p>
                </div>
                 <div className="space-y-1">
                    <p className="font-medium">Primary Physician</p>
                    <p className="text-muted-foreground">{patient.physician}</p>
                </div>
                 <div className="space-y-1">
                    <p className="font-medium">PD Start Date</p>
                    <p className="text-muted-foreground">{patient.pdStartDate}</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
