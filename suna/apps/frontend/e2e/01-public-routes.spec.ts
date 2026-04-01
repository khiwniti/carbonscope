import { test, expect } from '@playwright/test';

/**
 * Public marketing routes — no auth required.
 * All should return 200 and render content.
 */

test.describe('Public Marketing Routes', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('pricing page loads', async ({ page }) => {
    const res = await page.goto('/pricing');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('about page loads', async ({ page }) => {
    const res = await page.goto('/about');
    expect(res?.status()).toBeLessThan(400);
  });

  test('tutorials page loads', async ({ page }) => {
    const res = await page.goto('/tutorials');
    expect(res?.status()).toBeLessThan(400);
  });

  test('support page loads', async ({ page }) => {
    const res = await page.goto('/support');
    expect(res?.status()).toBeLessThan(400);
  });

  test('legal page loads', async ({ page }) => {
    const res = await page.goto('/legal');
    expect(res?.status()).toBeLessThan(400);
  });

  test('templates page loads', async ({ page }) => {
    const res = await page.goto('/templates');
    // /templates has no index — redirects or 404 is acceptable
    expect([200, 404]).toContain(res?.status());
  });

  test('suna rebrand page loads', async ({ page }) => {
    const res = await page.goto('/suna');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('agents-101 page loads', async ({ page }) => {
    const res = await page.goto('/agents-101');
    expect(res?.status()).toBeLessThan(400);
  });

  test('careers page loads', async ({ page }) => {
    const res = await page.goto('/careers');
    expect(res?.status()).toBeLessThan(400);
  });

  test('countryerror page loads', async ({ page }) => {
    const res = await page.goto('/countryerror');
    expect(res?.status()).toBeLessThan(400);
  });
});

test.describe('404 Handling', () => {
  test('unknown route returns 404 page', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist-xyz');
    // Next.js custom 404 or redirect to /
    expect([200, 404]).toContain(res?.status());
    await expect(page.locator('body')).not.toContainText('Application error');
  });
});
