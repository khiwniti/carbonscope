# 🚀 Accelerated Rebranding Execution Plan

## Immediate Actions (Next 2 Hours)

### ✅ COMPLETED
- [x] Create GSD project structure
- [x] Save CarbonScope design system reference
- [x] Create comprehensive 21-28 day plan

### 🔄 IN PROGRESS - Phase 1: Design System Foundation

#### Step 1.1: Create Design Tokens (15 min)
```bash
# Create design system directory structure
mkdir -p apps/frontend/src/lib/design-system
mkdir -p apps/frontend/src/styles/carbonscope
mkdir -p apps/frontend/src/components/ui/carbonscope
```

**Files to create:**
- `apps/frontend/src/lib/design-system/tokens.ts` - TypeScript design tokens
- `apps/frontend/src/styles/carbonscope/tokens.css` - CSS variables
- `apps/frontend/src/styles/carbonscope/globals.css` - Global styles + animations
- `apps/frontend/src/lib/design-system/types.ts` - TypeScript types

#### Step 1.2: Audit Current Codebase (10 min)
```bash
# Find all BKS/BKS cBIM AI references
grep -r "BKS" apps/frontend/ backend/ --exclude-dir=node_modules
grep -r "BKS cBIM AI" apps/frontend/ backend/ --exclude-dir=node_modules
grep -r "suna" apps/frontend/ backend/ --exclude-dir=node_modules --ignore-case
```

#### Step 1.3: Create Component Library (30 min)
**Priority components:**
1. Badge
2. Button
3. Input
4. KPICard
5. Toast

#### Step 1.4: Update Package Metadata (5 min)
- `apps/frontend/package.json` - name, description
- `backend/pyproject.toml` - name, description
- `README.md` - complete rewrite

---

## Parallel Workstreams

### Workstream A: Design System Implementation
**Owner**: Primary developer
**Duration**: 2-3 days
1. Extract all design tokens
2. Create component library
3. Set up Storybook (optional)
4. Document component usage

### Workstream B: Branding Updates
**Owner**: Can be automated/scripted
**Duration**: 1 day
1. Find & replace all text
2. Update meta tags
3. Update documentation
4. Update environment variables

### Workstream C: Asset Creation
**Owner**: Designer / AI tools
**Duration**: 1-2 days
1. Generate BKS logo
2. Create favicon set
3. Generate OG images
4. Update all image assets

---

## Automation Scripts

### Script 1: Bulk Text Replacement
```bash
#!/bin/bash
# rebrand-text.sh - Replace BKS/BKS cBIM AI with BKS/cBIM

find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -exec sed -i 's/BKS/BKS/g' {} + \
  -exec sed -i 's/BKS cBIM AI/cBIM AI/g' {} + \
  -exec sed -i 's/suna/bks/g' {} +

find backend/app -type f -name "*.py" \
  -exec sed -i 's/BKS/BKS/g' {} + \
  -exec sed -i 's/BKS cBIM AI/cBIM AI/g' {} + \
  -exec sed -i 's/suna/bks/g' {} +
```

### Script 2: Environment Variable Updates
```bash
#!/bin/bash
# update-env-vars.sh

# Backend
sed -i 's/APP_NAME=.*/APP_NAME="BKS cBIM AI"/' backend/.env
sed -i 's/PROJECT_NAME=.*/PROJECT_NAME="bks-cbim"/' backend/.env

# Frontend  
sed -i 's/NEXT_PUBLIC_APP_NAME=.*/NEXT_PUBLIC_APP_NAME="BKS cBIM AI"/' apps/frontend/.env.local
```

---

## Critical Path (Must Complete in Order)

1. **Design System Tokens** → Blocks all UI work
2. **Component Library** → Blocks page updates
3. **Branding Audit** → Identifies all work needed
4. **Text Replacement** → Quick wins
5. **Component Migration** → Most time-consuming
6. **Testing** → Ensures quality
7. **Deployment** → Final step

---

## Quick Win Checklist (Can do NOW)

### ✅ 30-Minute Quick Wins
- [ ] Create design tokens file
- [ ] Update README.md with new branding
- [ ] Update package.json metadata
- [ ] Change page title in root layout
- [ ] Update favicon
- [ ] Create new logo placeholder

### ✅ 1-Hour Tasks
- [ ] Create Button component with 4 variants
- [ ] Create Badge component with 6 variants
- [ ] Update navigation with new colors
- [ ] Replace color variables in Tailwind config
- [ ] Update environment variable names

### ✅ 2-Hour Tasks
- [ ] Migrate 5 core components to CarbonScope
- [ ] Update all page titles and meta tags
- [ ] Create KPICard data visualization component
- [ ] Update dashboard layout with new design
- [ ] Test authentication flow with new branding

---

## Daily Milestones

### Day 1 (Today)
- [x] Create comprehensive plan
- [ ] Extract design tokens
- [ ] Audit codebase
- [ ] Create 3 core components
- [ ] Update package metadata
- [ ] Replace page titles

**Goal**: Foundation established, quick wins visible

### Day 2
- [ ] Complete component library (10 components)
- [ ] Update all frontend pages with new branding
- [ ] Begin backend branding updates
- [ ] Create logo and favicon
- [ ] Update documentation

**Goal**: 50% of branding complete

### Day 3
- [ ] Finish all component migrations
- [ ] Update backend API responses
- [ ] Create all visual assets
- [ ] Begin cross-page testing
- [ ] Update deployment configs

**Goal**: 80% of work complete

### Day 4
- [ ] Complete testing
- [ ] Fix all bugs found
- [ ] Polish animations and interactions
- [ ] Prepare deployment
- [ ] Update production environment variables

**Goal**: Ready for deployment

### Day 5
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Collect feedback
- [ ] Create post-deployment report
- [ ] Plan iteration 2

**Goal**: Live in production

---

## Risk Mitigation

### High-Priority Safeguards
1. **Git branching**: Create `rebrand/carbonscope` branch
2. **Backup production**: Before deployment
3. **Rollback plan**: Document restoration procedure
4. **Feature flags**: Optional - toggle new design
5. **Staged rollout**: Deploy to staging first

### Testing Strategy
- **Visual regression**: Screenshot comparison
- **Functional**: All user workflows
- **Performance**: Lighthouse scores
- **Cross-browser**: Chrome, Firefox, Safari
- **Mobile**: Responsive design validation

---

## Resource Requirements

### Development Time
- **Solo developer**: 21-28 days
- **2 developers**: 10-14 days  
- **3+ developers**: 7-10 days

### Tools Needed
- Git for version control
- Design tool for logo (Figma/AI generator)
- Browser DevTools for testing
- Lighthouse for performance
- Optional: Storybook for components

---

## Communication Plan

### Stakeholder Updates
- **Daily**: Progress report
- **Weekly**: Demo of completed work
- **Major milestones**: Approval gates

### Documentation Updates
- **Technical docs**: As components created
- **User docs**: After deployment
- **API docs**: Real-time updates

---

## Next Command to Run

```bash
# Start execution immediately
cd apps/frontend && \
mkdir -p src/lib/design-system src/styles/carbonscope src/components/ui/carbonscope && \
echo "🚀 Design system directories created! Beginning implementation..."
```

Then I'll create the design tokens file and start building components.

---

**Status**: READY TO EXECUTE  
**Estimated completion**: Day 1 tasks in next 4-6 hours  
**Blockers**: None - can start immediately
