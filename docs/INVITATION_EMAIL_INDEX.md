# Invitation Email System - Complete Documentation Index

**Last Updated:** March 4, 2026  
**Status:** Unified system (Position 1 handles all invitations)  
**Total Documentation:** 1,690 lines across 4 comprehensive guides

---

## Quick Navigation

### Start Here
- **New to the system?** → [INVITATION_EMAIL_QUICK_REFERENCE.md](./INVITATION_EMAIL_QUICK_REFERENCE.md)
- **Need the full story?** → [INVITATION_EMAIL_SYSTEM_ANALYSIS.md](./INVITATION_EMAIL_SYSTEM_ANALYSIS.md)
- **Curious about architecture?** → [INVITATION_EMAIL_ARCHITECTURE.md](./INVITATION_EMAIL_ARCHITECTURE.md)
- **Just want the summary?** → [INVITATION_EMAIL_ANALYSIS_SUMMARY.md](./INVITATION_EMAIL_ANALYSIS_SUMMARY.md)

---

## Document Overview

### 1. INVITATION_EMAIL_QUICK_REFERENCE.md (5 min read)
**Best for:** Quick lookups, common questions, best practices

**Covers:**
- What is Position 1?
- When invitations are sent
- What variables CAN be used (23 total)
- What variables CAN'T be used (15+ total)
- Solutions for multi-category events
- Do's and Don'ts
- FAQ

**Key Takeaway:** Invitations can use event + contact variables, but NOT category-specific variables.

---

### 2. INVITATION_EMAIL_SYSTEM_ANALYSIS.md (20 min read)
**Best for:** Deep understanding, implementation details, recommendations

**Covers:**
- EventInvitation type definition
- How invitation emails are sent (workflow)
- Email variable resolution system
- EmailDelivery model (supports both invitations AND registrations)
- Complete comparison: Invitation vs Registration emails
- Available variables (with examples)
- Unavailable variables (with explanations)
- Email preview system and limitations
- Multi-category support options
- Default invitation templates
- 6 prioritized recommendations

**Key Takeaway:** System is well-designed but needs [categoryList] variable for multi-category support.

---

### 3. INVITATION_EMAIL_ARCHITECTURE.md (15 min read)
**Best for:** Visual learners, understanding data flow, database relationships

**Covers:**
- High-level system architecture diagram
- Data context at each stage (4 detailed examples)
- Variable resolution flow (with actual transformations)
- Complete database schema relationships
- Variable categories and their data sources
- Timeline: Invitation vs Registration email flow
- Summary of what invitations have/lack

**Key Takeaway:** Clear separation between invitation (pre-application) and registration (post-application) contexts.

---

### 4. INVITATION_EMAIL_ANALYSIS_SUMMARY.md (10 min read)
**Best for:** Executive overview, testing checklist, key files reference

**Covers:**
- 10 key findings (one per major aspect)
- What works well
- What's limited
- What needs enhancement
- Prioritized recommendations (5 total)
- Key code locations table
- Data flow diagrams
- Testing considerations
- Conclusion and next steps

**Key Takeaway:** Main gap is no [categoryList] variable; main recommendation is to add it.

---

## Key Findings at a Glance

### The Core System

**Position 1 = Invitation Email**
- Real ScheduledEmail (not virtual)
- Uses `on_invitation_send` trigger
- Fully editable by producers
- Creates EmailDelivery records for audit tracking

**Two Variable Resolvers**
- InvitationVariableResolver: For Position 1 (event + contact data)
- RegistrationVariableResolver: For other emails (+ category data)

**Data Separation**
- EventInvitation: Pre-application record
- Registration: Post-application record
- EmailDelivery: Supports both via registration_id OR event_invitation_id

---

## Available Variables Reference

### CAN Use (23 Variables)
```
Event:       [eventName], [eventDate], [eventTime], [eventLocation],
             [eventVenue], [eventDescription], [applicationDeadline],
             [paymentDueDate], [ageRestriction]

Organization: [organizationName], [organizationEmail]

Contact:     [greetingName], [firstName], [lastName], [fullName],
             [businessName], [email]

Links:       [eventLink], [invitationLink], [bulletinLink],
             [dashboardLink], [unsubscribeLink]
```

### CAN'T Use (15+ Variables)
```
Category:    [boothPrice], [categoryPrice], [installDate], [installTime],
             [installStartTime], [installEndTime], [paymentLink]

Registration: [vendorCategory], [categoryList], [boothNumber],
              [applicationDate]
```

---

## The Main Gap: Multi-Category Invitations

### Problem
- Event has 3 categories: Artist ($100), Food ($200), Sponsor ($500)
- Invitation sent BEFORE vendor chooses category
- Can't show [boothPrice] because: which price?

### Current Workarounds
1. Show generic language: "Fee varies by category"
2. Manually list categories in email body
3. Let them explore via [eventLink]

### Recommended Solution
Add [categoryList] variable:
```
Dear [greetingName],

Available categories:
[categoryList]

Learn more: [eventLink]
```

Would output:
```
Dear John's Tacos,

Available categories:
• Artist Booth - $100
• Food Vendor - $200
• Sponsor Package - $500

Learn more: [eventLink]
```

---

## Code Locations Quick Reference

| Component | File | Line(s) |
|-----------|------|---------|
| EventInvitation Type | src/services/api.ts | 2450+ |
| Email Variables | src/utils/emailVariables.ts | 36-308 |
| EmailDelivery Type | src/types/email.ts | 129-168 |
| ScheduledEmail Type | src/types/email.ts | 63-123 |
| Email Preview Modal | src/components/shared/EventEmailPreviewModal.tsx | 102-366 |
| Mail Tab UI | src/components/producer/Email/EmailAutomationTab.tsx | Throughout |
| API Invitations | src/services/api.ts | 2537-2657 |
| API Scheduled Emails | src/services/api.ts | 1178+ |

---

## Related Documentation

### Other Email System Docs
- [EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md](./EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md)
- [INVITATION_UNIFICATION_FRONTEND_UPDATE.md](./INVITATION_UNIFICATION_FRONTEND_UPDATE.md)
- [INVITATION_EMAIL_FIX.md](./fixes/INVITATION_EMAIL_FIX.md)
- [VENDOR_CATEGORY_ANALYSIS.md](./VENDOR_CATEGORY_ANALYSIS.md)
- [PHASES_1-3_SUMMARY.md](./PHASES_1-3_SUMMARY.md)

### Backend Integration Docs
- [BACKEND_INVITATION_REQUIREMENTS.md](./BACKEND_INVITATION_REQUIREMENTS.md)
- [BACKEND_TEAM_UPDATE_FEB_28_2026.md](./BACKEND_TEAM_UPDATE_FEB_28_2026.md)

### Email Template System
- [email-system/EMAIL_TEMPLATES.md](./email-system/EMAIL_TEMPLATES.md)
- [email-system/EMAIL_AUTOMATION_PLAN.md](./email-system/EMAIL_AUTOMATION_PLAN.md)

---

## Testing Checklist

### Verify Invitation System Works
- [ ] Create event with vendors
- [ ] Add vendor applications (multiple categories)
- [ ] Create batch invitations
- [ ] Check Mail tab shows Position 1
- [ ] Click Preview on Position 1
- [ ] Verify variables are resolved
- [ ] Check audit log shows EmailDelivery records
- [ ] Verify event_invitation_id is populated

### Test Variable Resolution
- [ ] [eventName] resolves correctly
- [ ] [greetingName] shows vendor's preferred name
- [ ] [eventLink] points to application page
- [ ] [boothPrice] shows error/blank (expected)
- [ ] [vendorCategory] shows error/blank (expected)

### Multi-Category Testing (Future)
- [ ] Create event with 3+ categories
- [ ] Add [categoryList] to Position 1 template
- [ ] Preview shows all categories with prices
- [ ] Format is clean and readable
- [ ] Prices are correct for each category

---

## Recommendations Summary

### IMMEDIATE (Do Now)
1. **Add [categoryList] Variable**
   - Priority: HIGH
   - Impact: Enables transparent multi-category invitations
   - Effort: 2-3 hours (frontend + backend)
   - Files: emailVariables.ts, backend resolver

### SHORT-TERM (Next Sprint)
2. **Improve Preview Modal**
   - Allow selecting sample vendor contact
   - Show realistic personalization preview
   - Effort: 3-4 hours

3. **Document Limitations**
   - Create backend documentation
   - Explain InvitationVariableResolver capabilities
   - Effort: 2 hours

### MEDIUM-TERM (Future Sprints)
4. **Add [applicationsList] Variable**
   - For registrations with multiple applications
   - Effort: 3-4 hours

5. **Add [invitationTokenLink] Variable**
   - Direct accept/decline from email
   - Effort: 4-5 hours

---

## Glossary

**Position 1:** The "Initial Invitation" scheduled email (position=1 in database). Used when sending batch invitations.

**EventInvitation:** Database record created when an invitation is sent. Pre-application (no registration yet). Separate from Registration table.

**InvitationVariableResolver:** Backend service that resolves [variables] in invitation emails. Has access to: event_invitation, vendor_contact, event. Does NOT have registration context.

**RegistrationVariableResolver:** Backend service that resolves [variables] in application response emails. Has access to: registration, vendor_application, event. Supports category-specific variables.

**EmailDelivery:** Database record tracking email delivery. Has registration_id OR event_invitation_id (not both). Distinguishes between invitation and application emails.

**[bracket] format:** Variable notation used in emails (e.g., [eventName], [firstName]). Also called "bracket notation."

**Trigger Type:** When an email is sent (e.g., on_invitation_send, on_approval, days_before_event).

---

## Frequently Asked Questions

**Q: Where is the invitation email template?**
A: It's Position 1 ("Initial Invitation") in the Mail tab. Edit it like any other email.

**Q: Why can't I use [boothPrice] in invitations?**
A: Because the invitee hasn't chosen their category yet. We don't know which price to show.

**Q: How can I show all category prices in the invitation?**
A: Use [categoryList] (once implemented) or manually list them in the email body.

**Q: Can I preview the invitation email?**
A: Yes, click Preview on Position 1 in the Mail tab. (Currently uses generic sample data.)

**Q: How are invitation deliveries tracked?**
A: EmailDelivery records with event_invitation_id set. Check audit log for delivery status.

**Q: Can I send invitations at a specific time (not immediately)?**
A: The trigger is locked to on_invitation_send (when created). Future enhancement could allow scheduling.

**Q: What's the difference between [eventLink] and [invitationLink]?**
A: Currently the same. [invitationLink] is just an alias for clarity in invitation context.

---

## Version History

| Date | Version | Change | Status |
|------|---------|--------|--------|
| 2026-02-28 | 1.0 | Unified Position 1 system | Deployed |
| 2026-03-04 | 1.1 | Complete analysis & documentation | Current |
| TBD | 1.2 | Add [categoryList] variable | Planned |
| TBD | 2.0 | Enhanced preview & multi-category | Future |

---

## Contact & Questions

**For questions about:**
- **System design:** See [INVITATION_EMAIL_SYSTEM_ANALYSIS.md](./INVITATION_EMAIL_SYSTEM_ANALYSIS.md)
- **Architecture:** See [INVITATION_EMAIL_ARCHITECTURE.md](./INVITATION_EMAIL_ARCHITECTURE.md)
- **Quick answers:** See [INVITATION_EMAIL_QUICK_REFERENCE.md](./INVITATION_EMAIL_QUICK_REFERENCE.md)
- **Recommendations:** See [INVITATION_EMAIL_ANALYSIS_SUMMARY.md](./INVITATION_EMAIL_ANALYSIS_SUMMARY.md)

---

## Document Statistics

- **Total Pages:** 1,690 lines of documentation
- **4 Complete Guides:** Analysis, Architecture, Quick Reference, Summary
- **Code Examples:** 30+
- **Diagrams:** 10+ ASCII diagrams
- **Coverage:** EventInvitation, EmailDelivery, Variables, Resolvers, Preview, Multi-category
- **Recommendations:** 5 prioritized enhancements
- **Files Generated:** March 4, 2026

---

**Last Reviewed:** March 4, 2026  
**Next Review:** After [categoryList] implementation
