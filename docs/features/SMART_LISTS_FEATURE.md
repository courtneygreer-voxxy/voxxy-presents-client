# Smart Lists & Contact Organization Feature

**Status:** ✅ Core UI Complete | 🚧 Event Wizard Integration Pending
**Created:** January 18, 2026
**Last Updated:** January 18, 2026

---

## 📋 Feature Overview

The Smart Lists feature allows producers to organize their vendor contacts into reusable lists for easy event invitations. Lists can be either:

1. **Smart Lists (Dynamic)** - Automatically update based on filters (categories, locations, tags)
2. **Manual Lists (Static)** - Hand-picked contacts that remain fixed

---

## ✅ Completed Work

### Backend (Rails)

#### 1. Database Schema

**File:** `/Users/beaulazear/Desktop/voxxy-rails/db/migrate/20260118190827_create_contact_lists.rb`

```ruby
create_table :contact_lists do |t|
  t.references :organization, null: false, foreign_key: true
  t.string :name, null: false
  t.string :list_type, null: false # 'smart' or 'manual'
  t.text :description
  t.jsonb :filters, default: {}
  t.integer :contact_ids, array: true, default: []
  t.integer :contacts_count, default: 0
  t.datetime :last_used_at
  t.timestamps
end
```

**Indexes:**

- Unique: `organization_id + name`
- Performance: `list_type`, `filters` (GIN index)

#### 2. ContactList Model

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/models/contact_list.rb`

**Key Features:**

- Smart list resolution with OR logic for filters
- Manual list resolution from contact_ids array
- Counter cache support for contacts_count
- Validation for filters (smart lists) and contact_ids (manual lists)

**Smart List Filter Logic:**

```ruby
# Matches ANY selected category/location/tag (OR within filter type)
# AND between different filter types
# Example: (Category A OR Category B) AND (Location X OR Location Y)
```

**Bug Fix Applied:** Changed from AND to OR logic for category/tag matching to align with frontend preview counts.

#### 3. ContactListsController

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/controllers/api/v1/presents/contact_lists_controller.rb`

**Endpoints:**

- `GET /api/v1/presents/organizations/:organization_id/contact_lists` - List all lists
- `POST /api/v1/presents/organizations/:organization_id/contact_lists` - Create list
- `GET /api/v1/presents/contact_lists/:id` - Get list details
- `GET /api/v1/presents/contact_lists/:id/contacts` - Get list contacts (paginated)
- `PATCH /api/v1/presents/contact_lists/:id` - Update list
- `DELETE /api/v1/presents/contact_lists/:id` - Delete list

**Authorization:** Requires venue_owner role + organization ownership

#### 4. Routes

**File:** `/Users/beaulazear/Desktop/voxxy-rails/config/routes.rb`

Added nested routes under `/api/v1/presents/` namespace with organization scoping.

#### 5. Pagination Enhancement

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/controllers/api/v1/presents/vendor_contacts_controller.rb`

**New Features:**

- Pagination support (100 contacts per page)
- `GET /ids` endpoint for "Select All" across pages
- Meta response with pagination info

### Frontend (React + TypeScript)

#### 1. Type Definitions

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/services/api.ts`

```typescript
export interface ContactList {
  id: number
  organization_id: number
  name: string
  description?: string
  list_type: 'smart' | 'manual'
  filters?: {
    categories?: string[]
    locations?: string[]
    tags?: string[]
  }
  contact_ids?: number[]
  contacts_count: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

export interface ContactListsResponse {
  contact_lists: ContactList[]
}
```

#### 2. API Client

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/services/api.ts`

**Methods:**

- `contactListsApi.getAll(organizationId)` - Fetch all lists
- `contactListsApi.getById(listId)` - Get list details
- `contactListsApi.getContacts(listId, page, perPage)` - Get list contacts
- `contactListsApi.create(organizationId, listData)` - Create list
- `contactListsApi.update(listId, listData)` - Update list
- `contactListsApi.delete(listId)` - Delete list
- `vendorContactsApi.getAllIds(organizationId, filters)` - Get all contact IDs for "Select All"

#### 3. UI Components

##### NetworkPage with Tabs

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/components/producer/Network/NetworkPage.tsx`

**Changes:**

- Added "All Contacts" and "Lists" tabs
- Tab switching with gradient active indicator
- Pagination for contacts (100 per page)
- "Select All" across all pages functionality

##### ListsManagement Component

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/components/producer/Network/Lists/ListsManagement.tsx`

**Features:**

- Grid view of all saved lists
- Empty state with helpful list type explanations
- List cards showing:
  - Name, description, type badge
  - Contact count
  - Last used timestamp
  - Smart list filter previews
- Actions: View, Edit, Delete
- Stats summary header

##### CreateListModal Component

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/components/producer/Network/Lists/CreateListModal.tsx`

**Features:**

- Two-step wizard:
  - **Step 1:** Choose list type (Smart vs Manual)
  - **Step 2:** Configure list (name, description, filters/contacts)
- Back navigation between steps
- Validation for required fields
- Sticky footer with cancel/create buttons
- Loading states during creation

##### SmartListBuilder Component

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/components/producer/Network/Lists/SmartListBuilder.tsx`

**Features:**

- Multi-select checkboxes for:
  - Categories (Artist, Food & Beverage, Table Vendor, Sponsor)
  - Locations (all unique cities from contacts)
  - Tags (if available)
- Live preview of matching contact count
- Auto-updates count as filters change
- Fetches available filter options from organization's contacts
- Info banner explaining OR logic

##### ManualListBuilder Component

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/components/producer/Network/Lists/ManualListBuilder.tsx`

**Features:**

- Search by name, business, or email
- Filter by category and location
- Multi-select with checkboxes
- "Select All Visible" functionality
- Shows selection count
- Scrollable contact list with:
  - Contact name (fixed: uses `contact_name` not `name`)
  - Business name
  - Location
  - Categories (first 2, with +N more)
  - Featured badge for Voxxy Cards

##### Pagination Component

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/components/producer/Network/Pagination.tsx`

**Features:**

- Smart page number display (shows ... for large ranges)
- "Showing X to Y of Z contacts" info
- Previous/Next navigation
- Jump to first/last page

---

## 🐛 Bugs Fixed

### 1. Smart List Count Showing 0

**Issue:** Smart lists showed 0 contacts after creation, even though preview showed 28.

**Root Cause:** Backend used AND logic for multiple categories (must match ALL), but frontend preview used OR logic (match ANY).

**Fix:** Updated `ContactList#resolve_smart_list` to use OR logic within each filter type:

```ruby
# OLD (wrong)
filters["categories"].each { |cat| scope = scope.by_category(cat) }

# NEW (correct)
category_conditions = filters["categories"].map { "categories @> ?" }.join(" OR ")
scope = scope.where(category_conditions, *category_values)
```

### 2. Modal Footer Not Visible

**Issue:** "Create List" button hidden on smaller screens.

**Fix:**

- Changed modal height to `max-h-[calc(100vh-4rem)]`
- Made footer sticky with upward shadow
- Added `overflow-y-auto` to modal backdrop

### 3. Empty State Modal Not Opening

**Issue:** Clicking "Create Your First List" did nothing.

**Fix:** Empty state component returned early without rendering modal. Wrapped in fragment and included modal rendering.

### 4. TypeScript Build Errors

**Issue 1:** `fetchContacts` function signature mismatch with onClick handler
**Fix:** Wrapped in arrow function: `onClick={() => fetchContacts()}`

**Issue 2:** VendorContact uses `contact_name` not `name`
**Fix:** Changed property reference in ManualListBuilder from `contact.name` to `contact.contact_name`

---

## 🚧 Remaining Work

### Phase 3: Event Wizard Integration

#### 1. Update Event Wizard Step 3

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/components/producer/CreateEventWizard/InvitationsStep.tsx`

**Requirements:**

- Add "Use Saved List" button/section
- Show all available lists for the organization
- Allow multiple list selection
- Preview combined contact count
- Merge contacts from multiple lists (de-duplicate)
- Maintain existing manual contact selection
- Show which contacts come from which list (optional)

**UI Design:**

```
┌─────────────────────────────────────┐
│ Invite Vendors to Your Event        │
├─────────────────────────────────────┤
│                                     │
│ [Use Saved Lists ▼]                 │
│                                     │
│ ☐ Food Vendors (28 contacts)       │
│ ☐ NYC Artists (15 contacts)        │
│ ☑ Premium Sponsors (8 contacts)    │
│                                     │
│ Selected: 8 contacts from 1 list   │
│                                     │
│ [+ Add Individual Contacts]         │
│ ─── OR ───                          │
│                                     │
│ [Search all contacts...]            │
│                                     │
│ ☐ Exclude specific contacts         │
│   (show only if lists selected)     │
│                                     │
└─────────────────────────────────────┘
```

#### 2. Implement List Selection Logic

**Component:** New `ListSelector.tsx` component

**Features:**

- Fetch organization's lists
- Multi-select with checkboxes
- Show contact count per list
- Calculate total unique contacts
- Handle list expansion to see contacts
- Real-time count updates

#### 3. Implement Contact Merging

**Logic:**

- Fetch contacts from all selected lists
- De-duplicate by contact ID
- Combine with manually selected contacts
- Show total unique count
- Maintain source tracking (which list each contact came from)

#### 4. Add Exclusion Functionality

**Component:** ContactExclusionList.tsx

**Features:**

- Only show when lists are selected
- Display all contacts from selected lists
- Allow unchecking individual contacts to exclude
- Update total count when contacts excluded
- Visual indicator for excluded contacts

#### 5. Update Invitation Sending

**File:** Event creation submission logic

**Changes:**

- Accept contact IDs from lists
- Handle de-duplication
- Update list `last_used_at` timestamp after use
- Send batch invitations as before

### Phase 4: Additional Enhancements

#### 1. View List Modal

**Component:** `ViewListModal.tsx`

**Features:**

- Display all contacts in a list
- Pagination for large lists
- Quick actions (edit, delete, use in event)
- Export list to CSV
- Show list statistics

#### 2. Edit List Modal

**Component:** `EditListModal.tsx`

**Features:**

- Reuse CreateListModal with edit mode
- Pre-populate existing data
- Update instead of create
- Show "last modified" info

#### 3. List Usage Analytics

**Backend Enhancement:**

**Features:**

- Track which events used each list
- Count total invitations sent from list
- Response rate analytics per list
- Popular lists dashboard

#### 4. List Sharing (Future)

**Multi-organization Feature:**

**Features:**

- Share lists between organizations
- Public vendor directory lists
- Import lists from other organizations

---

## 🧪 Testing Checklist

### Backend Tests Needed

- [ ] ContactList model validations
- [ ] Smart list resolution with various filters
- [ ] Manual list resolution
- [ ] ContactListsController authorization
- [ ] CRUD endpoint responses
- [ ] Pagination for list contacts
- [ ] Update contacts_count cache

### Frontend Tests Needed

- [ ] ListsManagement empty state
- [ ] CreateListModal step navigation
- [ ] SmartListBuilder filter selection
- [ ] ManualListBuilder contact selection
- [ ] List creation success flow
- [ ] List deletion confirmation
- [ ] Tab switching in NetworkPage
- [ ] Pagination navigation

### Integration Tests Needed

- [ ] Create smart list → verify count matches
- [ ] Create manual list → verify contacts persisted
- [ ] Update list → verify changes reflected
- [ ] Delete list → verify removed from UI
- [ ] Select multiple categories → verify OR logic
- [ ] Use list in event wizard (once implemented)
- [ ] Send invitations from list (once implemented)

---

## 📊 Data Model Summary

```
Organization (1) ──< (many) ContactList
ContactList (1) ──< (many) VendorContact (through filters or contact_ids)
ContactList (1) ──< (many) Event (through usage tracking)
```

**Storage Strategy:**

- **Smart Lists:** Store filters as JSONB, resolve dynamically
- **Manual Lists:** Store contact_ids as integer array, resolve statically
- **Counter Cache:** contacts_count updated on create/update for manual lists
- **Lazy Count:** Smart lists calculate count on-demand from resolved query

---

## 🎯 Success Metrics

### User Experience Metrics

- Time to create first list: Target < 30 seconds
- Lists created per producer: Target 3-5 lists
- List reuse rate: Target 70%+ of events use saved lists
- Contact management efficiency: Target 50% reduction in manual selection time

### Technical Metrics

- Smart list query performance: Target < 100ms for 1000 contacts
- UI responsiveness: Target < 50ms for filter changes
- Modal load time: Target < 200ms
- Pagination response time: Target < 150ms per page

---

## 🔗 Related Documentation

- [Network/CRM Documentation](../architecture/NETWORK_CRM.md) (if exists)
- [Event Wizard Flow](../architecture/EVENT_WIZARD_FLOW.md) (if exists)
- [API Documentation](../../CLAUDE_CONTEXT.md) - See VendorContact & ContactList sections
- [Database Schema](../../voxxy-rails/db/schema.rb) - contact_lists table

---

## 🗺️ Future Roadmap

### Q1 2026

- ✅ Core list management (DONE)
- 🚧 Event wizard integration (IN PROGRESS)
- 📅 List usage analytics

### Q2 2026

- 📅 CSV export/import for lists
- 📅 List templates (pre-configured smart lists)
- 📅 Bulk edit contacts in list

### Q3 2026

- 📅 List sharing between organizations
- 📅 Public vendor directory integration
- 📅 AI-powered list suggestions

### Q4 2026

- 📅 List performance optimization for 10K+ contacts
- 📅 Advanced filtering (custom fields, date ranges)
- 📅 List versioning and history

---

## 📝 Notes

- Lists are private to each organization (no cross-organization access)
- Smart lists always reflect current data (no caching)
- Manual lists are static snapshots (require manual updates)
- Pagination is client-side managed for simplicity
- Uses existing VendorContact filtering infrastructure
- Compatible with CSV import workflow (contacts auto-available in lists)

---

**Status Summary:**

- ✅ Backend: 100% Complete
- ✅ List Management UI: 100% Complete
- 🚧 Event Wizard Integration: 0% Complete (next phase)
- 📅 Analytics & Enhancements: Planned

**Next Steps:**

1. Update Event Wizard Step 3 to show saved lists
2. Implement multi-list selection
3. Add contact exclusion functionality
4. Test end-to-end invitation flow with lists
