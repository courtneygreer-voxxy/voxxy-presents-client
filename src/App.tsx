import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'
import { AuthProvider } from './contexts/AuthContext'
import { analytics } from './lib/analytics'
import { RedirectIfAuthenticatedV2 } from './components/auth/ProtectedRouteV2'
import { AdminRoute } from './components/auth/AdminRoute'
import { LoadingTransition } from './components/LoadingTransition'
import { Toaster } from 'sonner'

// Eager load: Homepage (critical for first paint)
import HomePage from './pages/HomePage'

// Lazy load: Public Pages (load on-demand)
const ArtistLandingPage = lazy(() => import('./pages/ArtistLandingPage'))
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

// Legal hub pages
const TermsOfServicePage = lazy(() => import('./pages/legal/TermsOfServicePage'))
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'))
const AcceptableUsePage = lazy(() => import('./pages/legal/AcceptableUsePage'))
const CookiePolicyPage = lazy(() => import('./pages/legal/CookiePolicyPage'))
const MobileEULAPage = lazy(() => import('./pages/legal/MobileEULAPage'))

// Lazy load: Public Event & Vendor Application Pages (load on-demand)
const PublicEventDetailPage = lazy(() => import('./pages/PublicEventDetailPage'))
const VendorApplicationForm = lazy(() => import('./pages/VendorApplicationForm'))
const ApplicationConfirmationPage = lazy(() => import('./pages/ApplicationConfirmationPage'))
const ApplicationTrackingPage = lazy(() => import('./pages/ApplicationTrackingPage'))
const ShortLinkRedirectPage = lazy(() => import('./pages/ShortLinkRedirectPage'))
const InvitationViewPage = lazy(() => import('./pages/InvitationViewPage'))
const VendorEventPortalPage = lazy(() => import('./pages/VendorEventPortalPage'))
const UnsubscribePage = lazy(() => import('./pages/UnsubscribePage'))

// Lazy load: Auth Pages (load on-demand)
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignUpPage = lazy(() => import('./pages/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))

// Lazy load: Holding Screens (load on-demand)
const BetaPendingPage = lazy(() => import('./pages/BetaPendingPage'))

// Lazy load: Payment Pages (load on-demand)
const PaymentOnboardingPage = lazy(() => import('./pages/PaymentOnboardingPage'))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'))
const PaymentCanceledPage = lazy(() => import('./pages/PaymentCanceledPage'))

// Lazy load: Dashboards (load on-demand)
const Dashboard = lazy(() => import('./pages/Dashboard'))
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'))
const AdminUnsubscribesPage = lazy(() => import('./pages/AdminUnsubscribesPage'))
const AdminBugReportsPage = lazy(() => import('./pages/AdminBugReportsPage'))
// NOTE: Incoming Payments (n8n webhook inbox) is retired for now — payments are
// handled via the Google Sheets sync. The page + /payments route are removed
// from the app; re-add them if the n8n integration is revived.

// Lazy load: Email Template Manager (load on-demand)
const TemplateManager = lazy(() => import('./components/producer/Email/TemplateManager'))

// Debug Panel (keep eager for development)
import { DebugPanel } from './components/debug/DebugPanel'

// Protected Dashboard - ensures user is verified and paid before showing dashboard
function ProtectedDashboard() {
  const { userProfile, loading, isAdmin, isProducer, isEmailVerified, isPaid } = useAuth()

  if (loading) {
    return <LoadingTransition message="Loading your dashboard..." />
  }

  if (!userProfile) {
    console.log('🔒 No user profile, redirecting to home')
    return <Navigate to="/" replace />
  }

  // Admins always have access
  if (isAdmin) {
    console.log('🟣 Admin accessing dashboard')
    return <Dashboard />
  }

  // Check email verification for non-admins
  if (!isEmailVerified) {
    console.log('🔒 Email not verified, redirecting to pending')
    return <Navigate to="/pending" replace />
  }

  // Check payment for producers (V4.0: now checks subscription_active from organization)
  if (isProducer && !isPaid) {
    console.log('🔒 Producer without active subscription, redirecting to pending')
    console.log('   - Subscription Active:', userProfile.subscription_active)
    console.log('   - Subscription Status:', userProfile.subscription_status)
    return <Navigate to="/pending" replace />
  }

  // All checks passed, render dashboard
  console.log('✅ All checks passed, rendering dashboard')
  return <Dashboard />
}

// Role-based redirect component - routes authenticated users to their holding screen
function RoleBasedDashboardRedirect() {
  const { userProfile, loading, isAdmin, isProducer, isEmailVerified, isPaid } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(true)

  // Show loading state for minimum 300ms to avoid flash
  useEffect(() => {
    const timer = setTimeout(() => setIsRedirecting(false), 300)
    return () => clearTimeout(timer)
  }, [])

  console.log('🔀 RoleBasedDashboardRedirect - User profile:', userProfile)
  console.log('🔀 RoleBasedDashboardRedirect - Role:', userProfile?.role)
  console.log('🔀 RoleBasedDashboardRedirect - Product Context:', userProfile?.product_context)
  console.log('🔀 RoleBasedDashboardRedirect - Loading:', loading, 'Redirecting:', isRedirecting)

  if (loading || isRedirecting) {
    return <LoadingTransition message="Taking you to your dashboard..." />
  }

  if (!userProfile) {
    console.log('🔀 No user profile, redirecting to home')
    return <Navigate to="/" replace />
  }

  // V4.0: Check product_context to filter legacy users
  const role = userProfile.role
  const productContext = userProfile.product_context
  const hasPresentsAccess = productContext === 'presents' || productContext === 'both'

  // Email verification OR Payment check for producers (admins bypass these checks)
  // Redirect to pending page which serves as account setup hub
  if (!isAdmin) {
    if (!isEmailVerified) {
      console.log('📧 Email not verified, redirecting to pending page')
      console.log('   - Email:', userProfile.email, 'Confirmed At:', userProfile.confirmed_at)
      return <Navigate to="/pending" replace />
    }
    // V4.0: Check subscription_active instead of legacy paid field
    if (isProducer && !isPaid) {
      console.log('💳 Producer without active subscription, redirecting to payment onboarding')
      console.log('   - Role:', role)
      console.log('   - Subscription Active:', userProfile.subscription_active)
      console.log('   - Subscription Status:', userProfile.subscription_status)
      return <Navigate to="/payment/onboarding" replace />
    }
  }

  // Legacy users (no Presents access) OR consumers/guests → Pending page
  if (!hasPresentsAccess || role === 'consumer' || role === 'guest') {
    console.log('🔒 No Presents access or consumer/guest role, redirecting to pending page')
    console.log('   - Role:', role, 'Product Context:', productContext)
    return <Navigate to="/pending" replace />
  }

  // Users with Presents access - route by role
  // Producer roles (venue_owner = Producer in UI)
  if (isProducer) {
    console.log('🟢 Producer with Presents access, redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  // Vendor roles
  if (role === 'vendor') {
    console.log('🔵 Vendor with Presents access, redirecting to vendor pending')
    return <Navigate to="/vendor/pending" replace />
  }

  // Admin - route to unified dashboard
  if (role === 'admin') {
    console.log('🟣 Admin detected, redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  // Unknown role - redirect to home
  console.log('⚠️ Unknown role, redirecting to home')
  return <Navigate to="/" replace />
}

export default function App() {
  // Initialize analytics on app start
  useEffect(() => {
    analytics.initializeUser()
  }, [])

  return (
    <AuthProvider>
      <Router>
        {/* Toast Notifications - Auto-dismiss after 3 seconds */}
        <Toaster position="top-right" duration={3000} closeButton richColors theme="system" />

        {/* Debug Panel - Shows on all pages in development */}
        <DebugPanel />

        <Suspense fallback={<LoadingTransition />}>
          <Routes>
            {/* ==========================================
              PUBLIC ROUTES
              ========================================== */}
            <Route path="/" element={<HomePage />} />
            <Route path="/artists" element={<ArtistLandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/contact" element={<Navigate to="/#contact" replace />} />
            <Route path="/about" element={<AboutPage />} />

            {/* New Legal Hub Routes */}
            <Route path="/legal/terms" element={<TermsOfServicePage />} />
            <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/legal/acceptable-use" element={<AcceptableUsePage />} />
            <Route path="/legal/cookies" element={<CookiePolicyPage />} />
            <Route path="/legal/mobile" element={<MobileEULAPage />} />

            {/* Legacy redirects to new legal pages */}
            <Route path="/privacy" element={<Navigate to="/legal/privacy" replace />} />
            <Route path="/terms" element={<Navigate to="/legal/terms" replace />} />

            {/* Public Event & Vendor Application Routes */}
            {/* Supports both new namespaced format (/org-slug-id/event-slug-id) and legacy (/event-slug) */}
            {/* Note: More specific routes must come BEFORE wildcard routes */}
            <Route path="/events/:slug/apply/:applicationId" element={<VendorApplicationForm />} />
            <Route path="/events/*" element={<PublicEventDetailPage />} />
            <Route path="/applications/success" element={<ApplicationConfirmationPage />} />
            <Route path="/applications/track/:ticketCode" element={<ApplicationTrackingPage />} />
            <Route path="/apply/:code" element={<ShortLinkRedirectPage />} />

            {/* Public Invitation View Route */}
            <Route path="/invitations/:token" element={<InvitationViewPage />} />

            {/* Vendor Event Portal Routes - Supports namespaced format and legacy formats */}
            <Route path="/portal/*" element={<VendorEventPortalPage />} />

            {/* Unsubscribe Route (public - token-based) */}
            <Route path="/unsubscribe/:token" element={<UnsubscribePage />} />

            {/* ==========================================
              AUTH ROUTES - Redirect if already logged in
              ========================================== */}

            {/* Unified Login Page */}
            <Route
              path="/login"
              element={
                <RedirectIfAuthenticatedV2>
                  <LoginPage />
                </RedirectIfAuthenticatedV2>
              }
            />

            {/* Unified Sign Up Page */}
            <Route
              path="/signup"
              element={
                <RedirectIfAuthenticatedV2>
                  <SignUpPage />
                </RedirectIfAuthenticatedV2>
              }
            />

            {/* Legacy signup routes - redirect to unified signup */}
            <Route path="/auth" element={<Navigate to="/signup" replace />} />
            <Route path="/sign-up" element={<Navigate to="/signup" replace />} />
            <Route path="/signup/producer" element={<Navigate to="/signup" replace />} />
            <Route path="/signup/vendor" element={<Navigate to="/signup" replace />} />
            <Route path="/signup/club-owner" element={<Navigate to="/signup" replace />} />
            <Route path="/signup/venue-owner" element={<Navigate to="/signup" replace />} />

            {/* Legacy login routes - redirect to unified login */}
            <Route path="/login/producer" element={<Navigate to="/login" replace />} />
            <Route path="/login/vendor" element={<Navigate to="/login" replace />} />
            <Route path="/login/club-owner" element={<Navigate to="/login" replace />} />
            <Route path="/login/venue-owner" element={<Navigate to="/login" replace />} />

            {/* Password Reset */}
            <Route
              path="/forgot-password"
              element={
                <RedirectIfAuthenticatedV2>
                  <ForgotPasswordPage />
                </RedirectIfAuthenticatedV2>
              }
            />
            <Route
              path="/reset-password"
              element={
                <RedirectIfAuthenticatedV2>
                  <ResetPasswordPage />
                </RedirectIfAuthenticatedV2>
              }
            />

            {/* Email Verification - Redirect to pending page (consolidated account setup hub) */}
            <Route path="/verify-email" element={<Navigate to="/pending" replace />} />

            {/* ==========================================
              DASHBOARDS & HOLDING SCREENS (Role-based)
              ========================================== */}

            {/* Unified Account Setup Hub - Email verification & payment request */}
            <Route path="/pending" element={<BetaPendingPage />} />

            {/* Payment Flow */}
            <Route path="/payment/onboarding" element={<PaymentOnboardingPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/canceled" element={<PaymentCanceledPage />} />

            {/* Legacy producer route - redirect to unified dashboard */}
            <Route path="/producer/pending" element={<Navigate to="/dashboard" replace />} />

            {/* Email Template Manager */}
            <Route path="/producer/templates" element={<TemplateManager />} />

            {/* Vendor Dashboard */}
            <Route path="/vendor/pending" element={<VendorDashboard />} />

            {/* Legacy admin dashboard route - redirect to unified dashboard */}
            <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />

            {/* Admin Unsubscribes - Protected */}
            <Route
              path="/admin/unsubscribes"
              element={
                <AdminRoute>
                  <AdminUnsubscribesPage />
                </AdminRoute>
              }
            />

            {/* Admin Bug Reports - Protected */}
            <Route
              path="/admin/bug-reports"
              element={
                <AdminRoute>
                  <AdminBugReportsPage />
                </AdminRoute>
              }
            />

            {/* ==========================================
              CATCH-ALL & REDIRECTS
              ========================================== */}

            {/* Legacy /profile route - redirect to role-based holding screen */}
            <Route path="/profile" element={<RoleBasedDashboardRedirect />} />

            {/* Unified Dashboard - Protected (verified + paid producers/admins only) */}
            <Route path="/dashboard" element={<ProtectedDashboard />} />

            {/* 404 - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}
