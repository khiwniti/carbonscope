'use client';

import { useState, useEffect } from 'react';

/**
 * Responsive Design Utilities
 * Hooks for detecting breakpoints and device types
 * Desktop: 1920x1080, Tablet: 768x1024, Mobile: 375x667
 */

// ============================================================================
// Breakpoint Definitions
// ============================================================================

export const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
  wide: 1920,
} as const;

// ============================================================================
// Media Query Hooks
// ============================================================================

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// ============================================================================
// Device Type Detection
// ============================================================================

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${breakpoints.tablet - 1}px)`);
}

export function useIsTablet() {
  return useMediaQuery(
    `(min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.desktop - 1}px)`
  );
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${breakpoints.desktop}px)`);
}

export function useIsWideScreen() {
  return useMediaQuery(`(min-width: ${breakpoints.wide}px)`);
}

// ============================================================================
// Combined Device Detection
// ============================================================================

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'wide';

export function useDeviceType(): DeviceType {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isWide = useIsWideScreen();

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isWide) return 'wide';
  return 'desktop';
}

// ============================================================================
// Screen Orientation
// ============================================================================

export type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      setOrientation(isPortrait ? 'portrait' : 'landscape');
    };

    handleOrientationChange();

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return orientation;
}

// ============================================================================
// Viewport Dimensions
// ============================================================================

interface ViewportDimensions {
  width: number;
  height: number;
}

export function useViewportSize(): ViewportDimensions {
  const [dimensions, setDimensions] = useState<ViewportDimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial dimensions
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
}

// ============================================================================
// Touch Device Detection
// ============================================================================

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - IE specific property
      navigator.msMaxTouchPoints > 0
    );
  }, []);

  return isTouch;
}

// ============================================================================
// Network Status
// ============================================================================

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ============================================================================
// Responsive Component Utilities
// ============================================================================

interface ResponsiveProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  wide?: React.ReactNode;
}

export function useResponsiveContent({
  mobile,
  tablet,
  desktop,
  wide,
}: ResponsiveProps): React.ReactNode {
  const deviceType = useDeviceType();

  switch (deviceType) {
    case 'mobile':
      return mobile || tablet || desktop || wide;
    case 'tablet':
      return tablet || desktop || mobile || wide;
    case 'desktop':
      return desktop || wide || tablet || mobile;
    case 'wide':
      return wide || desktop || tablet || mobile;
    default:
      return desktop;
  }
}

// ============================================================================
// Grid Columns Calculator
// ============================================================================

export function useResponsiveColumns(
  mobileColumns: number = 1,
  tabletColumns: number = 2,
  desktopColumns: number = 4
): number {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile) return mobileColumns;
  if (isTablet) return tabletColumns;
  return desktopColumns;
}

// ============================================================================
// Safe Area Insets (for mobile notches, etc.)
// ============================================================================

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function useSafeAreaInsets(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const getInset = (side: string): number => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`--safe-area-inset-${side}`)
        .trim();
      return parseInt(value) || 0;
    };

    const updateInsets = () => {
      setInsets({
        top: getInset('top'),
        right: getInset('right'),
        bottom: getInset('bottom'),
        left: getInset('left'),
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);

    return () => window.removeEventListener('resize', updateInsets);
  }, []);

  return insets;
}

// ============================================================================
// Responsive Text Size
// ============================================================================

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';

export function useResponsiveTextSize(
  mobileSize: TextSize = 'sm',
  tabletSize: TextSize = 'base',
  desktopSize: TextSize = 'lg'
): TextSize {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile) return mobileSize;
  if (isTablet) return tabletSize;
  return desktopSize;
}

// ============================================================================
// Scroll Position
// ============================================================================

interface ScrollPosition {
  x: number;
  y: number;
}

export function useScrollPosition(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

// ============================================================================
// Element Visibility (Intersection Observer)
// ============================================================================

export function useIsVisible(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isVisible;
}

// ============================================================================
// Window Focus
// ============================================================================

export function useWindowFocus(): boolean {
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isFocused;
}

// ============================================================================
// Preferred Color Scheme
// ============================================================================

export type ColorScheme = 'light' | 'dark' | 'no-preference';

export function usePreferredColorScheme(): ColorScheme {
  const [scheme, setScheme] = useState<ColorScheme>('light');

  useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightQuery = window.matchMedia('(prefers-color-scheme: light)');

    const updateScheme = () => {
      if (darkQuery.matches) {
        setScheme('dark');
      } else if (lightQuery.matches) {
        setScheme('light');
      } else {
        setScheme('no-preference');
      }
    };

    updateScheme();

    darkQuery.addEventListener('change', updateScheme);
    lightQuery.addEventListener('change', updateScheme);

    return () => {
      darkQuery.removeEventListener('change', updateScheme);
      lightQuery.removeEventListener('change', updateScheme);
    };
  }, []);

  return scheme;
}
