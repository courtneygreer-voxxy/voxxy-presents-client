# Unified Email Editor: Create & Edit in One UI

**Created:** March 23, 2026
**Status:** Planned
**Priority:** High
**Repos:** `voxxy-presents-client` (primary), `voxxy-rails-react` (minor)

---

## Why We're Doing This

Users currently face three different UIs when creating or editing emails, each with different capabilities. The CreateEmailDialog popup is missing trigger types (application deadline, bulletin post, etc.), has no dynamic variable insertion, no live preview, no test email, and no category selector in certain contexts. This causes confusion, limits what users can do, and produces HTTP 500 errors when required data is missing.

**The fix:** One editor UI for both creating and editing emails. The EmailEditorPage already has everything we need - rich text, variable sidebar, trigger settings, preview, test emails. We just need to make it work in "create" mode too, then retire the popup.

**Core principle:** Consistency. Non-technical users should never encounter a different screen for the same behavior. Click as little as possible. Repeatable patterns, no surprises.

---

## What Changes

### Frontend (`voxxy-presents-client`)

#### 1. EmailEditorPage gains a `create` mode

- New prop: `mode: 'edit' | 'create'`
- Create mode: form starts blank with sensible defaults, "Save" calls `scheduledEmailsApi.create()`
- Edit mode: same as today, "Save" calls `scheduledEmailsApi.update()`
- Header text: "Create Email" vs "Edit Email"
- "Send Test" button: hidden in create mode (email must exist on backend first)
- After successful create: transition to edit mode (email now has an ID, test email becomes available)

#### 2. Recipients section becomes a real category dropdown

- Replace the stub text in the "Recipients" sidebar section with an actual `<Select>` dropdown
- **Always visible** - never hidden. Shows "All Vendors" as default
- If categories exist AND trigger type supports category targeting: dropdown is active, user can choose a specific category
- If trigger type is a "blast" type (no vendor in system yet): dropdown is **grayed out** with "All Vendors" locked and a subtle note explaining why
- If no categories exist on the event: dropdown is **grayed out** with "All Vendors" locked

**Grayed-out triggers** (these are blasts to all contacts/vendors, category selection not applicable):

- `on_invitation_send` - invitation blast, recipients aren't vendors yet
- `on_application_open` - announcement blast, no applications exist yet
- `days_before_deadline` - application deadline reminder, sent to invited contacts who haven't applied
- `on_bulletin_post` - broadcast to everyone
- `on_event_cancel` - broadcast to everyone
- `on_event_update` - broadcast to everyone

**Active triggers** (vendor is in the system, category-specific targeting makes sense):

- `days_before_event` / `on_event_date` / `days_after_event` - event countdown emails to registered vendors
- `days_before_payment_deadline` / `on_payment_deadline` / `days_after_payment_deadline` - payment reminders to approved vendors
- `on_approval` / `on_rejection` / `on_waitlist` - application status emails (system-generated, but shows the pattern)

This logic also informs the sequence view: when an email's trigger type is a blast type, its category column shows "All Vendors" and can't be split per category. This is how the system decides whether category-driven email duplication applies.

- Maps to `category_id` on the scheduled email
- Same dropdown pattern can later be reused as a filter on the Sequence Editor

#### 3. Trigger types filtered by available event dates

- Only show triggers where the event has the required date field set
- Example: if no `payment_deadline` on the event, hide "Days Before Payment Due", "On Payment Deadline", "Days After Payment Due"
- If no `application_deadline`, hide "Days Before Application Deadline"
- If no `event_date`, hide "Days Before Event", "On Event Date", "Days After Event"
- This prevents the 500 error entirely - users can't pick a trigger that would fail

#### 4. Entry points updated

- **Mail Tab "New Email" button** → opens EmailEditorPage in create mode (not popup)
- **Sequence Editor "New Email" button** → opens EmailEditorPage in create mode (not popup)
- **Back button** is dynamic: returns to wherever the user came from (Mail Tab or Sequence Editor)
- CreateEmailDialog component retired (can delete or leave unused)

#### 5. Sidebar polish

- **Send time info** currently takes up a large blue box with two lines. Replace with a single line of subtle white subtext below the "Number of Days" field: `Sends at 8:00 AM Eastern`
- **Tag search** - add a search/filter input at the top of the "Available Tags" section so users can quickly find variables without scrolling through 30+ options
- Tags list is getting long and we need to validate each one works correctly

### Backend (`voxxy-rails-react`)

**No backend changes required.** The `POST /api/v1/presents/events/:slug/scheduled_emails` endpoint already supports everything the full editor needs:

- All time-based trigger types (including `days_before_deadline`)
- `category_id` for category targeting
- `filter_criteria` for recipient filtering
- `scheduled_for` calculation from trigger fields

The `system_trigger_type?` guard correctly blocks system-only triggers (on_approval, on_rejection, etc.) from manual creation, which is the intended behavior.

---

## Commit Plan (Stop & Test at Each)

### Commit 1: EmailEditorPage accepts create mode

**What changes:**

- Add `mode` prop (`'edit' | 'create'`) to EmailEditorPage
- Add `onCreate` prop for the create API call
- When `mode === 'create'`: form starts blank, header says "Create Email", hide "Send Test" button
- On save in create mode: call `onCreate`, receive new email back, switch to edit mode (email now has ID)
- Form defaults for create: trigger_type = 'days_before_event', trigger_value = 1, status = 'scheduled'

**Test:**

- Open EmailEditorPage directly in create mode (can wire up temporarily from Mail Tab)
- Verify blank form renders with all fields
- Verify trigger dropdown shows all available trigger types
- Verify save creates email and page transitions to edit mode
- Verify "Send Test" appears after save completes

**Files touched:**

- `src/components/producer/Email/EmailEditorPage.tsx`

---

### Commit 2: Wire up Mail Tab and Sequence Editor to use EmailEditorPage for create

**What changes:**

- EmailAutomationTab: "New Email" button sets viewState to `{ view: 'email-editor', email: null, returnTo: 'table' }` instead of opening CreateEmailDialog
- EmailSequenceEditorOverlay: "New Email" button sets viewState to `{ view: 'email-editor', email: null, returnTo: 'sequence-editor' }` instead of opening CreateEmailDialog
- EmailAutomationTab: handle `email: null` in the email-editor view state → render EmailEditorPage in create mode
- Back button returns to `returnTo` view (dynamic navigation)
- Remove CreateEmailDialog imports and usage from both components

**Test:**

- From Mail Tab, click "New Email" → full editor opens in create mode
- Fill out fields, save → returns to Mail Tab, new email appears in table
- From Sequence Editor, click "New Email" → full editor opens in create mode
- Fill out fields, save → returns to Sequence Editor, new email appears in list
- Verify old popup no longer appears anywhere

**Files touched:**

- `src/components/producer/Email/EmailAutomationTab.tsx`
- `src/components/producer/Email/EmailSequenceEditorOverlay.tsx`

---

### Commit 3: Recipients section with category dropdown

**What changes:**

- EmailEditorPage: accept `categories` prop (Category[])
- Replace Recipients stub text with a `<Select>` dropdown
- Options: "All Vendors" (value: null) + each category (icon + name, value: category.id)
- If no categories available: hide the Recipients section entirely
- Wire `category_id` into the create and update payloads
- EmailAutomationTab: pass loaded `categories` to EmailEditorPage

**Test:**

- Open editor for an event WITH vendor application categories → Recipients section shows dropdown with category options
- Select a category, save → verify `category_id` is set on the scheduled email
- Select "All Vendors", save → verify `category_id` is null
- Open editor for an event WITHOUT categories → Recipients section is hidden
- Edit an existing email that has a category → dropdown shows correct selection

**Files touched:**

- `src/components/producer/Email/EmailEditorPage.tsx`
- `src/components/producer/Email/EmailAutomationTab.tsx`

---

### Commit 4: Filter trigger types by available event dates

**What changes:**

- EmailEditorPage: filter `TRIGGER_TYPES` array based on which date fields exist on `eventData`
- Rules:
  - `days_before_event`, `days_after_event`, `on_event_date` → requires `eventData.start_date`
  - `days_before_deadline` → requires `eventData.application_deadline`
  - `days_before_payment_deadline`, `on_payment_deadline`, `days_after_payment_deadline` → requires `eventData.payment_due_date` or `eventData.payment_deadline`
  - `on_invitation_send`, `on_application_open`, `on_bulletin_post` → always available (no date dependency)
- If current trigger type becomes unavailable (e.g., editing email and event date was removed), show warning

**Test:**

- Create event with all dates set → all trigger types available in dropdown
- Create event with no payment deadline → payment triggers hidden
- Create event with no application deadline → "Days Before Application Deadline" hidden
- Verify hidden triggers don't cause errors
- Verify existing emails with now-hidden triggers still display correctly (don't break edit)

**Files touched:**

- `src/components/producer/Email/EmailEditorPage.tsx`

---

### Commit 5: Sidebar polish - send time and tag search

**What changes:**

- **Send time:** Remove the blue info box under trigger settings. Add one line of subtext under the "Number of Days" input: `Sends at 8:00 AM Eastern` in white/50 text, same style as other field hints
- **Tag search:** Add a small search input at the top of the "Available Tags" section. Filter tags by label or variable name as user types. Clear button to reset search. Show count of matching tags

**Test:**

- Verify send time note appears as subtle one-liner below days field
- Verify send time note is hidden when trigger type doesn't require days value
- Type in tag search → tags filter in real-time
- Clear search → all tags reappear
- Verify tag insertion still works after filtering

**Files touched:**

- `src/components/producer/Email/EmailEditorPage.tsx`

---

### Commit 6: Cleanup

**What changes:**

- Delete or deprecate CreateEmailDialog.tsx (mark as unused if keeping for reference)
- Remove unused imports across touched files
- Verify no other components reference CreateEmailDialog

**Test:**

- Full regression: create email from Mail Tab, create from Sequence Editor, edit existing email
- Verify no console errors or warnings about missing components
- Build passes with no TypeScript errors

**Files touched:**

- `src/components/producer/Email/CreateEmailDialog.tsx` (delete or deprecate)
- Any files with stale imports

---

## UI Reference

### EmailEditorPage Layout (applies to both create and edit)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [← Back]                    [Show Preview] [Send Test*] [Save]    │
├────────────────────────────────────┬────────────────────────────────┤
│                                    │  ▼ Trigger Settings            │
│  Email Name                        │    When to Send: [dropdown]    │
│  ┌──────────────────────────────┐  │    Number of Days: [input]     │
│  │ e.g., Payment Reminder      │  │    Sends at 8:00 AM Eastern    │
│  └──────────────────────────────┘  │                                │
│                                    │  ▼ Recipients                  │
│  Subject Line                      │    Category: [All Vendors ▾]   │
│  ┌──────────────────────────────┐  │    ┌──────────────────────┐   │
│  │ e.g., [eventName] Reminder  │  │    │ All Vendors          │   │
│  └──────────────────────────────┘  │    │ 🍔 Food Vendor       │   │
│                                    │    │ 🎨 Artist            │   │
│  Email Body                        │    │ 💰 Sponsor           │   │
│  ┌──────────────────────────────┐  │    └──────────────────────┘   │
│  │ [B] [I] [Link] [List]       │  │                                │
│  │                              │  │  ▼ Available Tags             │
│  │ Rich text editor...          │  │    🔍 [Search tags...]        │
│  │                              │  │    ┌──────────────────────┐   │
│  └──────────────────────────────┘  │    │ eventName            │   │
│                                    │    │ eventDate            │   │
│  🔒 Email Footer (Locked)         │    │ firstName            │   │
│  ┌──────────────────────────────┐  │    │ ...                  │   │
│  │ Unsubscribe link footer     │  │    └──────────────────────┘   │
│  └──────────────────────────────┘  │                                │
└────────────────────────────────────┴────────────────────────────────┘

* "Send Test" hidden in create mode, appears after first save
```

### Trigger Type Availability (based on event data)

| Trigger                          | Required Event Field   | Always Available? |
| -------------------------------- | ---------------------- | ----------------- |
| Days Before Event                | `start_date`           | No                |
| Days After Event                 | `start_date`           | No                |
| On Event Date                    | `start_date`           | No                |
| Days Before Application Deadline | `application_deadline` | No                |
| Days Before Payment Due          | `payment_deadline`     | No                |
| On Payment Deadline              | `payment_deadline`     | No                |
| Days After Payment Due           | `payment_deadline`     | No                |
| When Invitation Sent             | -                      | Yes               |
| When Applications Open           | -                      | Yes               |
| On Bulletin Post                 | -                      | Yes               |

### Category Dropdown Behavior

| Event State                            | Recipients Section          | Dropdown Options              |
| -------------------------------------- | --------------------------- | ----------------------------- |
| No vendor applications / no categories | Hidden                      | -                             |
| Has categories from vendor apps        | Visible                     | "All Vendors" + each category |
| Creating new email                     | Visible if categories exist | Same as above                 |
| Editing existing email with category   | Visible, pre-selected       | Same as above                 |

---

## What This Fixes

| Issue                                        | Before                                                    | After                                        |
| -------------------------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| HTTP 500 on create                           | Silent failure, no error shown                            | Impossible - unavailable triggers are hidden |
| Missing application deadline trigger         | Not in popup's 6-trigger list                             | Available (editor has all triggers)          |
| No dynamic variable insertion for new emails | Popup has no variable sidebar                             | Full variable sidebar with search            |
| No preview for new emails                    | Popup has no preview                                      | Full live preview panel                      |
| No test email for new emails                 | Not available                                             | Available after first save                   |
| Category selector inconsistent               | Shows in Mail Tab popup, missing in Sequence Editor popup | Always in sidebar when categories exist      |
| Different UIs for same action                | Popup for create, full editor for edit                    | Same full editor for both                    |
| Send time info too large                     | Blue box with 2 lines                                     | One-line subtext hint                        |
| Hard to find variables                       | Scroll through 30+ tags                                   | Search/filter input                          |

---

## Out of Scope (Future)

- Template Builder email creation (uses EmailTemplateEditorPage, different component and API)
- Filter criteria editor (status, payment filters) - can be added to Recipients section later
- Variable validation audit (confirming all 30+ variables resolve correctly on backend)
- Sequence Editor category filter dropdown (future reuse of the Recipients dropdown pattern)
- Bulk email operations

---

## Risk Notes

- **EmailEditorPage is 1,133 lines.** Changes are additive (new props, conditional rendering), not restructuring. Low risk of breaking existing edit flow.
- **Backend is unchanged.** Zero deployment coordination needed. Frontend-only deploy.
- **CreateEmailDialog retirement** is safe because only two components use it (EmailAutomationTab, EmailSequenceEditorOverlay) and both are being rewired.
- **Trigger filtering** could hide a trigger that an existing email uses. Handle gracefully: if editing an email whose trigger is now "unavailable," still show it (don't remove the current selection).

---

**Questions?** Contact: team@voxxyai.com
