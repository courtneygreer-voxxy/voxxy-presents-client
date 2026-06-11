# Invitation Email System - Quick Reference

**Last Updated:** March 9, 2026
**Format:** `[bracket]` variables
**Total Variables Available:** 30 out of 42

---

## What is Position 1?

**Position 1 ("Initial Invitation")** is the email sent when invitations are created.

It's a **real ScheduledEmail** (not virtual) that:

- Uses `on_invitation_send` trigger
- Is in the pre_application category
- Can be edited like any other email
- Creates `EmailDelivery` records with `event_invitation_id` (not `registration_id`)
- Uses `InvitationVariableResolver` (NOT `EmailVariableResolver`)

---

## When Invitations Are Sent

1. Producer creates event with vendor applications
2. Producer selects vendor contacts to invite
3. `POST /api/v1/presents/events/:slug/invitations/batch` is called
4. Backend immediately sends Position 1 email to each contact
5. Backend creates `EmailDelivery` with `event_invitation_id`
6. `InvitationVariableResolver` resolves variables

---

## What Variables CAN Be Used (34 total)

### ✅ Event Variables (14/15)

```
[eventName]              → "Summer Market 2025"
[eventDate]              → "Saturday, June 15, 2025"
[eventEndDate]           → "Sunday, June 17, 2025"
[dateRange]              → "June 15-17, 2025"
[eventTime]              → "10:00 AM - 6:00 PM"
[eventLocation]          → "Piedmont Park, Atlanta, GA"
[eventCity]              → "Atlanta"
[address]                → "Piedmont Park, Atlanta, GA"
[eventVenue]             → "Piedmont Park"
[eventDescription]       → "A family-friendly outdoor market..."
[applicationDeadline]    → "Thursday, May 30, 2025"
[paymentDueDate]         → "Monday, June 1, 2025"
[ageRestriction]         → "21+"
[categoryList]           → "• Artist Booth - https://voxxy.io/events/event-slug/apply/376\n• Food Vendor - https://voxxy.io/events/event-slug/apply/377"
```

### ✅ Organization Variables (2/2)

```
[organizationName]       → "Voxxy Presents"
[organizationEmail]      → "hello@voxxypresents.com"
```

### ✅ Vendor Contact Variables (10/19)

```
[greetingName]           → "John's Tacos" or "John" (smart!)
[firstName]              → "John"
[lastName]               → "Doe"
[fullName]               → "John Doe"
[businessName]           → "John's Tacos"
[contactName]            → "Jane Smith"
[email]                  → "john@example.com"
[phone]                  → "(555) 123-4567"
[website]                → "https://johnstacos.com"
[categoryApplicationLink] → "https://voxxy.io/apply/abc123"
```

### ✅ Link Variables (3/4)

```
[eventLink]              → Public event page URL (main hub)
[eventPortalLink]        → Vendor portal URL
[unsubscribeLink]        → Unsubscribe URL (REQUIRED!)
```

**Note:** Individual application links are now included in `[categoryList]` - see below!

---

## What Variables CAN'T Be Used (14 total)

### ❌ Category-Specific (Don't use!)

```
[boothPrice]             ❌ Unknown until they pick category
[installDate]            ❌ Varies by category
[installTime]            ❌ Varies by category
[installStartTime]       ❌ Varies by category
[installEndTime]         ❌ Varies by category
[categoryDescription]    ❌ Varies by category
[categoryPaymentLink]    ❌ Per-category URL
```

### ❌ Registration-Level (Don't use!)

```
[vendorCategory]         ❌ They haven't applied yet
[boothNumber]            ❌ Not assigned yet
[applicationDate]        ❌ No registration yet
[applicationCode]        ❌ No application yet
[paymentLink]            ❌ Per-registration URL
[eventOptOutLink]        ❌ Post-registration only
```

**Why?** These variables require data that only exists AFTER the vendor applies!

---

## Best Practices for Invitations

### 1. Use [categoryList] for Multi-Category Events ✅

```
Hi [greetingName],

We'd love to have you at [eventName]!

Available categories:
[categoryList]

Apply here: [eventLink]
```

**Result:**

```
Hi John's Tacos,

We'd love to have you at Summer Market 2025!

Available categories:
• Artist Booth
• Food Vendor
• Beverage Vendor

Apply here: https://voxxy.io/events/your-event
```

### 2. Use Smart Links ✅

```
Interested in applying as an artist? [artistApplicationLink]
Food or beverage vendor? [vendorApplicationLink]
View all options: [eventLink]
```

### 3. Personalize with [greetingName] ✅

```
Hi [greetingName], excited to invite you to [eventName]!
```

**Results:**

- Business name: "Hi John's Tacos, excited to..."
- First name only: "Hi John, excited to..."
- No name: "Hi there, excited to..."

### 4. Always Include Unsubscribe ✅

```
Questions? Email [organizationEmail]
To unsubscribe: [unsubscribeLink]
```

**Note:** Footer is automatically locked to ensure this!

---

## Common Mistakes

### ❌ WRONG: Using Post-Application Variables

```
Subject: Your [vendorCategory] booth is ready! (BLANK!)

Hi [greetingName],

Your booth number is [boothNumber] (BLANK!)
Please pay [boothPrice] (BLANK!)
```

### ✅ CORRECT: Use Invitation-Safe Variables

```
Subject: You're invited to [eventName]!

Hi [greetingName],

Check out our available categories:
[categoryList]

Apply now: [eventLink]
```

---

## Solution for Multi-Category Events

### ✅ Option 1: Use [categoryList] Variable (BEST)

```
Hi [greetingName],

We have the following options for [eventName]:

[categoryList]

Each category has different pricing and setup times.
View details and apply: [eventLink]

Deadline: [applicationDeadline]
```

### ✅ Option 2: Direct Application Links in [categoryList]

```
Hi [greetingName],

Ready to join [eventName]? Choose your category and apply directly:

[categoryList]

View full event details: [eventLink]
```

### ✅ Option 3: Generic Language

```
Hi [greetingName],

Join us at [eventName]!

Vendor fees vary by category.
Learn more and apply: [eventLink]
```

---

## Variable Resolution

### InvitationVariableResolver

**File:** `/app/services/invitation_variable_resolver.rb`

**What it has access to:**

- `event` - Full event record
- `vendor_contact` - Contact being invited
- `event.vendor_applications` - Public application info

**What it resolves:**

- ✅ 34 variables (see above lists)
- ❌ 14 variables (post-application only)

**Example:**

```ruby
resolver = InvitationVariableResolver.new(event, vendor_contact)
subject = resolver.resolve("[greetingName], join us at [eventName]!")
# => "John's Tacos, join us at Summer Market 2025!"
```

---

## Key Files

### Frontend

| File                                                    | Purpose                                          |
| ------------------------------------------------------- | ------------------------------------------------ |
| `/src/utils/emailVariables.ts`                          | All 48 variables with `worksInInvitations` flags |
| `/src/types/email.ts`                                   | EmailDelivery type (has `event_invitation_id`)   |
| `/src/components/producer/Email/EmailAutomationTab.tsx` | Mail tab showing emails                          |
| `/src/services/api.ts`                                  | EventInvitation API calls                        |
| `/src/components/shared/EventEmailPreviewModal.tsx`     | Preview modal                                    |

### Backend

| File                                                               | Purpose                                    |
| ------------------------------------------------------------------ | ------------------------------------------ |
| `/app/services/invitation_variable_resolver.rb`                    | Resolves 34 invitation variables           |
| `/app/services/email_variable_resolver.rb`                         | Resolves all 48 registration variables     |
| `/app/controllers/api/v1/presents/event_invitations_controller.rb` | Handles batch invitation sends             |
| `/app/models/email_delivery.rb`                                    | Tracks delivery with `event_invitation_id` |

---

## Testing Checklist

Before sending invitations:

- [ ] Preview email with real contact data
- [ ] Verify all `[variables]` resolved correctly
- [ ] Check that `[categoryList]` shows all categories
- [ ] Verify `[eventLink]` goes to correct page
- [ ] Test `[artistApplicationLink]` and `[vendorApplicationLink]`
- [ ] Confirm `[unsubscribeLink]` is present
- [ ] Check personalization with `[greetingName]`
- [ ] No blank spaces where variables should be
- [ ] No post-application variables used

---

## Complete Documentation

For more details, see:

- **[EMAIL_SYSTEM_GUIDE.md](./email-system/EMAIL_SYSTEM_GUIDE.md)** - Complete system overview
- **[EMAIL_VARIABLES_REFERENCE.md](./email-system/EMAIL_VARIABLES_REFERENCE.md)** - All 48 variables
- **[EMAIL_EDITOR_GUIDE.md](./email-system/EMAIL_EDITOR_GUIDE.md)** - How to use the editor

---

**Updated:** March 8, 2026 - Complete variable alignment

---

## Important Notes

1. **Format:** Variables use `[bracket]` format, NOT {{mustache}}
2. **Backend:** Resolver is `InvitationVariableResolver` (not RegistrationVariableResolver)
3. **Tracking:** Creates EmailDelivery with `event_invitation_id` filled (not registration_id)
4. **Edit:** Position 1 is fully editable - producers can customize
5. **Trigger:** Always `on_invitation_send` (can't change)

---

## Quick Links

- Full Analysis: [INVITATION_EMAIL_SYSTEM_ANALYSIS.md](./INVITATION_EMAIL_SYSTEM_ANALYSIS.md)
- Email Variables: `/src/utils/emailVariables.ts` (lines 36-308)
- Email Types: `/src/types/email.ts` (EmailDelivery, ScheduledEmail)
- Email Audit Log: [EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md](./EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md)
- Backend Unification: [INVITATION_UNIFICATION_FRONTEND_UPDATE.md](./INVITATION_UNIFICATION_FRONTEND_UPDATE.md)

---

## Common Questions

**Q: Can I use [boothPrice] in invitation emails?**
A: No - the invitee hasn't chosen their category yet. Use [categoryList] instead.

**Q: Why can't I see invitations in the Mail tab?**
A: Position 1 "Initial Invitation" is in the Mail tab. Invitations are tracked separately in event_invitations table but emails are sent via Position 1.

**Q: How does the backend know what to put in variables?**
A: InvitationVariableResolver uses:

- event_invitation object (has vendor_contact)
- vendor_contact data (first_name, last_name, email, business_name)
- event data (title, date, location, etc.)

**Q: How are invitations tracked?**
A: EmailDelivery records have event_invitation_id (instead of registration_id).
Audit log shows delivery status for each invitation.

**Q: Can I preview an invitation email?**
A: Yes - click Preview on Position 1 email in Mail tab.
(Current limitation: Uses generic sample, not specific contact data)

---

## How to Edit Position 1

1. Open Mail tab for your event
2. Scroll to "Initial Invitation" (Position 1)
3. Click row → Edit button
4. Modify subject/body with any available variables
5. Save changes

**Note:** Trigger type is locked to `on_invitation_send` (can't change)

---

## Recommended Practices

### ✅ DO

- Use [greetingName] to personalize
- Include [eventLink] for call-to-action
- List all categories/prices if multi-category
- Use [applicationDeadline] to create urgency
- Preview before sending

### ❌ DON'T

- Use [boothPrice] (unknown at invitation time)
- Use [installDate] (category-specific)
- Assume vendor_category is known
- Remove [eventLink] (important for conversion)
- Forget to test with real event

---

## What's Coming

Planned enhancements:

- [ ] [categoryList] variable (shows all categories with prices)
- [ ] [applicationsList] variable (for registrations)
- [ ] Invite-specific preview (select vendor contact)
- [ ] [invitationTokenLink] for direct accept/decline
