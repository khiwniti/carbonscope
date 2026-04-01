# Security Guidelines

## Overview

This document outlines security practices for the BKS cBIM AI frontend codebase.

---

## XSS Prevention

**Never** use `innerHTML` or `dangerouslySetInnerHTML` without sanitization.

### For HTML Content
```typescript
import { sanitizeHTML } from '@/lib/sanitize';

// Good
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userContent) }} />

// Bad - never do this
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

### For Tutorial/Embed Code
```typescript
import { sanitizeTutorialEmbed } from '@/lib/sanitize';

// Strict iframe-only sanitization with trusted domain whitelist
<div dangerouslySetInnerHTML={{ __html: sanitizeTutorialEmbed(embedCode) }} />
```

### For JSON-LD Structured Data
```typescript
import { sanitizeJSON } from '@/lib/sanitize';

// Future-proofs against dynamic content
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: sanitizeJSON(schemaData) }}
/>
```

### For SVG Content (Mermaid, Charts)
Use `DOMPurify.sanitize()` directly with SVG-specific allowed tags whitelist.

---

## CSRF Protection

All mutation requests (POST/PUT/DELETE) to external endpoints must include CSRF protection.

### Origin Validation (Middleware)
The middleware automatically validates the `Origin` header for all mutation requests. Cross-origin POST requests are rejected with 403.

### Token-Based CSRF (for forms)
```typescript
import { generateCsrfToken } from '@/lib/csrf';

// Server component - generate token
const token = await generateCsrfToken();

// Client component - include in requests
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  body: JSON.stringify(data),
});
```

---

## Sensitive Data

**Never** log environment variables, tokens, API keys, or secrets.

```typescript
// Good - log what happened, not the values
console.log('API call initiated');
console.log('Auth token present:', !!token);

// Bad - never log the actual values
console.log('API Key:', process.env.API_KEY);  // BAD
console.log('Token:', token);                   // BAD
console.log('Stripe key:', stripeKey);          // BAD
```

### Hardcoded Credentials
Never hardcode API keys, passwords, or secrets in source code. Use environment variables:
```typescript
const apiKey = process.env.NEXT_PUBLIC_API_KEY; // Good
const apiKey = 'sk-abc123...';                  // Bad
```

---

## Security Headers

Security headers are configured in `next.config.ts`:
- `Content-Security-Policy` - Controls resource loading
- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
- `Strict-Transport-Security` - Enforces HTTPS
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection` - Browser XSS filter

---

## Automated Scanning

Run ESLint security scan before committing:
```bash
bun run lint
```

The `eslint-plugin-security` rules are configured to catch:
- Unsafe regular expressions (`detect-unsafe-regex`)
- `eval()` with expressions (`detect-eval-with-expression`)
- Pseudorandom byte generation (`detect-pseudoRandomBytes`)
- Potential timing attacks (`detect-possible-timing-attacks`)

---

## Dependency Security

Check for vulnerable dependencies:
```bash
bun audit
```

---

## Reporting Vulnerabilities

For security vulnerabilities, contact the engineering team directly. Do not create public GitHub issues for security vulnerabilities.

---

*Last updated: 2026-04-01*
*Phase: Frontend Production Readiness - Phase 01 Security Fixes*
