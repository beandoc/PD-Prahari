
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, User } from 'lucide-react';
import { KidneyIcon } from '@/components/kidney-icon';

export default function NephrologistLoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-2">
                 <KidneyIcon className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold">
                PD Prahari
                </h1>
            </div>
            <p className="text-xl mt-2 text-muted-foreground">Your Companion in Kidney Care</p>
          </div>
          <Card>
            <CardContent className="p-4">
              <Image
                src="https://placehold.co/400x400.png"
                alt="Kidney care illustration"
                width="400"
                height="400"
                data-ai-hint="kidney care"
                className="rounded-lg"
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="relative flex items-center justify-center py-12 px-4">
        <Image
          src="https://placehold.co/500x500.png"
          alt="Department Logo Watermark"
          width={500}
          height={500}
          data-ai-hint="nephrology department logo"
          className="absolute inset-0 h-full w-full object-contain opacity-10"
        />
        <div className="relative mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Nephrologist Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access the clinical dashboard
            </p>
          </div>
          <div className="grid gap-4">
            <div className="relative">
              <Input id="username" type="text" placeholder="Username" required className="pl-10" />
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="relative">
              <Input id="password" type="password" placeholder="Password" required className="pl-10" />
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button type="submit" className="w-full" asChild>
               <Link href="/dashboard">Login</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/">
                    Back to Portal Selection
                </Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/registration" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
