import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import BrooklynHeartsClub from './pages/BrooklynHeartsClub'
import VoxxyPresentsNYC from './pages/VoxxyPresentsNYC'
import OrganizationAdmin from './pages/OrganizationAdmin'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/brooklynheartsclub" element={<BrooklynHeartsClub />} />
          <Route path="/voxxy-presents-nyc" element={<VoxxyPresentsNYC />} />
          <Route path="/:orgSlug/admin" element={<OrganizationAdmin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}