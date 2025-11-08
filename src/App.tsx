import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { AuthProvider } from './contexts/AuthContext'
import { analytics } from './lib/analytics'
import { RedirectIfAuthenticatedV2 } from './components/auth/ProtectedRouteV2'
import { LoadingTransition } from './components/LoadingTransition'

// Public Pages
import HomePage from './pages/HomePage'
import FeaturesPage from './pages/FeaturesPage'
import PricingPage from './pages/PricingPage'
import HelpPage from './pages/HelpPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'

// Auth Pages
import AuthTypePage from './pages/AuthTypePage'
import ClubOwnerSignUpPage from './pages/ClubOwnerSignUpPage'
import ClubOwnerLoginPage from './pages/ClubOwnerLoginPage'
import VenueOwnerLoginPage from './pages/VenueOwnerLoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import EmailVerificationPage from './pages/EmailVerificationPage'

// Holding Screens
import BetaPendingPage from './pages/BetaPendingPage'
import ProducerPendingPage from './pages/ProducerPendingPage'
import VendorPendingPage from './pages/VendorPendingPage'

// Debug Panel
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

  console.log('RoleBasedDashboardRedirect - User profile:', userProfile)

  if (loading || isRedirecting) {
    return <LoadingTransition message="Taking you to your dashboard..." />
  }

  if (!userProfile) {
    console.log('No user profile, redirecting to home')
    return <Navigate to="/" replace />
  }

  // V3.0: Route to holding screens based on user role
  const role = userProfile.role

  // Producer roles
  if (role === 'producer') {
    console.log('Producer detected, redirecting to producer holding screen')
    return <Navigate to="/producer/pending" replace />
  }

  // Vendor roles
  if (role === 'vendor' || role === 'venue_owner') {
    console.log('Vendor detected, redirecting to vendor holding screen')
    return <Navigate to="/vendor/pending" replace />
  }

  // Consumer/Guest roles
  if (role === 'consumer' || role === 'guest') {
    console.log('Consumer/Guest detected, redirecting to consumer holding screen')
    return <Navigate to="/pending" replace />
  }

  // Admin (for now, treat as producer)
  if (role === 'admin') {
    console.log('Admin detected, redirecting to producer holding screen')
    return <Navigate to="/producer/pending" replace />
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

          {/* Auth Selection */}
          <Route path="/auth" element={
            <RedirectIfAuthenticatedV2>
              <AuthTypePage />
            </RedirectIfAuthenticatedV2>
          } />

          {/* Legacy auth routes - redirect to /auth */}
          <Route path="/sign-up" element={<Navigate to="/auth" replace />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />

          {/* Producer (Club Owner) Auth */}
          <Route path="/signup/producer" element={
            <RedirectIfAuthenticatedV2>
              <ClubOwnerSignUpPage />
            </RedirectIfAuthenticatedV2>
          } />
          <Route path="/login/producer" element={
            <RedirectIfAuthenticatedV2>
              <ClubOwnerLoginPage />
            </RedirectIfAuthenticatedV2>
          } />

          {/* Vendor (Venue Owner) Auth */}
          <Route path="/signup/vendor" element={
            <RedirectIfAuthenticatedV2>
              <ClubOwnerSignUpPage />
            </RedirectIfAuthenticatedV2>
          } />
          <Route path="/login/vendor" element={
            <RedirectIfAuthenticatedV2>
              <VenueOwnerLoginPage />
            </RedirectIfAuthenticatedV2>
          } />

          {/* Legacy role-specific auth routes */}
          <Route path="/signup/club-owner" element={<Navigate to="/signup/producer" replace />} />
          <Route path="/signup/venue-owner" element={<Navigate to="/signup/vendor" replace />} />
          <Route path="/login/club-owner" element={<Navigate to="/login/producer" replace />} />
          <Route path="/login/venue-owner" element={<Navigate to="/login/vendor" replace />} />

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
              HOLDING SCREENS (Role-based)
              ========================================== */}

          {/* Consumer Holding Screen */}
          <Route path="/pending" element={<BetaPendingPage />} />

          {/* Producer Holding Screen */}
          <Route path="/producer/pending" element={<ProducerPendingPage />} />

          {/* Vendor Holding Screen */}
          <Route path="/vendor/pending" element={<VendorPendingPage />} />

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
      </Router>
    </AuthProvider>
  )
}
