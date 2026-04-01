# Testing Quick Reference Guide

Quick commands for running tests across all categories.

## Prerequisites

```bash
# Frontend dependencies
cd suna/apps/frontend
npm install -D @axe-core/playwright playwright lighthouse chrome-launcher web-vitals

# Install Playwright browsers
npx playwright install

# Backend dependencies (already installed)
cd backend
# pytest is already in pyproject.toml
```

## Quick Commands

### Run All Tests
```bash
# All automated tests (after adding to package.json)
npm run test:all

# Individual categories
npm run test:a11y           # Accessibility
npm run test:perf           # Performance
npm run test:cross-browser  # Cross-browser
npm run test:localization   # Localization (pytest)
```

### Accessibility Testing
```bash
# Automated tests (Playwright + axe-core)
npx playwright test tests/accessibility/axe-playwright.spec.ts

# With UI mode (interactive)
npx playwright test tests/accessibility/axe-playwright.spec.ts --ui

# Specific browser
npx playwright test tests/accessibility/ --project=chromium

# Manual testing
# 1. Install axe DevTools: https://www.deque.com/axe/devtools/
# 2. Install WAVE: https://wave.webaim.org/extension/
# 3. Navigate to page and run extensions
```

### Performance Testing
```bash
# Start app first
npm run dev  # Development mode
# OR
npm run build && npm start  # Production mode

# Run Lighthouse
node tests/performance/lighthouse-perf.js

# View results
cat tests/performance/lighthouse-perf-results.json
cat tests/performance/lighthouse-perf-summary.csv

# Individual page test
node -e "
const { runLighthouse } = require('./tests/performance/lighthouse-perf.js');
runLighthouse('http://localhost:3000/dashboard', 'desktop')
  .then(r => console.log('Score:', r.score))
  .catch(console.error);
"
```

### Cross-Browser Testing
```bash
# All browsers
npx playwright test tests/cross-browser/browser-compatibility.spec.ts

# Specific browser
npx playwright test tests/cross-browser/ --project=chromium
npx playwright test tests/cross-browser/ --project=firefox
npx playwright test tests/cross-browser/ --project=webkit

# Mobile devices
npx playwright test tests/cross-browser/ --project="Mobile Chrome"
npx playwright test tests/cross-browser/ --project="Mobile Safari"

# With visual UI
npx playwright test tests/cross-browser/ --ui

# Generate report
npx playwright test tests/cross-browser/
npx playwright show-report
```

### Localization Testing
```bash
# All localization tests
pytest tests/localization/ -v

# Translation completeness only
pytest tests/localization/test_translation_completeness.py -v

# Specific test
pytest tests/localization/test_translation_completeness.py::TestTranslationCompleteness::test_thai_translation_completeness -v

# With coverage
pytest tests/localization/ -v --cov

# Show warnings
pytest tests/localization/ -v -W default
```

### User Acceptance Testing (UAT)
```bash
# Manual testing - follow guides
cat tests/uat/scenarios.md
cat tests/uat/recruitment-plan.md

# UAT is manual - no automated command
# Schedule sessions with Thai professionals
# Use scenarios.md as testing script
```

## Test by Page/Feature

### Homepage
```bash
# Accessibility
npx playwright test tests/accessibility/ --grep "Homepage"

# Performance
node tests/performance/lighthouse-perf.js | grep "Homepage"

# Cross-browser
npx playwright test tests/cross-browser/ --grep "Homepage"
```

### Dashboard
```bash
npx playwright test tests/accessibility/ --grep "Dashboard"
npx playwright test tests/cross-browser/ --grep "Dashboard"
```

### All Pages
```bash
# Run all tests for all pages
npx playwright test
```

## Debug Mode

### Playwright Debug
```bash
# Run with debugger
PWDEBUG=1 npx playwright test tests/accessibility/

# Headed mode (see browser)
npx playwright test tests/accessibility/ --headed

# Slow motion (500ms between actions)
npx playwright test tests/accessibility/ --headed --slow-mo=500

# Interactive UI mode
npx playwright test tests/accessibility/ --ui
```

### Lighthouse Debug
```bash
# View full Lighthouse report
node tests/performance/lighthouse-perf.js

# Then open generated report files
# Chrome DevTools can open lighthouse JSON files
```

### Pytest Debug
```bash
# Verbose output
pytest tests/localization/ -vv

# Show print statements
pytest tests/localization/ -s

# Stop on first failure
pytest tests/localization/ -x

# Run specific test with pdb debugger
pytest tests/localization/test_translation_completeness.py::test_thai_translation_completeness -v --pdb
```

## CI/CD Integration

### GitHub Actions
```yaml
# Add to .github/workflows/test.yml
- name: Accessibility Tests
  run: |
    npm ci
    npx playwright install --with-deps
    npm run dev &
    npx wait-on http://localhost:3000
    npx playwright test tests/accessibility/

- name: Performance Tests
  run: |
    npm run build
    npm start &
    npx wait-on http://localhost:3000
    node tests/performance/lighthouse-perf.js

- name: Localization Tests
  run: |
    pip install pytest
    pytest tests/localization/ -v
```

### Pre-commit Hook
```bash
# Add to .husky/pre-commit or .git/hooks/pre-commit
#!/bin/sh
npm run test:a11y:playwright
pytest tests/localization/
```

## Common Issues & Solutions

### "playwright: command not found"
```bash
npm install -D playwright
npx playwright install
```

### "Chrome not found" (Lighthouse)
```bash
npm install -D chrome-launcher
# Or install Chrome/Chromium manually
```

### "Port 3000 already in use"
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or change port
PORT=3001 npm run dev
```

### "Translation files not found"
```bash
# Create translation files
mkdir -p suna/apps/frontend/messages
echo '{}' > suna/apps/frontend/messages/en.json
echo '{}' > suna/apps/frontend/messages/th.json
```

### Playwright tests timeout
```bash
# Increase timeout in playwright.config.ts
timeout: 60 * 1000  # 60 seconds

# Or per-test
test('name', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  // ...
});
```

## Test Results

### View HTML Reports
```bash
# Playwright
npx playwright show-report

# Opens browser with interactive report
```

### View JSON Results
```bash
# Lighthouse
cat tests/performance/lighthouse-perf-results.json | jq

# Playwright
cat test-results/results.json | jq
```

### Screenshots
```bash
# Playwright screenshots on failure
ls test-results/

# Cross-browser screenshots
ls tests/cross-browser/screenshots/
```

## Performance Budgets

### Set Budgets
```javascript
// In lighthouse-perf.js
const THRESHOLDS = {
  desktop: { performance: 90 },
  mobile: { performance: 80 },
};
```

### Check Budgets
```bash
node tests/performance/lighthouse-perf.js
# Exits with code 1 if any page fails budget
```

## Accessibility Targets

### WCAG 2.1 AA Compliance
- Zero critical violations
- Color contrast ≥ 4.5:1 (normal text)
- Color contrast ≥ 3:1 (large text)
- All images have alt text
- All forms have labels
- Keyboard navigation functional

### Check Compliance
```bash
npx playwright test tests/accessibility/
# Tests will fail if violations found
```

## Browser Support Matrix

| Browser | Desktop | Mobile | Tested Versions |
|---------|---------|--------|----------------|
| Chrome | ✅ | ✅ | 131, 130 |
| Firefox | ✅ | ❌ | 133, 132 |
| Safari | ✅ | ✅ | 18.2, 18.1 |
| Edge | ✅ | ❌ | 131, 130 |

## Useful Playwright Selectors

```typescript
// By role (preferred - accessible)
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { name: 'Dashboard' })
page.getByRole('link', { name: 'Materials' })

// By label
page.getByLabel('Email address')

// By text
page.getByText('Carbon Footprint')

// By test ID
page.getByTestId('carbon-total')

// By placeholder
page.getByPlaceholder('Enter project name')
```

## Package.json Scripts

Add these to `suna/apps/frontend/package.json`:

```json
{
  "scripts": {
    "test:a11y:playwright": "playwright test tests/accessibility/axe-playwright.spec.ts",
    "test:a11y": "npm run test:a11y:playwright",
    "test:perf:lighthouse": "node tests/performance/lighthouse-perf.js",
    "test:perf": "npm run test:perf:lighthouse",
    "test:cross-browser": "playwright test tests/cross-browser/browser-compatibility.spec.ts",
    "test:localization": "cd ../.. && pytest tests/localization/ -v",
    "test:all": "npm run test:a11y && npm run test:perf && npm run test:cross-browser && npm run test:localization"
  }
}
```

## Test Coverage Summary

| Category | Tests | Status |
|----------|-------|--------|
| Accessibility | 7 pages × 5 checks = 35+ tests | ✅ |
| Performance | 7 pages × 2 form factors = 14 audits | ✅ |
| Cross-browser | 7 pages × 5 browsers = 35+ tests | ✅ |
| Localization | 10+ validation tests | ✅ |
| UAT | 6 scenarios (manual) | 📋 |

**Total automated tests:** 94+
**Total test code:** 1,470+ lines

## Need Help?

1. **Check test output:** Most errors include helpful messages
2. **Review test files:** Examples in each test file
3. **Read docs:** Playwright, Lighthouse, pytest documentation
4. **Ask team:** Slack #testing channel

---

**Quick Start:** Run `npm run test:all` after adding scripts to package.json

**Daily testing:** `npm run test:a11y && pytest tests/localization/`

**Pre-release:** All tests + manual UAT sessions
