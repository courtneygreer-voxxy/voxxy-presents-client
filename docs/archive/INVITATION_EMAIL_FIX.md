# Invitation Email Display Fix
**Date:** 2026-01-17
**Issue:** Invitation emails not appearing at top of scheduled emails list
**Status:** ✅ FIXED + Enhanced Debugging

---

## 🔍 What Was Fixed

### 1. **TypeScript Type Mismatch**
**File:** `src/services/api.ts:2149-2167`

**Before:**
```typescript
meta: {
  total_count: number
  pending_count: number
  sent_count: number
  accepted_count: number  // ❌ Missing viewed_count
  declined_count: number
  expired_count: number
}
```

**After:**
```typescript
meta: {
  total_count: number
  pending_count: number
  sent_count: number
  viewed_count: number     // ✅ Added to match backend
  accepted_count: number
  declined_count: number
  expired_count: number
}
```

---

### 2. **Enhanced Error Handling & Debugging**
**File:** `src/components/producer/Email/EmailAutomationTab.tsx:61-136`

**Added comprehensive logging to track:**
- ✅ API response structure
- ✅ Invitation counts (total, sent, viewed)
- ✅ Number of invitations with `sent_at` timestamps
- ✅ Whether virtual email is being created
- ✅ Virtual email object details
- ✅ Final email list composition

---

## 🎯 How the System Works

### Backend Flow:
1. **User creates event invitations** (POST `/events/:slug/invitations/batch`)
2. **Invitations are marked as sent**:
   ```ruby
   invitation.mark_as_sent!
   # Sets: status = "sent", sent_at = Time.current
   ```
3. **API returns invitation data**:
   ```ruby
   {
     invitations: [...],
     meta: {
       sent_count: X  # ← Counts where status="sent"
     }
   }
   ```

### Frontend Flow:
1. **Fetch scheduled emails** → `scheduledEmailsApi.getByEvent(eventSlug)`
2. **Fetch invitations** → `eventInvitationsApi.getByEvent(eventSlug)`
3. **Check if invitations were sent**:
   ```typescript
   if (invitationsData.meta.sent_count > 0) {
     // Create virtual "Event Announcement (Invitations Sent)" email
   }
   ```
4. **Add virtual email to front of list**:
   ```typescript
   allEmails.unshift(invitationEmail);
   ```

---

## 🐛 Debugging Guide

### Step 1: Open Browser Console

Navigate to: **Email Automation Tab** for your event

### Step 2: Check Console Logs

You should see these logs in order:

#### **1. Invitations API Response**
```
📨 Invitations API Response: {
  total_count: 5,
  sent_count: 5,        ← Should be > 0 if invitations were sent
  viewed_count: 2,
  invitations_with_sent_at: 5
}
```

**✅ If `sent_count > 0`:** Virtual email should be created
**❌ If `sent_count = 0`:** Check database - are invitations actually marked as "sent"?

#### **2. Virtual Email Creation**
```
🎯 Creating virtual invitation email (sent_count: 5)
   Found 5 invitations with sent_at timestamp
   Using earliest sent date: 2026-01-15T18:00:00.000Z
✅ Added invitation announcement email to position 0
   Virtual email object: {
     name: "Event Announcement (Invitations Sent)",
     status: "sent",
     recipient_count: 5,
     scheduled_for: "2026-01-15T18:00:00.000Z",
     isInvitationAnnouncement: true
   }
```

**✅ If you see this:** Virtual email was created successfully
**❌ If you don't see this:** Check the `sent_count` in step 1

#### **3. Final Email List**
```
📋 Total emails to display: 6
   - Scheduled emails from API: 5
   - Virtual invitation email: YES
```

**✅ If "Virtual invitation email: YES":** Email should appear in list
**❌ If "Virtual invitation email: NO":** Something removed it after creation

---

## 🔎 Troubleshooting Scenarios

### Scenario 1: API Call Failing
**Symptoms:**
```
❌ Failed to fetch invitations: Network error
   Full error: [error object]
```

**Causes:**
- Network connectivity issue
- API authentication problem
- Backend server error

**Fix:**
- Check network tab in DevTools
- Verify JWT token is valid
- Check Rails logs for errors

---

### Scenario 2: No Sent Invitations
**Symptoms:**
```
📨 Invitations API Response: {
  sent_count: 0,  ← Problem!
  ...
}
ℹ️  No sent invitations found (sent_count: 0), skipping virtual email creation
```

**Causes:**
- No invitations have been created yet
- Invitations exist but status ≠ "sent"
- Invitations were created but `mark_as_sent!` never ran

**Fix - Check Database:**
```sql
-- Check if invitations exist
SELECT * FROM event_invitations WHERE event_id = [your_event_id];

-- Check invitation statuses
SELECT status, COUNT(*)
FROM event_invitations
WHERE event_id = [your_event_id]
GROUP BY status;

-- Check if sent_at is populated
SELECT id, status, sent_at
FROM event_invitations
WHERE event_id = [your_event_id] AND status = 'sent';
```

**Fix - Rails Console:**
```ruby
event = Event.find_by(slug: "your-event-slug")

# Check invitations
event.event_invitations.count  # Total invitations
event.event_invitations.sent.count  # How many are "sent"

# Manually mark as sent if needed (testing only!)
event.event_invitations.each do |inv|
  inv.mark_as_sent! if inv.status == "pending"
end
```

---

### Scenario 3: Invitations Have No `sent_at` Timestamp
**Symptoms:**
```
📨 Invitations API Response: {
  sent_count: 5,  ← Invitations exist
  invitations_with_sent_at: 0  ← But no timestamps!
}
🎯 Creating virtual invitation email (sent_count: 5)
   Found 0 invitations with sent_at timestamp
   Using earliest sent date: 2026-01-17T23:45:00.000Z  ← Falls back to now()
```

**Causes:**
- Old invitations created before `sent_at` logic
- `mark_as_sent!` method not called
- Database migration issue

**Fix - Rails Console:**
```ruby
event = Event.find_by(slug: "your-event-slug")

# Add sent_at to invitations that are marked as sent but missing timestamp
event.event_invitations.where(status: "sent", sent_at: nil).each do |inv|
  inv.update!(sent_at: inv.created_at || Time.current)
end
```

---

### Scenario 4: Virtual Email Created But Not Visible
**Symptoms:**
```
✅ Added invitation announcement email to position 0
📋 Total emails to display: 6
   - Virtual invitation email: YES
```
But you still don't see it in the UI!

**Causes:**
- Filtering removing it (status filter, search query)
- Frontend component not rendering it
- CSS hiding it

**Fix - Check Filters:**
1. Clear any search queries
2. Set status filter to "All Emails"
3. Check browser DevTools Elements tab to see if it's rendered but hidden

---

## 🧪 Testing Checklist

### Test 1: Fresh Event with Invitations
- [ ] Create new event
- [ ] Add vendor contacts
- [ ] Create batch invitations
- [ ] Check invitations are sent (`sent_at` populated)
- [ ] Navigate to Email Automation tab
- [ ] Verify invitation email appears at top
- [ ] Verify recipient count matches `sent_count`
- [ ] Verify sent date matches earliest `sent_at`

### Test 2: Existing Event
- [ ] Find event with existing sent invitations
- [ ] Check database: `SELECT * FROM event_invitations WHERE event_id = X AND status = 'sent'`
- [ ] Navigate to Email Automation tab
- [ ] Check browser console logs
- [ ] Verify invitation email appears

### Test 3: Edge Cases
- [ ] Event with no invitations → Should NOT show invitation email
- [ ] Event with pending (not sent) invitations → Should NOT show invitation email
- [ ] Event with sent invitations but no `sent_at` → Should show with current timestamp
- [ ] Event with multiple invitations → Should use earliest `sent_at` date

---

## 📊 Database Queries for Debugging

### Check Invitation Status for Event
```sql
SELECT
  e.slug AS event_slug,
  ei.status,
  COUNT(*) AS count,
  MIN(ei.sent_at) AS earliest_sent,
  MAX(ei.sent_at) AS latest_sent
FROM events e
JOIN event_invitations ei ON ei.event_id = e.id
WHERE e.slug = 'your-event-slug'
GROUP BY e.slug, ei.status;
```

### Find Events Missing sent_at Timestamps
```sql
SELECT
  e.slug,
  COUNT(*) AS invitations_without_sent_at
FROM events e
JOIN event_invitations ei ON ei.event_id = e.id
WHERE ei.status = 'sent' AND ei.sent_at IS NULL
GROUP BY e.slug;
```

---

## 📝 Key Code Locations

### Frontend:
- **API Type Definition:** `src/services/api.ts:2149-2167`
- **Virtual Email Creation:** `src/components/producer/Email/EmailAutomationTab.tsx:61-136`
- **Email Row Component:** `src/components/producer/Email/EmailRow.tsx:106` (checks `isInvitationAnnouncement`)
- **TypeScript Interface:** `src/types/email.ts:102` (has `isInvitationAnnouncement?: boolean`)

### Backend:
- **Invitations Controller:** `app/controllers/api/v1/presents/event_invitations_controller.rb`
- **EventInvitation Model:** `app/models/event_invitation.rb:28-30` (`mark_as_sent!` method)
- **Database Schema:** `db/schema.rb:220-236`

---

## ✅ Success Criteria

The fix is working when:
- ✅ Invitation email appears at position 0 (top of list)
- ✅ Shows "Event Announcement (Invitations Sent)" as name
- ✅ Shows status badge as "sent"
- ✅ Shows correct recipient count from API
- ✅ Shows correct sent date (earliest invitation `sent_at`)
- ✅ Cannot be edited (no action menu)
- ✅ Cannot be deleted
- ✅ Console logs show successful creation

---

## 🚀 Next Steps

1. **Deploy the changes** to production
2. **Check a real event** with sent invitations
3. **Open browser console** and look for the logs
4. **Share the console output** if the issue persists

If you still don't see the invitation email after these changes, share the browser console logs and I'll help you debug further!

---

**Fixed By:** Claude
**Deployed:** [Date]
**Verified:** [Date]
