# Venue Owner (Producer) - Quick Reference Guide

## What is a Venue Owner?

A **venue_owner** is an event producer who manages events and vendor applications. In the UI, they're called "Producers" for clarity.

## Key Flows

### Authentication
```
Login/Signup → JWT Token → Fetch User Profile (role: 'venue_owner')
→ Redirect to /producer/pending (Producer Dashboard)
```

### Create Event
```
Dashboard → Click "Create New Event" 
→ Fill form (title, date, location, description)
→ Submit → Event appears in list
```

### Manage Vendors
```
Event → Command Center → Applications Tab
→ Create vendor application form
→ Get shareable link → Share with vendors
→ Vendors submit (no account needed)
→ Vendors Tab: Approve/Reject/Confirm submissions
```

## Routes & Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/login` | LoginPage | Login with email/password |
| `/producer/pending` | ProducerDashboard | Main dashboard - events & settings |
| `/events/{slug}/apply` | VendorApplicationForm | Public vendor application (no auth) |
| `/applications/track/{code}` | ApplicationTrackingPage | Check application status (no auth) |

## Main Components

**Dashboard Navigation:**
- **Events Tab** - Create, edit, delete events
- **Settings Tab** - Profile & notification preferences

**Event Command Center** (4 tabs):
1. **Messages** - Post announcements (mock data, pending backend)
2. **Applications** - Create vendor application forms & see submissions
3. **Vendors** - Manage vendor approvals & rejections
4. **Settings** - Control event visibility, registration, capacity

## Key Features

### Event Management (Full CRUD)
- Create event with: title, description, date, location
- Edit or delete events
- Status: draft, published, cancelled, completed

### Vendor Applications
- Create custom vendor application forms
- Define vendor categories (catering, photography, etc.)
- Generate shareable links (format: `/apply/{code}`)
- Vendors apply without account - get ticket code
- Track submissions with status: pending → approved/rejected/waitlist/confirmed

### Organization
- Auto-created on first login
- Contains all user's events
- Can view/update org details

## API Calls Quick Reference

### Authentication
```typescript
POST /login → Get JWT token
GET /me → Get current user (includes role)
DELETE /logout → Clear session
```

### Organizations
```typescript
GET /api/v1/presents/me/organization → Get my org
POST /api/v1/presents/organizations → Create org (auto on first login)
PATCH /api/v1/presents/organizations/:slug → Update org
```

### Events
```typescript
GET /api/v1/presents/organizations/:slug/events → List my events
POST /api/v1/presents/organizations/:slug/events → Create event
PATCH /api/v1/presents/events/:slug → Update event
DELETE /api/v1/presents/events/:slug → Delete event
```

### Vendor Applications
```typescript
GET /api/v1/presents/events/:slug/vendor_applications → List applications
POST /api/v1/presents/events/:slug/vendor_applications → Create application
GET /api/v1/presents/vendor_applications/:id/submissions → View submissions
PATCH /api/v1/presents/registrations/:id → Approve/reject vendor
```

### Public (No Auth Required)
```typescript
GET /api/v1/presents/vendor_applications/lookup/:code → Get event by code
POST /api/v1/presents/events/:slug/registrations → Submit vendor application
GET /api/v1/presents/registrations/track/:code → Check application status
```

## User Flow Diagram

```
Venue Owner                          Backend
   |                                   |
   |-- Sign Up (email, password) ------>|
   |<-- Redirect to /login -----------|
   |                                   |
   |-- Login --->|                     |
   |          POST /login              |
   |<-------- JWT token -----<--|
   |          GET /me                  |
   |<-- User profile (role: venue_owner) -<--|
   |                                   |
   |-- Redirect /producer/pending      |
   |                                   |
   |-- Create Event -->|               |
   |             POST /organizations/.../events
   |<-- Event created -----<--|
   |                                   |
   |-- Create Vendor App ->|           |
   |    POST /events/.../vendor_applications
   |<-- shareable_code ----<--|
   |                          |
   |-- Copy Link & Share      |
   |       (public link sent)  |
   |                          |
   |<-- Vendor Submits (no account needed)
   |    POST /events/.../registrations
   |<-- ticket_code -----<--|
   |                          |
   |-- Vendor Tab            |
   |    View Submissions      |
   |    PATCH /registrations/:id (approve/reject)
   |                          |
   |-- Logout                 |
   |    DELETE /logout        |
   |<-- Token cleared -----<--|
```

## Important Notes

1. **Unified Login** - All user types use `/login`, no role-specific login pages
2. **Auto Organization** - Org auto-created on first login if doesn't exist
3. **Role Mapping** - Backend: `venue_owner`, Frontend display: "Producer"
4. **Public Sharing** - Vendors can apply without account via shareable links
5. **JWT Auth** - All API calls (except public endpoints) include `Authorization: Bearer {token}`

## What's Not Yet Implemented

- Message board backend integration
- Event settings save functionality
- User profile save functionality
- Email notifications for approvals
- Venue/space management system
- Pagination for large event lists

## Helper Functions from AuthContext

```typescript
// Available in components
const { userProfile, isProducer, isVendor, isAuthenticated } = useAuth()

isProducer  // true if role is 'producer' or 'venue_owner'
isVendor    // true if role is 'vendor'
hasRole('venue_owner')  // Check specific role
```

---

**Files to Know:**
- Dashboard: `/src/pages/ProducerDashboard.tsx`
- Auth: `/src/contexts/AuthContext.tsx`
- Components: `/src/components/producer/`
- API: `/src/services/api.ts`
- Docs: `/docs/ROLE_MAPPING.md`, `/docs/PRODUCER_FLOW_STATUS.md`
