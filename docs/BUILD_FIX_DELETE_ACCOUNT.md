# Build Fix: Delete Account Feature

## Problem

Frontend build was failing with TypeScript error:

```
src/pages/BetaPendingPage.tsx(153,21): error TS2339:
Property 'deleteAccount' does not exist on type 'authApi'
```

## Root Cause

The `BetaPendingPage` component was calling `authApi.deleteAccount()`, but this method didn't exist in the API service (`src/services/api.ts`).

## Solution

Added the missing `deleteAccount` method to the `authApi` object in `src/services/api.ts`.

### Implementation

```typescript
/**
 * Delete current user's account
 * DELETE /users/:id (legacy endpoint)
 */
async deleteAccount() {
  // Get current user to get their ID
  const user = await authApi.getCurrentUser()

  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/users/${user.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Failed to delete account' }))
    throw new ApiError(
      data.error || 'Failed to delete account',
      response.status,
      data.errors
    )
  }

  const data = await response.json()

  // Clear auth token after successful deletion
  clearAuthToken()

  return data
}
```

### How It Works

1. **Fetches current user**: Calls `getCurrentUser()` to get the user's ID
2. **Makes DELETE request**: Sends `DELETE /users/:id` to the Rails backend
3. **Includes auth token**: Passes Bearer token for authentication
4. **Handles errors**: Throws ApiError if deletion fails
5. **Clears token**: Calls `clearAuthToken()` after successful deletion
6. **Returns response**: Returns success message from backend

### Backend Endpoint

Maps to the existing Rails endpoint:

```ruby
# app/controllers/users_controller.rb:194-200
def destroy
  if current_user&.destroy
    render json: { message: "User account successfully deleted" }, status: :ok
  else
    render json: { error: "Failed to delete account" }, status: :unprocessable_entity
  end
end
```

**Route**: `DELETE /users/:id` (defined in `config/routes.rb:20`)

## Files Modified

1. **src/services/api.ts**
   - Added `deleteAccount()` method to `authApi` object
   - Placed after `resendVerificationEmail()` method (line 505)

2. **src/pages/BetaPendingPage.tsx**
   - Already calling `authApi.deleteAccount()` (no changes needed)

## Build Results

**Before Fix:**

```
error TS2339: Property 'deleteAccount' does not exist on type 'authApi'
Exited with status 2
```

**After Fix:**

```
✓ built in 6.91s
dist/assets/BetaPendingPage-BzLIBa_v.js  16.76 kB │ gzip: 4.73 kB
```

Build now succeeds! ✅

## Testing Checklist

- [ ] Deploy to staging
- [ ] Navigate to BetaPendingPage
- [ ] Click "Delete Account"
- [ ] Confirm deletion
- [ ] Verify account is deleted from database
- [ ] Verify user is signed out
- [ ] Verify redirect to home page
- [ ] Try logging in with deleted account (should fail)

## Related Files

**Frontend:**

- `/src/services/api.ts` - API service with deleteAccount method
- `/src/pages/BetaPendingPage.tsx` - Uses deleteAccount method

**Backend:**

- `/app/controllers/users_controller.rb` - destroy action
- `/config/routes.rb` - DELETE /users/:id route

**Documentation:**

- `BETA_PENDING_PAGE_DEBUG_FEATURES.md` - Feature documentation

---

**Fixed**: April 16, 2026
**Build Status**: ✅ Passing
**Ready for Deployment**: Yes
