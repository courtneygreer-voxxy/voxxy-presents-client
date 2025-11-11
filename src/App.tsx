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
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'))

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
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />

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

          {/* Vendor Dashboard */}
          <Route path="/vendor/pending" element={<VendorDashboard />} />

          {/* Admin Dashboard - Protected */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
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
