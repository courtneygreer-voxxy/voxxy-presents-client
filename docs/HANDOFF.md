# Developer Handoff — UI Polish + Payment Preferences Sprint

> **Branch**: `feature/design-tweaks-and-applicants` → merge target: `staging`
> **Date**: May 2026
> **Backend branch**: `feature/category-payment-fields` in `voxxy-rails-react`

This document is intended for the next developer (or agent) picking up this work. It summarises what was completed, what is partially working, and the known bugs that must be resolved **before merging to `main`**.

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

### 🔴 BUG 1: Wizard Shows Booth Fee Instead of Saved Preferences

**Symptom**: When creating a new event and selecting a category that has saved `payment_preferences`, Step 3 of the wizard still shows only "Booth Fee" instead of the saved preferences.

**Root cause**: The pre-fill logic in `Step2ApplicationDetails` reads `category.payment_preferences`, but the API response from `/organizations/:id/categories` may not be returning the new `payment_preferences` field yet. The backend migration may need to be run (`bin/rails db:migrate`) and the serialiser output should be verified to confirm `payment_preferences` is included.

**How to verify**:
1. Run `bin/rails db:migrate` in `voxxy-rails-react`.
2. In `CategoriesController#serialize_category`, confirm `payment_preferences: category.payment_preferences || []` is present.
3. Add a category with payment preferences via the Network UI.
4. Check the API response at `/api/v1/presents/organizations/:id/categories` and confirm `payment_preferences` is included.
5. Create a new event with that category; Step 3 should pre-populate.

**Files**:
- `voxxy-rails-react/app/controllers/api/v1/presents/categories_controller.rb` — `serialize_category`
- `src/components/producer/CreateEventWizard/steps/Step2ApplicationDetails.tsx` — lines ~132–145

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

### 🟡 BUG 5: LegalLayout Uses Inline Hex Gradient (RL-001 / RL-002)

**Symptom**: `LegalLayout.tsx` line 25 uses `style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 40%, #f0f4ff 100%)' }}` — raw hex values and inline style.

**Context**: This is intentional for the forced-light legal pages (`useForceTheme('light')`). Standard dark-mode tokens don't apply here. Low priority but should be extracted to a CSS class (e.g. `voxxy-legal-bg`) in `src/index.css` for consistency.

**Files**:
- `src/components/legal/LegalLayout.tsx`
- `src/index.css` (target for new class)

---

## Before Opening the PR to Main

- [ ] Resolve Bug 1 (verify API serialises `payment_preferences`)
- [ ] Resolve Bug 2 (enforce single-instance for non-early-bird types in wizard + category modal)
- [ ] Resolve Bug 4 (EditContactModal inputs → `voxxy-input-frost`)
- [ ] Resolve Bug 5 (LegalLayout inline hex gradient → CSS class)
- [ ] Confirm `bin/rails db:migrate` has been run on staging DB
- [ ] Run all unit tests: `npm run test:run` — expect 83 passing
- [ ] Smoke test: add a category with mixed fee types, create an event with that category, confirm Step 3 pre-populates correctly
- [ ] Verify legal pages look correct in both dark and light system theme
- [ ] Verify pricing page "Request Access" buttons render at proper size

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
