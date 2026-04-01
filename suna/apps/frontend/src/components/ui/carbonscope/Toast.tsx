import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Toast - Notification toast with auto-dismiss
 *
 * Displays temporary notifications with automatic dismissal and emerald green accents.
 *
 * @example
 * ```tsx
 * const [showToast, setShowToast] = useState(false);
 *
 * <Toast
 *   open={showToast}
 *   onOpenChange={setShowToast}
 *   variant="success"
 *   title="Analysis Complete"
 *   description="Carbon footprint calculated successfully"
 *   duration={5000}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Toast
 *   open={true}
 *   variant="error"
 *   title="Calculation Error"
 *   description="Unable to process building materials data"
 * />
 * ```
 */

const toastVariants = cva(
  'fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-xl border p-4 shadow-lg transition-all duration-300 cs-fadeUp',
  {
    variants: {
      variant: {
        default: 'bg-[#162032] border-[#1E293B] text-[#E2E8F0]',
        success: 'bg-[#162032] border-[#059669] shadow-[0_0_20px_rgba(52,211,153,0.15)]',
        error: 'bg-[#162032] border-[#F87171] shadow-[0_0_20px_rgba(248,113,113,0.15)]',
        warning: 'bg-[#162032] border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.15)]',
        info: 'bg-[#162032] border-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.15)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  /** Whether the toast is visible */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Toast title */
  title?: string;
  /** Toast description */
  description?: string;
  /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Optional action button */
  action?: React.ReactNode;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant,
      open = false,
      onOpenChange,
      title,
      description,
      duration = 5000,
      action,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(open);
    const timerRef = React.useRef<NodeJS.Timeout>();

    React.useEffect(() => {
      setIsVisible(open);

      if (open && duration > 0) {
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
          onOpenChange?.(false);
        }, duration);
      }

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, [open, duration, onOpenChange]);

    const handleClose = React.useCallback(() => {
      setIsVisible(false);
      onOpenChange?.(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }, [onOpenChange]);

    if (!isVisible) return null;

    const iconMap = {
      success: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#10B981]">
          <path
            d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z"
            fill="currentColor"
          />
        </svg>
      ),
      error: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#F87171]">
          <path
            d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
            fill="currentColor"
          />
        </svg>
      ),
      warning: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#FBBF24]">
          <path
            d="M1 17h18L10 2 1 17zm10-2H9v-2h2v2zm0-4H9v-4h2v4z"
            fill="currentColor"
          />
        </svg>
      ),
      info: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#38BDF8]">
          <path
            d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9V9h2v6zm0-8H9V5h2v2z"
            fill="currentColor"
          />
        </svg>
      ),
      default: null,
    };

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex gap-3">
          {/* Icon */}
          {variant && iconMap[variant] && (
            <div className="flex-shrink-0 mt-0.5">{iconMap[variant]}</div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-[#E2E8F0] mb-1">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-[#94A3B8] leading-relaxed">{description}</p>
            )}
            {action && <div className="mt-3">{action}</div>}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 rounded-lg p-1.5 text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E293B] transition-colors"
            aria-label="Close notification"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 6.6L11.3 3.3c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L9.4 8l3.3 3.3c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0L8 9.4l-3.3 3.3c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4L6.6 8 3.3 4.7c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0L8 6.6z" />
            </svg>
          </button>
        </div>

        {/* Progress bar for auto-dismiss */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1E293B] rounded-b-xl overflow-hidden">
            <div
              className={cn(
                'h-full transition-all ease-linear cs-glow',
                variant === 'success' && 'bg-[#10B981]',
                variant === 'error' && 'bg-[#F87171]',
                variant === 'warning' && 'bg-[#F59E0B]',
                variant === 'info' && 'bg-[#38BDF8]',
                variant === 'default' && 'bg-[#34D399]'
              )}
              style={{
                width: '100%',
                animation: `toast-progress ${duration}ms linear`,
              }}
            />
          </div>
        )}

        <style jsx>{`
          @keyframes toast-progress {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}</style>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

export { Toast, toastVariants };
