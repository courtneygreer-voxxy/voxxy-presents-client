# Voxxy Presents API Configuration

## Overview

The Voxxy Presents client application connects to a Rails backend API that supports both legacy routes (for backward compatibility) and new versioned API routes.

---

## Environment URLs

### Development
```
Base URL: https://www.voxxyai.com/api
Environment: development
Hostname: localhost or 127.0.0.1
```

**Features:**
- Admin controls: ✅
- Debug mode: ✅
- Experimental features: ✅
- Data sync from production: ❌

---

### Staging
```
Base URL: https://www.voxxyai.com/api
Environment: staging
Hostname: Contains 'onrender.com' OR 'staging'
```

**Features:**
- Admin controls: ✅
- Debug mode: ✅
- Experimental features: ❌
- Data sync from production: ✅

---

### Production
```
Base URL: https://heyvoxxy.com/api
Environment: production
Hostname: voxxypresents.com (or any domain not matching dev/staging)
```

**Features:**
- Admin controls: ✅ (controlled)
- Debug mode: ❌
- Experimental features: ❌
- Data sync from production: ❌

---

## API Route Structure

The API uses two route patterns:

### 1. Legacy Routes (10 Total - Backward Compatibility)

These routes **strip** `/api` from the base URL for backward compatibility with the mobile app:

```javascript
// Implementation in api.ts
fetch(`${API_BASE_URL.replace('/api', '')}/login`)
```

#### Authentication & User Management (5 routes)
- `POST /login` → `https://voxxyai.com/login` (requires `X-Mobile-App: true` header)
- `POST /users` → `https://voxxyai.com/users` (signup - see note below)
- `PATCH /users/:id` → `https://voxxyai.com/users/123` (update profile)
- `DELETE /logout` → `https://voxxyai.com/logout`
- `GET /me` → `https://voxxyai.com/me`

> **Current Signup Flow:** All `/signup/*` routes redirect to `/contact` for beta access requests. The `/users` endpoint exists but is currently only used for admin-created accounts.

#### Password Reset (2 routes)
- `POST /password_reset` → `https://voxxyai.com/password_reset` (request reset)
- `PATCH /password_reset` → `https://voxxyai.com/password_reset` (reset with token)

#### Email Verification (2 routes)
- `POST /verify_code` → `https://voxxyai.com/verify_code`
- `POST /resend_verification` → `https://voxxyai.com/resend_verification`

#### Admin (1 route)
- `GET /admin/user_breakdown` → `https://voxxyai.com/admin/user_breakdown`

> **Note:** These legacy routes exist for backward compatibility with the Voxxy mobile app. All new Presents-specific features use the versioned API below.

### 2. Versioned API Routes (New Structure)

These routes **keep** `/api` and add versioned paths:

```javascript
// Implementation in api.ts
fetch(`${API_BASE_URL}/v1/presents/organizations`)
```

**Examples:**
- `GET /api/v1/presents/organizations` → `https://voxxyai.com/api/v1/presents/organizations`
- `POST /api/v1/presents/events` → `https://voxxyai.com/api/v1/presents/events`
- `PATCH /api/v1/presents/registrations/:id` → `https://voxxyai.com/api/v1/presents/registrations/123`

---

## Route Usage Summary

### What Uses Legacy Routes?
- **Authentication** (login, signup, logout, get current user)
- **User Profile Updates**
- **Password Reset Flow**
- **Email Verification**
- **Admin User Management**

### What Uses Versioned API Routes?
- **Organizations** (venues/producers)
- **Events** (event management)
- **Vendor Applications** (application forms)
- **Registrations** (vendor submissions, RSVPs)
- **Budgets** (event budgeting)

> **Rule of Thumb:** If it's shared with the mobile app (auth, users), it uses legacy routes. If it's Presents-specific (events, vendors), it uses `/api/v1/presents/*`.

---

## Key API Endpoints

### Authentication & User Management (Legacy Routes)

**Base URL:** `https://voxxyai.com` (strips `/api`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | User login with email/password | ❌ Public |
| POST | `/users` | Create new user account (signup) | ❌ Public |
| DELETE | `/logout` | User logout | ✅ Yes |
| GET | `/me` | Get current user profile | ✅ Yes |
| PATCH | `/users/:id` | Update user profile | ✅ Yes |
| POST | `/verify_code` | Verify email with code | ❌ Public |
| POST | `/resend_verification` | Resend verification email | ❌ Public |
| POST | `/password_reset` | Request password reset | ❌ Public |
| PATCH | `/password_reset` | Reset password with token | ❌ Public |
| GET | `/admin/user_breakdown` | Get all users (admin only) | ✅ Admin |

### Organizations (Versioned Routes)

**Base URL:** `https://voxxyai.com/api` (keeps `/api`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/presents/organizations` | List all organizations | ✅ Yes |
| GET | `/v1/presents/organizations/:slug` | Get organization by slug | ✅ Yes |
| POST | `/v1/presents/organizations` | Create new organization | ✅ Yes |
| PATCH | `/v1/presents/organizations/:slug` | Update organization | ✅ Yes (owner) |
| DELETE | `/v1/presents/organizations/:slug` | Delete organization | ✅ Yes (owner) |

### Events (Versioned Routes)

**Base URL:** `https://voxxyai.com/api` (keeps `/api`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/presents/events` | List all events | ✅ Yes |
| GET | `/v1/presents/events/:slug` | Get event by slug | ✅ Yes |
| GET | `/v1/presents/organizations/:slug/events` | List organization's events | ✅ Yes |
| POST | `/v1/presents/organizations/:slug/events` | Create event for organization | ✅ Yes (owner) |
| PATCH | `/v1/presents/events/:slug` | Update event | ✅ Yes (owner) |
| DELETE | `/v1/presents/events/:slug` | Delete event | ✅ Yes (owner) |

### Vendor Applications (Versioned Routes)

**Base URL:** `https://voxxyai.com/api` (keeps `/api`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/presents/events/:slug/vendor_applications` | List event's vendor applications | ✅ Yes (owner) |
| POST | `/v1/presents/events/:slug/vendor_applications` | Create vendor application | ✅ Yes (owner) |
| GET | `/v1/presents/vendor_applications/:id` | Get application by ID | ✅ Yes (owner) |
| PATCH | `/v1/presents/vendor_applications/:id` | Update application | ✅ Yes (owner) |
| DELETE | `/v1/presents/vendor_applications/:id` | Delete application | ✅ Yes (owner) |
| GET | `/v1/presents/vendor_applications/:id/submissions` | Get application submissions | ✅ Yes (owner) |
| GET | `/v1/presents/vendor_applications/lookup/:code` | Lookup by shareable code | ❌ Public |

### Registrations (Versioned Routes)

**Base URL:** `https://voxxyai.com/api` (keeps `/api`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/presents/events/:slug/registrations` | List event registrations | ✅ Yes (owner) |
| POST | `/v1/presents/events/:slug/registrations` | Create registration (vendor submit) | ❌ Public |
| GET | `/v1/presents/registrations/:id` | Get registration by ID | ✅ Yes (owner/submitter) |
| PATCH | `/v1/presents/registrations/:id` | Update registration (syncs with Network CRM) | ✅ Yes (owner) |
| GET | `/v1/presents/registrations/track/:ticket_code` | Track by ticket code | ❌ Public |
| GET | `/v1/presents/registrations/:id/email_history` | Get all email deliveries | ✅ Yes (owner) |

**Update Parameters (PATCH):**
- `name` - Vendor contact name (syncs to Network)
- `phone` - Vendor phone number (syncs to Network)
- `status` - Application status (pending, approved, rejected, waitlist)
- `vendor_category` - Vendor category/type
- `payment_status` - Payment status (pending, paid, confirmed, overdue)
- `location` - Vendor location (syncs to Network)
- `producer_notes` - Internal producer notes (syncs to Network)
- `tags` - Array of tags for categorization (syncs to Network)

**Bidirectional Sync Behavior:**
When you update `name`, `phone`, `location`, `producer_notes`, or `tags` on a registration, these changes automatically sync back to the vendor's Network CRM contact record. This keeps event-specific and global vendor data in sync.

---

## Authentication

### JWT Token Management

The application uses Rails JWT authentication:

```javascript
// Token storage
localStorage.setItem('railsAuthToken', token)

// Token retrieval
const token = localStorage.getItem('railsAuthToken')

// Authentication header
headers['Authorization'] = `Bearer ${token}`
```

### Public Endpoints (No Auth Required)

- `POST /login`
- `POST /users` (signup)
- `POST /password_reset`
- `PATCH /password_reset`
- `POST /verify_code`
- `POST /resend_verification`
- `GET /v1/presents/vendor_applications/lookup/:code`
- `POST /v1/presents/events/:slug/registrations` (vendor applications)
- `GET /v1/presents/registrations/track/:ticket_code`

---

## Environment Detection

The application automatically detects the environment based on the hostname:

```javascript
// From src/config/environments.ts

if (hostname === 'localhost' || hostname === '127.0.0.1') {
  environment = 'development'
} else if (hostname.includes('onrender.com') || hostname.includes('staging')) {
  environment = 'staging'
} else {
  environment = 'production'
}
```

### Manual Override

You can override environment detection using the `VITE_ENVIRONMENT` variable:

```bash
VITE_ENVIRONMENT=staging
```

---

## Configuration Files

### Environment Variables

- `.env.development` - Local development configuration
- `.env.staging` - Staging deployment configuration
- `.env.production` - Production deployment configuration

### TypeScript Configuration

- `src/config/environments.ts` - Environment detection and configuration
- `src/services/api.ts` - API service implementation

---

## Example Usage

### Login Request

```javascript
// Development
POST https://voxxyai.com/login
Headers: { "X-Mobile-App": "true" }  // Required for JWT response
{
  "email": "user@example.com",
  "password": "password123",
  "product": "presents"
}

// Production
POST https://heyvoxxy.com/login
Headers: { "X-Mobile-App": "true" }  // Required for JWT response
{
  "email": "user@example.com",
  "password": "password123",
  "product": "presents"
}
```

### Create Organization

```javascript
// Development
POST https://voxxyai.com/api/v1/presents/organizations
Headers: { Authorization: "Bearer <token>" }
{
  "organization": {
    "name": "My Venue",
    "description": "Event production and venue management"
  }
}

// Production
POST https://heyvoxxy.com/api/v1/presents/organizations
Headers: { Authorization: "Bearer <token>" }
{
  "organization": {
    "name": "My Venue",
    "description": "Event production and venue management"
  }
}
```

### Get Events for Organization

```javascript
// Development
GET https://voxxyai.com/api/v1/presents/organizations/my-venue/events
Headers: { Authorization: "Bearer <token>" }

// Production
GET https://heyvoxxy.com/api/v1/presents/organizations/my-venue/events
Headers: { Authorization: "Bearer <token>" }
```

---

## Error Handling

All API errors follow this structure:

```javascript
{
  "error": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"],
  "status": 422
}
```

The `ApiError` class provides structured error information:

```javascript
class ApiError extends Error {
  status: number
  errors?: string[]
}
```

---

## Migration Notes

### From Google Cloud Run to Custom Domains

**Previous URLs:**
- Development: `http://localhost:3001/api`
- Staging: `https://voxxy-presents-api-dlr7d5geuq-uc.a.run.app/api`
- Production: `https://voxxy-presents-api-dlr7d5geuq-uc.a.run.app/api`

**Current URLs:**
- Development: `https://voxxyai.com/api`
- Staging: `https://voxxyai.com/api`
- Production: `https://heyvoxxy.com/api`

### Breaking Changes

None - all routes remain the same, only the base URL changed.

---

## Troubleshooting

### API Not Responding

1. Check environment detection:
   ```javascript
   console.log(window.location.hostname)
   ```

2. Check API base URL:
   ```javascript
   console.log(getApiUrl())
   ```

3. Check authentication token:
   ```javascript
   console.log(localStorage.getItem('railsAuthToken'))
   ```

### CORS Issues

Ensure the Rails backend allows requests from the frontend domain:

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'localhost:5173', 'voxxyai.com', 'heyvoxxy.com'
    resource '*', headers: :any, methods: [:get, :post, :put, :patch, :delete, :options]
  end
end
```

---

## Additional Resources

- [Rails API Documentation](../voxxy-rails/config/routes.rb)
- [Frontend API Service](./src/services/api.ts)
- [Environment Configuration](./src/config/environments.ts)
- [Vendor CRM Bidirectional Sync](./VENDOR_CRM_BIDIRECTIONAL_SYNC.md) - Complete sync architecture

---

**Last Updated:** 2026-05-04
**Version:** 2.2.0 (Added CRM Bidirectional Sync)
