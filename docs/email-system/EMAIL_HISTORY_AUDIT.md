# Email History Audit View - Command Center

## Overview

The Email History Audit View is a comprehensive dashboard feature within the Command Center that allows producers to view, track, and analyze all email communications sent for their events. This feature provides transparency, accountability, and troubleshooting capabilities for the email automation system.

**Status:** 🚧 In Development
**Target Release:** v1.10.0
**Last Updated:** February 26, 2026

---

## Business Requirements

### Core Objectives

1. **Transparency**: Producers can see all emails sent to their event participants
2. **Accountability**: Track delivery status, open rates, and click rates
3. **Troubleshooting**: Identify email delivery failures and bounces
4. **Compliance**: Audit trail for email communications
5. **Analytics**: Understand email engagement and effectiveness

### User Stories

**As a producer, I want to:**

- View a list of all emails sent for my event
- See which recipients received which emails
- Check the delivery status of each email (sent, delivered, opened, clicked, bounced)
- Filter emails by type, date range, and status
- View email content that was sent
- Identify recipients who didn't receive emails
- Export email history for record-keeping
- Resend failed emails

---

## Feature Specifications

### Location

- **Path:** Command Center → Email History tab
- **Route:** `/events/:slug/command-center` (new tab)
- **Access:** Event owner/producer only

### UI Components

#### 1. Email History Table

**Columns:**

- Checkbox (for bulk actions)
- Email Type (icon + label)
- Subject Line
- Recipients Count (e.g., "24 recipients")
- Sent Date/Time
- Delivery Status (badge)
- Open Rate (%)
- Click Rate (%)
- Actions (view, resend, delete)

**Features:**

- Sortable columns
- Pagination (50 per page)
- Search/filter bar
- Bulk selection
- Export to CSV

#### 2. Filter Panel

**Filter Options:**

- Date Range (preset: Last 7 days, Last 30 days, Custom)
- Email Type (dropdown: All, Registration, Confirmation, Reminder, etc.)
- Status (dropdown: All, Sent, Delivered, Opened, Clicked, Bounced, Failed)
- Recipient (search by email or name)

#### 3. Email Detail Modal

**Opens when:** User clicks on an email row

**Displays:**

- Full email subject and preview
- Rendered HTML content (iframe or safe render)
- Recipient list with individual delivery status
- Timestamp details (scheduled, sent, delivered, opened, clicked)
- Email metadata (template used, variables, SendGrid message ID)
- Delivery errors (if any)
- Actions: Resend, View in SendGrid, Download

#### 4. Recipient Detail View

**Opens when:** User clicks on a specific recipient

**Displays:**

- Recipient name and email
- All emails sent to this recipient
- Delivery history timeline
- Engagement metrics (opens, clicks)
- Unsubscribe status

#### 5. Bulk Actions Toolbar

**Appears when:** User selects multiple emails

**Actions:**

- Resend selected emails
- Delete selected emails
- Export selected to CSV
- Mark as reviewed

---

## Data Model

### Frontend TypeScript Interfaces

```typescript
interface EmailDelivery {
  id: number
  scheduled_email_id: number
  registration_id?: number
  recipient_email: string
  recipient_name?: string

  // Status tracking
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'

  // Timestamps
  scheduled_at: string
  sent_at?: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
  bounced_at?: string
  failed_at?: string

  // SendGrid integration
  sendgrid_message_id?: string
  sendgrid_status?: string

  // Error tracking
  error_message?: string
  bounce_reason?: string

  // Engagement
  open_count: number
  click_count: number

  // Metadata
  unsubscribed: boolean
  created_at: string
  updated_at: string
}

interface ScheduledEmail {
  id: number
  event_id: number
  template_id?: number

  // Email content
  subject: string
  body: string // HTML or plain text

  // Scheduling
  send_at: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed'

  // Recipient filtering
  recipient_filter: {
    categories?: string[]
    statuses?: string[]
    payment_status?: string[]
  }

  // Stats
  total_recipients: number
  sent_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  bounced_count: number
  failed_count: number

  // Relations
  email_deliveries?: EmailDelivery[]

  created_at: string
  updated_at: string
}

interface EmailHistoryFilters {
  dateRange?: {
    start: string
    end: string
  }
  emailType?: string
  status?: EmailDelivery['status']
  recipientEmail?: string
  searchQuery?: string
}
```

---

## Backend Requirements

### New API Endpoints

```ruby
# Get email history for an event
GET /v1/presents/events/:event_slug/email_history
Query params:
  - page (default: 1)
  - per_page (default: 50)
  - date_from (ISO 8601)
  - date_to (ISO 8601)
  - email_type (string)
  - status (string)
  - recipient_email (string)
  - search (string)

Response:
{
  scheduled_emails: [...],
  meta: {
    current_page: 1,
    total_pages: 3,
    total_count: 142,
    per_page: 50
  },
  filters: {
    applied: {...},
    available: {
      email_types: ['registration_confirmation', 'reminder', ...],
      statuses: ['sent', 'delivered', 'opened', ...]
    }
  }
}

# Get detailed email with deliveries
GET /v1/presents/scheduled_emails/:id/deliveries
Query params:
  - page
  - per_page
  - status

Response:
{
  scheduled_email: {...},
  deliveries: [...],
  meta: {...}
}

# Resend failed emails
POST /v1/presents/scheduled_emails/:id/resend
Body:
{
  delivery_ids: [1, 2, 3] // Optional: specific deliveries to resend
}

Response:
{
  message: "Resend initiated",
  queued_count: 3
}

# Export email history to CSV
GET /v1/presents/events/:event_slug/email_history/export
Query params: (same as email_history)

Response:
CSV file download
```

### Database Considerations

**Existing tables:**

- `scheduled_emails` - Already exists
- `email_deliveries` - Already exists (tracks individual recipient deliveries)

**Required fields verification:**

- ✅ `email_deliveries.opened_at`
- ✅ `email_deliveries.clicked_at`
- ✅ `email_deliveries.open_count`
- ✅ `email_deliveries.click_count`
- ✅ `email_deliveries.sendgrid_message_id`
- ✅ `email_deliveries.error_message`
- ✅ `email_deliveries.bounce_reason`

**Indexes needed:**

```sql
-- Performance indexes for filtering/searching
CREATE INDEX idx_email_deliveries_status ON email_deliveries(status);
CREATE INDEX idx_email_deliveries_recipient_email ON email_deliveries(recipient_email);
CREATE INDEX idx_email_deliveries_sent_at ON email_deliveries(sent_at);
CREATE INDEX idx_scheduled_emails_event_id_send_at ON scheduled_emails(event_id, send_at);
```

---

## Frontend Implementation

### File Structure

```
src/
├── components/
│   └── producer/
│       └── CommandCenter/
│           ├── EmailHistoryTab.tsx          # Main tab component
│           ├── EmailHistoryTable.tsx        # Table display
│           ├── EmailHistoryFilters.tsx      # Filter panel
│           ├── EmailDetailModal.tsx         # Email detail view
│           ├── RecipientDetailModal.tsx     # Recipient detail view
│           └── EmailHistoryExport.tsx       # CSV export handler
├── hooks/
│   └── useEmailHistory.ts                   # Data fetching hook
└── services/
    └── api.ts                               # API endpoints
```

### Component Hierarchy

```
CommandCenter
└── Tabs
    └── EmailHistoryTab
        ├── EmailHistoryFilters
        ├── EmailHistoryTable
        │   ├── EmailRow (repeated)
        │   └── Pagination
        ├── BulkActionsToolbar (conditional)
        ├── EmailDetailModal (conditional)
        └── RecipientDetailModal (conditional)
```

### API Integration

```typescript
// In src/services/api.ts

export const emailHistoryApi = {
  /**
   * Get email history for an event
   */
  getHistory: async (
    eventSlug: string,
    filters?: EmailHistoryFilters,
    page = 1,
    perPage = 50,
  ): Promise<{
    scheduled_emails: ScheduledEmail[]
    meta: PaginationMeta
    filters: FilterOptions
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    })

    if (filters?.dateRange) {
      params.append('date_from', filters.dateRange.start)
      params.append('date_to', filters.dateRange.end)
    }

    if (filters?.emailType) {
      params.append('email_type', filters.emailType)
    }

    if (filters?.status) {
      params.append('status', filters.status)
    }

    if (filters?.recipientEmail) {
      params.append('recipient_email', filters.recipientEmail)
    }

    if (filters?.searchQuery) {
      params.append('search', filters.searchQuery)
    }

    return fetchApi(`/v1/presents/events/${eventSlug}/email_history?${params}`, { method: 'GET' })
  },

  /**
   * Get detailed email deliveries
   */
  getDeliveries: async (
    scheduledEmailId: number,
    page = 1,
    perPage = 50,
  ): Promise<{
    scheduled_email: ScheduledEmail
    deliveries: EmailDelivery[]
    meta: PaginationMeta
  }> => {
    return fetchApi(
      `/v1/presents/scheduled_emails/${scheduledEmailId}/deliveries?page=${page}&per_page=${perPage}`,
      { method: 'GET' },
    )
  },

  /**
   * Resend failed emails
   */
  resendEmail: async (
    scheduledEmailId: number,
    deliveryIds?: number[],
  ): Promise<{ message: string; queued_count: number }> => {
    return fetchApi(`/v1/presents/scheduled_emails/${scheduledEmailId}/resend`, {
      method: 'POST',
      body: JSON.stringify({ delivery_ids: deliveryIds }),
    })
  },

  /**
   * Export email history to CSV
   */
  exportHistory: (eventSlug: string, filters?: EmailHistoryFilters): string => {
    const params = new URLSearchParams()

    if (filters?.dateRange) {
      params.append('date_from', filters.dateRange.start)
      params.append('date_to', filters.dateRange.end)
    }

    if (filters?.emailType) {
      params.append('email_type', filters.emailType)
    }

    if (filters?.status) {
      params.append('status', filters.status)
    }

    // Return URL for download
    return `${API_BASE_URL}/v1/presents/events/${eventSlug}/email_history/export?${params}`
  },
}
```

---

## UI/UX Design

### Visual Design

**Color Coding (Status Badges):**

- 🟢 Delivered: Green
- 🔵 Opened: Blue
- 🟡 Sent: Yellow
- 🔴 Failed: Red
- 🟠 Bounced: Orange
- ⚪ Pending: Gray

**Icons:**

- 📧 Email (general)
- ✅ Registration confirmation
- 🔔 Reminder
- 📅 Event update
- ⚠️ Cancellation
- 💳 Payment confirmation

### Responsive Design

- **Desktop (>1024px)**: Full table view with all columns
- **Tablet (768px-1024px)**: Condensed view, hide some columns
- **Mobile (<768px)**: Card-based layout instead of table

### Loading States

- Skeleton loaders for table rows
- Shimmer effect during data fetch
- Progress indicator for bulk actions

### Empty States

- No emails sent yet: "No emails have been sent for this event. Schedule your first email in the Email Automation tab."
- No results from filter: "No emails match your filters. Try adjusting your search criteria."

---

## Implementation Plan

### Phase 1: Backend Setup (Week 1)

- [ ] Create email history API endpoint
- [ ] Add deliveries detail endpoint
- [ ] Implement filtering/pagination
- [ ] Add database indexes
- [ ] Write API tests

### Phase 2: Frontend Core (Week 2)

- [ ] Create EmailHistoryTab component
- [ ] Implement EmailHistoryTable
- [ ] Add EmailHistoryFilters
- [ ] Integrate API with React Query
- [ ] Add pagination

### Phase 3: Detail Views (Week 3)

- [ ] Build EmailDetailModal
- [ ] Build RecipientDetailModal
- [ ] Implement resend functionality
- [ ] Add bulk actions toolbar
- [ ] Error handling and retries

### Phase 4: Polish & Export (Week 4)

- [ ] CSV export functionality
- [ ] Loading/empty states
- [ ] Responsive design
- [ ] Analytics tracking
- [ ] Documentation

### Phase 5: Testing & Deployment

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing
- [ ] Staging deployment
- [ ] Production deployment

---

## Success Metrics

**Adoption:**

- % of producers who visit Email History tab within 7 days of sending first email
- Average time spent in Email History view

**Usage:**

- Number of emails viewed per producer per week
- Filter usage breakdown
- Detail modal open rate
- Export usage frequency

**Impact:**

- Reduction in support tickets about "email not received"
- Producer satisfaction score for email transparency
- Time to identify email delivery issues

**Technical:**

- API response time (<500ms for 50 emails)
- Page load time (<2s)
- Error rate (<0.1%)

---

## Known Limitations & Future Enhancements

### Current Limitations

- Email open tracking requires images enabled (industry standard)
- Click tracking only works for links in email body
- Cannot edit/resend emails with different content (must create new scheduled email)
- Export limited to 10,000 emails per request

### Future Enhancements

- Real-time email status updates via WebSockets
- Email A/B testing analytics
- Automated anomaly detection (sudden spike in bounces)
- Integration with email deliverability tools
- Predictive send time optimization
- Email template performance comparison
- Recipient engagement scoring

---

## Technical Considerations

### Performance

- Lazy load email deliveries (don't fetch all by default)
- Use virtual scrolling for large recipient lists
- Cache email history data for 5 minutes
- Implement request debouncing for filters

### Security

- Verify event ownership before returning email history
- Sanitize email HTML content before rendering
- Rate limit resend operations (max 3 resends per email per hour)
- Mask sensitive recipient data in exports

### Error Handling

- Graceful degradation if SendGrid webhooks fail
- Retry logic for failed API requests
- User-friendly error messages
- Sentry tracking for backend errors

### Accessibility

- Keyboard navigation for table
- Screen reader support
- ARIA labels for status badges
- Focus management in modals

---

## Documentation Needs

- [ ] User guide for Email History feature
- [ ] API documentation for email history endpoints
- [ ] Troubleshooting guide for common email issues
- [ ] Admin guide for monitoring email deliverability
- [ ] Update CLAUDE_CONTEXT.md with new feature

---

## Questions & Decisions

### Open Questions

1. Should we show individual email opens from the same recipient? (Yes/No)
2. Do we need to track forwards/replies? (Future enhancement)
3. Should producers be able to download email attachments? (Not in MVP)
4. How long should we retain email delivery records? (Discuss with Courtney)

### Decisions Made

- ✅ Use existing `email_deliveries` table (no new tables needed)
- ✅ Pagination at 50 emails per page
- ✅ Filter by date range, type, and status
- ✅ Include CSV export from MVP
- ✅ Show aggregate stats (open rate, click rate) in table view
- ✅ Individual recipient detail in modal, not separate page

---

## Related Documentation

- [SCHEDULED_EMAILS_SYSTEM.md](email-system/SCHEDULED_EMAILS_SYSTEM.md) - Email system architecture
- [ERROR_MONITORING_IMPLEMENTATION.md](ERROR_MONITORING_IMPLEMENTATION.md) - Error tracking for emails
- [BACKEND_SENTRY_INTEGRATION.md](BACKEND_SENTRY_INTEGRATION.md) - Backend monitoring

---

**Next Steps:**

1. Review this document with team
2. Finalize API endpoint specifications
3. Create wireframes for UI
4. Begin Phase 1 implementation

**Point of Contact:** Courtney Greer
**Tech Lead:** TBD
**Design Review:** TBD
