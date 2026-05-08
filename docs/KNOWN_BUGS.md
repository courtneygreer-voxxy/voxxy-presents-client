# Known Bugs & Issues

> **Last updated**: May 8, 2026
> **Frontend**: `voxxy-presents-client` (staging)
> **Backend**: `voxxy-rails-react` (staging)

Tracks known bugs, incomplete features, and issues to resolve before merging staging to `main`.

---

## What Was Completed

### Design & Branding
- Footer text changed from "Voxxy Presents" to "powered by VOXXY" on `PublicEventDetailPage` and `VendorApplicationForm`.
- Active nav tab now uses `--voxxy-grad-cta` gradient (matches CTA button style).
- Pricing page buttons replaced: removed thin shadcn `Button` in favour of direct `Link` elements using `voxxy-btn-cta` / `voxxy-btn-brand` CSS classes with proper padding (`px-5 py-3`, `px-8 py-4`).

### Legal Pages
- `LegalLayout` now calls `useForceTheme('light')` so all legal pages always render in light mode regardless of user's system/app dark mode setting.
- Nav uses explicit white/slate colours (`bg-white`, `text-slate-500`) so they never flip.
- Annotation boxes changed from `bg-card` → `bg-white border-violet-100` for explicit white rendering.
- All five legal pages have no `text-gray-*` hardcoded classes.

### Contacts Table (Network)
- Column order: Name, Business, Email, Location, Phone, Category, Social, Tags, Actions.
- Responsive grid using `minmax`/`1fr` so wide screens fill space instead of leaving empty right rail.
- Email column no longer truncated with `max-w-[140px]`.

### Applicants Tab (Command Center)
- Tab renamed "Vendors" → "Applicants".
- Dual view toggle: Focused (1-by-1) and Table view.
- Table view: columns are Name, Business, Email, Category, Status, Payment.
- Payment column shows "N/A" for non-approved/non-confirmed applicants.
- "Pending" status renamed to "New" throughout (badge and filters).
- Pagination at 100 items; cross-page select-all supported.
- N+1 query fix: `Promise.all` for concurrent submission fetching.

### Category Change Flow
- Consolidated into a single modal with an inline email-notification toggle.
- No separate `EmailNotificationDialog` for category changes.

### Network — Modal Standardisation
- `AddContactModal`, `EditContactModal`, and the Network category modal all use a consistent `max-w-2xl max-h-[82vh]` shell with gradient header and scrollable body.

### Network — Categories List View
- Changed from card grid to 1×1 row list (matching `TemplateLibraryPage` style).

### Category Payment Preferences (New Feature — Partially Complete)
- `CategoryFeePreference` interface added to `src/types/category.ts`.
- `payment_preferences: CategoryFeePreference[]` added to `Category`, `CreateCategoryData`, `UpdateCategoryData` (legacy flat fields kept for backwards compatibility).
- Category modal redesigned: removed flat Early Bird / Deposit / Payment Due date fields. Now has a structured "Add Fee Type" picker (Booth Fee, Early Bird Rate, Jury Fee, Commission, Per Piece Fee).
- Multiple entries of the same fee type are allowed; each entry has an editable label.
- "Add Fee Type" button is positioned outside the `overflow-y-auto` scroll area to prevent dropdown clipping.
- Modal widened to `max-w-xl` / `max-h-[90vh]`.
- Backend: `payment_preferences` JSONB column added to `categories` table via migration `20260506000002_add_payment_preferences_to_categories.rb`.
- Backend controller permits and serialises `payment_preferences`.

### Event Wizard — Payment Config (Step 2 + Step 3)
- `Step2ApplicationDetails` now reads `category.payment_preferences` and uses them to pre-populate `payment_prices` on the `ApplicationRow` (instead of always defaulting to a single Booth Fee entry).
- `Step3PaymentConfig` updated: "Add Fee Type" dropdown is click-based (not hover). All fee types are shown every time (multiples allowed per category).
- Early Bird auto-deadline preset: when `payment_deadline` is set, any `early_bird_price` entry without a deadline gets auto-set to one day before.

---

## Known Bugs — Must Resolve Before Merging to Main

### 🔴 BUG 1: Payment Preferences Never Persist to Vendor Applications (4-Layer Failure)

**Symptom**: When saving payment preferences to a category (e.g. Booth Fee + Early Bird + Jury Fee), the wizard always falls back to showing only "Booth Fee". The category modal saves preferences correctly, but they're lost when creating vendor applications during event creation.

**5 Whys Root Cause**:
1. Step 2 reads `category.payment_preferences` and populates `app.payment_prices` correctly ✅
2. But `Dashboard.tsx` lines 481–482 are **commented out** — `payment_prices` is never sent to the API
3. The TODO says "Backend needs payment_prices (jsonb) columns" — backend isn't ready
4. `vendor_applications` table has no `payment_prices` JSONB column, strong params don't permit it
5. The category-level feature was built but the **downstream consumer** (vendor applications) was never wired up

**Failure chain** (all 4 layers must be fixed):

| Layer | File | Issue |
|-------|------|-------|
| Frontend call | `src/pages/Dashboard.tsx:481-482` | `payment_prices` commented out in `vendorApplicationsApi.create()` call |
| API type | `src/services/api.ts:1001-1018` | `vendorApplicationsApi.create()` signature missing `payment_prices` (but `update()` has it) |
| Backend params | `voxxy-rails-react/.../vendor_applications_controller.rb:155-169` | `vendor_application_params` doesn't permit `payment_prices` |
| Database | `voxxy-rails-react/db/schema.rb` | `vendor_applications` table missing `payment_prices` JSONB column |

**3 Proposed Fixes** (ranked by scope):

**Fix A — Full pipeline (recommended):**
1. Migration: add `payment_prices` and `payment_engines` JSONB columns to `vendor_applications`
2. Backend: permit in strong params + serialize in response
3. Frontend: uncomment Dashboard.tsx lines 481-482, add fields to `create()` type signature

**Fix B — Read-through from category (lighter):**
- Skip storing on vendor_applications entirely
- Have Step 2/Step 3 always read `category.payment_preferences` from the category API
- Trade-off: payment prices can't diverge per-application within a category

**Fix C — Frontend-only workaround (temporary):**
- Store payment_prices in local wizard state and pass through the wizard steps
- Don't persist to backend — only use for display during event creation
- Trade-off: data lost on page refresh, not available outside wizard

---

### 🟡 BUG 2: Wizard Allows Duplicate Fee Types (All Types, Not Just Early Bird)

**Symptom**: In Step 3 of the event wizard, any fee type (Booth Fee, Jury Fee, etc.) can be added multiple times. The intention is that only "Early Bird Rate" should be addable multiple times (to support tiered early bird pricing). All other types should be de-duplicated.

**Root cause**: The duplicate guard (`if (app.payment_prices.some(p => p.type === type)) return;`) was fully removed in `Step3PaymentConfig.tsx` when it should have been changed to only allow duplicates for `early_bird_price`.

**Fix needed** in `Step3PaymentConfig.tsx` — `addPaymentPrice`:
```typescript
const addPaymentPrice = (appId: string, type: PaymentPriceType) => {
  const app = applicationDetails.applications.find(a => a.id === appId);
  if (!app) return;

  // Only early bird rate can be added multiple times (tiered pricing)
  if (type !== 'early_bird_price' && app.payment_prices.some(p => p.type === type)) return;

  const priceType = PAYMENT_PRICE_TYPES.find(p => p.value === type);
  const newEntry: PaymentPriceEntry = {
    type,
    label: priceType?.label || type,
    amount: 0,
    is_percentage: priceType?.isPercentage || false,
  };

  updateApplication(appId, {
    payment_prices: [...app.payment_prices, newEntry],
  });
};
```

Also apply the same rule to `getAvailablePriceTypes` — filter out already-added types _except_ `early_bird_price`:
```typescript
const getAvailablePriceTypes = (app: ApplicationRow) => {
  return PAYMENT_PRICE_TYPES.filter(pt => {
    if (pt.value === 'custom') return false;
    if (pt.value === 'early_bird_price') return true; // always show for tiered pricing
    return !app.payment_prices.some(p => p.type === pt.value);
  });
};
```

Apply the same logic to the category modal (`NetworkPage.tsx` — `addFeeType` and `availableFeeTypes`).

**Files**:
- `src/components/producer/CreateEventWizard/steps/Step3PaymentConfig.tsx`
- `src/components/producer/Network/NetworkPage.tsx`

---

### 🟡 BUG 3: Pending Rails Migration Blocks Dev Login

**Symptom**: Attempting to log in locally returns "Dev login failed" with `ActiveRecord::PendingMigrationError` in Rails logs.

**Fix**: In the `voxxy-rails-react` repo terminal:
```bash
bin/rails db:migrate
rails s -p 3001
```

Migration file: `db/migrate/20260506000002_add_payment_preferences_to_categories.rb`

---

### 🟢 MINOR: Wizard "Add Fee Type" Dropdown Shows All Types Even When Already Added (Non-Early-Bird)

Covered by Bug 2 above — fix `getAvailablePriceTypes` to filter per-type.

---

### 🟡 BUG 4: EditContactModal Inputs Missing `voxxy-input-frost` Class (RL-010)

**Symptom**: All 12+ input fields in `EditContactModal` use raw inline styling (`bg-background/10 border border-border ...`) instead of the standard `voxxy-input-frost` class required for producer-app forms.

**Fix needed**: Replace the raw input className pattern with `voxxy-input-frost` across all `<input>` and `<textarea>` elements in the modal.

**Files**:
- `src/components/producer/Network/EditContactModal.tsx`

---

### 🔴 BUG 9: Payment Email Scheduling Fails on Event Creation ("Scheduled for can't be blank")

**Symptom**: Creating an event with a universal email sequence produces 3 errors:
```
"Failed to create '1 Day Before Payment Due': Scheduled for can't be blank"
"Failed to create 'Payment Due Today': Scheduled for can't be blank"
"Failed to create 'Payment Overdue': Scheduled for can't be blank"
```

**5 Whys Root Cause**:
1. `ScheduledEmail` model validates `scheduled_for` presence for non-event-triggered emails
2. `EmailScheduleCalculator` returns `nil` for payment emails because `event.payment_deadline` is `nil`
3. The calculator early-returns: `return nil unless event.payment_deadline`
4. `payment_deadline` is optional in Step 3 — users can create events without setting it
5. But the 3 payment email templates are `enabled_by_default: true` in seeds — they always try to schedule, even when there's no deadline to calculate from

**Connected to Bug 1**: The payment feature was partially built. `payment_deadline` was made optional for flexible pricing, but the email templates that depend on it were never updated.

**Files**:
- `voxxy-rails-react/app/services/email_schedule_calculator.rb:110-128` — returns nil when deadline missing
- `voxxy-rails-react/app/services/scheduled_email_generator.rb:36-222` — generates all enabled templates
- `voxxy-rails-react/app/models/scheduled_email.rb:15-16` — validates `scheduled_for` presence
- `voxxy-rails-react/db/seeds/email_campaign_templates.rb:410-511` — 3 payment templates enabled by default
- `src/components/producer/CreateEventWizard/steps/Step3PaymentConfig.tsx:252-272` — optional deadline field

**3 Proposed Fixes** (ranked):

**Fix A — Guard in generator (recommended, lowest risk):**
- In `ScheduledEmailGenerator`, skip payment-trigger emails when `event.payment_deadline` is blank
- Add: `next if item.trigger_type.include?('payment') && event.payment_deadline.blank?`
- No schema changes, no frontend changes, backwards-compatible

**Fix B — Make payment_deadline required when payment emails are enabled:**
- Frontend: validate that `payment_deadline` is set in Step 3 if any payment fee types exist
- Backend: add conditional validation on Event model
- Trade-off: forces users to set a deadline, may not match all workflows

**Fix C — Change payment emails to event-triggered:**
- Mark the 3 payment templates as `event_triggered` instead of time-based
- Create them with `scheduled_for: nil` and calculate later when `payment_deadline` is set
- Trade-off: requires new trigger mechanism, more complex

---

### 🟡 BUG 5: LegalLayout Uses Inline Hex Gradient (RL-001 / RL-002)

---

### 🟡 BUG 6: Vendor Portal — Dark Mode Colours Need Adjustment (RL-001)

**Symptom**: The vendor portal page canvas and hero overlay use raw hex dark-mode gradients (`#120b1c`, `#1a1228`) that need to be tuned to match the central dark mode style guide.

**Fix needed**: Align gradient stops in `VendorPortalPageCanvas.tsx` and `VendorEventPortalPage.tsx` (hero overlay) with the `--voxxy-*` dark palette or extract to a shared CSS class.

**Files**:
- `src/components/vendor-portal/VendorPortalPageCanvas.tsx`
- `src/pages/VendorEventPortalPage.tsx` (hero overlay ~line 376)

---

### 🟡 BUG 7: Vendor Portal — FAQ Section Is Hardcoded (Hide Until Editable)

**Symptom**: The `VendorPortalFaq` component renders hardcoded FAQ content. There is no producer-facing UI to create or edit FAQ entries yet.

**Decision pending**: Should FAQ editing live in the **Create Event Wizard** or in the **Event Settings / Command Center**? Until decided and built, the FAQ section should be hidden from the portal.

**Fix needed**: Conditionally hide `<VendorPortalFaq />` render in `VendorEventPortalPage.tsx` (e.g. behind a feature flag or simply comment out) until the editing flow is implemented.

**Files**:
- `src/pages/VendorEventPortalPage.tsx`
- `src/components/vendor-portal/VendorPortalFaq.tsx`

---

### 🟡 BUG 8: Vendor Portal — Hero Banner Image Upload Not Persisting

**Symptom**: Producers can pick a hero banner image via the uploader UI, but the image is only held in local state (preview URL). It is not saved to the backend — there is no attachment endpoint or model field for it yet.

**Fix needed (backend + frontend)**:
1. Backend: Add an Active Storage attachment (e.g. `has_one_attached :portal_banner`) to the Event model, expose an upload endpoint.
2. Frontend: POST the selected file to the new endpoint on save, load the persisted URL on portal render instead of relying on local blob preview.

**Files**:
- `src/pages/VendorEventPortalPage.tsx` (banner state + upload handlers)
- `src/components/vendor-portal/VendorPortalHero.tsx` (displays banner)
- Backend: Event model + controller (TBD)

---

**Symptom**: `LegalLayout.tsx` line 25 uses `style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 40%, #f0f4ff 100%)' }}` — raw hex values and inline style.

**Context**: This is intentional for the forced-light legal pages (`useForceTheme('light')`). Standard dark-mode tokens don't apply here. Low priority but should be extracted to a CSS class (e.g. `voxxy-legal-bg`) in `src/index.css` for consistency.

**Files**:
- `src/components/legal/LegalLayout.tsx`
- `src/index.css` (target for new class)

---

## Resolved (Merged to Staging)

- [x] ~~Bug 1~~ — Payment preferences 4-layer fix (PR #105 backend + PR #87 frontend)
- [x] ~~Bug 2~~ — Fee type limits enforced (max 3 early birds, 1 of each other)
- [x] ~~Bug 3~~ — Pending migration resolved (migrations ran on staging)
- [x] ~~Bug 7~~ — FAQ section hidden until backend editing UI exists
- [x] ~~Bug 9~~ — Payment email scheduling fixed (`.to_date` + required deadline in wizard)

---

## Open Issues — Before Merging to Main

- [ ] Bug 4 (EditContactModal inputs → `voxxy-input-frost`)
- [ ] Bug 5 (LegalLayout inline hex gradient → CSS class)
- [ ] Bug 6 (Vendor portal dark mode colours → align with style guide)
- [ ] Bug 8 (Hero banner upload — backend attachment + frontend persistence)
- [ ] Bug 10 (Vendor portal login page — verify auth path, unknown login page discovered)
- [ ] Bug 11 (Vendor portal color theme — purple/gradient tones don't match producer app palette)
- [ ] Smoke test: add a category with mixed fee types, create event, confirm Step 3 pre-populates
- [ ] Verify legal pages look correct in both dark and light system theme
- [ ] Retro: review all Sentry alerts for related regressions

---

### 🟡 BUG 10: Vendor Portal — Auth Path / Login Page Needs Verification

**Symptom**: The portal has its own email-based login gate (`VendorEventPortalPage.tsx`). Need to verify this auth flow works correctly and doesn't conflict with the main app login. Confirm whether the portal login page is intentional or if vendors should use the standard auth flow.

**Files**:
- `src/pages/VendorEventPortalPage.tsx` (email gate ~line 369-451)
- `src/services/eventPortalService.ts` (portal access verification)

---

### 🟡 BUG 11: Vendor Portal — Color Theme Mismatch

**Symptom**: The event portal auth page, hero overlay, and section cards use purple/violet gradients and hex values (`#120b1c`, `#1a1228`) that don't match the central `--voxxy-*` token palette used in the producer app. The portal should feel like the same product.

**Fix needed**: Audit all portal components against `STYLE_GUIDE.md` and replace raw hex values with CSS tokens or `voxxy-*` utility classes.

**Files**:
- `src/components/vendor-portal/VendorPortalPageCanvas.tsx`
- `src/components/vendor-portal/VendorPortalHero.tsx`
- `src/components/vendor-portal/VendorPortalSection.tsx`
- `src/pages/VendorEventPortalPage.tsx`

---

## Test Coverage

All 83 frontend unit tests pass on this branch (after rebase onto staging which added API error handling + email preview tests). Key test files:

| File | Coverage |
|---|---|
| `src/test/features/applicantsTab.test.ts` | Applicants tab dual-view, pagination, category change flow |
| `src/test/features/categoryPaymentFields.test.ts` | `CategoryFeePreference` types, `payment_preferences` modal, wizard prefill |
| `src/test/features/legalLayout.test.ts` | `useForceTheme('light')`, no dark-mode-sensitive classes |
| `src/test/features/publicEventFooter.test.ts` | "powered by VOXXY" footer text |
| `src/services/auth.test.ts` | Token management |

---

## Backend Changes Summary (`voxxy-rails-react`)

| File | Change |
|---|---|
| `db/migrate/20260506000001_add_payment_extension_to_categories.rb` | Legacy flat payment fields (booth_price, early_bird_price, etc.) |
| `db/migrate/20260506000002_add_payment_preferences_to_categories.rb` | JSONB `payment_preferences` column |
| `app/controllers/api/v1/presents/categories_controller.rb` | Permits + serialises `payment_preferences` |

> **Note**: Both migrations must be run on the staging database. Confirm with `rails db:migrate:status`.
