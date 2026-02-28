# Email Audit Log - Phases 1-3 Testing Guide

**Status:** ✅ Backend Deployed to Staging | 🧪 Ready for Testing
**Date:** February 28, 2026
**Backend Phases:** 1-3 Complete (Phase 4 Pending)
**Frontend:** Updated to consume new data format

---

## What Changed (Backend Phases 1-3)

### ✅ Implemented

1. **17 Email Types** (previously 9)
   - Positions 1-9: Existing scheduled emails
   - **Positions 10-17: NEW event-based emails**
     - Position 10: `on_approval` - Application Approved
     - Position 11: `on_rejection` - Application Rejected
     - Position 12: `on_waitlist` - Moved to Waitlist
     - Position 13: `on_payment_received` - Payment Confirmed
     - Position 14: `on_category_change` - Category Changed
     - Position 15: `on_event_update` - Event Details Changed
     - Position 16: `on_event_cancel` - Event Canceled
     - Position 17: `on_application_submit` - New Submission Notification

2. **Registration Data in Email Deliveries** ✅ FIXES "Unknown" ISSUE
   - `recipient_name` - Vendor contact name
   - `vendor_category` - Vendor category (Food & Beverage, etc.)

3. **API Endpoints Ready**
   - ✅ `GET /events/:slug/scheduled_emails` - Returns all 17 emails
   - ✅ `GET /events/:slug/scheduled_emails/:id/email_deliveries` - **Includes registration data**
   - ✅ `GET /events/:slug/invitations` - Includes `meta.delivery_stats`

### ⏳ Pending (Phase 4)

- ❌ **Issue #4: Delivery count discrepancy** - Still exists
  - `scheduled_email.delivery_counts` may be stale
  - `email_deliveries.status` is accurate (source of truth)
- ❌ `recalculate_delivery_counts!` method
- ❌ SendGrid webhook handler updates
- ❌ Bulk deliveries endpoint (performance optimization)

---

## Frontend Changes Made

### Updated Files

**1. `src/types/email.ts`**
```typescript
export interface EmailDelivery {
  // ... existing fields ...

  // ✅ NEW: Phase 1-3 backend now includes these
  recipient_name?: string | null;
  vendor_category?: string | null;
}
```

**2. `src/components/producer/Email/EmailAuditLogOverlay.tsx`**
```typescript
// BEFORE (lines 116, 121):
recipient_name: null, // TODO: Fetch from registration
category: 'Unknown', // TODO: Fetch from registration.vendor_category

// AFTER:
recipient_name: delivery.recipient_name || null, // ✅ Now uses backend data
category: delivery.vendor_category || 'Unknown', // ✅ Now uses backend data
```

---

## Testing Checklist

### Pre-Testing Setup

- [ ] Confirm staging backend deployed with Phases 1-3
- [ ] Frontend updated with latest code (includes EmailDelivery type changes)
- [ ] Browser console open (DevTools → Console tab)
- [ ] Network tab open (to inspect API responses)

---

### Test 1: Verify 17 Email Types Show in Mail Tab

**Goal:** Confirm events have all 17 scheduled emails

**Steps:**
1. Navigate to Command Center → Mail tab for any event
2. Count the number of email rows (should be 17 + virtual invitation email = 18 total)
3. Verify new email types appear:
   - "Application Approved" (on_approval)
   - "Application Rejected" (on_rejection)
   - "Moved to Waitlist" (on_waitlist)
   - "Payment Confirmed" (on_payment_received)
   - "Category Changed" (on_category_change)
   - "Event Details Changed" (on_event_update)
   - "Event Canceled" (on_event_cancel)
   - "New Submission Notification" (on_application_submit)

**Expected Result:**
- ✅ 18 total rows (17 scheduled + 1 virtual invitation)
- ✅ New email types visible with proper names

**If Fails:**
- Check event was migrated (may only have 9 emails)
- Check backend logs for migration status
- Try different event

---

### Test 2: Trigger Event-Based Email & Verify Delivery

**Goal:** Confirm new email types send and create EmailDelivery records

**Steps:**
1. Find an event with pending applications
2. Open Mail tab in one browser tab
3. Open Applicants tab in another tab
4. In Applicants tab, approve an application:
   - Click applicant → Approve button
5. Check browser console logs for:
   - `✓ Approval email sent via unified system`
6. Refresh Mail tab
7. Check "Application Approved" email row:
   - Recipient count increased by 1
   - Status shows "sent"

**Expected Result:**
- ✅ Email sent immediately on approval
- ✅ Console shows "✓ sent via unified system"
- ✅ Recipient count increases
- ✅ Status = "sent"

**Repeat for other triggers:**
- Reject application → "Application Rejected" email
- Move to waitlist → "Moved to Waitlist" email
- Mark payment received → "Payment Confirmed" email

---

### Test 3: Verify Recipient Names Show in Audit Log ⭐ KEY TEST

**Goal:** Confirm "Unknown" recipient names are fixed

**Steps:**
1. Navigate to Mail tab
2. Click "View Audit Log" button (top right)
3. Audit log opens full-screen
4. Look at "Recipient" column (2nd column)
5. Verify vendor names appear (e.g., "John Doe", "Jane Smith")
6. Check multiple entries

**Expected Result:**
- ✅ Recipient names display correctly (NOT "Unknown")
- ✅ Real names from vendor contacts

**If Shows "Unknown":**
- Check browser console for errors
- Check Network tab → filter by "email_deliveries"
- Inspect API response → should include `recipient_name` field
- Verify backend deployed correctly

---

### Test 4: Verify Vendor Categories Show in Audit Log ⭐ KEY TEST

**Goal:** Confirm "Unknown" categories are fixed

**Steps:**
1. In Email Audit Log, look at "Category" column (6th column)
2. Verify vendor categories appear as badges:
   - "Food & Beverage"
   - "Arts & Crafts"
   - "Music & Entertainment"
   - etc.
3. Check multiple entries

**Expected Result:**
- ✅ Category badges show actual vendor categories (NOT "Unknown")
- ✅ Categories match vendor contact data

**If Shows "Unknown":**
- Check Network tab → `email_deliveries` response
- Verify `vendor_category` field present
- Check registration has vendor_category set

---

### Test 5: Filter by Email Name (Deep Link Test)

**Goal:** Verify deep linking from Mail tab works

**Steps:**
1. Close audit log (back to Mail tab)
2. Find email with sent status and recipients > 0
3. Click the recipient count number (e.g., "24")
4. Audit log should open **pre-filtered** to that email
5. Verify only that email's deliveries show
6. Check filter dropdown shows email name selected

**Expected Result:**
- ✅ Audit log opens with email name filter applied
- ✅ Only deliveries for that email show
- ✅ Filter dropdown reflects selection

---

### Test 6: Filter by Undelivered Status (Deep Link Test)

**Goal:** Verify deep linking from undelivered count works

**Steps:**
1. Close audit log (back to Mail tab)
2. Find email with undelivered_count > 0 (red number)
3. Click the undelivered count number (e.g., "5")
4. Audit log should open **pre-filtered** to:
   - Email name = that email
   - Status = "undelivered" (bounced + dropped)
5. Verify only bounced/dropped deliveries show

**Expected Result:**
- ✅ Audit log opens with email + status filters applied
- ✅ Only shows bounced and dropped deliveries
- ✅ All other statuses hidden

---

### Test 7: Virtual Invitation Email Data

**Goal:** Verify invitation email shows correct delivery stats

**Steps:**
1. Mail tab → Find "Event Announcement (Invitation)" row
2. Check recipient count matches sent invitations
3. Check undelivered count (if any bounced invitations)
4. Click recipient count
5. Audit log opens showing invitation deliveries
6. Verify:
   - Recipient names show
   - Vendor categories show
   - Delivery statuses accurate

**Expected Result:**
- ✅ Invitation stats match actual invitations sent
- ✅ Audit log shows invitation deliveries with full data
- ✅ Categories from vendor contacts

---

### Test 8: Search Functionality

**Goal:** Test global search works with new data

**Steps:**
1. Open audit log (View Audit Log button)
2. In search box (top), type a vendor name (e.g., "John")
3. Results should filter to show only matching recipients
4. Clear search, type an email address
5. Results should filter to that recipient

**Expected Result:**
- ✅ Search finds recipients by name
- ✅ Search finds recipients by email
- ✅ Results update in real-time

---

### Test 9: Sorting by Columns

**Goal:** Verify sorting works with new data

**Steps:**
1. In audit log, click "Recipient" column header
2. Table should sort alphabetically by recipient name
3. Click again → reverse sort
4. Try sorting by "Category" column
5. Categories should sort alphabetically

**Expected Result:**
- ✅ Recipient column sorts by name (not email)
- ✅ Category column sorts alphabetically
- ✅ Sort indicator shows direction (↑/↓)

---

### Test 10: Data Consistency Check ⚠️ KNOWN ISSUE

**Goal:** Verify Issue #4 still exists (expected to fail)

**Steps:**
1. Mail tab → Find sent email with deliveries
2. Note the delivered_count, undelivered_count from Mail tab
3. Click recipient count → Open audit log
4. Manually count delivered vs bounced/dropped in audit log
5. Compare counts

**Expected Result:**
- ⚠️ **COUNTS MAY NOT MATCH** (Known Issue #4)
- Mail Tab: Uses `scheduled_email.delivery_counts` (may be stale)
- Audit Log: Uses `email_deliveries.status` (accurate, source of truth)

**Document any discrepancies:**
- Email ID:
- Mail Tab counts:
- Audit Log counts:
- Difference:

**Note:** This is **expected to fail** until Phase 4 implements `recalculate_delivery_counts!`

---

### Test 11: Performance Check (Auto-Refresh)

**Goal:** Monitor performance during auto-refresh

**Steps:**
1. Mail tab → Enable auto-refresh toggle (if not already on)
2. Open browser DevTools → Network tab
3. Wait 30 seconds for auto-refresh
4. Check Network tab for API calls made:
   - Should see `/scheduled_emails` request
   - May see multiple `/email_deliveries` requests (N+1 queries)
5. Note response times

**Expected Result:**
- ⚠️ **May be slow** (N+1 query issue, Phase 4 will optimize)
- Auto-refresh works but not optimized yet
- No errors in console

**Document Performance:**
- Total API calls on refresh:
- Slowest endpoint:
- Time to refresh:

---

### Test 12: Fallback Behavior (Legacy Events)

**Goal:** Test events with only 9 emails use fallback

**Steps:**
1. Find old event (created before migration)
2. Mail tab → Should have 9 emails (not 17)
3. Trigger an approval on this event
4. Check backend logs for:
   - `⚠️ No unified email template found, using fallback`
5. Email should still send
6. Check audit log shows the delivery

**Expected Result:**
- ✅ Old events still work with fallback templates
- ✅ Deliveries create EmailDelivery records
- ✅ Audit log shows deliveries
- ⚠️ Log warning about fallback (expected)

---

## Console Logging to Watch For

### Good Signs ✅

```
📧 [Audit Log] Fetching scheduled emails for event: summer-market-2025
✅ [Audit Log] Fetched 17 scheduled emails
📨 [Audit Log] Fetched 10 sent invitations
📬 [Audit Log] Fetched 24 deliveries for email: Application Approved
✅ [Audit Log] Built 245 audit entries
```

### Expected Warnings ⚠️

```
⚠️ No unified email template found, using fallback
  (For legacy events - expected behavior)
```

### Bad Signs ❌

```
❌ [Audit Log] Failed to fetch deliveries for email 123: 404 Not Found
❌ TypeError: Cannot read property 'recipient_name' of undefined
❌ Network error: 500 Internal Server Error
```

---

## Network Tab Inspection

### Email Deliveries Response Format

**URL:** `GET /api/v1/presents/events/:slug/scheduled_emails/:id/email_deliveries`

**Expected Response:**
```json
[
  {
    "id": 123,
    "scheduled_email_id": 10,
    "registration_id": 456,
    "recipient_email": "vendor@example.com",
    "status": "delivered",
    "sent_at": "2026-02-27T10:00:00Z",
    "delivered_at": "2026-02-27T10:05:00Z",
    "bounce_reason": null,
    "drop_reason": null,

    // ✅ NEW FIELDS (Phase 1-3):
    "recipient_name": "John Doe",
    "vendor_category": "Food & Beverage"
  }
]
```

**Verify:**
- [ ] `recipient_name` field present
- [ ] `vendor_category` field present
- [ ] Values are NOT null (for valid registrations)

### Invitations Response Format

**URL:** `GET /api/v1/presents/events/:slug/invitations`

**Expected Response:**
```json
{
  "invitations": [...],
  "meta": {
    "total_count": 50,
    "sent_count": 45,

    // ✅ NEW FIELD (Phase 1-3):
    "delivery_stats": {
      "total_sent": 45,
      "delivered": 40,
      "bounced": 3,
      "dropped": 2,
      "unsubscribed": 0,
      "pending": 0,
      "undelivered": 5
    }
  }
}
```

**Verify:**
- [ ] `meta.delivery_stats` field present
- [ ] Stats match individual invitation statuses

---

## Reporting Issues

### Issue Template

When reporting bugs, include:

```markdown
**Issue:** [Brief description]

**Environment:**
- Frontend: [branch/commit]
- Backend: Phases 1-3 staging deployment
- Browser: [Chrome/Firefox/Safari version]
- Event ID: [event slug]

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**


**Actual Result:**


**Console Logs:**
```
[paste relevant console logs]
```

**Network Response:** (if API issue)
```json
[paste API response from Network tab]
```

**Screenshots:**
[attach if helpful]
```

### Where to Report

- Slack: `#voxxy-frontend-dev` or `#voxxy-backend-dev`
- GitHub Issues: (if available)
- Direct message: Backend team lead

---

## Success Criteria

### Must Pass (Blocking Issues)

- [ ] ✅ Recipient names show in audit log (NOT "Unknown")
- [ ] ✅ Vendor categories show in audit log (NOT "Unknown")
- [ ] ✅ 17 email types visible in Mail tab (for migrated events)
- [ ] ✅ Event-based emails send immediately on trigger
- [ ] ✅ Audit log filters work (email name, status, category, search)
- [ ] ✅ Deep links work (recipient count, undelivered count)
- [ ] ✅ No JavaScript errors in console
- [ ] ✅ No 500 errors in Network tab

### Known Issues (Not Blocking)

- [ ] ⚠️ Delivery count discrepancy (Issue #4) - **Expected until Phase 4**
- [ ] ⚠️ Auto-refresh slow (N+1 queries) - **Will optimize in Phase 4**
- [ ] ⚠️ Legacy events use fallback - **Expected behavior**

---

## Phase 4 Preview

**What's Coming:**
1. `recalculate_delivery_counts!` method → Fixes Issue #4
2. SendGrid webhook handler updates → Keeps counts in sync
3. Bulk deliveries endpoint → Improves auto-refresh performance
4. Database indexes → Further performance improvements

**When to Test Phase 4:**
- After backend deploys Phase 4 to staging
- New testing guide will be provided
- Focus will shift to data consistency validation

---

## Next Steps After Testing

1. **Document all findings** using issue template above
2. **Share test results** in Slack channels
3. **Prioritize blockers** for immediate fix
4. **Plan Phase 4 testing** once Phases 1-3 validated
5. **Consider production deployment** if no blockers found

---

**Testing Lead:** [Your name]
**Date Started:** February 28, 2026
**Status:** 🧪 In Progress

---

## Quick Reference

**Key Files Modified:**
- `src/types/email.ts` - Added `recipient_name`, `vendor_category` to EmailDelivery
- `src/components/producer/Email/EmailAuditLogOverlay.tsx` - Uses new fields

**Key Backend Endpoints:**
- `GET /events/:slug/scheduled_emails` - Returns 17 emails
- `GET /events/:slug/scheduled_emails/:id/email_deliveries` - Includes registration data ✅
- `GET /events/:slug/invitations` - Includes delivery_stats ✅

**Known Good:**
- ✅ Registration data in deliveries
- ✅ 17 email types support
- ✅ Event-based emails via unified system

**Known Issues:**
- ⚠️ Issue #4 (delivery count discrepancy) - Phase 4
- ⚠️ N+1 queries on auto-refresh - Phase 4
- ⚠️ Legacy events use fallback - Expected

---

Happy Testing! 🧪
