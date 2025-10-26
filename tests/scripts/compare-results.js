#!/usr/bin/env node

/**
 * Performance Results Comparison Tool
 * Compares baseline and final Lighthouse results and generates detailed report
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASELINE_DIR = './test-results/baseline';
const FINAL_DIR = './test-results/final';
const OUTPUT_FILE = './test-results/comparison-report.md';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

console.log(`${colors.bold}📊 Performance Comparison Report Generator${colors.reset}`);
console.log('='.repeat(50));
console.log('');

// Check if directories exist
if (!fs.existsSync(BASELINE_DIR)) {
  console.error(`${colors.red}❌ Baseline directory not found: ${BASELINE_DIR}${colors.reset}`);
  console.error('Run baseline tests first: ./tests/scripts/run-baseline-tests.sh');
  process.exit(1);
}

if (!fs.existsSync(FINAL_DIR)) {
  console.error(`${colors.red}❌ Final directory not found: ${FINAL_DIR}${colors.reset}`);
  console.error('Run final tests first: ./tests/scripts/run-final-tests.sh');
  process.exit(1);
}

// Pages to compare
const pages = [
  { name: 'Home', file: 'home.report.json' },
  { name: 'Public Organization', file: 'public-org.report.json' },
  { name: 'Subscribe Page', file: 'subscribe.report.json' },
  { name: 'Login Page', file: 'login.report.json' },
];

// Metrics to extract
const metrics = [
  { key: 'performance', name: 'Performance Score', multiplier: 100, unit: '' },
  { key: 'first-contentful-paint', name: 'First Contentful Paint', path: 'audits', unit: 'ms' },
  { key: 'largest-contentful-paint', name: 'Largest Contentful Paint', path: 'audits', unit: 'ms' },
  { key: 'total-blocking-time', name: 'Total Blocking Time', path: 'audits', unit: 'ms' },
  { key: 'cumulative-layout-shift', name: 'Cumulative Layout Shift', path: 'audits', unit: '' },
  { key: 'speed-index', name: 'Speed Index', path: 'audits', unit: 'ms' },
  { key: 'interactive', name: 'Time to Interactive', path: 'audits', unit: 'ms' },
];

// Function to load JSON report
function loadReport(dir, filename) {
  const filepath = path.join(dir, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`${colors.yellow}⚠️  Report not found: ${filepath}${colors.reset}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

// Function to extract metric value
function getMetricValue(report, metric) {
  if (!report) return null;

  if (metric.key === 'performance') {
    return report.categories.performance.score * metric.multiplier;
  }

  if (metric.path === 'audits') {
    const audit = report.audits[metric.key];
    return audit ? audit.numericValue : null;
  }

  return null;
}

// Function to format value
function formatValue(value, unit) {
  if (value === null) return 'N/A';
  if (unit === 'ms') return `${Math.round(value)}ms`;
  return value.toFixed(1);
}

// Function to calculate improvement percentage
function calcImprovement(baseline, final) {
  if (!baseline || !final) return null;
  return ((final - baseline) / baseline) * 100;
}

// Function to get status icon
function getStatusIcon(improvement, metric) {
  if (improvement === null) return '❓';

  // For performance score, higher is better
  if (metric.key === 'performance') {
    if (improvement > 10) return '✅';
    if (improvement > 0) return '⬆️';
    if (improvement < -5) return '⚠️';
    return '➡️';
  }

  // For other metrics, lower is better (except score)
  if (improvement < -10) return '✅';
  if (improvement < 0) return '⬇️';
  if (improvement > 5) return '⚠️';
  return '➡️';
}

// Generate comparison data
const comparisonData = [];

pages.forEach((page) => {
  const baseline = loadReport(BASELINE_DIR, page.file);
  const final = loadReport(FINAL_DIR, page.file);

  const pageData = {
    name: page.name,
    metrics: {},
  };

  metrics.forEach((metric) => {
    const baselineValue = getMetricValue(baseline, metric);
    const finalValue = getMetricValue(final, metric);
    const improvement = calcImprovement(baselineValue, finalValue);

    pageData.metrics[metric.key] = {
      baseline: baselineValue,
      final: finalValue,
      improvement,
      status: getStatusIcon(improvement, metric),
    };
  });

  comparisonData.push(pageData);
});

// Generate Markdown report
let markdown = `# Performance Optimization Results\n\n`;
markdown += `**Generated**: ${new Date().toLocaleString()}\n\n`;
markdown += `**Baseline**: ${BASELINE_DIR}\n`;
markdown += `**Final**: ${FINAL_DIR}\n\n`;
markdown += `---\n\n`;

// Summary table
markdown += `## Summary\n\n`;
markdown += `| Page | Baseline Score | Final Score | Improvement | Status |\n`;
markdown += `|------|----------------|-------------|-------------|--------|\n`;

comparisonData.forEach((page) => {
  const perf = page.metrics.performance;
  const baselineScore = formatValue(perf.baseline, '');
  const finalScore = formatValue(perf.final, '');
  const improvement = perf.improvement !== null ? `${perf.improvement.toFixed(1)}%` : 'N/A';

  markdown += `| ${page.name} | ${baselineScore} | ${finalScore} | ${improvement} | ${perf.status} |\n`;
});

markdown += `\n---\n\n`;

// Detailed metrics for each page
markdown += `## Detailed Metrics\n\n`;

comparisonData.forEach((page) => {
  markdown += `### ${page.name}\n\n`;
  markdown += `| Metric | Baseline | Final | Δ | Status |\n`;
  markdown += `|--------|----------|-------|---|--------|\n`;

  metrics.forEach((metric) => {
    const data = page.metrics[metric.key];
    const baselineStr = formatValue(data.baseline, metric.unit);
    const finalStr = formatValue(data.final, metric.unit);
    const delta = data.improvement !== null ? `${data.improvement.toFixed(1)}%` : 'N/A';

    markdown += `| ${metric.name} | ${baselineStr} | ${finalStr} | ${delta} | ${data.status} |\n`;
  });

  markdown += `\n`;
});

markdown += `---\n\n`;

// Success criteria validation
markdown += `## Success Criteria Validation\n\n`;
markdown += `| Criterion | Target | Status |\n`;
markdown += `|-----------|--------|--------|\n`;

const homePerf = comparisonData.find((p) => p.name === 'Home');
if (homePerf) {
  const perfScore = homePerf.metrics.performance.final;
  const fcp = homePerf.metrics['first-contentful-paint'].final;
  const lcp = homePerf.metrics['largest-contentful-paint'].final;
  const tti = homePerf.metrics.interactive.final;

  markdown += `| All pages > 90 Lighthouse score | > 90 | ${comparisonData.every((p) => p.metrics.performance.final > 90) ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Home FCP < 1.2s | < 1200ms | ${fcp && fcp < 1200 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Home LCP < 2.5s | < 2500ms | ${lcp && lcp < 2500 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Home TTI < 3.5s | < 3500ms | ${tti && tti < 3500 ? '✅ PASS' : '❌ FAIL'} |\n`;
}

markdown += `\n---\n\n`;

// Recommendations
markdown += `## Recommendations\n\n`;

let allPassing = true;
comparisonData.forEach((page) => {
  if (page.metrics.performance.final < 90) {
    allPassing = false;
    markdown += `- ⚠️ **${page.name}**: Performance score below target (${page.metrics.performance.final.toFixed(1)}/100)\n`;

    // Check specific metrics
    if (page.metrics['largest-contentful-paint'].final > 2500) {
      markdown += `  - LCP is slow (${formatValue(page.metrics['largest-contentful-paint'].final, 'ms')}). Consider image optimization or lazy loading.\n`;
    }
    if (page.metrics['total-blocking-time'].final > 300) {
      markdown += `  - High TBT (${formatValue(page.metrics['total-blocking-time'].final, 'ms')}). Reduce JavaScript execution time.\n`;
    }
  }
});

if (allPassing) {
  markdown += `✅ **All pages meet performance targets!**\n\n`;
  markdown += `Ready for production deployment.\n`;
} else {
  markdown += `\n📝 Review individual Lighthouse reports for specific optimization opportunities.\n`;
}

markdown += `\n---\n\n`;

// Next steps
markdown += `## Next Steps\n\n`;
markdown += `1. Review detailed Lighthouse reports in \`${FINAL_DIR}/\`\n`;
markdown += `2. Update \`PERFORMANCE_TEST_PLAN.md\` with final results\n`;
markdown += `3. Run manual smoke tests (Phase 4 in test plan)\n`;
markdown += `4. ${allPassing ? '🚀 Deploy to production' : '🔧 Optimize further and re-test'}\n`;

// Save markdown report
fs.writeFileSync(OUTPUT_FILE, markdown);

// Print to console
console.log(markdown);

console.log('');
console.log(`${colors.green}✅ Comparison report generated${colors.reset}`);
console.log(`📄 Report saved to: ${OUTPUT_FILE}`);
console.log('');

// Exit with appropriate code
process.exit(allPassing ? 0 : 1);
