import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'
import { AuthProvider } from './contexts/AuthContext'
import { analytics } from './lib/analytics'
import { RedirectIfAuthenticatedV2 } from './components/auth/ProtectedRouteV2'
import { AdminRoute } from './components/auth/AdminRoute'
import { LoadingTransition } from './components/LoadingTransition'

// Eager load: Homepage (critical for first paint)
import HomePage from './pages/HomePage'

// Lazy load: Public Pages (load on-demand)
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
// Old legal pages (deprecated, kept for potential legacy references)
const OldPrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const OldTermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'))

// New legal hub pages
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
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const EmailVerificationPage = lazy(() => import('./pages/EmailVerificationPage'))

// Lazy load: Holding Screens (load on-demand)
const BetaPendingPage = lazy(() => import('./pages/BetaPendingPage'))

// Lazy load: Dashboards (load on-demand)
const ProducerDashboard = lazy(() => import('./pages/ProducerDashboard'))
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminUnsubscribesPage = lazy(() => import('./pages/AdminUnsubscribesPage'))
const AdminBugReportsPage = lazy(() => import('./pages/AdminBugReportsPage'))

// Lazy load: Email Template Manager (load on-demand)
const TemplateManager = lazy(() => import('./components/producer/Email/TemplateManager'))

// Debug Panel (keep eager for development)
import { DebugPanel } from './components/debug/DebugPanel'

// Role-based redirect component - routes authenticated users to their holding screen
function RoleBasedDashboardRedirect() {
  const { userProfile, loading } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(true)

  // Show loading state for minimum 300ms to avoid flash
  useEffect(() => {
    const timer = setTimeout(() => setIsRedirecting(false), 300)
    return () => clearTimeout(timer)
  }, [])

  console.log('🔀 RoleBasedDashboardRedirect - User profile:', userProfile)
  console.log('🔀 RoleBasedDashboardRedirect - Role:', userProfile?.role)
  console.log('🔀 RoleBasedDashboardRedirect - Loading:', loading, 'Redirecting:', isRedirecting)

  if (loading || isRedirecting) {
    return <LoadingTransition message="Taking you to your dashboard..." />
  }

  if (!userProfile) {
    console.log('🔀 No user profile, redirecting to home')
    return <Navigate to="/" replace />
  }

  // V3.0: Route to holding screens based on user role
  const role = userProfile.role

  // Producer roles (venue_owner = Producer in UI)
  if (role === 'producer' || role === 'venue_owner') {
    console.log('🟢 Producer detected (role:', role, '), redirecting to producer holding screen')
    return <Navigate to="/producer/pending" replace />
  }

  // Vendor roles
  if (role === 'vendor') {
    console.log('🔵 Vendor detected, redirecting to vendor holding screen')
    return <Navigate to="/vendor/pending" replace />
  }

  // Consumer/Guest roles
  if (role === 'consumer' || role === 'guest') {
    console.log('🟣 Consumer/Guest detected (role:', role, '), redirecting to consumer holding screen')
    return <Navigate to="/pending" replace />
  }

  // Admin - route to admin dashboard
  if (role === 'admin') {
    console.log('🟣 Admin detected, redirecting to admin dashboard')
    return <Navigate to="/admin/dashboard" replace />
  }

  // Unknown role - redirect to home
  console.log('Unknown role, redirecting to home')
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
        {/* Debug Panel - Shows on all pages in development */}
        <DebugPanel />

        <Suspense fallback={<LoadingTransition />}>
          <Routes>
          {/* ==========================================
              PUBLIC ROUTES
              ========================================== */}
          <Route path="/" element={<HomePage />} />
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
          <Route path="/events/*/apply/*" element={<VendorApplicationForm />} />
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
          <Route path="/login" element={
            <RedirectIfAuthenticatedV2>
              <LoginPage />
            </RedirectIfAuthenticatedV2>
          } />

          {/* All signup routes redirect to contact page for beta access requests */}
          <Route path="/auth" element={<Navigate to="/contact" replace />} />
          <Route path="/sign-up" element={<Navigate to="/contact" replace />} />
          <Route path="/signup" element={<Navigate to="/contact" replace />} />
          <Route path="/signup/producer" element={<Navigate to="/contact" replace />} />
          <Route path="/signup/vendor" element={<Navigate to="/contact" replace />} />
          <Route path="/signup/club-owner" element={<Navigate to="/contact" replace />} />
          <Route path="/signup/venue-owner" element={<Navigate to="/contact" replace />} />

          {/* Legacy login routes - redirect to unified login */}
          <Route path="/login/producer" element={<Navigate to="/login" replace />} />
          <Route path="/login/vendor" element={<Navigate to="/login" replace />} />
          <Route path="/login/club-owner" element={<Navigate to="/login" replace />} />
          <Route path="/login/venue-owner" element={<Navigate to="/login" replace />} />

          {/* Password Reset */}
          <Route path="/forgot-password" element={
            <RedirectIfAuthenticatedV2>
              <ForgotPasswordPage />
            </RedirectIfAuthenticatedV2>
          } />
          <Route path="/reset-password" element={
            <RedirectIfAuthenticatedV2>
              <ResetPasswordPage />
            </RedirectIfAuthenticatedV2>
          } />

          {/* Email Verification */}
          <Route path="/verify-email" element={<EmailVerificationPage />} />

          {/* ==========================================
              DASHBOARDS & HOLDING SCREENS (Role-based)
              ========================================== */}

          {/* Consumer Holding Screen */}
          <Route path="/pending" element={<BetaPendingPage />} />

          {/* Producer Dashboard */}
          <Route path="/producer/pending" element={<ProducerDashboard />} />

          {/* Email Template Manager */}
          <Route path="/producer/templates" element={<TemplateManager />} />

          {/* Vendor Dashboard */}
          <Route path="/vendor/pending" element={<VendorDashboard />} />

          {/* Admin Dashboard - Protected */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Admin Unsubscribes - Protected */}
          <Route path="/admin/unsubscribes" element={
            <AdminRoute>
              <AdminUnsubscribesPage />
            </AdminRoute>
          } />

          {/* Admin Bug Reports - Protected */}
          <Route path="/admin/bug-reports" element={
            <AdminRoute>
              <AdminBugReportsPage />
            </AdminRoute>
          } />

          {/* ==========================================
              CATCH-ALL & REDIRECTS
              ========================================== */}

          {/* Legacy /profile route - redirect to role-based holding screen */}
          <Route path="/profile" element={<RoleBasedDashboardRedirect />} />

          {/* Any authenticated user accessing root is redirected */}
          <Route path="/dashboard" element={<RoleBasedDashboardRedirect />} />

          {/* 404 - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}
