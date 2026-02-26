# Guest Application Flow Documentation Index

## Overview

Complete analysis and documentation of the Voxxy Presents guest/attendee application process for non-logged-in users.

**Status:** Analysis Complete  
**Date:** November 24, 2025  
**Total Documentation:** 1,186 lines across 3 documents  
**Codebase:** React + TypeScript + Rails API

---

## Documentation Files

### 1. GUEST_APPLICATION_FLOW.md
**Size:** 417 lines, 12K  
**Audience:** Architects, Senior Developers, Product Managers  
**Depth:** Comprehensive (100%)

**Contents:**
- Executive summary
- Guest user journey overview
- 5-stage detailed breakdown with API calls
- Public routes summary (table)
- 4 public API endpoints documented
- Data models (Registration, Event)
- User flow diagram
- Features summary
- Email integration details
- Security architecture
- Current limitations
- Technology stack
- Files and components reference

**Best For:** Understanding the complete system architecture and design

**Read Time:** 15-20 minutes

---

### 2. GUEST_FLOW_QUICK_REFERENCE.md
**Size:** 216 lines, 5.4K  
**Audience:** Frontend Developers, Feature Implementers  
**Depth:** Condensed (70%)

**Contents:**
- Quick start overview
- 4-step guest flow breakdown
- Endpoint summary table
- Routes table
- Status states table
- Application models
- Form validation rules
- Common workflows (3 scenarios)
- Features checklist
- File reference (quick)
- Security notes
- Email integration summary

**Best For:** Quick lookups and implementing features

**Read Time:** 5-10 minutes

---

### 3. GUEST_CODE_EXAMPLES.md
**Size:** 553 lines, 13K  
**Audience:** Frontend Developers, Integration Engineers  
**Depth:** Practical (80%)

**Contents:**
- API service methods with usage examples
- Component code snippets (5 components)
- Full request/response examples (4 scenarios)
- Validation rule examples
- Error handling patterns
- Route guard examples
- CSS class reference (dark theme + status colors)
- Testing checklist (manual test steps)

**Best For:** Implementation and debugging

**Read Time:** 10-15 minutes

---

## Quick Navigation

### By Use Case

#### "I need to understand the whole system"
→ Read `GUEST_APPLICATION_FLOW.md` (15 min) + `GUEST_FLOW_QUICK_REFERENCE.md` (5 min)

#### "I need to implement a feature"
→ Read `GUEST_FLOW_QUICK_REFERENCE.md` (5 min) + `GUEST_CODE_EXAMPLES.md` (10 min)

#### "I need to debug an issue"
→ Check `GUEST_CODE_EXAMPLES.md` (error handling section) + Look at actual component code

#### "I need to explain this to stakeholders"
→ Use `GUEST_APPLICATION_FLOW.md` (executive summary + key features)

#### "I need API documentation"
→ Check `GUEST_FLOW_QUICK_REFERENCE.md` (endpoint table) + `GUEST_CODE_EXAMPLES.md` (request/response examples)

---

## Key Information at a Glance

### What is This System?
A **vendor application platform** (NOT general event ticketing). Non-logged-in vendors can:
1. View event details
2. Apply as vendors with 5-field form
3. Receive unique tracking code
4. Track application status anytime

### Public Routes (6 total)
```
/ - Home
/events/:slug - Event details
/events/:slug/apply - Vendor application
/applications/success - Confirmation
/applications/track/:ticketCode - Status tracking
/apply/:code - Short link redirect
```

### Public API Endpoints (4 total)
```
GET /api/v1/presents/events/:slug - Get event
POST /api/v1/presents/events/:slug/registrations - Submit app
GET /api/v1/presents/registrations/track/:code - Track app
GET /api/v1/presents/vendor_applications/lookup/:code - Lookup
```

### Application Status States (5 total)
```
pending → approved/rejected/waitlist/confirmed
```

### Components
```
PublicEventDetailPage.tsx - Event detail view
VendorApplicationForm.tsx - Application form
ApplicationConfirmationPage.tsx - Confirmation
ApplicationTrackingPage.tsx - Status tracking
ShortLinkRedirectPage.tsx - Short link redirect
```

---

## File Locations in Codebase

### Pages
- `/src/pages/PublicEventDetailPage.tsx` (275 lines)
- `/src/pages/VendorApplicationForm.tsx` (275 lines)
- `/src/pages/ApplicationConfirmationPage.tsx` (107 lines)
- `/src/pages/ApplicationTrackingPage.tsx` (266 lines)
- `/src/pages/ShortLinkRedirectPage.tsx` (73 lines)

### API Service
- `/src/services/api.ts` (registrationsApi and vendorApplicationsApi)

### Routing
- `/src/App.tsx` (lines 128-133 define guest routes)

### Producer Components
- `/src/components/producer/ViewApplicationSubmissions.tsx`
- `/src/components/producer/CreateApplicationForm.tsx`

---

## Documentation Structure

Each document is organized for its audience:

### GUEST_APPLICATION_FLOW.md
1. Executive Summary
2. Guest User Journey Overview
3. Detailed Stage Breakdown (5 stages)
4. Public Routes Summary
5. API Endpoints for Guest Functions
6. Data Models
7. User Flow Diagram
8. Key Features Summary
9. Email Integration
10. Security Considerations
11. Current Limitations
12. Technology Stack
13. Files & Components Reference
14. Conclusion

### GUEST_FLOW_QUICK_REFERENCE.md
1. Overview
2. Quick Start (5 stages)
3. Endpoint Summary
4. Routes
5. Application Status States
6. Key Files
7. Form Validation
8. Response Models
9. Common Workflows
10. Capabilities & Limitations

### GUEST_CODE_EXAMPLES.md
1. API Service Methods (with examples)
2. Component Examples (5 components)
3. API Request/Response Examples (4 scenarios)
4. Validation Rules
5. Error Handling
6. Route Guards
7. CSS Classes
8. Testing Steps

---

## Key Insights

### Design Strengths
✅ Zero authentication friction  
✅ Opaque ticket codes for security  
✅ Clear 5-state status progression  
✅ Simple, validated forms  
✅ Email-integrated workflow  
✅ Producer management tools  
✅ Short link support  

### Design Limitations
❌ Vendor-only (no general RSVP)  
❌ No event search/discovery  
❌ No in-app messaging  
❌ External ticketing only  
❌ No self-service signup  

### Perfect For
✅ Event producers seeking vendors  
✅ Businesses applying to participate  
✅ Multi-event vendor recruitment  
✅ Anonymous application tracking  

### Not Suitable For
❌ General event attendee RSVP  
❌ Ticket sales  
❌ Event discovery platform  
❌ User account management  

---

## API Quick Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/presents/events/:slug` | No | Get event details |
| POST | `/api/v1/presents/events/:slug/registrations` | No | Submit vendor app |
| GET | `/api/v1/presents/registrations/track/:code` | No | Track application |
| GET | `/api/v1/presents/vendor_applications/lookup/:code` | No | Lookup event by code |

---

## Route Quick Reference

| Route | Component | Purpose | Auth |
|-------|-----------|---------|------|
| `/events/:slug` | PublicEventDetailPage | Event details | No |
| `/events/:slug/apply` | VendorApplicationForm | Vendor app form | No |
| `/applications/success` | ApplicationConfirmationPage | Confirmation | No |
| `/applications/track/:ticketCode` | ApplicationTrackingPage | Track status | No |
| `/apply/:code` | ShortLinkRedirectPage | Short link | No |

---

## Testing Checklist

### Manual Testing
- [ ] Visit event page without login
- [ ] See vendor opportunities section
- [ ] Click "Apply as Vendor"
- [ ] Fill out form with valid data
- [ ] Submit application
- [ ] See ticket code on confirmation page
- [ ] Click "Track Application"
- [ ] See application details
- [ ] Verify all 5 status states work
- [ ] Test error scenarios (invalid email, missing fields)

### API Testing
- [ ] Test GET event endpoint
- [ ] Test POST application endpoint
- [ ] Test GET track endpoint with valid code
- [ ] Test GET track endpoint with invalid code
- [ ] Test GET lookup endpoint
- [ ] Verify CORS headers present

### Security Testing
- [ ] Try to enumerate ticket codes
- [ ] Try accessing other user's application
- [ ] Verify email validation
- [ ] Check rate limiting (if implemented)

---

## Terminology

**Vendor** - Business applying to participate in an event (food truck, merchandise, etc.)

**Ticket Code** - Unique opaque identifier for tracking an application (e.g., "APP-ABC123XYZ")

**Registration** - Vendor's application submission (internal database object)

**Submission** - Producer's term for a vendor application

**Short Link** - Shareable URL that redirects to vendor application form (e.g., /apply/ABC123)

**Status** - Current state of vendor application (pending/approved/rejected/waitlist/confirmed)

---

## Common Questions

### Q: Can guests RSVP as attendees?
A: No. This system is vendor-only. General attendees use external ticketing platforms.

### Q: Can guests purchase tickets?
A: No. The platform links to external ticket URLs. Voxxy doesn't process ticket transactions.

### Q: Can guests create accounts?
A: No. Beta access only via contact form. No self-service signup.

### Q: Can vendors edit their application?
A: Not yet. System only supports submission and status tracking. Editing would require account creation.

### Q: How are emails handled?
A: Backend Rails application sends confirmation and status update emails. Email delivery configured there.

### Q: Is the ticket code secure?
A: Yes. Opaque, non-sequential codes prevent enumeration. Code-specific lookups only.

### Q: Can producers see all applications?
A: Yes. Producers logged in can view all applications for their events and update statuses.

---

## Related Documentation

- [API Configuration](./API_CONFIGURATION.md) - Backend API details
- [Auth Quick Reference](./AUTH_QUICK_REFERENCE.md) - Authentication flows
- [Architecture Documentation](./docs/ARCHITECTURE_SUMMARY.md) - Overall system design

---

## Summary

This documentation provides everything needed to understand, implement, and debug the guest vendor application workflow in Voxxy Presents.

**Start with:** `GUEST_FLOW_QUICK_REFERENCE.md` (5 min)  
**Then read:** `GUEST_APPLICATION_FLOW.md` (15 min)  
**Reference:** `GUEST_CODE_EXAMPLES.md` as needed  

Total time to understand: 20-30 minutes  
Total lines of documentation: 1,186  
Codebase files analyzed: 5 pages + API service + producer components  

---

**Last Updated:** November 24, 2025  
**Version:** 1.0 (Complete Analysis)
