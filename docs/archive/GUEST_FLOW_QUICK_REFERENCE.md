# Guest Application Flow - Quick Reference Guide

## Overview
Voxxy Presents is a **vendor application platform**, not a general event ticketing system. Guests can apply for vendor spots but cannot RSVP as attendees.

---

## Quick Start: Guest Vendor Application

### 1. Event Discovery
```
GET /api/v1/presents/events/:slug
├─ Display event details, poster, capacity
├─ Show "Apply as Vendor" button (if vendor_application exists)
└─ Link to external ticket_url for general attendance
```

### 2. Apply as Vendor
```
GET /events/:slug/apply
├─ Email (required)
├─ Phone (optional)
├─ Business Name (required)
├─ Vendor Category (required, from event categories)
└─ Newsletter Subscription (checkbox)

POST /api/v1/presents/events/:slug/registrations
└─ Returns: ticket_code for tracking
```

### 3. Confirmation
```
GET /applications/success?ticket_code=...&event=...
├─ Display ticket_code
├─ Show "Track Status" button
└─ Show "Back to Event" button
```

### 4. Track Status
```
GET /applications/track/:ticketCode
├─ Shows current status (pending/approved/rejected/waitlist/confirmed)
├─ Display application details
└─ Display event details
```

---

## Endpoint Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/presents/events/:slug` | ❌ | Get event details |
| POST | `/api/v1/presents/events/:slug/registrations` | ❌ | Submit application |
| GET | `/api/v1/presents/registrations/track/:code` | ❌ | Track application |
| GET | `/api/v1/presents/vendor_applications/lookup/:code` | ❌ | Lookup by short code |

---

## Routes

| Route | Purpose | Component |
|-------|---------|-----------|
| `/events/:slug` | View event details | `PublicEventDetailPage` |
| `/events/:slug/apply` | Apply as vendor | `VendorApplicationForm` |
| `/applications/success` | Confirmation page | `ApplicationConfirmationPage` |
| `/applications/track/:ticketCode` | Track application | `ApplicationTrackingPage` |
| `/apply/:code` | Short link redirect | `ShortLinkRedirectPage` |

---

## Application Status States

```
pending   → Awaiting review by event organizer
approved  → Vendor approved (check email for next steps)
rejected  → Not selected for event
waitlist  → On waitlist (will notify if spot available)
confirmed → Vendor spot confirmed (event day details via email)
```

---

## Key Files

**Pages:**
- `src/pages/PublicEventDetailPage.tsx`
- `src/pages/VendorApplicationForm.tsx`
- `src/pages/ApplicationConfirmationPage.tsx`
- `src/pages/ApplicationTrackingPage.tsx`
- `src/pages/ShortLinkRedirectPage.tsx`

**API Service:**
- `src/services/api.ts` (registrationsApi, vendorApplicationsApi)

---

## Form Validation

**Required fields:**
- Email (valid email format)
- Business Name (non-empty)
- Vendor Category (must select from available options)

**Optional fields:**
- Phone (optional if not provided)
- Newsletter subscription (defaults to true)

---

## Response Models

### Registration
```typescript
{
  id: number
  ticket_code: string
  email: string
  business_name: string
  vendor_category: string
  status: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed'
  created_at: string
  event: { id, title, slug, dates, location }
}
```

### Event
```typescript
{
  id: number
  title: string
  slug: string
  description: string
  dates: { start?, end? }
  location: string
  poster_url: string
  ticket_url: string
  pricing: { ticket_price, currency }
  capacity: { total, registered, remaining, is_full }
  organization: { id, name, city, state }
  vendor_application?: { id, name, description, categories, submissions_count }
}
```

---

## Common Workflows

### Guest Views Event and Applies
1. Navigate to `/events/music-festival-2025`
2. Scroll to "Vendor Opportunities" section
3. Click "Apply as Vendor"
4. Fill out form with email, business name, category
5. Click "Submit Application"
6. Redirected to `/applications/success?ticket_code=APP-123&event=music-festival-2025`

### Guest Tracks Application Later
1. Navigate to `/applications/track/APP-123`
2. System looks up application by ticket code
3. Displays current status and details
4. Guest can click "View Event" or "Browse More Events"

### Producer Shares Vendor Link
1. Producer has event with vendor_application_id = 42
2. Generates short code (backend responsibility)
3. Sends link: `voxxypresents.com/apply/ABC123`
4. Guest clicks link
5. System looks up vendor_application via code
6. Redirects to `/events/music-festival-2025/apply`

---

## No Authentication Needed For:

✅ Viewing events
✅ Viewing event details
✅ Submitting vendor applications
✅ Tracking application status
✅ Looking up events by share code
✅ Email notifications

---

## Does NOT Support:

❌ General event RSVP
❌ Attendee registration (non-vendor)
❌ Guest account creation
❌ In-app ticketing
❌ Direct messaging with organizers
❌ Event search/discovery API

---

## Email Integration

When vendor applies:
1. Confirmation email sent to applicant
2. Email includes ticket code and tracking link
3. When status changes, email notification sent
4. Uses `subscribed` flag for newsletter signups

---

## Security Notes

- Ticket codes are opaque (not sequential)
- Tracking endpoints public but require exact code match
- No user ID needed for guest operations
- Email validation on submission
- CORS-enabled for public frontend

---

**Last Updated:** November 24, 2025  
**Version:** v1/presents API
