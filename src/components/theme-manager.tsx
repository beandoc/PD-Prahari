
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export function ThemeManager({ children }: { children: ReactNode }) {
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
