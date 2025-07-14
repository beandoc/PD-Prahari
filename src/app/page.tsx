
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, HeartPulse, UserRoundCog } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="max-w-4xl w-full">
            <header className="text-center mb-12">
                <div className="flex justify-center items-center gap-3 mb-2">
                    <Image src="/pdlogoimage.png" alt="PD Prahari Logo" width={64} height={64} />
                    <h1 className="text-5xl font-bold text-gray-800">
                        PD Prahari
                    </h1>
                </div>
                <p className="text-xl mt-2 text-muted-foreground">Your Companion in Kidney Care</p>
                <p className="text-lg mt-8 text-gray-600">Please select your portal to login.</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="p-4 bg-blue-100 rounded-full mb-4">
                           <Stethoscope className="h-10 w-10 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Nephrologist</h2>
                        <p className="text-muted-foreground mb-6 h-12">Access the main clinical dashboard to manage all patients.</p>
                        <Button asChild className="w-full">
                            <Link href="/login/nephrologist">Clinician Login</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="p-4 bg-green-100 rounded-full mb-4">
                           <UserRoundCog className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">PD Nurse</h2>
                        <p className="text-muted-foreground mb-6 h-12">Access checklists and patient reference sheets.</p>
                        <Button asChild className="w-full" variant="secondary">
                           <Link href="/nurse-portal/login">Nurse Login</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="p-4 bg-red-100 rounded-full mb-4">
                           <HeartPulse className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Patient</h2>
                        <p className="text-muted-foreground mb-6 h-12">Log your daily exchanges and view your health summary.</p>
                        <Button asChild className="w-full" variant="secondary">
                            <Link href="/patient-portal/login">Patient Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    </div>
  );
}
