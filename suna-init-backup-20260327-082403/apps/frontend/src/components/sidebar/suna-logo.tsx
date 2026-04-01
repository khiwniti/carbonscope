'use client';

import { cn } from '@/lib/utils';

interface SunaLogoProps {
  size?: number;
  variant?: 'symbol' | 'logomark';
  className?: string;
}

export function SunaLogo({ size = 24, variant = 'symbol', className }: SunaLogoProps) {
  // For logomark variant, use Logomark.svg (CarbonScope branding)
  // Invert it for light mode using CSS
  if (variant === 'logomark') {
    return (
      <img
        src="/Logomark.svg"
        alt="Suna"
        className={cn('invert dark:invert-0 flex-shrink-0', className)}
        style={{ height: `${size}px`, width: 'auto' }}
        suppressHydrationWarning
      />
    );
  }

  // Default symbol variant - use text-based logo with CarbonScope styling
  return (
    <div
      className={cn(
        'flex items-center justify-center font-display text-emerald-500 font-semibold flex-shrink-0',
        className
      )}
      style={{ fontSize: `${size}px`, lineHeight: 1 }}
      suppressHydrationWarning
    >
      S
    </div>
  );
}
