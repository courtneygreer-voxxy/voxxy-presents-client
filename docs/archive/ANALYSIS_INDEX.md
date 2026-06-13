# Backend Data Structures Analysis - Document Index

This folder contains a comprehensive analysis of the backend data structures and email variable resolution system for the Voxxy Presents vendor management platform.

## Documents

### 1. BACKEND_DATA_STRUCTURES_ANALYSIS.md

**Comprehensive technical analysis** of all data structures involved in email variable resolution.

**Contains:**

- Complete VendorContact model field definitions
- Complete Registration model field definitions
- EventInvitation model structure
- EmailVariableResolver implementation (for registrations)
- InvitationVariableResolver implementation (for vendor contacts)
- Frontend email variable definitions
- Key findings about name field storage
- Variable resolution logic
- Serializer outputs
- Recommendations for implementation

**When to use:** For deep understanding of how the system works end-to-end

---

### 2. BACKEND_FIELDS_QUICK_REFERENCE.md

**Quick lookup table** of all available fields and how to use them.

**Contains:**

- VendorContact fields table
- Registration fields table
- Email variables supported (organized by context)
- Key implementation details
- Resolver file locations
- Serializer details
- Summary statistics

**When to use:** For quick reference while coding or creating email templates

---

### 3. BACKEND_CODE_SNIPPETS.md

**Actual code examples** from the codebase showing implementation details.

**Contains:**

- Database schema (migrations)
- EmailVariableResolver code (resolve_registration_variables method)
- InvitationVariableResolver code (resolve_vendor_contact_variables method)
- VendorContact serializer code
- Registration serializer code
- Frontend email variable definitions (TypeScript)
- Summary comparison table

**When to use:** When you need to see the actual code being used

---

## Key Facts At A Glance

| Aspect                  | Details                                               |
| ----------------------- | ----------------------------------------------------- |
| Name Fields             | Single `name` field (no first_name/last_name columns) |
| Business Field          | Single `business_name` field                          |
| First/Last Parsing      | Runtime via `name.split(" ", 2)`                      |
| Greeting Logic          | business_name > first_name > "there"                  |
| Variable Format         | `[bracket]` (not {{mustache}})                        |
| VendorContact Variables | All documented variables work                         |
| Registration Variables  | All documented variables work                         |
| Serializer Mapping      | VendorContact: name → contact_name                    |

---

## Email Variables Reference

### Available for Both VendorContact and Registration:

- `[firstName]` - First word of name
- `[lastName]` - Last word(s) of name
- `[fullName]` - Complete name
- `[businessName]` - Business/company name
- `[greetingName]` - Smart greeting (business > first > "there")
- `[contactName]` - Same as fullName
- `[email]` - Email address
- `[phone]` - Phone number
- `[website]` - Website URL

### Registration-Only Variables:

- `[vendorCategory]` - Only available after registration
- `[boothNumber]` - Only available after booth assignment
- `[applicationDate]` - Date vendor applied

---

## File Locations

### Database Models

- **VendorContact:** `/Users/beaulazear/Desktop/voxxy-rails/app/models/vendor_contact.rb`
- **Registration:** `/Users/beaulazear/Desktop/voxxy-rails/app/models/registration.rb`
- **EventInvitation:** `/Users/beaulazear/Desktop/voxxy-rails/app/models/event_invitation.rb`

### Email Variable Resolvers

- **EmailVariableResolver:** `/Users/beaulazear/Desktop/voxxy-rails/app/services/email_variable_resolver.rb`
- **InvitationVariableResolver:** `/Users/beaulazear/Desktop/voxxy-rails/app/services/invitation_variable_resolver.rb`

### Serializers

- **VendorContact:** `/Users/beaulazear/Desktop/voxxy-rails/app/serializers/api/v1/presents/vendor_contact_serializer.rb`
- **Registration:** `/Users/beaulazear/Desktop/voxxy-rails/app/serializers/api/v1/presents/registration_serializer.rb`

### Frontend

- **Email Variables:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/utils/emailVariables.ts`
- **Email Types:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/types/email.ts`

### Database Migrations

- **VendorContact Creation:** `/Users/beaulazear/Desktop/voxxy-rails/db/migrate/20251217120000_create_vendor_contacts.rb`
- **Registration Creation:** `/Users/beaulazear/Desktop/voxxy-rails/db/migrate/20251104140632_create_registrations.rb`
- **Registration Vendor Fields:** `/Users/beaulazear/Desktop/voxxy-rails/db/migrate/20251115162751_add_vendor_fields_to_registrations.rb`
- **VendorContact Social Fields:** `/Users/beaulazear/Desktop/voxxy-rails/db/migrate/20260106053015_add_social_and_location_to_vendor_contacts.rb`

---

## Summary

The backend uses a straightforward approach to name handling:

1. **Two name fields per model:** `name` (full name) and `business_name`
2. **No separate first/last columns:** Names are stored as complete strings
3. **Runtime parsing:** First/last names are computed by splitting on the first space
4. **Smart greeting:** Prefers business name, falls back to first name, then "there"
5. **All documented variables work:** The email variable system correctly handles all defined variables

There are **no mismatches** between the documented email variables and what the backend actually supports.

---

## Analysis Methodology

This analysis was conducted by:

1. Reviewing actual database migrations for both VendorContact and Registration models
2. Examining the EmailVariableResolver and InvitationVariableResolver code
3. Checking the serializer outputs to see how data is transformed
4. Reviewing the frontend email variable definitions
5. Cross-referencing between backend implementations and frontend documentation

All findings are based on actual code, not assumptions or inferred behavior.
