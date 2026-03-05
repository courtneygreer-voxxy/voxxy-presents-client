# Invitation Email System Analysis - Summary

**Analysis Completed:** March 4, 2026
**Coverage:** Frontend codebase + documentation review
**Output Files Generated:** 2 comprehensive guides

---

## Analysis Results

### 1. EventInvitation Type/Model
**Location:** `/src/services/api.ts` (lines 2450+)

- ✅ Type is fully defined: `EventInvitation` interface
- ✅ Has: id, event_id, vendor_contact_id, status, invitation_token
- ✅ Status tracks: pending, sent, viewed, accepted, declined, expired
- ✅ Separate from Registration (invitation is pre-application)

### 2. How Invitation Emails Are Sent
**Key Finding: Position 1 Unified System (Feb 28, 2026)**

- ✅ **Position 1 is the invitation email** (real ScheduledEmail, not virtual)
- ✅ Sent via `EventInvitationsController` on backend
- ✅ Uses `InvitationVariableResolver` for variable resolution
- ✅ Creates `EmailDelivery` records with `event_invitation_id` (not registration_id)
- ✅ Fully editable by producers (subject, body, trigger timing)

**Workflow:**
1. Batch invitations created → status = "sent", sent_at = now
2. Background job fetches Position 1 template
3. InvitationVariableResolver resolves [variables]
4. Email sent to vendor_contact.email
5. EmailDelivery record created for audit tracking

### 3. Email Variable Resolver
**Variable Format:** `[bracket]` notation (not {{mustache}})

**Two Resolvers:**
- `InvitationVariableResolver`: For Position 1 (invitations)
  - Has access to: event_invitation, vendor_contact, event
  - NO registration data
  - NO vendor_application context

- `RegistrationVariableResolver`: For other emails
  - Has access to: registration, vendor_application, event
  - Can resolve category-specific variables
  - Full vendor application context

**Variable Conversion:**
- Backend stores: `[bracket]` format
- Frontend loads: Converts {{mustache}} → [bracket] for backwards compatibility
- Frontend saves: Keeps [bracket] format (backend expects this)

### 4. EmailDelivery Model
**File:** `/src/types/email.ts` (lines 129-168)

**Key Finding: Supports Both Invitations AND Registrations**

```typescript
export interface EmailDelivery {
  // Can be invitation OR registration (not both)
  registration_id: number | null
  event_invitation_id: number | null
  
  // All other fields support both types
  sendgrid_message_id: string
  status: DeliveryStatus
  recipient_email: string
  sent_at: string | null
  delivered_at: string | null
  bounced_at: string | null
  
  // Audit log data
  recipient_name?: string | null
  vendor_category?: string | null  // For registrations only
}
```

**Key Points:**
- ✅ One field per type: registration_id OR event_invitation_id
- ✅ Audit log can distinguish invitation vs registration deliveries
- ✅ Full webhook tracking for both types
- ✅ Retry logic works for both

### 5. Invitation vs Registration Emails - Complete Comparison

| Feature | Invitation | Registration |
|---------|-----------|--------------|
| **When Sent** | When created | After trigger event |
| **Recipient** | vendor_contact | registration |
| **Data Available** | Event + contact only | Event + contact + category |
| **[boothPrice]** | ❌ Unknown | ✅ Category-specific |
| **[installDate]** | ❌ Not available | ✅ Category-specific |
| **[vendorCategory]** | ❌ Unknown | ✅ Their choice |
| **[greetingName]** | ✅ Works | ✅ Works |
| **[eventLink]** | ✅ Works | ✅ Works |
| **Editable** | ✅ Yes (Position 1) | ✅ Yes |
| **Trigger Type** | on_invitation_send | Variable (on_approval, etc.) |

### 6. Available Variables for Invitations

**CAN use (23 total):**
- Event: eventName, eventDate, eventTime, eventLocation, eventVenue, eventDescription, applicationDeadline, paymentDueDate, ageRestriction
- Organization: organizationName, organizationEmail
- Contact: greetingName, firstName, lastName, fullName, businessName, email
- Links: eventLink, invitationLink, bulletinLink, dashboardLink, unsubscribeLink

**CANNOT use (15+ total):**
- Category-specific: boothPrice, categoryPrice, installDate, installTime, installStartTime, installEndTime, paymentLink
- Registration-level: vendorCategory, categoryList, boothNumber, applicationDate

### 7. Email Preview Modal

**Current Status:**
- ✅ Works for all emails (including Position 1)
- ❌ No invitation-specific preview mode
- ❌ Category dropdown shown but doesn't affect invitation variables
- ❌ No way to preview with specific vendor contact data
- Uses generic sample values

**Limitations:**
- Preview uses `POST /api/v1/presents/events/:slug/scheduled_emails/:id/preview`
- Optional: registration_id and category parameters
- For invitations: uses sample data, not real invitation context

### 8. Default Invitation Templates

**Location:** Backend system templates (not in frontend)

**Position 1 Setup:**
- Database field: email_template_items.position = 1
- Trigger: on_invitation_send
- Category: pre_application
- System-provided default (customizable)

**Typical Content:**
```
Subject: [greetingName], you're invited to [eventName]!
Body: Hello [greetingName], You're invited to participate...
```

### 9. Multi-Category Invitations - Current Gap

**Problem:** Events with multiple vendor types (Artist $100, Food $200, Sponsor $500)
- Invitations sent BEFORE vendor chooses category
- Can't use [boothPrice] (which price?)
- No built-in way to show all categories

**Current Solutions:**
1. Use generic language: "Fee varies by category"
2. List categories manually in email body
3. Use [eventLink] to let them explore

**Recommended Solution:** Add [categoriesList] variable

### 10. Audit Log Integration

**EmailDelivery Tracking:**
- ✅ Stores event_invitation_id for invitations
- ✅ Stores registration_id for applications
- ✅ Audit log can display delivery status
- ✅ Distinguishes between invitation and registration emails

**Open Issues:**
- vendor_category field only populated for registrations
- Would need separate field for invitation-type category (if needed)

---

## Key Findings Summary

### What Works Well
1. **Unified System:** Position 1 handles all invitation emails (no virtual emails)
2. **Clean Separation:** EventInvitation ≠ Registration (separate tables)
3. **Variable Resolution:** System handles [bracket] format correctly
4. **Delivery Tracking:** EmailDelivery supports both invitation and registration types
5. **Editable Templates:** Producers can customize Position 1 like any other email

### What's Limited
1. **No Category Context:** Invitations can't access vendor_application data
2. **Missing Variables:** No [categoriesList] for multi-category events
3. **Preview Limitations:** Can't preview with specific vendor contact
4. **Trigger Locked:** Can't change Position 1 trigger type
5. **No Invitation Token Link:** Can't provide direct accept/decline URL

### What Needs Enhancement
1. Add [categoriesList] variable - HIGH PRIORITY
2. Improve invitation preview - MEDIUM PRIORITY
3. Add [applicationsList] for registrations - MEDIUM PRIORITY
4. Document resolver limitations - LOW PRIORITY
5. Add [invitationTokenLink] variable - LOW PRIORITY

---

## Recommendations (Prioritized)

### IMMEDIATE (Critical for multi-category support)
1. **Add [categoriesList] Variable**
   - Shows all categories with prices
   - Essential for transparent multi-category invitations
   - Simple backend implementation

### SHORT-TERM (Quality improvements)
2. **Improve Preview Modal**
   - Allow selecting sample vendor contact
   - Show real greeting name, not placeholder
   - Better represents actual invitation

3. **Document Category-Specific Limitations**
   - Create backend documentation
   - Explain what InvitationVariableResolver can access
   - Provide examples of what works/doesn't work

### MEDIUM-TERM (Feature enhancements)
4. **Add [applicationsList] Variable**
   - For registration emails showing multiple applications
   - Helps vendors understand their application status

5. **Add [invitationTokenLink] Variable**
   - Direct link to accept/decline invitation
   - Improves engagement and response rates
   - Works with token-based authentication

---

## Files Generated

### 1. INVITATION_EMAIL_SYSTEM_ANALYSIS.md (Comprehensive)
- 12 sections covering all aspects
- Code examples and implementation details
- Comparison tables
- Recommendations with code snippets
- Best practices and use cases

**Location:** `/docs/INVITATION_EMAIL_SYSTEM_ANALYSIS.md`

### 2. INVITATION_EMAIL_QUICK_REFERENCE.md (Quick lookup)
- One-page reference guide
- What works and what doesn't
- Common questions answered
- Do's and Don'ts
- Key files and links

**Location:** `/docs/INVITATION_EMAIL_QUICK_REFERENCE.md`

---

## Key Code Locations

| Component | File | Lines |
|-----------|------|-------|
| EventInvitation Type | `/src/services/api.ts` | 2450+ |
| Email Variables | `/src/utils/emailVariables.ts` | 36-308 |
| EmailDelivery Type | `/src/types/email.ts` | 129-168 |
| Email Preview Modal | `/src/components/shared/EventEmailPreviewModal.tsx` | 102-366 |
| Mail Tab | `/src/components/producer/Email/EmailAutomationTab.tsx` | Throughout |
| API Calls | `/src/services/api.ts` | 2537-2657 |

---

## Data Flow Diagrams

### Invitation Email Flow
```
Producer Creates Event
    ↓
Selects Vendor Contacts
    ↓
POST /invitations/batch
    ↓
Backend Creates EventInvitation Records
    ↓
Fetches Position 1 Template
    ↓
InvitationVariableResolver resolves [variables]
    ↓
SendGrid sends email
    ↓
EmailDelivery created (event_invitation_id set)
    ↓
Webhook updates status (sent, delivered, bounced, etc.)
```

### Variable Resolution Comparison
```
INVITATION EMAIL:
[eventName] ✅ (from event)
[firstName] ✅ (from vendor_contact)
[boothPrice] ❌ (from vendor_application - NOT available)

REGISTRATION EMAIL:
[eventName] ✅ (from event)
[firstName] ✅ (from vendor_contact)
[boothPrice] ✅ (from vendor_application via registration)
```

---

## Testing Considerations

### To Verify Invitation System:
1. Create event with multiple vendor applications
2. Create batch invitations for specific contacts
3. Check Mail tab → Position 1 is visible
4. Click Preview → Shows resolved [variables]
5. Check audit log → EmailDelivery has event_invitation_id
6. Verify vendor receives email with correct data

### To Test Variable Resolution:
1. Edit Position 1 template with test variables
2. Preview with different categories (if supported)
3. Send test email
4. Verify variables are resolved correctly
5. Check for missing variables (should be blank or error)

### To Verify Multi-Category Support (Future):
1. Add [categoriesList] variable to template
2. Preview with multi-category event
3. Verify all categories and prices are shown
4. Send test and verify formatting

---

## Conclusion

The invitation system is well-designed with clear separation between invitations (pre-application) and registrations (post-application). The unification of Position 1 as a real ScheduledEmail eliminates confusion and provides a consistent interface.

**Main Gap:** No built-in support for showing all categories/prices in multi-category invitations.

**Main Recommendation:** Add [categoriesList] variable to enable transparent multi-category marketing.

The system is ready for enhancement with the recommended improvements.
