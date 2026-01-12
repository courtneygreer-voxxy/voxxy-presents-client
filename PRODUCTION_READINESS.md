# Production Readiness: Beta to Public Release

**Document Version:** 1.0
**Last Updated:** January 11, 2026
**Status:** Planning Phase

---

## Executive Summary

This document outlines the remaining work required to move VOXXY Presents from beta to public production release. The work is categorized by complexity, required engineering effort (frontend vs backend), and dependencies.

**Total Estimated Items:** 15 major features + bug fixes
**Backend Heavy:** 8 items
**Frontend Heavy:** 4 items
**Full Stack:** 3 items

---

## 1. Category Change Request System

### Overview
Enable vendors to accept/reject category changes initiated by producers, with full audit trail and communication flow.

### Complexity
**HIGH** - New feature requiring full workflow

### Engineering Breakdown
- **Backend:** 70%
  - New database tables: `category_change_requests` (id, vendor_application_id, old_category, new_category, status, producer_notes, vendor_notes, timestamps)
  - API endpoints:
    - `POST /api/v1/presents/applications/:id/request_category_change`
    - `GET /api/v1/presents/category_change_requests/:token` (vendor-facing)
    - `PATCH /api/v1/presents/category_change_requests/:id/respond` (vendor accept/reject)
    - `PATCH /api/v1/presents/category_change_requests/:id/finalize` (producer final decision)
  - Email trigger integration with SendGrid
  - Secure token generation for vendor portal access

- **Frontend:** 30%
  - Producer UI: Category change request form in applicant management
  - Vendor UI: New locked-down portal page (similar to event portal structure)
  - Request status display in producer dashboard
  - Toast notifications for status changes

### Affected Areas
- Vendor Applications API
- Email system (new system email template)
- Producer Dashboard > Event Command Center > Applicants Tab
- New: Vendor Category Change Portal (public-facing, token-authenticated)

### Dependencies
- Event Portal foundation (see item #6)
- Email system refactor (see item #2)

### Estimated Effort
**2-3 weeks** (1 backend engineer + 1 frontend engineer)

---

## 2. Email Styling Overhaul: Plain Text Only

### Overview
Strip all HTML styling, emojis, background colors, and buttons from emails. Focus on plain text for improved deliverability.

### Complexity
**MEDIUM** - Refactoring existing templates

### Engineering Breakdown
- **Backend:** 60%
  - Audit all email templates in `email_template_items` table
  - Convert all `body_template` HTML to plain text
  - Remove `<button>` elements, replace with plain URLs
  - Update email rendering pipeline to strip HTML if still present
  - SendGrid template updates (if using SendGrid templates)

- **Frontend:** 40%
  - Update email preview components to show plain text
  - Update email composer/editor to plain text only (no WYSIWYG)
  - MailTemplatesPage email item display updates

### Affected Areas
- All email templates (system + user-created)
- Email preview in Command Center > Mail tab
- Email composer/editor
- SendGrid integration

### Current Email Templates to Update
1. Application confirmation
2. Payment reminders
3. Pre-event reminders
4. Waitlist notifications
5. Category change requests (new)
6. Event cancellation (new)
7. Event details changed (new)

### Estimated Effort
**1-2 weeks** (1 backend engineer + 1 frontend engineer working in parallel)

---

## 3. System Emails: Missing Critical Triggers

### Overview
Implement missing automated system emails that fire on specific events.

### Complexity
**MEDIUM-HIGH** - Multiple new email flows

### Engineering Breakdown
- **Backend:** 80%
  - **Event Cancellation Email:**
    - Trigger: Event status changes to 'cancelled'
    - Recipients: All applicants (accepted, waitlisted, pending)
    - Template: Plain text notification

  - **Event Details Changed Email:**
    - Trigger: Key fields updated (date, time, venue, location)
    - Recipients: All accepted vendors
    - Link: Event Portal (see item #6)
    - Challenge: Define "key details" vs minor updates

  - **Waitlist Movement - No Payment:**
    - Trigger: Time-based (payment_deadline passes + vendor not marked 'paid')
    - Recipients: Accepted vendors who didn't pay
    - Action: Status changes to 'waitlisted', email sent
    - Note: This is a **scheduled job**, not an immediate trigger

  - **Waitlist Movement - Manual:**
    - Trigger: Producer manually moves vendor to waitlist
    - Recipients: Vendor being waitlisted
    - Current bug: Wrong text, needs update

- **Frontend:** 20%
  - Display system emails in MailTemplatesPage (read-only)
  - Show trigger conditions and recipient filters
  - Status indicators for scheduled emails

### Technical Requirements
- **Background job scheduler** (cron/sidekiq/delayed_job) for time-based triggers
- Database migrations for email tracking
- Email queue management (retries, failures)

### Affected Areas
- Email system core
- Event management API
- Vendor applications API
- Background jobs infrastructure
- MailTemplatesPage (display system emails)

### Estimated Effort
**3-4 weeks** (1 backend engineer, requires scheduled jobs setup)

---

## 4. Event Portal: Vendor Self-Service Hub

### Overview
Build locked-down vendor portal where accepted vendors can view event details, payment status, install times, and respond to category change requests.

### Complexity
**HIGH** - New major feature, security-critical

### Engineering Breakdown
- **Backend:** 50%
  - Token-based authentication for vendors (no login required)
  - API endpoints:
    - `GET /api/v1/presents/vendor_portal/:token` (validate token, return data)
    - `GET /api/v1/presents/vendor_portal/:token/details`
  - Token generation on application acceptance
  - Token security: expiration, single-use vs multi-use, revocation

- **Frontend:** 50%
  - New public-facing page: `/vendor-portal/:token`
  - Display sections:
    - Event details (date, time, venue, updated info highlighted)
    - Payment status (amount due, deadline, paid status)
    - Install time/instructions
    - Category change requests (if pending)
  - Responsive design, works on mobile
  - Error states: expired token, invalid token

### Security Considerations
- Token must be cryptographically secure
- Rate limiting on portal access
- No sensitive data in URLs
- HTTPS only

### Affected Areas
- New: Vendor Portal (public route)
- Vendor applications (token generation)
- Category change system (item #1)
- Event details changed emails (item #3)

### Dependencies
- Must be completed before event details changed emails can be sent

### Estimated Effort
**2-3 weeks** (1 backend engineer + 1 frontend engineer)

---

## 5. Contact Upload: First-Time User Experience Bug

### Overview
Fix bug preventing new users from uploading CSV contacts when they have zero contacts.

### Complexity
**LOW** - Bug fix

### Engineering Breakdown
- **Backend:** 20%
  - Review CSV upload API endpoint
  - Ensure it handles empty contact list state

- **Frontend:** 80%
  - Debug CSVUploadModal rendering logic
  - Reproduce issue: New account → Network tab → Upload CSV
  - Likely issue: Conditional rendering based on contact count
  - Fix: Always show CSV upload option regardless of contact count

### Affected Areas
- Network tab
- CSVUploadModal component
- Contact upload flow

### Current Files
- `src/components/producer/Network/NetworkPage.tsx`
- `src/components/producer/Network/CSVUploadModal.tsx`

### Estimated Effort
**2-3 days** (1 frontend engineer)

---

## 6. CSV Upload: Email-Only Requirement

### Overview
Remove name requirement from CSV uploads. Email should be the only required field.

### Complexity
**LOW** - Configuration change

### Engineering Breakdown
- **Backend:** 60%
  - Update `vendorContactsApi.bulkImport` validation
  - Change required fields from `['name', 'email']` to `['email']`
  - Handle missing name gracefully (use email prefix or "No Name")

- **Frontend:** 40%
  - Update CSVUploadModal required headers check
  - Update CSV template generator
  - Update UI messaging about required fields

### Affected Areas
- CSV upload validation (backend)
- CSVUploadModal component (frontend)
- CSV template generator

### Current Code
```typescript
// src/components/producer/Network/CSVUploadModal.tsx:55
const requiredHeaders = ['name', 'email']; // Change to ['email']
```

### Estimated Effort
**1-2 days** (1 backend engineer + 1 frontend engineer)

---

## 7. CSV Upload: Custom Column Mapping

### Overview
Allow users to map their CSV columns to VOXXY fields during upload.

### Complexity
**MEDIUM** - New feature, deferred to post-launch

### Engineering Breakdown
- **Backend:** 30%
  - Accept column mapping in upload API
  - Validate mapped columns

- **Frontend:** 70%
  - New UI step in upload flow: "Map Your Columns"
  - Dropdown for each detected CSV header → VOXXY field
  - Preview mapped data before import
  - Save mapping for future uploads (optional)

### Priority
**DEFERRED** - Not required for public launch. Mark as "Phase 2" feature.

### Estimated Effort
**1 week** (when prioritized)

---

## 8. Email Timing: Default to 6:00 AM Producer Local Time

### Overview
Remove time field from email triggers. All emails fire at 6:00 AM in producer's local timezone.

### Complexity
**MEDIUM** - Timezone handling

### Engineering Breakdown
- **Backend:** 90%
  - Add `timezone` field to producer/organization settings
  - Update email scheduling logic to use producer timezone
  - Convert all email trigger times to 6:00 AM in producer's TZ
  - Database migration: Remove `trigger_time` field from `email_template_items`
  - Scheduled jobs must handle timezone conversions correctly

- **Frontend:** 10%
  - Add timezone selector in Settings page
  - Remove time picker from email composer
  - Display emails as "6:00 AM your local time" in UI

### Technical Considerations
- Use `ActiveSupport::TimeZone` (Rails) or similar library
- Handle daylight saving time transitions
- Default timezone if not set (UTC or event location TZ)

### Affected Areas
- Email scheduling system
- Producer settings
- Email template editor
- Background jobs

### Estimated Effort
**1-2 weeks** (1 backend engineer)

---

## 9. Email Pause Feature Bug

### Overview
Fix bug where pausing event emails causes loop or no response.

### Complexity
**LOW-MEDIUM** - Bug fix, needs debugging

### Engineering Breakdown
- **Backend:** 50%
  - Review pause endpoint logic
  - Check for race conditions or infinite loops
  - Ensure proper state transitions

- **Frontend:** 50%
  - Debug EmailAutomationTab pause button
  - Check for infinite re-render loops
  - Verify API call handling

### Current Location
- `src/components/producer/Email/EmailAutomationTab.tsx`
- Backend: Email pause endpoint (needs investigation)

### Debugging Steps
1. Reproduce bug in dev environment
2. Check browser console for errors
3. Check network tab for API failures
4. Review backend logs for errors

### Estimated Effort
**3-5 days** (1 backend + 1 frontend engineer to debug and fix)

---

## 10. Location Field Consolidation

### Overview
Merge venue and location into single field with city-level precision.

### Complexity
**MEDIUM-HIGH** - Data migration + email template updates

### Engineering Breakdown
- **Backend:** 60%
  - Database migration: Consolidate `venue` + `location` → `venue_full`
  - Update Google Places API integration for city-level results
  - Update all API responses to use new field
  - Migrate existing event data

- **Frontend:** 40%
  - Remove separate location field from event forms
  - Update venue autocomplete to show city-level results
  - Fix venue search to return "Brooklyn, NY" not "New York, NY"
  - Update all event display components

### Email Template Impact
- **HIGH** - All email templates using `{{location}}` or `{{venue}}` must be updated
- Need template variable migration script

### Affected Areas
- Event creation wizard
- Event settings
- Venue autocomplete components
- All email templates
- Event display across application

### Files to Update
- `src/components/producer/CreateEventWizard/VenueAutocomplete.tsx`
- `src/components/producer/CreateEventWizard/LocationAutocomplete.tsx` (remove)
- All email templates

### Estimated Effort
**2 weeks** (1 backend engineer + 1 frontend engineer)

---

## 11. Email Creation & Editing Screens

### Overview
Build full email composer interface for producers to create custom email flows.

### Complexity
**HIGH** - Major new feature

### Engineering Breakdown
- **Backend:** 40%
  - API endpoints:
    - `POST /api/v1/presents/email_templates` (create template)
    - `PATCH /api/v1/presents/email_templates/:id` (update)
    - `DELETE /api/v1/presents/email_templates/:id` (delete)
    - `POST /api/v1/presents/email_templates/:id/items` (add email to sequence)
    - `PATCH /api/v1/presents/email_template_items/:id` (edit individual email)
  - Validation for trigger conditions
  - Template variable validation

- **Frontend:** 60%
  - Full-screen email editor (plain text)
  - Template variable picker ({{event_name}}, {{vendor_name}}, etc.)
  - Trigger condition builder:
    - Trigger type dropdown (before_event, after_deadline, etc.)
    - Days offset input
    - Recipient filter builder
  - Email sequence reordering (drag & drop)
  - Preview mode
  - Save/publish workflow

### UX Design Needs
- Wireframes for email editor
- Template variable documentation
- Trigger condition options

### Affected Areas
- MailTemplatesPage (add "Create" and "Edit" modes)
- New: EmailEditorPage (full screen)
- Email templates API

### Estimated Effort
**3-4 weeks** (1 backend engineer + 1 frontend engineer)

---

## 12. SendGrid Webhooks: Email Tracking

### Overview
Implement SendGrid webhooks to track email delivery, opens, clicks, bounces, and unsubscribes.

### Complexity
**MEDIUM-HIGH** - Third-party integration

### Engineering Breakdown
- **Backend:** 95%
  - Webhook endpoint: `POST /api/v1/webhooks/sendgrid`
  - Verify webhook signature (security)
  - Handle webhook events:
    - `delivered` - Update email status
    - `bounce` - Mark contact as bounced
    - `dropped` - Mark email failed
    - `open` - Track open rate (optional for analytics)
    - `click` - Track click rate (optional)
    - `unsubscribe` - Update contact unsubscribe status
    - `spam_report` - Flag contact
  - Database tables:
    - `email_events` (id, email_id, event_type, sendgrid_event_data, timestamp)
    - Add `unsubscribed` field to `vendor_contacts`
    - Add `email_bounced` field to `vendor_contacts`
  - Background job for processing webhook events (async)

- **Frontend:** 5%
  - Display email delivery status in producer dashboard
  - Show unsubscribed contacts in Network tab
  - Filter by delivery status

### SendGrid Configuration
- Enable event webhooks in SendGrid dashboard
- Configure webhook URL
- Select events to track

### Affected Areas
- Email system core
- Network contacts table
- SendGrid integration
- Background jobs

### Estimated Effort
**2-3 weeks** (1 backend engineer)

---

## 13. Unsubscribe Management: Three-Tier System

### Overview
Build unsubscribe preference page with three levels: event-only, producer-wide, or all VOXXY.

### Complexity
**MEDIUM** - New feature with legal implications

### Engineering Breakdown
- **Backend:** 60%
  - Database schema:
    - Add `unsubscribe_level` to `vendor_contacts` (values: 'none', 'event', 'producer', 'global')
    - Add `unsubscribed_events` (array/join table for event-specific unsubs)
  - API endpoints:
    - `GET /api/v1/unsubscribe/:token` (load preferences)
    - `POST /api/v1/unsubscribe/:token` (update preferences)
  - Token generation for unsubscribe links
  - Update email filtering to respect unsubscribe levels

- **Frontend:** 40%
  - New public page: `/unsubscribe/:token`
  - Three radio options:
    - "Unsubscribe from this event only"
    - "Unsubscribe from all events by [Producer Name]"
    - "Unsubscribe from all VOXXY communications"
  - Confirmation message
  - Unsubscribed contacts display in Network tab

### Legal Considerations
- CAN-SPAM compliance
- Unsubscribe must be honored immediately
- Audit trail for unsubscribe events

### Affected Areas
- New: Unsubscribe preference page (public)
- Email filtering logic (must skip unsubscribed contacts)
- Network contacts table
- Email footer (unsubscribe link)

### Estimated Effort
**2 weeks** (1 backend engineer + 1 frontend engineer)

---

## 14. Email Filtering: Skip Logic Audit

### Overview
Ensure email filters correctly skip contacts based on status, payment, and unsubscribe preferences.

### Complexity
**MEDIUM** - Logic audit + testing

### Engineering Breakdown
- **Backend:** 90%
  - Document all email skip conditions:
    - Unsubscribed contacts (any level that applies)
    - Contacts marked as bounced/invalid
    - Payment reminder: Skip if `paid = true`
    - Pre-event reminder: Skip if `status != 'accepted'`
    - Waitlist emails: Only send if `status = 'waitlisted'`
  - Write comprehensive test suite for skip logic
  - Review all email template filter criteria
  - Add skip reason logging for debugging

- **Frontend:** 10%
  - Display skip reasons in email logs (if visible to producer)

### Testing Requirements
- Unit tests for each filter condition
- Integration tests for email sending
- Manual testing with real data

### Affected Areas
- Email scheduling system
- All email templates (filter_criteria)
- Email event logs

### Estimated Effort
**1-2 weeks** (1 backend engineer + QA)

---

## 15. Network List-Saving: Wire Up to Event Creation Wizard

### Overview
Enable producers to import saved contact lists into event creation wizard.

### Complexity
**LOW-MEDIUM** - UI integration

### Engineering Breakdown
- **Backend:** 30%
  - API endpoint to fetch saved lists
  - Return contact IDs for selected list

- **Frontend:** 70%
  - Add "Import from List" button in event creation wizard
  - Modal to select saved list
  - Pre-populate recipient selection with list contacts
  - Handle list updates (contact added/removed from list)

### Affected Areas
- CreateEventWizard
- Network saved lists
- Email automation setup in wizard

### Current Status
- List-saving UI exists but not wired to wizard

### Estimated Effort
**1 week** (1 frontend engineer)

---

## Priority Matrix

### Phase 1: Critical Blockers (Must Have for Launch)
**Timeline: 8-10 weeks**

1. **Email Styling Overhaul** (2 weeks) - Affects deliverability
2. **Email Timing Fix** (2 weeks) - Critical UX issue
3. **Event Portal** (3 weeks) - Dependency for other features
4. **System Emails** (4 weeks) - Core functionality
5. **Contact Upload Bug** (3 days) - Onboarding blocker
6. **CSV Email-Only Requirement** (2 days) - User expectation
7. **Email Pause Bug** (5 days) - Broken feature
8. **SendGrid Webhooks** (3 weeks) - Legal/compliance (unsubscribes)
9. **Unsubscribe Management** (2 weeks) - Legal requirement

### Phase 2: Important (Should Have for Launch)
**Timeline: 6-8 weeks**

10. **Category Change System** (3 weeks) - Important workflow
11. **Location Field Consolidation** (2 weeks) - Data quality
12. **Email Skip Logic Audit** (2 weeks) - Quality assurance
13. **Network List-Saving** (1 week) - UX improvement

### Phase 3: Post-Launch Enhancement (Nice to Have)
**Timeline: 5-6 weeks**

14. **Email Creation Screens** (4 weeks) - Can use API directly for now
15. **CSV Custom Column Mapping** (1 week) - Future enhancement

---

## Resource Requirements

### Backend Engineers
- **2 full-time engineers** for 10-12 weeks
- Focus areas:
  - Email system (50% of work)
  - Event portal & security
  - SendGrid integration
  - Database migrations

### Frontend Engineers
- **2 full-time engineers** for 10-12 weeks
- Focus areas:
  - Event portal UI
  - Email editor
  - Bug fixes
  - Unsubscribe pages

### QA/Testing
- **1 QA engineer** for final 4 weeks
- Focus: Email flows, edge cases, security testing

### DevOps
- **Part-time (20%)** throughout
- Focus: SendGrid configuration, scheduled jobs, webhook security

---

## Risk Assessment

### High Risk
1. **Email Deliverability** - Plain text refactor must not break existing flows
2. **Timezone Handling** - Complex, error-prone, affects core feature
3. **SendGrid Webhooks** - Third-party dependency, security critical
4. **Event Portal Security** - Token-based auth must be bulletproof

### Medium Risk
1. **Location Field Migration** - Data migration can cause data loss
2. **Email Skip Logic** - Complex conditionals, easy to miss edge cases
3. **Category Change System** - New workflow, needs thorough testing

### Low Risk
1. Bug fixes (items #5, #6, #9)
2. UI enhancements (item #15)

---

## Success Metrics

### Pre-Launch
- [ ] All Phase 1 items completed and tested
- [ ] Email deliverability rate >95%
- [ ] Zero critical bugs in production
- [ ] Legal compliance: CAN-SPAM (unsubscribe working)

### Post-Launch (30 days)
- Monitor email bounce rate (<5%)
- Monitor unsubscribe rate (<2%)
- Event portal adoption (>80% of vendors access portal)
- Producer satisfaction with email timing

---

## Technical Debt & Future Considerations

### Items to Address Post-Launch
1. Email analytics dashboard (open rates, click rates)
2. A/B testing for email templates
3. Advanced email editor (rich text, drag-drop components)
4. CSV column mapping (item #7)
5. Bulk category changes (batch processing)
6. Event portal: Vendor chat with producer
7. Mobile app for vendor portal

### Infrastructure Improvements Needed
1. Background job monitoring (Sidekiq UI, error tracking)
2. Email queue management (Redis/database)
3. Scheduled job reliability (cron vs delayed_job)
4. Webhook retry logic (SendGrid events)
5. Database indexing for email queries

---

## Open Questions for Engineering Lead

1. **Email Infrastructure:** Are we using SendGrid templates or inline HTML/text? This affects item #2.
2. **Background Jobs:** What job scheduler is in place? (Sidekiq, Delayed Job, cron) - Critical for item #3.
3. **Timezone Storage:** How are we storing producer timezones? (PostgreSQL timezone type, string, UTC offset)
4. **Token Security:** What's our token generation strategy? (JWT, random hash, UUID)
5. **Database Migrations:** What's the rollback plan for location field consolidation (item #10)?
6. **Testing Coverage:** Current test coverage for email system?
7. **Deployment Strategy:** Can we deploy Phase 1 incrementally or need big-bang release?
8. **Feature Flags:** Do we have feature flag system for gradual rollout?

---

## Appendix: Current System State

### Working Features
- Event creation wizard
- Vendor application forms
- Network contact management (manual add, CSV upload mostly working)
- Email automation (with bugs)
- Producer dashboard navigation
- Settings page

### Known Bugs
- CSV upload for first-time users (item #5)
- Email pause loop (item #9)
- Location resolution too broad (item #10)
- Waitlist email wrong text (item #3)
- CSV name requirement (item #6)

### Missing Features
- Event portal (item #4)
- Category change system (item #1)
- System emails (item #3)
- SendGrid webhooks (item #12)
- Unsubscribe management (item #13)
- Email editor (item #11)

---

**Document Prepared By:** Claude Code
**For Review By:** Engineering Lead, Product Team
**Next Steps:** Review, prioritize, assign resources, set timeline
