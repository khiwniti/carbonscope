'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw, Home, ChevronLeft, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';

/**
 * Error States Component Library
 * User-friendly error messages with recovery actions
 * WCAG 2.1 AA compliant with proper color contrast and ARIA labels
 */

// ============================================================================
// Error Message Types
// ============================================================================

type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorStateProps {
  title: string;
  message: string;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
  showGoBack?: boolean;
  showGoHome?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

// ============================================================================
// Main Error State Component
// ============================================================================

export function ErrorState({
  title,
  message,
  severity = 'error',
  onRetry,
  onGoBack,
  onGoHome,
  retryLabel = 'Try again',
  showRetry = true,
  showGoBack = false,
  showGoHome = false,
  className,
  icon,
}: ErrorStateProps) {
  const severityConfig = {
    error: {
      icon: <XCircle className="h-12 w-12" />,
      bgColor: 'bg-destructive/10 dark:bg-destructive/20',
      textColor: 'text-destructive',
      iconColor: 'text-destructive',
    },
    warning: {
      icon: <AlertTriangle className="h-12 w-12" />,
      bgColor: 'bg-amber-100 dark:bg-amber-900/20',
      textColor: 'text-amber-900 dark:text-amber-400',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    info: {
      icon: <Info className="h-12 w-12" />,
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-900 dark:text-blue-400',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const config = severityConfig[severity];

  return (
    <div
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={cn('rounded-full p-4 mb-6', config.bgColor)}>
        <div className={config.iconColor}>{icon || config.icon}</div>
      </div>

      <h2 className={cn('text-2xl font-semibold mb-3', config.textColor)}>{title}</h2>
      <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">{message}</p>

      <div className="flex flex-wrap gap-3 justify-center">
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="default" aria-label={retryLabel}>
            <RefreshCw className="h-4 w-4" />
            {retryLabel}
          </Button>
        )}
        {showGoBack && onGoBack && (
          <Button onClick={onGoBack} variant="outline" aria-label="Go back to previous page">
            <ChevronLeft className="h-4 w-4" />
            Go back
          </Button>
        )}
        {showGoHome && onGoHome && (
          <Button onClick={onGoHome} variant="outline" aria-label="Go to home page">
            <Home className="h-4 w-4" />
            Go home
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Inline Error Alert
// ============================================================================

interface InlineErrorProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  severity?: ErrorSeverity;
  className?: string;
}

export function InlineError({ message, onDismiss, onRetry, severity = 'error', className }: InlineErrorProps) {
  const variantMap = {
    error: 'destructive' as const,
    warning: 'warning' as const,
    info: 'default' as const,
  };

  const iconMap = {
    error: <AlertCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  return (
    <Alert variant={variantMap[severity]} className={className} role="alert" aria-live="polite">
      {iconMap[severity]}
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <div className="flex gap-2 ml-4">
          {onRetry && (
            <Button size="sm" variant="ghost" onClick={onRetry} aria-label="Retry action">
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss} aria-label="Dismiss error message">
              ×
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// ============================================================================
// Form Field Error
// ============================================================================

interface FieldErrorProps {
  message: string;
  className?: string;
}

export function FieldError({ message, className }: FieldErrorProps) {
  return (
    <p className={cn('text-sm text-destructive mt-1 flex items-center gap-1', className)} role="alert" aria-live="polite">
      <AlertCircle className="h-3 w-3 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

// ============================================================================
// Error Card
// ============================================================================

interface ErrorCardProps {
  title: string;
  description: string;
  error?: Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function ErrorCard({ title, description, error, onRetry, onDismiss, showDetails = false, className }: ErrorCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card className={className} role="alert" aria-live="assertive">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-destructive/10 p-2 dark:bg-destructive/20">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-destructive">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>

      {showDetails && error && (
        <CardContent>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            aria-expanded={expanded}
            aria-controls="error-details"
          >
            {expanded ? 'Hide' : 'Show'} technical details
          </button>
          {expanded && (
            <div
              id="error-details"
              className="mt-3 p-3 bg-muted rounded-lg font-mono text-xs overflow-auto max-h-40"
              role="region"
              aria-label="Error technical details"
            >
              <p className="text-destructive font-semibold mb-2">{error.name}</p>
              <p className="text-foreground whitespace-pre-wrap">{error.message}</p>
              {error.stack && <pre className="mt-2 text-muted-foreground text-[10px]">{error.stack}</pre>}
            </div>
          )}
        </CardContent>
      )}

      <CardFooter className="flex gap-2 justify-end">
        {onDismiss && (
          <Button variant="outline" size="sm" onClick={onDismiss} aria-label="Dismiss error">
            Dismiss
          </Button>
        )}
        {onRetry && (
          <Button variant="default" size="sm" onClick={onRetry} aria-label="Retry failed action">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// Network Error
// ============================================================================

export function NetworkError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorState
      title="Connection Lost"
      message="We're having trouble connecting to the server. Please check your internet connection and try again."
      severity="warning"
      onRetry={onRetry}
      retryLabel="Reconnect"
      icon={<AlertTriangle className="h-12 w-12" />}
      className={className}
    />
  );
}

// ============================================================================
// 404 Not Found
// ============================================================================

export function NotFoundError({ onGoHome, className }: { onGoHome?: () => void; className?: string }) {
  return (
    <ErrorState
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved. Let's get you back on track."
      severity="info"
      onGoHome={onGoHome}
      showGoHome={true}
      showRetry={false}
      className={className}
    />
  );
}

// ============================================================================
// Permission Denied
// ============================================================================

export function PermissionDeniedError({ onGoBack, onGoHome, className }: { onGoBack?: () => void; onGoHome?: () => void; className?: string }) {
  return (
    <ErrorState
      title="Access Denied"
      message="You don't have permission to view this page. Contact your administrator if you believe this is an error."
      severity="warning"
      onGoBack={onGoBack}
      onGoHome={onGoHome}
      showGoBack={true}
      showGoHome={true}
      showRetry={false}
      className={className}
    />
  );
}

// ============================================================================
// Generic Error Boundary Fallback
// ============================================================================

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  className?: string;
}

export function ErrorBoundaryFallback({ error, resetErrorBoundary, className }: ErrorBoundaryFallbackProps) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center p-4', className)}>
      <ErrorCard
        title="Something went wrong"
        description="An unexpected error occurred. We've logged this issue and will look into it."
        error={error}
        onRetry={resetErrorBoundary}
        showDetails={process.env.NODE_ENV === 'development'}
        className="max-w-2xl w-full"
      />
    </div>
  );
}

// ============================================================================
// Validation Error List
// ============================================================================

interface ValidationErrorsProps {
  errors: string[];
  onDismiss?: () => void;
  className?: string;
}

export function ValidationErrors({ errors, onDismiss, className }: ValidationErrorsProps) {
  if (errors.length === 0) return null;

  return (
    <Alert variant="destructive" className={className} role="alert" aria-live="polite">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Please fix the following errors:</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 mt-2" aria-label="Validation errors">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
        {onDismiss && (
          <Button size="sm" variant="ghost" onClick={onDismiss} className="mt-3" aria-label="Dismiss validation errors">
            Dismiss
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
