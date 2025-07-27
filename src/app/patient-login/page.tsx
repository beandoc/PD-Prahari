
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, User, HeartPulse, Loader2 } from 'lucide-react';
import { getPatientByNephroId } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function PatientLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [nephroId, setNephroId] = useState('');
  const [password, setPassword] = useState(''); // Using password as a stand-in for DOB
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!nephroId || !password) {
      setError('Please enter both your Patient ID and your Date of Birth.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const patient = await getPatientByNephroId(nephroId);

      // In a real app, you'd use a secure password. Here, we're checking against DOB.
      // The password input should ideally be a date picker.
      if (patient && patient.dateOfBirth) {
        // This is an insecure comparison and only for demonstration.
        // A real app must use a proper authentication system.
        const formattedDob = format(new Date(patient.dateOfBirth), 'yyyy-MM-dd');
        if (password === formattedDob) {
           toast({
            title: "Login Successful",
            description: `Welcome back, ${patient.firstName}!`,
          });
          // In a real app, you'd set a session cookie here.
          // For the demo, we'll store the ID in session storage.
          sessionStorage.setItem('loggedInPatientId', patient.patientId);
          router.push('/patient-portal');
        } else {
           setError('Invalid credentials. Please check your ID and Date of Birth.');
        }
      } else {
        setError('Invalid credentials. Patient not found.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 theme-patient bg-background">
       <div className="relative flex items-center justify-center py-12 px-4">
        <Image
          src="https://placehold.co/500x500.png"
          alt="Patient illustration watermark"
          width={500}
          height={500}
          data-ai-hint="patient health abstract"
          className="absolute inset-0 h-full w-full object-contain opacity-10"
        />
        <div className="relative mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Patient Portal Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your ID and Date of Birth to access your health dashboard.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="relative">
              <Input 
                id="patientId" 
                type="text" 
                placeholder="Patient ID / UHID" 
                value={nephroId}
                onChange={(e) => setNephroId(e.target.value)}
                required 
                className="pl-10" 
              />
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="relative">
              <Input 
                id="dob" 
                type="date"
                placeholder="Date of Birth (YYYY-MM-DD)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="pl-10" 
              />
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
            </Button>
             <Button variant="outline" className="w-full" asChild>
                <Link href="/">
                    Back to Portal Selection
                </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-2">
                 <HeartPulse className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold">
                My Health Portal
                </h1>
            </div>
            <p className="text-xl mt-2 text-muted-foreground">Your Health, Your Data</p>
          </div>
          <Card>
            <CardContent className="p-4">
              <Image
                src="https://placehold.co/400x400.png"
                alt="Patient empowerment illustration"
                width="400"
                height="400"
                data-ai-hint="patient health empowerment"
                className="rounded-lg"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
