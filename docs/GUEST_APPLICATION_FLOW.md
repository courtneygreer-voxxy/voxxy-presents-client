# Voxxy Presents: Guest/Attendee Application Process Analysis

## Executive Summary

The Voxxy Presents application provides a **public-facing guest application system** that allows non-logged-in users to apply for vendor spots at events and track their application status. The system is designed for **vendor applications** (businesses applying to participate in events), not traditional guest/attendee RSVP functionality.

Currently, there is **NO traditional guest registration system** for general event attendees. The application is primarily focused on:
1. Vendor application management (public form)
2. Application tracking (public lookup)
3. Producer/venue owner management of applications

---

## Guest User Journey Overview

### Current Guest Capabilities

The Voxxy Presents application supports **unauthenticated vendor applications** through a simple workflow:

```
Browse Event → View Event Details → Apply as Vendor → Confirmation → Track Status
```

### What is NOT Supported for Guests

- General event RSVP or attendance registration
- Ticket purchasing through the platform (redirects to external ticket URL)
- Guest account creation for non-vendors
- Email-based guest management

---

## Detailed Guest User Journey

### Stage 1: Discovering Events

**Public Route:** `/events/:slug`  
**Component:** `PublicEventDetailPage`  
**Authentication:** Not required

#### What Guests Can Do:
- View public event details (name, description, date, time, location)
- See event capacity (total registered/remaining attendees)
- View ticket pricing and external ticket URL
- See if the event has vendor opportunities

#### Key Information Displayed:
- Event title, description, and poster image
- Date and time (formatted for user's locale)
- Location
- Capacity information (registered / total)
- Ticket price and "Get Tickets" button (links to external ticket_url)
- Organization/Producer name

#### API Endpoint Used:
```
GET /api/v1/presents/events/:slug
Authentication: Not required
```

---

### Stage 2: Applying as Vendor

**Public Routes:**
- `/events/:slug/apply` - Vendor application form
- `/apply/:code` - Short link redirect to application

**Components:** 
- `VendorApplicationForm`
- `ShortLinkRedirectPage`

**Authentication:** Not required

#### Vendor Application Form

The main vendor application flow for guests:

**Page:** `/events/:slug/apply`

**Form Fields:**
1. **Email Address** (required)
2. **Phone Number** (optional)
3. **Business Name** (required)
4. **Vendor Category** (required dropdown)
5. **Newsletter Subscription** (checkbox, default enabled)

#### API Endpoint Used (Public, No Auth):
```
POST /api/v1/presents/events/:slug/registrations
Authentication: Not required

Request Body:
{
  "registration": {
    "email": "vendor@business.com",
    "phone": "(555) 123-4567",
    "business_name": "My Catering Company",
    "vendor_category": "Food & Beverage",
    "vendor_application_id": 42,
    "subscribed": true
  }
}

Response:
{
  "id": 123,
  "ticket_code": "APP-ABC123XYZ",
  "email": "vendor@business.com",
  "business_name": "My Catering Company",
  "vendor_category": "Food & Beverage",
  "status": "pending",
  "created_at": "2025-11-24T10:30:00Z",
  "event": { id, slug, title, ... }
}
```

---

### Stage 3: Application Confirmation

**Public Route:** `/applications/success?ticket_code=APP-ABC123XYZ&event=event-slug`  
**Component:** `ApplicationConfirmationPage`  
**Authentication:** Not required

#### What Guests See:
- Success message and confirmation icon
- **Application ID (Ticket Code)** - displayed prominently for tracking
- Instructions on what happens next
- Two action buttons:
  - "Track Application Status"
  - "Back to Event"

---

### Stage 4: Tracking Application Status

**Public Route:** `/applications/track/:ticketCode`  
**Component:** `ApplicationTrackingPage`  
**Authentication:** Not required

#### What Guests Can Do:
- Look up their application by ticket code
- View current application status
- See detailed application information
- View event details

#### Application Status Options:
1. **Pending** (blue) - Under review
2. **Approved** (green) - Approved with next steps
3. **Rejected** (red) - Not selected
4. **Waitlist** (yellow) - On waitlist
5. **Confirmed** (purple) - Spot confirmed

#### API Endpoint Used (Public, No Auth):
```
GET /api/v1/presents/registrations/track/:ticket_code
Authentication: Not required
```

---

### Stage 5: Short Link Vendor Application

**Public Route:** `/apply/:code`  
**Component:** `ShortLinkRedirectPage`  
**Authentication:** Not required

#### Purpose:
Allows producers to share shortened, branded links for vendor applications.

#### How It Works:
1. Guest clicks a short link like `voxxypresents.com/apply/ABC123`
2. Page fetches event data using the code
3. Automatically redirects to `/events/:slug/apply` for the actual application
4. Guest proceeds with normal vendor application flow

#### API Endpoint Used (Public, No Auth):
```
GET /api/v1/presents/vendor_applications/lookup/:code
Authentication: Not required
```

---

## Public Routes Summary

### Guest-Accessible Routes (No Authentication Required)

| Route | Purpose | Component | Auth |
|-------|---------|-----------|------|
| `/events/:slug` | View event details and discover vendor opportunities | `PublicEventDetailPage` | ❌ No |
| `/events/:slug/apply` | Submit vendor application | `VendorApplicationForm` | ❌ No |
| `/applications/success` | Confirm successful application submission | `ApplicationConfirmationPage` | ❌ No |
| `/applications/track/:ticketCode` | Track application status | `ApplicationTrackingPage` | ❌ No |
| `/apply/:code` | Redirect from short link to vendor application | `ShortLinkRedirectPage` | ❌ No |
| `/` | Homepage with event discovery | `HomePage` | ❌ No |

---

## API Endpoints for Guest Functions

### Public (No Auth Required) Endpoints

#### 1. Get Event Details
```
GET /api/v1/presents/events/:slug
Purpose: View public event information
Authentication: Not required
```

#### 2. Submit Vendor Application
```
POST /api/v1/presents/events/:slug/registrations
Purpose: Guest submits vendor application
Authentication: Not required
Required fields: email, business_name, vendor_category, vendor_application_id
```

#### 3. Track Application Status
```
GET /api/v1/presents/registrations/track/:ticket_code
Purpose: Look up application status by ticket code
Authentication: Not required
```

#### 4. Lookup Event by Shareable Code
```
GET /api/v1/presents/vendor_applications/lookup/:code
Purpose: Resolve short link to event
Authentication: Not required
```

---

## Data Models

### Registration/Application Object

```typescript
interface Registration {
  id: number
  ticket_code: string        // Unique tracking code
  email: string
  business_name: string
  vendor_category: string
  status: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed'
  created_at: string         // ISO 8601 timestamp
  event: {
    id: number
    title: string
    slug: string
    dates: { start?: string }
    location?: string
  }
}
```

### Event Object (as seen by guests)

```typescript
interface Event {
  id: number
  title: string
  slug: string
  description?: string
  dates: { start?: string, end?: string }
  location?: string
  poster_url?: string
  ticket_url?: string        // External ticket link
  pricing: { ticket_price?: number, currency: string }
  capacity: {
    total?: number
    registered?: number
    remaining?: number
    is_full?: boolean
  }
  organization: {
    id: number
    name: string
    city?: string
    state?: string
  }
  vendor_application?: {      // Only if event accepts vendors
    id: number
    name: string
    description?: string
    categories: string[]
    submissions_count: number
  }
}
```

---

## User Flow Diagram

```
GUEST USER JOURNEY

1. DISCOVERY
   ├─ Guest visits voxxypresents.com (HomePage)
   └─ Discovers event link

2. EVENT DETAILS
   ├─ Route: /events/:slug
   ├─ API: GET /v1/presents/events/:slug (public)
   └─ Sees vendor opportunities section with "Apply as Vendor" button

3. APPLICATION
   ├─ Route: /events/:slug/apply
   ├─ Form Fields:
   │  ├─ Email (required)
   │  ├─ Phone (optional)
   │  ├─ Business Name (required)
   │  ├─ Vendor Category (required, dropdown)
   │  └─ Newsletter Subscription (checkbox)
   ├─ API: POST /v1/presents/events/:slug/registrations (public)
   └─ Receives ticket_code in response

4. CONFIRMATION
   ├─ Route: /applications/success?ticket_code=...&event=...
   ├─ Displays: Application ID (ticket code) for tracking
   └─ Options: "Track Application" or "Back to Event"

5. TRACKING
   ├─ Route: /applications/track/:ticketCode
   ├─ API: GET /v1/presents/registrations/track/:ticket_code (public)
   └─ Displays: Current status, details, event information

6. SHORTCUT
   ├─ Route: /apply/:code (optional)
   ├─ API: GET /v1/presents/vendor_applications/lookup/:code (public)
   └─ Redirects to Step 3 (Application Form)
```

---

## Key Features Summary

### For Guests/Vendors

✅ **Can do:**
- Browse events without account
- View event details (date, time, location, capacity)
- Apply for vendor opportunities
- Track application status using unique ticket code
- Receive confirmation with tracking code
- Get email notifications (if subscribed)

❌ **Cannot do:**
- Create account without contacting support (beta access)
- Purchase tickets through platform (external link provided)
- RSVP as general attendee (vendor-only application)
- Access any authenticated features
- View producer dashboard

### For Producers (With Auth)

- Create events with vendor application opportunities
- Define vendor categories
- View all vendor applications for their events
- Update application statuses (pending → approved/rejected/waitlist/confirmed)
- See submission count and metrics
- Filter applications by category and status

---

## Current Limitations (As Designed)

1. **No General Guest RSVP**: System is vendor-focused, not attendee-focused
2. **No Ticket Sales**: Directs guests to external ticketing platform
3. **No Guest Accounts**: No self-service account creation (beta access only)
4. **No In-App Messaging**: Communication happens via email
5. **No Event Discovery API**: No search/filter for guests (must know event slug)
6. **No Guest List Management**: No attendee count tracking (only vendor tracking)

---

## Files & Components Reference

### Pages
- `/src/pages/PublicEventDetailPage.tsx` - Event detail view
- `/src/pages/VendorApplicationForm.tsx` - Application form
- `/src/pages/ApplicationConfirmationPage.tsx` - Confirmation after submit
- `/src/pages/ApplicationTrackingPage.tsx` - Status tracking
- `/src/pages/ShortLinkRedirectPage.tsx` - Short link redirect

### API Service
- `/src/services/api.ts` - Contains registrationsApi and vendorApplicationsApi

### Key API Methods
```typescript
registrationsApi.submitVendorApplication(eventSlug, data)
registrationsApi.trackByTicketCode(ticketCode)
vendorApplicationsApi.lookupByCode(code)
eventsApi.getById(slug)
```

---

## Conclusion

The Voxxy Presents application implements a **complete vendor application workflow** for guests without authentication. The system is well-designed for its specific use case: allowing producers to accept vendor applications for events.

However, it **does not support traditional guest/attendee registration or RSVP**. Guests can only:
1. View event details
2. Apply as vendors
3. Track their vendor application

For general event attendance, the system directs users to external ticketing platforms via the `ticket_url` field.

---

**Document Created:** November 24, 2025  
**Voxxy Presents Version:** Current Development
**API Version:** v1/presents
