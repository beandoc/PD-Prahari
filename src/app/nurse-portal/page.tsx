
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component acts as a simple entry point for the nurse.
// It immediately redirects them to their primary workspace, the nurse checklist,
// which is located within the main clinician dashboard. This keeps the nurse's workflow
// integrated while providing a separate login.
export default function NursePortalRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main tool for nurses
    router.replace('/dashboard/nurse-checklist');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-lg font-semibold">Redirecting to Nurse Portal...</p>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    </div>
  );
}
