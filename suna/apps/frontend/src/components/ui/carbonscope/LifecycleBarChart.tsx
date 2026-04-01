import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * LifecycleBarChart - Horizontal stacked bar for EN 15978 lifecycle stages
 *
 * Displays carbon emissions breakdown across EN 15978 lifecycle stages with interactive tooltips.
 *
 * @example
 * ```tsx
 * <LifecycleBarChart
 *   data={{
 *     A1A3: 156.2,
 *     A4A5: 23.5,
 *     B1B5: 45.8,
 *     B6B7: 89.3,
 *     C1C4: 12.7,
 *     D: -8.5
 *   }}
 *   total={319.0}
 *   unit="kgCO₂e/m²"
 * />
 * ```
 *
 * @example
 * ```tsx
 * <LifecycleBarChart
 *   data={{
 *     A1A3: 245000,
 *     A4A5: 35000,
 *     B6B7: 125000
 *   }}
 *   total={405000}
 *   unit="kgCO₂e"
 *   height="lg"
 *   showLabels
 * />
 * ```
 */

const lifecycleBarChartVariants = cva('w-full', {
  variants: {
    height: {
      sm: 'h-12',
      md: 'h-16',
      lg: 'h-20',
      xl: 'h-24',
    },
  },
  defaultVariants: {
    height: 'md',
  },
});

interface LifecycleStageData {
  A1A3?: number;
  A4A5?: number;
  B1B5?: number;
  B6B7?: number;
  C1C4?: number;
  D?: number;
}

export interface LifecycleBarChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof lifecycleBarChartVariants> {
  /** Carbon emissions data for each lifecycle stage */
  data: LifecycleStageData;
  /** Total carbon emissions value */
  total: number;
  /** Unit of measurement */
  unit?: string;
  /** Whether to show stage labels */
  showLabels?: boolean;
  /** Whether to show values on hover */
  showTooltip?: boolean;
}

const LIFECYCLE_STAGES = {
  A1A3: { label: 'A1–A3', name: 'Product', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  A4A5: { label: 'A4–A5', name: 'Construction', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  B1B5: { label: 'B1–B5', name: 'Maintenance', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  B6B7: { label: 'B6–B7', name: 'Operational', color: '#EA580C', bg: 'rgba(234,88,12,0.12)' },
  C1C4: { label: 'C1–C4', name: 'End of Life', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  D: { label: 'D', name: 'Beyond Lifecycle', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
} as const;

const LifecycleBarChart = React.forwardRef<HTMLDivElement, LifecycleBarChartProps>(
  (
    {
      className,
      height,
      data,
      total,
      unit = 'kgCO₂e/m²',
      showLabels = false,
      showTooltip = true,
      ...props
    },
    ref
  ) => {
    const [hoveredStage, setHoveredStage] = React.useState<string | null>(null);

    // Calculate percentages for each stage
    const stages = Object.entries(data)
      .filter(([_, value]) => value && value !== 0)
      .map(([key, value]) => ({
        key: key as keyof typeof LIFECYCLE_STAGES,
        value: value!,
        percentage: Math.abs((value! / total) * 100),
        isNegative: value! < 0,
      }));

    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {/* Bar chart */}
        <div className={cn(lifecycleBarChartVariants({ height }), 'relative')}>
          <div className="flex h-full rounded-xl overflow-hidden bg-[#0D1526] border border-[#1E293B]">
            {stages.map((stage, index) => {
              const stageInfo = LIFECYCLE_STAGES[stage.key];
              const isHovered = hoveredStage === stage.key;

              return (
                <div
                  key={stage.key}
                  className={cn(
                    'relative transition-all duration-300 cursor-pointer group',
                    isHovered && 'z-10'
                  )}
                  style={{
                    width: `${stage.percentage}%`,
                    backgroundColor: stageInfo.color,
                    opacity: isHovered ? 1 : hoveredStage ? 0.5 : 1,
                  }}
                  onMouseEnter={() => setHoveredStage(stage.key)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  {/* Emerald glow on hover */}
                  {isHovered && (
                    <div
                      className="absolute inset-0 cs-glow"
                      style={{
                        boxShadow: `0 0 20px ${stageInfo.color}40`,
                      }}
                    />
                  )}

                  {/* Stage label (for larger segments) */}
                  {stage.percentage > 8 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white drop-shadow-lg">
                        {stageInfo.label}
                      </span>
                    </div>
                  )}

                  {/* Tooltip */}
                  {showTooltip && isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0B1120] border border-[#1E293B] rounded-lg shadow-xl whitespace-nowrap z-20 cs-fadeUp">
                      <div className="text-xs font-semibold text-[#E2E8F0] mb-1">
                        {stageInfo.label}: {stageInfo.name}
                      </div>
                      <div className="text-sm font-bold text-[#34D399]">
                        {stage.isNegative && '-'}
                        {Math.abs(stage.value).toFixed(1)} {unit}
                      </div>
                      <div className="text-xs text-[#64748B]">
                        {stage.percentage.toFixed(1)}% of total
                      </div>
                      {/* Arrow */}
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#0B1120] border-r border-b border-[#1E293B]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        {showLabels && (
          <div className="flex flex-wrap gap-3">
            {stages.map((stage) => {
              const stageInfo = LIFECYCLE_STAGES[stage.key];
              return (
                <div
                  key={stage.key}
                  className="flex items-center gap-2 text-xs cursor-pointer transition-opacity hover:opacity-100"
                  style={{ opacity: hoveredStage === stage.key ? 1 : hoveredStage ? 0.5 : 0.8 }}
                  onMouseEnter={() => setHoveredStage(stage.key)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: stageInfo.color }}
                  />
                  <span className="font-medium text-[#94A3B8]">
                    {stageInfo.label}
                  </span>
                  <span className="text-[#64748B]">
                    {stage.isNegative && '-'}
                    {Math.abs(stage.value).toFixed(1)} {unit}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Total */}
        <div className="flex items-baseline justify-between pt-2 border-t border-[#1E293B]">
          <span className="text-sm font-medium text-[#94A3B8]">Total Embodied Carbon</span>
          <span className="text-lg font-bold text-[#34D399]">
            {total.toFixed(1)} {unit}
          </span>
        </div>
      </div>
    );
  }
);

LifecycleBarChart.displayName = 'LifecycleBarChart';

export { LifecycleBarChart, lifecycleBarChartVariants };
