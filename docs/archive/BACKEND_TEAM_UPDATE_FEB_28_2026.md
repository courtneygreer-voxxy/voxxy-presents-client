# Backend Team Update - Invitation Unification (Feb 28, 2026)

**From:** Frontend Team
**To:** Backend Team (Claude)
**Date:** February 28, 2026
**Priority:** 🔔 Important - Frontend Changes Deployed to Staging
**Status:** ✅ Frontend Complete | 📋 Backend Awareness Needed

---

## TL;DR - What Changed

The frontend has **removed virtual invitation email logic**. Position 1 "Initial Invitation" is now treated as the only invitation template in the UI. This aligns with your recent backend changes where Position 1 became the real template used for sending invitations.

**Key Changes:**

- ✅ Removed ~85 lines of virtual email creation code
- ✅ Mail tab now shows exactly **17 rows** (not 18)
- ✅ Position 1 is fully editable and opens audit log like other emails
- ✅ All emails use consistent behavior (no more special cases)

**No Backend Changes Required** - This is informational only. Your Phases 1-3 deployment is working perfectly!

---

## Background - Why This Change?

### The Old System (Before Today)

**Backend:**

- Position 1 "Initial Invitation" existed as a database record
- But it WASN'T used for sending invitations
- Instead, invitations used a hardcoded mailer template
- Position 1 was effectively a "preview-only" template

**Frontend:**

1. Fetched 17 scheduled emails from `/events/:slug/scheduled_emails`
2. Fetched invitations from `/events/:slug/invitations`
3. Created a **virtual email object** with `id: -1` for the invitation
4. Displayed **18 total rows** in Mail tab (17 real + 1 virtual)

**Problems This Caused:**

- Clicking recipients on invitation opened old modal (not audit log)
- Couldn't edit Position 1 (frontend blocked it)
- Confusing duplicate rows for the same concept
- Special case logic scattered across components

### The New System (After Backend Phases 1-3 + Today)

**Backend:**

- ✅ Position 1 is now the **REAL** template used for sending
- ✅ `EventInvitationsController` uses Position 1 template
- ✅ Template variables resolved via `InvitationVariableResolver`
- ✅ Creates proper `EmailDelivery` records for audit tracking

**Frontend:**

1. Fetches 17 scheduled emails from `/events/:slug/scheduled_emails`
2. Position 1 is in the list and treated like any other email
3. Displays **17 total rows** in Mail tab
4. No more virtual email creation

**Benefits:**

- ✅ Consistent behavior across all emails
- ✅ Position 1 can be edited (subject, body, triggers)
- ✅ Audit log works for invitations (recipient names, categories)
- ✅ Simpler codebase (removed special case logic)

---

## What the Frontend Changed

### Files Modified

#### 1. `src/components/producer/Email/EmailAutomationTab.tsx`

**Removed:**

- ~85 lines of invitation fetching and virtual email creation
- Special case for `isInvitationAnnouncement` flag
- Edit restrictions for invitation emails

**Before:**

```typescript
// Fetch invitations separately
const invitationsData = await eventInvitationsApi.getByEvent(eventSlug)

// Create virtual email object
const invitationEmail: ScheduledEmail = {
  id: -1,
  isInvitationAnnouncement: true,
  name: 'Event Announcement (Invitation...)',
  // ... lots of mapped data
}

// Inject at the beginning
allEmails.unshift(invitationEmail)
```

**After:**

```typescript
// Just fetch scheduled emails - Position 1 is in the list!
const scheduledEmailsData = await scheduledEmailsApi.getByEvent(eventSlug)
setEmails(scheduledEmailsData)
```

#### 2. `src/components/producer/Email/EmailRow.tsx`

**Fixed Issue #1:** Recipients button now opens audit log for ALL emails

**Before:**

```typescript
// Special case prevented invitations from opening audit log
if (!isInvitationAnnouncement && onViewAuditLog) {
  onViewAuditLog({ email_name: email.name })
} else {
  setShowRecipientsModal(true) // Old modal
}
```

**After:**

```typescript
// All emails use audit log
if (onViewAuditLog) {
  onViewAuditLog({ email_name: email.name })
}
```

#### 3. `src/types/email.ts`

**Removed:**

- `isInvitationAnnouncement?: boolean` flag
- `isPreviewOnly?: boolean` flag

**Added (from Phases 1-3):**

- `recipient_name?: string | null` ✅
- `vendor_category?: string | null` ✅

#### 4. Other Components

- `ScheduledEmailCard.tsx` - Removed invitation click restrictions
- `EventEmailPreviewModal.tsx` - Removed special invitation preview logic

---

## What the Backend Should Expect

### API Usage Changes

#### `/events/:slug/scheduled_emails`

**Before:**

- Frontend fetched this, then separately fetched invitations
- Position 1 was in the response but largely ignored

**After:**

- Frontend fetches this ONLY
- Position 1 is treated like any other scheduled email
- No separate invitation fetching in most cases

**Expected Response:**

```json
[
  {
    "id": 1,
    "position": 1,
    "name": "Initial Invitation",
    "subject_template": "[eventName] - Applications Now Open!",
    "body_template": "...",
    "trigger_type": "on_application_open",
    "status": "sent",
    "recipient_count": 45,
    "delivered_count": 40,
    "undelivered_count": 5,
    "email_deliveries": [...]  // If included
  },
  {
    "id": 2,
    "position": 2,
    // ... other emails
  }
  // ... positions 3-17
]
```

#### `/events/:slug/invitations`

**Status:** Still used by audit log for legacy delivery stats

**Usage:**

- Audit log still calls this to get `meta.delivery_stats`
- But no longer creates virtual email from invitation data
- Consider this endpoint "legacy support" for now

**Future:** Could potentially deprecate if all invitation data comes through Position 1 deliveries

#### `/events/:slug/scheduled_emails/1/email_deliveries`

**New Behavior:**

- Frontend now fetches Position 1 deliveries like any other email
- Expects registration data (recipient_name, vendor_category) ✅
- Used to populate audit log for invitation emails

---

## Testing Coordination Needed

### What You Should Verify (Backend)

#### 1. Position 1 Sends Correctly

**Test:**

1. Create new event (or use existing migrated event)
2. Open applications
3. Send batch invitations
4. Check backend logs

**Expected Logs:**

```
✓ Using unified template: Position 1 - Initial Invitation
✓ Resolved variables: [eventName], [applicationUrl], etc.
✓ Creating EmailDelivery records for 45 recipients
✓ Invitation batch sent successfully
```

**NOT Expected:**

```
⚠️ No unified email template found, using fallback
```

#### 2. Position 1 Deliveries Track Correctly

**Test:**

1. After sending invitations, call:
   `GET /events/:slug/scheduled_emails/1/email_deliveries`
2. Verify response includes registration data

**Expected:**

```json
[
  {
    "id": 123,
    "scheduled_email_id": 1, // Position 1
    "registration_id": 456,
    "recipient_email": "vendor@example.com",
    "recipient_name": "John Doe", // ✅ Must be present
    "vendor_category": "Food & Beverage", // ✅ Must be present
    "status": "delivered",
    "sent_at": "2026-02-28T10:00:00Z"
  }
]
```

#### 3. Position 1 Can Be Edited

**Test:**

1. Frontend user edits Position 1 subject: "CUSTOM: [eventName] Invitations!"
2. Frontend calls: `PUT /events/:slug/scheduled_emails/1`
3. Send invitations
4. Verify invitations use the CUSTOM subject

**Expected:**

- ✅ Position 1 updates successfully
- ✅ Next invitations use updated template
- ✅ Variables still resolve correctly

#### 4. Delivery Counts Update

**Test:**

1. Send invitations (Position 1 status changes to "sent")
2. SendGrid webhook fires with delivery/bounce status
3. Check Position 1 record

**Expected:**

```ruby
scheduled_email = ScheduledEmail.find(1)
scheduled_email.delivered_count  # Should match actual deliveries
scheduled_email.undelivered_count  # Should match bounces + drops
```

**Note:** This is related to Issue #4 (Phase 4). If counts are stale, that's a known issue, not a regression.

---

### What Frontend QA Will Test

We're testing these scenarios on staging:

1. ✅ Mail tab shows exactly 17 rows (not 18)
2. ✅ Position 1 "Initial Invitation" is visible and editable
3. ✅ Clicking Position 1 recipient count opens audit log
4. ✅ Audit log shows invitation deliveries with:
   - Real recipient names (not "Unknown")
   - Real vendor categories (not "Unknown")
   - Correct delivery statuses
5. ✅ Can edit Position 1 subject and body
6. ✅ Action menu available (pause/resume/delete if applicable)
7. ✅ Deep links work (undelivered count filters to bounced/dropped)

**If any of these fail**, it likely indicates a backend issue with:

- Position 1 not being returned in `/scheduled_emails`
- Position 1 not creating EmailDelivery records
- Missing registration data in deliveries response

---

## Potential Backend Validations (Optional)

### Validation 1: Position 1 Always Exists

**Recommendation:** Ensure all events have Position 1

```ruby
# Migration or rake task
Event.find_each do |event|
  unless event.scheduled_emails.exists?(position: 1)
    puts "⚠️ Event #{event.slug} missing Position 1, creating..."
    event.scheduled_emails.create!(
      position: 1,
      name: 'Initial Invitation',
      subject_template: '[eventName] - Applications Now Open!',
      body_template: '...',
      trigger_type: 'on_application_open'
    )
  end
end
```

### Validation 2: Invitation Controller Uses Position 1

**Verify:** When sending invitations, Position 1 template is used

```ruby
# In EventInvitationsController or similar
def send_batch_invitations
  template = @event.scheduled_emails.find_by(position: 1)

  if template.blank?
    Rails.logger.warn "⚠️ No unified email template found, using fallback"
    # Use fallback mailer
  else
    Rails.logger.info "✓ Using unified template: Position 1 - #{template.name}"
    # Use template system
  end
end
```

### Validation 3: Email Deliveries Include Registration Data

**Verify:** Serializer includes recipient_name and vendor_category

```ruby
# In EmailDeliverySerializer or similar
class EmailDeliverySerializer < ActiveModel::Serializer
  attributes :id, :scheduled_email_id, :registration_id,
             :recipient_email, :status, :sent_at, :delivered_at,
             :bounce_reason, :drop_reason,
             :recipient_name, :vendor_category  # ✅ Must include these

  def recipient_name
    object.registration&.vendor_contact&.name
  end

  def vendor_category
    object.registration&.vendor_contact&.vendor_category
  end
end
```

---

## Known Issues & Workarounds

### Issue #4: Delivery Count Discrepancy (Phase 4)

**Status:** Still exists, not related to this change

**What It Is:**

- `scheduled_email.delivered_count` may be stale
- `email_deliveries.where(status: 'delivered').count` is accurate

**Workaround:**

- Frontend uses individual `email_deliveries` as source of truth
- Mail tab counts may show slight discrepancies until Phase 4

**Phase 4 Will Fix:**

- Implement `recalculate_delivery_counts!` method
- Update SendGrid webhook to call it after status changes

### Legacy Events (Pre-Migration)

**Issue:** Some events may not have Position 1 yet

**Behavior:**

- Backend logs: `⚠️ No unified email template found, using fallback`
- Invitations still send via old hardcoded mailer
- No Position 1 row in frontend Mail tab
- Invitations don't create EmailDelivery records

**Solution:**

- Run migration to create Position 1 for all events
- Or accept fallback behavior for old events

---

## FAQ for Backend Team

### Q: Do I need to change any backend code?

**A:** No! Your Phases 1-3 changes already support this. We're just removing frontend workarounds that were masking the fact that Position 1 is now real.

### Q: Will this break anything?

**A:** No. We're removing **frontend-only** virtual email creation. Backend API usage remains the same.

### Q: What if Position 1 doesn't exist for an event?

**A:** Backend should continue using fallback mailer (current behavior). Frontend will show 16 rows instead of 17, which is fine.

### Q: Should I delete the `/invitations` endpoint?

**A:** Not yet. Frontend audit log still uses `meta.delivery_stats` from that endpoint. We can deprecate later after confirming all data comes through Position 1.

### Q: What about SendGrid webhooks?

**A:** No changes needed. Webhooks should continue updating `email_deliveries.status` as before. Position 1 deliveries work the same as other emails.

### Q: How do I know if Position 1 is working?

**A:** After sending invitations, check:

```sql
SELECT * FROM scheduled_emails WHERE position = 1 AND event_id = 123;
SELECT * FROM email_deliveries WHERE scheduled_email_id = <position_1_id> LIMIT 10;
```

You should see EmailDelivery records with `scheduled_email_id` pointing to Position 1.

---

## Rollback Plan (If Needed)

### Frontend Rollback

If this causes issues, frontend can rollback by restoring virtual email logic:

```bash
git revert <commit-hash>
npm run build
# Deploy previous version
```

**What Gets Restored:**

- Virtual invitation email creation
- Special case for `isInvitationAnnouncement`
- Old recipients modal behavior
- 18 rows in Mail tab

**Note:** Even if frontend rolls back, backend Position 1 system continues working. We just get duplicate UI rows again.

### Backend Rollback

**Not needed** - no backend changes were made as part of this frontend update.

---

## Success Criteria

### Must Work (Blocking)

- [ ] Position 1 sends invitations correctly
- [ ] Position 1 creates EmailDelivery records
- [ ] Email deliveries include `recipient_name` and `vendor_category`
- [ ] Position 1 can be edited (subject, body)
- [ ] No 500 errors when fetching `/scheduled_emails`

### Nice to Have (Non-Blocking)

- [ ] Position 1 exists for all events (if not, fallback works)
- [ ] Delivery counts stay in sync (Phase 4 will improve this)
- [ ] Fast auto-refresh performance (Phase 4 will optimize)

---

## Timeline & Next Steps

### Today (Feb 28, 2026)

- [x] ✅ Frontend changes deployed to staging
- [x] ✅ Documentation updated
- [ ] 🧪 Frontend QA testing in progress
- [ ] 📋 Backend team review (this document)

### This Week

- [ ] Complete frontend testing
- [ ] Document any issues found
- [ ] Coordinate on any backend fixes needed
- [ ] Plan production deployment

### Phase 4 (Future)

- [ ] Implement `recalculate_delivery_counts!`
- [ ] Update SendGrid webhook handler
- [ ] Add bulk deliveries endpoint
- [ ] Performance optimizations

---

## Contact & Questions

**Frontend Team:**

- Slack: `#voxxy-frontend-dev`
- Lead: Courtney + Claude Code

**Backend Team:**

- Slack: `#voxxy-backend-dev`
- Lead: [Your backend team lead]

**For This Update:**

- Questions about frontend changes → `#voxxy-frontend-dev`
- Questions about Position 1 behavior → `#voxxy-backend-dev`
- Integration issues → Both channels

---

## Related Documentation

### Frontend Docs

1. **[INVITATION_UNIFICATION_FRONTEND_UPDATE.md](./INVITATION_UNIFICATION_FRONTEND_UPDATE.md)**
   - Complete details of frontend changes
   - Before/after code comparisons
   - Testing guide

2. **[EMAIL_AUDIT_LOG_PHASES_1-3_TESTING.md](./EMAIL_AUDIT_LOG_PHASES_1-3_TESTING.md)**
   - 12 test scenarios for Phases 1-3
   - Includes invitation testing

3. **[PHASES_1-3_SUMMARY.md](./PHASES_1-3_SUMMARY.md)**
   - Overview of Phases 1-3 integration
   - Updated to reflect invitation unification

### Backend Docs (Your Side)

- Migration that created Position 1 for all events
- `InvitationVariableResolver` implementation
- `EventInvitationsController` updates for unified system
- SendGrid webhook handler

---

## Appendix: Data Flow Diagrams

### Before (Virtual Email System)

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend Flow (OLD)                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. GET /scheduled_emails        → Returns 17 emails        │
│     (includes Position 1, but unused)                       │
│                                                             │
│  2. GET /invitations              → Returns invitation data │
│                                                             │
│  3. Frontend creates virtual email:                         │
│     {                                                       │
│       id: -1,                                               │
│       isInvitationAnnouncement: true,                       │
│       name: "Event Announcement (Invitation...)",           │
│       recipient_count: invitations.meta.sent_count,         │
│       // ... mapped from invitation data                    │
│     }                                                       │
│                                                             │
│  4. Inject virtual email into list → 18 total rows          │
│                                                             │
│  5. Click recipients:                                       │
│     - Position 1 → Opens old modal (not audit log)          │
│     - Virtual email → Opens old modal                       │
│     - Other emails → Opens audit log ✓                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### After (Position 1 Real)

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend Flow (NEW)                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. GET /scheduled_emails        → Returns 17 emails        │
│     (Position 1 is REAL and used for sending)               │
│                                                             │
│  2. Display all 17 emails        → 17 total rows            │
│     (Position 1 treated like any other email)               │
│                                                             │
│  3. Click recipients:                                       │
│     - Position 1 → Opens audit log ✓                        │
│     - All emails → Opens audit log ✓                        │
│                                                             │
│  4. Edit Position 1:                                        │
│     - Click to edit subject/body ✓                          │
│     - PUT /scheduled_emails/1 ✓                             │
│     - Next invitations use new template ✓                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Backend Flow (Unchanged by This Update)

```
┌─────────────────────────────────────────────────────────────┐
│ Backend Flow (After Phases 1-3)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sending Invitations:                                       │
│  1. EventInvitationsController#send_batch                   │
│  2. Find Position 1 template                                │
│  3. Resolve variables via InvitationVariableResolver        │
│  4. Send to SendGrid                                        │
│  5. Create EmailDelivery records                            │
│     - scheduled_email_id: 1 (Position 1)                    │
│     - registration_id: <vendor_registration>                │
│     - recipient_name: <from registration>                   │
│     - vendor_category: <from registration>                  │
│     - status: 'sent'                                        │
│                                                             │
│  SendGrid Webhook:                                          │
│  1. Receives delivery/bounce/drop events                    │
│  2. Updates email_delivery.status                           │
│  3. (Phase 4) Recalculate scheduled_email.delivery_counts   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Summary:** Frontend removed virtual email workaround. Position 1 is now treated as a real scheduled email throughout the UI. No backend changes needed - your Phases 1-3 work is perfect! 🎉

**Status:** ✅ Ready for Backend Review
**Last Updated:** February 28, 2026
**Prepared By:** Frontend Team (Claude Code)
