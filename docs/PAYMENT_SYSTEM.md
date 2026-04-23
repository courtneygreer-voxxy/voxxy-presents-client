# Frontend Payment System

**Created:** April 23, 2026
**Last Updated:** April 23, 2026
**Status:** Production

---

## Overview

This document describes the frontend implementation of the producer subscription payment system in Voxxy Presents. Producers must have an active paid subscription to create events and use platform features.

**Related Backend Docs:**
- `/voxxy-rails/docs/SUBSCRIPTION_PAYMENT_SYSTEM.md` - Complete backend implementation
- `/voxxy-rails/docs/TIER_SYSTEM_ROADMAP.md` - Future multi-tier plan
- `/voxxy-rails/docs/PAYMENT_SECURITY_FIX.md` - Security implementation details

---

## Payment Flow

### 1. User Signup

```
User fills signup form → role: 'producer'
  ↓
POST /users (creates account + organization)
  ↓
Organization created with:
  - subscription_status: 'inactive'
  - stripe_customer_id: null
  ↓
Verification email sent
  ↓
User redirected to /pending
```

**Component:** `src/pages/SignUpPage.tsx`

---

### 2. Email Verification + Payment

```
User lands on /pending
  ↓
BetaPendingPage shows:
  - Email verification form (if not verified)
  - Payment section (if verified but unpaid)
  ↓
User verifies email
  ↓
User clicks "Start Your Producer Account ($80/mo)"
  ↓
stripeService.redirectToCheckout()
  ↓
POST /api/v1/presents/stripe/create_checkout_session
  ↓
Stripe returns checkout URL
  ↓
User redirected to Stripe hosted checkout
```

**Components:**
- `src/pages/BetaPendingPage.tsx` - Main payment hub
- `src/services/stripeService.ts` - Stripe API client

---

### 3. Stripe Checkout

```
User on Stripe hosted checkout page
  ↓
User enters payment info
  ↓
Stripe processes payment
  ↓
If successful:
  Stripe sends webhook to backend
  Backend updates organization.subscription_status = 'active'
  ↓
Stripe redirects to:
  /payment/success?session_id=xxx
```

**Stripe handles:**
- Payment form UI
- PCI compliance
- 3D Secure authentication
- Payment processing

---

### 4. Success Page

```
User lands on /payment/success
  ↓
PaymentSuccessPage
  ↓
useEffect → refreshUserProfile()
  (fetches updated paid status from backend)
  ↓
Shows success message + countdown
  ↓
Auto-redirects to /dashboard after 3 seconds
```

**Component:** `src/pages/PaymentSuccessPage.tsx`

---

### 5. Dashboard Access

```
User redirected to /dashboard
  ↓
App.tsx routing logic:
  - isEmailVerified? ✓
  - isPaid? ✓
  ↓
All checks passed → Dashboard renders
  ↓
User has full access to platform
```

**Component:** `src/App.tsx` - ProtectedDashboardRoute

---

## File Structure

```
src/
├── pages/
│   ├── BetaPendingPage.tsx          # Email verify + payment hub
│   ├── PaymentOnboardingPage.tsx    # Alternative payment page (legacy)
│   ├── PaymentSuccessPage.tsx       # Post-payment confirmation
│   └── PaymentCanceledPage.tsx      # User canceled checkout
│
├── services/
│   ├── stripeService.ts             # Stripe API client
│   └── api.ts                       # Base API client (includes payment endpoints)
│
├── contexts/
│   └── AuthContext.tsx              # userProfile.paid status
│
└── App.tsx                          # Routing + payment checks
```

---

## Key Components

### BetaPendingPage

**File:** `src/pages/BetaPendingPage.tsx`

**Purpose:** Unified account setup hub for email verification and payment.

**Features:**
- Shows email verification form (if not verified)
- Shows payment section (if verified but unpaid)
- Displays organization details (debugging)
- Shows account status badges
- Delete account option

**Key State:**
```tsx
const isEmailVerified = userProfile?.confirmed_at !== null
const isPaid = userProfile?.paid === true
const needsPayment = isProducer && !isPaid
```

**Payment Section:**
```tsx
{needsPayment && isEmailVerified && (
  <Button onClick={handleStartPayment}>
    Start Your Producer Account ($80/mo)
  </Button>
)}
```

**Payment Handler:**
```tsx
const handleStartPayment = async () => {
  setIsProcessingPayment(true)
  try {
    await stripeService.redirectToCheckout()
    // User will be redirected to Stripe
  } catch (error) {
    setPaymentError('Failed to start payment process')
    setIsProcessingPayment(false)
  }
}
```

---

### PaymentSuccessPage

**File:** `src/pages/PaymentSuccessPage.tsx`

**Purpose:** Post-payment confirmation and redirect.

**Features:**
- Refreshes user profile to get updated `paid` status
- Shows success message and invoice details
- Shows "What's Next" checklist
- Auto-redirects to dashboard after 3 seconds
- Manual "Go to Dashboard Now" button

**Key Logic:**
```tsx
useEffect(() => {
  const refreshProfile = async () => {
    await refreshUserProfile()  // Fetches user.paid = true
    setIsRefreshing(false)
  }
  refreshProfile()
}, [])

useEffect(() => {
  if (isRefreshing) return

  const interval = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        navigate('/dashboard')  // Auto-redirect
        return 0
      }
      return prev - 1
    })
  }, 1000)
}, [isRefreshing])
```

---

### stripeService

**File:** `src/services/stripeService.ts`

**Purpose:** Stripe API client for frontend.

**Methods:**

#### `redirectToCheckout()`

Creates checkout session and redirects to Stripe.

```typescript
async redirectToCheckout(): Promise<void> {
  const response = await api.post('/api/v1/presents/stripe/create_checkout_session')
  const { url } = await response.json()
  window.location.href = url  // Redirect to Stripe
}
```

#### `getSubscriptionStatus()`

Gets current subscription status.

```typescript
async getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const response = await api.get('/api/v1/presents/stripe/subscription_status')
  return await response.json()
}
```

**Response Type:**
```typescript
interface SubscriptionStatus {
  subscribed: boolean
  subscription_active: boolean
  requires_payment: boolean
  status: string  // 'active', 'inactive', 'past_due', 'canceled'
  display_status: string
  current_period_end: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}
```

#### `openBillingPortal()`

Opens Stripe billing portal.

```typescript
async openBillingPortal(): Promise<void> {
  const response = await api.get('/api/v1/presents/stripe/billing_portal')
  const { url } = await response.json()
  window.location.href = url  // Redirect to Stripe
}
```

---

## Routing Logic

### App.tsx - ProtectedDashboardRoute

**File:** `src/App.tsx`

**Payment Checks:**
```tsx
const isProducer = role === 'producer' || role === 'venue_owner'
const isPaid = userProfile.paid === true
const isEmailVerified = userProfile.confirmed_at !== null

// Redirect unpaid producers
if (!isEmailVerified) {
  return <Navigate to="/pending" replace />
}

if (isProducer && !isPaid) {
  return <Navigate to="/pending" replace />
}

// All checks passed
return <Dashboard />
```

**Flow:**
```
User visits /dashboard
  ↓
1. Check authentication (JWT token)
  ↓
2. Check email verification
  ↓
3. Check payment (if producer)
  ↓
4. Render dashboard or redirect to /pending
```

---

## Error Handling

### Backend Returns 402 Payment Required

**When:** Unpaid producer tries to create event/email/contact via API.

**Response:**
```json
{
  "error": "Active subscription required to access this feature",
  "subscription_status": "inactive",
  "upgrade_url": "https://voxxypresents.com/payment/onboarding"
}
```

**Current Handling:**
Frontend doesn't specifically handle 402 yet (payment checks prevent reaching this point).

**Future Improvement:**
```tsx
// src/services/api.ts
if (response.status === 402) {
  const errorData = await response.json()

  // Show upgrade modal
  showUpgradeModal({
    message: errorData.error,
    upgradeUrl: errorData.upgrade_url
  })

  // Or redirect
  window.location.href = errorData.upgrade_url
}
```

---

## User Flows

### Happy Path: New Producer Signup

```
1. User signs up as producer
2. User verifies email (6-digit code)
3. User clicks "Start Your Producer Account"
4. Redirected to Stripe checkout
5. User enters payment info
6. Stripe processes payment
7. Backend webhook activates subscription
8. User redirected to /payment/success
9. User auto-redirected to /dashboard
10. User creates first event
```

**Time to first value:** ~3-5 minutes

---

### Unhappy Path: Payment Failure

```
1. User signs up as producer
2. User verifies email
3. User clicks "Start Your Producer Account"
4. Redirected to Stripe checkout
5. User enters payment info
6. Payment FAILS (declined card)
7. Stripe shows error message
8. User can retry or use different card
9. If user clicks back → returns to /pending
10. Can restart payment flow
```

**Fallback:** User can always restart checkout from /pending page.

---

### Existing User: Subscription Renewal

```
1. User has active subscription
2. Monthly renewal date arrives
3. Stripe auto-charges payment method
4. If successful:
   - Webhook confirms payment
   - subscription_status stays "active"
   - User continues using platform
5. If failed:
   - Stripe retries payment (3-4 attempts)
   - subscription_status → "past_due"
   - User gets read-only access
   - User prompted to update payment method
```

**User Action:** Click "Update Payment Method" → Opens Stripe billing portal

---

## State Management

### Auth Context

**File:** `src/contexts/AuthContext.tsx`

**User Profile:**
```tsx
interface User {
  id: number
  email: string
  name: string
  role: 'venue_owner' | 'vendor' | 'consumer' | 'admin'
  confirmed_at: string | null  // Email verification
  paid: boolean                 // Payment status
  organization_id?: number
}
```

**Key Methods:**
```tsx
const { userProfile, refreshUserProfile } = useAuth()

// After payment, refresh to get updated paid status
await refreshUserProfile()
```

**Payment Checks:**
```tsx
const isEmailVerified = userProfile.confirmed_at !== null
const isPaid = userProfile.paid === true
const needsPayment = userProfile.role === 'venue_owner' && !isPaid
```

---

## Testing

### Manual Testing Checklist

**New Producer Signup:**
- [ ] Sign up as producer
- [ ] Verify email with 6-digit code
- [ ] See payment section on /pending
- [ ] Click "Start Your Producer Account"
- [ ] Redirected to Stripe checkout
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Redirected to /payment/success
- [ ] See success message
- [ ] Auto-redirected to /dashboard
- [ ] Can create events

**Payment Failure:**
- [ ] Sign up as producer
- [ ] Verify email
- [ ] Click payment button
- [ ] Enter declined card: `4000 0000 0000 0002`
- [ ] See Stripe error message
- [ ] Click back to return to /pending
- [ ] Can retry payment

**Subscription Management:**
- [ ] Paid user clicks "Manage Subscription" in settings
- [ ] Redirected to Stripe billing portal
- [ ] Can view invoices
- [ ] Can update payment method
- [ ] Can cancel subscription

---

## Environment Variables

**Frontend:**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Stripe publishable key (not used in current flow)
VITE_API_BASE_URL=http://localhost:3001  # Backend API URL
```

**Note:** Current implementation uses server-side checkout (no Stripe.js on frontend). Publishable key not currently needed but reserved for future use (e.g., embedded checkout, payment method updates).

---

## Future Enhancements

### 1. Handle 402 Errors Gracefully

Add upgrade modal when backend returns 402:

```tsx
// src/components/UpgradeModal.tsx
export function UpgradeModal({ show, error, onClose }) {
  return (
    <Modal open={show} onClose={onClose}>
      <h2>Subscription Required</h2>
      <p>{error.message}</p>
      <p>Current plan: {error.current_plan}</p>
      <Button onClick={() => window.location.href = error.upgrade_url}>
        Upgrade Now
      </Button>
    </Modal>
  )
}
```

### 2. Multi-Tier Pricing Page

When tier system launches:

```tsx
// src/pages/PricingPage.tsx
<PricingTable>
  <PricingTier name="Free" price="$0" />
  <PricingTier name="Basic" price="$49" highlighted />
  <PricingTier name="Pro" price="$99" />
  <PricingTier name="Enterprise" price="Custom" />
</PricingTable>
```

### 3. Usage Dashboard

Show current usage vs. limits:

```tsx
// src/components/UsageDashboard.tsx
<UsageStats>
  <UsageStat
    label="Events Created"
    current={eventsThisYear}
    limit={maxEvents}
    percentage={(eventsThisYear / maxEvents) * 100}
  />
  <UsageStat
    label="Vendor Contacts"
    current={totalContacts}
    limit={maxContacts}
  />
</UsageStats>
```

### 4. In-App Payment Method Update

Use Stripe Elements for updating payment method without leaving app:

```tsx
// Future: src/components/PaymentMethodForm.tsx
import { Elements, CardElement } from '@stripe/react-stripe-js'

<Elements stripe={stripePromise}>
  <CardElement />
  <Button onClick={handleUpdateCard}>
    Update Card
  </Button>
</Elements>
```

---

## Related Documentation

**Backend:**
- `/voxxy-rails/docs/SUBSCRIPTION_PAYMENT_SYSTEM.md` - Complete backend implementation
- `/voxxy-rails/docs/TIER_SYSTEM_ROADMAP.md` - Multi-tier plan
- `/voxxy-rails/docs/PAYMENT_SECURITY_FIX.md` - Security implementation
- `/voxxy-rails/docs/API_REFERENCE.md` - Stripe API endpoints

**Frontend:**
- `src/pages/BetaPendingPage.tsx` - Payment hub implementation
- `src/services/stripeService.ts` - Stripe service code
- `src/contexts/AuthContext.tsx` - Auth state management

---

## Support & Troubleshooting

### Common Issues

**Issue:** User paid but still sees paywall
- **Check:** `userProfile.paid` in React DevTools
- **Fix:** Call `refreshUserProfile()` to refetch from backend
- **Workaround:** Logout and login again

**Issue:** Stripe checkout not opening
- **Check:** Browser console for errors
- **Check:** Network tab for 500 errors from `/create_checkout_session`
- **Fix:** Check backend logs for Stripe API errors

**Issue:** User stuck on /pending after payment
- **Check:** Did webhook fire? Check backend logs
- **Check:** `subscription_status` in database
- **Fix:** Manually trigger webhook from Stripe dashboard

---

**Last Updated:** April 23, 2026
**Next Review:** When implementing tier system
