'use client';

import { cn } from '@/lib/utils';

export interface BIMCarbonLogoProps {
  size?: number;
  variant?: 'symbol' | 'logomark' | 'full';
  className?: string;
}

export function BIMCarbonLogo({ size = 24, variant = 'symbol', className }: BIMCarbonLogoProps) {
  // Full logo with text
  if (variant === 'full') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div
          className="rounded-xl bg-gradient-to-br from-primary via-accent to-purple-500 flex items-center justify-center shadow-lg shadow-primary/30"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size * 0.5}
            height={size * 0.5}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
          </svg>
        </div>
        <span className="font-bold text-xl gradient-text">BIM Carbon</span>
      </div>
    );
  }

  // Logomark variant with gradient container
  if (variant === 'logomark') {
    return (
      <div
        className={cn(
          'rounded-xl bg-gradient-to-br from-primary via-accent to-purple-500 flex items-center justify-center shadow-lg shadow-primary/30',
          className
        )}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size * 0.5}
          height={size * 0.5}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
      </div>
    );
  }

  // Default symbol variant - just the leaf icon
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-primary', className)}
      aria-label="BIM Carbon"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
    </svg>
  );
}

// Backwards compatibility export
export { BIMCarbonLogo as KortixLogo };
