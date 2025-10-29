# Voxxy Presents MVP - Technical Requirements Document

**Version**: 3.0 (Updated Post-Phase 0)
**Target**: Phase 1 by Friday | Phase 2 over Weekend
**Last Updated**: October 28, 2025, 10:50 PM
**Status**: Phase 0 Complete ✅ | Phase 1 Ready to Start

---

## 🎯 EXECUTIVE SUMMARY

### Current State
We have an **event organizer platform** with:
- Organization profiles (event organizers hosting events)
- Event management system
- Vendor marketplace (venues, catering, entertainment, market vendors)
- Budget tracking, email campaigns, registration/subscription system
- ✅ **NEW**: Security hardened (CORS locked down, env validation, dependencies locked)

### Target State (New MVP)
We need a **two-sided marketplace** connecting:
- **Producers** → create organizations, post events, discover vendors, review applications
- **Vendors** → browse events, apply to events, collaborate after acceptance

### The Big Pivot
**FROM**: Organization owners create events → public subscribes and RSVPs
**TO**: Producers create organizations → post event needs → vendors discover and apply → collaboration happens

### Complexity Assessment
🟡 **MEDIUM** (reduced from MEDIUM-HIGH after Phase 0)

**Good News** ✅:
- 60% of infrastructure can be reused (auth, events, organizations, vendor system)
- No painful database migration needed (Firestore is schema-less)
- API architecture supports this model
- Vendor marketplace foundation is solid
- **Phase 0 complete**: Security vulnerabilities fixed, codebase clean

**Challenges** ❌:
- New data relationships needed (vendor applications, event-vendor matching)
- Role model needs refactoring (organizer → producer, venue_owner → vendor)
- Event model shift: Events are now "job postings" with vendor needs
- Substantial UI/UX changes required
- Vendor discovery needs to work both ways (browse vendors AND review applications)

---

## 📊 WORK BREAKDOWN SUMMARY

### Total Effort Estimate (Updated)

| Phase | Scope | Hours | Timeline | Status |
|-------|-------|-------|----------|--------|
| **Phase 0** | Security fixes, dependency locking | 3-4h | ~~Before everything~~ | ✅ **COMPLETE** |
| **Phase 1 (Friday)** | Database refactoring, vendor discovery, applications, basic command center | 40-50h | By Friday | 🔜 **NEXT** |
| **Phase 2 (Monday)** | Messaging, Run of Show, payments, tags, filters, notifications | 40-50h | Over weekend | ⏳ Pending |
| **TOTAL MVP** | Full feature set from business requirements | **83-104h** | By Monday | In Progress |

### Phase 0 Completion Summary ✅

**Completed**: October 28, 2025, 10:45 PM

**Security Fixes Applied**:
1. ✅ Fixed CORS (whitelist only, no wildcard origin)
2. ✅ Removed hardcoded admin key fallback
3. ✅ Added environment variable validation on startup
4. ✅ Locked all 33 "latest" dependencies to specific versions

**Commits**:
- API: `6902f34` - CORS + env validation
- Client: `8439403` - Admin key + dependency locking + env validation

**Status**: Both deployed to production, API verified healthy

---

## ✅ CRITICAL DECISIONS (RESOLVED)

All questions have been answered and confirmed:

### 1. Event Visibility ✅
**Decision**: Events are public to ALL vendors on platform (vendors filter themselves)
- No pre-filtering by category
- Vendors browse all events and apply to relevant ones
- Producers see applications from all vendor types

### 2. Messaging Priority ✅
**Decision**: Use `mailto:` links for Friday demo, build in-app messaging for Phase 2
- Friday: Simple email links (external email client)
- Monday: Full in-app messaging system

### 3. Vendor Discovery ✅
**Decision**: BOTH - producers can browse/save vendors AND review applications
- Producers proactively browse vendor marketplace, save favorites
- Producers reactively review applications from vendors
- Two-way discovery model

### 4. Role Naming ✅
**Decision**: Refactor database - change 'organizer' → 'producer', 'venue_owner' → 'vendor'
- Not just UI labels - actual database schema change
- Clean terminology for future Rails migration
- Remove all "club" references

### 5. Budget Model ✅
**Decision**: Producers set budget ranges for whole project (no bidding for MVP)
- Producers define total budget + optional breakdown
- Vendors see budget range when browsing events
- No vendor bidding/quotes in Phase 1 (maybe Phase 2)

---

## 📐 DATA MODEL ARCHITECTURE

### Organization-Producer Relationship ✅

**Model A** (Confirmed):
```
Organization "Brooklyn Art Collective"
  └─ Producer User: courtney@example.com (owner, admin)
  └─ Events: [Event 1, Event 2, Event 3]
```

**Key Rules**:
- Sign up flow creates BOTH user account AND organization together
- **1 Organization = 1 Producer** (owner)
- No team members for MVP (keep it simple)
- Producer can create multiple events under their one organization
- Organization and Producer are conceptually the same entity

### User Roles (Final) ✅

| Role | Who They Are | What They Can Do |
|------|--------------|------------------|
| **admin** | Platform owners (Voxxy team) | Manage entire site, moderate reports, approve vendors |
| **producer** | Event organizers | Create organization, post events, review vendor applications |
| **vendor** | Service providers | Browse events, apply to events, collaborate after acceptance |
| **user** | Public/guests | View public organization pages, subscribe (no login required) |

### Terminology Changes (Final) ✅

**Database & UI Changes**:
- ❌ `role: 'organizer'` → ✅ `role: 'producer'`
- ❌ `role: 'venue_owner'` → ✅ `role: 'vendor'`
- ❌ "Club Owner" → ✅ "Producer"
- ❌ "Club" → ✅ "Organization"
- ❌ `/club-owner/signup` → ✅ `/organization/signup`
- ❌ "Venue Owner" → ✅ "Vendor"
- ❌ `/venue-owner/` → ✅ `/vendor/`

---

## 🗄️ DATABASE SCHEMA CHANGES REQUIRED

### New Collections Needed

#### 1. `vendorApplications` (Critical - Phase 1)

**Firebase Path**: `/vendorApplications/{applicationId}`

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
  proposedRate?: number        // Optional bid/quote (Phase 2)

  // Status tracking
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'withdrawn'
  statusHistory: Array<{
    status: string
    changedAt: Date
    changedBy: string
    reason?: string
  }>

  // Producer workflow (Phase 2)
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

**Firestore Indexes Needed**:
- `eventId` (to get all applications for an event)
- `vendorId` (to get all applications by a vendor)
- `status` (to filter by status)
- Composite: `eventId + status` (fast filtering)
- Composite: `vendorId + status` (vendor dashboard)

#### 2. `messages` (Phase 2 - Skip for Friday)

**Firebase Path**: `/messages/{messageId}`

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

**Firestore Indexes Needed**:
- Composite: `threadId + createdAt` (thread history)
- Composite: `recipientId + read` (unread messages)

#### 3. `runOfShow` (Phase 1 - Simple Text Only)

**Firebase Path**: `/events/{eventId}/runOfShow` (document, not collection)

```typescript
interface RunOfShow {
  id: string
  eventId: string
  organizationId: string

  // Content (simple for MVP)
  content: string              // Plain text or markdown
  lastUpdatedBy: string        // User ID

  // Access control
  visibleToVendors: string[]   // Array of vendor IDs (accepted vendors only)

  createdAt: Date
  updatedAt: Date
}
```

#### 4. `paymentRecords` (Phase 2 - Skip for Friday)

**Firebase Path**: `/events/{eventId}/payments/{paymentId}` (subcollection)

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

### Existing Collections to Modify

#### `users` Collection - CRITICAL ROLE REFACTORING

**Changes Required**:

```typescript
interface User {
  id: string
  email: string
  name?: string
  role: 'admin' | 'producer' | 'vendor' | 'user'  // CHANGED: rename roles

  // CHANGED: Rename profile objects
  producerProfile?: {                               // CHANGED from organizationProfile
    organizationId: string                          // 1:1 relationship
    onboardingCompleted: boolean
    approvedAt?: Date
  }

  vendorProfile?: {                                 // CHANGED from venueOwnerProfile
    vendorIds: string[]                             // Can own multiple vendor listings
    vendorType: 'venue' | 'catering' | 'entertainment' | 'market_vendor'
    businessInfo?: string
    phone?: string
    preferredContactMethod: 'email' | 'phone'
    onboardingCompleted: boolean
    approvedAt?: Date
  }

  // ... existing fields (createdAt, updatedAt, etc.)
}
```

**Migration Script Required**:
```typescript
// Migrate all existing users
- Update `role: 'organizer'` → `role: 'producer'`
- Update `role: 'venue_owner'` → `role: 'vendor'`
- Rename `organizationProfile` → `producerProfile` (if exists)
- Rename `venueOwnerProfile` → `vendorProfile` (if exists)
```

#### `events` Collection - ADD Fields

**Changes Required**:

```typescript
interface Event {
  // ... existing fields (title, date, location, etc.) ...

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

**Changes Required**:

```typescript
interface Organization {
  // ... existing fields (name, slug, description, etc.) ...

  // NEW: Producer preferences
  savedVendors?: string[]                  // Array of vendor IDs (favorites from browsing)
  blockedVendors?: string[]                // Array of vendor IDs (blocked from applying)
}
```

---

## 🔧 API ENDPOINTS TO BUILD

### Vendor Application Endpoints (Critical - Phase 1)

#### 1. Submit Application (Vendor)
```
POST /api/events/:eventId/applications
Auth: Required (vendor)

Body: {
  vendorId: string
  message?: string
  proposedRate?: number
}

Response: VendorApplication
```

#### 2. Get Applications for Event (Producer)
```
GET /api/events/:eventId/applications?status=pending
Auth: Required (producer)

Response: VendorApplication[]
```

#### 3. Get Vendor's Applications (Vendor Dashboard)
```
GET /api/vendors/:vendorId/applications?status=all
Auth: Required (vendor)

Response: VendorApplication[]
```

#### 4. Update Application Status (Producer Approves/Rejects)
```
PATCH /api/applications/:applicationId
Auth: Required (producer)

Body: {
  status: 'accepted' | 'rejected' | 'waitlisted'
  reason?: string
  producerNotes?: string
}

Response: VendorApplication
```

#### 5. Add Producer Tags (Phase 2)
```
PATCH /api/applications/:applicationId/tags
Auth: Required (producer)

Body: {
  tags: string[]
}

Response: VendorApplication
```

#### 6. Withdraw Application (Vendor)
```
DELETE /api/applications/:applicationId
Auth: Required (vendor)

Response: { success: boolean }
```

### Event-Vendor Endpoints (Phase 1)

#### 7. List Event to Vendor Network (Producer)
```
PATCH /api/events/:eventId
Auth: Required (producer)

Body: {
  listedToVendorNetwork: true
  vendorApplicationsOpen: true
  projectBudget?: { totalBudget: number, ... }
}

Response: Event
```

#### 8. Browse Events (Vendor Discovery)
```
GET /api/vendors/:vendorId/available-events?category=catering
Auth: Optional (public browse, auth for apply)

Response: Event[]
```

#### 9. Get Accepted Vendors (Producer's Team View)
```
GET /api/events/:eventId/accepted-vendors
Auth: Required (producer)

Response: Vendor[]
```

### Messaging Endpoints (Phase 2 - Skip for Friday)

#### 10. Send Message
```
POST /api/messages
Auth: Required

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
Auth: Required

Response: Message[]
```

### Run of Show Endpoints (Phase 1 - Simple)

#### 12. Create/Update Run of Show
```
PUT /api/events/:eventId/run-of-show
Auth: Required (producer)

Body: {
  content: string
}

Response: RunOfShow
```

#### 13. Get Run of Show (Vendor Views)
```
GET /api/events/:eventId/run-of-show
Auth: Required (accepted vendor or producer)

Response: RunOfShow
```

### Payment Tracking Endpoints (Phase 2)

#### 14. Record Payment
```
POST /api/events/:eventId/payments
Auth: Required (producer)

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
Auth: Required (producer)

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
| **Run of Show Editor** | `/events/:id/run-of-show` | Create timeline (Phase 2) | MEDIUM | 6-8h |

### Components to Build (New)

**Phase 1 (Friday)**:
- `ApplicationCard` - Show application summary in list
- `ApplicationStatusBadge` - Visual status indicator (pending/accepted/rejected)
- `ApplicationReviewModal` - Approve/reject/waitlist interface
- `AcceptedVendorsList` - Show all accepted vendors for event
- `EventCommandCenterLayout` - Collaboration hub shell
- `VendorNeedsForm` - Select vendor categories + budget when creating event
- `EventApplicationsTable` - Sortable/filterable applications list

**Phase 2 (Monday)**:
- `VendorTagManager` - Producer tags applications ("Top Choice", "Maybe")
- `RunOfShowEditor` - Markdown/text editor
- `PaymentRecordForm` - Log manual payments
- `PaymentHistoryTable` - Show payment history
- `MessageThread` - In-app messaging component
- `MessageComposer` - Send message interface

### Existing Components to Modify

| Component | Current Use | Changes Needed | Estimate |
|-----------|-------------|----------------|----------|
| **EventCard** | Show public event | Add "Applications: 12" badge if producer | 2h |
| **EventDetailsView** | Show event to public | Show different view if vendor (with Apply button) | 3-4h |
| **VendorCard** | Show vendor in marketplace | Add "View Events" button for vendors to browse | 2h |
| **CreateEventPage** | Create event form | Add "Vendor Needs" section (categories + budget) | 4-6h |
| **OrganizationAdminEnhanced** | Manage events & subscribers | Add "Applications" tab | 8-10h |

---

## 🎯 IMPLEMENTATION PLAN (UPDATED)

### Phase 0: Security Fixes ✅ COMPLETE

**Timeline**: October 28, 2025, 8:00 PM - 10:45 PM (2.75 hours)

**Completed Tasks**:
- [x] Fixed CORS security (whitelist only)
- [x] Removed hardcoded admin key fallback
- [x] Added environment variable validation (client & API)
- [x] Locked all dependency versions (33 packages)
- [x] Deployed to production (both repos)

**Status**: ✅ Production verified, builds successful

---

### Phase 1: Core Marketplace (Friday Demo)

**Goal**: Prove the core two-sided marketplace works

**Timeline**: Tuesday-Friday (40-50 hours)

**Priority Order**:

#### Day 1 (Tuesday) - Foundation (10-12h)

1. **Database Role Refactoring** (6-8h)
   - [ ] Create migration script to update all users
   - [ ] Change `role: 'organizer'` → `role: 'producer'`
   - [ ] Change `role: 'venue_owner'` → `role: 'vendor'`
   - [ ] Rename profile objects (organizationProfile → producerProfile, etc.)
   - [ ] Update all route references (`/club-owner/` → `/organization/`)
   - [ ] Update UI labels (remove "club", use "organization" and "producer")
   - [ ] Test authentication still works with new roles

2. **Verify Everything Still Works** (2h)
   - [ ] Local testing (client + API)
   - [ ] Deploy to staging if available, or directly to main
   - [ ] Smoke test production

#### Day 2 (Wednesday) - Vendor Discovery (12-14h)

3. **Vendor Discovery UI** (6-8h)
   - [ ] Update vendor marketplace to show browse/save features
   - [ ] Add "Save Vendor" button to vendor profiles
   - [ ] Create "Saved Vendors" list view for producers
   - [ ] Add vendor filtering by type

4. **Vendor Discovery API** (4-5h)
   - [ ] Add `savedVendors[]` to organizations collection
   - [ ] Create API endpoint: `POST /api/organizations/:id/save-vendor`
   - [ ] Create API endpoint: `GET /api/organizations/:id/saved-vendors`

5. **Test Vendor Discovery** (2-3h)
   - [ ] Producer can browse vendors
   - [ ] Producer can save/unsave vendors
   - [ ] Saved vendors persist and display correctly

#### Day 3 (Thursday) - Application System (16-20h)

6. **Database Setup for Applications** (4-6h)
   - [ ] Create `vendorApplications` collection structure
   - [ ] Add Firestore security rules for applications
   - [ ] Add Firestore indexes (eventId, vendorId, status)
   - [ ] Add `listedToVendorNetwork` and `projectBudget` fields to events
   - [ ] Create test application data

7. **Vendor Application Flow** (6-8h)
   - [ ] Create Vendor Event Browser page (`/vendors/events`)
   - [ ] Create Application Form modal/page
   - [ ] Create Vendor Applications Dashboard (`/vendors/applications`)
   - [ ] Show application status (pending/accepted/rejected)

8. **Producer Application Review** (8-10h)
   - [ ] Create Application Review page (`/events/:id/applications`)
   - [ ] Build ApplicationCard component
   - [ ] Build ApplicationReviewModal (approve/reject/waitlist)
   - [ ] Update OrganizationAdminEnhanced with Applications tab

9. **Application API Endpoints** (6-8h)
   - [ ] POST `/api/events/:eventId/applications` (submit)
   - [ ] GET `/api/events/:eventId/applications` (get for event)
   - [ ] GET `/api/vendors/:vendorId/applications` (get for vendor)
   - [ ] PATCH `/api/applications/:applicationId` (update status)
   - [ ] DELETE `/api/applications/:applicationId` (withdraw)

#### Day 4 (Friday Morning) - Command Center & Testing (8-10h)

10. **Basic Event Command Center** (6-8h)
    - [ ] Create Event Command Center page (`/events/:id/command-center`)
    - [ ] Show event details
    - [ ] List accepted vendors with contact info
    - [ ] Add "Email Vendor" buttons (mailto: links)
    - [ ] Show Run of Show (simple text field, editable by producer only)

11. **End-to-End Testing** (2h)
    - [ ] Producer creates event, lists to vendor network
    - [ ] Vendor browses events, submits application
    - [ ] Producer reviews application, approves vendor
    - [ ] Both access command center, see contact info
    - [ ] Test email links work

12. **Bug Fixes & Polish** (2h)
    - [ ] Fix inevitable bugs found during testing
    - [ ] Polish UI/UX rough edges
    - [ ] Prepare demo script

**Friday Afternoon** - 🎉 **DEMO READY**

**Demo Script**:
> "We've built the two-sided marketplace. Producers create organizations and post events with budget ranges. Vendors browse all events, filter by their needs, and save favorites. Vendors apply to events. Producers review applications with vendor profile previews and approve/reject. Once accepted, both parties access the Event Command Center to see contact info and coordinate via email."

**Success Criteria** (5/5 required):
1. ✅ Producer creates organization and event with budget
2. ✅ Vendor discovers events, browses vendor profiles, saves favorites
3. ✅ Vendor applies to event
4. ✅ Producer reviews application (sees vendor profile preview), approves
5. ✅ Both access Event Command Center, see contact info, can email

---

### Phase 2: Polish & Launch (Monday)

**Goal**: Production-ready marketplace with all features

**Timeline**: Weekend (Saturday-Sunday, 40-50 hours)

**Add Over Weekend**:

#### Messaging System (15-20h)
- [ ] Create `messages` collection structure
- [ ] Build messaging API endpoints
- [ ] Build MessageThread component
- [ ] Build MessageComposer component
- [ ] Integrate into Event Command Center
- [ ] Add unread message badges

#### Run of Show Editor (6-8h)
- [ ] Upgrade from simple text to rich editor
- [ ] Add file upload support for PDFs
- [ ] Build RunOfShowEditor component
- [ ] Make read-only for vendors, editable for producers

#### Payment Tracking (6-8h)
- [ ] Create `paymentRecords` collection
- [ ] Build PaymentRecordForm component
- [ ] Build PaymentHistoryTable component
- [ ] Add to Event Command Center
- [ ] Manual payment logging only (no actual payment processing)

#### Producer Tags & Notes (6h)
- [ ] Add `producerTags` and `producerNotes` to applications
- [ ] Build VendorTagManager component
- [ ] Add tag filtering to application list
- [ ] Private notes interface

#### Advanced Filtering (6h)
- [ ] Add status filtering (pending/accepted/rejected)
- [ ] Add vendor type filtering
- [ ] Add search by vendor name
- [ ] Sortable columns

#### Email Notifications (6h)
- [ ] Send email when application status changes
- [ ] Send email when producer sends message
- [ ] Use existing SendGrid integration
- [ ] Email templates for each notification type

#### Vendor Save/Block (4h)
- [ ] Add block vendor feature
- [ ] Blocked vendors can't apply to producer's events
- [ ] Producer can unblock vendors
- [ ] UI indication when vendor is blocked

**Monday Morning** - 🚀 **LAUNCH READY**

**Success Criteria** (7/7 required):
1. ✅ In-app messaging between producer and vendor
2. ✅ Producer creates Run of Show, vendor views it
3. ✅ Producer records payments, tracks spending
4. ✅ Producer tags applications, adds private notes
5. ✅ Advanced filtering (status, vendor type)
6. ✅ Email notifications on status changes
7. ✅ Producer can save vendors to private network, block vendors

---

## 🚨 TECHNICAL RISKS & MITIGATION

### Risk 1: Database Role Migration Breaks Auth
**Impact**: HIGH - Users can't log in
**Mitigation**:
- Test migration script locally first
- Backup Firestore data before migration
- Keep old and new fields temporarily
- Gradual migration with rollback plan

### Risk 2: Application System Too Complex for Friday
**Impact**: MEDIUM - Demo not ready
**Mitigation**:
- Start application system on Day 2 (Wednesday)
- Allocate full day Thursday + Friday morning
- Cut features if needed (tags, notes can be Phase 2)
- Simplify UI to basic approve/reject only

### Risk 3: Vendor Discovery Confusing UX
**Impact**: MEDIUM - Poor user experience
**Mitigation**:
- Clear UI distinction between "Browse Vendors" and "Review Applications"
- User testing with real vendors
- Tooltips and help text
- Simple onboarding for new users

### Risk 4: Event Command Center Feature Creep
**Impact**: MEDIUM - Scope bloat
**Mitigation**:
- Define strict MVP for Friday: contact info + Run of Show text only
- Phase 2 for messaging, payments, file uploads
- Resist temptation to add "just one more thing"

---

## 🎯 FINAL RECOMMENDATIONS

### Build Strategy ✅
**Confirmed**: Build properly as reference for future Rails migration
- Write clean, documented code
- Proper database schema refactoring (not just UI labels)
- No shortcuts that create technical debt
- This codebase serves as specification for Rails rebuild

### Deployment Strategy ✅
**Each phase is independently deployable**:
- Phase 0: ✅ Deployed and verified
- Phase 1: Will deploy to main on Friday afternoon (after demo)
- Phase 2: Will deploy to main on Monday morning (after final testing)

**No breaking changes between phases** - production stays functional throughout

---

## 📝 DOCUMENTATION & NOTES

### For New Engineer Onboarding
- Phase 0 security fixes are live (CORS, env validation, locked dependencies)
- All future work builds on clean foundation
- Environment validation catches config issues early
- Clear role model: producer = organization owner, vendor = service provider

### For Product Team
- Friday demo proves core marketplace concept
- Monday launch adds polish and production features
- Two-sided marketplace: producers post, vendors apply
- No user-facing breaking changes until Phase 1 database migration

### For Future Rails Migration
This TypeScript/React codebase serves as the specification for:
- Database schema design
- API endpoint contracts
- User flows and business logic
- UI/UX patterns and components

---

**Document Status**: ✅ READY FOR PHASE 1
**Last Updated**: October 28, 2025, 10:50 PM
**Next Update**: After Phase 1 completion (Friday)
**Prepared By**: Technical Team (Claude + Courtney)
