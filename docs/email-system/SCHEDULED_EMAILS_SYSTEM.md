# Scheduled Emails System - Voxxy Presents

**Last Updated:** 2026-01-17
**Status:** Active Development
**Version:** 1.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [User Flow](#user-flow)
5. [Frontend Components](#frontend-components)
6. [Backend Implementation](#backend-implementation)
7. [API Reference](#api-reference)
8. [Email Variables System](#email-variables-system)
9. [Trigger System](#trigger-system)
10. [Recipient Filtering](#recipient-filtering)
11. [Delivery Tracking](#delivery-tracking)
12. [Current Limitations](#current-limitations)
13. [Future Enhancements](#future-enhancements)

---

## Overview

The Scheduled Emails System allows **Producers** (venue owners) to create, customize, and automate email communications with vendors throughout the event lifecycle. Emails can be generated from templates and fully customized per event.

### Key Capabilities

- **Template-Based Generation**: Generate up to 40 emails from system templates
- **Full Customization**: Edit content, timing, and recipients for each email
- **Smart Scheduling**: Trigger-based scheduling (days before/after event, deadlines, etc.)
- **Variable Interpolation**: Dynamic content using `{{variable}}` syntax
- **Recipient Filtering**: Target specific vendor groups by status, category, etc.
- **Delivery Tracking**: SendGrid webhook integration for delivery status
- **Manual Control**: Pause, resume, send now, or delete emails

### Access Point

**Navigation Path:**

```
Producer Dashboard
  → Click Event Card
    → Command Center Modal Opens
      → Click "Emails" Tab
        → EmailAutomationTab Component
```

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCHEDULED EMAILS SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│ Email Campaign   │         │ Email Template   │
│    Template      │◄────────│      Item        │
│   (Collection)   │ 1    * │ (Email Definition)│
└──────────────────┘         └──────────────────┘
         │                            │
         │ Used to generate           │ Template for
         │                            │
         ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│ Event            │         │ Scheduled Email  │
│                  │◄────────│ (Event Instance) │
└──────────────────┘  1   * └──────────────────┘
                                     │
                                     │ Tracks sends
                                     │
                                     ▼
                            ┌──────────────────┐
                            │ Email Delivery   │
                            │ (SendGrid Track) │
                            └──────────────────┘
```

### Technology Stack

**Frontend:**

- React 18.3.1 + TypeScript
- React Hook Form + Zod validation
- date-fns for date formatting
- Radix UI components

**Backend:**

- Rails 7.2.2
- PostgreSQL (JSONB for filter_criteria)
- SendGrid (email delivery)
- Sidekiq (background jobs)

**Services:**

- `ScheduledEmailGenerator` - Generate emails from templates
- `EmailScheduleCalculator` - Calculate scheduled_for times
- `EmailVariableResolver` - Resolve {{variables}} in content
- `EmailSenderService` - Send emails via SendGrid
- `RecipientFilterService` - Filter recipients by criteria

---

## Data Models

### ScheduledEmail (Backend)

**File:** `/app/models/scheduled_email.rb`

```ruby
class ScheduledEmail < ApplicationRecord
  # Associations
  belongs_to :event
  belongs_to :email_campaign_template, optional: true
  belongs_to :email_template_item, optional: true
  has_many :email_deliveries, dependent: :destroy
  has_one :latest_delivery, -> { order(created_at: :desc) }, class_name: "EmailDelivery"

  # Attributes
  # - name: string (e.g., "1 Day Before Event")
  # - subject_template: string (with {{variables}})
  # - body_template: text (HTML with {{variables}})
  # - trigger_type: string (enum: see Trigger System)
  # - trigger_value: integer (days offset, can be 0)
  # - trigger_time: time (HH:MM in UTC)
  # - scheduled_for: datetime (calculated send time)
  # - filter_criteria: jsonb (recipient filters)
  # - status: string (enum: scheduled, paused, sent, failed, cancelled)
  # - sent_at: datetime
  # - recipient_count: integer (dynamically calculated)
  # - error_message: text

  # Methods
  def recipient_count # Dynamically calculates based on current registrations
  def delivery_status # Returns status from latest_delivery or "pending"
  def editable?       # true if status != "sent"
  def sendable?       # true if scheduled and time has passed
end
```

### ScheduledEmail (Frontend)

**File:** `/src/types/email.ts`

```typescript
export interface ScheduledEmail {
  id: number
  event_id: number

  // Template tracking
  email_campaign_template_id: number | null
  email_template_item_id: number | null

  // Email content
  name: string
  subject_template: string
  body_template: string // HTML

  // Scheduling
  trigger_type: TriggerType
  trigger_value: number | null
  trigger_time: string | null // HH:MM
  scheduled_for: string // ISO datetime

  // Filtering
  filter_criteria: FilterCriteria

  // Status
  status: ScheduledEmailStatus // 'scheduled' | 'paused' | 'sent' | 'failed' | 'cancelled'
  sent_at: string | null
  recipient_count: number
  error_message: string | null

  // Timestamps
  created_at: string
  updated_at: string

  // Optional relations
  latest_delivery?: EmailDelivery
  email_deliveries?: EmailDelivery[]
  delivery_status?: DeliveryStatus

  // Frontend-only
  isInvitationAnnouncement?: boolean // Virtual email flag
}
```

### EmailCampaignTemplate

A collection of up to 40 email definitions that can be cloned and reused.

```typescript
export interface EmailCampaignTemplate {
  id: number
  template_type: 'system' | 'user'
  organization_id: number | null // null for system templates
  name: string
  description: string | null
  is_default: boolean
  email_count: number
  events_count: number
  created_at: string
  updated_at: string
  email_template_items?: EmailTemplateItem[]
}
```

### EmailTemplateItem

Individual email definition within a template.

```typescript
export interface EmailTemplateItem {
  id: number
  email_campaign_template_id: number
  name: string
  description: string | null
  category: EmailCategory
  position: number // 1-40

  // Content
  subject_template: string
  body_template: string // HTML

  // Scheduling
  trigger_type: TriggerType
  trigger_value: number | null
  trigger_time: string | null // HH:MM

  // Filtering
  filter_criteria: FilterCriteria
  enabled_by_default: boolean

  created_at: string
  updated_at: string
}
```

### EmailDelivery

SendGrid delivery tracking (updated via webhooks).

```typescript
export interface EmailDelivery {
  id: number
  scheduled_email_id: number
  event_id: number
  registration_id: number

  // SendGrid tracking
  sendgrid_message_id: string
  recipient_email: string
  status: DeliveryStatus

  // Bounce handling
  bounce_type: 'soft' | 'hard' | null
  bounce_reason: string | null
  drop_reason: string | null

  // Timestamps (from SendGrid)
  sent_at: string | null
  delivered_at: string | null
  bounced_at: string | null
  dropped_at: string | null
  unsubscribed_at: string | null

  // Retry logic
  retry_count: number
  next_retry_at: string | null
  max_retries: number

  created_at: string
  updated_at: string
}
```

### FilterCriteria

JSONB field for recipient filtering.

```typescript
export interface FilterCriteria {
  status?: RegistrationStatus[] // ['approved', 'confirmed']
  exclude_status?: RegistrationStatus[] // ['rejected', 'cancelled']
  vendor_category?: string[] // ['Food', 'Beverage']
  location_city?: string[] // ['Atlanta', 'Decatur']
  location_state?: string[] // ['GA', 'FL']
  tags?: string[] // Custom tags
  payment_status?: PaymentStatus[] // ['paid', 'unpaid'] (future)
}
```

---

## User Flow

### 1. Generate Emails (First Time)

```
Producer opens Email tab
  → Sees "No Scheduled Emails Yet" empty state
  → Clicks "Generate Emails from Template"
  → API: POST /api/v1/presents/events/:slug/scheduled_emails/generate
  → Backend: ScheduledEmailGenerator creates emails from system template
  → Returns: Array of ScheduledEmail objects
  → UI: Displays emails grouped by category
```

### 2. Edit Email Content & Timing

```
Producer clicks email card OR clicks "Edit" in dropdown
  → EditScheduledEmailModal opens
  → Displays current values:
     - name
     - subject_template
     - body_template
     - trigger_type, trigger_value, trigger_time
     - Current scheduled_for (calculated preview)
  → Producer makes changes
  → Clicks "Save Changes"
  → API: PATCH /api/v1/presents/events/:slug/scheduled_emails/:id
  → Backend:
     - If trigger fields changed → Recalculates scheduled_for
     - Updates ScheduledEmail
  → UI: Modal closes, list refreshes with updated email
```

### 3. Preview Email

```
Producer clicks "Preview" in dropdown
  → EmailPreviewModal opens
  → API: POST /api/v1/presents/events/:slug/scheduled_emails/:id/preview
     Body: { registration_id: <first_registration_id> }
  → Backend: EmailVariableResolver replaces {{variables}}
  → Returns: { subject, body, recipient_name, recipient_email }
  → UI: Displays resolved email HTML
```

### 4. Pause/Resume Email

```
Producer clicks "Pause" or "Resume" in dropdown
  → Confirmation (if needed)
  → API: PATCH /api/v1/presents/events/:slug/scheduled_emails/:id/pause
     OR:  PATCH /api/v1/presents/events/:slug/scheduled_emails/:id/resume
  → Backend: Updates status field
  → UI: Refreshes list, shows updated status badge
```

### 5. Send Now (Manual)

```
Producer clicks "Send Now" in dropdown
  → Browser confirm: "Are you sure? This cannot be undone."
  → API: POST /api/v1/presents/events/:slug/scheduled_emails/:id/send_now
  → Backend:
     - EmailSenderService.send_to_recipients
     - Loops through filtered registrations
     - Resolves variables for each
     - Sends via SendGrid
     - Creates EmailDelivery record for each
  → Returns: { sent_count, failed_count }
  → UI: Shows success message with counts
```

### 6. Delete Email

```
Producer clicks "Delete" in dropdown (red text)
  → Browser confirm: "Are you sure? This cannot be undone."
  → API: DELETE /api/v1/presents/events/:slug/scheduled_emails/:id
  → Backend:
     - Checks editable? (cannot delete sent emails)
     - Destroys ScheduledEmail
  → UI: Removes from list, shows success message
```

### 7. Automatic Sending (Background Job)

```
Sidekiq Cron Job (runs every 10 minutes)
  → Finds ScheduledEmail.pending (status=scheduled, scheduled_for <= now)
  → For each email:
     - EmailSenderService.send_to_recipients
     - Updates status to 'sent'
     - Records sent_at timestamp
     - Creates EmailDelivery records
  → SendGrid Webhooks update delivery status over time
```

---

## Frontend Components

### Component Tree

```
CommandCenter.tsx (Producer Dashboard Modal)
  └── EmailAutomationTab.tsx (/src/components/producer/Email/)
      ├── Statistics Cards (total, scheduled, paused, sent, failed)
      ├── Search & Filter Controls
      ├── EmailTable.tsx
      │   └── EmailRow.tsx (multiple)
      │       └── Status Badge, Actions Dropdown
      ├── EditScheduledEmailModal.tsx (on edit)
      ├── EmailPreviewModal.tsx (on preview)
      └── SaveAsTemplateDialog.tsx (on save as template)
```

### EmailAutomationTab.tsx

**Location:** `/src/components/producer/Email/EmailAutomationTab.tsx` (465 lines)

**Responsibilities:**

- Load scheduled emails for event
- Display statistics dashboard
- Manage search & filtering
- Handle all CRUD operations (edit, delete, pause, resume, send)
- Show empty state with "Generate" button
- Create virtual "Invitation Announcement" email

**Key State:**

```typescript
const [emails, setEmails] = useState<ScheduledEmail[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [previewEmail, setPreviewEmail] = useState<ScheduledEmail | null>(null)
const [editEmail, setEditEmail] = useState<ScheduledEmail | null>(null)
const [searchQuery, setSearchQuery] = useState('')
const [statusFilter, setStatusFilter] = useState<FilterType>('all')
```

**Key Functions:**

```typescript
loadEmails() // Fetch from API
handleEdit(email) // Open edit modal
handlePreview(email) // Open preview modal
handlePause(emailId) // Pause email
handleResume(emailId) // Resume email
handleSendNow(emailId) // Send immediately
handleDelete(emailId) // Delete email
handleGenerateEmails() // Generate from template
handleSaveEdit(id, data) // Save edits
```

**Empty State:**

- Shows when `emails.length === 0`
- Sparkles icon
- "No Scheduled Emails Yet" heading
- "Generate Emails from Template" button

**Statistics Display:**

```typescript
const stats = {
  total: emails.length,
  scheduled: emails.filter((e) => e.status === 'scheduled').length,
  paused: emails.filter((e) => e.status === 'paused').length,
  sent: emails.filter((e) => e.status === 'sent').length,
  failed: emails.filter((e) => e.status === 'failed').length,
}
```

### EditScheduledEmailModal.tsx

**Location:** `/src/components/producer/Email/EditScheduledEmailModal.tsx` (340 lines)

**Current Implementation:**

**Form Fields:**

1. **Email Name** (text input)
   - Current: Simple text input
   - Validation: Required, min 1 character

2. **Timing Configuration** (grouped section)
   - **When to Send** (select dropdown)
     - 10 trigger type options
     - Shows label + description for each
   - **Number of Days** (number input)
     - Only shown if trigger type requires value
     - Min: 0
   - **Send Time (UTC)** (time input)
     - HH:MM format
     - Shows note: "Time is in UTC"
   - **Calculated Preview** (read-only display)
     - Shows current scheduled_for
     - Blue info box
     - Updates after save

3. **Subject Line** (text input)
   - Variable hints below: "Use variables: [eventName], [firstName]..."
   - Current: Simple text input, no autocomplete

4. **Email Body (HTML)** (textarea)
   - Monospace font
   - Min height: 300px
   - Variable hints below
   - Current: Plain textarea, no WYSIWYG

**Validation Schema:**

```typescript
const editEmailSchema = z.object({
  name: z.string().min(1, 'Email name is required'),
  subject_template: z.string().min(1, 'Subject is required'),
  body_template: z.string().min(1, 'Email body is required'),
  trigger_type: z.string().min(1, 'Trigger type is required'),
  trigger_value: z.number().min(0, 'Must be 0 or greater').optional(),
  trigger_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format')
    .optional(),
})
```

**Submit Flow:**

```typescript
onSubmit(data) {
  // Build update request
  const updateData: UpdateEmailRequest = {
    name, subject_template, body_template,
    trigger_type, trigger_value, trigger_time
  }

  // Call parent handler
  await onSave(email.id, updateData)

  // Parent makes API call:
  // PATCH /api/v1/presents/events/:slug/scheduled_emails/:id

  // Backend recalculates scheduled_for if trigger fields changed
}
```

**Restrictions:**

- Cannot edit if `email.status === 'sent'`
- Shows warning banner for sent emails
- Save button disabled for sent emails

### EmailTable.tsx & EmailRow.tsx

**Location:** `/src/components/producer/Email/EmailTable.tsx` & `EmailRow.tsx`

**Display:**

- Table layout with columns: Name, Subject, Schedule, Recipients, Status, Actions
- Each row is clickable (opens edit modal if editable)
- Status badge with color coding
- Dropdown menu with actions:
  - Preview (eye icon)
  - Edit (pencil icon) - if not sent
  - Send Now (play icon) - if scheduled & not past
  - Pause (pause icon) - if scheduled
  - Resume (play icon) - if paused
  - Delete (trash icon, red) - if not sent

### ScheduledEmailCard.tsx

**Location:** `/src/components/producer/Email/ScheduledEmailCard.tsx` (231 lines)

**Alternative View:** Card-based layout (used in ScheduledEmailList.tsx, not currently in main tab)

**Display:**

- Card with hover effect
- Status badge
- Edit icon (shows on hover if editable)
- Date, time, recipient count
- Delivery stats (if sent)
- Dropdown menu with same actions as table

---

## Backend Implementation

### ScheduledEmailsController

**Location:** `/app/controllers/api/v1/presents/scheduled_emails_controller.rb` (248 lines)

**Routes:**

```ruby
# GET /api/v1/presents/events/:event_id/scheduled_emails
def index # List all scheduled emails for event

# GET /api/v1/presents/events/:event_id/scheduled_emails/:id
def show # Get single email with deliveries

# POST /api/v1/presents/events/:event_id/scheduled_emails/generate
def generate # Generate emails from template

# PATCH /api/v1/presents/events/:event_id/scheduled_emails/:id
def update # Update email (recalculates scheduled_for if trigger changed)

# DELETE /api/v1/presents/events/:event_id/scheduled_emails/:id
def destroy # Delete email (only if not sent)

# POST /api/v1/presents/events/:event_id/scheduled_emails/:id/pause
def pause # Set status to 'paused'

# POST /api/v1/presents/events/:event_id/scheduled_emails/:id/resume
def resume # Set status to 'scheduled'

# POST /api/v1/presents/events/:event_id/scheduled_emails/:id/send_now
def send_now # Send immediately via EmailSenderService

# POST /api/v1/presents/events/:event_id/scheduled_emails/:id/preview
def preview # Preview with resolved variables
```

**Update Logic (Critical):**

```ruby
def update
  # Check if trigger fields changed
  if trigger_fields_changed?
    recalculate_scheduled_time # Uses EmailScheduleCalculator
  end

  # Update the email
  @scheduled_email.update(scheduled_email_params)
end

def recalculate_scheduled_time
  calculator = EmailScheduleCalculator.new(@event)

  # Get updated values (or existing if not changed)
  trigger_type = params[:scheduled_email][:trigger_type] || @scheduled_email.trigger_type
  trigger_value = params[:scheduled_email][:trigger_value]&.to_i || @scheduled_email.trigger_value
  trigger_time = params[:scheduled_email][:trigger_time] || @scheduled_email.trigger_time

  # Calculate new scheduled_for
  new_scheduled_for = calculator.calculate(OpenStruct.new(
    trigger_type: trigger_type,
    trigger_value: trigger_value,
    trigger_time: trigger_time
  ))

  # Add to params so it gets updated
  params[:scheduled_email][:scheduled_for] = new_scheduled_for
end
```

### Service Classes

#### ScheduledEmailGenerator

**Location:** `/app/services/scheduled_email_generator.rb`

**Purpose:** Generate ScheduledEmail instances from EmailCampaignTemplate

```ruby
class ScheduledEmailGenerator
  def initialize(event)
    @event = event
    @calculator = EmailScheduleCalculator.new(event)
  end

  def generate
    # Get template items
    # For each enabled item:
    #   - Calculate scheduled_for
    #   - Create ScheduledEmail
    #   - Copy content, triggers, filters
  end

  def generate_selective(category:, positions:)
    # Generate only specific emails
  end
end
```

#### EmailScheduleCalculator

**Location:** `/app/services/email_schedule_calculator.rb`

**Purpose:** Calculate scheduled_for datetime based on trigger rules

```ruby
class EmailScheduleCalculator
  def initialize(event)
    @event = event
  end

  def calculate(email_item)
    base_date = get_base_date(email_item.trigger_type)
    return nil unless base_date

    # Apply offset
    scheduled_date = apply_offset(base_date, email_item)

    # Apply time
    apply_time(scheduled_date, email_item.trigger_time)
  end

  private

  def get_base_date(trigger_type)
    case trigger_type
    when 'days_before_event', 'days_after_event', 'on_event_date'
      @event.event_date
    when 'days_before_deadline', 'on_application_open'
      @event.application_deadline
    when 'days_before_payment_deadline', 'on_payment_deadline'
      @event.payment_deadline
    end
  end

  def apply_offset(base_date, email_item)
    offset_days = email_item.trigger_value || 0

    case email_item.trigger_type
    when 'days_before_event', 'days_before_deadline', 'days_before_payment_deadline'
      base_date - offset_days.days
    when 'days_after_event'
      base_date + offset_days.days
    else
      base_date
    end
  end

  def apply_time(date, time_string)
    time = Time.parse(time_string || "09:00") # Default 9am UTC
    date.to_datetime.change(hour: time.hour, min: time.min)
  end
end
```

#### EmailVariableResolver

**Location:** `/app/services/email_variable_resolver.rb`

**Purpose:** Replace {{variables}} with actual values

```ruby
class EmailVariableResolver
  def initialize(event, registration)
    @event = event
    @registration = registration
    @organization = event.organization
  end

  def resolve(template_string)
    template_string.gsub(/\{\{(\w+)\}\}/) do |match|
      variable_name = $1
      resolve_variable(variable_name)
    end
  end

  def resolve_email(subject_template, body_template)
    {
      subject: resolve(subject_template),
      body: resolve(body_template)
    }
  end

  private

  def resolve_variable(name)
    case name
    when 'event_title' then @event.title
    when 'event_date' then @event.event_date&.strftime('%B %d, %Y')
    when 'event_location' then @event.location
    when 'booth_price' then "$#{@event.booth_price}"
    when 'vendor_name' then @registration.name
    when 'business_name' then @registration.business_name
    when 'vendor_category' then @registration.vendor_category
    when 'organization_name' then @organization.name
    when 'organization_email' then @organization.email
    # ... more variables
    else
      match # Return original if not found
    end
  end
end
```

#### EmailSenderService

**Location:** `/app/services/email_sender_service.rb`

**Purpose:** Send emails via SendGrid with tracking

```ruby
class EmailSenderService
  def initialize(scheduled_email)
    @scheduled_email = scheduled_email
    @event = scheduled_email.event
  end

  def send_to_recipients
    recipients = get_filtered_recipients

    sent_count = 0
    failed_count = 0

    recipients.each do |registration|
      begin
        send_to_registration(registration)
        sent_count += 1
      rescue => e
        failed_count += 1
        Rails.logger.error("Failed to send to #{registration.email}: #{e.message}")
      end
    end

    # Update scheduled email
    @scheduled_email.update!(
      status: 'sent',
      sent_at: Time.current
    )

    { sent: sent_count, failed: failed_count }
  end

  private

  def send_to_registration(registration)
    resolver = EmailVariableResolver.new(@event, registration)
    resolved = resolver.resolve_email(
      @scheduled_email.subject_template,
      @scheduled_email.body_template
    )

    # Send via SendGrid
    mail = SendGrid::Mail.new(
      from: SendGrid::Email.new(email: ENV['SENDER_EMAIL']),
      subject: resolved[:subject],
      to: SendGrid::Email.new(email: registration.email),
      content: SendGrid::Content.new(type: 'text/html', value: resolved[:body])
    )

    response = sendgrid_client.send(mail)

    # Create delivery record
    EmailDelivery.create!(
      scheduled_email: @scheduled_email,
      event: @event,
      registration: registration,
      sendgrid_message_id: response.headers['x-message-id'],
      recipient_email: registration.email,
      status: 'sent',
      sent_at: Time.current
    )
  end

  def get_filtered_recipients
    RecipientFilterService.new(@event, @scheduled_email.filter_criteria)
      .filter_recipients
  end
end
```

#### RecipientFilterService

**Location:** `/app/services/recipient_filter_service.rb`

**Purpose:** Filter registrations based on criteria

```ruby
class RecipientFilterService
  def initialize(event, filter_criteria)
    @event = event
    @criteria = filter_criteria || {}
  end

  def filter_recipients
    scope = @event.registrations.where(email_unsubscribed: false)

    # Apply status filter
    if @criteria['status'].present?
      scope = scope.where(status: @criteria['status'])
    end

    # Apply excluded status filter
    if @criteria['exclude_status'].present?
      scope = scope.where.not(status: @criteria['exclude_status'])
    end

    # Apply vendor category filter
    if @criteria['vendor_category'].present?
      scope = scope.where(vendor_category: @criteria['vendor_category'])
    end

    # Apply payment status filter (future)
    if @criteria['payment_status'].present?
      scope = scope.where(payment_status: @criteria['payment_status'])
    end

    scope
  end
end
```

---

## API Reference

### Base URL

```
https://www.voxxyai.com/api/v1/presents/events/:event_slug/scheduled_emails
```

### Endpoints

#### List Emails

```http
GET /api/v1/presents/events/:event_slug/scheduled_emails

Query Params:
  - status: string (optional) - Filter by status
  - category: string (optional) - Filter by category

Response: ScheduledEmail[]
```

#### Get Single Email

```http
GET /api/v1/presents/events/:event_slug/scheduled_emails/:id

Response: ScheduledEmail (with email_deliveries included)
```

#### Generate Emails

```http
POST /api/v1/presents/events/:event_slug/scheduled_emails/generate

Body: {
  category?: string,
  positions?: number[],
  regenerate?: boolean
}

Response: {
  message: string,
  generated_count: number,
  skipped_count: number,
  scheduled_emails: ScheduledEmail[]
}
```

#### Update Email

```http
PATCH /api/v1/presents/events/:event_slug/scheduled_emails/:id

Body: {
  scheduled_email: {
    name?: string,
    subject_template?: string,
    body_template?: string,
    trigger_type?: string,
    trigger_value?: number,
    trigger_time?: string,
    filter_criteria?: object
  }
}

Response: ScheduledEmail (updated)

Note: If trigger fields change, backend automatically recalculates scheduled_for
```

#### Pause Email

```http
PATCH /api/v1/presents/events/:event_slug/scheduled_emails/:id/pause

Response: {
  message: string,
  email: ScheduledEmail
}
```

#### Resume Email

```http
PATCH /api/v1/presents/events/:event_slug/scheduled_emails/:id/resume

Response: {
  message: string,
  email: ScheduledEmail
}
```

#### Send Now

```http
POST /api/v1/presents/events/:event_slug/scheduled_emails/:id/send_now

Response: {
  message: string,
  sent_count: number,
  failed_count: number,
  email: ScheduledEmail
}
```

#### Preview Email

```http
POST /api/v1/presents/events/:event_slug/scheduled_emails/:id/preview

Body: {
  registration_id?: number
}

Response: {
  recipient_name: string,
  recipient_email: string,
  subject: string,
  body: string (HTML with variables resolved)
}
```

#### Delete Email

```http
DELETE /api/v1/presents/events/:event_slug/scheduled_emails/:id

Response: 204 No Content
```

#### Save as Template

```http
POST /api/v1/presents/events/:event_slug/scheduled_emails/save_as_template

Body: {
  name: string,
  description?: string
}

Response: EmailCampaignTemplate (newly created)
```

---

## Email Variables System

### ⚡ New User-Friendly Format (Updated 2026-01-17)

**Frontend (What Users See):** `[eventName]`, `[businessName]` - camelCase, friendly
**Backend (What's Saved):** `{{event_title}}`, `{{business_name}}` - snake_case, technical

The system automatically converts between formats:

- **Loading:** Backend `{{}}` → Frontend `[]`
- **Saving:** Frontend `[]` → Backend `{{}}`

**Benefits:**

- Users don't need to remember backend variable names
- Clickable buttons for easy insertion
- Clear, readable variable names
- Zero backend changes required

### Available Variables

#### Event Variables

| User Sees (Frontend)    | Backend Saves              | Example Output               |
| ----------------------- | -------------------------- | ---------------------------- |
| `[eventName]`           | `{{event_title}}`          | "Summer Market 2025"         |
| `[eventDate]`           | `{{event_date}}`           | "June 15, 2025"              |
| `[eventTime]`           | `{{event_time}}`           | "10:00 AM - 6:00 PM"         |
| `[eventLocation]`       | `{{event_location}}`       | "Piedmont Park, Atlanta, GA" |
| `[applicationDeadline]` | `{{application_deadline}}` | "May 30, 2025"               |
| `[boothPrice]`          | `{{booth_price}}`          | "$150.00"                    |

#### Organization Variables

| User Sees (Frontend)  | Backend Saves            | Example Output            |
| --------------------- | ------------------------ | ------------------------- |
| `[organizationName]`  | `{{organization_name}}`  | "Voxxy Presents"          |
| `[organizationEmail]` | `{{organization_email}}` | "hello@voxxypresents.com" |

#### Vendor Variables

| User Sees (Frontend) | Backend Saves         | Example Output       |
| -------------------- | --------------------- | -------------------- |
| `[vendorName]`       | `{{vendor_name}}`     | "John Doe"           |
| `[firstName]`        | `{{first_name}}`      | "John"               |
| `[businessName]`     | `{{business_name}}`   | "John's Tacos"       |
| `[vendorCategory]`   | `{{vendor_category}}` | "Food"               |
| `[boothNumber]`      | `{{booth_number}}`    | "A-12" (if assigned) |

#### Computed Variables

| User Sees (Frontend) | Backend Saves          | Example Output                                        |
| -------------------- | ---------------------- | ----------------------------------------------------- |
| `[eventUrl]`         | `{{event_url}}`        | "https://voxxypresents.com/events/summer-market-2025" |
| `[unsubscribeLink]`  | `{{unsubscribe_link}}` | "https://voxxypresents.com/unsubscribe/abc123"        |

### Usage in Templates

**What Users Type (Frontend):**

**Subject Line:**

```
Reminder: [eventName] is Tomorrow! - [vendorName]
```

**Body (Plain Text):**

```
Hi [vendorName],

This is a reminder that [eventName] is happening tomorrow at [eventLocation].

Your booth: [boothNumber]

Event Time: [eventTime]

If you have questions, reach out to [organizationEmail].

To unsubscribe: [unsubscribeLink]
```

**What Backend Receives (After Conversion):**

**Subject Line:**

```
Reminder: {{event_title}} is Tomorrow! - {{vendor_name}}
```

**Body:**

```
Hi {{vendor_name}},

This is a reminder that {{event_title}} is happening tomorrow at {{event_location}}.

Your booth: {{booth_number}}

Event Time: {{event_time}}

If you have questions, reach out to {{organization_email}}.

To unsubscribe: {{unsubscribe_link}}
```

### Variable Resolution

**Conversion Flow:**

1. **User Edits Email:**
   - Clicks "Edit" on scheduled email
   - Backend sends: `"Hi {{vendor_name}}"`
   - Frontend converts to: `"Hi [vendorName]"` (user-friendly)
   - User sees: `"Hi [vendorName]"`

2. **User Clicks Variable Button:**
   - Clicks "Vendor Name" button
   - Inserts: `[vendorName]` at cursor
   - User types more text

3. **User Saves:**
   - Frontend has: `"Hi [vendorName], see you at [eventName]!"`
   - Frontend converts to: `"Hi {{vendor_name}}, see you at {{event_title}}!"`
   - Backend receives: `{{}}` format (unchanged)

4. **Email Sends:**
   - Backend resolves: `"Hi {{vendor_name}}"` → `"Hi John Doe"`
   - EmailVariableResolver replaces with actual values

**Example Resolution (Backend):**

```ruby
template = "Hi {{vendor_name}}, your booth at {{event_title}} is {{booth_number}}."
registration = Registration.find(123) # John's Tacos, Booth A-12
event = Event.find_by(slug: 'summer-market-2025')

resolver = EmailVariableResolver.new(event, registration)
resolved = resolver.resolve(template)

# Result:
# "Hi John Doe, your booth at Summer Market 2025 is A-12."
```

---

## Trigger System

### Trigger Types

Triggers determine **when** an email is sent relative to event dates.

#### 1. `days_before_event`

- Sends X days **before** the event date
- Requires: `trigger_value` (number of days)
- Example: `trigger_value: 3` → Send 3 days before event

#### 2. `days_after_event`

- Sends X days **after** the event date
- Requires: `trigger_value` (number of days)
- Example: `trigger_value: 2` → Send 2 days after event

#### 3. `days_before_deadline`

- Sends X days **before** application deadline
- Requires: `trigger_value` (number of days)
- Example: `trigger_value: 7` → Send 1 week before deadline

#### 4. `on_event_date`

- Sends **on** the event date
- No trigger_value needed
- Uses `trigger_time` to set time

#### 5. `on_application_open`

- Sends **immediately** when event is created
- No trigger_value needed
- Used for announcement emails

#### 6. `days_before_payment_deadline`

- Sends X days **before** payment deadline
- Requires: `trigger_value` (number of days)
- Requires event to have `payment_deadline` set

#### 7. `on_payment_deadline`

- Sends **on** payment deadline date
- No trigger_value needed

#### 8. `days_after_deadline`

- Sends X days **after** application deadline
- Requires: `trigger_value` (number of days)

#### 9. `on_application_submit`

- Sends when vendor submits application (transactional)
- Not used in scheduled emails (immediate trigger)

#### 10. `on_approval`

- Sends when producer approves application (transactional)
- Not used in scheduled emails (immediate trigger)

### Calculation Logic

**Example 1: 3 Days Before Event**

```
Event Date: 2025-06-15
Trigger Type: days_before_event
Trigger Value: 3
Trigger Time: 09:00

Calculation:
  Base Date: 2025-06-15
  Offset: -3 days
  Scheduled Date: 2025-06-12
  Time: 09:00 UTC

Result: 2025-06-12 09:00:00 UTC
```

**Example 2: On Event Date**

```
Event Date: 2025-06-15
Trigger Type: on_event_date
Trigger Value: null
Trigger Time: 07:00

Calculation:
  Base Date: 2025-06-15
  Offset: 0 days
  Scheduled Date: 2025-06-15
  Time: 07:00 UTC

Result: 2025-06-15 07:00:00 UTC
```

**Example 3: 2 Days After Event**

```
Event Date: 2025-06-15
Trigger Type: days_after_event
Trigger Value: 2
Trigger Time: 10:00

Calculation:
  Base Date: 2025-06-15
  Offset: +2 days
  Scheduled Date: 2025-06-17
  Time: 10:00 UTC

Result: 2025-06-17 10:00:00 UTC
```

### Time Zone Note

⚠️ **All times are in UTC**. The system does not currently support producer time zones. Producers must manually convert to UTC when setting trigger times.

**Future Enhancement:** Add time zone support so producers can set times in their local time zone.

---

## Recipient Filtering

### Overview

Recipients are filtered based on `filter_criteria` (JSONB field). Filters are applied when:

1. Calculating `recipient_count` (dynamically)
2. Sending emails (EmailSenderService)

### Filter Fields

#### `status` (include)

Include only registrations with these statuses.

```json
{
  "status": ["approved", "confirmed"]
}
```

**Result:** Only sends to approved or confirmed vendors

#### `exclude_status` (exclude)

Exclude registrations with these statuses.

```json
{
  "exclude_status": ["rejected", "cancelled"]
}
```

**Result:** Sends to all EXCEPT rejected/cancelled

#### `vendor_category`

Filter by vendor category.

```json
{
  "vendor_category": ["Food", "Beverage"]
}
```

**Result:** Only sends to Food or Beverage vendors

#### `location_city`

Filter by city (future - registration model doesn't have city yet).

```json
{
  "location_city": ["Atlanta", "Decatur"]
}
```

#### `location_state`

Filter by state (future).

```json
{
  "location_state": ["GA", "FL"]
}
```

#### `payment_status` (future)

Filter by payment status (not yet implemented).

```json
{
  "payment_status": ["paid"]
}
```

### Combining Filters

Multiple filters are **AND**ed together.

```json
{
  "status": ["approved"],
  "vendor_category": ["Food", "Beverage"],
  "exclude_status": ["cancelled"]
}
```

**Result:** Approved Food/Beverage vendors who are NOT cancelled

### Implementation

**Backend (RecipientFilterService):**

```ruby
def filter_recipients
  scope = @event.registrations.where(email_unsubscribed: false)

  scope = scope.where(status: @criteria['status']) if @criteria['status'].present?
  scope = scope.where.not(status: @criteria['exclude_status']) if @criteria['exclude_status'].present?
  scope = scope.where(vendor_category: @criteria['vendor_category']) if @criteria['vendor_category'].present?

  scope
end
```

**Frontend:**
Currently, filter_criteria is not editable in the UI. It's only set by template defaults.

**Future Enhancement:** Add filter criteria editor to EditScheduledEmailModal.

---

## Delivery Tracking

### SendGrid Integration

Emails are sent via SendGrid API. Each send creates an `EmailDelivery` record.

### Delivery Statuses

```typescript
type DeliveryStatus =
  | 'pending' // Not sent yet
  | 'queued' // Queued in SendGrid
  | 'sent' // Sent to recipient's server
  | 'delivered' // Successfully delivered
  | 'bounced' // Hard or soft bounce
  | 'dropped' // Rejected by SendGrid (e.g., unsubscribed)
  | 'unsubscribed' // Recipient unsubscribed
```

### Webhook Flow

```
1. EmailSenderService sends email via SendGrid
   → Creates EmailDelivery with status: 'sent'
   → Stores sendgrid_message_id

2. SendGrid delivers email
   → Webhook: POST /api/v1/webhooks/sendgrid
   → Updates EmailDelivery.status = 'delivered'
   → Sets delivered_at timestamp

3. If email bounces
   → Webhook: POST /api/v1/webhooks/sendgrid
   → Updates EmailDelivery.status = 'bounced'
   → Sets bounce_type ('hard' or 'soft')
   → Sets bounce_reason

4. If recipient unsubscribes
   → Webhook: POST /api/v1/webhooks/sendgrid
   → Updates EmailDelivery.status = 'unsubscribed'
   → Updates Registration.email_unsubscribed = true
```

### Bounce Retry Logic

**Soft Bounces:** Temporary failures (mailbox full, server down)

- Automatically retried up to `max_retries` (default: 3)
- `next_retry_at` calculated with exponential backoff

**Hard Bounces:** Permanent failures (invalid email, domain doesn't exist)

- No retry attempted
- Marks delivery as permanently failed

### Viewing Delivery Status

**In UI:**

- ScheduledEmailCard shows delivery status badge for sent emails
- Email details shows delivery count: "X delivered"
- Future: Click to see per-recipient delivery details

**In API:**

```http
GET /api/v1/presents/events/:event_slug/scheduled_emails/:id

Response includes:
{
  "email_deliveries": [
    {
      "recipient_email": "john@example.com",
      "status": "delivered",
      "delivered_at": "2025-06-12T09:05:32Z"
    }
  ]
}
```

---

## Current Limitations

### Edit Modal Limitations

1. **No Variable Autocomplete**
   - Subject and body are plain text inputs
   - No dropdown/autocomplete for {{variables}}
   - User must remember variable names

2. **No WYSIWYG Editor**
   - Body template is plain textarea
   - Must write raw HTML
   - No preview while editing

3. **No Filter Criteria Editor**
   - Cannot edit recipient filters from UI
   - Must manually edit in database or use template defaults

4. **Timezone Issues**
   - All times displayed/edited in UTC
   - No conversion to producer's local time
   - Confusing for non-technical users

5. **No Calculated Preview**
   - Can't see what "3 days before event" means in real date/time
   - Must mentally calculate or save to see result

6. **Limited Validation**
   - No check if event has required dates (event_date, application_deadline)
   - No warning if scheduled_for is in the past
   - No validation of HTML in body

### System Limitations

1. **No A/B Testing**
   - Cannot test subject line variants
   - Cannot test different send times

2. **No Email Analytics**
   - No open rate tracking
   - No click tracking
   - Limited to SendGrid webhook data

3. **No Scheduling Windows**
   - Cannot set "send between 9am-5pm"
   - Cannot avoid weekends automatically

4. **No Conditional Logic**
   - Cannot send different content based on vendor attributes
   - No "if/else" in templates

5. **No Attachment Support**
   - Cannot attach PDFs, images, etc.
   - Only inline HTML content

6. **No Email Preview in Browser**
   - Preview modal only shows for one recipient
   - Cannot see side-by-side comparison

---

## Future Enhancements

### Phase 1: Edit Modal Improvements (Priority)

1. **Variable Autocomplete**
   - Dropdown menu when typing `{{`
   - Shows all available variables with descriptions
   - Click to insert

2. **Filter Criteria Editor**
   - Add "Recipient Filters" section to edit modal
   - Checkboxes for status filters
   - Multi-select for categories
   - Show live recipient count as filters change

3. **Rich Text Editor**
   - WYSIWYG HTML editor (e.g., TipTap, Quill)
   - Variable insertion button
   - Image upload support
   - Email template library

4. **Calculated Preview**
   - Show calculated scheduled_for immediately as trigger changes
   - Convert to producer's time zone
   - Highlight if in the past or conflicts

5. **Improved Validation**
   - Check event has required dates before save
   - Warn if scheduled time is past
   - Validate HTML (check for broken tags)
   - Preview rendering issues

### Phase 2: Email Management

1. **Duplicate Email**
   - "Duplicate" button in dropdown
   - Creates copy with "[Copy]" suffix
   - Opens for immediate editing

2. **Bulk Operations**
   - Select multiple emails
   - Bulk pause/resume/delete
   - Bulk time adjustment

3. **Email Templates**
   - Library of pre-built HTML templates
   - Drag-drop blocks (header, footer, button, image)
   - Brand customization (colors, fonts, logo)

4. **Version History**
   - Track changes to email content
   - Revert to previous version
   - Show who made changes

### Phase 3: Advanced Features

1. **A/B Testing**
   - Create variants
   - Automatically split recipients
   - Track performance

2. **Analytics Dashboard**
   - Open rates (requires tracking pixel)
   - Click rates (requires link tracking)
   - Delivery funnel visualization
   - Best performing emails

3. **Smart Scheduling**
   - Send time optimization (ML-based)
   - Avoid weekends/holidays
   - Respect recipient time zones

4. **Conditional Content**
   - If/else logic in templates
   - Different content per segment
   - Dynamic blocks

5. **Attachment Support**
   - Upload files
   - Attach to emails
   - Template-level attachments

### Phase 4: Producer Experience

1. **Time Zone Support**
   - Producer sets their time zone in settings
   - All times displayed in producer's TZ
   - Automatic UTC conversion

2. **Email Calendar View**
   - Visual timeline of scheduled emails
   - Drag to reschedule
   - See all events' emails together

3. **Email Flows**
   - Multi-step sequences
   - Triggered by vendor actions
   - Wait steps

4. **Test Email**
   - Send test to producer's email
   - Preview with real variables
   - Check spam score

---

## Change Log

### 2026-01-17 (Current) - Major Edit Modal UX Improvements

**✅ IMPLEMENTED:**

1. **User-Friendly Variable System**
   - Created `src/utils/emailVariables.ts` utility
   - Frontend format: `[eventName]`, `[businessName]` (camelCase, friendly)
   - Backend format: `{{event_title}}`, `{{business_name}}` (unchanged)
   - Bidirectional conversion: `backendToFrontend()` / `frontendToBackend()`
   - 15 variables mapped across 4 categories

2. **Clickable Variable Buttons**
   - Variable buttons appear when subject/body fields are focused
   - Organized by category: Event Info, Vendor Info, Your Organization, Links
   - Color-coded by category (purple, pink, blue, green)
   - Tooltip shows description and example value
   - Click to insert at cursor position
   - Smart cursor positioning after insertion

3. **Plain Text Editor**
   - Replaced HTML textarea with plain text editor
   - Simple, user-friendly text input
   - No HTML knowledge required
   - Focus on message content, not markup

4. **Improved UX**
   - Variable panel expands on field focus
   - Visual feedback on hover
   - Grouped variables for easy finding
   - Clear placeholder text in inputs
   - Improved field labels ("Email Message" instead of "Email Body (HTML)")

**Technical Details:**

- Added refs for cursor position tracking (`subjectRef`, `bodyRef`)
- State management for active field (`activeField`)
- `insertVariableAtCursor()` helper for smart insertion
- Conversion happens automatically on load/save
- Zero backend changes required

**Files Modified:**

- NEW: `/src/utils/emailVariables.ts` (220 lines)
- UPDATED: `/src/components/producer/Email/EditScheduledEmailModal.tsx` (478 lines)
- UPDATED: `/SCHEDULED_EMAILS_SYSTEM.md` (this file)

---

### 2026-01-17 (Earlier)

- Initial documentation created
- Documented current state of EditScheduledEmailModal
- Identified limitations and proposed enhancements

---

## Questions & Decisions Needed

### Open Questions

1. **Variable Syntax:** Should we support both `{{variable}}` and `[variable]`? (Currently backend uses `{{}}`)

2. **Filter UI:** Should filters be in edit modal or separate "Advanced" panel?

3. **Time Zone:** Should we convert to producer's TZ or keep UTC everywhere?

4. **Preview:** Should preview show one recipient or multiple side-by-side?

5. **Validation:** How strict should HTML validation be? Block save or just warn?

### Design Decisions to Make

1. **Edit Modal Layout:**
   - Single column or two-column?
   - Should filters be collapsible section?
   - Should timing be separate tab?

2. **Variable Insertion:**
   - Dropdown menu position (inline or separate panel)?
   - Should we show variable preview values?

3. **Rich Text Editor:**
   - Which library? (TipTap, Quill, Draft.js)
   - How to handle raw HTML editing?
   - Should we allow code view toggle?

---

## Resources

### Code References

**Frontend:**

- Main Tab: `/src/components/producer/Email/EmailAutomationTab.tsx`
- Edit Modal: `/src/components/producer/Email/EditScheduledEmailModal.tsx`
- Types: `/src/types/email.ts`
- API Client: `/src/services/api.ts` (lines 1085-1195)

**Backend:**

- Model: `/app/models/scheduled_email.rb`
- Controller: `/app/controllers/api/v1/presents/scheduled_emails_controller.rb`
- Generator: `/app/services/scheduled_email_generator.rb`
- Calculator: `/app/services/email_schedule_calculator.rb`
- Resolver: `/app/services/email_variable_resolver.rb`
- Sender: `/app/services/email_sender_service.rb`

### Related Documentation

- CLAUDE_CONTEXT.md (main project context)
- EMAIL_AUTOMATION_PLAN.md (original system design)
- /src/types/email.ts (complete TypeScript interfaces)

---

**END OF DOCUMENT**
