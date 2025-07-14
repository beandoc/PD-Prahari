
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, BriefcaseMedical, Pill, Inbox, Upload, Video, ShieldAlert, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { allPatientData } from '@/data/mock-data';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
                 <div className="space-y-1"><p className="font-medium">Last Hospital Visit</p><p className="text-muted-foreground">{patient.lastHomeVisitDate ? format(parseISO(patient.lastHomeVisitDate), 'PPP'): 'N/A'}</p></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-yellow-600" /> Peritonitis History</CardTitle>
              <CardDescription>A summary of past PD-related infections.</CardDescription>
            </CardHeader>
            <CardContent>
                {patient.peritonitisEpisodes && patient.peritonitisEpisodes.length > 0 ? (
                     <div className="space-y-4">
                        {patient.peritonitisEpisodes.map((episode) => (
                            <div key={episode.episodeId} className="border p-4 rounded-lg bg-slate-50">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold">Diagnosis Date: {format(parseISO(episode.diagnosisDate), 'PPP')}</p>
                                    <Badge variant={episode.outcome === 'Resolved' ? 'secondary' : 'destructive'} className={episode.outcome === 'Resolved' ? 'bg-green-100 text-green-800' : ''}>
                                        Outcome: {episode.outcome}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p><span className="font-medium">Organism:</span> {episode.organismIsolated}</p>
                                    <p><span className="font-medium">Treatment:</span> {episode.treatmentRegimen}</p>
                                    {episode.resolutionDate && <p><span className="font-medium">Resolution Date:</span> {format(parseISO(episode.resolutionDate), 'PPP')}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No history of peritonitis found.</p>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-orange-500" /> Mechanical Complications</CardTitle>
              <CardDescription>Issues related to the PD catheter and fluid flow.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-semibold text-sm text-red-800">Outflow Problems</p>
                    <p className="text-2xl font-bold text-red-600">{patient.mechanicalComplications?.outflowProblems ?? 0}</p>
                    <p className="text-xs text-muted-foreground">episodes</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-semibold text-sm text-yellow-800">Inflow Problems</p>
                    <p className="text-2xl font-bold text-yellow-600">{patient.mechanicalComplications?.inflowProblems ?? 0}</p>
                    <p className="text-xs text-muted-foreground">episodes</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-sm text-blue-800">UF Failure</p>
                    <p className="text-2xl font-bold text-blue-600">{patient.mechanicalComplications?.ufFailure ?? 0}</p>
                    <p className="text-xs text-muted-foreground">incidents</p>
                </div>
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
              <CardTitle className="flex items-center gap-2"><BriefcaseMedical className="text-cyan-600" /> Hospital Admissions</CardTitle>
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
