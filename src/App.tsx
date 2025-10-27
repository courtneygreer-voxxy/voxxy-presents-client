import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { AuthProvider } from './contexts/AuthContext'
import { analytics } from './lib/analytics'
import { initPerformanceTracking } from './utils/performanceTracking'
import { ProtectedRoute, RedirectIfAuthenticated } from './components/ProtectedRoute'
import { BetaAccessGuard } from './components/auth/BetaAccessGuard'
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
import VenueOwnerSignUpPage from './pages/VenueOwnerSignUpPage'
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

  // Route based on user role
  switch (userProfile.role) {
    case 'venue_owner':
      console.log('Venue owner detected, redirecting to venue dashboard')
      return <Navigate to="/venue-owner/dashboard" replace />

    case 'organizer':
      console.log('Organizer (club owner) detected, redirecting to organizer dashboard')
      return <Navigate to="/organizer/dashboard" replace />

    case 'admin':
      console.log('Admin detected, redirecting to admin dashboard')
      return <Navigate to="/admin/dashboard" replace />

    case 'user':
    default:
      console.log('User or unknown role, redirecting to home')
      return <Navigate to="/" replace />
  }
}

export default function App() {
  // Initialize analytics and performance tracking on app start
  useEffect(() => {
    analytics.initializeUser();
    initPerformanceTracking();
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

          {/* Specific user type authentication routes */}
          <Route path="/signup/club-owner" element={
            <RedirectIfAuthenticatedV2>
              <ClubOwnerSignUpPage />
            </RedirectIfAuthenticatedV2>
          } />
          <Route path="/signup/venue-owner" element={
            <RedirectIfAuthenticatedV2>
              <VenueOwnerSignUpPage />
            </RedirectIfAuthenticatedV2>
          } />
          <Route path="/login/club-owner" element={
            <RedirectIfAuthenticatedV2>
              <ClubOwnerLoginPage />
            </RedirectIfAuthenticatedV2>
          } />
          <Route path="/login/venue-owner" element={
            <RedirectIfAuthenticatedV2>
              <VenueOwnerLoginPage />
            </RedirectIfAuthenticatedV2>
          } />

          {/* Beta pending page */}
          <Route path="/beta-pending" element={<BetaPendingPage />} />

          {/* Protected routes - require authentication and beta access */}
          <Route path="/voxxy-shop" element={
            <ProtectedRoute>
              <BetaAccessGuard>
                <VoxxyShop />
              </BetaAccessGuard>
            </ProtectedRoute>
          } />
          <Route path="/voxxy-shop/venues" element={
            <ProtectedRoute>
              <BetaAccessGuard>
                <VenueSearchPortal />
              </BetaAccessGuard>
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
              <BetaAccessGuard>
                <CreateClubPage />
              </BetaAccessGuard>
            </ProtectedRoute>
          } />
          <Route path="/:orgSlug/admin" element={
            <ProtectedRoute>
              <BetaAccessGuard>
                <OrganizationAdminEnhanced />
              </BetaAccessGuard>
            </ProtectedRoute>
          } />
          <Route path="/:orgSlug/create-event" element={
            <ProtectedRoute>
              <BetaAccessGuard>
                <CreateEventPage />
              </BetaAccessGuard>
            </ProtectedRoute>
          } />
          <Route path="/:orgSlug/edit-event/:eventId" element={
            <ProtectedRoute>
              <BetaAccessGuard>
                <EditEventPage />
              </BetaAccessGuard>
            </ProtectedRoute>
          } />
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* V2 Architecture Dashboard Routes */}
          {/* Organizer Dashboard - Restored Original Beautiful Styling */}
          <Route path="/organizer/dashboard" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['organizer', 'admin']}>
              <ProfilePage />
            </ProtectedRouteV2>
          } />
          <Route path="/organizer/organizations" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['organizer', 'admin']}>
              <ProfilePage />
            </ProtectedRouteV2>
          } />
          <Route path="/organizer/events" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['organizer', 'admin']}>
              <ProfilePage />
            </ProtectedRouteV2>
          } />
          <Route path="/organizer/audience" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['organizer', 'admin']}>
              <ProfilePage />
            </ProtectedRouteV2>
          } />

          {/* Venue Owner Dashboard */}
          <Route path="/venue-owner/dashboard" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['venue_owner', 'admin']} requireEmailVerification={true}>
              <VenueOwnerDashboardNew />
            </ProtectedRouteV2>
          } />
          <Route path="/venue-owner/venues" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['venue_owner', 'admin']} requireEmailVerification={true}>
              <VenueOwnerDashboardNew />
            </ProtectedRouteV2>
          } />
          <Route path="/venue-owner/bookings" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['venue_owner', 'admin']} requireEmailVerification={true}>
              <VenueOwnerDashboardNew />
            </ProtectedRouteV2>
          } />
          <Route path="/venue-owner/profile" element={
            <ProtectedRouteV2 requireApproval={true} allowedRoles={['venue_owner', 'admin']} requireEmailVerification={true}>
              <VenueOwnerDashboardNew />
            </ProtectedRouteV2>
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