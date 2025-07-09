
import Link from 'next/link';
import { Stethoscope, CircleUser, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PatientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/patient-portal/daily-log"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="">DialysisCare Portal</span>
          </Link>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
             <p className="text-sm text-muted-foreground">Welcome, Patient!</p>
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
      <main className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
