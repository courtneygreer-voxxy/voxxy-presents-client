# Event Creation Wizard

**Created:** April 3, 2026
**Status:** ✅ Production Ready
**Location:** `src/components/producer/CreateEventWizard/`

---

## Overview

The Event Creation Wizard is a 4-step guided flow that helps producers create events with vendor applications, contact invitations, and automated email sequences. The wizard features smart defaults from previous events, immediate contact import, and flexible email template configuration.

### Key Features

- **Smart Category Pre-fill**: Auto-populates booth pricing and details from previous events
- **Immediate Contact Import**: Multi-select with instant preview (no modal workflow)
- **Email Template Flexibility**: Universal or category-specific sequences
- **Step Validation**: Real-time validation with clear error messages
- **Progress Tracking**: Visual progress indicator with completed step markers

---

## Table of Contents

1. [Wizard Architecture](#wizard-architecture)
2. [Step 1: Event Details](#step-1-event-details)
3. [Step 2: Application Categories](#step-2-application-categories)
4. [Step 3: Invite Contacts](#step-3-invite-contacts)
5. [Step 4: Email Sequences](#step-4-email-sequences)
6. [Validation Rules](#validation-rules)
7. [Data Flow](#data-flow)
8. [Error Handling](#error-handling)
9. [Testing](#testing)

---

## Wizard Architecture

### Component Structure

```
CreateEventWizard/
├── CreateEventWizard.tsx           # Main wizard coordinator
├── types.ts                        # TypeScript interfaces
├── WizardProgress.tsx              # Step progress indicator
├── WizardNavigation.tsx            # Back/Next/Submit buttons
└── steps/
    ├── Step1EventDetails.tsx       # Event info & deadlines
    ├── Step2ApplicationDetails.tsx # Category selection & pricing
    ├── Step3InviteList.tsx         # Contact selection
    └── Step4AutoMessages.tsx       # Email sequences
```

### State Management

The wizard maintains a single `WizardState` object that flows through all steps:

```typescript
interface WizardState {
  currentStep: 1 | 2 | 3 | 4;

  eventDetails: {
    title: string;
    description: string;
    event_date: string;
    event_end_date?: string;
    start_time?: string;
    end_time?: string;
    venue?: string;
    location: string;
    age_restriction?: string;
    ticket_link?: string;
    application_deadline: string;  // REQUIRED
    payment_deadline?: string;
  };

  applicationDetails: {
    applications: ApplicationRow[];
  };

  inviteList: {
    selectedListIds: number[];
    invitedContactIds: number[];
    excludedContactIds: number[];
  };

  automaticMessages: {
    messages: unknown[];
    email_campaign_template_id?: number;
    use_category_templates?: boolean;
    use_universal_category_template?: boolean;  // DEFAULT: true
    universal_category_template_id?: number;
  };
}
```

**State Updates:** Immutable updates via `updateWizardState()` function.

---

## Step 1: Event Details

**File:** `steps/Step1EventDetails.tsx`

### Purpose
Collect basic event information and important deadlines.

### Required Fields
- **Event Name** (min 3 characters)
- **Event Date** (must be in future)
- **Location** (city/venue)
- **Application Deadline** (must be on or before event date)

### Optional Fields
- Event End Date (for multi-day events)
- Event Start/End Times
- Venue (Google Places integration)
- Age Restriction
- Ticket Link
- Payment Deadline
- Event Description

### Validation Rules

```typescript
// Event name
if (!title.trim()) → "Event name is required"
if (title.length < 3) → "Event name must be at least 3 characters"

// Event date
if (!event_date) → "Event date is required"
if (eventDate < today) → "Event date must be in the future"

// End date (if provided)
if (event_end_date && event_end_date < event_date)
  → "End date must be on or after the start date"

// Location
if (!location.trim()) → "Location is required"
```

### UI Components
- Text inputs with validation feedback
- Date pickers with constraints
- Google Places autocomplete for venue
- Character count indicators

---

## Step 2: Application Categories

**File:** `steps/Step2ApplicationDetails.tsx`

### Purpose
Select vendor categories and configure booth pricing. Features **smart pre-fill** from previous events.

### Smart Pre-fill System

**How It Works:**
1. Producer selects category (e.g., "Food Vendor")
2. System checks category's `last_used_event_name` and default values
3. If defaults exist, application is pre-filled with:
   - `booth_price` from `default_booth_price`
   - `description` from `default_description`
   - `install_start_time` / `install_end_time`
   - `payment_link` from `default_payment_link`
   - `application_tags` from `default_application_tags`
4. Blue indicator shows: "Pre-filled from: [Event Name]"
5. Producer can clear pre-filled data with one click

**Data Source:**
- NO API call needed - uses cached category data
- Categories fetched once on step load
- Defaults stored in organization's categories table

### Required Fields
- At least 1 category selected
- **Booth Price** > $0 for each category
- **Application Deadline** (set in this step, shared across categories)

### Optional Fields Per Category
- Description
- Install Date & Times
- Payment Link
- Application Tags (free-text)

### Category Management
- **Create New Category**: Inline category creation without leaving wizard
- **Pre-filled Indicator**: Shows which event data came from
- **Clear Defaults**: One-click to start fresh

### Validation Rules

```typescript
// Application deadline
if (!application_deadline) → "Application deadline is required"
if (deadline > event_date)
  → "Application deadline must be on or before event date"

// Categories
if (applications.length === 0)
  → "At least one application type is required"

// Per application
if (!app.name.trim()) → "Title is required"
if (titles.has(app.name.toLowerCase()))
  → "Duplicate title - each must be unique"
if (app.booth_price <= 0)
  → "Price must be greater than $0"
```

### UI Components
- Category selection grid with checkboxes
- Color-coded category badges
- Inline category creation form
- Pre-fill indicator with clear button
- Price input with $ symbol
- Tag input with add/remove
- Install time pickers

---

## Step 3: Invite Contacts

**File:** `steps/Step3InviteList.tsx`

### Purpose
Select which vendor contacts receive invitations. Features **immediate import** with live preview.

### Selection Options

**1. Invite All Contacts**
- Checkbox at top of list
- Fetches all contacts from organization
- Shows total count: `(245)`
- Mutually exclusive with list selection

**2. Select Contact Lists**
- Multi-select checkboxes for saved lists
- Shows count per list: `(42)`
- Can select multiple lists simultaneously
- Contacts de-duplicated by ID automatically

### Immediate Import Behavior

**Previous Flow (Removed):**
- ❌ Select lists → Open modal → Preview → Confirm → Import

**New Flow:**
- ✅ Select lists → Contacts imported immediately
- ✅ Table view appears instantly
- ✅ No modal, no extra confirmation step

### Contact Table Features

**Displayed Fields:**
- Name (contact_name)
- Business Name (business_name)
- Email (email)
- Unsubscribe Status (is_unsubscribed, scope)

**Functionality:**
- Search by name, email, or business
- Pagination (50 contacts/page)
- Bulk selection with checkboxes
- Bulk delete selected contacts
- "Change Selection" button to start over

### Unsubscribe Status Handling

**Visual Indicators:**
- 🟢 **Active** (green badge) - Will receive emails
- 🔴 **Global** (red badge) - Unsubscribed at global level, won't receive emails
- 🟡 **Org** (yellow badge) - Unsubscribed at organization level, won't receive emails

**Warning Banner:**
When unsubscribed contacts present:
```
⚠️ Warning: 5 contacts are unsubscribed and won't receive invitations
Unsubscribed contacts are highlighted below. They opted out at the global
or organization level.
```

### Multi-Select Behavior

Users can select multiple lists:
```typescript
// Example: Select 3 lists
✅ Food Vendors (42)
✅ Artists (28)
✅ Sponsors (15)
// Result: 85 contacts (duplicates removed)
```

### Validation Rules
- No validation required (step 3 is optional)
- Can create event without inviting anyone
- Can always add invitations later

### UI Components
- Checkbox list for "Invite All" and contact lists
- Live-updating contact table
- Search bar with instant filter
- Unsubscribe status badges
- Pagination controls
- Bulk action toolbar

---

## Step 4: Email Sequences

**File:** `steps/Step4AutoMessages.tsx`

### Purpose
Configure automated email sequences for event-wide emails and vendor category emails.

### Two Email Types

#### 1. Event-Wide Sequence
**Purpose:** Emails sent to ALL vendors regardless of category

**Email Types:**
- Event invitations
- Event updates/changes
- Event cancellation
- Application deadline reminders

**Selection:** Single template dropdown

#### 2. Vendor Category Emails
**Purpose:** Emails specific to application process

**Email Types:**
- Application confirmation
- Approval/rejection notifications
- Payment reminders
- Event countdown emails (3 days before, 1 day before, day-of)

**Selection:** Choose one of two strategies

### Category Email Strategies

#### Option 1: Universal Sequence (DEFAULT) ✅

**Label:** "Universal Sequence" with "DEFAULT" badge

**Description:** Same content for all vendors

**How It Works:**
- Producer selects one template
- ALL vendor categories use the same emails
- Simpler management
- Consistent messaging

**When to Use:**
- Categories have similar requirements
- Content doesn't need to vary by type
- Simpler event management preferred

**UI Display:**
```
🔘 Universal Sequence [DEFAULT]
   (5 emails)

   Template: Default Category Sequence
   5 emails • Shared by all 3 categories
```

#### Option 2: Category-Specific Sequences

**Label:** "Category-Specific Sequences"

**Description:** Customize content per vendor type

**How It Works:**
- Each category uses its assigned template
- Producer sees template per category
- More complex but allows customization

**When to Use:**
- Food vendors need different payment instructions
- Artists need portfolio submission reminders
- Sponsors need visibility package details
- Different booth setup times per category

**UI Display:**
```
⚪ Category-Specific Sequences
   (15 total emails)

   🍔 Food Vendors → Food Vendor Template (5 emails)
   🎨 Artists → Artist Template (5 emails)
   💎 Sponsors → Sponsor Template (5 emails)
```

### Template Preview

**Features:**
- Email count per template
- Send date calculations based on event dates
- Category color coding
- Preview button to see full sequence

### Email Count Display

System shows accurate email counts per category:

```typescript
// Universal mode
universalTemplate.email_count = 5
Display: "(5 emails)"

// Category-specific mode
foodTemplate.email_count = 5
artistTemplate.email_count = 7
sponsorTemplate.email_count = 4
Display: "(16 total emails)"
```

### Default Behavior

**On Wizard Load:**
- Universal Sequence is pre-selected (radio button checked)
- If organization has a universal template, it's auto-selected
- Otherwise, shows system default template

### Validation Rules
- No validation required (emails are optional)
- Can create event without email sequences
- Can configure sequences after event creation

### UI Components
- Radio button selection (Universal vs Category-Specific)
- Template dropdown selector
- Email count badges
- Category badges with colors
- Template preview button
- Help text explaining each option

---

## Validation Rules

### Step Navigation

**Next Button:** Validates current step before advancing
**Back Button:** No validation (preserves data)
**Step Clicking:** Can only click completed steps or current step

### Validation Timing
- **Real-time:** As user types (with debounce)
- **On Blur:** When leaving a field
- **On Submit:** Before moving to next step

### Error Display
```typescript
// Field-level errors
errors[fieldName] = "Error message"
// Displayed below input with red text

// Step-level errors
errors.submit = "Overall error message"
// Displayed at top of step in red banner
```

### Validation Order
1. Step 1 validation (event details)
2. Step 2 validation (categories & pricing)
3. Step 3 validation (none - optional)
4. Step 4 validation (none - optional)
5. Final submit (validates steps 1-2 again)

---

## Data Flow

### Wizard Submission

When user clicks "Create Event" on Step 4:

```typescript
// 1. Validate all required steps
if (!validateStep1() || !validateStep2()) {
  setCurrentStep(1); // Go back to first invalid step
  return;
}

// 2. Call onSubmit with complete wizard state
await onSubmit(wizardState);

// 3. Parent component (Dashboard) handles API call
POST /api/v1/presents/organizations/:org_slug/events
{
  event: {
    title: "Summer Market",
    event_date: "2026-06-15",
    application_deadline: "2026-05-30",
    payment_deadline: "2026-06-08",
    email_campaign_template_id: 1,
    use_universal_category_template: true,
    universal_category_template_id: 3
  },
  vendor_applications: [
    {
      name: "Food Vendor",
      category_id: 1,
      booth_price: 350.00,
      // ... other fields
    }
  ],
  event_invitations: {
    vendor_contact_ids: [1, 2, 3, 4, 5]
  }
}
```

### Category Defaults Flow

**Step 2: Category Selection**
```typescript
// 1. User clicks "Food Vendor" category
toggleCategory(categoryId);

// 2. System checks if category has defaults
if (category.default_booth_price > 0) {
  // 3. Create application with pre-filled data
  newApp = {
    id: crypto.randomUUID(),
    category_id: category.id,
    booth_price: category.default_booth_price,
    description: category.default_description,
    install_start_time: category.default_install_start_time,
    // ... other defaults
    prefilled_from_event: category.last_used_event_name
  };
}

// 4. Display pre-fill indicator
if (app.prefilled_from_event) {
  // Show blue banner: "Pre-filled from: [Event Name]"
}
```

### Contact Import Flow

**Step 3: Contact Selection**
```typescript
// 1. User checks "Food Vendors" list
handleToggleList(listId);

// 2. System fetches contacts from list
const response = await contactListsApi.getContacts(listId);

// 3. De-duplicate by contact ID
const uniqueContacts = Array.from(
  new Map(contacts.map(c => [c.id, c])).values()
);

// 4. Update wizard state immediately
updateWizardState({
  inviteList: {
    invitedContactIds: uniqueContacts.map(c => c.id)
  }
});

// 5. Table view updates automatically
```

---

## Error Handling

### Field-Level Errors

```typescript
// Example: Title validation
if (!eventDetails.title.trim()) {
  setErrors({ ...errors, title: "Event name is required" });
}

// Display
<input className={errors.title ? 'border-red-500' : 'border-white/10'} />
{errors.title && <p className="text-red-500">{errors.title}</p>}
```

### Step-Level Errors

```typescript
// Example: No categories selected
if (applications.length === 0) {
  setErrors({ applications: "At least one category is required" });
}

// Display at step level
{errors.applications && (
  <div className="bg-red-500/10 border border-red-500/30 p-4">
    <p className="text-red-400">{errors.applications}</p>
  </div>
)}
```

### Submit Errors

```typescript
// API error handling
try {
  await onSubmit(wizardState);
} catch (error) {
  const errorMessage = error?.response?.data?.errors?.[0]
    || error?.message
    || 'Failed to create event. Please try again.';

  setErrors({
    submit: errorMessage.includes('taken')
      ? 'An event with this name already exists.'
      : errorMessage
  });

  // Go back to step 1 to fix
  setCurrentStep(1);
}
```

### Network Errors

```typescript
// Loading states
const [loading, setLoading] = useState(false);

// Error boundaries
if (error) {
  return <ErrorMessage message="Failed to load categories" />;
}
```

---

## Testing

### Manual Testing Checklist

**Step 1: Event Details**
- [ ] Create event with all required fields
- [ ] Try submitting without event name → See error
- [ ] Try past date → See error
- [ ] Try end date before start date → See error
- [ ] Verify location autocomplete works

**Step 2: Application Categories**
- [ ] Select category with defaults → See pre-fill indicator
- [ ] Clear pre-filled data → Fields reset
- [ ] Create new category inline → Auto-selects new category
- [ ] Try submitting with $0 price → See error
- [ ] Add duplicate category name → See error

**Step 3: Invite Contacts**
- [ ] Select "Invite All" → See all contacts
- [ ] Select multiple lists → See de-duplicated contacts
- [ ] See unsubscribe warnings → Check counts
- [ ] Search contacts → Filter works
- [ ] Delete contacts → Removed from list
- [ ] Change selection → Reset works

**Step 4: Email Sequences**
- [ ] Universal Sequence pre-selected → Verify default
- [ ] Switch to Category-Specific → See per-category templates
- [ ] Verify email counts match template library
- [ ] Preview button → Opens template preview

**Navigation**
- [ ] Back button → Returns to previous step
- [ ] Step clicking → Can jump to completed steps
- [ ] Cancel button → Closes wizard
- [ ] Submit → Creates event successfully

### Integration Testing

```typescript
// Test wizard submission
describe('CreateEventWizard', () => {
  it('creates event with all wizard data', async () => {
    // Fill out step 1
    await fillEventDetails();
    fireEvent.click(getByText('Next'));

    // Fill out step 2
    await selectCategories(['Food Vendor', 'Artist']);
    fireEvent.click(getByText('Next'));

    // Fill out step 3
    await selectContactLists([1, 2]);
    fireEvent.click(getByText('Next'));

    // Fill out step 4
    await selectUniversalTemplate();
    fireEvent.click(getByText('Create Event'));

    // Verify API call
    expect(mockCreateEvent).toHaveBeenCalledWith({
      event: expect.objectContaining({
        title: 'Test Event',
        use_universal_category_template: true
      }),
      vendor_applications: expect.arrayContaining([...]),
      event_invitations: expect.objectContaining({...})
    });
  });
});
```

### Edge Cases

- Empty organization (no categories) → Show create category prompt
- No contact lists → Show "Create lists in Network" message
- No email templates → Use system defaults
- Network timeout → Show retry option
- Duplicate event name → Show specific error
- Invalid date ranges → Prevent submission

---

## Best Practices

### For Producers

1. **Use Smart Defaults**: Let category defaults save time on repeated events
2. **Start with Universal Sequence**: Simpler for most events
3. **Review Unsubscribe Status**: Check warnings before finalizing
4. **Test Email Sequences**: Use preview to verify send dates
5. **Clear Pre-fills When Needed**: Don't assume defaults are always correct

### For Developers

1. **Keep State Immutable**: Always spread previous state when updating
2. **Validate Early**: Show errors as soon as possible
3. **Handle Loading States**: Show spinners during async operations
4. **Clear Errors on Change**: Remove errors when user fixes issue
5. **Use Optimistic Updates**: Update UI immediately, sync API later

---

## Related Documentation

- [CLAUDE_CONTEXT.md](../../CLAUDE_CONTEXT.md) - Full system context
- [Category Defaults System](../../../voxxy-rails/docs/features/CATEGORY_DEFAULTS_SYSTEM.md) - Backend category defaults
- [Email Sequence System](../../../voxxy-rails/docs/EMAIL_SEQUENCE_SYSTEM.md) - Email template system
- [Category Email Templates](CATEGORY_EMAIL_TEMPLATES.md) - Email template guide

---

## Change Log

**April 3, 2026** - Initial documentation
- Documented complete 4-step wizard flow
- Explained smart category pre-fill system
- Documented immediate contact import (no modal)
- Explained Universal vs Category-Specific email sequences
- Added validation rules and error handling
- Included testing procedures

---

**Questions?** Contact: team@voxxyai.com
