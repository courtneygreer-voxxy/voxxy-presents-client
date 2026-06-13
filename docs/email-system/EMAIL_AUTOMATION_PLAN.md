# Email Automation System - Implementation Plan

**Platform:** Voxxy Presents
**Date:** December 31, 2024 (Updated)
**Status:** Planning Phase - Pending CEO Approval
**Estimated Timeline:** 4 Phases, 4-6 Weeks Total

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [CEO Decision Summary](#ceo-decision-summary)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [The Default Email Campaign (24 Emails)](#the-default-email-campaign-24-emails)
6. [Filter Criteria System](#filter-criteria-system)
7. [Email Variables](#email-variables)
8. [Email Delivery Tracking](#email-delivery-tracking)
9. [Services & Business Logic](#services--business-logic)
10. [API Endpoints](#api-endpoints)
11. [Frontend Components](#frontend-components)
12. [Phase 1 Implementation Checklist](#phase-1-implementation-checklist)
13. [Future Phases](#future-phases)
14. [Timeline & Resources](#timeline--resources)
15. [Risk Assessment](#risk-assessment)

---

## Executive Summary

### What We're Building

An automated email system that sends scheduled, personalized emails to vendors throughout the event lifecycle. The system features:

- **Email Campaign Templates**: Complete collections of automated emails (up to 40 emails per template)
- **Default Template**: One system-provided campaign with 24 pre-written emails (16 editable + 8 system emails)
- **Custom Templates**: Producers can edit the default template and save as their own reusable template
- **Template-Based Event Creation**: When creating an event, producers select which template (default or custom) to use
- **Hybrid recipient filtering**: Combine status-based filters with custom attributes (location, category, tags)
- **Full customization**: Producers can edit timing, content, recipients, and pause/delete editable emails per event
- **Template Reusability**: "Save as New Template" allows producers to reuse their customized email campaigns
- **Visual editor**: WYSIWYG interface with "Insert Field" buttons for dynamic data (no manual coding)

**📧 Complete Email Template Specifications:** See [EMAIL_TEMPLATES.md](./EMAIL_TEMPLATES.md) for all 24 email templates with exact subject lines, body content, triggers, and implementation details.

### Business Value

1. **Time Savings**: Eliminate manual email coordination for up to 24 touchpoints per event (expandable to 40)
2. **Consistency**: Ensure all vendors receive timely, professional communication
3. **Personalization**: Dynamic variables tailor each email to the recipient
4. **Flexibility**: Producers retain full control to customize per event
5. **Template Reusability**: Save customized email campaigns for instant reuse on future events
6. **Scalability**: Template-based approach enables rapid event creation
7. **Safety**: Smart filtering prevents sending logistics emails to rejected vendors

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│               DEFAULT EMAIL CAMPAIGN TEMPLATE                  │
│       (System-provided: 16 editable + 8 system emails)         │
│   ✅ Email 1-16: Editable (announcements, reminders, etc.)     │
│   ⚙️ Email 17-24: System (status changes, auto-triggers)       │
│                                                                 │
│   Max capacity: 40 emails per template                         │
└───────────────────────┬────────────────────────────────────────┘
                        │ User can edit and "Save as New Template"
                        ↓
┌────────────────────────────────────────────────────────────────┐
│              USER'S CUSTOM EMAIL CAMPAIGN TEMPLATES            │
│         (Producer's saved collections for reuse)               │
│   "My Summer Market Campaign" (20 emails)                      │
│   "Winter Festival Campaign" (18 emails)                       │
│   "Atlanta Events Campaign" (25 emails)                        │
└───────────────────────┬────────────────────────────────────────┘
                        │ Selected during event creation
                        ↓
┌────────────────────────────────────────────────────────────────┐
│         EVENT-SPECIFIC SCHEDULED EMAILS (up to 40)             │
│      16 editable emails generated from chosen template         │
│      8 system emails (always sent, not in scheduled table)     │
│      Editable emails fully customizable for this event only    │
└────────────────────────────────────────────────────────────────┘
           │                      │                      │
           ↓                      ↓                      ↓
    [Pause/Resume]           [Edit]              [Delete/Cancel]
           (Editable emails only - System emails always send)
```

**Key Concepts:**

- A **template** is a complete **email campaign** (collection of up to 40 emails), not a single email
- **Editable emails** (16 in default) are stored in `email_template_items` and can be customized/paused/deleted
- **System emails** (8 in default) are hard-coded and automatically sent on status/action changes
- Users select which template to use when creating an event

---

## CEO Decision Summary

The following decisions were made by the CEO and are incorporated throughout this plan:

### 1. Recipient Granularity

**Decision:** Hybrid Filtering (Custom Segments + Internal Status)

- **User-Defined Segments**: Support custom recipient lists based on vendor attributes (e.g., "Only vendors in Atlanta")
- **Internal Logic**: Utilize database statuses (Application Status, Payment Reminders) for automated flows
- **Safety Logic**: Event detail change notifications default to "Accepted" vendors only (exclude waitlist/rejected)

**Implementation**: JSONB `filter_criteria` field supporting:

```json
{
  "status": ["approved"],
  "vendor_category": ["Food"],
  "location_city": ["Atlanta"],
  "exclude_status": ["waitlist", "rejected"]
}
```

### 2. Email Editor

**Decision:** Simplified WYSIWYG with Dynamic Placeholders

- Rich-text interface for non-technical users
- "Insert Field" dropdown buttons (no manual {{variable}} typing)
- Variables appear as colored chips/badges in the editor
- Ensures data accuracy without technical errors

**Implementation**: TipTap editor with custom toolbar extensions

### 3. Event Date Changes

**Decision:** Manual Confirmation Workflow

- No silent auto-recalculation of send dates
- Trigger UI prompt showing all affected emails
- User confirms or adjusts each email's new scheduled date
- Prevents accidental sends

**Implementation**: Preview endpoint + confirmation modal with affected emails table

### 4. Template System

**Decision:** Template = Collection of Emails (up to 40 per template)

- **Template Definition**: A template is a complete email campaign containing up to 40 individual emails
- **Default Template**: One system-provided template that all events inherit by default
- **Custom Templates**: Users can create unlimited custom templates by editing and saving ("Save as New Template")
- **Template Selection**: During event creation, user selects which template (default or custom) to use
- **Reusability**: Custom templates can be reused across unlimited future events

**Implementation**: Two-table approach: `email_campaign_templates` (collections) + `email_template_items` (individual emails within collection)

### 5. Sent Email History

**Decision:** Out of Scope (Phase 1)

- Rely on recipient's email client for history
- No vendor-facing inbox portal initially
- Focus on sender infrastructure

**Implementation**: Deferred to future phase

### 6. Priority

**Decision:** Phase 1 (Infrastructure)

- Establish robust scheduling engine first
- Mail server integration is critical foundation
- Advanced UI features come later

---

## System Architecture

### Template System Explained

**What is a Template?**
A template is a **complete email campaign** - a named collection of up to 40 individual automated emails that work together to communicate with vendors throughout an event lifecycle.

Think of it like a "playbook" or "campaign blueprint" that contains all the emails for an event.

**Example Templates:**

- **Default Template** (System): "Standard Event Campaign" - 40 pre-written emails
- **User Template 1**: "Summer Market Campaign" - 35 customized emails
- **User Template 2**: "Atlanta Food Festival Campaign" - 28 emails tailored for food vendors in Atlanta

### Three-Layer Architecture

#### Layer 1: Email Campaign Templates (Collections)

- **What**: Named collections of email configurations
- **Types**:
  - System Default (1 template provided by platform)
  - User Custom (unlimited templates created by producers)
- **Contents**: Up to 40 individual email configurations
- **Storage**: `email_campaign_templates` table

#### Layer 2: Email Template Items (Individual Emails Within Templates)

- **What**: Individual email configurations within a template
- **Examples**: "Applications Now Open", "Deadline Approaching", "Thank You Email"
- **Properties**: Subject, body, trigger logic, recipient filters
- **Limit**: Up to 40 per template
- **Storage**: `email_template_items` table (belongs to a campaign template)

#### Layer 3: Scheduled Emails (Event-Specific Instances)

- **What**: Actual emails that will be sent for a specific event
- **Generated**: When event is created, system generates scheduled emails from chosen template
- **Customizable**: Producer can edit, pause, delete any email for this event only
- **Storage**: `scheduled_emails` table (belongs to an event)

### Data Flow

```
1. Platform Setup
   └─> Create Default Email Campaign Template with 40 emails

2. Producer Creates Custom Template (Optional)
   ├─> View Default Template
   ├─> Edit emails (add, remove, modify)
   ├─> Click "Save as New Template"
   ├─> Name it "My Summer Market Campaign"
   └─> Now available for reuse

3. Producer Creates Event
   ├─> Fill in event details
   ├─> Select template: "My Summer Market Campaign" (or Default)
   ├─> System generates 35 scheduled emails (from template)
   └─> Producer can further customize individual emails if needed

4. Email Automation Runs
   ├─> Background job checks for emails ready to send
   ├─> Sends emails at scheduled times
   └─> Logs delivery
```

---

## Database Schema

### Table 1: `email_campaign_templates`

Master template collections (system default + user custom campaigns)

```ruby
create_table :email_campaign_templates do |t|
  # Template ownership
  t.string :template_type, null: false              # 'system' or 'user'
  t.references :organization, foreign_key: true     # NULL for system template

  # Template identity
  t.string :name, null: false                       # "Standard Event Campaign", "My Summer Market Template"
  t.text :description                               # "Complete email campaign for summer markets"
  t.boolean :is_default, default: false             # Only one system default template

  # Metadata
  t.integer :email_count, default: 0                # Counter cache: number of emails in this template
  t.integer :events_count, default: 0               # Counter cache: how many events use this template

  t.timestamps
end

add_index :email_campaign_templates, [:organization_id, :name], unique: true
add_index :email_campaign_templates, [:template_type, :is_default]
```

**Validations:**

- `name` must be present and unique per organization
- `template_type` must be 'system' or 'user'
- Only one system template can have `is_default = true`
- System templates can only be created by platform (seed data)
- User templates: unlimited per organization

**Example Records:**

```ruby
# System default template
{
  id: 1,
  template_type: 'system',
  organization_id: nil,
  name: 'Default Event Campaign',
  description: 'Standard email campaign for all event types',
  is_default: true,
  email_count: 40
}

# User's custom template
{
  id: 45,
  template_type: 'user',
  organization_id: 5,
  name: 'My Summer Market Campaign',
  description: 'Customized campaign for summer food markets',
  is_default: false,
  email_count: 35
}
```

---

### Table 2: `email_template_items`

Individual emails within a template collection

```ruby
create_table :email_template_items do |t|
  # Belongs to a campaign template
  t.references :email_campaign_template, foreign_key: true, null: false

  # Email identity
  t.string :name, null: false                       # "Applications Now Open"
  t.text :description                               # "Announces application opening"
  t.string :category                                # 'pre_event', 'event_day', 'post_event', 'application'
  t.integer :position, default: 0                   # Order within template (1-40)

  # Email content (with variables like {{event_title}})
  t.string :subject_template, null: false
  t.text :body_template, null: false                # HTML with variables

  # Scheduling logic
  t.string :trigger_type, null: false               # 'days_before_event', 'days_after_event',
                                                     # 'days_before_deadline', 'on_event_date'
  t.integer :trigger_value                          # Number of days offset (e.g., 7)
  t.time :trigger_time                              # Specific time (e.g., 9:00 AM)

  # Recipient filtering (CEO Decision #1: Hybrid Filtering)
  t.jsonb :filter_criteria, default: {}             # { "status": ["approved"], "location_city": ["Atlanta"] }

  # Defaults
  t.boolean :enabled_by_default, default: true      # Auto-scheduled or paused when event created

  t.timestamps
end

add_index :email_template_items, [:email_campaign_template_id, :position]
add_index :email_template_items, :category
add_index :email_template_items, :filter_criteria, using: :gin
```

**Validations:**

- Must belong to an `email_campaign_template`
- `position` must be between 1 and 40
- Maximum 40 email_template_items per campaign template
- `name` must be unique within a template

**Example Records:**

```ruby
# Email #1 in Default Template
{
  id: 1,
  email_campaign_template_id: 1,  # Default template
  name: 'Applications Now Open',
  category: 'pre_application',
  position: 1,
  subject_template: '{{event_title}} Vendor Applications Are Now Open!',
  body_template: '<p>Hi there,</p><p>We\'re excited to announce...</p>',
  trigger_type: 'days_before_deadline',
  trigger_value: 30,
  trigger_time: '09:00',
  filter_criteria: {},
  enabled_by_default: true
}

# Email #2 in Default Template
{
  id: 2,
  email_campaign_template_id: 1,
  name: 'Application Deadline Approaching',
  category: 'application',
  position: 4,
  subject_template: 'Only {{days_remaining}} Days Left...',
  trigger_type: 'days_before_deadline',
  trigger_value: 7,
  filter_criteria: { "status": ["pending"] }
}
```

---

### Table 3: `scheduled_emails`

Event-specific email instances (actual scheduled emails)

```ruby
create_table :scheduled_emails do |t|
  # Event association
  t.references :event, foreign_key: true, null: false

  # Template tracking (where this email came from)
  t.references :email_campaign_template, foreign_key: true  # Which template collection
  t.references :email_template_item, foreign_key: true      # Which specific email in template

  # Email details (customizable per event - copied from template_item)
  t.string :name, null: false
  t.string :subject_template                        # Can be edited from template
  t.text :body_template                             # Can be edited from template

  # Scheduling (customizable per event)
  t.string :trigger_type                            # Can override template
  t.integer :trigger_value                          # Can override template
  t.time :trigger_time                              # Can override template
  t.datetime :scheduled_for                         # Computed: when to actually send (UTC)

  # Recipient filtering (customizable per event)
  t.jsonb :filter_criteria, default: {}

  # Status tracking
  t.string :status, default: 'scheduled'            # 'scheduled', 'paused', 'sent', 'failed', 'cancelled'
  t.datetime :sent_at
  t.integer :recipient_count, default: 0            # How many recipients received this email
  t.text :error_message                             # If status='failed'

  t.timestamps
end

add_index :scheduled_emails, [:event_id, :status]
add_index :scheduled_emails, [:status, :scheduled_for]  # For background job queries
add_index :scheduled_emails, :email_campaign_template_id
add_index :scheduled_emails, :filter_criteria, using: :gin
```

**Validations:**

- Must belong to an event
- Status must be one of: scheduled, paused, sent, failed, cancelled
- Cannot edit if status='sent' (immutable after sending)

**Example Records:**

```ruby
# Scheduled email for Event #123
{
  id: 501,
  event_id: 123,
  email_campaign_template_id: 45,  # User's "Summer Market Campaign"
  email_template_item_id: 205,      # "Applications Now Open" email
  name: 'Applications Now Open',
  subject_template: '{{event_title}} Vendor Applications Are Now Open!',
  body_template: '<p>Hi there,</p>...',
  trigger_type: 'days_before_deadline',
  trigger_value: 30,
  scheduled_for: '2025-05-01 09:00:00 UTC',
  filter_criteria: {},
  status: 'scheduled'
}
```

---

### Table 4: `email_deliveries`

Email delivery tracking with SendGrid webhook integration (Phase 1)

```ruby
create_table :email_deliveries do |t|
  # Email associations
  t.references :scheduled_email, foreign_key: true, null: false, index: true
  t.references :event, foreign_key: true, null: false
  t.references :vendor_registration, foreign_key: true, null: false

  # Email identifiers
  t.string :sendgrid_message_id, null: false, index: { unique: true }  # From SendGrid response
  t.string :recipient_email, null: false

  # Delivery tracking (updated via SendGrid webhook)
  t.string :status, null: false, default: 'queued'
  # Status values: 'queued', 'sent', 'delivered', 'bounced', 'dropped', 'unsubscribed'

  t.string :bounce_type              # 'soft' or 'hard'
  t.text :bounce_reason              # From SendGrid bounce event
  t.text :drop_reason                # From SendGrid dropped event

  # Event timestamps (from SendGrid webhook)
  t.datetime :sent_at
  t.datetime :delivered_at
  t.datetime :bounced_at
  t.datetime :dropped_at
  t.datetime :unsubscribed_at

  # Auto-retry logic for soft bounces
  t.integer :retry_count, default: 0
  t.datetime :next_retry_at
  t.integer :max_retries, default: 3

  t.timestamps
end

add_index :email_deliveries, [:event_id, :status]
add_index :email_deliveries, [:vendor_registration_id, :status]
add_index :email_deliveries, :next_retry_at, where: "next_retry_at IS NOT NULL"
```

**Validations:**

- `sendgrid_message_id` must be unique (one delivery record per sent email)
- `status` must be one of: queued, sent, delivered, bounced, dropped, unsubscribed
- Soft bounces can be retried up to 3 times with exponential backoff

**See [Email Delivery Tracking](#email-delivery-tracking) section for complete implementation details.**

---

### Updated Event Model

```ruby
# app/models/event.rb

class Event < ApplicationRecord
  belongs_to :organization
  belongs_to :email_campaign_template, optional: true  # NEW: Track which template was used
  has_many :scheduled_emails, dependent: :destroy

  after_create :generate_scheduled_emails_from_template

  private

  def generate_scheduled_emails_from_template
    # Use selected template or fallback to default
    template = email_campaign_template || EmailCampaignTemplate.default_template
    ScheduledEmailGenerator.generate_for_event(self, template)
  end
end
```

---

## The Default Email Campaign (24 Emails)

**📧 For complete email template specifications, see [EMAIL_TEMPLATES.md](./EMAIL_TEMPLATES.md)**

The system provides one default email campaign template with **24 pre-written emails** covering the entire event lifecycle.

### Two Types of Emails

#### 1. Editable/Scheduled Emails (16 emails)

These emails are stored in `email_template_items` table and can be:

- ✅ Customized (subject, body, timing, recipients)
- ✅ Paused or deleted per event
- ✅ Scheduled based on triggers (days before deadline, days before event, etc.)

**Categories:**

- **Event Announcements**: 4 emails (promote event, drive applications)
- **Application Updates**: 1 email (confirm receipt)
- **Payment Reminders**: 4 emails (payment deadline countdown)
- **Event Countdown**: 7 emails (pre-event reminders, day-of, post-event thank you)

#### 2. System Emails (8 emails)

These emails are hard-coded in application logic and:

- ❌ CANNOT be edited, paused, or deleted by producers
- ⚙️ Automatically sent when specific actions occur (status changes, event updates)
- 🔒 Sent immediately via `RegistrationEmailService`, not through scheduling system

**System Email Triggers:**

- Application Accepted (status → approved)
- Waitlist/Not Accepted (status → waitlist/rejected)
- Moved to Waitlist - Non-Payment (payment deadline missed)
- Payment Confirmed (payment received)
- Category Changed (producer changes vendor category)
- Event Details Changed (event date/venue/time updated)
- Event Canceled (event status → cancelled)
- Bulletin Board Update (producer posts announcement)

### Quick Reference Table

**For full implementation details (subjects, body HTML, triggers, filters), see [EMAIL_TEMPLATES.md](./EMAIL_TEMPLATES.md)**

| #   | Email Name                      | Category            | Trigger                    | Editable |
| --- | ------------------------------- | ------------------- | -------------------------- | -------- |
| 1   | Immediate Announcement          | Event Announcements | On application open        | ✅ Yes   |
| 2   | 10 Weeks Before Deadline        | Event Announcements | 70 days before deadline    | ✅ Yes   |
| 3   | 8 Weeks Before Deadline         | Event Announcements | 56 days before deadline    | ✅ Yes   |
| 4   | 12 Days Before Deadline         | Event Announcements | 12 days before deadline    | ✅ Yes   |
| 5   | Application Received            | Application Updates | On submit                  | ✅ Yes   |
| 6   | Payment Details                 | Payment Reminders   | On approval                | ✅ Yes   |
| 7   | 1 Week Before Payment           | Payment Reminders   | 7 days before payment due  | ✅ Yes   |
| 8   | 3 Days Before Payment           | Payment Reminders   | 3 days before payment due  | ✅ Yes   |
| 9   | Payment Due Today               | Payment Reminders   | On payment deadline        | ✅ Yes   |
| 10  | 33 Days Before Event            | Event Countdown     | 33 days before event       | ✅ Yes   |
| 11  | 23 Days Before Event            | Event Countdown     | 23 days before event       | ✅ Yes   |
| 12  | 10 Days Before Event            | Event Countdown     | 10 days before event       | ✅ Yes   |
| 13  | 4 Days Before Event             | Event Countdown     | 4 days before event        | ✅ Yes   |
| 14  | 2 Days Before Event             | Event Countdown     | 2 days before event        | ✅ Yes   |
| 15  | Day of Event                    | Event Countdown     | Event day at 7:00 AM       | ✅ Yes   |
| 16  | Day After Event - Thank You     | Event Countdown     | 1 day after event          | ✅ Yes   |
| 17  | Application Accepted            | System Email        | Status → approved          | ❌ No    |
| 18  | Waitlist/Not Accepted           | System Email        | Status → waitlist/rejected | ❌ No    |
| 19  | Moved to Waitlist (Non-Payment) | System Email        | Payment deadline missed    | ❌ No    |
| 20  | Payment Confirmed               | System Email        | Payment received           | ❌ No    |
| 21  | Category Changed                | System Email        | Category updated           | ❌ No    |
| 22  | Event Details Changed           | System Email        | Event date/venue changed   | ❌ No    |
| 23  | Event Canceled                  | System Email        | Event cancelled            | ❌ No    |
| 24  | Bulletin Board Update           | System Email        | Bulletin post created      | ❌ No    |

### Implementation Notes

**Editable Emails (1-16):**

- Stored in `email_template_items` table
- Generated as `scheduled_emails` when event is created
- Can be customized, paused, or deleted by producer
- Sent by background job (`EmailSenderWorker`)

**System Emails (17-24):**

- Hard-coded in `RegistrationEmailService`
- NOT stored in `email_template_items` or `scheduled_emails`
- Triggered automatically by model callbacks (`after_update`, etc.)
- Cannot be edited or disabled by producers
- Sent immediately when trigger action occurs

**Variable Mapping:**

- Template uses `[firstName]`, `[eventName]`, etc.
- Backend resolves to `{{vendor_name}}`, `{{event_title}}`, etc.
- See EMAIL_TEMPLATES.md for complete variable reference

---

## Filter Criteria System

### Available Filter Fields (CEO Decision #1)

The `filter_criteria` JSONB field supports the following filters:

#### Status Filters

```json
{
  "status": ["approved", "confirmed"], // Include these statuses
  "exclude_status": ["waitlist", "rejected"] // Exclude these statuses (safety logic)
}
```

**Available statuses:**

- `pending` - Application submitted, awaiting review
- `approved` - Application accepted by producer
- `confirmed` - Vendor confirmed participation (payment received)
- `waitlist` - Application on waitlist
- `rejected` - Application declined
- `cancelled` - Vendor cancelled after approval

#### Vendor Attribute Filters

```json
{
  "vendor_category": ["Food", "Art", "Music"], // Filter by vendor type
  "location_city": ["Atlanta", "Savannah"], // Filter by vendor location
  "location_state": ["GA", "FL"], // Filter by state
  "tags": ["premium_vendor", "returning_vendor"] // Custom tags
}
```

#### Payment Filters (Future)

```json
{
  "payment_status": ["paid", "unpaid", "partial"]
}
```

### Filter Logic

Filters are **cumulative (AND logic)**:

```json
{
  "status": ["approved"],
  "vendor_category": ["Food"],
  "location_city": ["Atlanta"]
}
```

Result: Approved vendors in Food category located in Atlanta

### Example Use Cases

**Use Case 1: Event logistics email (CEO Decision #1 - Safety Logic)**

```json
{
  "status": ["approved", "confirmed"],
  "exclude_status": ["waitlist", "rejected"]
}
```

✅ Sends to approved/confirmed vendors only
❌ Prevents rejected/waitlist vendors from receiving setup instructions

---

## Email Variables

### Variable Syntax

Variables use double curly braces: `{{variable_name}}`

### Available Variables

#### Event Variables

```
{{event_title}}                    // "Summer Market 2025"
{{event_date}}                     // "June 15, 2025" (formatted)
{{event_time}}                     // "10:00 AM - 6:00 PM"
{{event_location}}                 // "Piedmont Park, Atlanta, GA"
{{event_description}}              // Full event description
{{event_url}}                      // "https://voxxypresents.com/events/summer-market-2025"
{{application_deadline}}           // "May 30, 2025"
{{booth_price}}                    // "150.00" (numeric, format with $ in template)
{{capacity}}                       // Event capacity
{{registered_count}}               // Number of applicants
```

#### Organization Variables

```
{{organization_name}}              // "Voxxy Presents"
{{organization_email}}             // "events@voxxyai.com"
{{organization_website}}           // "https://voxxypresents.com"
{{organization_instagram}}         // "@voxxypresents"
{{organization_phone}}             // "404-555-1234"
```

#### Vendor-Specific Variables (resolved per recipient)

```
{{vendor_name}}                    // "John Doe"
{{business_name}}                  // "John's Tacos"
{{vendor_category}}                // "Food"
{{application_status}}             // "approved"
{{ticket_code}}                    // "ABC123" (tracking code)
{{booth_number}}                   // "A-12" (if assigned)
```

#### Computed Variables (future enhancement)

```
{{days_remaining}}                 // Days until event
{{days_until_deadline}}            // Days until application deadline
{{tracking_url}}                   // Full URL to track application
```

---

## Email Delivery Tracking

### Overview

**Phase 1 Scope:** Real-time email delivery tracking using SendGrid Event Webhooks. Track delivery status, bounces, drops, and unsubscribes with automatic retry logic for soft bounces.

**Why Include in Phase 1:**

- ✅ SendGrid webhook already configured
- ✅ Essential for debugging during rollout
- ✅ Producers expect delivery visibility
- ✅ Easier to build correctly from the start than retrofit later
- ✅ Critical audit trail for vendor complaints

**Architecture:** SendGrid pushes events to our webhook endpoint → Background job processes event → Update database → UI reflects status in real-time

### Database Schema

Add new table to track email delivery status:

```ruby
create_table :email_deliveries do |t|
  t.references :scheduled_email, foreign_key: true, null: false, index: true
  t.references :event, foreign_key: true, null: false
  t.references :vendor_registration, foreign_key: true, null: false

  # Email identifiers
  t.string :sendgrid_message_id, null: false, index: { unique: true }
  t.string :recipient_email, null: false

  # Delivery tracking
  t.string :status, null: false, default: 'queued'
  # Status values: 'queued', 'sent', 'delivered', 'bounced', 'dropped', 'unsubscribed'

  t.string :bounce_type              # 'soft' or 'hard'
  t.text :bounce_reason
  t.text :drop_reason

  # Timestamps
  t.datetime :sent_at
  t.datetime :delivered_at
  t.datetime :bounced_at
  t.datetime :dropped_at
  t.datetime :unsubscribed_at

  # Retry logic
  t.integer :retry_count, default: 0
  t.datetime :next_retry_at
  t.integer :max_retries, default: 3

  t.timestamps
end

add_index :email_deliveries, [:event_id, :status]
add_index :email_deliveries, [:vendor_registration_id, :status]
add_index :email_deliveries, :next_retry_at, where: "next_retry_at IS NOT NULL"
```

**Association Updates:**

```ruby
# models/scheduled_email.rb
class ScheduledEmail < ApplicationRecord
  has_many :email_deliveries, dependent: :destroy
  has_one :latest_delivery, -> { order(created_at: :desc) }, class_name: 'EmailDelivery'

  # Computed delivery status for UI
  def delivery_status
    latest_delivery&.status || 'pending'
  end
end

# models/email_delivery.rb
class EmailDelivery < ApplicationRecord
  belongs_to :scheduled_email
  belongs_to :event
  belongs_to :vendor_registration

  enum status: {
    queued: 'queued',
    sent: 'sent',
    delivered: 'delivered',
    bounced: 'bounced',
    dropped: 'dropped',
    unsubscribed: 'unsubscribed'
  }

  validates :sendgrid_message_id, presence: true, uniqueness: true
  validates :recipient_email, presence: true

  scope :failed, -> { where(status: ['bounced', 'dropped']) }
  scope :pending_retry, -> { where('next_retry_at IS NOT NULL AND next_retry_at <= ?', Time.current) }
  scope :soft_bounces, -> { where(status: 'bounced', bounce_type: 'soft') }
end
```

### SendGrid Webhook Configuration

**Webhook URL:** `https://www.voxxypresents.com/webhooks/sendgrid`

**Events to Track:**

- ✅ `delivered` - Email successfully delivered to recipient's inbox
- ✅ `bounce` - Email bounced (hard or soft bounce)
- ✅ `dropped` - SendGrid refused to send (e.g., previously unsubscribed)
- ✅ `unsubscribe` - User clicked unsubscribe link

**Webhook Payload Example:**

```json
[
  {
    "email": "vendor@example.com",
    "event": "delivered",
    "sg_message_id": "abc123xyz.filterdrecv-123-456",
    "timestamp": 1640995200,
    "custom_args": {
      "scheduled_email_id": "789",
      "event_id": "456",
      "registration_id": "123"
    }
  }
]
```

### Tracking ID Implementation

**Add custom tracking data when sending emails:**

```ruby
# services/email_sender_service.rb (or in Sidekiq worker)
class EmailSenderService
  def send_email(scheduled_email, registration)
    mail = SendGrid::Mail.new
    mail.from = SendGrid::Email.new(email: 'hello@voxxypresents.com')
    mail.subject = resolve_subject(scheduled_email, registration)

    personalization = SendGrid::Personalization.new
    personalization.add_to(SendGrid::Email.new(email: registration.email))

    # CRITICAL: Add tracking IDs so webhook can identify this email
    personalization.add_custom_arg(SendGrid::CustomArg.new(
      key: 'scheduled_email_id',
      value: scheduled_email.id.to_s
    ))
    personalization.add_custom_arg(SendGrid::CustomArg.new(
      key: 'event_id',
      value: scheduled_email.event_id.to_s
    ))
    personalization.add_custom_arg(SendGrid::CustomArg.new(
      key: 'registration_id',
      value: registration.id.to_s
    ))

    mail.add_personalization(personalization)
    mail.add_content(SendGrid::Content.new(
      type: 'text/html',
      value: resolve_body(scheduled_email, registration)
    ))

    # Send via SendGrid
    sg = SendGrid::API.new(api_key: ENV['SENDGRID_API_KEY'])
    response = sg.client.mail._('send').post(request_body: mail.to_json)

    # Create delivery record
    if response.status_code.to_i.between?(200, 299)
      message_id = response.headers['X-Message-Id']

      EmailDelivery.create!(
        scheduled_email: scheduled_email,
        event: scheduled_email.event,
        vendor_registration: registration,
        sendgrid_message_id: message_id,
        recipient_email: registration.email,
        status: 'sent',
        sent_at: Time.current
      )
    else
      Rails.logger.error("SendGrid error: #{response.body}")
      # Handle error
    end

    response
  end
end
```

### Webhook Controller

**Route:**

```ruby
# config/routes.rb
namespace :webhooks do
  post 'sendgrid', to: 'sendgrid#create'
end
```

**Controller:**

```ruby
# app/controllers/webhooks/sendgrid_controller.rb
module Webhooks
  class SendgridController < ApplicationController
    skip_before_action :verify_authenticity_token
    skip_before_action :authenticate_user! # Public webhook endpoint

    def create
      # SendGrid sends an array of events
      events = JSON.parse(request.body.read)

      events.each do |event_data|
        # Process each event in background to keep webhook fast
        EmailDeliveryProcessorJob.perform_async(event_data)
      end

      head :ok
    rescue JSON::ParserError => e
      Rails.logger.error("SendGrid webhook parse error: #{e.message}")
      head :bad_request
    end
  end
end
```

### Background Processing

**Sidekiq Worker:**

```ruby
# app/workers/email_delivery_processor_job.rb
class EmailDeliveryProcessorJob
  include Sidekiq::Job

  def perform(event_data)
    event_type = event_data['event']
    message_id = event_data['sg_message_id']
    timestamp = Time.at(event_data['timestamp'])

    # Find the delivery record by SendGrid message ID
    delivery = EmailDelivery.find_by(sendgrid_message_id: message_id)

    unless delivery
      Rails.logger.warn("Email delivery not found for message_id: #{message_id}")
      return
    end

    case event_type
    when 'delivered'
      delivery.update!(
        status: 'delivered',
        delivered_at: timestamp
      )

    when 'bounce'
      bounce_type = event_data['type'] # 'bounce' or 'blocked'
      is_soft_bounce = bounce_type == 'blocked' || event_data['reason']&.include?('mailbox full')

      delivery.update!(
        status: 'bounced',
        bounce_type: is_soft_bounce ? 'soft' : 'hard',
        bounce_reason: event_data['reason'],
        bounced_at: timestamp
      )

      # Auto-retry soft bounces
      if is_soft_bounce && delivery.retry_count < delivery.max_retries
        schedule_retry(delivery)
      end

    when 'dropped'
      delivery.update!(
        status: 'dropped',
        drop_reason: event_data['reason'],
        dropped_at: timestamp
      )

    when 'unsubscribe'
      delivery.update!(
        status: 'unsubscribed',
        unsubscribed_at: timestamp
      )

      # Mark vendor as unsubscribed globally
      delivery.vendor_registration.update(email_unsubscribed: true)
    end

    # Broadcast to frontend via Action Cable (optional, Phase 2)
    # DeliveryStatusChannel.broadcast_to(delivery.event, {
    #   scheduled_email_id: delivery.scheduled_email_id,
    #   status: delivery.status
    # })
  end

  private

  def schedule_retry(delivery)
    # Exponential backoff: 1 hour, 4 hours, 24 hours
    retry_delays = [1.hour, 4.hours, 24.hours]
    next_delay = retry_delays[delivery.retry_count] || 24.hours

    delivery.update!(
      retry_count: delivery.retry_count + 1,
      next_retry_at: next_delay.from_now
    )

    # Schedule retry job
    EmailRetryJob.perform_in(next_delay, delivery.id)
  end
end
```

**Email Retry Worker:**

```ruby
# app/workers/email_retry_job.rb
class EmailRetryJob
  include Sidekiq::Job

  def perform(delivery_id)
    delivery = EmailDelivery.find(delivery_id)

    # Don't retry if already delivered or unsubscribed
    return if delivery.delivered? || delivery.unsubscribed?

    # Resend the email
    EmailSenderService.new.send_email(
      delivery.scheduled_email,
      delivery.vendor_registration
    )

    # Clear retry timestamp
    delivery.update!(next_retry_at: nil)
  end
end
```

### UI Integration

**Display delivery status on each scheduled email row:**

```typescript
// frontend/src/components/producer/ScheduledEmailRow.tsx
interface DeliveryStatus {
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'dropped' | 'unsubscribed';
  sentAt?: string;
  deliveredAt?: string;
  bouncedAt?: string;
  bounceReason?: string;
  dropReason?: string;
  retryCount?: number;
  nextRetryAt?: string;
}

const DeliveryStatusBadge = ({ status, delivery }: { status: string; delivery?: DeliveryStatus }) => {
  const statusConfig = {
    pending: { color: 'gray', icon: '○', label: 'Not Sent' },
    sent: { color: 'blue', icon: '↗', label: 'Sent' },
    delivered: { color: 'green', icon: '✓', label: 'Delivered' },
    bounced: { color: 'red', icon: '✕', label: 'Bounced' },
    dropped: { color: 'red', icon: '⊘', label: 'Dropped' },
    unsubscribed: { color: 'gray', icon: '⊗', label: 'Unsubscribed' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Tooltip content={
      <div className="text-xs">
        <p className="font-semibold">{config.label}</p>
        {delivery?.deliveredAt && <p>Delivered: {new Date(delivery.deliveredAt).toLocaleString()}</p>}
        {delivery?.bounceReason && <p className="text-red-400">Reason: {delivery.bounceReason}</p>}
        {delivery?.retryCount > 0 && <p>Retries: {delivery.retryCount}</p>}
      </div>
    }>
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    </Tooltip>
  );
};
```

**API Response Update:**

```ruby
# app/controllers/api/v1/scheduled_emails_controller.rb
def index
  scheduled_emails = @event.scheduled_emails.includes(:latest_delivery)

  render json: scheduled_emails.map { |email|
    {
      id: email.id,
      name: email.name,
      subject: email.subject_template,
      scheduled_for: email.scheduled_for,
      # ... other fields
      delivery: email.latest_delivery&.as_json(
        only: [:status, :sent_at, :delivered_at, :bounced_at, :bounce_reason, :drop_reason, :retry_count, :next_retry_at]
      )
    }
  }
end
```

### Monitoring & Alerts

**Daily Summary Job (Phase 2):**

```ruby
# app/workers/email_delivery_summary_job.rb
class EmailDeliverySummaryJob
  include Sidekiq::Job

  def perform
    # Send daily summary to admins about delivery health
    yesterday = 1.day.ago.all_day

    stats = {
      sent: EmailDelivery.where(sent_at: yesterday).count,
      delivered: EmailDelivery.where(delivered_at: yesterday).count,
      bounced: EmailDelivery.where(bounced_at: yesterday).count,
      dropped: EmailDelivery.where(dropped_at: yesterday).count
    }

    delivery_rate = stats[:sent] > 0 ? (stats[:delivered].to_f / stats[:sent] * 100).round(2) : 0

    # Alert if delivery rate drops below 95%
    if delivery_rate < 95
      # Send alert to admins
      AdminMailer.low_delivery_rate_alert(stats, delivery_rate).deliver_later
    end
  end
end
```

### Testing the Webhook

**Local Testing with ngrok:**

```bash
# 1. Start ngrok tunnel
ngrok http 3000

# 2. Update SendGrid webhook URL to ngrok URL
# https://abc123.ngrok.io/webhooks/sendgrid

# 3. Use SendGrid's "Test Your Integration" button
# Check Rails logs to see webhook data
```

**RSpec Tests:**

```ruby
# spec/controllers/webhooks/sendgrid_controller_spec.rb
RSpec.describe Webhooks::SendgridController, type: :controller do
  describe 'POST #create' do
    let(:delivery) { create(:email_delivery, sendgrid_message_id: 'test-msg-123') }

    it 'processes delivered event' do
      post :create, body: [{
        event: 'delivered',
        sg_message_id: 'test-msg-123',
        timestamp: Time.current.to_i
      }].to_json

      expect(response).to have_http_status(:ok)
      expect(EmailDeliveryProcessorJob).to have_enqueued_sidekiq_job
    end
  end
end
```

### Implementation Checklist

**Phase 1 - Core Tracking:**

- [ ] Create `email_deliveries` migration and model
- [ ] Add associations to `ScheduledEmail` model
- [ ] Update email sending service to include `custom_args` tracking IDs
- [ ] Create `EmailDeliveryProcessorJob` Sidekiq worker
- [ ] Create `EmailRetryJob` Sidekiq worker
- [ ] Create `Webhooks::SendgridController`
- [ ] Add webhook route
- [ ] Test webhook locally with ngrok
- [ ] Update API to return delivery status
- [ ] Add `DeliveryStatusBadge` component to frontend
- [ ] Verify webhook in production SendGrid settings

**Phase 2 Enhancements (Future):**

- [ ] Add Action Cable real-time updates
- [ ] Daily delivery health monitoring
- [ ] Manual resend UI for failed emails
- [ ] Bulk email health dashboard
- [ ] Track open rates (requires `open` event)
- [ ] Track click rates (requires `click` event)

---

## Services & Business Logic

### Service 1: `EmailScheduleCalculator`

**Purpose:** Calculate when an email should be sent based on trigger logic

**Method:**

```ruby
EmailScheduleCalculator.calculate(
  trigger_type: 'days_before_event',
  trigger_value: 7,
  event_date: Date.parse('2025-06-15'),
  application_deadline: Date.parse('2025-05-30'),
  trigger_time: Time.parse('09:00')
)
# Returns: 2025-06-08 09:00:00 UTC
```

---

### Service 2: `RecipientFilterService`

**Purpose:** Filter event registrations based on filter_criteria JSONB

**Method:**

```ruby
RecipientFilterService.filter_recipients(
  event: @event,
  filter_criteria: { "status": ["approved"], "vendor_category": ["Food"] }
)
# Returns: ActiveRecord::Relation of matching registrations
```

---

### Service 3: `ScheduledEmailGenerator`

**Purpose:** Auto-generate scheduled emails when event is created (from selected template)

**Method:**

```ruby
ScheduledEmailGenerator.generate_for_event(@event, @email_campaign_template)
# Creates up to 40 scheduled_email records from template
```

**Logic:**

1. Fetch all `email_template_items` for the selected campaign template
2. For each template item:
   - Create ScheduledEmail record
   - Copy template content (subject, body, filter_criteria)
   - Calculate scheduled_for using EmailScheduleCalculator
   - Set status ('scheduled' if enabled_by_default, else 'paused')
   - Link to origin email_template_item_id
3. Return array of created scheduled_emails

---

### Service 4: `EmailVariableResolver`

**Purpose:** Replace {{variables}} with actual data

**Method:**

```ruby
EmailVariableResolver.resolve(
  template: "Hi {{vendor_name}}, {{event_title}} is on {{event_date}}",
  event: @event,
  registration: @registration
)
# Returns: "Hi John Doe, Summer Market 2025 is on June 15, 2025"
```

---

### Service 5: `EmailCampaignTemplateCloner`

**Purpose:** Clone a template to create a new user template ("Save as New Template")

**Method:**

```ruby
EmailCampaignTemplateCloner.clone(
  source_template: @email_campaign_template,
  organization: @organization,
  new_name: "My Custom Summer Campaign"
)
# Creates new email_campaign_template with all email_template_items copied
```

**Logic:**

1. Create new `EmailCampaignTemplate` record
   - template_type: 'user'
   - organization_id: current_organization
   - name: user-provided name
2. Clone all `email_template_items` from source template
   - Copy subject, body, trigger logic, filters
   - Link to new campaign template
3. Return new template with all items

---

## API Endpoints

### Email Campaign Templates (Collections)

#### List all templates available to user

```
GET /v1/presents/email_campaign_templates

Response:
[
  {
    "id": 1,
    "template_type": "system",
    "organization_id": null,
    "name": "Default Event Campaign",
    "description": "Standard email campaign for all events",
    "is_default": true,
    "email_count": 40,
    "created_at": "2025-01-01T00:00:00Z"
  },
  {
    "id": 45,
    "template_type": "user",
    "organization_id": 5,
    "name": "My Summer Market Campaign",
    "description": "Customized for summer food markets",
    "is_default": false,
    "email_count": 35,
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

#### Get single template with all emails

```
GET /v1/presents/email_campaign_templates/:id

Response:
{
  "id": 1,
  "name": "Default Event Campaign",
  "email_count": 40,
  "emails": [
    {
      "id": 1,
      "name": "Applications Now Open",
      "position": 3,
      "category": "pre_application",
      "subject_template": "{{event_title}} Applications Are Open!",
      "trigger_type": "days_before_deadline",
      "trigger_value": 30,
      "enabled_by_default": true
    },
    // ... 39 more emails
  ]
}
```

#### Create custom template (clone from existing)

```
POST /v1/presents/email_campaign_templates

Body:
{
  "source_template_id": 1,  // Clone from default template
  "name": "My Atlanta Food Market Campaign",
  "description": "Customized for Atlanta food events"
}

Response: Created template object
```

#### Update user template

```
PATCH /v1/presents/email_campaign_templates/:id

Body:
{
  "name": "Updated Campaign Name",
  "description": "Updated description"
}

Response: Updated template object
```

#### Delete user template

```
DELETE /v1/presents/email_campaign_templates/:id

Response: 204 No Content
```

---

### Email Template Items (Individual Emails Within Template)

#### Add email to user's custom template

```
POST /v1/presents/email_campaign_templates/:template_id/emails

Body:
{
  "name": "Custom Reminder Email",
  "position": 15,
  "subject_template": "Custom subject...",
  "body_template": "<p>Custom body...</p>",
  "trigger_type": "days_before_event",
  "trigger_value": 5,
  "filter_criteria": { "status": ["approved"] }
}

Response: Created email_template_item object
```

#### Update email within user's template

```
PATCH /v1/presents/email_template_items/:id

Body:
{
  "subject_template": "Updated subject",
  "trigger_value": 10
}

Response: Updated email_template_item object
```

#### Delete email from user's template

```
DELETE /v1/presents/email_template_items/:id

Response: 204 No Content
```

---

### Scheduled Emails (Event-Specific)

#### List all scheduled emails for event

```
GET /v1/presents/events/:event_slug/scheduled_emails

Response: Array of scheduled_email objects
```

#### Update scheduled email (event-specific customization)

```
PATCH /v1/presents/scheduled_emails/:id

Body:
{
  "subject_template": "Updated subject for this event only",
  "trigger_value": 10
}

Response: Updated scheduled_email object
```

#### Pause/Resume/Delete

```
PATCH /v1/presents/scheduled_emails/:id/pause
PATCH /v1/presents/scheduled_emails/:id/resume
DELETE /v1/presents/scheduled_emails/:id
```

#### Save event's emails as new template

```
POST /v1/presents/events/:event_slug/save_as_template

Body:
{
  "name": "My Custom Template from Summer Market 2025",
  "description": "This worked great, saving for future events"
}

Response: New email_campaign_template created from event's scheduled_emails
```

---

## Frontend Components

### Component Structure

```
src/components/producer/
├── EmailAutomationTab.tsx          # Main tab in ProducerDashboard
├── TemplateSelectorModal.tsx       # NEW: Select template during event creation
├── TemplateEditorModal.tsx         # NEW: Edit template (collection of emails)
├── ScheduledEmailList.tsx          # List/table view of all emails
├── ScheduledEmailCard.tsx          # Individual email card
├── EmailEditor.tsx                 # WYSIWYG editor with variable insertion
├── FilterBuilder.tsx               # UI for building filter_criteria
├── VariablePickerButton.tsx        # "Insert Field" dropdown button
├── EmailPreviewModal.tsx           # Preview email with resolved variables
├── DateChangeConfirmationModal.tsx # Confirm date changes
└── TemplateManager/
    ├── TemplateList.tsx            # List of all templates
    ├── TemplateDetailView.tsx      # View all emails in a template
    └── SaveAsTemplateDialog.tsx    # "Save as New Template" dialog
```

---

### Updated Event Creation Flow

**Step 1: Event Details**

- User fills in basic event info (title, date, location, etc.)

**Step 2: Select Email Template**

```
┌────────────────────────────────────────────────────────────┐
│ Choose Email Campaign Template                             │
├────────────────────────────────────────────────────────────┤
│ ◉ Default Event Campaign (40 emails)                       │
│   Standard email campaign for all event types              │
│   [Preview Template]                                       │
│                                                             │
│ ○ My Summer Market Campaign (35 emails)                    │
│   Customized for summer food markets                       │
│   [Preview Template] [Edit Template]                       │
│                                                             │
│ ○ Atlanta Food Festival Campaign (28 emails)               │
│   Tailored for Atlanta food vendors                        │
│   [Preview Template] [Edit Template]                       │
│                                                             │
│ [Create New Template from Default]                         │
│                                                             │
│ [Continue] [Back]                                          │
└────────────────────────────────────────────────────────────┘
```

**Step 3: Vendor Application Setup** (existing)

**Step 4: Review & Create**

- Shows selected template
- "X emails will be scheduled"
- Creates event + generates scheduled emails from template

---

### Template Editor

```
┌────────────────────────────────────────────────────────────┐
│ Edit Template: My Summer Market Campaign                   │
├────────────────────────────────────────────────────────────┤
│ Template Name: [My Summer Market Campaign_______________]  │
│ Description:   [Customized for summer food markets_____]   │
│                                                             │
│ Emails in This Template (35/40)                [+ Add Email]│
├────────────────────────────────────────────────────────────┤
│ 📧 1. Save the Date                            [↑] [↓] [✏] [🗑]│
│    Trigger: 60 days before event                           │
│    Status: ✅ Enabled                                      │
├────────────────────────────────────────────────────────────┤
│ 📧 2. Applications Now Open                    [↑] [↓] [✏] [🗑]│
│    Trigger: 30 days before deadline                        │
│    Status: ✅ Enabled                                      │
├────────────────────────────────────────────────────────────┤
│ 📧 3. Application Deadline Approaching         [↑] [↓] [✏] [🗑]│
│    Trigger: 7 days before deadline                         │
│    Status: ✅ Enabled                                      │
├────────────────────────────────────────────────────────────┤
│ ... 32 more emails                                         │
│                                                             │
│ [Preview Full Campaign] [Save Template] [Save As New...]   │
└────────────────────────────────────────────────────────────┘
```

---

### Email Automation Tab (Updated)

```
┌────────────────────────────────────────────────────────────┐
│ Email Automation                                            │
│ Template: My Summer Market Campaign (35 emails)            │
│                                          [Save as Template] │
├────────────────────────────────────────────────────────────┤
│ Filters: [All Statuses ▼] [All Categories ▼]  [________]   │
├────────────────────────────────────────────────────────────┤
│ 📧 Applications Now Open                    Status: ⏸ Paused│
│    Sends to: All vendors                                    │
│    Scheduled: May 1, 2025 at 9:00 AM                        │
│    [▶ Resume] [✏ Edit] [👁 Preview] [🗑 Delete]             │
├────────────────────────────────────────────────────────────┤
│ ... 34 more emails                                          │
└────────────────────────────────────────────────────────────┘
```

**"Save as Template" Button:**

- Appears on Email Automation tab
- Opens dialog: "Save these emails as a reusable template?"
- User enters template name and description
- System creates new email_campaign_template with all current emails
- Available for future events

---

## Phase 1 Implementation Checklist

### Backend Tasks

#### ✅ Task 1.1: Database Migrations ✅ COMPLETE

- [x] Create migration: `email_campaign_templates` table
  - [x] Columns: template_type, organization_id, name, description, is_default
  - [x] Columns: email_count (counter cache), events_count (counter cache)
  - [x] Indexes: organization_id + name (unique), template_type + is_default
- [x] Create migration: `email_template_items` table
  - [x] Columns: email_campaign_template_id, name, description, category, position
  - [x] Columns: subject_template, body_template
  - [x] Columns: trigger_type, trigger_value, trigger_time
  - [x] Columns: filter_criteria (JSONB), enabled_by_default
  - [x] Indexes: email_campaign_template_id + position, category, filter_criteria (GIN)
  - [x] Add check constraint: position between 1 and 40
  - [x] Add check constraint: max 40 items per template
- [x] Create migration: `scheduled_emails` table
  - [x] Columns: event_id, email_campaign_template_id, email_template_item_id
  - [x] Columns: name, subject_template, body_template
  - [x] Columns: trigger_type, trigger_value, trigger_time, scheduled_for
  - [x] Columns: filter_criteria (JSONB), status, sent_at, recipient_count, error_message
  - [x] Indexes: event_id + status, status + scheduled_for, filter_criteria (GIN)
- [x] Create migration: `email_deliveries` table
  - [x] Columns: scheduled_email_id, event_id, registration_id (fixed from vendor_registration_id)
  - [x] Columns: sendgrid_message_id (unique), recipient_email
  - [x] Columns: status, bounce_type, bounce_reason, drop_reason
  - [x] Columns: sent_at, delivered_at, bounced_at, dropped_at, unsubscribed_at
  - [x] Columns: retry_count, next_retry_at, max_retries
  - [x] Indexes: sendgrid_message_id (unique), event_id + status, registration_id + status, next_retry_at
- [x] Add migration: Add `email_campaign_template_id` to `events` table
- [x] Add migration: Add `email_unsubscribed` boolean to `registrations` table (fixed from vendor_registrations)
- [x] Run migrations: `bundle exec rails db:migrate`

**Estimated Time:** 3 hours

---

#### ✅ Task 1.2: Models ✅ COMPLETE

- [x] Create `EmailCampaignTemplate` model
  - [x] Validations: name, template_type
  - [x] Validation: only one system template can be default
  - [x] Scopes: `system_templates`, `user_templates`, `default_template`
  - [x] Associations: `belongs_to :organization, optional: true`
  - [x] Associations: `has_many :email_template_items, dependent: :destroy`
  - [x] Associations: `has_many :events`, `has_many :scheduled_emails`
  - [x] Counter cache: email_count, events_count
- [x] Create `EmailTemplateItem` model
  - [x] Validations: name, subject_template, body_template, trigger_type
  - [x] Validation: position between 1-40
  - [x] Validation: max 40 items per template
  - [x] Associations: `belongs_to :email_campaign_template, counter_cache: :email_count`
  - [x] Scopes: `enabled`, `by_position`, `by_category`
- [x] Create `ScheduledEmail` model (updated)
  - [x] Associations: `belongs_to :event`, `belongs_to :email_campaign_template`
  - [x] Associations: `belongs_to :email_template_item, optional: true`
  - [x] Associations: `has_many :email_deliveries`, `has_one :latest_delivery`
  - [x] Method: `delivery_status` (computed from latest_delivery)
  - [x] Validations and helper methods (editable?, sendable?)
- [x] Create `EmailDelivery` model (new - for delivery tracking)
  - [x] Associations: `belongs_to :scheduled_email`, `belongs_to :event`, `belongs_to :registration` (fixed)
  - [x] Validations: sendgrid_message_id (unique), recipient_email, status
  - [x] Enum: status (queued, sent, delivered, bounced, dropped, unsubscribed)
  - [x] Scopes: `failed`, `pending_retry`, `soft_bounces`, `successful`
  - [x] Helper methods: `failed?`, `retryable?`
- [x] Update `Event` model
  - [x] Association: `belongs_to :email_campaign_template, optional: true`
  - [x] Association: `has_many :scheduled_emails, dependent: :destroy`
  - [x] Association: `has_many :email_deliveries` (through scheduled_emails)
  - [ ] Callback: `after_create :generate_scheduled_emails_from_template` (pending - needs service class)
- [x] Update `Registration` model (fixed from VendorRegistration)
  - [x] Association: `has_many :email_deliveries`
  - [x] Field already added via migration: `email_unsubscribed` boolean
  - [ ] Validation: Skip sending emails if unsubscribed (pending - needs service implementation)

**Estimated Time:** 6 hours | **Actual:** ~2 hours

---

#### ✅ Task 1.3: Seed Default Template (24 Emails)

- [ ] Create seed file: `db/seeds/email_campaign_templates.rb`
- [ ] Create EmailCampaignTemplate: "Default Event Campaign"
  - [ ] template_type: 'system'
  - [ ] is_default: true
- [ ] Create 16 Editable EmailTemplateItems (from EMAIL_TEMPLATES.md Part 1)
  - [ ] Event Announcements: 4 emails
  - [ ] Application Updates: 1 email
  - [ ] Payment Reminders: 4 emails
  - [ ] Event Countdown: 7 emails
  - [ ] All with compelling subject lines, HTML bodies, triggers, filters
- [ ] Note: 8 System Emails (Part 2) are hard-coded in RegistrationEmailService, not seeded
- [ ] Run seeds: `bundle exec rails db:seed`
- [ ] Verify: Default template exists with 16 editable emails

**Estimated Time:** 8 hours (writing compelling email content!)

---

#### ✅ Task 1.4: Services

- [ ] Create `EmailScheduleCalculator` (same as before)
- [ ] Create `RecipientFilterService` (same as before)
- [ ] Create `ScheduledEmailGenerator` (updated)
  - [ ] Method: `generate_for_event(event, email_campaign_template)`
  - [ ] Fetch all email_template_items for template
  - [ ] Create ScheduledEmail for each item
  - [ ] Calculate scheduled_for
- [ ] Create `EmailVariableResolver` (same as before)
- [ ] Create `EmailCampaignTemplateCloner` (new)
  - [ ] Method: `clone(source_template, organization, new_name)`
  - [ ] Clone template and all items
  - [ ] Return new user template

**Estimated Time:** 8 hours

---

#### ✅ Task 1.5: Controllers & Routes

- [ ] Create `EmailCampaignTemplatesController`
  - [ ] `index` - List all templates (system + user)
  - [ ] `show` - Get template with all emails
  - [ ] `create` - Create user template (clone from existing)
  - [ ] `update` - Update user template
  - [ ] `destroy` - Delete user template
- [ ] Create `EmailTemplateItemsController`
  - [ ] `create` - Add email to template
  - [ ] `update` - Update email in template
  - [ ] `destroy` - Remove email from template
- [ ] Update `ScheduledEmailsController` (add new action)
  - [ ] `save_as_template` - Save event's emails as new template
- [ ] Add routes

**Estimated Time:** 6 hours

---

#### ✅ Task 1.6: Event Integration

- [ ] Update Event model
  - [ ] Add `email_campaign_template_id` field
  - [ ] Callback to generate emails from selected template
- [ ] Update EventsController
  - [ ] Accept `email_campaign_template_id` in create params
  - [ ] Default to system default template if not provided

**Estimated Time:** 2 hours

---

#### ✅ Task 1.7: Email Delivery Tracking (SendGrid Webhook Integration)

- [ ] Create `EmailDelivery` model
  - [ ] Associations: `belongs_to :scheduled_email`, `belongs_to :event`, `belongs_to :vendor_registration`
  - [ ] Validations: sendgrid_message_id (unique), recipient_email, status
  - [ ] Enum: status (queued, sent, delivered, bounced, dropped, unsubscribed)
  - [ ] Scopes: `failed`, `pending_retry`, `soft_bounces`
- [ ] Update `ScheduledEmail` model
  - [ ] Association: `has_many :email_deliveries, dependent: :destroy`
  - [ ] Association: `has_one :latest_delivery`
  - [ ] Method: `delivery_status` (returns latest delivery status)
- [ ] Create `EmailSenderService` (or update existing)
  - [ ] Add SendGrid custom_args with tracking IDs (scheduled_email_id, event_id, registration_id)
  - [ ] Create EmailDelivery record after sending with sendgrid_message_id
  - [ ] Handle SendGrid API errors
- [ ] Create `Webhooks::SendgridController`
  - [ ] Route: `POST /webhooks/sendgrid`
  - [ ] Skip CSRF verification and authentication
  - [ ] Parse JSON payload from SendGrid
  - [ ] Queue background job for each event
  - [ ] Return 200 OK quickly (webhook must be fast)
- [ ] Create `EmailDeliveryProcessorJob` (Sidekiq worker)
  - [ ] Process webhook events: delivered, bounce, dropped, unsubscribe
  - [ ] Update EmailDelivery record based on event type
  - [ ] Distinguish soft vs hard bounces
  - [ ] Schedule retry for soft bounces (auto-retry logic)
  - [ ] Mark vendor as unsubscribed globally on unsubscribe event
- [ ] Create `EmailRetryJob` (Sidekiq worker)
  - [ ] Resend email for soft bounces
  - [ ] Exponential backoff: 1 hour, 4 hours, 24 hours
  - [ ] Max 3 retries per delivery
- [ ] Configure SendGrid webhook
  - [ ] URL: `https://www.voxxypresents.com/webhooks/sendgrid`
  - [ ] Events: delivered, bounce, dropped, unsubscribe
  - [ ] Test locally with ngrok
  - [ ] Verify in production SendGrid settings
- [ ] Update API responses
  - [ ] Include delivery status in ScheduledEmail JSON
  - [ ] Add `latest_delivery` with timestamps and reasons
- [ ] Add VendorRegistration field
  - [ ] Migration: Add `email_unsubscribed` boolean field
  - [ ] Validation: Skip email sending if unsubscribed

**Estimated Time:** 8 hours

---

### Frontend Tasks

#### ✅ Task 1.8: TypeScript Interfaces

- [ ] Create `src/types/email.ts`
  - [ ] Interface: `EmailCampaignTemplate`
  - [ ] Interface: `EmailTemplateItem`
  - [ ] Interface: `ScheduledEmail` (updated with template references)
  - [ ] Interface: `FilterCriteria`
  - [ ] Interface: `EmailDelivery` (new - for delivery tracking)

**Estimated Time:** 1 hour

---

#### ✅ Task 1.9: API Client Methods

- [ ] Add `emailCampaignTemplatesApi` to `src/services/api.ts`
  - [ ] `getAll()`, `get(id)`, `create(data)`, `update(id, data)`, `delete(id)`
- [ ] Add `emailTemplateItemsApi`
  - [ ] `create(templateId, data)`, `update(id, data)`, `delete(id)`
- [ ] Update `scheduledEmailsApi`
  - [ ] Add `saveAsTemplate(eventSlug, data)`
  - [ ] Update to include `delivery` field in responses

**Estimated Time:** 2 hours

---

#### ✅ Task 1.10: UI Components

- [ ] Create `TemplateSelectorModal.tsx` (new)
  - [ ] Shows all available templates
  - [ ] Radio select for choosing template
  - [ ] Preview button
  - [ ] Integrate into CreateEventWizard
- [ ] Update `EmailAutomationTab.tsx`
  - [ ] Add "Save as Template" button
  - [ ] Show which template was used
  - [ ] Display delivery status badges on each email row
- [ ] Create `SaveAsTemplateDialog.tsx` (new)
  - [ ] Form: template name, description
  - [ ] Creates new user template from event's emails
- [ ] Create `DeliveryStatusBadge.tsx` (new - for email tracking)
  - [ ] Show delivery status icons (pending, sent, delivered, bounced, dropped)
  - [ ] Tooltip with detailed info (timestamps, bounce reasons, retry count)
  - [ ] Color-coded badges (green for delivered, red for bounced/dropped)
- [ ] Basic ScheduledEmailList and ScheduledEmailCard (same as before)

**Estimated Time:** 10 hours

---

#### ✅ Task 1.11: Testing

- [ ] Test event creation with template selection
- [ ] Test "Save as Template" functionality
- [ ] Test scheduled emails generated correctly from template
- [ ] Test SendGrid webhook locally with ngrok
  - [ ] Simulate delivered, bounce, dropped events
  - [ ] Verify database updates correctly
  - [ ] Test auto-retry logic for soft bounces
- [ ] Test delivery status display in UI
- [ ] API testing

**Estimated Time:** 6 hours

---

### Documentation

#### ✅ Task 1.12: Update Documentation

- [ ] Update CLAUDE_CONTEXT.md with template system
- [ ] Document new models and relationships
- [ ] Document SendGrid webhook integration
- [ ] Document email delivery tracking flow

**Estimated Time:** 3 hours

---

## Phase 1 Summary

### Total Estimated Time: **63 hours** (~1.5-2 weeks)

### Phase 1 Deliverables:

✅ 5 database tables (campaign templates, template items, scheduled emails, deliveries, updated events/registrations)
✅ 5 models with validations (EmailCampaignTemplate, EmailTemplateItem, ScheduledEmail, EmailDelivery, updates to Event/VendorRegistration)
✅ 1 default template with 24 pre-written emails (16 editable + 8 system emails)
✅ 5 service classes (EmailScheduleCalculator, RecipientFilterService, ScheduledEmailGenerator, EmailVariableResolver, EmailCampaignTemplateCloner)
✅ 4 controllers with endpoints (EmailCampaignTemplates, EmailTemplateItems, ScheduledEmails, Webhooks::Sendgrid)
✅ SendGrid webhook integration for real-time delivery tracking
✅ Auto-retry logic for soft bounces
✅ Email delivery status UI (badges showing sent/delivered/bounced/dropped)
✅ Template selection during event creation
✅ "Save as Template" functionality
✅ Frontend API client and basic UI
✅ Unlimited custom templates per organization
✅ Up to 40 emails per template (default has 24)

---

## Future Phases

### Phase 2: Advanced UI & Customization (2 weeks)

- WYSIWYG email editor (TipTap) with "Insert Field" buttons
- Filter builder UI with hybrid filtering
- Template editor (add/remove/reorder emails in template)
- Date change confirmation modal
- Timeline/calendar view of scheduled emails

### Phase 3: Enhanced Email Analytics (1 week)

- Track open rates (requires SendGrid 'open' event)
- Track click rates (requires SendGrid 'click' event)
- Email performance dashboard per event
- Template performance analytics
- Delivery health monitoring dashboard
- Manual resend UI for failed emails

### Phase 4: Advanced Features (1 week)

- A/B testing for email content
- Bulk email operations
- Email templates library/marketplace
- AI-powered email content suggestions
- Real-time delivery status updates via Action Cable

---

## Timeline & Resources

**Total Timeline:** 6 weeks

### Phase 1: Infrastructure (1-2 weeks)

**Team:** 1 full-stack developer

### Phase 2: Advanced UI (2 weeks)

**Team:** 1 frontend developer

### Phase 3: Email Sending (1 week)

**Team:** 1 backend developer

### Phase 4: Analytics (1 week)

**Team:** 1 full-stack developer

---

## Risk Assessment

(Same risks as before - email deliverability, timezone handling, variable resolution, etc.)

---

## Success Metrics

### Phase 1 Success Criteria

- [ ] Event creation with template selection works
- [ ] Default template with 40 emails seeds correctly
- [ ] "Save as Template" creates reusable templates
- [ ] Scheduled emails generated from selected template
- [ ] Users can create unlimited custom templates

### Overall Success Metrics (6 months)

- 80%+ of events use automated emails
- Average 30+ emails sent per event (out of 40)
- 50%+ of producers create at least 1 custom template
- 90%+ producer satisfaction

---

## Document Control

**Version:** 2.0 (Updated with Template Collections)
**Last Updated:** December 31, 2024
**Changes:**

- Clarified "template" = collection of up to 40 emails
- Updated database schema (2 tables: campaign templates + template items)
- Added template selection during event creation
- Added "Save as Template" functionality
- Changed limit from 20 emails to 40 emails per template
- Removed 20-template limit (now unlimited custom templates)

---

**END OF IMPLEMENTATION PLAN**
