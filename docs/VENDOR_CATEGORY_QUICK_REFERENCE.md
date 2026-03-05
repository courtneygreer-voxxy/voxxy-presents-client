# VENDOR CATEGORY - QUICK REFERENCE

## VendorCategory Type

```typescript
// File: src/types/eventPortal.ts
export interface VendorCategory {
  id: number;
  name: string;                    // e.g., "Artist Booth"
  description: string;             // e.g., "For visual artists"
  categories: string[];            // e.g., ["artist", "visual_artist"]
  booth_price: number | null;      // e.g., $150
  payment_link: string | null;     // Stripe payment URL
  install: {
    install_date: string | null;          // ISO date: "2026-06-14"
    install_start_time: string | null;    // HH:MM: "08:00"
    install_end_time: string | null;      // HH:MM: "10:00"
  };
  application_tags: string[];      // e.g., ["outdoor", "equipment_provided"]
}
```

## Storage Model

- **Events**: Array of `vendor_categories: VendorCategory[]`
- **Registrations**: Store `vendor_category` as the application name
- **Emails**: Pass `{ category: "category_name" }` context to backend for resolution

## Category-Specific Fields Summary

| Field | Type | Email Variable | Status |
|-------|------|----------------|--------|
| booth_price | number | [boothPrice], [categoryPrice] | WORKS |
| install_date | ISO string | [installDate] | WORKS |
| install_start_time | HH:MM | [installStartTime] | WORKS |
| install_end_time | HH:MM | [installEndTime] | WORKS |
| install_time (range) | computed | [installTime] | WORKS |
| payment_link | URL | [paymentLink] | WORKS |
| application_tags | string[] | MISSING | Need to add |
| description | string | MISSING | Need to add |

## Email Variables Existing

All working and category-specific:
- `[installDate]` - Setup date from category
- `[installStartTime]` - Setup start time
- `[installEndTime]` - Setup end time
- `[installTime]` - Formatted range (e.g., "8:00 AM - 10:00 AM")
- `[vendorCategory]` - Application name (e.g., "Artist Booth")
- `[paymentLink]` - Payment URL for this category
- `[boothPrice]` - Booth price (needs backend to resolve per category)
- `[categoryPrice]` - Alias for boothPrice

## Email Variables Missing (HIGH PRIORITY)

1. `[categoryDescription]` - Description of the application type
2. `[applicationTags]` - Tags as comma-separated list
3. `[tagsList]` - Tags as bulleted list

## How to Add New Email Variable

1. Add to `EMAIL_VARIABLES` array in `/src/utils/emailVariables.ts`
2. Update backend EmailVariableResolver to resolve variable from VendorApplication
3. Test in EventEmailPreviewModal with category selection

## How Preview Currently Works

```typescript
// 1. Detect if email has category-specific variables
const hasCategorySpecificContent = 
  email?.body_template?.includes('[category') ||
  email?.subject_template?.includes('[category');

// 2. Show dropdown to select category
// 3. Pass to backend:
scheduledEmailsApi.preview(eventSlug, id, { category: selectedCategory })

// 4. Backend resolves variables based on category context
```

## Key Files

- Types: `/src/types/eventPortal.ts`, `/src/types/email.ts`
- Email Variables: `/src/utils/emailVariables.ts`
- Preview Modal: `/src/components/shared/EventEmailPreviewModal.tsx`
- API: `/src/services/api.ts` (scheduledEmailsApi.preview())
- Forms: `/src/components/producer/CreateApplicationForm.tsx`

## Backend Integration Points

1. EmailVariableResolver
   - Receives: `{ category: "application_name" }`
   - Must look up VendorApplication by name
   - Resolves category-specific fields

2. Email Preview Endpoint
   - POST `/v1/presents/events/:slug/scheduled_emails/:id/preview`
   - Accepts: `{ category?: string }`
   - Returns: `{ subject, body, recipient_email, recipient_name }`

3. Registration Model
   - Stores: `vendor_category` (application name)
   - Backend uses this to lookup category data

