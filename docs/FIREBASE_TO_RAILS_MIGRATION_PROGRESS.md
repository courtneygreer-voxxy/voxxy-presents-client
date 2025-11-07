# Firebase to Rails API Migration Progress

**Date:** November 4-5, 2025
**Status:** Phase 1 Complete - Ready for Testing
**Next Session:** Test signup and login flows end-to-end

---

## Executive Summary

Successfully migrated the Voxxy Presents React frontend from Firebase authentication to Rails API authentication. Login and signup flows are fully connected to the Rails backend at `voxxyai.com:3001`. Email verification flow has been implemented and integrated.

---

## ✅ Completed Work

### 1. Rails API Integration

**File: `src/services/api.ts`**

#### Added JWT Token Management
- `saveAuthToken(token)` - Saves JWT to localStorage with key `railsAuthToken`
- `getAuthToken()` - Retrieves JWT from localStorage
- `clearAuthToken()` - Removes JWT from localStorage

#### Updated API Request Handler
```typescript
// Added Authorization header for authenticated requests
if (!isPublicAuthEndpoint) {
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
}
```

#### Implemented Auth API Methods
- ✅ `authApi.login(email, password)` - POST /login with X-Mobile-App header
- ✅ `authApi.signup(data)` - POST /users with auto-login fallback for existing users
- ✅ `authApi.logout()` - DELETE /v1/shared/logout
- ✅ `authApi.getCurrentUser()` - GET /me (using legacy endpoint)
- ✅ `authApi.verifyEmailCode(code)` - POST /verify_code
- ✅ `authApi.resendVerificationEmail(email)` - POST /resend_verification

#### Critical Fixes Applied
1. **X-Mobile-App Header** - Added to login function (line 128) to get JWT token from Rails
2. **Legacy Endpoint Usage** - Using `/me` instead of `/v1/shared/me` (controllers not created yet)
3. **Error Handling** - Properly throwing ApiError with status codes and error messages

---

### 2. Authentication Context Migration

**File: `src/contexts/AuthContext.tsx`**

#### Removed Firebase Dependencies
- ❌ Removed all Firebase imports
- ✅ Replaced with Rails API calls
- ✅ Updated User interface for Rails user structure

#### Updated User Type
```typescript
interface User {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'
  confirmed_at: string | null
  avatar?: string
  profile_pic?: string
  username?: string
  status?: 'active' | 'suspended' | 'banned'
  product_context?: 'mobile' | 'presents' | 'both'
}
```

#### Implemented Token-Based Auth Check
```typescript
useEffect(() => {
  const checkAuth = async () => {
    const token = getAuthToken()
    if (!token) { setLoading(false); return }

    // Try cached profile first (instant load)
    const cachedProfile = getCachedUserProfile<User>('rails-user')
    if (cachedProfile) {
      setCurrentUser(cachedProfile)
      setUserProfile(cachedProfile)
      setLoading(false)
    }

    // Fetch fresh profile from API
    const user = await authApi.getCurrentUser()
    setCurrentUser(user)
    setUserProfile(user)
    cacheUserProfile('rails-user', user)
  }
  checkAuth()
}, [])
```

---

### 3. Email Verification Flow

**New Component: `src/pages/EmailVerificationPage.tsx`**

#### Features
- 6-digit verification code input with auto-formatting
- Resend code functionality
- Success state with auto-redirect to dashboard
- Error handling with prominent display
- Clean UI matching Voxxy Presents design system

#### Integration Points
- **ClubOwnerSignUpPage.tsx:145** - Redirects to `/verify-email` after signup
- **VendorSignUpPage.tsx:227** - Redirects to `/verify-email` after signup
- **App.tsx:192** - Added `/verify-email` route

#### How It Works
1. User signs up → Rails automatically sends verification email (users_controller.rb:31)
2. User redirected to `/verify-email?email=their@email.com`
3. User enters 6-digit code from email
4. On success: `authApi.verifyEmailCode()` → refreshUserProfile() → redirect to dashboard
5. Can resend code if needed via `authApi.resendVerificationEmail()`

---

### 4. Error Handling Improvements

**Files: `src/pages/ClubOwnerLoginPage.tsx`, `src/pages/ClubOwnerSignUpPage.tsx`**

#### Enhanced UI Error Display
- Moved error Alert to top of form for visibility
- Changed styling: `bg-red-500/20 border-red-500` with `text-white font-medium`
- Display actual API error messages instead of generic ones

```typescript
// Before: Generic error
setError('Failed to create account. Please try again.')

// After: Actual API error
if (err instanceof Error) {
  errorMessage = err.message // Shows: "Email has already been taken"
}
setErrors(prev => ({ ...prev, submit: errorMessage }))
```

---

### 5. CORS Configuration

**File: `voxxy-rails/config/application.rb`**

#### Added Origins
```ruby
allowed_origins = [
  "http://localhost:5173",  # Vite dev server
  "https://voxxypresents.com",
  "https://www.voxxypresents.com",
  "https://voxxy-presents-client-staging.onrender.com",
  # ... existing origins
]
```

---

## 🔧 Technical Details

### Authentication Flow

#### Signup Flow
```
User fills signup form
  ↓
ClubOwnerSignUpPage.handleSubmit()
  ↓
useAuth.signUp() → authApi.signup()
  ↓
POST /users with { user: { email, password, password_confirmation, name, role, product_context }}
  ↓
Rails creates user → sends verification email → returns user data
  ↓
authApi.login() → get JWT token → saveAuthToken()
  ↓
Redirect to /verify-email?email=user@email.com
  ↓
User enters code → authApi.verifyEmailCode()
  ↓
Rails verifies → updates confirmed_at
  ↓
refreshUserProfile() → redirect to dashboard
```

#### Login Flow
```
User fills login form
  ↓
ClubOwnerLoginPage.handleSubmit()
  ↓
useAuth.signIn() → authApi.login()
  ↓
POST /login with X-Mobile-App: true header
  ↓
Rails validates → returns { token, user data }
  ↓
saveAuthToken(token) → setCurrentUser(user) → cacheUserProfile()
  ↓
RedirectIfAuthenticated checks role → redirect to role-based dashboard
```

#### Auth Check on Page Load
```
App mounts → AuthProvider useEffect
  ↓
getAuthToken() → token exists?
  ↓
YES: Load cached profile (instant) → fetch fresh profile from /me
  ↓
Update state with user data
  ↓
NO: Set loading: false, show login page
```

### Critical Endpoints Used

| Endpoint | Method | Purpose | Headers |
|----------|--------|---------|---------|
| `/login` | POST | User login, get JWT | `X-Mobile-App: true` |
| `/users` | POST | User signup | Standard |
| `/me` | GET | Get current user | `Authorization: Bearer {token}` |
| `/verify_code` | POST | Verify email with code | Standard |
| `/resend_verification` | POST | Resend verification email | Standard |
| `/v1/shared/logout` | DELETE | Logout user | `Authorization: Bearer {token}` |

---

## 🚧 Known Issues & Limitations

### Issue 1: /v1/shared Controllers Not Created
**Problem:** Routes exist in `config/routes.rb` but controllers missing
- `/api/v1/shared/me` → 404 Not Found
- `/api/v1/shared/users/*` → Routes defined but no controller

**Current Workaround:** Using legacy endpoints
- Using `/me` instead of `/api/v1/shared/me`
- Using `/users` instead of `/api/v1/shared/users`

**Fix Required:** Create controllers at `app/controllers/api/v1/shared/`
```bash
# In voxxy-rails directory
mkdir -p app/controllers/api/v1/shared
# Create users_controller.rb and sessions_controller.rb
```

---

### Issue 2: Email Already Exists Handling
**Problem:** Users from Mobile app trying to sign up on Presents get "Email already taken"

**Current Behavior:**
1. User tries to sign up with existing email
2. Backend returns 422: "Email has already been taken"
3. Frontend catches error and attempts auto-login
4. If login succeeds: User logged in ✅
5. If login fails: Show error "An account with this email already exists. Please login instead or reset your password."

**Limitation:** `product_context` not automatically updated to 'both' when user from Mobile logs into Presents

**Fix Required:** Backend should update `product_context` when user logs in from different product
- Update `sessions_controller.rb` to check current product vs user's product_context
- If different, update to 'both'

---

### Issue 3: User Data Structure Mismatch
**Problem:** Rails returns different structure than expected by some components

**Rails Response:**
```json
{
  "id": 16,
  "name": "Christian Beau Lazear",
  "email": "beaulazear@voxxyai.com",
  "confirmation_code": "334895",
  "confirmed_at": null,
  "needs_policy_acceptance": true,
  "token": "eyJhbGc..."
}
```

**Expected by Frontend:**
```typescript
{
  id: number
  name: string
  email: string
  role: 'producer' | 'vendor' | 'guest' | 'admin'
  confirmed_at: string | null
}
```

**Observation:** User data includes `confirmation_code` in response (security concern?)

**Fix Required:**
1. Backend should not return sensitive fields like `confirmation_code` in user responses
2. Backend should include `role` field in user responses
3. Update serializers to match frontend expectations

---

## 📋 Testing Checklist

### Before Next Session
- [ ] Test signup flow with brand new email
- [ ] Verify verification email is sent
- [ ] Test email verification with 6-digit code
- [ ] Test resend verification code
- [ ] Test login flow with verified account
- [ ] Test login flow with unverified account (should it block?)
- [ ] Test logout functionality
- [ ] Verify token is stored in localStorage
- [ ] Verify cached profile loads instantly on page refresh
- [ ] Test role-based dashboard redirects

### Manual Testing Steps

#### 1. Test Signup Flow
```bash
# Start servers
cd voxxy-rails && rails s -p 3001
cd voxxy-presents-client && npm run dev

# Open browser
open http://localhost:5173/signup/producer

# Fill form with NEW email
email: test+presents@voxxyai.com
password: Test123!@#
name: Test Producer

# Submit and verify:
✓ Redirected to /verify-email?email=...
✓ Email received with 6-digit code
✓ Can enter code and verify
✓ Redirected to /producer/dashboard after verification
```

#### 2. Test Login Flow
```bash
# Open browser
open http://localhost:5173/login/producer

# Fill form with VERIFIED account
email: beaulazear@voxxyai.com
password: [your password]

# Submit and verify:
✓ No errors in console
✓ Token saved to localStorage (key: railsAuthToken)
✓ User data loaded and cached
✓ Redirected to role-based dashboard
```

#### 3. Test Error Handling
```bash
# Try login with wrong password
✓ Error displayed prominently at top of form
✓ Error message is specific (not generic)

# Try signup with existing email
✓ Auto-login attempted
✓ Proper error message shown if auto-login fails
```

---

## 🎯 Next Steps

### High Priority

1. **Test Complete Flow End-to-End**
   - Signup → Verification → Login → Dashboard
   - Document any issues encountered

2. **Create V1 Shared Controllers** (Backend Task)
   ```ruby
   # app/controllers/api/v1/shared/users_controller.rb
   # app/controllers/api/v1/shared/sessions_controller.rb
   ```

3. **Fix User Serializer** (Backend Task)
   - Remove `confirmation_code` from responses
   - Include `role` field
   - Match frontend expectations

4. **Update Product Context Logic** (Backend Task)
   - Auto-update `product_context` to 'both' when user logs in from different product
   - Update `sessions_controller.rb` or add middleware

### Medium Priority

5. **Implement Password Reset Flow**
   - Create frontend pages
   - Test with existing backend endpoints

6. **Add Email Verification Reminder**
   - Show banner on dashboard if not verified
   - Link to resend verification code

7. **Update Role-Based Redirects**
   - Ensure all roles redirect correctly
   - Test producer, vendor, admin, guest roles

### Low Priority

8. **Migrate Remaining Firebase Code**
   - Search for any remaining Firebase imports
   - Update to use Rails API

9. **Add Loading States**
   - Review loading state handling during auth operations
   - Ensure errors display even during loading

10. **Update Documentation**
    - Document new auth flow in README
    - Update environment variable documentation

---

## 🐛 Debugging Tips

### Check Token Storage
```javascript
// In browser console
localStorage.getItem('railsAuthToken')
```

### Check Current User
```javascript
// In browser console
fetch('http://localhost:3001/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('railsAuthToken')}`
  }
}).then(r => r.json()).then(console.log)
```

### Check Verification Code
```ruby
# In Rails console
user = User.find_by(email: 'beaulazear@voxxyai.com')
puts user.confirmation_code
puts user.confirmed_at
```

### Check Rails Logs
```bash
cd voxxy-rails
tail -f log/development.log
```

### Common Errors

#### "useAuth must be used within an AuthProvider"
**Cause:** HMR (Hot Module Reload) state inconsistency
**Fix:** Restart dev server
```bash
# Kill and restart
npm run dev
```

#### "Not Found" when calling /v1/shared/me
**Cause:** Controller doesn't exist yet
**Fix:** Already implemented - using `/me` instead

#### "Invalid response from server" on login
**Cause:** Missing `X-Mobile-App: true` header
**Fix:** Already implemented in api.ts:128

#### CORS errors
**Cause:** Origin not in allowed list
**Fix:** Add origin to `config/application.rb` and restart Rails server

---

## 📁 Modified Files

### Frontend (`voxxy-presents-client/`)
- ✅ `src/services/api.ts` - Added JWT auth, auth API methods
- ✅ `src/contexts/AuthContext.tsx` - Replaced Firebase with Rails API
- ✅ `src/pages/ClubOwnerLoginPage.tsx` - Enhanced error handling
- ✅ `src/pages/ClubOwnerSignUpPage.tsx` - Added verification redirect
- ✅ `src/pages/VendorSignUpPage.tsx` - Added verification redirect
- ✅ `src/pages/EmailVerificationPage.tsx` - **NEW** Email verification UI
- ✅ `src/App.tsx` - Added `/verify-email` route

### Backend (`voxxy-rails/`)
- ✅ `config/application.rb` - Added CORS origins

---

## 💾 Code Snippets for Reference

### Check if User is Authenticated
```typescript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { isAuthenticated, userProfile } = useAuth()

  if (!isAuthenticated) {
    return <p>Please log in</p>
  }

  return <p>Welcome, {userProfile?.name}!</p>
}
```

### Make Authenticated API Request
```typescript
import { getAuthToken } from '@/services/api'

const response = await fetch('http://localhost:3001/some-endpoint', {
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  }
})
```

### Check User Role
```typescript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { isProducer, isVendor, isAdmin, hasRole } = useAuth()

  if (isProducer) {
    // Show producer features
  }

  if (hasRole('admin')) {
    // Show admin features
  }
}
```

---

## 📞 Support & Resources

### Documentation References
- `docs/FIREBASE_TO_RAILS_MIGRATION_GUIDE.md` - Migration guide from Rails repo
- `docs/RAILS_BACKEND_API_ANALYSIS.md` - Comprehensive Rails API analysis
- `docs/IMPLEMENTATION_PATTERNS.md` - V3.0 implementation patterns
- `docs/MIGRATION_QUICK_REFERENCE.md` - Quick reference for V3.0 migration

### Useful Commands
```bash
# Frontend
npm run dev                    # Start Vite dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Backend
rails s -p 3001               # Start Rails server
rails c                        # Open Rails console
rails routes | grep shared     # Check shared routes
```

### Environment Variables
```bash
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENVIRONMENT=development

# Backend (.env)
RAILS_ENV=development
LOCAL_IP=192.168.1.123  # For mobile testing
```

---

## 📝 Notes for Next Session

### What's Working
- ✅ Login successfully connects to Rails API
- ✅ JWT token is returned and saved
- ✅ User data is retrieved and cached
- ✅ Error messages display prominently
- ✅ Email verification flow is implemented

### What Needs Testing
- ⏳ Complete signup → verification → login flow
- ⏳ Email delivery and code verification
- ⏳ Role-based dashboard redirects
- ⏳ Logout functionality
- ⏳ Token persistence across page refreshes

### Known Working Credentials
```
Email: beaulazear@voxxyai.com
Verification Code: 334895
Status: Unverified (confirmed_at: null)
```

### Quick Start for Next Session
```bash
# Terminal 1 - Rails Backend
cd ~/Desktop/voxxy-rails
rails s -p 3001

# Terminal 2 - React Frontend
cd ~/Desktop/voxxy-presents-client
npm run dev

# Browser
open http://localhost:5173
```

---

**Last Updated:** November 5, 2025, 1:59 AM
**Session Duration:** ~2 hours
**Status:** Ready for testing - take a break and come back fresh! 🎉
