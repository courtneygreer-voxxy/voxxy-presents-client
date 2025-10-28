# Voxxy Presents MVP - Technical Requirements Document

**Version**: 2.0
**Target**: Phase 1 by Friday | Phase 2 over Weekend
**Last Updated**: October 28, 2025
**Prepared By**: Technical Team

---

## 🎯 EXECUTIVE SUMMARY

### Current State
We have an **event organizer platform** with:
- Organization profiles (event organizers hosting events)
- Event management system
- Vendor marketplace (venues, catering, entertainment, market vendors)
- Budget tracking
- Email campaigns
- Registration/subscription system

### Target State (New MVP)
We need a **two-sided marketplace** connecting:
- **Event Producers** → create organizations, post events, discover vendors, review applications
- **Vendors** → browse events, apply to events, collaborate after acceptance

### The Big Pivot
**FROM**: Organization owners create events → public subscribes and RSVPs
**TO**: Producers create organizations → post event needs → vendors discover and apply → collaboration happens

### Complexity Assessment
🟡 **MEDIUM-HIGH** - This is not a simple rebrand. Core conceptual changes required:

**Good News**:
- ✅ 60% of infrastructure can be reused (auth, events, organizations, vendor system)
- ✅ No painful database migration needed (Firestore is schema-less)
- ✅ API architecture supports this model
- ✅ Vendor marketplace foundation is solid

**Bad News**:
- ❌ New data relationships needed (vendor applications, event-vendor matching)
- ❌ Role model needs refactoring (organizer → producer, venue_owner → vendor)
- ❌ Event model shift: Events are now "job postings" with vendor needs
- ❌ Substantial UI/UX changes required
- ❌ Vendor discovery needs to work both ways (browse vendors AND review applications)

---

## 📊 GAP ANALYSIS: Current System vs. New Requirements

### What You Already Have ✅

| Business Requirement | Current System | Status | Notes |
|---------------------|----------------|--------|-------|
| **BR-P-001**: Producer account creation | ✅ User auth exists | REUSABLE | Rename "club_owner" → "producer" |
| **BR-P-002**: Organization profiles | ✅ Organizations exist | REUSABLE | 1:1 relationship already enforced |
| **BR-P-003**: Organization dashboard | ✅ OrganizerDashboard exists | MODIFY | Need to remove public event focus |
| **BR-P-004-006**: Event CRUD | ✅ Full event system exists | REUSABLE | Events already have all required fields |
| **BR-V-001-003**: Vendor accounts | ✅ Vendor system exists | REUSABLE | Already have vendor profiles |
| **BR-V-004-005**: Event discovery | ✅ Vendor marketplace exists | REPURPOSE | Currently for vendor discovery, flip to event discovery |
| **BR-A-001-003**: Admin dashboards | ✅ Admin system exists | EXTEND | Add vendor application moderation |

### What You Need to Build 🔨

| Business Requirement | What's Missing | Complexity | Estimate |
|---------------------|----------------|------------|----------|
| **BR-P-007**: List events to vendor networks | ❌ Event-to-vendor-category mapping | MEDIUM | 6-8 hours |
| **BR-P-008**: Browse/search vendors | ✅ Exists but backwards | LOW | 2-3 hours (UI tweaks) |
| **BR-P-009-017**: Vendor application review | ❌ **ENTIRE APPLICATION SYSTEM** | **HIGH** | **20-30 hours** |
| **BR-P-018-019**: Messaging system | ❌ **ENTIRE MESSAGING SYSTEM** | **HIGH** | **15-20 hours** |
| **BR-P-020**: Run of Show | ❌ Document/timeline system | MEDIUM | 8-10 hours |
| **BR-P-021**: Vendor contact list | ❌ Accepted vendors view | LOW | 2-3 hours |
| **BR-P-022**: Payment tracking | ❌ Payment records system | LOW | 4-6 hours |
| **BR-V-006-008**: Vendor application flow | ❌ **ENTIRE APPLICATION SYSTEM** | **HIGH** | **15-20 hours** |
| **BR-V-009-012**: Event Command Center | ❌ **ENTIRE COLLABORATION HUB** | **HIGH** | **20-25 hours** |
| **BR-V-013**: Vendor reporting | ❌ Vendor-side reporting | LOW | 3-4 hours |
| **BR-A-004-006**: Application moderation | ❌ Report review system | MEDIUM | 6-8 hours |

### Total New Development Estimate
**Phase 1 (MVP Core)**: ~100-130 hours
**Phase 2 (Polish & Edge Cases)**: ~40-50 hours

**Working around the clock**:
- Friday demo: Need to scope down to 30-40 hours of work
- Monday launch: Can hit ~60-80 hours if team works weekend

---

## 🔴 CRITICAL TECHNICAL RISKS

### Risk 1: No Messaging System Exists
**Impact**: HIGH - Required for BR-P-018, BR-P-019, BR-V-011
**Current State**: Campaign emails exist, but no 1:1 messaging
**Options**:
1. **Build from scratch** (15-20 hours) - Custom Firebase messaging
2. **Use third-party** (8-10 hours) - Integrate SendGrid/Twilio
3. **Email-only fallback** (3-4 hours) - "Send Email" button opens mailto:
4. **Phase 2 only** - Skip for Friday demo, add for Monday

**Recommendation**: **Option 3 for Friday, Option 1 for Monday**

### Risk 2: Vendor Application System is Core, Doesn't Exist
**Impact**: CRITICAL - This is the entire product
**Current State**: Zero application infrastructure
**Required Components**:
- VendorApplication data model
- Application submission flow (vendor side)
- Application review interface (producer side)
- Status tracking (pending/accepted/rejected/waitlisted)
- Notifications on status changes

**Recommendation**: **This MUST be in Phase 1 (Friday)**

### Risk 3: Event Command Center is Undefined
**Impact**: HIGH - Required for post-acceptance collaboration
**Current State**: No collaboration workspace exists
**Scope Creep Danger**: Could become feature-bloated
**MVP Definition Needed**: What's the MINIMUM viable command center?

**Recommendation for Friday**:
- Show accepted vendors list
- Show event details
- "Send Email" button (mailto: link)
- Run of Show as simple text field

**Recommendation for Monday**:
- Add file uploads (Run of Show PDF)
- Add in-app messaging
- Add vendor contact export

### Risk 4: Role Refactoring Required ✅ RESOLVED
**Impact**: MEDIUM - Database schema changes
**Current State**:
- Database uses `role: 'organizer'` for event producers
- Database uses `role: 'venue_owner'` for vendors
- Routes use `/club-owner/` terminology

**Decision Made**:
- ✅ Change `role: 'organizer'` → `role: 'producer'`
- ✅ Change `role: 'venue_owner'` → `role: 'vendor'`
- ✅ Routes: `/organization/signup` (not `/producer/signup`)
- ✅ Remove all "club" terminology
- ✅ Build properly as reference for future Rails migration

**Migration Strategy**: Update all existing users in Firestore, update all route references, update all UI labels

### Risk 5: Event Visibility Model ✅ RESOLVED
**Impact**: MEDIUM - Product positioning
**Decision Made**:
- ✅ Events are **public to all vendors** on platform
- ✅ Vendors filter events themselves (not pre-filtered by category)
- ✅ Events are both "public listings" AND "job postings"
- ✅ Producers set budget ranges for whole project

---

## 🗄️ DATABASE SCHEMA CHANGES REQUIRED

### New Collections Needed

#### 1. `vendorApplications` (Critical - Phase 1)
```typescript
interface VendorApplication {
  id: string
  eventId: string              // Links to events collection
  vendorId: string             // Links to vendors collection
  producerId: string           // User who posted the event
  organizationId: string       // Event's organization

  // Application details
  vendorType: 'venue' | 'catering' | 'entertainment' | 'market_vendor'
  message?: string             // Vendor's cover letter
  proposedRate?: number        // Optional bid/quote

  // Status tracking
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'withdrawn'
  statusHistory: Array<{
    status: string
    changedAt: Date
    changedBy: string
    reason?: string
  }>

  // Producer workflow
  producerTags?: string[]      // "Top Choice", "Maybe", "Follow Up"
  producerNotes?: string       // Private notes for producer

  // Timestamps
  appliedAt: Date
  respondedAt?: Date

  // Notifications
  vendorNotified: boolean
  producerNotified: boolean
}
```

**Firebase Path**: `/vendorApplications/{applicationId}`

**Indexes Needed**:
- `eventId` (to get all applications for an event)
- `vendorId` (to get all applications by a vendor)
- `status` (to filter by status)
- Composite: `eventId + status` (fast filtering)
- Composite: `vendorId + status` (vendor dashboard)

#### 2. `eventVendorNeeds` (Optional - Phase 1)
```typescript
interface EventVendorNeeds {
  id: string
  eventId: string
  vendorCategories: Array<{
    type: 'venue' | 'catering' | 'entertainment' | 'market_vendor'
    quantity: number           // How many vendors needed
    budget?: number            // Budget per vendor
    requirements?: string      // Special requirements
    status: 'open' | 'filled' | 'closed'
  }>

  // Visibility
  isPublic: boolean            // Visible to all vendors?
  inviteOnly: boolean          // Only invited vendors can apply?

  createdAt: Date
  updatedAt: Date
}
```

**Firebase Path**: `/events/{eventId}/vendorNeeds` (subcollection)

#### 3. `messages` (Phase 2 - Skip for Friday)
```typescript
interface Message {
  id: string
  threadId: string             // Unique thread identifier

  // Participants
  senderId: string             // User who sent
  recipientId: string          // User who receives

  // Context
  eventId?: string             // If message is about an event
  applicationId?: string       // If message is about an application

  // Content
  subject?: string             // For first message in thread
  body: string
  attachments?: string[]       // URLs to files

  // Status
  read: boolean

  createdAt: Date
}
```

**Firebase Path**: `/messages/{messageId}`

**Indexes Needed**:
- Composite: `threadId + createdAt` (thread history)
- Composite: `recipientId + read` (unread messages)

#### 4. `runOfShow` (Phase 1 - Simple)
```typescript
interface RunOfShow {
  id: string
  eventId: string
  organizationId: string

  // Content (simple for MVP)
  content: string              // Markdown or plain text
  lastUpdatedBy: string        // User ID

  // Access control
  visibleToVendors: string[]   // Array of vendor IDs (accepted vendors only)

  createdAt: Date
  updatedAt: Date
}
```

**Firebase Path**: `/events/{eventId}/runOfShow` (document)

#### 5. `paymentRecords` (Phase 1 - Simple)
```typescript
interface PaymentRecord {
  id: string
  eventId: string
  organizationId: string
  vendorId: string             // Who got paid

  // Payment details
  amount: number
  paymentDate: Date
  paymentMethod: 'cash' | 'check' | 'venmo' | 'paypal' | 'wire' | 'other'
  description?: string

  // Metadata
  recordedBy: string           // User who recorded payment
  recordedAt: Date
}
```

**Firebase Path**: `/events/{eventId}/payments/{paymentId}` (subcollection)

### Existing Collections to Modify

#### `users` Collection - CRITICAL ROLE REFACTORING
```typescript
// CHANGE ROLE ENUM VALUES
interface User {
  id: string
  email: string
  name?: string
  role: 'admin' | 'producer' | 'vendor' | 'user'  // CHANGED: 'organizer' → 'producer', 'venue_owner' → 'vendor'

  // CHANGE: Rename profile objects
  producerProfile?: {                               // CHANGED: from organizationProfile
    organizationId: string                          // 1:1 relationship - one producer owns one organization
    onboardingCompleted: boolean
    approvedAt?: Date
  }

  vendorProfile?: {                                 // CHANGED: from venueOwnerProfile
    vendorIds: string[]                             // Can own multiple vendor listings
    vendorType: 'venue' | 'catering' | 'entertainment' | 'market_vendor'
    businessInfo?: string
    phone?: string
    preferredContactMethod: 'email' | 'phone'
    onboardingCompleted: boolean
    approvedAt?: Date
  }

  // ... existing fields (email, name, etc.)
}
```

**Migration Required**:
- Update all users with `role: 'organizer'` → `role: 'producer'`
- Update all users with `role: 'venue_owner'` → `role: 'vendor'`
- Rename `organizationProfile` → `producerProfile` (if exists)
- Rename `venueOwnerProfile` → `vendorProfile` (if exists)

#### `events` Collection - ADD Fields
```typescript
// ADD THESE FIELDS TO EXISTING EVENT INTERFACE

interface Event {
  // ... existing fields ...

  // NEW: Vendor marketplace fields
  listedToVendorNetwork: boolean           // Is this event posted to vendors?
  vendorApplicationsOpen: boolean          // Accepting applications?
  applicationDeadline?: Date               // When applications close

  // NEW: Budget info (producer sets budget for whole project, visible to vendors)
  projectBudget?: {
    totalBudget: number
    budgetBreakdown?: {
      venue?: number
      catering?: number
      entertainment?: number
      marketVendors?: number
    }
    currency: 'USD'
    notes?: string                         // e.g., "Flexible", "Room for negotiation"
  }
}
```

**Migration**: All existing events default to `listedToVendorNetwork: false`

#### `organizations` Collection - ADD Fields
```typescript
interface Organization {
  // ... existing fields ...

  // NEW: Producer preferences
  savedVendors?: string[]                  // Array of vendor IDs (favorites from browsing)
  blockedVendors?: string[]                // Array of vendor IDs (blocked from applying)
}
```

---

## 🔧 API ENDPOINTS TO BUILD

### Vendor Application Endpoints (Critical - Phase 1)

#### 1. Create Application (Vendor submits)
```
POST /api/events/:eventId/applications
Body: {
  vendorId: string
  message?: string
  proposedRate?: number
}
Response: VendorApplication
```

#### 2. Get Applications for Event (Producer views)
```
GET /api/events/:eventId/applications?status=pending
Response: VendorApplication[]
```

#### 3. Get Vendor's Applications (Vendor views)
```
GET /api/vendors/:vendorId/applications?status=all
Response: VendorApplication[]
```

#### 4. Update Application Status (Producer approves/rejects)
```
PATCH /api/applications/:applicationId
Body: {
  status: 'accepted' | 'rejected' | 'waitlisted'
  reason?: string
  producerNotes?: string
}
Response: VendorApplication
```

#### 5. Add Producer Tags (Producer organizes)
```
PATCH /api/applications/:applicationId/tags
Body: {
  tags: string[]
}
Response: VendorApplication
```

#### 6. Withdraw Application (Vendor withdraws)
```
DELETE /api/applications/:applicationId
Response: { success: boolean }
```

### Event-Vendor Endpoints (Phase 1)

#### 7. List Event to Vendor Network
```
PATCH /api/events/:eventId
Body: {
  listedToVendorNetwork: true
  vendorCategoriesNeeded: ['catering', 'entertainment']
  budgetRange?: { min: number, max: number }
}
Response: Event
```

#### 8. Get Events for Vendor (Browse events to apply to)
```
GET /api/vendors/:vendorId/available-events?category=catering
Response: Event[]
```

#### 9. Get Accepted Vendors for Event (Producer's vendor list)
```
GET /api/events/:eventId/accepted-vendors
Response: Vendor[]
```

### Messaging Endpoints (Phase 2 - Skip for Friday)

#### 10. Send Message
```
POST /api/messages
Body: {
  recipientId: string
  eventId?: string
  subject?: string
  body: string
}
Response: Message
```

#### 11. Get Thread
```
GET /api/messages/thread/:threadId
Response: Message[]
```

### Run of Show Endpoints (Phase 1 - Simple)

#### 12. Create/Update Run of Show
```
PUT /api/events/:eventId/run-of-show
Body: {
  content: string
}
Response: RunOfShow
```

#### 13. Get Run of Show (Vendor views)
```
GET /api/events/:eventId/run-of-show
Response: RunOfShow
```

### Payment Tracking Endpoints (Phase 1 - Simple)

#### 14. Record Payment
```
POST /api/events/:eventId/payments
Body: {
  vendorId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  description?: string
}
Response: PaymentRecord
```

#### 15. Get Event Payments
```
GET /api/events/:eventId/payments
Response: PaymentRecord[]
```

---

## 🎨 UI/UX CHANGES REQUIRED

### Pages to Build (New)

| Page | Route | Purpose | Complexity | Estimate |
|------|-------|---------|------------|----------|
| **Vendor Event Browser** | `/vendors/events` | Vendors browse events to apply | MEDIUM | 8-10h |
| **Vendor Application Form** | `/events/:id/apply` | Vendor submits application | LOW | 3-4h |
| **Vendor Applications Dashboard** | `/vendors/applications` | Vendor sees their applications | MEDIUM | 6-8h |
| **Producer Application Review** | `/events/:id/applications` | Producer reviews applications | HIGH | 12-15h |
| **Event Command Center** | `/events/:id/command-center` | Collaboration hub | HIGH | 15-20h |
| **Run of Show Editor** | `/events/:id/run-of-show` | Create timeline | MEDIUM | 6-8h |

### Pages to Modify (Existing)

| Page | Current Purpose | New Purpose | Changes Needed | Estimate |
|------|----------------|-------------|----------------|----------|
| **OrganizationAdminEnhanced** | Manage club events & subscribers | Manage event postings & vendor applications | Add "Applications" tab, remove subscriber focus | 8-10h |
| **CreateEventPage** | Create public event | Create event + vendor needs | Add "Vendor Needs" section, toggle for vendor network | 4-6h |
| **VendorMarketplace** | Club owners discover vendors | Vendors discover events | Flip UI: show events, not vendors | 6-8h |
| **VendorProfilePage** | Public vendor showcase | Add "Apply" button if vendor logged in | Add application CTA when viewing events | 2-3h |

### Components to Build (New)

| Component | Purpose | Complexity | Estimate |
|-----------|---------|------------|----------|
| **ApplicationCard** | Show application summary (producer view) | MEDIUM | 4-5h |
| **ApplicationStatusBadge** | Visual status indicator | LOW | 1h |
| **ApplicationReviewModal** | Approve/reject/waitlist with notes | MEDIUM | 6-8h |
| **VendorTagManager** | Producer tags applications | LOW | 3-4h |
| **AcceptedVendorsList** | Show all accepted vendors for event | LOW | 3-4h |
| **EventCommandCenterLayout** | Main collaboration hub shell | MEDIUM | 6-8h |
| **RunOfShowEditor** | Simple markdown/text editor | MEDIUM | 5-6h |
| **PaymentRecordForm** | Log manual payments | LOW | 2-3h |
| **PaymentHistoryTable** | Show payment history | LOW | 2-3h |
| **VendorNeedsForm** | Select vendor categories + budget | MEDIUM | 4-5h |
| **EventApplicationsTable** | Sortable/filterable applications | HIGH | 8-10h |

### Existing Components to Modify

| Component | Current Use | Changes Needed | Estimate |
|-----------|-------------|----------------|----------|
| **EventCard** | Show public event | Add "Applications: 12" badge if producer | 2h |
| **EventDetailsView** | Show event to public | Show different view if vendor (with Apply button) | 3-4h |
| **VendorCard** | Show vendor in marketplace | Add "View Events" button instead of "View Profile" | 2h |

---

## 🚨 FEATURES TO CUT/SLIM FOR FRIDAY DEMO

### Current System Waste (Remove Entirely)

| Feature | Why It's Waste | Impact of Removal | Effort Saved |
|---------|----------------|-------------------|--------------|
| **Public Event Calendar** | Events are now job postings, not public calendar | Low - not core to new model | -5h cleanup |
| **RSVP/Registration System** | Vendors apply, they don't RSVP | Medium - confusing if left in | -3h cleanup |
| **Subscriber Management** | Not part of event-vendor model | Low - different use case | Keep (0h) |
| **Ticketing System** | Not needed for vendor marketplace | Low - separate feature | Keep (0h) |
| **Budget Line Items** | Too detailed for MVP | Medium - payment tracking is enough | -8h not building Budget UI |
| **Campaign Emails** | Can use for announcements, but not core | Low - keep for later | Keep (0h) |

**Total Cleanup Effort**: ~8 hours
**Total Saved Development**: ~8 hours (budget UI)

### Phase 1 (Friday Demo) - Must Have

**Goal**: Prove the core loop works

✅ **MUST HAVE** (40-50 hours):
1. Producer creates event, lists to vendor network (6h)
2. Vendor browses events, submits application (10h)
3. Producer reviews applications, approves vendor (15h)
4. Basic Event Command Center (show accepted vendors + contact info) (8h)
5. Simple Run of Show (text field only) (4h)
6. Payment tracking (basic logging) (4h)

❌ **CUT FOR FRIDAY** (defer to Phase 2):
- In-app messaging (use mailto: links instead)
- Advanced filtering/search for events or applications
- File uploads for Run of Show (use text only)
- Vendor tags/notes (just approve/reject)
- Application status history (just current status)
- Notifications (email only, no in-app)
- Reports/analytics
- Vendor saved to private network

**Friday Demo Script**:
1. Producer logs in → creates event → checks "List to Vendor Network" → selects "Catering + Entertainment"
2. Vendor logs in → browses events → sees new event → clicks "Apply" → submits application
3. Producer sees application notification → opens event → reviews application → clicks "Approve"
4. Vendor sees "Accepted" status → opens Event Command Center → sees Run of Show + Producer contact
5. Producer logs payment → vendor sees it in command center

### Phase 2 (Monday Launch) - Nice to Have

**Goal**: Polish and make it production-ready

✅ **ADD OVER WEEKEND** (40-50 hours):
1. In-app messaging system (15h)
2. Producer tags/notes for applications (6h)
3. File upload for Run of Show (8h)
4. Advanced application filtering (status, vendor type) (6h)
5. Email notifications for status changes (6h)
6. Vendor "save to private network" (4h)
7. Reporting/blocking vendors (4h)
8. Admin moderation for reports (6h)

---

## ⚠️ TECHNICAL DEBT & CLEANUP NEEDS

### Before Starting New Features (Blockers)

#### 1. Fix Security Issues (CRITICAL - 2-3 hours)
From TECH_DEBT.md:
- **CORS wide open** - Lock down to specific domains
- **Hardcoded admin key fallback** - Remove from code
- **Firebase config validation** - Add runtime checks

**Why This Blocks You**: If you're working around the clock on this, you WILL be deploying to production. You cannot ship with these security holes.

#### 2. Lock Dependency Versions (1 hour)
From TECH_DEBT.md:
- 20+ packages set to `"latest"`
- Non-deterministic builds
- Risk of breaking changes mid-sprint

**Why This Blocks You**: Imagine deploying Sunday night and a Radix UI update breaks your modals.

#### 3. Add Environment Validation (1 hour)
Current issue: Firebase config has no validation, API keys have no validation

**Why This Blocks You**: You're switching between dev/staging/prod rapidly. One missing env var = silent failure.

### After Launch (Non-Blockers)

#### 1. Remove Dead Features (4-6 hours)
If you're pivoting to vendor marketplace, remove:
- Public event calendar listings (events are now private job postings)
- RSVP flow (vendors apply, not RSVP)
- Presale/Eventbrite integration (not needed)

#### 2. Consolidate Data Sources (8-10 hours)
Current issue: Some data from Firebase, some from API

**Future Problem**: Application system needs consistency. Pick ONE source of truth.

**Recommendation**: Use API for ALL vendor application data, Firebase for real-time messaging only.

#### 3. Add Zod Validation (10-15 hours)
Zod is installed but not used. Add schemas for:
- VendorApplication submission
- Application status updates
- Event vendor needs

**Why It Matters**: Vendors will submit malformed applications if you don't validate.

---

## 📋 PHASE 1 (FRIDAY) - DETAILED TASK BREAKDOWN

### Critical Database Refactoring (6-8 hours) - DO FIRST

- [ ] **User Role Migration** (4-5h)
  - [ ] Create migration script to update all users (1h)
  - [ ] Change `role: 'organizer'` → `role: 'producer'` (1h)
  - [ ] Change `role: 'venue_owner'` → `role: 'vendor'` (1h)
  - [ ] Rename profile objects (organizationProfile → producerProfile, etc.) (1-2h)
  - [ ] Test authentication still works with new roles (1h)

- [ ] **Route & Terminology Cleanup** (2-3h)
  - [ ] Update all routes (`/club-owner/` → `/organization/`, `/venue-owner/` → `/vendor/`) (1h)
  - [ ] Update UI labels (remove "club", use "organization" and "producer") (1-2h)

### Database Setup for New Features (4-6 hours)

- [ ] Create `vendorApplications` collection structure (1h)
- [ ] Add Firestore security rules for applications (2h)
- [ ] Add indexes for `eventId`, `vendorId`, `status` (1h)
- [ ] Create `runOfShow` subcollection in events (1h)
- [ ] Create `paymentRecords` subcollection in events (1h)

### API Endpoints (12-16 hours)

- [ ] POST `/api/events/:eventId/applications` - Submit application (2h)
- [ ] GET `/api/events/:eventId/applications` - Get applications for event (2h)
- [ ] GET `/api/vendors/:vendorId/applications` - Get vendor's applications (2h)
- [ ] PATCH `/api/applications/:applicationId` - Update status (3h)
- [ ] GET `/api/events/:eventId/accepted-vendors` - Get accepted vendors (2h)
- [ ] PUT `/api/events/:eventId/run-of-show` - Update Run of Show (2h)
- [ ] POST `/api/events/:eventId/payments` - Record payment (2h)
- [ ] GET `/api/events/:eventId/payments` - Get payments (1h)

### UI Components (20-25 hours)

- [ ] **VendorEventBrowser** - Browse events to apply (8h)
  - Event cards with "Apply" button
  - Filter by vendor category
  - Show budget range

- [ ] **VendorApplicationForm** - Submit application (3h)
  - Message field (optional)
  - Proposed rate (optional)
  - Submit button

- [ ] **ProducerApplicationReview** - Review applications (12h)
  - List view of applications
  - Application detail modal
  - Approve/Reject/Waitlist buttons
  - Status badges

- [ ] **EventCommandCenter** (Basic) - Collaboration hub (8h)
  - Show event details
  - List accepted vendors with contact info
  - Show Run of Show (read-only for vendors, editable for producer)
  - "Send Email" buttons (mailto: links)
  - Payment history table

- [ ] **RunOfShowEditor** (Simple) - Text editor (4h)
  - Textarea for Run of Show
  - Save button
  - Visible to accepted vendors only

- [ ] **PaymentRecordForm** - Log payments (3h)
  - Vendor dropdown (accepted vendors only)
  - Amount, date, method fields
  - Save button

### Page Integration (8-10 hours)

- [ ] Update **CreateEventPage** - Add "List to Vendor Network" toggle (2h)
- [ ] Update **OrganizationAdminEnhanced** - Add "Applications" tab (3h)
- [ ] Update **VendorMarketplace** - Show events instead of vendors (3h)
- [ ] Create **/events/:id/command-center** route (2h)

### Testing & Bug Fixes (6-8 hours)

- [ ] Test full flow: Create event → Apply → Approve → Command Center (3h)
- [ ] Test edge cases: Withdraw application, reject vendor (2h)
- [ ] Fix inevitable bugs (3h)

**Total Phase 1 Estimate**: 56-73 hours

### Realistic Friday Demo Scope (40-50 hours)

**MUST INCLUDE**:
- ✅ Database role refactoring (6-8h) - Critical for clean codebase
- ✅ Vendor discovery & save favorites (10-12h) - High priority
- ✅ Vendor application flow (15-20h) - Core feature
- ✅ Basic command center (6-8h) - Collaboration MVP

**CUT FOR FRIDAY** (defer to Phase 2):
- ❌ Payment tracking (defer to Phase 2)
- ❌ Run of Show editor (just show event description)
- ❌ Advanced filtering/sorting applications (show all, basic status filter only)
- ❌ In-app messaging (use mailto: links)
- ❌ Email notifications (manual for now)

**Optimized Friday Demo** (40-50 hours):
1. **Database refactoring** (6-8h) - Clean roles, routes, terminology
2. **Vendor discovery** (10-12h) - Browse vendors, filter, save favorites
3. **Vendor application system** (15-20h) - Apply to events, review, approve/reject
4. **Basic command center** (6-8h) - Show accepted vendors, contact info, event details
5. **Security fixes** (3-4h) - CORS, env validation, admin key

---

## 📋 PHASE 2 (WEEKEND) - DETAILED TASK BREAKDOWN

### Messaging System (15-20 hours)

- [ ] Create `messages` collection structure (2h)
- [ ] Build messaging API endpoints (6h)
- [ ] Build MessageThread component (4h)
- [ ] Build MessageComposer component (3h)
- [ ] Integrate into Event Command Center (3h)
- [ ] Add unread message badges (2h)

### Polish & Features (20-25 hours)

- [ ] Producer tags for applications ("Top Choice", "Maybe") (6h)
- [ ] Advanced filtering (status, vendor type, tags) (6h)
- [ ] File uploads for Run of Show (8h)
- [ ] Email notifications (status changes) (6h)
- [ ] Vendor "Save to Private Network" (4h)

### Admin Moderation (6-8 hours)

- [ ] Report vendor/producer flow (3h)
- [ ] Admin review reports page (3h)
- [ ] Block/pause accounts (2h)

### Testing & Deployment (8-10 hours)

- [ ] Full end-to-end testing (4h)
- [ ] Production deployment (2h)
- [ ] Monitor for bugs (4h)

**Total Phase 2 Estimate**: 49-63 hours

---

## 🎯 FINAL RECOMMENDATIONS

### Build Strategy ✅
**Decision Made**: Build properly as reference for future Rails migration
- Write clean, documented code
- Proper database schema refactoring
- No shortcuts that create technical debt
- This codebase will serve as specification for Rails rebuild

### For Friday Demo (Realistic 40-50 hours)

**PRIORITY ORDER**:
1. **Database refactoring** (6-8h) - Foundation for everything else
2. **Security fixes** (3-4h) - Can't ship without these
3. **Vendor discovery** (10-12h) - High value, browse and save vendors
4. **Vendor application system** (15-20h) - Core feature, must work
5. **Basic command center** (6-8h) - Show accepted vendors, contact info

**SKIP FOR FRIDAY**:
- ❌ In-app messaging (use mailto: links)
- ❌ Run of Show editor (just show event description)
- ❌ Payment tracking (manual spreadsheet for now)
- ❌ Producer tags/notes (just approve/reject)
- ❌ Advanced filtering (basic status filter only)
- ❌ Email notifications (manual communication for now)

**DEMO SCRIPT FOR FRIDAY**:
> "We've built the two-sided marketplace. Producers create organizations and post events with budget ranges. Vendors browse all events, filter by their needs, and save favorites. Vendors apply to events. Producers review applications with vendor profile previews and approve/reject. Once accepted, both parties access the Event Command Center to see contact info and coordinate via email."

### For Monday Launch (Add 40-50 hours over weekend)

**ADD OVER WEEKEND**:
1. **In-app messaging system** (15-20h) - Direct communication
2. **Run of Show editor** (6-8h) - Timeline/document sharing
3. **Payment tracking** (6-8h) - Record payments manually
4. **Producer tags/notes** (6h) - Organize applications ("Top Choice", "Maybe")
5. **Advanced filtering** (6h) - Filter applications by status, vendor type
6. **Email notifications** (6h) - Status change notifications
7. **Vendor save/block** (4h) - Save to private network, block from applying

**RESULT**: Full MVP as spec'd in business requirements

### Critical Pre-Work (MUST DO FIRST - 3-4 hours)

**SECURITY BLOCKERS** - Cannot deploy without fixing:
1. ✅ Fix CORS security issue (wide open, allows all origins) (1h)
2. ✅ Remove hardcoded admin key fallback (1h)
3. ✅ Add environment variable validation (1h)
4. ✅ Lock dependency versions (remove "latest" from package.json) (1h)

**Why This Must Be First**: You're deploying to production for a customer demo. These security holes are deployment blockers.

## ✅ CRITICAL DECISIONS (RESOLVED)

All questions have been answered and decisions made:

1. **Event Visibility**: ✅ Events are public to ALL vendors on platform (vendors filter themselves)
2. **Messaging Priority**: ✅ Use mailto: links for Friday demo, build in-app messaging for Phase 2
3. **Vendor Discovery**: ✅ BOTH - producers can browse/save vendors AND review applications
4. **Role Naming**: ✅ Refactor database - change 'organizer' → 'producer', 'venue_owner' → 'vendor'
5. **Budget Model**: ✅ Producers set budget ranges for whole project (no bidding for MVP)

### Data Model: Organization-Producer Relationship ✅

**Scenario A** (Confirmed):
```
Organization "Brooklyn Art Collective"
  └─ Producer User: courtney@example.com (owner, admin)
  └─ Events: [Event 1, Event 2, Event 3]
```

**Key Rules**:
- Sign up flow creates BOTH user account AND organization together
- 1 Organization = 1 Producer (owner)
- No team members for MVP (keep it simple)
- Producer can create multiple events under their one organization

### User Roles (Final) ✅

| Role | Who They Are | What They Can Do |
|------|--------------|------------------|
| **admin** | Platform owners (Voxxy team) | Manage entire site, moderate reports, approve vendors |
| **producer** | Event organizers | Create organization, post events, review vendor applications |
| **vendor** | Service providers | Browse events, apply to events, collaborate after acceptance |
| **user** | Public/guests | View public organization pages, subscribe (no login required) |

### Terminology (Final) ✅

Remove all "club" references:
- ❌ "Club Owner" → ✅ "Producer"
- ❌ "Club" → ✅ "Organization"
- ❌ `/club-owner/signup` → ✅ `/organization/signup`
- ❌ "Venue Owner" → ✅ "Vendor"
- ❌ `/venue-owner/` → ✅ `/vendor/`

---

## 📊 WORK BREAKDOWN SUMMARY

### Total Effort Estimate

| Phase | Scope | Hours | Timeline |
|-------|-------|-------|----------|
| **Pre-Work** | Security fixes, dependency locking | 3-4h | Before everything |
| **Phase 1 (Friday Demo)** | Database refactoring, vendor discovery, applications, basic command center | 40-50h | By Friday |
| **Phase 2 (Monday Launch)** | Messaging, Run of Show, payments, tags, filters, notifications | 40-50h | Over weekend |
| **TOTAL MVP** | Full feature set from business requirements | 83-104h | By Monday |

### Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Security vulnerabilities** | 🔴 CRITICAL | Fix first (3-4h), deployment blocker |
| **Database role refactoring** | 🟡 MEDIUM | Thorough testing after migration (2h) |
| **Vendor application complexity** | 🟡 MEDIUM | Start early, allocate 20h, test thoroughly |
| **Time pressure (working around clock)** | 🟡 MEDIUM | Clear priorities, cut scope if needed |
| **Future Rails migration** | 🟢 LOW | Build clean code, document decisions |

### Success Criteria

**Friday Demo Success** = All 5 of these working:
1. ✅ Producer creates organization and event with budget
2. ✅ Vendor discovers events, browses vendor profiles, saves favorites
3. ✅ Vendor applies to event
4. ✅ Producer reviews application (sees vendor profile preview), approves
5. ✅ Both access Event Command Center, see contact info, can email

**Monday Launch Success** = Friday + all 7 of these:
1. ✅ In-app messaging between producer and vendor
2. ✅ Producer creates Run of Show, vendor views it
3. ✅ Producer records payments, tracks spending
4. ✅ Producer tags applications, adds private notes
5. ✅ Advanced filtering (status, vendor type)
6. ✅ Email notifications on status changes
7. ✅ Producer can save vendors to private network, block vendors

---

## 📞 IMPLEMENTATION PLAN

### Execution Order (Recommended)

**Day 1 (Tuesday)** - Foundation (10-12h):
1. Security fixes (3-4h)
2. Database role refactoring (6-8h)
3. Test everything still works (1h)

**Day 2 (Wednesday)** - Vendor Discovery (12-14h):
1. Vendor discovery UI updates (6-8h)
2. Save/favorite vendors feature (4-5h)
3. API endpoints for vendor browsing (2-3h)

**Day 3 (Thursday)** - Application System (16-20h):
1. Database setup for applications (4-6h)
2. Vendor application flow (6-8h)
3. Producer review interface (8-10h)
4. API endpoints for applications (6-8h)

**Day 4 (Friday Morning)** - Command Center & Testing (8-10h):
1. Basic Event Command Center (6-8h)
2. End-to-end testing (2h)
3. Bug fixes and polish (2h)

**Friday Afternoon** - DEMO READY ✅

**Weekend (Saturday-Sunday)** - Phase 2 Polish (40-50h):
1. In-app messaging (15-20h)
2. Run of Show editor (6-8h)
3. Payment tracking (6-8h)
4. Tags, filters, notifications (12-14h)

**Monday Morning** - LAUNCH READY ✅

---

## 🎯 NEXT STEPS

### Immediate Actions Required

1. ✅ **Approve this technical plan** - Confirm scope and approach
2. ✅ **Prioritize security fixes** - Start with 3-4 hour pre-work
3. ✅ **Begin database refactoring** - Clean up roles and terminology (6-8h)
4. ✅ **Daily check-ins** - Quick syncs to adjust scope if needed

### Questions for Product Owner

All critical questions have been answered. Ready to begin implementation.

**Confirmed decisions documented above:**
- Data model (1 org = 1 producer)
- Role naming (producer, vendor, admin, user)
- Event visibility (public to all vendors)
- Vendor discovery (both browse AND applications)
- Messaging approach (mailto for Friday, in-app for Monday)
- Build quality (proper implementation for Rails migration reference)

---

**Document Status**: ✅ APPROVED FOR IMPLEMENTATION
**Next Update**: After Phase 1 completion (Friday)
**Prepared By**: Technical Team
**Last Reviewed**: October 28, 2025
