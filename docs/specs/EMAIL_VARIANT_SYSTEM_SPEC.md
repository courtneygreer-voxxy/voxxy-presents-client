# Email Variant System — Design Specification

**Status:** Proposed
**Author:** Courtney Greer / Engineering
**Date:** 2026-03-10
**Target:** Backend + Frontend

---

## 1. Problem Statement

Today, every email trigger (e.g., "Application Received," "Approval Confirmation") sends identical content to all recipients regardless of their vendor category. Producers want to customize email content per category — for example, sending different load-in instructions to Food vendors vs. Art vendors after approval.

The system already supports **filtering WHO receives** an email via `filter_criteria.vendor_category`, but there is no mechanism for **varying WHAT content** different categories receive for the same trigger event.

---

## 2. Concept: Email Variants

A **variant** is a category-specific copy of an existing email that shares the same trigger but has customized subject/body content.

### Example

An event has 4 categories: Food, Beverage, Art, Merchandise.

Without variants:
```
"Application Accepted" (on_approval) → identical email to all categories
```

With variants:
```
"Application Accepted" (base, on_approval) → default fallback
├── "Application Accepted — Food"      → mentions kitchen setup, health permit requirements
├── "Application Accepted — Beverage"  → mentions liquor license, bar setup
├── "Application Accepted — Art"       → mentions booth dimensions, display guidelines
└── "Application Accepted — Merchandise" → uses base content (no customization needed)
```

### Key Behavior
- **All variants start as copies of the base** — producers don't start from scratch
- **Unmodified variants still work** — the base content sends if no variant-specific edits are made
- **Fallback to base** — if a new category is added after variants were created, it gets the base email
- **Variants are optional** — producers only create them when needed

---

## 3. Which Emails Support Variants

Variants only make sense for **trigger-based emails** (post-application), not **blast emails** (pre-application contact list).

### Two Email Types in the System

| Type | Recipient Source | Service | Variants? |
|------|-----------------|---------|-----------|
| **Blast** | `event_invitations` → `vendor_contacts` | `InvitationReminderService` | No |
| **Trigger** | `registrations` | `EmailSenderService` / `RegistrationEmailService` | Yes |

### Blast Emails (NO variants)
| Trigger | Why No Variants |
|---------|----------------|
| `on_invitation_send` | No category assigned yet |
| `on_application_open` | No category assigned yet |
| `days_before_deadline` | No category assigned yet |
| `on_bulletin_post` | Broadcast to all approved (no category distinction needed) |

### Trigger Emails (CAN have variants)
| Trigger | Variant Use Case |
|---------|-----------------|
| `on_application_submit` | Category-specific confirmation details |
| `on_approval` | Different onboarding instructions per category |
| `on_rejection` | Category-specific waitlist messaging |
| `on_waitlist` | Category-specific messaging |
| `on_payment_received` | Category-specific receipt details |
| `on_category_change` | Explain new category requirements |
| `days_before_payment_deadline` | Category-specific payment amounts |
| `on_payment_deadline` | Category-specific payment amounts |
| `days_before_event` (countdown) | Category-specific load-in/setup instructions |
| `on_event_update` | Category-specific impact messaging |

---

## 4. Backend Changes

### 4.1 Database Schema

**Add columns to `scheduled_emails` table:**

```ruby
# Migration
class AddVariantFieldsToScheduledEmails < ActiveRecord::Migration[7.2]
  def change
    add_column :scheduled_emails, :parent_email_id, :bigint, null: true
    add_column :scheduled_emails, :variant_category, :string, null: true
    add_index :scheduled_emails, :parent_email_id
    add_index :scheduled_emails, [:parent_email_id, :variant_category], unique: true
    add_foreign_key :scheduled_emails, :scheduled_emails, column: :parent_email_id
  end
end
```

**Field definitions:**
- `parent_email_id` — FK to the base `scheduled_email`. `NULL` = this IS the base email.
- `variant_category` — The `vendor_category` string this variant targets. `NULL` on base emails.
- Unique constraint on `(parent_email_id, variant_category)` prevents duplicate variants per category.

**Model changes:**

```ruby
# app/models/scheduled_email.rb
class ScheduledEmail < ApplicationRecord
  belongs_to :parent_email, class_name: 'ScheduledEmail', optional: true
  has_many :variants, class_name: 'ScheduledEmail', foreign_key: :parent_email_id, dependent: :destroy

  scope :base_emails, -> { where(parent_email_id: nil) }
  scope :variant_emails, -> { where.not(parent_email_id: nil) }

  def base?
    parent_email_id.nil?
  end

  def has_variants?
    variants.exists?
  end

  # Find the right email for a given category
  def resolve_for_category(vendor_category)
    return self unless base? && has_variants?
    variants.find_by(variant_category: vendor_category) || self
  end
end
```

### 4.2 Send Logic Changes

**`RegistrationEmailService`** — When sending triggered emails (approval, rejection, etc.):

```ruby
# Current flow:
def send_approval_email(registration)
  email = find_active_email('on_approval')
  EmailSenderService.send_immediately(email, [registration])
end

# New flow with variant resolution:
def send_approval_email(registration)
  base_email = find_active_email('on_approval')
  resolved_email = base_email.resolve_for_category(registration.vendor_category)
  EmailSenderService.send_immediately(resolved_email, [registration])
end
```

**`EmailSenderService.send_to_recipients`** — For scheduled/time-based sends with variants:

```ruby
# When a base email with variants is processed:
def send_to_recipients
  recipients = RecipientFilterService.filter(...)

  if @scheduled_email.has_variants?
    # Group recipients by category, send appropriate variant
    recipients.group_by(&:vendor_category).each do |category, category_recipients|
      resolved = @scheduled_email.resolve_for_category(category)
      send_batch(resolved, category_recipients)
    end
  else
    send_batch(@scheduled_email, recipients)
  end
end
```

### 4.3 API Endpoints

**New endpoints:**

```ruby
# config/routes.rb (under /api/v1/presents/events/:event_slug/emails)
resources :scheduled_emails do
  member do
    post :create_variants    # POST /emails/:id/create_variants
    delete :remove_variants  # DELETE /emails/:id/remove_variants
  end
  resources :variants, only: [:index, :update], controller: 'email_variants'
end
```

**`POST /emails/:id/create_variants`**
- Creates one variant per event category, copying subject/body from base
- Returns the base email with nested variants

**Request:** (no body needed — categories come from event's vendor_applications)

**Response:**
```json
{
  "id": 42,
  "name": "Application Accepted",
  "trigger_type": "on_approval",
  "has_variants": true,
  "variants": [
    {
      "id": 101,
      "parent_email_id": 42,
      "variant_category": "Food Vendor",
      "subject_template": "Welcome aboard, [firstName]!",
      "body_template": "...(copied from base)..."
    },
    {
      "id": 102,
      "parent_email_id": 42,
      "variant_category": "Art Vendor",
      "subject_template": "Welcome aboard, [firstName]!",
      "body_template": "...(copied from base)..."
    }
  ]
}
```

**`PATCH /emails/:id/variants/:variant_id`**
- Updates a single variant's subject/body
- Standard email update fields

**`DELETE /emails/:id/remove_variants`**
- Destroys all variants, reverting to single email for all categories

### 4.4 Serializer Changes

**ScheduledEmailSerializer** — Add variant fields:

```ruby
class ScheduledEmailSerializer < ActiveModel::Serializer
  attributes :id, :name, :subject_template, :body_template, :trigger_type,
             :status, :scheduled_for, :filter_criteria, :recipient_count,
             :parent_email_id, :variant_category, :has_variants

  has_many :variants, serializer: ScheduledEmailVariantSerializer, if: :base?

  def has_variants
    object.variants.exists?
  end

  def base?
    object.parent_email_id.nil?
  end
end
```

### 4.5 Template System Impact

**`ScheduledEmailGenerator`** — When generating emails from a template for a new event:
- Only generate base emails (variants are per-event, not per-template)
- If saving an event's email sequence as a template, variants can optionally be included in `email_template_items` with a `variant_category` field

**`email_template_items` table** — Optional future addition:
```ruby
add_column :email_template_items, :parent_item_id, :bigint, null: true
add_column :email_template_items, :variant_category, :string, null: true
```
This allows templates to include pre-configured variants. Not required for MVP.

---

## 5. Frontend Changes

### 5.1 Email Sequence Editor — "Add Variant" Button

In the email sequence list (EmailSequenceEditorOverlay), each trigger-type email row gets an "Add Variant" action in its menu (SequenceRowMenu):

- Only shows for trigger-type emails (not blasts)
- Calls `POST /emails/:id/create_variants`
- After creation, the row expands to show category tabs

### 5.2 Email Editor — Category Tab Switcher

When editing a base email that has variants:

```
┌─────────────────────────────────────────────────────────┐
│  Application Accepted                                    │
│  ┌──────┐ ┌──────────┐ ┌────────┐ ┌─────────────┐      │
│  │ All  │ │  Food    │ │  Art   │ │ Merchandise │      │
│  └──────┘ └──────────┘ └────────┘ └─────────────┘      │
│                                                          │
│  Subject: Welcome aboard, [firstName]!                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  (TipTap editor - content for selected variant)  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  "All" tab edits the base (default for unmatched cats)  │
│  Category tabs edit specific variant content              │
└─────────────────────────────────────────────────────────┘
```

- **"All" tab** = base email (fallback for uncustomized categories)
- **Category tabs** = each variant
- Visual indicator (dot/badge) shows which variants have been customized vs. still matching base

### 5.3 Live Preview

When previewing a variant email:
- Show category-specific variables resolved (e.g., `[vendorCategory]` → "Food Vendor")
- Show a category selector in the preview panel to switch between previews

### 5.4 Type Changes

```typescript
// src/types/email.ts — additions
interface ScheduledEmail {
  // ... existing fields ...
  parent_email_id?: number | null;
  variant_category?: string | null;
  has_variants?: boolean;
  variants?: ScheduledEmailVariant[];
}

interface ScheduledEmailVariant {
  id: number;
  parent_email_id: number;
  variant_category: string;
  subject_template: string;
  body_template: string;
}
```

---

## 6. Third-Party Impact

### SendGrid
**No changes required.** Variants are resolved server-side before reaching SendGrid. Each email delivery is still a single SendGrid API call with fully rendered HTML. The variant system is purely an internal content-routing mechanism.

### Sidekiq / Workers
**Minor change to `EmailSenderWorker`:** When processing a base email with variants, group recipients by category and send the appropriate variant content. The worker already processes one email at a time — it just needs the category-aware routing described in Section 4.2.

### TipTap (Frontend)
**No library changes.** The editor component stays the same — it just receives different `body_template` content depending on which variant tab is selected. No custom TipTap nodes needed for variants.

### Libraries / SDKs
**No new dependencies.** This feature uses existing Rails associations, existing API patterns, and existing frontend components. No new gems or npm packages required.

---

## 7. Rollout Strategy

### Phase 1: Backend Foundation (this spec)
- [ ] Migration: add `parent_email_id`, `variant_category` to `scheduled_emails`
- [ ] Model: `resolve_for_category`, `variants` association, scopes
- [ ] API: `create_variants`, `remove_variants`, variant update endpoint
- [ ] Serializer: include variant data in email responses
- [ ] Send logic: variant resolution in `RegistrationEmailService` and `EmailSenderService`
- [ ] Tests: unit tests for resolution, integration tests for send flow

### Phase 2: Frontend UI (separate branch)
- [ ] "Add Variant" button in sequence editor
- [ ] Category tab switcher in email editor
- [ ] Variant-aware preview
- [ ] Type updates

### Phase 3: Template Integration (future)
- [ ] Allow saving variant configurations in templates
- [ ] Generate variants from template when creating events

---

## 8. Edge Cases & Considerations

| Scenario | Handling |
|----------|---------|
| New category added after variants exist | Falls back to base email. Producer can re-run "Add Variant" to create a variant for the new category. |
| Category deleted/renamed | Orphaned variant still exists but won't match. `resolve_for_category` returns base. |
| Variant email paused | Only that variant is paused. Other categories still get their variant or the base. |
| Base email deleted | Cascade deletes all variants (`dependent: :destroy`). |
| Base email paused | All variants should also be considered paused (enforce in worker). |
| Variant metrics | Each variant tracks its own `recipient_count` and `delivery_counts`. Base email shows aggregate. |
| Email preview | Frontend should allow previewing each variant. Backend preview endpoint should accept optional `variant_id` param. |

---

## 9. Bulletin Post Clarification

**Current behavior is correct.** `BulletinEmailService` already filters to `approved/confirmed` registrations:

```ruby
# app/services/bulletin_email_service.rb
recipients = event.registrations.where(status: %w[approved confirmed])
```

However, the bulletin bypasses the standard `EmailSenderWorker` → `RecipientFilterService` pipeline. This is by design since bulletins are synchronous (sent immediately on create), but it means `filter_criteria` on the bulletin template item is ignored.

**Recommendation:** If more granular filtering is needed in the future (e.g., only send bulletins to specific categories), integrate bulletin sending through the standard `RecipientFilterService` path.

---

## 10. Dynamic Category Block (Future — Separate Spec)

A separate feature for embedding a data-driven category table in invitation/blast emails. Unlike variants (which customize per-recipient), the category block shows ALL categories in a single email. This is complementary and should be spec'd independently.

**Key concept:** A `[categoryBlock]` variable that the backend's `InvitationVariableResolver` expands into an HTML table of categories with names, descriptions, and per-category application links. Frontend would use a TipTap custom node for in-editor preview.
