# Email System - Quick Reference Guide

## File Locations (All in src/)

### Core Components
- `components/producer/Email/EmailAutomationTab.tsx` - Main email management UI
- `components/producer/Email/EmailEditorPage.tsx` - Full-screen email editor
- `components/producer/Email/EmailTable.tsx` & `EmailRow.tsx` - Email list display
- `components/shared/EventEmailPreviewModal.tsx` - Email preview modal

### Supporting Components
- `components/producer/Email/SaveAsTemplateDialog.tsx` - Save as template
- `components/producer/Email/RecipientsModal.tsx` - View email recipients
- `components/producer/Email/DeliveryStatusBadge.tsx` - Status badge display

### Utilities
- `utils/emailVariables.ts` - Variables, validation, conversion (80+ functions)
- `types/email.ts` - All TypeScript interfaces

### API Service
- `services/api.ts` - Email API endpoints (25+ methods)

### Pages
- `pages/EmailTemplatesPage.tsx` - Template library
- `pages/EmailTestingPage.tsx` - Admin testing

---

## Critical Functions

### Email Content Conversion
```typescript
// Load from backend for editing
backendToFrontend(html: string) → plain text with [variables]

// Save to backend for storage
frontendToBackend(text: string) → HTML with [variables]
```

### Variable Validation
```typescript
validateEmailContent(subject: string, body: string)
  → { unknownVariables, unclosedBrackets, errors }

insertVariableAtCursor(element: HTMLTextAreaElement, variable: string)
  → new text with variable inserted at cursor
```

### Timezone Handling
```typescript
getEightAmLocalAsUTC() → UTC time for 8 AM in user timezone
getTimezoneInfo() → { timezone, eightAmLocal }
```

---

## API Endpoints Quick Lookup

### Scheduled Emails
```
GET  /events/{slug}/scheduled_emails           → All emails for event
GET  /events/{slug}/scheduled_emails/{id}      → Single email
POST /events/{slug}/scheduled_emails/generate  → Generate from template
PATCH /events/{slug}/scheduled_emails/{id}     → Update email
POST /events/{slug}/scheduled_emails/{id}/send_now   → Send immediately
POST /events/{slug}/scheduled_emails/{id}/retry_failed → Retry bounces
POST /events/{slug}/scheduled_emails/{id}/pause      → Pause email
POST /events/{slug}/scheduled_emails/{id}/resume     → Resume email
POST /events/{slug}/scheduled_emails/{id}/preview    → Preview with variables
GET  /events/{slug}/scheduled_emails/{id}/recipients → Get recipients list
POST /events/{slug}/scheduled_emails/save_as_template → Save as template
DELETE /events/{slug}/scheduled_emails/{id}    → Delete email
```

### Email Templates
```
GET  /email_campaign_templates              → All templates
GET  /email_campaign_templates/{id}         → Template details
POST /email_campaign_templates              → Create template
POST /email_campaign_templates/{id}/clone   → Clone template
PATCH /email_campaign_templates/{id}        → Update template
DELETE /email_campaign_templates/{id}       → Delete template
```

### Email Deliveries
```
GET  /scheduled_emails/{id}/email_deliveries        → All deliveries
GET  /events/{slug}/email_deliveries/stats          → Event stats
GET  /scheduled_emails/{id}/delivery_stats          → Email stats
POST /email_deliveries/{id}/retry                   → Retry delivery
GET  /registrations/{id}/email_history              → Registration history
GET  /events/{slug}/invitations/{id}/email_history  → Invitation history
```

---

## Variable Types (30+)

### Event Variables
[eventName] [eventDate] [eventTime] [eventLocation] [eventVenue] 
[eventDescription] [applicationDeadline] [paymentDueDate] [boothPrice] [ageRestriction]

### Organization Variables
[organizationName] [organizationEmail]

### Vendor Variables
[greetingName] [firstName] [lastName] [fullName] [businessName] [email]
[vendorCategory] [categoryList] [boothNumber] [applicationDate]
[installDate] [installTime] [installStartTime] [installEndTime]

### Link Variables
[paymentLink] [eventLink] [invitationLink] [bulletinLink] [dashboardLink] [unsubscribeLink]

---

## Email Statuses
- `scheduled` - Waiting to send
- `paused` - Manually paused
- `sent` - Sent to SendGrid (may not be delivered yet)
- `failed` - Failed to send
- `cancelled` - Deleted by user

## Delivery Statuses
- `pending` - Not sent yet
- `queued` - In SendGrid queue
- `sent` - Sent by SendGrid
- `delivered` - Delivered to inbox
- `bounced` - Hard or soft bounce
- `dropped` - Dropped by SendGrid
- `unsubscribed` - Recipient unsubscribed

---

## Trigger Types (10)
```
days_before_event              → X days before event
days_after_event               → X days after event
days_before_deadline           → X days before app deadline
days_after_deadline            → X days after app deadline
on_application_open            → When event created
on_application_submit          → When vendor submits app
on_approval                    → When vendor approved
on_event_date                  → On event date
days_before_payment_deadline   → X days before payment due
on_payment_deadline            → On payment deadline
```

---

## Data Models

### ScheduledEmail (Event Instance)
```
id, event_id, name, subject_template, body_template
trigger_type, trigger_value, trigger_time
scheduled_for, filter_criteria, status, sent_at, recipient_count
error_message, created_at, updated_at
[optional] latest_delivery, email_deliveries, delivery_status, delivery_counts
[frontend-only] isInvitationAnnouncement, isPreviewOnly
```

### EmailDelivery (Tracking Record)
```
id, scheduled_email_id, event_id, registration_id
sendgrid_message_id, recipient_email
status, bounce_type, bounce_reason, drop_reason
sent_at, delivered_at, bounced_at, dropped_at, unsubscribed_at
retry_count, next_retry_at, max_retries
```

### FilterCriteria (Recipient Targeting)
```
status: RegistrationStatus[]        // pending, approved, confirmed, etc.
exclude_status: RegistrationStatus[]
vendor_category: string[]           // Food, Art, Music, etc.
location_city: string[]
location_state: string[]
tags: string[]
payment_status: PaymentStatus[]     // future
```

---

## Common Workflows

### Edit Email
1. Click "Edit" in email table
2. EmailEditorPage opens (full screen)
3. Loads email: `backendToFrontend()` converts HTML → plain text
4. User edits subject, body, trigger settings
5. Validation checks: unknown variables, unclosed brackets
6. Click Save: `frontendToBackend()` converts plain text → HTML
7. API call: `scheduledEmailsApi.update()`
8. Table reloads with updated email

### Preview Email
1. Click "Preview" in email table
2. EventEmailPreviewModal opens
3. If registrations exist:
   - Call `scheduledEmailsApi.preview()`
   - Backend resolves [variables] → actual values
   - Show resolved subject, body, recipient info
4. If no registrations:
   - Show template with [variables] unresolved
   - Message: "No vendor applications found yet"

### Send Email
1. Click "Send Now" on scheduled email
2. Confirmation dialog appears
3. Call `scheduledEmailsApi.sendNow()`
4. Backend filters recipients and queues with SendGrid
5. Status updates to "sent"
6. SendGrid webhooks track delivery (may take minutes)

---

## Key Implementation Details

### HTML/Text Conversion
- Backend stores as: HTML `<p>[eventName]</p>`
- Frontend edits as: Plain text `[eventName]`
- Load: Strip HTML, convert {{old}} → [new] (backwards compat)
- Save: Add HTML, keep [bracket] format (backend expects it)

### Variable Format
- Current: `[bracket]` format (frontend UI, storage, backend)
- Legacy: `{{mustache}}` format (old emails, auto-converted)
- Backwards compatible: Old emails auto-convert on load

### Timezone Handling
- All emails send at 8:00 AM in user's timezone
- Converted to UTC for storage in `trigger_time`
- Preview date calculated using date-fns with timezone awareness

### Invitation Email
- Virtual email created by EmailAutomationTab (ID = -1)
- Not a real backend object, reconstructed from invitationsApi
- Special handling for preview (calls eventInvitationsApi.previewEmail)
- Cannot be edited, only previewed and viewed

---

## Testing Tips

1. **Create test vendor** first (to enable preview with resolved variables)
2. **Use preview modal extensively** before final send
3. **Check delivery stats** after sending (may take minutes to update)
4. **Save successful emails as templates** for reuse
5. **Test with test environment** before production

---

## Potential Gotchas

- Preview shows template with [variables] if no registrations exist
- Cannot edit email after it's been sent (status = 'sent')
- Retry only works for soft bounces (temporary failures)
- Delivery stats may not be immediately available (SendGrid webhook delay)
- Changing trigger doesn't update already-sent emails
- No WYSIWYG editor available (plain text only)

---

## Files to Modify for Changes

| Feature | File |
|---------|------|
| Add email variable | `utils/emailVariables.ts` + `types/email.ts` |
| Change trigger type | `types/email.ts` TRIGGER_TYPES |
| Modify preview modal | `components/shared/EventEmailPreviewModal.tsx` |
| Update email editor | `components/producer/Email/EmailEditorPage.tsx` |
| Change table display | `components/producer/Email/EmailRow.tsx` |
| Add API endpoint | `services/api.ts` |
| Add status type | `types/email.ts` ScheduledEmailStatus |
| Change validation | `utils/emailVariables.ts` validateEmailContent() |

---

Generated: 2026-02-21
