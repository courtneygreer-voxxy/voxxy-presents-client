# Voxxy Presents - Deprecation & Removal Tracking

**Last Updated**: 2025-10-28
**Purpose**: Track obsolete fields, routes, pages, and features for safe removal after migration to v3.0 (Producer/Vendor model)

---

## 🚨 REMOVAL STRATEGY

1. **Phase 1 (Database Refactor)**: Mark fields as deprecated, add new fields alongside
2. **Phase 2 (Feature Build)**: Use new fields exclusively in new code
3. **Phase 3 (Safe Removal)**: After confirming no production usage, remove deprecated items

---

## 📊 DATABASE FIELDS - DEPRECATED

### **User Collection**

| Field                  | Status        | Reason                                      | Safe to Remove After                 |
| ---------------------- | ------------- | ------------------------------------------- | ------------------------------------ |
| `role: 'organizer'`    | ⚠️ DEPRECATED | Renamed to `producer`                       | All users migrated to new roles      |
| `role: 'club_owner'`   | ⚠️ DEPRECATED | Renamed to `producer`                       | All users migrated to new roles      |
| `role: 'venue_owner'`  | ⚠️ DEPRECATED | Now uses `vendor` role with `vendorProfile` | All users migrated to new roles      |
| `role: 'user'`         | ⚠️ DEPRECATED | Renamed to `guest`                          | All users migrated to new roles      |
| `venueOwnerProfile`    | ⚠️ DEPRECATED | Replaced by `vendorProfile`                 | All venue owners migrated to vendors |
| `betaAccess` (boolean) | ⚠️ DEPRECATED | Replaced by `approvalStatus` field          | After migration confirms no usage    |

### **Organization Collection**

| Field                         | Status        | Reason                                  | Safe to Remove After           |
| ----------------------------- | ------------- | --------------------------------------- | ------------------------------ |
| `aboutImageUrl`               | ⚠️ DEPRECATED | Replaced by `aboutImages[]` array       | All orgs migrated to new field |
| `settings.emailConfiguration` | ⚠️ CONSIDER   | May not be needed in new model          | Confirm email strategy         |
| `backgroundStyle`             | ⚠️ CONSIDER   | Dynamic backgrounds may not be priority | Confirm design system          |

### **Event Collection**

| Field                               | Status        | Reason                                  | Safe to Remove After        |
| ----------------------------------- | ------------- | --------------------------------------- | --------------------------- |
| `presaleEnabled`                    | ⚠️ DEPRECATED | Use `status: 'presale'` instead         | All events using new status |
| `eventbriteUrl`                     | ⚠️ DEPRECATED | Replaced by `ticketingLink`             | Confirm not in use          |
| `category`                          | ⚠️ CONSIDER   | May not align with new event model      | Define new categorization   |
| `tags`                              | ⚠️ PARTIAL    | Exists in client, not API - sync needed | Decide on tags strategy     |
| `demo`                              | ⚠️ CONSIDER   | Demo flag may not be needed             | Confirm admin strategy      |
| `venueId`, `venueSlug`, `venueName` | ⚠️ DEPRECATED | Replaced by `vendorSlots[]`             | After vendor slot migration |

### **Registration Collection**

| Field                            | Status        | Reason                                | Safe to Remove After         |
| -------------------------------- | ------------- | ------------------------------------- | ---------------------------- |
| `registrationType: 'rsvp_yes'`   | ⚠️ CONSIDER   | May not fit new event model           | Define new registration flow |
| `registrationType: 'rsvp_maybe'` | ⚠️ CONSIDER   | May not fit new event model           | Define new registration flow |
| `waitlistPosition`               | ⚠️ CONSIDER   | Separate `Waitlist` collection exists | Consolidate or choose one    |
| `source: 'eventbrite'`           | ⚠️ DEPRECATED | Not integrating Eventbrite in v3      | Confirm integration strategy |

### **Waitlist Collection**

| Field               | Status      | Reason                               | Safe to Remove After     |
| ------------------- | ----------- | ------------------------------------ | ------------------------ |
| _Entire Collection_ | ⚠️ CONSIDER | May be redundant with `Registration` | Define waitlist strategy |

### **EmailTemplate Collection**

| Field                           | Status       | Reason                                     | Safe to Remove After |
| ------------------------------- | ------------ | ------------------------------------------ | -------------------- |
| `htmlTemplate` / `textTemplate` | ⚠️ DUPLICATE | Already have `htmlContent` / `textContent` | Clean up duplication |

### **Venue Collection (Legacy)**

| Field                      | Status        | Reason                                | Safe to Remove After       |
| -------------------------- | ------------- | ------------------------------------- | -------------------------- |
| `claimStatus: 'unclaimed'` | ⚠️ DEPRECATED | All vendors must have `ownerId` in v3 | No unclaimed vendors exist |

---

## 🛣️ ROUTES - DEPRECATED

### **Client Routes to Remove/Redirect**

| Route                 | Status        | Replacement            | Action                     |
| --------------------- | ------------- | ---------------------- | -------------------------- |
| `/club-owner/*`       | ⚠️ DEPRECATED | `/organization/*`      | Add redirect, remove later |
| `/create-club`        | ⚠️ DEPRECATED | `/organization/create` | Add redirect, remove later |
| `/venue-owner/*`      | ⚠️ DEPRECATED | `/vendor/*`            | Add redirect, remove later |
| `/venue-owner/signup` | ⚠️ DEPRECATED | `/vendor/signup`       | Add redirect, remove later |
| `/organizer/*`        | ⚠️ DEPRECATED | `/producer/*`          | Add redirect, remove later |

### **API Routes to Remove/Redirect**

| Route                | Status        | Replacement           | Action                     |
| -------------------- | ------------- | --------------------- | -------------------------- |
| `/api/club-owner/*`  | ⚠️ DEPRECATED | `/api/organization/*` | Add redirect, remove later |
| `/api/venue-owner/*` | ⚠️ DEPRECATED | `/api/vendor/*`       | Add redirect, remove later |
| `/api/organizer/*`   | ⚠️ DEPRECATED | `/api/producer/*`     | Add redirect, remove later |

---

## 📄 PAGES/COMPONENTS - DEPRECATED

### **Pages to Remove**

| Page                  | File Path | Status        | Reason                           | Replace With       |
| --------------------- | --------- | ------------- | -------------------------------- | ------------------ |
| Club Owner Dashboard  | TBD       | ⚠️ DEPRECATED | Renamed to Organization/Producer | Producer Dashboard |
| Venue Owner Dashboard | TBD       | ⚠️ DEPRECATED | Now Vendor Dashboard             | Vendor Dashboard   |
| Organizer Settings    | TBD       | ⚠️ DEPRECATED | Renamed to Producer              | Producer Settings  |

### **Components to Remove**

| Component            | File Path | Status        | Reason             | Replace With                       |
| -------------------- | --------- | ------------- | ------------------ | ---------------------------------- |
| `ClubOwnerNav`       | TBD       | ⚠️ DEPRECATED | Old terminology    | `ProducerNav` or `OrganizationNav` |
| `VenueOwnerProfile`  | TBD       | ⚠️ DEPRECATED | Now generic vendor | `VendorProfile`                    |
| `OrganizerDashboard` | TBD       | ⚠️ DEPRECATED | Renamed role       | `ProducerDashboard`                |

---

## 🔧 FEATURES - DEPRECATED/REMOVED

### **Features No Longer Needed in v3.0**

| Feature                                   | Status        | Reason                            | Remove After                   |
| ----------------------------------------- | ------------- | --------------------------------- | ------------------------------ |
| Eventbrite Integration                    | ⚠️ DEPRECATED | Not using in v3                   | Confirm no customer dependency |
| Beta Request System                       | ⚠️ CONSIDER   | May not need gated access         | Define signup strategy         |
| Newsletter Subscriber (separate from org) | ⚠️ CONSIDER   | Redundant with Registration?      | Define mailing list strategy   |
| Presale Toggle                            | ⚠️ DEPRECATED | Use event status instead          | Migrate to status-based        |
| Venue Claim System                        | ⚠️ DEPRECATED | All vendors must sign up directly | No unclaimed vendors           |
| RSVP "Maybe" option                       | ⚠️ CONSIDER   | Doesn't fit new model             | Define attendance tracking     |
| Group Deal Pricing                        | ⚠️ CONSIDER   | Complex feature, low usage?       | Confirm priority               |

---

## 🔐 FIREBASE SECURITY RULES - DEPRECATED

### **Rules to Update/Remove**

| Rule                      | Status        | Reason           | Action                  |
| ------------------------- | ------------- | ---------------- | ----------------------- |
| `club_owner` role checks  | ⚠️ DEPRECATED | No longer exists | Replace with `producer` |
| `venue_owner` role checks | ⚠️ DEPRECATED | No longer exists | Replace with `vendor`   |
| `organizer` role checks   | ⚠️ DEPRECATED | No longer exists | Replace with `producer` |
| `user` role checks        | ⚠️ DEPRECATED | No longer exists | Replace with `guest`    |

---

## 📦 TYPES/INTERFACES - DEPRECATED

### **Client Types (src/types/)**

| Type/Interface        | File          | Status        | Reason                | Replace With       |
| --------------------- | ------------- | ------------- | --------------------- | ------------------ |
| `role: 'organizer'`   | `database.ts` | ⚠️ DEPRECATED | Renamed               | `role: 'producer'` |
| `role: 'club_owner'`  | `database.ts` | ⚠️ DEPRECATED | Renamed               | `role: 'producer'` |
| `role: 'venue_owner'` | `database.ts` | ⚠️ DEPRECATED | Now vendor            | `role: 'vendor'`   |
| `VenueOwnerSignup`    | `vendor.ts`   | ⚠️ DEPRECATED | Generic vendor signup | `VendorSignup`     |

### **API Types (src/types/)**

| Type/Interface | File          | Status        | Reason       | Replace With      |
| -------------- | ------------- | ------------- | ------------ | ----------------- |
| Same as client | `database.ts` | ⚠️ DEPRECATED | Same reasons | Same replacements |

---

## 📝 MIGRATION CHECKLIST

### **Before Removing Any Item:**

- [ ] Confirm field/route is not used in production (check Firestore queries)
- [ ] Confirm no external links/bookmarks depend on route
- [ ] Add deprecation warnings in code comments
- [ ] Update security rules if applicable
- [ ] Add redirect if it's a public-facing route
- [ ] Test that new replacement works
- [ ] Document removal in git commit message

### **Safe Removal Criteria:**

1. ✅ No Firestore documents using the field
2. ✅ No code references (search codebase for field name)
3. ✅ No external dependencies (emails, links, integrations)
4. ✅ Replacement feature is fully tested and working
5. ✅ At least 30 days since deprecation warning added

---

## 🚀 PRIORITIZED REMOVAL TIMELINE

### **Phase 1: Immediate (During Database Refactor)**

- Mark old role values as deprecated in code comments
- Add new fields alongside old fields
- Add route redirects for `/club-owner` → `/organization`

### **Phase 2: After Feature Launch (Week 2)**

- Remove unused pages/components (after confirming replacement works)
- Clean up duplicate email template fields
- Remove `presaleEnabled` (after migrating to status)

### **Phase 3: After Pilot Success (Month 2)**

- Remove old role values from User collection (after 100% migration)
- Remove deprecated route handlers (after redirect analytics show low usage)
- Remove `venueOwnerProfile` from User collection
- Remove unclaimed venue support

### **Phase 4: Long-term Cleanup (Month 3+)**

- Remove beta access system (if not needed)
- Remove Eventbrite integration code
- Consolidate Registration/Waitlist collections
- Remove `aboutImageUrl` (after all orgs using `aboutImages[]`)

---

## 📊 TRACKING PRODUCTION USAGE

### **Before Removal, Check:**

```bash
# Example: Check if any users still have old roles
# (Run in Firebase Console or Cloud Functions)

db.collection('users')
  .where('role', 'in', ['organizer', 'club_owner', 'venue_owner', 'user'])
  .get()
  .then(snapshot => console.log(`${snapshot.size} users need migration`))
```

### **Usage Tracking Log:**

| Item                  | Last Checked | Count in Production   | Safe to Remove? |
| --------------------- | ------------ | --------------------- | --------------- |
| `role: 'organizer'`   | TBD          | TBD                   | ❌ Not yet      |
| `role: 'club_owner'`  | TBD          | TBD                   | ❌ Not yet      |
| `venueOwnerProfile`   | TBD          | TBD                   | ❌ Not yet      |
| `/club-owner/*` route | TBD          | TBD (check analytics) | ❌ Not yet      |

---

## 💬 NOTES

- **DO NOT remove fields until all production data is migrated**
- **DO NOT remove routes until redirects are in place and tested**
- **ALWAYS add deprecation comments before removal**
- **KEEP this document updated as we discover more obsolete code**

---

## 🔄 UPDATE LOG

| Date       | Updated By | Changes                                       |
| ---------- | ---------- | --------------------------------------------- |
| 2025-10-28 | Claude     | Initial deprecation tracking document created |

---

**Questions or want to mark something for removal?** Add it to this doc and we'll track it safely!
