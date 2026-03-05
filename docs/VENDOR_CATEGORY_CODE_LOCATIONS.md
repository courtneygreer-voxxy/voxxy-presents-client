# VENDOR CATEGORY - CODE LOCATIONS & REFERENCES

## File Structure Overview

```
src/
├── types/
│   ├── eventPortal.ts              # VendorCategory interface (lines 39-52)
│   └── email.ts                    # EMAIL_VARIABLES definitions (lines 535-641)
├── utils/
│   └── emailVariables.ts           # EMAIL_VARIABLES array, validation functions
├── services/
│   └── api.ts                      # API endpoints for vendor_applications
├── components/
│   ├── shared/
│   │   └── EventEmailPreviewModal.tsx     # Email preview with category support
│   ├── producer/
│   │   ├── CreateApplicationForm.tsx      # Form for creating/editing applications
│   │   ├── ApplicationsTab.tsx            # Display applications with category fields
│   │   ├── CreateEventWizard/
│   │   │   ├── types.ts                   # ApplicationRow interface
│   │   │   ├── steps/
│   │   │   │   └── Step2ApplicationDetails.tsx  # Application creation UI
│   │   │   └── EmailPreviewModal.tsx      # Preview modal wrapper
│   │   └── Email/
│   │       └── EmailEditorPage.tsx        # Full-screen email editor
├── pages/
│   ├── VendorEventPortalPage.tsx          # Displays vendor_categories array
│   ├── VendorApplicationForm.tsx          # Vendor application submission
│   ├── InvitationViewPage.tsx             # Shows category details
│   ├── PublicEventDetailPage.tsx          # Event page with categories
│   ├── AdminDashboard.tsx                 # Admin view of applications
│   └── ProducerDashboard.tsx              # Producer dashboard
└── test/
    └── eventPortalService.test.ts         # Test data with categories
```

---

## TYPE DEFINITIONS

### 1. VendorCategory (Main Type)

**File:** `/src/types/eventPortal.ts` (lines 39-52)

```typescript
export interface VendorCategory {
  id: number;
  name: string;
  description: string;
  categories: string[];
  booth_price: number | null;
  payment_link: string | null;
  install: {
    install_date: string | null;
    install_start_time: string | null;
    install_end_time: string | null;
  };
  application_tags: string[];
}
```

**Used in:**
- `EventPortalData.vendor_categories: VendorCategory[]` (line 9)
- Vendor Event Portal page
- Event detail pages

### 2. ApplicationRow (Client-Side Model)

**File:** `/src/components/producer/CreateEventWizard/types.ts` (lines 3-14)

```typescript
export interface ApplicationRow {
  id: string;
  name: string;
  booth_price: number;
  description: string;
  categories?: string[];
  install_date?: string;
  install_start_time?: string;
  install_end_time?: string;
  payment_link?: string;
  application_tags?: string[];
}
```

**Used in:**
- Event Creation Wizard Step 2
- Represents VendorApplication during creation

### 3. EventPortalData

**File:** `/src/types/eventPortal.ts` (lines 4-11)

```typescript
export interface EventPortalData {
  id: number;
  view_count: number;
  last_viewed_at: string | null;
  event: EventDetails;
  vendor_categories: VendorCategory[];  // Array of categories per event
  producer_updates: Bulletin[];
}
```

---

## EMAIL VARIABLES DEFINITIONS

### Location: `/src/utils/emailVariables.ts`

**Category-specific variables currently defined:**

1. **[boothPrice]** (lines 95-101)
   - Type: event
   - Resolves: `booth_price` from category

2. **[categoryPrice]** (lines 103-109)
   - Type: event
   - Resolves: `{{category_price}}` (alias for booth_price)

3. **[installDate]** (lines 227-233)
   - Type: vendor
   - Resolves: `install_date` from category

4. **[installTime]** (lines 235-241)
   - Type: vendor
   - Resolves: Formatted `install_start_time - install_end_time`

5. **[installStartTime]** (lines 243-249)
   - Type: vendor
   - Resolves: `install_start_time` from category

6. **[installEndTime]** (lines 251-257)
   - Type: vendor
   - Resolves: `install_end_time` from category

7. **[vendorCategory]** (lines 195-201)
   - Type: vendor
   - Resolves: Application name (e.g., "Artist Booth")

8. **[paymentLink]** (lines 261-267)
   - Type: computed
   - Resolves: `payment_link` from category

### Full EMAIL_VARIABLES Array
**File:** `/src/utils/emailVariables.ts` (lines 36-308)
- 26 total variables
- 8 are category-specific
- 3 missing implementations

---

## API ENDPOINTS

### Vendor Applications API

**File:** `/src/services/api.ts` (lines 915-1007)

#### Create Application
```typescript
vendorApplicationsApi.create(eventSlug: string, data: {
  name: string
  description?: string
  booth_price?: number
  status?: 'active' | 'inactive'
  categories?: string[]
  install_date?: string
  install_start_time?: string
  install_end_time?: string
  payment_link?: string
  application_tags?: string
})
```
**Endpoint:** POST `/v1/presents/events/{eventSlug}/vendor_applications`

#### Update Application
```typescript
vendorApplicationsApi.update(id: number, data: Partial<{...}>)
```
**Endpoint:** PATCH `/v1/presents/vendor_applications/{id}`

#### Get Submissions
```typescript
vendorApplicationsApi.getSubmissions(id: number, params?: {
  category?: string
  status?: string
})
```
**Endpoint:** GET `/v1/presents/vendor_applications/{id}/submissions`

### Scheduled Emails API

**File:** `/src/services/api.ts`

#### Email Preview (with category context)
```typescript
scheduledEmailsApi.preview(
  eventSlug: string, 
  id: number, 
  data: { category?: string }  // Pass category here
)
```
**Endpoint:** POST `/v1/presents/events/{eventSlug}/scheduled_emails/{id}/preview`
**Returns:** `{ subject: string, body: string, recipient_email: string, recipient_name: string }`

---

## COMPONENT IMPLEMENTATIONS

### 1. EventEmailPreviewModal (Category-Aware)

**File:** `/src/components/shared/EventEmailPreviewModal.tsx`

**Key lines:**
- Lines 55-57: Props with category support
- Lines 69-74: Default categories
- Lines 114-116: Category selection state
- Lines 165-176: Category context passed to backend
- Lines 187-190: Category change handler

**Features:**
- Detects category-specific variables
- Shows category dropdown
- Passes `{ category: selectedCategory }` to backend
- Updates preview when category changes

### 2. CreateApplicationForm

**File:** `/src/components/producer/CreateApplicationForm.tsx`

**Key lines:**
- Lines 17-32: Interface with category fields
- Lines 41-50: Form data state initialization
- Lines 54-58: Application tags parsing
- Lines 94-103: Data preparation for API

**Features:**
- Edit form for vendor applications
- Handles all category-specific fields
- Supports tags array
- Date/time formatting

### 3. Step2ApplicationDetails (Event Wizard)

**File:** `/src/components/producer/CreateEventWizard/steps/Step2ApplicationDetails.tsx`

**Key sections:**
- Lines 188-212: Default application templates with install times
- Lines 435-490: Form fields for category details
- Handles: name, description, booth_price, install times, payment_link, tags

### 4. VendorEventPortalPage

**File:** `/src/pages/VendorEventPortalPage.tsx`

**Key lines:**
- Lines 162-213: Mock data with multiple categories
- Lines 340: Destructuring vendor_categories
- Lines 491-510: Rendering category cards with details

**Shows:**
- Category name and description
- Booth price
- Install date and times
- Payment link
- Application tags (when rendered)

### 5. InvitationViewPage

**File:** `/src/pages/InvitationViewPage.tsx`

**Key lines:**
- Lines 283-287: Display install_date from category
- Shows category information when viewing invitation

---

## TEST DATA

### Mock VendorCategory Data

**File:** `/src/pages/VendorEventPortalPage.tsx` (lines 162-213)

```typescript
vendor_categories: [
  {
    id: 1,
    name: "Artist Booth",
    description: "For visual artists and craftspeople",
    categories: ["artist", "visual_artist"],
    booth_price: 150,
    payment_link: "https://pay.stripe.com/artist",
    install: {
      install_date: '2026-06-14',
      install_start_time: '08:00',
      install_end_time: '10:00',
    },
    application_tags: ["outdoor", "equipment_provided"],
  },
  // ... more categories
]
```

**File:** `/src/test/eventPortalService.test.ts` (lines 194-213)

Test data structure mirrors production format

---

## DATA FLOW DIAGRAM

```
Event Creation
  └─> Step 2: Application Details
      └─> Add/Edit ApplicationRow with:
          - booth_price
          - install_date, install_start_time, install_end_time
          - payment_link
          - application_tags
      └─> POST /vendor_applications creates VendorCategory

Email Creation
  └─> EmailEditorPage enters variables like [installDate]
  └─> Email Preview Modal
      └─> Detect [category...] variables
      └─> Show category dropdown
      └─> POST /preview with { category: selected }
      └─> Backend resolves variables using category context

Vendor Application
  └─> Vendor sees category details (price, install times, etc.)
  └─> Submits application with vendor_category = "Artist Booth"

Email Delivery
  └─> Registration created with vendor_category
  └─> Email sent with category-specific values resolved
  └─> Install date, price, payment link based on their category
```

---

## SEARCH COMMANDS

Quick grep commands to find category-related code:

```bash
# Find VendorCategory type usages
grep -r "vendor_categories\|VendorCategory" src/ --include="*.ts" --include="*.tsx"

# Find install_* field usages
grep -r "install_date\|install_time\|install_start\|install_end" src/ --include="*.ts" --include="*.tsx"

# Find booth_price usages
grep -r "booth_price" src/ --include="*.ts" --include="*.tsx"

# Find application_tags usages
grep -r "application_tags" src/ --include="*.ts" --include="*.tsx"

# Find EMAIL_VARIABLES definitions
grep -r "EMAIL_VARIABLES\|frontendVar\|backendVar" src/ --include="*.ts"

# Find category preview handling
grep -r "hasCategorySpecificContent\|selectedCategory" src/ --include="*.ts" --include="*.tsx"
```

---

## ABSOLUTE FILE PATHS

All code locations as absolute paths:

- `/Users/beaulazear/Desktop/voxxy-presents-client/src/types/eventPortal.ts`
- `/Users/beaulazear/Desktop/voxxy-presents-client/src/utils/emailVariables.ts`
- `/Users/beaulazear/Desktop/voxxy-presents-client/src/types/email.ts`
- `/Users/beaulazear/Desktop/voxxy-presents-client/src/services/api.ts`
- `/Users/beaulazear/Desktop/voxxy-presents-client/src/components/shared/EventEmailPreviewModal.tsx`
- `/Users/beaulazear/Desktop/voxxy-presents-client/src/components/producer/CreateApplicationForm.tsx`
- `/Users/beaulazear/Desktop/voxxy-presents-client/src/components/producer/CreateEventWizard/types.ts`
- `/Users/beaulazear/Desktop/voxxy-presents-client/src/components/producer/CreateEventWizard/steps/Step2ApplicationDetails.tsx`
- `/Users/beaulazear/Desktop/voxxy-presents-client/src/pages/VendorEventPortalPage.tsx`
- `/Users/beaulazear/Desktop/voxxy-presents-client/src/pages/VendorApplicationForm.tsx`
- `/Users/beaulazear/Desktop/voxxy-presents-client/src/pages/InvitationViewPage.tsx`

