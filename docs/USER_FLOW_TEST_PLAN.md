# Voxxy Presents V2 Architecture - Clean Test Plan

## 🚨 CURRENT ISSUES TO FIX

1. **Split Brain Authentication**: Club owner login goes to venue dashboard
2. **Fake Dashboard Data**: Venue dashboard shows mock data instead of real venue info
3. **Complex Role Logic**: Built too many fixes on top of fixes
4. **Database Inconsistency**: Need clean slate to test properly

## 🧹 CLEAN SLATE STRATEGY

### Step 1: Database Reset
```bash
# Clear all Firebase collections (run in Firebase console or via script)
- users collection
- venues collection
- organizations collection
- Clear localStorage in browser
```

### Step 2: Create Fresh Test Users
```
VENUE OWNER TEST:
Email: venue-test@voxxy.com
Role: venue_owner
Flow: Venue Creation → Venue Approval → Venue Dashboard

CLUB OWNER TEST:
Email: club-test@voxxy.com
Role: organizer
Flow: Club Creation → Beta Approval → Organizer Dashboard

ADMIN TEST:
Email: admin@voxxy.com
Role: admin
Flow: Admin Login → All Dashboard Access
```

## 📋 COMPLETE USER FLOW TESTS

### 🏢 VENUE OWNER FLOW
1. **Sign Up**: `/signup/venue-owner`
   - Create account with venue-test@voxxy.com
   - Should create user profile with role: 'venue_owner'
   - Should redirect to email verification

2. **Email Verification**:
   - Verify email in Firebase
   - Should redirect to venue creation

3. **Venue Creation**: `/venues/create`
   - Fill out complete venue form
   - Submit for approval
   - Should redirect to pending page

4. **Admin Approval**:
   - Login as admin
   - Go to venue management tab
   - Approve the venue

5. **Venue Dashboard**: `/venue-owner/dashboard`
   - Should load real venue data (not fake)
   - Should show venue profile matching VenueProfilePage.tsx structure
   - Should have "Preview" button that shows public venue page
   - Should be editable venue information

### 🎯 CLUB OWNER FLOW
1. **Sign Up**: `/signup/club-owner`
   - Create account with club-test@voxxy.com
   - Should create user profile with role: 'organizer'
   - Should redirect to beta pending

2. **Beta Approval**:
   - Admin approves beta status
   - Should redirect to organizer dashboard

3. **Organizer Dashboard**: `/organizer/dashboard`
   - Should show organization management
   - Should NOT show venue information
   - Should have club/event creation tools

### 🔧 ADMIN FLOW
1. **Admin Login**: `/admin/login`
   - Should go to admin dashboard
   - Should see venue approval tab
   - Should see user/beta approval tab

## 🎯 CRITICAL REQUIREMENTS

### Venue Dashboard MUST:
- Load REAL venue data from database
- Match VenueProfilePage.tsx visual structure
- Show editable venue information
- Have preview button that works
- Only show for venue_owner role

### Routing MUST:
- Club owners → `/organizer/dashboard`
- Venue owners → `/venue-owner/dashboard`
- NO crossover between the two

### Data Integration MUST:
- Real venue data in dashboard
- Public venue pages work with real data
- Marketplace integration ready

## 🚀 IMPLEMENTATION PRIORITY

1. **FIRST**: Fix role-based routing split
2. **SECOND**: Replace fake venue dashboard data
3. **THIRD**: Clean database and test flows
4. **FOURTH**: Ensure marketplace integration works

## 📝 SUCCESS CRITERIA

✅ Club owner login → Organizer dashboard (not venue)
✅ Venue owner login → Venue dashboard with real data
✅ Preview button works and shows public venue page
✅ Admin can approve both user types independently
✅ No more building fixes on top of fixes
✅ Clean user flow from signup to functional dashboard

---

**NOTE**: Stop building new features until these core flows work perfectly. The two-sided marketplace depends on this foundation being rock solid.