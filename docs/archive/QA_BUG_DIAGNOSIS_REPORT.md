# QA Bug Diagnosis Report

**Date**: March 4, 2026
**Branch**: develop
**Focus Area**: Create event, go live, email editing, application actions, email send filters
**Goal**: Identify root causes, classify complexity (frontend-only vs backend required), find systemic themes

---

## Executive Summary

**20 bugs investigated. 3 systemic root causes drive 60% of them.**

| Complexity             | Count | Bugs                                                                                                                                                                                   |
| ---------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Only**      | 12    | Debug panel, location field, portal link, column sorting, send now loading, status labels, audit scroll, editor links, email editor tags, invitation tags, email columns, footer links |
| **Backend Required**   | 5     | Email filters, unsubscribe not working, resubscribe dead link, category links, old logo                                                                                                |
| **Both (coordinated)** | 3     | Email history disappearing, footer duplication, audit log unsubscribe data                                                                                                             |

---

## Systemic Root Causes (The Big Picture)

### Theme 1: Dual Unsubscribe Systems Are Out of Sync

**Drives bugs**: Unsubscribe not working, audit log missing unsubscribers, resubscribe dead link

The system has TWO unsubscribe mechanisms that don't talk to each other:

- **Old**: `registration.email_unsubscribed` boolean flag
- **New**: `EmailUnsubscribe` table with scoped records (event/organization/global)

When a user unsubscribes via the UI, only the new `EmailUnsubscribe` record is created. But email sending code (`EmailSenderService`, `RegistrationEmailService`) only checks the old boolean flag. The audit log only reads `EmailDelivery.unsubscribed_at` which is only set by SendGrid webhooks, not user-initiated unsubscribes.

**Recommended fix**: Unify on one system. Either always set the `email_unsubscribed` flag (quick fix) or migrate all checking code to use `EmailUnsubscribe` (proper fix).

### Theme 2: Filter Logic Is Duplicated and Inconsistent

**Drives bugs**: Email filters wrong recipients, recipient count mismatch, payment_status never checked

`RecipientFilterService` is the correct single source of truth for filtering. But `ScheduledEmail#calculate_current_recipient_count`, the `recipients` controller action, and `unsubscribed_count` all have **copy-pasted inline filter logic** that:

- Reads `"status"` (singular) while seed data writes `"statuses"` (plural)
- Never filters by `payment_status`
- Goes out of sync every time a new filter dimension is added

**Recommended fix**: Delete all inline filtering. Make everything delegate to `RecipientFilterService`.

### Theme 3: Email Editor Has No Context Awareness

**Drives bugs**: Wrong tags shown for invitation emails, obsolete tags in editor, footer duplication, dead links in editor

The email editor renders the same UI for all email types regardless of context. Invitation emails (sent to contacts who haven't applied) show vendor-specific variables like `[vendorCategory]` and `[boothNumber]` that can't resolve. The footer is embedded in both the template body AND hardcoded in the editor UI. Variable tags haven't been audited against what the backend actually resolves.

**Recommended fix**: Add `trigger_type` awareness to the editor. Filter variables by email context. Strip the hardcoded footer and rely on the template body footer only.

---

## P0 Bugs (Critical)

### P0-1: Email Filters — Wrong Recipients / Incorrect Count

**Complexity**: BACKEND
**Root Cause**: Two bugs compound:

1. **Key mismatch**: Seed data stores `filter_criteria: { "statuses": [...] }` (plural) but `ScheduledEmail#calculate_current_recipient_count` reads `filter_criteria["status"]` (singular). Returns `nil`, filter is silently skipped, count includes everyone.

2. **Missing filter**: `calculate_current_recipient_count` never checks `payment_status` at all. So even if status filter worked, paid vendors would still be counted for "payment due" emails.

Note: Actual email _sending_ works correctly because `EmailSenderService` delegates to `RecipientFilterService` which handles both key names and payment_status. The bug is in the **count/preview** path only.

**Files**:

- `voxxy-rails-react/db/seeds/email_campaign_templates.rb` — writes `statuses` (plural)
- `voxxy-rails-react/app/models/scheduled_email.rb:68-79` — reads `status` (singular), no `payment_status`
- `voxxy-rails-react/app/controllers/api/v1/presents/scheduled_emails_controller.rb:287-298` — same issue
- `voxxy-rails-react/app/services/recipient_filter_service.rb:72-100` — correct (handles both keys + payment_status)

**Fix**:

1. Normalize seed data keys to `status` (singular)
2. Data migration to rename `"statuses"` → `"status"` in existing `scheduled_emails.filter_criteria`
3. Replace all inline filtering with `RecipientFilterService` delegation
4. Add `recipient_count` method to `RecipientFilterService` so the model can call it cleanly

---

### P0-2: Unsubscribe Not Working

**Complexity**: BACKEND
**Root Cause**: `UnsubscribeTokenService.process_unsubscribe` only sets `registration.email_unsubscribed = true` for `scope == "global"`. For event/org scoped unsubscribes, the flag is never set. But `EmailSenderService` and `RegistrationEmailService` only check that flag.

**Files**:

- `voxxy-rails-react/app/services/unsubscribe_token_service.rb:73-76` — only updates for global scope
- `voxxy-rails-react/app/services/email_sender_service.rb:88` — only checks `registration.email_unsubscribed?`
- `voxxy-rails-react/app/services/registration_email_service.rb:586,668` — same old-system check

**Fix**: Set `email_unsubscribed = true` on the registration for ALL scopes (event, org, global). This is the quick fix. Long-term: migrate all checking code to query the `EmailUnsubscribe` table.

---

### P0-3: Email Audit Doesn't Show Unsubscribers

**Complexity**: FRONTEND + BACKEND
**Root Cause**: Audit log reads `EmailDelivery.unsubscribed_at`, which is only set by SendGrid webhooks. User-initiated unsubscribes (via Voxxy UI) create `EmailUnsubscribe` records but never update `EmailDelivery`.

**Files**:

- `voxxy-presents-client/src/components/producer/Email/EmailAuditLogOverlay.tsx:99` — reads `delivery.unsubscribed_at`
- `voxxy-rails-react/app/services/unsubscribe_token_service.rb:32-79` — no `EmailDelivery` update

**Fix**: Either (a) `UnsubscribeTokenService` should also update relevant `EmailDelivery` records, or (b) the audit API should cross-reference the `EmailUnsubscribe` table. Option (a) is simpler.

---

### P0-4: Debug Panel Showing for Non-Admin Users

**Complexity**: FRONTEND ONLY
**Root Cause**: Two separate DebugPanel components exist. The inline one (`src/components/producer/DebugPanel.tsx`) is correctly gated by `isAdmin`. The floating global one (`src/components/debug/DebugPanel.tsx`) is rendered in `App.tsx` and only checks environment (production vs staging), NOT user role. On staging, every user sees it — including a role-switching feature.

**Files**:

- `src/components/debug/DebugPanel.tsx:25-36` — only checks `isProduction`, no admin check
- `src/App.tsx:122` — renders `<DebugPanel />` globally

**Fix**: Add `if (!isAdmin) return null;` after the `useAuth()` hook call around line 53 of `src/components/debug/DebugPanel.tsx`.

---

### P0-5: Email Editor — Obsolete Data Tags

**Complexity**: FRONTEND ONLY
**Root Cause**: `EMAIL_VARIABLES` array in `src/utils/emailVariables.ts` hasn't been audited against what the backend `EmailVariableResolver` actually resolves. Contains duplicates (`[categoryPrice]` = alias for `[boothPrice]`) and possibly unsupported variables (`[categoryList]`, `[ageRestriction]`). Also, ghost variables `[dateRange]` and `[categoryPaymentLink]` exist in the preview resolver but NOT in the variable list.

**Files**:

- `src/utils/emailVariables.ts:36-308` — master variable list
- `src/components/producer/Email/EmailEditorPage.tsx:380,404` — ghost variables in preview

**Fix**: Audit against `voxxy-rails-react/app/services/email_variable_resolver.rb`. Remove unsupported variables, remove duplicates, add any missing ones. Create one canonical list.

---

### P0-6: Invitation Email Editor Shows Wrong Tags

**Complexity**: FRONTEND ONLY
**Root Cause**: Both `EmailEditorPage.tsx` and `EditScheduledEmailModal.tsx` render ALL variables from `EMAIL_VARIABLES` with zero filtering by `trigger_type`. Invitation emails (`on_application_open`) go to contacts who haven't applied, so variables like `[vendorCategory]`, `[boothNumber]`, `[boothPrice]`, `[installDate]`, `[installTime]`, `[dashboardLink]` can't resolve.

**Files**:

- `src/components/producer/Email/EmailEditorPage.tsx:932` — renders all variables
- `src/components/producer/Email/EditScheduledEmailModal.tsx:549,606` — same
- `src/utils/emailVariables.ts` — no trigger-type metadata on variables

**Fix**: Add `excludeForTriggers?: string[]` to the `EmailVariable` interface. Tag vendor-specific variables with `['on_application_open']`. Filter the list in both editors based on the current email's `trigger_type`.

---

### P0-7: Resubscribe Button Is Dead Link

**Complexity**: BACKEND
**Root Cause**: During unsubscribe, the token is marked as "used" (`mark_as_used!`). When the user immediately clicks "Resubscribe", the resubscribe endpoint calls `find_active_token` which rejects used tokens. The token was consumed by the action that created the button.

**Files**:

- `voxxy-rails-react/app/services/unsubscribe_token_service.rb:71` — `mark_as_used!`
- `voxxy-rails-react/app/models/unsubscribe_token.rb:32-37` — `find_active_token` rejects used tokens
- `voxxy-rails-react/app/controllers/api/v1/presents/unsubscribes_controller.rb:122` — resubscribe calls same validation

**Fix**: Create a `find_token_for_resubscribe` method that allows used tokens (only checks expiry). Use it in the resubscribe controller action.

---

## P1 Bugs (Important)

### P1-1: Email History — Invitation Email Disappears After Application

**Complexity**: FRONTEND + BACKEND
**Root Cause**: When a vendor applies after receiving an invitation, the frontend (`VendorApplicationForm.tsx`) never sends the `invitation_token` in the submission payload. The backend has code to link the registration to the invitation via this token, but it never receives it. So `registration.event_invitation_id` stays null, and `all_email_deliveries` only returns registration emails.

**Files**:

- `src/pages/VendorApplicationForm.tsx:326-341` — missing `invitation_token` in submit payload (token IS available from URL params at line 91)
- `voxxy-rails-react/app/controllers/api/v1/presents/registrations_controller.rb:49-57` — backend linkage code exists but never fires

**Fix**: Frontend: include `invitation_token: searchParams.get('token')` in the submit payload. API type: add `invitation_token?: string` to the submit data type.

---

### P1-2: Event Portal — Producers See Permissions Screen

**Complexity**: FRONTEND ONLY
**Root Cause**: Portal link in Command Center goes to `/portal/:token` which requires vendor email verification. No bypass for authenticated producers who own the event.

**Files**:

- `src/components/producer/EventSettings.tsx:342-344` — generates portal link
- `src/pages/VendorEventPortalPage.tsx:235-301` — requires vendor session, no producer check

**Fix** (two options):

- **Quick**: Check `useAuth()` in portal page — if user is authenticated as producer/admin and owns the event, auto-grant access
- **Alternative**: Add a `?preview=true` param that the Command Center link uses, which loads the portal in read-only preview mode using the producer's auth token

---

### P1-3: Location Field — Brooklyn Shows as "NY, NY"

**Complexity**: FRONTEND ONLY
**Root Cause**: `googlePlacesService.ts` `getCityDisplay()` uses `city` (Google's `locality` = "New York") instead of `neighborhood` (Google's `sublocality` = "Brooklyn"). The neighborhood IS captured during parsing but discarded in the display function.

**Files**:

- `src/services/googlePlacesService.ts:227-234` — `getCityDisplay()` ignores neighborhood

**Fix**: Prefer `neighborhood` over `city` when present:

```ts
const displayCity = locationData.neighborhood || locationData.city
```

---

### P1-4: Category-Specific Links in Invitations Not Possible

**Complexity**: BACKEND
**Root Cause**: `InvitationVariableResolver` doesn't resolve `[categoryApplicationLink]` or per-category link variables. The `EventInvitation` model already HAS `vendor_application_url` and `vendor_application_links` methods that generate category-specific URLs with pre-fill tokens — they just aren't wired to the variable resolver.

**Files**:

- `voxxy-rails-react/app/services/invitation_variable_resolver.rb:129-143` — missing link variables
- `voxxy-rails-react/app/models/event_invitation.rb:84-101` — methods exist but unused

**Fix**: Add variable resolution for category links in `InvitationVariableResolver`. Wire up the existing `EventInvitation` methods.

---

### P1-5: Column Sorting Not Working on Mail Tab

**Complexity**: FRONTEND ONLY
**Root Cause**: The sort logic IS implemented and wired up. Click targets are very small (`w-3 h-3` sort icons, ~12px) with no visual affordance that columns are sortable. Likely a perception/UX issue more than a code bug. If truly non-functional, it may be a click propagation issue within the grid layout.

**Files**:

- `src/components/producer/Email/EmailTable.tsx:52-61` — column header buttons
- `src/components/producer/Email/EmailAutomationTab.tsx:56-68,257-301` — sort state and logic

**Fix**: Increase sort icon click target size, add `cursor-pointer` to full header cell, add hover state. Test at runtime to confirm `handleSort` fires.

---

### P1-6: Email Footer Shows Up Twice

**Complexity**: FRONTEND + BACKEND
**Root Cause**: Email template bodies from the backend already contain footer text (powered by Voxxy, unsubscribe link, etc.). The frontend preview adds a SECOND hardcoded `<EmailFooterCard />` below the body. A `removeFooter()` regex tries to strip the backend footer but uses fragile patterns that fail on resolved variables (e.g., expects `[organizationName]` but gets actual org name). The hardcoded footer also shows raw `[organizationEmail]` variable text because no prop is passed.

**Files**:

- `src/components/shared/EventEmailPreviewModal.tsx:118-150,315,322` — removeFooter regex + hardcoded footer
- `src/components/shared/EmailFooterCard.tsx:12` — defaults to literal `'[organizationEmail]'`

**Fix**: Remove the hardcoded `<EmailFooterCard />` from the preview. Rely on the footer in the template body. If a consistent footer is needed, strip it from the body reliably and render one canonical version with resolved variables.

---

### P1-7: Send Test Shows Old Logo

**Complexity**: BACKEND
**Root Cause**: Old Voxxy logo URL is hardcoded in `base_email_service.rb:138` as a Cloudinary URL. This gets embedded in email HTML. Also: there may not be a `send_test` route defined — the backend routes only include `send_now`, `pause`, `resume`, `preview`, `retry_failed`, `recipients`.

**Files**:

- `voxxy-rails-react/app/services/base_email_service.rb:138` — Cloudinary logo URL
- `voxxy-rails-react/app/services/invite_user_service.rb:53,136` — same logo
- `voxxy-rails-react/app/services/password_reset_service.rb:39` — same logo
- `voxxy-rails-react/config/routes.rb:427-441` — no `send_test` route

**Fix**: Update the Cloudinary URL to new logo in all 3 service files. Verify `send_test` route exists or redirect to use `send_now` with a test flag.

---

## P2 Bugs (Minor / Polish)

### P2-1: Send Now — No Loading Indicator

**Complexity**: FRONTEND ONLY
**Root Cause**: `EmailRow.tsx` has `isProcessing` state that disables the dropdown button but shows no visual spinner or "Sending..." text.
**Fix**: Add a spinner or text overlay to the row when `isProcessing` is true.

### P2-2: Status Names in Audit Log — "Delivered" vs "Sent" Unclear

**Complexity**: FRONTEND ONLY
**Root Cause**: `DELIVERY_STATUS_CONFIGS` in `types/email.ts:469-480` uses "Sent" (means accepted by SendGrid) and "Delivered" (means arrived in inbox). Descriptions exist in tooltips but labels are ambiguous.
**Fix**: Rename "Sent" to "Processing" or "Queued". The description already explains it correctly.

### P2-3: Audit Table Horizontal Scrolling Broken

**Complexity**: FRONTEND ONLY
**Root Cause**: `EmailAuditTable.tsx` has separate `overflow-x-auto` on header (line 125) and body (line 140). They scroll independently. Header and body columns get misaligned.
**Fix**: Remove per-section `overflow-x-auto`. Wrap entire table (header + body) in a single scroll container.

### P2-4: Email Audit Log Columns Need Refreshed

**Complexity**: FRONTEND ONLY
**Root Cause**: Column metadata (email name, trigger type, category, etc.) needs a design decision — not a code bug per se.
**Fix**: Design decision on which columns to show and their labels. Then update `EmailAuditTable.tsx` and `EmailRow.tsx`.

### P2-5: Email Editor Internal Links Dead

**Complexity**: FRONTEND ONLY
**Root Cause**: `EmailFooterCard.tsx:26` uses `href="#"`. `EmailEditorPage.tsx:677-679,764-767` uses `<span>` tags styled as links with no click handler. These are decorative preview elements.
**Fix**: Either (a) add tooltip "This link resolves when the email is sent" or (b) remove the underline/link styling to avoid confusion.

---

## Recommended Fix Order (48-Hour Sprint)

### Day 1 — Backend Fixes (coordinate with backend team)

| #   | Bug                             | Est. Effort | Impact                                                                         |
| --- | ------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| 1   | P0-2: Unsubscribe not working   | 30 min      | Set `email_unsubscribed=true` for all scopes in `unsubscribe_token_service.rb` |
| 2   | P0-1: Email filter key mismatch | 1 hr        | Normalize seed keys + data migration + delegate to `RecipientFilterService`    |
| 3   | P0-7: Resubscribe dead link     | 30 min      | Add `find_token_for_resubscribe` method                                        |
| 4   | P0-3: Audit unsubscribe data    | 1 hr        | Update `EmailDelivery` records on user-initiated unsubscribe                   |
| 5   | P1-7: Old logo in test emails   | 30 min      | Update Cloudinary URLs in 3 service files                                      |

### Day 1 — Frontend Fixes (in parallel)

| #   | Bug                               | Est. Effort | Impact                                                              |
| --- | --------------------------------- | ----------- | ------------------------------------------------------------------- |
| 1   | P0-4: Debug panel for non-admins  | 10 min      | Add `isAdmin` check in `debug/DebugPanel.tsx`                       |
| 2   | P0-6: Invitation email wrong tags | 1 hr        | Add trigger-type filtering to variable list                         |
| 3   | P0-5: Obsolete email tags         | 1 hr        | Audit variables against backend resolver                            |
| 4   | P1-3: Location field (Brooklyn)   | 30 min      | Fix `getCityDisplay()` to prefer neighborhood                       |
| 5   | P1-6: Double footer               | 45 min      | Remove hardcoded `EmailFooterCard` from preview, pass resolved vars |
| 6   | P1-2: Portal permissions screen   | 45 min      | Add producer bypass in `VendorEventPortalPage.tsx`                  |

### Day 2 — Remaining Fixes + Verification

| #   | Bug                            | Est. Effort | Impact                                                         |
| --- | ------------------------------ | ----------- | -------------------------------------------------------------- |
| 1   | P1-1: Email history disappears | 30 min      | Pass `invitation_token` in `VendorApplicationForm.tsx` submit  |
| 2   | P1-4: Category links (backend) | 1-2 hr      | Wire up `InvitationVariableResolver` to existing model methods |
| 3   | P1-5: Column sorting UX        | 30 min      | Increase click targets, add visual affordance                  |
| 4   | P2-1: Send Now loading         | 20 min      | Add spinner to `EmailRow` when `isProcessing`                  |
| 5   | P2-2: Status label clarity     | 15 min      | Rename "Sent" → "Processing" in `DELIVERY_STATUS_CONFIGS`      |
| 6   | P2-3: Audit table scrolling    | 20 min      | Single scroll container for header + body                      |
| 7   | P2-5: Dead editor links        | 15 min      | Add "preview only" tooltip or remove link styling              |

---

## Decision Points for the Team

1. **Unsubscribe architecture**: Quick fix (set boolean for all scopes) or proper migration (check `EmailUnsubscribe` table everywhere)?
2. **Email footer strategy**: Template body footer only? Or strip body footer and use a canonical frontend-rendered one?
3. **Audit log columns**: Which metadata columns should show? Need a design spec.
4. **Category links**: Do we need per-category links in invitation emails for the pilot? Or can this wait?
5. **Send Test route**: Does it exist on the backend? If not, should we add it or reuse `send_now` with a test flag?
