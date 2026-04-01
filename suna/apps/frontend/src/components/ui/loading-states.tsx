'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CarbonScopeLoader } from './carbonscope-loader';
import { Skeleton } from './skeleton';
import { Card, CardHeader, CardContent } from './card';

/**
 * Loading States Component Library
 * Comprehensive loading indicators with skeleton screens and spinners
 */

// ============================================================================
// Spinner Variants
// ============================================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  const sizeMap = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
    xl: 'xlarge',
  } as const;

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} role="status" aria-live="polite">
      <CarbonScopeLoader size={sizeMap[size]} />
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse" aria-label={label}>
          {label}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// ============================================================================
// Full Page Loading
// ============================================================================

interface FullPageLoadingProps {
  message?: string;
}

export function FullPageLoading({ message = 'Loading...' }: FullPageLoadingProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4">
        <CarbonScopeLoader size="large" />
        <p className="text-lg font-medium text-foreground animate-pulse">{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton Screen Templates
// ============================================================================

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading table data">
      <div className="flex gap-4 pb-3 border-b border-border">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {[1, 2, 3, 4].map((j) => (
            <Skeleton key={j} className="h-10 flex-1" />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading table data</span>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <span className="sr-only">Loading dashboard</span>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading form">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <span className="sr-only">Loading form</span>
    </div>
  );
}

// ============================================================================
// Progressive Loading Indicator
// ============================================================================

interface ProgressLoadingProps {
  progress: number;
  label?: string;
  className?: string;
}

export function ProgressLoading({ progress, label, className }: ProgressLoadingProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('space-y-2', className)} role="progressbar" aria-valuenow={clampedProgress} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label || 'Loading...'}</span>
        <span className="font-medium text-foreground">{clampedProgress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
          aria-label={`${clampedProgress}% complete`}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Inline Loading States
// ============================================================================

interface InlineLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoading({ text = 'Loading...', size = 'md', className }: InlineLoadingProps) {
  const sizeMap = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
  } as const;

  return (
    <div className={cn('inline-flex items-center gap-2', className)} role="status" aria-live="polite">
      <CarbonScopeLoader size={sizeMap[size]} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

// ============================================================================
// Button Loading State
// ============================================================================

interface ButtonLoadingProps {
  children: React.ReactNode;
  isLoading: boolean;
  loadingText?: string;
  className?: string;
}

export function ButtonLoading({ children, isLoading, loadingText, className }: ButtonLoadingProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {isLoading && <CarbonScopeLoader size="small" />}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </span>
  );
}

// ============================================================================
// List Loading States
// ============================================================================

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading list">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
      <span className="sr-only">Loading list items</span>
    </div>
  );
}

export function GridSkeleton({ items = 8, columns = 4 }: { items?: number; columns?: number }) {
  return (
    <div
      className={cn('grid gap-4', {
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4': columns === 4,
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3,
        'grid-cols-1 sm:grid-cols-2': columns === 2,
        'grid-cols-1': columns === 1,
      })}
      role="status"
      aria-label="Loading grid items"
    >
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading grid items</span>
    </div>
  );
}

// ============================================================================
// Content Shimmer Effect
// ============================================================================

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export function Shimmer({ className, children }: ShimmerProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {children}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

// ============================================================================
// Section Loading
// ============================================================================

interface SectionLoadingProps {
  title?: string;
  description?: string;
  className?: string;
}

export function SectionLoading({ title, description, className }: SectionLoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)} role="status" aria-live="polite">
      <CarbonScopeLoader size="large" className="mb-4" />
      {title && <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground max-w-md">{description}</p>}
      <span className="sr-only">{title || 'Loading section'}</span>
    </div>
  );
}
