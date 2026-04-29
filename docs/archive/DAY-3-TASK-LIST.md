# Phase 1 Day 3 - Task List

**Date**: October 29, 2025
**Focus**: Application System + Vendor Discovery
**Engineer**: New team member onboarding
**Target**: 16-20 hours of work

---

## 🎯 Daily Objective

Build the core application system so vendors can apply to events and producers can review applications.

**Success Criteria**:
- [ ] Vendor can submit application to an event
- [ ] Producer can view all applications for their event
- [ ] Vendor can view their submitted applications
- [ ] Application status can be updated (pending → accepted/rejected)
- [ ] Database schema and API endpoints fully functional

---

## 📋 Priority 1: Database & API (10-12h)

### Task 1.1: Firestore Setup (4-6h)

**Goal**: Create vendorApplications collection with proper security and indexes

**Subtasks**:
- [ ] Review VendorApplication interface in [main spec](../v3-migration/VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md#1-vendorapplications-critical---phase-1)
- [ ] Update `firestore.rules` with application collection rules
  - Vendors can create applications
  - Vendors can read their own applications
  - Producers can read applications for their events
  - Producers can update application status
  - No one can delete (soft delete via status='withdrawn')
- [ ] Create required Firestore indexes:
  ```
  Collection: vendorApplications
  - eventId (ascending)
  - vendorId (ascending)
  - status (ascending)
  - Composite: eventId + status (both ascending)
  - Composite: vendorId + status (both ascending)
  ```
- [ ] Create test data: 2-3 sample applications in Firestore

**Files**:
- `firestore.rules`

**Verification**:
- Use Firebase Console to verify rules work
- Try reading/writing as different user roles

---

### Task 1.2: TypeScript Types (1h)

**Goal**: Define type-safe interfaces for applications

**Subtasks**:
- [ ] Create `src/types/application.ts`
- [ ] Define `ApplicationStatus` type
- [ ] Define `VendorApplication` interface
- [ ] Define `CreateApplicationRequest` interface
- [ ] Define `UpdateApplicationRequest` interface
- [ ] Export all types

**Example**:
```typescript
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'withdrawn'

export interface VendorApplication {
  id: string
  eventId: string
  vendorId: string
  producerId: string
  organizationId: string
  vendorType: VendorType
  message?: string
  status: ApplicationStatus
  statusHistory: Array<{
    status: ApplicationStatus
    changedAt: Date
    changedBy: string
    reason?: string
  }>
  appliedAt: Date
  respondedAt?: Date
  vendorNotified: boolean
  producerNotified: boolean
}

export interface CreateApplicationRequest {
  eventId: string
  vendorId: string
  vendorType: VendorType
  message?: string
}

export interface UpdateApplicationRequest {
  status: ApplicationStatus
  reason?: string
  producerNotes?: string
}
```

**Files**:
- `src/types/application.ts`

**Verification**:
- Import in another file, verify TypeScript autocomplete works

---

### Task 1.3: API Endpoints (6-8h)

**Repository**: `voxxy-presents-api`

**Goal**: Build backend endpoints for application CRUD operations

**Subtasks**:

#### Endpoint 1: Submit Application
- [ ] `POST /api/events/:eventId/applications`
- [ ] Auth: Required (vendor role)
- [ ] Validate: vendor hasn't already applied to this event
- [ ] Create application document in Firestore
- [ ] Set initial status to 'pending'
- [ ] Return created application

#### Endpoint 2: Get Applications for Event
- [ ] `GET /api/events/:eventId/applications`
- [ ] Auth: Required (producer role, must own event)
- [ ] Optional query param: `?status=pending`
- [ ] Return array of applications with populated vendor info

#### Endpoint 3: Get Vendor's Applications
- [ ] `GET /api/vendors/:vendorId/applications`
- [ ] Auth: Required (vendor role, must be own profile)
- [ ] Optional query param: `?status=pending`
- [ ] Return array of applications with populated event info

#### Endpoint 4: Update Application Status
- [ ] `PATCH /api/applications/:applicationId`
- [ ] Auth: Required (producer role, must own event)
- [ ] Validate status transition is valid
- [ ] Add entry to statusHistory array
- [ ] Update application document
- [ ] Return updated application

#### Endpoint 5: Withdraw Application (Optional - Lower Priority)
- [ ] `DELETE /api/applications/:applicationId`
- [ ] Auth: Required (vendor role, must own application)
- [ ] Set status to 'withdrawn'
- [ ] Return success message

**Files to Create**:
- `voxxy-presents-api/src/routes/applications.ts`
- `voxxy-presents-api/src/services/applicationService.ts` (optional, for business logic)

**Files to Modify**:
- `voxxy-presents-api/src/app.ts` (register routes)

**Testing**:
```bash
# Submit application
curl -X POST http://localhost:3001/api/events/EVENT_ID/applications \
  -H "Content-Type: application/json" \
  -d '{"vendorId":"VENDOR_ID","vendorType":"catering","message":"I would love to cater your event!"}'

# Get applications for event
curl http://localhost:3001/api/events/EVENT_ID/applications

# Update application status
curl -X PATCH http://localhost:3001/api/applications/APP_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted","reason":"Great fit for our event"}'
```

**Verification**:
- All endpoints return 200 for valid requests
- Proper error codes for invalid requests (400, 401, 403, 404)
- Data appears correctly in Firestore

---

## 📋 Priority 2: Client-Side Services (3-4h)

### Task 2.1: Application Service (2-3h)

**Goal**: Create client-side service for calling application APIs

**Subtasks**:
- [ ] Create `src/services/applicationService.ts`
- [ ] Implement `submitApplication(eventId, data)` method
- [ ] Implement `getApplicationsForEvent(eventId, status?)` method
- [ ] Implement `getVendorApplications(vendorId, status?)` method
- [ ] Implement `updateApplicationStatus(applicationId, status, reason)` method
- [ ] Add proper error handling and logging
- [ ] Use getApiBaseUrl() for environment-specific URLs

**Example**:
```typescript
class ApplicationService {
  private API_BASE_URL = getApiBaseUrl()

  async submitApplication(eventId: string, data: CreateApplicationRequest): Promise<VendorApplication> {
    console.log('📝 Submitting application to event:', eventId)

    const response = await fetch(`${this.API_BASE_URL}/events/${eventId}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to submit application')
    }

    const result = await response.json()
    console.log('✅ Application submitted:', result)
    return result.application
  }

  // ... other methods
}

export default new ApplicationService()
```

**Files**:
- `src/services/applicationService.ts`

**Verification**:
- Import in a test file, verify methods exist
- Call methods with test data, check network requests in DevTools

---

### Task 2.2: Update Event Model (1h)

**Goal**: Add application-related fields to Event type

**Subtasks**:
- [ ] Update `src/types/database.ts` Event interface:
  ```typescript
  interface Event {
    // ... existing fields
    listedToVendorNetwork?: boolean
    vendorApplicationsOpen?: boolean
    projectBudget?: {
      totalBudget: number
      budgetBreakdown?: Record<string, number>
    }
    vendorTypesNeeded?: VendorType[]
  }
  ```
- [ ] Update event creation/edit forms to include these fields (later)

**Files**:
- `src/types/database.ts`

---

## 📋 Priority 3: Vendor Discovery (Optional - 4-6h)

**Note**: Only if time permits after Priority 1 & 2 are complete

### Task 3.1: Saved Vendors Backend (2-3h)

**Repository**: `voxxy-presents-api`

**Subtasks**:
- [ ] Add `savedVendorIds: string[]` to organizations collection
- [ ] Create `POST /api/organizations/:id/save-vendor` endpoint
- [ ] Create `DELETE /api/organizations/:id/save-vendor/:vendorId` endpoint
- [ ] Create `GET /api/organizations/:id/saved-vendors` endpoint

**Files**:
- `voxxy-presents-api/src/routes/organizations.ts` (modify)

---

### Task 3.2: Saved Vendors Frontend (2-3h)

**Subtasks**:
- [ ] Update `src/types/database.ts` - Add `savedVendorIds` to Organization
- [ ] Create vendor service methods: `saveVendor()`, `unsaveVendor()`, `getSavedVendors()`
- [ ] Add "Save Vendor" button to `VendorProfilePage.tsx`
- [ ] Create "Saved Vendors" section in `OrganizationAdminEnhanced.tsx`
- [ ] Show saved/unsaved state visually (heart icon filled/unfilled)

**Files**:
- `src/types/database.ts`
- `src/services/vendorService.ts`
- `src/pages/VendorProfilePage.tsx`
- `src/pages/OrganizationAdminEnhanced.tsx`

---

## 📋 Priority 4: UI Components (If Time Permits - 4-6h)

### Task 4.1: Vendor Application Form (3-4h)

**Subtasks**:
- [ ] Create `src/components/vendor/VendorApplicationForm.tsx`
- [ ] Form fields: message (textarea)
- [ ] Auto-populate vendor info from logged-in user
- [ ] Submit button calls `applicationService.submitApplication()`
- [ ] Success: Show confirmation, redirect to /vendor/applications
- [ ] Error: Show user-friendly error message

**Integration**:
- Add "Apply to Event" button on event detail pages when vendor is logged in
- Open modal or navigate to application form

---

### Task 4.2: Vendor Event Browser (Optional - 2-3h)

**Subtasks**:
- [ ] Create `src/pages/VendorEventBrowserPage.tsx`
- [ ] Fetch events with `listedToVendorNetwork: true`
- [ ] Display event cards (name, date, budget, vendor types needed)
- [ ] Add "Apply" button to each card
- [ ] Add route to App.tsx: `/vendor/events`

---

## ✅ Definition of Done

An item is "done" when:
- [ ] Code is written and follows existing patterns
- [ ] TypeScript compiles with no errors
- [ ] Feature works locally (tested manually)
- [ ] Console has no errors (or only expected warnings)
- [ ] Code is committed with clear commit message
- [ ] No breaking changes to existing features

---

## 🐛 Known Issues (Don't Block On These)

These issues exist but shouldn't prevent you from completing Day 3 tasks:

1. **Duplicate business name collection** - Vendor signup asks for business name twice
2. **Producer dashboard organization-first** - Not yet implemented
3. **Landing pages need refresh** - Outdated copy
4. **Login performance** - Slow initial load
5. **Club owner references** - Some files still say "club owner" instead of "producer"

See full list: [Known Issues](../v3-migration/VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md#-known-issues--technical-debt)

---

## 📝 End of Day Checklist

Before wrapping up, verify:

- [ ] All Priority 1 tasks complete (Database & API)
- [ ] At least 3 API endpoints working and tested
- [ ] Application service created and tested
- [ ] Local testing successful (can submit and retrieve applications)
- [ ] Code committed and pushed
- [ ] Update this checklist with actual progress
- [ ] Note any blockers for tomorrow

---

## 🚀 Success Metrics

**Minimum Viable (Must Have)**:
- ✅ vendorApplications collection created in Firestore
- ✅ 3+ API endpoints working (submit, get for event, get for vendor)
- ✅ Application service created in client
- ✅ Can submit application via Postman/curl

**Target (Should Have)**:
- ✅ All 5 API endpoints working
- ✅ Application form UI component created
- ✅ Vendor can submit application via UI
- ✅ Producer can view applications list

**Stretch (Nice to Have)**:
- ✅ Vendor discovery (save/unsave) working
- ✅ Vendor event browser page started
- ✅ Application status update working in UI

---

## 📞 Questions to Ask Team

If you get stuck, ask about:

1. **Firebase Console access** - Do I have permission to create indexes?
2. **Test user accounts** - Should I create new test vendors/producers or use existing?
3. **Application workflow** - Any specific validation rules for applications (e.g., max applications per vendor)?
4. **UI design** - Any mockups or design references for application forms?
5. **Notifications** - Should we send emails when application status changes? (Probably Phase 2)

---

*See also*: [Engineer Onboarding Guide](../ENGINEER_ONBOARDING.md) for setup instructions and code patterns.

*Last Updated*: October 29, 2025, 2:30 AM
