import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * EPDCard - Environmental Product Declaration card
 *
 * Displays material EPD information with carbon intensity and verification status.
 *
 * @example
 * ```tsx
 * <EPDCard
 *   materialName="Structural Concrete C30/37"
 *   manufacturer="CarbonTech Materials"
 *   gwp={285.5}
 *   unit="kgCO₂e/m³"
 *   epdNumber="EPD-2024-0012345"
 *   validUntil="2027-12-31"
 *   verified
 * />
 * ```
 *
 * @example
 * ```tsx
 * <EPDCard
 *   materialName="Cross-Laminated Timber"
 *   manufacturer="Sustainable Wood Co."
 *   gwp={-125.3}
 *   unit="kgCO₂e/m³"
 *   variant="carbon-negative"
 * />
 * ```
 */

const epdCardVariants = cva(
  'relative overflow-hidden rounded-xl border transition-all duration-300 p-5 group hover:shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-[#162032] border-[#1E293B] hover:border-[#334155]',
        verified: 'bg-[#162032] border-[#059669] hover:shadow-[0_0_20px_rgba(52,211,153,0.08)]',
        'carbon-negative': 'bg-[#162032] border-[#10B981] hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]',
        warning: 'bg-[#162032] border-[#F59E0B]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface EPDCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof epdCardVariants> {
  /** Material name */
  materialName: string;
  /** Manufacturer name */
  manufacturer?: string;
  /** Global Warming Potential value */
  gwp: number;
  /** Unit of measurement */
  unit?: string;
  /** EPD registration number */
  epdNumber?: string;
  /** EPD valid until date */
  validUntil?: string;
  /** Whether EPD is verified */
  verified?: boolean;
  /** Optional thumbnail/icon */
  thumbnail?: React.ReactNode;
}

const EPDCard = React.forwardRef<HTMLDivElement, EPDCardProps>(
  (
    {
      className,
      variant,
      materialName,
      manufacturer,
      gwp,
      unit = 'kgCO₂e/m³',
      epdNumber,
      validUntil,
      verified = false,
      thumbnail,
      ...props
    },
    ref
  ) => {
    const isCarbonNegative = gwp < 0;
    const effectiveVariant = verified ? 'verified' : isCarbonNegative ? 'carbon-negative' : variant;

    return (
      <div
        ref={ref}
        className={cn(epdCardVariants({ variant: effectiveVariant }), 'cs-fadeUp', className)}
        {...props}
      >
        {/* Emerald glow effect for verified/carbon-negative */}
        {(verified || isCarbonNegative) && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(52,211,153,0.05)] to-transparent" />
          </div>
        )}

        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            {thumbnail && (
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1E293B] flex items-center justify-center text-[#64748B]">
                {thumbnail}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[#E2E8F0] leading-tight mb-1">
                {materialName}
              </h3>
              {manufacturer && (
                <p className="text-sm text-[#94A3B8]">{manufacturer}</p>
              )}
            </div>

            {/* Verified badge */}
            {verified && (
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(16,185,129,0.1)] text-[#10B981]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M7 0L8.5 2.5L11.5 3L9.5 5.5L10 8.5L7 7L4 8.5L4.5 5.5L2.5 3L5.5 2.5L7 0Z" />
                  </svg>
                  <span className="text-xs font-semibold">Verified</span>
                </div>
              </div>
            )}
          </div>

          {/* GWP Value */}
          <div className="flex items-baseline gap-2 py-3 px-4 rounded-lg bg-[#0D1526] border border-[#1E293B]">
            <div className="flex-1">
              <div className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-1">
                Global Warming Potential
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-2xl font-bold tracking-tight',
                    isCarbonNegative ? 'text-[#10B981]' : 'text-[#E2E8F0]'
                  )}
                >
                  {isCarbonNegative && '-'}
                  {Math.abs(gwp).toFixed(1)}
                </span>
                <span className="text-sm font-medium text-[#64748B]">{unit}</span>
              </div>
            </div>

            {/* Carbon negative indicator */}
            {isCarbonNegative && (
              <div className="flex-shrink-0 px-2 py-1 rounded bg-[rgba(16,185,129,0.1)] text-[#10B981]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2L4 6h3v6h2V6h3L8 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* EPD Details */}
          {(epdNumber || validUntil) && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1E293B]">
              {epdNumber && (
                <div>
                  <div className="text-xs font-medium text-[#64748B] mb-1">EPD Number</div>
                  <div className="text-sm font-mono text-[#94A3B8]">{epdNumber}</div>
                </div>
              )}
              {validUntil && (
                <div>
                  <div className="text-xs font-medium text-[#64748B] mb-1">Valid Until</div>
                  <div className="text-sm text-[#94A3B8]">
                    {new Date(validUntil).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          <button className="w-full py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-sm font-medium text-[#E2E8F0] transition-all cs-glow">
            View Full EPD
          </button>
        </div>
      </div>
    );
  }
);

EPDCard.displayName = 'EPDCard';

export { EPDCard, epdCardVariants };
