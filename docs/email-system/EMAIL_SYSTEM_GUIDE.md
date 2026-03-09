# Voxxy Presents Email System - Complete Guide

**Last Updated:** March 8, 2026
**Status:** Production
**Version:** 2.0 (Centralized System)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Email Types](#email-types)
4. [Variable Resolution System](#variable-resolution-system)
5. [Email Editor](#email-editor)
6. [Email Sequence & Templates](#email-sequence--templates)
7. [Delivery Tracking](#delivery-tracking)
8. [Frontend Components](#frontend-components)
9. [Backend Services](#backend-services)
10. [API Reference](#api-reference)

---

## Overview

The Voxxy Presents Email System provides automated, customizable email communications throughout the vendor application and event lifecycle. The system supports two distinct email contexts:

### **Invitation Emails (Position 1)**
- Sent to **VendorContacts** BEFORE they apply
- Uses `InvitationVariableResolver`
- Has access to: Event data + Contact data
- NO access to: Registration data, Category-specific data

### **Registration Emails (Positions 2-17)**
- Sent to **Registrations** AFTER they apply
- Uses `EmailVariableResolver`
- Has access to: Event data + Contact data + Registration data + Category data

---

## System Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────┐
│                  EMAIL SYSTEM OVERVIEW                  │
└─────────────────────────────────────────────────────────┘

                    Producer Creates Event
                            │
                            ├──> Creates Vendor Applications
                            │    (with shareable codes)
                            │
                            ├──> Uploads Vendor Contacts
                            │
                            ▼
                    Generates Email Sequence
                    (17 positions, editable)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   POSITION 1          POSITIONS 2-17      SYSTEM EMAILS
   Invitations      Registration Emails   (Future: Unified)
        │                   │
        ├──> VendorContact  ├──> Registration
        ├──> Event         ├──> Event
        │                  ├──> VendorApplication
        │                  │
        ▼                  ▼
 InvitationVariable   EmailVariable
    Resolver             Resolver
        │                  │
        └──────────┬───────┘
                   ▼
              SendGrid API
                   │
                   ├──> Sends Email
                   ├──> Creates EmailDelivery
                   │
                   ▼
           Webhook Updates Status
```

### Technology Stack

**Frontend:**
- React 18.3.1 + TypeScript
- TipTap (Rich Text Editor)
- React Hook Form + Zod validation
- Radix UI components

**Backend:**
- Rails 7.2.2 + PostgreSQL
- SendGrid (email delivery)
- Sidekiq (background jobs)

**Key Services:**
- `InvitationVariableResolver` - Resolves variables for Position 1
- `EmailVariableResolver` - Resolves variables for Positions 2-17
- `EmailSenderService` - Sends emails via SendGrid
- `ScheduledEmailGenerator` - Generates emails from templates

---

## Email Types

### 1. Invitation Emails (Position 1)

**When:** Sent when producer creates batch invitations
**Recipient:** VendorContact (pre-application)
**Data Context:** Event + Vendor Contact only

**Available Variables (34 total):**
- ✅ Event info (name, date, location, etc.)
- ✅ Organization info (name, email)
- ✅ Contact info (name, email, phone, website)
- ✅ Public links (eventLink, dashboardLink, application links)
- ❌ NO category-specific data (boothPrice, installDate, etc.)
- ❌ NO registration data (applicationDate, boothNumber, etc.)

**Example Use Case:**
```
Subject: [greetingName], you're invited to [eventName]!

Body:
Hi [greetingName],

We'd love to have you participate in [eventName] on [eventDate] at [eventLocation].

Check out all the details and apply here: [eventLink]

Categories available:
[categoryList]

Questions? Email us at [organizationEmail]

To unsubscribe: [unsubscribeLink]
```

### 2. Registration Emails (Positions 2-17)

**When:** Triggered by events (approval, payment, reminders, etc.)
**Recipient:** Registration (post-application)
**Data Context:** Event + Contact + Registration + Category

**Available Variables (48 total):**
- ✅ Everything from Invitation Emails
- ✅ Category-specific (boothPrice, installDate, installTime)
- ✅ Registration-specific (applicationDate, vendorCategory, boothNumber)
- ✅ Payment links (categoryPaymentLink, paymentLink)

**Example Use Case:**
```
Subject: Application Approved - [eventName]

Body:
Hi [greetingName],

Congratulations! Your [vendorCategory] application for [eventName] has been approved.

Details:
- Category: [vendorCategory]
- Booth Price: [boothPrice]
- Setup Time: [installDate] at [installTime]

Next Steps:
1. Pay your booth fee: [paymentLink]
2. Access your vendor portal: [dashboardLink]

Payment due by: [paymentDueDate]

Questions? Email [organizationEmail]

Unsubscribe: [unsubscribeLink]
```

### 3. System Emails (Future)

Currently handled separately, planned for unification:
- Application submission confirmation
- Approval notifications
- Rejection notifications
- Payment confirmations

---

## Variable Resolution System

### Format: `[bracket]` Notation

**All variables use `[bracket]` format:**
- Frontend UI: `[eventName]`, `[firstName]`
- Backend Database: `[eventName]`, `[firstName]` (same!)
- Backend Resolvers: Recognize `[bracket]` format

**Legacy Support:**
- Old emails may have `{{mustache}}` format
- `backendToFrontend()` converts `{{}}` → `[]` when loading
- New emails always use `[bracket]` format

### Two Resolvers

#### InvitationVariableResolver
**File:** `/app/services/invitation_variable_resolver.rb`

**Purpose:** Resolve variables for invitation emails (Position 1)

**Has Access To:**
- `event` - Full event record
- `vendor_contact` - Contact being invited
- `event.vendor_applications` - Public application info

**Resolves 34 Variables:**
- Event: eventName, eventDate, eventTime, eventLocation, eventVenue, etc.
- Contact: greetingName, firstName, lastName, businessName, email, phone, website
- Links: eventLink, dashboardLink, artistApplicationLink, vendorApplicationLink, unsubscribeLink

**Example:**
```ruby
# Invitation context
resolver = InvitationVariableResolver.new(event, vendor_contact)
subject = resolver.resolve("[greetingName], join us at [eventName]!")
# => "John's Tacos, join us at Summer Market 2025!"
```

#### EmailVariableResolver
**File:** `/app/services/email_variable_resolver.rb`

**Purpose:** Resolve variables for registration emails (Positions 2-17)

**Has Access To:**
- `event` - Full event record
- `registration` - Vendor registration
- `registration.vendor_application` - Category-specific data

**Resolves All 48 Variables:**
- Everything from InvitationVariableResolver
- Category-specific: boothPrice, installDate, installTime, categoryPaymentLink
- Registration-specific: vendorCategory, applicationDate, boothNumber, applicationCode

**Example:**
```ruby
# Registration context
resolver = EmailVariableResolver.new(event, registration)
body = resolver.resolve("Your [vendorCategory] booth is [boothNumber]. Price: [boothPrice]")
# => "Your Food booth is A-12. Price: $150"
```

### Variable Categories

Variables are organized into 4 categories:

1. **Event** - Event details (date, time, location, prices, etc.)
2. **Organization** - Producer's organization info
3. **Vendor** - Recipient's contact and application info
4. **Computed** - Generated links (eventLink, dashboardLink, payment, etc.)

See [EMAIL_VARIABLES_REFERENCE.md](./EMAIL_VARIABLES_REFERENCE.md) for the complete list of all 48 variables.

---

## Email Editor

### Editor Types

#### 1. Rich Text Editor (HTML Emails)
**Used in:**
- EmailTemplateEditorPage (Template Builder)
- EmailEditorPage (Plain editor page)

**Features:**
- TipTap WYSIWYG editor
- Variable insertion buttons
- Image upload support
- HTML formatting (bold, italic, lists, links)
- **Locked footer** - Cannot be edited (contains unsubscribe link)

**Location:** `/src/components/shared/RichTextEditor.tsx`

#### 2. Plain Text Editor (Modal)
**Used in:**
- EditScheduledEmailModal (Quick edits from Mail tab)

**Features:**
- Simple textarea for subject + body
- Variable insertion buttons
- Plain text only (no HTML)
- Locked footer notice

**Location:** `/src/components/producer/Email/EditScheduledEmailModal.tsx`

### Variable Insertion

**How it Works:**
1. Click on subject or body field
2. Variable buttons appear grouped by category
3. Click variable button to insert at cursor
4. Variables show as `[variableName]` in the editor

**Variable Button Categories:**
- **Event Info** (purple) - Event details
- **Vendor Info** (pink) - Recipient details
- **Organization** (blue) - Your organization
- **Links** (green) - Generated URLs

**Tooltip on Hover:**
- Shows variable description
- Shows example value
- Indicates if it works in invitations

### Locked Footer

**Purpose:** Ensure unsubscribe link is always present (legal requirement)

**Implementation:**
- Footer is locked when email is loaded
- Cannot be edited or deleted
- Contains: Organization info + Unsubscribe link
- Automatically appended if missing

**Files:**
- `/src/utils/emailFooter.ts` - Standard footer template
- Lock logic in: RichTextEditor, EmailTemplateEditorPage, EmailEditorPage

---

## Email Sequence & Templates

### Position System

Emails are organized into 17 positions:

| Position | Name | Trigger | Resolver |
|----------|------|---------|----------|
| 1 | Initial Invitation | on_invitation_send | Invitation |
| 2 | Application Confirmation | on_application_submit | Registration |
| 3 | Approval Notification | on_approval | Registration |
| 4-17 | Various reminders, follow-ups | Scheduled triggers | Registration |

### Template Builder

**Location:** `/src/pages/producer/TemplateBuilderPage.tsx`

**Features:**
- View all 17 email positions
- Edit each email's content, timing, and recipients
- Add new emails to sequence (with "Add Email" button)
- Preview emails with resolved variables
- Drag-and-drop reordering (future)

**Workflow:**
1. Producer opens Mail tab in Command Center
2. Clicks "Generate Emails from Template" (first time)
3. System creates all 17 emails from default template
4. Producer can edit any email
5. Changes are saved per-event (not template)

### Email Templates vs Scheduled Emails

**EmailCampaignTemplate:**
- System-provided or user-created
- Reusable across events
- Contains EmailTemplateItems (17 positions)

**ScheduledEmail:**
- Per-event instance
- Generated from template
- Fully editable
- Has scheduling info (scheduled_for, status)

---

## Delivery Tracking

### EmailDelivery Model

**Purpose:** Track individual email sends with SendGrid

**Key Fields:**
```typescript
{
  scheduled_email_id: number,       // Links to ScheduledEmail
  event_invitation_id: number | null, // For Position 1
  registration_id: number | null,     // For Positions 2-17
  sendgrid_message_id: string,
  status: DeliveryStatus,
  recipient_email: string,
  sent_at: string,
  delivered_at: string | null,
  bounced_at: string | null
}
```

**Statuses:**
- `pending` - Not sent yet
- `queued` - Queued in SendGrid
- `sent` - Sent to recipient's server
- `delivered` - Successfully delivered
- `bounced` - Hard or soft bounce
- `dropped` - Rejected by SendGrid
- `unsubscribed` - Recipient unsubscribed

### Webhook Integration

**Flow:**
```
1. EmailSenderService sends email
   ↓
2. Creates EmailDelivery with status='sent'
   ↓
3. SendGrid delivers email
   ↓
4. Webhook updates status='delivered'
   ↓
5. If bounces: Updates status='bounced', sets bounce_type
```

**Endpoint:** `POST /api/v1/webhooks/sendgrid`

### Audit Log

**Location:** Mail Tab → Audit Log Section

**Features:**
- Shows all email deliveries for the event
- Filters by invitation vs registration emails
- Shows delivery status with color coding
- Displays recipient, subject, sent time
- Links to email details

---

## Frontend Components

### Component Tree

```
CommandCenter.tsx
  └── EmailAutomationTab.tsx
      ├── Statistics Cards
      ├── Email List/Table
      │   └── EmailRow.tsx
      │       ├── Status Badge
      │       └── Actions Dropdown
      ├── EditScheduledEmailModal.tsx
      ├── EmailPreviewModal.tsx
      └── Audit Log Section
          └── EmailDeliveryTable.tsx
```

### Key Components

#### EmailAutomationTab.tsx
**Location:** `/src/components/producer/Email/EmailAutomationTab.tsx`

**Responsibilities:**
- Load scheduled emails for event
- Display statistics (scheduled, sent, failed)
- Manage email CRUD operations
- Show audit log
- Handle invitations

**Actions:**
- Edit Email - Opens EditScheduledEmailModal
- Preview Email - Shows resolved variables
- Send Now - Immediately sends email
- Pause/Resume - Controls scheduling
- Delete Email - Removes from sequence

#### RichTextEditor.tsx
**Location:** `/src/components/shared/RichTextEditor.tsx`

**Features:**
- TipTap-based WYSIWYG editor
- Variable insertion buttons
- Footer locking system
- Image upload
- Link editing

#### EmailPreviewModal.tsx
**Location:** `/src/components/shared/EventEmailPreviewModal.tsx`

**Features:**
- Shows resolved email HTML
- Optional registration selection (for category-specific preview)
- Shows recipient name and email
- Full email rendering

---

## Backend Services

### EmailSenderService
**File:** `/app/services/email_sender_service.rb`

**Purpose:** Send emails via SendGrid API

**Key Methods:**
```ruby
def send_to_recipients
  # Gets filtered recipients
  # Resolves variables for each
  # Sends via SendGrid
  # Creates EmailDelivery records
end

def send_to_registration(registration)
  # Resolves variables
  # Sends single email
  # Creates delivery record
end
```

### ScheduledEmailGenerator
**File:** `/app/services/scheduled_email_generator.rb`

**Purpose:** Generate ScheduledEmail instances from templates

**Key Methods:**
```ruby
def generate
  # Loads default system template
  # Creates ScheduledEmail for each position
  # Calculates scheduled_for times
  # Returns array of emails
end

def generate_selective(positions:)
  # Generates only specific positions
end
```

### EmailScheduleCalculator
**File:** `/app/services/email_schedule_calculator.rb`

**Purpose:** Calculate when emails should be sent

**Trigger Logic:**
- `days_before_event` - X days before event_date
- `days_after_event` - X days after event_date
- `on_event_date` - Same day as event
- `days_before_deadline` - X days before application_deadline
- `on_payment_deadline` - Same day as payment_deadline

**Example:**
```ruby
calculator = EmailScheduleCalculator.new(event)
scheduled_for = calculator.calculate(
  OpenStruct.new(
    trigger_type: 'days_before_event',
    trigger_value: 3,
    trigger_time: '09:00'
  )
)
# => 3 days before event at 9am UTC
```

---

## API Reference

### Base URL
```
/api/v1/presents/events/:event_slug/scheduled_emails
```

### Key Endpoints

#### List Emails
```http
GET /scheduled_emails
Response: ScheduledEmail[]
```

#### Generate Emails
```http
POST /scheduled_emails/generate
Body: { regenerate?: boolean }
Response: { scheduled_emails: ScheduledEmail[], generated_count: number }
```

#### Update Email
```http
PATCH /scheduled_emails/:id
Body: {
  scheduled_email: {
    name?: string,
    subject_template?: string,
    body_template?: string,
    trigger_type?: string,
    trigger_value?: number,
    trigger_time?: string
  }
}
Response: ScheduledEmail
Note: Automatically recalculates scheduled_for if trigger fields change
```

#### Preview Email
```http
POST /scheduled_emails/:id/preview
Body: { registration_id?: number, category?: string }
Response: {
  subject: string,
  body: string (HTML with resolved variables),
  recipient_name: string,
  recipient_email: string
}
```

#### Send Now
```http
POST /scheduled_emails/:id/send_now
Response: {
  sent_count: number,
  failed_count: number,
  email: ScheduledEmail
}
```

#### Pause/Resume
```http
PATCH /scheduled_emails/:id/pause
PATCH /scheduled_emails/:id/resume
Response: { message: string, email: ScheduledEmail }
```

#### Delete
```http
DELETE /scheduled_emails/:id
Response: 204 No Content
Note: Cannot delete sent emails
```

---

## Recent Changes (March 2026)

### Variable System Overhaul
- ✅ Changed from `{{mustache}}` to `[bracket]` format
- ✅ Added 8 new variables (eventEndDate, phone, website, etc.)
- ✅ Fixed `worksInInvitations` flags for 6 variables
- ✅ Added 5 backend variables to frontend UI

### Invitation Links Fix
- ✅ Added dashboardLink to invitations (was redirecting to eventLink)
- ✅ Added artistApplicationLink and vendorApplicationLink to invitations
- ✅ Added applicationLink and categoryApplicationLink to invitations
- ✅ All public links now work in Position 1

### Footer Lock System
- ✅ Implemented locked footer in all HTML editors
- ✅ Ensures unsubscribe link always present
- ✅ Cannot be edited or deleted by producers

### Bug Fixes
- ✅ Fixed public application page routing (slug parsing)
- ✅ Fixed "Add Email" 422 validation error
- ✅ Fixed [categoryList] variable name mismatch

---

## Related Documentation

- **[EMAIL_VARIABLES_REFERENCE.md](./EMAIL_VARIABLES_REFERENCE.md)** - Complete list of all 48 variables
- **[EMAIL_EDITOR_GUIDE.md](./EMAIL_EDITOR_GUIDE.md)** - Producer guide to email editor
- **[INVITATION_EMAIL_QUICK_REFERENCE.md](../INVITATION_EMAIL_QUICK_REFERENCE.md)** - Quick reference for invitations
- **[SCHEDULED_EMAILS_SYSTEM.md](./SCHEDULED_EMAILS_SYSTEM.md)** - Legacy documentation (outdated)

---

**Questions? Contact:** engineering@voxxypresents.com

**END OF DOCUMENT**
