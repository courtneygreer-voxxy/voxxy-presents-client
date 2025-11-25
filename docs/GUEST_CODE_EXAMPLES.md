# Guest Application Flow - Code Examples

## API Service Methods (src/services/api.ts)

### Submit Vendor Application
```typescript
registrationsApi.submitVendorApplication(eventSlug: string, data: {
  email: string
  phone?: string
  business_name: string
  vendor_category: string
  vendor_application_id: number
  subscribed?: boolean
})

// Usage Example:
const response = await registrationsApi.submitVendorApplication('music-festival-2025', {
  email: 'vendor@business.com',
  phone: '(555) 123-4567',
  business_name: 'My Catering Co',
  vendor_category: 'Food & Beverage',
  vendor_application_id: 42,
  subscribed: true
})

// Returns ticket_code in response
navigate(`/applications/success?ticket_code=${response.ticket_code}&event=${event.slug}`)
```

### Track Application Status
```typescript
registrationsApi.trackByTicketCode(ticketCode: string)

// Usage Example:
const registration = await registrationsApi.trackByTicketCode('APP-ABC123XYZ')
console.log(registration.status) // 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed'
```

### Get Event Details
```typescript
eventsApi.getById(slug: string)

// Usage Example:
const event = await eventsApi.getById('music-festival-2025')
if (event.vendor_application) {
  // Event accepts vendor applications
  console.log(event.vendor_application.categories)
}
```

### Lookup Vendor Application by Short Code
```typescript
vendorApplicationsApi.lookupByCode(code: string)

// Usage Example:
const eventData = await vendorApplicationsApi.lookupByCode('ABC123')
navigate(`/events/${eventData.slug}/apply`)
```

---

## Component Examples

### PublicEventDetailPage.tsx - Displaying Vendor Application
```tsx
// Show vendor application section if available
{event.vendor_application && (
  <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-lg p-6">
    <h2 className="text-2xl font-bold text-white mb-4">
      Vendor Opportunities
    </h2>
    <p className="text-lg text-purple-300 mb-4">
      {event.vendor_application.name}
    </p>
    
    {/* Categories */}
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-white/60 mb-2">
        Seeking Vendors In:
      </h3>
      <div className="flex flex-wrap gap-2">
        {event.vendor_application.categories.map((category) => (
          <span key={category} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
            {category}
          </span>
        ))}
      </div>
    </div>

    <button onClick={() => navigate(`/events/${event.slug}/apply`)}>
      Apply as Vendor
    </button>

    <p className="text-white/40 text-sm mt-4">
      {event.vendor_application.submissions_count} vendors have applied
    </p>
  </div>
)}
```

### VendorApplicationForm.tsx - Form Submission
```tsx
const [formData, setFormData] = useState({
  email: '',
  phone: '',
  business_name: '',
  vendor_category: '',
  subscribed: true,
})

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Validation
  if (!formData.email || !formData.business_name || !formData.vendor_category) {
    setError('Please fill in all required fields')
    return
  }

  try {
    setSubmitting(true)
    
    const response = await registrationsApi.submitVendorApplication(event.slug, {
      email: formData.email,
      phone: formData.phone || undefined,
      business_name: formData.business_name,
      vendor_category: formData.vendor_category,
      vendor_application_id: event.vendor_application.id,
      subscribed: formData.subscribed,
    })

    // Redirect to confirmation
    navigate(
      `/applications/success?ticket_code=${response.ticket_code}&event=${event.slug}`
    )
  } catch (err: any) {
    setError(err.message || 'Failed to submit application')
  } finally {
    setSubmitting(false)
  }
}
```

### ApplicationTrackingPage.tsx - Tracking Status
```tsx
const { ticketCode } = useParams<{ ticketCode: string }>()

useEffect(() => {
  if (ticketCode) {
    fetchRegistration(ticketCode)
  }
}, [ticketCode])

const fetchRegistration = async (code: string) => {
  try {
    const data = await registrationsApi.trackByTicketCode(code)
    setRegistration(data)
  } catch (err: any) {
    setError(err.message || 'Application not found')
  }
}

// Display status with color coding
const statusConfig = STATUS_CONFIG[registration.status as keyof typeof STATUS_CONFIG]
const StatusIcon = statusConfig.icon

return (
  <div className={`bg-white/5 border ${statusConfig.border} rounded-lg p-8`}>
    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusConfig.bg}`}>
      <StatusIcon className={`w-12 h-12 ${statusConfig.color}`} />
    </div>
    <h2 className={`text-2xl font-bold ${statusConfig.color}`}>
      {statusConfig.label}
    </h2>
  </div>
)
```

### ShortLinkRedirectPage.tsx - Short Link Resolution
```tsx
const { code } = useParams<{ code: string }>()

useEffect(() => {
  const lookupAndRedirect = async () => {
    if (!code) {
      setError('No application code provided')
      return
    }

    try {
      // Lookup the event by shareable code
      const eventData = await vendorApplicationsApi.lookupByCode(code)
      
      // Redirect to the vendor application form for this event
      navigate(`/events/${eventData.slug}/apply`, { replace: true })
    } catch (err: any) {
      setError(err.message || 'Application not found')
    }
  }

  lookupAndRedirect()
}, [code, navigate])
```

---

## API Request/Response Examples

### Submit Application Request
```javascript
POST /api/v1/presents/events/music-festival-2025/registrations

{
  "registration": {
    "email": "vendor@business.com",
    "phone": "(555) 123-4567",
    "business_name": "My Catering Company",
    "vendor_category": "Food & Beverage",
    "vendor_application_id": 42,
    "subscribed": true
  }
}

Response (200 OK):
{
  "id": 123,
  "ticket_code": "APP-ABC123XYZ",
  "email": "vendor@business.com",
  "business_name": "My Catering Company",
  "vendor_category": "Food & Beverage",
  "status": "pending",
  "created_at": "2025-11-24T10:30:00Z",
  "event": {
    "id": 42,
    "slug": "music-festival-2025",
    "title": "Music Festival 2025"
  }
}
```

### Track Application Request
```javascript
GET /api/v1/presents/registrations/track/APP-ABC123XYZ

Response (200 OK):
{
  "id": 123,
  "ticket_code": "APP-ABC123XYZ",
  "email": "vendor@business.com",
  "business_name": "My Catering Company",
  "vendor_category": "Food & Beverage",
  "status": "pending",
  "created_at": "2025-11-24T10:30:00Z",
  "event": {
    "id": 42,
    "title": "Music Festival 2025",
    "slug": "music-festival-2025",
    "dates": {
      "start": "2025-12-01T18:00:00Z"
    },
    "location": "Central Park, NYC"
  }
}
```

### Get Event Details Request
```javascript
GET /api/v1/presents/events/music-festival-2025

Response (200 OK):
{
  "id": 42,
  "title": "Music Festival 2025",
  "slug": "music-festival-2025",
  "description": "Annual music festival with food vendors and entertainment",
  "dates": {
    "start": "2025-12-01T18:00:00Z",
    "end": "2025-12-02T23:59:59Z"
  },
  "location": "Central Park, NYC",
  "poster_url": "https://example.com/poster.jpg",
  "ticket_url": "https://ticketing.example.com/music-festival-2025",
  "pricing": {
    "ticket_price": 45.00,
    "currency": "USD"
  },
  "capacity": {
    "total": 500,
    "registered": 342,
    "remaining": 158,
    "is_full": false
  },
  "organization": {
    "id": 1,
    "name": "NYC Events Co",
    "city": "New York",
    "state": "NY"
  },
  "vendor_application": {
    "id": 42,
    "name": "Vendor Application",
    "description": "We're looking for food trucks and merchandise vendors",
    "categories": ["Food & Beverage", "Merchandise", "Entertainment"],
    "submissions_count": 45
  }
}
```

### Lookup Vendor Application Request
```javascript
GET /api/v1/presents/vendor_applications/lookup/ABC123

Response (200 OK):
{
  "id": 42,
  "slug": "music-festival-2025",
  "name": "Music Festival 2025",
  "event_id": 42,
  "categories": ["Food & Beverage", "Merchandise", "Entertainment"],
  "submissions_count": 45
}
```

---

## Validation Rules

### Email Field
```typescript
// Must be valid email format
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

if (!isValidEmail(formData.email)) {
  throw new Error('Please enter a valid email address')
}
```

### Business Name
```typescript
// Required, non-empty
if (!formData.business_name || formData.business_name.trim() === '') {
  throw new Error('Business name is required')
}
```

### Vendor Category
```typescript
// Must be selected from available categories
if (!formData.vendor_category) {
  throw new Error('Please select a vendor category')
}

if (!event.vendor_application.categories.includes(formData.vendor_category)) {
  throw new Error('Invalid vendor category')
}
```

### Phone (Optional)
```typescript
// If provided, should be formatted
const formatPhone = (phone: string) => {
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  return phone
}
```

---

## Error Handling

### API Error Class
```typescript
class ApiError extends Error {
  status: number
  errors?: string[]
  
  constructor(message: string, status: number, errors?: string[]) {
    super(message)
    this.status = status
    this.errors = errors
    this.name = 'ApiError'
  }
}

// Usage
try {
  const response = await registrationsApi.submitVendorApplication(...)
} catch (err: any) {
  if (err instanceof ApiError) {
    console.log(`Error ${err.status}: ${err.message}`)
    if (err.errors) {
      err.errors.forEach(e => console.log(`  - ${e}`))
    }
  }
}
```

### Common Error Responses
```javascript
// 400 Bad Request
{
  "error": "Validation failed",
  "errors": ["Email has already been taken", "Business name can't be blank"]
}

// 404 Not Found
{
  "error": "Event not found",
  "message": "The event you are looking for does not exist"
}

// 422 Unprocessable Entity
{
  "error": "Invalid vendor category",
  "errors": ["Vendor category is not in available categories"]
}
```

---

## Route Guards

### Public Routes (No Auth Required)
```tsx
<Route path="/events/:slug" element={<PublicEventDetailPage />} />
<Route path="/events/:slug/apply" element={<VendorApplicationForm />} />
<Route path="/applications/success" element={<ApplicationConfirmationPage />} />
<Route path="/applications/track/:ticketCode" element={<ApplicationTrackingPage />} />
<Route path="/apply/:code" element={<ShortLinkRedirectPage />} />
```

### Authenticated Routes (Require Auth)
```tsx
// Producers
<Route path="/producer/pending" element={<ProducerDashboard />} />

// Vendors
<Route path="/vendor/pending" element={<VendorDashboard />} />

// Admin only
<Route path="/admin/dashboard" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />
```

---

## CSS Classes for Guest Pages

### Dark Theme
```css
/* Background */
bg-gradient-to-br from-[#1a0d2e] to-[#0f0820]

/* Cards/Containers */
bg-white/5 border border-white/10 rounded-lg p-6

/* Headings */
text-white

/* Text */
text-white/80 (secondary text)
text-white/60 (tertiary text)
text-white/40 (disabled/hint text)

/* Accent Colors */
from-purple-600 to-blue-500 (primary gradient)
bg-purple-500/20 text-purple-300 (badges)
text-purple-400 (icons)
```

### Status Badge Colors
```css
/* Pending */
bg-blue-500/20 text-blue-400
border-blue-500/30

/* Approved */
bg-green-500/20 text-green-400
border-green-500/30

/* Rejected */
bg-red-500/20 text-red-400
border-red-500/30

/* Waitlist */
bg-yellow-500/20 text-yellow-400
border-yellow-500/30

/* Confirmed */
bg-purple-500/20 text-purple-400
border-purple-500/30
```

---

## Testing the Guest Flow

### Manual Test Steps
```
1. Visit http://localhost:5173/events/test-event
   - Verify event details load
   - Verify "Apply as Vendor" button appears

2. Click "Apply as Vendor"
   - Verify form fields appear
   - Fill in test data:
     Email: test@vendor.com
     Phone: (555) 123-4567
     Business Name: Test Vendor
     Category: Select first category
     Newsletter: Check checkbox

3. Click "Submit Application"
   - Verify loading spinner appears
   - Verify redirect to confirmation page
   - Verify ticket code displays

4. Click "Track Application Status"
   - Verify page loads with application details
   - Verify status shows "pending"

5. Copy ticket code and visit /applications/track/[CODE]
   - Verify same information displays
   - Verify can track without button click
```

### Testing Error Cases
```
1. Empty email field - Should show validation error
2. Invalid email format - Should show validation error
3. Empty business name - Should show validation error
4. No category selected - Should show validation error
5. Invalid ticket code - Should show "Application not found"
6. Non-existent event slug - Should show "Event not found"
```

---

**Last Updated:** November 24, 2025  
**Version:** v1/presents API
