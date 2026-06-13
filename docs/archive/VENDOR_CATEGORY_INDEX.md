# VENDOR CATEGORY DOCUMENTATION INDEX

Complete analysis of vendor categories (application types) in the Voxxy Presents frontend codebase.

Generated: March 4, 2026
Total Documentation: 1,400+ lines across 5 files

---

## Documentation Files

### 1. VENDOR_CATEGORY_QUICK_REFERENCE.md

**Best for: Quick lookups and status checks**

- VendorCategory type definition
- Category-specific fields summary table
- Email variables status (WORKS vs MISSING)
- How to add new email variables
- Key file locations at a glance

**Use when:** You need a quick answer or reminder

---

### 2. VENDOR_CATEGORY_ANALYSIS.md

**Best for: Complete understanding and planning**

- Full VendorCategory type definition with all details
- Complete ApplicationRow interface
- All category-specific fields explained (8 fields)
- Email preview/resolver handling
- Data structure examples and diagrams
- Detailed breakdown of 8 working + 3 missing email variables
- Implementation recommendations
- Comprehensive summary table of all fields

**Use when:** You need deep understanding or planning implementation

---

### 3. VENDOR_CATEGORY_CODE_LOCATIONS.md

**Best for: Finding and implementing code changes**

- Complete file structure overview
- Type definitions with line numbers
- Email variables with line numbers
- API endpoints with request/response signatures
- Component implementations with key line references
- Test data examples
- Data flow diagram
- Grep search commands
- Absolute file paths for all relevant files

**Use when:** You're implementing changes and need exact file locations

---

### 4. VENDOR_CATEGORY_SUMMARY.md

**Best for: Reviewing findings and planning work**

- Executive summary of the entire analysis
- Key findings section
- Storage model diagrams
- Category-specific fields summary
- Email preview flow diagram
- Current gaps and issues
- Implementation checklist (copy-paste ready)
- How to use the documentation
- FAQ section

**Use when:** You're planning work or reporting to others

---

### 5. VENDOR_CATEGORY_INDEX.md

**This file** - Navigation guide for the entire documentation set

---

## Quick Navigation

### I need to...

**...understand what VendorCategory is**

- Read: VENDOR_CATEGORY_SUMMARY.md (Key Findings section)
- Then: VENDOR_CATEGORY_ANALYSIS.md (sections 1-2)

**...find where something is defined**

- Read: VENDOR_CATEGORY_CODE_LOCATIONS.md (Type Definitions section)
- Then: Use absolute paths provided

**...add a new email variable**

1. VENDOR_CATEGORY_QUICK_REFERENCE.md (How to Add New Email Variable section)
2. VENDOR_CATEGORY_CODE_LOCATIONS.md (EMAIL VARIABLES DEFINITIONS section)
3. Find `/src/utils/emailVariables.ts` (line 36-308)
4. Add to EMAIL_VARIABLES array
5. Update backend EmailVariableResolver

**...understand the email preview system**

- Read: VENDOR_CATEGORY_SUMMARY.md (Email Preview Flow section)
- Then: VENDOR_CATEGORY_ANALYSIS.md (section 4)
- Then: VENDOR_CATEGORY_CODE_LOCATIONS.md (Component Implementations section)

**...implement category-specific email variables**

1. VENDOR_CATEGORY_SUMMARY.md (Recommendations section)
2. VENDOR_CATEGORY_ANALYSIS.md (section 8 - Recommendations)
3. VENDOR_CATEGORY_CODE_LOCATIONS.md (Component Implementations section)
4. VENDOR_CATEGORY_SUMMARY.md (Implementation Checklist)

**...see all category-specific fields and their status**

- VENDOR_CATEGORY_QUICK_REFERENCE.md (Category-Specific Fields Summary table)

**...understand the data flow**

- VENDOR_CATEGORY_CODE_LOCATIONS.md (Data Flow Diagram section)

---

## Key Information at a Glance

### VendorCategory Type Location

- File: `/src/types/eventPortal.ts`
- Lines: 39-52
- Also see: `EventPortalData` at lines 4-11

### Email Variables Location

- File: `/src/utils/emailVariables.ts`
- Lines: 36-308
- 26 total variables, 8 category-specific, 3 missing

### Category-Specific Fields

| Field                | Type     | Variable           | Status        |
| -------------------- | -------- | ------------------ | ------------- |
| booth_price          | $USD     | [boothPrice]       | WORKS         |
| install_date         | Date     | [installDate]      | WORKS         |
| install_start_time   | HH:MM    | [installStartTime] | WORKS         |
| install_end_time     | HH:MM    | [installEndTime]   | WORKS         |
| install_time (range) | Computed | [installTime]      | WORKS         |
| payment_link         | URL      | [paymentLink]      | WORKS         |
| application_tags     | string[] | MISSING            | HIGH PRIORITY |
| description          | string   | MISSING            | HIGH PRIORITY |

### Key Components

- Email Preview: `/src/components/shared/EventEmailPreviewModal.tsx`
- Application Form: `/src/components/producer/CreateApplicationForm.tsx`
- Event Wizard Step 2: `/src/components/producer/CreateEventWizard/steps/Step2ApplicationDetails.tsx`
- Vendor Portal: `/src/pages/VendorEventPortalPage.tsx`

### API Endpoints

- Create Application: POST `/v1/presents/events/{eventSlug}/vendor_applications`
- Update Application: PATCH `/v1/presents/vendor_applications/{id}`
- Email Preview: POST `/v1/presents/events/{eventSlug}/scheduled_emails/{id}/preview`

---

## Most Important Findings

### 1. Events Store Categories as Arrays

```
event.vendor_categories: [
  { name: "Artist Booth", booth_price: 150, install_date: "2026-06-14", ... },
  { name: "Food Vendor", booth_price: 200, install_date: "2026-06-14", ... }
]
```

### 2. Registrations Track Which Category Applied

```
registration.vendor_category: "Artist Booth"  // Application name
// Inherits booth_price, install dates, etc. from that category
```

### 3. Email Preview Supports Categories

```
Email Preview Modal:
  1. Detects [category*] variables
  2. Shows dropdown to select category
  3. Passes { category: "Artist Booth" } to backend
  4. Backend resolves category-specific values
```

### 4. 8 Category-Specific Variables Already Work

`[installDate]`, `[installTime*]`, `[vendorCategory]`, `[paymentLink]`, `[boothPrice]`

### 5. 3 High-Priority Missing Variables

`[categoryDescription]`, `[applicationTags]`, `[tagsList]`

---

## Implementation Roadmap

### Phase 1: Frontend (Add Missing Variables)

- [ ] Add [categoryDescription] to EMAIL_VARIABLES
- [ ] Add [applicationTags] to EMAIL_VARIABLES
- [ ] Add [tagsList] to EMAIL_VARIABLES
- Estimated: 2-3 hours

### Phase 2: Backend (Variable Resolution)

- [ ] Update EmailVariableResolver for new variables
- [ ] Fix [categoryPrice] to use registration's category price
- [ ] Add unit tests
- Estimated: 4-6 hours

### Phase 3: Testing & QA

- [ ] Test single-category events
- [ ] Test multi-category events
- [ ] Test category dropdown behavior
- [ ] Test backwards compatibility
- Estimated: 2-3 hours

**Total Estimated Effort: 8-12 hours**

---

## Questions This Documentation Answers

1. Where is VendorCategory type defined?
2. What category-specific fields exist?
3. How are categories stored on events?
4. How are categories stored on registrations?
5. What email variables are category-specific?
6. Which variables are currently missing?
7. How does email preview handle categories?
8. How do I add a new email variable?
9. Where can I find the email preview code?
10. What's the data flow for category-specific emails?
11. Which components use vendor categories?
12. What API endpoints handle vendor applications?
13. What are the current gaps in the system?
14. What's the recommended implementation priority?
15. How are categories shown to vendors?

---

## Related Documentation

- `/CLAUDE_CONTEXT.md` - Complete platform context
- `/docs/EMAIL_SYSTEM_QUICK_REFERENCE.md` - General email system
- `/docs/SCHEDULED_EMAILS_SYSTEM.md` - Email scheduling and delivery
- `/docs/UNSUBSCRIBE_SYSTEM.md` - Email unsubscribe system

---

## File Summary

| File                               | Lines     | Purpose           | Best For                      |
| ---------------------------------- | --------- | ----------------- | ----------------------------- |
| VENDOR_CATEGORY_QUICK_REFERENCE.md | 104       | Quick lookup      | Status checks, reminders      |
| VENDOR_CATEGORY_ANALYSIS.md        | 620       | Deep analysis     | Planning, understanding       |
| VENDOR_CATEGORY_CODE_LOCATIONS.md  | 384       | Code reference    | Implementation, finding files |
| VENDOR_CATEGORY_SUMMARY.md         | 256       | Executive summary | Planning, reporting           |
| VENDOR_CATEGORY_INDEX.md           | 336       | This file         | Navigation                    |
| **TOTAL**                          | **1,700** | Complete docs     | Any need                      |

---

## Getting Started

1. **First time?** Start with VENDOR_CATEGORY_SUMMARY.md (5 min read)
2. **Need to implement?** Go to VENDOR_CATEGORY_CODE_LOCATIONS.md
3. **Deep dive?** Read VENDOR_CATEGORY_ANALYSIS.md
4. **Quick refresh?** Check VENDOR_CATEGORY_QUICK_REFERENCE.md

---

## Version History

- Version 1.0 (March 4, 2026): Complete initial analysis
  - All type definitions found and documented
  - All email variables identified (8 working, 3 missing)
  - Complete code locations and implementation guide

---

## Status

Complete analysis with:

- Type definitions: 100%
- Field mappings: 100%
- Email variables: 100%
- Code locations: 100%
- Recommendations: 100%
- Implementation checklist: 100%

Ready for:

- Planning
- Implementation
- Backend integration
- Testing

---

Generated: March 4, 2026  
Analysis Status: Complete  
Documentation Status: Complete  
Ready for Implementation: Yes
