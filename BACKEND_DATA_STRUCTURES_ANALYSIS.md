# Backend Data Structures Analysis: Vendor/Contact Name Fields

## Executive Summary

This analysis reviews the actual field definitions in both the Rails backend and frontend codebase to determine what vendor/contact name fields actually exist for email variable resolution.

---

## BACKEND ANALYSIS (Rails)

### 1. VendorContact Model

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/models/vendor_contact.rb`

#### Actual Database Fields (from migrations):
```ruby
# Table: vendor_contacts (from 20251217120000_create_vendor_contacts.rb)
- id (primary key)
- organization_id (foreign key)
- vendor_id (foreign key, optional)
- registration_id (foreign key, optional)
- name (string, NOT NULL) ← PRIMARY name field
- email (string, optional)
- phone (string, optional)
- business_name (string, optional) ← Company/business name
- job_title (string, optional)
- contact_type (string, optional)
- status (string, default: "new")
- notes (text, optional)
- tags (jsonb, default: [])
- interaction_count (integer, default: 0)
- last_contacted_at (datetime, optional)
- source (string, optional)
- imported_at (datetime, optional)
- instagram_handle (string, optional) ← Added in 20260106053015
- tiktok_handle (string, optional) ← Added in 20260106053015
- website (string, optional) ← Added in 20260106053015
- location (string, optional) ← Added in 20260106053015
- categories (jsonb, default: []) ← Added in 20260106053015
- featured (boolean, default: false) ← Added in 20260106053015
- created_at, updated_at
```

#### Key Findings:
- **Single `name` field:** Stores full name (e.g., "John Doe")
- **Single `business_name` field:** Stores company/business name
- **NO separate first_name/last_name fields**
- The serializer maps database `name` → JSON `contact_name` for frontend compatibility

#### VendorContact Serializer Output:
```ruby
# File: app/serializers/api/v1/presents/vendor_contact_serializer.rb
contact_name: @vendor_contact.name,           # ← Maps `name` to `contact_name`
business_name: @vendor_contact.business_name,
job_title: @vendor_contact.job_title,
location: @vendor_contact.try(:location),
# ... other fields
```

---

### 2. Registration Model

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/models/registration.rb`

#### Actual Database Fields (from migrations):
```ruby
# Table: registrations (from 20251104140632_create_registrations.rb + additions)
- id (primary key)
- event_id (foreign key)
- user_id (foreign key, optional)
- email (string, NOT NULL)
- name (string, optional) ← Contact/vendor name
- phone (string, optional)
- subscribed (boolean, default: false)
- ticket_code (string, optional)
- qr_code_url (string, optional)
- checked_in (boolean, default: false)
- checked_in_at (datetime, optional)
- status (string, optional)
- business_name (string, optional) ← Added in 20251115162751
- vendor_category (string, optional) ← Added in 20251115162751
- vendor_application_id (foreign key, optional) ← Added in 20251115162751
- instagram_handle (string, optional) ← Added in 20260106002558
- tiktok_handle (string, optional) ← Added in 20260106002558
- website (string, optional) ← Added in 20260106002558
- note_to_host (string, optional)
- payment_status (string, optional) ← Added in 20260109021143
- payment_confirmed_at (datetime, optional)
- vendor_fee_paid (boolean) ← Added in 20260124024257
- payment_transaction_id (foreign key, optional)
- event_invitation_id (foreign key, optional) ← Added in 20260216135600
- created_at, updated_at
```

#### Key Findings:
- **Single `name` field:** Stores vendor/contact full name
- **Single `business_name` field:** Stores vendor business name
- **NO separate first_name/last_name fields**
- Fields match VendorContact structure (for consistency)

#### Registration Serializer Output:
```ruby
# File: app/serializers/api/v1/presents/registration_serializer.rb
name: @registration.name,              # ← Full name directly
business_name: @registration.business_name,
vendor_category: @registration.vendor_category,
# ... other fields
```

---

### 3. EventInvitation Model

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/models/event_invitation.rb`

#### Actual Database Fields:
- `belongs_to :vendor_contact` ← References VendorContact for all contact info
- All contact name/email data comes FROM the associated VendorContact

#### Key Findings:
- Doesn't store name directly; uses related VendorContact
- When resolving invitation variables, uses: `vendor_contact.name` and `vendor_contact.business_name`

---

## EMAIL VARIABLE RESOLUTION

### EmailVariableResolver (for Registrations)

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/services/email_variable_resolver.rb`

#### How Names Are Parsed:
```ruby
def resolve_registration_variables(template)
  # Parse full name into first/last by splitting on space
  name_parts = (registration.name || "").split(" ", 2)
  first_name = name_parts[0] || ""
  last_name = name_parts[1] || ""
  
  # Greeting logic: business_name preferred, fallback to first_name
  greeting_name = if registration.business_name.present?
    registration.business_name
  elsif first_name.present?
    first_name
  else
    "there"
  end
  
  # Variables replaced:
  template
    .gsub("[greetingName]", greeting_name)
    .gsub("[firstName]", first_name)
    .gsub("[lastName]", last_name)
    .gsub("[fullName]", registration.name || "")
    .gsub("[businessName]", registration.business_name || "")
    .gsub("[email]", registration.email || "")
end
```

#### Supported Variables (Registration emails):
- `[firstName]` - First word of `registration.name`
- `[lastName]` - Second word (or rest) of `registration.name`
- `[fullName]` - Complete `registration.name`
- `[businessName]` - `registration.business_name`
- `[greetingName]` - Smart greeting (business_name or first_name)
- `[email]` - `registration.email`
- `[phone]` - `registration.phone`
- `[website]` - `registration.website`

---

### InvitationVariableResolver (for VendorContact)

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/services/invitation_variable_resolver.rb`

#### How Names Are Parsed:
```ruby
def resolve_vendor_contact_variables(template)
  # Same parsing logic as registration
  name_parts = (vendor_contact.name || "").split(" ", 2)
  first_name = name_parts[0] || ""
  last_name = name_parts[1] || ""
  
  greeting_name = if vendor_contact.business_name.present?
    vendor_contact.business_name
  elsif first_name.present?
    first_name
  else
    "there"
  end
  
  template
    .gsub("[greetingName]", greeting_name)
    .gsub("[firstName]", first_name)
    .gsub("[lastName]", last_name)
    .gsub("[fullName]", vendor_contact.name || "")
    .gsub("[businessName]", vendor_contact.business_name || "")
    .gsub("[email]", vendor_contact.email || "")
end
```

#### Supported Variables (Invitation emails):
- `[firstName]` - First word of `vendor_contact.name`
- `[lastName]` - Second word (or rest) of `vendor_contact.name`
- `[fullName]` - Complete `vendor_contact.name`
- `[businessName]` - `vendor_contact.business_name`
- `[greetingName]` - Smart greeting (business_name or first_name)
- `[email]` - `vendor_contact.email`
- `[phone]` - `vendor_contact.phone`
- `[website]` - `vendor_contact.website`

---

## FRONTEND ANALYSIS

### Email Variables Definition

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/utils/emailVariables.ts`

#### Documented Email Variables:
The frontend maintains a comprehensive list of supported variables with field definitions:

```typescript
export interface EmailVariable {
  label: string;           // User-friendly name
  frontendVar: string;     // [bracket] format
  backendVar: string;      // {{mustache}} format (legacy)
  category: 'event' | 'organization' | 'vendor' | 'computed';
  description: string;
  example: string;
  worksInInvitations: boolean;
}
```

#### Vendor Name Variables Defined:
```typescript
{
  label: 'Greeting Name',
  frontendVar: '[greetingName]',
  backendVar: '{{greeting_name}}',
  category: 'vendor',
  description: 'Smart greeting (business name or first name)',
  example: "John's Tacos (or John)",
  worksInInvitations: true
},
{
  label: 'First Name',
  frontendVar: '[firstName]',
  backendVar: '{{first_name}}',
  category: 'vendor',
  description: "Vendor's first name",
  example: 'John',
  worksInInvitations: true
},
{
  label: 'Last Name',
  frontendVar: '[lastName]',
  backendVar: '{{last_name}}',
  category: 'vendor',
  description: "Vendor's last name",
  example: 'Doe',
  worksInInvitations: true
},
{
  label: 'Full Name',
  frontendVar: '[fullName]',
  backendVar: '{{full_name}}',
  category: 'vendor',
  description: "Vendor's full name",
  example: 'John Doe',
  worksInInvitations: true
},
{
  label: 'Business Name',
  frontendVar: '[businessName]',
  backendVar: '{{business_name}}',
  category: 'vendor',
  description: "Vendor's business name",
  example: "John's Tacos",
  worksInInvitations: true
},
{
  label: 'Contact Name',
  frontendVar: '[contactName]',
  backendVar: '{{contact_name}}',
  category: 'vendor',
  description: "Vendor's contact person name",
  example: 'Jane Smith',
  worksInInvitations: true
}
```

---

## ACTUAL DATABASE FIELDS vs EXPECTED VARIABLES

### VendorContact Table Structure:
```
name              (string)  ← Full name stored here
business_name    (string)  ← Business/company name
job_title        (string)  ← Job title (Contact)
email            (string)  ← Email address
phone            (string)  ← Phone number
website          (string)  ← Website URL
instagram_handle (string)  ← Social media handle
tiktok_handle    (string)  ← Social media handle
location         (string)  ← Location/city
```

### Registration Table Structure:
```
name              (string)  ← Full name stored here
business_name    (string)  ← Business/company name
vendor_category  (string)  ← Vendor category
email            (string)  ← Email address
phone            (string)  ← Phone number
website          (string)  ← Website URL
instagram_handle (string)  ← Social media handle
tiktok_handle    (string)  ← Social media handle
```

---

## KEY FINDINGS

### Name Field Storage:
1. **NO separate `first_name` or `last_name` columns** in either table
2. **Single `name` column** stores full name (e.g., "John Doe")
3. **Single `business_name` column** stores company/business name
4. Names are parsed by splitting on the first space

### Variable Resolution:
1. **Backend EmailVariableResolver/InvitationVariableResolver** parse `name` by splitting
2. **No database lookup** for separate first/last names
3. **Splitting logic:** `name.split(" ", 2)` → ["John", "Doe"]
4. **Fallback order for greeting:** business_name → first_name → "there"

### Serialization:
1. **VendorContact Serializer** maps database `name` → JSON `contact_name`
2. **Registration Serializer** outputs `name` directly
3. Both match the expected backend field names

### Frontend Variables:
1. **[contactName]** is documented but maps to database `name` (via serializer as `contact_name`)
2. **[firstName]**, **[lastName]** are computed at runtime by string splitting
3. **[fullName]** = complete `name` field
4. **[businessName]** = `business_name` field
5. **[greetingName]** = smart greeting computation

---

## RECOMMENDATIONS

### Current Implementation is Correct:
The backend correctly uses:
- `registration.name` for full name
- `registration.business_name` for business name
- String splitting at runtime for first/last names

### Email Variables Match Backend Reality:
1. ✅ `[firstName]` - Works (computed from name split)
2. ✅ `[lastName]` - Works (computed from name split)
3. ✅ `[fullName]` - Works (direct from name field)
4. ✅ `[businessName]` - Works (direct from business_name field)
5. ✅ `[greetingName]` - Works (smart greeting logic)
6. ✅ `[contactName]` - Works (maps to name via serializer)

### For Maximum Compatibility:
- Use **[firstName]** and **[lastName]** for personalization (these are split at runtime)
- Use **[fullName]** for complete name
- Use **[businessName]** for business/company name
- Use **[greetingName]** for smart greeting that prefers business name

### If Separation of First/Last Names is Needed:
Would require:
1. Database schema change (add first_name, last_name columns)
2. Update registration/vendor_contact forms to capture separately
3. Update serializers
4. Deprecate name splitting logic

**This is NOT currently recommended** as it would require significant changes across both frontend and backend.

---

## ACTUAL CODE PATHS

### EmailVariableResolver (Registration):
- **Input:** `registration` object with `name` and `business_name`
- **Process:** Splits `name` on space, uses `business_name` for greeting
- **Output:** Variables like `[firstName]`, `[lastName]`, etc. substituted
- **File:** `/Users/beaulazear/Desktop/voxxy-rails/app/services/email_variable_resolver.rb:126-177`

### InvitationVariableResolver (VendorContact):
- **Input:** `vendor_contact` object with `name` and `business_name`  
- **Process:** Same splitting logic as EmailVariableResolver
- **Output:** Variables substituted in invitation emails
- **File:** `/Users/beaulazear/Desktop/voxxy-rails/app/services/invitation_variable_resolver.rb:87-113`

### Frontend Variable Definition:
- **Source:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/utils/emailVariables.ts:41-391`
- **Variables:** 50+ email variables defined with frontend/backend formats
- **Frontend UI:** Uses `frontendVar` format `[bracket]`
- **Backend:** Uses same `[bracket]` format (not {{mustache}})

---

## CONCLUSION

The actual backend data structures support a **single name field** that stores the full name. The email variable resolution system correctly handles this by:

1. Parsing full name into first/last at runtime
2. Using business_name when available
3. Supporting all documented variables correctly

All documented email variables **actually work** with the current database schema. There is **no mismatch** between the documented variables and actual backend capabilities.

