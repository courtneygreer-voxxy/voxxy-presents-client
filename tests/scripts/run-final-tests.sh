#!/bin/bash

# Performance Final Validation Test Script
# Measures performance after optimization and compares to baseline

set -e

echo "🎯 Starting Performance Final Validation Tests"
echo "==============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="https://www.voxxypresents.com"
TEST_ORG_SLUG="thrive-collective"
RESULTS_DIR="./test-results/final"
BASELINE_DIR="./test-results/baseline"

# Create results directory
mkdir -p "$RESULTS_DIR"

echo "${YELLOW}📋 Test Configuration:${NC}"
echo "  Production URL: $PRODUCTION_URL"
echo "  Test Org Slug: $TEST_ORG_SLUG"
echo "  Results Dir: $RESULTS_DIR"
echo "  Baseline Dir: $BASELINE_DIR"
echo ""

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo "${RED}❌ Lighthouse is not installed${NC}"
    echo "Install with: npm install -g lighthouse"
    exit 1
fi

# Check if baseline exists
if [ ! -f "$BASELINE_DIR/summary.txt" ]; then
    echo "${RED}❌ Baseline tests not found${NC}"
    echo "Run baseline tests first: ./tests/scripts/run-baseline-tests.sh"
    exit 1
fi

echo "${GREEN}✅ Baseline tests found${NC}"
echo ""

# Test 1: Home Page
echo "${YELLOW}🏠 Test 1: Home Page Performance${NC}"
echo "  URL: $PRODUCTION_URL/"
lighthouse "$PRODUCTION_URL/" \
  --output html \
  --output json \
  --output-path "$RESULTS_DIR/home" \
  --chrome-flags="--headless" \
  --quiet

HOME_SCORE=$(node -p "require('$RESULTS_DIR/home.report.json').categories.performance.score * 100")
BASELINE_HOME=$(grep "Home Page:" "$BASELINE_DIR/summary.txt" | awk '{print $3}')
IMPROVEMENT_HOME=$(echo "$HOME_SCORE - $BASELINE_HOME" | bc)
echo "${GREEN}  Performance Score: $HOME_SCORE (Baseline: $BASELINE_HOME, Δ $IMPROVEMENT_HOME)${NC}"
echo ""

# Test 2: Public Organization Page
echo "${YELLOW}🎪 Test 2: Public Organization Page${NC}"
echo "  URL: $PRODUCTION_URL/$TEST_ORG_SLUG"
lighthouse "$PRODUCTION_URL/$TEST_ORG_SLUG" \
  --output html \
  --output json \
  --output-path "$RESULTS_DIR/public-org" \
  --chrome-flags="--headless" \
  --quiet

PUBLIC_SCORE=$(node -p "require('$RESULTS_DIR/public-org.report.json').categories.performance.score * 100")
BASELINE_PUBLIC=$(grep "Public Org Page:" "$BASELINE_DIR/summary.txt" | awk '{print $4}')
IMPROVEMENT_PUBLIC=$(echo "$PUBLIC_SCORE - $BASELINE_PUBLIC" | bc)
echo "${GREEN}  Performance Score: $PUBLIC_SCORE (Baseline: $BASELINE_PUBLIC, Δ $IMPROVEMENT_PUBLIC)${NC}"
echo ""

# Test 3: Subscribe Page
echo "${YELLOW}📧 Test 3: Subscribe Page${NC}"
echo "  URL: $PRODUCTION_URL/subscribe/$TEST_ORG_SLUG"
lighthouse "$PRODUCTION_URL/subscribe/$TEST_ORG_SLUG" \
  --output html \
  --output json \
  --output-path "$RESULTS_DIR/subscribe" \
  --chrome-flags="--headless" \
  --quiet

SUBSCRIBE_SCORE=$(node -p "require('$RESULTS_DIR/subscribe.report.json').categories.performance.score * 100")
BASELINE_SUBSCRIBE=$(grep "Subscribe Page:" "$BASELINE_DIR/summary.txt" | awk '{print $3}')
IMPROVEMENT_SUBSCRIBE=$(echo "$SUBSCRIBE_SCORE - $BASELINE_SUBSCRIBE" | bc)
echo "${GREEN}  Performance Score: $SUBSCRIBE_SCORE (Baseline: $BASELINE_SUBSCRIBE, Δ $IMPROVEMENT_SUBSCRIBE)${NC}"
echo ""

# Test 4: Login Page
echo "${YELLOW}🔐 Test 4: Login Page${NC}"
echo "  URL: $PRODUCTION_URL/login/club-owner"
lighthouse "$PRODUCTION_URL/login/club-owner" \
  --output html \
  --output json \
  --output-path "$RESULTS_DIR/login" \
  --chrome-flags="--headless" \
  --quiet

LOGIN_SCORE=$(node -p "require('$RESULTS_DIR/login.report.json').categories.performance.score * 100")
BASELINE_LOGIN=$(grep "Login Page:" "$BASELINE_DIR/summary.txt" | awk '{print $3}')
IMPROVEMENT_LOGIN=$(echo "$LOGIN_SCORE - $BASELINE_LOGIN" | bc)
echo "${GREEN}  Performance Score: $LOGIN_SCORE (Baseline: $BASELINE_LOGIN, Δ $IMPROVEMENT_LOGIN)${NC}"
echo ""

# Generate Comparison Report
echo "${YELLOW}📊 Generating Comparison Report${NC}"

cat > "$RESULTS_DIR/comparison.txt" << EOF
Performance Comparison Report
=============================
Date: $(date)
Production URL: $PRODUCTION_URL

LIGHTHOUSE SCORES - BEFORE vs AFTER
====================================

Page                | Baseline | Final  | Improvement | Status
--------------------|----------|--------|-------------|--------
Home Page           | $BASELINE_HOME     | $HOME_SCORE    | +$IMPROVEMENT_HOME      | $([ $(echo "$HOME_SCORE > 90" | bc) -eq 1 ] && echo "✅ PASS" || echo "⚠️  REVIEW")
Public Org Page     | $BASELINE_PUBLIC     | $PUBLIC_SCORE    | +$IMPROVEMENT_PUBLIC      | $([ $(echo "$PUBLIC_SCORE > 90" | bc) -eq 1 ] && echo "✅ PASS" || echo "⚠️  REVIEW")
Subscribe Page      | $BASELINE_SUBSCRIBE     | $SUBSCRIBE_SCORE    | +$IMPROVEMENT_SUBSCRIBE      | $([ $(echo "$SUBSCRIBE_SCORE > 90" | bc) -eq 1 ] && echo "✅ PASS" || echo "⚠️  REVIEW")
Login Page          | $BASELINE_LOGIN     | $LOGIN_SCORE    | +$IMPROVEMENT_LOGIN      | $([ $(echo "$LOGIN_SCORE > 90" | bc) -eq 1 ] && echo "✅ PASS" || echo "⚠️  REVIEW")

CORE WEB VITALS - Home Page
============================

Metric  | Baseline | Final | Target | Status
--------|----------|-------|--------|--------
FCP     | $(grep "FCP:" "$BASELINE_DIR/summary.txt" | awk '{print $2}') | $(node -p "require('$RESULTS_DIR/home.report.json').audits['first-contentful-paint'].displayValue") | < 1.8s | $([ $(node -p "require('$RESULTS_DIR/home.report.json').audits['first-contentful-paint'].numericValue") -lt 1800 ] && echo "✅" || echo "⚠️")
LCP     | $(grep "LCP:" "$BASELINE_DIR/summary.txt" | awk '{print $2}') | $(node -p "require('$RESULTS_DIR/home.report.json').audits['largest-contentful-paint'].displayValue") | < 2.5s | $([ $(node -p "require('$RESULTS_DIR/home.report.json').audits['largest-contentful-paint'].numericValue") -lt 2500 ] && echo "✅" || echo "⚠️")
TBT     | $(grep "TBT:" "$BASELINE_DIR/summary.txt" | awk '{print $2}') | $(node -p "require('$RESULTS_DIR/home.report.json').audits['total-blocking-time'].displayValue") | < 300ms | $([ $(node -p "require('$RESULTS_DIR/home.report.json').audits['total-blocking-time'].numericValue") -lt 300 ] && echo "✅" || echo "⚠️")
CLS     | $(grep "CLS:" "$BASELINE_DIR/summary.txt" | awk '{print $2}') | $(node -p "require('$RESULTS_DIR/home.report.json').audits['cumulative-layout-shift'].displayValue") | < 0.1  | $([ $(node -p "require('$RESULTS_DIR/home.report.json').audits['cumulative-layout-shift'].numericValue < 0.1") == "true" ] && echo "✅" || echo "⚠️")

SUCCESS CRITERIA VALIDATION
============================

Criterion                          | Target    | Actual    | Status
-----------------------------------|-----------|-----------|--------
All pages > 90 Lighthouse score    | > 90      | See above | TBD
Home page FCP                      | < 1.2s    | $(node -p "require('$RESULTS_DIR/home.report.json').audits['first-contentful-paint'].displayValue") | $([ $(node -p "require('$RESULTS_DIR/home.report.json').audits['first-contentful-paint'].numericValue") -lt 1200 ] && echo "✅ PASS" || echo "⚠️  NEEDS WORK")
Home page LCP                      | < 2.5s    | $(node -p "require('$RESULTS_DIR/home.report.json').audits['largest-contentful-paint'].displayValue") | $([ $(node -p "require('$RESULTS_DIR/home.report.json').audits['largest-contentful-paint'].numericValue") -lt 2500 ] && echo "✅ PASS" || echo "⚠️  NEEDS WORK")
Home page TTI                      | < 3.5s    | $(node -p "require('$RESULTS_DIR/home.report.json').audits['interactive'].displayValue") | $([ $(node -p "require('$RESULTS_DIR/home.report.json').audits['interactive'].numericValue") -lt 3500 ] && echo "✅ PASS" || echo "⚠️  NEEDS WORK")

DETAILED REPORTS
================
Home:      file://$PWD/$RESULTS_DIR/home.report.html
Public:    file://$PWD/$RESULTS_DIR/public-org.report.html
Subscribe: file://$PWD/$RESULTS_DIR/subscribe.report.html
Login:     file://$PWD/$RESULTS_DIR/login.report.html

BASELINE REPORTS (for comparison)
==================================
Home:      file://$PWD/$BASELINE_DIR/home.report.html
Public:    file://$PWD/$BASELINE_DIR/public-org.report.html
Subscribe: file://$PWD/$BASELINE_DIR/subscribe.report.html
Login:     file://$PWD/$BASELINE_DIR/login.report.html

NEXT STEPS
==========
1. Review detailed HTML reports for any remaining issues
2. If all criteria pass: ✅ Approved for deployment
3. If criteria fail: ⚠️  Investigate and optimize further
4. Update PERFORMANCE_TEST_PLAN.md with final results
5. Run manual smoke tests (see PERFORMANCE_TEST_PLAN.md Phase 4)
EOF

cat "$RESULTS_DIR/comparison.txt"
echo ""

# Final verdict
PASSING_COUNT=0
TOTAL_COUNT=4

[ $(echo "$HOME_SCORE > 90" | bc) -eq 1 ] && ((PASSING_COUNT++))
[ $(echo "$PUBLIC_SCORE > 90" | bc) -eq 1 ] && ((PASSING_COUNT++))
[ $(echo "$SUBSCRIBE_SCORE > 90" | bc) -eq 1 ] && ((PASSING_COUNT++))
[ $(echo "$LOGIN_SCORE > 90" | bc) -eq 1 ] && ((PASSING_COUNT++))

echo "${BLUE}================================================${NC}"
if [ $PASSING_COUNT -eq $TOTAL_COUNT ]; then
    echo "${GREEN}✅ ALL TESTS PASSED! ($PASSING_COUNT/$TOTAL_COUNT pages > 90)${NC}"
    echo "${GREEN}🚀 Ready for deployment${NC}"
else
    echo "${YELLOW}⚠️  PARTIAL PASS ($PASSING_COUNT/$TOTAL_COUNT pages > 90)${NC}"
    echo "${YELLOW}📝 Review failed pages and optimize further${NC}"
fi
echo "${BLUE}================================================${NC}"
echo ""

echo "📁 Results saved to: $RESULTS_DIR/"
echo "📄 Comparison: $RESULTS_DIR/comparison.txt"
