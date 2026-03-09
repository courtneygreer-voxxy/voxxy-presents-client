# Email Editor Guide - For Producers

**Last Updated:** March 8, 2026
**Audience:** Event Producers & Organizers
**Purpose:** Learn how to create and customize event emails

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Email Editor Overview](#email-editor-overview)
3. [Using Variables](#using-variables)
4. [Email Types](#email-types)
5. [Best Practices](#best-practices)
6. [Common Scenarios](#common-scenarios)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Where to Find Email Editor

**From Command Center:**
1. Click on your event card from the Producer Dashboard
2. Command Center modal opens
3. Click **"Mail"** tab at the top
4. View all your event's scheduled emails

### First Time Setup

**If you haven't generated emails yet:**
1. Click **"Generate Emails from Template"** button
2. System creates 17 pre-written emails for your event
3. All emails are editable and customizable
4. Each email has default timing and content

---

## Email Editor Overview

### Two Editor Types

#### 1. Quick Edit Modal (Plain Text)
**When you see it:** Click "Edit" from the Mail tab dropdown

**Features:**
- Fast, simple editor
- Plain text subject and body
- Variable insertion buttons
- Perfect for quick changes

**Limitations:**
- No HTML formatting
- No bold/italic
- No images

#### 2. Rich Text Editor (HTML)
**When you see it:** Click "Template Builder" or edit from template page

**Features:**
- Full HTML editor (WYSIWYG)
- Bold, italic, underline
- Bullet lists, numbered lists
- Links and images
- Variable insertion buttons
- **Locked footer** (cannot edit - contains unsubscribe link)

---

## Using Variables

### What Are Variables?

Variables are placeholders that automatically fill in with real data when emails are sent.

**Example:**
```
What you type: Hi [greetingName], welcome to [eventName]!
What they see: Hi John's Tacos, welcome to Summer Market 2025!
```

### How to Insert Variables

#### Method 1: Click Variable Buttons (Recommended)

1. **Click on subject or body field** - Variable buttons appear
2. **Find the variable you need** - Organized by color:
   - 🟣 Purple = Event info (dates, location, etc.)
   - 🩷 Pink = Vendor info (names, email, phone)
   - 🔵 Blue = Your organization info
   - 🟢 Green = Links (application, portal, unsubscribe)
3. **Hover over button** - See description and example
4. **Click button** - Variable inserts at cursor position

#### Method 2: Type Manually

Type the variable name in `[brackets]`:
```
[eventName]
[firstName]
[eventDate]
```

**⚠️ Important:** Must use exact spelling and capitalization!

### Variable Categories

#### Event Info (Purple)
Use these for event details:
- `[eventName]` - "Summer Market 2025"
- `[eventDate]` - "Saturday, June 15, 2025"
- `[eventTime]` - "10:00 AM - 6:00 PM"
- `[eventLocation]` - "Piedmont Park, Atlanta, GA"
- `[categoryList]` - Shows all vendor categories with bullet points

#### Vendor Info (Pink)
Use these for personalization:
- `[greetingName]` - Smart greeting (business name or first name)
- `[firstName]` - Vendor's first name
- `[email]` - Vendor's email address
- `[phone]` - Vendor's phone number

#### Your Organization (Blue)
- `[organizationName]` - "Voxxy Presents"
- `[organizationEmail]` - "hello@voxxypresents.com"

#### Links (Green)
- `[eventLink]` - Public event page
- `[dashboardLink]` - Vendor portal
- `[artistApplicationLink]` - Artist application link
- `[vendorApplicationLink]` - Vendor application link
- `[unsubscribeLink]` - Required for all emails

### Which Variables Work Where?

#### ✅ Invitation Emails (Position 1)
**Available:** 34 variables
- ✅ Event info (names, dates, locations)
- ✅ Contact info (names, email, phone)
- ✅ Public links (event page, applications, portal)
- ❌ NO category-specific data (booth price, setup times)

**Why?** Because vendors haven't applied yet!

#### ✅ Registration Emails (Positions 2-17)
**Available:** All 48 variables
- ✅ Everything from invitations
- ✅ Category-specific (booth price, setup times, payment links)
- ✅ Application details (booth number, application date)

**Why?** Because vendors have already applied!

---

## Email Types

### Position 1: Initial Invitation

**When it sends:** When you create batch invitations
**Sent to:** VendorContact (people you invite)
**Purpose:** Invite vendors to apply to your event

**Safe Variables to Use:**
- Event details: `[eventName]`, `[eventDate]`, `[eventLocation]`
- Greetings: `[greetingName]`, `[firstName]`
- Links: `[eventLink]`, `[applicationLink]`
- Categories: `[categoryList]`

**DON'T Use:**
- `[boothPrice]` - Won't work (they haven't picked a category)
- `[vendorCategory]` - Won't work (they haven't applied)
- `[boothNumber]` - Won't work (not assigned yet)

**Example Invitation:**
```
Subject: [greetingName], you're invited to [eventName]!

Body:
Hi [greetingName],

We'd love to have you participate in [eventName] on [eventDate] at [eventLocation]!

We have the following categories available:
[categoryList]

Application deadline: [applicationDeadline]

Apply now: [eventLink]

Questions? Email us at [organizationEmail]

Unsubscribe: [unsubscribeLink]
```

### Positions 2-17: Registration Emails

**When they send:** Various triggers (approval, reminders, etc.)
**Sent to:** Registration (vendors who applied)
**Purpose:** Confirmations, reminders, updates

**All Variables Work:**
- Everything from Position 1
- Plus: `[boothPrice]`, `[vendorCategory]`, `[installTime]`, etc.

**Example Registration Email:**
```
Subject: Application Approved - [eventName]

Body:
Hi [greetingName],

Congratulations! Your [vendorCategory] application has been approved.

Details:
- Booth: [boothNumber]
- Price: [boothPrice]
- Setup: [installDate] at [installTime]

Pay here: [categoryPaymentLink]

Access your portal: [dashboardLink]

Payment due: [paymentDueDate]

Questions? [organizationEmail]
```

---

## Best Practices

### 1. Always Use Personalization

**❌ Generic:**
```
Subject: Event Update
Body: Hello, this is an update about the event.
```

**✅ Personalized:**
```
Subject: [greetingName], Update for [eventName]
Body: Hi [greetingName], we have an important update about [eventName]...
```

### 2. Include Event Context

**❌ Missing Context:**
```
Subject: Reminder
Body: Don't forget to pay!
```

**✅ Clear Context:**
```
Subject: Payment Reminder - [eventName]
Body: Hi [greetingName], friendly reminder that your [boothPrice] payment for [eventName] is due by [paymentDueDate].
```

### 3. Provide Clear Next Steps

**❌ Vague:**
```
Please complete your application.
```

**✅ Specific:**
```
Next Steps:
1. Pay your booth fee: [categoryPaymentLink]
2. Upload your booth photo: [dashboardLink]
3. Review setup times: [installDate] at [installTime]
```

### 4. Always Include Contact Info

**✅ Every email should have:**
```
Questions? Email us at [organizationEmail]

To unsubscribe: [unsubscribeLink]
```

**Note:** The unsubscribe link is **required by law** and automatically locked in the footer!

### 5. Preview Before Sending

1. Click "Preview" from the email dropdown
2. Check that variables resolved correctly
3. Read through the entire email
4. Verify links work
5. Check for typos

---

## Common Scenarios

### Scenario 1: Multi-Category Event

**Problem:** Event has 3 categories with different prices
**Solution:** Use `[categoryList]` variable in invitations

```
We have the following options available:
[categoryList]

Visit our event page to learn more and apply:
[eventLink]
```

**Result:**
```
We have the following options available:
• Artist Booth
• Food Vendor
• Beverage Vendor

Visit our event page to learn more and apply:
https://voxxy.io/events/your-event
```

### Scenario 2: Different Setup Times

**Problem:** Artists set up at 8am, Food vendors at 2pm
**Solution:** Use category-specific variables in registration emails (Positions 2-17)

```
Your setup time for [vendorCategory]:
[installDate] from [installStartTime] to [installEndTime]

Please arrive promptly at [installStartTime].
```

**Result for Food Vendor:**
```
Your setup time for Food:
Friday, June 14, 2025 from 2:00 PM to 4:00 PM

Please arrive promptly at 2:00 PM.
```

### Scenario 3: Friendly Greeting

**Problem:** Want to sound personal, not robotic
**Solution:** Use `[greetingName]` - it's smart!

```
Hi [greetingName], excited to have you at [eventName]!
```

**Results:**
- If business name exists: "Hi John's Tacos, excited to..."
- If only first name: "Hi John, excited to..."
- If nothing: "Hi there, excited to..."

### Scenario 4: Payment Reminder

**Problem:** Need to remind vendors to pay
**Solution:** Use registration email with payment link

```
Subject: Payment Reminder - [eventName] - Due [paymentDueDate]

Hi [greetingName],

This is a friendly reminder that your booth payment is due soon.

Amount Due: [boothPrice]
Due Date: [paymentDueDate]

Pay now: [categoryPaymentLink]

Already paid? Please disregard this email.

Questions? [organizationEmail]
```

### Scenario 5: Pre-Event Checklist

**Problem:** Want vendors to prep for event day
**Solution:** Create reminder email 1-2 days before

```
Subject: Final Reminders for [eventName]

Hi [greetingName],

[eventName] is almost here! Here's what you need to know:

📅 Event Date: [eventDate]
⏰ Your Setup Time: [installTime]
📍 Location: [eventLocation]
🎪 Your Booth: [boothNumber]

Checklist:
☐ Arrive by [installStartTime]
☐ Bring booth setup materials
☐ Have permits ready (if required)

Access event info anytime: [dashboardLink]

See you soon!
[organizationName]
```

---

## Troubleshooting

### Problem: Variable Shows Blank in Email

**Symptoms:** Sent email shows "Hi , your booth is " (missing data)

**Causes:**
1. Used post-application variable in invitation email
2. Variable name misspelled
3. Data not available for recipient

**Solutions:**
1. Check you're using invitation-safe variables (see [Variable Reference](./EMAIL_VARIABLES_REFERENCE.md))
2. Verify exact spelling: `[eventName]` not `[EventName]`
3. Preview email before sending to catch issues

### Problem: Footer Keeps Resetting

**Symptoms:** Can't edit or remove footer

**Explanation:** Footer is intentionally locked!

**Why:** Legal requirement (CAN-SPAM Act) to include unsubscribe link

**Solution:** Footer cannot be edited - it's automatic

### Problem: Can't Delete Sent Email

**Symptoms:** Delete button disabled

**Explanation:** Sent emails cannot be deleted

**Why:** Maintains audit trail

**Solution:** You can pause future sends, but cannot delete history

### Problem: Variable Buttons Don't Show

**Symptoms:** No variable buttons when editing

**Solution:**
1. Click INTO the subject or body field (must be focused)
2. Variable buttons appear on the side
3. If still missing, refresh the page

### Problem: Preview Shows Wrong Category

**Symptoms:** Preview shows Artist prices but vendor is Food

**Solution:**
1. In preview modal, select correct category from dropdown
2. Preview updates with category-specific data
3. Note: Invitations can't show category-specific data (vendor hasn't applied yet)

---

## Quick Reference Card

### Most Common Variables

| Use Case | Variable | Example |
|----------|----------|---------|
| Greeting | `[greetingName]` | "John's Tacos" or "John" |
| Event name | `[eventName]` | "Summer Market 2025" |
| Event date | `[eventDate]` | "Saturday, June 15, 2025" |
| Event time | `[eventTime]` | "10:00 AM - 6:00 PM" |
| Location | `[eventLocation]` | "Piedmont Park, Atlanta" |
| Application deadline | `[applicationDeadline]` | "May 30, 2025" |
| Event page link | `[eventLink]` | Full URL |
| Vendor portal | `[dashboardLink]` | Full URL |
| Unsubscribe | `[unsubscribeLink]` | Full URL (required!) |
| Your email | `[organizationEmail]` | Your contact email |

### Variable Color Code

- 🟣 **Purple** = Event details
- 🩷 **Pink** = Vendor details
- 🔵 **Blue** = Your organization
- 🟢 **Green** = Links

---

## Getting Help

### Need More Variables?

See complete list: **[EMAIL_VARIABLES_REFERENCE.md](./EMAIL_VARIABLES_REFERENCE.md)**

### Technical Questions?

Contact: engineering@voxxypresents.com

### System Overview?

Read: **[EMAIL_SYSTEM_GUIDE.md](./EMAIL_SYSTEM_GUIDE.md)**

---

**Happy Emailing! 📧**

**END OF DOCUMENT**
