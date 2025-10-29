# Project Plan: Venue Owner System v2.0.0
## Venue Creation Flow & CRM Dashboard

**Release Date:** TBD
**Project Lead:** Courtney Greer
**Status:** Active Development

---

## 🎯 Executive Summary

This release introduces a comprehensive venue owner system to complement our existing club owner platform. **Starting with a clean slate**, venue owners create their venue profiles from scratch through our onboarding process. They manage their venue information, view event pipeline opportunities, and control their public visibility through a dedicated dashboard. This creates a curated two-sided marketplace where club owners can discover verified venues and venue owners can attract events.

### Key Deliverables
- **Venue Creation Flow**: Build venue profiles from scratch with admin approval
- **Venue Owner Dashboard**: Venue profile management, photo uploads, CRM pipeline
- **Admin Venue Management**: Full venue CRUD operations in admin dashboard
- **Event-Venue Connection System**: Validated linking between club events and venues
- **Public Venue Screens**: Venue owners can push events to their public displays

---

## 📊 Business Requirements

### Primary Business Goals
1. **Expand Voxxy's Network**: Create a two-sided marketplace connecting venues and event organizers
2. **Reduce Manual Work**: Automate venue discovery and booking pipeline
3. **Increase Event Visibility**: Enable venues to promote events on their premises
4. **Generate Revenue Streams**: Establish foundation for future venue partnership revenue

### Success Metrics
- **Venue Creation**: 30+ venues created in first month (starting from zero)
- **Admin Approval**: 90% venue approval rate within 48 hours
- **Event Connections**: 75% of new events use verified venues
- **Venue Engagement**: 60% of venue owners actively use CRM features
- **Public Screen Usage**: 25% of venues push events to public screens

### User Personas

#### 🏢 **Venue Owner**
- Bar/restaurant/event space owner or manager
- Wants to create professional venue presence on Voxxy
- Needs simple tools to build and manage venue profile from scratch
- Values visibility into event pipeline opportunities
- Prefers control over venue information accuracy

#### 🎭 **Club Owner** (Existing)
- Event organizer looking for venues
- Wants access to curated, venue-owner verified information
- Needs confidence that venue details are accurate and current
- Values direct connection with venue owners

#### 🛡️ **Admin User**
- Voxxy team member managing platform quality
- Reviews and approves new venue submissions
- Can create venues manually for special partnerships
- Maintains venue database integrity

#### 👥 **Event Guests** (Existing)
- Want accurate venue information
- Expect up-to-date details about events and locations

---

## 🏗️ Technical Architecture

### Database Design Decisions

#### User Table Strategy: **Extended Single Table Approach**
After analyzing the current `User` interface, we'll extend it to support multiple user types rather than creating separate tables.

**🔄 Key Change**: No venue claiming system - venues are created from scratch by owners or admins.

**Current User Schema:**
```typescript
interface User {
  id: string // Firebase Auth UID
  email: string
  name?: string
  role: 'admin' | 'organizer' | 'user' // ← EXTEND THIS
  // ... other fields
}
```

**Proposed Extension:**
```typescript
interface User {
  id: string
  email: string
  name?: string
  role: 'admin' | 'organizer' | 'venue_owner' | 'user' // ← ADD venue_owner

  // Extended fields for venue owners
  venueOwnerProfile?: {
    venueIds: string[] // Venues they own/manage
    businessInfo?: string
    phone?: string
    preferredContactMethod: 'email' | 'phone'
  }

  // Existing organizer fields
  organizationIds: string[] // Organizations they manage

  // ... rest of existing fields
}
```

**Why Single Table?**
- ✅ Simpler Firebase Auth integration (one auth → one user record)
- ✅ Easier permission management
- ✅ Supports users who might be both venue owners AND club organizers
- ✅ Consistent user experience across different roles
- ✅ Reduces complexity in authentication flows

#### Venue Schema Updates
**🔄 Clean Start**: We'll clear the existing venue database and start fresh. Updated venue schema:

```typescript
interface Venue {
  // ... existing fields (keeping core structure)
  ownerId: string // References users collection (REQUIRED - no unclaimed venues)

  // Updated approval system (no claiming)
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvedBy?: string // Admin user ID who approved
  approvedAt?: Date
  rejectedReason?: string

  // New fields for venue owners
  ownerPreferences?: {
    enablePublicScreen: boolean
    autoApproveEvents: boolean
    preferredContactMethod: 'email' | 'phone' | 'platform'
    businessHours?: VenueHours
  }

  // Enhanced for CRM
  eventHistory?: {
    totalEvents: number
    lastEventDate?: Date
    preferredEventTypes: string[]
  }
}
```

**🗑️ Removed Fields:**
- `claimStatus` - No longer needed (venues are created, not claimed)

### Event-Venue Connection System

#### Current State Analysis
Looking at `EventCreateForm.tsx:47-48`, events currently store:
- `location: string` - Free text venue name
- `address: string` - Free text address

#### Proposed Enhancement
```typescript
interface Event {
  // ... existing fields
  location: string // Keep for backward compatibility
  address: string // Keep for backward compatibility

  // New structured venue connection
  venueConnection?: {
    venueId: string // References venues collection
    venueName: string // Cached for performance
    venueAddress: string // Cached for performance
    connectionStatus: 'pending' | 'approved' | 'rejected'
    requestedAt: Date
    approvedAt?: Date
  }
}
```

**Connection Flow:**
1. Club owner creates event and selects venue from search
2. System creates `venueConnection` with `pending` status
3. Venue owner sees request in their CRM dashboard
4. Venue owner can approve/reject (future: auto-approval setting)
5. Approved events appear in venue's public screen options

---

## 🎨 User Experience Design

### Venue Owner Journey

#### 1. **Discovery & Sign-up**
- **Entry Points**:
  - Dedicated `/venues/create` landing page
  - Direct outreach and invitation campaigns
  - Partnership onboarding
- **Onboarding Flow**:
  - Create new venue from scratch
  - Build complete venue profile (name, address, photos, details)
  - Submit for admin approval
  - Receive approval notification and dashboard access

#### 2. **Dashboard Experience**
- **Overview**: Key metrics, recent activity, pending requests
- **Venue Profile**: Edit details, upload photos, manage hours
- **Event Pipeline**: See incoming event requests, approve/reject
- **Public Screen**: Push approved events to venue displays
- **Analytics** (Future): Event performance, customer engagement

#### 3. **CRM Features**
- **Event Requests**: Table view of pending/approved/past events
- **Club Profiles**: View requesting organization details
- **Communication**: Message system for event coordination
- **Calendar**: Visual timeline of upcoming events

### Technical Implementation

#### Authentication Flow
```
Venue Owner Journey:
1. `/venues/create` → Build venue from scratch
2. Firebase Auth sign-up (email/password or Google)
3. User profile creation with role: 'venue_owner'
4. Venue creation and admin approval process
5. → Venue Owner Dashboard (after approval)
```

#### Admin Workflow
```
Admin Venue Management:
1. `/admin/venues` → View all venues and pending approvals
2. Review venue submissions
3. Approve/reject with optional feedback
4. Create venues manually for partnerships
```

#### Route Structure
```
/venues/
├── create/             # Venue creation flow (new venues only)
├── dashboard/          # Venue owner dashboard
│   ├── profile/        # Edit venue details
│   ├── events/         # Event pipeline CRM
│   ├── public-screen/  # Manage public displays
│   └── settings/       # Account & preferences
└── [venueSlug]/        # Public venue pages

/admin/
├── venues/             # Admin venue management
│   ├── pending/        # Approval queue
│   ├── approved/       # Approved venues
│   └── create/         # Admin create venue
```

---

## 🛠️ Technical Requirements

### Frontend Development

#### New Components
- `VenueCreateFlow` - Build venue from scratch
- `VenueOwnerDashboard` - Main dashboard layout
- `VenueProfileEditor` - Comprehensive venue editing
- `EventPipelineCRM` - CRM table for event requests
- `PublicScreenManager` - Push events to displays
- `VenuePhotoUploader` - Drag/drop photo management
- `AdminVenueManagement` - Admin venue CRUD interface
- `VenueApprovalQueue` - Admin approval workflow

#### Enhanced Components
- `AdminDashboard` - Add new "Venues" tab next to "Clubs" tab
- `EventCreateForm` - Venue selection with validation
- `AuthProvider` - Support venue owner role
- `Navigation` - Venue owner dashboard links

#### New Pages
- `/venues/create` - Venue creation flow
- `/venues/dashboard/*` - Venue owner dashboard suite
- `/admin/venues/*` - Admin venue management pages

### Backend Requirements

#### API Endpoints (voxxy-presents-api)
```typescript
// Venue Management (Updated)
POST   /api/venues/create         // Create new venue (venue owner)
PUT    /api/venues/:id/profile    // Update venue details
POST   /api/venues/:id/photos     // Upload venue photos

// Admin Venue Management (New)
GET    /api/admin/venues          // Get all venues with admin data
POST   /api/admin/venues/create   // Admin create venue manually
PUT    /api/admin/venues/:id/approve    // Admin approve venue
PUT    /api/admin/venues/:id/reject     // Admin reject venue
GET    /api/admin/venues/pending        // Get pending approvals

// Event-Venue Connections
GET    /api/venues/:id/events     // Get venue's event pipeline
PUT    /api/venues/:id/events/:eventId/approve
PUT    /api/venues/:id/events/:eventId/reject

// Public Screen Management
GET    /api/venues/:id/public-events    // Events for public display
POST   /api/venues/:id/push-event       // Push event to public screen

// Database Management (New)
DELETE /api/admin/venues/clear     // Clear existing venue database (one-time)
```

#### Database Collections

**Updated Firestore Collections:**
```
users/                    # Extended with venue owner roles
venues/                   # 🔄 CLEARED and rebuilt with new schema
events/                   # Enhanced with venue connections
venue_event_requests/     # New: Event approval workflow
venue_public_screens/     # New: Public display management
venue_approvals/          # New: Admin approval workflow tracking
```

**🗑️ Database Migration:**
- Clear existing `venues/` collection completely
- Start with empty venue database
- Venue owners and admins create all venues from scratch

### Security & Permissions

#### Access Control
```typescript
// Venue Owner Permissions
- Can create new venues (subject to admin approval)
- Can edit venues they own (venue.ownerId === user.id)
- Can view events requesting their venues
- Can approve/reject event requests
- Can manage public screen content

// Club Owner Permissions (Existing + New)
- Can create events with venue requests
- Can view approved venue contact info
- Cannot edit venues they don't own

// Admin Permissions (Enhanced)
- Can approve/reject venue submissions
- Can create venues manually for partnerships
- Can manage all venues and venue owners
- Can clear venue database (migration tool)
- Can moderate venue-event connections
```

#### Data Validation
- **Venue Creation**: All venues require admin approval before going live
- **Event Connections**: Only approved events appear publicly
- **Photo Uploads**: Size limits, content moderation
- **Public Screen**: Venue owner approval required
- **Database Integrity**: No orphaned venues (all have valid ownerId)

---

## 📋 Development Roadmap

### Phase 1: Foundation (Weeks 1-2) ✅ COMPLETED
**Goal**: Establish venue creation system and admin management

#### Sprint 1.1: Database & Authentication ✅ COMPLETED
- [x] Clear existing venue database
- [x] Extend `User` interface for venue owners
- [x] Update `AuthProvider` to support venue owner role
- [x] Create venue creation flow (`/venues/create`)
- [x] Implement admin approval system

#### Sprint 1.2: Admin & Venue Management ✅ COMPLETED
- [x] Add "Venues" tab to admin dashboard
- [x] Implement admin venue approval workflow
- [x] Create venue owner dashboard layout
- [x] Add venue profile editor and photo upload

**🎉 MAJOR MILESTONE ACHIEVED**: Complete venue owner dashboard redesign implemented with:
- Simplified 4-tab navigation (Overview, My Venue, Events, Settings)
- Glass morphism design system throughout
- Clean navigation bar with back button, title, and essential actions
- Component reordering (photos after accessibility features)
- Improved venue public page with subscription footer
- Better admin permission handling

### Phase 1.5: Unified Authentication ✅ COMPLETED
**Goal**: Create unified signup/login experience for both club owners and venue owners

#### Sprint 1.5.1: Unified Auth Flow ✅ COMPLETED
- [x] Create unified login/signup pages with tabs for different user types
- [x] Update authentication to handle venue owner vs club owner registration
- [x] Implement proper role assignment during signup
- [x] Add email verification requirements for venue owners
- [x] Test authentication flows across all user types

**🎉 COMPLETED**: Unified authentication system with tabbed interface for different user roles, proper venue owner onboarding flow that bypasses beta requirements, and role-based redirects after login.

### Phase 1.6: Beta User Management (Current Phase) ✅ COMPLETED
**Goal**: Connect real beta user data to admin dashboard for production management

#### Sprint 1.6.1: Admin Beta Management ✅ COMPLETED
- [x] Replace mock data with real API calls in BetaUsersManagement component
- [x] Add admin API functions for user management (getAllUsers, updateUserBetaStatus, approveAllBetaUsers)
- [x] Deploy API endpoints to Google Cloud Run production environment
- [x] Add "Approve All" button for batch approval of pending beta users
- [x] Synchronize all API repository branches with latest changes
- [x] Test real-time beta user management through admin interface

**🎉 COMPLETED**: Full beta user management system with real backend data, deployed to production, ready for admin use.

### Phase 1.7: Venue API Infrastructure ✅ COMPLETED
**Goal**: Fix venue creation backend and ensure API functionality

#### Sprint 1.7.1: Backend API Fixes ✅ COMPLETED
- [x] Convert venues.ts from Firebase Client SDK to Admin SDK
- [x] Fix TypeScript compilation errors in venue routes
- [x] Enable venue creation endpoint with pending status by default
- [x] Test venue creation and retrieval endpoints
- [x] Clear development database to eliminate cross-wires
- [x] Clear Firebase Authentication users for clean testing

**🎉 COMPLETED**: Venue creation API is fully functional, development database cleared, ready for testing venue owner flows.

### Phase 2: Event Integration (Weeks 3-4)
**Goal**: Connect events with venues and implement approval workflow

#### Sprint 2.1: Event-Venue Connections
- [ ] Enhance `Event` model with venue connections
- [ ] Update event creation flow for venue selection
- [ ] Implement event request system
- [ ] Create venue owner event approval interface

#### Sprint 2.2: CRM Features
- [ ] Build comprehensive event pipeline CRM
- [ ] Add club owner profile views for venue owners
- [ ] Implement basic messaging system
- [ ] Create event calendar view

### Phase 3: Public Screen System (Weeks 5-6)
**Goal**: Enable venues to display events publicly

#### Sprint 3.1: Public Screen Management
- [ ] Create public screen management interface
- [ ] Implement event push functionality
- [ ] Design public display layouts
- [ ] Add venue owner screen controls

#### Sprint 3.2: Polish & Launch
- [ ] Comprehensive testing across all user roles
- [ ] Performance optimization
- [ ] Security audit
- [ ] Launch preparation and documentation

---

## 🚀 Branching & Release Strategy

### Git Workflow
```
main ──┬── develop ──┬── feature/venue-owner-auth
       │             ├── feature/venue-dashboard
       │             ├── feature/event-venue-connections
       │             ├── feature/public-screen-system
       │             └── release/v2.0.0-venue-system
       │
       └── hotfix/critical-fixes (if needed)
```

### Branch Strategy
- **Feature Branches**: Individual features developed in isolation
- **Develop Branch**: Integration branch for testing feature combinations
- **Release Branch**: `release/v2.0.0-venue-system` for final testing
- **Main Branch**: Production-ready code

### Deployment Pipeline
1. **Feature Development**: Deploy to feature-specific staging environments
2. **Develop Integration**: Deploy to main staging environment
3. **Release Candidate**: Deploy to pre-production environment
4. **Production Release**: Blue-green deployment to production

### Testing Strategy
- **Unit Tests**: All new components and services
- **Integration Tests**: Auth flow, API endpoints, database operations
- **E2E Tests**: Complete venue owner journey, event creation flow
- **User Acceptance Testing**: Real venue owners test the system

---

## 🔧 Infrastructure Requirements

### Environment Setup
- **Staging**: Separate Firebase project for venue owner testing
- **Production**: Enhanced Firebase security rules for new user roles
- **CDN**: Image upload and serving for venue photos
- **Analytics**: Enhanced tracking for venue owner actions

### Performance Considerations
- **Venue Search**: Elasticsearch/Algolia for fast venue discovery
- **Photo Storage**: Optimized image serving with multiple sizes
- **Real-time Updates**: WebSockets for live event pipeline updates
- **Caching**: Redis for frequently accessed venue data

---

## 🎯 Success Criteria & Metrics

### Technical Success
- [ ] 100% uptime during launch period
- [ ] <2 second load times for venue owner dashboard
- [ ] 0 security vulnerabilities in venue owner flows
- [ ] 95% test coverage on new features

### Business Success
- [ ] 30+ venues created in first month (starting from zero)
- [ ] 90% admin approval rate within 48 hours
- [ ] 75% of new events use verified venue connections
- [ ] 60% venue owner monthly active usage
- [ ] 25% of venues use public screen features

### User Experience Success
- [ ] <5 minute venue creation and submission flow
- [ ] 90% user satisfaction score from venue owners
- [ ] <2 support tickets per week related to venue features
- [ ] Positive feedback from club owners on curated venues

---

## ⚠️ Risk Assessment & Mitigation

### Technical Risks
**Risk**: Complex authentication with multiple user types
**Mitigation**: Thorough testing, gradual rollout, fallback auth flows

**Risk**: Database schema changes affecting existing events
**Mitigation**: Backward compatibility, careful migration scripts, rollback plan

**Risk**: Performance issues with venue search and photos
**Mitigation**: CDN implementation, image optimization, performance monitoring

### Business Risks
**Risk**: Starting with empty venue database slows adoption
**Mitigation**: Direct outreach campaigns, admin-created showcase venues, partnerships

**Risk**: Admin approval bottleneck delays venue launches
**Mitigation**: Streamlined approval process, admin training, approval SLA metrics

**Risk**: Venue owners don't engage with CRM features
**Mitigation**: Value demonstration, onboarding guidance, feature iteration

**Risk**: Low venue creation without existing venue claiming
**Mitigation**: Targeted outreach, simplified creation flow, manual admin venue creation

---

## 🚨 Known Issues & Next Steps

### Current Known Issues
#### Issue #1: Venue Owner Routing Problem 🔴 CRITICAL
**Status**: Identified - Needs Resolution
**Problem**: After venue owner signup, users are redirected to `/profile` instead of `/venues/create`
**Expected Flow**: Venue owners should go directly to venue creation after signup
**Impact**: Venue owners cannot complete the intended onboarding flow
**Location**: Likely in `ProtectedRoute.tsx` and/or `AuthContext.tsx` routing logic
**Priority**: Critical - blocks venue owner onboarding

**Investigation Required**:
- Check `RedirectIfAuthenticated` component routing logic for venue owners
- Verify `ProtectedRoute` component distinguishes venue owners from club owners
- Confirm venue owner role detection and routing in auth context
- Test that `isVenueOwner` flags are working correctly

**Next Sprint**: Fix venue owner routing to enable proper onboarding flow completion

### Recently Resolved Issues ✅
- ✅ Firebase Admin SDK conversion - venues API now functional
- ✅ Development database cleanup - all cross-wires removed
- ✅ Authentication user cleanup - clean testing environment
- ✅ Venue creation endpoint - API accepting requests properly

---

## 📞 Next Steps & Approval

### Required Approvals
- [x] **Clean Database Approach**: Confirmed - clear existing venues, start fresh
- [ ] **Admin Approval Workflow**: Review admin venue approval process
- [ ] **User Experience**: Approve venue creation flow and admin interface
- [ ] **Technical Architecture**: Review updated database schema and API design
- [ ] **Timeline**: Validate 6-week development timeline with new scope

### Questions for Discussion
1. **Database Migration**: Should we preserve any critical venue data before clearing?
2. **Admin Approval SLA**: How quickly should we commit to approving venues?
3. **Venue Standards**: What criteria should admins use for venue approval?
4. **Launch Strategy**: How do we seed the platform with initial venues?
5. **Public Screen**: What level of customization should venues have for displays?

### Pre-Development Requirements
- [ ] Clear existing venue database (coordinate with production)
- [ ] Finalize admin approval criteria and workflow
- [ ] Set up staging environment with clean venue database
- [ ] Establish testing protocols for multi-role system
- [ ] Plan venue owner outreach and onboarding strategy

---

**✅ UPDATED PLAN - Ready to proceed with development using the venue creation approach (no claiming).**