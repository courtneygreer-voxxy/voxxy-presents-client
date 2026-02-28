# Voxxy Presents Frontend - Documentation Index

Complete analysis and documentation of the Voxxy Presents frontend codebase.

**Last Updated:** February 28, 2026
**Status:** ✅ Current - Email Audit Log technical specs added

---

## 📖 Quick Start

### New to the Project?
1. **[README.md](README.md)** - Project overview and quick start guide
2. **[CLAUDE_CONTEXT.md](CLAUDE_CONTEXT.md)** - Complete platform context (frontend + backend)
3. **[docs/architecture/ARCHITECTURE_SUMMARY.md](docs/architecture/ARCHITECTURE_SUMMARY.md)** - Architecture overview

### Working on Email System?
1. **[docs/email-system/SCHEDULED_EMAILS_SYSTEM.md](docs/email-system/SCHEDULED_EMAILS_SYSTEM.md)** ⭐ - Complete email system guide
2. **[docs/EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md](docs/EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md)** ⭐ NEW - Email audit log & backend coordination
3. **[docs/EMAIL_AUDIT_LOG_QUICK_REFERENCE.md](docs/EMAIL_AUDIT_LOG_QUICK_REFERENCE.md)** - Quick reference & testing
4. **[docs/email-system/EDIT_MODAL_IMPROVEMENTS.md](docs/email-system/EDIT_MODAL_IMPROVEMENTS.md)** - UI enhancements
5. **[docs/email-system/EMAIL_TEMPLATES.md](docs/email-system/EMAIL_TEMPLATES.md)** - 40 email templates

### Fixing Bugs?
1. **[docs/fixes/FINAL_BUILD_FIX.md](docs/fixes/FINAL_BUILD_FIX.md)** - TypeScript build fixes
2. **[docs/fixes/PAUSE_DELETE_FIX_SUMMARY.md](docs/fixes/PAUSE_DELETE_FIX_SUMMARY.md)** - Pause button fix
3. **[docs/fixes/INVITATION_EMAIL_FIX.md](docs/fixes/INVITATION_EMAIL_FIX.md)** - Invitation debugging

---

## 📚 Documentation Structure

```
/
├── README.md                          # Project overview ⭐
├── CLAUDE_CONTEXT.md                  # Complete platform context ⭐
├── DOCUMENTATION_INDEX.md (this file) # Navigation hub
│
└── docs/
    ├── architecture/                  # Architecture & analysis
    │   ├── ARCHITECTURE_SUMMARY.md ⭐
    │   ├── CODEBASE_ANALYSIS.md
    │   └── FLOW_DIAGRAMS.md
    │
    ├── email-system/                  # Email automation docs (7 files)
    │   ├── SCHEDULED_EMAILS_SYSTEM.md ⭐
    │   ├── EDIT_MODAL_IMPROVEMENTS.md
    │   ├── EDIT_MODAL_SESSION_SUMMARY.md
    │   ├── EMAIL_TEMPLATES.md
    │   ├── EMAIL_DEBUG_SUMMARY.md
    │   ├── EMAIL_AUTOMATION_PLAN.md (planning doc)
    │   └── EMAIL_AUTOMATION_PROGRESS.md
    │
    ├── fixes/                         # Bug fixes & build issues (6 files)
    │   ├── FINAL_BUILD_FIX.md ⭐
    │   ├── BUILD_FIXES_SUMMARY.md
    │   ├── PAUSE_DELETE_FIX_SUMMARY.md
    │   ├── INVITATION_EMAIL_FIX.md
    │   ├── DOCUMENTATION_AUDIT_2026-01-17.md
    │   └── DOCUMENTATION_REVIEW_COMPLETE.md
    │
    ├── features/                      # Feature documentation (3 files)
    │   ├── PAYMENT_DEADLINE_FEATURE.md
    │   ├── FRONTEND_PAYMENT_DEADLINE_INTEGRATION.md
    │   └── LANDING_PAGE_COPY.md
    │
    ├── deployment/                    # Deployment guides
    ├── design/                        # Design system & UI docs
    ├── development/                   # Development guides
    ├── releases/                      # Release notes
    ├── phase-reports/                 # Project phase reports
    └── v3-migration/                  # Historical migration docs
```

---

## 🎯 Architecture & Core Docs

### **[docs/architecture/ARCHITECTURE_SUMMARY.md](docs/architecture/ARCHITECTURE_SUMMARY.md)** ⭐ START HERE
- **Best for:** Quick overview, onboarding, executive summary
- **Length:** 5 minutes read
- **Contains:**
  - What the app does
  - Core user flows (diagrams)
  - Tech stack overview
  - Project structure
  - Key architectural decisions
  - Important files to know
  - Development quick start

### **[docs/architecture/CODEBASE_ANALYSIS.md](docs/architecture/CODEBASE_ANALYSIS.md)** - Deep Dive
- **Best for:** Understanding implementation details, development
- **Length:** 30 minute read
- **Contains:**
  - Detailed purpose and functionality
  - Complete tech stack breakdown
  - Full project structure with file descriptions
  - Authentication flows (sign-up, login, password reset, email verification)
  - Role-based access patterns
  - API integration patterns and all endpoints
  - Error handling strategies
  - Request/response formats

### **[docs/architecture/FLOW_DIAGRAMS.md](docs/architecture/FLOW_DIAGRAMS.md)** - Visual Reference
- **Best for:** Visual learners, understanding data flows
- **Length:** 10 minute read
- **Contains:**
  - Authentication flow diagram
  - Producer event creation flow
  - Vendor application flow
  - Producer application management flow
  - Route structure tree
  - State management hierarchy
  - API service organization
  - Component hierarchy

---

## 📧 Email Automation System

The email system is a comprehensive automation platform with 40+ templates, smart scheduling, and delivery tracking.

### **[docs/email-system/SCHEDULED_EMAILS_SYSTEM.md](docs/email-system/SCHEDULED_EMAILS_SYSTEM.md)** ⭐ COMPLETE GUIDE
- **Length:** 47KB, comprehensive documentation
- **Contains:**
  - Complete architecture overview
  - Data models & relationships (ScheduledEmail, EmailDelivery, etc.)
  - User flows (create, edit, schedule, send)
  - Frontend components (EmailAutomationTab, EditScheduledEmailModal, etc.)
  - Backend implementation (controllers, models, workers)
  - API reference (all endpoints)
  - Email variables system (28 supported variables)
  - Trigger system (on_application_open, days_before_event, etc.)
  - Recipient filtering (by status, category, payment status)
  - Delivery tracking (SendGrid webhooks)
  - Current limitations and future enhancements

### Email Audit Log (NEW - Feb 2026)

**[docs/EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md](docs/EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md)** ⭐ TECHNICAL SPECIFICATION
- **Status:** ✅ Frontend Complete | 🚧 Backend Coordination Required
- **Length:** Complete technical documentation
- **Contains:**
  - System architecture & data flow
  - Frontend-backend coordination requirements
  - Backend API requirements & contracts
  - Data models (AuditEntry, AuditFilters, etc.)
  - Critical backend coordination points
  - SendGrid webhook processing requirements
  - Known issues requiring backend fixes
  - Testing & validation procedures
  - Integration test examples

**[docs/EMAIL_AUDIT_LOG_QUICK_REFERENCE.md](docs/EMAIL_AUDIT_LOG_QUICK_REFERENCE.md)** - QUICK REFERENCE
- **Best for:** Quick lookup, onboarding, testing
- **Contains:**
  - Feature overview & access points
  - Column details & status types
  - Current limitations & fixes needed
  - Backend API requirements summary
  - Testing checklist
  - Performance considerations

**[docs/FRONTEND_UPDATE_2025-02-27.md](docs/FRONTEND_UPDATE_2025-02-27.md)** - IMPLEMENTATION DETAILS
- UI improvements to email audit log
- Applicants tab enhancements
- Known issues with root causes
- Deployment status

### Implementation Details

**[docs/email-system/EDIT_MODAL_IMPROVEMENTS.md](docs/email-system/EDIT_MODAL_IMPROVEMENTS.md)** - UX Enhancements
- Clickable variable buttons with color-coded categories
- Plain text editing (automatic HTML conversion)
- Timezone-aware scheduling (8:00 AM local time, auto-converts to UTC)
- Smart cursor insertion for variables
- Contextual variable panel (shows when editing)

**[docs/email-system/EDIT_MODAL_SESSION_SUMMARY.md](docs/email-system/EDIT_MODAL_SESSION_SUMMARY.md)** - Variable System
- Variable format conversion ([bracket] ↔ {{mustache}})
- Email preview with resolved variables
- Validation system (unknown variables, unclosed brackets, past dates)
- 28 supported variables across event, vendor, install, and link categories
- Backend/frontend format conversion with HTML handling

**[docs/email-system/EMAIL_DEBUG_SUMMARY.md](docs/email-system/EMAIL_DEBUG_SUMMARY.md)** - Debugging Guide
- Common issues and solutions
- Console logging and debugging techniques

### Reference Materials

**[docs/email-system/EMAIL_TEMPLATES.md](docs/email-system/EMAIL_TEMPLATES.md)** - Template Library
- All 40 email templates documented
- Template categories (pre-event, during event, post-event)
- Variable usage examples
- Trigger recommendations

**[docs/email-system/EMAIL_AUTOMATION_PLAN.md](docs/email-system/EMAIL_AUTOMATION_PLAN.md)** - Original Design
- Complete planning and architecture (71KB)
- Feature specifications
- Implementation roadmap
- Historical reference

**[docs/email-system/EMAIL_AUTOMATION_PROGRESS.md](docs/email-system/EMAIL_AUTOMATION_PROGRESS.md)** - Progress Tracking
- Implementation milestones
- Feature completion status

---

## 🐛 Bug Fixes & Build Resolution

### **[docs/fixes/FINAL_BUILD_FIX.md](docs/fixes/FINAL_BUILD_FIX.md)** ⭐ CRITICAL
- **Status:** ✅ ALL 9 BUILD ERRORS RESOLVED - Ready to Deploy
- **Issue:** TypeScript build errors preventing deployment
- **Solution:** Null-safe cursor position handling, input/textarea type compatibility
- **Files Fixed:** emailVariables.ts, AdminDashboard.tsx, EditScheduledEmailModal.tsx
- **Date:** January 17, 2026

### **[docs/fixes/BUILD_FIXES_SUMMARY.md](docs/fixes/BUILD_FIXES_SUMMARY.md)** - Initial Round
- Missing imports (AdminDashboard Users icon)
- Type signature updates (insertVariableAtCursor)
- Read-only ref assignment fixes
- 6 errors resolved

### **[docs/fixes/PAUSE_DELETE_FIX_SUMMARY.md](docs/fixes/PAUSE_DELETE_FIX_SUMMARY.md)** - Feature Fix
- **Issue:** Pause button not working in production
- **Root Cause:** HTTP method mismatch (PATCH vs POST)
- **Files Modified:** src/services/api.ts
- Complete data flow analysis (frontend ↔ backend)
- **Status:** ✅ Fixed, Ready to Deploy

### **[docs/fixes/INVITATION_EMAIL_FIX.md](docs/fixes/INVITATION_EMAIL_FIX.md)** - Debugging Enhancement
- **Issue:** Invitation emails not showing in scheduled emails list
- Enhanced debugging with detailed console logs
- Type definition fixes (added viewed_count)
- Virtual email creation improvements
- Complete troubleshooting guide with database queries
- **Status:** ✅ Fixed with Enhanced Logging

---

## 🔒 Security & Monitoring

### **[docs/SENTRY_DISCORD_SETUP.md](docs/SENTRY_DISCORD_SETUP.md)** ⭐ SETUP GUIDE
- **Length:** 353 lines, comprehensive setup instructions
- **Contains:**
  - Discord webhook creation (step-by-step)
  - Sentry project configuration
  - Alert rule configurations (3 rules: critical forms, email failures, error spikes)
  - Frontend integration (environment variables, initialization)
  - Backend Ruby/Rails integration guide
  - Testing procedures
  - Rollout plan (4-week phased approach)
  - Cost estimate ($0/month for MVP, free tiers)
  - Monitoring best practices

### **[docs/ERROR_MONITORING_IMPLEMENTATION.md](docs/ERROR_MONITORING_IMPLEMENTATION.md)** - CODE EXAMPLES
- **Length:** 625 lines, implementation guide
- **Contains:**
  - Complete VendorApplicationForm integration example
  - ContactPage integration example
  - Backend email monitoring (Ruby code examples)
  - Retry logic with exponential backoff
  - User context tracking
  - Testing procedures (local, staging, production)
  - Alert thresholds by error type
  - Incident response workflow (6-step process)
  - Next steps checklist

### **[docs/CLEANUP_AND_MONITORING_SUMMARY.md](docs/CLEANUP_AND_MONITORING_SUMMARY.md)** - PROJECT SUMMARY
- **Length:** 568 lines, comprehensive overview
- **Contains:**
  - Security cleanup details (~11 MB removed, file inventory)
  - Bug fixes (social media validation)
  - Architecture insights (event/application/category system)
  - Error monitoring system design
  - Implementation roadmap (4-week plan with milestones)
  - Success metrics
  - Cost analysis
  - Testing checklists

### **[docs/BACKEND_SENTRY_INTEGRATION.md](docs/BACKEND_SENTRY_INTEGRATION.md)** - BACKEND GUIDE
- **Length:** 810 lines, Rails integration plan
- **Contains:**
  - Email service instrumentation (exact file locations and line numbers)
  - Worker instrumentation (EmailSenderWorker, ScheduledEmailWorker)
  - SendGrid API error tracking
  - Webhook processing enhancements
  - Alert configurations
  - Rollout plan for backend
  - Testing procedures for Rails
  - Integration with frontend monitoring

---

### Documentation Audits

**[docs/fixes/DOCUMENTATION_AUDIT_2026-01-17.md](docs/fixes/DOCUMENTATION_AUDIT_2026-01-17.md)** - Documentation Review
- Comprehensive audit of all documentation
- Accuracy assessment
- Recommendations for updates

**[docs/fixes/DOCUMENTATION_REVIEW_COMPLETE.md](docs/fixes/DOCUMENTATION_REVIEW_COMPLETE.md)** - Review Summary
- Documentation review completion status

---

## ⚙️ Feature Documentation

### Payment & Deadlines

**[docs/features/PAYMENT_DEADLINE_FEATURE.md](docs/features/PAYMENT_DEADLINE_FEATURE.md)** - Feature Specification
- Payment deadline functionality
- Business rules and validation
- Backend integration requirements

**[docs/features/FRONTEND_PAYMENT_DEADLINE_INTEGRATION.md](docs/features/FRONTEND_PAYMENT_DEADLINE_INTEGRATION.md)** - Frontend Guide
- UI components
- Form validation
- API integration
- Testing procedures

### Marketing & SEO

**[docs/features/LANDING_PAGE_COPY.md](docs/features/LANDING_PAGE_COPY.md)** - Marketing Content
- Landing page copy
- SEO optimization
- Messaging strategy

---

## 🚀 Deployment & Infrastructure

See **[docs/deployment/](docs/deployment/)** folder for:
- Render.com deployment guides
- Platform integration
- Environment configuration
- CI/CD workflows

---

## 🎨 Design System

See **[docs/design/](docs/design/)** folder for:
- Glass morphism design system
- Component styling guides
- UI patterns
- Radix UI integration

---

## 🔧 Development Guides

See **[docs/development/](docs/development/)** folder for:
- Git workflow
- Branching strategy
- Code review guidelines
- Contributing guide

---

## 📦 Historical Documentation

### V3 Migration
**[docs/v3-migration/](docs/v3-migration/)** - Historical migration docs from previous architecture

### Release Notes
**[docs/releases/](docs/releases/)** - Release history and changelogs

### Phase Reports
**[docs/phase-reports/](docs/phase-reports/)** - Project phase completion reports

---

## 🎯 Quick Navigation by Task

### For Different Audiences

**Product Manager / Designer**
1. [docs/architecture/ARCHITECTURE_SUMMARY.md](docs/architecture/ARCHITECTURE_SUMMARY.md)
2. [docs/architecture/FLOW_DIAGRAMS.md](docs/architecture/FLOW_DIAGRAMS.md) (look at flow diagrams)
3. [docs/architecture/CODEBASE_ANALYSIS.md](docs/architecture/CODEBASE_ANALYSIS.md) (User Flows section)

**Frontend Developer (New to Project)**
1. [docs/architecture/ARCHITECTURE_SUMMARY.md](docs/architecture/ARCHITECTURE_SUMMARY.md) (full)
2. [docs/architecture/CODEBASE_ANALYSIS.md](docs/architecture/CODEBASE_ANALYSIS.md) (sections 1-3)
3. [docs/architecture/FLOW_DIAGRAMS.md](docs/architecture/FLOW_DIAGRAMS.md) (all diagrams)

**Backend Developer**
1. [CLAUDE_CONTEXT.md](CLAUDE_CONTEXT.md) (backend section)
2. [docs/architecture/CODEBASE_ANALYSIS.md](docs/architecture/CODEBASE_ANALYSIS.md) (API Integration section)

**DevOps / Infrastructure**
1. [docs/deployment/](docs/deployment/) (deployment guides)
2. [docs/architecture/ARCHITECTURE_SUMMARY.md](docs/architecture/ARCHITECTURE_SUMMARY.md) (tech stack section)

**QA / Testing**
1. [docs/architecture/FLOW_DIAGRAMS.md](docs/architecture/FLOW_DIAGRAMS.md) (all user flows)
2. [docs/architecture/CODEBASE_ANALYSIS.md](docs/architecture/CODEBASE_ANALYSIS.md) (User Flows section)

### By Task

**Implementing Features**
→ [docs/architecture/ARCHITECTURE_SUMMARY.md](docs/architecture/ARCHITECTURE_SUMMARY.md) → [docs/architecture/CODEBASE_ANALYSIS.md](docs/architecture/CODEBASE_ANALYSIS.md)

**Understanding Email System**
→ [docs/email-system/SCHEDULED_EMAILS_SYSTEM.md](docs/email-system/SCHEDULED_EMAILS_SYSTEM.md)

**Fixing Bugs**
→ Check [docs/fixes/](docs/fixes/) for relevant fix documentation

**Deploying**
→ Review [docs/fixes/FINAL_BUILD_FIX.md](docs/fixes/FINAL_BUILD_FIX.md) and [docs/deployment/](docs/deployment/)

**Setting Up Error Monitoring**
→ [docs/SENTRY_DISCORD_SETUP.md](docs/SENTRY_DISCORD_SETUP.md)

**Tracking Form Errors**
→ [docs/ERROR_MONITORING_IMPLEMENTATION.md](docs/ERROR_MONITORING_IMPLEMENTATION.md)

**API Integration**
→ [CLAUDE_CONTEXT.md](CLAUDE_CONTEXT.md) (API section) or [docs/architecture/CODEBASE_ANALYSIS.md](docs/architecture/CODEBASE_ANALYSIS.md)

---

## 🔍 Common Tasks Reference

### Adding a New Route
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx` Routes
3. Import component in App.tsx
4. Consider if lazy-loaded or eager-loaded

### Adding a New API Endpoint
1. Add to appropriate API object in `src/services/api.ts`
2. Use `fetchApi<T>()` for requests
3. Handle errors with ApiError
4. Document with JSDoc comments

### Using Auth State in Components
```typescript
import { useAuth } from '@/contexts/AuthContext'

export function MyComponent() {
  const { userProfile, isProducer, signOut } = useAuth()

  if (!isProducer) return <div>Not a producer</div>
  return <div>Hello {userProfile?.name}</div>
}
```

### Creating a Protected Route
```typescript
<Route path="/admin/dashboard" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />
```

---

## 📊 Project Status

### Build Status
- ✅ **Production Ready** - All TypeScript errors resolved (Jan 17, 2026)
- ✅ **Error Monitoring** - Sentry integrated (Feb 26, 2026)
- ✅ All critical bugs fixed
- ✅ Email system fully functional
- ✅ Documentation comprehensive and current

### Feature Completion
- ✅ User authentication system
- ✅ Role-based access control
- ✅ Producer event creation (4-step wizard)
- ✅ Vendor network/contacts management
- ✅ Public vendor application form
- ✅ Application tracking by ticket code
- ✅ Producer application management dashboard
- ✅ Admin dashboard
- ✅ **Email automation system** (40+ templates)
- ✅ **Email audit log** (Full-screen tracking dashboard) - Frontend complete
- ✅ **Error monitoring system** (Sentry + Discord integration)
- ✅ **Security hardening** (Sensitive data cleanup)
- ✅ **Social media validation** (At least one link required)
- ✅ **CSV bulk import** for vendor contacts
- ✅ Responsive design

### In Progress
- 🔄 Event invitation system (frontend complete, backend needed)
- 🔄 Mobile app integration planning

---

## 💡 Important Notes

1. **Beta Access Gate**: Users can't directly sign up - they must request beta access
2. **Organization Auto-Creation**: First producer login auto-creates an organization
3. **Multi-Environment**: Config in `src/config/environments.ts` for dev/staging/production
4. **No Redux**: Project uses Context API + useState for simplicity
5. **Component Library**: Radix UI for headless, accessible components
6. **Type Safety**: Full TypeScript coverage, Zod for validation
7. **Email System**: Complete automation with 40+ templates, smart scheduling

---

## 🆘 Getting Help

### Understanding a Feature
1. Find the route in `src/App.tsx`
2. Check the page component in `src/pages/`
3. Look at child components in `src/components/`
4. Search for API calls in `src/services/api.ts`
5. Check [docs/architecture/FLOW_DIAGRAMS.md](docs/architecture/FLOW_DIAGRAMS.md) for visual explanation

### Debugging Auth Issues
1. Check `src/contexts/AuthContext.tsx` - Auth logic
2. Check browser console - Logs describe auth flow
3. Check browser localStorage - Token should be there
4. Check `src/services/api.ts` (authApi) - API calls

### Debugging API Issues
1. Check `src/services/api.ts` - Endpoint definition
2. Check browser Network tab - Request details
3. Check API error response - Backend validation errors
4. Check `fetchApi` error handling - Error message

### Debugging Email System
1. Check [docs/email-system/SCHEDULED_EMAILS_SYSTEM.md](docs/email-system/SCHEDULED_EMAILS_SYSTEM.md)
2. Review [docs/email-system/EMAIL_DEBUG_SUMMARY.md](docs/email-system/EMAIL_DEBUG_SUMMARY.md)
3. Check SendGrid dashboard for delivery status

---

## 📋 Standards & Conventions

### Naming
- **Components**: PascalCase (HomePage, VendorApplicationForm)
- **Functions**: camelCase (submitApplication, getEvents)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL)
- **Interfaces**: I prefix or Type suffix (IUser or UserType)

### Component Structure
```typescript
// Imports
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// Types (if needed)
interface Props { ... }

// Component
export default function MyComponent() {
  // Hooks
  const { userProfile } = useAuth()
  const [state, setState] = useState()

  // Effects
  useEffect(() => { ... }, [])

  // Handlers
  const handleClick = () => { ... }

  // Render
  return <div>...</div>
}
```

---

## 🔗 External Resources

- **Rails API Docs**: `/Users/beaulazear/Desktop/voxxy-rails/docs/README.md`
- **Repository**: (add GitHub link)
- **Production**: voxxypresents.com
- **Staging**: (add staging URL)

---

## 📦 Version Information

- **Node.js**: ^18+ (per .nvmrc)
- **React**: 18.3.1
- **TypeScript**: 5.0+
- **Vite**: 6.3.6
- **Latest Update**: February 28, 2026

---

**Last Updated:** February 28, 2026
**Documentation Status:** ✅ Complete with Email Audit Log Technical Specs
**Coverage:** 100% of frontend codebase
**Accuracy:** High (continuously updated)

---

Happy coding! 🚀
