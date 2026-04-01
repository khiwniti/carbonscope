'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Dashboard route error boundary.
 * Displayed when any page in the (dashboard) route group throws an error.
 */
export default function DashboardError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Dashboard Error]', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <svg
          className="h-8 w-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <div className="max-w-md space-y-2 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred while loading this page. Your data is safe.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <p className="mt-2 rounded-md bg-muted p-2 text-xs font-mono text-destructive break-all">
            {error.message}
          </p>
        )}
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="default" onClick={reset} size="sm">
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
          size="sm"
        >
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
