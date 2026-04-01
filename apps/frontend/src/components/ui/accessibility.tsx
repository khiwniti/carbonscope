'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Accessibility Utilities
 * WCAG 2.1 AA compliant components and utilities
 */

// ============================================================================
// Skip to Content Link
// ============================================================================

interface SkipToContentProps {
  contentId?: string;
  className?: string;
}

export function SkipToContent({ contentId = 'main-content', className }: SkipToContentProps) {
  return (
    <a
      href={`#${contentId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50',
        'px-4 py-2 rounded-2xl bg-primary text-primary-foreground',
        'focus:ring-4 focus:ring-ring/50 focus:outline-none',
        'font-medium text-sm transition-all',
        className
      )}
    >
      Skip to main content
    </a>
  );
}

// ============================================================================
// Screen Reader Only Text
// ============================================================================

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function ScreenReaderOnly({ children, className }: ScreenReaderOnlyProps) {
  return <span className={cn('sr-only', className)}>{children}</span>;
}

// ============================================================================
// Visually Hidden (but accessible)
// ============================================================================

interface VisuallyHiddenProps {
  children: React.ReactNode;
  focusable?: boolean;
  className?: string;
}

export function VisuallyHidden({ children, focusable = false, className }: VisuallyHiddenProps) {
  return (
    <span
      className={cn('sr-only', focusable && 'focus:not-sr-only', className)}
      aria-live="polite"
    >
      {children}
    </span>
  );
}

// ============================================================================
// Focus Trap for Modals
// ============================================================================

interface FocusTrapProps {
  children: React.ReactNode;
  enabled?: boolean;
  onEscape?: () => void;
}

export function FocusTrap({ children, enabled = true, onEscape }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onEscape]);

  return <div ref={containerRef}>{children}</div>;
}

// ============================================================================
// Keyboard Navigation Hint
// ============================================================================

interface KeyboardHintProps {
  keys: string[];
  description: string;
  className?: string;
}

export function KeyboardHint({ keys, description, className }: KeyboardHintProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 text-xs text-muted-foreground', className)}>
      <span className="sr-only">Keyboard shortcut: </span>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="px-2 py-1 rounded bg-muted border border-border font-mono text-xs">
            {key}
          </kbd>
          {index < keys.length - 1 && <span>+</span>}
        </React.Fragment>
      ))}
      <span className="ml-1">{description}</span>
    </div>
  );
}

// ============================================================================
// Live Region for Dynamic Content
// ============================================================================

interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions',
  className,
}: LiveRegionProps) {
  return (
    <div
      className={className}
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Focus Indicator Enhancement
// ============================================================================

interface FocusIndicatorProps {
  children: React.ReactNode;
  className?: string;
  offset?: number;
}

export function FocusIndicator({ children, className, offset = 2 }: FocusIndicatorProps) {
  return (
    <div
      className={cn(
        'focus-within:ring-4 focus-within:ring-ring/50 focus-within:ring-offset-background',
        `focus-within:ring-offset-${offset}`,
        'rounded-2xl transition-all',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Accessible Icon Button
// ============================================================================

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  showLabel?: boolean;
  className?: string;
}

export function IconButton({
  icon,
  label,
  showLabel = false,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl p-2',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50',
        'transition-all disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
      aria-label={label}
      {...props}
    >
      {icon}
      {showLabel ? (
        <span className="text-sm font-medium">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </button>
  );
}

// ============================================================================
// High Contrast Mode Detection
// ============================================================================

export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isHighContrast;
}

// ============================================================================
// Reduced Motion Detection
// ============================================================================

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// ============================================================================
// Accessible Form Field
// ============================================================================

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground flex items-center gap-1"
      >
        {label}
        {required && (
          <span className="text-destructive" aria-label="required">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}

      <div
        aria-describedby={cn(
          hint && hintId,
          error && errorId
        )}
        aria-invalid={!!error}
      >
        {children}
      </div>

      {error && (
        <p
          id={errorId}
          className="text-sm text-destructive flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <span className="sr-only">Error:</span>
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Landmark Regions
// ============================================================================

export const Landmarks = {
  Main: ({ children, id = 'main-content', className }: { children: React.ReactNode; id?: string; className?: string }) => (
    <main id={id} className={className} role="main" tabIndex={-1}>
      {children}
    </main>
  ),

  Nav: ({ children, label, className }: { children: React.ReactNode; label: string; className?: string }) => (
    <nav className={className} role="navigation" aria-label={label}>
      {children}
    </nav>
  ),

  Header: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <header className={className} role="banner">
      {children}
    </header>
  ),

  Footer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <footer className={className} role="contentinfo">
      {children}
    </footer>
  ),

  Aside: ({ children, label, className }: { children: React.ReactNode; label?: string; className?: string }) => (
    <aside className={className} role="complementary" aria-label={label}>
      {children}
    </aside>
  ),
};

// ============================================================================
// Progress Announcement
// ============================================================================

interface ProgressAnnouncementProps {
  current: number;
  total: number;
  itemName?: string;
}

export function ProgressAnnouncement({ current, total, itemName = 'item' }: ProgressAnnouncementProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <VisuallyHidden>
      {`Loading ${itemName} ${current} of ${total}. ${percentage}% complete.`}
    </VisuallyHidden>
  );
}

// ============================================================================
// Accessible Tooltip Content
// ============================================================================

interface AccessibleTooltipProps {
  children: React.ReactNode;
  content: string;
  id?: string;
}

export function AccessibleTooltip({ children, content, id }: AccessibleTooltipProps) {
  const tooltipId = id || React.useId();

  return (
    <>
      <div aria-describedby={tooltipId}>{children}</div>
      <div id={tooltipId} role="tooltip" className="sr-only">
        {content}
      </div>
    </>
  );
}
