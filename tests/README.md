# Testing Documentation

This directory contains comprehensive test suites for the CarbonBIM platform covering UAT, accessibility, performance, cross-browser compatibility, and localization.

## Directory Structure

```
tests/
├── uat/                          # User Acceptance Testing
│   ├── scenarios.md              # 6 UAT scenarios with detailed steps
│   └── recruitment-plan.md       # Participant recruitment strategy
├── accessibility/                # Accessibility Testing (WCAG 2.1 AA)
│   └── axe-playwright.spec.ts    # Automated accessibility tests
├── performance/                  # Performance Testing
│   └── lighthouse-perf.js        # Lighthouse automation script
├── cross-browser/                # Cross-Browser Testing
│   ├── browser-compatibility.spec.ts  # Multi-browser tests
│   └── screenshots/              # Visual comparison screenshots
├── localization/                 # Localization Testing
│   └── test_translation_completeness.py  # Translation validation
└── README.md                     # This file
```

## Quick Start

### Prerequisites

**Frontend dependencies:**
```bash
cd suna/apps/frontend
npm install -D @axe-core/playwright playwright lighthouse chrome-launcher
npx playwright install  # Install browser binaries
```

**Backend dependencies:**
```bash
cd backend
# pytest already installed via pyproject.toml
```

### Run Tests

**Accessibility tests:**
```bash
npx playwright test tests/accessibility/axe-playwright.spec.ts
```

**Performance tests:**
```bash
# Start application first
npm run dev  # or npm run build && npm start

# In another terminal
node tests/performance/lighthouse-perf.js
```

**Cross-browser tests:**
```bash
npx playwright test tests/cross-browser/browser-compatibility.spec.ts
```

**Localization tests:**
```bash
pytest tests/localization/ -v
```

**All tests:**
```bash
npm run test:all  # After adding scripts to package.json
```

## Test Categories

### 1. User Acceptance Testing (UAT)

**Purpose:** Validate that the platform meets user needs and expectations

**Participants:** 10+ Thai construction professionals
- 3 Architects
- 3 Construction Engineers
- 2 Sustainability Consultants
- 2 Project Managers

**Scenarios:** 6 comprehensive workflows
1. BOQ file upload and parsing
2. Carbon analysis review
3. Material alternative exploration
4. What-if scenario analysis
5. Report generation
6. TREES/EDGE certification check

**Success criteria:**
- Task completion rate ≥80%
- User satisfaction ≥4.0/5.0
- Zero critical bugs

**Documentation:**
- `tests/uat/scenarios.md` - Detailed test scenarios
- `tests/uat/recruitment-plan.md` - Recruitment strategy

### 2. Accessibility Testing

**Purpose:** Ensure WCAG 2.1 AA compliance for all users

**Tools:**
- axe DevTools (automated)
- WAVE (manual)
- Lighthouse (automated)
- NVDA / VoiceOver (screen readers)

**Coverage:**
- All major pages (7 pages)
- Forms and interactive elements
- Color contrast ratios
- Keyboard navigation
- ARIA attributes
- Image alt text
- Table structure
- Thai language support

**Success criteria:**
- Zero critical accessibility violations
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation functional

**Files:**
- `tests/accessibility/axe-playwright.spec.ts` - Automated tests

**Run:**
```bash
npx playwright test tests/accessibility/axe-playwright.spec.ts --headed
```

### 3. Performance Testing

**Purpose:** Ensure fast load times and good user experience

**Tools:**
- Lighthouse (automated)
- WebPageTest (external validation)
- Web Vitals (RUM)

**Metrics:**
- Performance score: Desktop ≥90, Mobile ≥80
- First Contentful Paint (FCP): <1.8s
- Largest Contentful Paint (LCP): <2.5s
- Cumulative Layout Shift (CLS): <0.1
- Total Blocking Time (TBT): <200ms

**Coverage:**
- 7 major pages
- Desktop and mobile form factors
- 14 total audits (7 pages × 2 form factors)

**Success criteria:**
- All pages meet performance targets
- Core Web Vitals in "Good" range
- No render-blocking resources
- Optimized images and fonts

**Files:**
- `tests/performance/lighthouse-perf.js` - Lighthouse automation

**Run:**
```bash
# Start app first
npm run dev

# Run tests
node tests/performance/lighthouse-perf.js

# View results
cat tests/performance/lighthouse-perf-results.json
cat tests/performance/lighthouse-perf-summary.csv
```

### 4. Cross-Browser Testing

**Purpose:** Ensure compatibility across all major browsers

**Browsers:**
- Chrome 131, 130
- Firefox 133, 132
- Safari 18.2, 18.1
- Edge 131, 130

**Platforms:**
- Desktop: Windows 11, macOS 14, Ubuntu 24.04
- Mobile: iOS 18, Android 15

**Coverage:**
- 7 pages × 3 browsers = 21 desktop tests
- 7 pages × 2 devices = 14 mobile tests
- Total: 35+ test combinations

**Tests:**
- Page rendering
- Navigation functionality
- Form inputs and buttons
- Touch interactions (mobile)
- Font rendering
- CSS Grid and Flexbox
- localStorage / sessionStorage

**Success criteria:**
- No critical bugs on any browser
- Visual consistency across browsers
- All features functional

**Files:**
- `tests/cross-browser/browser-compatibility.spec.ts` - Browser tests
- `tests/cross-browser/screenshots/` - Visual comparisons

**Run:**
```bash
npx playwright test tests/cross-browser/browser-compatibility.spec.ts

# Run specific browser only
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# View report
npx playwright show-report
```

### 5. Localization Testing

**Purpose:** Validate translation completeness and cultural appropriateness

**Languages:**
- Thai (th)
- English (en)

**Coverage:**
- Translation completeness (100%)
- Variable placeholder consistency
- Date/time formats (Buddhist Era for Thai)
- Number formats (comma separators)
- Currency formats (Thai Baht)
- Font rendering (Noto Sans Thai)
- Text overflow handling

**Success criteria:**
- 100% translation coverage
- No empty translations
- Variable placeholders match
- Thai fonts render correctly
- Cultural appropriateness verified

**Files:**
- `tests/localization/test_translation_completeness.py` - Translation tests

**Run:**
```bash
pytest tests/localization/ -v

# With coverage
pytest tests/localization/ -v --cov

# Specific test
pytest tests/localization/test_translation_completeness.py::TestTranslationCompleteness::test_thai_translation_completeness -v
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Testing Suite

on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run dev &
      - run: npx wait-on http://localhost:3000
      - run: npx playwright test tests/accessibility/

  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm start &
      - run: npx wait-on http://localhost:3000
      - run: node tests/performance/lighthouse-perf.js

  localization:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - run: pip install pytest
      - run: pytest tests/localization/ -v
```

## Test Data

### Sample BOQ Files

For UAT testing, use sample BOQ files from:
- `backend/evals/sample_boqs/`

Files should include:
- Small project (50 items): `BOQ_Sample_Small_TH.xlsx`
- Medium project (200 items): `BOQ_Sample_Medium_TH.xlsx`
- Large project (500+ items): `BOQ_Sample_Large_TH.xlsx`

### Test Accounts

For UAT sessions, create test accounts with different roles:
- `test-architect@carbonbim.example.com`
- `test-engineer@carbonbim.example.com`
- `test-consultant@carbonbim.example.com`
- `test-pm@carbonbim.example.com`

## Troubleshooting

### Playwright Tests Fail

**Issue:** Browser not installed
```bash
npx playwright install chromium firefox webkit
```

**Issue:** Port already in use
```bash
# Check what's running on port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Lighthouse Tests Fail

**Issue:** Chrome not found
```bash
# Install Chrome manually or use chromium
npm install -D chrome-launcher
```

**Issue:** Application not running
```bash
# Start app first
npm run dev
# Then run tests
node tests/performance/lighthouse-perf.js
```

### Localization Tests Fail

**Issue:** Translation files not found
```bash
# Create translation files
mkdir -p suna/apps/frontend/messages
touch suna/apps/frontend/messages/en.json
touch suna/apps/frontend/messages/th.json
```

**Issue:** Python path issues
```bash
# Add project root to PYTHONPATH
export PYTHONPATH=/path/to/comprehensive-bks-cbim-ai-agent:$PYTHONPATH
```

## Best Practices

### Writing Accessible Tests

1. **Use semantic selectors:** Prefer role selectors over class names
   ```typescript
   // ✅ Good
   await page.getByRole('button', { name: 'Submit' }).click();

   // ❌ Avoid
   await page.locator('.btn-submit').click();
   ```

2. **Test keyboard navigation:** Always verify Tab order
   ```typescript
   await page.keyboard.press('Tab');
   await expect(page.locator(':focus')).toHaveAccessibleName('...');
   ```

3. **Check ARIA attributes:** Verify proper ARIA usage
   ```typescript
   await expect(dialog).toHaveAttribute('role', 'dialog');
   await expect(dialog).toHaveAttribute('aria-modal', 'true');
   ```

### Writing Performance Tests

1. **Use realistic throttling:** Mobile tests should use 4G throttling
2. **Measure multiple runs:** Average 3-5 runs for stable results
3. **Set performance budgets:** Fail tests if budgets exceeded
4. **Profile before optimizing:** Identify bottlenecks with Lighthouse audits

### Writing Localization Tests

1. **Automate completeness checks:** Don't rely on manual review
2. **Validate variable placeholders:** Ensure consistency across locales
3. **Test cultural appropriateness:** Review with native speakers
4. **Check font rendering:** Test on real devices, not just emulators

## Resources

### Official Documentation
- **Playwright:** https://playwright.dev/
- **Lighthouse:** https://developer.chrome.com/docs/lighthouse/
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **Web Vitals:** https://web.dev/vitals/

### Tools
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **WAVE:** https://wave.webaim.org/
- **WebPageTest:** https://www.webpagetest.org/

### Learning
- **Web.dev Testing:** https://web.dev/testing/
- **Playwright University:** https://playwright.dev/docs/intro
- **A11y Project:** https://www.a11yproject.com/

## Contributing

When adding new tests:

1. **Follow existing patterns:** Use consistent naming and structure
2. **Document thoroughly:** Add comments explaining complex tests
3. **Use TypeScript:** For type safety in Playwright tests
4. **Add to CI/CD:** Ensure new tests run in pipeline
5. **Update this README:** Document new test categories

## Support

For questions or issues:

1. **Check troubleshooting section above**
2. **Review test files for examples**
3. **Consult official documentation**
4. **Ask in team Slack channel**

---

**Last updated:** 2026-03-24
**Maintainer:** Testing Team
