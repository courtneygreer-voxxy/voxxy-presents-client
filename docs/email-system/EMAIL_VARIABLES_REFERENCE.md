# Email Variables Reference - Complete List

**Last Updated:** March 9, 2026
**Total Variables:** 42
**Format:** `[bracket]` notation

---

## 📊 Quick Summary

- **Works in Invitations (Position 1):** 30 variables ✅
- **Only Works Post-Application (Positions 2-17):** 12 variables ❌
- **Recent Change:** Simplified link variables from 12 → 4, enhanced [categoryList] to include application links

---

## Variable Format

**All variables use `[bracket]` format:**

```
[eventName]  ✅ Correct
{{eventName}} ❌ Old format (legacy support only)
```

---

## 🎯 EVENT VARIABLES (15 total)

### ✅ Available in Invitations (14/15)

| Variable                | Description                                                   | Example                                                                                                                       | Invitation | Registration |
| ----------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------ |
| `[eventName]`           | Event title                                                   | "Summer Market 2025"                                                                                                          | ✅         | ✅           |
| `[eventDate]`           | Event start date                                              | "Saturday, June 15, 2025"                                                                                                     | ✅         | ✅           |
| `[eventEndDate]`        | Event end date                                                | "Sunday, June 17, 2025"                                                                                                       | ✅         | ✅           |
| `[dateRange]`           | Formatted date range                                          | "June 15-17, 2025"                                                                                                            | ✅         | ✅           |
| `[eventTime]`           | Event time                                                    | "10:00 AM - 6:00 PM"                                                                                                          | ✅         | ✅           |
| `[eventLocation]`       | Venue and address                                             | "Piedmont Park, Atlanta, GA"                                                                                                  | ✅         | ✅           |
| `[eventCity]`           | City from location                                            | "Atlanta"                                                                                                                     | ✅         | ✅           |
| `[address]`             | Full address (alias for eventLocation)                        | "Piedmont Park, Atlanta, GA"                                                                                                  | ✅         | ✅           |
| `[eventVenue]`          | Venue name only                                               | "Piedmont Park"                                                                                                               | ✅         | ✅           |
| `[eventDescription]`    | Event description text                                        | "A family-friendly outdoor market..."                                                                                         | ✅         | ✅           |
| `[applicationDeadline]` | Last day to apply                                             | "Thursday, May 30, 2025"                                                                                                      | ✅         | ✅           |
| `[paymentDueDate]`      | Payment deadline                                              | "Monday, June 1, 2025"                                                                                                        | ✅         | ✅           |
| `[ageRestriction]`      | Age policy                                                    | "21+"                                                                                                                         | ✅         | ✅           |
| `[categoryList]`        | Bulleted list of all categories with direct application links | "• Artist Booth - https://voxxy.io/events/event-slug/apply/376\n• Food Vendor - https://voxxy.io/events/event-slug/apply/377" | ✅         | ✅           |

### ❌ Only Post-Application (1/15)

| Variable       | Description                       | Example | Invitation | Registration |
| -------------- | --------------------------------- | ------- | ---------- | ------------ |
| `[boothPrice]` | Booth price for vendor's category | "$150"  | ❌         | ✅           |

---

## 🏢 ORGANIZATION VARIABLES (2 total)

### ✅ Available in Invitations (2/2)

| Variable              | Description            | Example                   | Invitation | Registration |
| --------------------- | ---------------------- | ------------------------- | ---------- | ------------ |
| `[organizationName]`  | Your organization name | "Voxxy Presents"          | ✅         | ✅           |
| `[organizationEmail]` | Your contact email     | "hello@voxxypresents.com" | ✅         | ✅           |

---

## 👤 VENDOR VARIABLES (19 total)

### ✅ Available in Invitations (10/19)

| Variable                    | Description                             | Example                         | Invitation | Registration |
| --------------------------- | --------------------------------------- | ------------------------------- | ---------- | ------------ |
| `[greetingName]`            | Smart greeting (business or first name) | "John's Tacos" or "John"        | ✅         | ✅           |
| `[firstName]`               | Vendor's first name                     | "John"                          | ✅         | ✅           |
| `[lastName]`                | Vendor's last name                      | "Doe"                           | ✅         | ✅           |
| `[fullName]`                | Vendor's full name                      | "John Doe"                      | ✅         | ✅           |
| `[businessName]`            | Vendor's business name                  | "John's Tacos"                  | ✅         | ✅           |
| `[contactName]`             | Contact person name                     | "Jane Smith"                    | ✅         | ✅           |
| `[email]`                   | Vendor's email                          | "john@johnstacos.com"           | ✅         | ✅           |
| `[phone]`                   | Vendor's phone                          | "(555) 123-4567"                | ✅         | ✅           |
| `[website]`                 | Vendor's website                        | "https://johnstacos.com"        | ✅         | ✅           |
| `[categoryApplicationLink]` | Public application URL                  | "https://voxxy.io/apply/abc123" | ✅         | ✅           |

### ❌ Only Post-Application (9/19)

| Variable                | Description                 | Example                              | Invitation | Registration |
| ----------------------- | --------------------------- | ------------------------------------ | ---------- | ------------ |
| `[vendorCategory]`      | Category vendor applied for | "Food"                               | ❌         | ✅           |
| `[categoryDescription]` | Description of category     | "Local restaurants and food vendors" | ❌         | ✅           |
| `[boothNumber]`         | Assigned booth location     | "A-12"                               | ❌         | ✅           |
| `[applicationDate]`     | Date vendor applied         | "Monday, May 15, 2025"               | ❌         | ✅           |
| `[installDate]`         | Setup date                  | "Friday, June 14, 2025"              | ❌         | ✅           |
| `[installTime]`         | Setup time range            | "8:00 AM - 10:00 AM"                 | ❌         | ✅           |
| `[installStartTime]`    | Setup start time            | "8:00 AM"                            | ❌         | ✅           |
| `[installEndTime]`      | Setup end time              | "10:00 AM"                           | ❌         | ✅           |
| `[categoryPaymentLink]` | Payment link for category   | "https://pay.stripe.com/..."         | ❌         | ✅           |
| `[applicationCode]`     | Unique application code     | "APP-2024-12345"                     | ❌         | ✅           |

---

## 🔗 COMPUTED/LINK VARIABLES (4 total)

### ✅ Available in Invitations (3/4)

| Variable            | Description                            | Example                                 | Invitation | Registration |
| ------------------- | -------------------------------------- | --------------------------------------- | ---------- | ------------ |
| `[eventLink]`       | Public application page URL (main hub) | "https://voxxy.io/events/org/event-123" | ✅         | ✅           |
| `[eventPortalLink]` | Vendor portal/dashboard URL            | "https://voxxy.io/portal/org/event-123" | ✅         | ✅           |
| `[unsubscribeLink]` | Unsubscribe URL (required!)            | "https://voxxy.io/unsubscribe/token123" | ✅         | ✅           |

### ❌ Only Post-Application (1/4)

| Variable        | Description            | Example                      | Invitation | Registration |
| --------------- | ---------------------- | ---------------------------- | ---------- | ------------ |
| `[paymentLink]` | Payment URL for vendor | "https://pay.stripe.com/..." | ❌         | ✅           |

### 🎯 Application Links Now in [categoryList]

Individual application links are now included in the **[categoryList]** variable:

```
• Artist Booth - https://voxxy.io/events/event-slug/apply/376
• Food Vendor - https://voxxy.io/events/event-slug/apply/377
```

**Removed Variables** (now redundant):

- ❌ `[invitationLink]` → use `[eventLink]`
- ❌ `[bulletinLink]` → use `[eventLink]`
- ❌ `[dashboardLink]` → use `[eventPortalLink]`
- ❌ `[categoryApplicationLink]` → now in `[categoryList]`
- ❌ `[applicationLink]` → now in `[categoryList]`
- ❌ `[artistApplicationLink]` → now in `[categoryList]`
- ❌ `[vendorApplicationLink]` → now in `[categoryList]`
- ❌ `[eventOptOutLink]` → not needed

---

## 📝 Usage Examples

### Invitation Email (Position 1)

**✅ WORKS - Uses only invitation-available variables:**

```
Subject: [greetingName], you're invited to [eventName]!

Body:
Hi [greetingName],

We're excited to invite you to participate in [eventName]!

Event Details:
📅 Date: [eventDate]
⏰ Time: [eventTime]
📍 Location: [eventLocation]

We have the following categories available:
[categoryList]

Application deadline: [applicationDeadline]

Ready to apply? Choose your category:

[categoryList]

View all event details: [eventLink]

Questions? Contact us at [organizationEmail]

To unsubscribe: [unsubscribeLink]

Best regards,
[organizationName]
```

**❌ DOESN'T WORK - Uses post-application variables:**

```
Subject: Your booth is ready! (WRONG)

Body:
Hi [greetingName],

Your [vendorCategory] booth ([boothNumber]) is confirmed! (THESE WON'T RESOLVE)

Please pay [boothPrice] by [paymentDueDate]. (BOOTH PRICE WON'T RESOLVE)

Payment link: [paymentLink] (THIS WON'T RESOLVE)
```

### Registration Email (Positions 2-17)

**✅ WORKS - All variables available:**

```
Subject: Application Approved - [eventName]

Body:
Hi [greetingName],

Congratulations! Your [vendorCategory] application for [eventName] has been approved.

Application Details:
• Category: [vendorCategory]
• Booth Price: [boothPrice]
• Booth Number: [boothNumber]
• Applied On: [applicationDate]

Setup Information:
• Date: [installDate]
• Time: [installTime]
• Arrive by: [installStartTime]

Next Steps:
1. Pay your booth fee: [categoryPaymentLink]
2. Access vendor portal: [dashboardLink]

Payment due by: [paymentDueDate]

Questions? Email [organizationEmail]

Unsubscribe: [unsubscribeLink]
```

---

## 🎨 Variable Categories (For UI Buttons)

### Event Info (Purple Buttons)

- eventName, eventDate, eventEndDate, dateRange, eventTime
- eventLocation, eventCity, address, eventVenue
- eventDescription, applicationDeadline, paymentDueDate, ageRestriction
- categoryList, boothPrice

### Vendor Info (Pink Buttons)

- greetingName, firstName, lastName, fullName, businessName, contactName
- email, phone, website
- vendorCategory, categoryDescription, boothNumber, applicationDate
- installDate, installTime, installStartTime, installEndTime
- categoryPaymentLink, categoryApplicationLink, applicationCode

### Organization (Blue Buttons)

- organizationName, organizationEmail

### Links (Green Buttons)

- eventLink, invitationLink, bulletinLink
- dashboardLink, eventPortalLink
- unsubscribeLink, applicationLink
- artistApplicationLink, vendorApplicationLink
- paymentLink, eventOptOutLink

---

## 🔍 Variable Resolution

### How Variables Are Resolved

**Backend Process:**

1. **Invitation Email (Position 1):**

   ```ruby
   resolver = InvitationVariableResolver.new(event, vendor_contact)
   subject = resolver.resolve(template)
   ```

2. **Registration Email (Positions 2-17):**
   ```ruby
   resolver = EmailVariableResolver.new(event, registration)
   subject = resolver.resolve(template)
   ```

### What Happens to Unsupported Variables?

If you use a post-application variable in an invitation email:

- ❌ Variable shows **blank** in sent email
- ❌ Backend logs warning about unresolved variable
- ✅ Email still sends (doesn't fail)

**Example:**

```
Template: "Hi [greetingName], your booth is [boothNumber]"
Sent in Invitation: "Hi John's Tacos, your booth is " (blank!)
```

---

## 🚨 Common Mistakes

### ❌ WRONG: Using Category Variables in Invitations

```
Subject: Your [vendorCategory] application (BLANK!)
Booth [boothNumber] is ready! (BLANK!)
Pay [boothPrice] now. (BLANK!)
```

**Why:** Vendor hasn't applied yet, so category/booth data doesn't exist.

### ✅ CORRECT: Use Generic Language in Invitations

```
Subject: You're invited to [eventName]!

Body:
Check out our available categories:
[categoryList]

Apply now: [eventLink]
```

### ❌ WRONG: Forgetting [unsubscribeLink]

**Legal Issue:** CAN-SPAM Act requires unsubscribe link in all emails.

### ✅ CORRECT: Always Include Footer

```
Questions? Email [organizationEmail]

To unsubscribe: [unsubscribeLink]
```

**Note:** The system automatically locks the footer to ensure this is present.

---

## 📚 Resolution Reference

### InvitationVariableResolver (34 variables)

**File:** `/app/services/invitation_variable_resolver.rb`

**Resolves:**

- 14/15 Event variables (all except boothPrice)
- 2/2 Organization variables
- 10/19 Vendor variables (contact info only)
- 9/12 Link variables (public links only)

### EmailVariableResolver (48 variables)

**File:** `/app/services/email_variable_resolver.rb`

**Resolves:**

- All 15 Event variables
- All 2 Organization variables
- All 19 Vendor variables
- All 12 Link variables

---

## 🔗 Related Documentation

- **[EMAIL_SYSTEM_GUIDE.md](./EMAIL_SYSTEM_GUIDE.md)** - Complete system overview
- **[EMAIL_EDITOR_GUIDE.md](./EMAIL_EDITOR_GUIDE.md)** - How to use the email editor
- **[INVITATION_EMAIL_QUICK_REFERENCE.md](../INVITATION_EMAIL_QUICK_REFERENCE.md)** - Quick invitation reference

---

## 📝 Change Log

### March 9, 2026

- **Simplified link variables from 12 → 4**
- **Enhanced [categoryList]** to include direct application links
- Removed 8 redundant link variables
- Updated total variable count: 48 → 42
- Updated invitation variable count: 34 → 30

**Removed Variables:**

- `[invitationLink]`, `[bulletinLink]`, `[dashboardLink]` → use `[eventLink]` or `[eventPortalLink]`
- `[categoryApplicationLink]`, `[applicationLink]`, `[artistApplicationLink]`, `[vendorApplicationLink]` → now in `[categoryList]`
- `[eventOptOutLink]` → not needed

### March 8, 2026

- Complete rewrite with all 48 variables
- Added worksInInvitations column
- Fixed variable format to [bracket]
- Added usage examples
- Added common mistakes section

### January 17, 2026

- Initial variable documentation

---

**Need a new variable?** Contact engineering@voxxypresents.com

**END OF DOCUMENT**
