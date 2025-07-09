
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component redirects from the portal root to the daily log page.
export default function PatientPortalRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/patient-portal/daily-log');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <p className="text-muted-foreground">Loading your portal...</p>
    </div>
  );
}
