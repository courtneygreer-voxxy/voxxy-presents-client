# Backend Fields Quick Reference

## VendorContact Fields (Email Invitations)

| Database Field  | Type   | Example                  | Usage                              |
| --------------- | ------ | ------------------------ | ---------------------------------- |
| `name`          | string | "John Doe"               | Full name (stored as single field) |
| `business_name` | string | "John's Tacos"           | Business/company name              |
| `email`         | string | "john@example.com"       | Email address                      |
| `phone`         | string | "(555) 123-4567"         | Phone number                       |
| `website`       | string | "https://johnstacos.com" | Website URL                        |
| `job_title`     | string | "Owner"                  | Job title                          |
| `location`      | string | "Atlanta, GA"            | Location/city                      |

**Serialized as:**

- `contact_name` (from `name`)
- `business_name`
- `email`, `phone`, `website`, `job_title`, `location`

---

## Registration Fields (Post-Application Emails)

| Database Field    | Type   | Example                  | Usage                              |
| ----------------- | ------ | ------------------------ | ---------------------------------- |
| `name`            | string | "John Doe"               | Full name (stored as single field) |
| `business_name`   | string | "John's Tacos"           | Business/company name              |
| `email`           | string | "john@example.com"       | Email address                      |
| `phone`           | string | "(555) 123-4567"         | Phone number                       |
| `website`         | string | "https://johnstacos.com" | Website URL                        |
| `vendor_category` | string | "Food"                   | Vendor category                    |

---

## Email Variables Supported

### For VendorContact (Invitation Emails)

```
[firstName]         → First word of name (parsed at runtime)
[lastName]          → Last word(s) of name (parsed at runtime)
[fullName]          → Complete name field
[businessName]      → Business/company name
[greetingName]      → Smart greeting (business_name or first_name)
[contactName]       → Same as fullName (legacy)
[email]             → Email address
[phone]             → Phone number
[website]           → Website URL
```

### For Registration (Post-Application Emails)

```
[firstName]         → First word of name (parsed at runtime)
[lastName]          → Last word(s) of name (parsed at runtime)
[fullName]          → Complete name field
[businessName]      → Business/company name
[greetingName]      → Smart greeting (business_name or first_name)
[email]             → Email address
[phone]             → Phone number
[website]           → Website URL
[vendorCategory]    → Vendor category (only after registration)
```

---

## Key Implementation Details

1. **NO Database Separation:** First/last names are NOT separate database columns
2. **Runtime Parsing:** Names are split at runtime using: `name.split(" ", 2)`
3. **Splitting Logic:**
   - "John Doe" → firstName="John", lastName="Doe"
   - "John" → firstName="John", lastName=""
   - "John Q Public" → firstName="John", lastName="Q Public"

4. **Greeting Logic:**
   ```
   if business_name.present?
     use business_name
   elsif first_name.present?
     use first_name
   else
     use "there"
   ```

---

## Variable Resolver Location

- **EmailVariableResolver:** `/Users/beaulazear/Desktop/voxxy-rails/app/services/email_variable_resolver.rb`
  - Used for registration/applicant emails
  - Handles post-application emails

- **InvitationVariableResolver:** `/Users/beaulazear/Desktop/voxxy-rails/app/services/invitation_variable_resolver.rb`
  - Used for invitation emails
  - Handles pre-application invitations to vendor_contacts

---

## Frontend Variable Definition

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/utils/emailVariables.ts`

All 50+ email variables are defined here with:

- Frontend format: `[bracketFormat]`
- Backend format: `{{mustacheFormat}}` (legacy, converted to bracket)
- Descriptions and examples
- `worksInInvitations` flag

---

## Serializers

### VendorContact Serializer

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/serializers/api/v1/presents/vendor_contact_serializer.rb`

Maps database fields → JSON:

```ruby
contact_name: vendor_contact.name         # Maps name → contact_name
business_name: vendor_contact.business_name
email: vendor_contact.email
phone: vendor_contact.phone
website: vendor_contact.website
location: vendor_contact.location
# ... plus status, tags, categories, featured, etc.
```

### Registration Serializer

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/serializers/api/v1/presents/registration_serializer.rb`

Maps database fields → JSON:

```ruby
name: registration.name                    # Full name directly
business_name: registration.business_name
email: registration.email
phone: registration.phone
website: registration.website
vendor_category: registration.vendor_category
# ... plus status, payment_status, created_at, etc.
```

---

## Summary

- **Total Name Fields:** 2 (name + business_name)
- **First/Last Name Separation:** Runtime (not database)
- **Email Variables:** All documented variables work correctly
- **Consistency:** VendorContact and Registration use same field names (except vendor_category)
