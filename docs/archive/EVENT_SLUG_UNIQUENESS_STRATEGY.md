# Event Slug Uniqueness Strategy

## Problem Statement

Events are identified by a URL-friendly "slug" generated from their title. Currently, the backend enforces global uniqueness on slugs across all events in the system. This creates conflicts when:

1. Multiple organizations create events with the same name (e.g., "Art Market", "Spring Show")
2. The same organization runs recurring events (e.g., "Summer Art Fair 2025", "Summer Art Fair 2026")
3. Testing/development creates duplicate event names

**Error Example:**

```json
{ "errors": ["Slug has already been taken"] }
```

## Current State

- Slugs are generated from event titles on the backend (e.g., "Art Market 2025" → "art-market-2025")
- Slugs have a global uniqueness constraint in the database
- Slugs are used in URLs for: event portal, vendor applications, registration pages, etc.
- Frontend has no mechanism to prevent or handle slug collisions

## Short-Term Solution (Method 1): Frontend Timestamp Append

**Timeline:** Implement before go-live (2 days)

**Approach:** Frontend appends a short random string or timestamp to event titles before sending to backend

### Implementation

Add a utility function to generate unique slug suffixes:

```typescript
// src/utils/slugHelpers.ts
export function generateUniqueSuffix(): string {
  // Generate 5-character random string (base36: 0-9, a-z)
  return Math.random().toString(36).substring(2, 7)
}

export function ensureUniqueTitle(title: string): string {
  // Append short suffix to title
  // Backend will slugify this to: "summer-art-fair-2025-x7k9"
  const suffix = generateUniqueSuffix()
  return `${title} ${suffix}`
}
```

Modify event creation in [ProducerDashboard.tsx:209](src/pages/ProducerDashboard.tsx#L209):

```typescript
import { ensureUniqueTitle } from '@/utils/slugHelpers'

// In handleCreateEvent function:
const newEvent = await eventsApi.create(organization.slug, {
  title: ensureUniqueTitle(wizardState.eventDetails.title), // Modified
  description: wizardState.eventDetails.description || undefined,
  // ... rest of fields
})
```

### Pros

- ✅ Zero backend changes required
- ✅ Immediate deployment (hours, not days)
- ✅100% prevents slug collisions
- ✅ No schema migrations needed
- ✅ Works with existing backend validation

### Cons

- ❌ Event titles in database have random suffix (e.g., "Summer Art Fair 2025 x7k9")
- ❌ URLs are slightly less clean: `/events/summer-art-fair-2025-x7k9`
- ❌ Not ideal for user-facing event names
- ❌ Doesn't solve the root architectural issue

### When to Use

- Before go-live with first customer
- During testing/development
- As emergency fallback if scoped slugs aren't ready

---

## Long-Term Solution (Method 4): Scoped Slugs

**Timeline:** Implement after first customer is stable (post-launch)

**Approach:** Slug uniqueness is scoped to organization + year, allowing natural namespacing

### Architecture Changes

#### 1. Database Schema Migration

**Current uniqueness constraint:**

```ruby
# app/models/event.rb (Rails backend)
validates :slug, presence: true, uniqueness: true
```

**New scoped uniqueness constraint:**

```ruby
# app/models/event.rb
validates :slug, presence: true,
  uniqueness: { scope: [:organization_id, :event_year] }

# Add event_year column (extracted from event_date)
before_validation :set_event_year

private

def set_event_year
  self.event_year = event_date.year if event_date.present?
end
```

**Migration:**

```ruby
class AddScopedSlugUniquenessToEvents < ActiveRecord::Migration[7.0]
  def change
    # Add event_year column
    add_column :events, :event_year, :integer

    # Backfill event_year from existing event_date values
    reversible do |dir|
      dir.up do
        Event.where.not(event_date: nil).find_each do |event|
          event.update_column(:event_year, event.event_date.year)
        end
      end
    end

    # Remove old global uniqueness index
    remove_index :events, :slug

    # Add new scoped uniqueness index
    add_index :events, [:organization_id, :event_year, :slug],
              unique: true,
              name: 'index_events_on_org_year_slug'
  end
end
```

#### 2. URL Structure

**Current URLs:**

```
/events/summer-art-fair-2025
/events/spring-show
```

**New scoped URLs (Option A - Flat):**

```
/events/summer-art-fair-2025        # team-voxxy, 2025
/events/summer-art-fair-2025        # another-org, 2025 - ALLOWED
/events/summer-art-fair-2026        # team-voxxy, 2026 - ALLOWED
```

**New scoped URLs (Option B - Hierarchical):**

```
/organizations/team-voxxy/2025/summer-art-fair
/organizations/another-org/2025/summer-art-fair
/organizations/team-voxxy/2026/summer-art-fair
```

**Recommendation:** Use **Option A (Flat URLs)** to maintain backward compatibility. Backend resolves slug by checking organization context.

#### 3. Backend Slug Resolution

Update event lookup to consider organization context:

```ruby
# app/controllers/api/v1/presents/events_controller.rb

def show
  # Current: Event.find_by!(slug: params[:id])

  # New: Scope to organization
  organization = Organization.find_by!(slug: params[:organization_slug])
  @event = organization.events.find_by!(slug: params[:id])

  render json: @event
end
```

#### 4. Frontend Route Handling

No changes needed if using flat URLs - organization context is already available in all event operations.

### Migration Plan

#### Phase 1: Backend Preparation (Week 1 post-launch)

1. Add `event_year` column to events table
2. Backfill `event_year` from `event_date` for existing events
3. Update Event model validations (keep old index temporarily)
4. Deploy to staging
5. Test event creation, updates, lookups

#### Phase 2: Dual-Mode Operation (Week 2)

1. Backend supports both global and scoped slug lookups
2. New events use scoped uniqueness
3. Old events continue to work with global slugs
4. Monitor for any issues

#### Phase 3: Full Migration (Week 3)

1. Remove global uniqueness index
2. Add scoped uniqueness index
3. Update all event lookups to use scoped resolution
4. Deploy to production
5. Verify all existing events still accessible

#### Phase 4: Cleanup (Week 4)

1. Remove dual-mode compatibility code
2. Update API documentation
3. Update frontend error handling
4. Document new slug behavior

### Pros

- ✅ Natural, scalable solution
- ✅ Clean, readable URLs
- ✅ Supports multiple orgs with same event names
- ✅ Supports recurring annual events
- ✅ No random suffixes in titles or URLs
- ✅ Aligns with multi-tenant architecture

### Cons

- ❌ Requires database migration
- ❌ Requires backend code changes
- ❌ Needs careful testing with existing data
- ❌ Takes 2-4 weeks to implement safely
- ❌ Risk during migration if not done carefully

### Dependencies

**Backend Changes Required:**

- [ ] Add `event_year` column to `events` table
- [ ] Update Event model validations
- [ ] Modify slug generation logic
- [ ] Update event lookup/resolution logic
- [ ] Update all event-related controllers
- [ ] Write comprehensive tests for scoped lookups

**Frontend Changes Required:**

- [ ] Remove short-term random suffix logic
- [ ] Update error handling for slug collisions (should be rare now)
- [ ] Update documentation/help text

**Infrastructure:**

- [ ] Database migration (requires downtime or careful zero-downtime strategy)
- [ ] Staging environment testing
- [ ] Production deployment coordination

---

## Decision Matrix

| Scenario                          | Recommended Approach                         |
| --------------------------------- | -------------------------------------------- |
| Before go-live (next 2 days)      | **Method 1** (Frontend timestamp)            |
| During first customer onboarding  | **Method 1** (Frontend timestamp)            |
| After first customer is stable    | **Start Method 4 planning**                  |
| Before second customer onboarding | **Method 4** (Scoped slugs) must be complete |
| Multiple active customers         | **Method 4** (Scoped slugs) required         |

---

## Testing Strategy

### Short-Term (Method 1)

1. Create multiple events with identical base names
2. Verify each gets unique slug
3. Verify all event operations work correctly
4. Test URL accessibility for all events
5. Verify no collisions in rapid succession

### Long-Term (Method 4)

1. **Scoped Uniqueness:**
   - Same org, same year, same title → Collision (expected)
   - Same org, different year, same title → Success
   - Different org, same year, same title → Success

2. **Event Lookups:**
   - Verify correct event returned when multiple orgs have same slug
   - Verify year scoping works correctly
   - Test edge cases (no event_date, null year, etc.)

3. **Migration Safety:**
   - Test with production data snapshot
   - Verify all existing events remain accessible
   - Test rollback procedures
   - Verify no broken links

---

## Rollback Plans

### Method 1 Rollback

Simply remove the `ensureUniqueTitle()` call - immediate rollback with no data issues.

### Method 4 Rollback

1. Keep global uniqueness index during phase 2
2. If issues arise, revert to global slug lookups
3. Database schema changes are harder to rollback - plan carefully
4. Ensure backups before migration

---

## Cost-Benefit Analysis

### Method 1 (Short-Term)

- **Development Time:** 1-2 hours
- **Testing Time:** 1 hour
- **Deployment Risk:** Very low
- **User Impact:** Minimal (slightly uglier URLs)
- **Technical Debt:** Medium (must migrate later)

### Method 4 (Long-Term)

- **Development Time:** 2-3 days backend + 1 day frontend
- **Testing Time:** 1 week (includes staging validation)
- **Deployment Risk:** Medium (database migration)
- **User Impact:** None (URLs actually improve)
- **Technical Debt:** Zero (proper solution)

---

## Recommendations

1. **Immediately (Before Go-Live):**
   - Implement Method 1 (frontend timestamp append)
   - Document the technical debt
   - Set reminder to revisit after first customer is stable

2. **Post-Launch (After 2-4 Weeks):**
   - Begin Method 4 implementation
   - Test thoroughly in staging
   - Coordinate deployment with customer (minimal impact)

3. **Before Second Customer:**
   - Method 4 **must** be complete
   - Cannot have global slug collisions across orgs

---

## Related Documentation

- Backend Repository: `/Users/courtneygreer/Development/voxxy-rails-react`
- Event Creation Flow: [ProducerDashboard.tsx](../src/pages/ProducerDashboard.tsx)
- Event Model: `voxxy-rails-react/app/models/event.rb`
- Events API: [api.ts](../src/services/api.ts)

---

## Questions for Future Discussion

1. Should event_year be user-editable or always derived from event_date?
2. What happens if an event spans multiple years (Dec 31 to Jan 1)?
3. Should we support custom slugs (user-defined) in the future?
4. How do we handle slug changes if event_date changes?
5. Do we need slug history/redirects for SEO purposes?

---

**Document Status:** Draft
**Created:** 2026-02-03
**Last Updated:** 2026-02-03
**Owner:** Engineering Team
**Review Date:** After first customer go-live
