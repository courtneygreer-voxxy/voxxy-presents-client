# **VOXXY PLATFORM - COMPREHENSIVE CLAUDE CONTEXT**

Copy and paste this at the start of new Claude conversations to ensure accurate assistance for both frontend and backend work.

---

## 🎯 Platform Overview

**Voxxy** is a dual-product Rails API + React frontend platform:

1. **Voxxy Mobile** - Social planning app for coordinating group activities (separate mobile codebase)
2. **Voxxy Presents** - Event management & vendor coordination platform (this codebase)

This context covers **Voxxy Presents** - both the Rails backend API and React web client.

---

## ⚡ RECENT UPDATES (January 24, 2026)

### Email Unsubscribe System (NEW - January 24, 2026)
- ✅ **Three-Tier Unsubscribe** - Event-specific, organization-wide, or global unsubscribe
- ✅ **Token-Based Security** - 90-day secure tokens, no auth required
- ✅ **Branded Unsubscribe Page** - Full React page with context display and scope selection
- ✅ **Email Integration** - All 7 scheduled templates + invitation emails include unsubscribe links
- ✅ **Recipient Filtering** - Automatic filtering of unsubscribed users before sending
- ✅ **Resubscribe Functionality** - Users can resubscribe with one click
- ✅ **Admin Analytics** - Dashboard showing unsubscribe stats, trends, and top events/organizations
- ✅ **UNSUB Count** - Email Automation tab shows count of unsubscribed recipients per scheduled email
- **Status:** ✅ Production ready - full system deployed and tested
- **Documentation:** See `/Users/beaulazear/Desktop/voxxy-rails/docs/UNSUBSCRIBE_SYSTEM.md`

### Smart Lists & Contact Organization (January 18, 2026)
- ✅ **Smart Lists** - Dynamic lists that auto-update based on filters (categories, locations, tags)
- ✅ **Manual Lists** - Static hand-picked contact lists
- ✅ **List Management UI** - Create, view, edit, delete lists in Network tab
- ✅ **Pagination** - 100 contacts per page with "Select All" across pages
- ✅ **Backend API** - Full CRUD endpoints for contact list management
- **Status:** ✅ Core feature complete | 🚧 Event Wizard integration pending

### Build Fixes & Stability (January 17, 2026)
- ✅ Resolved all 9 TypeScript build errors
- ✅ Fixed pause/resume button HTTP method mismatch
- ✅ Enhanced invitation email display with debugging
- ✅ Improved edit modal cursor insertion for variables
- ✅ Added timezone-aware email scheduling
- **Status:** ✅ Production ready - all build errors resolved

### Other Features
- ✅ **CSV Bulk Import** - Import vendor contacts via CSV upload with validation
- ✅ **Email Variable System** - User-friendly `[eventName]` format (converts to `{{event_title}}`)
- ✅ **Clickable Variable Buttons** - One-click insertion organized by category
- ✅ **Payment Deadline** - Full support for payment tracking and deadline emails

### Documentation
- 📚 `UNSUBSCRIBE_SYSTEM.md` - Complete unsubscribe system documentation (NEW)
- 📚 `FINAL_BUILD_FIX.md` - Comprehensive build error resolution guide
- 📚 `PAUSE_DELETE_FIX_SUMMARY.md` - Email action fixes
- 📚 `INVITATION_EMAIL_FIX.md` - Invitation debugging enhancements
- 📚 `SCHEDULED_EMAILS_SYSTEM.md` - Complete email system documentation

---

# 🖥️ FRONTEND: React Web Application

## Tech Stack

- **Framework:** React 18.3.1 + TypeScript 5 + Vite 6.3.6 (NOT React Native - this is a web app)
- **Styling:** Tailwind CSS 3.4.17 + Radix UI (headless components) + Lucide icons
- **Forms:** React Hook Form 7.61.1 + Zod 3.24.1 validation
- **Routing:** React Router DOM 7.7.1
- **State:** React Context API (AuthContext for global auth state)
- **API:** Rails backend at `voxxyai.com/api` with JWT authentication
- **Analytics:** Mixpanel 2.70.0 (production only)
- **Other:** date-fns, recharts, sonner (toasts), qrcode generation

## Frontend Project Structure

**Location:** `/Users/beaulazear/Desktop/voxxy-presents-client/`

```
src/
├── components/
│   ├── ui/              # 50+ Radix UI components (Button, Dialog, Card, etc.)
│   ├── producer/        # Producer dashboard components
│   │   ├── CreateEventWizard/  # 4-step event creation
│   │   └── Network/            # Vendor contact management (CRM)
│   ├── auth/            # Login/signup forms, protected routes
│   └── analytics/       # Mixpanel tracking components
├── pages/               # All route pages (33 screens)
│   ├── ProducerDashboard.tsx
│   ├── VendorDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── PublicEventDetailPage.tsx
│   └── VendorApplicationForm.tsx
├── contexts/
│   └── AuthContext.tsx  # Global auth state with user profile
├── services/
│   └── api.ts           # Complete API client (1500+ lines)
├── hooks/               # useAuth, usePageTracking, etc.
├── utils/               # cache.ts, validation.ts, etc.
├── types/               # TypeScript type definitions
└── config/
    └── environments.ts  # Environment detection
```

## Authentication Pattern (Frontend)

**Storage:** JWT token in `localStorage` as `railsAuthToken`
**Context:** `AuthContext` provides:
- `currentUser` / `userProfile`: Current user data
- `isAuthenticated`, `isAdmin`, `isProducer`, `isVendor`: Role helpers
- `signIn()`, `signUp()`, `signOut()`, `refreshUserProfile()`

**API Integration:**
- Token sent via `Authorization: Bearer <token>` header
- Auto-excluded on public endpoints (login, signup, password reset)
- 401 responses trigger logout

**Caching:** User profiles cached in localStorage with 5-minute TTL (`src/utils/cache.ts`)

## User Roles & Access

The platform supports **6 roles** with different capabilities:

1. **`admin`** - Full system access, user management
2. **`producer`** (formerly `venue_owner`) - Create events, manage vendor applications
3. **`vendor`** - Browse events, submit applications
4. **`consumer`** - View public events, register
5. **`guest`** - Limited public access
6. (Legacy role: `venue_owner` → now mapped to `producer` in frontend)

**Critical:** Always check user role before implementing features. Use `userProfile.role` from AuthContext.

## Key Frontend Features

### 1. Event Management (Producers)
- **4-step event creation wizard:**
  1. Event Details (title, date, location, application deadline)
  2. Vendor Application Setup (categories, booth pricing)
  3. Invite Vendors from Network
  4. Review & Create (auto-creates vendor application, sends invitations)
- Edit/delete events
- View vendor applications by event
- Approve/reject/waitlist vendors via Command Center

### 2. Vendor Application System
- Public event browsing (`/events/:slug`)
- Application submission forms with categories
- Status tracking via ticket codes (`/applications/track/:code`)
- Email confirmations via SendGrid

### 3. Invitation System
- Create batch invitations for vendors from Network
- Public invitation acceptance/decline page (`/invitations/:token`)
- Track status (pending, sent, viewed, accepted, declined, expired)
- Email notifications on invite and response

### 4. Vendor Contact Management (Network/CRM)
- Add/edit vendor contacts
- Filter by type, status, tags, categories, location
- **CSV Bulk Import** - Upload CSV files to import multiple contacts at once
  - Template download with correct column format
  - Validation and error reporting
  - Duplicate detection
  - Source tracking (`csv_import`)
- Import contacts from event submissions
- Integration with event invitations
- Bulk email campaigns (planned)

### 5. Dashboards
- **ProducerDashboard:** Events, Network, Settings tabs
- **VendorDashboard:** Events browsing (minimal functionality)
- **AdminDashboard:** User management, role filtering, beta approvals

## Frontend Routing

**Public Routes:**
- `/` - Landing page
- `/events/:slug` - Public event detail
- `/events/:slug/apply` - Vendor application form
- `/invitations/:token` - View/respond to invitation
- `/applications/track/:code` - Track application status
- `/apply/:code` - Shareable application link (redirects to event)

**Auth Routes:**
- `/login` - Unified login (all roles)
- `/contact` - Beta access request (signup gated during beta)

**Protected Routes:**
- `/producer/pending` - Producer dashboard
- `/vendor/pending` - Vendor dashboard
- `/admin/dashboard` - Admin dashboard (admin-only)

## Frontend API Client

**All API calls** centralized in `/Users/beaulazear/Desktop/voxxy-presents-client/src/services/api.ts`

**Base URL:** `https://www.voxxyai.com/api`

**Pattern:**
```typescript
// Always import from api.ts - NEVER write raw fetch calls
import { eventsApi, authApi } from '@/services/api'

// Example usage:
const event = await eventsApi.getBySlug('my-event')
await authApi.login({ email, password })
```

**Domain-specific APIs:**
- `authApi` - Login, signup, logout, me
- `organizationsApi` - CRUD for organizations
- `eventsApi` - Event management
- `vendorApplicationsApi` - Application forms
- `registrationsApi` - Vendor submissions
- `vendorContactsApi` - CRM contacts
- `eventInvitationsApi` - Invitation management
- `adminApi` - Admin operations

## Frontend TypeScript Interfaces

### User
```typescript
interface User {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'
  confirmed_at: string | null  // Email verification
  product_context?: 'mobile' | 'presents' | 'both'
  status?: 'active' | 'suspended' | 'banned'
  avatar?: string
  username?: string
}
```

### Event
```typescript
interface Event {
  id: number
  slug: string
  title: string
  description?: string
  event_date?: string
  event_end_date?: string
  application_deadline?: string
  location?: string
  poster_url?: string
  ticket_url?: string
  ticket_price?: number
  capacity?: number
  registered_count?: number
  published?: boolean
  registration_open?: boolean
  status?: 'draft' | 'published' | 'cancelled' | 'completed'
  vendor_application?: VendorApplication
}
```

### VendorApplication
```typescript
interface VendorApplication {
  id: number
  name: string
  description?: string
  booth_price?: number
  status?: 'active' | 'inactive'
  categories?: string[]  // Available vendor categories
  submissions_count?: number
  shareable_code?: string  // Format: EVENT-202512-A1B2C3
}
```

### Registration (Vendor Submission)
```typescript
interface Registration {
  id: number
  name: string
  email: string
  phone?: string
  business_name: string
  vendor_category: string
  status?: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed'
  ticket_code?: string  // Unique tracking code
  checked_in?: boolean
  created_at: string
}
```

### VendorContact
```typescript
interface VendorContact {
  id: number
  organization_id: number
  contact_name: string
  business_name?: string
  job_title?: string
  email: string
  phone?: string
  contact_type: 'vendor' | 'partner' | 'sponsor' | 'staff'
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'closed'
  tags?: string[]
  notes?: string
  source: 'manual' | 'event_application'
  interaction_count: number
  last_contacted_at?: string
}
```

### EventInvitation
```typescript
interface EventInvitation {
  id: number
  event_id: number
  vendor_contact_id: number
  status: 'pending' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'
  invitation_token?: string
  sent_at?: string
  responded_at?: string
  response_notes?: string
  expires_at: string
}
```

---

# ⚙️ BACKEND: Rails API

## Backend Tech Stack

**Location:** `/Users/beaulazear/Desktop/voxxy-rails/`

- **Framework:** Rails 7.2.2.1 (API mode with cookies enabled)
- **Database:** PostgreSQL 14+ (with JSONB support)
- **Authentication:** JWT (24-hour expiration) + Session cookies (dual auth)
- **Background Jobs:** Sidekiq (Redis-backed)
- **File Storage:** ActiveStorage (AWS S3 in production, local in dev)
- **Email:** SendGrid (transactional emails)
- **Cache:** Redis (Google Places, OpenAI responses, rate limiting)

## Backend Architecture

**API Structure:** Versioned, product-segmented REST API

```
/api/v1/
├── mobile/          # Voxxy Mobile product endpoints
├── presents/        # Voxxy Presents product endpoints
│   ├── organizations
│   ├── events
│   ├── vendors
│   ├── vendor_contacts
│   ├── vendor_applications
│   ├── event_invitations
│   ├── registrations
│   └── budgets
└── shared/          # Shared endpoints (auth, users, notifications)
```

**Legacy Routes:** Top-level routes exist for backward compatibility (e.g., `/login`, `/activities`)

## Core Backend Models

### User (`app/models/user.rb`)
**Purpose:** Central user model supporting both Mobile and Presents products

**Key Attributes:**
- Authentication: `email`, `password_digest` (bcrypt), `confirmation_code`, `reset_password_token`
- Profile: `name`, `username`, `avatar`, `neighborhood`, `city`, `state`, `latitude`, `longitude`
- Roles: `role` (consumer, venue_owner, vendor, admin), `admin` boolean
- Product Context: `product_context` (mobile, presents, both)
- Moderation: `status` (active, suspended, banned), `suspended_until`, `ban_reason`
- Legal: `terms_accepted_at`, `privacy_policy_accepted_at` with versions
- Notifications: `email_notifications`, `push_notifications`, `push_token`

**Relationships:**
- Mobile: `has_many :activities`, `has_many :activity_participants`
- Presents: `has_many :organizations`, `has_many :vendors`
- `has_one_attached :profile_pic` (ActiveStorage)

**Business Logic:**
- Password reset with 24-hour token expiration
- Email confirmation with 6-digit codes
- Moderation: `suspend!`, `ban!`, `unsuspend!`, `unban!`
- Blocking system: `blocked_users`, `blocked_by_users`

### Organization (`app/models/organization.rb`)
**Purpose:** Venues/event organizers in Presents product

**Key Attributes:**
- Identity: `name`, `slug`, `description`, `logo_url`
- Contact: `website`, `instagram_handle`, `phone`, `email`
- Location: `address`, `city`, `state`, `zip_code`, `latitude`, `longitude`
- Status: `verified`, `active`

**Relationships:**
- `belongs_to :user`
- `has_many :events`, `has_many :budgets`, `has_many :vendor_contacts`

**Slug:** Auto-generated from name, used in URLs

### Event (`app/models/event.rb`)
**Purpose:** Events created by organizations

**Key Attributes:**
- Core: `title`, `slug`, `description`, `poster_url`, `ticket_url`
- Timing: `event_date`, `event_end_date`, `application_deadline`
- Capacity: `capacity`, `registered_count` (counter cache)
- Pricing: `ticket_price`, `booth_price`
- Status: `published`, `registration_open`, `status` (draft/published/cancelled/completed)

**Relationships:**
- `belongs_to :organization`
- `has_many :registrations` (counter_cache: registered_count)
- `has_many :vendor_applications`, `has_many :event_invitations`
- `has_one :budget` (polymorphic)

**Validations:**
- Application deadline must be before event date
- Status inclusion validation

**Business Logic:**
- Auto-closes registration when full
- `full?`, `spots_remaining` methods
- Active vendor application tracking

### VendorApplication (`app/models/vendor_application.rb`)
**Purpose:** Shareable vendor application forms for events

**Key Attributes:**
- `name`, `description`, `shareable_code` (unique, format: EVENT-202512-A1B2C3)
- `status` (active/inactive)
- `categories` (JSONB array - available vendor categories like "Food", "Art", "Music")
- `booth_price` (application fee)
- `submissions_count` (counter cache)

**Relationships:**
- `belongs_to :event`
- `has_many :registrations` (counter_cache: submissions_count)

**Business Logic:**
- Generates readable shareable codes
- Category management: `add_category`, `remove_category`
- Submission filtering: `submissions_by_status`, `submissions_by_category`
- Shareable URL generation for public applications

### Registration (`app/models/registration.rb`)
**Purpose:** Event RSVPs and vendor application submissions (dual purpose)

**Key Attributes:**
- Contact: `email`, `name`, `phone`
- Vendor Fields: `business_name`, `vendor_category` (if vendor registration)
- Ticketing: `ticket_code` (unique), `qr_code_url`
- Status: `status` (pending/confirmed/cancelled/approved/rejected/waitlist)
- Check-in: `checked_in`, `checked_in_at`
- Marketing: `subscribed` (to updates)

**Relationships:**
- `belongs_to :event` (counter_cache: registered_count)
- `belongs_to :user` (optional - guests can register without accounts)
- `belongs_to :vendor_application` (optional, counter_cache: submissions_count)

**Validations:**
- Email uniqueness per event
- Vendor fields required if `vendor_application_id` present

**Business Logic:**
- Auto-generates unique ticket codes (format: 6-digit alphanumeric)
- State transitions: `confirm!`, `cancel!`, `approve!`, `reject!`, `check_in!`
- Automatic emails via `RegistrationEmailService` on create/update
- Differentiates between regular event registrations and vendor submissions

### VendorContact (`app/models/vendor_contact.rb`)
**Purpose:** CRM system for managing vendor relationships

**Key Attributes:**
- Identity: `contact_name`, `email`, `phone`, `business_name`, `job_title`
- Classification: `contact_type` (vendor/partner/sponsor/staff)
- Status: `status` (new/contacted/interested/converted/closed)
- Tracking: `interaction_count`, `last_contacted_at`, `source`, `imported_at`
- Organization: `tags` (JSONB array), `categories` (JSONB array), `notes`
- Location: `location` (city/region string)
- Featured: `featured` (boolean - "Voxxy Card" contacts)

**Relationships:**
- `belongs_to :organization`
- `belongs_to :vendor` (optional - link to Vendor profile if exists)
- `belongs_to :registration` (optional - if imported from event submission)
- `has_many :event_invitations`

**Scopes:**
- `by_category(category)` - JSONB containment query
- `by_location(location)` - ILIKE pattern match
- `featured` - Where featured = true

**Business Logic:**
- `record_interaction!` - increments counter and updates timestamp
- Tag management: `add_tag`, `remove_tag`
- Email normalization (lowercase, trimmed)
- Can be manually created OR auto-imported from vendor submissions
- Supports pagination (100 per page) with meta response

### ContactList (`app/models/contact_list.rb`)
**Purpose:** Organize vendor contacts into reusable lists for event invitations

**Key Attributes:**
- Identity: `name`, `description`
- Type: `list_type` ('smart' or 'manual')
- Smart Lists: `filters` (JSONB - categories, locations, tags)
- Manual Lists: `contact_ids` (integer array)
- Cache: `contacts_count`, `last_used_at`

**Relationships:**
- `belongs_to :organization`
- Virtual: `contacts` - resolves to VendorContact query based on type

**Validations:**
- Name unique per organization
- Filters required for smart lists (must be hash)
- Contact IDs required for manual lists (must be array)

**Business Logic:**
- `smart?`, `manual?` - Type checking
- `contacts` - Resolves list to actual VendorContact records
- `resolve_smart_list` - Builds query from filters with OR logic
- `resolve_manual_list` - Finds contacts by ID array
- `update_contacts_count!` - Updates counter cache

**Filter Resolution:**
- **Categories:** OR logic (match ANY selected category)
- **Locations:** OR logic (match ANY selected location)
- **Tags:** OR logic (match ANY selected tag)
- **Between filters:** AND logic (must match category filter AND location filter)

### EventInvitation (`app/models/event_invitation.rb`)
**Purpose:** Tokenized invitations to vendor contacts for events

**Key Attributes:**
- `invitation_token` (32-byte urlsafe base64, unique)
- `status` (pending/sent/viewed/accepted/declined/expired)
- `sent_at`, `responded_at`, `expires_at`
- `response_notes` (optional message from invitee)

**Relationships:**
- `belongs_to :event`
- `belongs_to :vendor_contact`

**Validations:**
- Unique vendor_contact per event (can't invite same contact twice)
- Auto-generates secure tokens on create

**Business Logic:**
- State transitions: `mark_as_sent!`, `mark_as_viewed!`, `accept!`, `decline!`
- Expiration checking: `expired?`, enforced in controller
- Generates shareable URLs with tokens: `/invitations/:token`
- Auto-sets expiration based on event application deadline
- Email sent via `RegistrationEmailService` on batch creation

### Budget & BudgetLineItem (`app/models/budget.rb`)
**Purpose:** Budget tracking for events and organizations

**Key Attributes (Budget):**
- `budgetable_type/id` (polymorphic - Event or Organization)
- `title`, `total_amount`, `spent_amount`
- `status` (draft/active/completed)

**Key Attributes (BudgetLineItem):**
- `name`, `category`, `notes`
- `budgeted_amount`, `actual_amount`
- Optional link to `vendor_id`

**Business Logic:**
- Auto-calculates totals on save
- `remaining_amount`, `percentage_spent` methods

### Vendor (`app/models/vendor.rb`)
**Purpose:** Vendor marketplace profiles

**Key Attributes:**
- Identity: `name`, `slug`, `vendor_type` (venue/catering/entertainment/market_vendor)
- Contact: `contact_email`, `phone`, `website`, `instagram_handle`
- Details: `description`, `logo_url`, `services` (JSON), `pricing` (JSON)
- Location: `address`, `city`, `state`, `zip_code`, `latitude`, `longitude`
- Status: `verified`, `active`
- Metrics: `views_count`, `rating`

**Relationships:**
- `belongs_to :user`
- `has_many :budget_line_items`

## Backend API Endpoints

**Base URL:** `https://www.voxxyai.com/api`

### Authentication (Shared)
- `POST /login` - Returns JWT token + user ID
- `POST /users` - Signup (creates user)
- `GET /me` - Get current user profile (requires auth)
- `DELETE /logout` - Logout
- `POST /password_reset` - Request password reset email
- `PATCH /password_reset` - Reset password with token
- `POST /verify_code` - Verify email confirmation code

### Organizations (Presents)
- `GET /v1/presents/me/organization` - Get logged-in user's organization
- `POST /v1/presents/organizations` - Create organization
- `GET /v1/presents/organizations/:slug` - Get organization details
- `PATCH /v1/presents/organizations/:slug` - Update organization

### Events (Presents)
- `GET /v1/presents/events` - List all published events (public)
- `GET /v1/presents/events/:slug` - Get event details (public)
- `GET /v1/presents/organizations/:org_slug/events` - Get organization's events (auth required)
- `POST /v1/presents/organizations/:org_slug/events` - Create event (auth required)
- `PATCH /v1/presents/events/:slug` - Update event (owner only)
- `DELETE /v1/presents/events/:slug` - Delete event (owner only)

### Vendor Applications (Presents)
- `GET /v1/presents/events/:event_slug/vendor_applications` - Get event's applications
- `POST /v1/presents/events/:event_slug/vendor_applications` - Create application form
- `GET /v1/presents/vendor_applications/:id` - Get application details
- `PATCH /v1/presents/vendor_applications/:id` - Update application
- `GET /v1/presents/vendor_applications/:id/submissions` - Get all submissions
- `GET /v1/presents/vendor_applications/lookup/:code` - Lookup by shareable code (public)

### Registrations (Presents)
- `POST /v1/presents/events/:event_slug/registrations` - Submit vendor application or event registration
- `GET /v1/presents/registrations/:id` - Get registration details
- `PATCH /v1/presents/registrations/:id` - Update registration (status changes)
- `GET /v1/presents/registrations/track/:ticket_code` - Track application status (public)

### Event Invitations (Presents)
- `POST /v1/presents/events/:event_slug/invitations/batch` - Create batch invitations
- `GET /v1/presents/events/:event_slug/invitations` - Get event's invitations
- `GET /v1/presents/invitations/:token` - View invitation (public, token-based)
- `PATCH /v1/presents/invitations/:token/respond` - Accept/decline invitation (public)

### Vendor Contacts (Presents)
- `GET /v1/presents/organizations/:org_id/vendor_contacts` - Get organization's contacts (paginated, 100/page)
- `GET /v1/presents/organizations/:org_id/vendor_contacts/ids` - Get all contact IDs (for "Select All")
- `POST /v1/presents/vendor_contacts` - Create contact
- `GET /v1/presents/vendor_contacts/:id` - Get contact details
- `PATCH /v1/presents/vendor_contacts/:id` - Update contact
- `DELETE /v1/presents/vendor_contacts/:id` - Delete contact
- `POST /v1/presents/vendor_contacts/bulk_import` - CSV bulk import

### Contact Lists (Presents)
- `GET /v1/presents/organizations/:org_id/contact_lists` - Get organization's lists
- `POST /v1/presents/organizations/:org_id/contact_lists` - Create new list
- `GET /v1/presents/contact_lists/:id` - Get list details
- `GET /v1/presents/contact_lists/:id/contacts` - Get list contacts (paginated)
- `PATCH /v1/presents/contact_lists/:id` - Update list
- `DELETE /v1/presents/contact_lists/:id` - Delete list

### Admin (Protected)
- `GET /admin/user_breakdown` - Get all users with filters
- `POST /admin/users/:id/suspend` - Suspend user
- `POST /admin/users/:id/ban` - Ban user
- `POST /admin/users/:id/unsuspend` - Unsuspend user

**All authenticated endpoints require:** `Authorization: Bearer <token>` header

## Backend Services Layer

**Location:** `/Users/beaulazear/Desktop/voxxy-rails/app/services/`

### Email Services

**BaseEmailService** - SendGrid integration with branded HTML templates
- Branded templates with Montserrat font, gradient backgrounds
- Environment-aware frontend URL generation
- User email preference checking

**RegistrationEmailService** - Registration/vendor application emails
- Vendor application confirmations
- Event registration confirmations
- Owner notifications for new submissions
- Status update emails (approved/rejected/waitlist)
- Invitation emails to vendor contacts

**EmailVerificationService** - 6-digit confirmation codes with 24-hour expiration

**PasswordResetService** - Secure token generation and email delivery

**UserModerationEmailService** - Notifications for suspensions/bans

### Push Notification Services

**PushNotificationService** - Expo Push Notification integration
- Bulk notification support
- Error handling for invalid tokens
- Device registration cleanup
- Badge counts and sound

### External API Services

**GooglePlacesService** (`google_places_service.rb`)
- Comprehensive Google Places API wrapper
- 2-hour Redis caching
- Methods:
  - `nearby_search` - Find venues by type, radius, rating
  - `get_place_details` - Full venue information
  - `find_place_by_name_and_address` - Place ID lookup
  - Photo URL generation and proxying (hides API key from clients)
- Rating/review filtering (min 3.5 stars, 10+ reviews)

**OpenAI Integration** (via OpenAI gem)
- Activity recommendation generation
- Restaurant/bar/game suggestions based on user preferences
- Cached responses for "Try Voxxy" feature

**MixpanelService** (`mixpanel_service.rb`)
- Analytics event tracking
- User identification
- Production-only (disabled in dev/test)
- Singleton pattern

### Content & Safety Services

**ContentFilterService** (`content_filter_service.rb`)
- Profanity detection and filtering
- Spam pattern matching
- Severity level assessment (none/mild/moderate/severe)
- URL filtering, caps detection, repetitive character blocking
- Email/phone number blocking
- Used in Activity and Comment validations

### Utility Services

**InviteUserService** - Activity participant invitations with email delivery

**VenueRankingService** - Scores and ranks venue recommendations

## Backend Authentication & Authorization

### Authentication System

**Technology:** JWT (JSON Web Tokens) + Session Cookies (Hybrid)

**Implementation:** `app/controllers/concerns/json_web_token.rb`

```ruby
SECRET_KEY = Rails.application.credentials.secret_key_base
encode(payload, exp = 24.hours.from_now)
decode(token) # returns HashWithIndifferentAccess
```

**Flow:**
1. User logs in via `POST /login` (SessionsController)
2. Server generates JWT with 24-hour expiration
3. Token returned in JSON response AND stored in session cookie
4. Client sends token in `Authorization: Bearer <token>` header
5. ApplicationController `authorized` method validates token/session
6. `current_user` helper extracts user from token/session

**Password Security:**
- BCrypt via `has_secure_password`
- Minimum 6 characters
- Reset tokens expire in 24 hours

**Email Verification:**
- 6-digit confirmation codes
- 24-hour expiration
- Required for account activation (`confirmed_at` timestamp)

### Authorization System

**Role-Based Access Control (RBAC):**

**User Roles:**
```ruby
ROLES = %w[consumer venue_owner vendor admin]
```

**Role Methods:**
- `consumer?` - Mobile product users
- `venue_owner?` - Event organizers (called "producer" in frontend)
- `vendor?` - Service providers
- `admin?` - Platform administrators
- `presents_user?` - venue_owner OR vendor
- `mobile_user?` - consumer

**Product Context:**
- `product_context` field: "mobile", "presents", "both"
- `uses_mobile?`, `uses_presents?` helpers

**Controller-Level Authorization:**
- `require_venue_owner` - Presents endpoints
- `check_event_ownership` - Event management
- `check_presents_access` - Product access control

**Moderation States:**
- `active`, `suspended`, `banned`
- `can_login?` checks status
- Admin can suspend/ban users with reasons and durations

### Security Features

**Rate Limiting** (`config/initializers/rack_attack.rb`)
- 300 requests/hour per IP (API)
- 500 requests/hour per authenticated user
- 10 login attempts per 15 minutes per IP
- Separate limits for expensive operations:
  - OpenAI: 50/hour
  - Try Voxxy: 10/hour
  - Photos: 200/hour
  - Places API: 100/hour
- Admin users exempt from rate limiting
- Redis-backed

**CORS Configuration** (`config/application.rb`)
```ruby
allowed_origins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://www.voxxyai.com",
  "https://voxxypresents.com",
  "null" # React Native
]
```
- Credentials enabled
- All HTTP methods allowed

**Content Security:**
- ContentFilterService filters profanity and spam
- Report system for inappropriate content
- Moderation action logging

**Token Security:**
- Guest response tokens (32-byte urlsafe base64)
- Invitation tokens (32-byte urlsafe base64)
- Password reset tokens (20-character hex)
- All tokens are unique and indexed

## Backend Configuration & Environment

### Required Environment Variables

**Database:**
- `DATABASE_URL` - PostgreSQL connection string

**Authentication & Secrets:**
- `SECRET_KEY_BASE` - Rails secret (from credentials)

**Email:**
- `VoxxyKeyAPI` - SendGrid API key
- `SENDER_EMAIL` - team@voxxyai.com

**External APIs:**
- `PLACES_KEY` - Google Places API key
- `OPENAI_API_KEY` - OpenAI API key
- `MIXPANEL_TOKEN` - Mixpanel project token

**File Storage (Production):**
- `AWS_ACCESS_KEY_ID` - S3 credentials
- `AWS_SECRET_ACCESS_KEY` - S3 credentials

**Redis:**
- `REDIS_URL` - Redis connection for Sidekiq and Rack::Attack

**Frontend URLs:**
- `FRONTEND_URL` - Development frontend (default: http://localhost:5173)
- `MOBILE_FRONTEND_URL` - Mobile app URL
- `PRESENTS_FRONTEND_URL` - Presents frontend URL
- `PRIMARY_DOMAIN` - Production domain (determines staging vs prod)

**Optional:**
- `LOCAL_IP` - For mobile development CORS

---

# 🔄 FRONTEND ↔ BACKEND INTEGRATION

## Key Data Flows

### Producer Creates Event Flow

**Frontend:**
1. User clicks "Create Event" in ProducerDashboard
2. CreateEventWizard opens (4 steps)
3. Step 1: Enters event details (title, date, location, deadline)
4. Step 2: Sets up vendor application (categories, booth price)
5. Step 3: Selects vendor contacts from Network to invite
6. Step 4: Reviews and submits

**API Calls:**
```typescript
// Step 1-2: Create event
POST /v1/presents/organizations/:org_slug/events
{
  title: "Summer Market 2025",
  event_date: "2025-06-15",
  application_deadline: "2025-05-30",
  vendor_application_attributes: {
    name: "Vendor Application",
    categories: ["Food", "Art", "Music"],
    booth_price: 150.00
  }
}

// Step 3: Send invitations
POST /v1/presents/events/:event_slug/invitations/batch
{
  vendor_contact_ids: [1, 2, 3, 4, 5]
}
```

**Backend:**
1. `Api::V1::Presents::EventsController#create` receives request
2. Validates user owns organization
3. Creates Event record
4. Auto-creates VendorApplication (nested attributes)
5. Generates shareable code for application
6. Returns event with nested vendor_application

7. `Api::V1::Presents::EventInvitationsController#create_batch` receives invitation request
8. Validates user owns event
9. For each vendor_contact_id:
   - Creates EventInvitation with unique token
   - Sets expiration to application_deadline
   - Sends email via RegistrationEmailService
10. Returns created invitations

### Vendor Applies to Event Flow

**Frontend:**
1. Vendor receives email with link or visits `/events/:slug`
2. Clicks "Apply" → Redirected to `/events/:slug/apply`
3. Fills out VendorApplicationForm (name, email, phone, business_name, vendor_category)
4. Submits form

**API Call:**
```typescript
POST /v1/presents/events/:event_slug/registrations
{
  name: "John Doe",
  email: "john@example.com",
  phone: "555-1234",
  business_name: "John's Tacos",
  vendor_category: "Food"
}
```

**Backend:**
1. `Api::V1::Presents::RegistrationsController#create` receives request
2. Finds event by slug, then vendor_application
3. Validates required fields (business_name, vendor_category required)
4. Creates Registration with status: "pending"
5. Auto-generates unique ticket_code
6. Increments event.registered_count and vendor_application.submissions_count (counter caches)
7. Sends confirmation email via RegistrationEmailService
8. Returns registration with ticket_code

**Frontend:**
5. Redirects to `/applications/success` with ticket_code
6. Shows "Application submitted! Track status with code: ABC123"

### Producer Reviews Applications Flow

**Frontend:**
1. Producer clicks event in dashboard
2. Command Center opens (modal/drawer)
3. Lists all submissions with filters (category, status)
4. Producer clicks "Approve" on a submission

**API Calls:**
```typescript
// Fetch submissions
GET /v1/presents/vendor_applications/:id/submissions

// Update status
PATCH /v1/presents/registrations/:id
{
  status: "approved"
}
```

**Backend:**
1. `Api::V1::Presents::VendorApplicationsController#submissions` returns all registrations
2. `Api::V1::Presents::RegistrationsController#update` validates ownership
3. Updates registration status
4. Sends status update email via RegistrationEmailService
5. Returns updated registration

### Vendor Tracks Application Status Flow

**Frontend:**
1. Vendor visits `/applications/track/:code` (from email or manual entry)
2. Page displays application status

**API Call:**
```typescript
GET /v1/presents/registrations/track/:ticket_code
```

**Backend:**
1. Public endpoint (no auth required)
2. Finds registration by unique ticket_code
3. Returns registration with status, event details
4. Frontend displays status badge (pending/approved/rejected/waitlist)

### Invitation Response Flow

**Frontend:**
1. Vendor receives email with link `/invitations/:token`
2. Clicks link → InvitationViewPage loads
3. Displays event details, booth price, deadline
4. Vendor clicks "Accept" or "Decline", optionally adds note

**API Calls:**
```typescript
// View invitation
GET /v1/presents/invitations/:token

// Respond
PATCH /v1/presents/invitations/:token/respond
{
  status: "accepted",
  response_notes: "Excited to participate!"
}
```

**Backend:**
1. Public endpoint (token-based auth)
2. Finds EventInvitation by unique token
3. Checks not expired (`expires_at > Time.current`)
4. Updates status, responded_at, response_notes
5. Sends confirmation email to vendor
6. Sends notification email to event owner
7. Returns updated invitation

**Frontend:**
4. Shows success message
5. Optionally redirects to event application page if accepted

## Database Schema Highlights

**Active Record Schema Version:** 2025_12_27_005811

**Key Features:**
- **Polymorphic Associations:** `budgetable` (Event or Organization), `reportable` (User, Comment, Activity)
- **JSONB Columns:** `responses.availability`, `vendor_applications.categories`, `vendor_contacts.tags`
- **Geolocation:** `latitude`, `longitude` on Users, Organizations, Vendors, PinnedActivities
- **Counter Caches:** `events.registered_count`, `vendor_applications.submissions_count`
- **Comprehensive Indexing:** Unique constraints on email, slug, tokens; performance indexes on status fields, dates, foreign keys
- **Foreign Key Constraints:** Full referential integrity with cascade deletes where appropriate
- **Check Constraints:** `responses_user_or_email_present` ensures either user_id OR email is present

---

# 🎨 FRONTEND PATTERNS & CONVENTIONS

## 1. Always Use Existing API Client
Import from `src/services/api.ts`. **NEVER** write raw fetch calls.

```typescript
// ✅ CORRECT
import { eventsApi } from '@/services/api'
const event = await eventsApi.getBySlug('my-event')

// ❌ WRONG
const response = await fetch('https://www.voxxyai.com/api/v1/presents/events/my-event')
```

## 2. Form Validation with Zod + React Hook Form

```typescript
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email")
})

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: "", email: "" }
})
```

## 3. UI Components from Radix

Use existing components in `src/components/ui/` (Button, Dialog, Input, Card, etc.)

```typescript
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
```

## 4. Auth Checks

```typescript
const { userProfile, isProducer, isAdmin, isAuthenticated } = useAuth()

if (!isAuthenticated) {
  return <Navigate to="/login" />
}

if (!isProducer) {
  return <div>Access denied</div>
}
```

## 5. Caching User Data

```typescript
import { cacheUserProfile, getCachedUserProfile, clearUserCache } from '@/utils/cache'

// After login
cacheUserProfile(user)

// Check cache
const cached = getCachedUserProfile()
if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
  setUser(cached.user)
}
```

## 6. Analytics Tracking

```typescript
import { analytics } from '@/lib/analytics'

// Track page view
analytics.trackPageView({ page_name: 'Event Detail', page_url: '/events/summer-market' })

// Track CTA click
analytics.trackCTAClick({ button_text: 'Apply Now', page_name: 'Event Detail' })
```

## 7. Path Aliases

Use `@/` prefix for imports:

```typescript
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
```

## 8. Styling with Tailwind

```tsx
<div className="container mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold text-primary">Title</h1>
  <Button variant="default" size="lg" className="mt-4">
    Get Started
  </Button>
</div>
```

- Dark mode via CSS variables (`--background`, `--primary`, etc.)
- Responsive with `sm:`, `md:`, `lg:` breakpoints

---

# ⚠️ COMMON GOTCHAS & IMPORTANT NOTES

## Frontend Gotchas

1. **Role naming:** Backend uses `venue_owner`, frontend displays as "Producer". Handle both when checking roles.
2. **Event slug vs ID:** Most endpoints use slug (string), some use numeric ID. Check API client carefully.
3. **Token refresh:** No auto-refresh implemented. User must re-login on 24-hour token expiration.
4. **Cache TTL:** User profiles cached for 5 minutes. Use `refreshUserProfile()` if data seems stale.
5. **Analytics:** Only fires in production environment to avoid polluting data.
6. **Beta gating:** `/signup` routes redirect to `/contact` during beta. Signup is currently disabled.
7. **This is NOT React Native:** It's a React web app. No mobile-specific APIs (Camera, SecureStore, etc.)

## Backend Gotchas

1. **Dual authentication:** Backend supports BOTH JWT tokens and session cookies. Frontend only uses JWT.
2. **Counter caches:** `events.registered_count` and `vendor_applications.submissions_count` are auto-updated. Don't manually set them.
3. **Nested attributes:** Creating events with vendor applications uses `vendor_application_attributes` (singular, not plural).
4. **Public endpoints:** `/invitations/:token` and `/registrations/track/:code` are public (no auth). Token-based security only.
5. **Email case sensitivity:** VendorContact model normalizes emails to lowercase. Always downcase before queries.
6. **JSONB queries:** Use PostgreSQL JSONB operators for querying `categories`, `tags`, etc.
7. **Slug generation:** Event and Organization slugs are auto-generated from name. Handle uniqueness conflicts.
8. **Rate limiting:** Heavy API users may hit Rack::Attack limits. Admin users are exempt.
9. **CORS:** Frontend must be in allowed origins list. Check `config/application.rb` for CORS config.
10. **Background jobs:** Emails are sent synchronously (not via Sidekiq) unless explicitly queued.

## Cross-Stack Integration Gotchas

1. **Registration dual purpose:** The `Registration` model serves BOTH event registrations AND vendor applications. Check for `vendor_application_id` to differentiate.
2. **Status enums:** Frontend and backend must use same status values. Check model constants:
   - Registration: `pending`, `confirmed`, `cancelled`, `approved`, `rejected`, `waitlist`
   - EventInvitation: `pending`, `sent`, `viewed`, `accepted`, `declined`, `expired`
   - VendorApplication: `active`, `inactive`
3. **Date formatting:** Backend uses ISO 8601 strings. Frontend uses date-fns for parsing/formatting.
4. **File uploads:** Backend uses ActiveStorage. Frontend sends base64 or multipart/form-data (depends on endpoint).
5. **Error responses:** Backend returns `{ error: "message", errors: ["detail1", "detail2"] }`. Frontend ApiError class handles this.
6. **Pagination:** Not yet implemented. All endpoints return full arrays. May cause performance issues with large datasets.
7. **Vendor contact import:** When approving a registration, producer can import it as a vendor contact. This creates a new VendorContact with `source: "event_application"` and links `registration_id`.

---

# 📋 CHECKLISTS

## When Making Frontend Changes

**Before implementing:**
1. ✅ Check if user role has permission (isProducer, isVendor, isAdmin)
2. ✅ Verify API endpoint exists in `src/services/api.ts`
3. ✅ Use existing UI components from `src/components/ui/`
4. ✅ Follow existing patterns (forms, modals, tables)
5. ✅ Add analytics tracking if user-facing feature
6. ✅ Check if feature needs authentication or is public

**After implementing:**
1. ✅ Test with multiple user roles (producer, vendor, admin, guest)
2. ✅ Verify mobile responsiveness (Chrome DevTools)
3. ✅ Check dark mode appearance (toggle in browser)
4. ✅ Run `npm run typecheck` and `npm run lint`
5. ✅ Test with/without authentication
6. ✅ Verify analytics events fire in production (check Mixpanel)

## When Making Backend Changes

**Before implementing:**
1. ✅ Check if model exists or needs creation
2. ✅ Verify relationships and foreign keys
3. ✅ Add validations and business logic to model
4. ✅ Create controller action with proper authorization
5. ✅ Add route to `config/routes.rb`
6. ✅ Consider if change needs database migration
7. ✅ Check if service object needed for complex logic
8. ✅ Add tests (model, controller, integration)

**After implementing:**
1. ✅ Run `bundle exec rspec` to verify tests pass
2. ✅ Test with different user roles (venue_owner, vendor, admin)
3. ✅ Verify authorization/authentication works
4. ✅ Check rate limiting doesn't block legitimate use
5. ✅ Test with production-like data volumes
6. ✅ Verify emails sent (check SendGrid dashboard)
7. ✅ Update frontend API client (`src/services/api.ts`) if endpoint added/changed
8. ✅ Update TypeScript interfaces if data model changed

## When Making Cross-Stack Changes (Affecting Both Frontend & Backend)

1. ✅ Update backend model, controller, route first
2. ✅ Update backend tests and verify passing
3. ✅ Update frontend TypeScript interface in `src/types/` or inline
4. ✅ Update frontend API client in `src/services/api.ts`
5. ✅ Update frontend components/pages using the data
6. ✅ Run frontend `npm run typecheck` to catch type errors
7. ✅ Test end-to-end flow (backend → API → frontend → UI)
8. ✅ Verify error handling on both sides
9. ✅ Update this CLAUDE_CONTEXT.md if significant change

---

# 🔧 DEVELOPMENT COMMANDS

## Frontend Commands

```bash
# Development
cd /Users/beaulazear/Desktop/voxxy-presents-client
npm run dev                  # Start dev server (localhost:5173)

# Build
npm run build                # Production build
npm run build:staging        # Staging build

# Quality checks
npm run lint                 # ESLint
npm run typecheck            # TypeScript check
npm run test                 # Run tests (if configured)

# Preview production build
npm run preview
```

## Backend Commands

```bash
# Development
cd /Users/beaulazear/Desktop/voxxy-rails
bundle exec rails s          # Start Rails server (localhost:3000)
bundle exec rails c          # Rails console

# Database
bundle exec rails db:migrate      # Run migrations
bundle exec rails db:seed         # Seed database
bundle exec rails db:reset        # Drop, create, migrate, seed

# Testing
bundle exec rspec                 # Run all tests
bundle exec rspec spec/models     # Run model tests
bundle exec rspec spec/controllers # Run controller tests

# Background jobs
bundle exec sidekiq          # Start Sidekiq worker

# Security & code quality
bundle exec brakeman         # Security scanner
bundle exec rubocop          # Linting

# Console helpers
User.find_by(email: 'test@example.com')
Organization.first.events
Event.find_by(slug: 'my-event').vendor_application
```

---

# 📚 KEY FILE REFERENCES

## Frontend Files

- **API client:** `src/services/api.ts` (1527 lines)
- **Auth context:** `src/contexts/AuthContext.tsx`
- **Routes:** `src/App.tsx`
- **Producer dashboard:** `src/pages/ProducerDashboard.tsx`
- **Event wizard:** `src/components/producer/CreateEventWizard/`
- **Network (CRM):** `src/components/producer/Network/`
- **UI components:** `src/components/ui/`
- **Validation utils:** `src/utils/validation.ts`
- **Cache utils:** `src/utils/cache.ts`
- **Analytics:** `src/lib/analytics.ts`
- **Environment config:** `src/config/environments.ts`

## Backend Files

- **Routes:** `config/routes.rb`
- **Models:** `app/models/` (user.rb, event.rb, vendor_application.rb, registration.rb, vendor_contact.rb, event_invitation.rb, organization.rb, vendor.rb, budget.rb)
- **Controllers:** `app/controllers/api/v1/presents/`
- **Services:** `app/services/` (registration_email_service.rb, google_places_service.rb, content_filter_service.rb, push_notification_service.rb)
- **Database schema:** `db/schema.rb`
- **JWT concern:** `app/controllers/concerns/json_web_token.rb`
- **Rate limiting:** `config/initializers/rack_attack.rb`
- **CORS config:** `config/application.rb`
- **Sidekiq config:** `config/initializers/sidekiq.rb`

---

# 🎓 ADDITIONAL CONTEXT FOR SPECIFIC TASKS

## When Working on Producer Features
- User must have `role: 'venue_owner'` (backend) or `role: 'producer'` (frontend display)
- User must have an associated Organization
- Check ownership before allowing edits: `event.organization.user_id == current_user.id`
- Events have nested vendor_application (one-to-one)
- Use counter caches for registered_count and submissions_count

## When Working on Vendor Features
- Public event browsing doesn't require auth
- Application submission creates a Registration with vendor fields
- Registration requires: name, email, business_name, vendor_category
- Ticket code auto-generated for tracking
- Vendors can track application without logging in (public tracking endpoint)

## When Working on Invitation Features
- Invitations are sent from Producer to VendorContacts
- Each invitation has unique token for public access
- Expiration auto-set to event's application_deadline
- Accepting invitation doesn't auto-create application (vendor must still apply)
- Use batch creation for multiple invitations
- Send emails via RegistrationEmailService

## When Working on CRM/Network Features
- VendorContacts belong to Organization, not Event
- Contacts can be manually created or imported from registrations
- Use tags (JSONB array) for organization
- Track interaction_count and last_contacted_at
- Filter by contact_type and status
- Can link to Vendor profile (optional)

## When Working on Admin Features
- Strictly check `userProfile.role === 'admin'` or `isAdmin`
- Admin routes protected with AdminRoute component (frontend)
- Admin users exempt from rate limiting (backend)
- Can suspend/ban users with reasons and durations
- Access to moderation logs and user breakdown

## When Working on Forms
- Always use React Hook Form + Zod validation
- Follow patterns in existing forms (CreateEventWizard, VendorApplicationForm)
- Use UI components from Radix (`Input`, `Select`, `Textarea`, `Checkbox`)
- Handle loading states and errors gracefully
- Show success message after submission (toast notification)

## When Working on API Endpoints
- All Presents endpoints prefixed with `/v1/presents/`
- Use slugs for events and organizations (more user-friendly than IDs)
- Public endpoints: event detail, invitation view, registration tracking, application lookup
- Protected endpoints: event CRUD, invitation batch, vendor contact management
- Always validate ownership before allowing modifications
- Return consistent error format: `{ error: "message", errors: ["detail"] }`
- Use counter caches to avoid N+1 queries

## When Working on Emails
- All emails sent via RegistrationEmailService (SendGrid)
- Check user's email_notifications preference before sending
- Use branded templates (Voxxy Presents colors, Montserrat font)
- Include unsubscribe links
- Test emails in staging environment first
- Emails sent synchronously (not via Sidekiq) unless explicitly queued

---

# 🚀 CURRENT STATE & ROADMAP

## Recently Implemented (Last 30 Days)
- Invitation email functionality for vendor outreach
- Application deadline and booth price features
- Backend for vendor contact creation
- Invitation batch creation and tracking
- Email confirmations for invitations

## Known Limitations
- ✅ ~~No pagination on vendor contacts~~ (IMPLEMENTED - 100 contacts/page)
- Event Wizard doesn't yet support saved lists (in progress)
- No payment processing (Stripe integration planned)
- Limited vendor dashboard functionality (mostly event browsing)
- No bulk email campaigns yet (UI exists, backend pending)
- No QR code scanning for event check-in (QR generation exists)
- No vendor marketplace public directory
- No event analytics/reporting dashboard
- No list usage analytics or statistics

## Planned Features (Roadmap)
- **Contact Lists Integration** - Use saved lists in Event Wizard (next priority)
- **List Analytics** - Track list usage, response rates, popular lists
- Stripe payment integration for booth fees
- Bulk email campaigns from Network tab
- Enhanced vendor dashboard with application history
- Event analytics dashboard for producers
- QR code check-in system at events
- Public vendor marketplace/directory
- Event templates for repeat events
- Budget tracking with vendor integration
- Calendar integration (Google Calendar, Apple Calendar)
- Mobile app for on-site event management
- Advanced list features (CSV export, list sharing, AI suggestions)

---

**END OF CONTEXT**

## 📝 How to Use This Context

1. **Copy this entire document** when starting a new Claude conversation
2. **Paste at the beginning** of the conversation
3. **Add specific task context** after pasting (e.g., "I want to add a feature that allows...")
4. **Reference specific sections** when asking questions (e.g., "Looking at the Backend API Endpoints section...")

## ✅ Acknowledgment Prompt

After pasting this context, ask Claude:

> "Please acknowledge you understand the Voxxy Presents platform structure, including both the React frontend and Rails backend. Confirm you're ready to help with [frontend/backend/full-stack] development tasks."

---

**Last Updated:** 2026-01-18 (Smart Lists feature added)
**Schema Version:** 2026_01_18_190827 (contact_lists table)
**Frontend Version:** React 18.3.1 + Vite 6.3.6
**Backend Version:** Rails 7.2.2
**Status:** ✅ Production Ready | 🚧 Smart Lists: Event Wizard integration pending
