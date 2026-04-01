# Testing Checklist

Use this checklist to ensure all testing requirements are met before release.

## Pre-Testing Setup

### Environment Setup
- [ ] Development environment running on `http://localhost:3000`
- [ ] Staging environment deployed to `https://staging.carbonbim.example.com`
- [ ] Test user accounts created (architect, engineer, consultant, PM)
- [ ] Sample BOQ files available in `backend/evals/sample_boqs/`

### Dependencies Installed
- [ ] Frontend: `@axe-core/playwright`, `playwright`, `lighthouse`, `chrome-launcher`, `web-vitals`
- [ ] Backend: `pytest` (already in pyproject.toml)
- [ ] Playwright browsers installed: `npx playwright install`
- [ ] Browser extensions: axe DevTools, WAVE

### Configuration Files
- [ ] `playwright.config.ts` created and configured
- [ ] Package.json scripts added for test commands
- [ ] Translation files exist: `messages/en.json`, `messages/th.json`
- [ ] Font files present: Noto Sans Thai in `/public/fonts/`

---

## 1. Accessibility Testing

### Automated Tests (axe-core + Playwright)
- [ ] All pages pass axe-core WCAG 2.1 AA checks (0 violations)
- [ ] Homepage accessibility test passes
- [ ] Dashboard accessibility test passes
- [ ] Analysis page accessibility test passes
- [ ] Materials page accessibility test passes
- [ ] Scenarios page accessibility test passes
- [ ] Reports page accessibility test passes
- [ ] Certification page accessibility test passes

**Command:** `npx playwright test tests/accessibility/axe-playwright.spec.ts`

### Manual Testing (WAVE)
- [ ] Homepage: 0 errors, 0 contrast errors
- [ ] Dashboard: 0 errors, 0 contrast errors
- [ ] Analysis: 0 errors, 0 contrast errors
- [ ] Materials: 0 errors, 0 contrast errors
- [ ] Scenarios: 0 errors, 0 contrast errors
- [ ] Reports: 0 errors, 0 contrast errors
- [ ] Certification: 0 errors, 0 contrast errors

**Tool:** WAVE browser extension

### Lighthouse Accessibility Audit
- [ ] All pages score ≥90 on Lighthouse accessibility audit

**Command:** `node tests/accessibility/lighthouse-a11y.js` (if created)

### Screen Reader Testing
- [ ] NVDA (Windows): Navigation works, all content announced
- [ ] VoiceOver (macOS): Navigation works, all content announced
- [ ] Forms: All fields have labels and error messages announced
- [ ] Dynamic content: Loading states and notifications announced
- [ ] Tables: Headers associated with cells correctly
- [ ] Charts: Text alternatives provided

### Keyboard Navigation
- [ ] All pages: Tab order logical
- [ ] All interactive elements reachable via keyboard
- [ ] Focus indicators visible on all focusable elements
- [ ] Skip to main content link present and functional
- [ ] Modal dialogs: Focus trapped, Escape closes
- [ ] Dropdown menus: Arrow keys navigate

### Color Contrast
- [ ] All text meets 4.5:1 contrast ratio (normal text)
- [ ] Large text meets 3:1 contrast ratio (18pt+ or 14pt+ bold)
- [ ] Interactive elements: 3:1 contrast with background
- [ ] Focus indicators: 3:1 contrast
- [ ] No information conveyed by color alone

---

## 2. Performance Testing

### Lighthouse Performance (Desktop ≥90)
- [ ] Homepage: ≥90
- [ ] Dashboard: ≥90
- [ ] Analysis: ≥90
- [ ] Materials: ≥90
- [ ] Scenarios: ≥90
- [ ] Reports: ≥90
- [ ] Certification: ≥90

**Command:** `node tests/performance/lighthouse-perf.js`

### Lighthouse Performance (Mobile ≥80)
- [ ] Homepage: ≥80
- [ ] Dashboard: ≥80
- [ ] Analysis: ≥80
- [ ] Materials: ≥80
- [ ] Scenarios: ≥80
- [ ] Reports: ≥80
- [ ] Certification: ≥80

### Core Web Vitals (All Pages)
- [ ] LCP (Largest Contentful Paint): <2.5s
- [ ] FID (First Input Delay): <100ms
- [ ] CLS (Cumulative Layout Shift): <0.1
- [ ] FCP (First Contentful Paint): <1.8s
- [ ] TTFB (Time to First Byte): <800ms

### Performance Optimizations
- [ ] Images optimized (WebP/AVIF format)
- [ ] Images lazy-loaded
- [ ] Code splitting implemented (dynamic imports)
- [ ] Fonts preloaded
- [ ] Critical CSS inlined
- [ ] No render-blocking resources
- [ ] Bundle size analyzed and optimized
- [ ] Unused CSS/JS removed

---

## 3. Cross-Browser Testing

### Desktop Browsers (Chrome, Firefox, Safari, Edge)

**Chrome 131**
- [ ] Homepage renders correctly
- [ ] Dashboard functional
- [ ] Analysis workflow works
- [ ] Materials page loads
- [ ] Scenarios can be created
- [ ] Reports generate successfully
- [ ] Certification status displays

**Firefox 133**
- [ ] Homepage renders correctly
- [ ] Dashboard functional
- [ ] Analysis workflow works
- [ ] Materials page loads
- [ ] Scenarios can be created
- [ ] Reports generate successfully
- [ ] Certification status displays

**Safari 18.2**
- [ ] Homepage renders correctly
- [ ] Dashboard functional
- [ ] Analysis workflow works
- [ ] Materials page loads
- [ ] Scenarios can be created
- [ ] Reports generate successfully
- [ ] Certification status displays

**Edge 131**
- [ ] Homepage renders correctly
- [ ] Dashboard functional
- [ ] Analysis workflow works
- [ ] Materials page loads
- [ ] Scenarios can be created
- [ ] Reports generate successfully
- [ ] Certification status displays

**Command:** `npx playwright test tests/cross-browser/browser-compatibility.spec.ts`

### Mobile Devices

**iPhone 15 Pro (iOS 18)**
- [ ] Homepage responsive
- [ ] Dashboard accessible via mobile menu
- [ ] Touch interactions work
- [ ] Scrolling smooth
- [ ] Forms usable
- [ ] Charts/graphs render

**Pixel 7 (Android 15)**
- [ ] Homepage responsive
- [ ] Dashboard accessible via mobile menu
- [ ] Touch interactions work
- [ ] Scrolling smooth
- [ ] Forms usable
- [ ] Charts/graphs render

### Browser-Specific Features
- [ ] CSS Grid works in all browsers
- [ ] Flexbox rendering correct
- [ ] Web fonts load (Noto Sans Thai)
- [ ] localStorage works
- [ ] sessionStorage works
- [ ] Service workers function (if applicable)

---

## 4. Localization Testing

### Translation Completeness
- [ ] All English keys have Thai translations (100%)
- [ ] All Thai keys have English translations (100%)
- [ ] No empty translations in English
- [ ] No empty translations in Thai
- [ ] Variable placeholders consistent between locales

**Command:** `pytest tests/localization/test_translation_completeness.py -v`

### Date/Time Formats
- [ ] Thai locale displays Buddhist Era (พ.ศ.)
- [ ] English locale displays Gregorian calendar
- [ ] Date format: Thai (24 มีนาคม 2569)
- [ ] Date format: English (March 24, 2026)
- [ ] Time format: Thai (14:30 น.)
- [ ] Time format: English (2:30 PM)

### Number Formats
- [ ] Thai: 1,234,567.89 (comma separator)
- [ ] English: 1,234,567.89 (comma separator)
- [ ] Decimal precision correct (2 places)

### Currency Formats
- [ ] Thai: ฿1,234,567.89
- [ ] English: THB 1,234,567.89
- [ ] Baht symbol displays correctly

### Font Rendering
- [ ] Thai text uses Noto Sans Thai font
- [ ] English text uses Inter font
- [ ] Thai text wraps correctly (word-break)
- [ ] No font loading flashes (FOUT)
- [ ] Font weights correct (regular, bold)

### Cultural Appropriateness
- [ ] Thai translations natural and professional
- [ ] No machine translation artifacts
- [ ] Technical terms translated correctly
- [ ] Tone appropriate for business context

---

## 5. User Acceptance Testing (UAT)

### Participant Recruitment
- [ ] 10+ participants recruited
- [ ] 3 Architects confirmed
- [ ] 3 Construction Engineers confirmed
- [ ] 2 Sustainability Consultants confirmed
- [ ] 2 Project Managers confirmed
- [ ] Sessions scheduled
- [ ] Compensation arranged (THB 1,500-2,500)
- [ ] Consent forms prepared

### Test Sessions
- [ ] Session 1 completed (record task completion, time, satisfaction)
- [ ] Session 2 completed
- [ ] Session 3 completed
- [ ] Session 4 completed
- [ ] Session 5 completed
- [ ] Session 6 completed
- [ ] Session 7 completed
- [ ] Session 8 completed
- [ ] Session 9 completed
- [ ] Session 10 completed

### Scenario 1: BOQ Upload
- [ ] Task completion rate: ≥80%
- [ ] Average time: _____ minutes
- [ ] Satisfaction score: ≥4.0/5.0
- [ ] Critical issues: _____ (document)

### Scenario 2: Carbon Analysis
- [ ] Task completion rate: ≥80%
- [ ] Average time: _____ minutes
- [ ] Satisfaction score: ≥4.0/5.0
- [ ] Critical issues: _____ (document)

### Scenario 3: Material Alternatives
- [ ] Task completion rate: ≥80%
- [ ] Average time: _____ minutes
- [ ] Satisfaction score: ≥4.0/5.0
- [ ] Critical issues: _____ (document)

### Scenario 4: What-If Scenarios
- [ ] Task completion rate: ≥80%
- [ ] Average time: _____ minutes
- [ ] Satisfaction score: ≥4.0/5.0
- [ ] Critical issues: _____ (document)

### Scenario 5: Report Generation
- [ ] Task completion rate: ≥80%
- [ ] Average time: _____ minutes
- [ ] Satisfaction score: ≥4.0/5.0
- [ ] Critical issues: _____ (document)

### Scenario 6: Certification Check
- [ ] Task completion rate: ≥80%
- [ ] Average time: _____ minutes
- [ ] Satisfaction score: ≥4.0/5.0
- [ ] Critical issues: _____ (document)

### UAT Summary
- [ ] Overall task completion: ≥80%
- [ ] Overall satisfaction: ≥4.0/5.0
- [ ] Critical issues documented and prioritized
- [ ] Recommendations captured for future improvements

---

## 6. Integration Testing

### Backend API
- [ ] All endpoints respond correctly
- [ ] Authentication works
- [ ] BOQ upload API functional
- [ ] Carbon calculation API accurate
- [ ] Material alternatives API returns results
- [ ] Scenario creation API works
- [ ] Report generation API produces valid PDFs/Excel
- [ ] Certification API returns correct scores

### Database
- [ ] User data persists correctly
- [ ] BOQ data stored properly
- [ ] Scenarios saved and retrievable
- [ ] Reports stored with correct metadata
- [ ] No data loss on page refresh

### Third-Party Services
- [ ] Supabase authentication works
- [ ] Redis caching functional
- [ ] GraphDB queries return results
- [ ] Brightway2 calculations accurate
- [ ] Email notifications sent (if applicable)

---

## 7. Security Testing

### Authentication & Authorization
- [ ] Login required for protected routes
- [ ] Session management secure
- [ ] Password reset flow works
- [ ] User roles enforced correctly
- [ ] API endpoints require authentication

### Data Security
- [ ] No sensitive data in client-side code
- [ ] Environment variables not exposed
- [ ] SQL injection prevented
- [ ] XSS (Cross-Site Scripting) prevented
- [ ] CSRF (Cross-Site Request Forgery) tokens used

### HTTPS & Certificates
- [ ] HTTPS enforced on production
- [ ] Valid SSL certificate
- [ ] Mixed content warnings resolved

---

## 8. Regression Testing

### After Bug Fixes
- [ ] Original bug fixed
- [ ] Related functionality still works
- [ ] No new bugs introduced
- [ ] Automated tests pass

### After New Features
- [ ] New feature works as expected
- [ ] Existing features unaffected
- [ ] Performance not degraded
- [ ] Accessibility maintained

---

## Final Sign-Off

### All Tests Passed
- [ ] Accessibility: 0 critical violations
- [ ] Performance: Desktop ≥90, Mobile ≥80
- [ ] Cross-browser: No critical bugs
- [ ] Localization: 100% complete
- [ ] UAT: ≥80% completion, ≥4.0/5.0 satisfaction

### Documentation Complete
- [ ] Test results documented
- [ ] Critical issues logged
- [ ] UAT summary report created
- [ ] Recommendations for future improvements

### Production Ready
- [ ] All critical issues resolved
- [ ] Staging environment verified
- [ ] Production deployment approved
- [ ] Monitoring and analytics configured
- [ ] Support documentation ready

---

## Approval Signatures

**Technical Lead:** ___________________________ Date: ___________

**Product Manager:** ___________________________ Date: ___________

**UX Designer:** ___________________________ Date: ___________

**QA Lead:** ___________________________ Date: ___________

**Engineering Manager:** ___________________________ Date: ___________

---

**Status:** ⬜ In Progress | ⬜ Complete | ⬜ Approved for Production

**Last Updated:** 2026-03-24
