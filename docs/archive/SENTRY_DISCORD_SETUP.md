# Sentry + Discord Integration Setup Guide

This guide walks through setting up Sentry error monitoring with Discord webhook alerts for Voxxy Presents.

## Prerequisites

- Discord server with admin access
- Sentry account (free tier is sufficient for MVP)
- Access to Render environment variables

---

## Part 1: Create Discord Webhook

### Step 1: Create Discord Channel

1. In your Discord server, create a dedicated channel: `#voxxy-alerts` or `#engineering-alerts`
2. Right-click the channel → **Edit Channel**
3. Navigate to **Integrations** → **Webhooks**
4. Click **New Webhook**

### Step 2: Configure Webhook

1. Name the webhook: `Voxxy Sentry Alerts`
2. Choose the channel: `#voxxy-alerts`
3. Copy the **Webhook URL** (you'll need this for Sentry)
4. Click **Save**

Example webhook URL format:

```
https://discord.com/api/webhooks/1234567890/AbCdEfGhIjKlMnOpQrStUvWxYz
```

---

## Part 2: Set Up Sentry Project

### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io/signup/)
2. Sign up with GitHub or email
3. Choose the **Free** plan (10k events/month)

### Step 2: Create Project

1. Click **Projects** → **Create Project**
2. Select platform: **React**
3. Set alert frequency: **On every new issue**
4. Project name: `voxxy-presents-client`
5. Click **Create Project**

### Step 3: Get DSN

1. After project creation, copy the **DSN** (Data Source Name)
2. It looks like: `https://abc123@o123456.ingest.sentry.io/7890123`
3. Save this for environment configuration

---

## Part 3: Configure Sentry → Discord Integration

### Step 1: Add Discord Integration

1. In your Sentry project, go to **Settings** → **Integrations**
2. Search for **Webhooks** (not Discord - Sentry doesn't have native Discord integration)
3. Click **Add Integration** → **Internal Integration**

### Step 2: Create Internal Integration

1. Name: `Discord Alerts`
2. Webhook URL: Use your Discord webhook URL from Part 1
3. Permissions:
   - **Issue & Event**: Read
   - **Project**: Read
4. Webhooks: Check **issue**
5. Click **Save**

### Step 3: Configure Alert Rules

1. Go to **Alerts** → **Create Alert**
2. Choose **Issues**
3. Configure conditions:

**Rule 1: Critical Form Errors**

- Name: `Critical Form Submission Errors`
- When: `An event is captured`
- If: `The issue's tags match` → `form_type` → `vendor_application`
- And: `The issue's level is equal to` → `fatal` or `error`
- Then: Send notification via **Discord Alerts**

**Rule 2: Email Delivery Failures**

- Name: `Email Delivery Failures`
- When: `An event is captured`
- If: `The issue's tags match` → `email_type` → `ANY`
- And: `The issue's level is equal to` → `error`
- Then: Send notification via **Discord Alerts**

**Rule 3: High-Volume Errors**

- Name: `Form Error Spike`
- When: `An event is captured`
- If: `The issue is seen more than` → `5 times in 10 minutes`
- Then: Send notification via **Discord Alerts**

---

## Part 4: Install Sentry in Frontend

### Step 1: Install Dependencies

```bash
npm install @sentry/react
```

### Step 2: Update Environment Variables

Add to `.env.development`:

```env
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_ENVIRONMENT=development
```

Add to `.env.staging`:

```env
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_ENVIRONMENT=staging
```

Add to `.env.production`:

```env
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_ENVIRONMENT=production
```

### Step 3: Configure Render Environment Variables

For each Render service (development, staging, production), add:

| Key                | Value                                     |
| ------------------ | ----------------------------------------- |
| `VITE_SENTRY_DSN`  | Your Sentry DSN                           |
| `VITE_ENVIRONMENT` | `development`, `staging`, or `production` |

### Step 4: Initialize Sentry in main.tsx

Update `/src/main.tsx`:

```typescript
import { initializeErrorMonitoring } from './utils/errorMonitoring'

// Initialize error monitoring BEFORE rendering
initializeErrorMonitoring()

// Rest of your app initialization...
```

### Step 5: Uncomment Sentry Code

In `/src/utils/errorMonitoring.ts`:

1. Uncomment the `import * as Sentry from '@sentry/react'` line
2. Uncomment all Sentry API calls in the functions
3. Remove all `TODO` comments

---

## Part 5: Test the Integration

### Test 1: Trigger Form Error

1. In development, temporarily break form validation
2. Submit the vendor application form
3. Check Discord for alert within 1-2 minutes

### Test 2: Trigger Email Error

1. In development, call `trackEmailError()` with test data
2. Check Discord for alert

### Test 3: Verify Error Context

1. In Sentry dashboard, find the test error
2. Verify these fields are populated:
   - Event slug
   - Application ID
   - Form type
   - HTTP status
   - User agent
   - Viewport

---

## Part 6: Discord Message Formatting (Optional Enhancement)

By default, Sentry webhooks send JSON payloads. To get prettier Discord messages, you'll need a middleware service.

### Option A: Use Zapier (No Code)

1. Create Zapier account (free)
2. New Zap: **Webhooks by Zapier** → **Discord**
3. Set webhook URL as trigger
4. Format Discord message with Sentry data
5. Use Zapier webhook URL in Sentry instead of Discord URL

### Option B: Custom Middleware (Advanced)

Create a serverless function (Vercel/Netlify/Cloudflare Workers) that:

1. Receives Sentry webhook
2. Formats as Discord embed with rich formatting
3. Forwards to Discord webhook

Example Discord embed format:

```json
{
  "embeds": [
    {
      "title": "🚨 Form Submission Error",
      "color": 16711680,
      "fields": [
        { "name": "Form Type", "value": "Vendor Application", "inline": true },
        { "name": "Event", "value": "SF Art Walk 2026", "inline": true },
        { "name": "Status", "value": "500 Server Error", "inline": true },
        { "name": "Error", "value": "Failed to submit registration" },
        { "name": "User", "value": "vendor@example.com" }
      ],
      "footer": { "text": "Production • Sentry" },
      "timestamp": "2026-02-25T12:00:00Z"
    }
  ]
}
```

---

## Part 7: Monitoring Best Practices

### Alert Volume Management

- **Production**: Alert on all form errors (expect 0-5/day)
- **Staging**: Alert on critical only (testing generates noise)
- **Development**: Disable alerts (log to console only)

### Error Grouping

Sentry automatically groups similar errors using fingerprints. We configure fingerprints based on:

- Form type
- Event slug
- Application ID
- HTTP status

This prevents alert spam when the same error affects multiple users.

### Dashboard Monitoring

Check Sentry dashboard weekly for:

1. **Error rate trends** - Are errors increasing?
2. **User impact** - How many unique users affected?
3. **Resolution time** - How quickly are we fixing issues?

### Team Workflow

When Discord alert fires:

1. Click Sentry link to see full error context
2. Assign issue to developer in Sentry
3. Investigate using error context (event, application, user)
4. Fix and deploy
5. Mark as resolved in Sentry
6. Monitor for recurrence

---

## Part 8: Backend Email Monitoring

### Ruby on Rails Sentry Setup

Install gem in `Gemfile`:

```ruby
gem 'sentry-ruby'
gem 'sentry-rails'
```

Configure in `config/initializers/sentry.rb`:

```ruby
Sentry.init do |config|
  config.dsn = ENV['SENTRY_DSN']
  config.environment = Rails.env
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]

  # Sample rates
  config.traces_sample_rate = Rails.env.production? ? 0.1 : 1.0

  # Filter sensitive data
  config.send_default_pii = false
  config.excluded_exceptions += ['ActionController::RoutingError']
end
```

Track email failures in `app/services/email_service.rb`:

```ruby
def send_email(recipient:, template:, data:)
  response = sendgrid_client.send(email)

  if response.status_code >= 400
    Sentry.capture_message("Email delivery failed", {
      level: :error,
      tags: {
        email_type: template,
        recipient: mask_email(recipient),
        status: response.status_code
      },
      extra: {
        sendgrid_response: response.body
      }
    })
  end
rescue => e
  Sentry.capture_exception(e, {
    level: :critical,
    tags: { email_type: template }
  })
end
```

---

## Rollout Plan

### Phase 1: Development Testing (Week 1)

- Install Sentry
- Configure Discord webhook
- Test with manual errors
- Verify alert routing

### Phase 2: Staging Deployment (Week 2)

- Deploy to staging
- Monitor real staging traffic
- Tune alert thresholds
- Test alert suppression

### Phase 3: Production Rollout (Week 3)

- Deploy to production
- Monitor first 24 hours closely
- Adjust alert rules based on volume
- Document incident response workflow

### Phase 4: Backend Integration (Week 4)

- Install Sentry in Rails backend
- Add email delivery tracking
- Create backend-specific alerts
- Test end-to-end flow

---

## Cost Estimate

| Service           | Plan                    | Cost |
| ----------------- | ----------------------- | ---- |
| Sentry            | Free (10k events/month) | $0   |
| Discord           | Free                    | $0   |
| Zapier (optional) | Free (100 tasks/month)  | $0   |

**Total:** $0/month for MVP

When exceeding free tier limits (~10k errors/month means bigger problems), upgrade to:

- Sentry Team: $26/month (50k events)
- Sentry Business: $80/month (100k events)

---

## Support Resources

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Discord Webhooks Guide](https://discord.com/developers/docs/resources/webhook)
- [Sentry Alert Rules](https://docs.sentry.io/product/alerts/alert-types/)
- Voxxy Internal: `#engineering` channel for questions
