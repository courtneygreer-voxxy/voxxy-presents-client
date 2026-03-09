# Invitation Email System Analysis

**Analysis Date:** March 4, 2026  
**Codebase:** voxxy-presents-client  
**Focus:** How invitation emails work and their data context

---

## Table of Contents

1. [Overview](#overview)
2. [EventInvitation Type Definition](#eventinvitation-type-definition)
3. [How Invitations Are Sent](#how-invitations-are-sent)
4. [Email Variable Resolution System](#email-variable-resolution-system)
5. [EmailDelivery Model](#emaildelivery-model)
6. [Invitation vs Registration Email Differences](#invitation-vs-registration-email-differences)
7. [Available Variables for Invitations](#available-variables-for-invitations)
8. [Unavailable Variables and Limitations](#unavailable-variables-and-limitations)
9. [Email Preview System](#email-preview-system)
10. [Multi-Category Support](#multi-category-support)
11. [Default Invitation Templates](#default-invitation-templates)
12. [Recommendations](#recommendations)

---

## Overview

The invitation system has been **unified** as of February 28, 2026. Instead of using a separate invitation system, invitation emails are now sent using **Position 1 ("Initial Invitation")** of the scheduled emails system.

**Key Changes:**
- ✅ Position 1 is now a **real ScheduledEmail** from the database (not virtual)
- ✅ Uses `InvitationVariableResolver` on the backend for variable resolution
- ✅ Creates proper `EmailDelivery` records for audit log tracking
- ✅ Fully editable (subject, body, triggers)
- ✅ Same interface as registration emails

---

## EventInvitation Type Definition

**File:** `/src/services/api.ts` (lines 2450+)

```typescript
export interface EventInvitation {
  id: number
  event_id: number
  vendor_contact_id: number
  vendor_contact?: VendorContact
  status: 'pending' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'
  invitation_token: string
  sent_at?: string
  responded_at?: string
  response_notes?: string
  expires_at: string
  created_at: string
  updated_at: string
}
```

**Data Flow:**
1. Created via `POST /api/v1/presents/events/:event_slug/invitations/batch`
2. Stored in `event_invitations` table
3. Associated with `vendor_contact` (not a registration)
4. Has unique token for public invitation page
5. Tracks response status (accepted/declined/pending)

---

## How Invitations Are Sent

### Backend Flow (Updated Feb 28, 2026)

**Location:** `EventInvitationsController` (backend)

1. **Create Invitations:**
   ```
   POST /api/v1/presents/events/:slug/invitations/batch
   ├── Create EventInvitation records
   ├── Mark as "sent" status
   └── Set sent_at timestamp
   ```

2. **Send Email (Background Job):**
   ```
   - Fetch Position 1 (Initial Invitation) ScheduledEmail
   - Use InvitationVariableResolver to resolve variables
   - Create EmailDelivery record with:
     - scheduled_email_id (Position 1 ID)
     - event_invitation_id (link to invitation)
     - recipient_email (from vendor_contact)
   - Send via SendGrid
   ```

3. **Variable Resolution:**
   ```
   Backend uses: InvitationVariableResolver
   Context: event_invitation + vendor_contact + event
   Resolves: [eventName], [firstName], [boothPrice], etc.
   ```

### Frontend Flow

**File:** `/src/components/producer/CreateEventWizard/steps/Step3InviteList.tsx`

```typescript
// User selects contacts to invite
const wizardState = {
  inviteList: {
    invitedContactIds: number[]  // Array of vendor_contact IDs
  }
}

// On event creation:
await eventInvitationsApi.createBatch(newEvent.slug, invitedContactIds)
```

---

## Email Variable Resolution System

### Variable Format

**File:** `/src/utils/emailVariables.ts`

**Format Used:** `[bracket]` notation (NOT {{mustache}})

**Why [bracket]:**
- Frontend UI uses: `[eventName]`, `[firstName]`, etc.
- Backend database stores: `[eventName]`, `[firstName]`, etc.
- Backend `InvitationVariableResolver` expects: `[bracket]` format
- Legacy {{mustache}} format is converted to [bracket] on load

**Conversion Functions:**
```typescript
// Load from database → Frontend
backendToFrontend(text): Converts {{mustache}} → [bracket]

// Frontend → Database
frontendToBackend(text): Keeps [bracket] format (backend expects this!)
```

### Variable Resolver Behavior

**For Invitations:**
- Resolver Type: `InvitationVariableResolver` (backend)
- Input Context:
  - `event_invitation` object
  - `vendor_contact` object
  - `event` object
  - NO registration data (invitation may not apply yet)
- Can resolve variables that have event or vendor contact data

**For Registrations:**
- Resolver Type: `RegistrationVariableResolver` (backend)
- Input Context:
  - `registration` object
  - `vendor_application` (which category)
  - `event` object
  - Full vendor category pricing/dates
- Can resolve category-specific variables

---

## EmailDelivery Model

**File:** `/src/types/email.ts` (lines 129-168)

```typescript
export interface EmailDelivery {
  id: number
  scheduled_email_id: number
  event_id: number
  
  // Key: Can be registration OR invitation (but not both)
  registration_id: number | null      // For registration emails
  event_invitation_id: number | null  // For invitation emails
  
  // Email tracking
  sendgrid_message_id: string
  recipient_email: string
  
  // Status (updated via SendGrid webhook)
  status: DeliveryStatus
  bounce_type: 'soft' | 'hard' | null
  bounce_reason: string | null
  drop_reason: string | null
  
  // Timestamps from SendGrid
  sent_at: string | null
  delivered_at: string | null
  bounced_at: string | null
  dropped_at: string | null
  unsubscribed_at: string | null
  
  // Auto-retry logic
  retry_count: number
  next_retry_at: string | null
  max_retries: number
  
  // Audit log data
  recipient_name?: string | null
  vendor_category?: string | null     // For registrations only
  
  created_at: string
  updated_at: string
}
```

**Key Point:** `registration_id` AND `event_invitation_id` are BOTH nullable
- When sending to an invitee (no registration yet): `registration_id = null`, `event_invitation_id = X`
- When sending to a registered vendor: `registration_id = X`, `event_invitation_id = null`
- Audit log can handle both scenarios

---

## Invitation vs Registration Email Differences

### Invitation Emails (Position 1)

**When Sent:**
- Trigger: `on_invitation_send` (when batch invitations are created)
- Recipient: Vendor contact (from vendor_contact table)
- Status: Email is sent IMMEDIATELY when invitations are created

**Data Available:**
- ✅ Event-level data: event name, date, location, venue
- ✅ Contact-level data: first name, last name, business name
- ❌ **NO** vendor category context
- ❌ **NO** booth price (unless single category)
- ❌ **NO** install date/time
- ❌ **NO** payment link
- ⚠️ Recipient may not have applied yet

**What Resolver Can Access:**
```
event_invitation:
  - vendor_contact: first_name, last_name, email, business_name
  - event: title, date, location, venue, description

event:
  - All event-level data
  - BUT: Not aware of category the invitee will apply to

Result: Can only use event-level + contact-level variables
```

### Registration Emails

**When Sent:**
- Trigger: Various (`on_approval`, `on_rejection`, `on_payment_received`, etc.)
- Recipient: Registered vendor (from registrations table)
- Status: Email sent AFTER vendor applies

**Data Available:**
- ✅ Event-level data: event name, date, location
- ✅ Contact-level data: first name, last name, business name
- ✅ **Registration-level data:** vendor_category (which application they applied to)
- ✅ **Category-specific data:** booth price, install date/time, payment link
- ✅ Full vendor application context

**What Resolver Can Access:**
```
registration:
  - vendor_contact: all contact data
  - vendor_application: name, booth_price, install_date, payment_link
  - status: approved, rejected, waitlist, etc.

Result: Can use all variables including category-specific ones
```

---

## Available Variables for Invitations

**Can be reliably used in Position 1 (Initial Invitation) emails:**

### Event Variables
```
[eventName]              → "Summer Market 2025"
[eventDate]              → "June 15, 2025"
[eventTime]              → "10:00 AM - 6:00 PM"
[eventLocation]          → "Piedmont Park, Atlanta, GA"
[eventVenue]             → "Piedmont Park"
[eventDescription]       → Full event description
[applicationDeadline]    → "May 30, 2025"
[paymentDueDate]         → "June 1, 2025"
[ageRestriction]         → "21+" (if applicable)
```

### Organization Variables
```
[organizationName]       → "Voxxy Presents"
[organizationEmail]      → "hello@voxxypresents.com"
```

### Vendor Contact Variables (From invitee's contact record)
```
[greetingName]           → "John's Tacos" or "John" (smart choice)
[firstName]              → "John"
[lastName]               → "Doe"
[fullName]               → "John Doe"
[businessName]           → "John's Tacos"
[email]                  → "john@example.com"
```

### Computed/Link Variables
```
[eventLink]              → Public event application page
[invitationLink]         → Same as eventLink (invitation context)
[bulletinLink]           → Event bulletin/announcement page
[dashboardLink]          → Vendor dashboard
[unsubscribeLink]        → Unsubscribe URL
```

---

## Unavailable Variables and Limitations

### ❌ Category-Specific Variables (NOT available for invitations)

```
[boothPrice]             → Requires knowing which category invitee will choose
[categoryPrice]          → Same issue - category-specific pricing
[installDate]            → Varies by category
[installTime]            → Varies by category
[installStartTime]       → Varies by category
[installEndTime]         → Varies by category
[paymentLink]            → Unique per category/application
```

**Why Not Available:**
1. Invitation is sent BEFORE vendor chooses their category
2. No registration exists yet (they haven't applied)
3. Backend resolver doesn't have `vendor_application` context
4. Can't guess which category they'll apply to

### ❌ Registration-Level Variables

```
[vendorCategory]         → Only known after registration
[categoryList]           → List of which applications they applied to
[boothNumber]            → Assigned after approval
[applicationDate]        → After application submitted
```

### ⚠️ Currently Missing (Even for registrations)
```
application_tags         → Not yet in EMAIL_VARIABLES
Category name/description → Not exposed as variables
```

---

## Email Preview System

### Preview Without Registration Context

**File:** `/src/components/shared/EventEmailPreviewModal.tsx`

**Two Preview Systems:**

#### 1. **Standard Preview (Registration/Scheduled Emails)**
```typescript
// API Endpoint
POST /api/v1/presents/events/:slug/scheduled_emails/:id/preview

// Request body options:
{
  registration_id: number  // OPTIONAL
  category: string         // OPTIONAL - for category-specific variables
}

// Response
{
  subject: string          // Resolved with variables replaced
  body: string             // HTML with variables replaced
  recipient_email: string  // Sample email
  recipient_name: string   // Sample name
}
```

**Issue:** Requires a sample registration to resolve variables!
- If no `registration_id` provided, backend uses a sample
- Categories are only helpful if registration exists
- Category selection UI appears but may not work properly

#### 2. **Invitation-Specific Preview (Deprecated)**
```typescript
// Legacy endpoint (still exists but not used)
GET /api/v1/presents/events/:slug/invitations/preview_email

// Returns sample invitation email (hardcoded)
```

**Current Status:** Not used since Feb 28, 2026
- Position 1 now uses standard preview endpoint
- No special invitation preview handling

### Preview Modal Behavior

**File:** `/src/components/shared/EventEmailPreviewModal.tsx`

```typescript
// Load preview when modal opens
const loadPreview = async () => {
  const context = hasCategorySpecificContent
    ? { category: selectedCategory }
    : {}

  const data = await scheduledEmailsApi.preview(
    eventSlug,
    email.id,
    context  // May include registration_id
  )
}
```

**For Invitation Emails (Position 1):**
- ✅ Preview works (uses sample invitation)
- ❌ Category selection appears but doesn't affect invitation variables
- ❌ No way to preview with specific vendor contact data
- ⚠️ Resolves to placeholder values

---

## Multi-Category Support

### Current Challenge

**Problem:** Invitations are sent to potential vendors BEFORE they choose their category

**Example:**
- Event has 3 categories: Artist ($100), Food ($200), Sponsor ($500)
- Vendor receives invitation with `[boothPrice]`
- Which price do we show? Unknown until they apply!

### Available Solutions

#### 1. **Show All Categories (Recommended)**

**New Variable (Proposal):**
```typescript
[categoryList]  → Bulleted list of all categories with prices

Example output:
• Artist Booth - $100
• Food Vendor - $200
• Sponsor Packages - $500
```

**Implementation:**
```typescript
{
  label: 'All Categories',
  frontendVar: '[categoryList]',
  backendVar: '{{categories_list}}',
  category: 'vendor',
  description: 'Bulleted list of all vendor applications with prices',
  example: '• Artist: $100\n• Food: $200\n• Sponsor: $500'
}
```

#### 2. **Show Default/First Category**

**Current Approach (Not Ideal):**
- `[boothPrice]` defaults to first category's price
- Misleading if categories have different prices
- Can't control which category is "default"

#### 3. **Generic Pricing Language**

**Example Email:**
```
Dear [greetingName],

You're invited to participate in [eventName]!

Application fee varies by vendor category. 
To learn more and apply, click here: [eventLink]

Setup: [installDate]
```

**Pros:** Works for all categories
**Cons:** Less specific/helpful

#### 4. **Category-Specific Emails**

**Advanced (Not Yet Implemented):**
- Send multiple invitation emails, one per category
- Each invitation shows the specific category's price
- Same vendor gets 3 separate emails (one per category they could apply to)

**Pros:** Highly relevant per-category information
**Cons:** Email spam, complex implementation

---

## Default Invitation Templates

### Location

**File:** Backend system templates (not in frontend repo)

**Position 1 Template ("Initial Invitation"):**
- Managed in database as `email_template_items` with position = 1
- Trigger type: `on_invitation_send`
- Category: `pre_application`
- System-provided default (can be customized per organization)

### Template Content

**Typical Default:**
```
Subject: [greetingName], you're invited to [eventName]!

Body:
<p>Hello [greetingName],</p>

<p>You're invited to participate in [eventName], 
happening on [eventDate] at [eventLocation].</p>

<p>[eventDescription]</p>

<p>To apply, visit: [eventLink]</p>

<p>Applications close on [applicationDeadline].</p>

<p>Best regards,<br>
[organizationName]</p>
```

### Customization

**Producers can:**
- ✅ Edit subject and body for Position 1
- ✅ Change trigger timing (though typically `on_invitation_send`)
- ✅ Add/remove variables
- ❌ Can't change from `on_invitation_send` trigger (core logic)

**Access Point:** Mail tab → Click "Initial Invitation" row → Edit

---

## Recommendations

### 1. Add [categoryList] Variable (HIGH PRIORITY)

**Purpose:** Support multi-category invitation emails

**Implementation:**
```typescript
// In emailVariables.ts
{
  label: 'Categories List',
  frontendVar: '[categoryList]',
  backendVar: '{{categories_list}}',
  category: 'vendor',
  description: 'Bulleted list of all vendor applications with their prices',
  example: '• Artist Booth - $100.00\n• Food Vendor - $200.00\n• Sponsor - $500.00'
}
```

**Backend Implementation:**
- In `InvitationVariableResolver`:
```ruby
when 'categories_list'
  event.vendor_applications.map do |app|
    "• #{app.name} - $#{app.booth_price}"
  end.join("\n")
```

**Example Email:**
```
Subject: You're invited to [eventName]!

Available vendor categories:

[categoryList]

Learn more and apply: [eventLink]
```

---

### 2. Add [applicationsList] for Registrations (MEDIUM PRIORITY)

**Purpose:** Help vendors who applied to multiple categories see their options

**For Registration Emails:**
```typescript
{
  label: 'Applications List',
  frontendVar: '[applicationsList]',
  backendVar: '{{applications_list}}',
  category: 'vendor',
  description: 'List of categories this vendor applied to',
  example: '• Artist Booth ($100 - Pending Review)\n• Food Vendor ($200 - Approved)'
}
```

---

### 3. Improve Invitation Preview (MEDIUM PRIORITY)

**Current Issue:** Preview doesn't know which vendor contact to use

**Solution:** Allow selecting a sample vendor contact for preview

```typescript
// EventEmailPreviewModal.tsx enhancement
interface EventEmailPreviewModalProps {
  // ... existing props
  invitationMode?: boolean
  availableContacts?: VendorContact[]  // For invitation preview
  onSelectContact?: (contact: VendorContact) => void
}

// In preview request:
const context = {
  vendor_contact_id: selectedContact?.id,  // For invitations
  category: selectedCategory
}
```

---

### 4. Document Invitation Resolver Limitations

**Create Backend Documentation:**
- Document what `InvitationVariableResolver` can/cannot resolve
- List which variables require `registration` context
- Provide examples of invitations with/without category-specific vars

---

### 5. Consider Trigger Type Options

**Enhancement:** Allow producers to choose when to send invitations

```typescript
trigger_types: [
  'on_invitation_send',    // Default - send when created
  'days_before_event',     // Send 7 days before
  'days_before_deadline',  // Send before app deadline
]
```

**Use Case:** "Send reminder 5 days before applications close"

---

### 6. Add Invitation Token Variable

**New Variable (Low Priority):**
```typescript
{
  label: 'Acceptance Link',
  frontendVar: '[invitationTokenLink]',
  backendVar: '{{invitation_token_link}}',
  category: 'computed',
  description: 'Direct link to accept/decline invitation',
  example: 'https://voxxy.io/invitations/abc123xyz'
}
```

**Use Case:** Invitations could have direct accept/decline buttons

---

## Summary Table

| Aspect | Registration Email | Invitation Email |
|--------|-------------------|------------------|
| **Recipient Context** | Has registration data | Pre-registration (no app yet) |
| **Data Available** | Registration + category | Contact + event only |
| **[boothPrice]** | ✅ Category-specific | ❌ Would be generic |
| **[installDate]** | ✅ Category-specific | ❌ Not available |
| **[vendorCategory]** | ✅ Their choice | ❌ Unknown |
| **[eventLink]** | ✅ Works | ✅ Works |
| **[greetingName]** | ✅ Works | ✅ Works |
| **Preview Method** | Standard + registration | Standard + sample |
| **Editable** | ✅ Yes | ✅ Yes (Position 1) |
| **Sent Immediately** | After trigger event | When created |

---

## Key Takeaways

1. **Position 1 is the invitation email** - no special virtual email handling
2. **Invitations lack category context** - can't resolve category-specific variables
3. **[categoryList] should be added** - supports multi-category marketing
4. **Preview mode needs vendor selection** - currently uses generic samples
5. **EmailDelivery supports both** - registration_id OR event_invitation_id (not both)
6. **Variable resolver differs** - `InvitationVariableResolver` vs `RegistrationVariableResolver`

