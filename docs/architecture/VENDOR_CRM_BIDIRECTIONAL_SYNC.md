# Vendor CRM Bidirectional Sync - Architecture Documentation

**Last Updated:** 2026-05-04
**Feature:** Smart CRM with Bidirectional Data Sync
**Status:** ✅ Implemented and Active

---

## Overview

The Vendor CRM system provides **bidirectional synchronization** between:

1. **Event-Specific Data** (registrations table) - Vendor applications per event
2. **Global CRM Data** (vendor_contacts table) - Producer's vendor network

This allows producers to:

- Maintain a centralized vendor network across all events
- View vendor history and notes when they apply to new events
- Edit vendor details in any tab and have changes propagate everywhere

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BIDIRECTIONAL DATA FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. VENDOR APPLIES TO EVENT
   │
   ├─► Registration created (vendor_application_id present)
   │   └─► Fields: name, phone, email, business_name, vendor_category,
   │              location, producer_notes, tags
   │
   └─► after_create callback
       └─► RegistrationToVendorContactService.execute()
           └─► Creates/Updates VendorContact in Network
               └─► Syncs: name, phone, email, business_name, categories

2. PRODUCER VIEWS "VENDORS & APPLICANTS" TAB
   │
   ├─► Frontend: fetchApplicants()
   │   ├─► Fetch registrations (vendorApplicationsApi.getSubmissions)
   │   └─► Fetch invitations + vendor_contacts (eventInvitationsApi.getByEvent)
   │
   └─► Smart CRM Merge (by email - case insensitive)
       ├─► Base: Registration data (event-specific)
       ├─► Enrichment: VendorContact data (global CRM)
       └─► Priority: registration.field || vendor_contact.field
           │
           ├─► location: registration > vendor_contact
           ├─► producer_notes: registration > vendor_contact
           ├─► tags: vendor_contact (if registration.tags empty)
           └─► phone, instagram, website: registration > vendor_contact

3. PRODUCER EDITS VENDOR DETAILS
   │
   ├─► Frontend: EditVendorDetailsModal
   │   ├─► Fields: name, phone, location, tags, producer_notes
   │   └─► Save → registrationsApi.update(registrationId, {...})
   │
   ├─► Backend: RegistrationsController#update
   │   ├─► Updates registration record
   │   └─► Triggers: after_update callback
   │
   └─► after_update → sync_to_vendor_contact
       └─► Finds VendorContact by email
           └─► Updates: phone, name, location, notes, tags
               └─► Registration data OVERWRITES VendorContact
                   │
                   └─► ✅ BIDIRECTIONAL SYNC COMPLETE
                       Both records now in sync!

4. PRODUCER VIEWS NETWORK TAB
   │
   └─► Displays VendorContact with latest synced data
       └─► Changes from step 3 are now visible here!
```

---

## Database Schema

### Registrations Table

```ruby
# Migration: 20260501125522_add_location_and_producer_notes_to_registrations.rb
add_column :registrations, :location, :string
add_column :registrations, :producer_notes, :text

# Migration: 20260504115023_add_tags_to_registrations.rb
add_column :registrations, :tags, :jsonb, default: []
```

**Key Fields:**

- `location` (string) - Event-specific vendor location
- `producer_notes` (text) - Internal notes about vendor for this event
- `tags` (jsonb array) - Categorization tags (e.g., ["artist", "reliable"])

### VendorContacts Table

**Existing Fields:**

- `location` (string) - Global vendor location
- `notes` (text) - Global notes about vendor
- `tags` (jsonb array) - Global categorization tags

---

## Backend Implementation

### Registration Model (`app/models/registration.rb`)

```ruby
# Callbacks
after_create :create_or_update_vendor_contact, if: :vendor_registration?
after_update :sync_to_vendor_contact, if: :should_sync_to_vendor_contact?

# Forward sync: Registration → VendorContact (on create)
def create_or_update_vendor_contact
  RegistrationToVendorContactService.new(self).execute
end

# Reverse sync: Registration → VendorContact (on update)
def should_sync_to_vendor_contact?
  vendor_registration? && email.present? && (
    saved_change_to_location? ||
    saved_change_to_producer_notes? ||
    saved_change_to_tags? ||
    saved_change_to_phone? ||
    saved_change_to_name?
  )
end

def sync_to_vendor_contact
  vendor_contact = event.organization.vendor_contacts
    .find_by(email: email.downcase.strip)

  return unless vendor_contact

  vendor_contact.update(
    phone: phone || vendor_contact.phone,
    name: name || vendor_contact.name,
    location: location || vendor_contact.location,
    notes: producer_notes || vendor_contact.notes,
    tags: tags.present? ? tags : vendor_contact.tags
  )
end
```

### RegistrationsController (`app/controllers/api/v1/presents/registrations_controller.rb`)

```ruby
# Strong parameters - updated to permit new fields
def update_params
  params.require(:registration).permit(
    :name, :phone, :status, :vendor_category, :payment_status,
    :location, :producer_notes, tags: []
  )
end

def registration_params
  params.require(:registration).permit(
    :email, :name, :phone, :subscribed, :business_name,
    :vendor_category, :vendor_application_id,
    :instagram_handle, :tiktok_handle, :website, :note_to_host,
    :location, :producer_notes, tags: []
  )
end
```

### RegistrationSerializer (`app/serializers/api/v1/presents/registration_serializer.rb`)

```ruby
def as_json
  {
    # ... existing fields ...
    location: @registration.location,
    producer_notes: @registration.producer_notes,
    tags: @registration.tags || [],
    # ... rest ...
  }
end
```

### EventInvitationSerializer (`app/serializers/api/v1/presents/event_invitation_serializer.rb`)

**CRITICAL FIX:**

```ruby
# OLD (BROKEN - only returned basic fields)
def vendor_contact_json
  {
    id: @event_invitation.vendor_contact.id,
    name: @event_invitation.vendor_contact.name,
    email: @event_invitation.vendor_contact.email,
    business_name: @event_invitation.vendor_contact.try(:business_name),
    contact_type: @event_invitation.vendor_contact.contact_type
  }
end

# NEW (FIXED - returns all fields via VendorContactSerializer)
def vendor_contact_json
  VendorContactSerializer.new(@event_invitation.vendor_contact).as_json
end
```

This fix ensures tags, notes, location, and all other vendor_contact fields are returned when fetching invitations.

---

## Frontend Implementation

### ApplicantsTab (`src/components/producer/ApplicantsTab.tsx`)

**Smart CRM Merge Logic:**

```typescript
// Fetch data
const invitationsResponse = await eventInvitationsApi.getByEvent(eventSlug, 1, 100)
const invitations = invitationsResponse.invitations || []
const applications = await vendorApplicationsApi.getByEvent(eventSlug)

// Build email map from registrations
const emailMap = new Map<string, Applicant>()
allSubmissions.forEach((submission) => {
  const email = submission.email?.toLowerCase()
  if (!email) return

  emailMap.set(email, {
    ...submission,
    location: submission.location,
    producer_notes: submission.producer_notes,
    tags: submission.tags || [],
  })
})

// Merge vendor_contact data
invitations.forEach((invitation: any) => {
  const contact = invitation.vendor_contact
  if (!contact) return

  const email = contact.email?.toLowerCase()
  if (!email) return

  if (emailMap.has(email)) {
    const existing = emailMap.get(email)!
    existing.source = 'contact'
    existing.is_returning = contact.source === 'returning' || contact.source === 'past_event'

    // Priority: registration > vendor_contact
    existing.producer_notes = existing.producer_notes || contact.notes
    existing.location = existing.location || contact.location
    existing.tags = existing.tags?.length > 0 ? existing.tags : contact.tags || []
    existing.invitationId = invitation.id
  }
})
```

**Display in UI:**

```tsx
{
  /* Top Section - Contact Info */
}
;<div className="glass-card">
  {/* Email, Phone, Location, Applied Date */}
  {selectedApplicant.location && (
    <div>
      <p className="text-[10px] text-foreground/60 mb-1">Location</p>
      <div className="flex items-center gap-1.5 text-xs text-foreground/80">
        <MapPin className="w-3.5 h-3.5" />
        <span>{selectedApplicant.location}</span>
      </div>
    </div>
  )}

  {/* Category dropdown */}

  {/* Tags from Network CRM */}
  {selectedApplicant.tags && selectedApplicant.tags.length > 0 && (
    <div className="mb-3">
      <p className="text-[10px] text-foreground/60 mb-2">Tags</p>
      <div className="flex flex-wrap gap-2">
        {selectedApplicant.tags.map((tag, index) => (
          <span key={index} className="...purple-badge">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )}

  {/* Producer Notes */}
  {selectedApplicant.producer_notes && (
    <div className="mb-3">
      <p className="text-[10px] text-foreground/60 mb-2">Producer Notes</p>
      <div className="px-3 py-2 rounded-lg bg-background/5 border">
        <p className="text-xs text-foreground/80">{selectedApplicant.producer_notes}</p>
      </div>
    </div>
  )}
</div>
```

### EditVendorDetailsModal (`src/components/producer/EditVendorDetailsModal.tsx`)

**Fields:**

```tsx
<Input id="location" value={location} onChange={...} />

<div className="tags-input">
  {tags.map(tag => (
    <span className="tag-badge">
      {tag}
      <button onClick={() => handleRemoveTag(tag)}>
        <X className="w-3 h-3" />
      </button>
    </span>
  ))}
  <Input
    value={tagInput}
    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
  />
</div>

<Textarea
  id="producer_notes"
  value={producerNotes}
  onChange={...}
  placeholder="Internal notes about this vendor..."
/>
```

**Save Handler:**

```typescript
await registrationsApi.update(registrationId, {
  name: name.trim(),
  phone: phone.trim(),
  location: location.trim() || undefined,
  producer_notes: producerNotes.trim() || undefined,
  tags: tags.length > 0 ? tags : undefined,
})

// Update local state
onSaved(applicantId, {
  contact_name: name.trim(),
  phone: phone.trim(),
  location: location.trim(),
  producer_notes: producerNotes.trim(),
  tags: tags,
})
```

---

## API Endpoints

### Get Event Invitations with Vendor Contacts

```
GET /api/v1/presents/events/:event_slug/invitations?page=1&per_page=100
```

**Response:**

```json
{
  "invitations": [
    {
      "id": 39,
      "vendor_contact_id": 79,
      "vendor_contact": {
        "id": 79,
        "name": "Beau Lazear",
        "email": "beaulazear@gmail.com",
        "phone": "7186141878",
        "business_name": "Beaus Animal Care",
        "location": "Brooklyn, NY",
        "notes": "Great vendor, very reliable",
        "tags": ["artist", "reliable"],
        "categories": ["Artists"],
        "instagram_handle": "https://instagram.com/beaus.animal.care",
        "website": "https://beausanimalcare.com"
      }
    }
  ]
}
```

### Get Vendor Submissions

```
GET /api/v1/presents/vendor_applications/:id/submissions
```

**Response:**

```json
[
  {
    "id": 88,
    "name": "Beau Lazear",
    "email": "beaulazear@gmail.com",
    "phone": "7186141878",
    "business_name": "Beaus Animal Care",
    "vendor_category": "Artists",
    "status": "approved",
    "payment_status": "paid",
    "location": "Manhattan, NY",
    "producer_notes": "Confirmed for summer event",
    "tags": ["artist", "reliable", "summer-2026"],
    "created_at": "2026-05-04T11:08:13.657Z"
  }
]
```

### Update Registration

```
PATCH /api/v1/presents/registrations/:id
Content-Type: application/json

{
  "registration": {
    "location": "Manhattan, NY",
    "producer_notes": "Confirmed for summer event",
    "tags": ["artist", "reliable", "summer-2026"]
  }
}
```

**Response:**

```json
{
  "registration": {
    "id": 88,
    "location": "Manhattan, NY",
    "producer_notes": "Confirmed for summer event",
    "tags": ["artist", "reliable", "summer-2026"]
  }
}
```

**Side Effect:** VendorContact #79 is automatically updated with same data via `sync_to_vendor_contact` callback.

---

## Data Flow Sequence

### Scenario: Producer Edits Vendor in "Vendors & Applicants" Tab

```
┌─────────┐        ┌─────────┐        ┌──────────┐        ┌───────────┐
│ Browser │        │ React   │        │ Rails    │        │ Database  │
└────┬────┘        └────┬────┘        └────┬─────┘        └─────┬─────┘
     │                  │                   │                    │
     │ Click "Edit"     │                   │                    │
     │─────────────────>│                   │                    │
     │                  │                   │                    │
     │ EditVendorDetailsModal opens         │                    │
     │ Shows: name, phone, location,        │                    │
     │        tags, producer_notes          │                    │
     │                  │                   │                    │
     │ User edits fields│                   │                    │
     │ Adds tag: "summer-2026"              │                    │
     │ Updates notes    │                   │                    │
     │                  │                   │                    │
     │ Click "Save"     │                   │                    │
     │─────────────────>│                   │                    │
     │                  │                   │                    │
     │                  │ PATCH /registrations/:id              │
     │                  │──────────────────>│                    │
     │                  │                   │                    │
     │                  │                   │ UPDATE registrations│
     │                  │                   │ SET location=...   │
     │                  │                   │     tags=...       │
     │                  │                   │     producer_notes=│
     │                  │                   │───────────────────>│
     │                  │                   │                    │
     │                  │                   │ ✅ Success         │
     │                  │                   │<───────────────────│
     │                  │                   │                    │
     │                  │                   │ after_update callback:
     │                  │                   │ sync_to_vendor_contact()
     │                  │                   │                    │
     │                  │                   │ Find vendor_contact│
     │                  │                   │ by email          │
     │                  │                   │───────────────────>│
     │                  │                   │                    │
     │                  │                   │ UPDATE vendor_contacts
     │                  │                   │ SET location=...   │
     │                  │                   │     tags=...       │
     │                  │                   │     notes=...      │
     │                  │                   │───────────────────>│
     │                  │                   │                    │
     │                  │                   │ ✅ Synced!         │
     │                  │                   │<───────────────────│
     │                  │                   │                    │
     │                  │ 200 OK + JSON     │                    │
     │                  │<──────────────────│                    │
     │                  │                   │                    │
     │ Update local state                   │                    │
     │<─────────────────│                   │                    │
     │                  │                   │                    │
     │ Show toast: "Vendor details updated" │                    │
     │<─────────────────│                   │                    │
     │                  │                   │                    │
     │ UI updates with new data             │                    │
     │                  │                   │                    │

NOW: Go to Network tab → Vendor contact shows updated data! ✅
```

---

## Testing

### Test Case 1: View Vendor with Network Data

1. **Setup:** Add vendor to Network with tags, location, notes
2. **Action:** Vendor applies to event → View in "Vendors & Applicants"
3. **Expected:** See tags, location, notes from Network merged with application

### Test Case 2: Edit Vendor Details

1. **Setup:** Vendor from Network applied to event
2. **Action:** Edit location, tags, notes in "Vendors & Applicants" → Save
3. **Expected:**
   - ✅ Changes visible immediately in "Vendors & Applicants"
   - ✅ Go to Network tab → Same changes visible there
   - ✅ Check database: Both `registrations` and `vendor_contacts` updated

### Test Case 3: Priority (Registration > Network)

1. **Setup:** Network has location="Brooklyn", registration has location=""
2. **Action:** Edit registration location to "Manhattan"
3. **Expected:**
   - ✅ Registration updated: location="Manhattan"
   - ✅ VendorContact synced: location="Manhattan"
   - ✅ Registration data took precedence

### Test Case 4: Tag Management

1. **Action:** Add tag "summer-2026", remove tag "artist"
2. **Expected:**
   - ✅ Tag input works (Enter key, Add button)
   - ✅ Tag removal works (X button)
   - ✅ Changes sync to Network

---

## Troubleshooting

### Issue: Tags not showing up

**Cause:** EventInvitationSerializer was only returning basic fields

**Fix:** Updated to use `VendorContactSerializer.new(@event_invitation.vendor_contact).as_json`

**Verify:**

```bash
# Check API response
curl http://localhost:3000/api/v1/presents/events/:slug/invitations | jq '.invitations[0].vendor_contact.tags'
# Should return: ["artist", "reliable"]
```

### Issue: Edits don't sync to Network

**Cause:** Missing `after_update` callback on Registration model

**Fix:** Added `sync_to_vendor_contact` callback

**Verify:**

```bash
# Check Rails logs
tail -f log/development.log | grep "Synced registration"
# Should see: "Synced registration 88 updates to vendor_contact 79"
```

### Issue: Tags input not working

**Cause:** Missing tag input handlers

**Fix:** Added `handleAddTag`, `handleRemoveTag`, `handleTagInputKeyDown`

**Verify:** Type tag → Press Enter → Should appear as badge with X button

---

## Performance Considerations

### Database Queries

**Before Smart Merge:**

- 1 query for registrations
- N queries for vendor_contacts (N+1 problem)

**After Optimization:**

- 1 query for registrations
- 1 query for invitations (includes vendor_contacts)
- Email-based merge in memory (O(n))

### Caching

- Frontend caches user profile in localStorage
- No additional caching needed for vendor data (real-time updates required)

---

## Future Enhancements

### Potential Improvements

1. **Conflict Resolution UI**
   - Show diff when registration and vendor_contact data conflicts
   - Let producer choose which to keep

2. **Bulk Sync**
   - Sync all registrations → vendor_contacts for an event
   - Useful after importing historical data

3. **Sync History/Audit Log**
   - Track when and what changed during sync
   - Show in UI for transparency

4. **Smart Tag Suggestions**
   - Auto-suggest tags based on category
   - Learn from frequently used tags

5. **Notes Templates**
   - Predefined note templates
   - Quick-select common notes

---

## Related Documentation

- [ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md) - Overall frontend architecture
- [API_CONFIGURATION.md](./API_CONFIGURATION.md) - API endpoint reference
- [VENDOR_CONTACTS_CRM_ANALYSIS.md](../../voxxy-rails/docs/archive/VENDOR_CONTACTS_CRM_ANALYSIS.md) - Backend CRM analysis

---

## Changelog

### 2026-05-04 - Initial Implementation

**Added:**

- `location`, `producer_notes`, `tags` columns to registrations table
- Bidirectional sync via `sync_to_vendor_contact` callback
- Smart CRM merge in ApplicantsTab
- EditVendorDetailsModal with location, tags, notes fields
- EventInvitationSerializer fix to return full vendor_contact data

**Removed:**

- Legacy VendorsTab.tsx (not in use)

**Database Migrations:**

- `20260501125522_add_location_and_producer_notes_to_registrations.rb`
- `20260504115023_add_tags_to_registrations.rb`

**Files Changed:**

- Frontend: `ApplicantsTab.tsx`, `EditVendorDetailsModal.tsx`
- Backend: `Registration.rb`, `RegistrationsController.rb`, `RegistrationSerializer.rb`, `EventInvitationSerializer.rb`

---

## Bug Fixes & Edge Cases

### Critical Bug Fixes (May 4, 2026)

#### 1. Tags Merge Priority Fixed

**Issue:** Tags were unconditionally overwritten with contact tags, violating "prefer registration data" principle.

**Before:**

```typescript
existing.tags = contact.tags || []
```

**After:**

```typescript
existing.tags = existing.tags && existing.tags.length > 0 ? existing.tags : contact.tags || []
```

**Impact:** Registration tags now take priority. Contact tags only used as fallback when registration has no tags.

---

#### 2. Empty String Handling in Sync

**Issue:** Empty strings (`""`) overwrote valid vendor_contact data because Ruby treats `""` as truthy.

**Before:**

```ruby
# This would overwrite vendor_contact.phone with "" if registration.phone = ""
phone: phone.nil? ? vendor_contact.phone : phone
```

**After:**

```ruby
# Using .presence to handle blank values correctly
phone: phone.presence || vendor_contact.phone
```

**Impact:** Empty registration values no longer clear global vendor_contact data. The `.presence` method returns `nil` for blank values, causing fallback to vendor_contact data.

**Behavior Matrix:**

| Registration Value | VendorContact Value | Result                              |
| ------------------ | ------------------- | ----------------------------------- |
| `"555-1234"`       | `"555-9999"`        | `"555-1234"` ✅ (registration wins) |
| `""`               | `"555-9999"`        | `"555-9999"` ✅ (keeps contact)     |
| `nil`              | `"555-9999"`        | `"555-9999"` ✅ (keeps contact)     |
| `["Tag1"]`         | `["Tag2"]`          | `["Tag1"]` ✅ (registration wins)   |
| `[]`               | `["Tag2"]`          | `["Tag2"]` ✅ (keeps contact)       |
| `nil`              | `["Tag2"]`          | `["Tag2"]` ✅ (keeps contact)       |

---

#### 3. Clearing Fields API/State Divergence

**Issue:** Frontend sent `undefined` to API when clearing fields (stripped by JSON.stringify), but updated local state with empty values, causing UI/backend divergence.

**Before:**

```typescript
await registrationsApi.update(registrationId, {
  location: location.trim() || undefined, // undefined gets stripped!
  tags: tags.length > 0 ? tags : undefined,
})
onSaved(applicantId, {
  location: location.trim(), // Empty string sent to UI state
  tags: tags, // Empty array sent to UI state
})
```

**After:**

```typescript
// Send all fields including empty values
await registrationsApi.update(registrationId, {
  location: location.trim(), // Empty string sent to API
  producer_notes: producerNotes.trim(),
  tags: tags,
})
```

**Impact:** UI and backend stay in sync. User can clear fields and values remain cleared after page reload.

---

#### 4. API Backwards Compatibility

**Issue:** VendorContactSerializer changed `name` to `contact_name`, breaking existing frontend code expecting `vendor_contact.name`.

**Before:**

```ruby
{
  contact_name: @vendor_contact.name  # Only this
}
```

**After:**

```ruby
{
  name: @vendor_contact.name,         # Backwards compatible
  contact_name: @vendor_contact.name  # Also included
}
```

**Impact:** Both `vendor_contact.name` and `vendor_contact.contact_name` work, maintaining backwards compatibility.

---

### Edge Cases Handled

#### E1: Empty Registration Fields Don't Clear Global Data

**Scenario:** Producer clears location on event-specific registration.

**Expected Behavior:**

1. Registration location becomes `""` ✅
2. VendorContact location keeps original value (e.g., "San Francisco") ✅
3. UI shows empty location for this event ✅
4. Next event vendor applies to inherits "San Francisco" from VendorContact ✅

**Rationale:** Event-specific empty values represent "not set for this event", not "delete globally".

---

#### E2: Registration Data Overrides Contact Data

**Scenario:** VendorContact has phone "555-1111". Vendor applies with phone "555-2222".

**Expected Behavior:**

1. Registration shows "555-2222" ✅
2. On edit, "555-2222" appears in form ✅
3. If saved without changes, VendorContact phone becomes "555-2222" ✅

**Rationale:** Registration data is event-specific and more recent, so it takes priority.

---

#### E3: Contact Without Registration

**Scenario:** VendorContact invited but hasn't applied yet.

**Expected Behavior:**

1. Shows in "Invited" status ✅
2. Displays contact data (tags, notes, location) ✅
3. No registration-specific fields ✅
4. Can edit contact (goes to Network tab) ✅

---

#### E4: Registration Without Contact

**Scenario:** Vendor applies without being in Network CRM.

**Expected Behavior:**

1. Creates registration ✅
2. Creates VendorContact via `create_or_update_vendor_contact` callback ✅
3. Sync works normally after contact created ✅

---

#### E5: Special Characters in Tags

**Tested:** Tags with special characters: `["Food & Beverage", "20% Discount", "VIP★"]`

**Result:** ✅ Saved and displayed correctly. JSONB handles UTF-8 and special chars.

---

#### E6: Very Long Notes (1000+ characters)

**Result:** ✅ TEXT column handles unlimited length. UI displays in scrollable textarea.

---

### Important Notes

**Why Empty Values Don't Clear:**

The sync is designed for **bidirectional enhancement**, not **destructive updates**:

- **VendorContact** = Global vendor profile (permanent)
- **Registration** = Event-specific snapshot (temporary)

An empty event-specific value means "not provided for this event", NOT "delete from vendor profile".

**Example:**

- Vendor applies to Event A with location "Brooklyn"
- VendorContact.location becomes "Brooklyn"
- Vendor applies to Event B without location
- Event B registration.location = `nil` or `""`
- VendorContact.location stays "Brooklyn" (not cleared!)
- Next vendor applies to Event C → inherits "Brooklyn"

This prevents accidental data loss from incomplete event applications.

---

**End of Documentation**
