# UI Sprint: Polish, Structure & Foundation

**Date:** April 4, 2026
**Branch:** `feature/ui-sprint-polish`
**Status:** Ready for development

---

## Overview

This sprint focuses on UI polish, structural reorganization, and building a reusable onboarding framework. None of these items have backend bug dependencies — the APIs are ready and the work is purely frontend.

The goal is to ship a testable build that can be reviewed visually in a sandbox environment.

---

## Themes

### 1. Declutter & Simplify
Remove unused features, reduce visual noise, and make dense screens easier to scan.
- **UI-10** Remove Eventbrite + Notifications from Settings
- **UI-12** Reduce Voxxy card popup opacity
- **UI-16** Collapsible Settings sections

### 2. Visual Polish
Modernize flat screens with subtle depth, fix viewport issues, and tighten spacing.
- **UI-11** Gradient treatment on email/template/audit screens
- **UI-12** Card popup opacity adjustment

### 3. Structural Reorganization
Move features to where users expect them and create consistent interaction patterns.
- **UI-04** Move Categories into the Network tab
- **UI-05** Standardize search & filter UI across the app

### 4. Protective UX
Prevent user mistakes by gating actions behind state checks and defaulting to smart values.
- **UI-01** Hide "Send Now" until event is live
- **UI-14** Default install date to event date

### 5. Onboarding Foundation
Build a lightweight, reusable guide system that can grow as the product evolves.
- **UI-08** Onboarding guide component (framework only)

---

## Items

### UI-01 — Hide "Send Now" Until Event Is Live
**Complexity:** Low
**Where:** `src/components/producer/Email/EmailAutomationTab.tsx`, `EmailRow.tsx`, `ScheduledEmailCard.tsx`

The "Send Now" button on individual scheduled emails in the Mail tab should not be clickable until the event has been published (gone live).

**What to do:**
- The `event` prop is passed down from `CommandCenter.tsx` into `EmailAutomationTab`
- Check `event.status?.status === 'published'` or `event.published === true`
- If the event is still in draft, either hide the "Send Now" button entirely or render it as disabled with a tooltip: "Event must be live to send emails"
- This applies to the Send Now action on individual email rows, not to test emails (test should always work)

**Acceptance:**
- In draft state, "Send Now" is not actionable
- In published state, "Send Now" works normally
- "Send Test" remains available regardless of event state

---

### UI-04 — Move Categories to the Network Tab
**Complexity:** Medium-High
**Where:** `src/components/producer/Network/NetworkPage.tsx`, `src/pages/SettingsPage.tsx`

Categories currently live in `SettingsPage.tsx` (the global settings page). They should be moved into the Network section alongside Contacts and Lists, since categories are used to organize contacts and filter vendor lists.

**What to do:**

1. **Add a "Categories" tab to NetworkPage:**
   - `NetworkPage.tsx` currently has two tabs: `contacts` and `lists` (type `NetworkTab = 'contacts' | 'lists'`)
   - Add `'categories'` to the `NetworkTab` type
   - Add a third tab button in the tab bar

2. **Build a `CategoriesManagement.tsx` component** inside `src/components/producer/Network/`:
   - Move the category CRUD logic from `SettingsPage.tsx` (lines ~107-400 handle categories: fetch, create, edit, delete, color picker)
   - Display categories as a list/table with: name, color swatch, and action buttons (edit, delete)
   - "Add Category" button opens the existing modal pattern (name + color picker)
   - "View" action on a category should filter the contacts table to show only contacts in that category
     - This can reuse the existing `CategoryFilterBar` from `src/components/shared/CategoryFilterBar.tsx`
     - When clicking "View", switch to the Contacts tab with that category pre-selected as a filter

3. **Remove categories section from SettingsPage.tsx:**
   - Strip the category state, modal, and rendering from Settings
   - Keep the Settings page focused on org profile, integrations, and notifications

**API endpoints (already built):**
- `GET /api/v1/presents/organizations/:id/categories` — list categories
- `POST /api/v1/presents/organizations/:id/categories` — create
- `PATCH /api/v1/presents/categories/:id` — update
- `DELETE /api/v1/presents/categories/:id` — delete

**Acceptance:**
- Categories tab appears in Network page between Lists and (or after) Contacts
- Full CRUD works: create, edit name/color, delete with confirmation
- "View" on a category navigates to Contacts tab filtered by that category
- Categories no longer appear in the Settings page

---

### UI-05 — Standardize Search & Filter UI
**Complexity:** Medium-High
**Where:** Multiple files (Network, Mail, Audit Log)

Search and filter components look different across the app. The target is one consistent pattern: search bar on top, filter chips/dropdowns below, tight vertical spacing.

**Current state:**
- **NetworkPage.tsx** — Has a custom `MultiSelectFilterDropdown` component built inline (lines 20-100+), a search input, and `CategoryFilterBar`
- **EmailAutomationTab.tsx** — Has its own search/filter pattern for scheduled emails
- **EmailAuditTable.tsx / EmailAuditFilters.tsx** — Separate filter UI for the audit log

**What to do:**

1. **Create a shared `SearchFilterBar` component** at `src/components/shared/SearchFilterBar.tsx`:
   ```
   ┌──────────────────────────────────────────┐
   │ 🔍 Search...                             │
   ├──────────────────────────────────────────┤
   │ [Filter 1 ▾] [Filter 2 ▾] [Clear All]   │
   └──────────────────────────────────────────┘
   ```
   - Props: `searchPlaceholder`, `filters` (array of filter configs), `onSearchChange`, `onFilterChange`
   - Each filter config: `{ key, label, options[], multi?: boolean }`
   - Use existing UI primitives: `src/components/ui/popover.tsx`, `src/components/ui/command.tsx`, `src/components/ui/badge.tsx`
   - Active filters show as badges/chips below the search bar

2. **Retrofit into NetworkPage.tsx:**
   - Replace the inline `MultiSelectFilterDropdown` with `SearchFilterBar`
   - Maintain existing filter keys: category, status, contact_type, location, tags

3. **Retrofit into EmailAutomationTab.tsx:**
   - Replace email search/filter with `SearchFilterBar`
   - Filters: status (scheduled/sent/failed/paused), category, email type

4. **Retrofit into EmailAuditTable.tsx / EmailAuditFilters.tsx:**
   - Replace with `SearchFilterBar`
   - Filters: delivery status (delivered/bounced/dropped), date range

**Acceptance:**
- All three screens (Network, Mail tab, Audit Log) use the same `SearchFilterBar` component
- Visual appearance is identical across screens
- Filter behavior is preserved (same data, just unified UI)

---

### UI-08 — Onboarding Guide Component (Framework Only)
**Complexity:** Medium (scoped down)
**Where:** New component at `src/components/shared/OnboardingGuide.tsx`

Build a lightweight, reusable onboarding guide system. This sprint is **framework only** — we are NOT stripping inline text from existing screens yet. The goal is: build the component so it's trivially easy to add steps for any screen later.

**What to do:**

1. **Create `src/components/shared/OnboardingGuide.tsx`:**
   - A step-by-step overlay/spotlight guide
   - Each step highlights a target element (by CSS selector or ref) with a tooltip/popover
   - Steps have: `title`, `description`, `targetSelector`, `placement` (top/bottom/left/right)
   - Navigation: "Next", "Back", "Skip", step counter (e.g., "2 of 5")
   - Dimmed backdrop with a spotlight cutout around the target element
   - Smooth transitions between steps

2. **Create `src/hooks/useOnboarding.ts`:**
   - Hook to manage guide state: `{ isActive, currentStep, start, next, back, skip, complete }`
   - Persist completion in localStorage per guide ID (so it doesn't re-show)
   - Expose a `reset(guideId)` function so help icons can re-trigger it

3. **Create `src/components/shared/HelpIcon.tsx`:**
   - Small `?` or info icon button
   - On click, triggers `useOnboarding.start(guideId)` to replay the relevant guide
   - Consistent styling across the site (use `lucide-react` HelpCircle icon)

4. **Wire up a single demo guide on the Dashboard page:**
   - 3-4 steps pointing at: the events list, the "Create Event" button, the Network nav item, and the Settings nav item
   - Triggers on first login (check localStorage flag)
   - This proves the system works end-to-end

**Do NOT do yet:**
- Do not strip inline text from Email tab or sequence views
- Do not build guides for every screen — just the dashboard demo

**Acceptance:**
- First-time user sees a guided tour on the Dashboard
- Steps highlight real UI elements with a spotlight effect
- User can navigate forward/back/skip
- Completing or skipping persists — guide doesn't show again
- Help icon on Dashboard re-triggers the guide
- Adding new guides for other pages requires only defining a steps array

---

### UI-10 — Remove Eventbrite Integration & Notifications From Settings
**Complexity:** Low
**Where:** `src/pages/SettingsPage.tsx`, `src/components/producer/PaymentIntegrations/EventbriteConnection.tsx`

Both Eventbrite integration and notification preferences are present in the Settings page but not functional.

**What to do:**
- In `SettingsPage.tsx`, the sub-tabs are defined as: `type SettingsSubTab = 'organization' | 'integrations' | 'notifications'` (line 35)
- Remove `'integrations'` and `'notifications'` from the type and the tab bar
- Remove the tab content that renders `EventbriteConnection` (imported on line 5)
- Remove the notifications toggle section
- Keep only the `'organization'` tab content (profile, org details, timezone)
- Do NOT delete the component files yet — just disconnect them from Settings

**Acceptance:**
- Settings page shows only Organization settings (no Integrations or Notifications tabs)
- No dead UI — everything visible is functional
- `EventbriteConnection.tsx` still exists in the codebase (not deleted, just not rendered)

---

### UI-11 — Gradient Treatment + Zoom Out on Email/Template/Audit Screens
**Complexity:** Low-Medium
**Where:** Email editor, template editor, audit log screens + `src/components/ui/BackgroundGradient.tsx`

These screens are visually flat. Add subtle gradient backgrounds and adjust scaling so the full screen is visible without scrolling (especially the email editor where the footer gets cut off).

**What to do:**

1. **Gradient backgrounds:**
   - A `BackgroundGradient.tsx` component already exists in `src/components/ui/`
   - Apply it (or a similar subtle gradient) to:
     - `EmailEditorPage.tsx`
     - `EmailTemplateEditorPage.tsx` / `TemplateBuilderPage.tsx`
     - `EmailAuditTable.tsx` / `EmailAuditLogOverlay.tsx`
   - Use the existing color tokens from the design system. Suggested: a very subtle radial gradient from the card background to the page background, or a top-to-bottom linear gradient using `colors.background` → a slightly lighter shade

2. **Viewport / zoom-out fix:**
   - The email editor footer is cut off — the content area needs to fit within the viewport
   - Audit approach: check if the container uses `h-screen` or `100vh` correctly, ensure the content area is scrollable within a fixed-height wrapper rather than pushing the footer off-screen
   - Reduce font sizes or padding by ~15-20% on these screens if they're visually oversized (not a literal CSS `zoom` — use spacing and typography adjustments)

3. **Consistency:**
   - All three screen types (editor, template, audit) should have the same gradient treatment
   - The gradient should be subtle enough that it doesn't compete with the content

**Acceptance:**
- Email editor, template editor, and audit log have a subtle gradient background
- Footer is visible without scrolling on the email editor
- Screens feel more polished and less flat
- No loss of readability or functionality

---

### UI-12 — Voxxy Card Popup Opacity
**Complexity:** Trivial
**Where:** Identify the card popup component (likely a modal/dialog overlay)

The card popup that appears when editing is too opaque — the backdrop blocks too much of the underlying content.

**What to do:**
- Find the popup/modal component used for the "Voxxy card" editing experience
- Reduce the backdrop opacity (e.g., from `bg-black/70` to `bg-black/40` or similar)
- If the card itself has a solid background, consider adding slight transparency or a glassmorphism effect using `backdrop-blur`

**Acceptance:**
- Popup backdrop is noticeably less opaque
- User can still perceive the content behind the popup
- Card content remains fully readable

---

### UI-14 — Default Install Date to Event Date
**Complexity:** Low
**Where:** `src/components/producer/CreateEventWizard/steps/Step2ApplicationDetails.tsx`

When creating a new event and setting up vendor categories, the install date currently defaults to a date near the application deadline. It should default to the event date since installs typically happen day-of.

**What to do:**
- In the event creation wizard Step 2 (Application Details), find where `install_date` is initialized
- Change the default value to use the event date from Step 1
- The event date is available in the wizard state (passed through from `Step1EventDetails.tsx` → wizard state → `Step2ApplicationDetails.tsx`)
- If no event date is set yet, leave install date blank

**Acceptance:**
- New event creation pre-fills install date with the event date
- User can still override the install date manually
- If event date changes in Step 1, install date updates to match (unless manually overridden)

---

### UI-16 — Collapsible Settings Sections
**Complexity:** Low-Medium
**Where:** `src/pages/SettingsPage.tsx`

After removing Integrations and Notifications tabs (UI-10), the remaining Organization settings content is dense. Break it into collapsible sections.

**What to do:**

1. **Use the existing `src/components/ui/collapsible.tsx` or `src/components/ui/accordion.tsx`**
   - These shadcn/ui primitives already exist in the project

2. **Organize Organization settings into collapsible groups:**
   - **Profile** — Name, email, bio (user-level fields)
   - **Organization Details** — Org name, description, logo URL
   - **Location** — Address, city, state, zip
   - **Contact & Social** — Website, Instagram, phone, email
   - **Time Zone** — Timezone selector

3. **Default state:**
   - First section (Profile) expanded by default
   - Others collapsed
   - Sections remember their open/closed state within the session (useState is fine, no need for persistence)

**Acceptance:**
- Settings page has clearly labeled collapsible sections
- Clicking a section header expands/collapses it
- Only one section takes up visual space at a time (or allow multiple — use judgment)
- All existing functionality preserved, just reorganized

---

## File Reference

| Area | Key Files |
|------|-----------|
| Command Center shell | `src/components/producer/CommandCenter.tsx` |
| Mail tab | `src/components/producer/Email/EmailAutomationTab.tsx` |
| Email rows | `src/components/producer/Email/EmailRow.tsx`, `ScheduledEmailCard.tsx` |
| Email editor | `src/components/producer/Email/EmailEditorPage.tsx` |
| Template editor | `src/components/producer/Email/EmailTemplateEditorPage.tsx`, `TemplateBuilderPage.tsx` |
| Audit log | `src/components/producer/Email/EmailAuditTable.tsx`, `EmailAuditFilters.tsx` |
| Network page | `src/components/producer/Network/NetworkPage.tsx` |
| Network lists | `src/components/producer/Network/Lists/ListsManagement.tsx` |
| Shared category filter | `src/components/shared/CategoryFilterBar.tsx` |
| Settings (global) | `src/pages/SettingsPage.tsx` |
| Settings (event-level) | `src/components/producer/EventSettings.tsx` |
| Event wizard | `src/components/producer/CreateEventWizard/` |
| Wizard Step 2 | `src/components/producer/CreateEventWizard/steps/Step2ApplicationDetails.tsx` |
| UI primitives | `src/components/ui/` (accordion, collapsible, popover, badge, command, tooltip, dialog) |
| Background gradient | `src/components/ui/BackgroundGradient.tsx` |
| Existing shared | `src/components/shared/CategoryFilterBar.tsx`, `CategoryBadge.tsx`, `CategorySelector.tsx` |
| API service | `src/services/api.ts` |
| Auth context | `src/contexts/AuthContext.tsx` |

---

## Suggested Build Order

This order minimizes context-switching and lets you build on prior work:

1. **UI-10** — Remove Eventbrite/Notifications from Settings *(quick win, cleans up Settings for UI-16)*
2. **UI-16** — Collapsible Settings sections *(builds on the cleaned-up Settings page)*
3. **UI-12** — Card popup opacity *(trivial, ship it)*
4. **UI-14** — Default install date *(small, isolated change)*
5. **UI-01** — Hide Send Now before live *(small, isolated change)*
6. **UI-11** — Gradient treatment *(visual polish pass across email screens)*
7. **UI-05** — Standardize search/filter *(shared component, then retrofit)*
8. **UI-04** — Move Categories to Network *(biggest item, benefits from UI-05's shared filter)*
9. **UI-08** — Onboarding guide framework *(standalone, can be done in parallel)*

---

## Notes for the Engineer

- **Don't touch backend code.** All APIs are ready. If you hit a missing field or endpoint, flag it — don't build workarounds.
- **Use existing UI primitives.** The `src/components/ui/` directory has shadcn/ui components (accordion, collapsible, popover, dialog, badge, tooltip, etc.). Use them instead of building custom versions.
- **The event object** is the source of truth for status. It's passed from `Dashboard.tsx` → `CommandCenter.tsx` → child tabs. Check `event.published` or `event.status?.status` for live/draft gating.
- **Test with both draft and published events** to verify conditional rendering.
- **localStorage keys** for onboarding should be namespaced: `voxxy_onboarding_{guideId}_completed`.
- **Keep the onboarding guide generic.** The power is in reusability — defining a new guide should be as simple as passing an array of step objects.
