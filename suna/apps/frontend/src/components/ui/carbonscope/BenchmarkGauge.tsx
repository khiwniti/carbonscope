import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * BenchmarkGauge - Circular gauge for carbon benchmarks
 *
 * Displays carbon performance against benchmarks with circular progress indicator.
 *
 * @example
 * ```tsx
 * <BenchmarkGauge
 *   value={245.8}
 *   benchmark={350}
 *   unit="kgCO₂e/m²"
 *   label="Embodied Carbon vs. Benchmark"
 *   status="good"
 * />
 * ```
 *
 * @example
 * ```tsx
 * <BenchmarkGauge
 *   value={425}
 *   benchmark={350}
 *   unit="kgCO₂e/m²"
 *   label="Total Carbon Footprint"
 *   status="warning"
 *   size="lg"
 * />
 * ```
 */

const benchmarkGaugeVariants = cva('relative', {
  variants: {
    size: {
      sm: 'w-32 h-32',
      md: 'w-40 h-40',
      lg: 'w-48 h-48',
      xl: 'w-56 h-56',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface BenchmarkGaugeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof benchmarkGaugeVariants> {
  /** Current carbon value */
  value: number;
  /** Benchmark target value */
  benchmark: number;
  /** Unit of measurement */
  unit?: string;
  /** Gauge label */
  label?: string;
  /** Performance status */
  status?: 'good' | 'warning' | 'danger' | 'excellent';
}

const BenchmarkGauge = React.forwardRef<HTMLDivElement, BenchmarkGaugeProps>(
  (
    {
      className,
      size,
      value,
      benchmark,
      unit = 'kgCO₂e/m²',
      label,
      status,
      ...props
    },
    ref
  ) => {
    // Calculate percentage (capped at 150% for visual purposes)
    const percentage = Math.min((value / benchmark) * 100, 150);
    const angle = (percentage / 100) * 270 - 135; // -135° to 135° range

    // Auto-determine status if not provided
    const effectiveStatus =
      status ||
      (percentage <= 70
        ? 'excellent'
        : percentage <= 90
        ? 'good'
        : percentage <= 110
        ? 'warning'
        : 'danger');

    const statusColors = {
      excellent: { color: '#10B981', glow: 'rgba(16,185,129,0.25)' },
      good: { color: '#34D399', glow: 'rgba(52,211,153,0.25)' },
      warning: { color: '#F59E0B', glow: 'rgba(245,158,11,0.25)' },
      danger: { color: '#F87171', glow: 'rgba(248,113,113,0.25)' },
    };

    const currentStatus = statusColors[effectiveStatus];

    // SVG dimensions
    const sizeMap = {
      sm: 128,
      md: 160,
      lg: 192,
      xl: 224,
    };
    const svgSize = sizeMap[size || 'md'];
    const center = svgSize / 2;
    const radius = svgSize / 2 - 20;
    const strokeWidth = 12;

    // Calculate arc path
    const arcPath = React.useMemo(() => {
      const startAngle = -135;
      const endAngle = angle;
      const start = polarToCartesian(center, center, radius, endAngle);
      const end = polarToCartesian(center, center, radius, startAngle);
      const largeArc = endAngle - startAngle <= 180 ? '0' : '1';

      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
    }, [center, radius, angle]);

    return (
      <div ref={ref} className={cn('flex flex-col items-center gap-4', className)} {...props}>
        {/* Gauge */}
        <div className={cn(benchmarkGaugeVariants({ size }), 'cs-fadeUp')}>
          <svg width={svgSize} height={svgSize} className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#1E293B"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                strokeDasharray: '424',
                strokeDashoffset: '70',
              }}
            />

            {/* Progress arc */}
            <path
              d={arcPath}
              fill="none"
              stroke={currentStatus.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="cs-glow transition-all duration-700 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${currentStatus.glow})`,
              }}
            />

            {/* Benchmark marker */}
            <circle
              cx={center}
              cy={20}
              r={4}
              fill="#E2E8F0"
              className="opacity-50"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <div
                className="text-3xl font-bold tracking-tight mb-1"
                style={{ color: currentStatus.color }}
              >
                {value.toFixed(1)}
              </div>
              <div className="text-xs font-medium text-[#64748B] mb-2">{unit}</div>
              <div className="text-sm text-[#94A3B8]">
                of <span className="font-semibold text-[#E2E8F0]">{benchmark}</span>
              </div>
            </div>
          </div>

          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              boxShadow: `0 0 40px ${currentStatus.glow}`,
            }}
          />
        </div>

        {/* Label and status */}
        <div className="text-center space-y-2">
          {label && (
            <div className="text-sm font-medium text-[#E2E8F0]">{label}</div>
          )}

          {/* Performance indicator */}
          <div className="flex items-center justify-center gap-2">
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${currentStatus.color}20`,
                color: currentStatus.color,
              }}
            >
              {percentage.toFixed(0)}% of benchmark
            </div>

            {/* Status badge */}
            <div
              className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wide"
              style={{
                backgroundColor: `${currentStatus.color}15`,
                color: currentStatus.color,
              }}
            >
              {effectiveStatus}
            </div>
          </div>

          {/* Comparison text */}
          <div className="text-xs text-[#64748B]">
            {value < benchmark ? (
              <>
                <span className="font-semibold text-[#10B981]">
                  {(benchmark - value).toFixed(1)} {unit}
                </span>{' '}
                below benchmark
              </>
            ) : value === benchmark ? (
              'Meets benchmark exactly'
            ) : (
              <>
                <span className="font-semibold text-[#F87171]">
                  {(value - benchmark).toFixed(1)} {unit}
                </span>{' '}
                above benchmark
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

BenchmarkGauge.displayName = 'BenchmarkGauge';

// Helper function to convert polar to cartesian coordinates
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export { BenchmarkGauge, benchmarkGaugeVariants };
