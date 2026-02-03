# End-to-End Test: Event Creation Flow

**Test Date:** _________
**Tester:** _________
**Environment:** [ ] Local [ ] Staging [ ] Production
**Browser:** _________
**Backend Version/Commit:** _________
**Frontend Version/Commit:** _________

---

## Pre-Test Setup

### Prerequisites
- [ ] Valid user account with producer role
- [ ] At least 60+ contacts in network (for pagination testing)
- [ ] At least 1 contact list with 50+ contacts
- [ ] Clean test environment (no duplicate test events)

### Test Data to Prepare
- **Event Title:** `E2E Test Event - [YYYY-MM-DD HH:mm]` (use current timestamp)
- **Event Date:** Future date (at least 30 days out)
- **Application Deadline:** 7 days before event
- **Payment Deadline:** 3 days before event
- **Location:** `123 Test Street, Test City, TS 12345`
- **Vendor Application:** `Artist Booth - $100` (or similar)
- **Contact List:** Pre-existing list with 50+ contacts

---

## Test Phases

## Phase 1: Login & Navigation

### 1.1 Login
- [ ] Navigate to login page
- [ ] Enter valid credentials
- [ ] Click "Login"
- [ ] **VERIFY:** Redirected to dashboard
- [ ] **VERIFY:** User name displayed in header

### 1.2 Navigate to Event Creation
- [ ] Click "Create Event" button (or equivalent)
- [ ] **VERIFY:** Event creation wizard opens
- [ ] **VERIFY:** Step 1 (Event Details) is active
- [ ] **VERIFY:** Progress indicator shows 4 steps

---

## Phase 2: Step 1 - Event Details

### 2.1 Fill Basic Information
- [ ] Enter event title: `E2E Test Event - [timestamp]`
- [ ] Enter description: `End-to-end test event created on [date]`
- [ ] Select event date (future date)
- [ ] **VERIFY:** Date picker works correctly
- [ ] Select event end date (same day or next day)
- [ ] Enter start time: `6:00 PM`
- [ ] Enter end time: `10:00 PM`

### 2.2 Fill Location & Venue
- [ ] Enter location: `123 Test Street, Test City, TS 12345`
- [ ] Enter venue name: `Test Venue Hall`
- [ ] **VERIFY:** All fields accept input without errors

### 2.3 Fill Deadlines
- [ ] Select application deadline (7 days before event)
- [ ] **VERIFY:** Application deadline date picker works
- [ ] Select payment deadline (3 days before event)
- [ ] **VERIFY:** Payment deadline is after application deadline
- [ ] Enter age restriction: `All Ages` (or `18+`, `21+`)

### 2.4 Optional Fields
- [ ] Enter ticket link: `https://example.com/tickets`
- [ ] **VERIFY:** URL validation works (if implemented)
- [ ] Click "Next" button
- [ ] **VERIFY:** No validation errors
- [ ] **VERIFY:** Progress moves to Step 2

**Step 1 Screenshot:** _________

---

## Phase 3: Step 2 - Vendor Applications

### 3.1 Add First Application
- [ ] Click "Add Application" or similar button
- [ ] **VERIFY:** Application form appears
- [ ] Enter name: `Artist Booth`
- [ ] Enter description: `Standard artist booth space`
- [ ] Enter booth price: `100`
- [ ] **VERIFY:** Price accepts numeric input only
- [ ] Select install date (day before event)
- [ ] **VERIFY:** Application appears in list

### 3.2 Add Second Application (Optional)
- [ ] Click "Add Application" again
- [ ] Enter name: `Food Vendor Booth`
- [ ] Enter booth price: `200`
- [ ] **VERIFY:** Both applications show in list
- [ ] **VERIFY:** Can delete applications (test delete button)
- [ ] Re-add deleted application

### 3.3 Proceed to Next Step
- [ ] Click "Next" button
- [ ] **VERIFY:** Progress moves to Step 3

**Step 2 Screenshot:** _________

---

## Phase 4: Step 3 - Invite List (CRITICAL - Recent Changes)

### 4.1 Initial State
- [ ] **VERIFY:** Empty state shows "No Contacts Invited Yet"
- [ ] **VERIFY:** "Import Contacts" button is visible
- [ ] Click "Import from Network" button

### 4.2 Import Contacts Modal
- [ ] **VERIFY:** Modal opens with "Import from Network" title
- [ ] **VERIFY:** "Invite All Contacts" option shows total count
- [ ] **VERIFY:** Contact lists are displayed with contact counts

### 4.3 Test Pagination Fix - Import Large List
- [ ] Select a contact list with 50+ contacts (e.g., 57 contacts)
- [ ] **VERIFY:** Button shows "Add [count] contacts" with correct number
- [ ] Click "Add [count] contacts"
- [ ] **VERIFY:** Modal closes
- [ ] **VERIFY:** Loading indicator appears briefly

### 4.4 Verify All Contacts Imported (CRITICAL)
- [ ] **VERIFY:** Contact count in header matches selected count (e.g., "57 contacts")
- [ ] **VERIFY:** First page shows up to 50 contacts
- [ ] Scroll through contact table
- [ ] **VERIFY:** NO STAR ICONS appear next to any contact names
- [ ] **VERIFY:** Pagination shows correct page count (e.g., "Page 1 of 2")
- [ ] Click "Next" page button
- [ ] **VERIFY:** Remaining contacts appear (e.g., 7 more contacts on page 2)
- [ ] **VERIFY:** Total matches imported count

### 4.5 Search & Filter Contacts
- [ ] Use search box to filter contacts
- [ ] **VERIFY:** Search works correctly
- [ ] Clear search
- [ ] Select multiple contacts using checkboxes
- [ ] Click "Delete X Selected"
- [ ] **VERIFY:** Selected contacts removed from list
- [ ] **VERIFY:** Contact count updates

### 4.6 Re-Import Contacts
- [ ] Click "Import from Network" again
- [ ] Select different list or "Invite All"
- [ ] **VERIFY:** Contacts are added/replaced correctly

### 4.7 Proceed to Next Step
- [ ] Click "Next" button (or equivalent)
- [ ] **VERIFY:** Progress moves to Step 4
- [ ] **VERIFY:** Blue info banner shows: "Note: Select who's invited - you can edit this list later before going live"

**Step 3 Screenshots:**
- Before import: _________
- After import (page 1): _________
- After import (page 2): _________
- Search/filter: _________

---

## Phase 5: Step 4 - Email Campaign

### 5.1 Review Default Emails
- [ ] **VERIFY:** Default email sequence is displayed
- [ ] **VERIFY:** All scheduled emails show dates/triggers
- [ ] **VERIFY:** "View" button appears (NOT "Customize")
- [ ] Click "View" on one email
- [ ] **VERIFY:** Email preview modal opens
- [ ] **VERIFY:** Email renders with white background
- [ ] Close preview modal

### 5.2 Complete Event Creation
- [ ] Click "Create Event" button
- [ ] **VERIFY:** Loading indicator appears
- [ ] **VERIFY:** Progress messages show:
  - "Creating your event..."
  - "Setting up vendor applications..."
  - "Saving invitation selections..."
  - "Loading Command Center..."

**Step 4 Screenshot:** _________

---

## Phase 6: Event Created - Command Center

### 6.1 Verify Event Created
- [ ] **VERIFY:** Redirected to Command Center view
- [ ] **VERIFY:** Event title matches input
- [ ] **VERIFY:** Event details are correct
- [ ] **VERIFY:** Event status is "draft" or similar
- [ ] **VERIFY:** No errors in browser console (F12)

### 6.2 Verify Go Live Card
- [ ] **VERIFY:** "Go Live" card is visible
- [ ] **VERIFY:** Card shows draft invitation status
- [ ] **VERIFY:** Card shows number of pending invitations
- [ ] Click "Go Live" or "Edit Invitations" button
- [ ] **VERIFY:** Go Live modal opens

### 6.3 Go Live Invitation Editor
- [ ] **VERIFY:** Modal shows all invited contacts
- [ ] **VERIFY:** Contact count matches Step 3 selection
- [ ] **VERIFY:** Can add/remove contacts
- [ ] **VERIFY:** Can exclude specific contacts
- [ ] Close modal without going live

### 6.4 Verify Applications Tab
- [ ] Navigate to Applications tab (if visible)
- [ ] **VERIFY:** Vendor applications created correctly
- [ ] **VERIFY:** Application names and prices match Step 2

### 6.5 Verify Emails Tab
- [ ] Navigate to Emails tab
- [ ] **VERIFY:** Scheduled emails are in "paused" state
- [ ] **VERIFY:** Email list matches Step 4 preview
- [ ] Click "View" on an email
- [ ] **VERIFY:** Email preview renders correctly

**Command Center Screenshots:**
- Overview: _________
- Go Live card: _________
- Invitations list: _________
- Applications: _________
- Emails: _________

---

## Phase 7: Backend Verification

### 7.1 Database Checks (if accessible)
- [ ] **VERIFY:** Event record created in database
- [ ] **VERIFY:** Event slug is unique (no collision)
- [ ] **VERIFY:** `invitation_list_ids` field populated
- [ ] **VERIFY:** `invitation_contact_ids` field populated
- [ ] **VERIFY:** Vendor applications created
- [ ] **VERIFY:** Scheduled emails created with `paused: true`

### 7.2 API Response Verification
- [ ] Open browser DevTools > Network tab
- [ ] Review POST request to `/events` endpoint
- [ ] **VERIFY:** Request payload contains all event fields
- [ ] **VERIFY:** Response status is 200/201
- [ ] **VERIFY:** Response contains event object with slug
- [ ] Review PATCH request to update invitation data
- [ ] **VERIFY:** Request contains `invitation_list_ids`, `invitation_contact_ids`

---

## Phase 8: Regression Testing - Star Feature Removed

### 8.1 Network Page Check
- [ ] Navigate to Network tab
- [ ] **VERIFY:** NO "Featured/Voxxy Card Filter" dropdown in filters
- [ ] **VERIFY:** "Clear Filters" button only shows when location/category filters active
- [ ] **VERIFY:** NO star icons appear next to contact names
- [ ] Search for contacts
- [ ] **VERIFY:** Star icons still absent

### 8.2 Contact List Check
- [ ] Navigate to Lists subtab
- [ ] Open a contact list
- [ ] **VERIFY:** NO star icons in contact list view
- [ ] **VERIFY:** NO featured filter option

### 8.3 Import Modal Check
- [ ] Open any import contacts modal
- [ ] **VERIFY:** NO star icons in contact preview
- [ ] Import contacts
- [ ] **VERIFY:** No errors related to "featured" field

**Regression Screenshots:**
- Network page (no star filter): _________
- Contact row (no stars): _________

---

## Phase 9: Error Handling & Edge Cases

### 9.1 Slug Collision Test
- [ ] Attempt to create another event with same title
- [ ] **VERIFY:** Error message: "Slug has already been taken"
- [ ] **VERIFY:** User-friendly error displayed
- [ ] Change event title to make it unique
- [ ] **VERIFY:** Event creation succeeds

### 9.2 Empty Invite List
- [ ] Create event without importing any contacts
- [ ] **VERIFY:** Event creation succeeds
- [ ] **VERIFY:** Go Live card shows "No invitations yet"
- [ ] **VERIFY:** Can add invitations later via Go Live editor

### 9.3 Network Errors
- [ ] Disconnect network (or simulate)
- [ ] Attempt event creation
- [ ] **VERIFY:** Appropriate error message displayed
- [ ] **VERIFY:** No silent failures

### 9.4 Large Contact List (100+ contacts)
- [ ] Import a list with 100+ contacts
- [ ] **VERIFY:** All contacts imported (check pagination)
- [ ] **VERIFY:** No timeout errors
- [ ] **VERIFY:** Performance is acceptable

---

## Phase 10: Cleanup

### 10.1 Delete Test Event
- [ ] Navigate to event list
- [ ] Find test event created
- [ ] Delete test event (if delete functionality exists)
- [ ] **VERIFY:** Event deleted successfully

### 10.2 Verify No Orphaned Data
- [ ] **VERIFY:** Applications deleted with event (if cascade delete)
- [ ] **VERIFY:** Scheduled emails deleted with event
- [ ] **VERIFY:** No database orphans

---

## Test Results Summary

### Passed ✅
- [ ] All critical features working
- [ ] Pagination fix verified (all contacts imported)
- [ ] Star feature completely removed
- [ ] No TypeScript/console errors
- [ ] Backend data correctly saved

### Failed ❌
List any failed test cases:
1. _______________________________________
2. _______________________________________
3. _______________________________________

### Bugs Found
| Severity | Description | Steps to Reproduce | Screenshot |
|----------|-------------|-------------------|------------|
| [ ] Critical<br>[ ] High<br>[ ] Medium<br>[ ] Low | | | |

### Performance Notes
- Event creation time: _______ seconds
- Contact import time (50+ contacts): _______ seconds
- Any lag or delays: _______________________________________

---

## Sign-Off

**Test Completed By:** _________
**Date:** _________
**Overall Status:** [ ] PASS [ ] FAIL [ ] PASS WITH ISSUES

**Notes:**
_______________________________________
_______________________________________
_______________________________________

**Ready for Production:** [ ] YES [ ] NO
**If NO, blocking issues:**
_______________________________________
_______________________________________
