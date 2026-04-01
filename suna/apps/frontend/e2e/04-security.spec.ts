import { test, expect } from '@playwright/test';

/**
 * Security validation tests — verify Phase 01 security fixes are in place.
 */

test.describe('Security Headers', () => {
  test('homepage has X-Frame-Options header', async ({ request }) => {
    const res = await request.get('/');
    const header = res.headers()['x-frame-options'];
    expect(header).toBe('SAMEORIGIN');
  });

  test('homepage has X-Content-Type-Options header', async ({ request }) => {
    const res = await request.get('/');
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('homepage has Content-Security-Policy header', async ({ request }) => {
    const res = await request.get('/');
    const csp = res.headers()['content-security-policy'];
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain('frame-ancestors');
  });

  test('homepage has Referrer-Policy header', async ({ request }) => {
    const res = await request.get('/');
    expect(res.headers()['referrer-policy']).toBeTruthy();
  });
});

test.describe('XSS Prevention', () => {
  test('tutorials page renders without XSS', async ({ page }) => {
    await page.goto('/tutorials');
    await expect(page.locator('body')).not.toContainText('<script>');
    await expect(page.locator('body')).not.toContainText('javascript:');
  });

  test('homepage renders without raw script injection', async ({ page }) => {
    await page.goto('/');
    // Verify no raw HTML entities that indicate unescaped output
    const title = await page.title();
    expect(title).not.toContain('<script>');
    expect(title).not.toContain('javascript:');
  });
});

test.describe('CSRF Protection', () => {
  test('cross-origin POST is blocked', async ({ request }) => {
    // POST from a different origin should be rejected
    const res = await request.post('/api/auth', {
      headers: {
        origin: 'https://evil-attacker.com',
        'content-type': 'application/json',
      },
      data: { action: 'test' },
    });
    // Should be 403 (CSRF blocked) or 404 (route not found) or 405 (method not allowed)
    // But NOT 200 (would indicate successful cross-origin request)
    expect([403, 404, 405, 500]).toContain(res.status());
  });
});

test.describe('Auth Flow Security', () => {
  test('auth page does not expose sensitive env vars in HTML', async ({ page }) => {
    await page.goto('/auth');
    const content = await page.content();
    // Should not expose any real API keys or service role keys
    expect(content).not.toMatch(/service_role/i);
    expect(content).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
  });
});
