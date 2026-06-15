# Authentication Debugging Guide

## What Changed

I've added comprehensive debug logging throughout the authentication flow to help diagnose why the JWT token isn't being sent on subsequent requests after login.

## How to Test

### 1. Make sure you're on the feature branch

**Frontend:**

```bash
cd /Users/courtneygreer/Development/voxxy-presents-client
git checkout feature/performance-and-crm-updates
git pull
```

**Backend:**

```bash
cd /Users/courtneygreer/Development/voxxy-rails-react
git checkout feature/performance-and-crm-updates
git pull
```

### 2. Start the servers

**Backend (Terminal 1):**

```bash
cd /Users/courtneygreer/Development/voxxy-rails-react
rails server
```

**Frontend (Terminal 2):**

```bash
cd /Users/courtneygreer/Development/voxxy-presents-client
npm run dev
```

### 3. Open browser console and backend logs

- **Frontend logs**: Open browser DevTools console (Chrome: Cmd+Option+J)
- **Backend logs**: Watch the terminal where `rails server` is running

### 4. Attempt login

1. Navigate to http://localhost:5173
2. Try to login with test credentials:
   - Email: `test-producer@voxxypresents.com`
   - Password: `TestPassword123!`

### 5. Watch the debug logs

You should see detailed logs like this:

**Frontend Console (Browser DevTools):**

```
🔐 [AUTH DEBUG] Token saved to localStorage: {key: "railsAuthToken", tokenLength: 156, tokenPreview: "eyJhbGciOiJIUzI1NiJ9..."}
🔍 [AUTH DEBUG] Token retrieved from localStorage: {hasToken: true, tokenLength: 156, ...}
🌐 [AUTH DEBUG] Making API request: {method: "GET", endpoint: "/me", isPublicAuthEndpoint: false}
✅ [AUTH DEBUG] Authorization header added to request
📤 [AUTH DEBUG] Request headers: {hasAuthorization: true, headers: ["Content-Type", "Authorization"]}
```

**Backend Logs (Rails Terminal):**

```
🔐 [AUTH DEBUG] Login attempt - email: test-producer@voxxypresents.com
✅ [AUTH DEBUG] Authentication successful for user: test-producer@voxxypresents.com (id: 123)
📱 [AUTH DEBUG] Mobile app request - generating JWT token
🔑 [AUTH DEBUG] JWT token generated: eyJhbGciOiJIUzI1NiJ9... (length: 156)

🔐 [AUTH DEBUG] Starting authorization check
🔐 [AUTH DEBUG] Request path: GET /me
✅ [AUTH DEBUG] Authorization header present
🔍 [AUTH DEBUG] Token extracted: eyJhbGciOiJIUzI1NiJ9... (length: 156)
🔓 [AUTH DEBUG] Token decoded: {:user_id=>123}
✅ [AUTH DEBUG] User found: test-producer@voxxypresents.com (id: 123)
✅ [AUTH DEBUG] Authorization successful
```

## What We're Looking For

The debug logs will tell us:

1. **Is the token being saved?**
   - Look for: `🔐 [AUTH DEBUG] Token saved to localStorage`
   - If missing: Token isn't being returned from backend or saveAuthToken isn't being called

2. **Is the token being retrieved?**
   - Look for: `🔍 [AUTH DEBUG] Token retrieved from localStorage`
   - If `hasToken: false`: Token was never saved or was cleared

3. **Is the Authorization header being added?**
   - Look for: `✅ [AUTH DEBUG] Authorization header added to request`
   - If missing: Check if endpoint is being treated as public

4. **Is the backend receiving the token?**
   - Look for: `✅ [AUTH DEBUG] Authorization header present`
   - If missing: Frontend isn't sending the header (network issue or code bug)

5. **Is the token valid?**
   - Look for: `🔓 [AUTH DEBUG] Token decoded: {:user_id=>...}`
   - If missing: Token is malformed or expired

6. **Is the user being found?**
   - Look for: `✅ [AUTH DEBUG] User found: email (id: ...)`
   - If missing: User was deleted or token has wrong user_id

## Common Issues to Look For

### Issue 1: Token not saved to localStorage

**Symptom:** Login succeeds but subsequent requests fail immediately
**Debug logs will show:**

- ✅ Backend: Token generated
- ❌ Frontend: No "Token saved" message

**Likely cause:** Login response doesn't include token field

### Issue 2: Token saved but not retrieved

**Symptom:** Login works once, but after refresh it fails
**Debug logs will show:**

- ✅ Token saved
- ⚠️ Token retrieved shows `hasToken: false`

**Likely cause:** localStorage being cleared or different storage key

### Issue 3: Token retrieved but not sent

**Symptom:** Token exists but requests fail with 401
**Debug logs will show:**

- ✅ Token retrieved: `hasToken: true`
- ⚠️ Making API request: `isPublicAuthEndpoint: true` (should be false for /me)

**Likely cause:** Endpoint detection logic incorrectly marking /me as public

### Issue 4: Token sent but backend doesn't receive it

**Symptom:** Frontend adds header but backend doesn't see it
**Debug logs will show:**

- ✅ Frontend: Authorization header added
- ❌ Backend: No Authorization header present

**Likely cause:** CORS issue or network interceptor stripping headers

## Next Steps

Once you run the test and see the debug logs:

1. **Copy the browser console logs** (right-click → "Save as...")
2. **Copy the Rails terminal logs** (the section from login attempt through /me request)
3. **Share both with me** so I can diagnose the exact issue

The logs will pinpoint exactly where the authentication flow is breaking, and we can fix it from there.

## Cleanup

When debugging is complete, we can remove these debug logs before merging to main, or keep them permanently (they're helpful for troubleshooting production issues too).
