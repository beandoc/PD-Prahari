
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

// This new component will manage the theme based on the current path.
function ThemeManager({ children }: { children: ReactNode }) {
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
    
    // Clear existing theme classes and add the new one
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
      <head>
        <title>PD Prahari</title>
        <meta name="description" content="Your Guardian in Peritoneal Dialysis" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className={cn("font-body antialiased")}>
          <ThemeManager>
            {children}
          </ThemeManager>
        <Toaster />
      </body>
    </html>
  );
}
