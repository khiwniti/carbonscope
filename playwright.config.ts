import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for CarbonBIM platform testing
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './tests',

  // Maximum time one test can run for
  timeout: 60 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Default timeout for actions
    actionTimeout: 15 * 1000,

    // Default navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for major browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 15 Pro'],
      },
    },

    // Tablet browsers
    {
      name: 'Tablet Chrome',
      use: {
        ...devices['iPad Pro'],
      },
    },

    // Additional mobile devices for comprehensive testing
    {
      name: 'Galaxy S23',
      use: {
        ...devices['Galaxy S9+'], // Using as proxy for S23
        viewport: { width: 360, height: 800 },
      },
    },

    // Edge (Chromium-based, same as chromium but with edge user agent)
    {
      name: 'edge',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'msedge',
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: process.env.CI ? 'npm run build && npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Folder for test artifacts
  outputDir: 'test-results/',

  // Global setup/teardown
  // globalSetup: require.resolve('./tests/global-setup.ts'),
  // globalTeardown: require.resolve('./tests/global-teardown.ts'),

  // Expect settings
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 10 * 1000,

    toHaveScreenshot: {
      // Maximum pixel ratio difference between expected and actual screenshots
      maxDiffPixelRatio: 0.1,
    },
  },
});
