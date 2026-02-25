# Voxxy Presents - Cleanup & Error Monitoring Summary

**Date:** February 25, 2026
**Prepared for:** Courtney Greer (CEO) & Beau Lazear (CTO)

---

## Executive Summary

This document summarizes the cleanup work completed and error monitoring system designed for Voxxy Presents 2.0. The focus is on removing sensitive data from the repository, fixing form validation bugs, and establishing robust error tracking for all application forms.

---

## Part 1: Cleanup Completed ✅

### 1.1 Sensitive Files Removed

**Deleted from `/files/` directory:**
- ✅ `cincinnati-show - c43f6f5f-d1c9-4866-9ec7-7833c853c8ad.csv` (175 KB)
- ✅ `minneapolis-38a8ceae-65d5-4f11-b2dc-71fe2a0bc309 (1).csv` (1.2 MB)
- ✅ `SF- Emails 5d38481c-81ab-4a72-a6c6-5569ae8f1a7a.csv` (8.3 MB)
- ✅ `real_minneapolis-38a8ceae-65d5-4f11-b2dc-71fe2a0bc309 (2).csv` (1.2 MB)
- ✅ `test_cincinnati_registrations.csv` (2.5 KB)
- ✅ `script_1_create_cincinnati_event.rb` (2.5 KB)
- ✅ `script_1_create_minneapolis_event.rb` (2.8 KB)
- ✅ `script_1_create_sf_event.rb` (2.9 KB)
- ✅ `script_2_cincinnati_contacts.rb` (7.7 KB)

**Total removed:** ~11 MB of sensitive customer data

### 1.2 .gitignore Updated

Added protections to prevent future sensitive file commits:
```gitignore
# Sensitive data files (customer data, scripts)
files/*.csv
files/*.rb
data/
```

### 1.3 Git History Cleanup

**Files found in git history:**
- Commit `dcd38fe`: CSV files added
- Commit `2710902`: Demo data seeding

**Recommendation:** Since this is a private repo and data has been restored, git history cleanup is **optional but recommended** for best practices.

**To clean history (run after backing up):**
```bash
# Option 1: Using git filter-repo (recommended)
pip install git-filter-repo
git filter-repo --path-glob '*.csv' --invert-paths
git filter-repo --path-glob 'files/*.rb' --invert-paths

# Option 2: Using BFG Repo Cleaner
brew install bfg
bfg --delete-files '*.csv'
bfg --delete-folders 'files'
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push (CAUTION: coordinate with team)
git push origin --force --all
```

---

## Part 2: Bugs Fixed 🐛

### 2.1 Social Media Link Requirement Validation

**Issue:** Form displayed "Social & Portfolio * (One Link Required)" but allowed submission with NO links provided.

**Root Cause:** Validation at [VendorApplicationForm.tsx:246-250](../src/pages/VendorApplicationForm.tsx#L246-L250) only checked:
- Name, email, business_name, vendor_category
- Terms agreement

**Missing:** Validation that at least one of these fields had content:
- `website`
- `instagram_handle`
- `tiktok_handle`
- `facebook_handle`

**Fix Applied:**
```typescript
// Validate at least one social/portfolio link is provided
const hasAtLeastOneLink =
  (formData.website && formData.website.trim()) ||
  (formData.instagram_handle && formData.instagram_handle.trim()) ||
  (formData.tiktok_handle && formData.tiktok_handle.trim()) ||
  (formData.facebook_handle && formData.facebook_handle.trim());

if (!hasAtLeastOneLink) {
  setError('Please provide at least one link to your work (website or social media)');
  return;
}
```

**Status:** ✅ Fixed in [VendorApplicationForm.tsx:252-262](../src/pages/VendorApplicationForm.tsx#L252-L262)

**Testing Required:**
1. Try submitting with no links → Should show error
2. Add only website → Should succeed
3. Add only Instagram → Should succeed
4. Add multiple links → Should succeed

---

## Part 3: Architecture Analysis 📊

### 3.1 Event/Application/Category System

**Key Finding:** Each event has a flexible multi-form architecture:

```
Event (e.g., "SF Art Walk 2026")
├── VendorApplication 1: "Artist Booth" ($50)
├── VendorApplication 2: "Food Vendor" ($100)
├── VendorApplication 3: "Premium Corner" ($200)
└── VendorApplication N: Custom categories...
```

**Critical Insight:**
- `VendorApplication.name` **IS** the category (e.g., "Artist Booth")
- `VendorApplication.categories[]` is **NOT USED** (unreliably populated, legacy field)
- Each event can have 1-N applications (typically 1-8)
- Each application has independent pricing, description, install dates, tags
- All applications share the same form fields (name, email, business, social links, note)

**Why This Matters for Error Monitoring:**
- Errors must be tracked per application, not just per event
- Different applications within the same event could have different failure patterns
- Email notifications are tied to specific applications
- We need granular tracking: `event_slug` + `application_id` + `application_name`

### 3.2 Form Submission Flow

```
User fills form → Validation → Submit with retry (3 attempts) → Backend API
                                    ↓
                    Network/500 errors trigger retry
                    422 validation errors → User feedback
                    409 duplicate → User feedback
                                    ↓
                    Success → Email sent → Confirmation page
                                    ↓
                    Email delivery tracking (backend)
```

**Current Error Handling:**
- ✅ Retry logic with exponential backoff (2s → 4s → 8s)
- ✅ Form persistence with auto-save every 30 seconds
- ✅ Bug report system after 3 consecutive failures
- ❌ No Sentry integration
- ❌ No email delivery failure detection
- ❌ No server-side alerts

### 3.3 Email Sending Points

**Registration Confirmation Email:**
- Triggered by: Successful vendor application submission
- Endpoint: Backend `/api/v1/presents/events/:event_slug/registrations` (POST)
- Provider: SendGrid
- **Risk:** Previously had issues where vendor emails didn't fire while artist category worked

**Other Email Types:**
- Payment confirmation (high priority)
- Event updates
- Cancellation notices
- Scheduled campaign emails
- Category change notifications

**Monitoring Gap:** No tracking of which emails actually get delivered vs sent vs bounced.

---

## Part 4: Error Monitoring System Designed 🎯

### 4.1 Architecture Overview

**Components Created:**
1. **Centralized Error Monitoring Utility** - `/src/utils/errorMonitoring.ts`
2. **Setup Guide** - `/docs/SENTRY_DISCORD_SETUP.md`
3. **Implementation Examples** - `/docs/ERROR_MONITORING_IMPLEMENTATION.md`

**Technology Stack:**
- **Sentry** for error tracking (free tier: 10k events/month)
- **Discord webhooks** for real-time alerts (free)
- **Optional:** Zapier for prettier Discord formatting (free tier: 100 tasks/month)

### 4.2 Error Tracking Capabilities

**Form Errors:**
```typescript
trackFormError(error, {
  formType: FormType.VENDOR_APPLICATION,
  eventSlug: 'sf-art-walk-2026',
  eventId: 42,
  eventTitle: 'SF Art Walk 2026',
  applicationId: 7,
  applicationName: 'Artist Booth',
  userEmail: 'vendor@example.com',
  httpStatus: 500,
  apiEndpoint: '/v1/presents/events/sf-art-walk-2026/registrations',
  attemptNumber: 3,
  totalAttempts: 3,
  validationErrors: [],
});
```

**Email Errors:**
```typescript
trackEmailError(error, {
  emailType: 'registration_confirmation',
  recipientEmail: 'vendor@example.com',
  eventSlug: 'sf-art-walk-2026',
  applicationId: 7,
  registrationId: 123,
  status: EmailDeliveryStatus.FAILED,
  provider: 'sendgrid',
  failureReason: 'Bounce: Invalid email address',
});
```

### 4.3 Severity Levels

| Severity | Examples | Alert Timing |
|----------|----------|--------------|
| **CRITICAL** | Payment forms, email failures for payment confirmations | Immediate to Discord |
| **HIGH** | Application form failures, registration confirmation failures | Immediate to Discord |
| **MEDIUM** | Contact form issues, event update emails | Batched (hourly) |
| **LOW** | Validation errors, analytics failures | Batched (daily) |
| **INFO** | Successful submissions (for success rate tracking) | Log only |

### 4.4 Discord Alert Format (with optional Zapier)

```
🚨 Form Submission Error

Form Type: Vendor Application
Event: SF Art Walk 2026
Application: Artist Booth
Status: 500 Server Error
User: ve***@example.com
Attempts: 3/3
Environment: Production

Error: Failed to submit registration
Endpoint: /v1/presents/events/sf-art-walk-2026/registrations

[View in Sentry] [View Event Dashboard]
```

---

## Part 5: Implementation Roadmap 🗓️

### Phase 1: Install & Configure (Week 1)

**Frontend:**
- [ ] Install Sentry: `npm install @sentry/react`
- [ ] Add environment variables to Render:
  - `VITE_SENTRY_DSN=<your-dsn>`
  - `VITE_ENVIRONMENT=<env>`
- [ ] Uncomment Sentry code in `errorMonitoring.ts`
- [ ] Initialize in `main.tsx`
- [ ] Test in development

**Discord:**
- [ ] Create `#voxxy-alerts` channel
- [ ] Set up webhook
- [ ] Configure Sentry integration
- [ ] Test with manual error

**Estimated Time:** 2-3 hours

### Phase 2: Frontend Integration (Week 2)

- [ ] Add error tracking to VendorApplicationForm
- [ ] Add error tracking to ContactPage
- [ ] Add error tracking to LoginForm
- [ ] Add error tracking to EventCreation
- [ ] Deploy to staging
- [ ] Monitor for 3-5 days

**Estimated Time:** 4-6 hours

### Phase 3: Backend Integration (Week 3)

- [ ] Install Sentry gem in Rails: `gem 'sentry-ruby'`, `gem 'sentry-rails'`
- [ ] Configure `config/initializers/sentry.rb`
- [ ] Add email delivery tracking in `EmailService`
- [ ] Add registration controller error tracking
- [ ] Test email failure scenarios
- [ ] Deploy to staging

**Estimated Time:** 4-6 hours

### Phase 4: Production Rollout (Week 4)

- [ ] Deploy frontend to production
- [ ] Deploy backend to production
- [ ] Monitor first 24 hours closely
- [ ] Adjust alert thresholds based on volume
- [ ] Document incidents in `#engineering`

**Estimated Time:** 2 hours + monitoring

### Phase 5: Optimization (Ongoing)

- [ ] Review error trends weekly
- [ ] Add tests for common error scenarios
- [ ] Tune alert sensitivity
- [ ] Create monitoring dashboard (Sentry + Mixpanel)

---

## Part 6: Testing Checklist ✓

### Local Testing (Before Staging)

- [ ] Test social media validation fix
  - [ ] Submit with no links → Error shown
  - [ ] Submit with website only → Success
  - [ ] Submit with Instagram only → Success
- [ ] Test Sentry integration
  - [ ] Trigger form error → Check Sentry dashboard
  - [ ] Trigger validation error → Check severity
  - [ ] Check error context includes all fields

### Staging Testing (Before Production)

- [ ] Submit vendor application successfully → Check email delivery
- [ ] Submit with invalid data → Check Sentry alert in Discord
- [ ] Submit with network error (mock) → Check retry behavior
- [ ] Submit same application twice → Check duplicate detection
- [ ] Check email deliveries API for failed emails

### Production Testing (Post-Deploy)

- [ ] Monitor Discord for first 4 hours
- [ ] Check Sentry dashboard for unexpected errors
- [ ] Verify form submissions work end-to-end
- [ ] Verify emails are delivered
- [ ] Check success rate in Sentry (should be >95%)

---

## Part 7: Backend Repository Analysis Recommendations

**Local Repository:** `~/Development/voxxy-react-rails` (cannot push to GitHub)

**Recommended Analysis Tasks:**

1. **Email Service Architecture**
   - Find email sending logic
   - Identify SendGrid integration points
   - Check email delivery tracking tables
   - Review scheduled email job workers (Sidekiq)

2. **Registration API Endpoints**
   - Review `RegistrationsController`
   - Check validation logic
   - Verify error responses match frontend expectations
   - Test duplicate detection logic

3. **Database Schema**
   - Confirm `vendor_applications` table structure
   - Verify `registrations` table has all needed fields
   - Check email delivery tracking tables
   - Review indexes for performance

4. **Error Handling**
   - Check existing error logging
   - Review Sidekiq retry configuration
   - Verify SendGrid webhook handlers
   - Test email bounce handling

5. **Security Audit**
   - Verify no hardcoded credentials
   - Check environment variable usage
   - Review CORS configuration
   - Audit public API endpoints

**Next Steps:**
1. Courtney can provide readonly access or specific file exports
2. Document findings in `docs/BACKEND_ANALYSIS.md`
3. Create action items for backend improvements
4. Coordinate Sentry backend integration

---

## Part 8: Cost & Resource Estimates

### Services

| Service | Tier | Cost | Usage Limit |
|---------|------|------|-------------|
| Sentry | Free | $0/mo | 10k events/month |
| Discord | Free | $0/mo | Unlimited |
| Zapier (optional) | Free | $0/mo | 100 tasks/month |

**Total Cost:** $0/month for MVP

**Upgrade Path (if needed):**
- Sentry Team: $26/month (50k events)
- Sentry Business: $80/month (100k events)

*Note: If hitting 10k errors/month, that indicates a bigger problem that needs fixing first.*

### Time Investment

| Phase | Frontend | Backend | Total |
|-------|----------|---------|-------|
| Setup & Config | 3h | 2h | 5h |
| Implementation | 6h | 6h | 12h |
| Testing | 2h | 2h | 4h |
| Monitoring (first week) | 2h | 2h | 4h |
| **Total** | **13h** | **12h** | **25h** |

Spread across 3-4 weeks = ~6 hours/week

---

## Part 9: Success Metrics

### Week 1 (After Frontend Deploy)
- ✅ 0 unhandled errors reaching users
- ✅ All form errors tracked in Sentry
- ✅ Discord alerts firing correctly
- ✅ <2 minutes from error to Discord alert

### Week 4 (After Backend Deploy)
- ✅ Email delivery tracking operational
- ✅ 0 missed registration confirmation emails
- ✅ >95% email delivery success rate
- ✅ <15 minutes from email failure to alert

### Month 3 (Steady State)
- ✅ Form submission success rate >98%
- ✅ Average error resolution time <24 hours
- ✅ 0 critical errors unresolved >1 hour
- ✅ Team confident in error visibility

---

## Part 10: Documentation Updates

### Created Files

1. **`/src/utils/errorMonitoring.ts`** - Centralized error tracking utility
2. **`/docs/SENTRY_DISCORD_SETUP.md`** - Complete setup guide
3. **`/docs/ERROR_MONITORING_IMPLEMENTATION.md`** - Implementation examples
4. **`/docs/CLEANUP_AND_MONITORING_SUMMARY.md`** - This document

### Existing Files Updated

1. **`/.gitignore`** - Added sensitive file protections
2. **`/src/pages/VendorApplicationForm.tsx`** - Fixed social media validation

### Documentation To Add (Later)

1. **`/docs/BACKEND_ANALYSIS.md`** - Backend architecture findings
2. **`/docs/INCIDENT_RESPONSE.md`** - Incident response playbook
3. **`/docs/ERROR_TRENDS.md`** - Monthly error analysis reports
4. **`.claude/VOXXY_CONTEXT.md`** - AI assistant context (from your best practices doc)

---

## Part 11: Questions & Decisions Needed

### Immediate Questions

1. **Git History Cleanup:**
   - Should we clean CSV files from git history now or later?
   - Who will handle the force push coordination?

2. **Backend Access:**
   - Can we analyze `~/Development/voxxy-react-rails` directly?
   - Should we document needed backend changes for Beau to implement?

3. **Sentry Account:**
   - Should we create under Courtney's account or shared Voxxy account?
   - Who will have admin access?

4. **Discord Setup:**
   - Which Discord server? (Voxxy internal or engineering-only?)
   - Should alerts go to a private channel or team channel?

5. **Alert Preferences:**
   - Should all errors go to Discord, or only critical/high?
   - Preferred alert quiet hours? (e.g., no alerts midnight-6am)

### Strategic Decisions

1. **Testing Strategy:**
   - Should we test in staging first, or go straight to production?
   - How long to monitor staging before production deploy?

2. **Rollout Timeline:**
   - Should we implement frontend first, then backend?
   - Or wait and deploy both together?

3. **Email Monitoring Priority:**
   - Which email type is highest priority to track?
   - Should we focus on registration confirmations first?

---

## Part 12: Immediate Next Steps

### For Courtney/Beau (Today)

1. ✅ Review this summary document
2. ✅ Decide on immediate questions above
3. ✅ Test social media validation fix locally:
   ```bash
   npm run dev
   # Navigate to any vendor application form
   # Try submitting without social links
   ```
4. ✅ Create Discord webhook in your server
5. ✅ Create Sentry account and get DSN

### For Implementation (This Week)

1. ✅ Install Sentry: `npm install @sentry/react`
2. ✅ Add environment variables to Render
3. ✅ Uncomment Sentry code in `errorMonitoring.ts`
4. ✅ Test in local development
5. ✅ Deploy to staging
6. ✅ Monitor for 2-3 days
7. ✅ Deploy to production

### For Backend Analysis (Next Week)

1. Review `~/Development/voxxy-react-rails` repository
2. Document email sending architecture
3. Identify integration points for Sentry
4. Plan backend error monitoring implementation

---

## Conclusion

This cleanup and monitoring system will provide:

✅ **Security:** Sensitive customer data removed from repo
✅ **Reliability:** All form errors tracked and alerted
✅ **Visibility:** Real-time Discord alerts for failures
✅ **Debugging:** Rich error context for fast resolution
✅ **Confidence:** Know immediately when forms break

The system is designed to scale with Voxxy's growth and catch issues before users report them. With Discord alerts, the team will know about problems within minutes, not hours or days.

**Total Investment:** ~25 hours over 3-4 weeks, $0/month cost.

**ROI:** Prevent customer loss from failed applications, reduce support burden, faster incident response.

---

## Contact & Support

- **Documentation:** `/docs/` directory in this repo
- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/react/
- **Discord Webhooks:** https://discord.com/developers/docs/resources/webhook
- **Internal:** `#engineering` Discord channel for questions

