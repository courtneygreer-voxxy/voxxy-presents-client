# Voxxy Presents API Configuration

## Overview

The Voxxy Presents client application connects to a Rails backend API that supports both legacy routes (for backward compatibility) and new versioned API routes.

---

## Environment URLs

### Development
```
Base URL: https://voxxyai.com/api
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
Base URL: https://voxxyai.com/api
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

### 1. Legacy Routes (Backward Compatibility)

These routes **strip** `/api` from the base URL:

```javascript
// Implementation in api.ts
fetch(`${API_BASE_URL.replace('/api', '')}/login`)
```

**Examples:**
- `POST /login` → `https://voxxyai.com/login`
- `GET /me` → `https://voxxyai.com/me`
- `POST /users` → `https://voxxyai.com/users`
- `DELETE /logout` → `https://voxxyai.com/logout`
- `POST /verify_code` → `https://voxxyai.com/verify_code`
- `POST /password_reset` → `https://voxxyai.com/password_reset`

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

## Key API Endpoints

### Authentication (Legacy Routes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login with email/password |
| DELETE | `/logout` | User logout |
| GET | `/me` | Get current user profile |
| POST | `/users` | Create new user account |
| PATCH | `/users/:id` | Update user profile |
| POST | `/verify_code` | Verify email with code |
| POST | `/resend_verification` | Resend verification email |
| POST | `/password_reset` | Request password reset |
| PATCH | `/password_reset` | Reset password with token |

### Organizations (Versioned Routes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/presents/organizations` | List all organizations |
| GET | `/v1/presents/organizations/:slug` | Get organization by slug |
| POST | `/v1/presents/organizations` | Create new organization |
| PATCH | `/v1/presents/organizations/:slug` | Update organization |
| DELETE | `/v1/presents/organizations/:slug` | Delete organization |

### Events (Versioned Routes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/presents/events` | List all events |
| GET | `/v1/presents/events/:slug` | Get event by slug |
| GET | `/v1/presents/organizations/:slug/events` | List organization's events |
| POST | `/v1/presents/organizations/:slug/events` | Create event for organization |
| PATCH | `/v1/presents/events/:slug` | Update event |
| DELETE | `/v1/presents/events/:slug` | Delete event |

### Vendor Applications (Versioned Routes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/presents/events/:slug/vendor_applications` | List event's vendor applications |
| POST | `/v1/presents/events/:slug/vendor_applications` | Create vendor application |
| GET | `/v1/presents/vendor_applications/:id` | Get application by ID |
| PATCH | `/v1/presents/vendor_applications/:id` | Update application |
| DELETE | `/v1/presents/vendor_applications/:id` | Delete application |
| GET | `/v1/presents/vendor_applications/:id/submissions` | Get application submissions |
| GET | `/v1/presents/vendor_applications/lookup/:code` | Lookup by shareable code (public) |

### Registrations (Versioned Routes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/presents/events/:slug/registrations` | List event registrations |
| POST | `/v1/presents/events/:slug/registrations` | Create registration (public) |
| GET | `/v1/presents/registrations/:id` | Get registration by ID |
| PATCH | `/v1/presents/registrations/:id` | Update registration status |
| GET | `/v1/presents/registrations/track/:ticket_code` | Track by ticket code (public) |

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
{
  "email": "user@example.com",
  "password": "password123",
  "product": "presents"
}

// Production
POST https://heyvoxxy.com/login
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

---

**Last Updated:** 2025-01-19
**Version:** 2.0.0 (Custom Domain Migration)
