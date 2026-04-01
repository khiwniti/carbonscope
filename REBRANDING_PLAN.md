# BKS cBIM AI Rebranding Plan
**From**: BKS / cBIM AI  
**To**: BKS / cBIM AI  
**Design System**: CarbonScope (Dark Engineering + Emerald Green)

## Project Overview
Complete rebranding of the production application at https://carbon-bim.ensimu.space including brand identity, design system implementation, and all user-facing elements.

## Milestone Breakdown

### Milestone 1: Brand Identity & Design System Setup
**Duration**: 3-5 days  
**Goal**: Establish new brand assets and design system foundation

#### Phase 1.1: Brand Assets Creation
- [ ] Design BKS logo (replace ◇ CarbonScope logo)
- [ ] Create cBIM AI wordmark
- [ ] Define brand colors (validate CarbonScope palette)
- [ ] Typography selection (currently: Instrument Serif, Plus Jakarta Sans, IBM Plex Mono)
- [ ] Icon system for cBIM-specific features
- [ ] Favicon and app icons

#### Phase 1.2: Design System Integration
- [ ] Extract CarbonScope design tokens to CSS variables/Tailwind config
- [ ] Document color palette (T.bg.*, T.green.*, T.lifecycle.*, T.status.*)
- [ ] Set up typography system (display, heading, body, mono, data fonts)
- [ ] Define spacing scale (T.spacing array)
- [ ] Configure radius values (sm: 6px, md: 10px, lg: 14px, xl: 20px)
- [ ] Shadow and elevation system
- [ ] Animation keyframes library (cs-fadeUp, cs-scaleIn, etc.)

#### Phase 1.3: Component Library Audit
- [ ] Inventory all existing BKS components
- [ ] Map to CarbonScope equivalents
- [ ] Identify custom components needed for cBIM
- [ ] Create component migration matrix

---

### Milestone 2: Frontend Implementation
**Duration**: 7-10 days  
**Goal**: Replace all UI components with CarbonScope design system

#### Phase 2.1: Core Components Migration
- [ ] Button variants (primary, secondary, ghost, danger)
- [ ] Input fields with labels and suffixes
- [ ] Badge system (default, success, warning, danger, info, accent)
- [ ] Toast notifications
- [ ] Skeleton loaders
- [ ] Dividers
- [ ] Tabs component
- [ ] Accordion component

#### Phase 2.2: Data Visualization Components
- [ ] KPI Cards with count-up animation
- [ ] Lifecycle Bar Chart (EN 15978 stages)
- [ ] EPD Cards (Environmental Product Declaration)
- [ ] Benchmark Gauge (LETI bands)
- [ ] Material Comparison Table
- [ ] Compliance Cards
- [ ] Stacked Bar Comparison

#### Phase 2.3: Layout Components
- [ ] Project Sidebar (replace existing nav)
- [ ] Top navigation bar
- [ ] Dashboard grid layout
- [ ] Section titles and typography hierarchy
- [ ] Page layouts and spacing

#### Phase 2.4: Theme Implementation
- [ ] Global CSS injection
- [ ] Color token CSS variables
- [ ] Dark mode base styles
- [ ] Scrollbar styling
- [ ] Font loading (@import Google Fonts)
- [ ] Animation keyframe definitions

---

### Milestone 3: Branding Updates
**Duration**: 3-4 days  
**Goal**: Update all text, copy, and branding elements

#### Phase 3.1: Application Text
- [ ] Page titles: "BKS cBIM AI" → "cBIM AI"
- [ ] App name references throughout codebase
- [ ] Meta tags and SEO titles
- [ ] Error messages and notifications
- [ ] Loading states and placeholders

#### Phase 3.2: Navigation & Menus
- [ ] Sidebar navigation labels
- [ ] Header/footer text
- [ ] Menu items and tooltips
- [ ] Breadcrumbs

#### Phase 3.3: Landing & Marketing Pages
- [ ] Hero section copy
- [ ] Feature descriptions
- [ ] Value propositions
- [ ] Call-to-action buttons
- [ ] Footer information

#### Phase 3.4: Documentation
- [ ] README.md updates
- [ ] API documentation
- [ ] User guides
- [ ] Inline code comments
- [ ] Environment variable names

---

### Milestone 4: Backend & API Updates
**Duration**: 2-3 days  
**Goal**: Update backend references and API responses

#### Phase 4.1: API Response Updates
- [ ] Application name in API metadata
- [ ] Error messages
- [ ] Email templates (if any)
- [ ] Notification messages

#### Phase 4.2: Configuration Updates
- [ ] Environment variable naming
- [ ] Config file updates
- [ ] Service names in docker-compose
- [ ] Database schema updates (if product name stored)

#### Phase 4.3: Integration Updates
- [ ] Supabase project naming
- [ ] GraphDB repository naming
- [ ] Redis key prefixes
- [ ] External API integrations

---

### Milestone 5: Asset Replacement
**Duration**: 2 days  
**Goal**: Replace all visual assets

#### Phase 5.1: Image Assets
- [ ] Logo files (SVG, PNG variants)
- [ ] Favicon set (16x16, 32x32, 180x180, etc.)
- [ ] Social media preview images (OG images)
- [ ] App icons for PWA
- [ ] Loading spinners/animations

#### Phase 5.2: Icon System
- [ ] Replace icon library (if using custom icons)
- [ ] Update icon colors to emerald green accent
- [ ] Lifecycle stage icons (EN 15978)
- [ ] Status indicator icons

---

### Milestone 6: Testing & Quality Assurance
**Duration**: 3-4 days  
**Goal**: Comprehensive testing of rebranded application

#### Phase 6.1: Visual QA
- [ ] Component consistency across all pages
- [ ] Color contrast validation (WCAG compliance)
- [ ] Typography hierarchy and readability
- [ ] Responsive design on all breakpoints
- [ ] Dark mode appearance
- [ ] Animation smoothness

#### Phase 6.2: Functional Testing
- [ ] All user workflows
- [ ] Form submissions
- [ ] Data visualization accuracy
- [ ] Navigation and routing
- [ ] Authentication flows
- [ ] API integration

#### Phase 6.3: Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

#### Phase 6.4: Performance Testing
- [ ] Page load times
- [ ] Animation performance
- [ ] Bundle size analysis
- [ ] Lighthouse scores

---

### Milestone 7: Deployment & Rollout
**Duration**: 1-2 days  
**Goal**: Deploy rebranded application to production

#### Phase 7.1: Pre-Deployment
- [ ] Backup current production database
- [ ] Document rollback procedure
- [ ] Prepare deployment checklist
- [ ] Review environment variables

#### Phase 7.2: Deployment
- [ ] Build new Docker images with rebrand
- [ ] Push to Azure Container Registry
- [ ] Update docker-compose.production.yml
- [ ] Deploy to coder-vm
- [ ] Verify all services healthy

#### Phase 7.3: Post-Deployment Verification
- [ ] Smoke test all critical paths
- [ ] Verify domain: https://carbon-bim.ensimu.space
- [ ] Check authentication flow
- [ ] Validate data display
- [ ] Test API endpoints

#### Phase 7.4: Monitoring
- [ ] Set up error tracking
- [ ] Monitor user feedback
- [ ] Track performance metrics
- [ ] Check for visual regressions

---

## Design System Reference

### Color Palette
```javascript
// Base backgrounds
bg.base: #0B1120 (darkest)
bg.surface: #111827
bg.elevated: #1A2332
bg.card: #162032

// Emerald Green accent
green[400]: #34D399 (primary accent)
green[500]: #10B981
green[600]: #059669 (buttons, borders)
green[800]: #065F46 (darker borders)

// EN 15978 Lifecycle stages
A1A3 (Product): #3B82F6 (blue)
A4A5 (Construction): #60A5FA (light blue)
B1B5 (Maintenance): #F59E0B (amber)
B6B7 (Operational): #EA580C (orange)
C1C4 (End of Life): #6B7280 (gray)
D (Beyond Lifecycle): #10B981 (green)
```

### Typography
```
Display: Instrument Serif (headlines, hero)
Heading: Plus Jakarta Sans (section titles)
Body: Plus Jakarta Sans (paragraphs, UI)
Mono: IBM Plex Mono (data, code, metrics)
Data: Tabular Nums variant (carbon values)
```

### Key Components to Implement
1. **KPICard** - Animated metrics with sparklines
2. **LifecycleBarChart** - EN 15978 stage breakdown
3. **EPDCard** - Material carbon data cards
4. **BenchmarkGauge** - LETI/RIBA compliance bands
5. **ComplianceCard** - Framework status indicators
6. **Badge** - Status and category labels
7. **Button** - 4 variants + sizes
8. **Toast** - Notification system

---

## File Structure Changes

### Frontend Files to Update
```
apps/frontend/
├── public/
│   ├── favicon.ico (NEW: BKS cBIM icon)
│   ├── logo.svg (NEW: BKS logo)
│   └── og-image.png (NEW: cBIM preview)
├── src/
│   ├── components/
│   │   ├── ui/ (NEW: CarbonScope components)
│   │   ├── layout/ (UPDATE: navigation, headers)
│   │   └── dashboard/ (UPDATE: all dashboard components)
│   ├── styles/
│   │   ├── carbonscope.css (NEW: design system)
│   │   ├── globals.css (UPDATE: remove old theme)
│   │   └── tokens.css (NEW: CSS variables)
│   ├── lib/
│   │   └── design-system.ts (NEW: TypeScript tokens)
│   └── pages/ (UPDATE: all page titles and copy)
└── package.json (UPDATE: name, description)
```

### Backend Files to Update
```
backend/
├── .env (UPDATE: APP_NAME, PROJECT_NAME)
├── app/
│   ├── core/
│   │   └── config.py (UPDATE: app metadata)
│   └── api/ (UPDATE: response metadata)
└── pyproject.toml (UPDATE: project name, description)
```

### Deployment Files to Update
```
├── docker-compose.production.yml (UPDATE: service names, labels)
├── README.md (COMPLETE REWRITE)
├── DEPLOYMENT_GUIDE.md (UPDATE: references)
└── .env.production.template (UPDATE: variable names)
```

---

## Risk Assessment

### High Risk
- **Database schema changes**: If product name stored in DB
- **API contract changes**: If external integrations depend on names
- **SEO impact**: Domain and meta tag changes
- **User confusion**: Existing users familiar with BKS cBIM AI brand

### Medium Risk
- **CSS conflicts**: Old styles mixing with new design system
- **Font loading**: Performance impact of Google Fonts
- **Animation performance**: CPU usage of keyframe animations
- **Bundle size**: Adding complete design system

### Low Risk
- **Color changes**: Purely visual, no functional impact
- **Typography**: Font fallbacks ensure readability
- **Component refactoring**: Atomic design approach minimizes breaks

---

## Success Criteria

### Visual
- [ ] 100% of UI matches CarbonScope design system
- [ ] No instances of "BKS" or "BKS cBIM AI" visible
- [ ] All colors use emerald green accent palette
- [ ] Typography hierarchy consistent throughout
- [ ] Dark mode optimized for engineering aesthetic

### Functional
- [ ] All existing features work identically
- [ ] No JavaScript errors in console
- [ ] Authentication flow unchanged
- [ ] Data display accurate
- [ ] Performance metrics maintained or improved

### Technical
- [ ] Lighthouse score > 90 (Performance, Accessibility, SEO)
- [ ] Bundle size increase < 15%
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Responsive on all breakpoints

### Business
- [ ] Brand identity clearly conveys carbon/BIM focus
- [ ] Professional appearance for enterprise clients
- [ ] Differentiation from competitors
- [ ] Scalable design system for future features

---

## Timeline Estimate
**Total Duration**: 21-28 days (3-4 weeks)

**Week 1**: Milestones 1-2 (Brand identity + Core components)  
**Week 2**: Milestone 3-4 (Branding updates + Backend)  
**Week 3**: Milestone 5-6 (Assets + Testing)  
**Week 4**: Milestone 7 + Buffer (Deployment + refinement)

---

## Next Steps

1. **Review this plan** - Validate scope and timeline
2. **Create GSD milestone** - `/gsd:new-milestone` with this plan
3. **Start Phase 1.1** - Begin with brand assets and logo design
4. **Set up component library** - Extract CarbonScope tokens
5. **Iterative implementation** - Execute phases sequentially with validation

---

**Document Version**: 1.0  
**Created**: 2026-03-25  
**Status**: Planning  
**Owner**: Development Team
