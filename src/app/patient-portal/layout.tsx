
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  CircleUser,
  FileText,
  History,
  User,
  Menu,
  LayoutDashboard,
  Users,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getLiveAllPatientData } from '../actions';
import { PatientData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const patientNavLinks = [
  { href: '/patient-portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patient-portal/daily-log', label: 'Daily Log', icon: FileText },
  { href: '/patient-portal/history', label: 'Log History', icon: History },
  { href: '/patient-portal/messages', label: 'My Inbox', icon: MessageSquare },
  { href: '/patient-portal/profile', label: 'My Profile', icon: User },
];

export default function PatientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would get the current logged-in user's ID
    // For this demo, we'll fetch all and use the first one.
    getLiveAllPatientData().then(allPatients => {
      if (allPatients.length > 0) {
        setPatient(allPatients[0]);
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !patient) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card md:block p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <Skeleton className="h-8 w-8 rounded-full md:hidden" />
            <div className="flex-1" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </header>
          <main className="flex-1 p-6">
            <Skeleton className="h-[50vh] w-full" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/patient-portal" className="flex items-center gap-2 font-semibold">
              <div className="p-1 bg-white rounded-full border-2 border-primary shadow-sm">
                <Image src="/pdlogoimage.png" alt="PD Prahari Logo" width={24} height={24} className="rounded-full" />
              </div>
              <span className="">Patient Portal</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {patientNavLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname === href && 'bg-muted text-primary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
             <Button asChild variant="outline" className="w-full">
                <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Link>
              </Button>
           </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/patient-portal"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                   <div className="p-1 bg-white rounded-full border-2 border-primary shadow-sm">
                    <Image src="/pdlogoimage.png" alt="PD Prahari Logo" width={24} height={24} className="rounded-full" />
                  </div>
                  <span className="">Patient Portal</span>
                </Link>
                {patientNavLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                       pathname === href && 'bg-muted text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                ))}
              </nav>
               <div className="mt-auto">
                 <Button asChild variant="outline" className="w-full">
                    <Link href="/">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="w-full flex-1">
             {/* Can add page title here later if needed */}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{patient.firstName} {patient.lastName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/patient-portal/profile">My Profile</Link></DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
