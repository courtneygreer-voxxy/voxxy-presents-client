# Frontend Update - February 27, 2025

**Branch:** `main` (deployed to production)
**PR:** #44 - UI: Improve email audit log with SaaS-style layout (v2)
**Type:** UI/UX Improvements + Minor Feature Updates

---

## 📋 SUMMARY

This update primarily focuses on **UI improvements** to the email audit log and applicants tab. The changes enhance data visibility, improve user experience, and prepare the system for upcoming feature consolidation (merging Invites and Applicants tabs).

---

## ✅ CHANGES IMPLEMENTED

### 1. **Email Audit Log UI Improvements**

#### Table Layout Enhancements
- **Increased column widths** for better data visibility:
  - Date Sent: `180px` (was 160px)
  - Recipient: `200px` (was 180px)
  - Email Address: `280px` (was 220px)
  - Email Name: `280px` (was 200px)
  - Trigger: `140px` (was 120px)
  - **Category: `200px`** (was 140px - **doubled**)
  - Status: `160px` (was 140px)
  - **Details: `160px`** (was 100px - **60% increase**)
  - Actions: `100px` (was 80px)

- **Improved spacing:**
  - Horizontal padding: `px-6` (was `px-4`)
  - Vertical padding: `py-4` in rows (was `py-3`)
  - Column gap: `gap-4` (was `gap-3`)
  - Eliminated wasted space on right side

- **Enhanced UX:**
  - Added `cursor-help` to truncated cells
  - Added `font-mono` to email addresses
  - Added tooltips via `title` attributes
  - Improved hover states

#### Header & Pagination
- Larger header with shadow for depth
- Increased padding: `px-8 py-5` (was `px-6 py-4`)
- Larger title: `text-xl` (was `text-lg`)
- Card-style pagination with emphasized numbers

#### Filters
- Gradient background for visual depth
- Larger input padding
- Semibold, uppercase labels
- Hover states on all dropdowns

#### Contact Support Button Restriction
- **IMPORTANT:** "Contact Voxxy Support" button now **ONLY appears for undelivered emails** (status: `bounced` or `dropped`)
- Delivered, scheduled, pending, sent emails show `-` instead of action menu
- This reduces noise and focuses support requests on actual delivery failures

---

### 2. **Applicants Tab - Show All Statuses**

#### Removed Status Filtering
- Previously showed **ONLY** `pending` and `waitlist` applicants
- **Now shows ALL applicants** across all statuses:
  - `pending` - Application submitted, awaiting review
  - `approved` - Accepted by event organizer
  - `confirmed` - Vendor confirmed attendance
  - `waitlist` - On waiting list
  - `rejected` - Application denied
  - `cancelled` - Cancelled by vendor or organizer

#### Added Status Filter Dropdown
- Added dropdown with all 6 status options
- Users can now filter by any status or view all
- Status badges for all states (green for approved/confirmed, red for rejected, etc.)

#### Purpose
- **Preparing to merge Invites and Applicants tabs** into a unified vendor management interface
- Provides full visibility into vendor pipeline

---

## 🐛 KNOWN ISSUES (Backend Engineering Required)

### 1. **Event Announcement Row - Recipients Button Bug**
**Location:** Mail Tab > Event Announcement (Invitation) row
**Issue:** Clicking the recipient count opens the OLD recipients popup modal instead of the new email audit log
**Expected:** Should open the email audit log like all other email rows
**Impact:** Medium - Users can't access audit log for invitation emails via the recipients button
**Files Involved:**
- Frontend: `/src/components/producer/Email/EmailRow.tsx` (lines 254-271)
- Frontend: `/src/components/producer/Email/RecipientsModal.tsx`

**Root Cause:** Special handling for `isInvitationAnnouncement` flag on line 260:
```typescript
if (!isInvitationAnnouncement && onViewAuditLog) {
  onViewAuditLog({ email_name: email.name });
} else {
  setShowRecipientsModal(true); // Opens OLD modal
}
```

**Fix Needed:** Remove special case and use audit log for ALL emails, including invitations.

---

### 2. **Audit Log - Column Headers Don't Scroll with Content**
**Location:** Mail Tab > View Audit Log button > Table
**Issue:** When scrolling the table horizontally, the column headers stay fixed while the content shifts
**Expected:** Headers should scroll with the table content
**Impact:** High - Makes table difficult to use with wide data
**Files Involved:**
- Frontend: `/src/components/producer/Email/EmailAuditTable.tsx` (lines 125-137)

**Root Cause:** Header and body are in separate scroll containers:
```tsx
<div className="overflow-x-auto"> {/* Header wrapper */}
  <div className="grid grid-cols-[...]"> {/* Header */}
</div>
<div className="overflow-x-auto"> {/* Body wrapper - separate scroll */}
  {entries.map(...)} {/* Body */}
</div>
```

**Fix Needed:** Wrap both header and body in a single scrollable container or synchronize scroll positions.

---

### 3. **Audit Log - Filters Too Zoomed In / Pagination Insufficient**
**Location:** Mail Tab > View Audit Log
**Issue:**
- Filter UI is cramped at current zoom level
- Only 100 rows per page, but needs better view density
- Need to see more records per page without scrolling

**Expected:**
- Filters should be at ~80% zoom level for better screen real estate
- Table should display 100+ rows comfortably
- Better use of vertical space

**Impact:** Medium - Affects usability when reviewing large email batches
**Files Involved:**
- Frontend: `/src/components/producer/Email/EmailAuditFilters.tsx`
- Frontend: `/src/components/producer/Email/EmailAuditLogOverlay.tsx` (line 48: `itemsPerPage = 100`)

**Fix Needed:**
- Reduce filter UI spacing/padding
- Consider CSS zoom or transform scale
- Evaluate increasing `itemsPerPage` to 150-200

---

### 4. **Audit Log - Incorrect Delivery Status** ⚠️ **HIGH PRIORITY**
**Location:** Mail Tab > Email row shows "undelivered" but Audit Log shows "delivered"
**Issue:** Discrepancy between delivery status displayed in:
- **Mail Tab:** Shows email as undelivered
- **Email Audit Log:** Shows same email as delivered
- **Invites Tab:** Shows accurate email history (bounced/dropped) ✅

**Expected:** All three locations should show the same delivery status
**Impact:** **HIGH** - Critical data accuracy issue affecting user trust
**Backend Files Potentially Involved:**
- `/app/models/scheduled_email.rb` - Delivery count calculations
- `/app/models/email_delivery.rb` - Delivery status tracking
- `/app/controllers/api/scheduled_emails_controller.rb` - API endpoint for audit log
- `/app/controllers/api/email_deliveries_controller.rb` - Delivery records endpoint

**Root Cause Investigation Needed:**
1. **Check aggregation logic:** How are `undelivered_count`, `delivered_count`, and `delivery_counts` calculated?
2. **Verify SendGrid webhook processing:** Are delivery status updates being processed correctly?
3. **Inspect audit log query:** Does `scheduled_emails_api.getByEvent()` fetch fresh delivery data?
4. **Compare data sources:**
   - Mail tab uses: `ScheduledEmail.undelivered_count` (likely aggregated)
   - Audit log uses: `EmailDelivery.status` (individual records)
   - Invites tab uses: Event invitation delivery history (separate table?)

**Data Flow:**
```
SendGrid → Webhook → EmailDelivery record → Aggregation → ScheduledEmail.delivery_counts
                                                ↓
                                         Mail Tab Display
                                                ↓
                                         Audit Log Query (should fetch same data)
```

**Debugging Steps:**
1. Check database for specific email:
```sql
SELECT id, name, status, delivered_count, undelivered_count, delivery_counts
FROM scheduled_emails
WHERE id = [problem_email_id];

SELECT id, scheduled_email_id, status, sent_at, delivered_at, bounce_reason, drop_reason
FROM email_deliveries
WHERE scheduled_email_id = [problem_email_id];
```

2. Compare results - do they match?
3. Check audit log API response vs. Mail tab API response
4. Verify webhook logs for this email

**Fix Required:** Ensure all three views use the same underlying data source and aggregation logic.

---

## 📊 STATUS TYPES REFERENCE

For backend engineers working on delivery status fixes:

### Email Delivery Status (`email_deliveries.status`)
- `scheduled` - Will be sent in future
- `pending` - Sent to SendGrid, awaiting delivery
- `queued` - In SendGrid queue
- `sent` - Left SendGrid successfully
- `delivered` - ✅ Successfully delivered to inbox
- `bounced` - ❌ Failed - email address invalid or mailbox full
- `dropped` - ❌ Failed - SendGrid dropped (spam, unsubscribed, etc.)
- `unsubscribed` - User unsubscribed

**Special Frontend Filter:**
- `undelivered` - Combined filter showing `bounced` + `dropped`

### Scheduled Email Status (`scheduled_emails.status`)
- `scheduled` - Email scheduled to send
- `paused` - Paused by user
- `sent` - Sent to SendGrid
- `failed` - Failed to send
- `cancelled` - Cancelled

### Registration/Applicant Status (`registrations.status`)
- `pending` - Application submitted
- `approved` - Accepted by organizer
- `confirmed` - Vendor confirmed
- `waitlist` - On waiting list
- `rejected` - Denied
- `cancelled` - Cancelled

### Event Status (`events.status`)
- `draft` - Not published
- `published` - Live
- `cancelled` - Cancelled
- `completed` - Finished

---

## 🔄 DEPLOYMENT STATUS

- ✅ **Develop:** Merged (commit `6928034`)
- ✅ **Staging:** Merged and pushed
- ✅ **Main:** Merged and pushed (ready for production deployment)

---

## 🎯 NEXT STEPS (Backend Team)

### Immediate (High Priority)
1. **Fix audit log delivery status discrepancy** (Issue #4)
   - Investigate data source mismatch
   - Ensure consistent aggregation logic
   - Verify webhook processing

### Short Term
2. **Fix Event Announcement recipients button** (Issue #1)
3. **Fix audit log table header scrolling** (Issue #2)

### Medium Term
4. **Optimize audit log UI density** (Issue #3)
5. **Consider merging Invites/Applicants tabs** (frontend prepared for this)

---

## 📁 FILES MODIFIED (Frontend)

```
src/components/producer/ApplicantsTab.tsx
src/components/producer/Email/EmailAuditActionMenu.tsx
src/components/producer/Email/EmailAuditFilters.tsx
src/components/producer/Email/EmailAuditLogOverlay.tsx
src/components/producer/Email/EmailAuditTable.tsx
```

---

## 🤝 COLLABORATION NOTES

**Frontend Changes Complete:**
- UI improvements deployed
- Applicants tab now shows all statuses
- Contact Support restricted to undelivered emails

**Backend Action Required:**
- Investigate delivery status discrepancy (HIGH PRIORITY)
- Fix table scrolling behavior
- Review Event Announcement special case logic

**Questions for Backend Team:**
1. Why might Mail tab and Audit log show different delivery statuses for the same email?
2. What is the source of truth for delivery status - `ScheduledEmail.delivery_counts` or `EmailDelivery.status`?
3. Should Event Announcement emails use the same audit log as regular emails, or keep separate modal?

---

**Document Created:** February 27, 2025
**Next Review:** After backend fixes deployed
**Contact:** Frontend Team (Courtney + Claude Code)
