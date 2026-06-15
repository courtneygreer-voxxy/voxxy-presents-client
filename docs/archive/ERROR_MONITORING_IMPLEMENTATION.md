# Error Monitoring Implementation Guide

This document shows how to integrate the error monitoring system into Voxxy forms.

## Quick Reference

```typescript
import {
  trackFormError,
  trackFormSuccess,
  trackEmailError,
  trackEmailSuccess,
  FormType,
  ErrorSeverity,
  EmailDeliveryStatus,
  getFormErrorSeverity,
  getEmailErrorSeverity,
} from '@/utils/errorMonitoring'
```

---

## Implementation Examples

### 1. Vendor Application Form

**File: `/src/pages/VendorApplicationForm.tsx`**

#### Before: Basic Error Handling

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    setSubmitting(true)
    const response = await registrationsApi.submitVendorApplication(event.slug, formData)
    navigate(`/events/${event.slug}/confirmation/${response.ticket_code}`)
  } catch (err: any) {
    setError(err.message || 'Failed to submit application')
  } finally {
    setSubmitting(false)
  }
}
```

#### After: With Error Monitoring

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!application || !event) {
    setError('No vendor application found for this event')
    return
  }

  // Validation
  if (!formData.name || !formData.email || !formData.business_name || !formData.vendor_category) {
    const validationError = 'Please fill in all required fields'
    setError(validationError)

    // Track validation errors for monitoring
    trackFormError(
      validationError,
      {
        formType: FormType.VENDOR_APPLICATION,
        eventSlug: event.slug,
        eventId: event.id,
        eventTitle: event.title,
        applicationId: application.id,
        applicationName: application.name,
        validationErrors: ['Missing required fields'],
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      },
      ErrorSeverity.LOW,
    ) // Low severity - user error, not system error

    return
  }

  // Validate at least one social/portfolio link
  const hasAtLeastOneLink =
    (formData.website && formData.website.trim()) ||
    (formData.instagram_handle && formData.instagram_handle.trim()) ||
    (formData.tiktok_handle && formData.tiktok_handle.trim()) ||
    (formData.facebook_handle && formData.facebook_handle.trim())

  if (!hasAtLeastOneLink) {
    const validationError =
      'Please provide at least one link to your work (website or social media)'
    setError(validationError)

    trackFormError(
      validationError,
      {
        formType: FormType.VENDOR_APPLICATION,
        eventSlug: event.slug,
        eventId: event.id,
        eventTitle: event.title,
        applicationId: application.id,
        applicationName: application.name,
        validationErrors: ['Missing social/portfolio link'],
        url: window.location.href,
      },
      ErrorSeverity.LOW,
    )

    return
  }

  if (!formData.agreed_to_terms) {
    const validationError =
      'You must agree to the Privacy Policy and Terms of Service to submit your application'
    setError(validationError)

    trackFormError(
      validationError,
      {
        formType: FormType.VENDOR_APPLICATION,
        eventSlug: event.slug,
        eventId: event.id,
        applicationId: application.id,
        validationErrors: ['Terms not agreed'],
        url: window.location.href,
      },
      ErrorSeverity.LOW,
    )

    return
  }

  try {
    setSubmitting(true)
    setError(null)
    setRetryAttempt(0)

    // Build payload
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      business_name: formData.business_name,
      vendor_category: formData.vendor_category,
      vendor_application_id: application.id,
      subscribed: formData.subscribed,
      instagram_handle: buildInstagramUrl(formData.instagram_handle),
      tiktok_handle: buildTikTokUrl(formData.tiktok_handle),
      website: buildWebsiteUrl(formData.website),
      note_to_host: formData.note_to_host || undefined,
    }

    // Submit with retry logic
    const response = await retryOperation(
      () => registrationsApi.submitVendorApplication(event.slug, payload),
      {
        maxAttempts: 3,
        baseDelay: 2000,
        maxDelay: 10000,
        onRetry: (attempt) => {
          console.log(`Retry attempt ${attempt}`)
          setRetryAttempt(attempt)

          // Track retry attempts
          trackFormError(
            'Form submission retry',
            {
              formType: FormType.VENDOR_APPLICATION,
              eventSlug: event.slug,
              eventId: event.id,
              eventTitle: event.title,
              applicationId: application.id,
              applicationName: application.name,
              attemptNumber: attempt,
              totalAttempts: 3,
              userEmail: formData.email,
              apiEndpoint: `/v1/presents/events/${event.slug}/registrations`,
            },
            ErrorSeverity.MEDIUM,
          )
        },
        shouldRetry: (error: any) => {
          const status = error.status || 0
          // Only retry on network errors or 5xx server errors
          return status === 0 || status >= 500
        },
      },
    )

    // Success! Track it
    trackFormSuccess({
      formType: FormType.VENDOR_APPLICATION,
      eventSlug: event.slug,
      eventId: event.id,
      eventTitle: event.title,
      applicationId: application.id,
      applicationName: application.name,
      userEmail: formData.email,
      attemptNumber: retryAttempt + 1,
      totalAttempts: 3,
      apiEndpoint: `/v1/presents/events/${event.slug}/registrations`,
      formData: {
        business_name: formData.business_name,
        vendor_category: formData.vendor_category,
        has_website: !!formData.website,
        has_instagram: !!formData.instagram_handle,
        has_tiktok: !!formData.tiktok_handle,
        subscribed: formData.subscribed,
      },
    })

    // Clear saved form data
    if (slug && applicationId) {
      const formId = `vendor-app-${slug}-${applicationId}`
      clearFormData(formId)
    }

    // Navigate to confirmation
    navigate(`/events/${event.slug}/confirmation/${response.ticket_code}`)
  } catch (err: any) {
    const status = err.status || 0
    const errorMessage = err.message || 'An unexpected error occurred'

    // Determine error severity
    const severity = getFormErrorSeverity(FormType.VENDOR_APPLICATION, status)

    // Track the error with full context
    trackFormError(
      err,
      {
        formType: FormType.VENDOR_APPLICATION,
        eventSlug: event.slug,
        eventId: event.id,
        eventTitle: event.title,
        applicationId: application.id,
        applicationName: application.name,
        userEmail: formData.email,
        httpStatus: status,
        apiEndpoint: `/v1/presents/events/${event.slug}/registrations`,
        errorMessage,
        errorCode: err.code,
        attemptNumber: retryAttempt + 1,
        totalAttempts: 3,
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        formData: {
          business_name: formData.business_name,
          vendor_category: formData.vendor_category,
          has_website: !!formData.website,
          has_instagram: !!formData.instagram_handle,
        },
      },
      severity,
    )

    // User-friendly error messages
    if (status === 422) {
      setError('Please check your form entries. Some information may be invalid.')
    } else if (status === 409) {
      setError(
        'You may have already applied for this event. Please check your email for confirmation.',
      )
    } else if (status === 0) {
      setError(
        'Unable to connect to the server. Please check your internet connection and try again.',
      )
    } else if (status >= 500) {
      setError('Our servers are experiencing issues. Please try again in a few moments.')
    } else {
      setError(errorMessage)
    }

    // Auto-show bug report after 3 failures
    failedAttemptsRef.current++
    if (failedAttemptsRef.current >= 3) {
      setErrorContext({
        error: errorMessage,
        status,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        formData: {
          ...formData,
          agreed_to_terms: undefined, // Don't include in bug report
        },
      })
      setShowBugReport(true)
      failedAttemptsRef.current = 0
    }
  } finally {
    setSubmitting(false)
  }
}
```

---

### 2. Contact Form

**File: `/src/pages/ContactPage.tsx`**

```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  if (isSubmitting || isSubmitted) return

  // Validation
  if (!name.trim() || !email.trim() || !message.trim()) {
    const validationError = 'Please fill out all fields'
    setError(validationError)

    trackFormError(
      validationError,
      {
        formType: FormType.CONTACT_FORM,
        validationErrors: ['Missing required fields'],
        url: window.location.href,
      },
      ErrorSeverity.LOW,
    )

    return
  }

  try {
    setIsSubmitting(true)
    setError(null)

    const payload = {
      type: 'beta_request',
      name: name.trim(),
      email: email.trim(),
      description: message.trim(),
      source: 'contact_page',
    }

    const response = await fetch(`${API_BASE_URL}/contact_submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    // Success!
    trackFormSuccess({
      formType: FormType.CONTACT_FORM,
      userEmail: email,
      apiEndpoint: '/contact_submissions',
      formData: {
        type: 'beta_request',
        source: 'contact_page',
        message_length: message.length,
      },
    })

    // Track conversion
    trackConversion('Contact Form Submitted')

    setIsSubmitted(true)
  } catch (err: any) {
    const status = err.status || 0
    const errorMessage = err.message || 'Failed to submit contact form'
    const severity = getFormErrorSeverity(FormType.CONTACT_FORM, status)

    trackFormError(
      err,
      {
        formType: FormType.CONTACT_FORM,
        userEmail: email,
        httpStatus: status,
        apiEndpoint: '/contact_submissions',
        errorMessage,
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      severity,
    )

    setError('Failed to submit. Please try again or email us directly at team@voxxypresents.com')
  } finally {
    setIsSubmitting(false)
  }
}
```

---

### 3. Email Delivery Monitoring (Backend)

**File: Backend `app/services/email_service.rb` (conceptual - for Courtney/Beau to implement)**

```ruby
class EmailService
  def send_registration_confirmation(registration)
    begin
      response = SendgridClient.send_email(
        to: registration.email,
        template_id: 'registration_confirmation',
        data: {
          business_name: registration.business_name,
          event_title: registration.event.title,
          # ... other data
        }
      )

      if response.status_code >= 400
        # Track email failure in Sentry
        Sentry.capture_message("Email delivery failed", {
          level: :error,
          tags: {
            email_type: 'registration_confirmation',
            email_status: 'failed',
            event_slug: registration.event.slug,
            provider: 'sendgrid',
          },
          extra: {
            registration_id: registration.id,
            recipient_email: mask_email(registration.email),
            event_title: registration.event.title,
            application_name: registration.vendor_application.name,
            sendgrid_response: response.body,
            http_status: response.status_code,
          },
          fingerprint: [
            'email_failure',
            'registration_confirmation',
            registration.event.slug,
          ]
        })

        # Log for debugging
        Rails.logger.error("Email failed: #{response.body}")
      else
        # Track success (optional, for analytics)
        Rails.logger.info("Email sent successfully to #{registration.email}")
      end

    rescue => e
      # Critical failure - email service unavailable
      Sentry.capture_exception(e, {
        level: :fatal,
        tags: {
          email_type: 'registration_confirmation',
          event_slug: registration.event.slug,
        },
        extra: {
          registration_id: registration.id,
          recipient_email: mask_email(registration.email),
        }
      })

      raise # Re-raise so caller can handle
    end
  end

  private

  def mask_email(email)
    return 'invalid' unless email.include?('@')
    local, domain = email.split('@')
    "#{local[0..1]}***@#{domain}"
  end
end
```

---

### 4. Email Delivery Tracking (Frontend API Call)

**File: `/src/services/api.ts` or where you poll email delivery status**

```typescript
import { trackEmailError, trackEmailSuccess, EmailDeliveryStatus } from '@/utils/errorMonitoring'

/**
 * Check email delivery status for a registration
 */
export async function checkEmailDeliveryStatus(registrationId: number) {
  try {
    const response = await emailDeliveriesApi.getByRegistration(registrationId)

    const delivery = response.data

    if (delivery.status === 'failed' || delivery.status === 'bounced') {
      // Track email failure
      trackEmailError('Email delivery failed', {
        emailId: delivery.id,
        recipientEmail: delivery.recipient_email,
        eventSlug: delivery.event?.slug,
        eventId: delivery.event?.id,
        eventTitle: delivery.event?.title,
        registrationId: delivery.registration_id,
        emailType: 'registration_confirmation',
        status: delivery.status as EmailDeliveryStatus,
        provider: 'sendgrid',
        providerId: delivery.sendgrid_message_id,
        bounceReason: delivery.bounce_reason,
        failureReason: delivery.error_message,
        sentAt: delivery.sent_at,
        failedAt: delivery.failed_at || new Date().toISOString(),
      })
    } else if (delivery.status === 'delivered') {
      // Track success (optional)
      trackEmailSuccess({
        emailId: delivery.id,
        recipientEmail: delivery.recipient_email,
        eventSlug: delivery.event?.slug,
        emailType: 'registration_confirmation',
        status: EmailDeliveryStatus.DELIVERED,
        provider: 'sendgrid',
        sentAt: delivery.sent_at,
        deliveredAt: delivery.delivered_at,
      })
    }

    return delivery
  } catch (error: any) {
    console.error('Failed to check email delivery status:', error)
    throw error
  }
}
```

---

### 5. User Context Tracking

**File: `/src/App.tsx` or authentication logic**

```typescript
import { setUserContext, clearUserContext } from '@/utils/errorMonitoring'

// After successful login
function handleLoginSuccess(user: User) {
  setUserContext(user.id, user.email, user.organization?.id)

  // Continue with app logic...
}

// On logout
function handleLogout() {
  clearUserContext()

  // Continue with logout logic...
}
```

---

## Testing Error Monitoring

### Local Testing (Development)

```typescript
// In any component, add a test button:
<button onClick={() => {
  trackFormError('Test error from development', {
    formType: FormType.VENDOR_APPLICATION,
    eventSlug: 'test-event',
    eventId: 1,
    eventTitle: 'Test Event',
    applicationId: 1,
    applicationName: 'Test Application',
    httpStatus: 500,
    errorMessage: 'This is a test error',
  });
}}>
  Test Sentry
</button>
```

### Staging Testing

1. Submit a form with invalid data (validation error - should be LOW severity)
2. Submit a form with missing social links (should be caught by validation)
3. Temporarily break API endpoint (500 error - should be HIGH severity)
4. Check Discord for alerts within 1-2 minutes

### Production Monitoring

After deployment:

1. Monitor Discord `#voxxy-alerts` channel
2. Check Sentry dashboard daily for first week
3. Review error trends weekly
4. Adjust alert thresholds based on volume

---

## Alert Thresholds

| Error Type                   | Severity | Alert Timing   | Expected Volume           |
| ---------------------------- | -------- | -------------- | ------------------------- |
| Validation errors            | LOW      | Batch (1/hour) | 10-50/day (normal)        |
| Form submission failures     | HIGH     | Immediate      | 0-5/day (expect low)      |
| Email delivery failures      | HIGH     | Immediate      | 0-10/day (expect low)     |
| Payment confirmations failed | CRITICAL | Immediate      | 0/day (must be 0)         |
| Server errors (5xx)          | CRITICAL | Immediate      | 0-2/day (expect very low) |

---

## Incident Response Workflow

When Discord alert fires:

1. **Acknowledge** (within 15 minutes)
   - React to Discord message with 👀 emoji
   - Assign in Sentry to yourself

2. **Assess** (within 30 minutes)
   - Check error frequency (one-off or pattern?)
   - Check user impact (how many affected?)
   - Check environment (prod/staging/dev?)

3. **Triage** (within 1 hour)
   - **Critical** (P0): Fix immediately, consider hotfix
   - **High** (P1): Fix within 24 hours
   - **Medium** (P2): Fix within 1 week
   - **Low** (P3): Backlog, fix in next sprint

4. **Fix & Deploy**
   - Create branch: `bugfix/sentry-{issue-id}`
   - Fix, test, PR, merge
   - Deploy following normal process (or hotfix if P0)

5. **Verify & Close**
   - Verify fix in production
   - Mark as resolved in Sentry
   - Document in `#engineering` channel

6. **Prevent**
   - Add test case for the bug
   - Update validation if needed
   - Consider process improvements

---

## Next Steps

1. ✅ Install Sentry: `npm install @sentry/react`
2. ✅ Set up Discord webhook
3. ✅ Configure environment variables in Render
4. ✅ Uncomment Sentry code in `errorMonitoring.ts`
5. ✅ Add error tracking to VendorApplicationForm
6. ✅ Add error tracking to ContactPage
7. ✅ Test in development
8. ✅ Deploy to staging and monitor
9. ✅ Deploy to production
10. ✅ Add backend email monitoring (Ruby)
