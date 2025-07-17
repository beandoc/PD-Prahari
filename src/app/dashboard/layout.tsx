
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  BarChart3,
  CircleUser,
  Droplets,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Settings,
  Menu,
  Video,
  BookOpen,
  ClipboardCheck,
  HeartPulse,
  UserPlus,
  Boxes,
  Users,
  UserCog,
  FlaskConical,
  MessageSquare,
  ChevronLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';


const doctorNavLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/registration', label: 'Register Patient', icon: UserPlus },
  { href: '/dashboard/pd-logs', label: 'PD Logs', icon: Droplets },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/sharesource', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Boxes },
  { href: '/dashboard/telehealth', label: 'Telehealth', icon: Video },
  { href: '/dashboard/nurse-dashboard', label: 'PD Nurse Portal', icon: Users },
  { href: '/patient-portal', label: 'Patient Portal (Test)', icon: HeartPulse },
];

const nurseNavLinks = [
  { href: '/dashboard/nurse-dashboard', label: 'PD Nurse Dashboard', icon: LayoutGrid },
  { href: '/dashboard/nurse-checklist', label: 'PD Nurse Checklist', icon: ClipboardCheck },
  { href: '/dashboard/pet-test', label: 'PET Test', icon: FlaskConical },
  { href: '/dashboard/pd-logs', label: 'Patient PD Logs', icon: Droplets },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/telehealth', label: 'Telehealth', icon: Video },
  { href: '/dashboard/update-records', label: 'Update Records', icon: UserCog },
  { href: '/registration', label: 'Register Patient', icon: UserPlus },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isNurseView, setIsNurseView] = useState(false);

  useEffect(() => {
    // Simplified logic to determine the view based on the current path.
    // This removes reliance on sessionStorage and referrer for more stable navigation.
    const isNursePath = pathname.startsWith('/dashboard/nurse-') ||
                        pathname === '/dashboard/pet-test' ||
                        pathname === '/dashboard/update-records';

    setIsNurseView(isNursePath);
  }, [pathname]);

  const navLinks = isNurseView ? nurseNavLinks : doctorNavLinks;
  const isDashboardPage = pathname === '/dashboard' || pathname === '/dashboard/nurse-dashboard';
  const backLinkHref = isNurseView ? '/dashboard/nurse-dashboard' : '/dashboard';

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
               <div className="p-1 bg-white rounded-full border-2 border-primary shadow-sm">
                <Image src="/pdlogoimage.png" alt="PD Prahari Logo" width={24} height={24} className="rounded-full" />
              </div>
              <span className="">PD Prahari</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map(({ href, label, icon: Icon }) => (
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
          <div className="mt-auto p-4">
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <LifeBuoy className="h-4 w-4" />
                  Support
                </Link>
             </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
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
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                   <div className="p-1 bg-white rounded-full border-2 border-primary shadow-sm">
                    <Image src="/pdlogoimage.png" alt="PD Prahari Logo" width={24} height={24} className="rounded-full" />
                  </div>
                  <span className="">PD Prahari</span>
                </Link>
                {navLinks.map(({ href, label, icon: Icon }) => (
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
                 <nav className="grid gap-2 text-lg font-medium">
                    <Link
                      href="#"
                      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                    <Link
                      href="#"
                      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                      <LifeBuoy className="h-5 w-5" />
                      Support
                    </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             {!isDashboardPage && (
              <Button asChild variant="outline" size="sm">
                <Link href={backLinkHref}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Link>
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
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
