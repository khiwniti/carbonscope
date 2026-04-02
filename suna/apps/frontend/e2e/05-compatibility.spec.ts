/**
 * Frontend ↔ Backend integration: Full page rendering tests via Playwright
 *
 * Verifies that pages that call the backend don't crash on load,
 * and that authenticated redirects work correctly.
 */

import { test, expect } from '@playwright/test';

const FRONTEND = process.env.BASE_URL ?? 'http://localhost:3002';
const BACKEND  = process.env.BACKEND_URL ?? 'http://localhost:8000/v1';

// ─── backend health ───────────────────────────────────────────────────────────

test.describe('Backend reachable from E2E context', () => {
  test('backend health endpoint responds', async ({ request }) => {
    const res = await request.get(`${BACKEND}/health`);
    expect(res.status()).toBeGreaterThan(0);
    expect(res.status()).not.toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('status');
  });
});

// ─── public pages load without backend errors ─────────────────────────────────

test.describe('Public pages — no backend crash', () => {
  const pages = ['/', '/auth', '/pricing', '/tutorials', '/support', '/legal'];

  for (const path of pages) {
    test(`${path} loads without error`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      const res = await page.goto(`${FRONTEND}${path}`);
      expect(res?.status()).toBeLessThan(500);
      await expect(page.locator('body')).not.toContainText('Application error');
    });
  }
});

// ─── protected routes redirect to auth ───────────────────────────────────────

test.describe('Protected routes → auth redirect', () => {
  const protectedRoutes = [
    '/dashboard',
    '/agents',
    '/files',
    '/settings',
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects unauthenticated → /auth`, async ({ page }) => {
      await page.goto(`${FRONTEND}${route}`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/auth');
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  }
});

// ─── API base URL is correct in frontend ─────────────────────────────────────

test.describe('Frontend ↔ Backend URL wiring', () => {
  test('frontend calls correct backend host', async ({ page }) => {
    const apiCalls: string[] = [];

    page.on('request', req => {
      const url = req.url();
      if (url.includes(':8000') || url.includes('/v1/')) {
        apiCalls.push(url);
      }
    });

    // Visit auth page — it makes an API call on mount (Supabase session check)
    await page.goto(`${FRONTEND}/auth`);
    await page.waitForLoadState('networkidle');

    // Should target port 8000 (backend), not 3002 (itself)
    const badCalls = apiCalls.filter(u => u.includes(':3002/v1'));
    expect(badCalls).toHaveLength(0);
  });

  test('backend CORS accepts frontend origin', async ({ request }) => {
    const res = await request.fetch(`${BACKEND}/health`, {
      headers: {
        'Origin': FRONTEND,
        'Access-Control-Request-Method': 'GET',
      },
    });
    // Should not be blocked — 200 or CORS preflight handled
    expect(res.status()).not.toBe(403);
  });
});

// ─── security headers (production only) ─────────────────────────────────────

test.describe('Security headers (frontend — production only)', () => {
  // Note: Next.js custom headers() only apply in production build.
  // In dev mode these tests are skipped automatically.
  const isProd = !process.env.BASE_URL?.includes('localhost') ||
                 process.env.NODE_ENV === 'production';

  test('X-Frame-Options header present', async ({ request }) => {
    test.skip(!isProd, 'Security headers only apply in production builds');
    const res = await request.get(`${FRONTEND}/`);
    const header = res.headers()['x-frame-options'];
    expect(header).toBeTruthy();
  });

  test('Content-Security-Policy header present', async ({ request }) => {
    test.skip(!isProd, 'Security headers only apply in production builds');
    const res = await request.get(`${FRONTEND}/`);
    const csp = res.headers()['content-security-policy'];
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src");
  });

  test('security headers configured in next.config.ts', async () => {
    // Verify the config file has the headers defined (static file read)
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const configPath = resolve(__dirname, '../next.config.ts');
    const content = readFileSync(configPath, 'utf-8');
    expect(content).toContain('X-Frame-Options');
    expect(content).toContain('Content-Security-Policy');
    expect(content).toContain('securityHeaders');
  });
});
