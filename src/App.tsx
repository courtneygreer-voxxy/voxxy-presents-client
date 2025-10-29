import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { AuthProvider } from './contexts/AuthContext'
import { analytics } from './lib/analytics'
// Performance tracking removed - was cluttering Mixpanel with technical metrics
// import { initPerformanceTracking } from './utils/performanceTracking'
import { ProtectedRoute, RedirectIfAuthenticated } from './components/ProtectedRoute'
import { LoadingTransition } from './components/LoadingTransition'
// V2 Architecture imports
import ProtectedRouteV2, { RedirectIfAuthenticatedV2 } from './components/auth/ProtectedRouteV2'
import { OrganizerDashboard, VenueOwnerDashboard, AdminDashboard as AdminDashboardV2, GuestDashboard } from './components/dashboard/DashboardShell'
import VenueOwnerDashboardNew from './pages/VenueOwnerDashboardNew'
import ProfilePage from './pages/ProfilePage'
import HomePage from './pages/HomePage'
import BetaPendingPage from './pages/BetaPendingPage'
import OrganizationPublic from './pages/OrganizationPublic'
import OrganizationAdminEnhanced from './pages/OrganizationAdminEnhanced'
import AdminDashboard from './pages/AdminDashboard'
import CreateClubPage from './pages/CreateClubPage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import AuthTypePage from './pages/AuthTypePage'
import ClubOwnerSignUpPage from './pages/ClubOwnerSignUpPage'
import VendorSignUpPage from './pages/VenueOwnerSignUpPage'
import ClubOwnerLoginPage from './pages/ClubOwnerLoginPage'
import VenueOwnerLoginPage from './pages/VenueOwnerLoginPage'
import PricingPage from './pages/PricingPage'
import FeaturesPage from './pages/FeaturesPage'
import HelpPage from './pages/HelpPage'
import ContactPage from './pages/ContactPage'
import AdminLogin from './pages/AdminLogin'
import VoxxyShop from './pages/VoxxyShop'
import VenueProfilePage from './pages/VenueProfilePage'
import VenueSearchPortal from './pages/VenueSearchPortal'
// New vendor pages (backward compatible)
import VendorProfilePage from './pages/VendorProfilePage'
import VendorMarketplace from './pages/VendorMarketplace'
import VenueCreatePage from './pages/VenueCreatePage'
import VenuePendingApprovalPage from './pages/VenuePendingApprovalPage'
import VenueOwnerBenefitsPage from './pages/VenueOwnerBenefitsPage'
import CreateEventPage from './pages/CreateEventPage'
import EditEventPage from './pages/EditEventPage'
import SharedRSVPPage from './pages/SharedRSVPPage'
import SubscribePage from './pages/SubscribePage'
import AnalyticsTestPage from './pages/AnalyticsTestPage'
import { DebugPanel } from './components/debug/DebugPanel'

// Role-based dashboard redirect component
function RoleBasedDashboardRedirect() {
  const { userProfile } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(true)

  // Show loading state for minimum 300ms to avoid flash
  useEffect(() => {
    const timer = setTimeout(() => setIsRedirecting(false), 300)
    return () => clearTimeout(timer)
  }, [])

  console.log('RoleBasedDashboardRedirect - User profile:', userProfile)

  if (!userProfile) {
    console.log('No user profile, redirecting to home')
    return <Navigate to="/" replace />
  }

  // Show loading transition during redirect evaluation
  if (isRedirecting) {
    return <LoadingTransition message="Taking you to your dashboard..." />
  }

  // V3.0: Route based on user role (supports both old and new roles)
  switch (userProfile.role) {
    // NEW V3.0 roles
    case 'producer':
      console.log('Producer detected, redirecting to producer dashboard')
      return <Navigate to="/producer/dashboard" replace />

    case 'vendor':
      console.log('Vendor detected, redirecting to vendor dashboard')
      return <Navigate to="/vendor/dashboard" replace />

    // LEGACY roles (still supported during migration)
    case 'venue_owner':
      console.log('Venue owner (legacy) detected, redirecting to vendor dashboard')
      return <Navigate to="/vendor/dashboard" replace />

    case 'organizer':
    case 'club_owner':
      console.log('Organizer/Club owner (legacy) detected, redirecting to producer dashboard')
      return <Navigate to="/producer/dashboard" replace />

    case 'admin':
      console.log('Admin detected, redirecting to admin dashboard')
      return <Navigate to="/admin/dashboard" replace />

    case 'guest':
    case 'user':
    default:
      console.log('Guest/User or unknown role, redirecting to home')
      return <Navigate to="/" replace />
  }
}

export default function App() {
  // Initialize analytics on app start
  useEffect(() => {
    analytics.initializeUser();
    // Performance tracking disabled in production (was cluttering Mixpanel reports)
  }, []);

  return (
    <AuthProvider>
      <Router>
        {/* Debug Panel - Shows on all pages in development */}
        <DebugPanel />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/venue-owners" element={<VenueOwnerBenefitsPage />} />
          <Route path="/analytics-test" element={<AnalyticsTestPage />} />

          {/* Vendor routes (new) */}
          <Route path="/vendor/:slug" element={<VendorProfilePage />} />
          <Route path="/marketplace" element={<VendorMarketplace />} />

          {/* Legacy venue routes (backward compatible) */}
          <Route path="/venue/:venueSlug" element={<VenueProfilePage />} />

          <Route path="/shared-rsvps/:eventId" element={<SharedRSVPPage />} />
          <Route path="/subscribe/:orgSlug" element={<SubscribePage />} />
          <Route path="/:orgSlug" element={<OrganizationPublic />} />
          
          {/* Authentication routes - redirect if already logged in */}
          <Route path="/auth" element={
            <RedirectIfAuthenticatedV2>
              <AuthTypePage />
            </RedirectIfAuthenticatedV2>
          } />

          {/* Legacy routes - redirect to auth selection */}
          <Route path="/sign-up" element={
            <RedirectIfAuthenticatedV2 redirectTo="/auth">
              <AuthTypePage />
            </RedirectIfAuthenticatedV2>
          } />
          <Route path="/login" element={
            <RedirectIfAuthenticatedV2 redirectTo="/auth">
              <AuthTypePage />
            </RedirectIfAuthenticatedV2>
          } />

          {/* V3.0: Specific user type authentication routes */}
          {/* NEW V3.0 routes */}
          <Route path="/signup/producer" element={
            <RedirectIfAuthenticatedV2>
              <ClubOwnerSignUpPage />
            </RedirectIfAuthenticatedV2>
          } />
          <Route path="/signup/vendor" element={
            <RedirectIfAuthenticatedV2>
              <VendorSignUpPage />
            </RedirectIfAuthenticatedV2>
          } />
          <Route path="/login/producer" element={
            <RedirectIfAuthenticatedV2>
              <ClubOwnerLoginPage />
            </RedirectIfAuthenticatedV2>
          } />
          <Route path="/login/vendor" element={
            <RedirectIfAuthenticatedV2>
              <VenueOwnerLoginPage />
            </RedirectIfAuthenticatedV2>
          } />

          {/* LEGACY routes (redirect to new V3.0 routes) */}
          <Route path="/signup/club-owner" element={<Navigate to="/signup/producer" replace />} />
          <Route path="/signup/venue-owner" element={<Navigate to="/signup/vendor" replace />} />
          <Route path="/login/club-owner" element={<Navigate to="/login/producer" replace />} />
          <Route path="/login/venue-owner" element={<Navigate to="/login/vendor" replace />} />

          {/* Beta pending page */}
          <Route path="/beta-pending" element={<BetaPendingPage />} />

          {/* Protected routes - require authentication */}
          <Route path="/voxxy-shop" element={
            <ProtectedRoute>
              <VoxxyShop />
            </ProtectedRoute>
          } />
          <Route path="/voxxy-shop/venues" element={
            <ProtectedRoute>
              <VenueSearchPortal />
            </ProtectedRoute>
          } />
          {/* Legacy venue routes - redirect to V2 paths */}
          <Route path="/venues/create" element={
            <ProtectedRouteV2 requireEmailVerification={true} allowedRoles={['venue_owner', 'admin']}>
              <VenueCreatePage />
            </ProtectedRouteV2>
          } />
          <Route path="/venues/pending" element={
            <ProtectedRouteV2 requireEmailVerification={true} allowedRoles={['venue_owner', 'admin']}>
              <VenuePendingApprovalPage />
            </ProtectedRouteV2>
          } />
          <Route path="/venues/dashboard" element={
            <Navigate to="/venue-owner/dashboard" replace />
          } />
          <Route path="/create-club" element={
            <ProtectedRoute requireEmailVerification={true}>
              <CreateClubPage />
            </ProtectedRoute>
          } />
          <Route path="/:orgSlug/admin" element={
            <ProtectedRoute>
              <OrganizationAdminEnhanced />
            </ProtectedRoute>
          } />
          <Route path="/:orgSlug/create-event" element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          } />
          <Route path="/:orgSlug/edit-event/:eventId" element={
            <ProtectedRoute>
              <EditEventPage />
            </ProtectedRoute>
          } />
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* ========================================
              V3.0 PRODUCER ROUTES (NEW)
              ======================================== */}
          <Route path="/producer/dashboard" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['producer', 'organizer', 'club_owner', 'admin']}>
              <ProfilePage />
            </ProtectedRouteV2>
          } />
          <Route path="/producer/organizations" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['producer', 'organizer', 'club_owner', 'admin']}>
              <ProfilePage />
            </ProtectedRouteV2>
          } />
          <Route path="/producer/events" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['producer', 'organizer', 'club_owner', 'admin']}>
              <ProfilePage />
            </ProtectedRouteV2>
          } />
          <Route path="/producer/audience" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['producer', 'organizer', 'club_owner', 'admin']}>
              <ProfilePage />
            </ProtectedRouteV2>
          } />

          {/* ========================================
              V3.0 VENDOR ROUTES (NEW)
              ======================================== */}
          <Route path="/vendor/dashboard" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['vendor', 'venue_owner', 'admin']} requireEmailVerification={true}>
              <VenueOwnerDashboardNew />
            </ProtectedRouteV2>
          } />
          <Route path="/vendor/vendors" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['vendor', 'venue_owner', 'admin']} requireEmailVerification={true}>
              <VenueOwnerDashboardNew />
            </ProtectedRouteV2>
          } />
          <Route path="/vendor/bookings" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['vendor', 'venue_owner', 'admin']} requireEmailVerification={true}>
              <VenueOwnerDashboardNew />
            </ProtectedRouteV2>
          } />
          <Route path="/vendor/profile" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['vendor', 'venue_owner', 'admin']} requireEmailVerification={true}>
              <VenueOwnerDashboardNew />
            </ProtectedRouteV2>
          } />

          {/* ========================================
              LEGACY ROUTES - REDIRECT TO NEW V3.0
              ======================================== */}
          {/* Organizer routes → Producer routes */}
          <Route path="/organizer/dashboard" element={
            <Navigate to="/producer/dashboard" replace />
          } />
          <Route path="/organizer/organizations" element={
            <Navigate to="/producer/organizations" replace />
          } />
          <Route path="/organizer/events" element={
            <Navigate to="/producer/events" replace />
          } />
          <Route path="/organizer/audience" element={
            <Navigate to="/producer/audience" replace />
          } />

          {/* Venue Owner routes → Vendor routes */}
          <Route path="/venue-owner/dashboard" element={
            <Navigate to="/vendor/dashboard" replace />
          } />
          <Route path="/venue-owner/venues" element={
            <Navigate to="/vendor/vendors" replace />
          } />
          <Route path="/venue-owner/bookings" element={
            <Navigate to="/vendor/bookings" replace />
          } />
          <Route path="/venue-owner/profile" element={
            <Navigate to="/vendor/profile" replace />
          } />

          {/* Admin V2 Dashboard */}
          <Route path="/admin/v2" element={
            <ProtectedRouteV2 allowedRoles={['admin']}>
              <AdminDashboardV2 />
            </ProtectedRouteV2>
          } />
          <Route path="/admin/approvals" element={
            <ProtectedRouteV2 allowedRoles={['admin']}>
              <AdminDashboardV2 />
            </ProtectedRouteV2>
          } />
          <Route path="/admin/users" element={
            <ProtectedRouteV2 allowedRoles={['admin']}>
              <AdminDashboardV2 />
            </ProtectedRouteV2>
          } />
          <Route path="/admin/content" element={
            <ProtectedRouteV2 allowedRoles={['admin']}>
              <AdminDashboardV2 />
            </ProtectedRouteV2>
          } />

          {/* Guest Dashboard (Future) */}
          <Route path="/guest/dashboard" element={
            <ProtectedRouteV2 allowedRoles={['guest', 'admin']}>
              <GuestDashboard />
            </ProtectedRouteV2>
          } />
          <Route path="/guest/registrations" element={
            <ProtectedRouteV2 allowedRoles={['guest', 'admin']}>
              <GuestDashboard />
            </ProtectedRouteV2>
          } />
          <Route path="/guest/favorites" element={
            <ProtectedRouteV2 allowedRoles={['guest', 'admin']}>
              <GuestDashboard />
            </ProtectedRouteV2>
          } />
          <Route path="/guest/social" element={
            <ProtectedRouteV2 allowedRoles={['guest', 'admin']}>
              <GuestDashboard />
            </ProtectedRouteV2>
          } />

          {/* Universal Settings Route */}
          <Route path="/settings" element={
            <ProtectedRouteV2>
              <div>Settings page coming soon...</div>
            </ProtectedRouteV2>
          } />

          {/* Legacy Route Redirects for V2 - Role-based dashboard routing */}
          <Route path="/profile" element={
            <ProtectedRouteV2>
              <RoleBasedDashboardRedirect />
            </ProtectedRouteV2>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}