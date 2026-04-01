# 🌿 BKS cBIM AI Luxury Forest Design System

**Premium Design System for Sustainable Architecture & Green Building Management**

Inspired by: CarbonBank Tree Bank + Luxury Material Design + Nature-Driven Aesthetics

---

## 🎨 Color Palette

### Primary Colors (Forest Emerald)

```css
/* Deep Forest Green - Primary Brand */
--primary-950: #022c22;  /* Deepest forest */
--primary-900: #064e3b;  /* Main brand dark */
--primary-800: #065f46;  /* Dark variant */
--primary-700: #047857;  /* Standard green */
--primary-600: #059669;  /* Bright green */
--primary-500: #10b981;  /* Accent green ⭐ */
--primary-400: #34d399;  /* Light accent */
--primary-300: #6ee7b7;  /* Hover state */
--primary-200: #a7f3d0;  /* Subtle highlight */
--primary-100: #d1fae5;  /* Background tint */
--primary-50:  #ecfdf5;  /* Lightest tint */
```

### Success & Carbon Credits

```css
--success-600: #16a34a;  /* Success actions */
--success-500: #22c55e;  /* Carbon positive */
--success-400: #4ade80;  /* Achievement unlock */
--success-300: #86efac;  /* Milestone badge */
```

### Warning & Alerts

```css
--warning-600: #ca8a04;  /* Needs attention */
--warning-500: #eab308;  /* Solar energy */
--warning-400: #facc15;  /* Highlight */
```

### Error & Critical

```css
--error-600: #dc2626;   /* Critical alert */
--error-500: #ef4444;   /* Error state */
--error-400: #f87171;   /* Warning */
```

### Neutrals (Dark Mode First)

```css
/* Background Layers */
--bg-base:    #0a0f0d;  /* Body background */
--bg-elevated: #12171d; /* Card background */
--bg-overlay:  #1e2730; /* Modal/dropdown */

/* Surface Colors (with transparency) */
--surface-glass: rgba(15, 25, 20, 0.7);  /* Glassmorphism */
--surface-card:  rgba(15, 25, 20, 0.6);  /* Cards */
--surface-hover: rgba(16, 185, 129, 0.08); /* Hover state */

/* Text Hierarchy */
--text-primary:   #f0fdf4;  /* Headings, important */
--text-secondary: #86efac;  /* Body text */
--text-tertiary:  #6ee7b7;  /* Captions, meta */
--text-disabled:  #047857;  /* Disabled state */

/* Borders */
--border-subtle: rgba(16, 185, 129, 0.15);
--border-default: rgba(16, 185, 129, 0.25);
--border-strong: rgba(16, 185, 129, 0.4);
--border-accent: #10b981;
```

### Gradients (Luxury Touch)

```css
/* Hero Gradients */
--gradient-hero: linear-gradient(135deg, #064e3b 0%, #047857 100%);
--gradient-card: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);

/* Button Gradients */
--gradient-btn-primary: linear-gradient(135deg, #10b981 0%, #059669 100%);
--gradient-btn-success: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);

/* Text Gradients */
--gradient-text-emerald: linear-gradient(135deg, #10b981 0%, #34d399 100%);
--gradient-text-gold: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);

/* Ambient Background */
--gradient-ambient: radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
```

---

## 📐 Spacing & Layout

### Spacing Scale (4px base unit)

```css
--space-1:  0.25rem;  /*  4px */
--space-2:  0.5rem;   /*  8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Border Radius (Soft & Modern)

```css
--radius-sm:  0.375rem;  /* 6px  - Chips, badges */
--radius-md:  0.5rem;    /* 8px  - Buttons, inputs */
--radius-lg:  0.75rem;   /* 12px - Cards */
--radius-xl:  1rem;      /* 16px - Modals, large cards */
--radius-2xl: 1.5rem;    /* 24px - Hero sections */
--radius-full: 9999px;   /* Full round - Pills, avatars */
```

### Container Widths

```css
--container-sm:  640px;  /* Mobile portrait */
--container-md:  768px;  /* Mobile landscape / Tablet portrait */
--container-lg:  1024px; /* Tablet landscape / Small desktop */
--container-xl:  1280px; /* Desktop */
--container-2xl: 1536px; /* Large desktop */
```

---

## ✍️ Typography

### Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
--font-thai: 'Sarabun', 'Noto Sans Thai', sans-serif;
```

### Font Sizes (Fluid Scale)

```css
--text-xs:   0.75rem;   /* 12px - Captions, labels */
--text-sm:   0.875rem;  /* 14px - Body small */
--text-base: 1rem;      /* 16px - Body text */
--text-lg:   1.125rem;  /* 18px - Large body */
--text-xl:   1.25rem;   /* 20px - Section titles */
--text-2xl:  1.5rem;    /* 24px - Page titles */
--text-3xl:  1.875rem;  /* 30px - Headings */
--text-4xl:  2.25rem;   /* 36px - Hero headings */
--text-5xl:  3rem;      /* 48px - Display */
--text-6xl:  3.75rem;   /* 60px - Marketing hero */
```

### Font Weights

```css
--font-light:     300;
--font-regular:   400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-extrabold: 800;
```

### Line Heights

```css
--leading-tight:  1.25;  /* Headings */
--leading-snug:   1.375; /* Subheadings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.625; /* Long-form content */
--leading-loose:  2;     /* Spacious paragraphs */
```

### Letter Spacing

```css
--tracking-tighter: -0.05em;  /* Large display text */
--tracking-tight:   -0.025em; /* Headings */
--tracking-normal:  0;        /* Body text */
--tracking-wide:    0.025em;  /* Buttons */
--tracking-wider:   0.05em;   /* Labels */
--tracking-widest:  0.1em;    /* Uppercase labels */
```

---

## 🎭 Shadows & Elevation

### Shadow Levels

```css
/* Subtle depth */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Default card elevation */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* Elevated components */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* Modals, dropdowns */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Maximum elevation */
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Colored shadows (Luxury touch) */
--shadow-primary: 0 8px 24px rgba(16, 185, 129, 0.25),
                  0 0 0 1px rgba(16, 185, 129, 0.15);

--shadow-primary-lg: 0 12px 40px rgba(16, 185, 129, 0.35),
                     0 0 0 1px rgba(16, 185, 129, 0.25);

--shadow-success: 0 8px 24px rgba(34, 197, 94, 0.3);

/* Glow effects */
--glow-primary: 0 0 20px rgba(16, 185, 129, 0.4);
--glow-success: 0 0 20px rgba(34, 197, 94, 0.4);
```

---

## 🪟 Glassmorphism Effects

```css
.glass-card {
  background: rgba(15, 25, 20, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-nav {
  background: rgba(15, 25, 20, 0.8);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-top: 1px solid rgba(16, 185, 129, 0.2);
}

.glass-overlay {
  background: rgba(10, 15, 13, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

---

## 🎬 Animations & Transitions

### Timing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Durations

```css
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;
```

### Keyframes (Staggered Animations)

```css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
  }
}

@keyframes rotate-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

### Usage Examples

```css
.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out forwards;
  opacity: 0;
}

/* Staggered animations */
.stagger-children > * {
  animation: slide-up 0.5s ease-out forwards;
  opacity: 0;
}

.stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
.stagger-children > *:nth-child(5) { animation-delay: 0.5s; }
```

---

## 🧩 Component Patterns

### Hero Card (Dashboard Main Asset)

```tsx
<div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-[2rem] p-7 text-white shadow-2xl shadow-primary-900/20 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all">
  {/* Glossy Effect */}
  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/15 transition duration-700" />

  {/* Texture Overlay */}
  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-10" />

  {/* Content */}
  <div className="relative z-10">
    <h2 className="text-3xl font-extrabold mb-2 tracking-tight">
      {totalCarbonAssets.toLocaleString()} kg
    </h2>
    <p className="text-sm text-primary-200 font-medium">
      Total Carbon Credits
    </p>
  </div>
</div>
```

### Metric Card

```tsx
<div className="glass-card rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-primary cursor-pointer border-l-4 border-primary-500">
  <div className="text-4xl font-extrabold text-primary-500 mb-2 bg-gradient-text-emerald bg-clip-text text-transparent">
    92%
  </div>
  <div className="text-xs uppercase tracking-widest text-text-tertiary font-semibold mb-2">
    Energy Efficiency
  </div>
  <div className="flex items-center gap-2 text-sm font-semibold text-success-400">
    <span>↗</span>
    <span>+18% vs baseline</span>
  </div>
</div>
```

### Quick Action Button

```tsx
<button className="flex flex-col items-center justify-center space-y-2 group">
  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary-500/10 border border-primary-500/30 group-hover:bg-primary-500/20 group-hover:border-primary-500/50 group-active:scale-90 transition-all duration-300">
    <Icon size={24} className="text-primary-500" strokeWidth={2.5} />
  </div>
  <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
    Scan Tree
  </span>
</button>
```

### Data Row (System Status)

```tsx
<div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 bg-surface-card/50 rounded-xl hover:bg-surface-hover transition-all border border-border-subtle hover:border-border-default">
  <div className="text-sm font-medium text-text-primary">
    Solar Panel Array
  </div>
  <div className="text-sm font-bold text-primary-500 font-mono">
    247.8 kW
  </div>
  <div className="w-2.5 h-2.5 rounded-full bg-success-500 animate-pulse" />
</div>
```

### Achievement Badge

```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 bg-success-500/15 border border-success-500 text-success-400 rounded-full text-xs font-bold shadow-success">
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
  <span>Carbon Neutral Certified</span>
</div>
```

### Bottom Navigation

```tsx
<nav className="glass-nav fixed bottom-0 left-0 right-0 z-50">
  <div className="flex justify-around items-center px-6 py-3 max-w-md mx-auto">
    {navItems.map((item) => (
      <button
        key={item.id}
        className={`flex flex-col items-center gap-1 transition-all duration-200 ${
          active === item.id
            ? 'text-primary-500 scale-110'
            : 'text-text-tertiary hover:text-text-secondary'
        }`}
      >
        <item.icon size={24} strokeWidth={active === item.id ? 2.5 : 2} />
        <span className="text-[10px] font-semibold">{item.label}</span>
      </button>
    ))}
  </div>
</nav>
```

---

## 🌐 Responsive Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## ♿ Accessibility

### Focus States

```css
.focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus-ring:focus-visible {
  outline-color: var(--primary-500);
  outline-offset: 2px;
}
```

### Screen Reader Only

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 🎯 Usage Guidelines

### When to Use Primary Green
- Call-to-action buttons
- Active states and selections
- Carbon credit metrics
- Success indicators
- Brand elements

### When to Use Success Colors
- Achievement unlocks
- Carbon offset milestones
- Completed actions
- Positive trends
- Environmental metrics

### When to Use Warning Colors
- Solar energy indicators
- Attention-needed states
- Pending approvals
- Energy consumption alerts

### When to Use Glassmorphism
- Navigation bars (top/bottom)
- Modal overlays
- Floating action buttons
- Dropdown menus
- Temporary panels

### Animation Best Practices
1. **Stagger child animations** by 100ms for smooth reveals
2. **Use spring physics** for touch interactions (active:scale-[0.98])
3. **Limit to 300ms** for most transitions
4. **Respect `prefers-reduced-motion`** media query
5. **Animate transforms, not layout properties** (use `transform` over `width`)

---

## 🚀 Implementation Checklist

- [ ] Install Inter font from Google Fonts
- [ ] Install Sarabun (Thai) font for Thai language support
- [ ] Configure Tailwind CSS with custom color palette
- [ ] Set up CSS custom properties for theming
- [ ] Implement dark mode as default
- [ ] Add glassmorphism utility classes
- [ ] Configure animation keyframes
- [ ] Set up responsive breakpoints
- [ ] Implement focus-visible states
- [ ] Add haptic feedback for mobile (navigator.vibrate)
- [ ] Configure PWA with theme-color
- [ ] Optimize for iOS Safe Area insets

---

## 📦 Recommended Libraries

```json
{
  "dependencies": {
    "react": "^18.x",
    "tailwindcss": "^3.x",
    "framer-motion": "^11.x",
    "lucide-react": "^0.x",
    "recharts": "^2.x",
    "@radix-ui/react-*": "^1.x"
  }
}
```

---

## 🎨 Figma Design Tokens Export

Export these tokens to Figma for design handoff:

```json
{
  "colors": {
    "primary": { "500": "#10b981", "600": "#059669", "700": "#047857" },
    "success": { "400": "#4ade80", "500": "#22c55e" },
    "text": { "primary": "#f0fdf4", "secondary": "#86efac" }
  },
  "spacing": { "4": "16px", "6": "24px", "8": "32px" },
  "borderRadius": { "lg": "12px", "xl": "16px", "2xl": "24px" },
  "shadows": {
    "primary": "0 8px 24px rgba(16,185,129,0.25)"
  }
}
```

---

## 📖 Reference Projects

1. **CarbonBank Tree Bank** - Mobile-first tree tracking with AI
2. **Apple Human Interface Guidelines** - Glassmorphism patterns
3. **Material Design 3** - Dynamic color and motion
4. **Vercel Design System** - Modern, minimal aesthetics
5. **Stripe Dashboard** - Professional data visualization

---

## 🌱 Next Steps

1. **Implement the playground** - Use `luxury-forest-theme.html` as interactive reference
2. **Build component library** - Create reusable React components
3. **Set up theme provider** - Context for light/dark mode
4. **Add animations** - Implement micro-interactions
5. **Test accessibility** - WCAG 2.1 AA compliance
6. **Optimize performance** - Lazy loading, code splitting
7. **Localize** - Support Thai language throughout

---

**Last Updated:** March 24, 2026
**Version:** 1.0.0
**Maintained by:** BKS cBIM AI Team
