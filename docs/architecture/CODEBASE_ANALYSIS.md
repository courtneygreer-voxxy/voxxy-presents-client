# Voxxy Presents Frontend Codebase Analysis

## 1. Overall Purpose and Functionality

**Voxxy Presents** is an event management and vendor coordination platform designed for event producers/venue owners to:

- Create and manage events
- Invite vendors from their network to participate in events
- Process vendor applications
- Manage vendor submissions and applications
- Track event attendance and registrations

The application serves multiple user roles:

- **Producers/Venue Owners**: Create events, manage vendor participation, track applications
- **Vendors**: Apply for vendor opportunities at events, track application status
- **Consumers**: View events, register for attendance, browse opportunities
- **Admins**: Dashboard for administrative oversight

---

## 2. Tech Stack

### Core Framework & Build Tools

- **React 18.3.1** - UI library with hooks
- **React Router DOM 7.7.1** - Client-side routing
- **TypeScript 5** - Type-safe development
- **Vite 6.3.6** - Modern build tool (replaces Webpack)
- **TailwindCSS 3.4.17** - Utility-first CSS framework

### UI Component Library & Styling

- **Radix UI** - Comprehensive headless UI components (@radix-ui/\*)
  - Dialogs, dropdowns, menus, tabs, accordion, toast notifications
  - Form inputs (select, checkbox, radio, toggle)
  - Advanced components (navigation menu, popover, hover card, scroll area)
- **Lucide React 0.454.0** - Icon library
- **Geist 1.4.2** - Modern UI design system
- **CVA (Class Variance Authority) 0.7.1** - Component variant system
- **clsx 2.1.1** - Conditional class names

### Form Management

- **React Hook Form 7.61.1** - Performant form state management
- **@hookform/resolvers 3.9.1** - Zod integration for form validation
- **Zod 3.24.1** - TypeScript-first schema validation

### Data & State Management

- **React Context API** - For auth state (AuthContext)
- **Local caching** - Custom cache utility for user profiles
- **Mixpanel Browser 2.70.0** - Analytics tracking

### Visualization & Media

- **Recharts 3.1.0** - Chart and graph library
- **QR Code Styling 1.9.2** - QR code generation
- **QRCode.React 4.2.0** - React QR code component
- **Embla Carousel 8.6.0** - Image carousel
- **React Resizable Panels 3.0.4** - Resizable UI panels

### Utilities

- **date-fns 4.1.0** - Date manipulation
- **sonner 2.0.6** - Toast notifications
- **react-day-picker 9.8.1** - Calendar/date picker
- **input-otp 1.4.2** - OTP input component
- **Tailwind Merge 2.5.5** - Intelligent Tailwind class merging
- **Tailwind Animate 1.0.7** - Animation utilities

### API & Network

- **Native Fetch API** - HTTP requests (custom wrapper)
- **No external HTTP client** - Uses browser Fetch with custom error handling

### Testing

- **Vitest 3.2.4** - Unit testing framework
- **@testing-library/react 16.3.0** - React component testing
- **@testing-library/user-event 14.6.1** - User interaction testing
- **jsdom 26.1.0** - DOM implementation for testing

---

## 3. Project Structure and Organization

```
src/
├── App.tsx                          # Main router configuration
├── main.tsx                         # Application entry point
├── index.css                        # Global styles
│
├── components/                      # Reusable UI components
│   ├── ui/                          # Radix UI component wrappers
│   │   ├── button.tsx, input.tsx, card.tsx, dialog.tsx, etc.
│   │   └── Custom UI primitives
│   ├── auth/                        # Authentication components
│   │   ├── LoginForm.tsx, SignUpForm.tsx, PasswordResetForm.tsx
│   │   ├── SplitScreenLoginForm.tsx, UnifiedLoginForm.tsx
│   │   ├── ProtectedRouteV2.tsx, AdminRoute.tsx
│   │   └── Authentication flow components
│   ├── producer/                    # Producer-specific components
│   │   ├── CreateEventWizard/       # Multi-step event creation
│   │   ├── EventsList.tsx, EditEventForm.tsx, EventSettings.tsx
│   │   ├── ApplicationsTab.tsx, VendorsTab.tsx
│   │   ├── ViewApplicationSubmissions.tsx
│   │   ├── Network/                 # Vendor network management
│   │   └── CommandCenter.tsx (event management dashboard)
│   ├── analytics/                   # Analytics tracking components
│   ├── debug/                       # Debug panel (development only)
│   └── Other UI components
│
├── contexts/                        # React Context
│   └── AuthContext.tsx              # Authentication state & methods
│
├── pages/                           # Route pages
│   ├── HomePage.tsx                 # Landing page
│   ├── LoginPage.tsx, SignUpPage.tsx  # Unified auth pages
│   ├── ForgotPasswordPage.tsx, ResetPasswordPage.tsx
│   ├── BetaPendingPage.tsx          # Unified account setup hub (verification + payment)
│   ├── PublicEventDetailPage.tsx    # Public event view
│   ├── VendorApplicationForm.tsx    # Vendor application form
│   ├── ApplicationConfirmationPage.tsx, ApplicationTrackingPage.tsx
│   ├── ShortLinkRedirectPage.tsx    # Short URL handling
│   ├── Dashboard.tsx                # Unified producer/admin dashboard
│   ├── VendorDashboard.tsx          # Vendor dashboard
│   ├── PaymentOnboardingPage.tsx    # Producer payment setup
│   ├── PaymentSuccessPage.tsx, PaymentCanceledPage.tsx
│   ├── FeaturesPage.tsx, PricingPage.tsx, HelpPage.tsx
│   └── Legal pages (legal/ subfolder)
│
├── services/                        # API integration
│   ├── api.ts                       # Main API service (40KB)
│   │   ├── authApi - Login, signup, password reset
│   │   ├── organizationsApi - Organization management
│   │   ├── eventsApi - Event CRUD
│   │   ├── registrationsApi - Event registrations & tracking
│   │   ├── vendorApplicationsApi - Vendor application management
│   │   ├── emailApi - Contact form & email
│   │   ├── venuesApi - Venue data
│   │   └── Error handling (ApiError class)
│   └── subscriptionService.ts
│
├── hooks/                           # Custom React hooks
│   ├── useAuth.ts                   # Auth context wrapper
│   ├── usePageTracking.ts           # Page view analytics
│   ├── useFormTracking.ts           # Form submission analytics
│   ├── useSectionTracking.ts        # Section view analytics
│   └── use-mobile.tsx, use-toast.ts
│
├── lib/                             # Utilities & libraries
│   ├── analytics.ts                 # Mixpanel integration (38KB)
│   └── utils.ts
│
├── utils/                           # Utility functions
│   ├── validation.ts                # Email/form validation
│   ├── cache.ts                     # LocalStorage caching
│   ├── rateLimiter.ts               # Request rate limiting
│   ├── imageCompression.ts          # Image optimization
│   ├── environmentValidator.ts      # Env var validation
│   ├── inputSanitization.ts         # XSS prevention
│   ├── performanceTracking.ts       # Performance monitoring
│   └── Other utility functions
│
├── config/                          # Configuration
│   └── environments.ts              # Environment-specific config
│       - Development, staging, production settings
│       - API URLs, feature flags, debug modes
│
├── types/                           # TypeScript type definitions
│   └── env.d.ts                     # Vite environment variables
│
├── styles/                          # CSS files
│   ├── admin-dark-theme.css
│   └── forms.ts
│
└── test/                            # Test files
    ├── setup.ts                     # Vitest configuration
    └── api.test.ts
```

### Key Architectural Patterns

**Component Organization:**

- Feature-based folders (producer, auth, analytics)
- UI components separated from feature components
- Page components map to routes

**State Management:**

- **Auth State**: React Context (AuthContext) with localStorage token storage
- **Local State**: useState for component-level state
- **Caching**: Custom utility for user profile caching
- **No Redux/Zustand** - Minimal state management approach

**API Integration:**

- Centralized in `/services/api.ts`
- Organized by domain (auth, events, registrations, etc.)
- Custom Fetch wrapper with error handling
- Bearer token authentication (JWT)
- LocalStorage for token persistence

---

## 4. Authentication and User Management Flows

### Authentication Architecture

**Token Management:**

- JWT tokens stored in localStorage (`railsAuthToken` key)
- Token included in Authorization header: `Bearer {token}`
- Functions: `saveAuthToken()`, `getAuthToken()`, `clearAuthToken()`

**Auth Context (AuthContext.tsx) Provides:**

```typescript
{
  currentUser: User | null              // Current authenticated user
  userProfile: User | null              // Full user profile
  loading: boolean                      // Loading state
  error: string | null                  // Auth errors
  signUp(data): Promise<void>           // Register new user
  signIn(data): Promise<void>           // Login
  signOut(): Promise<void>              // Logout
  resetPassword(email): Promise<void>   // Password reset request
  refreshUserProfile(): Promise<void>   // Sync user profile from API
  isAuthenticated: boolean              // Computed
  isEmailVerified: boolean              // Computed
  isAdmin: boolean                      // Role helper
  isProducer: boolean                   // Role helper
  isVendor: boolean                     // Role helper
  isGuest: boolean                      // Role helper
  hasRole(role): boolean                // Generic role check
}
```

**User Roles:**

```typescript
type UserRole =
  | 'consumer' // Regular user
  | 'vendor' // Vendor/booth operator
  | 'producer' // Event creator/organizer
  | 'venue_owner' // Legacy - maps to producer
  | 'admin' // Administrator
  | 'guest' // Public/unauthenticated
```

### Sign-Up Flow

1. User navigates to `/contact` (no direct signup - beta access gate)
2. User submits contact form requesting beta access
3. Backend team approves, creates account or sends invitation
4. On successful signup:
   - `authApi.signup()` creates user with role
   - Password automatically logged in
   - User profile cached locally
   - Analytics event tracked

**Sign-up Endpoint:**

```
POST /users (legacy endpoint)
Payload: {
  user: {
    email, password, password_confirmation, name, role, product_context
  }
}
```

**Auto-Login on Signup:**

- After signup succeeds, automatically login user
- Fetch full profile from `/me` endpoint
- Cache profile locally

### Login Flow

1. User enters email/password on `/login`
2. `authApi.login()` calls `POST /login` endpoint
3. Backend returns JWT token
4. Token automatically saved to localStorage
5. `authApi.getCurrentUser()` fetches full user profile from `/me`
6. Profile cached locally
7. Analytics event tracked

**Login Endpoint:**

```
POST /login (legacy endpoint)
Headers: { 'X-Mobile-App': 'true', product: 'presents' }
Payload: { email, password, product }
Response: { token, id, email, role, ... }
```

### Role-Based Redirect

After login, `RoleBasedDashboardRedirect` component routes users:

- **Producer/Venue Owner** → `/producer/pending`
- **Vendor** → `/vendor/pending`
- **Consumer/Guest** → `/pending`
- **Admin** → `/admin/dashboard`

**Protected Route:**

- `AdminRoute` wrapper restricts admin endpoints
- `ProtectedRouteV2` redirects authenticated users away from auth pages
- Automatic redirects prevent unauthenticated access to dashboards

### Email Verification

- POST `/verify_code` - Verify email with code
- POST `/resend_verification` - Resend verification email
- User can access app before email verification (soft verification)
- Some features may be restricted until verified

### Password Reset

1. User clicks "Forgot password" on login
2. Enters email on `/forgot-password`
3. `authApi.requestPasswordReset(email)` sends reset email
4. User receives email with reset link
5. User clicks link, arrives at `/reset-password?token=...`
6. `authApi.resetPasswordWithToken(token, newPassword)` sets new password
7. User can login with new password

---

## 5. API Integration Patterns

### API Service Architecture

**Base Fetch Wrapper:** `fetchApi<T>(endpoint, options)`

- Generic type support for responses
- Automatic JWT token injection
- Error handling with ApiError class
- Supports all HTTP methods (GET, POST, PATCH, DELETE)

**API Organization:**

```typescript
export const authApi = { ... }              // Auth endpoints
export const organizationsApi = { ... }     // Organization CRUD
export const eventsApi = { ... }            // Event CRUD & management
export const registrationsApi = { ... }     // Event registrations
export const vendorApplicationsApi = { ... } // Vendor applications
export const emailApi = { ... }             // Email endpoints
export const venuesApi = { ... }            // Venue data
```

### Error Handling

**Custom ApiError Class:**

```typescript
class ApiError extends Error {
  status: number
  errors?: string[] // Validation errors from backend
  message: string // User-friendly error message
}
```

**Error Handling Strategy:**

- Catch non-200 responses
- Parse error JSON (fallback to status text)
- Log errors to console (development)
- Throw ApiError with user-friendly message
- Network errors caught separately

### Authentication in API Calls

**Public Endpoints** (no token required):

- `POST /login`
- `POST /users` (signup)
- `POST /password_reset`
- `GET /v1/presents/events/:slug` (public event view)
- `POST /v1/presents/events/:slug/registrations` (vendor application)

**Protected Endpoints** (Bearer token required):

- All other requests include `Authorization: Bearer {token}`
- Token auto-fetched from localStorage
- Missing/invalid token causes 401 error

### API Endpoints by Domain

**Authentication**

- `POST /login` - Login
- `POST /users` - Signup
- `DELETE /logout` - Logout
- `GET /me` - Get current user
- `PATCH /users/:id` - Update user
- `POST /password_reset` - Request password reset
- `PATCH /password_reset` - Reset password with token
- `POST /verify_code` - Verify email
- `POST /resend_verification` - Resend verification email

**Organizations**

- `GET /api/v1/presents/organizations` - List all organizations
- `GET /api/v1/presents/me/organization` - Get current user's organization
- `GET /api/v1/presents/organizations/:slug` - Get organization by slug
- `POST /api/v1/presents/organizations` - Create organization
- `PATCH /api/v1/presents/organizations/:slug` - Update organization
- `DELETE /api/v1/presents/organizations/:slug` - Delete organization

**Events**

- `GET /api/v1/presents/events/:id` - Get event details
- `GET /api/v1/presents/organizations/:slug/events` - Get organization's events
- `GET /api/v1/presents/events` - List all events (with filters)
- `POST /api/v1/presents/organizations/:slug/events` - Create event
- `PATCH /api/v1/presents/events/:slug` - Update event
- `DELETE /api/v1/presents/events/:slug` - Delete event

**Event Registrations**

- `POST /api/v1/presents/events/:slug/registrations` - Submit vendor application
- `GET /api/v1/presents/registrations/track/:ticket_code` - Track application status
- `PATCH /api/v1/presents/registrations/:id` - Update registration status (producer only)

**Vendor Applications**

- `GET /api/v1/presents/events/:slug/vendor_applications` - Get event's applications
- `GET /api/v1/presents/vendor_applications/:id` - Get application details
- `POST /api/v1/presents/events/:slug/vendor_applications` - Create application
- `PATCH /api/v1/presents/vendor_applications/:id` - Update application
- `DELETE /api/v1/presents/vendor_applications/:id` - Delete application
- `GET /api/v1/presents/vendor_applications/:id/submissions` - Get submissions
- `GET /api/v1/presents/vendor_applications/lookup/:code` - Lookup by code

**Email**

- `POST /api/email/contact` - Submit contact form
- `GET /api/email/contact` - Get contact submissions
- `POST /api/email/send` - Send email
- `GET /api/email/templates` - Get email templates
- `GET /api/email/threads` - Get email threads

### Request/Response Patterns

**Standard Request Body Format:**

```typescript
// Single resource
{ [resource_name]: { field1, field2, ... } }

// Example: Create event
{
  event: {
    title: string,
    description: string,
    event_date: string,
    ...
  }
}
```

**Response Format:**

```typescript
// Single resource
{ field1, field2, ... }

// Multiple resources
[{ id, ... }, { id, ... }]

// Nested
{
  [resource_name]: { field1, field2, ... },
  meta: { pagination, counts }
}
```

**Error Response Format:**

```typescript
{
  error: string,           // Main error message
  errors: string[],        // Array of validation errors
  message: string
}
```

---

## 6. Existing Invitation and User Onboarding Flows

### Current Invitation Architecture (Frontend Only)

**Status:** Partially implemented in frontend, backend integration pending

**What Exists:**

1. **Event Creation Wizard (Step 3)**
   - Producers can select vendor contacts from their network
   - Multi-select interface with search/filter
   - Selected contact IDs captured in wizard state
   - Location: `/src/components/producer/CreateEventWizard/steps/Step3InviteList.tsx`

2. **Vendor Network/Contacts Page**
   - Producers can view/manage their vendor contacts
   - Add, edit, delete vendor contacts
   - Tag vendors, organize by business type
   - Location: `/src/components/producer/Network/`

3. **Event Management Commands Center**
   - View vendor applications for events
   - Track application status (pending, approved, rejected, etc.)
   - View submission details
   - Location: `/src/components/producer/CommandCenter.tsx`

**What's Missing (Backend Only):**

- Actual invitation creation and storage
- Email notifications to invited vendors
- Public invitation view page
- Accept/decline interface
- Invitation tracking and analytics

**Frontend Ready-to-Implement** (see docs/BACKEND_INVITATION_REQUIREMENTS.md):

```typescript
// Currently logs to console but doesn't persist:
if (wizardState.inviteList.invitedContactIds.length > 0) {
  console.log(`Inviting ${wizardState.inviteList.invitedContactIds.length} contacts`)
  // TODO: Uncomment when backend is ready
  // await eventInvitationsApi.createBatch(newEvent.slug, invitedContactIds);
}
```

### Public Application/Registration Flow

**Vendor Application Process (Public):**

1. **Public Event Discovery** (`/events/:slug`)
   - Any user can view event details
   - See vendor application opportunity
   - No authentication required

2. **Vendor Application Form** (`/events/:slug/apply`)
   - Form: Contact name, email, phone, business name, category
   - Optional: Subscribe to updates checkbox
   - Submit application

3. **Application Confirmation** (`/applications/success`)
   - Shows ticket code for tracking
   - User can track status with ticket code

4. **Application Tracking** (`/applications/track/:ticketCode`)
   - Public endpoint - no auth required
   - Shows application status (pending, approved, rejected, etc.)
   - Uses ticket code from registration

**Short URL Redirect** (`/apply/:code`)

- Short code redirects to actual application form
- Helps with marketing/sharing

### Producer Event Management Flow

**Event Lifecycle:**

1. **Event Creation (ProducerDashboard)**
   - 4-step wizard:
     - Step 1: Basic info (title, date, location)
     - Step 2: Event settings (capacity, pricing, status)
     - Step 3: Vendor invitations (select contacts)
     - Step 4: Review & confirm
   - Event automatically created and organization assigned

2. **Event Management (CommandCenter)**
   - View event details
   - Create vendor applications form
   - View submitted applications
   - Approve/reject vendors
   - Track registrations

3. **Vendor Management (VendorsTab)**
   - View all vendors
   - Filter by status
   - View submission details
   - Update vendor status

4. **Applications Tracking (ApplicationsTab)**
   - View all vendor applications
   - Track application count
   - View submission details

### Producer Onboarding

**First-Time Producer Flow:**

1. User signs up with "producer" role
2. Redirected to `/producer/pending` (ProducerDashboard)
3. Organization auto-created if not exists
4. Presented with empty state for events
5. Can start creating events immediately
6. Can access Network page to add vendor contacts

### Vendor Onboarding

**Vendor Self-Service Flow:**

1. Vendor navigates to event page (`/events/:slug`)
2. Views event details and vendor application info
3. Clicks "Apply as Vendor"
4. Fills application form
5. Receives ticket code for tracking
6. Can track application status with ticket code

**Alternative: Invitation-Based Flow (Future)**

1. Producer invites vendor from network
2. Vendor receives invitation email
3. Vendor clicks link to view invitation
4. Vendor accepts/declines invitation
5. If accepted, can apply for vendor spot

---

## Summary

This is a modern, role-based SaaS event management platform with:

- **Clean Architecture:** Separation of concerns with services, components, contexts
- **Type Safety:** Full TypeScript coverage
- **Scalable UI:** Radix UI + TailwindCSS component system
- **Flexible Auth:** Role-based access with context-driven state
- **Analytics:** Mixpanel integration for tracking user behavior
- **Public & Private Routes:** Different access levels for different user types
- **Progressive Enhancement:** Core features work without authentication

The application is production-ready but the event invitation system (for producers inviting vendors) is awaiting backend implementation per the requirements document.
