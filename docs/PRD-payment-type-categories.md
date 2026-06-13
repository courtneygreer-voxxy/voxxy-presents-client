# PRD: Payment Type Categories Extension

**Branch:** `feature/payment-type-categories` (frontend-only prototype)
**Date:** May 5, 2026
**Status:** Frontend complete, pending team review and backend integration

---

## 1. Problem Statement

Voxxy Presents currently supports a single pricing model per applicant category: a fixed booth price. Art show and market producers need richer payment options (early bird pricing, commission on sales, per-piece fees, jury fees) and the ability to choose payment engines (Eventbrite, Venmo, PayPal, etc.) to prepare for automatic payment sync.

Additionally, contact records in the Network Tab need payment-related fields (Eventbrite email, Venmo handle, PayPal email) to enable future sync matching, and the Command Center vendor detail panel needs social media editing and visibility improvements.

---

## 2. User Flow Changes

### 2.1 Create Event Wizard: 4 Steps -> 6 Steps

The wizard has been expanded from 4 steps to 6 to separate concerns and reduce per-step complexity.

| Step | Name                  | What Changed                                                                                                                                                                                                          |
| ---- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Event Details         | **Added** application deadline field (moved from old Step 2). All key dates are now visible together: event date, end date, start/end time, and application deadline.                                                 |
| 2    | Applicant Categories  | **Removed** booth price, payment link, and application deadline fields (moved to Steps 1 & 3). Now focused purely on category selection and per-category config (description, install times, tags).                   |
| 3    | Payment Configuration | **NEW step.** Event-level currency selector, payment deadline, and payment method selection. Per-category fee types (booth fee, early bird, commission, per-piece, jury fee) with amounts. Per-category payment link. |
| 4    | Email Customization   | Same as before (renumbered from old Step 4). Event-wide and category template selection.                                                                                                                              |
| 5    | Invite List           | Same as before (renumbered from old Step 3). Contact and list selection.                                                                                                                                              |
| 6    | Review Details        | **NEW step.** Read-only summary of all wizard data with "Edit" buttons that jump back to the relevant step. Submit button lives here.                                                                                 |

### 2.2 Why This Structure

- **Step 1 consolidates all dates** so producers see event date, end date, and application deadline together for quick reference
- **Step 2 focuses on categories only** without pricing noise, making it faster to set up the category structure
- **Step 3 separates payment** into its own dedicated step with event-level settings (currency, payment methods) and per-category pricing, which is the most complex part of event setup
- **Step 6 review** prevents accidental misconfiguration by giving producers a final check before creation

### 2.3 Command Center Vendor Tab

- **Social & Links section** now always renders with a fallback message when no social data exists (previously invisible when empty)
- **Producer Notes** now always renders with a fallback message (previously hidden when empty)
- **Edit Vendor Details modal** now includes Instagram, TikTok, and Website fields under a "Social & Links" section
- Social handles display the actual handle text (e.g. `@mayarodriguezmusic`) instead of generic "Instagram" label
- **Application Code** now displays in the Contact Info Grid when a vendor has applied, with a copy-to-clipboard button. The code (e.g. `EVENT-202511-A1B2C3`) comes from `VendorApplication.shareable_code` and is already returned by the backend `RegistrationSerializer` as `application_code`. Only shows for vendors who have submitted an application (not invited-only contacts).

### 2.4 Network Tab Contacts

- **Add/Edit Contact modals** include a new "Payment Information" section with fields for Eventbrite Email, Venmo Handle, and PayPal Email
- **CSV template** includes new optional columns for these payment fields

---

## 3. New Data Types

All defined in `src/components/producer/CreateEventWizard/types.ts`:

### PaymentPriceType

```typescript
type PaymentPriceType =
  | 'booth_price' // Fixed booth fee (existing concept)
  | 'early_bird_price' // Discounted rate before deadline
  | 'percentage_of_sales' // Commission on sales (art shows)
  | 'price_per_piece' // Per-artwork or per-item fee
  | 'jury_fee' // Non-refundable application/jury fee
```

### PaymentPriceEntry

```typescript
interface PaymentPriceEntry {
  type: PaymentPriceType
  label: string // Display label
  amount: number // Dollar amount or percentage value
  is_percentage: boolean // true for percentage_of_sales
  description?: string // Optional note
  early_bird_deadline?: string // ISO date, only for early_bird_price
}
```

### PaymentEngine & PaymentEngineConfig

```typescript
type PaymentEngine = 'eventbrite' | 'venmo' | 'paypal' | 'stripe' | 'zelle' | 'cash_check' | 'other'

interface PaymentEngineConfig {
  engine: PaymentEngine
  label: string
  payment_link?: string
  instructions?: string
  collect_app_code: boolean
}
```

### CurrencyCode

```typescript
type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
```

### Updated WizardState

```typescript
interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 // was 1 | 2 | 3 | 4

  eventDetails: {
    // ... existing fields ...
    application_deadline: string // MOVED here from Step 2
  }

  applicationDetails: {
    applications: ApplicationRow[] // ApplicationRow now includes payment_prices[] and payment_engines[]
  }

  // NEW
  paymentConfiguration: {
    currency: CurrencyCode
    payment_deadline?: string
    payment_engines?: PaymentEngineConfig[] // Event-level payment methods
  }

  automaticMessages: {
    /* unchanged */
  }
  inviteList: {
    /* unchanged */
  }
}
```

---

## 4. Frontend Changes (Complete)

### 4.1 New Files Created

| File                                                                     | Purpose                                                                                               |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `src/components/producer/CreateEventWizard/steps/Step3PaymentConfig.tsx` | New Step 3 - event-level currency/deadline/payment methods + per-category fee types and payment links |
| `src/components/producer/CreateEventWizard/steps/Step6ReviewDetails.tsx` | New Step 6 - read-only review of all wizard state with edit buttons per section                       |

### 4.2 Modified Files

| File                             | Changes                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **types.ts** (CreateEventWizard) | Added `PaymentPriceType`, `PaymentPriceEntry`, `PaymentEngine`, `PaymentEngineConfig`, `CurrencyCode` types. Added constants `SUPPORTED_CURRENCIES`, `PAYMENT_PRICE_TYPES`, `PAYMENT_ENGINES`. Extended `ApplicationRow` with `payment_prices[]` and `payment_engines[]`. Added `paymentConfiguration` to `WizardState`. Changed `WizardStep` from `1\|2\|3\|4` to `1\|2\|3\|4\|5\|6`. |
| **CreateEventWizard.tsx**        | Updated initial state with `paymentConfiguration`. Added imports for Step3/Step6. Updated `renderCurrentStep()` for 6 steps. Added `validateStep3()` for payment validation. Moved application deadline validation from `validateStep2` to `validateStep1`. Updated navigation bounds (max step 6).                                                                                    |
| **WizardProgress.tsx**           | Updated step labels to 6 items. Changed loop and connector conditions. Updated mobile text "Step X of 6".                                                                                                                                                                                                                                                                              |
| **WizardNavigation.tsx**         | Updated `currentStep` type to accept `1\|2\|3\|4\|5\|6`.                                                                                                                                                                                                                                                                                                                               |
| **Step1EventDetails.tsx**        | **Added** application deadline field (moved from Step 2). Updated dev prefill to include application deadline.                                                                                                                                                                                                                                                                         |
| **Step2ApplicationDetails.tsx**  | **Removed** booth_price input, payment_link input, and application deadline field (all moved to Steps 1 & 3). Now initializes `payment_prices[]` with booth fee from category defaults when selecting a category.                                                                                                                                                                      |
| **Step4AutoMessages.tsx**        | Fixed universal template lookup to fall back to first `category` type template when no `is_universal: true` exists. Removed preview buttons from inside the sequence list modal.                                                                                                                                                                                                       |
| **ApplicantsTab.tsx**            | Social & Links section now shows fallback message when empty, displays actual handle text. Producer Notes always visible with fallback. Updated `handleEditVendorSaved` and modal props to include social fields.                                                                                                                                                                      |
| **EditVendorDetailsModal.tsx**   | Added Instagram, TikTok, and Website fields in a "Social & Links" section. Sends these fields to API on save (backend will silently drop until `update_params` is updated).                                                                                                                                                                                                            |
| **AddContactModal.tsx**          | Added "Payment Information" section with Eventbrite Email, Venmo Handle, PayPal Email fields.                                                                                                                                                                                                                                                                                          |
| **EditContactModal.tsx**         | Same payment information fields as AddContactModal.                                                                                                                                                                                                                                                                                                                                    |
| **CSVUploadModal.tsx**           | Added payment fields to optional CSV headers.                                                                                                                                                                                                                                                                                                                                          |
| **csvTemplateGenerator.ts**      | Added Eventbrite Email, Venmo Handle, PayPal Email columns to CSV template.                                                                                                                                                                                                                                                                                                            |
| **Dashboard.tsx**                | Updated `handleCreateEvent` to read `payment_deadline` from `paymentConfiguration` instead of `eventDetails`. Derives `booth_price` from `payment_prices[0]` for backward compatibility.                                                                                                                                                                                               |
| **api.ts**                       | Extended `registrationsApi.update()` type to include `instagram_handle`, `tiktok_handle`, `website`. Extended `vendorContactsApi.create()` type to include `eventbrite_email`, `venmo_handle`, `paypal_email`.                                                                                                                                                                         |
| **emailVariables.ts**            | Added 7 new email template variables: `[earlyBirdPrice]`, `[earlyBirdDeadline]`, `[juryFee]`, `[commissionRate]`, `[eventbriteEmail]`, `[venmoHandle]`, `[paypalEmail]`.                                                                                                                                                                                                               |
| **LoginPage.tsx**                | Fixed dev login password from `test123` to `password123` to match seed data.                                                                                                                                                                                                                                                                                                           |

### 4.3 Validation Rules

**Step 1 (Event Details):**

- Event name required, min 3 alphanumeric characters
- Event date required, must be in the future
- End date must be on or after start date
- Location required
- Application deadline required, must be on or before event date

**Step 2 (Applicant Categories):**

- At least one category required
- Each category must have a unique name

**Step 3 (Payment Configuration):**

- Each category must have at least one fee type with amount > 0
- Percentage values must be between 0.01 and 100
- Early bird deadline required when early bird fee is used
- Early bird deadline must be before payment deadline

**Steps 4-6:** Optional/always valid

---

## 5. Backend Changes Required

These changes are needed to fully support the frontend prototype. The frontend currently sends this data, but it will be silently dropped by Rails strong params until these changes are made.

### 5.1 Database Migrations

```ruby
# Migration 1: vendor_contacts payment fields
add_column :vendor_contacts, :eventbrite_email, :string
add_column :vendor_contacts, :venmo_handle, :string
add_column :vendor_contacts, :paypal_email, :string

# Migration 2: vendor_applications payment data
add_column :vendor_applications, :payment_prices, :jsonb, default: []
add_column :vendor_applications, :payment_engines, :jsonb, default: []
add_column :vendor_applications, :early_bird_deadline, :date

# Migration 3: events currency (may already exist)
# vendor_fee_currency column may already exist on events table
# If not: add_column :events, :vendor_fee_currency, :string, default: 'USD'
```

### 5.2 Controller Changes

**`registrations_controller.rb`** - `update_params`:

```ruby
# CURRENT:
def update_params
  params.require(:registration).permit(:name, :phone, :status, :vendor_category,
    :payment_status, :location, :producer_notes, tags: [])
end

# NEEDED (add social fields):
def update_params
  params.require(:registration).permit(:name, :phone, :status, :vendor_category,
    :payment_status, :location, :producer_notes, :instagram_handle,
    :tiktok_handle, :website, tags: [])
end
```

**`vendor_contacts_controller.rb`** - Add to permitted params:

```ruby
:eventbrite_email, :venmo_handle, :paypal_email
```

**`vendor_applications_controller.rb`** - Add to permitted params:

```ruby
:payment_prices, :payment_engines  # These are JSONB columns
```

**`events_controller.rb`** - Add to permitted params:

```ruby
:vendor_fee_currency, :vendor_payment_link, :vendor_fee_amount, :payment_engines
```

### 5.3 Serializer Changes (for Command Center read)

The Command Center EventSettings now displays a Payment Configuration section that reads payment data from the API. The following serializer changes are needed:

**`EventSerializer`** - Include in JSON response:

```ruby
# Already present: payment_deadline
# Add:
:vendor_fee_currency   # String, default 'USD'
:payment_engines       # JSONB array of { engine, label, collect_app_code }
```

**`VendorApplicationSerializer`** - Include in JSON response:

```ruby
# Already present: booth_price (via pricing), payment_link
# Add:
:payment_prices   # JSONB array of { type, label, amount, is_percentage, description, early_bird_deadline }
:payment_engines  # JSONB array (per-category engines, if any)
:category_id      # Integer - the linked category ID
:category_color   # String - from the linked Category record (for display)
:category_icon    # String - from the linked Category record (for display)
```

**Why:** The frontend EventSettings component transforms `vendor_applications` into `ApplicationRow[]` format and passes them to `Step3PaymentConfig` for inline editing. Without these fields in the serializer response, the UI falls back to a single `booth_price` entry.

### 5.4 Email Variable Resolver

**`base_variable_resolver.rb`** (or equivalent) - Add resolvers for:

| Variable              | Source                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `[earlyBirdPrice]`    | `vendor_application.payment_prices.find { \|p\| p['type'] == 'early_bird_price' }&.dig('amount')`    |
| `[earlyBirdDeadline]` | `vendor_application.early_bird_deadline` or from `payment_prices` JSON                               |
| `[juryFee]`           | `vendor_application.payment_prices.find { \|p\| p['type'] == 'jury_fee' }&.dig('amount')`            |
| `[commissionRate]`    | `vendor_application.payment_prices.find { \|p\| p['type'] == 'percentage_of_sales' }&.dig('amount')` |
| `[eventbriteEmail]`   | `vendor_contact.eventbrite_email`                                                                    |
| `[venmoHandle]`       | `vendor_contact.venmo_handle`                                                                        |
| `[paypalEmail]`       | `vendor_contact.paypal_email`                                                                        |

### 5.5 Event Creation Endpoint

The frontend currently sends `booth_price` per application for backward compatibility. When the backend is ready, the event creation flow in `Dashboard.tsx` should be updated to also send:

```json
{
  "vendor_application": {
    "payment_prices": [
      { "type": "booth_price", "label": "Booth Fee", "amount": 350, "is_percentage": false },
      {
        "type": "early_bird_price",
        "label": "Early Bird Rate",
        "amount": 275,
        "is_percentage": false,
        "early_bird_deadline": "2026-06-01"
      }
    ],
    "payment_engines": []
  },
  "event": {
    "vendor_fee_currency": "USD"
  }
}
```

The `payment_engines` are now event-level (stored in `paymentConfiguration.payment_engines` on the frontend), so the backend should associate them with the event rather than individual vendor_applications.

---

## 6. Backward Compatibility

| Concern                                           | Mitigation                                                                                                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `booth_price` field removal from Step 2           | `booth_price` is still on `ApplicationRow` and synced from `payment_prices[0]` in Step 3. Dashboard submission still sends `booth_price` per application. |
| `payment_deadline` moved from eventDetails        | `Dashboard.tsx` now reads from `paymentConfiguration.payment_deadline`. Backend already has this column on events.                                        |
| Contact payment fields rejected by backend        | Rails strong params silently drops unknown attributes. Contacts still create/update with standard fields.                                                 |
| Registration social fields not in `update_params` | Frontend sends them, backend drops them silently. Once backend adds to `update_params`, it works immediately.                                             |
| Existing events                                   | Unaffected. This only changes the create flow. Existing events continue to work through command center.                                                   |

---

## 7. Integration Paths

The backend engineer can take one of two approaches:

### Option A: Start fresh from staging

1. Pull `staging` branch
2. Use this PRD to build the backend changes
3. Once backend is ready, merge `feature/payment-type-categories` into staging
4. Test the full flow end-to-end

### Option B: Merge this branch, then add backend

1. Merge `feature/payment-type-categories` into a working branch
2. Build backend changes against the new frontend
3. The frontend is already sending the right data shapes - just needs backend to accept and persist them
4. Test incrementally as each backend piece lands

**Recommendation:** Option B is safer because the frontend types define the exact data contracts the backend needs to implement.

---

## 8. Risk Assessment

| Risk                                             | Level      | Detail                                                                                                                                                                                                                    |
| ------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step numbering ripple                            | **Low**    | All type changes are in `types.ts`. TypeScript compiler catches all breakages. Already verified - zero TS errors.                                                                                                         |
| `payment_prices` JSONB validation                | **Medium** | Backend should validate the JSON structure on write. Bad data in JSONB is hard to debug. Consider adding a JSON schema or model-level validation.                                                                         |
| `payment_engines` at event level vs per-category | **Medium** | Frontend stores engines at event level (`paymentConfiguration.payment_engines`). Backend needs to decide: store on events table or in a join table. Per-category `payment_link` is still stored on `vendor_applications`. |
| Email variables without resolvers                | **Low**    | New variables (`[earlyBirdPrice]`, etc.) appear in the email editor picker but render as literal text until backend resolvers are added. No breakage.                                                                     |
| CSV import with new columns                      | **Low**    | New payment columns are optional in the CSV template. Import service should handle missing columns gracefully (it already does for other optional fields).                                                                |
| Early bird deadline vs payment deadline ordering | **Low**    | Frontend validates early bird deadline < payment deadline. Backend should enforce this too.                                                                                                                               |

---

## 9. Testing Checklist

### Wizard Flow

- [ ] All 6 steps render in correct order with correct labels
- [ ] Progress indicator shows 6 steps with proper navigation
- [ ] Can click completed steps to jump back, cannot skip ahead
- [ ] Submit button only appears on Step 6
- [ ] Application deadline shows on Step 1 with validation
- [ ] Application deadline no longer appears on Step 2

### Step 3 (Payment Configuration)

- [ ] Currency selector defaults to USD
- [ ] Payment deadline date picker works
- [ ] Payment methods (event-level) toggle on/off correctly
- [ ] Each category from Step 2 appears as a card
- [ ] Can add/remove fee types per category (booth, early bird, jury, commission, per-piece)
- [ ] Early bird shows deadline picker; commission shows percentage input
- [ ] Per-category payment link field works
- [ ] Validation: each category needs at least one fee type > $0
- [ ] Navigate back to Step 2, change categories, Step 3 reflects changes

### Step 6 (Review Details)

- [ ] All wizard data displays correctly in read-only format
- [ ] Edit buttons jump to correct steps
- [ ] Payment methods show at event level
- [ ] Per-category fees and payment links show correctly
- [ ] Event creates successfully from review step

### Command Center

- [ ] Social & Links section always visible (shows fallback when empty)
- [ ] Social handles display actual text (e.g. `@handle`)
- [ ] Producer Notes always visible (shows fallback when empty)
- [ ] Edit Details modal includes Instagram, TikTok, Website fields
- [ ] Saving social fields updates the detail panel immediately

### Network Tab

- [ ] Add/Edit Contact modals show Payment Information section
- [ ] CSV template includes Eventbrite Email, Venmo Handle, PayPal Email
- [ ] Contact creation still works (backend ignores unknown fields)

### Edge Cases

- [ ] Single category with single fee type (simplest case)
- [ ] 5+ categories with different payment configurations
- [ ] Empty fee types list (validation should catch)
- [ ] Early bird deadline after payment deadline (validation should catch)
- [ ] Percentage > 100 (validation should catch)

---

## 10. Files Changed Summary

**19 files total** (17 modified, 2 new)

```
NEW FILES:
  src/components/producer/CreateEventWizard/steps/Step3PaymentConfig.tsx
  src/components/producer/CreateEventWizard/steps/Step6ReviewDetails.tsx

MODIFIED (Wizard):
  src/components/producer/CreateEventWizard/types.ts
  src/components/producer/CreateEventWizard/CreateEventWizard.tsx
  src/components/producer/CreateEventWizard/WizardProgress.tsx
  src/components/producer/CreateEventWizard/WizardNavigation.tsx
  src/components/producer/CreateEventWizard/steps/Step1EventDetails.tsx
  src/components/producer/CreateEventWizard/steps/Step2ApplicationDetails.tsx
  src/components/producer/CreateEventWizard/steps/Step4AutoMessages.tsx

MODIFIED (Command Center):
  src/components/producer/ApplicantsTab.tsx
  src/components/producer/EditVendorDetailsModal.tsx

MODIFIED (Network Tab):
  src/components/producer/Network/AddContactModal.tsx
  src/components/producer/Network/EditContactModal.tsx
  src/components/producer/Network/CSVUploadModal.tsx

MODIFIED (Other):
  src/pages/Dashboard.tsx
  src/pages/LoginPage.tsx
  src/services/api.ts
  src/utils/csvTemplateGenerator.ts
  src/utils/emailVariables.ts
```

**Diff stats:** +646 lines, -325 lines across 19 files
