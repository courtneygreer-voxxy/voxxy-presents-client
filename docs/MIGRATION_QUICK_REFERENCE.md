# Frontend to Rails API - Migration Quick Reference

## Critical Information at a Glance

### Authentication Changes

```
BEFORE (Firebase):
- signInWithEmailAndPassword(auth, email, password)
- ID tokens auto-managed, 1-hour refresh
- User data from Firestore

AFTER (Rails API):
- POST /api/v1/shared/login {email, password}
- JWT token returned in response (24 hours)
- User data from Rails API in same login response
- Must store token and send in every request header
```

### Token Management

```
Storage: localStorage under key 'railsAuthToken'
Header: Authorization: Bearer <token>
Expiration: 24 hours (automatic re-login required)
Refresh: No refresh token - user must log in again

BEFORE logout:
1. Call DELETE /api/v1/shared/logout
2. Clear localStorage['railsAuthToken']
3. Redirect to login page
```

### API Endpoint Mapping

| Feature | Current | New |
|---------|---------|-----|
| Login | signIn() | POST /api/v1/shared/login |
| Logout | signOut() | DELETE /api/v1/shared/logout |
| Current User | getAuth().currentUser | GET /api/v1/shared/me |
| Create User | createUserWithEmailAndPassword() | POST /api/v1/shared/users |
| Update User | updateProfile() | PATCH /api/v1/shared/users/:id |
| Password Reset | sendPasswordResetEmail() | POST /api/v1/shared/password_reset |
| List Organizations | query('organizations') | GET /api/v1/presents/organizations |
| Create Organization | setDoc() | POST /api/v1/presents/organizations |
| Update Organization | updateDoc() | PATCH /api/v1/presents/organizations/:id |
| Delete Organization | deleteDoc() | DELETE /api/v1/presents/organizations/:id |
| List Events | query('events') | GET /api/v1/presents/events |
| Create Event | setDoc() | POST /api/v1/presents/organizations/:id/events |
| List Vendors | query('vendors') | GET /api/v1/presents/vendors |
| Search Vendors | query + filters | GET /api/v1/presents/vendors/search?query=...&city=...&state=... |
| Create Vendor | setDoc() | POST /api/v1/presents/vendors |
| Create Registration | setDoc() | POST /api/v1/presents/events/:id/registrations |

### API Response Structure

```
LOGIN Response:
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "role": "consumer|vendor|venue_owner|admin",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "confirmed_at": "2024-01-01T00:00:00Z",
  ... (additional user fields)
}

VENDOR Response:
{
  "id": 1,
  "name": "Vendor Name",
  "slug": "vendor-name",
  "vendor_type": "venue|catering|entertainment|market_vendor",
  "description": "...",
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "contact": {
    "email": "contact@vendor.com",
    "phone": "+1234567890",
    "website": "https://vendor.com",
    "instagram": "@vendor"
  },
  "services": { ... },
  "pricing": { ... },
  "stats": {
    "rating": 4.5,
    "views_count": 100,
    "verified": true,
    "active": true
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}

ERROR Response:
{
  "error": "Not authorized" | "Resource not found" | "Descriptive message",
  "errors": ["Field error 1", "Field error 2"] // for validation errors
}
```

### Required Header

Every authenticated request needs:
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Role System

```
Roles available:
- consumer: Mobile app users (default)
- vendor: Vendors/service providers
- venue_owner: Organization/venue owners
- admin: Admin users

Access your role:
const { userProfile } = useAuth()
userProfile?.role  // Returns role string

Helper methods in AuthContext:
- isVendor: boolean
- isProducer: boolean (organizer/club_owner/venue_owner)
- isGuest: boolean (consumer/user)
- isAdmin: boolean
- hasRole(role): boolean
```

### Key Endpoints Reference

```
# Authentication
POST   /api/v1/shared/login
DELETE /api/v1/shared/logout
GET    /api/v1/shared/me

# Organizations
GET    /api/v1/presents/organizations
POST   /api/v1/presents/organizations
GET    /api/v1/presents/organizations/:id
PATCH  /api/v1/presents/organizations/:id
DELETE /api/v1/presents/organizations/:id

# Events
GET    /api/v1/presents/events
POST   /api/v1/presents/organizations/:org_id/events
GET    /api/v1/presents/events/:id
PATCH  /api/v1/presents/events/:id
DELETE /api/v1/presents/events/:id

# Vendors
GET    /api/v1/presents/vendors
GET    /api/v1/presents/vendors/search
POST   /api/v1/presents/vendors
GET    /api/v1/presents/vendors/:id
PATCH  /api/v1/presents/vendors/:id
DELETE /api/v1/presents/vendors/:id

# Registrations
POST   /api/v1/presents/events/:id/registrations
GET    /api/v1/presents/registrations/:id
PATCH  /api/v1/presents/registrations/:id

# Budgets
GET    /api/v1/presents/budgets
POST   /api/v1/presents/organizations/:org_id/budgets
POST   /api/v1/presents/events/:id/budgets
GET    /api/v1/presents/budgets/:id
PATCH  /api/v1/presents/budgets/:id
DELETE /api/v1/presents/budgets/:id
```

### HTTP Status Codes to Handle

```
200 OK - Success
201 Created - Resource created
204 No Content - Deleted successfully
400 Bad Request - Invalid parameters
401 Unauthorized - Must log in
403 Forbidden - Access denied (wrong role/ownership)
404 Not Found - Resource doesn't exist
422 Unprocessable Entity - Validation failed
429 Too Many Requests - Rate limited
```

### Rate Limiting

```
General API: 300 requests/hour per IP
Authenticated: 500 requests/hour per user
Login attempts: 10 per 15 minutes (brute force protection)

If rate limited:
- Receives 429 status code
- Headers: X-RateLimit-Remaining: 0, Retry-After: <seconds>
- Must wait before retrying
```

### Local Development Setup

```bash
# Backend (voxxy-rails)
cd /path/to/voxxy-rails
bundle install
rails db:create db:migrate
redis-server  # in another terminal
rails s -p 3001

# Frontend (voxxy-presents-client)
cd /path/to/voxxy-presents-client
npm install
VITE_API_BASE_URL=http://localhost:3001/api npm run dev
```

### Environment Variables

```
Frontend (.env.development):
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ADMIN_API_KEY=<optional-for-admin-endpoints>

Backend (.env):
RAILS_ENV=development
DATABASE_URL=postgres://...
REDIS_URL=redis://localhost:6379/1
JWT_EXPIRATION=24.hours
```

### Error Handling Changes

```
BEFORE (Firebase):
catch (err) {
  if (err.code === 'auth/user-not-found') { ... }
  if (err.code === 'auth/wrong-password') { ... }
}

AFTER (Rails):
catch (err) {
  if (err.status === 401) { /* Unauthorized */ }
  if (err.status === 403) { /* Forbidden */ }
  if (err.status === 404) { /* Not found */ }
  if (err.status === 422) { /* Validation failed */ }
  // Check err.errors array for detailed validation messages
}
```

### Testing API Calls with cURL

```bash
# Login
curl -X POST http://localhost:3001/api/v1/shared/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Get current user (with token)
curl -X GET http://localhost:3001/api/v1/shared/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# List vendors
curl -X GET "http://localhost:3001/api/v1/presents/vendors" \
  -H "Authorization: Bearer <token>"

# Search vendors
curl -X GET "http://localhost:3001/api/v1/presents/vendors/search?query=cafe&city=San+Francisco&state=CA" \
  -H "Authorization: Bearer <token>"

# Create vendor (vendor role required)
curl -X POST http://localhost:3001/api/v1/presents/vendors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": {
      "name": "My Vendor",
      "vendor_type": "venue",
      "description": "A great venue",
      "city": "San Francisco",
      "state": "CA"
    }
  }'
```

### Common Issues & Solutions

```
Issue: 401 Unauthorized
Solution: Check token is being sent in Authorization header
          Check token hasn't expired (24 hours)
          Try logging in again

Issue: 403 Forbidden
Solution: Check user has correct role
          Check user owns the resource (for update/delete)

Issue: 404 Not Found
Solution: Verify slug or ID is correct
          Check resource hasn't been deleted

Issue: 422 Unprocessable Entity
Solution: Check response.errors array for validation messages
          Verify all required fields are provided
          Check field formats (email, dates, numbers)

Issue: 429 Too Many Requests
Solution: Wait the number of seconds in Retry-After header
          Implement exponential backoff for retries
```

### File Organization for Migration

```
Frontend Project:
├── src/
│   ├── services/
│   │   ├── authService.ts       → Update for Rails JWT
│   │   ├── api.ts               → Add Bearer token header
│   │   └── railsApiClient.ts    → NEW: Rails-specific client
│   ├── contexts/
│   │   └── AuthContext.tsx       → Update to use Rails endpoints
│   ├── lib/
│   │   └── railsAuth.ts         → NEW: JWT token management
│   ├── hooks/
│   │   └── useRailsApi.ts       → NEW: API call wrapper
│   └── pages/
│       ├── login/               → Update login logic
│       ├── organizations/       → Update for new endpoints
│       ├── vendors/             → Update for new endpoints
│       └── events/              → Update for new endpoints
```

### Links to Detailed Documentation

- Full API Analysis: `/docs/RAILS_BACKEND_API_ANALYSIS.md`
- Backend Code: `/path/to/voxxy-rails/docs/RAILS_API_COMPREHENSIVE_ANALYSIS.md`
- Rails Routes: `/path/to/voxxy-rails/config/routes.rb`
- Serializers: `/path/to/voxxy-rails/app/serializers/api/v1/presents/`

