# Voxxy Presents — Release Log

---

## Release: Moving to Staging
_Prepared June 24, 2026 — covers all work since last production release_

---

### What's New

**Applicants Tab — Full Overhaul**
The Applicants tab in your Command Center has been redesigned from the ground up. Key changes:

- **All invited contacts now load correctly.** Previously, events with more than 100 invited contacts were silently cut off — filters showed wrong totals and some contacts were invisible. This is fixed.
- **Invited contacts are hidden by default.** The applicants list now shows only people who actually submitted an application. Invited contacts are still there — you can toggle them on with the "Invited (N)" button in the header to see them alongside applicants.
- **Export to CSV.** You can now download your applicant list from the Applicants tab. Use the Export button in the header — choose which columns you want (name, email, status, payment status, category, ticket code, notes, and more) and it downloads instantly. No backend request needed.
- **Unique ticket codes.** Every vendor who submits an application now receives a unique ticket code (e.g. `SHOW-202506-XXXX-AB12`). This is their personal reference number — no two vendors share it. The code appears on their confirmation page and in your producer view.
- **Status filters now work correctly.** "Paid" now correctly returns vendors who have paid, regardless of their application status. "Opted Out" covers both vendors who removed themselves and those you moved out manually. Labels are consistent between filters and badges.
- **Settings edit form fully visible.** When you click Edit on an application category in Settings, all fields now appear — previously only the first row was visible due to a display bug.
- **Booth price moved out of category edit.** Booth pricing lives in Payment Configuration settings, so it's been removed from the category edit form to avoid confusion.

**Vendor Application Form**
- Business name field removed — vendors no longer need to provide one
- First name, last name, phone (required), and affiliation fields added
- Form validates required fields before allowing submission
- Confirmation page now shows the vendor's unique ticket code with a note to save it

**Network Tab**
- New filter panel with saved query support — filter contacts by category, tags, location, and more; save filters you use regularly
- Contact view card added — quick-view a contact's full profile from the contacts list
- Bulk edit redesigned — update category, tags, and location across multiple contacts at once
- All Contacts view simplified and easier to navigate

**Landing Page**
- Updated with artist-first language throughout
- New `/artists` page added
- Navigation updated with clear sign in / sign up CTAs
- SMS legal disclosure added to signup flow

---

### What's Fixed

| Area | What was wrong | Fixed |
|------|---------------|-------|
| Applicants Tab | 100-invitation cap caused wrong counts on large events | ✅ |
| Applicants Tab | "Paid" filter returned 0 results | ✅ |
| Applicants Tab | Search crashed when contact had no business name | ✅ |
| Applicants Tab | Invited contacts showed mixed in with applicants by default | ✅ |
| Vendor Form | Application code was shared across all vendors in a category | ✅ Now unique per vendor |
| Vendor Form | Last name field was missing | ✅ |
| Artist Route | `/artists` page returned 404 | ✅ |
| Command Center | Activating a show surfaced internal server details in the error message | ✅ Generic message shown; details logged internally |
| Email System | Ticket code collision — two vendors could occasionally get the same code (P0) | ✅ |
| Platform | Bug report submission crashed on certain inputs (P1) | ✅ |

---

### In Progress — Not Going to Production Yet

**Email Rate Limiting & Batch Sending** _(Beau)_
Beau has been building out batch processing for scheduled emails — so large email sends go out in controlled waves instead of all at once. This work is in staging for testing but is **not going to production** until it's complete. Still needed:
- Testing plan for real-volume sends
- Failure/retry handling for batched sends

This is intentionally held. We'll release it as its own update once it's fully validated.

---

### Known Issues We're Actively Working On

These are bugs we've identified and are in the queue — not in this release but being tracked:

- **Applicants Tab load time** — the tab can feel slow on events with lots of contacts. Root cause is a database query efficiency issue (N+1). Fix is planned.
- **Command Center stats vs Applicants count mismatch** — the number shown on your dashboard may differ slightly from the count in the Applicants tab. This happens when one person applies to multiple vendor categories. Investigating the right way to display this clearly.
- **Unsubscribe links** — some unsubscribe links in outgoing emails return a 404. This is a compliance issue we're prioritizing. Fix in progress.
- **Email template deletion** — deleting an email template can fail if it has associated records. Fix planned.
- **Stripe subscription sync** — Stripe updated their API in January 2026 and some subscription renewal/cancellation signals may not be updating correctly. Investigating impact and patching the webhook handler.

---

_Questions about any of these changes? Drop them in the engineering channel._
