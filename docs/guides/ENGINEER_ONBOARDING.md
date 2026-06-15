# 🚀 Engineer Onboarding - Voxxy Presents

**Welcome to the team!** This document will get you up to speed on the Voxxy Presents platform.

**Last Updated**: November 22, 2025 (Updated for Rails API migration)
**Current Sprint**: Phase 1 Day 3 - Application System

---

## 📍 Where We Are Right Now

### Project Status: V3.0 Migration - Phase 1 Day 2 Complete ✅

We're in the middle of refactoring the platform from a simple event organizer tool into a **two-sided marketplace** connecting:

- **Producers** (event organizers) who create organizations and post event needs
- **Vendors** (service providers like venues, caterers, photographers) who browse events and apply to opportunities

### What's Been Completed

#### Phase 0 ✅ (Oct 28)

- Security hardening (CORS lockdown, environment validation)
- Dependency locking (33 packages locked to specific versions)
- Production deployment verified

#### Phase 1 Day 1 ✅ (Oct 28)

- Database role refactoring: `organizer` → `producer`, `venue_owner` → `vendor`
- Profile object renaming in database schema
- Beta approval system removed for producers
- All signup flows updated to V3.0 roles
- Documentation reorganization (26 MD files into clean structure)

#### Phase 1 Day 2 ✅ (Oct 29, 2:15 AM)

- Complete vendor signup flow (2-step form with vendor type selection)
- Vendor listing creation and edit functionality
- API endpoint created: `PUT /api/vendors/by-slug/:slug`
- Cloud Run deployment with environment configuration
- Logout/escape functionality for error states
- Vendor profile CRUD operations fully functional

### What's Next (Your Tasks for Day 3+)

See the **[Day 3 Task List](#day-3-tasks)** below for immediate priorities.

---

## 🎯 Understanding the Product

### The Big Pivot

**Before V3.0** (Old Model):

- Organization owners create events
- Public users subscribe and RSVP to events
- Simple one-sided platform

**After V3.0** (New Model - What We're Building):

- **Producers** create organizations and post event needs (like job postings)
- **Vendors** discover events, save favorites, and apply to opportunities
- **Two-sided marketplace** with producer review and approval workflow
- **Event Command Center** where accepted vendors collaborate with producers

### User Roles

| Role         | Who They Are      | What They Do                                         |
| ------------ | ----------------- | ---------------------------------------------------- |
| **admin**    | Voxxy team        | Platform management, moderation                      |
| **producer** | Event organizers  | Create orgs, post events, review vendor applications |
| **vendor**   | Service providers | Browse events, apply, collaborate after acceptance   |
| **user**     | Public/guests     | View public pages, subscribe (no login)              |

### Core Features We're Building

1. **Vendor Discovery** (Day 3) - Producers browse and save vendors
2. **Application System** (Days 3-4) - Vendors apply to events, producers review/approve
3. **Event Command Center** (Day 4) - Collaboration hub with contact info, messaging, Run of Show
4. **Budget Tracking** - Producers set budgets, track vendor spending (existing, needs integration)

---

## 🏗 Technical Architecture

### Tech Stack

**Frontend** (this repo):

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui components
- React Router for navigation
- Mixpanel (analytics)

**Backend** (separate repo):

- Ruby on Rails API
- PostgreSQL database
- Render.com (deployment)
- SendGrid (email notifications)

**Repositories**:

- **Client**: https://github.com/courtneygreer-voxxy/voxxy-presents-client
- **API**: https://github.com/courtneygreer-voxxy/voxxy-presents-api

### Key Directories

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base shadcn/ui components (Button, Input, etc.)
│   ├── auth/           # Authentication guards, protected routes
│   ├── vendor/         # Vendor-specific components (CreateVendorListingForm, etc.)
│   └── profile/        # User profile components
├── pages/              # Page-level components
│   ├── VendorSignUpPage.tsx       # 2-step vendor signup
│   ├── VendorEditPage.tsx         # Vendor profile editor
│   ├── ClubOwnerSignUpPage.tsx    # Producer signup (needs rename)
│   └── OrganizationAdminEnhanced.tsx  # Producer dashboard
├── services/           # API service layer
│   ├── api.ts          # Base API client
│   ├── authService.ts  # Authentication
│   └── vendorService.ts # Vendor CRUD operations
├── contexts/           # React contexts
│   └── AuthContext.tsx # Global auth state
├── types/              # TypeScript type definitions
│   ├── database.ts     # Database schema types
│   └── vendor.ts       # Vendor-specific types
└── lib/                # Utilities
    ├── api.ts          # API client helpers
    └── analytics.ts    # Mixpanel wrapper
```

---

## 🚦 Getting Started

### 1. Clone Both Repositories

```bash
# Client (frontend)
git clone https://github.com/courtneygreer-voxxy/voxxy-presents-client.git
cd voxxy-presents-client

# API (backend) - in a separate directory
cd ..
git clone https://github.com/courtneygreer-voxxy/voxxy-presents-api.git
cd voxxy-presents-api
```

### 2. Install Dependencies

**Client**:

```bash
cd voxxy-presents-client
npm install
```

**API** (Rails):

```bash
cd voxxy-presents-api
bundle install
rails db:create db:migrate db:seed
```

### 3. Environment Setup

**Client** - Create `.env.local`:

```env
VITE_ENVIRONMENT=development
VITE_API_BASE_URL=http://localhost:3001/api

# Mixpanel (optional for local dev)
VITE_MIXPANEL_TOKEN=...
```

**API** (Rails) - Create `.env`:

```env
RAILS_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://localhost/voxxy_presents_development

# JWT Secret (for authentication)
JWT_SECRET=your-development-secret-key

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://staging-voxxy-presents.onrender.com,https://www.voxxypresents.com

# SendGrid (optional for local dev)
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=team@voxxypresents.com
EMAIL_TEST_MODE=true
```

**Get Credentials From**:

- Database setup: Run `rails db:create db:migrate db:seed` in the API repo
- Mixpanel token: Check existing `.env.example` or ask team
- SendGrid API key: Ask team (optional for local development)

### 4. Start Development Servers

**Terminal 1 - API**:

```bash
cd voxxy-presents-api
rails s -p 3001
# API runs on http://localhost:3001
```

**Terminal 2 - Client**:

```bash
cd voxxy-presents-client
npm run dev
# Client runs on http://localhost:5173
```

### 5. Verify Setup

1. Open http://localhost:5173
2. Try signing up as a vendor or producer
3. Check that API calls work (Network tab in DevTools)
4. No CORS errors should appear

---

## 📚 Essential Reading (In Order)

Before you start coding, read these documents to understand the full context:

### 1. [V3.0 Technical Requirements](./v3-migration/VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md) ⭐ **MOST IMPORTANT**

**Read First!** Complete project specification including:

- Executive summary and product vision
- Database schema changes required
- API endpoints to build
- UI/UX changes needed
- Implementation plan (what's done, what's next)
- **Known Issues section** - bugs and tech debt

### 2. [Phase 1 Day 2 Completion Report](./phase-reports/PHASE-1-DAY-2-VENDOR-SAVE-COMPLETE.md)

Latest progress update showing:

- What was completed yesterday
- How vendor signup/edit flow works
- API deployment details
- Testing results

### 3. [Known Issues](./v3-migration/VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md#-known-issues--technical-debt)

Current bugs and technical debt you should be aware of (linked in main spec doc).

### 4. [Contributing Guide](./CONTRIBUTING.md)

Git workflow, PR process, code standards.

---

## 🎯 Day 3 Tasks

**Your immediate priorities for today (October 29, 2025):**

### High Priority - Application System Setup

#### 1. Database Schema: Vendor Applications Table (4-6h)

**Goal**: Create the `vendor_applications` table in PostgreSQL via Rails migration.

**Tasks**:

- [ ] Review the [VendorApplication interface](./v3-migration/VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md#1-vendorapplications-critical---phase-1) in the main spec
- [ ] Create Rails migration for `vendor_applications` table
- [ ] Add database indexes:
  - `event_id` (for getting all applications to an event)
  - `vendor_id` (for getting all applications by a vendor)
  - `status` (for filtering pending/accepted/rejected)
  - Composite: `event_id + status`
  - Composite: `vendor_id + status`
- [ ] Create seed data (2-3 sample applications) to work with

**Files to Create/Modify**:

- `voxxy-presents-api/db/migrate/xxx_create_vendor_applications.rb`
- `voxxy-presents-api/db/seeds.rb` (add sample applications)

**Reference**:

- Look at existing migrations in `db/migrate/` for patterns
- Run `rails db:migrate` after creating migration

---

#### 2. TypeScript Types for Applications (1h)

**Goal**: Define TypeScript interfaces for vendor applications.

**Tasks**:

- [ ] Create `src/types/application.ts` with `VendorApplication` interface
- [ ] Add status types: `ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'withdrawn'`
- [ ] Add vendor type enum if not already exists
- [ ] Export types for use across the app

**Example Structure**:

```typescript
// src/types/application.ts
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
```

---

#### 3. API Endpoints for Applications (6-8h)

**Goal**: Build the backend API endpoints for managing vendor applications.

**Repository**: `voxxy-presents-api`

**Tasks**:

- [ ] Create `src/routes/applications.ts`
- [ ] Implement `POST /api/events/:eventId/applications` (vendor submits application)
- [ ] Implement `GET /api/events/:eventId/applications` (producer gets all applications for event)
- [ ] Implement `GET /api/vendors/:vendorId/applications` (vendor gets their applications)
- [ ] Implement `PATCH /api/applications/:applicationId` (producer updates status)
- [ ] Implement `DELETE /api/applications/:applicationId` (vendor withdraws)
- [ ] Add authentication guards (vendor can only submit, producer can only approve)
- [ ] Register routes in Rails router

**Files to Create**:

- `voxxy-presents-api/app/controllers/api/applications_controller.rb`
- `voxxy-presents-api/app/models/vendor_application.rb`

**Files to Modify**:

- `voxxy-presents-api/config/routes.rb` (register routes)

**Testing**:

- Use `curl` or Postman to test each endpoint
- Verify authorization via controller before_actions

---

### Medium Priority - Vendor Discovery UI

#### 4. Vendor Discovery - Browse & Save (6-8h)

**Goal**: Allow producers to browse vendors and save favorites.

**Tasks**:

- [ ] Update `src/types/database.ts` - Add `savedVendorIds: string[]` to Organization interface
- [ ] Create vendor service methods in `src/services/vendorService.ts`:
  - `saveVendor(organizationId, vendorId)`
  - `unsaveVendor(organizationId, vendorId)`
  - `getSavedVendors(organizationId)`
- [ ] Add "Save Vendor" button to vendor profile pages
- [ ] Create "Saved Vendors" section on producer dashboard
- [ ] Add vendor filtering by type (dropdown or checkboxes)

**Files to Modify**:

- `src/types/database.ts`
- `src/services/vendorService.ts`
- `src/pages/VendorProfilePage.tsx` (add save button)
- `src/pages/OrganizationAdminEnhanced.tsx` (add saved vendors section)

**API Endpoints Needed** (build these in API repo):

- `POST /api/organizations/:id/save-vendor` (add vendor to saved list)
- `DELETE /api/organizations/:id/save-vendor/:vendorId` (remove from saved list)
- `GET /api/organizations/:id/saved-vendors` (get all saved vendors)

---

### Lower Priority (If Time Permits)

#### 5. Vendor Event Browser Page (4-6h)

**Goal**: Vendors can browse all events and filter by their vendor type.

**Tasks**:

- [ ] Create `src/pages/VendorEventBrowserPage.tsx`
- [ ] Fetch all events with `listedToVendorNetwork: true`
- [ ] Display event cards with:
  - Event name, date, location
  - Budget range (if available)
  - Vendor types needed
  - "Apply" button
- [ ] Add filtering by date, budget, vendor type needed
- [ ] Add route to `src/App.tsx`: `/vendor/events`

**Reference**:

- Look at existing event listing pages for styling consistency

---

#### 6. Vendor Application Form (3-4h)

**Goal**: Vendors can submit applications to events.

**Tasks**:

- [ ] Create `src/components/vendor/VendorApplicationForm.tsx`
- [ ] Form fields:
  - Message/cover letter (textarea)
  - Auto-populate vendor info from logged-in user's vendor profile
- [ ] Submit button calls `POST /api/events/:eventId/applications`
- [ ] Show success message, redirect to "My Applications" page
- [ ] Handle errors (already applied, event closed, etc.)

**Integration**:

- Add "Apply" button to event detail pages when viewed by vendors
- Open modal/form when clicked

---

## 🐛 Known Issues to Be Aware Of

**Read the full list in the main spec**: [Known Issues & Technical Debt](./v3-migration/VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md#-known-issues--technical-debt)

### High Priority Issues (Don't Let These Block You)

1. **Duplicate Data Collection in Vendor Signup**
   - Business name asked twice during vendor signup flow
   - Workaround: Use the first value collected, ignore the second

2. **Producer Login Flow - Organization-First Not Implemented**
   - Currently shows producer dashboard, should show organization dashboard first
   - Not blocking: Work on vendor features first

3. **Landing Pages Need Refresh**
   - Copy is outdated, doesn't reflect V3.0 marketplace model
   - Not blocking: Focus on core features

4. **Login Performance - Slow Initial Load**
   - Noticeable delays on login
   - Not blocking: May investigate after core features done

5. **Club Owner References Still Exist**
   - Some files/routes still say "club owner" instead of "producer"
   - Not blocking: Renaming can happen later

---

## 🔧 Development Workflow

### Git Workflow

1. **Always work on a feature branch**:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/application-system
   ```

2. **Commit frequently with descriptive messages**:

   ```bash
   git add -A
   git commit -m "feat: add vendor application submission endpoint"
   ```

3. **Push and create PR when ready**:

   ```bash
   git push origin feature/application-system
   # Create PR on GitHub
   ```

4. **Use conventional commit format**:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

### Testing Your Changes

1. **Manual Testing Checklist**:
   - [ ] Sign up as vendor → verify profile created
   - [ ] Sign up as producer → verify organization created
   - [ ] Test the specific feature you built (e.g., submit application)
   - [ ] Check Network tab for API errors
   - [ ] Verify database data via Rails console (`rails c`)

2. **Build Before Committing**:

   ```bash
   npm run build
   # Fix any TypeScript errors
   ```

3. **Type Check**:
   ```bash
   npm run typecheck
   # Should pass with no errors
   ```

### Deployment

- **Automatic**: Pushing to `main` branch auto-deploys to production via Render
- **Manual API Deploy**: See API repo README for Render deployment
- **Always test locally first!** Don't push broken code to main

---

## 📖 Code Patterns to Follow

### 1. API Service Pattern

All API calls go through service files in `src/services/`.

**Example** (`src/services/vendorService.ts`):

```typescript
class VendorService {
  private API_BASE_URL = getApiBaseUrl()

  async getVendorBySlug(slug: string): Promise<Vendor> {
    const response = await fetch(`${this.API_BASE_URL}/vendors/by-slug/${slug}`)
    if (!response.ok) throw new Error('Vendor not found')
    const data = await response.json()
    return data.vendor
  }

  async updateVendorBySlug(slug: string, updates: Partial<Vendor>): Promise<Vendor> {
    const response = await fetch(`${this.API_BASE_URL}/vendors/by-slug/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update vendor')
    }
    return (await response.json()).vendor
  }
}

export default new VendorService()
```

### 2. Component Structure Pattern

Use functional components with hooks.

**Example**:

```typescript
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function VendorApplicationForm() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await applicationService.submitApplication(eventId!, { message })
      alert('Application submitted!')
      navigate('/vendor/applications')
    } catch (err) {
      console.error('Error submitting application:', err)
      alert(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Apply to Event'}
      </Button>
    </form>
  )
}
```

### 3. Error Handling Pattern

Always handle errors gracefully with user-friendly messages.

```typescript
try {
  const result = await apiCall()
  console.log('✅ Success:', result)
} catch (err) {
  console.error('❌ Error:', err)
  const message = err instanceof Error ? err.message : 'Something went wrong'
  alert(message) // Or use a toast notification
}
```

### 4. Console Logging Pattern

Use emojis for visual scanning:

```typescript
console.log('📥 Loading vendor:', slug)
console.log('✅ Vendor loaded successfully:', vendor)
console.error('❌ Error loading vendor:', error)
console.log('🌐 Calling API:', url)
console.log('📦 Data:', JSON.stringify(data, null, 2))
```

---

## 🆘 Getting Help

### When You're Stuck

1. **Check the docs first**:
   - [V3.0 Technical Requirements](./v3-migration/VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md)
   - [Known Issues](./v3-migration/VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md#-known-issues--technical-debt)
   - Recent [Phase Reports](./phase-reports/)

2. **Search the codebase**:

   ```bash
   # Find similar components
   grep -r "VendorProfile" src/

   # Find API usage examples
   grep -r "vendorService" src/
   ```

3. **Check Git history**:

   ```bash
   git log --oneline --all --grep="vendor"
   ```

4. **Ask the team**:
   - Describe what you're trying to do
   - Share error messages (full stack trace)
   - Show what you've already tried

### Common Issues & Solutions

**Issue**: CORS error when calling API

- **Solution**: Make sure API is running on `http://localhost:3001` and ALLOWED_ORIGINS includes `http://localhost:5173`

**Issue**: TypeScript errors about missing types

- **Solution**: Check `src/types/database.ts` and `src/types/vendor.ts` for type definitions, or create new ones

**Issue**: API authorization error (401/403)

- **Solution**: Check that you're sending the correct auth token in headers and that the user has the required role

**Issue**: "Cannot read property X of undefined"

- **Solution**: Add optional chaining `?.` or null checks before accessing nested properties

---

## 🎯 Success Criteria for Day 3

By end of day, you should have:

- [ ] `vendor_applications` table created in PostgreSQL via Rails migration
- [ ] Database indexes configured for efficient queries
- [ ] TypeScript types defined for applications
- [ ] At least 3 API endpoints working (submit, get for event, get for vendor)
- [ ] Basic seed data created (2-3 sample applications)
- [ ] Local testing successful (can submit and retrieve applications)

**Stretch Goals**:

- [ ] Vendor discovery (save/unsave) functionality working
- [ ] Vendor event browser page started
- [ ] Application form UI component created

---

## 📋 Daily Standup Format

Share this in team communication:

**Yesterday**: [What you accomplished]
**Today**: [What you're working on from the Day 3 task list]
**Blockers**: [Anything stopping you - missing credentials, unclear requirements, etc.]

**Example**:

```
Yesterday: Set up local environment, read V3.0 spec, reviewed vendor signup flow
Today: Creating vendor_applications Rails migration and building API endpoints
Blockers: None - waiting for database credentials
```

---

## 🚀 You're Ready!

You now have everything you need to get started. Remember:

1. **Read the [V3.0 Technical Requirements](./v3-migration/VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md)** first
2. **Start with the [Day 3 tasks](#day-3-tasks)** listed above
3. **Follow the code patterns** shown in this doc
4. **Ask for help** when you need it
5. **Test locally** before pushing to main

**Good luck and welcome to Voxxy! 🎉**

---

_Last Updated: November 22, 2025 - Updated for Rails API migration_
