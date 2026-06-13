# Role Mapping Strategy

## Overview

The frontend uses user-friendly labels while the backend uses technical role names. This provides clear UX without requiring backend changes.

---

## Role Mappings

| Backend Role (Database) | Frontend Display | Helper Flag  | Routing             |
| ----------------------- | ---------------- | ------------ | ------------------- |
| `venue_owner`           | **Producer**     | `isProducer` | `/producer/pending` |
| `vendor`                | **Vendor**       | `isVendor`   | `/vendor/pending`   |
| `consumer`              | **Consumer**     | `isGuest`    | `/pending`          |
| `guest`                 | **Guest**        | `isGuest`    | `/pending`          |
| `admin`                 | **Admin**        | `isAdmin`    | `/producer/pending` |

### Legacy Mappings (Deprecated)

| Backend Role | Frontend Display      | Helper Flag   |
| ------------ | --------------------- | ------------- |
| `organizer`  | **Producer (Legacy)** | `isOrganizer` |

---

## Implementation

### 1. Debug Panel Role Switcher

**File:** `src/components/debug/DebugPanel.tsx`

```typescript
// When user clicks "Producer" button:
handleRoleSwitch('venue_owner') // ← Sends venue_owner to backend

// Display logic:
const getDisplayRole = (role?: string) => {
  switch (role) {
    case 'venue_owner':
      return 'PRODUCER' // ← Shows Producer to user
    case 'organizer':
      return 'PRODUCER (Legacy)'
    default:
      return role?.toUpperCase()
  }
}
```

### 2. Auth Context Role Helpers

**File:** `src/contexts/AuthContext.tsx`

```typescript
// isProducer flag includes venue_owner
const isProducer = userProfile?.role === 'producer' || userProfile?.role === 'venue_owner'

// isVendor flag is only vendor
const isVendor = userProfile?.role === 'vendor'
```

### 3. Routing Logic

**File:** `src/App.tsx`

```typescript
// venue_owner routes to Producer holding screen
if (role === 'producer' || role === 'venue_owner') {
  return <Navigate to="/producer/pending" replace />
}

// vendor routes to Vendor holding screen
if (role === 'vendor') {
  return <Navigate to="/vendor/pending" replace />
}
```

---

## Why This Approach?

### ✅ Benefits

1. **No backend changes required** - Rails already uses `venue_owner`
2. **User-friendly labels** - "Producer" is clearer than "Venue Owner" for event organizers
3. **Backward compatible** - Existing `venue_owner` records work without migration
4. **Consistent UX** - All user-facing text says "Producer"
5. **Clean separation** - Backend can keep technical names, frontend shows friendly names

### 🎯 Use Cases

- **Event Organizers** → See "Producer" everywhere in UI
- **Service Providers** → See "Vendor" (catering, photography, etc.)
- **Backend/Database** → Stores as `venue_owner` (technical clarity)
- **Debug Panel** → Shows both backend role and display name

---

## Testing Role Switch

1. Log in as any user
2. Open Debug Panel (top-right corner)
3. Click "🎯 Producer" button
4. Watch console logs:
   ```
   🔄 [ROLE SWITCH] Starting: consumer → venue_owner
   📝 [API] Payload: { user: { role: 'venue_owner' } }
   📥 [API] Response status: 200 OK
   ✅ [ROLE SWITCH] Role verified as venue_owner
   ```
5. Page reloads → Routes to `/producer/pending`
6. Debug panel shows: **"PRODUCER"** (even though backend is `venue_owner`)

---

## Future Considerations

If you ever want to rename `venue_owner` → `producer` in the database:

1. **Rails migration:**

   ```ruby
   class RenameVenueOwnerToProducer < ActiveRecord::Migration[7.0]
     def change
       User.where(role: 'venue_owner').update_all(role: 'producer')

       # Update any role validations
       # ROLES = %w[consumer producer vendor admin guest].freeze
     end
   end
   ```

2. **Frontend cleanup:**

   ```typescript
   // Remove mapping logic, use 'producer' directly
   const isProducer = userProfile?.role === 'producer'

   handleRoleSwitch('producer') // Send producer instead of venue_owner
   ```

---

**Last Updated:** November 8, 2024
