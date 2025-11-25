# Voxxy Presents - Venue Owner User Flow Analysis

## Executive Summary

The **venue_owner** role in Voxxy Presents is mapped to the **Producer** label in the user interface. Venue owners are event organizers who can manage events, collect vendor applications, and run a "command center" to control event operations. The system uses a unified authentication flow with role-based routing and comprehensive event management capabilities.

---

## 1. AUTHENTICATION FLOW

### 1.1 Login Process

**File:** `/src/pages/VenueOwnerLoginPage.tsx`

#### Login Steps:
1. User navigates to **legacy routes** (all redirect to `/login`):
   - `/login/venue-owner` → redirects to `/login`
   - `/login/club-owner` → redirects to `/login`
   - Other role-specific logins → `/login`

2. **Unified Login Page** (`/login`):
   - Email and password validation
   - Calls `authApi.login(email, password)`
   - Backend endpoint: `POST /login` (legacy Rails endpoint)
   - Backend returns JWT token with user ID

3. **Post-Login Flow** in AuthContext:
   ```typescript
   // 1. Login saves JWT token
   const loginResponse = await authApi.login(data.email, data.password)
   
   // 2. Fetch full user profile with role
   const user = await authApi.getCurrentUser()
   
   // 3. Profile contains role: 'venue_owner'
   setCurrentUser(user)
   setUserProfile(user)
   cacheUserProfile('rails-user', user)
   ```

4. **Role-Based Redirect**:
   - Component: `RedirectIfAuthenticatedV2`
   - If role === 'venue_owner' → Navigate to `/producer/pending`
   - User is shown **Producer Dashboard** (not "Venue Owner")

### 1.2 Sign-Up Process

**File:** `/src/pages/VenueOwnerSignUpPage.tsx`

#### Sign-Up Steps:
1. User fills form:
   - Display Name
   - Email
   - Password (with validation requirements)
   - Accepts Terms & Conditions

2. Form submission calls:
   ```typescript
   await signUp({
     email: formData.email,
     password: formData.password,
     displayName: formData.displayName,
     userType: 'venue-owner'  // Maps to 'producer' role
   })
   ```

3. **AuthContext SignUp Handler** maps userType to role:
   ```typescript
   case 'venue-owner':
     role = 'producer'  // Actually sends 'producer' or keeps 'vendor' depending on mapping
     break
   ```

4. **Backend Creates User**:
   - Endpoint: `POST /users`
   - Payload includes: `role: 'venue-owner'` (or 'producer')
   - Returns JWT token

5. **Special Note**: Sign-up page shows:
   - "No waiting required! Venue owners get immediate access to start listing their venues."
   - Suggests post-signup redirect to venue creation (though not fully implemented)

### 1.3 Email Verification

**File:** `/src/pages/EmailVerificationPage.tsx`

- Users can verify email after signup
- Endpoint: `POST /verify_code`
- Flag in profile: `confirmed_at` (null if not verified)
- Helper: `isEmailVerified = !!userProfile?.confirmed_at`

---

## 2. ROLE DEFINITION & PERMISSIONS

### 2.1 Backend Role: `venue_owner`

**User Type:** Event Producer/Organizer

**Type Definition** (`/src/contexts/AuthContext.tsx`):
```typescript
role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'
```

### 2.2 Frontend Display & Helpers

**Helper Flags in AuthContext:**
```typescript
// True for venue_owner users
isProducer = userProfile?.role === 'producer' || userProfile?.role === 'venue_owner'

// Helper for checking specific role
hasRole(role) = userProfile?.role === role
```

**Role Mapping** (documented in `/docs/ROLE_MAPPING.md`):

| Backend Role | Frontend Display | Helper Flag | Route |
|---|---|---|---|
| `venue_owner` | **Producer** | `isProducer` | `/producer/pending` |
| `producer` | **Producer** | `isProducer` | `/producer/pending` |
| `vendor` | **Vendor** | `isVendor` | `/vendor/pending` |

### 2.3 Permissions & Capabilities

Venue owners (producers) can:

1. **Organization Management**
   - Auto-create organization on first login
   - View organization details (name, slug)
   - Update organization info (name, description, logo, etc.)

2. **Event Management** (Full CRUD)
   - Create events with: title, description, date, location
   - Read/view all their events
   - Edit event details (title, description, date, location)
   - Delete events
   - Status management: draft, published, cancelled, completed

3. **Vendor Management**
   - Create vendor application forms for events
   - Set vendor categories (dropdown/multiple selection)
   - View vendor submissions
   - Approve, reject, or waitlist vendor applications
   - Confirm vendors for event

4. **Event Command Center**
   - Message Board: post announcements to vendors/attendees
   - Applications Tab: create and manage vendor applications
   - Vendors Tab: view and manage vendor submissions/status
   - Settings Tab: control event visibility, registration, capacity

5. **Public Sharing**
   - Generate shareable links for vendor applications
   - Format: `/apply/:code` (auto-redirects to application form)
   - Vendors can submit applications without account
   - Track submissions without authentication

---

## 3. DASHBOARD & PAGES VENUE OWNERS SEE

### 3.1 Producer Dashboard

**File:** `/src/pages/ProducerDashboard.tsx`

**Route:** `/producer/pending`

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Left Sidebar (220px)   │  Main Content Area │
├─────────────────────────────────────────────┤
│ Logo                  │  Header Bar         │
│ Navigation:           │  Page Content       │
│  - Events ✓          │  (Events/Settings)  │
│  - Network            │                     │
│  - Settings           │                     │
│                       │                     │
│ Organization Info     │                     │
│ User Profile          │                     │
│ Logout Button         │                     │
└─────────────────────────────────────────────┘
```

### 3.2 Events View States

#### a) Empty State
- Component: `EventsEmptyState`
- Shows when user has no events
- 3-step guide for creating first event
- "Create Event" button

#### b) Events List View
- Component: `EventsList`
- Displays all user's events
- Each event shows:
  - Title
  - Status badge (New, Upcoming, Brewing, Past)
  - Description
  - Event date (formatted)
  - Applicant/accepted count
  - Edit button
  - Command Center button

#### c) Create Event Form
- Component: `CreateEventForm`
- Fields:
  - Title (required)
  - Description (optional)
  - Date (required)
  - Location (required)
- Button: "Create Event"
- Cancel button returns to list

#### d) Edit Event Form
- Component: `EditEventForm`
- Pre-populated with event data
- Same fields as create form
- Update button
- Delete button (danger zone)
- Cancel returns to list

#### e) Command Center
- Component: `CommandCenter`
- Tabs: Messages, Applications, Vendors, Settings
- Full event management interface

### 3.3 Command Center Tabs

#### Tab 1: Message Board
- **Component:** `MessageBoard`
- **Features:**
  - View posted messages
  - Create new announcements/messages
  - Messages shown chronologically
  - (Currently using mock data - backend integration pending)

#### Tab 2: Vendor Applications
- **Component:** `ApplicationsTab`
- **Features:**
  - List all vendor applications for event
  - Create new application form
  - View application submissions
  - Status counts
  - Copy shareable link to clipboard
  - Sub-states:
    - **List View:** Shows all applications
    - **Create View:** `CreateApplicationForm` - set name, description, categories
    - **Submissions View:** `ViewApplicationSubmissions` - see who applied, filter by status

#### Tab 3: Vendors
- **Component:** `VendorsTab`
- **Features:**
  - List all vendor submissions across all applications
  - Filter by status: all, pending, approved, confirmed, waitlist, rejected
  - Display per vendor:
    - Business name
    - Email & phone
    - Category
    - Application name
    - Current status
    - Ticket code
    - Date applied
  - Actions:
    - Update status (approve, reject, waitlist, confirm)
    - Contact vendor

#### Tab 4: Settings
- **Component:** `EventSettings`
- **Features:**
  - Event visibility (Published/Draft toggle)
  - Registration status (Open/Closed toggle)
  - Vendor capacity settings
  - Event status selector
  - Save settings button
  - Delete event (danger zone with confirmation)

### 3.4 Settings Page

**File:** `/src/pages/SettingsPage.tsx`

**Sections:**
1. **Profile Information**
   - Full Name
   - Email
   - Company/Organization
   - Bio

2. **Notifications**
   - Toggle: New applications notification
   - Toggle: Vendor approvals notification
   - Toggle: New messages notification
   - Toggle: Event reminders

3. **Danger Zone**
   - Account deletion with confirmation

---

## 4. VENUE OWNER-SPECIFIC COMPONENTS & ROUTES

### 4.1 Routes

**File:** `/src/App.tsx`

```typescript
// Authentication Routes (Redirect if logged in)
/login                 // Unified login (for all user types)
/forgot-password       // Password reset request
/reset-password        // Password reset with token
/verify-email          // Email verification

// Legacy Routes (All redirect to unified routes)
/login/venue-owner     → /login
/login/club-owner      → /login
/signup/venue-owner    → /contact (beta access request)

// Producer-Specific Routes
/producer/pending      // Producer Dashboard (main entry point)
```

### 4.2 Components Directory Structure

```
/src/components/
├── producer/                    # Producer-specific components
│   ├── CommandCenter.tsx        # Event management hub
│   ├── EventsList.tsx           # Display events
│   ├── EventsEmptyState.tsx     # Empty state UI
│   ├── CreateEventForm.tsx      # Create event form
│   ├── EditEventForm.tsx        # Edit event form
│   ├── LoadingCommandCenter.tsx # Loading state
│   ├── ApplicationsTab.tsx      # Vendor applications management
│   ├── CreateApplicationForm.tsx# Create vendor application
│   ├── ViewApplicationSubmissions.tsx # View applicants
│   ├── VendorsTab.tsx           # Vendor list & management
│   ├── EventSettings.tsx        # Event settings tab
│   └── MessageBoard.tsx         # Message board tab
│
├── auth/
│   ├── LoginForm.tsx            # Generic login form
│   ├── SignUpForm.tsx           # Generic signup form
│   ├── ProtectedRouteV2.tsx     # Auth redirect logic
│   └── AdminRoute.tsx           # Admin protection
│
└── ... other components
```

### 4.3 Deprecated/Legacy Components

**These still exist but are not actively used:**
- `/src/pages/VenueOwnerLoginPage.tsx` (redirects via old routes)
- `/src/pages/VenueOwnerSignUpPage.tsx` (signup redirects to contact form)
- `/src/pages/ClubOwnerLoginPage.tsx` (same as venue owner)
- `/src/pages/ClubOwnerSignUpPage.tsx` (same as venue owner)

---

## 5. API CALLS & VENUE OWNER ENDPOINTS

### 5.1 Authentication API

**File:** `/src/services/api.ts`

```typescript
authApi.login(email, password)
// POST /login
// Returns: { token, id, ... }

authApi.signup(data)
// POST /users
// Payload: { user: { email, password, name, role, product_context } }
// Returns: token and user data

authApi.getCurrentUser()
// GET /me
// Returns: { id, email, name, role, confirmed_at, ... }

authApi.logout()
// DELETE /logout
// Clears token

authApi.updateUser(userId, updates)
// PATCH /users/:id
// Payload: { user: updates }
```

### 5.2 Organizations API

**File:** `/src/services/api.ts`

```typescript
organizationsApi.getMine()
// GET /api/v1/presents/me/organization
// Returns: { organization: { id, slug, name, user_id, ... } }

organizationsApi.create(orgData)
// POST /api/v1/presents/organizations
// Payload: { organization: { name, description, ... } }
// Called auto on first login if no org exists

organizationsApi.getBySlug(slug)
// GET /api/v1/presents/organizations/:slug

organizationsApi.update(slug, orgData)
// PATCH /api/v1/presents/organizations/:slug

organizationsApi.delete(slug)
// DELETE /api/v1/presents/organizations/:slug
```

### 5.3 Events API

**File:** `/src/services/api.ts`

```typescript
eventsApi.getByOrganization(organizationSlug)
// GET /api/v1/presents/organizations/:slug/events
// Returns: Event[] for producer's organization

eventsApi.create(organizationSlug, eventData)
// POST /api/v1/presents/organizations/:slug/events
// Payload: { event: { title, description, event_date, location, ... } }

eventsApi.update(eventSlug, eventData)
// PATCH /api/v1/presents/events/:slug
// Payload: { event: partial updates }

eventsApi.delete(eventSlug)
// DELETE /api/v1/presents/events/:slug

eventsApi.getById(eventSlug)
// GET /api/v1/presents/events/:slug
```

### 5.4 Vendor Applications API

**File:** `/src/services/api.ts`

```typescript
vendorApplicationsApi.getByEvent(eventSlug)
// GET /api/v1/presents/events/:slug/vendor_applications
// Returns: VendorApplication[] for event

vendorApplicationsApi.create(eventSlug, data)
// POST /api/v1/presents/events/:slug/vendor_applications
// Payload: { vendor_application: { name, description, status, categories } }

vendorApplicationsApi.update(id, data)
// PATCH /api/v1/presents/vendor_applications/:id
// Partial updates to application

vendorApplicationsApi.delete(id)
// DELETE /api/v1/presents/vendor_applications/:id

vendorApplicationsApi.getSubmissions(id, params)
// GET /api/v1/presents/vendor_applications/:id/submissions
// Returns: submissions with filtering options (category, status)

// PUBLIC (no auth required):
vendorApplicationsApi.lookupByCode(code)
// GET /api/v1/presents/vendor_applications/lookup/:code
// Returns event data for vendor application form
```

### 5.5 Registrations API (Vendor Submissions)

**File:** `/src/services/api.ts`

```typescript
registrationsApi.submitVendorApplication(eventSlug, data)
// POST /api/v1/presents/events/:slug/registrations
// Payload: { registration: { email, phone, business_name, vendor_category, vendor_application_id } }
// PUBLIC (no auth required)
// Returns: { ticket_code, ... } for tracking

registrationsApi.trackByTicketCode(ticketCode)
// GET /api/v1/presents/registrations/track/:code
// PUBLIC (no auth required)
// Returns: vendor application status

registrationsApi.updateStatus(registrationId, status)
// PATCH /api/v1/presents/registrations/:id
// Payload: { registration: { status } }
// Status: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed'
// Producer only - approve/reject vendors
```

---

## 6. COMPLETE VENUE OWNER JOURNEY

### Journey Map: New Venue Owner from Signup to Managing Event

```
1. SIGNUP
   ├─ User visits /signup/venue-owner
   ├─ Redirects to /contact (beta access form)
   ├─ Once approved, receives email to login
   └─ User logs in at /login

2. FIRST LOGIN
   ├─ authApi.login(email, password) → JWT token
   ├─ authApi.getCurrentUser() → role: 'venue_owner'
   ├─ Redirects to /producer/pending (Producer Dashboard)
   ├─ organizationsApi.getMine() → null (no org exists)
   ├─ organizationsApi.create() → Auto-creates organization
   ├─ eventsApi.getByOrganization() → empty list
   └─ Shows EventsEmptyState

3. CREATE FIRST EVENT
   ├─ Click "Create New Event"
   ├─ CreateEventForm with fields: title, description, date, location
   ├─ Submit → eventsApi.create(orgSlug, eventData)
   ├─ Backend creates Event with status: 'draft'
   ├─ Refreshes events list
   └─ Shows event in EventsList

4. SETUP VENDOR APPLICATIONS
   ├─ In EventsList, click event → Command Center
   ├─ Click "Applications" tab
   ├─ Click "Create Application"
   ├─ CreateApplicationForm:
   │  ├─ Set application name (e.g., "Catering Vendors")
   │  ├─ Add description
   │  └─ Add vendor categories (e.g., "Catering", "Photography")
   ├─ Submit → vendorApplicationsApi.create(eventSlug, appData)
   ├─ Backend generates shareable_code
   ├─ Display shareable link & copy button
   └─ Save success → return to applications list

5. SHARE VENDOR APPLICATION LINK
   ├─ Applications list shows applications
   ├─ Copy link button next to application
   ├─ Link format: https://heyvoxxy.com/apply/{shareable_code}
   ├─ Vendor (public, no auth) opens link
   ├─ Redirected to /events/{slug}/apply?code={code}
   └─ VendorApplicationForm loads with pre-filled event data

6. RECEIVE VENDOR APPLICATIONS
   ├─ Vendors submit applications without account
   ├─ registrationsApi.submitVendorApplication() → creates submission
   ├─ Returns ticket_code for tracking
   ├─ Vendor can track at /applications/track/{ticket_code}
   └─ Producer sees submissions in ApplicationsTab

7. MANAGE VENDOR SUBMISSIONS
   ├─ Command Center → Vendors tab
   ├─ See all vendors: name, category, email, phone
   ├─ Status filter: all, pending, approved, confirmed, waitlist, rejected
   ├─ Update status buttons for each vendor
   ├─ Click status → registrationsApi.updateStatus(id, newStatus)
   ├─ Vendor receives email notification (pending implementation)
   └─ Can export vendor list (pending)

8. RUN EVENT WITH COMMAND CENTER
   ├─ Message Board tab:
   │  ├─ Post announcements
   │  ├─ Notify vendors/attendees
   │  └─ (Backend integration pending)
   │
   ├─ Event Settings tab:
   │  ├─ Toggle Published/Draft
   │  ├─ Toggle Registration Open/Closed
   │  ├─ Set vendor capacity
   │  ├─ Save settings
   │  └─ Delete event (danger zone)
   │
   ├─ Vendors tab:
   │  ├─ View all submissions
   │  ├─ Contact vendor
   │  └─ Update approval status
   │
   └─ Applications tab:
      ├─ View vendor applications
      ├─ See submission counts
      └─ Manage categories

9. MANAGE ACCOUNT
   ├─ Click Settings in sidebar
   ├─ SettingsPage shows:
   │  ├─ Profile info (name, email, company, bio)
   │  ├─ Notification preferences
   │  └─ Account deletion
   ├─ Update profile → authApi.updateUser()
   └─ Changes persist across sessions

10. LOGOUT
    ├─ Click logout button (sidebar footer)
    ├─ authApi.logout() → DELETE /logout
    ├─ clearAuthToken()
    ├─ removeCachedUserProfile()
    └─ Redirect to /
```

---

## 7. STATE MANAGEMENT & DATA FLOW

### 7.1 Auth Context Flow

```typescript
// 1. User logs in
const handleSignIn = async (data: SignInData) => {
  // Login gets JWT token
  const loginResponse = await authApi.login(email, password)
  
  // Fetch full profile with role
  const user = await authApi.getCurrentUser()
  
  // Set auth state
  setCurrentUser(user)
  setUserProfile(user)
  
  // Cache for instant reload
  cacheUserProfile('rails-user', user)
  
  // Track analytics
  analytics.trackUserSignIn(user.email, user.id, user.role)
}

// 2. Auth context provides helpers
const isProducer = userProfile?.role === 'producer' || userProfile?.role === 'venue_owner'
const isVendor = userProfile?.role === 'vendor'
const hasRole = (role) => userProfile?.role === role

// 3. Components use helpers
if (isProducer) {
  // Show producer dashboard
}
```

### 7.2 Producer Dashboard State

```typescript
// Main state variables
const [organization, setOrganization] = useState<Organization | null>(null)
const [events, setEvents] = useState<Event[]>([])
const [eventsView, setEventsView] = useState<'empty' | 'list' | 'create' | 'edit' | 'command-center'>()
const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
const [activeNav, setActiveNav] = useState<'events' | 'network' | 'settings'>()

// Loading states
const [loadingOrg, setLoadingOrg] = useState(true)
const [loadingEvents, setLoadingEvents] = useState(false)
const [loadingCommandCenter, setLoadingCommandCenter] = useState(false)

// On mount: fetch organization
useEffect(() => {
  const response = await organizationsApi.getMine()
  
  if (!response) {
    // Create org automatically
    const newOrg = await organizationsApi.create({ name: userProfile.name })
  }
  
  setOrganization(userOrg)
  
  // Then fetch events for org
  await fetchEvents(userOrg.slug)
}, [userProfile])

// Fetch events for organization
const fetchEvents = async (orgSlug) => {
  const fetchedEvents = await eventsApi.getByOrganization(orgSlug)
  setEvents(fetchedEvents)
  
  // Set view based on state
  if (fetchedEvents.length === 0) {
    setEventsView('empty')
  } else {
    setEventsView('list')
  }
}
```

### 7.3 Applications Tab State

```typescript
const [applications, setApplications] = useState<VendorApplication[]>([])
const [loading, setLoading] = useState(true)
const [currentView, setCurrentView] = useState<'list' | 'create' | 'submissions'>()
const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null)

// On mount: fetch applications for event
useEffect(() => {
  const data = await vendorApplicationsApi.getByEvent(eventSlug)
  setApplications(data)
}, [eventSlug])

// Handle create
const handleSuccess = () => {
  await fetchApplications()
  setCurrentView('list')
}

// Copy shareable link
const handleCopyLink = async (application) => {
  await navigator.clipboard.writeText(application.shareable_url)
  // Show success feedback
}
```

---

## 8. KEY FEATURES & WORKFLOWS

### 8.1 Shareable Vendor Application Links

**Purpose:** Allow event producers to share vendor application forms with vendors who don't have accounts

**Flow:**
1. Producer creates vendor application in Command Center
2. Backend generates unique `shareable_code` (format: `EVENT-YYYYMM-XXXXXX`)
3. Producer gets shareable URL: `/apply/{code}`
4. Producer copies link and shares (email, social media, etc.)
5. Vendor clicks link (no account needed)
6. Frontend calls `vendorApplicationsApi.lookupByCode(code)` - PUBLIC endpoint
7. Redirects to `/events/{slug}/apply` with event data
8. Vendor fills application form: business name, category, email, phone
9. Submits: `registrationsApi.submitVendorApplication(eventSlug, data)` - PUBLIC endpoint
10. Gets ticket code for tracking
11. Vendor can check status anytime at `/applications/track/{ticket_code}`

### 8.2 Vendor Status Workflow

**Statuses:** pending → approved/rejected/waitlist/confirmed

**Producer Actions:**
1. View vendor in Vendors tab
2. Click status button on vendor row
3. Select new status from dropdown
4. Call: `registrationsApi.updateStatus(vendorId, newStatus)`
5. Vendor receives email notification (pending)
6. Status updates in real-time

### 8.3 Event Publication Workflow

**Event Lifecycle:**
1. Create event → status: 'draft'
2. Edit event details
3. Create vendor applications for event
4. Share vendor application links
5. Receive vendor submissions
6. Approve vendors
7. In Command Center → Settings:
   - Toggle Published (makes event visible to public)
   - Toggle Registration Open (allows RSVP submissions)
   - Set capacity
8. Event is live!

---

## 9. CURRENT LIMITATIONS & INCOMPLETE FEATURES

### 9.1 Not Yet Implemented

1. **Message Board**
   - Currently shows mock data
   - Backend Messages model needed
   - Real-time updates pending

2. **Event Settings Save**
   - UI shows settings controls
   - Save functionality not wired to backend

3. **User Profile Save**
   - Settings page displays fields
   - Update API call pending

4. **Email Notifications**
   - Vendor approval emails
   - Application received emails
   - Message notifications

5. **Venue/Space Management**
   - VenueOwnerSignUpPage mentions venue creation
   - Venue management system not implemented in Presents

### 9.2 Known Issues

- Event date field inconsistency (returns both `event_date` and `dates.start`)
- Capacity field type inconsistency (number vs object)
- Mobile menu behavior on tablet sizes
- No pagination for large event lists

---

## 10. SECURITY & PERMISSIONS

### 10.1 Authentication

- JWT token-based auth with Rails
- Token stored in localStorage
- Token included in `Authorization: Bearer {token}` header
- Public endpoints (vendor forms) don't require auth

### 10.2 Authorization

**Backend Enforces:**
- Only organization owner can view/edit/delete their organization's events
- Only event owner can create vendor applications
- Only producer/admin can update vendor application status

**Frontend:**
- RedirectIfAuthenticatedV2 checks role before routing
- AdminRoute protects admin-only pages
- Components conditionally render based on `isProducer` flag

### 10.3 Public Endpoints

These don't require authentication:
- `vendorApplicationsApi.lookupByCode()` - Lookup event by shareable code
- `registrationsApi.submitVendorApplication()` - Submit vendor application
- `registrationsApi.trackByTicketCode()` - Check application status
- Event detail pages (public events)

---

## 11. CACHING & PERFORMANCE

### 11.1 User Profile Caching

```typescript
// Cache user profile on login
cacheUserProfile('rails-user', user)

// Load from cache on app reload (instant load)
const cachedProfile = getCachedUserProfile<User>('rails-user')
if (cachedProfile) {
  setCurrentUser(cachedProfile)
  setUserProfile(cachedProfile)
  setLoading(false)
}

// Meanwhile, fetch fresh profile from API
const user = await authApi.getCurrentUser()
// Update cache with fresh data
```

### 11.2 Organization Auto-Creation

First login flow:
1. Fetch organization from API
2. If none exists, auto-create
3. Handle 422 duplicate errors
4. Cache organization in state

---

## 12. FILE PATHS REFERENCE

```
Authentication:
- /src/pages/VenueOwnerLoginPage.tsx
- /src/pages/VenueOwnerSignUpPage.tsx
- /src/contexts/AuthContext.tsx
- /src/components/auth/ProtectedRouteV2.tsx

Main Dashboard:
- /src/pages/ProducerDashboard.tsx
- /src/pages/SettingsPage.tsx

Event Management:
- /src/components/producer/EventsList.tsx
- /src/components/producer/CreateEventForm.tsx
- /src/components/producer/EditEventForm.tsx
- /src/components/producer/EventsEmptyState.tsx

Command Center:
- /src/components/producer/CommandCenter.tsx
- /src/components/producer/MessageBoard.tsx
- /src/components/producer/EventSettings.tsx

Vendor Applications:
- /src/components/producer/ApplicationsTab.tsx
- /src/components/producer/CreateApplicationForm.tsx
- /src/components/producer/ViewApplicationSubmissions.tsx

Vendor Management:
- /src/components/producer/VendorsTab.tsx

Public Vendor Forms:
- /src/pages/VendorApplicationForm.tsx
- /src/pages/ApplicationConfirmationPage.tsx
- /src/pages/ApplicationTrackingPage.tsx
- /src/pages/PublicEventDetailPage.tsx

API Service:
- /src/services/api.ts (all API endpoints)

Types & Utils:
- /src/lib/analytics.ts
- /src/utils/cache.ts
- /src/utils/validation.ts

Documentation:
- /docs/ROLE_MAPPING.md
- /docs/PRODUCER_FLOW_STATUS.md
```

---

## 13. ANALYTICS TRACKING

### 13.1 Sign-Up & Sign-In

```typescript
// Track signup
analytics.trackConversionStep('Sign Up Form Submitted', 'Venue Owner Sign Up')
analytics.trackConversionStep('Sign Up Completed', 'Vendor Sign Up')
analytics.setUserProperties({
  user_role: 'vendor',
  conversion_stage: 'converted',
})

// Track login
analytics.trackUserSignIn(user.email, user.id, user.role)
```

### 13.2 Role Identification

```typescript
// In analytics tracking
customer_profile: 'venue_owner' | 'event_planner' | 'artist' | etc.

// For venue owners:
if (role === 'venue_owner') {
  profile = 'venue_owner'
}
```

---

## 14. TESTING THE VENUE OWNER FLOW

### Quick Test Checklist

1. **Signup as Venue Owner**
   - Visit /signup/venue-owner
   - (Note: May redirect to /contact for beta access)
   - If you have account: proceed to login

2. **Login**
   - Visit /login
   - Enter venue owner credentials
   - Should redirect to /producer/pending

3. **Create Organization** (automatic)
   - Dashboard should load
   - If no organization, one auto-creates

4. **Create Event**
   - Click "Create New Event"
   - Fill form and submit
   - Should appear in events list

5. **Create Vendor Application**
   - Click event → Command Center
   - Applications tab
   - Create application
   - Get shareable link

6. **Test Shareable Link**
   - Copy link
   - Open in new tab/incognito (public access)
   - Should show vendor form
   - Submit application
   - Should get ticket code

7. **Track Submission**
   - Use ticket code to check status
   - Approve/reject in Vendors tab
   - Status updates in real-time

---

## Summary

The **venue_owner** role represents **Event Producers** in Voxxy Presents. They have complete control over:
- Event creation and management
- Vendor application collection
- Vendor approval workflows
- Event operations via Command Center

The system uses a unified login flow, role-based routing, and JWT authentication. Venue owners can share vendor application forms with external vendors who don't need accounts, creating a seamless public application process while maintaining producer control.

**Last Updated:** November 24, 2025
