# UI/UX Component Quick Reference

> **Quick guide for developers** - Common patterns and component usage for BKS cBIM AI project

---

## 🎯 Common Patterns

### Loading State
```tsx
import { DashboardSkeleton } from '@/components/ui/loading-states';

function MyComponent() {
  const { data, isLoading } = useQuery('key');

  if (isLoading) return <DashboardSkeleton />;
  return <div>{/* content */}</div>;
}
```

### Error Handling
```tsx
import { ErrorState } from '@/components/ui/error-states';

if (error) {
  return (
    <ErrorState
      title="Failed to load"
      message={error.message}
      onRetry={refetch}
      showRetry
    />
  );
}
```

### Empty State
```tsx
import { NoDocuments } from '@/components/ui/empty-states';

if (items.length === 0) {
  return <NoDocuments onUpload={handleUpload} onCreate={handleCreate} />;
}
```

### Success Toast
```tsx
import { SuccessToasts } from '@/components/ui/success-states';

async function handleSave() {
  await saveData();
  SuccessToasts.saved('Project');
}
```

### Responsive Hook
```tsx
import { useIsMobile } from '@/hooks/use-responsive';

function MyComponent() {
  const isMobile = useIsMobile();
  return <div className={isMobile ? 'mobile-layout' : 'desktop-layout'} />;
}
```

---

## 📦 Component Categories

### Loading States (`@/components/ui/loading-states`)
| Component | Use Case |
|-----------|----------|
| `Spinner` | Generic loading indicator |
| `FullPageLoading` | Initial page load |
| `DashboardSkeleton` | Dashboard loading |
| `TableSkeleton` | Table data loading |
| `ListSkeleton` | List items loading |
| `GridSkeleton` | Grid items loading |
| `ProgressLoading` | File upload progress |
| `InlineLoading` | Button/section loading |

### Error States (`@/components/ui/error-states`)
| Component | Use Case |
|-----------|----------|
| `ErrorState` | Full page error |
| `InlineError` | Form/section error |
| `FieldError` | Input validation error |
| `NetworkError` | Connection lost |
| `NotFoundError` | 404 page |
| `PermissionDeniedError` | 403 page |
| `ValidationErrors` | Multiple form errors |

### Empty States (`@/components/ui/empty-states`)
| Component | Use Case |
|-----------|----------|
| `NoResults` | Search returned nothing |
| `NoDocuments` | No files uploaded |
| `EmptyInbox` | No notifications |
| `NoData` | No data available |
| `FirstTimeExperience` | Onboarding flow |

### Success States (`@/components/ui/success-states`)
| Function/Component | Use Case |
|-------------------|----------|
| `SuccessToasts.saved()` | Save confirmation |
| `SuccessToasts.created()` | Create confirmation |
| `SuccessToasts.copied()` | Copy to clipboard |
| `SuccessModal` | Important confirmation |
| `InlineSuccess` | Section success |

### Accessibility (`@/components/ui/accessibility`)
| Component | Use Case |
|-----------|----------|
| `SkipToContent` | Skip nav link |
| `FormField` | Accessible form input |
| `IconButton` | Icon-only button with label |
| `Landmarks.Main` | Main content area |

---

## 🎨 Theme Classes

### Emerald Green
```tsx
<div className="bg-emerald-primary text-white">Carbon footprint</div>
<span className="text-emerald-primary">Eco-friendly</span>
<div className="border-emerald-primary">Border</div>
```

### Carbon Indicators
```tsx
<span className="carbon-low">Low emissions</span>
<span className="carbon-medium">Medium emissions</span>
<span className="carbon-high">High emissions</span>
```

### Thai Text
```tsx
<p className="thai-text" lang="th">ข้อความภาษาไทย</p>
```

### Safe Areas (Mobile)
```tsx
<div className="safe-top safe-bottom">Content</div>
```

---

## 🔧 Responsive Hooks

```tsx
import {
  useIsMobile,      // true if width < 768px
  useIsTablet,      // true if 768px ≤ width < 1280px
  useIsDesktop,     // true if width ≥ 1280px
  useDeviceType,    // 'mobile' | 'tablet' | 'desktop' | 'wide'
  useOrientation,   // 'portrait' | 'landscape'
  useViewportSize,  // { width, height }
} from '@/hooks/use-responsive';
```

---

## ♿ Accessibility Checklist

- [ ] All images have `alt` text
- [ ] Buttons have `aria-label` (if icon-only)
- [ ] Forms use `FormField` component
- [ ] Modals have focus trap
- [ ] Page has `<SkipToContent />` link
- [ ] Loading states have `sr-only` text
- [ ] Error messages use `role="alert"`
- [ ] Color contrast ≥4.5:1 verified

---

## 🎯 Best Practices

### Loading States
✅ Use skeleton screens that match content layout
✅ Show progress for operations >2 seconds
✅ Provide cancel option for long operations
❌ Don't use generic spinners everywhere

### Error Messages
✅ Explain what happened clearly
✅ Provide actionable recovery steps
✅ Use appropriate severity (error/warning/info)
❌ Don't show technical stack traces to users

### Empty States
✅ Guide users to next action
✅ Show relevant examples/templates
✅ Provide clear CTAs
❌ Don't leave users wondering what to do

### Success Confirmations
✅ Confirm important actions
✅ Auto-dismiss after 3-4 seconds
✅ Provide quick actions when relevant
❌ Don't interrupt user flow unnecessarily

---

## 📱 Responsive Breakpoints

| Device | Width | Use Case |
|--------|-------|----------|
| Mobile | 375px+ | Minimum supported |
| Tablet | 768px+ | iPad portrait |
| Desktop | 1280px+ | Standard desktop |
| Wide | 1920px+ | Large monitors |

---

## 🌙 Dark Mode

Theme automatically switches based on system preference. Manual toggle via next-themes:

```tsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle theme
    </button>
  );
}
```

---

## 🔍 Testing Commands

```bash
# Lighthouse CI
npm run lighthouse

# Accessibility scan
npm run a11y

# Visual regression tests
npm run test:visual

# Bundle size analysis
npm run analyze
```

---

## 📚 Full Documentation

See `/planning/phases/05-professional-output-polish/03-UI-UX-POLISH-SUMMARY.md` for complete implementation details.

---

**Last Updated:** 2026-03-24
