# Category Email Templates Guide

**Created:** April 3, 2026
**Status:** ✅ Production Ready
**Audience:** Producers, Admins

---

## Overview

Category Email Templates allow producers to send automated emails to specific vendor types with customized content. This guide explains how category templates work, when to use them, and how to configure them in the event creation wizard.

### Key Concepts

- **Event-Wide Templates**: Emails sent to ALL vendors (invitations, updates, cancellations)
- **Category Templates**: Emails specific to vendor application process (confirmation, approval, payment reminders)
- **Universal Sequence**: Same category emails for all vendor types (DEFAULT, simpler)
- **Category-Specific Sequences**: Different emails per vendor type (advanced, more control)

---

## Table of Contents

1. [Email Template Types](#email-template-types)
2. [Universal vs Category-Specific](#universal-vs-category-specific)
3. [When to Use Which Option](#when-to-use-which-option)
4. [Configuration Guide](#configuration-guide)
5. [Email Count Calculations](#email-count-calculations)
6. [Template Preview](#template-preview)
7. [Send Date Triggers](#send-date-triggers)
8. [Best Practices](#best-practices)

---

## Email Template Types

### Event-Wide Emails

**Purpose:** Communications sent to ALL vendors regardless of category

**Email Types:**

- **Event Invitation**: Initial invitation to apply
- **Event Update**: Changes to event details (date, location, etc.)
- **Event Cancellation**: Event is canceled
- **Application Deadline Reminders**: 7 days before, 3 days before, 1 day before, on deadline, overdue

**Trigger Examples:**

```typescript
{
  trigger_type: "on_invite",          // When invitation sent
  trigger_type: "manual",             // Producer sends manually
  trigger_type: "days_before_deadline", // 7 days before application deadline
  trigger_value: 7
}
```

**Configuration:**

- Selected in Step 4 of event wizard
- Single template dropdown
- Applies to entire event

### Category-Specific Emails

**Purpose:** Communications specific to vendor application process

**Email Types:**

- **Application Confirmation**: Vendor submitted application
- **Application Approved**: Vendor approved for event
- **Application Rejected**: Vendor not selected
- **Payment Reminder**: Vendor needs to pay booth fee
- **Event Countdown**: 3 days before, 1 day before, day-of event

**Trigger Examples:**

```typescript
{
  trigger_type: "on_application",     // When vendor applies
  trigger_type: "on_approval",        // When application approved
  trigger_type: "days_after_approval", // 3 days after approval
  trigger_value: 3,
  trigger_type: "days_before_event",  // 3 days before event
  trigger_value: 3
}
```

**Configuration:**

- Two modes: Universal or Category-Specific
- Configured in Step 4 of event wizard
- Choice affects all categories

---

## Universal vs Category-Specific

### Universal Sequence (DEFAULT) ✅

**What It Is:**
A single email template that's used for ALL vendor categories at your event.

**How It Works:**

```
Event: Summer Market
  Universal Template: "Default Category Sequence" (5 emails)

  ├── Food Vendors → Uses Universal Template
  ├── Artists → Uses Universal Template
  └── Sponsors → Uses Universal Template

  Total: 5 emails (sent to each category separately)
```

**Visual in Wizard:**

```
🔘 Universal Sequence [DEFAULT]
   (5 emails)

   Template: Default Category Sequence
   5 emails • Shared by all 3 categories
```

**Pros:**

- ✅ Simpler to manage (one template)
- ✅ Consistent messaging across categories
- ✅ Fewer emails to create/edit
- ✅ Recommended for most events
- ✅ Pre-selected by default in wizard

**Cons:**

- ❌ Less customization per vendor type
- ❌ Can't have different pricing reminders
- ❌ Can't emphasize category-specific requirements

**When to Use:**

- Categories have similar application processes
- Content doesn't need to vary by vendor type
- You want simpler event management
- First-time using email automation
- Standard markets/festivals

### Category-Specific Sequences

**What It Is:**
Each category uses its own assigned email template with custom content.

**How It Works:**

```
Event: Summer Market

  ├── Food Vendors → "Food Vendor Template" (5 emails)
  │   └── Custom payment instructions for commercial kitchen
  ├── Artists → "Artist Template" (7 emails)
  │   └── Portfolio submission reminders
  └── Sponsors → "Sponsor Template" (4 emails)
      └── Logo upload and visibility package details

  Total: 16 emails (different content per category)
```

**Visual in Wizard:**

```
⚪ Category-Specific Sequences
   (16 total emails)

   🍔 Food Vendors → Food Vendor Template (5 emails)
   🎨 Artists → Artist Template (7 emails)
   💎 Sponsors → Sponsor Template (4 emails)
```

**Pros:**

- ✅ Maximum customization per vendor type
- ✅ Tailor messaging to category needs
- ✅ Different payment instructions per category
- ✅ Emphasize category-specific requirements

**Cons:**

- ❌ More templates to manage
- ❌ Takes longer to set up
- ❌ Need to update multiple templates for changes
- ❌ More complex to track

**When to Use:**

- Categories have very different requirements
- Food vendors need commercial kitchen info
- Artists need portfolio submission process
- Sponsors need visibility package details
- Different payment terms per category
- Advanced email automation users

---

## When to Use Which Option

### Use Universal Sequence When:

✅ **Your categories have similar processes**

```
Food Vendors, Beverage Vendors, Dessert Vendors
→ All pay same price, same setup time, same requirements
```

✅ **Content works for all vendor types**

```
Generic payment reminders, setup instructions, contact info
→ No category-specific details needed
```

✅ **You want simpler management**

```
Update one template → affects all categories
Easier to maintain and test
```

✅ **First-time using automation**

```
Start simple, can always switch later
Get comfortable with system first
```

### Use Category-Specific When:

✅ **Categories have different requirements**

```
Food Vendors → Need health permit info
Artists → Need portfolio submission
Sponsors → Need logo files for marketing
```

✅ **Different pricing or payment terms**

```
Food Vendors: $500 (commercial kitchen required)
Artists: $200 (standard booth)
Sponsors: $1000+ (visibility packages)
```

✅ **Different setup/teardown times**

```
Food Vendors → Install 6am (equipment setup)
Artists → Install 9am (table setup)
Sponsors → Install 8am (banner installation)
```

✅ **Category-specific instructions needed**

```
Food Vendors → Health dept contact, insurance requirements
Artists → Display guidelines, lighting info
Sponsors → Banner sizes, logo placement rules
```

---

## Configuration Guide

### Step-by-Step: Universal Sequence (Recommended)

**1. Complete Steps 1-3 of Event Wizard**

- Event details
- Select categories
- Invite contacts (optional)

**2. Navigate to Step 4: Email Sequences**

**3. Configure Event-Wide Sequence**

```
Section: "Event-Wide Sequence"
Description: "Sent to all vendors (invitations, updates)"
Action: Select template from dropdown
Default: "Default Event Template"
```

**4. Configure Category Emails (Universal)**

```
Section: "Vendor Category Sequences"
Option: 🔘 Universal Sequence [DEFAULT] ← Already selected

Template Selector: "Default Category Sequence" (or choose different)
Email Count Display: (5 emails)
Preview: Click to see full sequence

✅ This is the recommended option for most events
```

**5. Submit**

- Click "Create Event"
- All categories use same template
- Done!

### Step-by-Step: Category-Specific Sequences (Advanced)

**1. First, Assign Templates to Categories**

Before creating event, ensure categories have templates assigned:

```
Navigate to: Settings → Categories
Select: "Food Vendor"
Edit: Email Campaign Template → "Food Vendor Sequence"
Save: Template now assigned to category

Repeat for: Artists, Sponsors, etc.
```

**2. Complete Steps 1-3 of Event Wizard**

**3. Navigate to Step 4: Email Sequences**

**4. Switch to Category-Specific Mode**

```
Section: "Vendor Category Sequences"
Action: Click ⚪ Category-Specific Sequences radio button

UI Updates to Show:
🍔 Food Vendors → Food Vendor Template (5 emails)
🎨 Artists → Artist Template (7 emails)
💎 Sponsors → Sponsor Template (4 emails)

Total: (16 emails)
```

**5. Review Category Templates**

- Verify each category has correct template
- Click Preview to see emails
- Check email counts match expectations

**6. Submit**

- Click "Create Event"
- Each category uses its assigned template

---

## Email Count Calculations

### How Counts Work

The system displays accurate email counts based on your configuration:

#### Universal Sequence

```typescript
Template: "Default Category Sequence"
Emails in template: 5

Display: "(5 emails)"

Actual emails sent:
- 5 emails to Food Vendors
- 5 emails to Artists
- 5 emails to Sponsors
= 15 total scheduled emails (same content)
```

#### Category-Specific Sequences

```typescript
Food Vendor Template: 5 emails
Artist Template: 7 emails
Sponsor Template: 4 emails

Display: "(16 total emails)"

Actual emails sent:
- 5 unique emails to Food Vendors
- 7 unique emails to Artists
- 4 unique emails to Sponsors
= 16 total scheduled emails (different content)
```

### Email Count Components

Each template shows:

```
Template Name (X emails)
└── X = Number of EmailTemplateItem records in template
```

**Note:** Email count is the number of unique email types, not the total number of individual emails sent (which depends on number of vendors).

### Viewing Email Counts

**In Template Library:**

```
Default Category Sequence
└── 5 emails
    ├── Application Confirmation
    ├── Approval Notification
    ├── Payment Reminder
    ├── 3 Days Before Event
    └── Day of Event
```

**In Event Wizard (Step 4):**

```
Universal Sequence [DEFAULT]
└── (5 emails) ← Count displayed next to template name
```

```
Category-Specific Sequences
└── (16 total emails) ← Sum of all category templates
    ├── Food: (5 emails)
    ├── Artists: (7 emails)
    └── Sponsors: (4 emails)
```

---

## Template Preview

### Preview Functionality

Click "Preview" button to see:

**1. Email List**

- All emails in sequence
- Send triggers and timing
- Email subjects
- Preview of body content

**2. Send Date Calculations**

```
Event Date: June 15, 2026
Application Deadline: May 30, 2026

Email: "3 Days Before Event"
Trigger: days_before_event (3)
Calculated Send Date: June 12, 2026
```

**3. Variable Interpolation**

- {{event_name}} → "Summer Market"
- {{vendor_name}} → "John's Food Truck"
- {{booth_price}} → "$350.00"
- {{application_deadline}} → "May 30, 2026"

### Preview Limitations

⚠️ Preview shows sample data, not actual vendor data:

- Uses placeholder vendor name
- Shows estimated send dates
- May not reflect final content if template is edited later

💡 Tip: Preview templates in Template Library for more control over sample data.

---

## Send Date Triggers

### Trigger Types

Category emails use these trigger types:

#### 1. Application-Based Triggers

```typescript
on_application // Immediately when vendor applies
on_approval // Immediately when approved
on_rejection // Immediately when rejected
days_after_approval // X days after approval
trigger_value: 3 // Example: 3 days later
```

#### 2. Event-Based Triggers

```typescript
days_before_event // X days before event date
trigger_value: 3 // Example: 3 days before
on_event_date // Day of event (morning)
days_after_event // X days after event
trigger_value: 1 // Example: 1 day after (follow-up)
```

#### 3. Deadline-Based Triggers

```typescript
days_before_deadline // X days before application deadline
trigger_value: 7 // Example: 7 days before deadline
on_deadline // Day of deadline
days_after_deadline // X days after deadline (late notice)
trigger_value: 1 // Example: 1 day overdue
```

### Send Date Calculation Examples

**Event Date:** June 15, 2026
**Application Deadline:** May 30, 2026
**Vendor Approved:** May 25, 2026

| Email                    | Trigger                 | Calculation      | Send Date     |
| ------------------------ | ----------------------- | ---------------- | ------------- |
| Application Confirmation | on_application          | Immediate        | May 20, 2026  |
| Approval Notification    | on_approval             | Immediate        | May 25, 2026  |
| Payment Reminder         | days_after_approval (3) | May 25 + 3 days  | May 28, 2026  |
| 7 Days Before            | days_before_event (7)   | June 15 - 7 days | June 8, 2026  |
| 3 Days Before            | days_before_event (3)   | June 15 - 3 days | June 12, 2026 |
| Day of Event             | on_event_date           | June 15 (6am)    | June 15, 2026 |

### Trigger Precedence

When vendor triggers multiple emails on same day:

1. Earlier trigger_value sends first
2. Same trigger_value → Alphabetical by email name
3. Manual emails → Send immediately when triggered

---

## Best Practices

### For Producers

**Starting Out:**

1. ✅ **Start with Universal Sequence**
   - Simpler to learn and manage
   - Works for 80% of events
   - Can always switch later

2. ✅ **Use System Defaults First**
   - Pre-built templates are battle-tested
   - Clone and customize when needed
   - Don't reinvent the wheel

3. ✅ **Preview Before Creating Event**
   - Check email content makes sense
   - Verify send dates look correct
   - Ensure all required info is included

**Advanced Users:** 4. ✅ **Set Up Category Templates Ahead**

- Assign templates to categories before wizard
- Reuse templates across multiple events
- Build library of proven templates

5. ✅ **Test with Small Events First**
   - Try category-specific on smaller event
   - Verify content is correct per category
   - Refine templates before big event

6. ✅ **Document Category Requirements**
   - Keep notes on what each category needs
   - Update templates based on vendor feedback
   - Share knowledge with team

### For Template Creation

**Content Guidelines:**

1. **Be Specific to Category**

```
❌ Generic: "Please bring your items for setup"
✅ Category-Specific:
   Food Vendors: "Bring health permit, propane tanks, and menu boards"
   Artists: "Bring display stands, price tags, and lighting"
   Sponsors: "Bring banner (8'x4'), tablecloth, and marketing materials"
```

2. **Include Category-Relevant Details**

```
Food Vendors:
- Health department contact
- Propane tank regulations
- Commercial kitchen requirements
- Food safety guidelines

Artists:
- Display dimensions
- Lighting availability
- Hanging restrictions
- Sales tax requirements

Sponsors:
- Logo file requirements
- Banner size specifications
- Booth visibility locations
- Marketing package details
```

3. **Adjust Timing for Category Needs**

```
Food Vendors:
- Earlier payment deadline (equipment orders)
- More setup reminders (complex equipment)
- Day-before health permit reminder

Artists:
- Standard timing
- Portfolio submission reminder
- Display setup tips

Sponsors:
- Early payment deadline (marketing prep)
- Logo submission deadline
- Visibility package confirmation
```

### For Email Timing

1. **Don't Over-Email**

```
❌ Too Many: 15+ emails per category
✅ Just Right: 5-7 emails per category
```

2. **Space Out Emails**

```
❌ 3 emails in one day
✅ Minimum 2-3 days between emails
```

3. **Respect Unsubscribes**

```
✅ System automatically excludes unsubscribed contacts
✅ Warning shown in Step 3 of wizard
✅ Unsubscribed vendors won't receive ANY emails
```

---

## Troubleshooting

### Issue: Wrong Email Count Displayed

**Problem:** Category shows 10 emails, but template library shows 5

**Cause:** Multiple categories using same template (count is per-category)

**Solution:** This is correct behavior

```
Universal Template: 5 emails
3 Categories: Food, Artist, Sponsor
Display: (5 emails) per category
Total Scheduled: 15 emails (5 × 3 categories)
```

### Issue: Category Template Not Showing

**Problem:** Selected category-specific mode but category shows "Default"

**Cause:** Category doesn't have email_campaign_template_id assigned

**Solution:**

1. Go to Settings → Categories
2. Edit the category
3. Assign an email campaign template
4. Return to event wizard
5. Template should now appear

### Issue: Can't Find My Custom Template

**Problem:** Created custom template but it's not in dropdown

**Cause:** Template might be:

- Marked as system template (admins only)
- Belongs to different organization
- Not set to "category" template_type

**Solution:**

1. Go to Template Library
2. Find your template
3. Verify it shows for your organization
4. Check template_type is "category" not "generic"
5. Clone if needed to your organization

### Issue: Universal Template Shows Wrong Emails

**Problem:** Universal template includes event-wide emails

**Cause:** Selected wrong template type

**Solution:**

- Event-Wide Sequence dropdown → "generic" templates (invitations, updates)
- Category Sequence dropdown → "category" templates (application process)
- Ensure you're selecting from correct dropdown

---

## Related Documentation

- [Event Creation Wizard](../features/EVENT_CREATION_WIZARD.md) - Complete wizard guide
- [Email Sequence System](../../../voxxy-rails/docs/EMAIL_SEQUENCE_SYSTEM.md) - Backend email system
- [Category-Specific Email System](../../../voxxy-rails/docs/CATEGORY_SPECIFIC_EMAIL_SYSTEM.md) - Backend category emails
- [Email Variable Reference](EMAIL_VARIABLES.md) - Available email variables

---

## Change Log

**April 3, 2026** - Initial documentation

- Comprehensive guide for category email templates
- Explained Universal vs Category-Specific sequences
- Decision guide for when to use each option
- Configuration instructions for both modes
- Email count calculation explanations
- Send date trigger reference
- Best practices and troubleshooting

---

**Questions?** Contact: team@voxxyai.com
