
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, User } from 'lucide-react';

export default function NurseLoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 theme-nurse bg-background">
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
             <div className="flex justify-center items-center gap-3 mb-4">
                <Image src="/pdlogoimage.png" alt="PD Prahari Logo" width={48} height={48} />
                <h1 className="text-3xl font-bold">
                  PD Prahari
                </h1>
            </div>
            <h2 className="text-2xl font-bold text-primary">PD Nurse Login</h2>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access the nurse portal.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="relative">
              <Input id="username" type="text" placeholder="Username / Staff ID" required className="pl-10" />
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="relative">
              <Input id="password" type="password" placeholder="Password" required className="pl-10" />
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button type="submit" className="w-full" asChild>
               <Link href="/nurse-portal">Login</Link>
            </Button>
             <Button variant="outline" className="w-full" asChild>
                <Link href="/">
                    Back to Portal Selection
                </Link>
            </Button>
          </div>
        </div>
      </div>
       <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1200x900.png"
          alt="Nurse helping a patient"
          width="1200"
          height="900"
          data-ai-hint="nurse patient care"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
