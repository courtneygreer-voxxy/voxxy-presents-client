# Email Audit Log - Backend Implementation Checklist

**For:** Backend developers implementing Email Audit Log requirements
**Status:** ✅ Phases 1-3 Complete | ⏳ Phase 4 Pending
**Priority:** MEDIUM (Core functionality working, optimization & data consistency in Phase 4)
**Last Updated:** February 28, 2026

---

## Phase Status

### ✅ Phases 1-3 Complete (Deployed to Staging)
- ✅ 17 email types support
- ✅ Registration data in email deliveries (recipient_name, vendor_category)
- ✅ Invitation delivery stats
- ✅ Event-based emails via unified EmailSenderService

### ⏳ Phase 4 Pending
- ⏳ Fix delivery count discrepancy (Issue #4)
- ⏳ `recalculate_delivery_counts!` method
- ⏳ SendGrid webhook handler updates
- ⏳ Performance optimizations (bulk endpoint, caching)

---

## Overview

The frontend Email Audit Log is **complete and deployed**. Phases 1-3 of the backend implementation are **complete and in staging**. Phase 4 will address data consistency and performance optimizations.

**Related Docs:**
- [EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md](./EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md) - Full technical specification
- [EMAIL_AUDIT_LOG_QUICK_REFERENCE.md](./EMAIL_AUDIT_LOG_QUICK_REFERENCE.md) - Quick reference guide

---

## Critical Issues to Fix (HIGH PRIORITY)

### ⚠️ Issue #4: Delivery Status Discrepancy

**Problem:** Mail Tab shows "3 undelivered" but Audit Log shows "3 delivered"

**Root Cause:** `scheduled_email.delivery_counts` doesn't match `email_deliveries.status` counts

**Impact:** Data integrity - users don't trust the system

**Required Fix:**

```ruby
# 1. Add method to ScheduledEmail model
class ScheduledEmail < ApplicationRecord
  def recalculate_delivery_counts!
    counts = email_deliveries.group(:status).count

    self.delivery_counts = {
      total_sent: email_deliveries.count,
      delivered: counts['delivered'] || 0,
      bounced: counts['bounced'] || 0,
      dropped: counts['dropped'] || 0,
      unsubscribed: counts['unsubscribed'] || 0,
      pending: counts['pending'] || 0
    }

    self.delivered_count = delivery_counts[:delivered]
    self.undelivered_count = delivery_counts[:bounced] + delivery_counts[:dropped]
    self.unsubscribed_count = delivery_counts[:unsubscribed]

    save!
  end
end

# 2. Call after EVERY SendGrid webhook update
class SendGridWebhookController < ApplicationController
  def process_event
    delivery = EmailDelivery.find_by(sendgrid_message_id: params[:sg_message_id])

    # Update delivery record
    delivery.update!(
      status: params[:event],
      delivered_at: (params[:event] == 'delivered' ? Time.now : nil),
      bounced_at: (params[:event] == 'bounced' ? Time.now : nil),
      bounce_reason: params[:reason],
      drop_reason: params[:reason]
    )

    # CRITICAL: Recalculate aggregated counts
    delivery.scheduled_email.recalculate_delivery_counts!
  end
end
```

**Testing:**
```ruby
test "delivery_counts matches email_deliveries status counts" do
  email = scheduled_emails(:confirmation_email)
  expected = email.email_deliveries.group(:status).count

  assert_equal expected['delivered'], email.delivery_counts[:delivered]
  assert_equal expected['bounced'], email.delivery_counts[:bounced]
end
```

**Files to Modify:**
- `app/models/scheduled_email.rb`
- `app/controllers/sendgrid_webhooks_controller.rb` (or similar)

**Priority:** 🔴 HIGH - Affects data integrity

**Status:** ❌ Not Implemented

---

## Required API Enhancements (CRITICAL)

### 1. Include Registration Data in Email Deliveries

**Current Problem:** Audit log shows "Unknown" for recipient name and vendor category

**Endpoint:** `GET /api/v1/presents/events/:event_slug/scheduled_emails/:id/email_deliveries`

**Current Response:**
```json
[
  {
    "id": 123,
    "recipient_email": "vendor@example.com",
    "status": "delivered"
  }
]
```

**Required Response:**
```json
[
  {
    "id": 123,
    "recipient_email": "vendor@example.com",
    "status": "delivered",
    "registration": {
      "id": 456,
      "vendor_contact": {
        "name": "John Doe",
        "email": "vendor@example.com",
        "vendor_category": "Food & Beverage"
      }
    }
  }
]
```

**Implementation:**
```ruby
class EmailDeliveriesController < ApplicationController
  def index
    deliveries = @scheduled_email
      .email_deliveries
      .includes(registration: :vendor_contact)

    render json: deliveries.as_json(
      include: {
        registration: {
          only: [:id],
          include: {
            vendor_contact: {
              only: [:name, :email],
              methods: [:vendor_category]
            }
          }
        }
      }
    )
  end
end
```

**Priority:** 🟡 MEDIUM - Improves user experience

**Status:** ✅ IMPLEMENTED (Phases 1-3)

---

### 2. Include Delivery Stats in Invitations Endpoint

**Endpoint:** `GET /api/v1/presents/events/:event_slug/invitations`

**Current Response:**
```json
{
  "invitations": [...],
  "meta": {
    "total_count": 50,
    "sent_count": 45
  }
}
```

**Required Response:**
```json
{
  "invitations": [
    {
      "id": 1,
      "sent_at": "2026-02-27T10:00:00Z",
      "vendor_contact": {
        "name": "John Doe",
        "email": "vendor@example.com",
        "vendor_category": "Food & Beverage"
      },
      "delivery_status": "delivered"
    }
  ],
  "meta": {
    "total_count": 50,
    "sent_count": 45,
    "delivery_stats": {
      "total_sent": 45,
      "delivered": 40,
      "bounced": 3,
      "dropped": 2,
      "unsubscribed": 0,
      "pending": 0,
      "undelivered": 5
    }
  }
}
```

**Implementation:**
```ruby
class EventInvitationsController < ApplicationController
  def index
    invitations = @event.event_invitations.includes(:vendor_contact)
    sent_invitations = invitations.where.not(sent_at: nil)

    delivery_stats = sent_invitations.group(:delivery_status).count

    render json: {
      invitations: invitations.as_json(include: :vendor_contact),
      meta: {
        total_count: invitations.count,
        sent_count: sent_invitations.count,
        delivery_stats: {
          total_sent: sent_invitations.count,
          delivered: delivery_stats['delivered'] || 0,
          bounced: delivery_stats['bounced'] || 0,
          dropped: delivery_stats['dropped'] || 0,
          unsubscribed: delivery_stats['unsubscribed'] || 0,
          pending: delivery_stats['pending'] || 0,
          undelivered: (delivery_stats['bounced'] || 0) + (delivery_stats['dropped'] || 0)
        }
      }
    }
  end
end
```

**Priority:** 🟡 MEDIUM - Required for virtual invitation email

**Status:** ✅ IMPLEMENTED (Phases 1-3)

---

## Optional Performance Optimizations

### Bulk Deliveries Endpoint (Reduces N+1 Queries)

**Problem:** Frontend makes separate API call for each sent email

**Current Flow:**
```
1. GET /events/:slug/scheduled_emails (1 request)
2. For each sent email:
   GET /events/:slug/scheduled_emails/:id/email_deliveries (N requests)
```

**Proposed Endpoint:**
```
GET /api/v1/presents/events/:event_slug/email_deliveries
Query params:
  - scheduled_email_ids[]=1&scheduled_email_ids[]=2&...
  - status=delivered (optional filter)
```

**Response:**
```json
{
  "deliveries": [
    {
      "id": 1,
      "scheduled_email_id": 123,
      "recipient_email": "...",
      "status": "delivered",
      "registration": { ... }
    }
  ]
}
```

**Implementation:**
```ruby
class EmailDeliveriesController < ApplicationController
  def bulk_index
    deliveries = EmailDelivery
      .where(scheduled_email_id: params[:scheduled_email_ids])
      .includes(registration: :vendor_contact)

    deliveries = deliveries.where(status: params[:status]) if params[:status]

    render json: { deliveries: deliveries.as_json(...) }
  end
end
```

**Priority:** 🟢 LOW - Performance optimization

**Status:** ❌ Not Implemented

---

### Auto-Refresh Optimization

**Problem:** Frontend polls every 30 seconds, causing repeated API calls

**Option 1: Add `include_delivery_counts` Param**
```ruby
# GET /events/:slug/scheduled_emails?include_delivery_counts=true
def index
  emails = @event.scheduled_emails

  if params[:include_delivery_counts] == 'false'
    # Don't eager load deliveries, use cached counts
    emails = emails.select(:id, :name, :status, :delivery_counts)
  else
    # Full load with deliveries
    emails = emails.includes(:email_deliveries)
  end

  render json: emails
end
```

**Option 2: Add Caching**
```ruby
class ScheduledEmail < ApplicationRecord
  def delivery_counts_with_cache
    Rails.cache.fetch("email_#{id}_delivery_counts", expires_in: 30.seconds) do
      recalculate_delivery_counts!
      delivery_counts
    end
  end
end
```

**Priority:** 🟢 LOW - Performance optimization

**Status:** ❌ Not Implemented

---

## Database Migrations

### Add Delivery Counts to Scheduled Emails (if not exists)

```ruby
class AddDeliveryCountsToScheduledEmails < ActiveRecord::Migration[7.0]
  def change
    add_column :scheduled_emails, :delivery_counts, :jsonb, default: {}
    add_column :scheduled_emails, :delivered_count, :integer, default: 0
    add_column :scheduled_emails, :undelivered_count, :integer, default: 0
    add_column :scheduled_emails, :unsubscribed_count, :integer, default: 0

    add_index :scheduled_emails, :delivery_counts, using: :gin
  end
end
```

### Add Delivery Status to Event Invitations (if not exists)

```ruby
class AddDeliveryStatusToEventInvitations < ActiveRecord::Migration[7.0]
  def change
    add_column :event_invitations, :delivery_status, :integer, default: 0
    add_column :event_invitations, :sent_at, :datetime
    add_column :event_invitations, :delivered_at, :datetime
    add_column :event_invitations, :bounced_at, :datetime

    add_index :event_invitations, :delivery_status
  end
end
```

---

## Testing Checklist

### Unit Tests

- [ ] `ScheduledEmail#recalculate_delivery_counts!` updates all counts correctly
- [ ] `delivery_counts` matches `email_deliveries.group(:status).count`
- [ ] `undelivered_count` equals `bounced + dropped`
- [ ] Counts update when delivery status changes

### Integration Tests

- [ ] SendGrid webhook updates both `email_delivery` and `scheduled_email`
- [ ] Mail Tab API shows same counts as Audit Log API
- [ ] Invitation delivery stats match individual invitation statuses
- [ ] Registration data included in delivery responses

### End-to-End Tests

- [ ] Send email → webhook → verify Mail Tab counts match Audit Log
- [ ] Update delivery status → verify both tables update
- [ ] Load Audit Log → verify no "Unknown" recipients/categories
- [ ] Auto-refresh doesn't cause performance issues

---

## Implementation Order

### Phase 1: Critical Fixes (Week 1)
1. ✅ Implement `recalculate_delivery_counts!` method
2. ✅ Update SendGrid webhook handler to call it
3. ✅ Add database tests for count consistency
4. ✅ Deploy and verify in staging

### Phase 2: API Enhancements (Week 2)
1. ✅ Include registration data in email deliveries endpoint
2. ✅ Add delivery stats to invitations endpoint
3. ✅ Test in staging with frontend
4. ✅ Deploy to production

### Phase 3: Optimizations (Optional - Week 3)
1. ⏸️ Implement bulk deliveries endpoint
2. ⏸️ Add caching for auto-refresh
3. ⏸️ Performance testing

---

## Rollout Plan

### Staging Deployment
1. Deploy backend changes to staging
2. Test with frontend staging environment
3. Verify data consistency
4. Run integration tests

### Production Deployment
1. Announce maintenance window (if needed)
2. Deploy backend changes
3. Monitor error logs for 24 hours
4. Verify webhook processing
5. Check delivery count consistency

### Rollback Plan
If issues occur:
1. Revert migration (if needed)
2. Restore previous webhook handler
3. Clear cache
4. Notify frontend team

---

## Success Metrics

- [ ] Zero discrepancies between Mail Tab and Audit Log counts
- [ ] Audit Log shows recipient names (not "Unknown")
- [ ] Audit Log shows vendor categories (not "Unknown")
- [ ] Webhook processing updates both tables within 1 second
- [ ] Auto-refresh performance acceptable (<500ms response time)

---

## Questions or Issues?

**Contact:**
- Frontend Team: Courtney + Claude Code
- Related Docs: [EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md](./EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md)

**Slack Channels:**
- `#voxxy-backend-dev`
- `#voxxy-frontend-dev`

---

## Status Tracking

| Task | Priority | Status | Assignee | ETA |
|------|----------|--------|----------|-----|
| Fix delivery count discrepancy | 🔴 HIGH | ⏳ Phase 4 | Backend Team | TBD |
| Include registration data | 🟡 MEDIUM | ✅ Complete (Phases 1-3) | Backend Team | Deployed |
| Add invitation delivery stats | 🟡 MEDIUM | ✅ Complete (Phases 1-3) | Backend Team | Deployed |
| Bulk deliveries endpoint | 🟢 LOW | ⏸️ Deferred to Phase 4 | - | - |
| Auto-refresh optimization | 🟢 LOW | ⏸️ Deferred to Phase 4 | - | - |

---

**Last Updated:** February 28, 2026
**Next Review:** After Phase 1 completion
