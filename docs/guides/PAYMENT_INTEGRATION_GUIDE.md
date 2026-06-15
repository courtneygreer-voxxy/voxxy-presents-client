# Eventbrite Payment Sync Integration Guide

This guide explains how to integrate the payment sync components into your existing frontend pages.

## Components Created

### 1. **EventbriteConnection** (`src/components/producer/PaymentIntegrations/EventbriteConnection.tsx`)

- Organization-level Eventbrite API connection
- Connect/disconnect Eventbrite account
- Shows connection status and date

### 2. **EventPaymentSettings** (`src/components/producer/PaymentIntegrations/EventPaymentSettings.tsx`)

- Event-level payment integration configuration
- Two input methods: URL paste or dropdown selection
- Auto-sync and auto-update toggles
- Manual sync button with results
- Enable/disable integration

### 3. **PaymentTransactionsList** (`src/components/producer/PaymentIntegrations/PaymentTransactionsList.tsx`)

- View all payment transactions for an event
- Filter by status (paid, pending, refunded, cancelled)
- Filter by match status (matched, unmatched)
- Search by email, name, or transaction ID
- Summary statistics

### 4. **PaymentSettingsTab** (`src/components/producer/PaymentIntegrations/PaymentSettingsTab.tsx`)

- Tab wrapper combining EventPaymentSettings and PaymentTransactionsList
- Easy drop-in for event dashboard

## How to Integrate

### Option 1: Add to EventSettings Page (Recommended)

Update `src/components/producer/EventSettings.tsx`:

```tsx
import { PaymentSettingsTab } from './PaymentIntegrations'

// Add 'payments' to the View type
type View = 'settings' | 'create_app' | 'edit_app' | 'payments'

// Add payment tab button to your tab navigation
;<button onClick={() => setCurrentView('payments')} className={/* your tab styles */}>
  <DollarSign className="w-4 h-4" />
  Payments
</button>

// Add render condition in your component body
{
  currentView === 'payments' && (
    <PaymentSettingsTab eventSlug={event.slug} organizationId={/* your organization ID */} />
  )
}
```

### Option 2: Add to SettingsPage (Organization Level)

Update `src/pages/SettingsPage.tsx` to include the Eventbrite connection:

```tsx
import { EventbriteConnection } from '@/components/producer/PaymentIntegrations'

// In your settings sections, add:
;<div className="space-y-6">
  <h2 className="text-xl font-bold">Integrations</h2>

  {organization && (
    <EventbriteConnection
      organizationId={organization.id}
      onConnectionChange={(connected) => {
        console.log('Eventbrite connected:', connected)
      }}
    />
  )}
</div>
```

### Option 3: Standalone Pages

You can also create dedicated pages for payment management:

```tsx
// src/pages/PaymentIntegrationsPage.tsx
import { EventbriteConnection } from '@/components/producer/PaymentIntegrations'

export default function PaymentIntegrationsPage() {
  // ... your code
  return (
    <div>
      <EventbriteConnection organizationId={orgId} />
    </div>
  )
}
```

## Required Props

### EventbriteConnection

```tsx
interface EventbriteConnectionProps {
  organizationId: number // Required
  onConnectionChange?: (connected: boolean) => void // Optional callback
}
```

### PaymentSettingsTab

```tsx
interface PaymentSettingsTabProps {
  eventSlug: string // Required - event slug
  organizationId: number // Required - for checking Eventbrite connection
}
```

### EventPaymentSettings

```tsx
interface EventPaymentSettingsProps {
  eventSlug: string // Required
  organizationId: number // Required
  onIntegrationChange?: (integration: PaymentIntegration | null) => void // Optional
}
```

### PaymentTransactionsList

```tsx
interface PaymentTransactionsListProps {
  eventSlug: string // Required
  onTransactionUpdate?: () => void // Optional callback
}
```

## API Configuration

The components automatically use your existing API configuration from `src/services/api.ts`:

- Base URL: `getApiUrl()` or `VITE_API_BASE_URL` or defaults to `http://localhost:3001/api`
- Auth Token: Uses `getAuthToken()` from existing auth system
- All endpoints are under `/api/v1/presents/`

## Testing Locally

### 1. Backend Setup (Already Done!)

- Backend is deployed to staging
- Migrations have been run
- Test data exists (1 transaction synced)

### 2. Frontend Setup

```bash
cd /Users/courtneygreer/Development/voxxy-presents-client
npm install  # If needed
npm run dev  # Start dev server
```

### 3. Environment Variables

Make sure your `.env.local` or `.env` file has:

```
VITE_API_BASE_URL=https://your-staging-backend.com/api
```

Or configure it to point to staging backend.

### 4. Test Flow

1. **Connect Eventbrite (Organization Level)**
   - Go to Settings page
   - Use API token: `2TA23N55S35ZBJ6M5BNW`
   - Click "Connect Eventbrite"

2. **Enable Payment Sync (Event Level)**
   - Go to Event Settings > Payments tab
   - Paste Eventbrite URL: `https://www.eventbrite.com/myevent?eid=1981459683252`
   - Or select from dropdown
   - Enable auto-sync and auto-update
   - Click "Enable Payment Syncing"

3. **Sync Payments**
   - Click "Sync Now" button
   - Should see: "Fetched 1 transactions, matched 1 vendors"

4. **View Transactions**
   - Switch to "Transactions" tab
   - Should see 1 transaction for greerlcourtney@gmail.com
   - Status: Paid
   - Matched: Yes (Courtney Greer)

## API Endpoints Used

### Organization Integration

- `POST /api/v1/presents/organizations/:id/integrations/eventbrite/connect`
- `DELETE /api/v1/presents/organizations/:id/integrations/eventbrite/disconnect`
- `GET /api/v1/presents/organizations/:id/integrations/eventbrite/status`
- `GET /api/v1/presents/organizations/:id/integrations/eventbrite/events`

### Event Payment Integration

- `GET /api/v1/presents/events/:slug/payment_integrations`
- `POST /api/v1/presents/events/:slug/payment_integrations`
- `PATCH /api/v1/presents/events/:slug/payment_integrations/:id`
- `DELETE /api/v1/presents/events/:slug/payment_integrations/:id`
- `POST /api/v1/presents/events/:slug/payment_integrations/:id/sync`

### Payment Transactions

- `GET /api/v1/presents/events/:slug/payment_transactions`
- `GET /api/v1/presents/events/:slug/payment_transactions/:id`
- `PATCH /api/v1/presents/events/:slug/payment_transactions/:id/match`

## Troubleshooting

### "Eventbrite Not Connected" Warning

- Ensure you've connected Eventbrite at the organization level first
- Check organization ID is correct

### API Errors

- Check browser console for detailed error messages
- Verify auth token is present: `localStorage.getItem('railsAuthToken')`
- Verify backend URL is correct and staging backend is accessible

### No Events in Dropdown

- Eventbrite account may have no events
- Use URL paste method instead

### Transactions Not Syncing

- Check sync logs in backend: `rails console > PaymentSyncLog.last`
- Verify Eventbrite event ID is correct
- Check auto-sync is enabled

## Next Steps

1. Add payment tab to EventSettings page
2. Add Eventbrite connection to SettingsPage
3. Test locally against staging backend
4. Style adjustments to match your theme (currently uses Tailwind classes)
5. Add loading states if needed
6. Add error handling for edge cases

## Files Created

```
src/
├── components/producer/PaymentIntegrations/
│   ├── EventbriteConnection.tsx        (Organization connection UI)
│   ├── EventPaymentSettings.tsx        (Event integration config)
│   ├── PaymentTransactionsList.tsx     (Transaction viewer)
│   ├── PaymentSettingsTab.tsx          (Tab wrapper)
│   └── index.ts                        (Exports)
├── services/
│   └── paymentApi.ts                   (API client)
└── types/
    └── payment.ts                      (TypeScript types)
```

## Support

For questions or issues:

1. Check browser console for errors
2. Check backend logs: `heroku logs --tail` (if on Heroku)
3. Test API endpoints directly with curl/Postman
4. Review `EVENTBRITE_INTEGRATION_STATUS.md` in backend repo
