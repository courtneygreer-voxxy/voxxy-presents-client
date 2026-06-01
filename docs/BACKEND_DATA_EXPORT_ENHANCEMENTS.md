# Backend Enhancements: Data Export & Contact-Event Relationships

**Created**: May 22, 2026
**Context**: Justin (Pancakes & Booze) feedback — producers need to connect contacts to shows, filter by event + status, and export cleanly.

---

## Current State (Frontend Prototype)

What we shipped client-side as a prototype:

| Feature | How it works now | Limitation |
|---------|-----------------|------------|
| **Events column on contacts** | Joins `event_history[].event_name` | Works, but event_history runs 1 query per contact on bulk fetch |
| **Show Locations column** | Cross-references `event_history[].event_id` with loaded events to get each event's `location` | Only available in Settings export (where events are co-loaded). Not in Network export. |
| **Filter by specific show** | Network tab dropdown of org events, filters contacts by `event_history[].event_id` | Client-side — loads all contacts then filters. Doesn't scale past ~1000 contacts. |
| **Filter by app status at show** | Filters `event_history[].status` (approved/pending/rejected) | Same client-side limitation. Also `status` on event_history may not always reflect latest state. |
| **Contact location** | Single `location` string field, manually entered | No connection to event locations. Overwritten (not appended) during network sync. |

---

## Backend Enhancements Needed

### Priority 1: Event-scoped contact filtering (API)

**Why**: The "Brooklyn show, approved only" export scenario. Client-side filtering won't scale.

**What to build**:
- Add `event_id` param to `GET /api/v1/presents/organizations/:org_id/vendor_contacts`
- When `event_id` is present, JOIN through `registrations` table (same join `event_history` uses) and return only contacts with a registration for that event
- Add `event_status` param to filter by registration status at that event (approved, pending, rejected, confirmed, waitlist, cancelled)
- Return the matched event's registration status in the response so the frontend doesn't need to re-derive it

**SQL sketch**:
```sql
SELECT DISTINCT vc.*
FROM vendor_contacts vc
JOIN registrations r ON r.email = vc.email
  AND r.event_id = :event_id
  AND r.organization_id = vc.organization_id
WHERE vc.organization_id = :org_id
  AND (:event_status IS NULL OR r.status = :event_status)
```

**Files to modify**:
- `app/controllers/api/v1/presents/vendor_contacts_controller.rb` — add params, update index query
- `app/serializers/api/v1/presents/vendor_contact_serializer.rb` — optionally include matched registration status

---

### Priority 2: Event location on event_history items

**Why**: "Show Locations" column on contacts currently requires loading all events separately and cross-referencing IDs. If event_history included the event's location, the Network export could show it without a second API call.

**What to build**:
- Add `event_location` field to the `event_history` method on `VendorContact` model
- The method already joins `registrations` → `events`, so adding `events.location` is a simple column select

**File to modify**:
- `app/models/vendor_contact.rb` — `event_history` method, add `event.location` to the returned hash

---

### Priority 3: Batch event_history optimization

**Why**: `event_history` currently runs 1 query per contact (`Registration.where(email: self.email)`). On bulk export of 500+ contacts, this is N+1.

**What to build**:
- Add a class method `VendorContact.batch_event_history(contact_ids)` that fetches all registrations for a set of contacts in one query
- Or use `includes`/`preload` on the registrations association
- Update the serializer to use batched data when `include_relations: true` on the index endpoint

**Files to modify**:
- `app/models/vendor_contact.rb` — add batch method
- `app/serializers/api/v1/presents/vendor_contact_serializer.rb` — use batch data when available

---

### Priority 4: Multi-location field on contacts

**Why**: Justin wants to see "Los Angeles, Brooklyn, Chicago" on a contact who has done shows in all three cities. Currently `location` is a single string.

**What to build**:
1. **Schema migration**: `location: string` → keep for backward compat, add `locations: jsonb` (array of strings, default `[]`)
2. **Serializer**: Return both `location` (legacy) and `locations` (new array)
3. **Frontend**: Update `VendorContact` interface, update forms to show multi-select/tag input
4. **Network sync**: When `RegistrationToVendorContactService` syncs a registration → contact, **append** the event's city to `locations` array (deduplicated) instead of overwriting `location`

**Files to modify**:
- Migration: `db/migrate/xxx_add_locations_to_vendor_contacts.rb`
- `app/models/vendor_contact.rb` — locations accessor, validation
- `app/services/registration_to_vendor_contact_service.rb` — append logic
- `app/serializers/api/v1/presents/vendor_contact_serializer.rb` — return `locations`

---

### Priority 5: First name / last name split

**Why**: Justin wants separate first/last name fields for personalized emails and cleaner exports. Currently only `contact_name` (full name) and `business_name`.

**What to build**:
1. **Schema migration**: Add `first_name` and `last_name` columns
2. **Data migration**: Split existing `contact_name` values (best-effort: first word → first_name, rest → last_name)
3. **Update all forms**: Add/edit contact modals, CSV import mapping, registration forms
4. **Serializer**: Return `first_name`, `last_name`, keep `contact_name` as computed fallback
5. **Email templates**: Use `{{first_name}}` in templates

**Files to modify**: Many — this touches the full stack (models, serializers, controllers, frontend forms, CSV import, email templates)

---

## Implementation Order Recommendation

1. **Event-scoped filtering** (Priority 1) — Highest impact, unblocks the key export scenario
2. **Event location on event_history** (Priority 2) — Small change, big UX improvement
3. **Batch event_history** (Priority 3) — Performance, needed before scaling
4. **Multi-location** (Priority 4) — Schema change, coordinate with frontend
5. **First/last name** (Priority 5) — Largest scope, plan carefully

---

## Frontend Changes Ready When Backend Ships

| Backend enhancement | Frontend change needed |
|--------------------|-----------------------|
| Event-scoped filtering | Replace client-side event filter in NetworkPage with API params |
| Event location on event_history | Add "Show Locations" to `EXPORT_COLUMNS` in contactsCsvExport.ts, remove cross-ref hack in FullDataExportModal |
| Batch event_history | None — transparent perf improvement |
| Multi-location | Update `VendorContact` interface, update forms, update location filter to support arrays |
| First/last name | Update `VendorContact` interface, split name fields in forms, update EXPORT_COLUMNS |
