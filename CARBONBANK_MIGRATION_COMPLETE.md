# 🌳 CarbonBank Theme Migration - Complete

## ✅ What Was Done

I've created an **exact replica** of the CarbonBank Tree Bank design system in an interactive playground with authentic colors, patterns, and animations from your reference app.

---

## 📦 File Created

### `carbonbank-theme-playground.html`

**Access:** `http://localhost:8080/carbonbank-theme-playground.html`

**Features:**
- ✅ Authentic CarbonBank theme (light background #F8F9FA)
- ✅ Exact hero gradient: #064e3b → #065f46 → #047857
- ✅ Sarabun Thai font (Google Fonts)
- ✅ White cards with subtle shadows
- ✅ Colorful quick actions (indigo, emerald, blue, orange)
- ✅ Glossy hero effect with texture overlay
- ✅ Staggered slide-up animations (100ms delays)
- ✅ Mobile-first PWA patterns
- ✅ 4 theme presets (CarbonBank, Forest Dark, Emerald, Jade)

---

## 🎨 Authentic CarbonBank Design Patterns

### 🌍 Background
```css
body: #F8F9FA (light gray, almost white)
controls: #1f2937 (dark sidebar)
```

### 🏔️ Hero Card
```css
gradient: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)
border-radius: 32px (2rem)
padding: 28px
box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1)

/* Glossy Effect */
position: absolute top-right
background: rgba(255,255,255,0.1)
blur: 48px

/* Texture Overlay */
background-image: cubes pattern
opacity: 0.1
```

### 👤 Header
```css
greeting: text-2xl font-bold text-gray-900
project-badge: text-[10px] font-bold text-gray-400 uppercase
pulse-dot: w-2 h-2 bg-green-500 animate-pulse

notification-btn: bg-white rounded-full shadow-sm
notification-dot: w-2 h-2 bg-red-500

avatar: w-10 h-10 bg-gradient from-green-400 to-green-600
```

### 🎯 Quick Actions
```css
action-btn: w-14 h-14 bg-white rounded-2xl
border: 1px solid rgba(229,231,235,0.5)
shadow: 0 1px 2px rgba(0,0,0,0.05)

colors:
- indigo: #6366f1 (โฉนด - Land Deed)
- emerald: #10b981 (กระเป๋า - Wallet)
- blue: #3b82f6 (ข่าวสาร - News)
- orange: #f97316 (อันดับ - Ranking)

hover: background changes to light tint
active: transform scale(0.9)
```

### 📊 Chart Section
```css
background: white
border-radius: 24px
padding: 20px
border: 1px solid #e5e7eb
shadow: 0 1px 2px rgba(0,0,0,0.05)

chart-title: text-lg font-bold text-gray-900
chart-filter: bg-white border rounded-full text-gray-600
```

### ✨ Animations
```css
@keyframes slideUp {
  from: opacity 0, translateY(20px)
  to: opacity 1, translateY(0)
}

timing: cubic-bezier(0.16, 1, 0.3, 1) (ease-out-expo)
duration: 0.5s
delays: 0.1s, 0.2s, 0.3s, 0.4s, 0.5s, 0.6s (staggered)
```

---

## 🎭 Theme Presets

### 1. 🌲 CarbonBank (Default - Authentic)
```css
Hero: #064e3b → #065f46 → #047857
Radius: 32px
Padding: 28px
Font: Bold (700)
Action Hover: #f0fdf4 (green-50)
```
**Use for:** Exact CarbonBank replication

### 2. 🌿 Forest Dark (Deeper)
```css
Hero: #022c22 → #064e3b → #065f46
Radius: 28px
Padding: 24px
Font: Bold (700)
Action Hover: #ecfdf5
```
**Use for:** Darker, more premium variation

### 3. 💚 Emerald (Vibrant)
```css
Hero: #065f46 → #059669 → #10b981
Radius: 36px
Padding: 32px
Font: Extra Bold (800)
Action Hover: #d1fae5
```
**Use for:** Bright, energetic feel

### 4. 🟢 Jade (Light & Fresh)
```css
Hero: #047857 → #10b981 → #34d399
Radius: 40px
Padding: 36px
Font: Bold (700)
Action Hover: #a7f3d0
```
**Use for:** Light, optimistic tone

---

## 🚀 How to Use

### 1. Open the Playground
```bash
# Already running on port 8080
open http://localhost:8080/carbonbank-theme-playground.html
```

### 2. Explore Presets
- Click "🌲 CarbonBank" for authentic theme
- Try "💚 Emerald" for vibrant variation
- Test "🟢 Jade" for light & fresh feel

### 3. Customize Colors
- Adjust "Hero Card Gradient" sliders
- Change "Hero Radius" for rounded corners
- Modify "Card Padding" for spacing
- Set "Font Weight" for typography

### 4. Copy the Prompt
- Click "คัดลอกคำสั่ง Design" (green button)
- Paste into Claude to generate matching code

---

## 📋 Extracted From CarbonBank

### Key Files Analyzed:
1. `CarbonBank_extracted/index.html` - Theme colors, fonts, animations
2. `CarbonBank_extracted/components/Dashboard.tsx` - Component patterns
3. `CarbonBank_extracted/types.ts` - Data models

### Design Tokens Extracted:
```css
/* Colors */
--primary: #10b981 (emerald-500)
--bg-light: #F8F9FA
--hero-gradient-start: #064e3b (emerald-900)
--hero-gradient-mid: #065f46 (emerald-800)
--hero-gradient-end: #047857 (emerald-700)
--text-primary: #1f2937 (gray-900)
--text-secondary: #6b7280 (gray-600)
--text-tertiary: #9ca3af (gray-400)

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1)
--shadow-hero: 0 20px 25px -5px rgba(0,0,0,0.1), 0 0 0 1px rgba(6,78,59,0.2)

/* Border Radius */
--rounded-xl: 12px
--rounded-2xl: 16px
--rounded-3xl: 24px
--rounded-hero: 32px

/* Typography */
--font-family: 'Sarabun', sans-serif
--font-xs: 10px (uppercase labels)
--font-sm: 12px (action labels)
--font-base: 14px (body)
--font-lg: 18px (section titles)
--font-xl: 20px (stat values)
--font-2xl: 24px (greeting)
--font-3xl: 36px (hero value)

/* Spacing */
--space-xs: 6px
--space-sm: 8px
--space-md: 12px
--space-lg: 16px
--space-xl: 24px
--space-2xl: 28px

/* Timing */
--duration-fast: 0.2s
--duration-base: 0.3s
--duration-slow: 0.5s
--easing: cubic-bezier(0.16, 1, 0.3, 1)
```

---

## 🎯 Component Patterns

### Hero Card Pattern (Exact Match)
```tsx
<div className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] rounded-[2rem] p-7 text-white shadow-2xl shadow-green-900/20 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all">
  {/* Glossy Effect */}
  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/15 transition duration-700" />

  {/* Texture Overlay */}
  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-10" />

  {/* Content */}
  <div className="relative z-10">
    <div className="flex items-center space-x-2 text-green-200 mb-1">
      <Sparkles size={12} />
      <span className="text-[10px] font-bold tracking-widest uppercase">
        Total Valuation
      </span>
    </div>
    <h2 className="text-4xl font-bold tracking-tighter">
      ฿8,541.00
    </h2>

    {/* Stat Cards */}
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
        <span className="text-[10px] text-green-200/80 uppercase font-bold">
          Carbon Credit
        </span>
        <div className="text-xl font-bold">2,847 <span className="text-xs">kg</span></div>
      </div>
    </div>
  </div>
</div>
```

### Quick Action Pattern (Exact Match)
```tsx
<button className="flex flex-col items-center justify-center space-y-2 group w-full">
  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-gray-50/50 bg-white hover:bg-indigo-50 group-active:scale-90 transition-all duration-300 ease-out">
    <Icon size={24} className="text-indigo-600" strokeWidth={2.5} />
  </div>
  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
    โฉนด
  </span>
</button>
```

### Staggered Animation Pattern (Exact Match)
```tsx
<div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
  {/* First element */}
</div>
<div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
  {/* Second element */}
</div>
<div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
  {/* Third element */}
</div>
```

---

## 📱 Mobile PWA Features

### From CarbonBank index.html:
```html
<!-- Viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />

<!-- Theme Color -->
<meta name="theme-color" content="#ffffff" />

<!-- iOS PWA -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="CarbonBank">

<!-- Manifest -->
<link rel="manifest" href="/manifest.json" />

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<!-- User Experience -->
<style>
  body {
    font-family: 'Sarabun', sans-serif;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
    overscroll-behavior-y: none;
  }

  /* Safe Area for iPhone notch */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }
</style>
```

---

## 🔄 Differences from Luxury Forest Theme

| Aspect | CarbonBank (New) | Luxury Forest (Old) |
|--------|------------------|---------------------|
| Background | #F8F9FA (light) | #0a0f0d (dark) |
| Cards | White with shadows | Dark glass with blur |
| Hero Gradient | #064e3b → #065f46 → #047857 | Same but darker context |
| Typography | Sarabun Thai | Inter |
| Quick Actions | White bg, colored icons | Dark bg, monochrome icons |
| Shadows | Subtle, light | Dramatic, colored glows |
| Overall Feel | Clean, professional, light | Luxury, premium, dark |
| Best For | Mobile PWA, Thai market | Executive dashboards |

---

## ✨ Key Insights

**Why CarbonBank Theme Works:**

1. **Light Background** - Less eye strain for outdoor use (farmers, field workers)
2. **Colorful Actions** - Easy to distinguish functions at a glance
3. **Thai Font** - Native language support with Sarabun
4. **Mobile-First** - Optimized for 320px-480px screens
5. **PWA Patterns** - Feels like native app
6. **Staggered Animations** - Professional, not overwhelming
7. **Glossy Hero** - Premium feel without being dark
8. **Subtle Shadows** - Depth without drama

---

## 🚢 Next Steps

### 1. Integrate into BKS cBIM AI
```bash
cd apps/frontend
npm install lucide-react recharts
```

### 2. Copy Design Tokens
- Open `carbonbank-theme-playground.html`
- Click presets to find your preferred variation
- Copy the generated prompt
- Paste into Claude to generate React components

### 3. Implement Components
```tsx
import { HeroCard, QuickActionButton, DataRow } from '@/components/carbonbank';

<HeroCard
  title="TOTAL CARBON CREDITS"
  value="฿8,541.00"
  trend="+12.5%"
  stats={[
    { label: 'Carbon Credit', value: '2,847', unit: 'kg' },
    { label: 'Active Trees', value: '189', unit: 'Trees' }
  ]}
/>
```

### 4. Add Thai Language
```tsx
// i18n/th.json
{
  "greeting": "สวัสดี, คุณ{name}",
  "carbon_credit": "คาร์บอนเครดิต",
  "active_trees": "ต้นไม้ที่มีชีวิต",
  "land_deed": "โฉนด",
  "wallet": "กระเป๋า",
  "news": "ข่าวสาร",
  "ranking": "อันดับ"
}
```

### 5. Set Up PWA
```json
// manifest.json
{
  "name": "BKS cBIM AI",
  "short_name": "BKS",
  "theme_color": "#10b981",
  "background_color": "#F8F9FA",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/"
}
```

---

## 📚 Reference Files

- **Original:** `CarbonBank_extracted/`
- **Playground:** `carbonbank-theme-playground.html`
- **Screenshots:**
  - `carbonbank-playground.png` (Default theme)
  - `carbonbank-annotated.png` (Interactive elements labeled)
  - `carbonbank-emerald.png` (Emerald variation)

---

**Created:** March 24, 2026
**Version:** 1.0.0 (Authentic CarbonBank Migration)
**Status:** ✅ Complete - Ready for Production
**Thai Support:** ✅ Sarabun Font Included
**PWA Ready:** ✅ Mobile-First Patterns
