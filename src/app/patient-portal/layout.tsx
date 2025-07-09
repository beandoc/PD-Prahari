
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Stethoscope, CircleUser, LogOut, FileText, History, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


const patientNavLinks = [
  { href: '/patient-portal/daily-log', label: 'Daily Log', icon: FileText },
  { href: '/patient-portal/history', label: 'Log History', icon: History },
  { href: '/patient-portal/profile', label: 'My Profile', icon: User },
];

export default function PatientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
   const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="hidden md:inline-block">DialysisCare Patient Portal</span>
        </div>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-10">
          {patientNavLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground',
                pathname === href && 'text-foreground font-semibold'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
             <p className="text-sm text-muted-foreground text-right">Welcome, Patient!</p>
          </div>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
           <Button asChild variant="outline">
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4"/>
                Exit Portal
              </Link>
           </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col bg-slate-50">
        {children}
      </main>
    </div>
  );
}
