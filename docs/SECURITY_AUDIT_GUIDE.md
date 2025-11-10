# Voxxy Presents - Security Audit Guide

**Audit Date:** October 30, 2025
**Document Version:** 1.0
**Prepared for:** Security Audit Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Application Overview](#application-overview)
3. [Technology Stack](#technology-stack)
4. [Architecture Overview](#architecture-overview)
5. [Authentication & Authorization](#authentication--authorization)
6. [Application Routes & Access Control](#application-routes--access-control)
7. [User Personas & Workflows](#user-personas--workflows)
8. [API Endpoints](#api-endpoints)
9. [Data Models & Security](#data-models--security)
10. [Known Security Considerations](#known-security-considerations)
11. [Environment Configuration](#environment-configuration)
12. [Testing & Development Setup](#testing--development-setup)

---

## Executive Summary

Voxxy Presents is an event management platform that connects event organizers (club owners), venue owners, and guests. The application provides tools for creating events, managing venues, handling RSVPs, and facilitating venue discovery.

**Key Security Features:**
- Firebase Authentication with email verification
- Role-based access control (RBAC) with 4 user types
- Beta access approval system
- Protected API routes with JWT token verification
- Firestore security rules (managed in Firebase Console)

**Scope of This Audit:**
- Client application security (React/TypeScript SPA)
- API server security (Node.js/Express)
- Authentication and authorization flows
- Data access patterns and validation
- Environment variable management
- Third-party integrations (Firebase, SendGrid, Mixpanel)

---

## Application Overview

### What is Voxxy Presents?

Voxxy Presents is a full-stack event management platform designed to:

1. **For Event Organizers (Club Owners):**
   - Create and manage organizations (clubs/collectives)
   - Create and manage events
   - Track RSVPs and attendee engagement
   - Send email campaigns to attendees

2. **For Venue Owners:**
   - List and manage venue profiles
   - Receive booking inquiries from event organizers
   - Manage venue availability and pricing

3. **For Guests (Users):**
   - Discover events and organizations
   - RSVP to events
   - Receive event notifications

4. **For Admins:**
   - Approve/reject beta access requests
   - Manage users and organizations
   - Monitor platform activity

### Current Development Phase

**Phase:** v0.1.2 (Early Beta)
- Beta access approval system is active
- Core features for organizers and venue owners are implemented
- Guest features are in development
- The platform is not yet publicly launched

---

## Technology Stack

### Client Application (`voxxy-presents-client`)

**Core Framework:**
- **React 18.3.1** - UI framework
- **TypeScript 5.x** - Type safety
- **Vite 6.3.6** - Build tool and dev server
- **React Router DOM 7.7.1** - Client-side routing

**UI & Styling:**
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives (dialogs, dropdowns, etc.)
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

**Authentication & Backend:**
- **Firebase 12.0.0** - Authentication, Firestore database
- **Firebase Admin 13.5.0** - Admin SDK for server operations

**Form Handling & Validation:**
- **React Hook Form** - Form state management
- **Zod 3.24.1** - Schema validation

**Analytics & Monitoring:**
- **Mixpanel Browser 2.70.0** - User analytics and event tracking

**Additional Libraries:**
- **date-fns 4.1.0** - Date manipulation
- **qrcode 1.5.4** - QR code generation for tickets
- **recharts** - Data visualization for analytics

**Testing:**
- **Vitest 3.2.4** - Unit and integration testing
- **@testing-library/react 16.3.0** - React component testing

---

### API Server (`voxxy-presents-api`)

**Core Framework:**
- **Node.js** - Runtime environment
- **Express 4.18.2** - Web framework
- **TypeScript 5.9.2** - Type safety

**Authentication & Database:**
- **Firebase Admin 13.4.0** - Firebase integration, Firestore, Auth
- **jsonwebtoken 9.0.2** - JWT token handling

**Security:**
- **Helmet 8.1.0** - Security headers middleware
- **CORS 2.8.5** - Cross-origin resource sharing

**Email:**
- **@sendgrid/mail 8.1.5** - Transactional email service

**Validation:**
- **Zod 4.0.14** - Schema validation

**Development:**
- **Nodemon 3.1.10** - Auto-restart during development
- **Morgan 1.10.1** - HTTP request logger
- **dotenv 17.2.1** - Environment variable management

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (SPA)                          │
│  React + TypeScript + Vite                                   │
│  Running on: Vite Dev Server (dev) / Static Hosting (prod)  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
┌─────────────────┐  ┌──────────────────────┐
│  Firebase Auth  │  │   API Server         │
│  - Auth tokens  │  │   Express + Node.js  │
│  - User mgmt    │  │   Port: 3001         │
└─────────────────┘  └──────┬───────────────┘
         │                   │
         │                   │
         │                   ▼
         │           ┌────────────────┐
         │           │   SendGrid     │
         │           │   Email API    │
         │           └────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│       Firestore Database        │
│  Collections:                   │
│  - users                        │
│  - organizations                │
│  - events                       │
│  - venues                       │
│  - vendors                      │
│  - registrations                │
│  - budgets                      │
│  - campaigns                    │
└─────────────────────────────────┘
```

### Request Flow

1. **User visits application** → Client SPA loads
2. **Authentication required** → Firebase Auth login/signup
3. **User authenticated** → Firebase ID token issued
4. **Protected route access** → Client checks auth state + role
5. **API request** → Client sends request with `Authorization: Bearer <token>`
6. **API validates token** → Express middleware verifies Firebase ID token
7. **Data access** → API queries Firestore or performs action
8. **Response** → API returns data to client

---

## Authentication & Authorization

### Authentication Flow

Voxxy Presents uses **Firebase Authentication** as the primary authentication provider.

#### Sign Up Flow

1. User navigates to role-specific signup page:
   - `/signup/club-owner` - For event organizers
   - `/signup/venue-owner` - For venue owners

2. User fills out signup form with:
   - Email address
   - Password (min 6 characters, Firebase requirement)
   - Name
   - Role (automatically set based on route)

3. **Client-side validation** (Zod schema):
   - Email format validation
   - Password strength (min 6 chars)
   - Name is required

4. **Firebase Authentication** creates user account:
   - User created in Firebase Auth
   - Email verification email sent automatically

5. **Firestore user profile created** via `authService.ts`:
   - Document created in `users` collection with:
     - `email`, `name`, `role`
     - `betaStatus: 'pending'` (requires admin approval)
     - `createdAt`, `updatedAt` timestamps

6. User is redirected to `/beta-pending` page

**Code Reference:** [src/services/authService.ts](../src/services/authService.ts)

#### Login Flow

1. User navigates to role-specific login page:
   - `/login/club-owner`
   - `/login/venue-owner`
   - `/admin/login` (admins only)

2. User enters email and password

3. **Firebase Authentication** validates credentials:
   - Returns Firebase ID token on success

4. **Client fetches user profile** from Firestore:
   - Reads from `users/{uid}` document
   - Loads role, betaStatus, and other profile data

5. **Access control checks:**
   - If `betaStatus !== 'approved'` → Redirect to `/beta-pending`
   - If email not verified → Show email verification prompt
   - If approved and verified → Redirect to role-based dashboard

**Code Reference:** [src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx)

#### Email Verification

- Sent automatically on signup via Firebase
- Required for venue owners before accessing dashboard
- Can be resent via "Resend Verification" button
- Verified via Firebase action links (handled in URL params)

**Code Reference:** [src/components/auth/EmailVerificationPrompt.tsx](../src/components/auth/EmailVerificationPrompt.tsx)

---

### Role-Based Access Control (RBAC)

Voxxy Presents implements a **4-role system**:

| Role | Key | Description | Beta Approval Required? |
|------|-----|-------------|------------------------|
| **Admin** | `admin` | Platform administrators | No |
| **Organizer** | `organizer` | Event organizers (club owners) | Yes |
| **Venue Owner** | `venue_owner` | Venue listing owners | Yes |
| **Guest** | `user` | Regular users (attendees) | No (future) |

#### Role Assignment

- Roles are assigned during signup based on the signup route
- Stored in Firestore `users/{uid}` document
- Cannot be changed by the user (admin-only action)

#### Beta Access System

**Current Implementation:**
- All new signups (except admins) are assigned `betaStatus: 'pending'`
- Users with `betaStatus: 'pending'` are redirected to `/beta-pending`
- Admins can approve users via Admin Dashboard
- On approval, `betaStatus` is set to `'approved'` and `betaApprovedAt` timestamp is recorded

**Code Reference:** [src/components/auth/BetaAccessGuard.tsx](../src/components/auth/BetaAccessGuard.tsx)

---

### Protected Routes

The application uses two versions of protected route components:

#### ProtectedRouteV2 (Current Standard)

**Location:** [src/components/auth/ProtectedRouteV2.tsx](../src/components/auth/ProtectedRouteV2.tsx)

**Features:**
- Role-based access control
- Email verification requirement
- Beta approval requirement
- Flexible permission checks

**Usage Example:**
```tsx
<Route path="/venue-owner/dashboard" element={
  <ProtectedRouteV2
    requireApproval={true}
    allowedRoles={['venue_owner', 'admin']}
    requireEmailVerification={true}
  >
    <VenueOwnerDashboardNew />
  </ProtectedRouteV2>
} />
```

**Props:**
- `allowedRoles?: string[]` - List of roles that can access this route
- `requireEmailVerification?: boolean` - Require verified email
- `requireApproval?: boolean` - Require beta approval

**Redirect Logic:**
1. Not authenticated → Redirect to `/auth`
2. Needs email verification → Show verification prompt
3. Needs beta approval → Redirect to `/beta-pending`
4. Wrong role → Redirect to appropriate dashboard
5. All checks pass → Render children

---

## Application Routes & Access Control

### Public Routes (No Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Landing page |
| `/pricing` | PricingPage | Pricing information |
| `/features` | FeaturesPage | Feature overview |
| `/help` | HelpPage | Help documentation |
| `/contact` | ContactPage | Contact form |
| `/products` | ProductsPage | Product information |
| `/venue-owners` | VenueOwnerBenefitsPage | Venue owner marketing page |
| `/venue/:venueSlug` | VenueProfilePage | Public venue profile |
| `/shared-rsvps/:eventId` | SharedRSVPPage | Public event RSVP page |
| `/:orgSlug` | OrganizationPublic | Public organization profile |

---

### Authentication Routes (Redirect if Logged In)

| Route | Component | Description |
|-------|-----------|-------------|
| `/auth` | AuthTypePage | Auth type selection |
| `/signup/club-owner` | ClubOwnerSignUpPage | Organizer signup |
| `/signup/venue-owner` | VenueOwnerSignUpPage | Venue owner signup |
| `/login/club-owner` | ClubOwnerLoginPage | Organizer login |
| `/login/venue-owner` | VenueOwnerLoginPage | Venue owner login |
| `/admin/login` | AdminLogin | Admin login |

---

### Organizer Routes (Role: `organizer`)

**Base Path:** `/organizer/*`

| Route | Component | Requires Beta | Requires Email Verification | Description |
|-------|-----------|---------------|----------------------------|-------------|
| `/organizer/dashboard` | ProfilePage | Yes | No | Main dashboard |
| `/organizer/organizations` | ProfilePage | Yes | No | Manage organizations |
| `/organizer/events` | ProfilePage | Yes | No | Manage events |
| `/organizer/audience` | ProfilePage | Yes | No | Audience analytics |
| `/create-club` | CreateClubPage | Yes | Yes | Create new organization |
| `/:orgSlug/admin` | OrganizationAdminEnhanced | Yes | No | Organization admin panel |
| `/:orgSlug/create-event` | CreateEventPage | Yes | No | Create event for org |
| `/:orgSlug/edit-event/:eventId` | EditEventPage | Yes | No | Edit existing event |

---

### Venue Owner Routes (Role: `venue_owner`)

**Base Path:** `/venue-owner/*`

| Route | Component | Requires Beta | Requires Email Verification | Description |
|-------|-----------|---------------|----------------------------|-------------|
| `/venue-owner/dashboard` | VenueOwnerDashboardNew | Yes | Yes | Main dashboard |
| `/venue-owner/venues` | VenueOwnerDashboardNew | Yes | Yes | Manage venues |
| `/venue-owner/bookings` | VenueOwnerDashboardNew | Yes | Yes | View bookings |
| `/venue-owner/profile` | VenueOwnerDashboardNew | Yes | Yes | Profile settings |
| `/venues/create` | VenueCreatePage | No | Yes | Create new venue |
| `/venues/pending` | VenuePendingApprovalPage | No | Yes | Pending venue approval |

---

### Admin Routes (Role: `admin`)

| Route | Component | Requires Beta | Description |
|-------|-----------|---------------|-------------|
| `/admin` | AdminDashboard | No | Legacy admin dashboard |
| `/admin/dashboard` | AdminDashboard | No | Legacy admin dashboard |
| `/admin/v2` | AdminDashboardV2 | No | New admin dashboard |
| `/admin/approvals` | AdminDashboardV2 | No | Beta approval management |
| `/admin/users` | AdminDashboardV2 | No | User management |
| `/admin/content` | AdminDashboardV2 | No | Content moderation |

---

### Guest Routes (Role: `user` - Future Implementation)

| Route | Component | Description |
|-------|-----------|-------------|
| `/guest/dashboard` | GuestDashboard | Guest dashboard |
| `/guest/registrations` | GuestDashboard | Event registrations |
| `/guest/favorites` | GuestDashboard | Favorite events/orgs |
| `/guest/social` | GuestDashboard | Social features |

---

## User Personas & Workflows

### Persona 1: Event Organizer (Club Owner)

**Role:** `organizer`
**Primary Goals:** Create events, manage organization, engage audience

#### Signup & Onboarding Flow

1. **Visit signup page:** `/signup/club-owner`
2. **Fill out form:**
   - Email: `organizer@example.com`
   - Password: `SecurePass123`
   - Name: `Jane Organizer`
3. **Account created:**
   - Firebase Auth user created
   - Firestore user document created with `role: 'organizer'`, `betaStatus: 'pending'`
   - Email verification sent
4. **Redirected to:** `/beta-pending`
5. **Admin approves beta access** via Admin Dashboard
6. **User receives approval** (via email or dashboard notification)
7. **Login again:** User logs in at `/login/club-owner`
8. **Redirected to:** `/organizer/dashboard`

#### Main Dashboard Workflow

**Route:** `/organizer/dashboard`

**Features Available:**
1. **Organizations Tab:**
   - View list of organizations user owns
   - Create new organization (`/create-club`)
   - Edit organization details
   - View organization analytics

2. **Events Tab:**
   - View upcoming and past events
   - Create new event for organization
   - Edit existing events
   - View RSVP counts and attendee lists

3. **Audience Tab:**
   - View attendee demographics
   - Email campaign management
   - Engagement analytics

**Key Actions:**
- **Create Organization:** Navigate to `/create-club`, fill form, submit
- **Create Event:** Navigate to `/:orgSlug/create-event`, fill form, submit
- **View Organization Page:** Navigate to `/:orgSlug` (public view)
- **Edit Event:** Navigate to `/:orgSlug/edit-event/:eventId`
- **Send Email Campaign:** Use campaign builder in dashboard

---

### Persona 2: Venue Owner

**Role:** `venue_owner`
**Primary Goals:** List venue, manage availability, receive bookings

#### Signup & Onboarding Flow

1. **Visit signup page:** `/signup/venue-owner`
2. **Fill out form:**
   - Email: `venue@example.com`
   - Password: `VenuePass456`
   - Name: `John Venue`
3. **Account created:**
   - Firebase Auth user created
   - Firestore user document created with `role: 'venue_owner'`, `betaStatus: 'pending'`
   - Email verification sent
4. **Redirected to:** `/beta-pending`
5. **Verify email** via link in email
6. **Admin approves beta access** via Admin Dashboard
7. **Login again:** User logs in at `/login/venue-owner`
8. **Redirected to:** `/venue-owner/dashboard`

#### Main Dashboard Workflow

**Route:** `/venue-owner/dashboard`

**Features Available:**
1. **Venues Tab:**
   - View list of owned venues
   - Create new venue (`/venues/create`)
   - Edit venue details
   - View venue analytics (views, inquiries)

2. **Bookings Tab:**
   - View pending booking inquiries
   - Approve/decline bookings
   - View booking calendar

3. **Profile Tab:**
   - Edit user profile
   - Update contact information
   - Notification settings

**Key Actions:**
- **Create Venue:** Navigate to `/venues/create`, fill form (name, address, capacity, pricing, photos), submit
- **Venue Approval Status:** If pending, redirected to `/venues/pending`
- **Edit Venue:** Click edit on venue card
- **View Public Profile:** Navigate to `/venue/:venueSlug`

**Email Verification Requirement:**
- Venue owners MUST verify email before accessing dashboard
- Enforced via `requireEmailVerification={true}` in ProtectedRouteV2

---

### Persona 3: Platform Administrator

**Role:** `admin`
**Primary Goals:** Approve users, manage content, monitor platform

#### Login Flow

1. **Visit admin login:** `/admin/login`
2. **Enter admin credentials:**
   - Email: `admin@voxxypresents.com`
   - Password: `AdminSecurePass789`
3. **Authenticated:**
   - Firebase ID token issued
   - Admin role verified
4. **Redirected to:** `/admin/dashboard`

#### Admin Dashboard Workflow

**Route:** `/admin/dashboard` (Legacy) or `/admin/v2` (New)

**Features Available:**

1. **User Management Tab (`/admin/users`):**
   - View all users
   - Filter by role (`organizer`, `venue_owner`, `user`)
   - Filter by beta status (`pending`, `approved`, `rejected`)
   - Edit user details
   - Delete users (with confirmation)

2. **Beta Approvals Tab (`/admin/approvals`):**
   - View pending beta access requests
   - Approve/reject beta access
   - View approval history
   - Send approval/rejection emails

3. **Content Moderation Tab (`/admin/content`):**
   - Review flagged organizations
   - Review flagged events
   - Review flagged venues
   - Approve/reject content
   - Ban content creators

4. **Analytics:**
   - Total users by role
   - Total organizations, events, venues
   - Recent signups
   - Platform activity metrics

**Key Actions:**
- **Approve Beta Access:** Click "Approve" on pending user → User's `betaStatus` set to `'approved'`
- **Reject Beta Access:** Click "Reject" on pending user → User's `betaStatus` set to `'rejected'`
- **Delete User:** Click "Delete" on user → Firestore document deleted, Firebase Auth user deleted (admin action)
- **View User Details:** Click on user row → Modal with full user profile

**Important Security Note:**
- Admin role must be manually assigned in Firestore (cannot be set via signup)
- No public admin signup route exists

---

### Persona 4: Guest/Attendee (Future)

**Role:** `user`
**Primary Goals:** Discover events, RSVP, receive notifications

**Status:** In development
**Routes:** `/guest/*` routes are defined but dashboard is placeholder

**Planned Features:**
- Browse public events
- RSVP to events
- View RSVP history
- Receive event reminders
- Follow organizations
- Social features (future)

---

## API Endpoints

The API server (`voxxy-presents-api`) runs on port **3001** and provides the following endpoints:

### Base URL

- **Development:** `http://localhost:3001`
- **Production:** TBD (configured via environment variable)

### Authentication

All protected endpoints require a Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase_id_token>
```

**Middleware:** [src/middleware/auth.ts](../../../voxxy-presents-api/src/middleware/auth.ts)

The middleware:
1. Extracts token from `Authorization` header
2. Verifies token with Firebase Admin SDK
3. Fetches user profile from Firestore
4. Attaches `req.user` and `req.uid` to request object
5. Returns 401 if token is invalid or expired

---

### Endpoints by Resource

#### Users (`/api/users`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/users/me` | Yes | Get current user profile |
| PUT | `/api/users/me` | Yes | Update current user profile |
| GET | `/api/users/:userId` | Yes | Get user by ID (admin only) |

**File:** [src/routes/users.ts](../../../voxxy-presents-api/src/routes/users.ts)

---

#### Organizations (`/api/organizations`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/organizations` | No | List all active organizations |
| GET | `/api/organizations/:orgId` | No | Get organization by ID |
| POST | `/api/organizations` | Yes | Create new organization |
| PUT | `/api/organizations/:orgId` | Yes | Update organization |
| DELETE | `/api/organizations/:orgId` | Yes | Delete organization (admin only) |

**File:** [src/routes/organizations.ts](../../../voxxy-presents-api/src/routes/organizations.ts)

**Authorization:**
- Create: Must be `organizer` or `admin`
- Update: Must be owner or `admin`
- Delete: Must be `admin`

---

#### Events (`/api/events`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/events` | No | List all public events |
| GET | `/api/events/:eventId` | No | Get event by ID |
| POST | `/api/events` | Yes | Create new event |
| PUT | `/api/events/:eventId` | Yes | Update event |
| DELETE | `/api/events/:eventId` | Yes | Delete event |

**File:** [src/routes/events.ts](../../../voxxy-presents-api/src/routes/events.ts)

**Authorization:**
- Create: Must be `organizer` or `admin`, must own organization
- Update: Must be owner or `admin`
- Delete: Must be owner or `admin`

---

#### Venues (`/api/venues`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/venues` | No | List all approved venues |
| GET | `/api/venues/:venueId` | No | Get venue by ID |
| POST | `/api/venues` | Yes | Create new venue |
| PUT | `/api/venues/:venueId` | Yes | Update venue |
| DELETE | `/api/venues/:venueId` | Yes | Delete venue |

**File:** [src/routes/venues.ts](../../../voxxy-presents-api/src/routes/venues.ts)

**Authorization:**
- Create: Must be `venue_owner` or `admin`
- Update: Must be owner or `admin`
- Delete: Must be owner or `admin`

---

#### Vendors (`/api/vendors`)

Vendors are the new schema for venue owners' business profiles.

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/vendors` | No | List all approved vendors |
| GET | `/api/vendors/:vendorId` | No | Get vendor by ID |
| POST | `/api/vendors` | Yes | Create new vendor |
| PUT | `/api/vendors/:vendorId` | Yes | Update vendor |
| DELETE | `/api/vendors/:vendorId` | Yes | Delete vendor |

**File:** [src/routes/vendors.ts](../../../voxxy-presents-api/src/routes/vendors.ts)

---

#### Registrations (`/api/registrations`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/registrations` | Yes | Get user's registrations |
| POST | `/api/registrations` | No | Create new RSVP (public or authenticated) |
| GET | `/api/registrations/:registrationId` | Yes | Get registration details |
| DELETE | `/api/registrations/:registrationId` | Yes | Cancel registration |

**File:** [src/routes/registrations.ts](../../../voxxy-presents-api/src/routes/registrations.ts)

**Note:** RSVP creation can be public (for guest RSVPs) or authenticated (for logged-in users)

---

#### Budgets (`/api/budgets`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/budgets/:eventId` | Yes | Get budget for event |
| POST | `/api/budgets` | Yes | Create budget |
| PUT | `/api/budgets/:budgetId` | Yes | Update budget |

**File:** [src/routes/budgets.ts](../../../voxxy-presents-api/src/routes/budgets.ts)

---

#### Email Campaigns (`/api/campaigns`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/campaigns/send` | Yes | Send email campaign |
| GET | `/api/campaigns/:campaignId` | Yes | Get campaign details |

**File:** [src/routes/campaigns.ts](../../../voxxy-presents-api/src/routes/campaigns.ts)

**Authorization:** Must be `organizer` or `admin`, must own organization

**Email Provider:** SendGrid

---

#### Tickets (`/api/tickets`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/tickets/generate` | Yes | Generate QR code ticket |
| GET | `/api/tickets/:ticketId` | Yes | Get ticket details |

**File:** [src/routes/tickets.ts](../../../voxxy-presents-api/src/routes/tickets.ts)

---

#### Admin (`/api/admin`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/admin/users` | Yes (admin) | List all users |
| PUT | `/api/admin/users/:userId/beta-status` | Yes (admin) | Update user beta status |
| DELETE | `/api/admin/users/:userId` | Yes (admin) | Delete user |
| GET | `/api/admin/stats` | Yes (admin) | Platform statistics |

**File:** [src/routes/admin.ts](../../../voxxy-presents-api/src/routes/admin.ts)

**Authorization:** All routes require `admin` role

---

## Data Models & Security

### Firestore Collections

#### `users` Collection

**Document ID:** Firebase Auth UID

**Schema:**
```typescript
{
  id: string // Same as Firebase Auth UID
  email: string
  name?: string
  role: 'admin' | 'organizer' | 'venue_owner' | 'user'

  // Beta Access Control
  betaStatus: 'pending' | 'approved' | 'rejected'
  betaRequestedAt?: Date
  betaApprovedAt?: Date
  betaApprovedBy?: string // Admin UID

  // Profile
  profilePicture?: string
  bio?: string

  // Permissions
  organizationIds: string[] // Organizations user owns/manages

  // Settings
  emailNotifications: boolean

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

**Security Considerations:**
- User documents are created server-side (via authService)
- Role cannot be changed by user (admin-only action)
- Email verification status stored in Firebase Auth, not Firestore
- Beta status is checked on every protected route access

---

#### `organizations` Collection

**Document ID:** Auto-generated

**Schema:**
```typescript
{
  id: string
  name: string
  slug: string // URL-friendly unique identifier
  description: string
  background: string
  logoUrl?: string
  bannerUrl?: string
  aboutImages?: string[]
  contactEmail: string
  socialLinks: {
    instagram?: string
    website?: string
    linktree?: string
    venmo?: string
  }
  settings: {
    defaultLocation: string
    defaultAddress: string
    theme: { primaryColor, backgroundColor }
    emailConfiguration?: {...}
  }
  status: 'active' | 'inactive' | 'pending'
  ownerId: string // User UID
  createdAt: Date
  updatedAt: Date
}
```

**Security Considerations:**
- `slug` must be unique (enforced server-side)
- Only owner or admin can edit
- Public organizations have status `'active'`

---

#### `events` Collection

**Document ID:** Auto-generated

**Schema:**
```typescript
{
  id: string
  organizationId: string
  title: string
  description: string
  fullDescription: string
  tags?: string[]
  heroImageUrl?: string

  // Date/Time
  date: Date
  endDate?: Date
  time: string

  // Location
  location: string
  address: string
  venueId?: string

  // Pricing
  price: {
    type: 'free' | 'paid' | 'group_deal'
    amount?: number
    description: string
  }

  // Capacity
  capacity?: number
  registrationRequired: boolean

  // Status
  status: 'draft' | 'published' | 'presale' | 'cancelled'

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

**Security Considerations:**
- Event owners verified via `organizationId` lookup
- Only organization owner or admin can edit

---

#### `venues` Collection

**Document ID:** Auto-generated

**Schema:**
```typescript
{
  id: string
  name: string
  slug: string // URL-friendly identifier
  ownerId: string // User UID of venue_owner
  description: string
  address: string
  city: string
  state: string
  zipCode: string

  // Capacity
  capacity: number
  minCapacity?: number

  // Pricing
  hourlyRate?: number
  dailyRate?: number

  // Amenities
  amenities: string[]

  // Media
  photos: string[]
  virtualTourUrl?: string

  // Approval
  approvalStatus: 'pending' | 'approved' | 'rejected'

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

**Security Considerations:**
- Only venue owner or admin can create/edit
- Venue owner must verify email before creating venue
- New venues require approval (future feature)

---

### Firestore Security Rules

**Note:** Firestore security rules are managed in the Firebase Console and are NOT stored in this repository.

**Recommended Rules to Audit:**

1. **users collection:**
   - Users can read their own document
   - Only admins can write to other users' documents
   - Role changes require admin

2. **organizations collection:**
   - Anyone can read published organizations
   - Only owner or admin can write

3. **events collection:**
   - Anyone can read published events
   - Only organization owner or admin can write

4. **venues collection:**
   - Anyone can read approved venues
   - Only owner or admin can write

5. **registrations collection:**
   - Users can read their own registrations
   - Event organizers can read registrations for their events
   - Anyone can create registrations (for public RSVPs)

**Action Item for Audit:** Request access to Firebase Console to review security rules.

---

## Known Security Considerations

### 1. Firebase API Key Exposure

**Issue:** Firebase Web API key is visible in client-side bundle.

**Status:** Expected behavior per Firebase documentation.

**Mitigation:**
- API key is restricted to authorized domains in Google Cloud Console
- Firebase Security Rules enforce data access control
- API key identifies project, not authorize access

**Recommendation:** Verify API key restrictions in Google Cloud Console.

**Reference:** [.env.local:9](../.env.local#L9)

---

### 2. SendGrid API Key

**Issue:** SendGrid API key stored in `.env.local`.

**Status:** `.env.local` is gitignored (confirmed).

**Mitigation:**
- Environment file is not committed to repository
- API key is server-side only (not in client bundle)

**Recommendation:**
- Verify `.env.local` is in `.gitignore`
- Consider using environment variable management service (e.g., Doppler, AWS Secrets Manager)
- Rotate SendGrid key if ever exposed

---

### 3. Admin Role Assignment

**Issue:** No safeguards against manual admin role assignment.

**Status:** Admin role must be manually set in Firestore (no public signup).

**Mitigation:**
- No API endpoint to change user role
- Firestore security rules should prevent role changes
- Admin login uses same Firebase Auth (no separate admin system)

**Recommendation:**
- Audit Firestore security rules for role modification
- Consider admin invite system with email verification
- Add audit logging for admin actions

---

### 4. Beta Approval Bypass

**Issue:** Users could potentially modify their own `betaStatus` in Firestore.

**Status:** Protected by Firestore security rules (assumed).

**Mitigation:**
- Client-side checks are for UX, not security
- Server-side checks in API middleware
- Firestore rules should prevent user self-approval

**Recommendation:**
- Verify Firestore security rules prevent `betaStatus` modification by users
- Add server-side beta status check in API middleware

---

### 5. CORS Configuration

**Issue:** CORS is enabled in API server.

**Status:** Required for SPA to communicate with API.

**Current Configuration:** [src/app.ts](../../../voxxy-presents-api/src/app.ts) (assumed - file not read)

**Recommendation:**
- Verify CORS origin is restricted to production domains
- Ensure credentials are handled securely
- Review preflight request handling

---

### 6. Rate Limiting

**Issue:** No rate limiting observed in API routes.

**Status:** Not implemented.

**Risk:**
- Brute force attacks on authentication
- DoS attacks on API endpoints
- Email spam via campaign endpoints

**Recommendation:**
- Implement rate limiting middleware (e.g., `express-rate-limit`)
- Apply stricter limits on sensitive endpoints (login, signup, email)

---

### 7. Input Validation

**Issue:** Input validation is handled by Zod schemas.

**Status:** Implemented client-side and server-side (assumed).

**Recommendation:**
- Verify all API endpoints validate input with Zod
- Check for SQL injection risk (N/A - using Firestore)
- Check for XSS risk in user-generated content (organization names, event descriptions)

---

### 8. Email Verification Enforcement

**Issue:** Email verification is only enforced for venue owners.

**Status:** By design.

**Recommendation:**
- Consider enforcing email verification for all users
- Add email verification requirement before beta approval

---

### 9. Password Reset Flow

**Issue:** Password reset uses Firebase Auth flow.

**Status:** Standard Firebase implementation.

**Recommendation:**
- Verify password reset emails are sent securely
- Check for account enumeration vulnerability (Firebase handles this)

---

### 10. Session Management

**Issue:** Firebase ID tokens expire after 1 hour.

**Status:** Standard Firebase behavior.

**Mitigation:**
- Firebase SDK auto-refreshes tokens
- Client detects expired tokens and prompts re-login

**Recommendation:**
- Verify token refresh logic works correctly
- Consider adding "Remember Me" functionality

---

## Environment Configuration

### Client Environment Variables

**File:** `.env.local`, `.env.development`, `.env.staging`, `.env.production`

**Required Variables:**
```bash
# Environment
VITE_ENVIRONMENT=development|staging|production

# Firebase Configuration
VITE_FIREBASE_API_KEY=<firebase_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://<project>.firebaseio.com
VITE_FIREBASE_PROJECT_ID=<project_id>
VITE_FIREBASE_STORAGE_BUCKET=<project>.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender_id>
VITE_FIREBASE_APP_ID=<app_id>
VITE_FIREBASE_MEASUREMENT_ID=<measurement_id>

# API Configuration (optional - defaults to Firebase)
VITE_API_BASE_URL=http://localhost:3001

# Feature Flags
VITE_DEBUG_MODE=true|false
VITE_EXPERIMENTAL_FEATURES=true|false

# Email (client-side - deprecated, should be server-side only)
SENDGRID_API_KEY=<sendgrid_key> # ⚠️ Should not be in client env
FROM_EMAIL=<from_email>
```

**Security Notes:**
- Firebase keys are public (expected)
- SendGrid key should NOT be in client environment files
- `.env.local` is gitignored

---

### API Environment Variables

**File:** `.env` (API repository)

**Required Variables:**
```bash
# Environment
NODE_ENV=development|production
PORT=3001

# Firebase Admin SDK
FIREBASE_PROJECT_ID=<project_id>
FIREBASE_CLIENT_EMAIL=<service_account_email>
FIREBASE_PRIVATE_KEY=<service_account_private_key>
# OR
GOOGLE_APPLICATION_CREDENTIALS=<path_to_service_account_json>

# SendGrid
SENDGRID_API_KEY=<sendgrid_key>
FROM_EMAIL=<from_email>

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://voxxypresents.com
```

**Security Notes:**
- Firebase private key should NEVER be committed
- Use service account JSON file or environment variables
- Restrict CORS origins to production domains

---

## Testing & Development Setup

### Prerequisites

- Node.js 18+ (both client and API)
- npm or yarn
- Firebase account with project setup
- SendGrid account (optional for email features)

### Client Setup

```bash
cd voxxy-presents-client
npm install
cp .env.development.example .env.local
# Edit .env.local with your Firebase credentials
npm run dev
```

**Dev Server:** `http://localhost:3000`

### API Setup

```bash
cd voxxy-presents-api
npm install
cp .env.example .env
# Edit .env with your Firebase service account credentials
npm run dev
```

**API Server:** `http://localhost:3001`

### Running Tests

**Client:**
```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run tests with UI
```

**API:**
```bash
npm run test          # (Not yet implemented)
```

### Security Checks

**Client:**
```bash
npm run security-check   # Run security audit script
```

**API:**
```bash
npm run security-check   # Run security audit script
```

---

## Contact Information

**Project Owner:** Courtney Greer
**Repository (Client):** `voxxy-presents-client`
**Repository (API):** `voxxy-presents-api`

**Questions During Audit:**
Please document all findings and questions. We will schedule a follow-up meeting to discuss the audit results.

---

## Appendix A: Key Files for Security Review

### Client Application

**Authentication & Authorization:**
- [src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx)
- [src/services/authService.ts](../src/services/authService.ts)
- [src/components/auth/ProtectedRouteV2.tsx](../src/components/auth/ProtectedRouteV2.tsx)
- [src/components/auth/BetaAccessGuard.tsx](../src/components/auth/BetaAccessGuard.tsx)

**Routing:**
- [src/App.tsx](../src/App.tsx)

**Type Definitions:**
- [src/types/database.ts](../src/types/database.ts)

**Configuration:**
- [src/lib/firebase.ts](../src/lib/firebase.ts)

**Environment:**
- [.env.local](../.env.local) (local development)
- [.env.production.example](../.env.production.example) (template)

---

### API Server

**Authentication Middleware:**
- `src/middleware/auth.ts`

**Routes:**
- `src/routes/*.ts` (all route files)

**Main Application:**
- `src/index.ts`
- `src/app.ts` (assumed)

**Configuration:**
- `src/config/firebase.ts` (assumed)

**Environment:**
- `.env` (not committed)

---

## Appendix B: Deployment Information

**Client Deployment:**
- Build command: `npm run build:production`
- Build output: `dist/`
- Deployment: Static hosting (Vercel/Netlify/Firebase Hosting)

**API Deployment:**
- Build command: `npm run build`
- Build output: `dist/`
- Deployment: Node.js server (TBD - likely Cloud Run or Heroku)

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-30 | Claude (AI Assistant) | Initial security audit guide created |

---

**End of Document**
