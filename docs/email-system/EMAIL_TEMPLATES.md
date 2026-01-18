# Voxxy Presents - Email Templates Reference

**Version:** 1.0
**Last Updated:** December 31, 2024
**Total Templates:** 24 (16 Editable + 8 System)

This document contains all email templates for the Voxxy Presents automated email system. These templates will be seeded into the database as the default email campaign template.

---

## Table of Contents

1. [Dynamic Fields Reference](#dynamic-fields-reference)
2. [Part 1: Editable Templates (16)](#part-1-editable-templates-16)
   - [Event Announcements (4)](#1-event-announcements-4-emails)
   - [Application Updates (1)](#2-application-updates-1-email)
   - [Payment Reminders (4)](#3-payment-reminders-4-emails)
   - [Event Countdown (7)](#4-event-countdown-7-emails)
3. [Part 2: System Emails (8)](#part-2-system-emails-8)
4. [Implementation Guide](#implementation-guide)

---

## Dynamic Fields Reference

These placeholders can be used in any email subject or body. The system will automatically replace them with actual data when sending emails.

### Available Fields

| Field | Backend Variable | Description | Example |
|-------|------------------|-------------|---------|
| `[firstName]` | `{{vendor_name}}` | Recipient's first name | "John" |
| `[lastName]` | `{{vendor_last_name}}` | Recipient's last name | "Doe" |
| `[vendorName]` | `{{business_name}}` | Business or artist name | "John's Tacos" |
| `[eventName]` | `{{event_title}}` | Name of the event | "Summer Market 2025" |
| `[eventDate]` | `{{event_date}}` | Date of the event | "June 15, 2025" |
| `[eventTime]` | `{{event_time}}` | Start time of the event | "10:00 AM" |
| `[eventVenue]` | `{{event_venue}}` | Event venue name and address | "Piedmont Park" |
| `[eventLocation]` | `{{event_location}}` | City, State of the event | "Atlanta, GA" |
| `[categoryName]` | `{{vendor_category}}` | Vendor/artist category | "Food" |
| `[categoryPrice]` | `{{booth_price}}` | Category booth/application price | "$150.00" |
| `[paymentLink]` | `{{payment_url}}` | Link to payment page | "https://..." |
| `[applicationDeadline]` | `{{application_deadline}}` | Deadline to apply | "May 30, 2025" |
| `[paymentDeadline]` | `{{payment_deadline}}` | Deadline to pay | "June 1, 2025" |
| `[installDate]` | `{{setup_date}}` | Setup/install date | "June 14, 2025" |
| `[installTime]` | `{{setup_time}}` | Setup/install time | "8:00 AM" |
| `[producerName]` | `{{organization_name}}` | Event producer's name | "Voxxy Presents" |
| `[producerEmail]` | `{{organization_email}}` | Producer's contact email | "events@voxxyai.com" |
| `[bulletinLink]` | `{{bulletin_url}}` | Link to event bulletin board | "https://..." |

### Button Syntax

Use `{{Button Text}}` to create a call-to-action button in the email.

**Example:**
```
{{Apply Now}}
{{Pay Now}}
{{View Event Info}}
```

---

# PART 1: EDITABLE TEMPLATES (16)

> ✅ **These emails can be customized, enabled/disabled, and scheduled by producers.**

Producers can edit the subject, body, timing, and recipient filters for these emails. They can also pause or delete them for individual events.

---

## 1. Event Announcements (4 emails)

**Category:** `event_announcements`
**Purpose:** Promote your event and drive applications

---

### 1.1 Immediate Announcement

**Database Fields:**
- **ID:** `immediate_announcement`
- **Name:** "Immediate Announcement - Applications Open"
- **Position:** 1
- **Category:** `event_announcements`
- **Trigger Type:** `on_application_open` (or `on_event_create` if applications are already open)
- **Trigger Value:** `0`
- **Trigger Time:** `09:00`
- **Recipient Filter:** `{}`  (All vendors in network)
- **Enabled by Default:** `true`

**Subject:**
```
You're Invited: [eventName] - Apply Now!
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>We're excited to announce <strong>[eventName]</strong> and would love to have you join us!</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
  <li>⏰ <strong>Application Deadline:</strong> [applicationDeadline]</li>
</ul>

<p>This is a great opportunity to showcase your work and connect with the community.</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{event_url}}" style="background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Apply Now</a>
</p>

<p>Best,<br>[producerName]</p>
```

---

### 1.2 10 Weeks Before Deadline

**Database Fields:**
- **ID:** `10_weeks_before_deadline`
- **Name:** "10 Weeks Before Application Deadline"
- **Position:** 2
- **Category:** `event_announcements`
- **Trigger Type:** `days_before_deadline`
- **Trigger Value:** `70` (10 weeks = 70 days)
- **Trigger Time:** `10:00`
- **Recipient Filter:** `{}`
- **Enabled by Default:** `true`

**Subject:**
```
Don't Miss Out: [eventName] Applications Open!
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>Just a reminder that applications for <strong>[eventName]</strong> are now open!</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
  <li>⏰ <strong>Application Deadline:</strong> [applicationDeadline]</li>
</ul>

<p>Spots fill up fast—apply early to secure your place.</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{event_url}}" style="background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Apply Now</a>
</p>

<p>Best,<br>[producerName]</p>
```

---

### 1.3 8 Weeks Before Deadline

**Database Fields:**
- **ID:** `8_weeks_before_deadline`
- **Name:** "8 Weeks Before Application Deadline"
- **Position:** 3
- **Category:** `event_announcements`
- **Trigger Type:** `days_before_deadline`
- **Trigger Value:** `56` (8 weeks = 56 days)
- **Trigger Time:** `10:00`
- **Recipient Filter:** `{}`
- **Enabled by Default:** `true`

**Subject:**
```
Still Time to Apply - [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>There's still time to apply for <strong>[eventName]</strong>!</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
  <li>⏰ <strong>Application Deadline:</strong> [applicationDeadline]</li>
</ul>

<p>We'd love to see you there. Submit your application today.</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{event_url}}" style="background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Apply Now</a>
</p>

<p>Best,<br>[producerName]</p>
```

---

### 1.4 12 Days Before Deadline

**Database Fields:**
- **ID:** `12_days_before_deadline`
- **Name:** "12 Days Before Application Deadline"
- **Position:** 4
- **Category:** `event_announcements`
- **Trigger Type:** `days_before_deadline`
- **Trigger Value:** `12`
- **Trigger Time:** `09:00`
- **Recipient Filter:** `{}`
- **Enabled by Default:** `true`

**Subject:**
```
⏰ Application Deadline Approaching - [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>The deadline for <strong>[eventName]</strong> is just 12 days away!</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
  <li>⏰ <strong>Application Deadline:</strong> [applicationDeadline]</li>
</ul>

<p>Don't wait—submit your application before it's too late.</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{event_url}}" style="background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Apply Now - Last Chance</a>
</p>

<p>Best,<br>[producerName]</p>
```

---

## 2. Application Updates (1 email)

**Category:** `application_updates`
**Purpose:** Confirm receipt of applications

---

### 2.1 Application Received

**Database Fields:**
- **ID:** `application_received`
- **Name:** "Application Received Confirmation"
- **Position:** 5
- **Category:** `application_updates`
- **Trigger Type:** `on_application_submit` (special trigger)
- **Trigger Value:** `0`
- **Trigger Time:** `null` (immediate)
- **Recipient Filter:** `{ "status": ["pending"] }`
- **Enabled by Default:** `true`

**Subject:**
```
Application Received - [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>Thank you for applying to <strong>[eventName]</strong>! We've received your application.</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
  <li>🏷️ <strong>Category:</strong> [categoryName]</li>
</ul>

<p>We'll review your application and get back to you soon. Keep an eye on your inbox for updates.</p>

<p>Best,<br>[producerName]</p>
```

---

## 3. Payment Reminders (4 emails)

**Category:** `payment_reminders`
**Purpose:** Payment deadline countdown and follow-ups

---

### 3.1 Payment Details

**Database Fields:**
- **ID:** `payment_details`
- **Name:** "Payment Details After Acceptance"
- **Position:** 6
- **Category:** `payment_reminders`
- **Trigger Type:** `on_status_change_to_approved` (special trigger)
- **Trigger Value:** `0`
- **Trigger Time:** `null` (immediate)
- **Recipient Filter:** `{ "status": ["approved"], "payment_status": ["unpaid"] }`
- **Enabled by Default:** `true`

**Subject:**
```
Payment Details for [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>Here are your payment details for <strong>[eventName]</strong>:</p>

<ul>
  <li>🏷️ <strong>Category:</strong> [categoryName]</li>
  <li>💰 <strong>Amount Due:</strong> [categoryPrice]</li>
  <li>📅 <strong>Payment Deadline:</strong> [paymentDeadline]</li>
</ul>

<p style="text-align: center; margin: 30px 0;">
  <a href="[paymentLink]" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Pay Now</a>
</p>

<p>Please ensure payment is received by the deadline to secure your spot.</p>

<p>Best,<br>[producerName]</p>
```

---

### 3.2 1 Week Before Payment Due

**Database Fields:**
- **ID:** `payment_1_week`
- **Name:** "Payment Reminder - 1 Week Before Due"
- **Position:** 7
- **Category:** `payment_reminders`
- **Trigger Type:** `days_before_payment_deadline`
- **Trigger Value:** `7`
- **Trigger Time:** `09:00`
- **Recipient Filter:** `{ "status": ["approved"], "payment_status": ["unpaid"] }`
- **Enabled by Default:** `true`

**Subject:**
```
Payment Reminder - 1 Week Left for [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>Friendly reminder: Your payment for <strong>[eventName]</strong> is due in one week!</p>

<ul>
  <li>💰 <strong>Amount:</strong> [categoryPrice]</li>
  <li>📅 <strong>Due:</strong> [paymentDeadline]</li>
</ul>

<p style="text-align: center; margin: 30px 0;">
  <a href="[paymentLink]" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Pay Now</a>
</p>

<p>Please ensure payment is received by the deadline to keep your spot.</p>

<p>Best,<br>[producerName]</p>
```

---

### 3.3 3 Days Before Payment Due

**Database Fields:**
- **ID:** `payment_3_days`
- **Name:** "Payment Reminder - 3 Days Before Due"
- **Position:** 8
- **Category:** `payment_reminders`
- **Trigger Type:** `days_before_payment_deadline`
- **Trigger Value:** `3`
- **Trigger Time:** `09:00`
- **Recipient Filter:** `{ "status": ["approved"], "payment_status": ["unpaid"] }`
- **Enabled by Default:** `true`

**Subject:**
```
⏰ 3 Days Until Payment Deadline - [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>Your payment for <strong>[eventName]</strong> is due in 3 days.</p>

<ul>
  <li>💰 <strong>Amount:</strong> [categoryPrice]</li>
  <li>📅 <strong>Due:</strong> [paymentDeadline]</li>
</ul>

<p style="text-align: center; margin: 30px 0;">
  <a href="[paymentLink]" style="background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Pay Now</a>
</p>

<p>Act now to secure your spot!</p>

<p>Best,<br>[producerName]</p>
```

---

### 3.4 Payment Due Today

**Database Fields:**
- **ID:** `payment_due_today`
- **Name:** "Payment Due Today - Final Notice"
- **Position:** 9
- **Category:** `payment_reminders`
- **Trigger Type:** `on_payment_deadline`
- **Trigger Value:** `0`
- **Trigger Time:** `08:00`
- **Recipient Filter:** `{ "status": ["approved"], "payment_status": ["unpaid"] }`
- **Enabled by Default:** `true`

**Subject:**
```
⚡ FINAL NOTICE - Payment Due Today for [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p><strong>This is your FINAL payment reminder.</strong> Payment for <strong>[eventName]</strong> is due TODAY.</p>

<p style="font-size: 18px; text-align: center; margin: 20px 0;">
  💰 <strong>Amount:</strong> [categoryPrice]
</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="[paymentLink]" style="background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Pay Now</a>
</p>

<p><strong>Unpaid spots may be released to waitlisted applicants.</strong></p>

<p>Best,<br>[producerName]</p>
```

---

## 4. Event Countdown (7 emails)

**Category:** `event_countdown`
**Purpose:** Pre-event reminders and day-of communications

---

### 4.1 33 Days Before Event

**Database Fields:**
- **ID:** `33_days_before`
- **Name:** "33 Days Before Event"
- **Position:** 10
- **Category:** `event_countdown`
- **Trigger Type:** `days_before_event`
- **Trigger Value:** `33`
- **Trigger Time:** `10:00`
- **Recipient Filter:** `{ "status": ["approved", "confirmed"], "exclude_status": ["waitlist", "rejected"] }`
- **Enabled by Default:** `true`

**Subject:**
```
[eventName] is Coming Up - 33 Days Out!
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p><strong>[eventName]</strong> is just 33 days away! We're getting excited and hope you are too.</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
</ul>

<p>Start preparing your inventory and materials. We'll send more details as the event approaches.</p>

<p>Best,<br>[producerName]</p>
```

---

### 4.2 23 Days Before Event

**Database Fields:**
- **ID:** `23_days_before`
- **Name:** "23 Days Before Event"
- **Position:** 11
- **Category:** `event_countdown`
- **Trigger Type:** `days_before_event`
- **Trigger Value:** `23`
- **Trigger Time:** `10:00`
- **Recipient Filter:** `{ "status": ["approved", "confirmed"], "exclude_status": ["waitlist", "rejected"] }`
- **Enabled by Default:** `true`

**Subject:**
```
[eventName] - 23 Days to Go!
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>We're less than a month away from <strong>[eventName]</strong>!</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
  <li>🛠️ <strong>Install:</strong> [installDate] at [installTime]</li>
</ul>

<p>Make sure you have everything ready. More details coming soon.</p>

<p>Best,<br>[producerName]</p>
```

---

### 4.3 10 Days Before Event

**Database Fields:**
- **ID:** `10_days_before`
- **Name:** "10 Days Before Event"
- **Position:** 12
- **Category:** `event_countdown`
- **Trigger Type:** `days_before_event`
- **Trigger Value:** `10`
- **Trigger Time:** `10:00`
- **Recipient Filter:** `{ "status": ["approved", "confirmed"], "exclude_status": ["waitlist", "rejected"] }`
- **Enabled by Default:** `true`

**Subject:**
```
10 Days Until [eventName]!
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>We're in the final countdown! <strong>[eventName]</strong> is just 10 days away.</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
  <li>🛠️ <strong>Install:</strong> [installDate] at [installTime]</li>
</ul>

<p>Time to finalize your preparations. Let us know if you have any questions.</p>

<p>Best,<br>[producerName]</p>
```

---

### 4.4 4 Days Before Event

**Database Fields:**
- **ID:** `4_days_before`
- **Name:** "4 Days Before Event"
- **Position:** 13
- **Category:** `event_countdown`
- **Trigger Type:** `days_before_event`
- **Trigger Value:** `4`
- **Trigger Time:** `10:00`
- **Recipient Filter:** `{ "status": ["approved", "confirmed"], "exclude_status": ["waitlist", "rejected"] }`
- **Enabled by Default:** `true`

**Subject:**
```
[eventName] This Week - 4 Days Out!
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p><strong>[eventName]</strong> is THIS WEEK! Just 4 more days.</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
  <li>🛠️ <strong>Install:</strong> [installDate] at [installTime]</li>
</ul>

<p>Final prep time! Make sure you have everything packed and ready to go.</p>

<p>Best,<br>[producerName]</p>
```

---

### 4.5 2 Days Before Event

**Database Fields:**
- **ID:** `2_days_before`
- **Name:** "2 Days Before Event"
- **Position:** 14
- **Category:** `event_countdown`
- **Trigger Type:** `days_before_event`
- **Trigger Value:** `2`
- **Trigger Time:** `10:00`
- **Recipient Filter:** `{ "status": ["approved", "confirmed"], "exclude_status": ["waitlist", "rejected"] }`
- **Enabled by Default:** `true`

**Subject:**
```
Almost There - [eventName] in 2 Days!
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p><strong>[eventName]</strong> is almost here! Just 2 more days.</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
  <li>🛠️ <strong>Install:</strong> [installDate] at [installTime]</li>
</ul>

<p>Double-check your load-in details and make sure you're all set.</p>

<p>Best,<br>[producerName]</p>
```

---

### 4.6 Day of Event

**Database Fields:**
- **ID:** `day_of_event`
- **Name:** "Day of Event - Morning Reminder"
- **Position:** 15
- **Category:** `event_countdown`
- **Trigger Type:** `on_event_date`
- **Trigger Value:** `0`
- **Trigger Time:** `07:00`
- **Recipient Filter:** `{ "status": ["approved", "confirmed"], "exclude_status": ["waitlist", "rejected"] }`
- **Enabled by Default:** `true`

**Subject:**
```
🌟 Today's the Day - [eventName]!
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>Good morning! <strong>[eventName]</strong> is TODAY!</p>

<p><strong>Quick reminders:</strong></p>
<ul>
  <li>📍 <strong>[eventVenue], [eventLocation]</strong></li>
  <li>⏰ <strong>Event:</strong> [eventTime]</li>
</ul>

<p style="text-align: center; margin: 30px 0;">
  <a href="[bulletinLink]" style="background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View Event Info</a>
</p>

<p>Have a fantastic show! We're here if you need anything.</p>

<p>Best,<br>[producerName]</p>
```

---

### 4.7 Day After Event

**Database Fields:**
- **ID:** `day_after_event`
- **Name:** "Day After Event - Thank You"
- **Position:** 16
- **Category:** `event_countdown`
- **Trigger Type:** `days_after_event`
- **Trigger Value:** `1`
- **Trigger Time:** `10:00`
- **Recipient Filter:** `{ "status": ["approved", "confirmed"], "exclude_status": ["waitlist", "rejected"] }`
- **Enabled by Default:** `true`

**Subject:**
```
Thank You for Being Part of [eventName]!
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>Thank you so much for being part of <strong>[eventName]</strong>! We hope you had an amazing experience.</p>

<p>Your participation helped make this event a success, and we couldn't have done it without you.</p>

<p>We'd love to hear your feedback! Let us know what went well and what we can improve for next time.</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{feedback_url}}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Share Feedback</a>
</p>

<p>Looking forward to seeing you at future events!</p>

<p>Best,<br>[producerName]</p>
```

---

---

# PART 2: SYSTEM EMAILS (8)

> ⚠️ **These emails are automatically triggered by system actions and CANNOT be edited, disabled, or customized by producers.** They are sent immediately when the corresponding action occurs in the system.

These are hard-coded into the application logic and sent via service classes, not through the scheduled email system.

---

## System Email 1: Application Accepted

**Database Fields:**
- **ID:** `application_accepted`
- **Name:** "Application Accepted - System Email"
- **Category:** `system_emails`
- **Trigger:** Automatically sent when producer approves an application
- **Recipients:** The approved applicant
- **Editable:** ❌ NO - System controlled
- **Can Pause:** ❌ NO
- **Can Delete:** ❌ NO

**Subject:**
```
🎉 Congratulations! You're In - [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p><strong>Great news!</strong> Your application for <strong>[eventName]</strong> has been <strong>ACCEPTED!</strong></p>

<p>We're thrilled to have you join us.</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
  <li>🏷️ <strong>Category:</strong> [categoryName]</li>
  <li>💰 <strong>Price:</strong> [categoryPrice]</li>
</ul>

<h3>Next Steps:</h3>
<ol>
  <li>Complete your payment by <strong>[paymentDeadline]</strong></li>
  <li>Mark your calendar for install on <strong>[installDate]</strong> at <strong>[installTime]</strong></li>
</ol>

<p style="text-align: center; margin: 30px 0;">
  <a href="[paymentLink]" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Complete Payment</a>
</p>

<p>Questions? Reply to this email.</p>

<p>See you there!<br>[producerName]</p>
```

**Implementation Note:**
This email is sent by `RegistrationEmailService` when a producer changes a registration status to 'approved'. It should NOT be in the scheduled_emails table.

---

## System Email 2: Waitlist / Not Accepted

**Database Fields:**
- **ID:** `waitlist_not_accepted`
- **Name:** "Application Waitlisted or Rejected - System Email"
- **Category:** `system_emails`
- **Trigger:** Automatically sent when producer waitlists or rejects an application
- **Recipients:** The waitlisted/rejected applicant
- **Editable:** ❌ NO

**Subject:**
```
Update on Your Application - [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>Thank you for your interest in <strong>[eventName]</strong>.</p>

<p>After careful review, we're unable to offer you a spot at this time. However, you've been added to our waitlist. If a spot opens up, we'll contact you right away.</p>

<ul>
  <li>📅 <strong>Event:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventLocation]</li>
</ul>

<p>We truly appreciate your interest and encourage you to apply to future events.</p>

<p>Best,<br>[producerName]</p>
```

**Implementation Note:**
Sent when status changes to 'waitlist' or 'rejected'.

---

## System Email 3: Moved to Waitlist (Non-Payment)

**Database Fields:**
- **ID:** `moved_to_waitlist_nonpayment`
- **Name:** "Moved to Waitlist - Payment Missed - System Email"
- **Category:** `system_emails`
- **Trigger:** Automatically sent when vendor misses payment deadline
- **Recipients:** The vendor who missed payment
- **Editable:** ❌ NO

**Subject:**
```
Update: Your Spot for [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>We noticed payment wasn't received by the deadline for <strong>[eventName]</strong>.</p>

<p>Your spot has been moved to the waitlist. If a spot becomes available and you'd still like to participate, we'll reach out.</p>

<p>If you believe this is an error, please contact us immediately at <a href="mailto:[producerEmail]">[producerEmail]</a>.</p>

<p>Best,<br>[producerName]</p>
```

**Implementation Note:**
Triggered by a background job or manual action when payment deadline passes and payment_status is still 'unpaid'.

---

## System Email 4: Payment Confirmed

**Database Fields:**
- **ID:** `payment_confirmed`
- **Name:** "Payment Confirmed - System Email"
- **Category:** `system_emails`
- **Trigger:** Automatically sent when payment is received
- **Recipients:** The vendor who paid
- **Editable:** ❌ NO

**Subject:**
```
✅ Payment Confirmed - [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p><strong>Great news!</strong> Your payment for <strong>[eventName]</strong> has been confirmed.</p>

<ul>
  <li>🏷️ <strong>Category:</strong> [categoryName]</li>
  <li>💰 <strong>Amount Paid:</strong> [categoryPrice]</li>
</ul>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

<ul>
  <li>📅 <strong>Event:</strong> [eventDate]</li>
  <li>📍 <strong>Location:</strong> [eventVenue], [eventLocation]</li>
  <li>🛠️ <strong>Install:</strong> [installDate] at [installTime]</li>
</ul>

<p>You're all set! We'll send more details as the event approaches.</p>

<p>Best,<br>[producerName]</p>
```

**Implementation Note:**
Sent when payment_status changes to 'paid'.

---

## System Email 5: Category Changed

**Database Fields:**
- **ID:** `category_changed`
- **Name:** "Category Changed - System Email"
- **Category:** `system_emails`
- **Trigger:** Automatically sent when producer changes a vendor's category
- **Recipients:** The affected vendor
- **Editable:** ❌ NO

**Subject:**
```
Category Update - [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>Your category for <strong>[eventName]</strong> has been updated to: <strong>[categoryName]</strong></p>

<p><strong>New pricing:</strong> [categoryPrice]</p>

<p>If you have questions about this change, please contact <a href="mailto:[producerEmail]">[producerEmail]</a>.</p>

<p>Best,<br>[producerName]</p>
```

**Implementation Note:**
Sent when vendor_category field is updated on a registration.

---

## System Email 6: Event Details Changed

**Database Fields:**
- **ID:** `event_details_changed`
- **Name:** "Event Details Changed - System Email"
- **Category:** `system_emails`
- **Trigger:** Automatically sent when event date, venue, or time changes
- **Recipients:** All confirmed vendors
- **Editable:** ❌ NO

**Subject:**
```
📝 Event Update - [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>There has been an update to <strong>[eventName]</strong>. Please review the latest event details:</p>

<ul>
  <li>📅 <strong>Event Date:</strong> [eventDate]</li>
  <li>📍 <strong>Venue:</strong> [eventVenue], [eventLocation]</li>
  <li>⏰ <strong>Time:</strong> [eventTime]</li>
</ul>

<p>Please make note of any changes that may affect your participation.</p>

<p>If you have questions, contact <a href="mailto:[producerEmail]">[producerEmail]</a>.</p>

<p>Best,<br>[producerName]</p>
```

**Implementation Note:**
Sent when event_date, event_location, or event_time fields are updated (CEO Decision #3 - this should trigger the date change workflow in frontend).

---

## System Email 7: Event Canceled

**Database Fields:**
- **ID:** `event_canceled`
- **Name:** "Event Canceled - System Email"
- **Category:** `system_emails`
- **Trigger:** Automatically sent when producer cancels the event
- **Recipients:** All vendors (confirmed, waitlisted, pending)
- **Editable:** ❌ NO

**Subject:**
```
❌ Event Canceled - [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p>We regret to inform you that <strong>[eventName]</strong> has been canceled.</p>

<p>We sincerely apologize for any inconvenience this may cause. If you have already made a payment, you will receive a full refund within 5-7 business days.</p>

<p>For any questions regarding refunds or future events, please contact <a href="mailto:[producerEmail]">[producerEmail]</a>.</p>

<p>Thank you for your understanding, and we hope to see you at a future event.</p>

<p>Best,<br>[producerName]</p>
```

**Implementation Note:**
Sent when event status changes to 'cancelled'.

---

## System Email 8: Bulletin Board Update

**Database Fields:**
- **ID:** `bulletin_board_update`
- **Name:** "Bulletin Board Update - System Email"
- **Category:** `system_emails`
- **Trigger:** Automatically sent when producer posts to bulletin board
- **Recipients:** All confirmed vendors
- **Editable:** ❌ NO

**Subject:**
```
📢 New Update from [producerName] - [eventName]
```

**Body (HTML):**
```html
<p>Hi [firstName],</p>

<p><strong>[producerName]</strong> has posted a new update for <strong>[eventName]</strong>.</p>

<p>Head over to your event dashboard to view the full message and any important details.</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="[bulletinLink]" style="background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View Bulletin Board</a>
</p>

<p>Best,<br>The Voxxy Team</p>
```

**Implementation Note:**
Sent when a new bulletin post is created for an event.

---

---

# Implementation Guide

## Database Seeding

### Step 1: Create Email Campaign Template

```ruby
# db/seeds/email_campaign_templates.rb

# Create the default system template
default_template = EmailCampaignTemplate.create!(
  template_type: 'system',
  organization_id: nil,
  name: 'Default Event Campaign',
  description: 'Standard email campaign for all Voxxy Presents events',
  is_default: true
)

puts "✅ Created default email campaign template: #{default_template.name}"
```

### Step 2: Seed 16 Editable Email Template Items

```ruby
# Continue in db/seeds/email_campaign_templates.rb

editable_emails = [
  # Event Announcements (4)
  {
    email_campaign_template: default_template,
    name: 'Immediate Announcement - Applications Open',
    description: 'Sent when applications open',
    category: 'event_announcements',
    position: 1,
    subject_template: "You're Invited: {{event_title}} - Apply Now!",
    body_template: '<p>Hi {{vendor_name}},</p>...',  # Full HTML from above
    trigger_type: 'on_application_open',
    trigger_value: 0,
    trigger_time: '09:00',
    filter_criteria: {},
    enabled_by_default: true
  },
  # ... (continue for all 16 editable templates)
]

editable_emails.each do |email_data|
  EmailTemplateItem.create!(email_data)
  puts "  ✅ Created: #{email_data[:name]}"
end

puts "✅ Created #{editable_emails.count} editable email templates"
```

### Step 3: System Emails (NOT in Template)

System emails are NOT stored in the `email_template_items` table. They are hard-coded in the application logic.

**Example: Sending Application Accepted Email**

```ruby
# app/services/registration_email_service.rb

class RegistrationEmailService
  def self.send_application_accepted(registration)
    event = registration.event

    subject = "🎉 Congratulations! You're In - #{event.title}"

    body = <<~HTML
      <p>Hi #{registration.name},</p>
      <p><strong>Great news!</strong> Your application for <strong>#{event.title}</strong> has been <strong>ACCEPTED!</strong></p>
      <!-- Full HTML from template above -->
    HTML

    # Resolve variables
    body = EmailVariableResolver.resolve(body, event, registration)

    # Send via SendGrid
    send_email(
      to: registration.email,
      subject: subject,
      html_content: body
    )
  end
end
```

**Trigger: When status changes to 'approved'**

```ruby
# app/models/registration.rb

class Registration < ApplicationRecord
  after_update :send_status_change_email, if: :saved_change_to_status?

  private

  def send_status_change_email
    case status
    when 'approved'
      RegistrationEmailService.send_application_accepted(self)
    when 'waitlist', 'rejected'
      RegistrationEmailService.send_waitlist_or_rejected(self)
    # ... other status changes
    end
  end
end
```

---

## Variable Mapping

When implementing `EmailVariableResolver`, map the template variables to database fields:

```ruby
# app/services/email_variable_resolver.rb

class EmailVariableResolver
  VARIABLE_MAP = {
    '[firstName]' => ->(event, registration) { registration&.name&.split&.first },
    '[lastName]' => ->(event, registration) { registration&.name&.split&.last },
    '[vendorName]' => ->(event, registration) { registration&.business_name },
    '[eventName]' => ->(event, registration) { event.title },
    '[eventDate]' => ->(event, registration) { event.event_date&.strftime('%B %d, %Y') },
    '[eventTime]' => ->(event, registration) { event.event_time },
    '[eventVenue]' => ->(event, registration) { event.venue_name },
    '[eventLocation]' => ->(event, registration) { "#{event.city}, #{event.state}" },
    '[categoryName]' => ->(event, registration) { registration&.vendor_category },
    '[categoryPrice]' => ->(event, registration) { "$#{event.booth_price}" },
    '[applicationDeadline]' => ->(event, registration) { event.application_deadline&.strftime('%B %d, %Y') },
    '[paymentDeadline]' => ->(event, registration) { event.payment_deadline&.strftime('%B %d, %Y') },
    '[installDate]' => ->(event, registration) { event.setup_date&.strftime('%B %d, %Y') },
    '[installTime]' => ->(event, registration) { event.setup_time },
    '[producerName]' => ->(event, registration) { event.organization.name },
    '[producerEmail]' => ->(event, registration) { event.organization.email },
    '[paymentLink]' => ->(event, registration) { "https://voxxypresents.com/payments/#{registration.id}" },
    '[bulletinLink]' => ->(event, registration) { "https://voxxypresents.com/events/#{event.slug}/bulletin" }
  }

  def self.resolve(template, event, registration = nil)
    result = template.dup

    VARIABLE_MAP.each do |placeholder, resolver|
      value = resolver.call(event, registration) || placeholder
      result.gsub!(placeholder, value.to_s)
    end

    result
  end
end
```

---

## Button Rendering

Convert `{{Button Text}}` syntax to actual HTML buttons:

```ruby
def self.render_buttons(html_content)
  html_content.gsub(/\{\{(.+?)\}\}/) do |match|
    button_text = $1
    # Extract URL from context or use default
    url = extract_url_from_context(button_text)

    <<~HTML
      <a href="#{url}" style="background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">#{button_text}</a>
    HTML
  end
end
```

---

## Summary

**Total Templates: 24**
- **16 Editable** (stored in `email_template_items`, can be customized per template)
- **8 System** (hard-coded in app logic, triggered by status/action changes)

**Categories:**
- Event Announcements: 4
- Application Updates: 1
- Payment Reminders: 4
- Event Countdown: 7
- System Emails: 8

**Trigger Types Used:**
- `on_application_open` - When applications open
- `days_before_deadline` - X days before application deadline
- `on_application_submit` - When vendor submits application
- `on_status_change_to_approved` - When approved
- `days_before_payment_deadline` - X days before payment due
- `on_payment_deadline` - On payment deadline day
- `days_before_event` - X days before event
- `on_event_date` - Day of event
- `days_after_event` - X days after event
- System triggers (status changes, event updates, etc.)

---

**END OF EMAIL TEMPLATES REFERENCE**
