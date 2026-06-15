# Role Switch Debugging Guide

## Changes Made

### 1. Enhanced Debug Panel (`src/components/debug/DebugPanel.tsx`)

- Added step-by-step logging with `[ROLE SWITCH]` prefix
- Added verification step: fetches current user after update to verify role changed
- Added 500ms delay to ensure database has updated
- Shows clear error alert if verification fails

### 2. Enhanced API Logging (`src/services/api.ts`)

- Added detailed logging for `updateUser` with `[API]` prefix
- Logs endpoint, payload, token status, response status, and response data
- Better error messages

## How to Test

1. **Open browser console** (F12 → Console tab)
2. **Log in** to the app
3. **Click a role button** in the debug panel (e.g., "🎯 Producer")
4. **Watch the console** - you should see:

```
🔄 [ROLE SWITCH] Starting: consumer → producer
🔄 [ROLE SWITCH] User ID: 2
📡 [ROLE SWITCH] Calling API to update role...
📝 [API] updateUser - Starting request
📝 [API] Endpoint: http://localhost:3001/users/2
📝 [API] Payload: { user: { role: 'producer' } }
📝 [API] Token: Present
📥 [API] Response status: 200 OK
📥 [API] Response data: { id: 2, email: "...", role: "producer", ... }
✅ [API] Update successful
🔍 [ROLE SWITCH] Verifying role change by fetching current user...
📥 [ROLE SWITCH] Verification response: { id: 2, email: "...", role: "producer", ... }
✅ [ROLE SWITCH] Role verified as producer
🔄 [ROLE SWITCH] Refreshing auth context...
✅ [ROLE SWITCH] Success! Reloading page...
```

## Common Issues & Solutions

### Issue 1: API returns 404

**Console shows:** `📥 [API] Response status: 404 Not Found`

**Solution:** Rails endpoint `/users/:id` doesn't exist. Check Rails routes:

```bash
# In rails console:
rails routes | grep users
```

Should show:

```
PATCH  /users/:id  users#update
```

### Issue 2: API returns 401 Unauthorized

**Console shows:** `📥 [API] Response status: 401 Unauthorized`

**Solution:** JWT token is invalid or expired. Check:

- Is Rails server running?
- Is the token in localStorage valid?
- Check Rails logs for authentication errors

### Issue 3: API returns 200 but role doesn't change

**Console shows:**

```
📥 [API] Response status: 200 OK
❌ [ROLE SWITCH] Role verification failed!
❌ [ROLE SWITCH] Expected: producer, Got: consumer
```

**Solution:** Rails is accepting the request but not saving the role. Check:

- Rails `UsersController#update` permits the `:role` parameter
- Rails model has `role` field
- No validation errors preventing save

**Example Rails controller:**

```ruby
class UsersController < ApplicationController
  def update
    @user = User.find(params[:id])

    if @user.update(user_params)
      render json: @user
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :role, :username, :status)
  end
end
```

### Issue 4: API returns 422 Unprocessable Entity

**Console shows:** `📥 [API] Response status: 422 Unprocessable Entity`

**Solution:** Rails validation failed. Check console for error details:

```
📥 [API] Response data: { errors: ["Role is invalid", "Role must be one of: consumer, vendor, producer, admin, guest"] }
```

Fix: Ensure role value matches Rails enum/validation.

## What to Report Back

Please copy-paste the **full console output** starting from `🔄 [ROLE SWITCH] Starting:` through either:

- `✅ [ROLE SWITCH] Success! Reloading page...` (success case)
- `❌ [ROLE SWITCH] Failed:` (error case)

Also include:

- Your current role before clicking
- Which role button you clicked
- The final role after page reload
- Any Rails server logs if available

---

**Last Updated:** November 8, 2024
