#!/bin/bash

# Performance Baseline Test Script
# Measures current performance before optimization

set -e

echo "🔍 Starting Performance Baseline Tests"
echo "======================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="https://www.voxxypresents.com"
TEST_ORG_SLUG="thrive-collective"
RESULTS_DIR="./test-results/baseline"

# Create results directory
mkdir -p "$RESULTS_DIR"

echo "${YELLOW}📋 Test Configuration:${NC}"
echo "  Production URL: $PRODUCTION_URL"
echo "  Test Org Slug: $TEST_ORG_SLUG"
echo "  Results Dir: $RESULTS_DIR"
echo ""

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo "${RED}❌ Lighthouse is not installed${NC}"
    echo "Install with: npm install -g lighthouse"
    exit 1
fi

echo "${GREEN}✅ Lighthouse is installed${NC}"
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
echo "${GREEN}  Performance Score: $HOME_SCORE${NC}"
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
echo "${GREEN}  Performance Score: $PUBLIC_SCORE${NC}"
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
echo "${GREEN}  Performance Score: $SUBSCRIBE_SCORE${NC}"
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
echo "${GREEN}  Performance Score: $LOGIN_SCORE${NC}"
echo ""

# Generate Summary Report
echo "${YELLOW}📊 Generating Summary Report${NC}"

cat > "$RESULTS_DIR/summary.txt" << EOF
Performance Baseline Test Results
==================================
Date: $(date)
Production URL: $PRODUCTION_URL

Lighthouse Scores:
  Home Page:        $HOME_SCORE
  Public Org Page:  $PUBLIC_SCORE
  Subscribe Page:   $SUBSCRIBE_SCORE
  Login Page:       $LOGIN_SCORE

Key Metrics (from Home Page):
  FCP: $(node -p "require('$RESULTS_DIR/home.report.json').audits['first-contentful-paint'].displayValue")
  LCP: $(node -p "require('$RESULTS_DIR/home.report.json').audits['largest-contentful-paint'].displayValue")
  TBT: $(node -p "require('$RESULTS_DIR/home.report.json').audits['total-blocking-time'].displayValue")
  TTI: $(node -p "require('$RESULTS_DIR/home.report.json').audits['interactive'].displayValue")
  CLS: $(node -p "require('$RESULTS_DIR/home.report.json').audits['cumulative-layout-shift'].displayValue")

HTML Reports:
  Home:      file://$PWD/$RESULTS_DIR/home.report.html
  Public:    file://$PWD/$RESULTS_DIR/public-org.report.html
  Subscribe: file://$PWD/$RESULTS_DIR/subscribe.report.html
  Login:     file://$PWD/$RESULTS_DIR/login.report.html

Next Steps:
  1. Review HTML reports for specific recommendations
  2. Record baseline metrics in PERFORMANCE_TEST_PLAN.md
  3. Begin optimization implementation
  4. Run final tests with: ./tests/scripts/run-final-tests.sh
EOF

cat "$RESULTS_DIR/summary.txt"
echo ""

echo "${GREEN}✅ Baseline tests complete!${NC}"
echo "📁 Results saved to: $RESULTS_DIR/"
echo "📄 Summary: $RESULTS_DIR/summary.txt"
echo ""
echo "${YELLOW}Next: Record these metrics in PERFORMANCE_TEST_PLAN.md${NC}"
