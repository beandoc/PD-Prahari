
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, User, HeartPulse } from 'lucide-react';
import { KidneyIcon } from '@/components/kidney-icon';

export default function PatientLoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 bg-background">
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
              Enter your details to access your health dashboard
            </p>
          </div>
          <div className="grid gap-4">
            <div className="relative">
              <Input id="patientId" type="text" placeholder="Patient ID / UHID" required className="pl-10" />
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="relative">
              <Input id="dob" type="password" placeholder="Password / Date of Birth" required className="pl-10" />
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button type="submit" className="w-full" asChild>
               <Link href="/patient-portal">Login</Link>
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
