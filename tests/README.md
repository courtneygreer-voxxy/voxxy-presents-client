# Testing Suite - Voxxy Presents

This directory contains all testing documentation and scripts for the Voxxy Presents performance optimization project.

---

## 📁 Directory Structure

```
tests/
├── README.md                    # This file
├── scripts/                     # Automated test scripts
│   ├── run-baseline-tests.sh    # Capture baseline performance metrics
│   ├── run-final-tests.sh       # Validate final performance and compare
│   ├── lighthouse-batch.sh      # Run Lighthouse on multiple URLs
│   └── compare-results.js       # Generate before/after comparison report
├── manual/                      # Manual test documentation
│   └── manual-test-cases.md     # Detailed manual test procedures
└── test-results/                # Test output (auto-generated)
    ├── baseline/                # Baseline test results
    ├── final/                   # Final validation results
    └── lighthouse-batch/        # Batch test results
```

---

## 🚀 Quick Start

### 1. Run Baseline Tests (BEFORE optimization)

```bash
cd /Users/courtneygreer/Development/voxxy-presents-client
./tests/scripts/run-baseline-tests.sh
```

**What it does**:
- Runs Lighthouse on all key pages
- Captures current performance metrics
- Saves results to `test-results/baseline/`
- Generates summary report

**Output**:
- HTML reports for each page
- JSON data for comparison
- Summary text file with key metrics

---

### 2. Implement Performance Optimizations

Follow the optimization plan in `PERFORMANCE_TEST_PLAN.md`.

---

### 3. Run Final Tests (AFTER optimization)

```bash
./tests/scripts/run-final-tests.sh
```

**What it does**:
- Runs Lighthouse on all key pages again
- Compares results to baseline
- Validates success criteria
- Generates comparison report

**Output**:
- HTML reports for each page
- Comparison table showing improvements
- Pass/Fail status for each page

---

### 4. Generate Detailed Comparison

```bash
node ./tests/scripts/compare-results.js
```

**What it does**:
- Analyzes baseline vs final results
- Generates detailed markdown report
- Validates all success criteria
- Provides recommendations

**Output**:
- `test-results/comparison-report.md`
- Recommendations for further optimization
- Final deployment decision (GO/NO-GO)

---

## 📊 Test Scripts Reference

### `run-baseline-tests.sh`

**Purpose**: Capture performance baseline before optimization

**Usage**:
```bash
./tests/scripts/run-baseline-tests.sh
```

**Requirements**:
- Lighthouse CLI installed (`npm install -g lighthouse`)
- Internet connection to access production site

**Outputs**:
- `test-results/baseline/home.report.html`
- `test-results/baseline/public-org.report.html`
- `test-results/baseline/subscribe.report.html`
- `test-results/baseline/login.report.html`
- `test-results/baseline/summary.txt`

---

### `run-final-tests.sh`

**Purpose**: Validate performance improvements after optimization

**Usage**:
```bash
./tests/scripts/run-final-tests.sh
```

**Requirements**:
- Baseline tests must be run first
- Lighthouse CLI installed
- Optimizations deployed to production

**Outputs**:
- `test-results/final/home.report.html`
- `test-results/final/public-org.report.html`
- `test-results/final/subscribe.report.html`
- `test-results/final/login.report.html`
- `test-results/final/comparison.txt`

---

### `lighthouse-batch.sh`

**Purpose**: Run Lighthouse multiple times for statistical accuracy

**Usage**:
```bash
# Run 3 times per URL (default)
./tests/scripts/lighthouse-batch.sh

# Custom URL and runs
./tests/scripts/lighthouse-batch.sh https://voxxy-presents.web.app ./custom-results 5
```

**Arguments**:
1. Base URL (default: `https://voxxy-presents.web.app`)
2. Output directory (default: `./test-results/lighthouse-batch`)
3. Number of runs per URL (default: 3)

**Outputs**:
- Multiple JSON reports per URL
- `batch-summary.txt` with averaged scores

---

### `compare-results.js`

**Purpose**: Generate detailed comparison report with recommendations

**Usage**:
```bash
node ./tests/scripts/compare-results.js
```

**Requirements**:
- Node.js installed
- Baseline and final tests completed

**Outputs**:
- `test-results/comparison-report.md` - Detailed markdown report
- Console output with key findings
- Exit code 0 (pass) or 1 (fail)

---

## 📋 Manual Test Cases

Manual test cases are documented in `manual/manual-test-cases.md`.

**Test Categories**:
1. Login Flow Performance
2. Public Page - Cold Cache
3. Public Page - Warm Cache
4. Subscribe Page Mobile
5. Dashboard Clubs Loading
6. Event Creation
7. Cache Sharing
8. Network Error Handling
9. Browser Back Button
10. Performance Monitoring

**How to use**:
1. Print or open `manual/manual-test-cases.md`
2. Follow step-by-step instructions for each test
3. Record actual results
4. Mark each test as PASS/FAIL
5. Summarize results at bottom

---

## ✅ Pre-Deployment Checklist

Before deploying to production, complete all items in:
- `tests/PRE_DEPLOYMENT_CHECKLIST.md`

**Key sections**:
- Code quality & testing
- Performance validation
- Cross-browser testing
- Security & privacy
- Monitoring setup
- Rollback plan
- Final go/no-go decision

---

## 🎯 Success Criteria

### Lighthouse Scores
- All pages: **> 90**

### Core Web Vitals
- First Contentful Paint (FCP): **< 1.2s**
- Largest Contentful Paint (LCP): **< 2.5s**
- Time to Interactive (TTI): **< 3.5s**
- Cumulative Layout Shift (CLS): **< 0.1**

### User Experience Metrics
- Login to Dashboard: **< 1s** with loading UI
- Public Page (cold cache): **< 1.5s**
- Public Page (warm cache): **< 500ms**
- Subscribe Page (cold cache): **< 1.5s**
- Dashboard Clubs: **< 800ms**

---

## 🔧 Troubleshooting

### Lighthouse Not Found
```bash
npm install -g lighthouse
```

### Permission Denied
```bash
chmod +x ./tests/scripts/*.sh
```

### Baseline Tests Not Found
Run baseline tests first before running final tests:
```bash
./tests/scripts/run-baseline-tests.sh
```

### bc Command Not Found (macOS)
```bash
brew install bc
```

---

## 📈 Continuous Performance Testing

### Local Development
Run performance checks before committing:
```bash
npm run build
npm run preview
# Then run Lighthouse on localhost
```

### Staging Environment
Run full test suite on staging before production:
```bash
./tests/scripts/lighthouse-batch.sh https://staging.voxxy-presents.web.app ./staging-results 5
```

### Production Monitoring
After deployment, monitor performance:
1. Check Sentry/LogRocket dashboard
2. Review Lighthouse scores weekly
3. Monitor Core Web Vitals in Google Search Console
4. Track user-reported performance issues

---

## 📚 Additional Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [PERFORMANCE_TEST_PLAN.md](../PERFORMANCE_TEST_PLAN.md) - Full test plan
- [TECH_DEBT.md](../TECH_DEBT.md) - Technical debt tracking

---

## 🤝 Contributing

When adding new tests:
1. Document in appropriate `.md` file
2. Add script to `scripts/` if automated
3. Update this README
4. Test the test (verify it catches regressions)

---

## 📞 Support

For questions about testing:
- Review `PERFORMANCE_TEST_PLAN.md` first
- Check test script comments
- Consult senior engineer if blocked

---

**Last Updated**: October 26, 2025
**Maintained By**: Development Team
