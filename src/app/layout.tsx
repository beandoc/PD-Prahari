
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const fontInter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'DialysisCare',
  description: 'Your Guardian in Peritoneal Dialysis',
};

function ThemeManager({ children }: { children: ReactNode }) {
  'use client';
  const pathname = usePathname();

  useEffect(() => {
    let themeClass = 'theme-doctor'; // Default theme
    
    if (pathname.startsWith('/patient-portal')) {
      themeClass = 'theme-patient';
    } else if (
      pathname.startsWith('/dashboard/nurse-') ||
      pathname === '/dashboard/pet-test' ||
      pathname === '/dashboard/update-records'
    ) {
      themeClass = 'theme-nurse';
    }
    
    document.body.classList.remove('theme-doctor', 'theme-nurse', 'theme-patient');
    document.body.classList.add(themeClass);

  }, [pathname]);

  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", fontInter.variable)}>
          <ThemeManager>
            {children}
          </ThemeManager>
        <Toaster />
      </body>
    </html>
  );
}
