# Email Audit Log - Quick Reference

**Status:** ✅ Frontend Complete | 🚧 Backend Coordination Needed
**Last Updated:** February 28, 2026

---

## What Is It?

A full-screen email tracking dashboard that shows **all email deliveries** for an event with filtering, sorting, and detailed delivery status from SendGrid.

## How to Access

1. **Mail Tab** → Click "View Audit Log" button (top right)
2. **Mail Tab** → Click any email's recipient count
3. **Mail Tab** → Click any email's undelivered/unsubscribed count

## Key Features

✅ **9-column sortable table** - Date, Recipient, Email, Status, Category, etc.
✅ **Advanced filters** - Email name, category, status, text search
✅ **Deep linking** - Click counts to pre-filter the view
✅ **Pagination** - 100 items per page
✅ **Contact Support** - One-click support requests for failed deliveries
✅ **Auto-refresh** - Updates every 30 seconds

## Data Sources

The audit log aggregates data from **three sources**:

1. **Scheduled Emails** (`/events/:slug/scheduled_emails`)
   - All 17 email types including Position 1 "Initial Invitation"
   - Application confirmations, reminders, event-based emails

2. **Email Deliveries** (`/events/:slug/scheduled_emails/:id/email_deliveries`)
   - Individual delivery records with SendGrid webhook status

3. **Event Invitations** (`/events/:slug/invitations`)
   - Legacy invitation delivery stats (deprecated - now uses Position 1)

## Column Details

| Column | Description | Sortable |
|--------|-------------|----------|
| **Date Sent** | When email was sent | ✅ |
| **Recipient** | Recipient name (currently shows "Unknown") | ✅ |
| **Email Address** | Recipient email | ✅ |
| **Email Name** | Email template name | ✅ |
| **Trigger** | What triggered the email | ❌ |
| **Category** | Vendor category (currently shows "Unknown") | ✅ |
| **Status** | Delivery status (delivered, bounced, etc.) | ✅ |
| **Details** | Error details for failed deliveries | ❌ |
| **Actions** | Contact Support (for failed deliveries only) | ❌ |

## Status Types

| Status | Icon | Meaning |
|--------|------|---------|
| Delivered | ✓ | Successfully delivered to inbox |
| Bounced | ✕ | Email bounced (invalid email or mailbox full) |
| Dropped | ⊘ | SendGrid dropped (spam, unsubscribed, etc.) |
| Sent | ↗ | Sent to SendGrid, awaiting delivery |
| Pending | ○ | Queued in SendGrid |
| Scheduled | ◷ | Will be sent in future |
| Unsubscribed | ⊗ | Recipient unsubscribed |

**Special Filter:** "Undelivered" = Bounced + Dropped combined

## Current Limitations

### 1. ✅ FIXED - Recipient Name Shows "Unknown"
**Status:** ✅ Fixed in Phases 1-3 (Feb 28, 2026)
**Solution:** Backend now includes `recipient_name` in `/email_deliveries` endpoint

### 2. ✅ FIXED - Category Shows "Unknown"
**Status:** ✅ Fixed in Phases 1-3 (Feb 28, 2026)
**Solution:** Backend now includes `vendor_category` in `/email_deliveries` endpoint

### 3. ✅ FIXED - Invitation Email Opens Old Modal
**Status:** ✅ Fixed in Invitation Unification (Feb 28, 2026)
**Solution:** Removed virtual invitation email logic, all emails now open audit log

### 4. ⏳ PENDING - Data Discrepancy Between Mail Tab & Audit Log
**Why:** Mail tab uses aggregated counts, audit log uses individual records
**Fix:** Ensure backend keeps both in sync via webhooks (backend Phase 4)
**Status:** Will be fixed with `recalculate_delivery_counts!` method

## Backend API Requirements

### Critical Endpoints

```
GET /events/:slug/scheduled_emails
  → Must include delivery_counts (aggregated from email_deliveries)

GET /events/:slug/scheduled_emails/:id/email_deliveries
  → Must include registration.vendor_contact (name, category)

GET /events/:slug/invitations
  → Must include meta.delivery_stats (aggregated delivery status)

GET /events/:slug/scheduled_emails/:id/recipients
  → Returns who WILL receive scheduled/paused emails
```

### Data Consistency Requirements

**CRITICAL:** `scheduled_email.delivery_counts` must match `email_deliveries.status` counts.

**How to ensure:**
1. SendGrid webhook updates `email_delivery.status`
2. Webhook also recalculates `scheduled_email.delivery_counts`
3. Both updates happen in same transaction

**Example:**
```ruby
# After webhook updates email_delivery
delivery.update!(status: 'delivered')

# MUST recalculate aggregated counts
scheduled_email.recalculate_delivery_counts!
```

## Contact Support Feature

**What:** Users can click action menu on failed deliveries to contact Voxxy support.

**How:** Sends formatted message to Discord webhook with:
- User name & email
- Problem description
- Email details (recipient, status, error)
- Whether user wants callback

**Backend Requirement:** None (uses frontend Discord webhook)

## Performance Considerations

### Current Behavior
- Auto-refresh polls every 30 seconds
- For each sent email, makes separate API call to get deliveries
- If 10 emails sent → 10 API calls every 30 seconds

### Optimization Options
1. Add `include_delivery_counts=true` param to skip delivery fetches
2. Create bulk deliveries endpoint: `/events/:slug/email_deliveries`
3. Cache delivery counts with 30-second TTL

## Testing Checklist

### Frontend
- [ ] Open audit log from "View Audit Log" button
- [ ] Open audit log from recipient count button
- [ ] Open audit log from undelivered count button
- [ ] Filter by email name
- [ ] Filter by status (especially "undelivered")
- [ ] Filter by category
- [ ] Search by recipient name/email
- [ ] Sort by each column
- [ ] Navigate pagination
- [ ] Contact Support for failed delivery

### Backend
- [ ] `/scheduled_emails` includes `delivery_counts`
- [ ] `/email_deliveries` includes registration data
- [ ] `/invitations` includes `delivery_stats`
- [ ] SendGrid webhook updates both tables
- [ ] Aggregated counts match individual records
- [ ] Auto-refresh doesn't cause performance issues

## Related Documentation

- **[EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md](./EMAIL_AUDIT_LOG_TECHNICAL_SPEC.md)** - Complete technical specification
- **[FRONTEND_UPDATE_2025-02-27.md](./FRONTEND_UPDATE_2025-02-27.md)** - Implementation details & known issues
- **[EMAIL_HISTORY_AUDIT.md](./EMAIL_HISTORY_AUDIT.md)** - Original requirements

## Questions?

Contact: Frontend Team (Courtney + Claude Code)
