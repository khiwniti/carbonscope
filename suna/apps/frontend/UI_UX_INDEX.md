# UI/UX Component Library - Index

> **Navigation hub** for all UI/UX documentation and resources

---

## 📚 Documentation

### 1. Quick Start
**File:** `UI_UX_QUICK_REFERENCE.md`
**Purpose:** Developer cheat sheet with common patterns
**Use When:** You need a quick code snippet or pattern reference

### 2. Implementation Examples
**File:** `IMPLEMENTATION_EXAMPLES.tsx`
**Purpose:** 10 real-world code examples
**Use When:** You want to see how components work in practice

### 3. Complete Summary
**File:** `.planning/phases/05-professional-output-polish/03-UI-UX-POLISH-SUMMARY.md`
**Purpose:** Comprehensive technical documentation
**Use When:** You need detailed information about any component

### 4. Testing Checklist
**File:** `.planning/phases/05-professional-output-polish/UI_UX_VERIFICATION_CHECKLIST.md`
**Purpose:** Complete testing and verification guide
**Use When:** Testing components or preparing for release

### 5. Phase Report
**File:** `.planning/phases/05-professional-output-polish/PHASE_5_PLAN_3_REPORT.md`
**Purpose:** Executive summary and project overview
**Use When:** You need high-level project information

---

## 🎨 Component Categories

### Loading States
**File:** `src/components/ui/loading-states.tsx`

Components:
- `Spinner` - Basic loading indicator
- `FullPageLoading` - Full screen overlay
- `DashboardSkeleton` - Dashboard placeholder
- `TableSkeleton` - Table placeholder
- `ListSkeleton` - List placeholder
- `GridSkeleton` - Grid placeholder
- `ProgressLoading` - Progress bar
- `InlineLoading` - Inline spinner
- `ButtonLoading` - Button loading state
- `CardSkeleton` - Card placeholder
- `FormSkeleton` - Form placeholder
- `SectionLoading` - Section loader
- `Shimmer` - Shimmer effect wrapper

**Common Use Cases:**
- Data fetching
- File uploads
- Form submissions
- Page transitions

---

### Error Handling
**File:** `src/components/ui/error-states.tsx`

Components:
- `ErrorState` - Full page error
- `InlineError` - Inline alert error
- `FieldError` - Form field error
- `ErrorCard` - Card with error details
- `NetworkError` - Connection error
- `NotFoundError` - 404 page
- `PermissionDeniedError` - 403 page
- `ErrorBoundaryFallback` - React error boundary
- `ValidationErrors` - Form validation list

**Common Use Cases:**
- API failures
- Network issues
- Form validation
- Permission errors

---

### Empty States
**File:** `src/components/ui/empty-states.tsx`

Components:
- `EmptyState` - Base empty component
- `NoResults` - Search no results
- `NoDocuments` - No files
- `NoData` - No data available
- `EmptyInbox` - Empty inbox
- `EmptyFolder` - Empty directory
- `NoNotifications` - No alerts
- `NoEvents` - No calendar events
- `NoTeamMembers` - No team
- `NoMessages` - No chat
- `ArchivedEmpty` - Empty archive
- `FirstTimeExperience` - Onboarding
- `ErrorEmptyState` - Error as empty state

**Common Use Cases:**
- First-time users
- Filtered results
- Archived items
- Zero data scenarios

---

### Success Confirmations
**File:** `src/components/ui/success-states.tsx`

Functions:
- `showSuccessToast()` - Display success toast
- `SuccessToasts.saved()` - Save confirmation
- `SuccessToasts.created()` - Create confirmation
- `SuccessToasts.deleted()` - Delete confirmation
- `SuccessToasts.copied()` - Copy confirmation
- `SuccessToasts.shared()` - Share confirmation
- ... and 10+ more patterns

Components:
- `SuccessModal` - Modal confirmation
- `InlineSuccess` - Inline message
- `SuccessBanner` - Prominent banner
- `CompactSuccess` - Small indicator
- `ActionSuccess` - With quick actions

**Common Use Cases:**
- Form submissions
- File operations
- Settings updates
- User actions

---

### Accessibility
**File:** `src/components/ui/accessibility.tsx`

Components:
- `SkipToContent` - Skip navigation
- `ScreenReaderOnly` - SR-only text
- `VisuallyHidden` - Hidden content
- `FocusTrap` - Modal focus management
- `KeyboardHint` - Shortcut display
- `LiveRegion` - Dynamic announcements
- `FocusIndicator` - Enhanced focus ring
- `IconButton` - Accessible icon button
- `FormField` - Accessible form field
- `Landmarks` - HTML5 landmarks

Hooks:
- `useHighContrastMode()` - Detect high contrast
- `useReducedMotion()` - Detect motion preference

**Common Use Cases:**
- Screen reader support
- Keyboard navigation
- Form accessibility
- Modal management

---

### Responsive Design
**File:** `src/hooks/use-responsive.ts`

Hooks:
- `useIsMobile()` - Detect mobile (<768px)
- `useIsTablet()` - Detect tablet (768-1279px)
- `useIsDesktop()` - Detect desktop (≥1280px)
- `useIsWideScreen()` - Detect wide (≥1920px)
- `useDeviceType()` - Get device type
- `useOrientation()` - Portrait/landscape
- `useViewportSize()` - Window dimensions
- `useIsTouchDevice()` - Touch capability
- `useOnlineStatus()` - Network status
- `useResponsiveContent()` - Content switcher
- `useResponsiveColumns()` - Grid calculator
- `useSafeAreaInsets()` - Mobile safe area
- `useResponsiveTextSize()` - Text size
- `useScrollPosition()` - Scroll tracker
- `useIsVisible()` - Intersection observer
- `useWindowFocus()` - Window focus
- `usePreferredColorScheme()` - Theme preference

**Common Use Cases:**
- Responsive layouts
- Conditional rendering
- Device-specific features
- Performance optimization

---

### Theme System
**File:** `src/styles/theme-enhancements.css`

Features:
- Emerald green color palette (50-950)
- BIM-specific colors (carbon indicators)
- Dark mode with proper contrast
- Thai font support (Noto Sans Thai)
- High contrast mode
- Reduced motion support
- Print styles
- Responsive utilities

Classes:
- `.bg-emerald-primary` - Emerald background
- `.text-emerald-primary` - Emerald text
- `.carbon-low/medium/high` - Carbon indicators
- `.thai-text` - Thai typography
- `.safe-top/bottom/left/right` - Safe areas
- `.focus-emerald` - Emerald focus ring
- `.loading-shimmer` - Loading animation

**Common Use Cases:**
- Brand colors
- Carbon visualization
- Thai text display
- Dark mode styling

---

## 🎯 Common Workflows

### 1. Fetching Data
```tsx
// Loading → Error/Empty/Success pattern
import { DashboardSkeleton } from '@/components/ui/loading-states';
import { ErrorState } from '@/components/ui/error-states';
import { NoData } from '@/components/ui/empty-states';

if (isLoading) return <DashboardSkeleton />;
if (error) return <ErrorState title="Error" message={error.message} onRetry={refetch} />;
if (!data || data.length === 0) return <NoData />;
return <DataView data={data} />;
```

### 2. Form Submission
```tsx
// Validation → Loading → Success/Error
import { ValidationErrors } from '@/components/ui/error-states';
import { InlineLoading } from '@/components/ui/loading-states';
import { SuccessToasts } from '@/components/ui/success-states';

if (errors.length > 0) return <ValidationErrors errors={errors} />;
if (isSubmitting) return <InlineLoading text="Submitting..." />;

// On success:
SuccessToasts.saved('Settings');
```

### 3. Responsive Layout
```tsx
// Device-specific rendering
import { useIsMobile, useDeviceType } from '@/hooks/use-responsive';

const isMobile = useIsMobile();
const deviceType = useDeviceType();

return (
  <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
    {/* content */}
  </div>
);
```

---

## 🔍 Finding What You Need

### By Use Case

**Loading something?**
→ See `loading-states.tsx`

**Handling errors?**
→ See `error-states.tsx`

**Nothing to display?**
→ See `empty-states.tsx`

**Confirming success?**
→ See `success-states.tsx`

**Making it accessible?**
→ See `accessibility.tsx`

**Making it responsive?**
→ See `use-responsive.ts`

**Styling it?**
→ See `theme-enhancements.css`

### By Component Name

Use your IDE's file search (Cmd/Ctrl + P) and search for:
- `loading-states` for loading components
- `error-states` for error components
- `empty-states` for empty components
- `success-states` for success components
- `accessibility` for a11y components
- `use-responsive` for responsive hooks

---

## 📖 Learning Path

### Beginner
1. Read `UI_UX_QUICK_REFERENCE.md`
2. Copy examples from `IMPLEMENTATION_EXAMPLES.tsx`
3. Test with `UI_UX_VERIFICATION_CHECKLIST.md`

### Intermediate
1. Read `03-UI-UX-POLISH-SUMMARY.md`
2. Explore component source code
3. Customize components for your needs

### Advanced
1. Extend the component library
2. Add new responsive hooks
3. Contribute theme enhancements

---

## 🧪 Testing Guide

See `UI_UX_VERIFICATION_CHECKLIST.md` for complete testing procedures.

Quick checks:
- [ ] Components render correctly
- [ ] Keyboard navigation works
- [ ] Screen reader announces properly
- [ ] Responsive at all breakpoints
- [ ] Dark mode switches smoothly
- [ ] Performance is acceptable

---

## 🚀 Quick Links

- [Quick Reference](./UI_UX_QUICK_REFERENCE.md)
- [Examples](./IMPLEMENTATION_EXAMPLES.tsx)
- [Complete Summary](./.planning/phases/05-professional-output-polish/03-UI-UX-POLISH-SUMMARY.md)
- [Testing Checklist](./.planning/phases/05-professional-output-polish/UI_UX_VERIFICATION_CHECKLIST.md)
- [Phase Report](./.planning/phases/05-professional-output-polish/PHASE_5_PLAN_3_REPORT.md)

---

## 📞 Support

### Questions?
1. Check the Quick Reference
2. Review Implementation Examples
3. Read the Complete Summary
4. Ask the development team

### Found a bug?
1. Check the Verification Checklist
2. Report via GitHub Issues
3. Include screenshots and steps to reproduce

### Need a new component?
1. Check if it can be composed from existing components
2. Propose the new component to the team
3. Follow the existing patterns

---

**Last Updated:** 2026-03-24
**Version:** 1.0
**Maintainer:** Development Team
