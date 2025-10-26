# Manual Test Cases - Performance Optimization

**Project**: Voxxy Presents
**Version**: Post-Performance Optimization
**Last Updated**: October 26, 2025

---

## Test Environment Setup

### Prerequisites
- [ ] Chrome browser installed (latest version)
- [ ] Firefox browser installed (latest version)
- [ ] Safari browser available (for macOS/iOS testing)
- [ ] Mobile device available (iOS or Android)
- [ ] Chrome DevTools Performance profiler enabled
- [ ] Network throttling available (Fast 3G simulation)
- [ ] Test user account credentials ready
- [ ] Test organization slug known (e.g., `thrive-collective`)

### Test Data
- **Test Organization**: `thrive-collective`
- **Test User Email**: ________________
- **Test User Password**: ________________
- **Production URL**: `https://voxxy-presents.web.app`

---

## Test Case 1: Login Flow Performance

**Objective**: Verify login completes in < 1 second with visible loading UI

**Priority**: HIGH

**Steps**:
1. Clear browser cache and cookies
2. Navigate to `https://voxxy-presents.web.app/login/club-owner`
3. Open Chrome DevTools → Performance tab
4. Click "Record" in Performance tab
5. Enter valid credentials
6. Click "Sign In" button
7. **Start timer** when button is clicked
8. Observe loading UI appears
9. **Stop timer** when dashboard content is visible
10. Stop Performance recording

**Expected Results**:
- [ ] Loading screen/spinner appears immediately after clicking Sign In (< 100ms)
- [ ] Loading UI shows progress or animation (not frozen screen)
- [ ] Dashboard content appears within 1 second
- [ ] No console errors
- [ ] User is redirected to correct role-based dashboard
- [ ] Performance recording shows < 1s from click to dashboard render

**Actual Results**:
- Loading UI appeared: Yes / No
- Time to dashboard: _______ ms
- Console errors: ________________
- Status: ✅ PASS / ❌ FAIL

**Notes**: ________________

---

## Test Case 2: Public Organization Page - Cold Cache

**Objective**: Verify public page loads in < 1.5s on first visit

**Priority**: HIGH

**Steps**:
1. Clear browser cache (Ctrl+Shift+Delete → Clear all data)
2. Open Chrome DevTools → Network tab
3. Enable "Disable cache"
4. Set throttling to "Fast 3G"
5. Navigate to `https://voxxy-presents.web.app/thrive-collective`
6. **Start timer** when Enter is pressed
7. **Stop timer** when page is fully interactive (can click buttons)
8. Check Network waterfall for sequential requests

**Expected Results**:
- [ ] Page content visible within 1.5 seconds
- [ ] Organization name and logo appear first
- [ ] Events section shows skeleton loader initially (if not loaded yet)
- [ ] Events load lazily or in parallel (no waterfall blocking)
- [ ] No console errors
- [ ] Total page load time < 1.5s

**Actual Results**:
- Time to interactive: _______ ms
- Skeleton loaders visible: Yes / No
- Waterfall pattern: Sequential / Parallel
- Console errors: ________________
- Status: ✅ PASS / ❌ FAIL

**Notes**: ________________

---

## Test Case 3: Public Organization Page - Warm Cache

**Objective**: Verify cached page loads in < 500ms

**Priority**: MEDIUM

**Steps**:
1. Complete Test Case 2 first (to populate cache)
2. Keep DevTools → Network tab open
3. Disable "Disable cache" option
4. Refresh page (F5)
5. **Start timer** on refresh
6. **Stop timer** when page is interactive
7. Check Network tab for 304 responses or cache hits

**Expected Results**:
- [ ] Page loads from cache (< 500ms)
- [ ] Network tab shows "(from disk cache)" or "304 Not Modified"
- [ ] Organization data loads instantly
- [ ] Events may refresh in background but don't block UI
- [ ] No flash of unstyled content

**Actual Results**:
- Time to interactive: _______ ms
- Cache hits visible: Yes / No
- Background refresh: Yes / No
- Status: ✅ PASS / ❌ FAIL

**Notes**: ________________

---

## Test Case 4: Subscribe Page via QR Code (Mobile)

**Objective**: Verify subscribe page loads quickly on mobile device

**Priority**: HIGH

**Steps**:
1. Use mobile device (real device, not emulator)
2. Clear browser cache
3. Navigate to `https://voxxy-presents.web.app/subscribe/thrive-collective`
4. **Start timer** when URL loads
5. **Stop timer** when modal auto-opens
6. Interact with modal (select email/phone, type name)
7. Submit subscription

**Expected Results**:
- [ ] Page loads within 1.5 seconds on mobile
- [ ] Modal auto-opens smoothly (within 100ms of page load)
- [ ] All form fields are interactive
- [ ] No layout shift when modal opens
- [ ] Submission succeeds without errors
- [ ] Success animation plays

**Actual Results**:
- Time to modal open: _______ ms
- Layout shifts: Yes / No
- Form submission: Success / Fail
- Status: ✅ PASS / ❌ FAIL

**Notes**: ________________

---

## Test Case 5: Dashboard - Clubs Loading

**Objective**: Verify clubs load in < 800ms with skeleton UI

**Priority**: MEDIUM

**Steps**:
1. Login to account with 5+ clubs
2. Dashboard should load to Overview tab by default
3. Open Performance monitor (DevTools → More tools → Performance monitor)
4. Click on "Clubs" tab
5. **Start timer** when clicking tab
6. Observe skeleton loaders appear
7. **Stop timer** when all club cards are visible
8. Check for layout shifts

**Expected Results**:
- [ ] Skeleton loaders appear immediately (< 50ms)
- [ ] All clubs load within 800ms
- [ ] No "flash" of empty content
- [ ] Clubs load in parallel (check Network tab)
- [ ] No layout shift when real data replaces skeleton
- [ ] Images lazy load as user scrolls

**Actual Results**:
- Time to skeleton: _______ ms
- Time to full load: _______ ms
- Layout shift (CLS): _______ (< 0.1 is good)
- Status: ✅ PASS / ❌ FAIL

**Notes**: ________________

---

## Test Case 6: Event Creation Performance

**Objective**: Verify event creation doesn't regress with optimizations

**Priority**: MEDIUM

**Steps**:
1. Login to club owner account
2. Navigate to organization admin page
3. Click "Create Event" button
4. Fill out all required fields
5. Upload an image
6. Click "Create Event"
7. **Start timer** when clicking Create
8. **Stop timer** when redirected back to events list
9. Verify new event appears in list

**Expected Results**:
- [ ] Event creation completes within 3 seconds
- [ ] Loading indicator visible during creation
- [ ] New event appears in list immediately after creation
- [ ] No duplicate API calls (check Network tab)
- [ ] Image upload doesn't block form submission
- [ ] Success message displays

**Actual Results**:
- Time to completion: _______ ms
- Event visible in list: Yes / No
- Errors: ________________
- Status: ✅ PASS / ❌ FAIL

**Notes**: ________________

---

## Test Case 7: Multiple Tabs Open (Cache Sharing)

**Objective**: Verify cache is shared across browser tabs

**Priority**: LOW

**Steps**:
1. Open Tab 1: Navigate to `https://voxxy-presents.web.app/thrive-collective`
2. Wait for page to fully load
3. Open Tab 2: Navigate to same URL
4. Open DevTools in Tab 2 → Network tab
5. Check for cache hits
6. Open Tab 3: Navigate to dashboard (after login)
7. Check if user profile loads from cache

**Expected Results**:
- [ ] Tab 2 loads organization data from cache (instant)
- [ ] Tab 3 uses cached user profile
- [ ] No redundant Firebase/API calls
- [ ] All tabs remain in sync if data changes

**Actual Results**:
- Cache sharing working: Yes / No
- Redundant calls: Yes / No
- Status: ✅ PASS / ❌ FAIL

**Notes**: ________________

---

## Test Case 8: Network Error Handling

**Objective**: Verify graceful degradation when network is slow/offline

**Priority**: MEDIUM

**Steps**:
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Navigate to public page
4. Observe error handling
5. Set throttling to "Slow 3G"
6. Refresh page
7. Verify loading states are visible during slow load

**Expected Results**:
- [ ] Offline: Error message displays (not blank screen)
- [ ] Offline: User can retry or go back
- [ ] Slow 3G: Loading skeleton visible throughout
- [ ] Slow 3G: Content loads progressively (not all at once)
- [ ] No frozen UI during slow loads

**Actual Results**:
- Offline handling: Good / Bad
- Slow load UX: Good / Bad
- Status: ✅ PASS / ❌ FAIL

**Notes**: ________________

---

## Test Case 9: Browser Back Button Performance

**Objective**: Verify back navigation uses cached data

**Priority**: LOW

**Steps**:
1. Navigate to home page
2. Navigate to public org page
3. Navigate to subscribe page
4. Click browser back button twice
5. Check Network tab for cache usage
6. Time how fast pages load on back navigation

**Expected Results**:
- [ ] Back navigation is instant (< 200ms per page)
- [ ] Pages load from cache (bfcache or disk cache)
- [ ] No flash of unstyled content
- [ ] Scroll position restored on back

**Actual Results**:
- Back nav speed: _______ ms
- Cache used: Yes / No
- Status: ✅ PASS / ❌ FAIL

**Notes**: ________________

---

## Test Case 10: Performance Monitoring Validation

**Objective**: Verify performance monitoring is capturing metrics

**Priority**: HIGH

**Steps**:
1. Navigate through key user journeys:
   - Login
   - View public page
   - Subscribe to org
   - Create event
2. Check monitoring dashboard (Sentry/LogRocket/Mixpanel)
3. Verify metrics are being captured:
   - Page load times
   - API response times
   - User interactions
   - Errors

**Expected Results**:
- [ ] All page loads tracked with timestamps
- [ ] API calls logged with duration
- [ ] User actions captured (login, subscribe, create)
- [ ] No PII (personally identifiable information) logged
- [ ] Metrics update in real-time (< 1 min delay)

**Actual Results**:
- Metrics captured: Yes / No
- Dashboard accessible: Yes / No
- Real-time updates: Yes / No
- Status: ✅ PASS / ❌ FAIL

**Notes**: ________________

---

## Cross-Browser Compatibility Tests

### Test on Chrome (Desktop)
- [ ] Test Case 1: Login flow
- [ ] Test Case 2: Public page cold cache
- [ ] Test Case 3: Public page warm cache
- [ ] Overall Chrome Status: ✅ / ❌

### Test on Firefox (Desktop)
- [ ] Test Case 1: Login flow
- [ ] Test Case 2: Public page cold cache
- [ ] Test Case 3: Public page warm cache
- [ ] Overall Firefox Status: ✅ / ❌

### Test on Safari (Desktop)
- [ ] Test Case 1: Login flow
- [ ] Test Case 2: Public page cold cache
- [ ] Test Case 3: Public page warm cache
- [ ] Overall Safari Status: ✅ / ❌

### Test on Chrome (Mobile Android)
- [ ] Test Case 4: Subscribe page mobile
- [ ] Test Case 2: Public page mobile
- [ ] Overall Android Status: ✅ / ❌

### Test on Safari (Mobile iOS)
- [ ] Test Case 4: Subscribe page mobile
- [ ] Test Case 2: Public page mobile
- [ ] Overall iOS Status: ✅ / ❌

---

## Test Execution Summary

**Test Date**: ________________
**Tester**: ________________
**Build Version**: ________________
**Environment**: Production

**Results**:
- Total Test Cases: 10
- Passed: _______ / 10
- Failed: _______ / 10
- Blocked: _______ / 10

**Critical Issues Found**: ________________

**Recommendation**:
- [ ] ✅ Approved for production
- [ ] ⚠️ Approved with minor issues
- [ ] ❌ Not approved - needs fixes

**Sign-off**: ________________
