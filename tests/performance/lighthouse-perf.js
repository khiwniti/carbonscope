/**
 * Lighthouse performance testing script
 *
 * Runs Lighthouse performance audits on all major pages
 * for both desktop and mobile form factors.
 *
 * Targets:
 * - Desktop: ≥90
 * - Mobile: ≥80
 *
 * Run: node tests/performance/lighthouse-perf.js
 *
 * Prerequisites:
 * - npm install -D lighthouse chrome-launcher
 * - Application running on http://localhost:3000
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Pages to test
const PAGES = [
  { url: 'http://localhost:3000/', name: 'Homepage' },
  { url: 'http://localhost:3000/dashboard', name: 'Dashboard' },
  { url: 'http://localhost:3000/analysis', name: 'Analysis' },
  { url: 'http://localhost:3000/materials', name: 'Materials' },
  { url: 'http://localhost:3000/scenarios', name: 'Scenarios' },
  { url: 'http://localhost:3000/reports', name: 'Reports' },
  { url: 'http://localhost:3000/certification', name: 'Certification' },
];

// Form factors to test
const FORM_FACTORS = ['desktop', 'mobile'];

// Performance thresholds
const THRESHOLDS = {
  desktop: {
    performance: 90,
    fcp: 1800, // First Contentful Paint (ms)
    lcp: 2500, // Largest Contentful Paint (ms)
    cls: 0.1,  // Cumulative Layout Shift
    tbt: 200,  // Total Blocking Time (ms)
  },
  mobile: {
    performance: 80,
    fcp: 1800,
    lcp: 2500,
    cls: 0.1,
    tbt: 200,
  },
};

/**
 * Get Lighthouse configuration for form factor
 */
function getLighthouseConfig(formFactor) {
  const isMobile = formFactor === 'mobile';

  return {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance'],
      formFactor,
      throttling: isMobile
        ? {
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4,
            requestLatencyMs: 150,
            downloadThroughputKbps: 1638.4,
            uploadThroughputKbps: 675,
          }
        : {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
      screenEmulation: {
        mobile: isMobile,
        width: isMobile ? 375 : 1920,
        height: isMobile ? 667 : 1080,
        deviceScaleFactor: isMobile ? 2 : 1,
        disabled: false,
      },
    },
  };
}

/**
 * Run Lighthouse audit
 */
async function runLighthouse(url, formFactor) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  try {
    const config = getLighthouseConfig(formFactor);
    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      ...config.settings,
    };

    const runnerResult = await lighthouse(url, options, config);
    const { lhr } = runnerResult;

    return {
      url,
      formFactor,
      score: Math.round(lhr.categories.performance.score * 100),
      metrics: {
        fcp: Math.round(lhr.audits['first-contentful-paint'].numericValue),
        lcp: Math.round(lhr.audits['largest-contentful-paint'].numericValue),
        tti: Math.round(lhr.audits['interactive'].numericValue),
        cls: parseFloat(lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
        tbt: Math.round(lhr.audits['total-blocking-time'].numericValue),
        si: Math.round(lhr.audits['speed-index'].numericValue),
      },
      audits: {
        renderBlocking: lhr.audits['render-blocking-resources'],
        unusedCss: lhr.audits['unused-css-rules'],
        unusedJs: lhr.audits['unused-javascript'],
        modernImageFormats: lhr.audits['modern-image-formats'],
        optimizedImages: lhr.audits['uses-optimized-images'],
        textCompression: lhr.audits['uses-text-compression'],
      },
    };
  } finally {
    await chrome.kill();
  }
}

/**
 * Format milliseconds to seconds
 */
function formatMs(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Get status emoji
 */
function getStatusEmoji(value, threshold, invert = false) {
  const pass = invert ? value <= threshold : value >= threshold;
  return pass ? '✅' : '❌';
}

/**
 * Print results table
 */
function printResults(results) {
  console.log('\n' + '='.repeat(100));
  console.log('Lighthouse Performance Results');
  console.log('='.repeat(100));

  for (const formFactor of FORM_FACTORS) {
    const formFactorResults = results.filter(r => r.formFactor === formFactor);
    const threshold = THRESHOLDS[formFactor];

    console.log(`\n${formFactor.toUpperCase()} (Target: ≥${threshold.performance})`);
    console.log('-'.repeat(100));

    for (const result of formFactorResults) {
      const status = getStatusEmoji(result.score, threshold.performance);
      console.log(`\n${status} ${result.name}`);
      console.log(`   Score: ${result.score}/100`);
      console.log(`   FCP: ${formatMs(result.metrics.fcp)} (target: <${formatMs(threshold.fcp)})`);
      console.log(`   LCP: ${formatMs(result.metrics.lcp)} (target: <${formatMs(threshold.lcp)})`);
      console.log(`   CLS: ${result.metrics.cls} (target: <${threshold.cls})`);
      console.log(`   TBT: ${result.metrics.tbt}ms (target: <${threshold.tbt}ms)`);
      console.log(`   SI: ${formatMs(result.metrics.si)}`);
    }
  }

  console.log('\n' + '='.repeat(100));
}

/**
 * Generate detailed report
 */
function generateDetailedReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: 0,
      failed: 0,
    },
    results: results.map(r => {
      const threshold = THRESHOLDS[r.formFactor];
      const passed = r.score >= threshold.performance;

      if (passed) {
        report.summary.passed++;
      } else {
        report.summary.failed++;
      }

      return {
        ...r,
        passed,
        threshold: threshold.performance,
        issues: {
          fcpSlow: r.metrics.fcp > threshold.fcp,
          lcpSlow: r.metrics.lcp > threshold.lcp,
          clsHigh: r.metrics.cls > threshold.cls,
          tbtHigh: r.metrics.tbt > threshold.tbt,
        },
      };
    }),
  };

  return report;
}

/**
 * Save results to file
 */
function saveResults(report) {
  const outputDir = path.join(__dirname);
  const outputPath = path.join(outputDir, 'lighthouse-perf-results.json');

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);

  // Also save a summary CSV
  const csvPath = path.join(outputDir, 'lighthouse-perf-summary.csv');
  const csv = [
    'Page,FormFactor,Score,FCP,LCP,CLS,TBT,Passed',
    ...report.results.map(r =>
      `${r.name},${r.formFactor},${r.score},${r.metrics.fcp},${r.metrics.lcp},${r.metrics.cls},${r.metrics.tbt},${r.passed}`
    ),
  ].join('\n');

  fs.writeFileSync(csvPath, csv);
  console.log(`Summary saved to: ${csvPath}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('Running Lighthouse performance audits...\n');
  console.log(`Testing ${PAGES.length} pages × ${FORM_FACTORS.length} form factors = ${PAGES.length * FORM_FACTORS.length} audits\n`);

  const results = [];

  for (const page of PAGES) {
    for (const formFactor of FORM_FACTORS) {
      const label = `${page.name} (${formFactor})`;
      console.log(`[${results.length + 1}/${PAGES.length * FORM_FACTORS.length}] Auditing ${label}...`);

      try {
        const result = await runLighthouse(page.url, formFactor);
        results.push({ ...result, name: page.name });

        const threshold = THRESHOLDS[formFactor];
        const status = result.score >= threshold.performance ? '✅' : '❌';
        console.log(`  ${status} Score: ${result.score}/100 (target: ≥${threshold.performance})\n`);
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        results.push({
          url: page.url,
          name: page.name,
          formFactor,
          score: 0,
          error: error.message,
        });
      }
    }
  }

  // Print results
  printResults(results);

  // Generate and save detailed report
  const report = generateDetailedReport(results);
  saveResults(report);

  // Check for failures
  const failures = results.filter(r => {
    const threshold = THRESHOLDS[r.formFactor];
    return r.score < threshold.performance;
  });

  if (failures.length > 0) {
    console.error(`\n❌ ${failures.length} audits failed performance targets:`);
    failures.forEach(f => {
      const threshold = THRESHOLDS[f.formFactor];
      console.error(`  - ${f.name} (${f.formFactor}): ${f.score} < ${threshold.performance}`);
    });
    console.error('\nReview the detailed report for optimization opportunities.\n');
    process.exit(1);
  }

  console.log('\n✅ All pages passed performance targets!\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runLighthouse, PAGES, FORM_FACTORS, THRESHOLDS };
