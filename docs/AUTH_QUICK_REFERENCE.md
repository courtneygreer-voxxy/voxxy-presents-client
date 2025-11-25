# Voxxy Presents - Authentication Quick Reference Guide

## TL;DR - Key Authentication Files

| File | Purpose | Lines |
|------|---------|-------|
| `/src/contexts/AuthContext.tsx` | Auth state management (login, logout, signup, profile) | 356 |
| `/src/services/api.ts` | API calls and token management | 800+ |
| `/src/App.tsx` | Router setup and route protection | 213 |
| `/src/components/auth/ProtectedRouteV2.tsx` | Prevent auth users from seeing auth pages | 50 |
| `/src/components/auth/AdminRoute.tsx` | Restrict admin routes | 34 |
| `/src/utils/cache.ts` | User profile caching with TTL | 155 |

---

## Authentication Methods (AuthContext)

### Sign In
```typescript
const { signIn } = useAuth()

await signIn({
  email: "user@example.com",
  password: "password123"
})
```
- Posts to `/login` endpoint with `X-Mobile-App: true` header (required for JWT)
- Saves JWT token to localStorage as `railsAuthToken`
- Fetches and caches user profile (5-minute TTL)
- Redirects based on user role

### Sign Up

> **Note:** Currently all signup routes (`/signup/*`) redirect to `/contact` for beta access requests. The signup API exists but is not actively used for public signups.

```typescript
const { signUp } = useAuth()

await signUp({
  email: "user@example.com",
  password: "password123",
  displayName: "John Doe",
  role: "producer" // or "vendor", "consumer"
})
```
- Posts to `/users` endpoint (when enabled)
- Auto-login after signup
- Handles duplicate emails (attempts login)
- **Current flow:** Users submit contact form → Admin reviews → Account created manually

### Sign Out
```typescript
const { signOut } = useAuth()

await signOut()
```
- Deletes `/logout` endpoint
- Clears token from localStorage
- Clears cached profile
- Sets auth state to null

### Reset Password
```typescript
const { resetPassword } = useAuth()

await resetPassword("user@example.com")
```
- Sends POST to `/password_reset`
- Initiates email verification flow

---

## Accessing Auth State

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const {
    // State
    userProfile,        // Full user object
    currentUser,        // Current user object
    loading,            // Boolean during async operations
    error,              // Error message string
    
    // Authentication
    isAuthenticated,    // Boolean
    isEmailVerified,    // Boolean (confirmed_at != null)
    
    // Roles
    isAdmin,            // Boolean
    isProducer,         // Boolean (includes venue_owner)
    isVendor,           // Boolean
    isGuest,            // Boolean (consumer/guest)
    hasRole('admin'),   // Check specific role
    
    // Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUserProfile,
    clearError,
  } = useAuth()

  return (
    <>
      {isAuthenticated && <p>Hello {userProfile?.name}!</p>}
      {isAdmin && <p>You are an admin</p>}
    </>
  )
}
```

---

## Protected Routes

### Login Page Protection
```jsx
// Prevent authenticated users from seeing login page
<Route path="/login" element={
  <RedirectIfAuthenticatedV2>
    <LoginPage />
  </RedirectIfAuthenticatedV2>
} />
```

### Admin Route Protection
```jsx
// Only admins can access this route
<Route path="/admin/dashboard" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />
```

---

## Role-Based Redirects (After Login)

When user logs in, they're automatically redirected:

```
User Role → Redirect to
producer (venue_owner) → /producer/pending
vendor → /vendor/pending
consumer (guest) → /pending
admin → /admin/dashboard
unknown → /
```

---

## Token Management

### Save Token
```typescript
import { saveAuthToken } from '@/services/api'
saveAuthToken(token: string)
// Stores in localStorage as 'railsAuthToken'
```

### Get Token
```typescript
import { getAuthToken } from '@/services/api'
const token = getAuthToken() // Returns string or null
```

### Clear Token
```typescript
import { clearAuthToken } from '@/services/api'
clearAuthToken()
// Removes from localStorage
```

---

## User Profile Caching

### Cache User Profile
```typescript
import { cacheUserProfile } from '@/utils/cache'
cacheUserProfile('rails-user', userData)
// Stored with 5-minute TTL
```

### Get Cached Profile
```typescript
import { getCachedUserProfile } from '@/utils/cache'
const cached = getCachedUserProfile('rails-user')
```

### Remove Cached Profile
```typescript
import { removeCachedUserProfile } from '@/utils/cache'
removeCachedUserProfile('rails-user')
```

---

## API Endpoints Used

### Authentication
- `POST /login` - Login
- `POST /users` - Signup
- `DELETE /logout` - Logout
- `GET /me` - Get current user profile
- `PATCH /users/:id` - Update user profile

### Password Management
- `POST /password_reset` - Request password reset
- `PATCH /password_reset` - Reset password with token

### Email Verification
- `POST /verify_code` - Verify email code
- `POST /resend_verification` - Resend verification email

---

## User Type Definition

```typescript
interface User {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'
  confirmed_at: string | null        // Email verified if not null
  avatar?: string
  profile_pic?: string
  username?: string
  status?: 'active' | 'suspended' | 'banned'
  product_context?: 'mobile' | 'presents' | 'both'
}
```

---

## Environment Variables Required

```env
VITE_ENVIRONMENT=production              # dev|staging|production
VITE_API_BASE_URL=https://...../api      # API endpoint
VITE_MIXPANEL_TOKEN=xxxxx                # Analytics
VITE_DEBUG_MODE=false                    # true|false
VITE_EXPERIMENTAL_FEATURES=false         # true|false
```

### Environment-Based API URLs
- Development: `https://www.voxxyai.com/api`
- Staging: `https://www.voxxyai.com/api`
- Production: `https://www.heyvoxxy.com/api`

---

## Common Patterns

### Check if User is Authenticated
```typescript
const { isAuthenticated } = useAuth()

if (isAuthenticated) {
  // User is logged in
}
```

### Check User Role
```typescript
const { isProducer, isVendor, isAdmin } = useAuth()

if (isProducer) {
  // Show producer UI
}
```

### Handle Login with Error
```typescript
const { signIn, error, clearError } = useAuth()

try {
  await signIn({ email, password })
  // RedirectIfAuthenticatedV2 handles redirect
} catch (err) {
  // Show error message
  console.error(err)
}

// Clear error when user modifies input
clearError()
```

### Logout and Redirect
```typescript
const { signOut } = useAuth()
const navigate = useNavigate()

async function handleLogout() {
  await signOut()
  navigate('/')
}
```

### Protect Component with Role
```typescript
function AdminPanel() {
  const { isAdmin, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  if (!isAdmin) return <Navigate to="/" />
  
  return <AdminContent />
}
```

---

## Error Handling

### API Errors
```typescript
import { ApiError } from '@/services/api'

try {
  await signIn({ email, password })
} catch (err) {
  if (err instanceof ApiError) {
    console.log(err.message)    // "Invalid email or password"
    console.log(err.status)      // 401
    console.log(err.errors)      // ["Email has been taken"]
  }
}
```

### Common Error Messages
- "Invalid email or password" - Login failed
- "Email has already been taken" - Email exists
- "Failed to get current user" - Profile fetch failed
- "Network error" - Connection issue

---

## Component Usage Examples

### Full Login Component
```typescript
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { signIn, loading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signIn({ email, password })
      // Redirect handled automatically
    } catch (err) {
      // Error displayed via 'error' state
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert>{error}</Alert>}
      <input 
        value={email} 
        onChange={(e) => {
          setEmail(e.target.value)
          clearError()
        }}
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          clearError()
        }}
      />
      <button disabled={loading}>Sign In</button>
    </form>
  )
}
```

### Protected Dashboard
```typescript
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { userProfile, isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div>
      <h1>Welcome, {userProfile?.name}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
```

---

## Debugging Tips

### Check Auth State in Console
```typescript
// Add to any component
const auth = useAuth()
console.log('Auth State:', {
  isAuthenticated: auth.isAuthenticated,
  userRole: auth.userProfile?.role,
  loading: auth.loading,
  error: auth.error,
  token: auth.userProfile?.id
})
```

### View Cached Profile
```javascript
// In browser console
JSON.parse(localStorage.getItem('user_profile_rails-user'))
```

### View Token
```javascript
// In browser console
localStorage.getItem('railsAuthToken')
```

### Enable Debug Mode
```env
VITE_DEBUG_MODE=true
```

---

## Authentication Flow Summary

### Login Flow
```
1. User enters email/password
2. Form validation
3. signIn() called
4. POST /login → gets token
5. saveAuthToken(token) → localStorage
6. GET /me → fetch user profile
7. cacheUserProfile() → localStorage
8. RedirectIfAuthenticatedV2 routes by role
```

### Logout Flow
```
1. signOut() called
2. removeCachedUserProfile() → clear cache
3. DELETE /logout → server session
4. clearAuthToken() → remove token
5. Auth state reset to null
6. Navigate to /
```

### App Startup
```
1. Check localStorage for token
2. If token exists:
   a. Show cached profile immediately
   b. Fetch fresh profile in background
   c. Update cache
3. If no token:
   a. Set authenticated = false
4. Set loading = false
```

---

## Related Files to Check
- `/src/pages/LoginPage.tsx` - Login UI example
- `/src/pages/BetaPendingPage.tsx` - Dashboard with logout example
- `/src/pages/ProducerDashboard.tsx` - Protected dashboard
- `/src/pages/AdminDashboard.tsx` - Admin-only dashboard
- `/src/pages/ForgotPasswordPage.tsx` - Password reset

