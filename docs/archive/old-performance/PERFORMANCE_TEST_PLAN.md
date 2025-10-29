# Performance Optimization Test Plan

**Project**: Voxxy Presents - Long-Term Performance Fixes
**Date**: October 26, 2025
**Goal**: Eliminate 5-second loading delays, implement instant page loads, and create a production-ready performance monitoring system

---

## 📊 Success Criteria

### Performance Benchmarks (Before vs After)

| Metric | Current (Baseline) | Target (After Fix) | Test Method |
|--------|-------------------|-------------------|-------------|
| **Login to Dashboard** | ~5 seconds (no loading UI) | < 1 second with loading UI | Manual + Lighthouse |
| **Public Page Load (/:orgSlug)** | 2-4 seconds | < 500ms (cached), < 1.5s (first visit) | Lighthouse + Network tab |
| **Subscribe Page Load (/subscribe/:orgSlug)** | 2-4 seconds | < 500ms (cached), < 1.5s (first visit) | Lighthouse + Network tab |
| **Dashboard Clubs Load** | 3-5 seconds (5 clubs) | < 800ms | Manual timing |
| **Event List Load** | 2-3 seconds | < 500ms (lazy loaded) | Manual timing |
| **Lighthouse Performance Score** | Unknown | > 90 | Lighthouse CI |
| **First Contentful Paint (FCP)** | Unknown | < 1.2s | Lighthouse |
| **Largest Contentful Paint (LCP)** | Unknown | < 2.5s | Lighthouse |
| **Time to Interactive (TTI)** | Unknown | < 3.5s | Lighthouse |

---

## 🧪 Test Plan Overview

### Phase 1: Baseline Measurements (BEFORE optimization)
### Phase 2: Implementation Validation (DURING development)
### Phase 3: Final Validation (AFTER optimization)
### Phase 4: Production Smoke Tests (POST deployment)

---

## Phase 1: Baseline Measurements

### 1.1 Manual Performance Audit

**Test Script**: `tests/manual/baseline-performance.md`

**Steps**:
1. Clear browser cache and local storage
2. Open Chrome DevTools → Network tab
3. Enable "Disable cache" and throttle to "Fast 3G"
4. Record baseline timings for each user flow

**User Flows to Measure**:

#### Flow A: Login to Dashboard
- [ ] Start timer when clicking "Sign In"
- [ ] Record time until dashboard content is visible
- [ ] Note: Any loading UI shown? (Yes/No)
- [ ] **Baseline Time**: _______ seconds

#### Flow B: Public Page Load (Cold Cache)
- [ ] Navigate to `https://voxxy-presents.web.app/thrive-collective`
- [ ] Start timer on navigation
- [ ] Record time until page is interactive (can click buttons)
- [ ] **Baseline Time**: _______ seconds

#### Flow C: Subscribe Page Load (Cold Cache)
- [ ] Navigate to `https://voxxy-presents.web.app/subscribe/thrive-collective`
- [ ] Start timer on navigation
- [ ] Record time until modal auto-opens
- [ ] **Baseline Time**: _______ seconds

#### Flow D: Dashboard Clubs Load
- [ ] Login to account with 5+ clubs
- [ ] Navigate to "Clubs" tab
- [ ] Start timer when clicking tab
- [ ] Record time until all clubs are visible
- [ ] **Baseline Time**: _______ seconds

### 1.2 Automated Lighthouse Audit

**Test Script**: `npm run test:lighthouse:baseline`

```bash
# Run Lighthouse on key pages
npx lighthouse https://voxxy-presents.web.app/ --output html --output-path ./test-results/lighthouse-baseline-home.html
npx lighthouse https://voxxy-presents.web.app/thrive-collective --output html --output-path ./test-results/lighthouse-baseline-public.html
npx lighthouse https://voxxy-presents.web.app/subscribe/thrive-collective --output html --output-path ./test-results/lighthouse-baseline-subscribe.html
```

**Save Results**:
- [ ] Home page score: _______
- [ ] Public org page score: _______
- [ ] Subscribe page score: _______

### 1.3 Network Waterfall Analysis

**Tools**: Chrome DevTools → Network tab

**Steps**:
1. Clear cache
2. Load public page (`/:orgSlug`)
3. Take screenshot of network waterfall
4. Identify sequential requests (waterfall pattern)
5. Document API call order and timing

**Expected Issues to Document**:
- [ ] Organization fetch → Events fetch (sequential)
- [ ] Firebase auth → User profile fetch (sequential)
- [ ] Multiple Firebase reads for clubs (sequential or parallel?)

---

## Phase 2: Implementation Validation

### 2.1 Unit Tests for New Features

**Test Script**: `npm run test` (if using Vitest/Jest)

#### Test: Request Deduplication
```typescript
// tests/hooks/useOrganization.test.ts
describe('useOrganization with deduplication', () => {
  it('should not make duplicate API calls for same org', async () => {
    // Mock API
    const apiSpy = jest.spyOn(organizationsApi, 'getBySlug')

    // Mount two components using same org
    const { result: result1 } = renderHook(() => useOrganization('thrive-collective'))
    const { result: result2 } = renderHook(() => useOrganization('thrive-collective'))

    await waitFor(() => {
      expect(result1.current.organization).toBeTruthy()
      expect(result2.current.organization).toBeTruthy()
    })

    // Should only call API once due to deduplication
    expect(apiSpy).toHaveBeenCalledTimes(1)
  })
})
```

#### Test: Lazy Event Loading
```typescript
describe('useOrganization lazy loading', () => {
  it('should load organization without events when loadEvents=false', async () => {
    const eventsSpy = jest.spyOn(eventsApi, 'getByOrganization')

    const { result } = renderHook(() =>
      useOrganization('thrive-collective', { loadEvents: false })
    )

    await waitFor(() => {
      expect(result.current.organization).toBeTruthy()
    })

    // Should NOT have called events API
    expect(eventsSpy).not.toHaveBeenCalled()
  })
})
```

#### Test: CDN Cache Headers
```typescript
describe('API responses', () => {
  it('should include cache headers for public org data', async () => {
    const response = await fetch('/api/organizations/thrive-collective')

    expect(response.headers.get('Cache-Control')).toContain('public')
    expect(response.headers.get('Cache-Control')).toContain('max-age=')
  })
})
```

### 2.2 Integration Tests

**Test Script**: `npm run test:integration`

#### Test: Auth Flow with Loading States
- [ ] Login redirects to loading screen
- [ ] Loading screen shows for at least 200ms
- [ ] Dashboard loads with skeleton UI
- [ ] Skeleton UI replaced with real data
- [ ] No "frozen" screen during any step

#### Test: Public Page Performance
- [ ] First visit loads organization data
- [ ] Second visit (within 5 min) uses cached data
- [ ] Events load lazily on scroll or tab click
- [ ] No waterfall requests (org + events load in parallel if needed)

---

## Phase 3: Final Validation

### 3.1 Manual Performance Re-Test

**Test Script**: `tests/manual/final-performance.md`

**Repeat all Phase 1 tests and compare**:

#### Flow A: Login to Dashboard
- [ ] **After Time**: _______ seconds
- [ ] **Improvement**: _______ seconds faster
- [ ] Loading UI visible? (Yes/No)
- [ ] **Pass Criteria**: < 1 second with smooth loading UI ✅/❌

#### Flow B: Public Page Load (Cold Cache)
- [ ] **After Time (First Visit)**: _______ seconds
- [ ] **After Time (Cached Visit)**: _______ seconds
- [ ] **Improvement**: _______ seconds faster
- [ ] **Pass Criteria**: < 1.5s first visit, < 500ms cached ✅/❌

#### Flow C: Subscribe Page Load (Cold Cache)
- [ ] **After Time (First Visit)**: _______ seconds
- [ ] **After Time (Cached Visit)**: _______ seconds
- [ ] **Improvement**: _______ seconds faster
- [ ] **Pass Criteria**: < 1.5s first visit, < 500ms cached ✅/❌

#### Flow D: Dashboard Clubs Load
- [ ] **After Time**: _______ seconds
- [ ] **Improvement**: _______ seconds faster
- [ ] **Pass Criteria**: < 800ms ✅/❌

### 3.2 Automated Lighthouse Re-Test

**Test Script**: `npm run test:lighthouse:final`

```bash
# Run Lighthouse again on same pages
npx lighthouse https://voxxy-presents.web.app/ --output html --output-path ./test-results/lighthouse-final-home.html
npx lighthouse https://voxxy-presents.web.app/thrive-collective --output html --output-path ./test-results/lighthouse-final-public.html
npx lighthouse https://voxxy-presents.web.app/subscribe/thrive-collective --output html --output-path ./test-results/lighthouse-final-subscribe.html
```

**Compare Results**:
- [ ] Home page: Baseline _______ → Final _______ (Δ _______)
- [ ] Public org page: Baseline _______ → Final _______ (Δ _______)
- [ ] Subscribe page: Baseline _______ → Final _______ (Δ _______)
- [ ] **Pass Criteria**: All pages > 90 score ✅/❌

### 3.3 Network Waterfall Re-Analysis

**Steps**:
1. Clear cache
2. Load public page
3. Compare waterfall to baseline
4. Verify parallel loading patterns

**Expected Improvements**:
- [ ] Organization + Events load in parallel (or events lazy loaded)
- [ ] Cached responses served instantly on repeat visits
- [ ] No duplicate API calls for same resource
- [ ] Firebase auth uses cached profile

---

## Phase 4: Production Smoke Tests

### 4.1 Critical User Journeys

**Environment**: Production (voxxy-presents.web.app)

#### Journey 1: New Visitor Subscribes via QR Code
1. [ ] Open `https://voxxy-presents.web.app/subscribe/thrive-collective` on mobile
2. [ ] Page loads in < 1.5 seconds
3. [ ] Modal auto-opens
4. [ ] Fill out email and submit
5. [ ] Success message appears
6. [ ] No errors in console
7. [ ] **Pass/Fail**: ✅/❌

#### Journey 2: Club Owner Logs In and Views Dashboard
1. [ ] Navigate to login page
2. [ ] Enter credentials and click "Sign In"
3. [ ] Loading screen appears immediately
4. [ ] Dashboard loads in < 1 second
5. [ ] Clubs load with skeleton UI
6. [ ] Real club data appears in < 800ms
7. [ ] No errors in console
8. [ ] **Pass/Fail**: ✅/❌

#### Journey 3: Guest Views Public Organization Page
1. [ ] Navigate to `https://voxxy-presents.web.app/thrive-collective`
2. [ ] Page loads in < 1.5 seconds (first visit)
3. [ ] Organization info visible immediately
4. [ ] Events load lazily (or quickly if needed)
5. [ ] Refresh page → loads in < 500ms (cached)
6. [ ] No errors in console
7. [ ] **Pass/Fail**: ✅/❌

#### Journey 4: Club Owner Creates New Event
1. [ ] Login and navigate to club admin
2. [ ] Click "Create Event"
3. [ ] Fill out form and submit
4. [ ] Event appears in list immediately
5. [ ] Refresh page → new event still there
6. [ ] No errors in console
7. [ ] **Pass/Fail**: ✅/❌

### 4.2 Cross-Browser Testing

**Browsers to Test**:
- [ ] Chrome (Desktop)
- [ ] Safari (Desktop)
- [ ] Firefox (Desktop)
- [ ] Chrome (Mobile - Android)
- [ ] Safari (Mobile - iOS)

**For Each Browser**:
- [ ] Login flow works
- [ ] Public page loads quickly
- [ ] Subscribe page loads quickly
- [ ] No console errors

### 4.3 Performance Monitoring Validation

**Tool**: Sentry / LogRocket / Mixpanel (whichever we implement)

**Verify**:
- [ ] Performance metrics are being captured
- [ ] Page load times are tracked
- [ ] API call durations are logged
- [ ] Errors are reported with context
- [ ] Can view real user load times in dashboard

---

## 🚀 Test Execution Checklist

### Pre-Implementation
- [ ] Run Phase 1 baseline tests
- [ ] Document all baseline metrics in spreadsheet
- [ ] Take screenshots of slow loading states
- [ ] Save network waterfall screenshots

### During Implementation
- [ ] Run unit tests after each feature
- [ ] Test locally before pushing to staging
- [ ] Verify loading states are visible
- [ ] Check Chrome DevTools for console errors

### Pre-Deployment
- [ ] Run Phase 3 final validation tests
- [ ] Compare before/after metrics
- [ ] Verify all success criteria met
- [ ] Run Lighthouse on staging
- [ ] Get approval from product owner

### Post-Deployment
- [ ] Run Phase 4 smoke tests on production
- [ ] Monitor error rates for 24 hours
- [ ] Check performance monitoring dashboard
- [ ] Validate with real users (ask for feedback)

---

## 📝 Test Results Template

### Test Execution Log

**Date**: _________________
**Tester**: _________________
**Environment**: Production / Staging / Local
**Git Commit**: _________________

| Test ID | Test Name | Expected Result | Actual Result | Pass/Fail | Notes |
|---------|-----------|----------------|---------------|-----------|-------|
| 1.1.A | Login to Dashboard | < 1s with loading UI | ___ seconds | ✅/❌ | |
| 1.1.B | Public Page (Cold) | < 1.5s | ___ seconds | ✅/❌ | |
| 1.1.C | Subscribe Page (Cold) | < 1.5s | ___ seconds | ✅/❌ | |
| 1.1.D | Dashboard Clubs | < 800ms | ___ ms | ✅/❌ | |
| 3.2.1 | Lighthouse Home | > 90 | ___ score | ✅/❌ | |
| 3.2.2 | Lighthouse Public | > 90 | ___ score | ✅/❌ | |
| 3.2.3 | Lighthouse Subscribe | > 90 | ___ score | ✅/❌ | |
| 4.1.1 | QR Code Journey | All steps pass | ___ | ✅/❌ | |
| 4.1.2 | Dashboard Journey | All steps pass | ___ | ✅/❌ | |
| 4.1.3 | Public Page Journey | All steps pass | ___ | ✅/❌ | |
| 4.1.4 | Create Event Journey | All steps pass | ___ | ✅/❌ | |

### Issues Found

| Issue # | Severity | Description | Steps to Reproduce | Status |
|---------|----------|-------------|-------------------|--------|
| 1 | High/Med/Low | | | Open/Fixed |

### Final Recommendation

- [ ] **APPROVED FOR DEPLOYMENT** - All tests pass
- [ ] **APPROVED WITH NOTES** - Minor issues, can deploy
- [ ] **NOT APPROVED** - Critical issues, needs fixes

**Deployment Decision**: ________________
**Signed Off By**: ________________
**Date**: ________________

---

## 🛠️ Automated Test Scripts

See accompanying files:
- `tests/scripts/run-baseline-tests.sh` - Run all baseline tests
- `tests/scripts/run-final-tests.sh` - Run all final validation tests
- `tests/scripts/lighthouse-batch.sh` - Run Lighthouse on all pages
- `tests/scripts/compare-results.js` - Generate before/after comparison report

