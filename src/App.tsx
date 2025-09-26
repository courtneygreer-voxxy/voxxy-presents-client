import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { analytics } from './lib/analytics'
import { ProtectedRoute, RedirectIfAuthenticated } from './components/ProtectedRoute'
import { BetaAccessGuard } from './components/auth/BetaAccessGuard'
import HomePage from './pages/HomePage'
import BetaPendingPage from './pages/BetaPendingPage'
import OrganizationPublic from './pages/OrganizationPublic'
import OrganizationAdminEnhanced from './pages/OrganizationAdminEnhanced'
import AdminDashboard from './pages/AdminDashboard'
import CreateClubPage from './pages/CreateClubPage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import PricingPage from './pages/PricingPage'
import FeaturesPage from './pages/FeaturesPage'
import HelpPage from './pages/HelpPage'
import ContactPage from './pages/ContactPage'
import ProductsPage from './pages/ProductsPage'
import AdminLogin from './pages/AdminLogin'
import VoxxyShop from './pages/VoxxyShop'
import VenueProfilePage from './pages/VenueProfilePage'
import VenueSearchPortal from './pages/VenueSearchPortal'
import VenueCreatePage from './pages/VenueCreatePage'
import CreateEventPage from './pages/CreateEventPage'
import EditEventPage from './pages/EditEventPage'
import SharedRSVPPage from './pages/SharedRSVPPage'
import AnalyticsTestPage from './pages/AnalyticsTestPage'

export default function App() {
  // Initialize analytics on app start
  useEffect(() => {
    analytics.initializeUser();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/analytics-test" element={<AnalyticsTestPage />} />
          <Route path="/venue/:venueSlug" element={<VenueProfilePage />} />
          <Route path="/shared-rsvps/:eventId" element={<SharedRSVPPage />} />
          <Route path="/:orgSlug" element={<OrganizationPublic />} />
          
          {/* Authentication routes - redirect if already logged in */}
          <Route path="/sign-up" element={
            <RedirectIfAuthenticated>
              <SignUpPage />
            </RedirectIfAuthenticated>
          } />
          <Route path="/login" element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          } />

          {/* Beta pending page */}
          <Route path="/beta-pending" element={<BetaPendingPage />} />

          {/* Protected routes - require authentication and beta access */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <BetaAccessGuard>
                <ProfilePage />
              </BetaAccessGuard>
            </ProtectedRoute>
          } />
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
          <Route path="/venues/create" element={
            <ProtectedRoute requireEmailVerification={true}>
              <BetaAccessGuard>
                <VenueCreatePage />
              </BetaAccessGuard>
            </ProtectedRoute>
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
        </Routes>
      </Router>
    </AuthProvider>
  )
}