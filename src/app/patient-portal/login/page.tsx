
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is now deprecated and redirects to the new login page.
export default function DeprecatedPatientLogin() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/patient-login');
  }, [router]);

  return (
     <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-lg font-semibold">Redirecting...</p>
      </div>
    </div>
  );
}
