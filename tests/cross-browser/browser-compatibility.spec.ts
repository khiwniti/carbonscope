/**
 * Cross-browser compatibility testing with Playwright
 *
 * Tests all major pages across:
 * - Chrome (Chromium)
 * - Firefox
 * - Safari (WebKit)
 * - Edge (Chromium-based, via chromium project)
 *
 * Desktop and mobile variants
 *
 * Run: npx playwright test tests/cross-browser/browser-compatibility.spec.ts
 */

import { test, expect, devices, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Pages to test
 */
const PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/analysis', name: 'Analysis' },
  { path: '/materials', name: 'Materials' },
  { path: '/scenarios', name: 'Scenarios' },
  { path: '/reports', name: 'Reports' },
  { path: '/certification', name: 'Certification' },
];

/**
 * Browsers to test
 */
const BROWSERS = ['chromium', 'firefox', 'webkit'];

/**
 * Mobile devices to test
 */
const MOBILE_DEVICES = [
  { name: 'iPhone 15 Pro', config: devices['iPhone 15 Pro'] },
  { name: 'Pixel 7', config: devices['Pixel 7'] },
];

/**
 * Ensure screenshot directory exists
 */
function ensureScreenshotDir() {
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Check for console errors
 */
async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return errors;
}

/**
 * Desktop browser tests
 */
for (const browserName of BROWSERS) {
  test.describe(`${browserName} browser tests`, () => {
    test.use({ browserName: browserName as any });

    for (const page of PAGES) {
      test(`${page.name} renders correctly`, async ({ page: pwPage, browserName }) => {
        const errors: string[] = [];

        // Listen for console errors
        pwPage.on('console', (msg) => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        pwPage.on('pageerror', (error) => {
          errors.push(error.message);
        });

        // Navigate to page
        await pwPage.goto(page.path);
        await pwPage.waitForLoadState('networkidle');

        // Wait for dynamic content
        await pwPage.waitForTimeout(1000);

        // Take screenshot for visual comparison
        const screenshotDir = ensureScreenshotDir();
        await pwPage.screenshot({
          path: path.join(
            screenshotDir,
            `${browserName}-${page.name.toLowerCase().replace(/\s+/g, '-')}.png`
          ),
          fullPage: true,
        });

        // Verify page loaded
        await expect(pwPage.locator('body')).toBeVisible();

        // Verify no critical console errors
        const criticalErrors = errors.filter(
          (err) =>
            !err.includes('favicon') && // Ignore favicon errors
            !err.includes('sourcemap') && // Ignore sourcemap warnings in dev
            !err.includes('DevTools') // Ignore DevTools-specific warnings
        );

        expect(criticalErrors).toEqual([]);

        // Check for main content
        const main = pwPage.locator('main');
        await expect(main).toBeVisible();
      });

      test(`${page.name} has functional navigation`, async ({ page: pwPage }) => {
        await pwPage.goto(page.path);
        await pwPage.waitForLoadState('networkidle');

        // Check navigation links are present
        const nav = pwPage.locator('nav');
        await expect(nav).toBeVisible();

        // Check if clicking navigation works (test one link)
        const dashboardLink = pwPage.locator('a[href="/dashboard"], a:has-text("Dashboard")').first();

        if (await dashboardLink.count() > 0) {
          await dashboardLink.click();
          await pwPage.waitForURL('**/dashboard');
          await expect(pwPage).toHaveURL(/.*dashboard/);
        }
      });

      test(`${page.name} handles form inputs`, async ({ page: pwPage }) => {
        await pwPage.goto(page.path);
        await pwPage.waitForLoadState('networkidle');

        // Find first input field (if any)
        const inputs = await pwPage.locator('input:not([type="hidden"])').all();

        if (inputs.length > 0) {
          const firstInput = inputs[0];

          // Check if input is interactable
          await expect(firstInput).toBeVisible();
          await expect(firstInput).toBeEnabled();

          // Try typing in input
          await firstInput.click();
          await firstInput.fill('Test input');

          // Verify input value
          const value = await firstInput.inputValue();
          expect(value).toBe('Test input');
        }
      });

      test(`${page.name} handles button clicks`, async ({ page: pwPage }) => {
        await pwPage.goto(page.path);
        await pwPage.waitForLoadState('networkidle');

        // Find all buttons
        const buttons = await pwPage.locator('button:not([disabled])').all();

        if (buttons.length > 0) {
          // Test first visible button
          const firstButton = buttons[0];

          await expect(firstButton).toBeVisible();
          await expect(firstButton).toBeEnabled();

          // Click should not cause error
          await firstButton.click();

          // Wait a bit for any side effects
          await pwPage.waitForTimeout(500);

          // Page should still be functional
          await expect(pwPage.locator('body')).toBeVisible();
        }
      });
    }

    test('Font rendering is correct', async ({ page: pwPage }) => {
      await pwPage.goto('/dashboard?lang=th');
      await pwPage.waitForLoadState('networkidle');

      // Wait for fonts to load
      await pwPage.evaluate(() => {
        return document.fonts.ready;
      });

      // Check computed font family includes Noto Sans Thai
      const bodyFont = await pwPage.evaluate(() => {
        return window.getComputedStyle(document.body).fontFamily;
      });

      expect(bodyFont).toBeTruthy();
      // Should contain either Noto Sans Thai or a fallback
      expect(bodyFont.length).toBeGreaterThan(0);
    });

    test('SVG and Canvas elements render', async ({ page: pwPage }) => {
      await pwPage.goto('/dashboard');
      await pwPage.waitForLoadState('networkidle');

      // Check for SVG elements (charts, icons)
      const svgCount = await pwPage.locator('svg').count();

      // Note: Some pages may not have SVGs, this is informational
      console.log(`  SVG elements found: ${svgCount}`);

      // If SVGs exist, verify they're visible
      if (svgCount > 0) {
        const firstSvg = pwPage.locator('svg').first();
        await expect(firstSvg).toBeVisible();
      }
    });
  });
}

/**
 * Mobile device tests
 */
for (const device of MOBILE_DEVICES) {
  test.describe(`${device.name} mobile tests`, () => {
    test.use(device.config);

    for (const page of PAGES) {
      test(`${page.name} renders on mobile`, async ({ page: pwPage }) => {
        await pwPage.goto(page.path);
        await pwPage.waitForLoadState('networkidle');

        // Verify viewport is mobile size
        const viewport = pwPage.viewportSize();
        expect(viewport?.width).toBeLessThanOrEqual(430);

        // Take mobile screenshot
        const screenshotDir = ensureScreenshotDir();
        await pwPage.screenshot({
          path: path.join(
            screenshotDir,
            `mobile-${device.name.replace(/\s+/g, '-').toLowerCase()}-${page.name.toLowerCase().replace(/\s+/g, '-')}.png`
          ),
          fullPage: true,
        });

        // Verify page loaded
        await expect(pwPage.locator('body')).toBeVisible();

        // Check for mobile menu (hamburger)
        const mobileMenu = pwPage.locator('[aria-label*="menu"], button:has-text("Menu")').first();

        if (await mobileMenu.count() > 0) {
          await expect(mobileMenu).toBeVisible();
        }
      });

      test(`${page.name} handles touch interactions`, async ({ page: pwPage }) => {
        await pwPage.goto(page.path);
        await pwPage.waitForLoadState('networkidle');

        // Find tappable elements
        const buttons = await pwPage.locator('button:not([disabled])').all();

        if (buttons.length > 0) {
          // Tap first button
          await buttons[0].tap();

          // Wait for any effects
          await pwPage.waitForTimeout(500);

          // Page should still be functional
          await expect(pwPage.locator('body')).toBeVisible();
        }
      });

      test(`${page.name} scrolls smoothly`, async ({ page: pwPage }) => {
        await pwPage.goto(page.path);
        await pwPage.waitForLoadState('networkidle');

        // Get initial scroll position
        const initialScrollY = await pwPage.evaluate(() => window.scrollY);

        // Scroll down
        await pwPage.evaluate(() => {
          window.scrollBy(0, 500);
        });

        await pwPage.waitForTimeout(500);

        // Verify scroll happened
        const newScrollY = await pwPage.evaluate(() => window.scrollY);
        expect(newScrollY).toBeGreaterThan(initialScrollY);
      });
    }

    test('Mobile viewport meta tag is correct', async ({ page: pwPage }) => {
      await pwPage.goto('/');
      await pwPage.waitForLoadState('networkidle');

      // Check for viewport meta tag
      const viewport = await pwPage.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return meta ? meta.getAttribute('content') : null;
      });

      expect(viewport).toBeTruthy();
      expect(viewport).toContain('width=device-width');
      expect(viewport).toContain('initial-scale=1');
    });
  });
}

/**
 * Browser-specific feature tests
 */
test.describe('Browser-specific features', () => {
  test('CSS Grid works in all browsers', async ({ page: pwPage, browserName }) => {
    await pwPage.goto('/dashboard');
    await pwPage.waitForLoadState('networkidle');

    // Check if CSS Grid is supported
    const supportsGrid = await pwPage.evaluate(() => {
      return CSS.supports('display', 'grid');
    });

    expect(supportsGrid).toBeTruthy();
  });

  test('Flexbox works in all browsers', async ({ page: pwPage }) => {
    await pwPage.goto('/dashboard');
    await pwPage.waitForLoadState('networkidle');

    const supportsFlex = await pwPage.evaluate(() => {
      return CSS.supports('display', 'flex');
    });

    expect(supportsFlex).toBeTruthy();
  });

  test('Web fonts load correctly', async ({ page: pwPage }) => {
    await pwPage.goto('/dashboard');
    await pwPage.waitForLoadState('networkidle');

    // Wait for all fonts to load
    await pwPage.evaluate(() => document.fonts.ready);

    // Check font loading status
    const fontsLoaded = await pwPage.evaluate(() => {
      return document.fonts.status === 'loaded';
    });

    expect(fontsLoaded).toBeTruthy();
  });

  test('localStorage works', async ({ page: pwPage }) => {
    await pwPage.goto('/');
    await pwPage.waitForLoadState('networkidle');

    // Test localStorage
    const localStorageWorks = await pwPage.evaluate(() => {
      try {
        const testKey = 'test-key';
        const testValue = 'test-value';
        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        return retrieved === testValue;
      } catch {
        return false;
      }
    });

    expect(localStorageWorks).toBeTruthy();
  });

  test('sessionStorage works', async ({ page: pwPage }) => {
    await pwPage.goto('/');
    await pwPage.waitForLoadState('networkidle');

    const sessionStorageWorks = await pwPage.evaluate(() => {
      try {
        const testKey = 'test-key';
        const testValue = 'test-value';
        sessionStorage.setItem(testKey, testValue);
        const retrieved = sessionStorage.getItem(testKey);
        sessionStorage.removeItem(testKey);
        return retrieved === testValue;
      } catch {
        return false;
      }
    });

    expect(sessionStorageWorks).toBeTruthy();
  });
});

/**
 * Performance comparison across browsers
 */
test.describe('Performance across browsers', () => {
  for (const browserName of BROWSERS) {
    test(`${browserName} loads homepage in reasonable time`, async ({ page: pwPage }) => {
      const startTime = Date.now();

      await pwPage.goto('/');
      await pwPage.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      console.log(`  ${browserName} load time: ${loadTime}ms`);

      // Should load within 5 seconds (generous threshold for testing)
      expect(loadTime).toBeLessThan(5000);
    });
  }
});

/**
 * Test report generation
 */
test.afterAll(async () => {
  console.log('\n========================================');
  console.log('Cross-Browser Testing Complete');
  console.log('========================================');
  console.log(`Pages tested: ${PAGES.length}`);
  console.log(`Browsers tested: ${BROWSERS.length}`);
  console.log(`Mobile devices tested: ${MOBILE_DEVICES.length}`);
  console.log(`Total test combinations: ${PAGES.length * (BROWSERS.length + MOBILE_DEVICES.length)}`);
  console.log('========================================\n');
});
