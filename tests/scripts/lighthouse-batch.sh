#!/bin/bash

# Batch Lighthouse Testing
# Run Lighthouse on multiple URLs with various configurations

set -e

echo "🔦 Lighthouse Batch Testing"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BASE_URL="${1:-https://voxxy-presents.web.app}"
OUTPUT_DIR="${2:-./test-results/lighthouse-batch}"
RUNS="${3:-3}" # Number of runs per URL for averaging

echo "${YELLOW}Configuration:${NC}"
echo "  Base URL: $BASE_URL"
echo "  Output Dir: $OUTPUT_DIR"
echo "  Runs per URL: $RUNS"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# URLs to test
declare -a URLS=(
    "/"
    "/thrive-collective"
    "/subscribe/thrive-collective"
    "/login/club-owner"
    "/auth"
)

# Run Lighthouse multiple times for each URL
for url in "${URLS[@]}"; do
    FULL_URL="$BASE_URL$url"
    URL_SLUG=$(echo "$url" | sed 's/\//-/g' | sed 's/^-//')

    echo "${YELLOW}Testing: $FULL_URL${NC}"

    declare -a SCORES=()

    for i in $(seq 1 $RUNS); do
        echo "  Run $i/$RUNS..."

        lighthouse "$FULL_URL" \
            --output json \
            --output-path "$OUTPUT_DIR/${URL_SLUG}-run${i}" \
            --chrome-flags="--headless" \
            --quiet \
            --only-categories=performance

        SCORE=$(node -p "require('$OUTPUT_DIR/${URL_SLUG}-run${i}.report.json').categories.performance.score * 100")
        SCORES+=($SCORE)
        echo "    Score: $SCORE"
    done

    # Calculate average
    TOTAL=0
    for score in "${SCORES[@]}"; do
        TOTAL=$(echo "$TOTAL + $score" | bc)
    done
    AVG=$(echo "scale=1; $TOTAL / $RUNS" | bc)

    echo "${GREEN}  Average Score: $AVG${NC}"
    echo ""
done

# Generate final report with all URLs
cat > "$OUTPUT_DIR/batch-summary.txt" << EOF
Lighthouse Batch Test Summary
==============================
Date: $(date)
Base URL: $BASE_URL
Runs per URL: $RUNS

URL Performance Scores (Average of $RUNS runs):
EOF

for url in "${URLS[@]}"; do
    URL_SLUG=$(echo "$url" | sed 's/\//-/g' | sed 's/^-//')

    declare -a SCORES=()
    for i in $(seq 1 $RUNS); do
        SCORE=$(node -p "require('$OUTPUT_DIR/${URL_SLUG}-run${i}.report.json').categories.performance.score * 100")
        SCORES+=($SCORE)
    done

    TOTAL=0
    for score in "${SCORES[@]}"; do
        TOTAL=$(echo "$TOTAL + $score" | bc)
    done
    AVG=$(echo "scale=1; $TOTAL / $RUNS" | bc)

    echo "  $url: $AVG" >> "$OUTPUT_DIR/batch-summary.txt"
done

echo "" >> "$OUTPUT_DIR/batch-summary.txt"
echo "Individual run data available in: $OUTPUT_DIR/" >> "$OUTPUT_DIR/batch-summary.txt"

cat "$OUTPUT_DIR/batch-summary.txt"

echo ""
echo "${GREEN}✅ Batch testing complete${NC}"
echo "📁 Results: $OUTPUT_DIR/"
