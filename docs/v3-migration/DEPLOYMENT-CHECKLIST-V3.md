# V3.0 Database Refactoring - Deployment Checklist

**Date**: October 28, 2025 (Tuesday Night)
**Status**: ✅ READY TO DEPLOY
**Commits Ready**: API (653b680), Client (bb20b34)

---

## ✅ PRE-DEPLOYMENT CHECKLIST (ALL COMPLETE)

- [x] API build successful
- [x] Client build successful
- [x] Migration script dry-run tested (7 users, 0 errors)
- [x] TypeScript interfaces updated (both repos)
- [x] Routes configured with redirects
- [x] Auth context updated with new helpers
- [x] Security rules support both old and new roles
- [x] All code committed to git
- [x] Comprehensive documentation created

---

## 🚀 DEPLOYMENT STEPS

### **Step 1: Push to Main (DO THIS FIRST)**

```bash
# API Repository
cd /Users/courtneygreer/Development/voxxy-presents-api
git push origin main

# Client Repository
cd /Users/courtneygreer/Development/voxxy-presents-client
git push origin main
```

**Expected Result**: Both repositories push successfully to GitHub

---

### **Step 2: Monitor Render Deployment**

1. Go to your Render dashboard
2. Watch both API and Client deployments
3. Wait for both to show "Live" status
4. Check build logs for any errors

**Expected Time**: 3-5 minutes per deployment

**If deployment fails**:
- Check build logs in Render
- Verify environment variables are set
- Rollback if necessary: `git revert HEAD && git push`

---

### **Step 3: Smoke Test Production (BEFORE Migration)**

**Test these URLs** (replace with your production domains):

1. **Old routes still work**:
   - `/organizer/dashboard` → should redirect to `/producer/dashboard`
   - `/venue-owner/dashboard` → should redirect to `/vendor/dashboard`
   - `/signup/club-owner` → should redirect to `/signup/producer`

2. **New routes work**:
   - `/producer/dashboard`
   - `/vendor/dashboard`
   - `/signup/producer`
   - `/signup/vendor`

3. **Login works**:
   - Test logging in with an existing user
   - Verify they can access their dashboard
   - Verify redirects work correctly

**Expected Result**: All routes work, redirects happen seamlessly

---

### **Step 4: Run Production Migration**

**⚠️ CRITICAL: Only run this AFTER smoke tests pass!**

```bash
# SSH into your Render API service or use Render Shell
cd /opt/render/project/src

# Test with dry-run first (recommended)
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey-prod.json npm run migrate:roles-v3 -- --dry-run

# If dry-run looks good, run the actual migration
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey-prod.json npm run migrate:roles-v3
```

**Expected Output**:
```
📦 Creating backup of all users...
✅ Backed up X users to: /opt/render/project/src/backups/users-backup-XXXXX.json

🔄 Starting user migration...
🔄 User email@example.com:
   - role: organizer → producer
   ✅ Migrated successfully

================================================================================
📊 MIGRATION SUMMARY
================================================================================
Total users processed: X
Successfully migrated: X
Already migrated: 0
Errors: 0

✅ Migration completed successfully!
```

**⚠️ If errors occur**:
```bash
# Rollback using the backup file path from the migration output
npm run migrate:roles-v3 rollback /path/to/backup-file.json
```

---

### **Step 5: Post-Migration Verification**

**Test these scenarios**:

1. **Existing users can still log in**:
   - Test with a user that was migrated
   - Verify they see their dashboard
   - Verify no data loss

2. **New role checks work**:
   - Producer users see producer dashboard
   - Vendor users see vendor dashboard
   - No permission errors

3. **Legacy code still works**:
   - Old API endpoints still respond
   - Old role checks still pass
   - No authentication errors

4. **Check Firestore directly**:
   - Open Firebase Console
   - Check a few user documents
   - Verify roles updated: `producer`, `vendor`, `guest`
   - Verify profile fields renamed: `producerProfile`, `vendorProfile`

---

## 📊 EXPECTED MIGRATION RESULTS

Based on dry-run:
- **Total users**: 7
- **venue_owner → vendor**: 3 users
- **organizer → producer**: 2 users
- **Profile renames**: 5 users
- **Errors**: 0 (expected)

---

## 🚨 ROLLBACK PLAN

### **If Something Goes Wrong**

#### **Option 1: Revert Git Commits**
```bash
# API
cd /Users/courtneygreer/Development/voxxy-presents-api
git revert HEAD
git push origin main

# Client
cd /Users/courtneygreer/Development/voxxy-presents-client
git revert HEAD
git push origin main
```

#### **Option 2: Rollback Database Migration**
```bash
# Use the backup file created during migration
npm run migrate:roles-v3 rollback /path/to/backup-file.json
```

#### **Option 3: Emergency Fix**
- Old roles still work during transition
- Users won't be locked out
- You can fix issues and re-migrate

---

## ✅ SUCCESS CRITERIA

**Deployment is successful when**:

1. ✅ Both API and Client deployed to production
2. ✅ All routes accessible (old and new)
3. ✅ Redirects working correctly
4. ✅ Migration ran without errors
5. ✅ Existing users can log in
6. ✅ User roles updated in Firestore
7. ✅ No 404 errors on old routes
8. ✅ No authentication errors
9. ✅ Dashboard access working for all roles
10. ✅ No error logs in production

---

## 📝 POST-DEPLOYMENT TASKS

**After confirming everything works**:

1. ✅ Update your team/new developer
2. ✅ Monitor error logs for 24 hours
3. ✅ Check user support tickets
4. ✅ Verify analytics tracking
5. ✅ Document any issues found
6. ✅ Schedule Phase 2 work (Vendor Discovery features)

---

## 🎯 WHAT YOUR NEW DEVELOPER WILL FIND WEDNESDAY

**Clean, modern codebase with**:
- Clear role terminology: `producer`, `vendor`, `guest`
- Consistent route structure: `/producer/*`, `/vendor/*`
- New auth helpers: `isProducer`, `isVendor`, `isGuest`
- Comprehensive documentation in DEPRECATIONS.md
- Zero technical debt from old naming conventions

**They can start building**:
- Vendor Discovery UI (Phase 1, Day 2)
- Event Application System (Phase 1, Day 3)
- Command Center features (Phase 1, Day 4)

---

## 📞 SUPPORT

**If you encounter issues**:
1. Check Render build logs
2. Check browser console for errors
3. Check Firestore for data integrity
4. Review PHASE1-DAY1-COMPLETE.md for implementation details
5. Review DEPRECATIONS.md for what changed

**Migration-specific issues**:
- Backup files stored in: `/backups/` directory
- Migration logs show exactly what changed
- Rollback available anytime

---

## 🎉 YOU'RE READY!

**Everything is committed and ready to push. When you're ready**:

1. Push API to main
2. Push Client to main
3. Wait for deployments
4. Smoke test
5. Run migration
6. Celebrate! 🎊

**Estimated total deployment time**: 15-20 minutes

---

**Status**: ✅ READY TO DEPLOY
**Risk Level**: 🟢 LOW (backward compatible, tested, rollback ready)
**Breaking Changes**: ❌ NONE (all changes backward compatible)

**Good luck! You've got this! 🚀**
