# E2E Test Execution Plan - BKS cBIM AI Platform

**Started**: 2026-03-24 09:43 UTC
**Status**: In Progress

---

## Test Environment

- **Frontend**: http://localhost:3000 (Next.js 15 + Turbopack)
- **Backend**: http://localhost:8000 (FastAPI)
- **Tool**: agent-browser 0.21.4
- **Security Fixes**: Applied (SPARQL injection, XSS prevention)

---

## Test Suites

### 1. Homepage & Navigation (5 min)
- [x] Homepage loads successfully
- [ ] Navigation menu functional
- [ ] "Get started" button works
- [ ] All links resolve correctly
- [ ] No console errors
- [ ] Responsive design check

### 2. Security Validation (10 min)
- [ ] Test SPARQL injection prevention (backend)
- [ ] Test XSS sanitization (code blocks)
- [ ] Test XSS sanitization (Mermaid diagrams)
- [ ] Verify DOMPurify working
- [ ] Check for exposed secrets
- [ ] Validate HTTPS/security headers

### 3. User Authentication Flow (10 min)
- [ ] Navigate to auth page
- [ ] Magic link sign-up form visible
- [ ] Google OAuth button present
- [ ] Email input validation
- [ ] Privacy policy checkbox
- [ ] Form submission (mock)
- [ ] Trial activation flow

### 4. Dashboard Access (5 min)
- [ ] Dashboard route loads
- [ ] Greeting displays
- [ ] Mode selector visible
- [ ] Chat input present
- [ ] Agent selector works
- [ ] No auth errors

### 5. Material Analysis (15 min)
- [ ] BOQ upload interface
- [ ] File format validation
- [ ] Upload progress indicator
- [ ] Material matching display
- [ ] Carbon calculation results
- [ ] TREES/EDGE metrics shown
- [ ] Alternative recommendations

### 6. Agent Execution (10 min)
- [ ] Agent thread creation
- [ ] Message submission
- [ ] Tool call display
- [ ] Reasoning toggle
- [ ] Response streaming
- [ ] Execution traces viewable

### 7. Report Generation (10 min)
- [ ] PDF report generation
- [ ] Excel report generation
- [ ] Bilingual content (Thai + English)
- [ ] Download functionality
- [ ] Report preview

### 8. UI Component Testing (15 min)
- [ ] Code blocks render (with syntax highlighting)
- [ ] Mermaid diagrams render
- [ ] Tables and data grids
- [ ] Modals and dialogs
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

### 9. Accessibility (5 min)
- [ ] Keyboard navigation
- [ ] Tab order correct
- [ ] Focus indicators
- [ ] ARIA labels
- [ ] Screen reader compatibility

### 10. Performance (5 min)
- [ ] Initial page load <1.5s
- [ ] API responses <200ms
- [ ] No memory leaks
- [ ] Smooth interactions
- [ ] No layout shifts

---

## Current Progress

**Completed**: Homepage loaded, navigation visible, agent-browser connected
**In Progress**: Navigation testing
**Next**: Security validation
**Blocked**: None

---

## Issues Found

None yet.

---

## Screenshots

- `00-homepage-initial.png` - Homepage loaded successfully
