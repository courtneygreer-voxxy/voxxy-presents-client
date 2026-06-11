# Invitation Email System - Architecture & Data Flow

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVITATION EMAIL SYSTEM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  FRONTEND (React)                  BACKEND (Rails)              │
│  ─────────────────                ──────────────                │
│                                                                   │
│  ┌──────────────────┐           ┌──────────────────┐            │
│  │ Step3InviteList  │──Post───→ │ EventInvitations │            │
│  │ (Select contacts)│  batch    │ Controller       │            │
│  └──────────────────┘           └──────────────────┘            │
│                                        │                         │
│  ┌──────────────────┐                 │                         │
│  │ EventEmailPreview│                 ↓                         │
│  │ Modal (Position1)│         ┌──────────────────┐              │
│  └──────────────────┘         │ EventInvitation  │              │
│         ↑                      │ (created)        │              │
│         │Preview              └──────────────────┘              │
│         │                              │                        │
│  ┌──────────────────┐                 │                        │
│  │  Mail Tab        │                 ↓                        │
│  │  (Position 1)    │         ┌──────────────────┐             │
│  └──────────────────┘         │ Position 1       │             │
│                               │ ScheduledEmail   │             │
│                               │ (Fetched)        │             │
│                               └──────────────────┘             │
│                                      │                         │
│                                      ↓                         │
│                               ┌──────────────────┐             │
│                               │ InvitationVariable│             │
│                               │ Resolver         │             │
│                               │ Resolves [vars]  │             │
│                               └──────────────────┘             │
│                                      │                         │
│                                      ↓                         │
│                               ┌──────────────────┐             │
│                               │ SendGrid         │             │
│                               │ (Sends email)    │             │
│                               └──────────────────┘             │
│                                      │                         │
│                                      ↓                         │
│                               ┌──────────────────┐             │
│                               │ EmailDelivery    │             │
│                               │ (event_invitation│             │
│                               │ _id set)         │             │
│                               └──────────────────┘             │
│                                                                 │
│  ┌──────────────────┐                                          │
│  │  Audit Log       │←──────────────────────────────┐          │
│  │  View Delivery   │                               │          │
│  │  Status          │                               │          │
│  └──────────────────┘         ┌──────────────────┐ │          │
│                               │ SendGrid Webhook │─┘          │
│                               │ (Delivery update)│            │
│                               └──────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Context Available at Each Stage

### 1. When Invitation Is Created

**Available Data:**

```
EventInvitation {
  id: 1
  event_id: 42
  vendor_contact_id: 123
  status: "sent"
  sent_at: "2026-03-04T12:00:00Z"
  invitation_token: "abc123xyz..."
}

VendorContact {
  id: 123
  first_name: "John"
  last_name: "Doe"
  business_name: "John's Tacos"
  email: "john@example.com"
}

Event {
  id: 42
  title: "Summer Market 2025"
  date_start: "2026-06-15"
  location: "Piedmont Park, Atlanta, GA"
  vendor_applications: [
    { name: "Artist", booth_price: 100, ... },
    { name: "Food", booth_price: 200, ... },
    { name: "Sponsor", booth_price: 500, ... }
  ]
}
```

### 2. When Position 1 Email Is Fetched

**ScheduledEmail (Position 1):**

```
{
  id: 1
  event_id: 42
  position: 1
  name: "Initial Invitation"
  subject_template: "[greetingName], you're invited to [eventName]!"
  body_template: "<p>Hello [greetingName],</p>..."
  trigger_type: "on_invitation_send"
  category: "pre_application"
}
```

### 3. When Variables Are Resolved

**InvitationVariableResolver Access:**

```
INPUT:
- event_invitation (has vendor_contact)
- vendor_contact (contact data)
- event (event data)

RESOLVES:
✅ [greetingName] → "John's Tacos"
✅ [eventName] → "Summer Market 2025"
❌ [boothPrice] → NOT AVAILABLE (which category?)
❌ [vendorCategory] → NOT AVAILABLE (hasn't applied)
```

### 4. When Email Delivery Is Tracked

**EmailDelivery Record:**

```
{
  id: 1000
  scheduled_email_id: 1              ← Position 1
  event_id: 42
  event_invitation_id: 1             ← INVITATION (not registration!)
  registration_id: null              ← No registration yet
  recipient_email: "john@example.com"
  sendgrid_message_id: "msg_123..."
  status: "delivered"
  sent_at: "2026-03-04T12:00:30Z"
  delivered_at: "2026-03-04T12:00:45Z"
  recipient_name: "John Doe"
  vendor_category: null              ← Not populated for invitations
}
```

---

## Variable Resolution Flow

### Invitation Email (Position 1)

```
Template (Raw):
┌──────────────────────────────────────────┐
│ Subject: [greetingName], you're invited! │
│ Body:                                    │
│ Hello [greetingName],                    │
│ Join us for [eventName]!                 │
│ Price: [boothPrice]                      │
│ Apply: [eventLink]                       │
└──────────────────────────────────────────┘
           ↓
    InvitationVariableResolver
           ↓
┌──────────────────────────────────────────┐
│ Subject: John's Tacos, you're invited!   │
│ Body:                                    │
│ Hello John's Tacos,                      │
│ Join us for Summer Market 2025!          │
│ Price: [boothPrice] ← UNRESOLVED!        │
│ Apply: https://voxxy.io/events/summer    │
└──────────────────────────────────────────┘
           ↓
      SendGrid sends
           ↓
        Vendor inbox
```

### Registration Email (After Apply)

```
Template (Raw):
┌──────────────────────────────────────────┐
│ Subject: Application Approved!           │
│ Body:                                    │
│ Hello [firstName],                       │
│ Your [vendorCategory] application is OK! │
│ Booth Price: [boothPrice]                │
│ Setup: [installDate]                     │
└──────────────────────────────────────────┘
           ↓
    RegistrationVariableResolver
           ↓
┌──────────────────────────────────────────┐
│ Subject: Application Approved!           │
│ Body:                                    │
│ Hello John,                              │
│ Your Food application is OK!             │
│ Booth Price: $200.00                     │
│ Setup: June 14, 2026                     │
└──────────────────────────────────────────┘
           ↓
      SendGrid sends
           ↓
        Vendor inbox
```

---

## Database Schema Relationship

```
┌──────────────────┐
│ events           │
├──────────────────┤
│ id (PK)          │
│ title            │
│ date_start       │
│ location         │
│ ...              │
└──────┬───────────┘
       │ 1
       │
       │ N
┌──────┴──────────────────┐
│ email_template_items     │ (Position 1 = position 1)
├──────────────────────────┤
│ id (PK)                  │
│ event_id (FK)            │
│ position (1-40)          │
│ trigger_type             │
│ subject_template         │
│ body_template            │
│ ...                      │
└──────┬────────────────────┘
       │ 1
       │ (Position 1 email)
       │
       │ N
┌──────┴───────────────────────┐
│ scheduled_emails              │ (Event-specific copy)
├───────────────────────────────┤
│ id (PK)                       │
│ event_id (FK)                 │
│ email_template_item_id (FK)   │
│ subject_template              │
│ body_template                 │
│ ...                           │
└──────┬────────────────────────┘
       │ 1
       │
       │ N
┌──────┴──────────────────┐
│ email_deliveries         │ (Delivery tracking)
├──────────────────────────┤
│ id (PK)                  │
│ scheduled_email_id (FK)  │
│ registration_id (FK) ┐   │
│ event_invitation_id  ├─→ Only ONE of these
│           (FK)       ┘   │ is populated per row
│ recipient_email      │
│ status               │
│ sendgrid_message_id  │
│ sent_at              │
│ delivered_at         │
│ bounced_at           │
│ ...                  │
└──────────────────────┘


SECOND BRANCH: Invitations

┌──────────────────────────┐
│ vendor_contacts          │
├──────────────────────────┤
│ id (PK)                  │
│ organization_id (FK)     │
│ first_name               │
│ last_name                │
│ business_name            │
│ email                    │
│ ...                      │
└──────┬────────────────────┘
       │ 1
       │
       │ N
┌──────┴──────────────────────┐
│ event_invitations             │ (Invitations sent)
├───────────────────────────────┤
│ id (PK)                       │
│ event_id (FK) ┌──────────────→│ events
│ vendor_contact_id (FK)        │
│ status                        │
│ invitation_token              │
│ sent_at                       │
│ responded_at                  │
│ ...                           │
└──────┬──────────────────────┘
       │ 1
       │
       │ N
       └──→ (links to email_deliveries.event_invitation_id)


THIRD BRANCH: Applications

┌──────────────────────────┐
│ vendor_applications       │ (Categories on event)
├──────────────────────────┤
│ id (PK)                  │
│ event_id (FK)            │
│ name                     │
│ booth_price              │
│ install_date             │
│ install_start_time       │
│ install_end_time         │
│ payment_link             │
│ ...                      │
└──────┬────────────────────┘
       │ 1
       │
       │ N
┌──────┴──────────────────────┐
│ registrations                 │ (Vendor applications)
├───────────────────────────────┤
│ id (PK)                       │
│ event_id (FK)                 │
│ vendor_contact_id (FK)        │
│ vendor_application_id (FK)    │
│ status                        │
│ ...                           │
└──────┬──────────────────────┘
       │ 1
       │
       │ N
       └──→ (links to email_deliveries.registration_id)
```

---

## Variable Categories & Sources

### Event Variables (From `event`)

```
[eventName]           ← event.title
[eventDate]           ← event.date_start
[eventTime]           ← event.time_start + event.time_end
[eventLocation]       ← event.location
[eventVenue]          ← event.venue
[eventDescription]    ← event.description
[applicationDeadline] ← event.application_deadline
[paymentDueDate]      ← event.payment_deadline
[ageRestriction]      ← event.age_restriction
```

### Contact Variables (From `vendor_contact` in invitation)

```
[greetingName]  ← Prefers business_name, falls back to first_name
[firstName]     ← vendor_contact.first_name
[lastName]      ← vendor_contact.last_name
[fullName]      ← vendor_contact.first_name + vendor_contact.last_name
[businessName]  ← vendor_contact.business_name
[email]         ← vendor_contact.email
```

### Category Variables (From `vendor_application` in registration)

```
[boothPrice]      ← registration.vendor_application.booth_price
[categoryPrice]   ← Alias for boothPrice
[installDate]     ← registration.vendor_application.install_date
[installTime]     ← registration.vendor_application.install_start_time + install_end_time
[installStartTime] ← registration.vendor_application.install_start_time
[installEndTime]   ← registration.vendor_application.install_end_time
[paymentLink]      ← registration.vendor_application.payment_link
[vendorCategory]   ← registration.vendor_application.name
```

### Computed/Link Variables

```
[eventLink]        ← URL to event application page
[invitationLink]   ← Same as eventLink
[bulletinLink]     ← URL to event bulletin
[dashboardLink]    ← URL to vendor dashboard
[unsubscribeLink]  ← URL to unsubscribe
[paymentLink]      ← (Also category-specific)
```

---

## Invitation vs Registration Email Timeline

```
TIMELINE:

                    Event Created
                         │
                         ↓
                  Position 1 Created
                         │
                         ↓
                Batch Invitations Created
                    status=sent
                         │
                         ├→ Fetch Position 1
                         │
                         ├→ For each invitation:
                         │  ├→ InvitationVariableResolver
                         │  │  Variables from: event + vendor_contact
                         │  │
                         │  ├→ SendGrid sends email
                         │  │
                         │  └→ EmailDelivery created
                         │     (event_invitation_id=X, registration_id=null)
                         │
                         ↓
                  *** GAP: Vendor hasn't applied yet ***
                  *** Can't use category variables ***
                         │
                         ↓
               [WAITING FOR VENDOR TO APPLY]
                         │
                         ↓
                  Vendor Applies
                  Registration Created
                         │
                         ├→ Status: "pending"
                         │
                         ├→ For each email with on_approval trigger:
                         │  ├→ RegistrationVariableResolver
                         │  │  Variables from: registration + vendor_application
                         │  │
                         │  ├→ SendGrid sends email
                         │  │
                         │  └→ EmailDelivery created
                         │     (registration_id=X, event_invitation_id=null)
                         │
                         ↓
                    *** NOW can use category variables ***
                    *** Registration context available ***
```

---

## Summary

### What Invitations Have:

1. EventInvitation record (pre-application)
2. VendorContact data
3. Event data
4. Position 1 email template
5. InvitationVariableResolver

### What Invitations Lack:

1. Registration record (no application yet)
2. VendorApplication context (don't know their category)
3. Category-specific pricing/dates
4. Booth assignment
5. RegistrationVariableResolver

### Result:

- Can use: Event + contact variables
- Cannot use: Category + registration variables
- Cannot know: Which category they'll choose

### Solution:

- Show all categories in invitation
- Let vendor explore and choose on application page
- Send follow-up emails after registration with category-specific info
