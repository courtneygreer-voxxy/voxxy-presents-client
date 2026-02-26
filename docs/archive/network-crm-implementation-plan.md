# Producer Network/CRM System - Implementation Plan

**Feature:** Vendor contact management and bulk email communication system
**Date:** December 10, 2025
**Status:** Planning
**Priority:** HIGH - Required before Event Creation Wizard Step 3

---

## Table of Contents
1. [Overview](#overview)
2. [Current State](#current-state)
3. [Feature Requirements](#feature-requirements)
4. [Data Model](#data-model)
5. [UI/UX Design](#uiux-design)
6. [Component Structure](#component-structure)
7. [API Endpoints](#api-endpoints)
8. [Implementation Phases](#implementation-phases)
9. [Integration Points](#integration-points)
10. [Testing Strategy](#testing-strategy)
11. [Future Enhancements](#future-enhancements)

---

## Overview

### Purpose
Build a CRM-style contact management system for producers to:
- Save vendor contacts from event applications
- Manually add new contacts
- Organize contacts with notes and metadata
- Send bulk emails to selected contacts/groups
- Power the "Invite List" feature in event creation wizard

### Goals
1. **Contact Management** - Save and organize vendor relationships
2. **Cross-Event Tracking** - See which vendors have worked across multiple events
3. **Bulk Communication** - Send emails to groups of vendors
4. **Event Integration** - Easily invite saved contacts to new events
5. **Data Enrichment** - Add notes, tags, and custom information per contact

### Non-Goals (Out of Scope)
- Direct 1-on-1 messaging (not included per requirements)
- Real-time chat or notifications
- Payment/invoice management
- Calendar/scheduling integration
- Advanced CRM features (deals, pipelines, etc.)

---

## Current State

### What Exists
- **Per-event vendor submissions** tracked in `registrations` table
- **VendorsTab** in CommandCenter shows submissions per event
- **Contact data** already collected: name, email, phone, business_name, category
- **Network tab placeholder** exists in ProducerDashboard (empty)
- **Email API** exists for sending emails (`emailApi.sendEmail`)

### What Doesn't Exist
- No cross-event contact management
- No saved/favorited vendors
- No contact database separate from event submissions
- No bulk email UI for producers
- No way to manually add contacts
- No notes or custom metadata per contact

### Data Currently Available
From `registrations` table:
- Vendor name, email, phone
- Business name
- Vendor category
- Submission status
- Event association
- Submission date

**Gap:** This data is event-specific and scattered. Need centralized contact management.

---

## Feature Requirements

### Contact Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| **Contact Name** | text | Yes | Full name of vendor contact | "Sarah Mitchell" |
| **Business Name** | text | No | Vendor business/brand name | "Sarah's Ceramics" |
| **Contact Type** | select | Yes | Type of contact | "Vendor" (future: "Partner", "Sponsor", etc.) |
| **Location** | text | No | City, State or full address | "Portland, OR" |
| **Email** | email | Yes | Primary email address | "sarah.mitchell0@example.com" |
| **Phone** | tel | No | Contact phone number | "(200) 555-0000" |
| **Notes** | textarea | No | Custom notes about vendor | "Great vendor, very reliable. Has participated in 1 events." |
| **Tags** | array | No | Custom tags for filtering | ["ceramics", "reliable", "returning"] |

### Auto-Calculated Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Events Participated** | Count of events they've worked | "1 events" |
| **Total Applications** | Count of total submissions | "3 applications" |
| **Approval Rate** | % of approved applications | "67% approved" |
| **Last Contact** | Most recent interaction date | "Dec 1, 2025" |
| **Date Added** | When added to network | "Nov 15, 2025" |
| **Source** | How they were added | "Event Application" or "Manual" |

### Contact Types (Initial)
- **Vendor** - Default for marketplace vendors
- **Partner** - Collaborators or co-promoters (future)
- **Sponsor** - Event sponsors (future)
- **Staff** - Event staff/volunteers (future)

Start with just "Vendor" - add others later.

### Actions Per Contact

| Action | Description |
|--------|-------------|
| **Edit** | Update contact details |
| **Email** | Compose email to this contact |
| **Add to Group** | Add to selection for bulk email |
| **View History** | See all events they've participated in |
| **Delete** | Remove from network (soft delete) |
| **Add Note** | Quick add to notes field |

---

## Data Model

### New Table: `vendor_contacts`

```sql
create_table "vendor_contacts" do |t|
  -- Ownership
  t.bigint "organization_id", null: false  # Which producer's network
  t.index ["organization_id"], name: "index_vendor_contacts_on_organization_id"

  -- Core Contact Info
  t.string "contact_name", null: false      # Full name
  t.string "business_name"                   # Optional business/brand name
  t.string "email", null: false              # Primary email (unique per org)
  t.string "phone"                           # Phone number
  t.string "location"                        # City, State or address

  -- Categorization
  t.string "contact_type", default: "vendor" # vendor, partner, sponsor, staff
  t.string "tags", array: true, default: []  # Custom tags

  -- Custom Data
  t.text "notes"                             # Producer's notes

  -- Metadata
  t.string "source"                          # "manual" or "event_application"
  t.bigint "source_registration_id"         # If from event, which submission
  t.datetime "last_contacted_at"            # Last time emailed

  -- Soft Delete
  t.boolean "archived", default: false      # Soft delete flag

  -- Timestamps
  t.datetime "created_at", null: false
  t.datetime "updated_at", null: false
end

# Indexes
add_index :vendor_contacts, [:organization_id, :email], unique: true
add_index :vendor_contacts, :contact_type
add_index :vendor_contacts, :archived
add_index :vendor_contacts, :tags, using: 'gin'  # For array search
```

### Relationships

```
Organization (Producer)
  └── has_many vendor_contacts
       └── VendorContact
            ├── belongs_to organization
            ├── belongs_to source_registration (optional)
            └── has_many event_participations (through registrations)
```

### TypeScript Interface

```typescript
interface VendorContact {
  id: number;
  organization_id: number;

  // Core fields
  contact_name: string;
  business_name?: string;
  email: string;
  phone?: string;
  location?: string;

  // Categorization
  contact_type: 'vendor' | 'partner' | 'sponsor' | 'staff';
  tags: string[];

  // Custom data
  notes?: string;

  // Metadata
  source: 'manual' | 'event_application';
  source_registration_id?: number;
  last_contacted_at?: string;
  archived: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Computed fields (from backend)
  events_participated?: number;
  total_applications?: number;
  approval_rate?: number;
}
```

---

## UI/UX Design

### Network Page Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Producer Dashboard > Network                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  My Vendor Network                                   [+ Add Contact] │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🔍 Search contacts...              [Filters ▼] [Email Selected] │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ☐ Select All    Showing 24 contacts                          │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ☐  Contact Name         Type    Location      Email       │ │
│  │    Business Name                              Phone       │ │
│  │    Notes                                      Actions     │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ ☐  Sarah Mitchell       Vendor  Portland, OR              │ │
│  │    Sarah's Ceramics              sarah.mitchell0@...      │ │
│  │                                  (200) 555-0000           │ │
│  │    Great vendor, very reliable. Has participated in       │ │
│  │    1 events.                                              │ │
│  │                                  [Edit] [Email] [Delete]  │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ ☐  John Davis          Vendor  Seattle, WA                │ │
│  │    Handmade Jewelry Co.          john.davis@...           │ │
│  │                                  (206) 555-1234           │ │
│  │    Applied 3 times, approved twice. Excellent products.   │ │
│  │                                  [Edit] [Email] [Delete]  │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ ... (more contacts)                                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [Load More]                                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Add Contact Modal

```
┌───────────────────────────────────────────┐
│ Add Contact to Network              [✕]  │
├───────────────────────────────────────────┤
│                                           │
│  Contact Name *                           │
│  ┌─────────────────────────────────────┐ │
│  │ Sarah Mitchell                      │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Business Name                            │
│  ┌─────────────────────────────────────┐ │
│  │ Sarah's Ceramics                    │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Contact Type *                           │
│  ┌─────────────────────────────────────┐ │
│  │ Vendor                          ▼   │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Email *                                  │
│  ┌─────────────────────────────────────┐ │
│  │ sarah.mitchell0@example.com         │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Phone                                    │
│  ┌─────────────────────────────────────┐ │
│  │ (200) 555-0000                      │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Location                                 │
│  ┌─────────────────────────────────────┐ │
│  │ Portland, OR                        │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Tags                                     │
│  ┌─────────────────────────────────────┐ │
│  │ [ceramics] [reliable] + Add tag     │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Notes                                    │
│  ┌─────────────────────────────────────┐ │
│  │ Great vendor, very reliable...      │ │
│  │                                     │ │
│  │                                     │ │
│  └─────────────────────────────────────┘ │
│                                           │
│         [Cancel]  [Add Contact]           │
└───────────────────────────────────────────┘
```

### Bulk Email Modal

```
┌───────────────────────────────────────────┐
│ Send Email to 5 Contacts            [✕]  │
├───────────────────────────────────────────┤
│                                           │
│  Recipients:                              │
│  ┌─────────────────────────────────────┐ │
│  │ Sarah Mitchell <sarah.mitchell0@...│ │
│  │ John Davis <john.davis@...>         │ │
│  │ + 3 more                            │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Subject *                                │
│  ┌─────────────────────────────────────┐ │
│  │ Invitation: Summer Art Market       │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Message *                                │
│  ┌─────────────────────────────────────┐ │
│  │ Hi there,                           │ │
│  │                                     │ │
│  │ We're hosting our Summer Art Market │ │
│  │ and would love to have you join... │ │
│  │                                     │ │
│  │                                     │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ☐ Include event application link        │
│                                           │
│         [Cancel]  [Send Email]            │
└───────────────────────────────────────────┘
```

### VendorsTab Integration - "Add to Network" Button

```
┌─────────────────────────────────────────────────────────┐
│ VendorsTab (Event CommandCenter)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Vendor Submissions                                     │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Sarah Mitchell                                    │ │
│  │ sarah.mitchell0@example.com • (200) 555-0000      │ │
│  │ Category: Ceramics • Status: Approved             │ │
│  │                                                   │ │
│  │ [Approve] [Reject] [+ Add to Network] ← NEW      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

When clicked:
- Check if contact already exists in network (by email)
- If exists: Show toast "Already in your network"
- If new: Create vendor_contact record with data from registration
- Show success toast: "Sarah Mitchell added to your network"

---

## Component Structure

```
src/components/producer/
├── Network/
│   ├── index.tsx                        # Re-export
│   │
│   ├── NetworkPage.tsx                  # Main network page component
│   │   ├── Search & filters
│   │   ├── Bulk action toolbar
│   │   ├── ContactsTable
│   │   └── Pagination
│   │
│   ├── ContactsTable.tsx                # Table of contacts
│   │   ├── Table header with sort
│   │   ├── ContactRow components
│   │   └── Selection checkboxes
│   │
│   ├── ContactRow.tsx                   # Single contact row
│   │   ├── Contact info display
│   │   ├── Notes preview
│   │   ├── Participation count
│   │   └── Action buttons
│   │
│   ├── AddContactModal.tsx              # Add new contact form
│   │   ├── Form fields
│   │   ├── Tag input
│   │   ├── Validation
│   │   └── Submit handler
│   │
│   ├── EditContactModal.tsx             # Edit existing contact
│   │   ├── Pre-filled form
│   │   └── Update handler
│   │
│   ├── BulkEmailModal.tsx               # Send email to multiple contacts
│   │   ├── Recipients list
│   │   ├── Subject & message fields
│   │   ├── Rich text editor (optional)
│   │   └── Send handler
│   │
│   ├── ContactDetailModal.tsx           # View full contact details
│   │   ├── All contact info
│   │   ├── Event participation history
│   │   ├── Email history
│   │   └── Quick actions
│   │
│   └── AddToNetworkButton.tsx           # Button for VendorsTab
│       ├── Check if exists
│       ├── Create contact
│       └── Success feedback
│
└── (existing components)
```

### New API Service

```
src/services/
└── api.ts
    └── vendorContactsApi (NEW)
        ├── getAll(organizationId, filters?)
        ├── getById(id)
        ├── create(organizationId, contactData)
        ├── update(id, contactData)
        ├── delete(id) // soft delete
        ├── bulkEmail(contactIds[], emailData)
        └── importFromRegistration(registrationId)
```

---

## API Endpoints

### Backend Endpoints (Rails)

#### 1. List Contacts
```
GET /api/v1/presents/organizations/:organization_id/vendor_contacts

Query params:
  - search (string) - Search by name, email, business
  - contact_type (string) - Filter by type
  - tags[] (array) - Filter by tags
  - page (number) - Pagination
  - per_page (number) - Items per page (default 25)
  - sort (string) - Sort field (created_at, contact_name, etc.)
  - order (string) - asc/desc

Response:
{
  "vendor_contacts": [
    {
      "id": 1,
      "organization_id": 5,
      "contact_name": "Sarah Mitchell",
      "business_name": "Sarah's Ceramics",
      "email": "sarah.mitchell0@example.com",
      "phone": "(200) 555-0000",
      "location": "Portland, OR",
      "contact_type": "vendor",
      "tags": ["ceramics", "reliable"],
      "notes": "Great vendor, very reliable. Has participated in 1 events.",
      "source": "event_application",
      "source_registration_id": 123,
      "last_contacted_at": "2025-12-01T10:00:00Z",
      "archived": false,
      "created_at": "2025-11-15T08:30:00Z",
      "updated_at": "2025-12-01T10:00:00Z",

      // Computed fields
      "events_participated": 1,
      "total_applications": 1,
      "approval_rate": 100.0
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 3,
    "total_count": 67,
    "per_page": 25
  }
}
```

---

#### 2. Get Single Contact
```
GET /api/v1/presents/vendor_contacts/:id

Response:
{
  "vendor_contact": { ... },
  "participation_history": [
    {
      "event_id": 10,
      "event_name": "Summer Art Market",
      "event_date": "2025-06-15",
      "status": "approved",
      "submitted_at": "2025-05-01T12:00:00Z"
    }
  ],
  "email_history": [
    {
      "sent_at": "2025-12-01T10:00:00Z",
      "subject": "Invitation: Winter Market",
      "delivered": true
    }
  ]
}
```

---

#### 3. Create Contact
```
POST /api/v1/presents/organizations/:organization_id/vendor_contacts

Body:
{
  "contact_name": "Sarah Mitchell",
  "business_name": "Sarah's Ceramics",
  "email": "sarah.mitchell0@example.com",
  "phone": "(200) 555-0000",
  "location": "Portland, OR",
  "contact_type": "vendor",
  "tags": ["ceramics", "reliable"],
  "notes": "Great vendor, very reliable.",
  "source": "manual"
}

Response:
{
  "vendor_contact": { ... }
}

Errors:
- 422 if email already exists for this organization
- 400 if validation fails
```

---

#### 4. Update Contact
```
PATCH /api/v1/presents/vendor_contacts/:id

Body: (same as create, all fields optional)

Response:
{
  "vendor_contact": { ... }
}
```

---

#### 5. Delete Contact (Soft Delete)
```
DELETE /api/v1/presents/vendor_contacts/:id

Response:
{
  "message": "Contact archived successfully"
}

Note: Sets archived = true, doesn't actually delete
```

---

#### 6. Import from Registration
```
POST /api/v1/presents/vendor_contacts/import_from_registration

Body:
{
  "registration_id": 123,
  "organization_id": 5
}

Response:
{
  "vendor_contact": { ... },
  "created": true  // or false if already existed
}

This creates a contact from an existing event submission
```

---

#### 7. Bulk Email
```
POST /api/v1/presents/vendor_contacts/bulk_email

Body:
{
  "vendor_contact_ids": [1, 2, 3, 4, 5],
  "subject": "Invitation: Summer Art Market",
  "message": "Hi there,\n\nWe're hosting...",
  "html_message": "<p>Hi there,</p><p>We're hosting...</p>",
  "include_event_link": true,
  "event_id": 10  // optional, if including event link
}

Response:
{
  "emails_sent": 5,
  "failed": [],
  "message": "Emails sent successfully"
}

Errors:
- Returns list of failed emails if any
```

---

#### 8. Bulk Actions
```
POST /api/v1/presents/vendor_contacts/bulk_action

Body:
{
  "vendor_contact_ids": [1, 2, 3],
  "action": "add_tag",  // or "remove_tag", "archive", "unarchive"
  "params": {
    "tag": "priority"  // for add_tag/remove_tag
  }
}

Response:
{
  "updated": 3,
  "message": "Tag added to 3 contacts"
}
```

---

## Implementation Phases

### Phase 1: Data Model & API (Backend) - Days 1-2
**Backend work required**

- [ ] Create migration for `vendor_contacts` table
- [ ] Create VendorContact model with validations
- [ ] Set up relationships (belongs_to organization)
- [ ] Add computed fields (events_participated, etc.)
- [ ] Create API controller & routes
- [ ] Implement all CRUD endpoints
- [ ] Add bulk email endpoint
- [ ] Add import from registration endpoint
- [ ] Write backend tests
- [ ] Deploy to staging API

**Deliverable:** Fully functional API for vendor contacts

---

### Phase 2: Core UI Components - Days 3-4
**Frontend work**

- [ ] Create `vendorContactsApi` service in `api.ts`
- [ ] Define TypeScript interfaces
- [ ] Build `NetworkPage.tsx` skeleton
- [ ] Build `ContactsTable.tsx` with sample data
- [ ] Build `ContactRow.tsx` component
- [ ] Implement search & filter UI
- [ ] Add pagination
- [ ] Test with mock data

**Deliverable:** Basic network page that displays contacts

---

### Phase 3: Contact Management - Days 5-6
**Frontend work**

- [ ] Build `AddContactModal.tsx` form
- [ ] Build `EditContactModal.tsx` form
- [ ] Implement form validation
- [ ] Connect to API endpoints
- [ ] Add tag input component
- [ ] Add delete functionality with confirmation
- [ ] Add success/error toasts
- [ ] Handle edge cases (duplicate emails, etc.)

**Deliverable:** Full CRUD for contacts

---

### Phase 4: Bulk Email Feature - Day 7
**Frontend work**

- [ ] Build `BulkEmailModal.tsx`
- [ ] Add checkbox selection to ContactsTable
- [ ] Add "Select All" functionality
- [ ] Build email composer (subject, message)
- [ ] Connect to bulk email endpoint
- [ ] Add sending state & progress indicator
- [ ] Handle errors (show which emails failed)
- [ ] Add email preview

**Deliverable:** Bulk email functionality working

---

### Phase 5: VendorsTab Integration - Day 8
**Frontend work**

- [ ] Create `AddToNetworkButton.tsx` component
- [ ] Add button to VendorsTab contact cards
- [ ] Implement "import from registration" logic
- [ ] Check for duplicates before adding
- [ ] Pre-fill contact form with registration data
- [ ] Add success feedback
- [ ] Test with various submission states

**Deliverable:** Seamless "save to network" from event submissions

---

### Phase 6: Contact Details & History - Day 9
**Frontend work**

- [ ] Build `ContactDetailModal.tsx`
- [ ] Display full contact information
- [ ] Show event participation history
- [ ] Show email history (if tracked)
- [ ] Add quick edit functionality
- [ ] Add "Email this contact" button
- [ ] Style and polish UI

**Deliverable:** Detailed contact view with history

---

### Phase 7: Polish & Testing - Day 10
**Frontend work**

- [ ] Accessibility audit (keyboard nav, ARIA labels)
- [ ] Mobile responsive design
- [ ] Empty states (no contacts yet)
- [ ] Loading states
- [ ] Error states
- [ ] Add animations/transitions
- [ ] Performance optimization (virtualization if needed)
- [ ] Cross-browser testing

**Deliverable:** Production-ready network feature

---

### Phase 8: Deployment & Monitoring - Day 11
**Deployment**

- [ ] Deploy to staging
- [ ] QA testing
- [ ] Fix any bugs found
- [ ] Write user documentation
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Gather user feedback

**Deliverable:** Network feature live in production

---

## Integration Points

### 1. ProducerDashboard Navigation
**File:** `/src/pages/ProducerDashboard.tsx`

**Changes:**
- Network tab currently shows placeholder "Dashboard content coming soon..."
- Replace with `<NetworkPage />` component

```tsx
// Before
{activeTab === 'network' && (
  <div className="text-white">Dashboard content coming soon...</div>
)}

// After
{activeTab === 'network' && (
  <NetworkPage organizationId={organization.id} />
)}
```

---

### 2. VendorsTab - Add to Network
**File:** `/src/components/producer/VendorsTab.tsx`

**Changes:**
- Add "Add to Network" button to each vendor submission card
- Import `AddToNetworkButton` component
- Pass submission data to button

```tsx
<AddToNetworkButton
  registration={submission}
  organizationId={organization.id}
  onSuccess={() => showToast('Added to network!')}
/>
```

---

### 3. Event Creation Wizard - Step 3 (Future)
**File:** `/src/components/producer/CreateEventWizard/steps/Step3InviteList.tsx`

**Changes:**
- Replace placeholder with contact selection UI
- Fetch contacts from network
- Allow multi-select of contacts
- Generate invite emails with event application link

```tsx
<Step3InviteList
  contacts={networkContacts}
  selectedContactIds={wizardState.inviteList.invitedUsers}
  onSelectionChange={(ids) => updateWizardState('inviteList', ids)}
/>
```

---

### 4. Email API Integration
**File:** `/src/services/api.ts`

**Current:** `emailApi.sendEmail()` exists

**Enhancement:** Use existing email API for bulk sends

```typescript
export const vendorContactsApi = {
  async bulkEmail(contactIds: number[], emailData: {
    subject: string;
    message: string;
    htmlMessage?: string;
  }) {
    return api.post('/vendor_contacts/bulk_email', {
      vendor_contact_ids: contactIds,
      subject: emailData.subject,
      message: emailData.message,
      html_message: emailData.htmlMessage,
    });
  }
};
```

---

## Testing Strategy

### Backend Tests (Rails)

```ruby
# spec/models/vendor_contact_spec.rb
describe VendorContact do
  it { should belong_to(:organization) }
  it { should validate_presence_of(:contact_name) }
  it { should validate_presence_of(:email) }

  it 'prevents duplicate emails per organization' do
    # Test unique constraint
  end

  it 'calculates events_participated correctly' do
    # Test computed field
  end
end

# spec/requests/vendor_contacts_spec.rb
describe 'VendorContacts API' do
  describe 'GET /organizations/:id/vendor_contacts' do
    it 'returns all contacts for organization'
    it 'filters by search term'
    it 'filters by contact_type'
    it 'paginates results'
  end

  describe 'POST /organizations/:id/vendor_contacts' do
    it 'creates a new contact'
    it 'rejects duplicate email'
    it 'requires contact_name and email'
  end

  describe 'POST /vendor_contacts/bulk_email' do
    it 'sends emails to selected contacts'
    it 'updates last_contacted_at'
    it 'handles email failures gracefully'
  end
end
```

---

### Frontend Tests

#### Unit Tests
```typescript
// ContactsTable.test.tsx
describe('ContactsTable', () => {
  it('renders contact rows', () => {});
  it('handles row selection', () => {});
  it('sorts by column', () => {});
  it('shows empty state when no contacts', () => {});
});

// AddContactModal.test.tsx
describe('AddContactModal', () => {
  it('validates required fields', () => {});
  it('validates email format', () => {});
  it('submits valid data', () => {});
  it('shows error on duplicate email', () => {});
});

// BulkEmailModal.test.tsx
describe('BulkEmailModal', () => {
  it('lists selected recipients', () => {});
  it('validates subject and message', () => {});
  it('sends emails on submit', () => {});
  it('shows progress indicator', () => {});
});
```

#### Integration Tests
```typescript
describe('Network Page Integration', () => {
  it('loads contacts on mount', async () => {});
  it('adds new contact', async () => {});
  it('edits existing contact', async () => {});
  it('deletes contact', async () => {});
  it('sends bulk email to selected contacts', async () => {});
  it('filters contacts by search term', async () => {});
});
```

#### E2E Tests
```typescript
describe('Network Management E2E', () => {
  it('complete workflow: add contact -> edit -> send email -> delete', async () => {
    // Navigate to network page
    // Click "Add Contact"
    // Fill form and submit
    // Verify contact appears in table
    // Click edit, change name, save
    // Select contact, send email
    // Delete contact
    // Verify removed from table
  });

  it('import from event submission', async () => {
    // Go to event VendorsTab
    // Click "Add to Network" on submission
    // Navigate to Network page
    // Verify contact exists with submission data
  });
});
```

---

### Manual Testing Checklist

**Contact Management:**
- [ ] Add contact manually with all fields
- [ ] Add contact with only required fields
- [ ] Edit contact and update all fields
- [ ] Delete contact and confirm soft delete
- [ ] Try to add duplicate email (should fail)
- [ ] Add 50+ contacts and test pagination
- [ ] Search by name, email, business
- [ ] Filter by contact type
- [ ] Filter by tags
- [ ] Sort by different columns

**Bulk Email:**
- [ ] Select multiple contacts
- [ ] Send email to selected
- [ ] Verify emails received
- [ ] Test with 1 contact
- [ ] Test with 50+ contacts
- [ ] Handle email send failures
- [ ] Verify last_contacted_at updates

**VendorsTab Integration:**
- [ ] Add vendor from submission
- [ ] Try to add same vendor twice (should detect)
- [ ] Verify data pre-filled correctly
- [ ] Test with approved/rejected/pending submissions

**Edge Cases:**
- [ ] Network page with 0 contacts
- [ ] Very long notes field
- [ ] Special characters in names/emails
- [ ] International phone numbers
- [ ] Long business names
- [ ] Many tags (10+)
- [ ] Network errors during API calls
- [ ] Slow internet connection

---

## Future Enhancements

### Short-term (Next Quarter)
- [ ] **Import from CSV** - Bulk import contacts
- [ ] **Export to CSV** - Download contact list
- [ ] **Contact groups/segments** - Create saved groups (e.g., "Ceramics Vendors", "VIP")
- [ ] **Advanced filters** - Filter by participation count, approval rate, etc.
- [ ] **Email templates** - Save reusable email templates
- [ ] **Rich text email editor** - Better email composition
- [ ] **Email tracking** - Track opens and clicks

### Medium-term (6 months)
- [ ] **Vendor profiles** - Public vendor profile pages
- [ ] **Rating/review system** - Rate vendors after events
- [ ] **Performance metrics** - Sales data, attendance records
- [ ] **Payment tracking** - Track booth payments
- [ ] **Contract management** - Upload/manage vendor agreements
- [ ] **Automated follow-ups** - Auto-email after events
- [ ] **Integration with wizard Step 3** - Seamless invite flow

### Long-term (1 year)
- [ ] **CRM analytics dashboard** - Vendor retention, engagement metrics
- [ ] **Smart recommendations** - AI-suggested vendors for events
- [ ] **Two-way sync** - Vendors update their own info
- [ ] **Calendar integration** - Schedule calls/meetings with vendors
- [ ] **Mobile app** - Manage network on mobile
- [ ] **Advanced segmentation** - Custom fields and filters
- [ ] **Workflow automation** - Trigger actions based on vendor behavior

---

## Success Metrics

### User Adoption
- **Week 1:** 20% of active producers add at least 1 contact
- **Month 1:** 50% of active producers have 5+ contacts
- **Month 3:** 70% of producers using bulk email feature

### Engagement
- **Average contacts per producer:** 15+ within 3 months
- **Bulk emails sent:** 100+ per week across all producers
- **Conversion rate:** 30% of event submissions → saved to network

### Technical
- **API response time:** < 200ms for contact list
- **Bulk email delivery:** > 95% success rate
- **Page load time:** < 2 seconds
- **Zero downtime** during rollout

### Business Impact
- **Reduced time to invite vendors:** 50% faster for repeat events
- **Increased vendor retention:** 25% more vendors apply to multiple events
- **Producer satisfaction:** 4.5+ star rating on network feature

---

## Data Migration Plan

### For Existing Users

**Option 1: Backfill from Submissions (Automatic)**

Run a one-time script to create contacts from past event submissions:

```ruby
# db/scripts/backfill_vendor_contacts.rb
Organization.find_each do |org|
  # Get all unique vendor submissions across org's events
  unique_vendors = Registration
    .joins(vendor_application: { event: :organization })
    .where(organizations: { id: org.id })
    .where.not(email: nil)
    .group(:email)
    .select('email, MAX(id) as latest_id')

  unique_vendors.each do |vendor_data|
    registration = Registration.find(vendor_data.latest_id)

    VendorContact.find_or_create_by(
      organization_id: org.id,
      email: registration.email
    ) do |contact|
      contact.contact_name = registration.name
      contact.business_name = registration.business_name
      contact.phone = registration.phone
      contact.contact_type = 'vendor'
      contact.source = 'event_application'
      contact.source_registration_id = registration.id
      contact.notes = "Automatically imported from event submissions."
    end
  end
end
```

**Option 2: Manual Opt-in (User Triggered)**

Add a banner to VendorsTab:
```
┌─────────────────────────────────────────────────────────┐
│ 💡 New Feature: Import your past vendors to Network!   │
│    [Import Now]                            [Dismiss]    │
└─────────────────────────────────────────────────────────┘
```

On click, preview contacts and let user confirm import.

**Recommendation:** Use Option 2 (manual opt-in) to avoid surprising users and give them control.

---

## Security Considerations

### Data Protection
- [ ] Vendor emails/contacts are **private to each organization**
- [ ] Never expose contacts between different producers
- [ ] Validate organization_id on all API requests
- [ ] Soft delete (archive) instead of hard delete (preserve data)
- [ ] Rate limit bulk email API to prevent spam

### Authorization
- [ ] Only producers/venue_owners can access network
- [ ] Vendors cannot see producer's network
- [ ] Require JWT authentication on all endpoints
- [ ] Verify user owns organization before CRUD operations

### Email Compliance
- [ ] Include unsubscribe link in bulk emails
- [ ] Track unsubscribe requests
- [ ] Respect email preferences
- [ ] Comply with CAN-SPAM Act
- [ ] Add sender's organization info to emails

### Privacy
- [ ] Add privacy policy section about contact management
- [ ] Allow vendors to request data deletion (GDPR)
- [ ] Don't share vendor data with third parties
- [ ] Encrypt sensitive fields (if needed)

---

## Rollout Plan

### Phase 1: Beta (Week 1)
- Deploy to staging
- Invite 5-10 active producers to test
- Gather feedback
- Fix critical bugs

### Phase 2: Limited Release (Week 2)
- Deploy to production
- Feature flag: only show to beta users
- Monitor performance and errors
- Iterate based on feedback

### Phase 3: General Availability (Week 3)
- Enable for all producers
- Add in-app announcement/tutorial
- Send email to all producers announcing feature
- Monitor adoption metrics

### Phase 4: Optimization (Week 4+)
- Analyze usage data
- Identify pain points
- Prioritize enhancements
- Plan next iteration

---

## Documentation

### User-Facing Docs
- [ ] **Help Center Article:** "Managing Your Vendor Network"
- [ ] **Video Tutorial:** "How to Build Your Network"
- [ ] **FAQ:** Common questions about contacts
- [ ] **Email Best Practices:** Tips for bulk emails
- [ ] **Privacy Policy Update:** Contact management section

### Developer Docs
- [ ] API endpoint documentation
- [ ] Data model diagrams
- [ ] Component architecture docs
- [ ] Testing guidelines
- [ ] Deployment runbook

---

## Appendix

### Related Files (Current)

**Frontend:**
- `/src/pages/ProducerDashboard.tsx` - Main producer interface
- `/src/components/producer/VendorsTab.tsx` - Event vendor submissions
- `/src/components/producer/ApplicationsTab.tsx` - Event applications
- `/src/services/api.ts` - API service layer

**Documentation:**
- `/docs/PRODUCER_FLOW_STATUS.md` - Producer feature tracking
- `/docs/API_CONFIGURATION.md` - API reference

### Sample Data

```json
{
  "vendor_contacts": [
    {
      "contact_name": "Sarah Mitchell",
      "business_name": "Sarah's Ceramics",
      "email": "sarah.mitchell0@example.com",
      "phone": "(200) 555-0000",
      "location": "Portland, OR",
      "contact_type": "vendor",
      "tags": ["ceramics", "reliable", "returning"],
      "notes": "Great vendor, very reliable. Has participated in 1 events.",
      "events_participated": 1,
      "total_applications": 1,
      "approval_rate": 100.0
    },
    {
      "contact_name": "John Davis",
      "business_name": "Handmade Jewelry Co.",
      "email": "john.davis@example.com",
      "phone": "(206) 555-1234",
      "location": "Seattle, WA",
      "contact_type": "vendor",
      "tags": ["jewelry", "popular"],
      "notes": "Applied 3 times, approved twice. Excellent products.",
      "events_participated": 2,
      "total_applications": 3,
      "approval_rate": 66.7
    }
  ]
}
```

---

**Document Version:** 1.0
**Last Updated:** December 10, 2025
**Author:** Implementation Planning
**Status:** Ready for Implementation
**Next Steps:** Begin Phase 1 - Backend API Development
