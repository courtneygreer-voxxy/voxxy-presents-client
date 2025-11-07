# Rails Backend API Analysis - Frontend Migration Guide

## Overview

The Ruby on Rails backend (voxxy-rails) is a comprehensive API supporting two product lines: **Voxxy Mobile** (activity planning) and **Voxxy Presents** (event management & vendor marketplace). This document provides a complete technical analysis for frontend migration planning.

---

## 1. AUTHENTICATION SYSTEM

### Current Implementation

**System Used:** Hybrid JWT + Session Cookies

**Key Files:**
- `/app/controllers/concerns/json_web_token.rb` - JWT encoding/decoding
- `/app/controllers/sessions_controller.rb` - Login/logout
- `/app/models/user.rb` - User model with password security

### JWT Implementation Details

```ruby
# JWT Configuration (from json_web_token.rb)
SECRET_KEY = Rails.application.credentials.secret_key_base

def self.encode(payload, exp = 24.hours.from_now)
  payload[:exp] = exp.to_i
  JWT.encode(payload, SECRET_KEY)
end

def self.decode(token)
  body = JWT.decode(token, SECRET_KEY)[0]
  HashWithIndifferentAccess.new(body)
rescue
  nil
end
```

**Expiration:** 24 hours from creation
**Secret:** Rails.application.credentials.secret_key_base
**Algorithm:** HS256 (default)
**Gem Used:** `jwt` gem (version ~> 3.0)

### Authentication Flow

1. **Login Endpoint:** `POST /login` or `POST /api/v1/shared/login`
   ```
   Request:
   {
     "email": "user@example.com",
     "password": "password123"
   }
   
   Response (Mobile - with X-Mobile-App: true header):
   {
     "id": 123,
     "name": "John Doe",
     "email": "user@example.com",
     "token": "eyJhbGciOiJIUzI1NiJ9...",
     "role": "consumer",
     ... (full user dashboard data)
   }
   ```

2. **Session-Based Auth (Web Clients)**
   - Session stored in cookie with `_session_id` key
   - SameSite: lax (development), none (production)
   - Secure: false (dev), true (production)

3. **Token-Based Auth (Mobile Clients)**
   - X-Mobile-App: "true" header triggers JWT response
   - Token sent in `Authorization: Bearer <token>` header
   - Token valid for 24 hours

### User Model Fields

**Critical Auth Fields:**
```
- id (PK)
- email (unique, required)
- password_digest (bcrypt hashed via has_secure_password)
- confirmation_code (6-digit OTP)
- confirmed_at (email verification timestamp)
- reset_password_token (for password resets)
- reset_password_sent_at
- status (active|suspended|banned)
- suspended_until (datetime)
- ban_reason, suspension_reason (text)
- admin (boolean)
- role (consumer|venue_owner|vendor|admin)
```

### Authorization Enforcement

**Location:** `ApplicationController` (lines 12-22)

```ruby
def authorized
  if request.headers["Authorization"].present?
    token = request.headers["Authorization"].split(" ").last
    decoded = JsonWebToken.decode(token)
    @current_user = User.find_by(id: decoded[:user_id]) if decoded
  else
    @current_user = User.find_by(id: session[:user_id])
  end

  render json: { error: "Not authorized" }, status: :unauthorized unless @current_user
end
```

**Current User Access:** `current_user` method or `@current_user` instance variable

### Password Security

- **Algorithm:** bcrypt via `has_secure_password`
- **Min Length:** 6 characters
- **Hash:** 10 rounds (Rails default)

### Token Refresh Mechanism

**Status:** None implemented
- Tokens expire after 24 hours
- Client must log in again
- No refresh token pattern

---

## 2. API STRUCTURE

### Namespace Organization

```
/api/v1/
├── /shared/*         # Cross-product endpoints (auth, users, notifications)
├── /mobile/*         # Voxxy Mobile app (activities, participants, responses)
└── /presents/*       # Voxxy Presents (organizations, events, vendors, budgets)
```

### Legacy Routes (Backward Compatibility)

```
/ (root namespace)
├── POST /login       → SessionsController#create
├── DELETE /logout    → SessionsController#destroy
├── GET /me          → UsersController#show
├── /users/*         → UsersController (CRUD)
└── ... 50+ legacy endpoints
```

### RESTful Patterns

All API endpoints follow standard REST conventions:

```
GET    /api/v1/presents/vendors           → List vendors
POST   /api/v1/presents/vendors           → Create vendor
GET    /api/v1/presents/vendors/:id       → Get vendor detail
PATCH  /api/v1/presents/vendors/:id       → Update vendor
DELETE /api/v1/presents/vendors/:id       → Delete vendor
GET    /api/v1/presents/vendors/search    → Search vendors (custom action)
```

### Complete API Endpoints by Feature

#### Authentication (Shared)
```
POST   /api/v1/shared/login                           - Login
DELETE /api/v1/shared/logout                          - Logout
GET    /api/v1/shared/me                              - Current user profile
```

#### User Management (Shared)
```
POST   /api/v1/shared/users                           - Register
SHOW   /api/v1/shared/users/:id                       - Get user
PATCH  /api/v1/shared/users/:id                       - Update user
POST   /api/v1/shared/users/:id/verify_email          - Verify email
POST   /api/v1/shared/users/:id/resend_verification   - Resend verification
POST   /api/v1/shared/users/:id/update_push_token     - Update push token
GET    /api/v1/shared/users/:id/push_token_status     - Check push token
POST   /api/v1/shared/users/:id/block                 - Block user
DELETE /api/v1/shared/users/:id/unblock               - Unblock user
GET    /api/v1/shared/users/blocked                   - List blocked users
```

#### Password Reset (Shared)
```
POST   /api/v1/shared/password_reset                  - Create reset request
PATCH  /api/v1/shared/password_reset                  - Confirm reset
```

#### Organizations (Presents)
```
GET    /api/v1/presents/organizations                 - List all organizations
GET    /api/v1/presents/organizations/:id             - Get organization detail
POST   /api/v1/presents/organizations                 - Create organization (venue owner only)
PATCH  /api/v1/presents/organizations/:id             - Update organization (owner only)
DELETE /api/v1/presents/organizations/:id             - Delete organization (owner only)
```

#### Events (Presents)
```
GET    /api/v1/presents/events                        - List events
GET    /api/v1/presents/events/:id                    - Get event detail
POST   /api/v1/presents/organizations/:org_id/events  - Create event (owner only)
PATCH  /api/v1/presents/events/:id                    - Update event (owner only)
DELETE /api/v1/presents/events/:id                    - Delete event (owner only)
```

#### Vendors (Presents)
```
GET    /api/v1/presents/vendors                       - List vendors
GET    /api/v1/presents/vendors/:id                   - Get vendor detail
GET    /api/v1/presents/vendors/search?query=...      - Search vendors
POST   /api/v1/presents/vendors                       - Create vendor (vendor only)
PATCH  /api/v1/presents/vendors/:id                   - Update vendor (owner only)
DELETE /api/v1/presents/vendors/:id                   - Delete vendor (owner only)
```

#### Registrations (Presents)
```
GET    /api/v1/presents/events/:event_id/registrations      - List registrations (admin only)
POST   /api/v1/presents/events/:event_id/registrations      - Register for event (public)
GET    /api/v1/presents/registrations/:id                   - Get registration detail
PATCH  /api/v1/presents/registrations/:id                   - Update registration
```

#### Budgets (Presents)
```
GET    /api/v1/presents/budgets                             - List user budgets
GET    /api/v1/presents/budgets/:id                         - Get budget detail
POST   /api/v1/presents/organizations/:org_id/budgets       - Create budget
POST   /api/v1/presents/events/:event_id/budgets            - Create budget for event
PATCH  /api/v1/presents/budgets/:id                         - Update budget
DELETE /api/v1/presents/budgets/:id                         - Delete budget

Budget Line Items:
GET    /api/v1/presents/budgets/:budget_id/budget_line_items
POST   /api/v1/presents/budgets/:budget_id/budget_line_items
PATCH  /api/v1/presents/budgets/:budget_id/budget_line_items/:id
DELETE /api/v1/presents/budgets/:budget_id/budget_line_items/:id
```

#### Notifications (Shared)
```
GET    /api/v1/shared/notifications                   - List notifications
GET    /api/v1/shared/notifications/:id               - Get notification
PUT    /api/v1/shared/notifications/:id/mark_as_read  - Mark read
PUT    /api/v1/shared/notifications/mark_all_as_read  - Mark all read
```

#### Analytics (Shared)
```
POST   /api/v1/shared/analytics/track                 - Track event
POST   /api/v1/shared/analytics/identify              - Identify user
POST   /api/v1/shared/analytics/page_view             - Track page view
```

### Request/Response Format

**Standard Success Response:**
```json
{
  "id": 1,
  "name": "Test Vendor",
  "slug": "test-vendor",
  "vendor_type": "venue",
  "contact": {
    "email": "contact@vendor.com",
    "phone": "+1234567890",
    "website": "https://vendor.com",
    "instagram": "@vendor"
  },
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "latitude": 37.7749,
    "longitude": -122.4194
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
```

**Standard Error Response:**
```json
{
  "error": "Descriptive error message",
  "status": "unprocessable_entity" | "unauthorized" | "forbidden" | "not_found"
}
```

**Validation Error Response:**
```json
{
  "errors": [
    "Name can't be blank",
    "Email is invalid"
  ]
}
```

**HTTP Status Codes Used:**
- 200 OK - Successful retrieval
- 201 Created - Resource created
- 204 No Content - Successful delete
- 400 Bad Request - Invalid parameters
- 401 Unauthorized - Authentication required
- 403 Forbidden - Access denied
- 404 Not Found - Resource not found
- 422 Unprocessable Entity - Validation failed
- 429 Too Many Requests - Rate limited

---

## 3. DATA MODELS & RELATIONSHIPS

### User Model

```
User
├── has_many :organizations (Presents)
├── has_many :vendors (Presents)
├── has_many :budgets
├── has_many :activities (Mobile)
├── has_many :activity_participants
├── has_many :comments
├── has_many :votes
└── ... (20+ associations)
```

**Key Fields:**
```
- id, email, password_digest, username
- name, avatar, profile_pic
- status (active|suspended|banned)
- role (consumer|venue_owner|vendor|admin)
- product_context (mobile|presents|both)
- location: city, state, neighborhood, latitude, longitude
- notification_settings: text_notifications, email_notifications, push_notifications, push_token
- policy_acceptance: terms_accepted_at, privacy_policy_accepted_at, community_guidelines_accepted_at
- moderation: suspended_until, suspension_reason, banned_at, ban_reason, warnings_count
```

### Organization Model (Presents)

```
Organization (Venue/Club)
├── belongs_to :user
├── has_many :events
└── has_many :budgets (as: :budgetable)
```

**Fields:**
```
- id, user_id, name, slug (unique)
- description, logo_url, website, instagram_handle
- contact: email, phone
- location: address, city, state, zip_code, latitude, longitude
- verification: verified (boolean), active (boolean)
- timestamps
```

### Event Model (Presents)

```
Event
├── belongs_to :organization
├── has_many :registrations
└── has_one :budget (as: :budgetable)
```

**Fields:**
```
- id, organization_id, title, slug (unique)
- description, event_date, event_end_date, location
- media: poster_url, ticket_url
- pricing: ticket_price
- capacity: capacity, registered_count
- status: published (boolean), registration_open (boolean), status (enum)
- timestamps
```

### Vendor Model (Presents)

```
Vendor
├── belongs_to :user
└── has_many :budget_line_items
```

**Fields:**
```
- id, user_id, name, slug (unique)
- vendor_type (venue|catering|entertainment|market_vendor)
- description, logo_url, banner_url, website, instagram_handle
- contact: contact_email, phone
- location: address, city, state, zip_code, latitude, longitude
- services (JSON), pricing (JSON)
- stats: rating, views_count, verified, active
- timestamps
```

### Registration Model (Presents)

```
Registration
├── belongs_to :event (with counter_cache)
└── belongs_to :user (optional)
```

**Fields:**
```
- id, event_id, user_id (optional for public registrations)
- email (required), name, phone
- ticket_code (unique), qr_code_url
- status (pending|confirmed|cancelled)
- checked_in (boolean), checked_in_at
- subscribed (boolean)
- timestamps
```

### Budget & BudgetLineItem Models

```
Budget
├── belongs_to :budgetable (polymorphic: Event or Organization)
├── belongs_to :user
└── has_many :budget_line_items
```

**Budget Fields:**
```
- id, budgetable_type, budgetable_id, user_id
- title, total_amount, spent_amount
- status (draft|active|completed)
```

**BudgetLineItem Fields:**
```
- id, budget_id, name, category
- budgeted_amount, actual_amount
- vendor_id (optional), notes
```

### Activity Models (Mobile)

```
Activity
├── belongs_to :user
├── has_many :activity_participants
├── has_many :responses
├── has_many :comments
├── has_many :pinned_activities
└── has_many :time_slots

TimeSlot
├── belongs_to :activity
├── has_many :votes (has_many :time_slot_votes)
└── recommendations (JSON)

PinnedActivity
├── belongs_to :activity
├── has_many :votes
├── has_many :comments
└── has_many :voters (through: :votes)
```

---

## 4. CONTROLLERS & MIDDLEWARE

### Controller Hierarchy

```
ApplicationController (base)
├── Authorization logic (JWT + session)
├── current_user method
└── Response handling

Api::V1::Presents::BaseController (Presents API)
├── check_presents_access (middleware)
├── require_venue_owner
└── require_vendor

Other Controllers:
├── Api::V1::Presents::OrganizationsController
├── Api::V1::Presents::EventsController
├── Api::V1::Presents::VendorsController
├── Api::V1::Presents::RegistrationsController
├── Api::V1::Presents::BudgetsController
└── ... and legacy controllers
```

### Authentication Middleware

**File:** `ApplicationController#authorized` (before_action)

```ruby
before_action :authorized
skip_before_action :authorized, only: [:create, :login_view] # Skip for public actions
```

**Role-based Checks:**
```ruby
# In BaseController
def require_venue_owner
  unless @current_user.venue_owner? || @current_user.admin?
    render json: { error: "Venue owner access required" }, status: :forbidden
  end
end

def require_vendor
  unless @current_user.vendor? || @current_user.admin?
    render json: { error: "Vendor access required" }, status: :forbidden
  end
end
```

### Response Formatting Pattern

**Using Serializers (Custom Pattern):**
```ruby
# Controllers use custom serializers, not ActiveModel::Serializer
class Api::V1::Presents::VendorSerializer
  def initialize(vendor, options = {})
    @vendor = vendor
    @include_owner = options[:include_owner] || false
  end

  def as_json
    {
      id: @vendor.id,
      name: @vendor.name,
      # ... field mappings
    }.tap do |json|
      json[:owner] = owner_json if @include_owner
    end
  end
end

# In controller:
def show
  vendor = Vendor.find_by!(slug: params[:id])
  serialized = VendorSerializer.new(vendor, include_owner: true).as_json
  render json: serialized, status: :ok
end
```

### Error Handling Pattern

**Standard Error Responses:**
```ruby
# Validation errors
render json: { errors: resource.errors.full_messages }, 
       status: :unprocessable_entity

# Not found
render json: { error: "Resource not found" }, status: :not_found

# Forbidden (access denied)
render json: { error: "Not authorized" }, status: :forbidden

# Unauthorized (auth required)
render json: { error: "Not authorized" }, status: :unauthorized
```

---

## 5. MOBILE APP INTEGRATION

### Current Mobile Authentication

**From SessionsController#create:**
```ruby
def mobile_app_request?
  request.headers["X-Mobile-App"] == "true"
end

# Conditional response based on client type
if mobile_app_request?
  token = JsonWebToken.encode(user_id: user.id)
  render json: payload.merge("token" => token)
else
  render json: payload # Session-based
end
```

### Required Headers for Mobile

```
GET /api/v1/shared/me
Authorization: Bearer <jwt_token>
X-Mobile-App: true
Content-Type: application/json
```

### Mobile Dashboard Response Example

```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "consumer",
  "confirmed_at": "2024-01-01T00:00:00Z",
  "admin": false,
  "preferences": "...",
  "favorite_food": "Italian",
  "bar_preferences": "cocktails",
  "notification_settings": { ... },
  "policy_acceptance": { ... },
  "activities": [ ... ],
  "participant_activities": [ ... ]
}
```

### Push Token Management

```
POST /api/v1/shared/users/:id/update_push_token
{
  "push_token": "ExponentPushToken[...]",
  "platform": "ios" | "android"
}
```

---

## 6. CONFIGURATION & CORS

### CORS Setup

**File:** `/config/application.rb`

```ruby
allowed_origins = [
  "http://localhost:3000",
  "https://www.voxxyai.com",
  "https://hey-voxxy.onrender.com",
  "https://heyvoxxy.com",
  "https://www.heyvoxxy.com",
  "http://192.168.1.123:8081",  # mobile dev
  "null"  # React Native
]

config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)
    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ["Access-Control-Allow-Origin"]
  end
end
```

**Credentials:** `credentials: true` enables cookies in CORS requests

### Rate Limiting

**File:** `/config/initializers/rack_attack.rb`

```ruby
# API rate limiting: 300 requests/hour per IP
throttle("api/ip", limit: 300, period: 1.hour) { |req| req.ip if req.path.start_with?("/api/") }

# Authenticated user: 500 requests/hour
throttle("api/user", limit: 500, period: 1.hour) { |req| user_id if req.path.start_with?("/api/") && authenticated? }

# Login attempts: 10 per IP / 15 minutes (brute force prevention)
throttle("login/ip", limit: 10, period: 15.minutes) { |req| req.ip if req.path == "/login" && req.post? }

# OpenAI calls: 50 per IP / hour (cost control)
throttle("openai/ip", limit: 50, period: 1.hour) { |req| req.ip if req.path.include?("openai") }

# Admin users are exempt from rate limiting
```

### Environment Configuration

**Database:** PostgreSQL
**Redis:** Used for:
- Rate limiting cache
- Session storage (optional)
- Job queue (Sidekiq)

**External Services:**
- SendGrid (email)
- OpenAI (recommendations)
- Google Places API (location search)
- AWS S3 (file storage)

---

## 7. KEY DIFFERENCES FROM CURRENT FRONTEND

### Current Frontend Setup (Firebase + Hybrid)

```
├── Firebase Authentication
│   ├── Email/password auth
│   ├── Session persistence
│   └── Custom token generation
├── Firestore Database
│   └── Real-time data sync
├── REST API (Mixed)
│   ├── Custom endpoints
│   ├── Firebase ID tokens
│   └── Admin keys for endpoints
└── Custom Services
    ├── authService (Firebase)
    ├── api.ts (custom HTTP client)
    └── Caching layer (localStorage)
```

### Fundamental Differences for Rails Migration

| Aspect | Current (Firebase) | Rails API |
|--------|-------------------|-----------|
| **Auth** | Firebase ID tokens | JWT (24h) + Sessions |
| **Token Lifespan** | 1 hour (with refresh) | 24 hours (no refresh) |
| **Session** | Firebase managed | Rails cookie-based |
| **User Profile** | Firestore document | PostgreSQL user record |
| **API Namespacing** | Mixed paths | `/api/v1/(shared|mobile|presents)` |
| **Authorization** | Before-filter in controllers | `@current_user` from ApplicationController |
| **Error Handling** | Field-level validation | HTTP status codes |
| **Caching** | Firestore realtime | Redis (configurable) |
| **File Storage** | Firebase Storage | AWS S3 via Active Storage |
| **Background Jobs** | Cloud Functions | Sidekiq |
| **Database** | Firestore NoSQL | PostgreSQL |

### Required Client Changes

1. **Authentication Flow**
   - Replace Firebase Auth with Rails JWT
   - Use `POST /api/v1/shared/login` instead of Firebase
   - Store JWT token instead of Firebase ID token
   - Add token to every request header

2. **Data Fetching**
   - Add `Authorization: Bearer <token>` header
   - Update API endpoints to `/api/v1/` paths
   - Expect different response structures

3. **User Management**
   - Rails returns full user object in login response
   - Email verification via 6-digit OTP (not Firebase link)
   - Password reset via token (not Firebase)

4. **Role System Migration**
   - Firebase: Custom claims in token
   - Rails: `user.role` field + helper methods

---

## 8. SECURITY CONSIDERATIONS

### Authentication Security

- **Password Hashing:** bcrypt with 10 rounds
- **JWT Secret:** Rails.application.credentials.secret_key_base
- **Token Expiration:** 24 hours (no refresh token)
- **Session Security:** SameSite=lax/none, Secure in prod

### Authorization Security

- **Role-based Access:** `require_venue_owner`, `require_vendor`, `require_admin`
- **Ownership Checks:** Controllers verify user owns resource before modify/delete
- **Public Resources:** Events, organizations, vendors publicly readable

### Rate Limiting

- General API: 300 req/hour (IP)
- Authenticated: 500 req/hour (user)
- Login: 10 attempts/15 min (brute force protection)
- OpenAI calls: 50/hour (cost control)

### Data Validation

- Email format validation
- Slug uniqueness
- Enum validation for types/statuses
- Required field validation

---

## 9. API VERSIONING & MIGRATION PATH

### Current Version Strategy

- **v1:** Current (includes legacy routes for backward compatibility)
- Legacy routes: Direct paths (no `/api/v1/` prefix)
- Namespaced routes: `/api/v1/(shared|mobile|presents)`

### Deprecation Timeline

1. Mobile clients should migrate to `/api/v1/mobile/*`
2. Web clients should use `/api/v1/shared/*` or `/api/v1/presents/*`
3. Legacy routes maintained for backward compatibility

### Example Migration

```
Old (Legacy):
POST /login
GET /me
POST /users

New (Shared):
POST /api/v1/shared/login
GET /api/v1/shared/me
POST /api/v1/shared/users
```

---

## 10. IMPLEMENTATION CHECKLIST FOR FRONTEND

### Phase 1: Authentication Migration
- [ ] Create Rails JWT service in frontend
- [ ] Replace Firebase signIn with `POST /api/v1/shared/login`
- [ ] Store JWT token in localStorage/secure storage
- [ ] Add JWT to all request headers
- [ ] Replace Firebase user profile with Rails user endpoint
- [ ] Implement 6-digit OTP verification
- [ ] Test token refresh/expiration handling

### Phase 2: API Endpoint Migration
- [ ] Update all API calls to `/api/v1/` paths
- [ ] Add authorization headers
- [ ] Update error handling for Rails error formats
- [ ] Update serializer/parser for response structures
- [ ] Implement role-based access checks

### Phase 3: Testing
- [ ] Test authentication flows (login, signup, logout)
- [ ] Test token expiration and re-login
- [ ] Test role-based access (venue_owner, vendor, admin)
- [ ] Test CORS headers
- [ ] Test rate limiting responses
- [ ] Integration tests with staging API

### Phase 4: Deployment
- [ ] Update environment variables for API URLs
- [ ] Configure CORS origins in Rails
- [ ] Test against production API
- [ ] Monitor error logs and user sessions

---

## 11. EXAMPLE API CALLS

### Login with JWT
```bash
curl -X POST http://localhost:3001/api/v1/shared/login \
  -H "Content-Type: application/json" \
  -H "X-Mobile-App: true" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response
{
  "id": 1,
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "consumer",
  "name": "User Name"
}
```

### Authenticated Request
```bash
curl -X GET http://localhost:3001/api/v1/shared/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json"
```

### Create Organization (Venue Owner Only)
```bash
curl -X POST http://localhost:3001/api/v1/presents/organizations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": {
      "name": "My Venue",
      "description": "A great venue",
      "email": "venue@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94105",
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }'
```

---

## 12. RUNNING THE BACKEND LOCALLY

```bash
# Clone and setup
git clone https://github.com/your-repo/voxxy-rails.git
cd voxxy-rails

# Install dependencies
bundle install

# Setup database
rails db:create db:migrate

# Create .env file
cp .env.example .env

# Start Redis
redis-server

# Start Rails server
rails s -p 3001

# In another terminal, start Sidekiq
bundle exec sidekiq

# API available at: http://localhost:3001/api/v1
```

---

## Summary

The Rails backend provides a well-structured, RESTful API with:
- **JWT + Session authentication** (24hr tokens)
- **Three API namespaces** (shared, mobile, presents)
- **Role-based access control** (admin, vendor, venue_owner, consumer)
- **PostgreSQL + Redis** infrastructure
- **Rate limiting & security** built-in
- **Ready for mobile & web clients**

Frontend migration requires replacing Firebase Auth with Rails JWT and updating API endpoints to the new `/api/v1/` structure.

