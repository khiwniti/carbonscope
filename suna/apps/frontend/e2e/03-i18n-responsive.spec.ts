import { test, expect } from '@playwright/test';

/**
 * i18n / internationalization routes.
 * Locale prefixes should render marketing pages.
 */

test.describe('i18n Locale Routes', () => {
  const locales = ['de', 'fr', 'it'];
  // Only routes listed in MARKETING_ROUTES in middleware have locale prefixes
  const localizedRoutes = ['/', '/legal'];

  for (const locale of locales) {
    test(`/${locale} homepage renders`, async ({ page }) => {
      const res = await page.goto(`/${locale}`);
      expect(res?.status()).toBeLessThan(400);
      await expect(page.locator('body')).not.toContainText('Application error');
    });

    for (const route of localizedRoutes.slice(1)) {
      test(`/${locale}${route} loads`, async ({ page }) => {
        const res = await page.goto(`/${locale}${route}`);
        expect(res?.status()).toBeLessThan(400);
      });
    }
  }
});

/**
 * Responsive layout tests.
 */
test.describe('Responsive Layouts', () => {
  test('mobile viewport renders homepage', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('tablet viewport renders homepage', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('desktop viewport renders homepage', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('body')).not.toContainText('Application error');
  });
});

/**
 * Share routes — public content sharing.
 */
test.describe('Share Routes', () => {
  test('/share route loads without auth', async ({ page }) => {
    const res = await page.goto('/share');
    // May 404 without share ID, but should not crash
    expect([200, 404]).toContain(res?.status());
    await expect(page.locator('body')).not.toContainText('Application error');
  });
});

/**
 * Checkout route — public wrapper.
 */
test.describe('Checkout Route', () => {
  test('/checkout loads', async ({ page }) => {
    const res = await page.goto('/checkout');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('body')).not.toContainText('Application error');
  });
});
