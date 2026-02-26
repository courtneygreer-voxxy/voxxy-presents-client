# Backend Sentry Integration Plan

**Repository:** `voxxy-rails-react` (Rails 7.2.2 API)
**Status:** Sentry already installed, needs email-specific instrumentation
**Priority:** High - Critical for catching email delivery failures

---

## Executive Summary

The Rails backend already has Sentry configured (`config/initializers/sentry.rb`) but **email services are not instrumented**. This means email send failures, SendGrid API errors, and webhook processing issues are logged to Rails.logger but NOT captured in Sentry for alerting.

**Key Finding:** The sophisticated 3-tier email automation system (EmailCampaignTemplate → EmailTemplateItem → ScheduledEmail → EmailDelivery) needs Sentry integration at every layer.

---

## Current Sentry Setup

### Already Configured ✅

**File:** `/config/initializers/sentry.rb`

```ruby
Sentry.init do |config|
  config.dsn = ENV["SENTRY_DSN"]
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]
  config.send_default_pii = true
  config.traces_sample_rate = Rails.env.production? ? 0.1 : 1.0
end
```

**Existing Monitoring:**
- Background job failures (`config/initializers/monitoring.rb:64-79`)
- 404 errors
- Slow requests (>3 seconds)
- Health check exceptions

### Not Configured ❌

- Email send failures
- SendGrid API errors
- Webhook processing failures
- Zero-recipient warnings
- Bounce/delivery tracking errors

---

## Integration Plan

### Phase 1: Email Service Instrumentation (Priority 1)

#### 1.1 EmailSenderService

**File:** `/app/services/email_sender_service.rb`

**Current Code (Lines 48-62):**
```ruby
begin
  send_to_registration(registration)
  sent_count += 1
rescue => e
  last_error = e.message
  Rails.logger.error("❌ EMAIL SEND FAILED")
  Rails.logger.error("   Scheduled Email ID: #{scheduled_email.id}")
  Rails.logger.error("   Event: #{event.title} (ID: #{event.id})")
  Rails.logger.error("   Recipient: #{registration.email}")
  Rails.logger.error("   Error: #{e.class}: #{e.message}")
  failed_count += 1
end
```

**Add After Line 50:**
```ruby
begin
  send_to_registration(registration)
  sent_count += 1
rescue => e
  last_error = e.message

  # Keep existing detailed logging
  Rails.logger.error("❌ EMAIL SEND FAILED")
  Rails.logger.error("   Scheduled Email ID: #{scheduled_email.id}")
  Rails.logger.error("   Event: #{event.title} (ID: #{event.id})")
  Rails.logger.error("   Recipient: #{registration.email}")
  Rails.logger.error("   Error: #{e.class}: #{e.message}")

  # NEW: Capture in Sentry with rich context
  Sentry.capture_exception(e,
    level: :error,
    tags: {
      email_type: 'scheduled_email',
      category: scheduled_email.email_template_item&.category || 'unknown',
      event_slug: event.slug,
      sendgrid_error: true
    },
    extra: {
      scheduled_email_id: scheduled_email.id,
      email_template_item_id: scheduled_email.email_template_item_id,
      event_id: event.id,
      event_title: event.title,
      registration_id: registration.id,
      recipient_email: mask_email(registration.email),
      vendor_category: registration.vendor_category,
      application_id: registration.vendor_application_id,
      filter_criteria: scheduled_email.filter_criteria,
      scheduled_for: scheduled_email.scheduled_for
    },
    fingerprint: [
      'email-send-failure',
      event.slug,
      scheduled_email.email_template_item&.category || 'unknown'
    ]
  )

  failed_count += 1
end
```

**Add Helper Method (End of Class):**
```ruby
private

def mask_email(email)
  return 'invalid' unless email&.include?('@')
  local, domain = email.split('@')
  "#{local[0..1]}***@#{domain}"
end
```

#### 1.2 InvitationReminderService

**File:** `/app/services/invitation_reminder_service.rb`

**Similar pattern at Lines 46-61:**
```ruby
rescue => e
  Rails.logger.error("❌ INVITATION EMAIL SEND FAILED")
  # ... existing logging ...

  # ADD Sentry capture
  Sentry.capture_exception(e,
    level: :error,
    tags: {
      email_type: 'invitation',
      category: 'event_announcements',
      event_slug: event.slug
    },
    extra: {
      scheduled_email_id: scheduled_email.id,
      event_id: event.id,
      event_invitation_id: invitation.id,
      recipient_email: mask_email(invitation.email),
      invitation_status: invitation.status
    },
    fingerprint: ['invitation-send-failure', event.slug]
  )

  failed_count += 1
end
```

#### 1.3 RegistrationEmailService

**File:** `/app/services/registration_email_service.rb`

**Multiple rescue blocks at:**
- Lines 11-14 (send_confirmation)
- Lines 93-97 (send_approval)
- Lines 117-118 (send_rejection)

**Pattern for all:**
```ruby
rescue StandardError => e
  Rails.logger.error "Failed to send registration #{email_type} email: #{e.message}"

  # ADD Sentry
  Sentry.capture_exception(e,
    level: :error,
    tags: {
      email_type: 'notification',
      notification_type: email_type, # 'confirmation', 'approval', 'rejection', etc.
      event_slug: registration.event.slug,
      category: registration.vendor_category
    },
    extra: {
      registration_id: registration.id,
      event_id: registration.event_id,
      application_id: registration.vendor_application_id,
      recipient_email: mask_email(registration.email),
      registration_status: registration.status
    },
    fingerprint: ['notification-failure', email_type, registration.event.slug]
  )

  raise  # Keep existing behavior
end
```

### Phase 2: Worker Instrumentation (Priority 1)

#### 2.1 EmailSenderWorker

**File:** `/app/workers/email_sender_worker.rb`

**Current Code (Lines 34-48):**
```ruby
begin
  send_scheduled_email(scheduled_email)
  sent_count += 1
rescue => e
  Rails.logger.error("Failed to send scheduled email ##{scheduled_email.id}: #{e.message}")
  scheduled_email.update(
    status: "failed",
    error_message: "#{e.class}: #{e.message}"
  )
  failed_count += 1
end
```

**Enhanced with Sentry:**
```ruby
begin
  send_scheduled_email(scheduled_email)
  sent_count += 1
rescue => e
  Rails.logger.error("Failed to send scheduled email ##{scheduled_email.id}: #{e.message}")

  # Capture in Sentry before marking as failed
  Sentry.capture_exception(e,
    level: :error,
    tags: {
      worker: 'EmailSenderWorker',
      email_type: 'scheduled',
      category: scheduled_email.email_template_item&.category,
      event_slug: scheduled_email.event.slug
    },
    extra: {
      scheduled_email_id: scheduled_email.id,
      event_id: scheduled_email.event_id,
      scheduled_for: scheduled_email.scheduled_for,
      filter_criteria: scheduled_email.filter_criteria,
      recipient_count: scheduled_email.event.registrations.count
    },
    fingerprint: ['worker-failure', 'email-sender', scheduled_email.event.slug]
  )

  scheduled_email.update(
    status: "failed",
    error_message: "#{e.class}: #{e.message}"
  )
  failed_count += 1
end
```

**Add Zero-Recipient Warning (After Line 65):**
```ruby
# Add at line 66, after routing validation
def send_scheduled_email(scheduled_email)
  category = scheduled_email.email_template_item&.category

  # Validate category exists
  unless category.present?
    Rails.logger.error("Cannot send scheduled email ##{scheduled_email.id}: Missing category")
    scheduled_email.update(status: "failed", error_message: "Missing email category")
    return
  end

  # Route to appropriate service
  service = if category == "event_announcements"
    InvitationReminderService.new(scheduled_email)
  else
    EmailSenderService.new(scheduled_email)
  end

  result = service.send_emails

  # NEW: Alert on zero recipients
  if result[:sent_count] == 0 && result[:failed_count] == 0
    Sentry.capture_message("Zero recipients for scheduled email",
      level: :warning,
      tags: {
        email_type: 'scheduled',
        category: category,
        event_slug: scheduled_email.event.slug
      },
      extra: {
        scheduled_email_id: scheduled_email.id,
        event_id: scheduled_email.event_id,
        filter_criteria: scheduled_email.filter_criteria,
        total_registrations: scheduled_email.event.registrations.count
      },
      fingerprint: ['zero-recipients', scheduled_email.event.slug, category]
    )
  end

  result
end
```

#### 2.2 EmailDeliveryProcessorJob

**File:** `/app/workers/email_delivery_processor_job.rb`

**Webhook Processing Failures (Lines 41-74):**
```ruby
def perform(event_data)
  event_type = event_data['event']

  # ... existing code ...

  case event_type
  when 'delivered'
    handle_delivered(delivery, event_data)
  when 'bounce'
    handle_bounce(delivery, event_data)
  when 'dropped'
    handle_dropped(delivery, event_data)
  when 'deferred'
    handle_deferred(delivery, event_data)
  when 'unsubscribe', 'spamreport'
    handle_unsubscribe(delivery, event_data)
  else
    # ADD Sentry for unknown events
    Sentry.capture_message("Unknown SendGrid webhook event: #{event_type}",
      level: :warning,
      tags: {
        webhook_event: event_type,
        has_message_id: event_data['sg_message_id'].present?
      },
      extra: {
        event_data: event_data.except('email', 'timestamp') # Exclude PII
      },
      fingerprint: ['unknown-webhook-event', event_type]
    )

    Rails.logger.warn("Unknown SendGrid event type: #{event_type}")
  end

rescue => e
  # Enhanced error capture
  Sentry.capture_exception(e,
    level: :error,
    tags: {
      worker: 'EmailDeliveryProcessorJob',
      webhook_event: event_data['event'],
      has_message_id: event_data['sg_message_id'].present?
    },
    extra: {
      event_data: event_data.except('email'), # Exclude PII
      delivery_id: delivery&.id,
      event_id: delivery&.event_id
    },
    fingerprint: ['webhook-processing-failure', event_data['event']]
  )

  Rails.logger.error "SendGrid webhook processing error: #{e.message}\n#{e.backtrace.join("\n")}"
  # Don't re-raise - webhook processors should never fail
end
```

**Delivery Record Creation Fallback (Lines 217-221):**
```ruby
# If we couldn't find existing delivery, create from webhook data
delivery ||= create_delivery_from_webhook(event_data)

unless delivery
  # ADD Sentry warning
  Sentry.capture_message("Could not create delivery record from webhook",
    level: :warning,
    tags: {
      webhook_event: event_data['event'],
      has_custom_args: event_data['custom_args'].present?
    },
    extra: {
      sg_message_id: event_data['sg_message_id'],
      recipient: mask_email(event_data['email']),
      custom_args: event_data['custom_args']
    },
    fingerprint: ['delivery-creation-failure']
  )

  Rails.logger.warn("Could not find or create EmailDelivery for message_id: #{event_data['sg_message_id']}")
  return
end
```

### Phase 3: Controller Instrumentation (Priority 2)

#### 3.1 SendGrid Webhooks Controller

**File:** `/app/controllers/api/v1/sendgrid_webhooks_controller.rb`

**Current Catch-All (Lines 15-18):**
```ruby
rescue => e
  Rails.logger.error "SendGrid webhook error: #{e.message}\n#{e.backtrace.join("\n")}"
  head :ok # Always return 200 to prevent SendGrid from retrying
end
```

**Enhanced:**
```ruby
rescue => e
  Sentry.capture_exception(e,
    level: :error,
    tags: {
      controller: 'SendGridWebhooksController',
      webhook_batch_size: params[:_json]&.size || 1
    },
    extra: {
      params: params.except(:controller, :action).to_unsafe_h,
      request_id: request.request_id
    },
    fingerprint: ['sendgrid-webhook-controller-failure']
  )

  Rails.logger.error "SendGrid webhook error: #{e.message}\n#{e.backtrace.join("\n")}"
  head :ok # Always return 200
end
```

#### 3.2 Registrations Controller

**File:** `/app/controllers/api/v1/presents/registrations_controller.rb`

**Add Sentry Context to Registration Creation (Lines 28-84):**

```ruby
def create
  # ... existing validation ...

  @registration = Registration.new(registration_params)

  if @registration.save
    render json: @registration, status: :created
  else
    # ADD Sentry for repeated validation failures
    if @registration.errors[:email].include?("already registered for this event")
      # Track duplicate attempts (might indicate UX issue)
      Sentry.capture_message("Duplicate registration attempt",
        level: :info,
        tags: {
          event_slug: params[:event_id],
          duplicate_type: 'email'
        },
        extra: {
          email: mask_email(@registration.email),
          event_id: @event.id,
          application_id: @registration.vendor_application_id
        },
        fingerprint: ['duplicate-registration', @event.slug]
      )
    end

    render json: { errors: @registration.errors.full_messages }, status: :unprocessable_entity
  end
rescue => e
  # Capture unexpected errors
  Sentry.capture_exception(e,
    level: :error,
    tags: {
      controller: 'RegistrationsController',
      action: 'create',
      event_slug: params[:event_id]
    },
    extra: {
      params: registration_params.to_h,
      event_id: @event&.id
    },
    fingerprint: ['registration-creation-failure']
  )

  render json: { error: 'An unexpected error occurred' }, status: :internal_server_error
end
```

### Phase 4: SendGrid API Error Tracking (Priority 2)

#### 4.1 BaseEmailService Enhancement

**File:** `/app/services/base_email_service.rb`

**Wrap SendGrid API Calls (Around Line 108):**

```ruby
def send_via_sendgrid(mail)
  sg = SendGrid::API.new(api_key: ENV["VoxxyKeyAPI"])

  begin
    response = sg.client.mail._("send").post(request_body: mail.to_json)

    # Check response status
    if response.status_code.to_i >= 400
      # SendGrid API error
      error_msg = "SendGrid API error: #{response.status_code}"

      Sentry.capture_message(error_msg,
        level: response.status_code.to_i >= 500 ? :error : :warning,
        tags: {
          sendgrid_status: response.status_code.to_s,
          api_error: true
        },
        extra: {
          response_body: response.body,
          response_headers: response.headers.to_h,
          mail_to: mail.personalizations&.first&.to&.map(&:email),
          template_id: mail.template_id
        },
        fingerprint: ['sendgrid-api-error', response.status_code.to_s]
      )

      raise "SendGrid returned status #{response.status_code}: #{response.body}"
    end

    # Extract message ID
    message_id = response.headers['x-message-id']

    unless message_id
      # Missing message ID - critical for tracking
      Sentry.capture_message("SendGrid response missing x-message-id",
        level: :warning,
        tags: {
          sendgrid_status: response.status_code.to_s
        },
        extra: {
          response_headers: response.headers.to_h
        },
        fingerprint: ['missing-message-id']
      )
    end

    { success: true, message_id: message_id }

  rescue Faraday::Error => e
    # Network/connection error
    Sentry.capture_exception(e,
      level: :error,
      tags: {
        sendgrid_error: true,
        error_type: 'network'
      },
      extra: {
        error_class: e.class.name,
        mail_to: mail.personalizations&.first&.to&.map(&:email)
      },
      fingerprint: ['sendgrid-network-error']
    )

    raise
  end
end
```

### Phase 5: Custom Sentry Tags (Priority 3)

#### 5.1 Add Global Context Helper

**File:** `/app/services/sentry_context_helper.rb` (NEW FILE)

```ruby
module SentryContextHelper
  def self.set_email_context(email_type:, event: nil, registration: nil, scheduled_email: nil)
    Sentry.set_context("email", {
      type: email_type,
      event_id: event&.id,
      event_slug: event&.slug,
      event_title: event&.title,
      registration_id: registration&.id,
      vendor_category: registration&.vendor_category,
      scheduled_email_id: scheduled_email&.id,
      category: scheduled_email&.email_template_item&.category
    })

    Sentry.set_tags({
      email_type: email_type,
      event_slug: event&.slug,
      category: scheduled_email&.email_template_item&.category
    })
  end

  def self.clear_email_context
    Sentry.set_context("email", nil)
  end
end
```

**Usage in Services:**
```ruby
class EmailSenderService
  def send_emails
    SentryContextHelper.set_email_context(
      email_type: 'scheduled',
      event: event,
      scheduled_email: scheduled_email
    )

    # ... send emails ...

  ensure
    SentryContextHelper.clear_email_context
  end
end
```

---

## Testing Plan

### Unit Tests

**File:** `/spec/services/email_sender_service_spec.rb` (NEW)

```ruby
RSpec.describe EmailSenderService, type: :service do
  describe '#send_emails' do
    context 'when SendGrid API fails' do
      it 'captures exception in Sentry' do
        allow(Sentry).to receive(:capture_exception)

        # Mock SendGrid failure
        allow_any_instance_of(SendGrid::API).to receive(:client).and_raise(StandardError.new("API Error"))

        service = EmailSenderService.new(scheduled_email)
        service.send_emails

        expect(Sentry).to have_received(:capture_exception).with(
          kind_of(StandardError),
          hash_including(
            level: :error,
            tags: hash_including(email_type: 'scheduled')
          )
        )
      end
    end
  end
end
```

### Integration Tests

1. **Trigger email send failure** → Check Sentry dashboard
2. **Send to invalid email** → Verify bounce tracking in Sentry
3. **Process webhook with missing message ID** → Check Sentry warning
4. **Send email with zero recipients** → Verify Sentry alert

### Staging Validation

1. Deploy to staging
2. Trigger each error scenario manually
3. Verify Discord alerts (if webhook configured)
4. Check Sentry dashboard for proper grouping

---

## Rollout Checklist

### Pre-Deployment

- [ ] Review all Sentry instrumentation code
- [ ] Verify `SENTRY_DSN` environment variable set
- [ ] Add `SENTRY_ENVIRONMENT=production` to Render
- [ ] Test in local development first
- [ ] Deploy to staging and monitor for 24 hours

### Deployment

- [ ] Create migration if needed (none required)
- [ ] Deploy code changes to staging
- [ ] Verify Sentry events appear in dashboard
- [ ] Configure Discord webhook in Sentry (optional)
- [ ] Deploy to production
- [ ] Monitor Sentry dashboard for 1 hour post-deploy

### Post-Deployment

- [ ] Create Sentry alert rules (see below)
- [ ] Set up Sentry dashboard widgets
- [ ] Document incident response workflow
- [ ] Train team on Sentry usage

---

## Sentry Alert Rules Configuration

### Alert Rule 1: Critical Email Failures

```yaml
Name: "Critical Email Send Failures"
When: An event is first seen
Conditions:
  - The issue's tags match: email_type is any of scheduled, invitation, notification
  - The issue's level is equal to error
Action: Send a notification via Discord and email
Frequency: On every new issue
```

### Alert Rule 2: High-Volume Failures

```yaml
Name: "Email Failure Spike"
When: An event is seen
Conditions:
  - The issue's tags match: sendgrid_error is true
  - The issue is seen more than 10 times in 1 hour
Action: Send a notification via Discord
Frequency: Once per hour maximum
```

### Alert Rule 3: Zero Recipients Warning

```yaml
Name: "Zero Recipients Detected"
When: An event is first seen
Conditions:
  - The issue's fingerprint contains: zero-recipients
Action: Send a notification via Discord and email
Frequency: On every new issue
```

### Alert Rule 4: SendGrid API Errors

```yaml
Name: "SendGrid API Issues"
When: An event is first seen
Conditions:
  - The issue's tags match: api_error is true
  - The issue's tags match: sendgrid_status is any of 401, 429, 500, 502, 503
Action: Send a notification via Discord and email immediately
Frequency: On every new issue
```

---

## Environment Variables

### Required

```bash
# Already set
SENTRY_DSN=https://your-dsn@sentry.io/project-id
VoxxyKeyAPI=<sendgrid-api-key>

# Add these
SENTRY_ENVIRONMENT=production  # or staging, development
SENTRY_RELEASE=<git-sha>       # Auto-set by CI/CD
EMAIL_ALERT_THRESHOLD=10       # Max failures before alert
```

---

## Cost Estimate

**Sentry Events per Month (Estimated):**
- Email send attempts: ~10,000/month (production)
- Failed sends (2% failure rate): ~200/month
- Webhook events: ~9,800/month (successful deliveries)
- Zero-recipient warnings: ~5/month
- **Total Sentry events: ~10,000/month**

**Sentry Plan:**
- Free tier: 5k events/month (insufficient)
- **Team plan: $26/month** (50k events) ✅ Recommended
- Business plan: $80/month (100k events)

---

## Success Metrics

### Week 1
- ✅ All email errors captured in Sentry
- ✅ Discord alerts configured and tested
- ✅ <5 minutes from error to alert

### Week 4
- ✅ Email failure rate <2%
- ✅ Zero undetected email failures
- ✅ Average error resolution time <2 hours

### Month 3
- ✅ Email delivery success rate >98%
- ✅ Bounce rate <1%
- ✅ Zero critical errors unresolved >1 hour

---

## Next Steps

1. **This Week:**
   - Add Sentry instrumentation to all services (copy code from this doc)
   - Test in development
   - Deploy to staging

2. **Next Week:**
   - Monitor staging for 3-5 days
   - Tune alert thresholds
   - Deploy to production

3. **Ongoing:**
   - Review Sentry dashboard weekly
   - Adjust fingerprints for better error grouping
   - Create custom Sentry dashboards

---

## Support Resources

- [Sentry Ruby Docs](https://docs.sentry.io/platforms/ruby/)
- [Sentry Rails Integration](https://docs.sentry.io/platforms/ruby/guides/rails/)
- [Sentry Fingerprinting](https://docs.sentry.io/platforms/ruby/usage/fingerprinting/)
- Internal: `docs/CLEANUP_AND_MONITORING_SUMMARY.md` for frontend integration
