# Multiple Vendor Applications Per Event - Fix Required

## Problem Statement

Currently, the vendor application flow assumes **one application per event**. However, events can have multiple vendor applications (e.g., different booth types, vendor categories, or pricing tiers). When an event has multiple applications, the current implementation doesn't work correctly.

## Current Implementation

### Current URL Structure

```
/events/{slug}/apply
```

### Current Flow

1. User clicks "Apply as Vendor" button on event/invitation page
2. Navigates to `/events/{slug}/apply`
3. `VendorApplicationForm` fetches the event
4. Expects a **single** `vendor_application` object (line 58 in VendorApplicationForm.tsx)
5. Fails if event has multiple applications

### Current Code Issues

**File:** `src/pages/VendorApplicationForm.tsx`

```typescript
// Line 58 - Assumes single vendor_application
if (!data.vendor_application) {
  setError('This event is not accepting vendor applications.')
  return
}
```

**File:** `src/pages/InvitationViewPage.tsx` & `src/pages/PublicEventDetailPage.tsx`

```tsx
// Apply button doesn't specify which application
<a href={`/events/${event.slug}/apply`}>Apply as Vendor</a>
```

### Current Data Structure

**Event with Multiple Applications (array):**

```typescript
event: {
  vendor_applications: [
    {
      id: 1,
      name: 'Standard Booth',
      booth_price: 100.0,
      categories: ['Food', 'Crafts'],
    },
    {
      id: 2,
      name: 'Premium Booth',
      booth_price: 200.0,
      categories: ['Food', 'Crafts'],
    },
  ]
}
```

**But form expects singular:**

```typescript
event: {
  vendor_application: {
    id: 1,
    name: "Standard Booth",
    ...
  }
}
```

## Required Fix

### 1. Update URL Structure

**New URL:**

```
/events/{slug}/apply/{application_id}
```

OR (alternative):

```
/applications/{application_id}/apply
```

### 2. Update Routes

**File:** `src/App.tsx`

**Current:**

```tsx
<Route path="/events/:slug/apply" element={<VendorApplicationForm />} />
```

**New:**

```tsx
<Route path="/events/:slug/apply/:applicationId" element={<VendorApplicationForm />} />
```

### 3. Update Apply Button Links

**Files to Update:**

- `src/pages/InvitationViewPage.tsx` (line ~200)
- `src/pages/PublicEventDetailPage.tsx` (line ~217)

**Current:**

```tsx
<a href={`/events/${invitation.event!.slug}/apply`} target="_blank" rel="noopener noreferrer">
  Apply as Vendor
</a>
```

**New:**

```tsx
<a
  href={`/events/${invitation.event!.slug}/apply/${application.id}`}
  target="_blank"
  rel="noopener noreferrer"
>
  Apply as Vendor
</a>
```

### 4. Update VendorApplicationForm Component

**File:** `src/pages/VendorApplicationForm.tsx`

**Changes Needed:**

#### A. Update URL params

```typescript
// Current
const { slug } = useParams<{ slug: string }>()

// New
const { slug, applicationId } = useParams<{ slug: string; applicationId: string }>()
```

#### B. Update fetch logic

```typescript
// Current - fetches event and expects single vendor_application
const fetchEvent = async (eventSlug: string) => {
  const data = await eventsApi.getById(eventSlug)

  if (!data.vendor_application) {
    setError('This event is not accepting vendor applications.')
    return
  }

  setEvent(data)
}

// New - fetches event and finds specific application
const fetchEvent = async (eventSlug: string, appId: string) => {
  const data = await eventsApi.getById(eventSlug)

  // Find the specific application by ID
  const application = data.vendor_applications?.find((app) => app.id === parseInt(appId))

  if (!application) {
    setError('This vendor application is not available.')
    return
  }

  // Store both event and specific application
  setEvent(data)
  setApplication(application)
}
```

#### C. Add application state

```typescript
const [application, setApplication] = useState<VendorApplication | null>(null)
```

#### D. Update form to use specific application

```typescript
// Use application state instead of event.vendor_application
<h2 className="text-2xl font-bold text-white mb-4">
  {application?.name || 'Apply as Vendor'}
</h2>

{application?.booth_price && (
  <p className="text-2xl font-bold text-white mb-4">
    ${Number(application.booth_price).toFixed(2)}
  </p>
)}
```

#### E. Update submit to use application ID

```typescript
const response = await registrationsApi.submitVendorApplication(event.slug, {
  name: formData.name,
  email: formData.email,
  phone: formData.phone || undefined,
  business_name: formData.business_name,
  vendor_category: formData.vendor_category,
  vendor_application_id: parseInt(applicationId!), // Use from URL param
  subscribed: formData.subscribed,
})
```

### 5. Update TypeScript Interfaces

**File:** `src/pages/VendorApplicationForm.tsx`

```typescript
// Add specific VendorApplication type
interface VendorApplication {
  id: number
  name: string
  description?: string
  categories: string[]
  booth_price?: number
  submissions_count?: number
}

// Update Event interface to use array
interface Event {
  // ... other fields
  vendor_applications?: VendorApplication[] // Changed from singular to plural
}
```

## Testing Checklist

After implementing the fix, test the following scenarios:

- [ ] Event with single vendor application - should work as before
- [ ] Event with multiple vendor applications - each "Apply" button should go to correct application
- [ ] Application form shows correct application name and booth price
- [ ] Form submission includes correct `vendor_application_id`
- [ ] Invalid application ID in URL shows proper error message
- [ ] Invitation page with multiple applications - all buttons work
- [ ] Public event page with multiple applications - all buttons work
- [ ] Application form opened in new tab (target="\_blank") works correctly

## Files to Modify

1. `src/App.tsx` - Update route definition
2. `src/pages/InvitationViewPage.tsx` - Update apply button links
3. `src/pages/PublicEventDetailPage.tsx` - Update apply button links
4. `src/pages/VendorApplicationForm.tsx` - Major refactor to handle application ID
5. `src/services/api.ts` - Verify API types match new structure

## Backend Considerations

Ensure the backend API returns `vendor_applications` as an **array** for events that support multiple application types:

```json
{
  "event": {
    "id": 1,
    "title": "Summer Festival",
    "vendor_applications": [
      {
        "id": 1,
        "name": "Standard Booth",
        "booth_price": 100.0,
        "categories": ["Food", "Crafts"],
        "description": "10x10 booth space"
      },
      {
        "id": 2,
        "name": "Premium Booth",
        "booth_price": 200.0,
        "categories": ["Food", "Crafts"],
        "description": "20x20 booth space with electricity"
      }
    ]
  }
}
```

## Migration Notes

- This is a **breaking change** for the application URL structure
- Existing `/events/{slug}/apply` links will need to be updated
- Consider adding a redirect from old URL to help with any existing links
- Update any email templates or marketing materials with application links

## Priority

**High** - This blocks the ability to have multiple vendor application types per event, which is a core feature requirement.
