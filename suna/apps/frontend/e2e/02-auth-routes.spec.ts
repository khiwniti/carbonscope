import { test, expect } from '@playwright/test';

/**
 * Authentication routes — public, no auth required.
 * Protected routes must redirect to /auth.
 */

test.describe('Auth Routes', () => {
  test('auth page loads with sign-in form', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('auth page has terms checkbox', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('#gdprConsent')).toBeVisible();
  });

  test('auth page email validation via Zod', async ({ page }) => {
    await page.goto('/auth');
    // Fill invalid email and try to submit
    const emailInput = page.locator('input[name="email"]').first();
    await emailInput.fill('not-an-email');
    // Check terms
    await page.locator('#gdprConsent').click();
    // Submit - should show validation error not crash
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Page should not crash
      await expect(page.locator('body')).not.toContainText('Application error');
    }
  });

  test('reset-password page loads', async ({ page }) => {
    const res = await page.goto('/auth/reset-password');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('auth/callback route exists', async ({ page }) => {
    // Callback without params should redirect gracefully
    const res = await page.goto('/auth/callback');
    expect([200, 302, 307, 308]).toContain(res?.status());
  });
});

test.describe('Protected Route Redirects', () => {
  const protectedRoutes = [
    '/dashboard',
    '/settings',
    '/agents',
    '/files',
    '/triggers',
    '/projects',
    '/knowledge',
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects unauthenticated users to /auth`, async ({ page }) => {
      await page.goto(route);
      // After redirect, should be on /auth
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/auth');
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  }
});

test.describe('Billing/Onboarding Routes', () => {
  const billingRoutes = ['/activate-trial', '/subscription', '/setting-up'];

  for (const route of billingRoutes) {
    test(`${route} redirects or loads`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      // Should either redirect to auth or show the page
      await expect(page.locator('body')).not.toContainText('Application error');
    });
  }
});
