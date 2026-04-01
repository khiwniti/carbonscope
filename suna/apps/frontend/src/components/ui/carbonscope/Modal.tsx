import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Modal - Dialog overlay component
 *
 * Full-screen modal dialog with backdrop blur and emerald green accents.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <Modal
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Export Carbon Report"
 *   size="md"
 * >
 *   <p>Select export format for your carbon analysis report.</p>
 *   <div className="mt-4 flex gap-2">
 *     <button>PDF</button>
 *     <button>Excel</button>
 *   </div>
 * </Modal>
 * ```
 *
 * @example
 * ```tsx
 * <Modal
 *   open={true}
 *   title="Building Materials"
 *   description="Review and edit material carbon data"
 *   size="lg"
 * >
 *   <div>Modal content goes here</div>
 * </Modal>
 * ```
 */

const modalVariants = cva(
  'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#162032] border border-[#1E293B] rounded-2xl shadow-xl cs-fadeUp',
  {
    variants: {
      size: {
        sm: 'w-full max-w-md p-6',
        md: 'w-full max-w-lg p-6',
        lg: 'w-full max-w-2xl p-8',
        xl: 'w-full max-w-4xl p-8',
        full: 'w-[calc(100vw-4rem)] h-[calc(100vh-4rem)] p-8',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  /** Whether the modal is open */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Modal title */
  title?: string;
  /** Modal description */
  description?: string;
  /** Footer content (typically action buttons) */
  footer?: React.ReactNode;
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      size,
      open = false,
      onOpenChange,
      title,
      description,
      footer,
      closeOnBackdropClick = true,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(open);

    React.useEffect(() => {
      setIsVisible(open);

      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [open]);

    const handleClose = React.useCallback(() => {
      setIsVisible(false);
      onOpenChange?.(false);
    }, [onOpenChange]);

    const handleBackdropClick = React.useCallback(
      (e: React.MouseEvent) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          handleClose();
        }
      },
      [closeOnBackdropClick, handleClose]
    );

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isVisible) {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isVisible, handleClose]);

    if (!isVisible) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm cs-fadeUp"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
          className={cn(modalVariants({ size }), className)}
          {...props}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-[#E2E8F0] tracking-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-2 text-sm text-[#94A3B8] leading-relaxed"
                >
                  {description}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 rounded-lg p-2 text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E293B] transition-all cs-glow"
              aria-label="Close modal"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="transition-transform hover:rotate-90 duration-200"
              >
                <path d="M10 8.6L13.3 5.3c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L11.4 10l3.3 3.3c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0L10 11.4l-3.3 3.3c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4L8.6 10 5.3 6.7c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0L10 8.6z" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-16rem)]">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="mt-6 pt-6 border-t border-[#1E293B] flex items-center justify-end gap-3">
              {footer}
            </div>
          )}

          {/* Emerald accent glow */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              boxShadow: '0 0 0 1px rgba(5,150,105,0.1), 0 0 20px rgba(52,211,153,0.08)',
            }}
          />
        </div>
      </>
    );
  }
);

Modal.displayName = 'Modal';

export { Modal, modalVariants };
