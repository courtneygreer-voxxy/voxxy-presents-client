# Email System Documentation - Quick Start Guide

**For:** Developers and producers working with the Voxxy email system  
**Updated:** May 20, 2026  
**Scope:** Both Rails backend and React frontend repositories

---

## Where To Start

### If You're a Producer/Content Creator

1. **Frontend:** `/docs/email-system/EMAIL_EDITOR_GUIDE.md`
   - How to create and edit emails in the UI
2. **Frontend:** `/docs/email-system/EMAIL_VARIABLES_REFERENCE.md`
   - What variables you can use and examples
3. **Frontend:** `/docs/email-system/INVITATION_EMAIL_QUICK_REFERENCE.md`
   - Special rules for invitation emails

### If You're a Frontend Developer

1. **Frontend:** `/docs/email-system/EMAIL_SYSTEM_GUIDE.md`
   - System architecture and components
2. **Frontend:** `/docs/email-system/EMAIL_VARIABLES_REFERENCE.md`
   - Variable system and resolution
3. **Backend:** `/docs/email/EMAIL_AUTOMATION_SYSTEM_GUIDE.md`
   - Complete end-to-end system documentation

### If You're a Backend Developer

1. **Backend:** `/docs/email/VOXXY_PRESENTS_EMAIL_MASTER_REFERENCE.md`
   - Complete email system overview
2. **Backend:** `/docs/email/EMAIL_AUTOMATION_SYSTEM_GUIDE.md`
   - 2,086 lines of comprehensive documentation
3. **Backend:** `/docs/email/EMAIL_SYSTEMS_GUIDE.md`
   - Architecture and API reference

### If You Need To Debug Email Issues

1. **Backend:** `/docs/email/EMAIL_SYSTEMS_GUIDE.md` (Common Issues section)
2. **Backend:** `/docs/email/EMAIL_TECH_DEBT_CLEANUP_PLAN_APRIL_2026.md`
3. **Frontend:** `/docs/email-system/EMAIL_DEBUG_SUMMARY.md`

---

## Email System Overview (30-second version)

### What is the Email System?

Voxxy has automated email sending for event management. There are two contexts:

1. **Position 1 (Invitations):** Sent immediately when vendors are invited
   - 34 variables available
   - Simple template system
   - Frontend docs: EMAIL_SYSTEM_GUIDE.md

2. **Positions 2-17 (Registration Emails):** Scheduled at future dates/times
   - All 48 variables available
   - Timezone-aware scheduling (8 AM local time)
   - Audit logging and delivery tracking
   - Frontend docs: EMAIL_EDITOR_GUIDE.md

### Key Components

**Backend (Rails):**

- SendGrid for email delivery
- Webhook system for delivery tracking
- Variable resolution via two resolvers
- Scheduled jobs via Sidekiq

**Frontend (React):**

- Email editor with RichText support
- Variable insertion buttons
- Email preview system
- Audit log viewer

---

## File Structure

### Backend: `/Users/beaulazear/Desktop/voxxy-rails`

```
docs/
├── email/
│   ├── README_EMAIL_SYSTEMS.md ⭐ START HERE
│   ├── VOXXY_PRESENTS_EMAIL_MASTER_REFERENCE.md (40 KB)
│   ├── EMAIL_AUTOMATION_SYSTEM_GUIDE.md (87 KB, COMPREHENSIVE)
│   ├── EMAIL_SYSTEMS_GUIDE.md (33 KB)
│   ├── EMAIL_SYSTEMS_ARCHITECTURE.md (29 KB)
│   ├── EMAIL_DOCS_INDEX.md (39 KB, INDEX)
│   ├── WEBHOOK_*.md (8 files on delivery tracking)
│   ├── EMAIL_RECIPIENT_FILTERING_FIX.md (58 KB)
│   ├── EMAIL_TECH_DEBT_CLEANUP_PLAN_APRIL_2026.md (37 KB)
│   ├── INVITATION_*.md (4 files)
│   ├── DELIVERABILITY_*.md (3 files)
│   └── ... (40+ more files)
├── development/
│   ├── LOCAL_DEVELOPMENT_GUIDE.md
│   └── ... (9 more files)
├── bug-fixes/
│   ├── CATEGORY_SPECIFIC_EMAIL_RECIPIENT_COUNT_FIX.md
│   └── ... (7 more files)
└── ... (10+ other categories)

Root:
├── README.md
├── VOXXY_APPLICATION_OVERVIEW.md
└── EMAIL_SYSTEM_ASSESSMENT_AND_REPAIR_PLAN.txt
```

### Frontend: `/Users/beaulazear/Desktop/voxxy-presents-client`

```
docs/
├── email-system/
│   ├── EMAIL_DOCUMENTATION_INDEX.md ⭐ START HERE
│   ├── EMAIL_SYSTEM_GUIDE.md
│   ├── EMAIL_VARIABLES_REFERENCE.md (48 variables)
│   ├── EMAIL_EDITOR_GUIDE.md (PRODUCER GUIDE)
│   ├── INVITATION_EMAIL_QUICK_REFERENCE.md
│   ├── INVITATION_EMAIL_*.md (6 files)
│   ├── EMAIL_AUDIT_LOG_*.md (6 files)
│   ├── EDIT_MODAL_*.md (3 files)
│   └── ... (10+ more files)
├── development/
│   ├── BACKEND_EMAIL_SETUP.md
│   └── ... (3 more files)
├── architecture/
│   ├── ROLE_MAPPING.md
│   └── ... (5 more files)
└── ... (10+ other categories)

Root:
├── README.md
└── EMAIL_SCHEDULING_TIMEZONE_FIX_2026.md
```

---

## Most Important Files (Read These!)

### Backend - Essential Reading

**File Path:** `/Users/beaulazear/Desktop/voxxy-rails/docs/email/`

1. **VOXXY_PRESENTS_EMAIL_MASTER_REFERENCE.md** (40 KB)
   - Complete email catalog
   - All types, variables, flows
   - Read time: 20 minutes

2. **EMAIL_AUTOMATION_SYSTEM_GUIDE.md** (87 KB)
   - Deepest dive into system
   - 2,086 lines of documentation
   - Read time: 45 minutes (or use as reference)

3. **EMAIL_SYSTEMS_GUIDE.md** (33 KB)
   - Comprehensive but shorter guide
   - Best for quick reference
   - Read time: 30 minutes

### Frontend - Essential Reading

**File Path:** `/Users/beaulazear/Desktop/voxxy-presents-client/docs/email-system/`

1. **EMAIL_DOCUMENTATION_INDEX.md** ⭐
   - Master navigation hub
   - Organized by role (producer, frontend dev, backend dev)
   - Read time: 10 minutes

2. **EMAIL_SYSTEM_GUIDE.md**
   - Technical system overview
   - Architecture and components
   - Read time: 25 minutes

3. **EMAIL_VARIABLES_REFERENCE.md**
   - All 48 variables documented
   - Which work in invitations (34) vs registration (48)
   - Read time: 15 minutes (reference)

4. **EMAIL_EDITOR_GUIDE.md**
   - For producers and content creators
   - How to use the UI
   - Read time: 20 minutes

---

## Common Scenarios

### "I need to add a new email variable"

1. Backend: Update both resolvers in `/app/services/`
2. Frontend: Add to `src/utils/emailVariables.ts`
3. Update: Both EMAIL_VARIABLES_REFERENCE docs

### "Email isn't being sent"

1. Check: `EMAIL_TECH_DEBT_CLEANUP_PLAN_APRIL_2026.md`
2. Debug: `EMAIL_AUTOMATION_SYSTEM_GUIDE.md` (Debugging section)
3. Verify: SendGrid webhook setup in `SENDGRID_WEBHOOK_SETUP_APRIL_2026.md`

### "Variable is showing blank in email"

1. Check: `EMAIL_VARIABLES_REFERENCE.md` (variable availability)
2. Frontend: `EMAIL_EDITOR_GUIDE.md` (Troubleshooting section)
3. Backend: `EMAIL_SYSTEM_FIXES_JANUARY_17_2026.md`

### "Need to understand variable resolution"

1. Frontend: `EMAIL_SYSTEM_GUIDE.md` (Variable Resolution System)
2. Backend: `EMAIL_AUTOMATION_SYSTEM_GUIDE.md` (Services section)
3. Code: Look at `/app/services/email_variable_resolver.rb`

### "Delivery tracking isn't working"

1. Backend: `WEBHOOK_CUSTOM_ARGS_FIX_APRIL_2026.md`
2. Backend: `WEBHOOK_FALLBACK_TIER_225_FIX_APRIL_2026.md`
3. Verify: `WEBHOOK_VERIFICATION_CHECKLIST.md`

---

## Key Statistics

### Email System Size

- Backend: 66 email-specific docs (800+ KB)
- Frontend: 32 email-specific docs (600+ KB)
- Total: 150+ documentation files

### Variables

- Total variables: 48
- Work in invitations: 34
- Post-application only: 14
- Organized in 4 categories (Event, Vendor, Organization, Links)

### Email Types

- Position 1: Invitations (sent immediately)
- Positions 2-17: Registration emails (scheduled)
- System notifications (future)

### Architecture

- SendGrid for delivery
- Webhook system (5-tier fallback)
- 2 variable resolvers (Invitation, Full)
- React frontend with RichText editor
- Timezone-aware scheduling

---

## Quick Command Reference

### Frontend - Find email code

```bash
# Components
find src/components -name "*mail*" -o -name "*email*" -o -name "*Email*"

# Services
grep -r "emailVariables\|emailTemplate\|scheduledEmail" src/services/

# Utilities
find src/utils -name "*email*"

# Types
grep -r "Email\|ScheduledEmail" src/types/
```

### Backend - Find email code

```bash
# Services
find app/services -name "*email*" -o -name "*mail*"

# Models
grep -r "class.*Email" app/models/

# Controllers
find app/controllers -path "*email*" -o -path "*mail*"

# Jobs
find app/jobs -name "*email*" -o -name "*mail*"
```

---

## Documentation Status (May 2026)

### Completed

- Complete variable reference (48 variables)
- Webhook system (5-tier fallback)
- Audit logging
- Variable resolution
- Delivery tracking
- UI components

### Recent Fixes (April 2026)

- SendGrid custom_args field mapping
- Tier 2.25 fallback for registration emails
- Audit log showing transactional emails
- Active email status tracking

### Known Areas to Update

- System notifications (not yet implemented)
- Advanced filtering features
- Performance optimizations

---

## Getting Help

### For Specific Questions

1. **"How do I...?"** → EMAIL_EDITOR_GUIDE.md (frontend)
2. **"Why isn't this working?"** → EMAIL_DEBUG_SUMMARY.md + EMAIL_SYSTEMS_GUIDE.md
3. **"What variable should I use?"** → EMAIL_VARIABLES_REFERENCE.md
4. **"How does the system work?"** → EMAIL_AUTOMATION_SYSTEM_GUIDE.md

### For Code References

- Backend variables: `/app/services/email_variable_resolver.rb`
- Frontend variables: `/src/utils/emailVariables.ts`
- Email editor: `/src/components/producer/Email/EmailEditorPage.tsx`
- API endpoints: `/docs/email/EMAIL_DOCS_INDEX.md` (API section)

---

## Next Steps

1. Identify your role (producer/frontend/backend)
2. Read the "START HERE" doc for your role
3. Keep the quick reference guides handy
4. Use Cmd+F to search within documents
5. Check the bug-fixes directory if you encounter issues

---

**Documentation Catalog Location:**

- Backend: `/Users/beaulazear/Desktop/voxxy-rails/docs/email/DOCUMENTATION_CATALOG.md`
- Frontend: `/Users/beaulazear/Desktop/voxxy-presents-client/docs/email-system/DOCUMENTATION_CATALOG.md`

**Last Updated:** May 20, 2026
