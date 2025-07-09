
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, BriefcaseMedical, Pill, Inbox, Upload, Video } from 'lucide-react';
import { allPatientData } from '@/data/mock-data';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PatientProfilePage() {
  const patient = allPatientData[0]; // Using first patient for demonstration

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-muted-foreground mt-1">Your personal health summary and quick actions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column for main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="text-primary" /> Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1"><p className="font-medium">Name</p><p className="text-muted-foreground">{patient.firstName} {patient.lastName}</p></div>
                <div className="space-y-1"><p className="font-medium">Nephro ID</p><p className="text-muted-foreground">{patient.nephroId}</p></div>
                <div className="space-y-1"><p className="font-medium">Date of Birth</p><p className="text-muted-foreground">{patient.dateOfBirth ? format(parseISO(patient.dateOfBirth), 'PPP') : 'N/A'}</p></div>
                <div className="space-y-1"><p className="font-medium">Gender</p><p className="text-muted-foreground">{patient.gender}</p></div>
                <div className="space-y-1"><p className="font-medium">Primary Physician</p><p className="text-muted-foreground">{patient.physician}</p></div>
                <div className="space-y-1"><p className="font-medium">PD Start Date</p><p className="text-muted-foreground">{patient.pdStartDate ? format(parseISO(patient.pdStartDate), 'PPP'): 'N/A'}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Pill className="text-red-500" /> Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Medication</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Frequency</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patient.medications.map((med) => (
                        <TableRow key={med.medicationId}>
                            <TableCell className="font-medium">{med.medicationName}</TableCell>
                            <TableCell>{med.dosage}</TableCell>
                            <TableCell>{med.frequency}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BriefcaseMedical className="text-orange-500" /> Hospital Admissions</CardTitle>
            </CardHeader>
            <CardContent>
                {patient.admissions && patient.admissions.length > 0 ? (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Admission Date</TableHead>
                                <TableHead>Discharge Date</TableHead>
                                <TableHead>Reason</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patient.admissions.map((admission) => (
                            <TableRow key={admission.admissionId}>
                                <TableCell>{format(parseISO(admission.admissionDate), 'PPP')}</TableCell>
                                <TableCell>{format(parseISO(admission.dischargeDate), 'PPP')}</TableCell>
                                <TableCell>{admission.reason}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No admission history found.</p>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Right column for contacts and actions */}
        <div className="space-y-6">
          {patient.contactInfo && (
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-blue-800"><Phone /> Clinic Contacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div>
                        <p className="font-semibold text-blue-700">{patient.contactInfo.clinicName}</p>
                        <p className="text-blue-600">{patient.contactInfo.clinicPhone}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-blue-700">PD Coordinator: {patient.contactInfo.coordinatorName}</p>
                        <p className="text-blue-600">{patient.contactInfo.coordinatorPhone}</p>
                    </div>
                </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/patient-portal/daily-log#uploads">
                        <Upload className="mr-2 h-4 w-4" /> Upload Reports/Images
                    </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/dashboard/telehealth">
                        <Video className="mr-2 h-4 w-4" /> Start Video Call
                    </Link>
                </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Inbox /> My Inbox</CardTitle>
                <CardDescription>Messages from your care team.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm text-center py-4">You have no new messages.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
