# 4-Step Event Creation Wizard - Implementation Plan

**Feature:** Convert single-page event creation into a multi-step wizard
**Date:** December 7, 2025
**Status:** Planning

---

## Table of Contents
1. [Overview](#overview)
2. [Current State](#current-state)
3. [Desired State](#desired-state)
4. [Architecture](#architecture)
5. [Step-by-Step Breakdown](#step-by-step-breakdown)
6. [Technical Implementation](#technical-implementation)
7. [Backend Changes Required](#backend-changes-required)
8. [Component Structure](#component-structure)
9. [Implementation Phases](#implementation-phases)
10. [Open Questions](#open-questions)
11. [Testing Strategy](#testing-strategy)

---

## Overview

Transform the event creation experience from a single form into a guided 4-step wizard that allows producers to:
- Create event details
- Set up vendor applications with pricing (multiple at once)
- Invite users from their network (future feature)
- Configure automatic event-based emails (future feature)

**Goals:**
- Improve UX by breaking complex creation into digestible steps
- Enable batch creation of vendor applications during event setup
- Lay foundation for invite and messaging features
- Reduce producer friction in event setup

---

## Current State

### Event Creation Flow
```
ProducerDashboard
  └─> "Create Event" button
       └─> CreateEventForm (single page)
            ├─ Event Name (required)
            ├─ Description (required)
            ├─ Event Date (required)
            └─ Location (required)
              └─> Submit → Event created → Redirect to CommandCenter
```

**File:** `/src/components/producer/CreateEventForm.tsx` (217 lines)

### Vendor Application Creation Flow
```
ProducerDashboard
  └─> Select Event
       └─> CommandCenter
            └─> ApplicationsTab
                 └─> CreateApplicationForm
                      ├─ Application Name (required)
                      ├─ Description (optional)
                      └─ Categories (optional array)
                        └─> Submit → Application created
```

**Files:**
- `/src/components/producer/ApplicationsTab.tsx`
- `/src/components/producer/CreateApplicationForm.tsx`

**Key Issues:**
- Applications created AFTER event exists in separate workflow
- Cannot create multiple applications at once
- No application deadline on events
- No pricing information on applications

---

## Desired State

### New 4-Step Wizard Flow

```
ProducerDashboard
  └─> "Create Event" button
       └─> CreateEventWizard
            │
            ├─> Step 1: Event Details
            │    ├─ Event Name
            │    ├─ Description
            │    ├─ Event Date
            │    └─ Location
            │      └─> [Next]
            │
            ├─> Step 2: Application Details
            │    ├─ Application Deadline (NEW)
            │    └─ Application Types (repeatable rows):
            │         ├─ Title (e.g., "Artist Booth")
            │         ├─ Booth Price (e.g., $150.00) (NEW)
            │         ├─ Description (optional)
            │         └─ [+ Add Another Row]
            │      └─> [Back] [Next]
            │
            ├─> Step 3: Invite List (PLACEHOLDER)
            │    └─ "Coming soon" placeholder for network invites
            │      └─> [Back] [Next]
            │
            └─> Step 4: Automatic Messages (PLACEHOLDER)
                 └─ "Coming soon" placeholder for time-based emails
                   └─> [Back] [Submit]
                     └─> Creates event + batch creates applications
                       └─> Redirect to CommandCenter
```

---

## Architecture

### Wizard State Management

```typescript
interface WizardState {
  currentStep: 1 | 2 | 3 | 4;

  // Step 1: Event Details
  eventDetails: {
    title: string;
    description: string;
    event_date: string;
    location: string;
  };

  // Step 2: Application Details
  applicationDetails: {
    application_deadline: string; // ISO date string
    applications: ApplicationRow[];
  };

  // Step 3: Invite List (future)
  inviteList: {
    invitedUsers: string[]; // User IDs or emails
  };

  // Step 4: Automatic Messages (future)
  automaticMessages: {
    messages: EmailTemplate[]; // Future structure
  };
}

interface ApplicationRow {
  id: string; // Temporary client-side ID
  name: string; // Application title (e.g., "Artist Booth")
  booth_price: number; // Price for this booth type
  description: string; // Optional description
  categories?: string[]; // Optional vendor categories (TBD)
}
```

### Wizard Navigation Logic

```typescript
const navigation = {
  canGoNext: (step: number) => {
    switch(step) {
      case 1: return validateEventDetails();
      case 2: return validateApplicationDetails();
      case 3: return true; // Placeholder, always valid
      case 4: return false; // Last step, no next
    }
  },

  canGoBack: (step: number) => step > 1,

  canSubmit: (step: number) => step === 4,
};
```

---

## Step-by-Step Breakdown

### Step 1: Event Details ✅ (Existing)

**Purpose:** Collect basic event information

**Fields:**
- **Event Name** (text, required)
  - Validation: Non-empty, min 3 chars
  - Example: "Downtown Art Market"

- **Description** (textarea, required)
  - Validation: Non-empty, min 10 chars
  - Example: "Annual art market featuring local artists..."

- **Event Date** (date picker, required)
  - Validation: Must be future date
  - Example: "2025-06-15"

- **Location** (text, required)
  - Validation: Non-empty
  - Example: "Central Park Plaza"

**Changes:** Minimal - refactor existing form into Step 1 component

---

### Step 2: Application Details 🆕 (New)

**Purpose:** Set application deadline and create multiple vendor application types

**New Event Field:**
- **Application Deadline** (date picker, required)
  - When vendor applications close
  - Validation: Must be before or equal to event_date
  - Example: "2025-06-01"

**Application Rows (repeatable):**

Each row represents a vendor application type:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| Title | text | Yes | Booth/application type name | "Artist Booth" |
| Booth Price | number | Yes | Price for this booth | 150.00 |
| Description | textarea | No | Details about this booth type | "For visual artists selling original artwork" |

**Interactions:**
- "Add Another Row" button - Creates new empty row
- "Remove" button on each row - Deletes that row
- Minimum: 0 rows (can skip application creation)
- Maximum: 20 rows (reasonable limit)

**Validation:**
- If any rows exist:
  - All rows must have title and booth_price
  - Booth price must be > 0
  - No duplicate titles
- If no rows: Valid (skip application creation)

**UI Mock:**
```
┌────────────────────────────────────────────────────────┐
│ Application Details                                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Application Deadline *                                │
│ ┌──────────────────┐                                  │
│ │ 📅 06/01/2025    │                                  │
│ └──────────────────┘                                  │
│                                                        │
│ Create Vendor Application Types                       │
│                                                        │
│ ┌────────────────────────────────────────────────────┐│
│ │ Application Type #1                          [✕]   ││
│ │                                                    ││
│ │ Title *                                            ││
│ │ ┌────────────────────────────────────────────────┐││
│ │ │ Artist Booth                                   │││
│ │ └────────────────────────────────────────────────┘││
│ │                                                    ││
│ │ Booth Price *                                      ││
│ │ ┌────────────────────────────────────────────────┐││
│ │ │ $ 150.00                                       │││
│ │ └────────────────────────────────────────────────┘││
│ │                                                    ││
│ │ Description                                        ││
│ │ ┌────────────────────────────────────────────────┐││
│ │ │ For visual artists selling original artwork   │││
│ │ │                                                │││
│ │ └────────────────────────────────────────────────┘││
│ └────────────────────────────────────────────────────┘│
│                                                        │
│ ┌────────────────────────────────────────────────────┐│
│ │ Application Type #2                          [✕]   ││
│ │ ...                                                ││
│ └────────────────────────────────────────────────────┘│
│                                                        │
│ [+ Add Another Application Type]                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### Step 3: Invite List 📝 (Placeholder)

**Purpose:** Allow producers to invite vendors from their network

**Current Implementation:** Placeholder only

**UI:**
```
┌────────────────────────────────────────────────────────┐
│ Invite Vendors                                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🚧 Coming Soon                                        │
│                                                        │
│  You'll soon be able to invite vendors directly       │
│  from your network to apply for this event.           │
│                                                        │
│  For now, you can share the event application link    │
│  after creation.                                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Future Implementation:**
- Network/contacts system
- Multi-select vendor list
- Bulk email invitations
- Invitation tracking

---

### Step 4: Automatic Messages 📝 (Placeholder)

**Purpose:** Configure time-based automated emails for event lifecycle

**Current Implementation:** Placeholder only

**UI:**
```
┌────────────────────────────────────────────────────────┐
│ Automatic Messages                                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🚧 Coming Soon                                        │
│                                                        │
│  You'll soon be able to customize automated emails    │
│  for your event:                                       │
│                                                        │
│  • Application confirmation                           │
│  • Approval notification                              │
│  • Event reminders                                    │
│  • Post-event follow-up                               │
│                                                        │
│  Default messages will be used for now.               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Future Implementation:**
- Email template editor
- Trigger configuration (time-based, event-based)
- Preview functionality
- Variable interpolation (event name, vendor name, etc.)

---

## Technical Implementation

### Submission Workflow

When user clicks final "Create Event" button on Step 4:

```typescript
async function handleWizardSubmit(wizardState: WizardState) {
  try {
    // 1. Create the event
    const event = await eventsApi.create(
      organizationSlug,
      {
        title: wizardState.eventDetails.title,
        description: wizardState.eventDetails.description,
        event_date: wizardState.eventDetails.event_date,
        location: wizardState.eventDetails.location,
        application_deadline: wizardState.applicationDetails.application_deadline, // NEW
      }
    );

    // 2. Batch create vendor applications
    const applicationPromises = wizardState.applicationDetails.applications.map(
      (app) => vendorApplicationsApi.create(event.slug, {
        name: app.name,
        booth_price: app.booth_price, // NEW (mocked for now)
        description: app.description,
        status: 'active',
      })
    );

    await Promise.all(applicationPromises);

    // 3. Redirect to CommandCenter
    navigate(`/events/${event.slug}/command-center`);

  } catch (error) {
    // Handle errors appropriately
    // Show error message to user
    // Allow retry
  }
}
```

### Error Handling

**Scenarios:**
1. **Event creation fails** → Show error, stay on wizard, allow retry
2. **Some applications fail** → Event created, show partial success message, allow manual creation of failed apps
3. **All applications fail** → Event created, show warning, redirect to CommandCenter
4. **Network error** → Show connection error, allow retry

---

## Backend Changes Required

### Database Migrations

#### 1. Add `application_deadline` to Events Table

```ruby
# db/migrate/XXXXXX_add_application_deadline_to_events.rb
class AddApplicationDeadlineToEvents < ActiveRecord::Migration[7.0]
  def change
    add_column :events, :application_deadline, :date
  end
end
```

**Notes:**
- Optional field (can be nil)
- Should be validated to be <= event_date if present
- Mocked in frontend until backend implements

---

#### 2. Add `booth_price` to Vendor Applications Table

```ruby
# db/migrate/XXXXXX_add_booth_price_to_vendor_applications.rb
class AddBoothPriceToVendorApplications < ActiveRecord::Migration[7.0]
  def change
    add_column :vendor_applications, :booth_price, :decimal, precision: 10, scale: 2
  end
end
```

**Notes:**
- Optional field for backwards compatibility
- Use decimal type for currency (avoids float precision issues)
- Mocked in frontend until backend implements

---

### API Endpoint Updates

#### Events API
**Endpoint:** `POST /api/v1/presents/organizations/:slug/events`

**Updated Request Body:**
```json
{
  "title": "Downtown Art Market",
  "description": "Annual art market...",
  "event_date": "2025-06-15",
  "location": "Central Park Plaza",
  "application_deadline": "2025-06-01"  // NEW
}
```

---

#### Vendor Applications API
**Endpoint:** `POST /api/v1/presents/events/:event_slug/vendor_applications`

**Updated Request Body:**
```json
{
  "name": "Artist Booth",
  "description": "For visual artists...",
  "booth_price": 150.00,  // NEW
  "status": "active",
  "categories": ["Jewelry", "Pottery"]
}
```

---

## Component Structure

```
src/components/producer/
├── CreateEventWizard/
│   ├── index.tsx                      # Main wizard container
│   ├── CreateEventWizard.tsx          # Wizard logic & state management
│   ├── WizardProgress.tsx             # Step progress indicator (1→2→3→4)
│   ├── WizardNavigation.tsx           # Back/Next/Submit buttons
│   │
│   └── steps/
│       ├── Step1EventDetails.tsx      # Event name, description, date, location
│       ├── Step2ApplicationDetails.tsx # Application deadline + repeatable rows
│       ├── Step3InviteList.tsx        # Placeholder for network invites
│       └── Step4AutoMessages.tsx      # Placeholder for email automation
│
└── (existing components)
    ├── CreateEventForm.tsx             # DEPRECATED - replaced by wizard
    ├── ApplicationsTab.tsx             # Still used in CommandCenter
    └── CreateApplicationForm.tsx       # Still used in CommandCenter
```

### Component Responsibilities

#### `CreateEventWizard.tsx`
- Manages wizard state (all 4 steps' data)
- Handles step navigation
- Validates each step before allowing progression
- Submits final data to API
- Error handling and loading states

#### `WizardProgress.tsx`
- Visual step indicator (1 → 2 → 3 → 4)
- Shows current step, completed steps, upcoming steps
- Click to navigate to completed steps

#### `WizardNavigation.tsx`
- Back button (disabled on step 1)
- Next button (disabled on step 4, validates before proceeding)
- Submit button (only visible on step 4)
- Cancel button (all steps)

#### `Step1EventDetails.tsx`
- Reuses existing form fields from `CreateEventForm.tsx`
- Validates: all fields required
- Emits data upward to wizard

#### `Step2ApplicationDetails.tsx`
- Application deadline date picker
- Dynamic form rows for application types
- Add/remove row functionality
- Validates: deadline <= event_date, all row fields valid if rows exist
- Emits data upward to wizard

#### `Step3InviteList.tsx`
- Simple placeholder component
- "Coming soon" message
- No data collection yet

#### `Step4AutoMessages.tsx`
- Simple placeholder component
- "Coming soon" message
- No data collection yet

---

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Create wizard component structure
- [ ] Build `CreateEventWizard.tsx` with state management
- [ ] Build `WizardProgress.tsx` progress indicator
- [ ] Build `WizardNavigation.tsx` navigation controls
- [ ] Set up routing/modal integration

**Deliverable:** Empty wizard shell that navigates between 4 steps

---

### Phase 2: Step 1 - Event Details (Day 2)
- [ ] Create `Step1EventDetails.tsx`
- [ ] Refactor existing `CreateEventForm` fields into Step 1
- [ ] Implement validation
- [ ] Test step navigation

**Deliverable:** Step 1 fully functional with validation

---

### Phase 3: Step 2 - Application Details (Days 3-4)
- [ ] Create `Step2ApplicationDetails.tsx`
- [ ] Build application deadline picker
- [ ] Build dynamic application row component
- [ ] Implement add/remove row functionality
- [ ] Implement row validation
- [ ] Test with multiple rows

**Deliverable:** Step 2 fully functional with dynamic rows

---

### Phase 4: Steps 3 & 4 - Placeholders (Day 4)
- [ ] Create `Step3InviteList.tsx` placeholder
- [ ] Create `Step4AutoMessages.tsx` placeholder
- [ ] Design placeholder UI/messaging

**Deliverable:** Placeholder steps with clear "coming soon" messaging

---

### Phase 5: Integration & Submission (Day 5)
- [ ] Update API service for new fields (mocked)
- [ ] Implement wizard submission logic
- [ ] Batch create applications after event creation
- [ ] Error handling for partial failures
- [ ] Success/failure messaging

**Deliverable:** Complete end-to-end wizard flow

---

### Phase 6: Testing & Polish (Day 6)
- [ ] End-to-end testing of complete flow
- [ ] Edge case testing (no applications, many applications, errors)
- [ ] Accessibility testing (keyboard navigation, screen readers)
- [ ] Mobile responsive testing
- [ ] UI polish and animations

**Deliverable:** Production-ready wizard

---

### Phase 7: Deployment & Monitoring (Day 7)
- [ ] Replace old `CreateEventForm` with wizard in `ProducerDashboard`
- [ ] Deploy to staging
- [ ] QA testing
- [ ] Deploy to production
- [ ] Monitor for errors/user feedback

**Deliverable:** Wizard live in production

---

## Open Questions

### 1. Categories Field
**Question:** What happens to the existing "categories" array field on vendor applications?

**Current behavior:** Applications have a `categories: string[]` field representing vendor category options (e.g., ["Jewelry", "Pottery", "Textiles"])

**Options:**
- A) Keep it - add categories field to each row in Step 2
- B) Remove it - replace with booth types/titles
- C) Separate it - set categories at event level, not application level

**Recommendation:** Need product decision

---

### 2. Minimum Applications
**Question:** Should producers be required to create at least 1 application in Step 2?

**Options:**
- A) Required - Force at least 1 application
- B) Optional - Allow skipping application creation (can add later in CommandCenter)

**Recommendation:** Make optional (B) - don't block event creation

---

### 3. Edit Flow
**Question:** Should existing events be able to use this wizard for editing?

**Options:**
- A) Yes - Convert `EditEventForm` to multi-step wizard too
- B) No - Wizard only for new events, keep simple edit form for existing
- C) Hybrid - Wizard for creation, but allow editing deadline/applications in CommandCenter

**Recommendation:** Start with (B) - wizard for creation only

---

### 4. Backend Timing
**Question:** When will backend changes be implemented?

**Current plan:** Mock new fields (`application_deadline`, `booth_price`) in frontend

**Action items:**
- Define mock data structure
- Add TypeScript types for new fields
- Comment code showing where backend integration needed
- Create backend ticket/story for Rails team

---

### 5. Application Row Limit
**Question:** What's the maximum number of application types a producer can create?

**Considerations:**
- UX: Too many rows becomes unwieldy
- Performance: Batch API calls
- Business logic: Reasonable number of booth types

**Recommendation:** 20 row maximum (can adjust based on feedback)

---

### 6. Pricing Display
**Question:** Should booth prices be displayed publicly on event pages?

**Impact:** If yes, need to update `PublicEventDetailPage` to show prices

**Recommendation:** Defer to later - focus on creation flow first

---

## Testing Strategy

### Unit Tests
- [ ] Wizard state management
- [ ] Step validation logic
- [ ] Application row add/remove logic
- [ ] Form field validation
- [ ] Error handling

### Integration Tests
- [ ] Step navigation (Next/Back)
- [ ] Data persistence across steps
- [ ] Form submission
- [ ] API error scenarios

### E2E Tests
```typescript
describe('Event Creation Wizard', () => {
  it('should create event with applications', async () => {
    // Navigate to create event
    // Fill Step 1: Event Details
    // Click Next
    // Fill Step 2: Add 2 application rows
    // Click Next (Step 3 placeholder)
    // Click Next (Step 4 placeholder)
    // Click Submit
    // Verify event created
    // Verify 2 applications created
    // Verify redirect to CommandCenter
  });

  it('should handle validation errors', async () => {
    // Try to proceed without filling required fields
    // Verify error messages shown
    // Verify cannot proceed
  });

  it('should allow going back and editing', async () => {
    // Fill all steps
    // Go back to Step 1
    // Edit event name
    // Proceed to Step 4
    // Verify edited data persisted
  });
});
```

### Manual Testing Checklist
- [ ] Create event with 0 applications
- [ ] Create event with 1 application
- [ ] Create event with 10+ applications
- [ ] Test all validation rules
- [ ] Test back/next navigation
- [ ] Test cancel at each step
- [ ] Test network errors during submission
- [ ] Test partial failures (event created, apps failed)
- [ ] Test on mobile devices
- [ ] Test keyboard navigation
- [ ] Test with screen reader

---

## Success Metrics

**User Experience:**
- Time to create event (target: < 3 minutes)
- Wizard completion rate (target: > 80%)
- Error rate during submission (target: < 5%)

**Technical:**
- API success rate for batch application creation (target: > 95%)
- Page load time (target: < 2 seconds)
- Zero regression bugs in existing flows

**Business:**
- % of events created with applications (measure adoption of Step 2)
- Average # of application types per event
- Reduction in support requests about event creation

---

## Future Enhancements

### Short-term (Next Quarter)
- Implement Step 3: Network invites functionality
- Implement Step 4: Automatic messages functionality
- Add booth price display on public event pages
- Convert edit flow to wizard

### Medium-term (6 months)
- Event templates (save wizard state as template)
- Duplicate event functionality
- Bulk event creation
- Event preview before submission

### Long-term (1 year)
- AI-assisted event description generation
- Recommended pricing based on similar events
- Vendor matching suggestions
- Advanced scheduling (recurring events)

---

## Appendix

### Related Files
- Current event creation: `/src/components/producer/CreateEventForm.tsx`
- Current application creation: `/src/components/producer/CreateApplicationForm.tsx`
- Applications tab: `/src/components/producer/ApplicationsTab.tsx`
- Producer dashboard: `/src/pages/ProducerDashboard.tsx`
- API services: `/src/services/api.ts`

### Related API Endpoints
- `POST /api/v1/presents/organizations/:slug/events`
- `PATCH /api/v1/presents/events/:slug`
- `DELETE /api/v1/presents/events/:slug`
- `POST /api/v1/presents/events/:event_slug/vendor_applications`
- `PATCH /api/v1/presents/vendor_applications/:id`

### Design Resources
- Current UI screenshots: (Add links to design files)
- Figma mocks: (Add Figma links when available)
- Brand guidelines: (Add link to brand assets)

---

**Document Version:** 1.0
**Last Updated:** December 7, 2025
**Author:** Implementation Planning
**Status:** Ready for Review
