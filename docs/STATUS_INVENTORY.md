# Status Inventory — Voxxy Presents Frontend

> **Purpose:** Reference for all status domains used in the frontend, with notes on known or suspected backend mismatches and which filter values pull real backend data vs. hardcoded UI strings.
>
> **Last updated:** 2026-05-06  
> **Branch:** `feature/design-tweaks-and-applicants`

---

## 1. Registration / Applicant Status

**Source:** `src/types/email.ts` (`RegistrationStatus`), `src/components/producer/ApplicantsTab.tsx` (`getStatusBadge`)

| Frontend Label | Frontend Value | Backend Value | Match? | Notes |
|---|---|---|---|---|
| **New** | `pending` | `pending` | ✅ | Label changed from "Pending" to "New" in UI — backend value unchanged |
| **Approved** | `approved` | `approved` | ✅ | |
| **Confirmed** | `confirmed` | `confirmed` | ✅ | |
| **Invited** | `invited` | `invited` | ✅ | Special case — org invited them directly, no application submitted |
| **Waitlist** | `waitlist` | `waitlist` | ⚠️ | Frontend type says `waitlist`, ApplicantsTab has no badge for this — may silently fall through to default |
| **Rejected** | `rejected` | `declined`? | ⚠️ | `RegistrationStatus` says `rejected`; check if backend uses `declined` |
| **Cancelled** | `cancelled` | `cancelled` | ✅ | |
| **Declined** | `declined` | `declined` | ⚠️ | Appears in `getStatusBadge` switch; not in `RegistrationStatus` type — type and runtime diverge |

**Filter dropdown** (`ApplicantsTab`, focused view sidebar):
- Values: `all`, `pending`, `approved`, `confirmed`, `invited` — passed directly to backend filter params.
- ✅ These pull real backend data via `registrationsApi.getFiltered`.
- ⚠️ `declined`/`rejected` are missing from the filter dropdown.

---

## 2. Event Status

**Source:** `src/components/producer/EventsList.tsx`, `src/services/api.ts`

| Frontend Label | Frontend Value | Backend Value | Match? | Notes |
|---|---|---|---|---|
| **Draft** | `draft` | `draft` | ✅ | |
| **Published** | `published` | `published` | ✅ | |
| **Completed** | `completed` | `completed` | ✅ | Checked via `event.status?.status === 'completed'` |
| **Cancelled** | `cancelled` | `cancelled` | ✅ | |

**Notes:** The event status is nested at `event.status?.status` (object, not string). Ensure backend serializer always returns this shape.

---

## 3. Email Scheduled / Sequence Status

**Source:** `src/types/email.ts` (`ScheduledEmailStatus`), `src/components/producer/Email/EmailSequenceEditorOverlay.tsx`

| Frontend Label | Frontend Value | Backend Value | Match? | Notes |
|---|---|---|---|---|
| Scheduled | `scheduled` | `scheduled` | ✅ | |
| Paused | `paused` | `paused` | ✅ | |
| Active | `active` | `active` | ✅ | |
| Sent | `sent` | `sent` | ✅ | |
| Failed | `failed` | `failed` | ✅ | |
| Cancelled | `cancelled` | `cancelled` | ✅ | |

**Source:** `src/components/producer/Email/ScheduledEmailCard.tsx`, `ScheduledEmailList.tsx`

---

## 4. Email Delivery Status (Audit — Individual Email Level)

**Source:** `src/types/email.ts` (`DeliveryStatus`), `src/components/producer/Email/EmailAuditFilters.tsx`

| Frontend Label | Frontend Value | Backend Value | Match? | Notes |
|---|---|---|---|---|
| Scheduled | `scheduled` | `scheduled` | ✅ | |
| Pending | `pending` | `pending` | ✅ | |
| Queued | `queued` | `queued` | ✅ | |
| Sent | `sent` | `sent` | ✅ | |
| Delivered | `delivered` | `delivered` | ✅ | |
| Bounced | `bounced` | `bounced` | ✅ | |
| Dropped | `dropped` | `dropped` | ✅ | |
| Unsubscribed | `unsubscribed` | `unsubscribed` | ✅ | |
| Undelivered | `undelivered` | N/A | ⚠️ | **Hardcoded UI combo**: Frontend combines `bounced` + `dropped` into a single filter label "Undelivered". Not a real backend value — filter sends both params. Confirm this mapping with backend. |

**Filter source:** `EmailAuditFilters.tsx` — `statuses` array is hardcoded. Delivered + undelivered are the only two shown in the filter dropdown; full status set is in the type.

---

## 5. Email History Status (Email Row — Trigger-Level)

**Source:** `src/components/producer/Email/EmailRow.tsx`

| Frontend Label | Backend Value | Notes |
|---|---|---|
| Sent | `sent` | |
| Delivered | `delivered` | |
| Bounced | `bounced` | |
| Failed | `failed` | |
| Scheduled | `scheduled` | |

**Notes:** `EmailRow` renders a status badge — verify badge labels exactly match the `DeliveryStatus` type values above.

---

## 6. Payment Status

**Source:** `src/types/email.ts` (`PaymentStatus`), `src/components/producer/ApplicantsTab.tsx` (`getPaymentBadge`)

| Frontend Label | Frontend Value | Backend Value | Match? | Notes |
|---|---|---|---|---|
| Paid | `paid` | `paid` | ✅ | |
| Pending | `pending` | `pending` | ✅ | |
| Partial | `partial` | `partial` | ⚠️ | Exists in type, no badge in `getPaymentBadge` — falls through to default |
| Refunded | `refunded` | `refunded` | ⚠️ | Exists in type, no badge in `getPaymentBadge` |
| N/A | `n/a` | `n/a` | ⚠️ | Frontend-only value assigned when applicant is `invited`; check if backend ever returns this |
| Overdue | `overdue` | `overdue` | ⚠️ | Defined in `ApplicantsTab` inline type but not in `PaymentStatus` — type mismatch |
| Confirmed | `confirmed` | `confirmed` | ⚠️ | Appears in `getPaymentBadge` switch — not in `PaymentStatus` type |

**Table view (new):** If applicant status is not `approved` or `confirmed`, shows **N/A** badge regardless of `payment_status`.

---

## 7. Unsubscribe / Subscription Status

**Source:** `src/services/api.ts` (`unsubscribe_status`), `src/pages/UnsubscribePage.tsx`

| Frontend Value | Backend Value | Scope | Notes |
|---|---|---|---|
| `is_unsubscribed: true` | `is_unsubscribed: true` | `global` | Full opt-out |
| `is_unsubscribed: true` | `is_unsubscribed: true` | `organization` | Org-level opt-out |
| `is_unsubscribed: true` | `is_unsubscribed: true` | `event` | Event-specific opt-out |
| `is_unsubscribed: false` / `null` | N/A | N/A | Subscribed / no record |

**Filter:** `ContactsTable` shows UNSUB badge on contacts. No filter dropdown for unsubscribe status currently — would need to add.

---

## 8. Organization Account / User Status

**Source:** `src/pages/Dashboard.tsx`, `src/pages/SettingsPage.tsx`, `src/contexts/AuthContext.tsx`

| Frontend Concept | Values Seen | Notes |
|---|---|---|
| Account plan / tier | `free`, `starter`, `pro`, `enterprise` | Shown in settings; sourced from `organization.plan` |
| Account active | `is_active: true/false` | Used to guard routes; sourced from API |
| User role | `admin`, `owner`, `member` | Referenced in `AdminPanel.tsx`; full role list TBD |
| Beta status | `beta_pending` state in `BetaPendingPage.tsx` | Not a formal status field — check backend |

⚠️ **Mismatch note:** Frontend uses `organization.plan` string for gating features. Confirm backend plan slugs exactly match what the frontend compares against.

---

## 9. Invitation Application Status (InvitesTab)

**Source:** `src/components/producer/InvitesTab.tsx`

| Frontend Label | Frontend Value | Backend Value | Match? | Notes |
|---|---|---|---|---|
| Pending | `pending` | `pending` | ✅ | |
| Accepted | `accepted` | `accepted` | ✅ | |
| Declined | `declined` | `declined` | ✅ | |
| Delivered | `delivered` | `delivered` | ✅ | |
| Bounced | `bounced` | `bounced` | ✅ | |
| Failed | `failed` | `failed` | ✅ | |

---

## 10. Applicant Category Status

**Source:** `src/components/producer/ApplicantsTab.tsx` (category change flow)

The category assigned to an applicant is a string (category name), not a formal status enum. The change triggers an email notification (optional). No "category status" enum — the change is event-driven.

---

## 11. Filter Status Values vs. API Parameters

| Feature | Filter UI Values | Sent to API | Hardcoded? | Notes |
|---|---|---|---|---|
| Applicants sidebar | `all`, `pending`, `approved`, `confirmed`, `invited` | `status=pending` etc. | ✅ Real API params | Missing `declined`, `rejected`, `cancelled` options |
| Applicants table | `all`, `pending`, `approved`, `confirmed`, `invited` | Same | ✅ Real API params | Same gaps |
| Email audit | `delivered`, `undelivered` | `delivered` or `bounced,dropped` | ⚠️ `undelivered` is UI-only | Backend has no `undelivered` concept |
| Contacts table | Category filter, tag filter | Real backend filter options from `getFilterOptions` | ✅ Pulled from API | |

---

## Known / Suspected Mismatches Summary

| Domain | Issue |
|---|---|
| Applicant status | `rejected` vs `declined` — type says `rejected`, `getStatusBadge` has `declined`, filter has neither |
| Applicant status | `waitlist` has no badge in `getStatusBadge` |
| Payment status | `partial` and `refunded` have no badge rendering |
| Payment status | `overdue` in inline type but not in `PaymentStatus` |
| Payment status | `confirmed` in `getPaymentBadge` but not in `PaymentStatus` type |
| Unsubscribe | No filter UI for unsubscribe scope |
| Email audit | `undelivered` is frontend-only; backend returns separate `bounced`/`dropped` |
| Event status | Nested shape `event.status?.status` — ensure this is always serialized correctly |
| Org/account | `beta_pending` is not a formal backend status |

---

*This document should be reviewed and updated whenever new status values are added to either the frontend or backend.*
