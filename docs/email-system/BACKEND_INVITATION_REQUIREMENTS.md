# Backend Requirements: Event Invitation System

**Date:** December 26, 2024
**Status:** Frontend Complete - Backend Integration Needed
**Priority:** Medium (Feature is functional without backend, but requires API for full workflow)

---

## Overview

The event creation wizard (Step 3) now allows producers to invite vendor contacts from their network when creating an event. The frontend captures which contacts should be invited, but we need backend API endpoints to persist and process these invitations.

---

## Current Frontend Implementation

### What's Already Working

**Event Creation Wizard - Step 3:**

- Producers can select vendor contacts from their organization's network
- Search and filter functionality (by name, business, email, tags, contact type)
- Multi-select interface with checkboxes
- Selected contact IDs are captured in wizard state

**Data Being Sent:**

```typescript
interface WizardState {
  inviteList: {
    invitedContactIds: number[] // Array of vendor_contact IDs
  }
}
```

**Frontend Code Location:**

- Component: `/src/components/producer/CreateEventWizard/steps/Step3InviteList.tsx`
- Integration: `/src/pages/ProducerDashboard.tsx` (line 219-223)
- Types: `/src/components/producer/CreateEventWizard/types.ts`

**Current Behavior:**

```typescript
// ProducerDashboard.tsx handleCreateEvent()
if (wizardState.inviteList.invitedContactIds.length > 0) {
  console.log(`Inviting ${wizardState.inviteList.invitedContactIds.length} contacts to event`)
  // TODO: Create event invitations via API when backend endpoint is ready
  // await eventInvitationsApi.createBatch(newEvent.slug, wizardState.inviteList.invitedContactIds);
}
```

Currently, the invited contact IDs are **logged to console** but not persisted or acted upon.

---

## Required Backend Implementation

### 1. Database Schema

**New Table: `event_invitations`**

Suggested schema:

```ruby
create_table :event_invitations do |t|
  t.references :event, null: false, foreign_key: true
  t.references :vendor_contact, null: false, foreign_key: true
  t.string :status, default: 'pending' # pending, accepted, declined, expired
  t.string :invitation_token, null: false, index: { unique: true }
  t.datetime :sent_at
  t.datetime :responded_at
  t.text :response_notes
  t.datetime :expires_at

  t.timestamps
end

# Ensure unique invitation per event per contact
add_index :event_invitations, [:event_id, :vendor_contact_id], unique: true
```

**Status Values:**

- `pending` - Invitation created but not yet sent/viewed
- `sent` - Email notification sent to vendor
- `viewed` - Vendor opened invitation link
- `accepted` - Vendor accepted invitation
- `declined` - Vendor declined invitation
- `expired` - Invitation expired (past event date or deadline)

### 2. API Endpoints Required

#### A. Create Batch Invitations (Primary Endpoint)

**Endpoint:** `POST /api/v1/presents/events/:event_slug/invitations/batch`

**Purpose:** Create multiple invitations when event is created

**Request Body:**

```json
{
  "vendor_contact_ids": [123, 456, 789]
}
```

**Response:**

```json
{
  "invitations": [
    {
      "id": 1,
      "event_id": 42,
      "vendor_contact_id": 123,
      "status": "pending",
      "invitation_token": "abc123xyz",
      "created_at": "2024-12-26T10:00:00Z"
    }
    // ... more invitations
  ],
  "created_count": 3,
  "errors": []
}
```

**Business Logic:**

1. Validate event exists and belongs to requesting user's organization
2. Validate all vendor_contact_ids exist and belong to the organization
3. Create invitation records with unique tokens
4. Set `expires_at` to event's `application_deadline` or `event_date` (whichever is earlier)
5. Optionally: Queue background job to send invitation emails
6. Handle duplicates gracefully (skip if invitation already exists)

**Error Handling:**

- Return partial success if some invitations fail
- Include error details for failed invitations
- Don't fail entire request if one contact is invalid

#### B. Get Invitations for Event

**Endpoint:** `GET /api/v1/presents/events/:event_slug/invitations`

**Purpose:** List all invitations for an event (for producer dashboard)

**Query Parameters:**

- `status` - Filter by status (pending, accepted, declined, etc.)
- `page`, `per_page` - Pagination

**Response:**

```json
{
  "invitations": [
    {
      "id": 1,
      "vendor_contact": {
        "id": 123,
        "contact_name": "John Smith",
        "business_name": "Smith's Food Truck",
        "email": "john@smithsfoodtruck.com",
        "contact_type": "vendor"
      },
      "status": "pending",
      "sent_at": "2024-12-26T10:05:00Z",
      "responded_at": null,
      "created_at": "2024-12-26T10:00:00Z"
    }
  ],
  "meta": {
    "total_count": 15,
    "pending_count": 10,
    "accepted_count": 3,
    "declined_count": 2
  }
}
```

#### C. Get Invitation by Token (Public Endpoint)

**Endpoint:** `GET /api/v1/presents/invitations/:token`

**Purpose:** Allow vendors to view invitation details (no auth required)

**Response:**

```json
{
  "invitation": {
    "id": 1,
    "status": "pending",
    "event": {
      "title": "Downtown Art Market",
      "description": "...",
      "event_date": "2024-12-30",
      "location": "Central Park Plaza"
    },
    "vendor_contact": {
      "contact_name": "John Smith",
      "business_name": "Smith's Food Truck"
    },
    "expires_at": "2024-12-28T23:59:59Z"
  }
}
```

#### D. Respond to Invitation (Public Endpoint)

**Endpoint:** `PATCH /api/v1/presents/invitations/:token/respond`

**Purpose:** Allow vendors to accept/decline invitation

**Request Body:**

```json
{
  "status": "accepted", // or "declined"
  "response_notes": "Looking forward to participating!"
}
```

**Response:**

```json
{
  "invitation": {
    "id": 1,
    "status": "accepted",
    "responded_at": "2024-12-26T12:30:00Z"
  }
}
```

**Business Logic:**

- If accepted: Optionally auto-create a vendor application for the event
- Update vendor contact's status (e.g., "interested" → "converted")
- Send confirmation email to both vendor and producer
- Prevent changes after response (immutable once accepted/declined)

---

## Existing Database Context

### Related Tables

**`vendor_contacts`** (Already exists)

- Primary table for organization's vendor network
- Contains contact info, tags, status, etc.
- Located in: `app/models/vendor_contact.rb` (assumed)

**`events`** (Already exists)

- Has `application_deadline` field (already implemented)
- Has `event_date` field

**`vendor_applications`** (Already exists)

- Vendors can submit applications to events
- Has relationship: `belongs_to :event`

### Relationships to Add

```ruby
# app/models/event.rb
class Event < ApplicationRecord
  has_many :event_invitations, dependent: :destroy
  has_many :invited_contacts, through: :event_invitations, source: :vendor_contact
end

# app/models/vendor_contact.rb
class VendorContact < ApplicationRecord
  has_many :event_invitations, dependent: :destroy
  has_many :invited_events, through: :event_invitations, source: :event
end

# app/models/event_invitation.rb (new)
class EventInvitation < ApplicationRecord
  belongs_to :event
  belongs_to :vendor_contact

  validates :status, inclusion: { in: %w[pending sent viewed accepted declined expired] }
  validates :vendor_contact_id, uniqueness: { scope: :event_id }

  before_create :generate_invitation_token

  private

  def generate_invitation_token
    self.invitation_token ||= SecureRandom.urlsafe_base64(32)
  end
end
```

---

## Email Notifications (Optional but Recommended)

### Invitation Email Template

**Trigger:** After invitation is created
**Recipients:** Vendor contact's email
**Subject:** "You're invited to participate in [Event Name]"

**Content should include:**

- Event name, date, location
- Personal message from producer (optional future feature)
- Link to view invitation details: `https://app.voxxy.com/invitations/:token`
- Accept/Decline buttons
- Deadline to respond (application_deadline)

### Confirmation Emails

**When vendor accepts:**

- Email to vendor: Next steps, application link
- Email to producer: "[Contact Name] accepted your invitation"

**When vendor declines:**

- Email to vendor: Confirmation of decline
- Email to producer (optional): "[Contact Name] declined"

---

## Frontend Integration Point

Once backend is ready, uncomment and implement in `/src/pages/ProducerDashboard.tsx`:

```typescript
// Line 219-223 (currently commented out)
if (wizardState.inviteList.invitedContactIds.length > 0) {
  await eventInvitationsApi.createBatch(newEvent.slug, wizardState.inviteList.invitedContactIds)
}
```

**Add to `/src/services/api.ts`:**

```typescript
export const eventInvitationsApi = {
  /**
   * Create batch invitations for an event
   * POST /api/v1/presents/events/:event_slug/invitations/batch
   */
  async createBatch(eventSlug: string, vendorContactIds: number[]) {
    return fetchApi<{
      invitations: EventInvitation[]
      created_count: number
      errors: any[]
    }>(`/v1/presents/events/${eventSlug}/invitations/batch`, {
      method: 'POST',
      body: JSON.stringify({ vendor_contact_ids: vendorContactIds }),
    })
  },

  /**
   * Get all invitations for an event
   * GET /api/v1/presents/events/:event_slug/invitations
   */
  async getByEvent(eventSlug: string, params?: { status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)

    const query = queryParams.toString()
    return fetchApi<{
      invitations: EventInvitation[]
      meta: any
    }>(`/v1/presents/events/${eventSlug}/invitations${query ? `?${query}` : ''}`)
  },
}

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

---

## Success Criteria

### MVP (Minimum Viable Product)

- [ ] `event_invitations` table created
- [ ] Batch create endpoint working
- [ ] Invitations persisted to database
- [ ] Frontend can successfully create invitations
- [ ] No errors when creating events with invited contacts

### Phase 2 (Full Feature)

- [ ] Email notifications sent to invited vendors
- [ ] Public invitation view page (no auth required)
- [ ] Accept/decline functionality
- [ ] Producer can view invitation status
- [ ] Auto-expire invitations after deadline
- [ ] Integration with vendor applications workflow

### Phase 3 (Enhanced)

- [ ] Resend invitation emails
- [ ] Custom invitation message from producer
- [ ] Invitation analytics (open rate, response rate)
- [ ] Reminder emails before deadline

---

## Testing Recommendations

### Backend Unit Tests

```ruby
describe EventInvitation do
  it "generates unique token on creation"
  it "validates uniqueness of vendor_contact per event"
  it "prevents duplicate invitations"
  it "sets expires_at based on application_deadline"
  it "transitions status correctly"
end

describe "POST /api/v1/presents/events/:slug/invitations/batch" do
  it "creates multiple invitations successfully"
  it "handles partial failures gracefully"
  it "validates vendor_contact ownership"
  it "returns created count and errors"
end
```

### Integration Tests

1. Create event with 5 invited contacts
2. Verify 5 invitation records created
3. Verify invitations belong to correct event
4. Verify tokens are unique
5. Test duplicate prevention

---

## Security Considerations

1. **Authorization:**
   - Only organization owners can create invitations for their events
   - Validate vendor_contact_ids belong to the same organization

2. **Token Security:**
   - Use cryptographically secure random tokens
   - Tokens should be URL-safe
   - Consider expiration mechanism

3. **Rate Limiting:**
   - Limit batch invitation creation (e.g., max 100 per request)
   - Prevent spam invitations

4. **Data Privacy:**
   - Don't expose vendor contact details in public endpoints
   - Only show necessary info on invitation page

---

## Questions for Backend Team

1. **Email Service:** Do we have existing email infrastructure (ActionMailer, SendGrid, etc.)?
2. **Background Jobs:** Should email sending be asynchronous? (Sidekiq, DelayedJob?)
3. **Auto-Application:** Should accepting an invitation auto-create a vendor application?
4. **Expiration:** Should we auto-expire invitations via cron job or on-access?
5. **Permissions:** Any additional authorization checks needed beyond organization ownership?
6. **Existing Models:** Are there any similar invitation/notification models we should follow?

---

## Additional Context

### Why This Feature Matters

**Producer Workflow:**

1. Producer creates event
2. Producer selects trusted vendors from their network
3. Vendors receive personalized invitations
4. Faster vendor onboarding vs. public application links
5. Higher quality vendor participation

**Benefits:**

- Reduces manual outreach (no copy/paste emails)
- Tracks who was invited vs. who applied organically
- Builds stronger vendor relationships
- Increases event quality through curated vendor selection

### Future Enhancements (Not Required Now)

- **Invitation Templates:** Custom message per event
- **Bulk Actions:** Invite all vendors with specific tag
- **Analytics Dashboard:** Track invitation performance
- **Automated Follow-ups:** Reminder emails before deadline
- **Invitation History:** Track which vendors were invited to which events over time

---

## Contact for Questions

**Frontend Implementation:** See `/docs/WIZARD_IMPLEMENTATION_SUMMARY.md`
**Related Feature:** Vendor Contacts/Network page at `/src/components/producer/Network/`

---

**Status:** Ready for backend team review and implementation planning.
