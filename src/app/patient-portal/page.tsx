
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, History, User, ArrowRight } from 'lucide-react';
import { allPatientData } from '@/data/mock-data';

export default function PatientPortalDashboard() {
  const patient = allPatientData[0]; // Using first patient for demonstration

  // Simple logic to check if logs have been submitted today.
  // In a real app, this would be more robust.
  const hasLoggedToday = patient.pdEvents.some(
    event => new Date(event.exchangeDateTime).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {patient.firstName}!</h1>
        {hasLoggedToday ? (
          <p className="text-lg text-green-600">You've completed your log for today. Great job!</p>
        ) : (
          <p className="text-lg text-muted-foreground">It's time to log your daily health data.</p>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="text-blue-500" /> Daily Log</CardTitle>
            <CardDescription>Enter your daily vitals, PD exchanges, and symptoms here.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
            <Button asChild>
              <Link href="/patient-portal/daily-log">
                Go to Daily Log <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="text-purple-500" /> Log History</CardTitle>
            <CardDescription>Review your past data entries and track your progress.</CardDescription>
          </CardHeader>
           <CardContent className="flex-grow flex flex-col justify-end">
             <Button asChild variant="secondary">
              <Link href="/patient-portal/history">
                View History <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="text-orange-500" /> My Profile</CardTitle>
            <CardDescription>View your personal and clinical information.</CardDescription>
          </CardHeader>
           <CardContent className="flex-grow flex flex-col justify-end">
             <Button asChild variant="secondary">
              <Link href="/patient-portal/profile">
                View Profile <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
