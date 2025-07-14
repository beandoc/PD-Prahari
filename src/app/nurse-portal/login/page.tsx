
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, User, UserRoundCog } from 'lucide-react';
import { KidneyIcon } from '@/components/kidney-icon';

export default function NurseLoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="relative flex items-center justify-center py-12 px-4">
        <Image
          src="https://placehold.co/500x500.png"
          alt="Nurse illustration watermark"
          width={500}
          height={500}
          data-ai-hint="nurse care abstract"
          className="absolute inset-0 h-full w-full object-contain opacity-10"
        />
        <div className="relative mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">PD Nurse Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access the nurse portal
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
       <div className="hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-2">
                 <UserRoundCog className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold">
                Nurse Portal
                </h1>
            </div>
            <p className="text-xl mt-2 text-muted-foreground">Dedicated Tools for Patient Care</p>
          </div>
          <Card>
            <CardContent className="p-4">
              <Image
                src="https://placehold.co/400x400.png"
                alt="Nurse helping patient illustration"
                width="400"
                height="400"
                data-ai-hint="nurse helping patient"
                className="rounded-lg"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
