# Phase 1, Day 1 - Database Refactoring Progress

**Date**: October 28, 2025 (Tuesday Evening)
**Status**: In Progress - 50% Complete
**Goal**: Complete comprehensive database refactoring for new developer starting Wednesday AM

---

## ✅ COMPLETED SO FAR

### 1. Migration Script ✅
- **File**: `/voxxy-presents-api/src/scripts/migrate-roles-v3.ts`
- **Purpose**: Migrate all user roles and profile field names
- **Features**:
  - Dry run mode (`--dry-run`)
  - Automatic backup before migration
  - Rollback capability
  - Detailed logging
  - Support for both old and new roles temporarily

**Role Migrations**:
- `organizer` → `producer`
- `club_owner` → `producer`
- `venue_owner` → `vendor`
- `user` → `guest`

**Field Renames**:
- `organizationProfile` → `producerProfile`
- `venueOwnerProfile` → `vendorProfile`

**Usage**:
```bash
# API directory
npm run migrate:roles-v3 --dry-run  # Test first
npm run migrate:roles-v3             # Run migration
npm run migrate:roles-v3 rollback <backup-file>  # If needed
```

---

### 2. TypeScript Interfaces Updated ✅

#### API Side (`/voxxy-presents-api/src/types/database.ts`)
- ✅ Updated `User` interface with new roles
- ✅ Added `producerProfile` field
- ✅ Updated `vendorProfile` with new vendor types
- ✅ Kept deprecated fields for backward compatibility
- ✅ Added V3.0 comments for clarity

#### Client Side (`/voxxy-presents-client/src/types/database.ts`)
- ✅ Updated `User` interface with new roles
- ✅ Added `producerProfile` field
- ✅ Updated `vendorProfile` with new vendor types
- ✅ Kept deprecated fields for backward compatibility
- ✅ Added V3.0 comments for clarity

#### Vendor Types (`/voxxy-presents-client/src/types/vendor.ts`)
- ✅ Expanded `VendorType` to include:
  - `venue`
  - `artist` (NEW)
  - `entertainer` (NEW)
  - `lighting_tech` (NEW)
  - `catering`
  - `photographer` (NEW)
  - `market_vendor`

---

### 3. Firestore Security Rules Updated ✅
- **File**: `/voxxy-presents-client/firestore.rules`
- ✅ Updated user creation rules to accept both old and new roles
- ✅ Support for: `producer`, `vendor`, `organizer` (legacy), `venue_owner` (legacy)
- ✅ Admin role checks still work
- ✅ Added V3.0 migration comments

---

### 4. API Role Checks Updated ✅
- **File**: `/voxxy-presents-api/src/routes/admin.ts`
- ✅ Admin users endpoint now queries for both old and new roles
- ✅ Combines results from `producer`, `organizer`, and `club_owner` queries
- ✅ Updated logging to say "producers" instead of "club owners"
- ✅ Backward compatible during migration

---

### 5. Deprecation Tracking ✅
- **File**: `/voxxy-presents-client/DEPRECATIONS.md`
- ✅ Comprehensive list of deprecated fields
- ✅ Routes to remove/redirect
- ✅ Pages and components to update
- ✅ Features that may be removed
- ✅ Safety checklist before removal
- ✅ Phased timeline for cleanup

---

## 🚧 IN PROGRESS / TODO

### 6. Client Auth Code Updates ⏳
Need to update files that check user roles:
- [ ] `/src/contexts/AuthContext.tsx`
- [ ] `/src/services/authService.ts`
- [ ] `/src/components/dashboard/DashboardShell.tsx`
- [ ] `/src/components/auth/ProtectedRouteV2.tsx`

**Strategy**: Accept both old and new roles, but use new roles going forward

---

### 7. Client Route Definitions ⏳
Need to update route paths:
- [ ] `/src/App.tsx` - Main route definitions
- [ ] Update: `/club-owner/*` → `/organization/*`
- [ ] Update: `/venue-owner/*` → `/vendor/*`
- [ ] Update: `/organizer/*` → `/producer/*`
- [ ] Add redirects for old routes (backward compatibility)

---

### 8. UI Labels and Navigation ⏳
Need to update components that display role names:
- [ ] `/src/components/dashboard/RoleBasedNavigation.tsx`
- [ ] `/src/components/auth/BetaAccessGuard.tsx`
- [ ] Any components with "Club Owner" text → "Producer"
- [ ] Any components with "Venue Owner" text → "Vendor"
- [ ] Any "club" references → "organization"

---

### 9. Testing ⏳
- [ ] Run migration script in dry-run mode
- [ ] Test auth still works locally
- [ ] Test all routes work (old and new)
- [ ] Verify role checks work for both old/new roles
- [ ] Build both client and API

---

### 10. Deployment ⏳
- [ ] Deploy API to production
- [ ] Deploy client to production
- [ ] Run migration script on production (with backup!)
- [ ] Smoke test production
- [ ] Verify no users are locked out

---

## 📋 NEW DEVELOPER ONBOARDING NOTES

**For Wednesday AM**: The new developer will find:

1. **Clean Terminology**:
   - `producer` = event organizer (creates organizations, posts events)
   - `vendor` = service provider (browses events, applies to events)
   - `guest` = public user (no login, just views public pages)
   - `admin` = platform owner (Voxxy team)

2. **No More Confusion**:
   - No more "club owner" vs "organizer" confusion
   - No more "venue owner" separate from "vendor"
   - Clear separation: producers create, vendors apply

3. **Migration Strategy**:
   - Old roles still work temporarily
   - All new code should use new roles
   - Backward compatibility maintained until 100% migration
   - Deprecated fields clearly marked with comments

4. **What to Build Next** (Wednesday):
   - Vendor Discovery UI
   - Vendor browsing and saving features
   - Focus on new features, not refactoring

---

## 🎯 SUCCESS CRITERIA FOR TONIGHT

Before going to bed, complete:
- [x] Migration script ready
- [x] TypeScript interfaces updated (both repos)
- [x] Firestore security rules updated
- [x] API role checks updated
- [ ] Client auth code updated
- [ ] Client routes updated
- [ ] UI labels updated
- [ ] Local testing passed
- [ ] Ready to deploy

**Timeline**: Aiming for 11 PM completion (2 more hours of work)

---

## 📝 NOTES

- All old fields kept with `_old` prefix for safety
- Migration creates automatic backup before running
- Rollback script included if something goes wrong
- No breaking changes - both old and new work during migration
- Once 100% migrated, we can clean up deprecated fields in Phase 3

---

**Next Update**: After client-side code updates complete
