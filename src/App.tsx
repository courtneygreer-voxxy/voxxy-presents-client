import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, RedirectIfAuthenticated } from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
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
import CreateEventPage from './pages/CreateEventPage'

export default function App() {
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
          <Route path="/venue/:venueSlug" element={<VenueProfilePage />} />
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
          
          {/* Protected routes - require authentication */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
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
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}