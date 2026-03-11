# VENDOR CATEGORY ANALYSIS - Frontend Codebase

## 1. COMPLETE VendorCategory TYPE DEFINITION

### From `/src/types/eventPortal.ts` (lines 39-52):

```typescript
export interface VendorCategory {
  id: number;
  name: string;
  description: string;
  categories: string[];          // Array of vendor categories/types
  booth_price: number | null;    // Price per booth for this category
  payment_link: string | null;   // Payment URL for this category
  install: {
    install_date: string | null;        // Category-specific install date
    install_start_time: string | null;  // Category-specific install start time
    install_end_time: string | null;    // Category-specific install end time
  };
  application_tags: string[];    // Tags specific to this category
}
```

### From `/src/components/producer/CreateEventWizard/types.ts` (ApplicationRow, lines 3-14):

```typescript
export interface ApplicationRow {
  id: string;                    // Temporary client-side ID (UUID)
  name: string;                  // Application title (e.g., "Artist Booth")
  booth_price: number;           // Price for this booth type
  description: string;           // Optional description
  categories?: string[];         // Optional vendor categories (future use)
  install_date?: string;         // Install date (ISO date string)
  install_start_time?: string;   // Install start time (HH:MM format)
  install_end_time?: string;     // Install end time (HH:MM format)
  payment_link?: string;         // Payment link for this application
  application_tags?: string[];   // Tags for this application
}
```

---

## 2. ALL CATEGORY-SPECIFIC FIELDS

### Fields That Vary By Category:

1. **booth_price** / **price**
   - Type: `number | null` (VendorCategory) or `number` (ApplicationRow)
   - Description: Cost per booth for this specific vendor application type
   - Example: $150, $200, $50
   - Used in: Email variables `[boothPrice]`, `[categoryPrice]`

2. **install_date**
   - Type: `string | null` (ISO date string)
   - Description: Setup/installation date specific to this category
   - Example: "2026-06-14"
   - Used in: Email variable `[installDate]`

3. **install_start_time**
   - Type: `string | null` (HH:MM format)
   - Description: When setup begins for this category
   - Example: "08:00", "14:00"
   - Used in: Email variable `[installStartTime]`

4. **install_end_time**
   - Type: `string | null` (HH:MM format)
   - Description: When setup ends for this category
   - Example: "10:00", "16:00"
   - Used in: Email variable `[installEndTime]`

5. **payment_link**
   - Type: `string | null`
   - Description: Payment/checkout URL specific to this booth type
   - Example: "https://pay.example.com/booth-123"
   - Used in: Email variable `[paymentLink]`

6. **application_tags**
   - Type: `string[]` (VendorCategory) or `string` (backend comma-separated)
   - Description: Tags/metadata for filtering/organizing this application type
   - Example: ["outdoor_setup", "parking_included"]
   - Not yet in EMAIL_VARIABLES

7. **categories** (in VendorCategory)
   - Type: `string[]`
   - Description: Vendor types that can apply to this application
   - Example: ["Artist", "Food Vendor"]
   - Mapping: What vendor_category values are accepted

---

## 3. HOW CATEGORIES ARE STORED ON EVENT

### Array of Categories Per Event

**Location of Array:**
- `EventPortalData.vendor_categories: VendorCategory[]` (eventPortal.ts, line 9)
- Each event has an array of vendor categories/applications
- Each category is a separate application type with its own settings

**Data Structure Example (from VendorEventPortalPage.tsx, lines 162-213):**

```typescript
vendor_categories: [
  {
    id: 1,
    name: "Artist Booth",
    description: "For visual artists",
    categories: ["artist", "visual_artist"],
    booth_price: 150,
    payment_link: "https://pay.stripe.com/artist",
    install: {
      install_date: "2026-06-14",
      install_start_time: "08:00",
      install_end_time: "10:00",
    },
    application_tags: ["outdoor", "equipment_provided"],
  },
  {
    id: 2,
    name: "Food Vendor",
    description: "For restaurants and food vendors",
    categories: ["food_vendor", "restaurant"],
    booth_price: 200,
    payment_link: "https://pay.stripe.com/food",
    install: {
      install_date: "2026-06-14",
      install_start_time: "14:00",
      install_end_time: "16:00",
    },
    application_tags: ["permits_required", "utilities_included"],
  }
]
```

**Important:** On EventDetails (backend Response), the field is called `vendor_applications`:
- `Event.vendor_applications: VendorApplication[]`
- Same structure as VendorCategory

---

## 4. CURRENT EMAIL PREVIEW/RESOLVER HANDLING

### Current Implementation

**File:** `/src/components/shared/EventEmailPreviewModal.tsx` (lines 165-176)

```typescript
const loadPreview = async () => {
  if (!email) return;
  
  setIsLoading(true);
  setError(null);
  try {
    // All emails (including Position 1 Initial Invitation) use the standard preview endpoint
    const context = hasCategorySpecificContent
      ? { category: selectedCategory }
      : {};

    const data = await scheduledEmailsApi.preview(
      eventSlug,
      email.id,
      context as any
    );
    setPreviewData(data);
  } catch (err: any) {
    // ...
  }
};
```

### What's Currently Supported

1. **Category Detection**
   - Detects if email has category-specific variables:
   ```typescript
   const hasCategorySpecificContent = email?.body_template?.includes('[category') ||
                                       email?.subject_template?.includes('[category');
   ```

2. **Category Selection**
   - Dropdown to select which category to preview
   - Default categories: "artist", "food_vendor", "table_vendor", "sponsor"
   - Can be overridden with availableCategories prop

3. **Backend Preview Call**
   - Sends `{ category: selectedCategory }` in request body
   - Backend EmailVariableResolver receives this context
   - Resolves variables based on selected category

### Limitations

1. **No Registration-Based Preview**
   - Current interface only requires `registration_id`
   - But category context is passed separately (not tied to registration)
   - This means variables like `[installDate]` aren't resolved unless backend knows the category

2. **No Vendor Category Variables Yet**
   - `[categoryPrice]` is NOT fully category-specific in frontend
   - Currently just an alias for `[boothPrice]` (both use event-level price)
   - Backend needs to resolve based on registration's category

3. **Missing Variables**
   - `application_tags` not yet in EMAIL_VARIABLES
   - No dedicated category name/description variables

---

## 5. DATA STRUCTURE - HOW CATEGORIES ARE STORED

### On Event Model

**Frontend Type:** `EventDetails` (eventPortal.ts, lines 13-31)
```typescript
export interface EventDetails {
  id: number;
  title: string;
  slug: string;
  description: string;
  dates: { /* ... */ };
  venue: string;
  location: string;
  age_restriction: string | null;
  ticket_url: string | null;
  application_deadline: string | null;
  payment_deadline: string | null;
  organization: Organization | null;
  // NOTE: Actual vendor_applications come from API response
}
```

**Note:** `vendor_applications` is NOT in EventDetails interface but comes from API:
- Location in API response: `event.vendor_applications`
- Each app has: id, name, description, booth_price, categories, install_date, install_start_time, install_end_time, payment_link, application_tags

### On Registration Model

**Not explicitly typed in frontend**, but based on usage in:
- `/src/types/email.ts` (EmailDelivery, lines 162-163)
  ```typescript
  // ✅ Phase 1-3: Backend now includes registration data for audit log
  recipient_name?: string | null;
  vendor_category?: string | null;  // The application name they applied to
  ```

**What's stored on registration:**
- `vendor_category`: The name of the application they applied to
- Implied: The category data (booth_price, install dates, etc.) based on which application they applied to

### On EmailDelivery Model

**File:** `/src/types/email.ts` (lines 129-168)

```typescript
export interface EmailDelivery {
  id: number;
  scheduled_email_id: number;
  event_id: number;
  registration_id: number | null;
  event_invitation_id: number | null;

  // Email identifiers
  sendgrid_message_id: string;
  recipient_email: string;

  // Delivery tracking
  status: DeliveryStatus;
  bounce_type: 'soft' | 'hard' | null;
  bounce_reason: string | null;
  drop_reason: string | null;

  // ✅ Phase 1-3: Backend now includes registration data for audit log
  recipient_name?: string | null;
  vendor_category?: string | null;  // Category they applied to
}
```

**Key:** `vendor_category` field stores which application type they applied for

---

## 6. EXAMPLES OF ACCESSING CATEGORY-SPECIFIC FIELDS IN CODE

### Example 1: Vendor Event Portal (VendorEventPortalPage.tsx, lines 491-510)

```typescript
{vendor_categories.length > 0 && (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-white mb-4">Vendor Categories</h2>
    {vendor_categories.map((category) => (
      <div key={category.id} className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
        <p className="text-white/70 mb-4">{category.description}</p>
        
        {/* Access booth_price for this specific category */}
        <div className="text-lg font-bold text-purple-300">
          ${category.booth_price}
        </div>
        
        {/* Access install times for this specific category */}
        {category.install?.install_date && (
          <div className="text-white/60">
            <span>Install: {new Date(category.install.install_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>{category.install.install_start_time} - {category.install.install_end_time}</span>
          </div>
        )}
        
        {/* Access payment link for this specific category */}
        {category.payment_link && (
          <a href={category.payment_link} className="text-purple-400 hover:text-purple-300">
            Pay Now
          </a>
        )}
      </div>
    ))}
  </div>
)}
```

### Example 2: Creating/Editing Applications (CreateApplicationForm.tsx)

```typescript
// Reading category-specific fields from existingApplication
const [formData, setFormData] = useState({
  name: existingApplication?.name || '',
  description: existingApplication?.description || '',
  booth_price: existingApplication?.pricing?.booth_price || 0,
  install_date: formatDateForInput(existingApplication?.install_date) || '',
  install_start_time: existingApplication?.install_start_time || '',
  install_end_time: existingApplication?.install_end_time || '',
  payment_link: existingApplication?.payment_link || '',
  status: existingApplication?.status || 'active' as 'active' | 'inactive',
});

// Initialize tags
const [tags, setTags] = useState<string[]>(
  existingApplication?.application_tags
    ? existingApplication.application_tags.split(',').map(t => t.trim())
    : []
);
```

### Example 3: Email Preview with Category Context (EventEmailPreviewModal.tsx)

```typescript
// Detecting category-specific variables
const hasCategorySpecificContent = email?.body_template?.includes('[category') ||
                                   email?.subject_template?.includes('[category');

// Passing category to backend for resolution
const data = await scheduledEmailsApi.preview(
  eventSlug,
  email.id,
  { category: selectedCategory }  // Pass selected category
);
```

### Example 4: Application API Requests (api.ts, lines 930-946)

```typescript
async create(eventSlug: string, data: {
  name: string
  description?: string
  booth_price?: number
  status?: 'active' | 'inactive'
  categories?: string[]              // Vendor types this app accepts
  install_date?: string              // Install date specific to this app
  install_start_time?: string        // Install start time
  install_end_time?: string          // Install end time
  payment_link?: string              // Payment link for this app
  application_tags?: string
}) {
  return fetchApi<any>(`/v1/presents/events/${eventSlug}/vendor_applications`, {
    method: 'POST',
    body: JSON.stringify({ vendor_application: data }),
  })
}
```

---

## 7. CATEGORY-SPECIFIC VARIABLES IN EMAIL_VARIABLES

### Currently Defined (emailVariables.ts, lines 36-308)

**Variables that reference categories:**

1. **[boothPrice]** (lines 95-101)
   ```typescript
   {
     label: 'Booth Price',
     frontendVar: '[boothPrice]',
     backendVar: '{{booth_price}}',
     category: 'event',
     description: 'Cost per booth',
     example: '$150.00'
   }
   ```
   - Status: WORKS for single-category events
   - Issue: Multi-category events need category-specific pricing

2. **[categoryPrice]** (lines 103-109)
   ```typescript
   {
     label: 'Category Price',
     frontendVar: '[categoryPrice]',
     backendVar: '{{category_price}}',
     category: 'event',
     description: 'Cost per booth (alias for boothPrice)',
     example: '$150.00'
   }
   ```
   - Status: ALIAS - not category-specific yet
   - Resolves to: Same as boothPrice

3. **[installDate]** (lines 227-233)
   ```typescript
   {
     label: 'Install Date',
     frontendVar: '[installDate]',
     backendVar: '{{install_date}}',
     category: 'vendor',
     description: 'Vendor setup/install date',
     example: 'June 14, 2025'
   }
   ```
   - Status: WORKS
   - Gets install_date from registration's vendor_category

4. **[installTime]** (lines 235-241)
   ```typescript
   {
     label: 'Install Time',
     frontendVar: '[installTime]',
     backendVar: '{{install_time}}',
     category: 'vendor',
     description: 'Vendor setup time range',
     example: '8:00 AM - 10:00 AM'
   }
   ```
   - Status: WORKS
   - Formats: install_start_time - install_end_time

5. **[installStartTime]** (lines 243-249)
   ```typescript
   {
     label: 'Install Start Time',
     frontendVar: '[installStartTime]',
     backendVar: '{{install_start_time}}',
     category: 'vendor',
     description: 'Setup start time',
     example: '8:00 AM'
   }
   ```
   - Status: WORKS

6. **[installEndTime]** (lines 251-257)
   ```typescript
   {
     label: 'Install End Time',
     frontendVar: '[installEndTime]',
     backendVar: '{{install_end_time}}',
     category: 'vendor',
     description: 'Setup end time',
     example: '10:00 AM'
   }
   ```
   - Status: WORKS

7. **[vendorCategory]** (lines 195-201)
   ```typescript
   {
     label: 'Vendor Category',
     frontendVar: '[vendorCategory]',
     backendVar: '{{vendor_category}}',
     category: 'vendor',
     description: 'Type of vendor',
     example: 'Food'
   }
   ```
   - Status: WORKS
   - Gets: The application name (e.g., "Artist Booth", "Food Vendor")

8. **[paymentLink]** (lines 261-267)
   ```typescript
   {
     label: 'Payment Link',
     frontendVar: '[paymentLink]',
     backendVar: '{{payment_link}}',
     category: 'computed',
     description: 'Payment URL for vendor',
     example: 'https://pay.voxxypresents.com/...'
   }
   ```
   - Status: WORKS
   - Gets: payment_link specific to the registered vendor_category

---

## 8. RECOMMENDATIONS FOR NEW CATEGORY-SPECIFIC VARIABLES

### HIGH PRIORITY - Missing Category-Specific Variables

1. **[categoryDescription]** - NEW
   ```typescript
   {
     label: 'Category Description',
     frontendVar: '[categoryDescription]',
     backendVar: '{{category_description}}',
     category: 'vendor',
     description: 'Description of the vendor application type',
     example: 'Local restaurants and food service vendors'
   }
   ```
   - Use Case: Explain what type of vendor this application is for
   - Backend Implementation: Look up registration.vendor_category → get description from VendorApplication

2. **[applicationTags]** - NEW
   ```typescript
   {
     label: 'Application Tags',
     frontendVar: '[applicationTags]',
     backendVar: '{{application_tags}}',
     category: 'vendor',
     description: 'Tags for this vendor application type (comma-separated)',
     example: 'outdoor_setup, parking_included, utilities_provided'
   }
   ```
   - Use Case: List special features/requirements of this application type
   - Backend Implementation: Join application_tags with commas

3. **[tagsList]** - NEW (formatted version)
   ```typescript
   {
     label: 'Tags List',
     frontendVar: '[tagsList]',
     backendVar: '{{tags_list}}',
     category: 'vendor',
     description: 'Application tags as bulleted list',
     example: '• Outdoor Setup\n• Parking Included\n• Utilities Provided'
   }
   ```
   - Use Case: Display benefits/features in formatted bullet list
   - Backend Implementation: Format application_tags as bulleted list

### MEDIUM PRIORITY - Clarifications Needed

4. **[categoryName]** - NEW (alias for [vendorCategory])
   ```typescript
   {
     label: 'Category Name',
     frontendVar: '[categoryName]',
     backendVar: '{{category_name}}',
     category: 'vendor',
     description: 'Name of the vendor application type',
     example: 'Artist Booth'
   }
   ```
   - Use Case: Same as [vendorCategory] but more explicit
   - Note: Might be redundant with [vendorCategory]

### LOW PRIORITY - Future Enhancements

5. **[installAddress]** - FUTURE
   - Use Case: If install location varies by category
   - Backend Implementation: Requires new field on VendorApplication

6. **[categoryDeadline]** - FUTURE
   - Use Case: If application deadline varies by category
   - Backend Implementation: Requires new field on VendorApplication

7. **[boothSize]** - FUTURE
   - Use Case: Booth dimensions if available
   - Backend Implementation: Requires new field on VendorApplication

---

## 9. SUMMARY TABLE - CATEGORY-SPECIFIC FIELDS

| Field | Type | Where Stored | Current Email Variable | Notes |
|-------|------|--------------|------------------------|-------|
| booth_price | number | VendorApplication | [boothPrice], [categoryPrice] | Works but categoryPrice is alias |
| install_date | string (ISO) | VendorApplication.install | [installDate] | Works |
| install_start_time | string (HH:MM) | VendorApplication.install | [installStartTime] | Works |
| install_end_time | string (HH:MM) | VendorApplication.install | [installEndTime] | Works |
| install_time (range) | computed | VendorApplication.install | [installTime] | Works (formatted) |
| payment_link | string (URL) | VendorApplication | [paymentLink] | Works |
| application_tags | string[] | VendorApplication | NONE - MISSING | Needs variable |
| description | string | VendorApplication | NONE - MISSING | Needs variable |
| categories | string[] | VendorApplication | NONE | Not used in emails |
| name | string | VendorApplication | [vendorCategory] | Shows application name |

---

## 10. IMPLEMENTATION CHECKLIST

### Frontend Changes Needed

- [ ] Add [categoryDescription] to EMAIL_VARIABLES
- [ ] Add [applicationTags] to EMAIL_VARIABLES  
- [ ] Add [tagsList] to EMAIL_VARIABLES
- [ ] Update EmailVariable interface if needed
- [ ] Test category-specific preview in EventEmailPreviewModal
- [ ] Update documentation with new variables

### Backend Changes Needed (Rails)

- [ ] Update EmailVariableResolver to support new variables
- [ ] Ensure category context is passed through email preview flow
- [ ] Test registration-based resolution of category fields
- [ ] Add unit tests for category-specific variable resolution

### Testing Scenarios

1. Single-category event with category-specific fields
2. Multi-category event with different prices/install times per category
3. Email with mixed category-specific and non-specific variables
4. Email preview with category selection dropdown
5. Test email sending with category context
6. Backwards compatibility with [boothPrice] vs [categoryPrice]

