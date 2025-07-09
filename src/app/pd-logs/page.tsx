'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component redirects from the old, orphaned URL to the correct page within the dashboard layout.
export default function OldPdLogsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/pd-logs');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting to the correct page...</p>
    </div>
  );
}
