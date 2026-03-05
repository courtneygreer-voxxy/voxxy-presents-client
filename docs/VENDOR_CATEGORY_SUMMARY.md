# VENDOR CATEGORY ANALYSIS - EXECUTIVE SUMMARY

## Analysis Overview

This comprehensive analysis examines how vendor categories (application types) are implemented in the Voxxy Presents frontend codebase, including:
- Type definitions and data structures
- Category-specific fields and their variations
- Email variable system integration
- Current implementations and limitations
- Recommendations for new variables

Generated: March 4, 2026

---

## Key Findings

### 1. Complete Type Definition Found

**VendorCategory Interface** (`/src/types/eventPortal.ts`)

The main type defining vendor application categories with all category-specific fields:
- `booth_price`: Cost per booth for this category
- `install_date`, `install_start_time`, `install_end_time`: Setup schedule by category
- `payment_link`: Payment URL specific to category
- `application_tags`: Metadata tags for this category type
- `categories`: Which vendor types this application accepts
- `description`: What this application is for

### 2. Storage Model

**Events store categories as arrays:**
```
Event
  ├─ vendor_categories: VendorCategory[]  [multiple categories per event]
  │   ├─ Category 1: "Artist Booth" ($150, setup 8-10am)
  │   ├─ Category 2: "Food Vendor" ($200, setup 2-4pm)
  │   └─ Category 3: "Sponsor" ($500, setup 10am-4pm)
  └─ Other event details
```

**Registrations track which category vendor applied to:**
```
Registration
  ├─ vendor_category: "Artist Booth"  [application name they applied for]
  ├─ booth_price: 150  [inherited from category]
  ├─ install_date: "2026-06-14"  [inherited from category]
  └─ Other registration details
```

### 3. Category-Specific Fields

| Field | Type | Email Variable | Status |
|-------|------|----------------|--------|
| booth_price | $USD | [boothPrice], [categoryPrice] | WORKING |
| install_date | Date | [installDate] | WORKING |
| install_start_time | HH:MM | [installStartTime] | WORKING |
| install_end_time | HH:MM | [installEndTime] | WORKING |
| install_time (range) | Computed | [installTime] | WORKING |
| payment_link | URL | [paymentLink] | WORKING |
| application_tags | string[] | MISSING | Need to add |
| description | string | MISSING | Need to add |

### 4. Email System Integration

**Current implementation:**
- Email preview modal detects category-specific variables
- Shows dropdown to select which category to preview
- Passes `{ category: "Artist Booth" }` to backend
- Backend resolves variables based on category context

**Limitations:**
- Only [installDate], [installTime*], [vendorCategory], [paymentLink] work perfectly
- [boothPrice]/[categoryPrice] not yet fully category-specific (needs backend fix)
- Missing variables for application_tags and description

### 5. Category-Specific Variables Available

**Already implemented (8 variables):**
1. [boothPrice] - Cost of booth
2. [categoryPrice] - Alias for boothPrice
3. [installDate] - Setup date
4. [installStartTime] - Setup start time
5. [installEndTime] - Setup end time
6. [installTime] - Formatted time range (e.g., "8:00 AM - 10:00 AM")
7. [vendorCategory] - Application name (e.g., "Artist Booth")
8. [paymentLink] - Payment checkout URL

**Missing (3 variables) - HIGH PRIORITY:**
1. [categoryDescription] - What this application type is for
2. [applicationTags] - Features/requirements of this category (comma-separated)
3. [tagsList] - Same as above but formatted as bulleted list

---

## Code Locations

### Type Definitions
- **VendorCategory**: `/src/types/eventPortal.ts` (lines 39-52)
- **ApplicationRow**: `/src/components/producer/CreateEventWizard/types.ts` (lines 3-14)
- **EventPortalData**: `/src/types/eventPortal.ts` (lines 4-11)

### Email Variables
- **EMAIL_VARIABLES array**: `/src/utils/emailVariables.ts` (lines 36-308)
- **26 total variables, 8 category-specific**

### Components Using Categories
- **EventEmailPreviewModal**: `/src/components/shared/EventEmailPreviewModal.tsx`
- **CreateApplicationForm**: `/src/components/producer/CreateApplicationForm.tsx`
- **Step2ApplicationDetails**: `/src/components/producer/CreateEventWizard/steps/Step2ApplicationDetails.tsx`
- **VendorEventPortalPage**: `/src/pages/VendorEventPortalPage.tsx`
- **InvitationViewPage**: `/src/pages/InvitationViewPage.tsx`

### API Endpoints
- **Vendor Applications**: `/src/services/api.ts` (lines 915-1007)
- **Email Preview**: `/src/services/api.ts` - POST `/v1/presents/events/{slug}/scheduled_emails/{id}/preview`

---

## Email Preview Flow

```
User creates email with [installDate]
  ↓
Email Preview Modal detects [category*] variables
  ↓
Shows dropdown: "Select Category" (Artist, Food, Sponsor)
  ↓
User selects "Food Vendor"
  ↓
Frontend sends: POST preview with { category: "Food Vendor" }
  ↓
Backend:
  1. Finds registration for preview
  2. Looks up Food Vendor category details
  3. Resolves:
     - install_date: "2026-06-14" (from Food Vendor category)
     - booth_price: 200 (from Food Vendor category)
     - payment_link: "https://pay.stripe.com/food"
  ↓
Email preview shows vendor-specific values
```

---

## Current Gaps & Issues

### 1. Missing Email Variables
- [categoryDescription] - not yet implemented
- [applicationTags] - not yet implemented
- [tagsList] - not yet implemented

**Impact:** Emails cannot mention special features of specific booth types

### 2. [boothPrice]/[categoryPrice] Not Fully Category-Specific
- Currently both resolve to event-level price
- Should resolve to category-specific price
- Requires backend EmailVariableResolver fix

**Impact:** Multi-category events cannot have different prices per category in emails

### 3. No Category-Level Metadata
- `categories` field (vendor types accepted) not used
- Could support: "This application accepts: Artists, Musicians, Craftspeople"

**Impact:** Can't customize emails based on which vendor types are accepted

---

## Recommendations

### HIGH PRIORITY - Add Missing Variables

1. **[categoryDescription]** - Required for context in emails
   - Example: "Local restaurants and food service vendors"
   - Backend: Look up VendorApplication.description

2. **[applicationTags]** - List special features
   - Example: "outdoor_setup, parking_included, utilities_provided"
   - Backend: Join application_tags array with ", "

3. **[tagsList]** - Bulleted format
   - Example: "• Outdoor Setup\n• Parking Included\n• Utilities Provided"
   - Backend: Format tags as bullet list

### MEDIUM PRIORITY - Fix Category Price Resolution

- Update backend EmailVariableResolver
- [categoryPrice] should resolve to registration.vendor_category's booth_price
- Currently just alias for [boothPrice]

### LOW PRIORITY - Future Enhancements

1. [categoryName] - Explicit variable for application name (might be redundant with [vendorCategory])
2. [boothSize] - If booth dimensions are added to VendorApplication
3. [installAddress] - If install location varies by category
4. [categoryDeadline] - If application deadline varies by category

---

## Implementation Checklist

### Frontend
- [ ] Add [categoryDescription] to EMAIL_VARIABLES
- [ ] Add [applicationTags] to EMAIL_VARIABLES
- [ ] Add [tagsList] to EMAIL_VARIABLES
- [ ] Test category preview with new variables
- [ ] Update UI help text

### Backend
- [ ] Update EmailVariableResolver for new variables
- [ ] Fix [categoryPrice] to be truly category-specific
- [ ] Test registration-based resolution
- [ ] Add unit tests for category-specific variables

### Testing
- [ ] Single-category events work correctly
- [ ] Multi-category events show correct values per category
- [ ] Category dropdown appears/disappears appropriately
- [ ] Email preview updates when category changes
- [ ] Backwards compatibility with existing [boothPrice]

---

## Documentation Files

Created comprehensive documentation:

1. **VENDOR_CATEGORY_ANALYSIS.md** (620 lines)
   - Complete type definitions
   - All category-specific fields explained
   - Data structure diagrams
   - Email variables detailed
   - Implementation recommendations
   - Summary table of all fields

2. **VENDOR_CATEGORY_QUICK_REFERENCE.md** (104 lines)
   - Quick lookup for types and fields
   - Status of each variable
   - How to add new variables
   - Key file locations

3. **VENDOR_CATEGORY_CODE_LOCATIONS.md** (384 lines)
   - Exact file locations with line numbers
   - API endpoint documentation
   - Component implementations
   - Data flow diagram
   - Grep commands for searching

4. **VENDOR_CATEGORY_SUMMARY.md** (this file)
   - Executive summary
   - Key findings
   - Recommendations
   - Implementation checklist

---

## How to Use This Analysis

1. **Quick lookup**: Start with VENDOR_CATEGORY_QUICK_REFERENCE.md
2. **Detailed understanding**: Read VENDOR_CATEGORY_ANALYSIS.md
3. **Implementation**: Use VENDOR_CATEGORY_CODE_LOCATIONS.md for exact file locations
4. **Planning**: Reference VENDOR_CATEGORY_SUMMARY.md for roadmap

---

## Questions This Analysis Answers

- Where is VendorCategory type defined? → `/src/types/eventPortal.ts` line 39
- What category-specific fields exist? → See summary table above
- How are categories stored on events? → Array: `EventPortalData.vendor_categories: VendorCategory[]`
- How does email preview handle categories? → Detects `[category*]` variables, shows dropdown, passes context
- Which email variables are category-specific? → 8 working + 3 missing
- What variables are missing? → [categoryDescription], [applicationTags], [tagsList]
- How do I add a new email variable? → Add to EMAIL_VARIABLES array, update backend resolver, test
- Where do vendors submit applications? → `/src/pages/VendorApplicationForm.tsx`
- How are categories shown to vendors? → `/src/pages/VendorEventPortalPage.tsx` shows all categories with details

---

## Related Documentation

- `/docs/EMAIL_SYSTEM_QUICK_REFERENCE.md` - General email system overview
- `/docs/SCHEDULED_EMAILS_SYSTEM.md` - Email scheduling and delivery
- `/CLAUDE_CONTEXT.md` - Complete platform context

---

Generated: March 4, 2026
Version: 1.0
Status: Complete Analysis

