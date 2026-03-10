# Voxxy Presents - Email Sequence Writer Brief

**Purpose**: This document contains every email in the system. Writers: edit the subject lines and body copy as needed. Engineering will implement your changes.

**Last Updated**: March 3, 2026
**Status**: Ready for writer edits

---

## How to Use This Document

1. **Edit the Subject and Body** sections for each email freely
2. **Keep all `[variables]` intact** - these get replaced with real data at send time (see Variable Reference at the bottom)
3. **Mark any email you want to remove** with ~~strikethrough~~ or [REMOVE]
4. **Add new emails** at the end of each section with a note on when they should fire
5. When done, hand this back to engineering

---

## SECTION 1: DEFAULT EMAIL SEQUENCE (9 Scheduled Emails)

These emails are automatically generated when a producer creates an event. They fire on a schedule based on event dates and vendor actions. Producers can edit these per-event.

---

### Email 1: Initial Invitation

| Field | Value |
|-------|-------|
| **Position** | 1 of 9 |
| **Category** | Event Announcements |
| **Fires When** | Immediately when the producer "Goes Live" (opens applications) |
| **Sent To** | All invited vendor contacts |
| **Trigger Type** | `on_application_open` |

**Subject:**
```
Submissions Open for [eventName]
```

**Body:**
```
Hi [firstName],

We're pumped to announce that submissions are officially open for [eventName] at [eventVenue] on [eventDate].

Submit your work here:
[invitationLink]

[eventName] is calling for the following categories:

[categoryList]

I'm looking forward to your submission.

Thanks,
[organizationName]

---
Questions? Reply to this email or contact team@voxxypresents.com directly.
Unsubscribe from these emails: [unsubscribeLink]
Powered by Voxxy Presents
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### Email 2: Application Received

| Field | Value |
|-------|-------|
| **Position** | 2 of 9 |
| **Category** | Application Updates |
| **Fires When** | Immediately when a vendor submits an application |
| **Sent To** | The vendor who just applied |
| **Trigger Type** | `on_application_submit` |

**Subject:**
```
Application Received - [eventName]
```

**Body:**
```
Hi [firstName],

Thanks for submitting your application to participate in [eventName] at [eventVenue] on [eventDate].

IMPORTANT: This is NOT an acceptance email. Please allow up to 10 days for us to review your submission. You will receive another email with further details if you're selected.

In the meantime, check us out on Instagram (@pancakesandbooze) and see our "FAQs" Story Highlights for details on how our events work.

---
Questions? Reply to this email or contact team@voxxypresents.com directly.
Unsubscribe from these emails: [unsubscribeLink]
Powered by Voxxy Presents
```

**Writer Notes:**
> _The Instagram handle is hardcoded to Pancakes & Booze. This needs to be made dynamic or generic for other producers._

---

### Email 3: 1 Day Before Application Deadline

| Field | Value |
|-------|-------|
| **Position** | 3 of 9 |
| **Category** | Event Announcements |
| **Fires When** | 1 day before the application deadline, at 9:00 AM |
| **Sent To** | Invited contacts who have NOT yet applied (pending status) |
| **Trigger Type** | `days_before_deadline` / Value: `1` |

**Subject:**
```
Last Chance: [eventName] Applications Close Tomorrow
```

**Body:**
```
Hi [greetingName],

This is a final reminder that applications for [eventName] close tomorrow on [applicationDeadline].

Date: [eventDate]
Location: [eventVenue], [eventLocation]
Application Deadline: [applicationDeadline]

View all vendor application options, pricing, and details:
[eventLink]

Apply now before tomorrow's deadline!

Best regards,
[organizationName]

---
Questions? Reply to this email or contact team@voxxypresents.com directly.
Unsubscribe from these emails: [unsubscribeLink]
Powered by Voxxy Presents
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### Email 4: Application Deadline Day

| Field | Value |
|-------|-------|
| **Position** | 4 of 9 |
| **Category** | Event Announcements |
| **Fires When** | Day of the application deadline, at 8:00 AM |
| **Sent To** | Invited contacts who have NOT yet applied (pending status) |
| **Trigger Type** | `days_before_deadline` / Value: `0` |

**Subject:**
```
URGENT: [eventName] Applications Close Today
```

**Body:**
```
Hi [greetingName],

Today is the final day to apply for [eventName]. Applications close at midnight tonight.

Event Date: [eventDate]
Location: [eventVenue]
Deadline: Today, [applicationDeadline]

Last chance! View application options and apply now:
[eventLink]

This is your last chance.

Thanks,
[organizationName]

---
Questions? Reply to this email or contact team@voxxypresents.com directly.
Unsubscribe from these emails: [unsubscribeLink]
Powered by Voxxy Presents
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### Email 5: 1 Day Before Payment Due

| Field | Value |
|-------|-------|
| **Position** | 5 of 9 |
| **Category** | Payment Reminders |
| **Fires When** | 1 day before the payment deadline, at 10:00 AM |
| **Sent To** | Approved vendors who have NOT paid (payment status: pending or overdue) |
| **Trigger Type** | `days_before_payment_deadline` / Value: `1` |

**Subject:**
```
Reminder: Payment Due Tomorrow - [eventName]
```

**Body:**
```
Hi [greetingName],

This is a reminder that your payment for [eventName] is due tomorrow on [paymentDueDate].

Payment Due Date: [paymentDueDate]
Event Date: [eventDate]
Category: [vendorCategory]

View your payment details and submit payment on your vendor dashboard:
[dashboardLink]

If you have already submitted payment, please disregard this message.

Thank you,
[organizationName]

---
Questions? Reply to this email or contact team@voxxypresents.com directly.
Unsubscribe from these emails: [unsubscribeLink]
Powered by Voxxy Presents
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### Email 6: Payment Due Today

| Field | Value |
|-------|-------|
| **Position** | 6 of 9 |
| **Category** | Payment Reminders |
| **Fires When** | Day of the payment deadline, at 8:00 AM |
| **Sent To** | Approved vendors who have NOT paid (payment status: pending or overdue) |
| **Trigger Type** | `on_payment_deadline` / Value: `0` |

**Subject:**
```
URGENT: Payment Due Today - [eventName]
```

**Body:**
```
Hi [greetingName],

Your payment for [eventName] is due today.

Due Date: Today, [paymentDueDate]
Event Date: [eventDate]
Category: [vendorCategory]

Payment due today! View your details and submit payment:
[dashboardLink]

If payment is not received by midnight tonight, your spot may be moved to the waitlist.

Questions? Contact us at [organizationEmail]

Thank you,
[organizationName]

---
Questions? Reply to this email or contact team@voxxypresents.com directly.
Unsubscribe from these emails: [unsubscribeLink]
Powered by Voxxy Presents
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### Email 7: 1 Day Before Event

| Field | Value |
|-------|-------|
| **Position** | 7 of 9 |
| **Category** | Event Countdown |
| **Fires When** | 1 day before the event date, at 5:00 PM |
| **Sent To** | Approved and confirmed vendors only |
| **Trigger Type** | `days_before_event` / Value: `1` |

**Subject:**
```
Tomorrow: [eventName] Final Details
```

**Body:**
```
Hi [greetingName],

[eventName] is tomorrow. Here are the final details you need:

Event Information:
Date: [eventDate]
Time: [eventTime]
Venue: [eventVenue]
Location: [eventLocation]

View your setup schedule and complete event details on your dashboard:
[dashboardLink]

Important Reminders:
- Arrive during your scheduled setup time
- Bring all necessary equipment and supplies
- Review any vendor guidelines on the event page

We look forward to seeing you tomorrow.

Best regards,
[organizationName]

---
Questions? Reply to this email or contact team@voxxypresents.com directly.
Unsubscribe from these emails: [unsubscribeLink]
Powered by Voxxy Presents
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### Email 8: Day of Event

| Field | Value |
|-------|-------|
| **Position** | 8 of 9 |
| **Category** | Event Countdown |
| **Fires When** | Morning of the event, at 7:00 AM |
| **Sent To** | Approved and confirmed vendors only |
| **Trigger Type** | `on_event_date` / Value: `0` |

**Subject:**
```
Today: [eventName]
```

**Body:**
```
Hi [greetingName],

Today is the day. [eventName] is happening today.

Event Details:
Time: [eventTime]
Venue: [eventVenue]
Location: [eventLocation]

View your setup time and event details:
[dashboardLink]

Reminders:
- Arrive on time for setup
- Check in at the vendor desk
- Follow all venue guidelines
- Have a successful event

See you there.

Best regards,
[organizationName]

---
Questions? Reply to this email or contact team@voxxypresents.com directly.
Unsubscribe from these emails: [unsubscribeLink]
Powered by Voxxy Presents
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### Email 9: Day After Event - Thank You

| Field | Value |
|-------|-------|
| **Position** | 9 of 9 |
| **Category** | Event Countdown |
| **Fires When** | 1 day after the event, at 10:00 AM |
| **Sent To** | Approved and confirmed vendors only |
| **Trigger Type** | `days_after_event` / Value: `1` |

**Subject:**
```
Thank You for Participating in [eventName]
```

**Body:**
```
Hi [greetingName],

Thank you for participating in [eventName]. We appreciate your contribution to making this event a success.

We hope the event met your expectations and provided value for your business.

If you have any feedback about the event, please share it with us. We are always looking to improve.

We look forward to working with you again at future events.

Best regards,
[organizationName]

---
Questions? Reply to this email or contact team@voxxypresents.com directly.
Unsubscribe from these emails: [unsubscribeLink]
Powered by Voxxy Presents
```

**Writer Notes:**
> _Add your notes/feedback here_

---

## SECTION 2: SYSTEM EMAILS (Currently NOT Part of the Sequence)

These emails fire automatically from system events (a vendor applies, gets approved, etc.). They are currently hardcoded and NOT editable by producers. **Per the new plan, these will become part of the editable sequence.**

---

### System Email A: Application Received Confirmation

| Field | Value |
|-------|-------|
| **Fires When** | Immediately when a vendor submits an application |
| **Sent To** | The vendor who applied |
| **Current Status** | Hardcoded in `RegistrationEmailService` |
| **Note** | This overlaps with Sequence Email #2. Decide which one to keep or merge. |

**Subject:**
```
Application Received - [eventName]
```

**Body (varies by vendor category):**

For Artist/Gallery categories:
```
Hi [firstName],

Thanks for submitting your application to participate in [eventName] at [eventVenue] on [eventDate].

This is NOT an acceptance email. Please allow up to 10 days for us to review your submission.

[Category-specific content about the artist experience]

---
Questions? Reply to this email.
```

For Table Vendor categories:
```
Hi [firstName],

Thanks for submitting your application to participate in [eventName] at [eventVenue] on [eventDate].

This is NOT an acceptance email. Please allow up to 10 days for us to review your submission.

[Category-specific content about the vendor experience]

---
Questions? Reply to this email.
```

**Writer Notes:**
> _DUPLICATE ALERT: This fires at the same time as Sequence Email #2 (Application Received). Need to decide: keep one, merge them, or differentiate them._

---

### System Email B: Application Approved

| Field | Value |
|-------|-------|
| **Fires When** | Immediately when a producer approves a vendor's application |
| **Sent To** | The approved vendor |
| **Current Status** | Hardcoded in `RegistrationEmailService` |

**Subject:**
```
You're in - [eventName]
```

**Body (varies by vendor category):**

For Artist/Gallery categories:
```
Hi [firstName],

Congrats! You've been accepted to [eventName] at [eventVenue] on [eventDate].

[Category-specific details about booth setup, pricing, payment instructions]

Category: [vendorCategory]
Booth Price: [boothPrice]
Install Date: [installDate]
Install Time: [installTime]

[Payment instructions and next steps]

Thanks,
[organizationName]

---
Questions? Reply to this email.
```

For Table Vendor categories:
```
[Similar structure with table-vendor-specific content]
```

**Writer Notes:**
> _This is a critical email - it's the acceptance notification. Needs to be clear, exciting, and include all logistics._

---

### System Email C: Application Rejected

| Field | Value |
|-------|-------|
| **Fires When** | Immediately when a producer rejects a vendor's application |
| **Sent To** | The rejected vendor |
| **Current Status** | Hardcoded in `RegistrationEmailService` |

**Subject:**
```
Update on your application - [eventName]
```

**Body:**
```
Hi [greetingName],

Thank you for applying to [eventName]. After reviewing all applications, we weren't able to offer you a spot this time.

We appreciate your interest and hope you'll consider applying to future events.

Best,
[organizationName]

---
Questions? Reply to this email.
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### System Email D: Waitlisted

| Field | Value |
|-------|-------|
| **Fires When** | Immediately when a producer moves a vendor to the waitlist |
| **Sent To** | The waitlisted vendor |
| **Current Status** | Hardcoded in `RegistrationEmailService` |

**Subject:**
```
Waitlist - [eventName]
```

**Body:**
```
Hi [greetingName],

Thank you for your application to [eventName]. We've placed you on the waitlist.

We'll notify you immediately if a spot opens up. In the meantime, no action is needed on your end.

Event Date: [eventDate]
Location: [eventLocation]

Best regards,
[organizationName]

---
Questions? Reply to this email.
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### System Email E: Payment Confirmed

| Field | Value |
|-------|-------|
| **Fires When** | When a vendor's payment is marked as confirmed/received |
| **Sent To** | The vendor who paid |
| **Current Status** | Hardcoded in `RegistrationEmailService` |

**Subject:**
```
Payment confirmed - [eventName]
```

**Body:**
```
Hi [greetingName],

Your payment for [eventName] has been confirmed!

Event: [eventName]
Date: [eventDate]
Venue: [eventVenue]
Location: [eventLocation]
Category: [vendorCategory]
Install Date: [installDate]
Install Time: [installTime]

You're all set. We'll send you additional details as the event approaches.

Thank you,
[organizationName]

---
Questions? Reply to this email.
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### System Email F: Category Changed

| Field | Value |
|-------|-------|
| **Fires When** | When a producer changes a vendor's assigned category |
| **Sent To** | The vendor whose category changed |
| **Current Status** | Hardcoded in `RegistrationEmailService` |
| **Note** | Only sent when producer explicitly triggers it (not automatic) |

**Subject:**
```
Category Updated - [eventName]
```

**Body:**
```
Hi [greetingName],

Your vendor category for [eventName] has been updated.

New Category: [vendorCategory]

If you have questions about this change, please contact us at [organizationEmail].

Thank you,
[organizationName]

---
Questions? Reply to this email.
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### System Email G: Event Details Changed

| Field | Value |
|-------|-------|
| **Fires When** | When a producer changes the event date, venue, location, or time |
| **Sent To** | All vendors with approved or confirmed status |
| **Current Status** | Hardcoded in `RegistrationEmailService` |

**Subject:**
```
Event Update - [eventName]
```

**Body:**
```
Hi [greetingName],

There's been an update to [eventName]. Please review the latest details:

Date: [eventDate]
Time: [eventTime]
Venue: [eventVenue]
Location: [eventLocation]

Please update your plans accordingly. If you have any questions, contact us at [organizationEmail].

Thank you,
[organizationName]

---
Questions? Reply to this email.
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### System Email H: Event Cancelled

| Field | Value |
|-------|-------|
| **Fires When** | When a producer cancels the event |
| **Sent To** | ALL vendors (approved, confirmed, waitlisted, and pending) |
| **Current Status** | Hardcoded in `RegistrationEmailService` |

**Subject:**
```
Event Canceled - [eventName]
```

**Body:**
```
Hi [greetingName],

We regret to inform you that [eventName] has been canceled.

If you have already submitted payment, you will be contacted regarding refund details.

We apologize for the inconvenience and hope to see you at future events.

Best regards,
[organizationName]

---
Questions? Contact us at [organizationEmail].
```

**Writer Notes:**
> _Add your notes/feedback here_

---

### System Email I: Owner Notification (New Application)

| Field | Value |
|-------|-------|
| **Fires When** | When a vendor submits an application |
| **Sent To** | The producer/event owner (NOT the vendor) |
| **Current Status** | Hardcoded in `RegistrationEmailService` |
| **Note** | Currently DISABLED in code (commented out). May want to re-enable. |

**Subject:**
```
New Vendor Application for [eventName]
```

**Body:**
```
New application from [vendorName] ([vendorEmail]) for [eventName].

Business: [businessName]
Category: [vendorCategory]

Review applications in your dashboard.
```

**Writer Notes:**
> _This is currently disabled. Should we re-enable it? Producers may want to know immediately when someone applies._

---

## SECTION 3: VARIABLE REFERENCE

Writers: use these exactly as shown (including the brackets). They get replaced with real data when the email is sent.

### Event Info
| Variable | What It Becomes | Example |
|----------|----------------|---------|
| `[eventName]` | Event title | Spring Art Market 2026 |
| `[eventDate]` | Event date | Saturday, April 15, 2026 |
| `[eventTime]` | Event time | 10:00 AM - 6:00 PM |
| `[eventVenue]` | Venue name | The Warehouse Gallery |
| `[eventLocation]` | Full address | 123 Main St, Los Angeles, CA |
| `[applicationDeadline]` | App deadline date | March 30, 2026 |
| `[paymentDueDate]` | Payment due date | April 1, 2026 |
| `[categoryList]` | Bulleted list of all vendor categories | - Fine Art ($150)\n- Table Vendor ($100) |

### Organization Info
| Variable | What It Becomes | Example |
|----------|----------------|---------|
| `[organizationName]` | Producer's org name | Pancakes & Booze Art Show |
| `[organizationEmail]` | Producer's contact email | hello@pancakesandbooze.com |

### Vendor Info
| Variable | What It Becomes | Example |
|----------|----------------|---------|
| `[firstName]` | Vendor's first name | Sarah |
| `[lastName]` | Vendor's last name | Mitchell |
| `[fullName]` | Vendor's full name | Sarah Mitchell |
| `[greetingName]` | Business name (or first name if none) | Sarah's Ceramics |
| `[businessName]` | Vendor's business name | Sarah's Ceramics |
| `[email]` | Vendor's email | sarah@ceramics.com |
| `[vendorCategory]` | Their assigned category | Fine Art |
| `[boothNumber]` | Assigned booth number | A-12 |
| `[boothPrice]` | Category price | $150.00 |
| `[applicationDate]` | When they applied | March 1, 2026 |
| `[installDate]` | Setup date | April 14, 2026 |
| `[installTime]` | Setup time window | 2:00 PM - 5:00 PM |

### Links (Auto-Generated)
| Variable | What It Becomes |
|----------|----------------|
| `[eventLink]` | Public event page URL |
| `[dashboardLink]` | Vendor's event portal URL |
| `[invitationLink]` | Invitation/application URL |
| `[unsubscribeLink]` | Email unsubscribe URL |
| `[categoryApplicationLink]` | Direct link to apply for a specific category |

---

## SECTION 4: DECISIONS NEEDED FROM THE TEAM

1. **Duplicate Application Received emails**: Sequence Email #2 and System Email A both fire on application submit. Which do we keep? Or merge into one?

2. **Owner Notification (System Email I)**: Currently disabled. Re-enable?

3. **Hardcoded Instagram handle**: Email #2 references "@pancakesandbooze". Make dynamic with `[organizationInstagram]`?

4. **Missing emails to consider adding**:
   - Application deadline 3 days out (in addition to 1 day)?
   - Payment overdue follow-up (2+ days after deadline)?
   - 1 week before event logistics email?
   - Post-event feedback survey link?

5. **Footer standardization**: Should all emails have the same footer? Current footer references "team@voxxypresents.com" - should this be `[organizationEmail]` instead?

6. **Email tone**: Some emails use "pumped" and casual tone, others are formal. Standardize?

---

*Hand this file back to engineering when edits are complete. Engineering will update the seed data and RegistrationEmailService accordingly.*
