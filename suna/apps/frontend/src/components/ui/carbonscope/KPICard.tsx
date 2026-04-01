import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * KPICard - Carbon metric display card
 *
 * Displays key performance indicators for carbon metrics with EN 15978 lifecycle stage support.
 *
 * @example
 * ```tsx
 * <KPICard
 *   label="Total Embodied Carbon"
 *   value="245.8"
 *   unit="kgCO₂e/m²"
 *   trend="down"
 *   trendValue="12.5%"
 *   variant="primary"
 * />
 * ```
 *
 * @example
 * ```tsx
 * <KPICard
 *   label="A1-A3 Product Stage"
 *   value="156.2"
 *   unit="kgCO₂e/m²"
 *   lifecycleStage="A1A3"
 *   variant="lifecycle"
 * />
 * ```
 */

const kpiCardVariants = cva(
  'relative overflow-hidden rounded-xl border transition-all duration-300 p-6 group hover:shadow-lg',
  {
    variants: {
      variant: {
        primary: 'bg-[#162032] border-[#1E293B] hover:border-[#059669] hover:shadow-[0_0_20px_rgba(52,211,153,0.08)]',
        lifecycle: 'bg-[#162032] border-[#1E293B] hover:border-[#334155]',
        warning: 'bg-[#162032] border-[#1E293B] hover:border-[#F59E0B]',
        danger: 'bg-[#162032] border-[#1E293B] hover:border-[#F87171]',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export interface KPICardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof kpiCardVariants> {
  /** Label text for the KPI */
  label: string;
  /** Numeric value to display */
  value: string | number;
  /** Unit of measurement (e.g., kgCO₂e/m²) */
  unit?: string;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Trend percentage value */
  trendValue?: string;
  /** EN 15978 lifecycle stage key */
  lifecycleStage?: 'A1A3' | 'A4A5' | 'B1B5' | 'B6B7' | 'C1C4' | 'D';
  /** Optional icon element */
  icon?: React.ReactNode;
}

const lifecycleColors = {
  A1A3: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  A4A5: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  B1B5: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  B6B7: { color: '#EA580C', bg: 'rgba(234,88,12,0.12)' },
  C1C4: { color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  D: { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
};

const KPICard = React.forwardRef<HTMLDivElement, KPICardProps>(
  (
    {
      className,
      variant,
      label,
      value,
      unit,
      trend,
      trendValue,
      lifecycleStage,
      icon,
      ...props
    },
    ref
  ) => {
    const lifecycleColor = lifecycleStage ? lifecycleColors[lifecycleStage] : null;

    return (
      <div
        ref={ref}
        className={cn(kpiCardVariants({ variant }), 'cs-fadeUp', className)}
        {...props}
      >
        {/* Emerald glow effect on hover */}
        {variant === 'primary' && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(52,211,153,0.05)] to-transparent" />
          </div>
        )}

        {/* Lifecycle stage indicator */}
        {lifecycleStage && lifecycleColor && (
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{ backgroundColor: lifecycleColor.color }}
          />
        )}

        <div className="relative z-10 flex flex-col gap-3">
          {/* Header with label and optional icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#94A3B8] uppercase tracking-wide">
                {label}
              </p>
              {lifecycleStage && lifecycleColor && (
                <div
                  className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold"
                  style={{
                    color: lifecycleColor.color,
                    backgroundColor: lifecycleColor.bg,
                  }}
                >
                  {lifecycleStage}
                </div>
              )}
            </div>
            {icon && (
              <div className="text-[#64748B] transition-colors group-hover:text-[#34D399]">
                {icon}
              </div>
            )}
          </div>

          {/* Value and unit */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#E2E8F0] tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-lg font-medium text-[#64748B]">{unit}</span>
            )}
          </div>

          {/* Trend indicator */}
          {trend && trendValue && (
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold',
                  trend === 'down' && 'bg-[rgba(16,185,129,0.1)] text-[#10B981]',
                  trend === 'up' && 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]',
                  trend === 'neutral' && 'bg-[rgba(107,114,128,0.1)] text-[#6B7280]'
                )}
              >
                {trend === 'down' && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 9L1 4h10L6 9z" />
                  </svg>
                )}
                {trend === 'up' && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 3l5 5H1l5-5z" />
                  </svg>
                )}
                <span>{trendValue}</span>
              </div>
              <span className="text-xs text-[#64748B]">vs. baseline</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

KPICard.displayName = 'KPICard';

export { KPICard, kpiCardVariants };
