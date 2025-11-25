# Voxxy Presents Client - Comprehensive Application Architecture

## Executive Summary
This is a React + TypeScript web application built with Vite, providing event management and vendor coordination functionality. The app uses React Context API for authentication state management with role-based access control, communicating with a Rails backend API.

---

## 1. AUTHENTICATION FLOW

### 1.1 Authentication Architecture

**State Management**: React Context API (no Redux)
- **File**: `/src/contexts/AuthContext.tsx`
- **Provider**: `AuthProvider` wraps entire app in `App.tsx`
- **Hook**: `useAuth()` provides access to auth state

**Key Auth Features**:
- JWT-based authentication (Rails token)
- Token stored in localStorage (`railsAuthToken`)
- User profile caching with TTL (5 minutes)
- Support for multiple user roles (producer, vendor, consumer, admin)
- Email verification tracking

### 1.2 Authentication Flow Details

#### Login Flow
```
1. User submits credentials on LoginPage
2. authApi.login() sends POST to /login endpoint
3. Backend returns JWT token
4. Token saved to localStorage (via saveAuthToken())
5. authApi.getCurrentUser() fetches full user profile
6. User profile cached in localStorage
7. RedirectIfAuthenticatedV2 component routes user by role
```

**Files Involved**:
- `/src/pages/LoginPage.tsx` - Login UI
- `/src/components/auth/LoginForm.tsx` - Unified login form
- `/src/contexts/AuthContext.tsx` - Auth state (handleSignIn method)
- `/src/services/api.ts` - authApi.login() and authApi.getCurrentUser()

#### Signup Flow
```
1. User submits registration via contact form (beta access)
2. authApi.signup() sends POST to /users endpoint
3. If email exists (from mobile), attempts login instead
4. Automatic login after signup (calls authApi.login())
5. User profile fetched and cached
6. Redirects to role-based holding screen
```

**Files Involved**:
- Contact form at `/src/pages/ContactPage.tsx`
- `/src/contexts/AuthContext.tsx` - handleSignUp method
- `/src/services/api.ts` - authApi.signup()

#### Logout Flow
```
1. User clicks logout in any dashboard
2. removeCachedUserProfile() clears cached profile
3. authApi.logout() sends DELETE to /logout endpoint
4. clearAuthToken() removes token from localStorage
5. Auth state cleared (currentUser, userProfile set to null)
6. User redirected to home page
```

**Files Involved**:
- All dashboards: ProducerDashboard, VendorDashboard, AdminDashboard, BetaPendingPage
- `/src/contexts/AuthContext.tsx` - handleSignOut method
- `/src/services/api.ts` - authApi.logout(), clearAuthToken()

### 1.3 Token Management

**Storage**: localStorage
- **Key**: `railsAuthToken`
- **Type**: JWT token string

**Token Operations**:
```typescript
// Save token
saveAuthToken(token: string): void

// Get token
getAuthToken(): string | null

// Clear token
clearAuthToken(): void
```

**Location**: `/src/services/api.ts` (lines 6-32)

**Token Usage**:
- Added to Authorization header for authenticated API requests
- Sent as: `Authorization: Bearer {token}`
- Public endpoints (login, signup, password reset) exclude the token

### 1.4 User Profile Management

**User Type** (`/src/contexts/AuthContext.tsx`):
```typescript
interface User {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'
  confirmed_at: string | null // Email verification status
  avatar?: string
  profile_pic?: string
  username?: string
  status?: 'active' | 'suspended' | 'banned'
  product_context?: 'mobile' | 'presents' | 'both'
}
```

**Profile Caching**:
- Cache key: `user_profile_rails-user`
- TTL: 5 minutes
- Implements instant load on app start with background refresh
- Automatically cleared on logout

**Helper Methods**:
```typescript
cacheUserProfile(uid: string, profile: T): void
getCachedUserProfile(uid: string): T | null
removeCachedUserProfile(uid: string): void
```

---

## 2. PROTECTED ROUTES & AUTHORIZATION

### 2.1 Route Protection Components

#### RedirectIfAuthenticatedV2 (Auth Page Protection)
**File**: `/src/components/auth/ProtectedRouteV2.tsx`

**Purpose**: Prevent authenticated users from accessing auth pages (login, signup, password reset)

**Behavior**:
- If authenticated, redirects by role to appropriate holding screen
- If not authenticated, shows the auth page
- Shows nothing while loading to avoid flash

**Usage**:
```jsx
<Route path="/login" element={
  <RedirectIfAuthenticatedV2>
    <LoginPage />
  </RedirectIfAuthenticatedV2>
} />
```

#### AdminRoute (Admin-Only Protection)
**File**: `/src/components/auth/AdminRoute.tsx`

**Purpose**: Restrict admin dashboard to only admin users

**Behavior**:
```
1. Check if loading
   → Show LoadingTransition with "Verifying admin access..."
2. Check if authenticated
   → If not, redirect to /auth
3. Check if admin (isAdmin from context)
   → If not, redirect to home page
4. If admin, render children
```

**Usage**:
```jsx
<Route path="/admin/dashboard" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />
```

### 2.2 Role-Based Redirects

**RoleBasedDashboardRedirect** function in App.tsx (lines 47-100):

**Redirect Logic**:
```
- Producer/Venue Owner → /producer/pending
- Vendor → /vendor/pending
- Consumer/Guest → /pending
- Admin → /admin/dashboard
- Unknown role → /
```

### 2.3 Protected Routes Summary

**Public Routes** (no auth required):
- `/` - HomePage
- `/features`, `/pricing`, `/help`, `/contact`, `/about`
- `/privacy`, `/terms`
- `/events/:slug` - Public event details
- `/events/:slug/apply` - Vendor application form
- `/applications/success` - Application confirmation
- `/applications/track/:ticketCode` - Application tracking

**Auth Routes** (redirect if authenticated):
- `/login` - Login page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/verify-email` - Email verification

**Protected User Routes** (require authentication):
- `/pending` - Consumer/Guest holding screen (BetaPendingPage)
- `/producer/pending` - Producer dashboard
- `/vendor/pending` - Vendor dashboard
- `/admin/dashboard` - Admin dashboard (AdminRoute)

---

## 3. APPLICATION STRUCTURE

### 3.1 Folder Organization

```
/src
├── App.tsx                          # Main app with routing
├── main.tsx                         # Entry point (React.StrictMode)
├── index.css                        # Global styles
├── components/
│   ├── auth/                        # Auth components
│   │   ├── AdminRoute.tsx
│   │   ├── ProtectedRouteV2.tsx
│   │   ├── LoginForm.tsx
│   │   ├── SignUpForm.tsx
│   │   └── [other auth forms]
│   ├── producer/                    # Producer-specific components
│   ├── debug/                       # Debug panel (dev only)
│   ├── ui/                          # Shadcn UI components
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   └── [other shared components]
├── contexts/
│   └── AuthContext.tsx              # Auth state management
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── EmailVerificationPage.tsx
│   ├── BetaPendingPage.tsx         # Consumer holding screen
│   ├── ProducerDashboard.tsx       # Producer interface
│   ├── VendorDashboard.tsx         # Vendor interface
│   ├── AdminDashboard.tsx          # Admin interface
│   ├── PublicEventDetailPage.tsx
│   ├── VendorApplicationForm.tsx
│   ├── SettingsPage.tsx
│   └── [other pages]
├── services/
│   ├── api.ts                       # API calls & token management
│   └── subscriptionService.ts
├── hooks/
│   ├── useAuth.ts                   # Re-export of useAuth
│   ├── useFormTracking.ts
│   ├── usePageTracking.ts
│   └── useSectionTracking.ts
├── utils/
│   ├── cache.ts                     # Local caching utility
│   ├── validation.ts
│   ├── validateEnv.ts
│   ├── environmentValidator.ts
│   └── [other utilities]
├── config/
│   └── environments.ts              # Environment configuration
├── lib/
│   └── analytics.ts                 # Mixpanel analytics
├── types/
│   └── env.d.ts
└── styles/
    └── [CSS files]
```

### 3.2 Key Entry Points

**Application Root**:
- `/src/main.tsx` - Creates React root, validates env, renders App
- `/src/App.tsx` - Wraps with AuthProvider, sets up Router with all routes

**Initialization Order**:
```
1. main.tsx: validateEnv()
2. main.tsx: createRoot().render()
3. App.tsx: AuthProvider wraps Router
4. AuthContext: useEffect checks for existing auth token
5. App: Routes setup with RedirectIfAuthenticatedV2 guards
```

### 3.3 State Management Approach

**No Redux/Zustand** - Uses React Context API exclusively

**Auth Context Structure**:
```typescript
interface AuthContextType {
  // State
  currentUser: User | null
  userProfile: User | null
  loading: boolean
  error: string | null
  
  // Actions
  signUp(data: SignUpData): Promise<void>
  signIn(data: SignInData): Promise<void>
  signOut(): Promise<void>
  resetPassword(email: string): Promise<void>
  clearError(): void
  refreshUserProfile(): Promise<void>
  
  // Computed values
  isAuthenticated: boolean
  isEmailVerified: boolean
  isAdmin: boolean
  isProducer: boolean
  isVendor: boolean
  isGuest: boolean
  hasRole(role: User['role']): boolean
}
```

### 3.4 API Integration Pattern

**API Service Location**: `/src/services/api.ts`

**Structure**:
```typescript
// Token management functions
export function saveAuthToken(token: string): void
export function getAuthToken(): string | null
export function clearAuthToken(): void

// Auth API
export const authApi = {
  login(email, password),
  signup(data),
  logout(),
  getCurrentUser(),
  updateUser(userId, updates),
  requestPasswordReset(email),
  resetPasswordWithToken(token, password),
  verifyEmailCode(code),
  resendVerificationEmail(email)
}

// Organizations API
export const organizationsApi = {
  getAll(params),
  getBySlug(slug),
  create(orgData),
  update(slug, orgData),
  delete(slug)
}

// Events API
export const eventsApi = {
  getById(id),
  getByOrganization(organizationSlug),
  // ... more methods
}

// Admin API
export const adminApi = {
  getAllUsers()
  // ... more methods
}
```

**Error Handling**:
```typescript
class ApiError extends Error {
  status: number
  errors?: string[]
}
```

**Request Headers**:
- `Content-Type: application/json` - Always
- `Authorization: Bearer {token}` - For authenticated endpoints
- `X-Mobile-App: true` - For login endpoint (required for JWT)

---

## 4. ENVIRONMENT CONFIGURATION

### 4.1 Environment Detection

**File**: `/src/config/environments.ts`

**Detection Logic**:
1. Check for explicit `VITE_ENVIRONMENT` override
2. Detect by hostname:
   - localhost/127.0.0.1 → development
   - onrender.com or staging (not Heroku) → staging
   - All others → production

**Configuration Options**:
```typescript
interface EnvironmentConfig {
  name: 'development' | 'staging' | 'production'
  dataSource: 'api'
  apiBaseUrl: string
  features: {
    adminControls: boolean
    debugMode: boolean
    experimentalFeatures: boolean
    dataSyncFromProduction: boolean
  }
}
```

### 4.2 Environment Variables

**Required Variables** (validated in `validateEnv.ts`):
```
VITE_ENVIRONMENT          # development | staging | production
VITE_API_BASE_URL         # API endpoint URL
VITE_MIXPANEL_TOKEN       # Analytics token
VITE_DEBUG_MODE           # Enable debug logging
VITE_EXPERIMENTAL_FEATURES # Enable beta features
```

**Example .env.production**:
```
VITE_ENVIRONMENT=production
VITE_API_BASE_URL=https://www.heyvoxxy.com/api
VITE_MIXPANEL_TOKEN=3a0b59ad74eb6f0b0f5947adbbf947a4
VITE_DEBUG_MODE=false
VITE_EXPERIMENTAL_FEATURES=false
```

### 4.3 API Base URL Resolution

```typescript
const API_BASE_URL = getApiUrl() 
  || import.meta.env.VITE_API_BASE_URL 
  || 'http://localhost:3001/api'
```

**By Environment**:
- Development: `https://www.voxxyai.com/api`
- Staging: `https://www.voxxyai.com/api`
- Production: `https://www.heyvoxxy.com/api`

---

## 5. THIRD-PARTY SERVICES

### 5.1 Authentication Service
**None** - Custom JWT implementation with Rails backend

### 5.2 Analytics
**Service**: Mixpanel
- **Token**: Environment variable `VITE_MIXPANEL_TOKEN`
- **Location**: `/src/lib/analytics.ts`
- **Features**:
  - User sign-in tracking
  - Page view tracking
  - Event tracking
  - Form submission tracking

### 5.3 UI Component Library
**Framework**: Shadcn UI + Radix UI
- Located in `/src/components/ui/`
- Provides: buttons, inputs, cards, dialogs, tabs, etc.
- Styled with Tailwind CSS

### 5.4 Other Tools
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Build Tool**: Vite
- **HTTP Client**: Native Fetch API

---

## 6. KEY FILES FOR AUTH REFERENCE

### Critical Auth Files (In Order of Importance)
1. **`/src/contexts/AuthContext.tsx`** (356 lines)
   - Main auth state management
   - All auth methods (signIn, signUp, signOut, resetPassword, etc.)
   - User profile caching logic
   - Role-based helper methods

2. **`/src/services/api.ts`** (800+ lines)
   - Token management (saveAuthToken, getAuthToken, clearAuthToken)
   - authApi object with all auth endpoints
   - Error handling and API request logic

3. **`/src/App.tsx`** (213 lines)
   - Router setup
   - Route definitions with protections
   - RoleBasedDashboardRedirect component
   - Auth guard components setup

4. **`/src/components/auth/AdminRoute.tsx`** (34 lines)
   - Admin-only route protection
   - Role checking logic

5. **`/src/components/auth/ProtectedRouteV2.tsx`** (50 lines)
   - Redirect authenticated users from auth pages
   - Role-based redirect routing

6. **`/src/utils/cache.ts`** (155 lines)
   - User profile caching with TTL
   - Cache utility functions

7. **`/src/config/environments.ts`** (129 lines)
   - Environment detection
   - API URL configuration
   - Feature flag management

8. **`/src/pages/LoginPage.tsx`** (284 lines)
   - Login form UI
   - Form validation
   - Error handling

9. **`/src/pages/BetaPendingPage.tsx`** (162 lines)
   - Consumer/guest holding screen
   - Logout functionality
   - Example of dashboard implementation

---

## 7. AUTHENTICATION FLOW DIAGRAMS

### Login Process
```
LoginPage Component
    ↓
User submits email/password
    ↓
handleSignIn() in AuthContext
    ↓
authApi.login() → POST /login
    ↓
Backend returns: { token, id, ... }
    ↓
saveAuthToken(token) → localStorage
    ↓
authApi.getCurrentUser() → GET /me
    ↓
Backend returns: { id, email, role, ... }
    ↓
setCurrentUser() & setUserProfile()
    ↓
cacheUserProfile() → localStorage
    ↓
RedirectIfAuthenticatedV2 routes by role:
  - producer/venue_owner → /producer/pending
  - vendor → /vendor/pending
  - consumer/guest → /pending
  - admin → /admin/dashboard
```

### Logout Process
```
Dashboard Logout Button
    ↓
handleSignOut() in AuthContext
    ↓
removeCachedUserProfile() → Remove from localStorage
    ↓
authApi.logout() → DELETE /logout
    ↓
clearAuthToken() → Remove from localStorage
    ↓
setCurrentUser(null)
setUserProfile(null)
    ↓
Navigate to /
```

### Protected Route Access
```
User accesses /admin/dashboard
    ↓
AdminRoute component checks:
  1. loading? → Show LoadingTransition
  2. !isAuthenticated? → Redirect to /auth
  3. !isAdmin? → Redirect to /
  4. isAdmin? → Render AdminDashboard
    ↓
AdminDashboard displays admin interface
```

---

## 8. ROLE MAPPING

**System Roles**:
```
consumer   → Regular user (guest access)
guest      → Same as consumer
vendor     → Event vendor/supplier
producer   → Event organizer/producer
venue_owner→ Maps to 'producer' role (legacy)
admin      → Administrative access
```

**Role-Based Access**:
- **Admin**: Full system access, admin dashboard
- **Producer/Venue Owner**: Event management, organization creation
- **Vendor**: Vendor application, registration
- **Consumer/Guest**: Beta access pending page

---

## 9. AUTHENTICATION STATE PERSISTENCE

**On App Load**:
```
1. Check localStorage for 'railsAuthToken'
2. If token exists:
   a. Load cached profile (if available)
   b. Show cached profile immediately
   c. Fetch fresh profile in background
   d. Update cache with fresh data
3. If no token:
   a. Clear any cached profile
   b. Set authenticated = false
4. Set loading = false
```

**Cache Details**:
- **Key Format**: `user_profile_rails-user`
- **Storage**: localStorage
- **TTL**: 5 minutes
- **On Logout**: Cache cleared immediately

---

## 10. ERROR HANDLING

**Auth Errors**:
```typescript
throw new ApiError(message: string, status: number, errors?: string[])
```

**Common Error Scenarios**:
- Invalid credentials → "Invalid email or password"
- Email already exists → "Email has already been taken"
- Expired token → Token cleared, user logged out
- Network error → Displayed to user with retry option
- API errors → Caught and re-thrown with user-friendly message

**Error Display**:
- LoginPage: Shows in Alert component at top of form
- AuthContext: Stores in `error` state
- Components: Call `clearError()` to dismiss

---

## 11. SUMMARY TABLE

| Aspect | Implementation |
|--------|-----------------|
| **Auth Library** | No external library (custom JWT) |
| **State Management** | React Context API |
| **Token Storage** | localStorage |
| **Session Type** | JWT (stateless) |
| **Protected Routes** | RedirectIfAuthenticatedV2, AdminRoute |
| **Role-Based Access** | Custom role helpers in context |
| **Email Verification** | Via confirmed_at field |
| **Password Reset** | Email + token flow |
| **Auto-Login** | After signup |
| **Persistent Login** | Token in localStorage checked on mount |
| **Logout** | Clears token + cache, deletes server session |
| **Profile Caching** | 5-minute TTL in localStorage |
| **API Base** | Environment-based URL |
| **Error Handling** | ApiError class with status/messages |

---

## 12. KEY INSIGHTS

1. **No External Auth Library**: The app implements authentication directly with Rails backend using JWT tokens
2. **Context-Based Architecture**: All auth state is managed through React Context, making it simple and accessible
3. **Caching Strategy**: Smart cache with TTL provides instant UX while keeping data fresh
4. **Role-Based Routing**: Different holding screens for different user types (producer, vendor, consumer)
5. **Flexible Role System**: Supports multiple role names (venue_owner as alias for producer)
6. **Clean Separation**: Auth concerns are isolated in context and services
7. **Protected Dashboard Routes**: Multiple dashboards with role-specific protections
8. **Environment-Based Configuration**: Seamless switching between dev/staging/production
9. **Error Recovery**: Token expiration handled gracefully with auto-logout
10. **Beta Access Model**: Users start in pending state awaiting approval

