'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/design-system/tokens';

interface CarbonScopeLoaderProps {
  /**
   * Size preset for the loader
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  /**
   * Animation speed multiplier (affects spin duration)
   * @default 1.2
   */
  speed?: number;
  /**
   * Custom size in pixels (overrides size preset)
   */
  customSize?: number;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Additional style for the container
   */
  style?: React.CSSProperties;
  /**
   * Whether the animation should autoPlay
   * @default true
   */
  autoPlay?: boolean;
  /**
   * Whether the animation should loop
   * @default true
   */
  loop?: boolean;
  /**
   * Force a specific loader variant (overrides auto-detection)
   * - 'emerald': Emerald green loader (CarbonScope brand)
   * - 'white': White loader (for dark backgrounds)
   * - 'auto': Auto-detect based on theme (default to emerald)
   */
  variant?: 'emerald' | 'white' | 'auto';
}

const SIZE_MAP = {
  small: 20,
  medium: 40,
  large: 80,
  xlarge: 120,
} as const;

/**
 * CarbonScopeLoader - Branded circular loading animation
 *
 * Uses CarbonScope design system colors (emerald green #34D399) by default.
 *
 * **Automatic Behavior:**
 * - Default → Emerald green loader (CarbonScope brand)
 * - Dark mode → Emerald on dark background
 * - Light mode → Emerald on light background
 *
 * **Manual Override:**
 * Use the `variant` prop for special cases.
 *
 * @example
 * ```tsx
 * // Auto-themed emerald (default)
 * <CarbonScopeLoader />
 *
 * // Always white (for very dark backgrounds)
 * <CarbonScopeLoader variant="white" />
 *
 * // Custom size
 * <CarbonScopeLoader size="large" />
 * ```
 */
export function CarbonScopeLoader({
  size = 'medium',
  speed = 1.2,
  customSize,
  className,
  style,
  autoPlay = true,
  loop = true,
  variant = 'auto',
}: CarbonScopeLoaderProps) {
  const { resolvedTheme } = useTheme();
  const loaderSize = customSize || SIZE_MAP[size];

  // Track mounted state to prevent hydration mismatch
  const [mounted, setMounted] = React.useState(false);

  // Set mounted on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which variant to use
  let effectiveVariant: 'emerald' | 'white';

  if (variant !== 'auto') {
    effectiveVariant = variant;
  } else {
    // Default to emerald (CarbonScope brand color)
    effectiveVariant = 'emerald';
  }

  // Calculate border width based on size (roughly 1/16 of the size, min 2px)
  const borderWidth = Math.max(2, Math.round(loaderSize / 16));

  // Calculate animation duration based on speed (lower = faster)
  const animationDuration = 0.8 / speed;

  // Colors based on variant
  const borderColor = effectiveVariant === 'white'
    ? 'rgba(255, 255, 255, 0.15)'
    : tokens.green.glow; // Emerald glow
  const spinnerColor = effectiveVariant === 'white'
    ? '#ffffff'
    : tokens.green[400]; // Emerald green

  // Don't render during SSR - render a placeholder instead
  if (!mounted) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={style}
      >
        <div
          style={{
            width: loaderSize,
            height: loaderSize
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)} style={style}>
      <div
        style={{
          width: loaderSize,
          height: loaderSize,
          border: `${borderWidth}px solid ${borderColor}`,
          borderTopColor: spinnerColor,
          borderRadius: '50%',
          animation: autoPlay && loop
            ? `carbonscope-spin ${animationDuration}s linear infinite`
            : autoPlay
              ? `carbonscope-spin ${animationDuration}s linear`
              : 'none',
        }}
      />
      <style jsx>{`
        @keyframes carbonscope-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// Export alias for backwards compatibility during migration
export { CarbonScopeLoader as BIMCarbonLoader };
