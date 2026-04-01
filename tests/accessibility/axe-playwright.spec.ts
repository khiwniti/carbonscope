/**
 * Accessibility testing with axe-core and Playwright
 * Tests all major pages for WCAG 2.1 AA compliance
 *
 * Run: npx playwright test tests/accessibility/axe-playwright.spec.ts
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Pages to test for accessibility violations
 * Add new pages as they are developed
 */
const PAGES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/analysis', name: 'Analysis' },
  { path: '/materials', name: 'Materials' },
  { path: '/scenarios', name: 'Scenarios' },
  { path: '/reports', name: 'Reports' },
  { path: '/certification', name: 'Certification' },
  { path: '/settings', name: 'Settings' },
];

/**
 * WCAG 2.1 AA compliance tags
 * - wcag2a: WCAG 2.0 Level A
 * - wcag2aa: WCAG 2.0 Level AA
 * - wcag21a: WCAG 2.1 Level A
 * - wcag21aa: WCAG 2.1 Level AA
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

for (const page of PAGES_TO_TEST) {
  test.describe(`Accessibility: ${page.name}`, () => {
    test(`should not have accessibility violations`, async ({ page: pwPage }) => {
      // Navigate to page
      await pwPage.goto(page.path);

      // Wait for page to be fully loaded
      await pwPage.waitForLoadState('networkidle');

      // Wait for dynamic content to render (adjust timeout as needed)
      await pwPage.waitForTimeout(2000);

      // Run axe accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page: pwPage })
        .withTags(WCAG_TAGS)
        .analyze();

      // Assert no violations
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test(`should have proper page structure`, async ({ page: pwPage }) => {
      await pwPage.goto(page.path);
      await pwPage.waitForLoadState('networkidle');

      // Check for single h1 (page title)
      const h1Count = await pwPage.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      expect(h1Count).toBeLessThanOrEqual(1);

      // Check for main landmark
      const mainLandmark = pwPage.locator('main');
      await expect(mainLandmark).toBeVisible();

      // Check for proper lang attribute
      const htmlLang = await pwPage.getAttribute('html', 'lang');
      expect(htmlLang).toMatch(/^(en|th)$/);
    });

    test(`should have keyboard navigation`, async ({ page: pwPage }) => {
      await pwPage.goto(page.path);
      await pwPage.waitForLoadState('networkidle');

      // Tab through interactive elements
      await pwPage.keyboard.press('Tab');

      // Check if focus is visible
      const focusedElement = await pwPage.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;

        const styles = window.getComputedStyle(el);
        return {
          tagName: el.tagName,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
        };
      });

      expect(focusedElement).not.toBeNull();

      // Verify focus indicator is visible (outline or custom focus styling)
      if (focusedElement) {
        const hasFocusIndicator =
          focusedElement.outlineWidth !== '0px' ||
          focusedElement.outlineStyle !== 'none';

        // Note: Some custom focus styles may not use outline
        // This is a basic check; adjust based on your design system
        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test(`should have skip to main content link`, async ({ page: pwPage }) => {
      await pwPage.goto(page.path);
      await pwPage.waitForLoadState('networkidle');

      // Check for skip link (usually hidden until focused)
      const skipLink = pwPage.locator('a[href="#main-content"], a[href="#main"]').first();

      // Skip link should exist
      await expect(skipLink).toHaveCount(1);

      // Focus skip link
      await skipLink.focus();

      // Skip link should be visible when focused
      await expect(skipLink).toBeVisible();
    });
  });
}

/**
 * Test forms specifically for accessibility
 */
test.describe('Accessibility: Forms', () => {
  test('BOQ upload form should be accessible', async ({ page }) => {
    await page.goto('/analysis');
    await page.waitForLoadState('networkidle');

    // Check for form labels
    const fileInput = page.locator('input[type="file"]');

    // Input should have accessible name (via label, aria-label, or aria-labelledby)
    const accessibleName = await fileInput.evaluate((el) => {
      // Check for label
      const id = el.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) return label.textContent;
      }

      // Check for aria-label
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel;

      // Check for aria-labelledby
      const ariaLabelledBy = el.getAttribute('aria-labelledby');
      if (ariaLabelledBy) {
        const labelElement = document.getElementById(ariaLabelledBy);
        if (labelElement) return labelElement.textContent;
      }

      return null;
    });

    expect(accessibleName).not.toBeNull();
    expect(accessibleName).not.toBe('');
  });

  test('Scenario creation form should be accessible', async ({ page }) => {
    await page.goto('/scenarios');
    await page.waitForLoadState('networkidle');

    // Click "Create Scenario" button
    const createButton = page.locator('button:has-text("Create")').first();
    if (await createButton.count() > 0) {
      await createButton.click();

      // Wait for form to appear
      await page.waitForSelector('input[name="scenario-name"], input[placeholder*="scenario"]');

      // Run axe on the form modal/dialog
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });
});

/**
 * Test color contrast specifically
 */
test.describe('Accessibility: Color Contrast', () => {
  test('should meet contrast requirements', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Run axe with only color-contrast rule
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('body')
      .withRules(['color-contrast'])
      .analyze();

    // All text should meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large)
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

/**
 * Test ARIA attributes
 */
test.describe('Accessibility: ARIA', () => {
  test('should use ARIA correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Run axe with ARIA-specific rules
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('body')
      .withRules([
        'aria-allowed-attr',
        'aria-command-name',
        'aria-hidden-body',
        'aria-hidden-focus',
        'aria-input-field-name',
        'aria-meter-name',
        'aria-progressbar-name',
        'aria-required-attr',
        'aria-required-children',
        'aria-required-parent',
        'aria-roledescription',
        'aria-roles',
        'aria-toggle-field-name',
        'aria-tooltip-name',
        'aria-valid-attr-value',
        'aria-valid-attr',
      ])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

/**
 * Test images and alternative text
 */
test.describe('Accessibility: Images', () => {
  test('all images should have alt text', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Get all images
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const ariaLabel = await img.getAttribute('aria-label');

      // Image should have alt, or role="presentation/none", or aria-label
      const hasAccessibleName =
        alt !== null ||
        role === 'presentation' ||
        role === 'none' ||
        ariaLabel !== null;

      expect(hasAccessibleName).toBeTruthy();
    }
  });
});

/**
 * Test Thai language accessibility
 */
test.describe('Accessibility: Thai Language', () => {
  test('Thai pages should have correct lang attribute', async ({ page }) => {
    await page.goto('/?lang=th');
    await page.waitForLoadState('networkidle');

    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('th');
  });

  test('Thai text should be readable by screen readers', async ({ page }) => {
    await page.goto('/dashboard?lang=th');
    await page.waitForLoadState('networkidle');

    // Check that Thai text is not broken into images or inaccessible elements
    const thaiHeading = page.locator('h1, h2').first();
    const textContent = await thaiHeading.textContent();

    // Verify it's actual text (not empty)
    expect(textContent).not.toBeNull();
    expect(textContent?.length).toBeGreaterThan(0);
  });
});

/**
 * Test data tables
 */
test.describe('Accessibility: Tables', () => {
  test('data tables should have proper structure', async ({ page }) => {
    await page.goto('/analysis');
    await page.waitForLoadState('networkidle');

    // Find all data tables
    const tables = await page.locator('table').all();

    if (tables.length > 0) {
      for (const table of tables) {
        // Check for caption or aria-label
        const hasCaption = await table.locator('caption').count() > 0;
        const ariaLabel = await table.getAttribute('aria-label');
        const ariaLabelledBy = await table.getAttribute('aria-labelledby');

        const hasAccessibleName = hasCaption || ariaLabel || ariaLabelledBy;
        expect(hasAccessibleName).toBeTruthy();

        // Check for th elements in thead
        const thCount = await table.locator('th').count();
        expect(thCount).toBeGreaterThan(0);
      }
    }
  });
});

/**
 * Generate detailed accessibility report
 */
test.afterAll(async ({}, testInfo) => {
  // This hook runs after all tests in this file
  console.log('\n========================================');
  console.log('Accessibility Test Summary');
  console.log('========================================');
  console.log(`Total pages tested: ${PAGES_TO_TEST.length}`);
  console.log(`WCAG level: 2.1 AA`);
  console.log(`Standards: ${WCAG_TAGS.join(', ')}`);
  console.log('========================================\n');
});
