// DEPRECATED: Use BIMCarbonLogo from './bim-carbon-logo' instead
// This file provides backwards compatibility during migration

'use client';

export { BIMCarbonLogo as KortixLogo } from './bim-carbon-logo';
export type { BIMCarbonLogoProps as KortixLogoProps } from './bim-carbon-logo';

// Type export for backwards compatibility
export interface KortixLogoProps {
  size?: number;
  variant?: 'symbol' | 'logomark' | 'full';
  className?: string;
}
