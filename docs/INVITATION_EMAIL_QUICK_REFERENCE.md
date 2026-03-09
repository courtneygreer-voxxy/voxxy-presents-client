# Invitation Email System - Quick Reference

## What is Position 1?

**Position 1 ("Initial Invitation")** is the email sent when invitations are created.

It's a **real ScheduledEmail** (not virtual) that:
- Uses `on_invitation_send` trigger
- Is in the pre_application category
- Can be edited like any other email
- Creates `EmailDelivery` records for tracking

---

## When Invitations Are Sent

1. Producer creates event
2. Producer selects vendor contacts to invite
3. `POST /api/v1/presents/events/:slug/invitations/batch` is called
4. Backend immediately sends Position 1 email to each contact
5. Backend creates `EmailDelivery` with `event_invitation_id` (not `registration_id`)

---

## What Variables CAN Be Used

### Event-Level (Same for all invitees)
```
[eventName]              → "Summer Market 2025"
[eventDate]              → "June 15, 2025"
[eventLocation]          → "Piedmont Park, Atlanta, GA"
[applicationDeadline]    → "May 30, 2025"
[eventLink]              → Application page URL
[organizationName]       → "Voxxy Presents"
```

### Vendor Contact Level (Personalized)
```
[greetingName]           → "John's Tacos" or "John"
[firstName]              → "John"
[businessName]           → "John's Tacos"
[email]                  → "john@example.com"
```

---

## What Variables CAN'T Be Used

### Category-Specific (Don't use!)
```
[boothPrice]             ❌ Unknown until they apply
[installDate]            ❌ Varies by category
[installTime]            ❌ Varies by category
[paymentLink]            ❌ Per-category URL
```

### Registration-Level (Don't use!)
```
[vendorCategory]         ❌ They haven't applied yet
[boothNumber]            ❌ Not assigned yet
[applicationDate]        ❌ No registration yet
```

---

## Solution for Multi-Category Events

### Option 1: Show All Categories (Recommended)
```
Dear [greetingName],

We're looking for vendors for [eventName]!

Available categories:
• Artist Booth - $100
• Food Vendor - $200
• Sponsor Package - $500

Apply here: [eventLink]
```

### Option 2: Generic Language
```
Dear [greetingName],

Vendor fees vary by category. Learn more and apply: [eventLink]
```

---

## Key Files

| File | Purpose |
|------|---------|
| `/src/utils/emailVariables.ts` | Define all variables ([eventName], etc.) |
| `/src/types/email.ts` | EmailDelivery type (has event_invitation_id) |
| `/src/components/producer/Email/EmailAutomationTab.tsx` | Mail tab showing emails |
| `/src/services/api.ts` | EventInvitation API calls |
| `/src/components/shared/EventEmailPreviewModal.tsx` | Preview modal |

---

## Important Notes

1. **Format:** Variables use `[bracket]` format, NOT {{mustache}}
2. **Backend:** Resolver is `InvitationVariableResolver` (not RegistrationVariableResolver)
3. **Tracking:** Creates EmailDelivery with `event_invitation_id` filled (not registration_id)
4. **Edit:** Position 1 is fully editable - producers can customize
5. **Trigger:** Always `on_invitation_send` (can't change)

---

## Quick Links

- Full Analysis: [INVITATION_EMAIL_SYSTEM_ANALYSIS.md](./INVITATION_EMAIL_SYSTEM_ANALYSIS.md)
- Email Variables: `/src/utils/emailVariables.ts` (lines 36-308)
- Email Types: `/src/types/email.ts` (EmailDelivery, ScheduledEmail)
- Email Audit Log: [EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md](./EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md)
- Backend Unification: [INVITATION_UNIFICATION_FRONTEND_UPDATE.md](./INVITATION_UNIFICATION_FRONTEND_UPDATE.md)

---

## Common Questions

**Q: Can I use [boothPrice] in invitation emails?**
A: No - the invitee hasn't chosen their category yet. Use [categoryList] instead.

**Q: Why can't I see invitations in the Mail tab?**
A: Position 1 "Initial Invitation" is in the Mail tab. Invitations are tracked separately in event_invitations table but emails are sent via Position 1.

**Q: How does the backend know what to put in variables?**
A: InvitationVariableResolver uses:
- event_invitation object (has vendor_contact)
- vendor_contact data (first_name, last_name, email, business_name)
- event data (title, date, location, etc.)

**Q: How are invitations tracked?**
A: EmailDelivery records have event_invitation_id (instead of registration_id).
Audit log shows delivery status for each invitation.

**Q: Can I preview an invitation email?**
A: Yes - click Preview on Position 1 email in Mail tab.
(Current limitation: Uses generic sample, not specific contact data)

---

## How to Edit Position 1

1. Open Mail tab for your event
2. Scroll to "Initial Invitation" (Position 1)
3. Click row → Edit button
4. Modify subject/body with any available variables
5. Save changes

**Note:** Trigger type is locked to `on_invitation_send` (can't change)

---

## Recommended Practices

### ✅ DO
- Use [greetingName] to personalize
- Include [eventLink] for call-to-action
- List all categories/prices if multi-category
- Use [applicationDeadline] to create urgency
- Preview before sending

### ❌ DON'T
- Use [boothPrice] (unknown at invitation time)
- Use [installDate] (category-specific)
- Assume vendor_category is known
- Remove [eventLink] (important for conversion)
- Forget to test with real event

---

## What's Coming

Planned enhancements:
- [ ] [categoryList] variable (shows all categories with prices)
- [ ] [applicationsList] variable (for registrations)
- [ ] Invite-specific preview (select vendor contact)
- [ ] [invitationTokenLink] for direct accept/decline

