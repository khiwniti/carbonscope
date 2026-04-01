'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for catastrophic errors that escape all route boundaries.
 * Must provide its own HTML structure (cannot use layout).
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[GlobalError]', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#0a0a0a',
          color: '#fafafa',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239,68,68,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#ef4444"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            Application error
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#a1a1aa',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            A critical error occurred. Please refresh the page to continue.
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <p
              style={{
                fontSize: '0.75rem',
                color: '#ef4444',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(239,68,68,0.1)',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                marginBottom: '1.5rem',
                wordBreak: 'break-all',
              }}
            >
              {error.message}
            </p>
          )}

          {error.digest && (
            <p
              style={{
                fontSize: '0.75rem',
                color: '#71717a',
                marginBottom: '1.5rem',
              }}
            >
              Error ID:{' '}
              <span style={{ fontFamily: 'monospace' }}>{error.digest}</span>
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: 'transparent',
                color: '#fafafa',
                border: '1px solid #27272a',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
