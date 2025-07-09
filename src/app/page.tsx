import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">
              PD <span className="text-accent">PRAHARI</span>
            </h1>
            <p className="text-xl mt-2 text-primary">Securing Care</p>
          </div>
          <Card>
            <CardContent className="p-4">
              <Image
                src="https://placehold.co/400x400.png"
                alt="PD Prahari app icon"
                width="400"
                height="400"
                data-ai-hint="kidney care"
                className="rounded-lg"
              />
            </CardContent>
          </Card>
          <div className="text-center mt-8">
            <p className="text-xl font-medium text-destructive">
              Your Companion in Kidney Care
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="text-right">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Access your account to view dashboard.
            </p>
          </div>
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Login with your credentials</h1>
            <p className="text-balance text-muted-foreground">
              Explore patient profiles and treatment data.
            </p>
          </div>
          <div className="grid gap-4">
            <Input id="fullname" type="text" placeholder="Your full name" required />
            <Input id="username" type="text" placeholder="Your unique username" required />
            <div className="relative">
              <Input id="password" type="password" placeholder="Password" required className="pr-10" />
              <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="relative">
              <Input id="repeat-password" type="password" placeholder="Repeat password" required className="pr-10" />
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or connect as
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard">Guest</Link>
              </Button>
              <Button variant="outline" className="w-full">
                Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
