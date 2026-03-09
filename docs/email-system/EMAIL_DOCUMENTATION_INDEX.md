# Email System Documentation - Index

**Last Updated:** March 8, 2026
**Version:** 2.0 (Centralized System)

---

## 📚 Documentation Overview

This folder contains complete documentation for the Voxxy Presents Email System, including:
- System architecture
- Variable reference
- Producer guides
- Technical specifications

---

## 🎯 Start Here

### For Producers & Event Organizers
**Want to create and customize event emails?**

→ **[EMAIL_EDITOR_GUIDE.md](./EMAIL_EDITOR_GUIDE.md)** 📧
   - How to use the email editor
   - Variable insertion guide
   - Best practices
   - Common scenarios
   - Troubleshooting

### For Developers
**Need to understand the system or add features?**

→ **[EMAIL_SYSTEM_GUIDE.md](./EMAIL_SYSTEM_GUIDE.md)** 🏗️
   - Complete architecture overview
   - Email types (Invitation vs Registration)
   - Variable resolution system
   - Frontend/Backend components
   - API reference

---

## 📖 Reference Guides

### Variables Reference
**[EMAIL_VARIABLES_REFERENCE.md](./EMAIL_VARIABLES_REFERENCE.md)** 📋

Complete list of all 48 email variables:
- Organized by category (Event, Vendor, Organization, Links)
- Shows which work in invitations vs registrations
- Examples and usage patterns
- Resolution reference

**Quick Stats:**
- Total: 48 variables
- Work in Invitations: 34 ✅
- Post-Application Only: 14 ❌

### Invitation Quick Reference
**[../INVITATION_EMAIL_QUICK_REFERENCE.md](../INVITATION_EMAIL_QUICK_REFERENCE.md)** ⚡

Fast lookup for invitation emails (Position 1):
- What variables work in invitations
- What DON'T work (and why)
- Best practices
- Common mistakes
- Testing checklist

---

## 🗂️ Documentation Hierarchy

```
docs/
├── email-system/
│   ├── EMAIL_DOCUMENTATION_INDEX.md (this file)
│   ├── EMAIL_SYSTEM_GUIDE.md (technical overview)
│   ├── EMAIL_VARIABLES_REFERENCE.md (all variables)
│   ├── EMAIL_EDITOR_GUIDE.md (producer guide)
│   ├── SCHEDULED_EMAILS_SYSTEM.md (legacy - outdated)
│   ├── EMAIL_AUTOMATION_PLAN.md (planning docs)
│   └── ... (other email docs)
│
└── INVITATION_EMAIL_QUICK_REFERENCE.md (invitation reference)
```

---

## 📝 Documentation By Role

### 🎨 For Producers

**Essential Reading:**
1. **[EMAIL_EDITOR_GUIDE.md](./EMAIL_EDITOR_GUIDE.md)** - How to use the editor
2. **[INVITATION_EMAIL_QUICK_REFERENCE.md](../INVITATION_EMAIL_QUICK_REFERENCE.md)** - Invitation tips
3. **[EMAIL_VARIABLES_REFERENCE.md](./EMAIL_VARIABLES_REFERENCE.md)** - Variable lookup

**Common Tasks:**
- Creating invitation emails → EMAIL_EDITOR_GUIDE.md § "Email Types"
- Inserting variables → EMAIL_EDITOR_GUIDE.md § "Using Variables"
- Multi-category events → INVITATION_EMAIL_QUICK_REFERENCE.md § "Solution for Multi-Category Events"
- Troubleshooting blanks → EMAIL_EDITOR_GUIDE.md § "Troubleshooting"

### 👩‍💻 For Frontend Developers

**Essential Reading:**
1. **[EMAIL_SYSTEM_GUIDE.md](./EMAIL_SYSTEM_GUIDE.md)** - System architecture
2. **[EMAIL_VARIABLES_REFERENCE.md](./EMAIL_VARIABLES_REFERENCE.md)** - Variable system

**Key Files:**
- `/src/utils/emailVariables.ts` - All 48 variables with flags
- `/src/components/shared/RichTextEditor.tsx` - HTML editor
- `/src/components/producer/Email/EmailAutomationTab.tsx` - Mail tab
- `/src/components/shared/EventEmailPreviewModal.tsx` - Preview modal

**Common Tasks:**
- Adding new variable → EMAIL_SYSTEM_GUIDE.md § "Variable Resolution System"
- Email editor changes → EMAIL_SYSTEM_GUIDE.md § "Email Editor"
- Understanding email flow → EMAIL_SYSTEM_GUIDE.md § "System Architecture"

### 🔧 For Backend Developers

**Essential Reading:**
1. **[EMAIL_SYSTEM_GUIDE.md](./EMAIL_SYSTEM_GUIDE.md)** - Backend services
2. **[EMAIL_VARIABLES_REFERENCE.md](./EMAIL_VARIABLES_REFERENCE.md)** - Resolution reference

**Key Files:**
- `/app/services/invitation_variable_resolver.rb` - 34 invitation variables
- `/app/services/email_variable_resolver.rb` - All 48 registration variables
- `/app/services/email_sender_service.rb` - SendGrid integration
- `/app/controllers/api/v1/presents/scheduled_emails_controller.rb` - Email API

**Common Tasks:**
- Adding new variable → Update both resolvers + frontend
- Changing resolution logic → EMAIL_SYSTEM_GUIDE.md § "Backend Services"
- Email delivery tracking → EMAIL_SYSTEM_GUIDE.md § "Delivery Tracking"

---

## 🔍 Find Information By Topic

### Variables

| Topic | Document | Section |
|-------|----------|---------|
| Complete variable list | EMAIL_VARIABLES_REFERENCE.md | All sections |
| Invitation variables (34) | INVITATION_EMAIL_QUICK_REFERENCE.md | "What Variables CAN Be Used" |
| Registration variables (48) | EMAIL_VARIABLES_REFERENCE.md | All categories |
| How to insert variables | EMAIL_EDITOR_GUIDE.md | "Using Variables" |
| Variable resolution | EMAIL_SYSTEM_GUIDE.md | "Variable Resolution System" |

### Email Types

| Topic | Document | Section |
|-------|----------|---------|
| Invitation emails (Position 1) | EMAIL_SYSTEM_GUIDE.md | "Email Types" § "Invitation Emails" |
| Registration emails (2-17) | EMAIL_SYSTEM_GUIDE.md | "Email Types" § "Registration Emails" |
| System emails (future) | EMAIL_SYSTEM_GUIDE.md | "Email Types" § "System Emails" |
| Email sequence | EMAIL_SYSTEM_GUIDE.md | "Email Sequence & Templates" |

### Editor

| Topic | Document | Section |
|-------|----------|---------|
| Rich text editor | EMAIL_EDITOR_GUIDE.md | "Email Editor Overview" |
| Plain text modal | EMAIL_EDITOR_GUIDE.md | "Email Editor Overview" |
| Variable buttons | EMAIL_EDITOR_GUIDE.md | "Using Variables" |
| Locked footer | EMAIL_SYSTEM_GUIDE.md | "Email Editor" § "Locked Footer" |

### Technical

| Topic | Document | Section |
|-------|----------|---------|
| Architecture | EMAIL_SYSTEM_GUIDE.md | "System Architecture" |
| API endpoints | EMAIL_SYSTEM_GUIDE.md | "API Reference" |
| Backend services | EMAIL_SYSTEM_GUIDE.md | "Backend Services" |
| Frontend components | EMAIL_SYSTEM_GUIDE.md | "Frontend Components" |
| Delivery tracking | EMAIL_SYSTEM_GUIDE.md | "Delivery Tracking" |

---

## 🆕 Recent Updates (March 2026)

### Variable System Overhaul
**Documents Updated:**
- EMAIL_SYSTEM_GUIDE.md
- EMAIL_VARIABLES_REFERENCE.md
- INVITATION_EMAIL_QUICK_REFERENCE.md

**Changes:**
- ✅ Complete list of 48 variables
- ✅ Accurate `worksInInvitations` flags
- ✅ New variables: eventEndDate, dateRange, eventCity, phone, website, etc.
- ✅ Fixed invitation links: dashboardLink, artistApplicationLink, vendorApplicationLink
- ✅ Changed format from `{{mustache}}` to `[bracket]`

### Documentation Reorganization
**New Documents:**
- EMAIL_DOCUMENTATION_INDEX.md (this file)
- EMAIL_SYSTEM_GUIDE.md (master technical guide)
- EMAIL_VARIABLES_REFERENCE.md (complete variable reference)
- EMAIL_EDITOR_GUIDE.md (producer guide)

**Updated Documents:**
- INVITATION_EMAIL_QUICK_REFERENCE.md (complete rewrite)

**Deprecated:**
- SCHEDULED_EMAILS_SYSTEM.md (outdated - use EMAIL_SYSTEM_GUIDE.md instead)

---

## 📊 System Statistics

### Email System
- **Total Variables:** 48
- **Email Positions:** 17 (Position 1 = Invitation, 2-17 = Registration)
- **Variable Resolvers:** 2 (InvitationVariableResolver, EmailVariableResolver)
- **Email Types:** 2 contexts (Pre-application, Post-application)

### Variables by Category
- **Event:** 15 variables
- **Organization:** 2 variables
- **Vendor:** 19 variables
- **Links:** 12 variables

### Variables by Availability
- **Invitations (Position 1):** 34 variables ✅
- **Post-Application (2-17):** 48 variables ✅
- **Invitation-Only:** 0 variables
- **Post-Application Only:** 14 variables

---

## 🔗 Related Documentation

### Outside This Folder
- `/docs/BACKEND_TEAM_UPDATE_FEB_28_2026.md` - Position 1 centralization
- `/docs/INVITATION_UNIFICATION_FRONTEND_UPDATE.md` - Invitation system update
- `/docs/development/BACKEND_EMAIL_SETUP.md` - SendGrid setup

### Legacy Documentation (Outdated)
- `/docs/email-system/SCHEDULED_EMAILS_SYSTEM.md` - Use EMAIL_SYSTEM_GUIDE.md instead
- Various invitation analysis docs - Use INVITATION_EMAIL_QUICK_REFERENCE.md instead

---

## 💡 Quick Links

### Most Common Questions

**"What variables can I use in invitation emails?"**
→ [INVITATION_EMAIL_QUICK_REFERENCE.md](../INVITATION_EMAIL_QUICK_REFERENCE.md) § "What Variables CAN Be Used"

**"How do I insert variables in the editor?"**
→ [EMAIL_EDITOR_GUIDE.md](./EMAIL_EDITOR_GUIDE.md) § "Using Variables"

**"Why is my variable showing blank?"**
→ [EMAIL_EDITOR_GUIDE.md](./EMAIL_EDITOR_GUIDE.md) § "Troubleshooting"

**"What's the difference between invitation and registration emails?"**
→ [EMAIL_SYSTEM_GUIDE.md](./EMAIL_SYSTEM_GUIDE.md) § "Email Types"

**"How do I handle multi-category events?"**
→ [INVITATION_EMAIL_QUICK_REFERENCE.md](../INVITATION_EMAIL_QUICK_REFERENCE.md) § "Solution for Multi-Category Events"

---

## 📞 Getting Help

### For Producers
- Check [EMAIL_EDITOR_GUIDE.md](./EMAIL_EDITOR_GUIDE.md) troubleshooting section
- Contact: support@voxxypresents.com

### For Developers
- Check [EMAIL_SYSTEM_GUIDE.md](./EMAIL_SYSTEM_GUIDE.md) technical sections
- Contact: engineering@voxxypresents.com

### Found a Bug?
- Report at: https://github.com/voxxypresents/voxxy-presents-client/issues

---

## 🎯 Quick Start Guides

### For New Producers
1. Read [EMAIL_EDITOR_GUIDE.md](./EMAIL_EDITOR_GUIDE.md) § "Getting Started"
2. Skim [EMAIL_VARIABLES_REFERENCE.md](./EMAIL_VARIABLES_REFERENCE.md) § "Quick Summary"
3. Try creating your first invitation email
4. Use [INVITATION_EMAIL_QUICK_REFERENCE.md](../INVITATION_EMAIL_QUICK_REFERENCE.md) as needed

### For New Developers
1. Read [EMAIL_SYSTEM_GUIDE.md](./EMAIL_SYSTEM_GUIDE.md) § "Overview" and "Architecture"
2. Review [EMAIL_VARIABLES_REFERENCE.md](./EMAIL_VARIABLES_REFERENCE.md) § "Resolution Reference"
3. Explore key files listed in EMAIL_SYSTEM_GUIDE.md
4. Set up local development environment

---

**Last Updated:** March 8, 2026

**Documentation maintained by:** Voxxy Presents Engineering Team

**END OF INDEX**
