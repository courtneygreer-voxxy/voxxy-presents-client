import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import OrganizationPublic from './pages/OrganizationPublic'
import OrganizationAdmin from './pages/OrganizationAdmin'
import AdminDashboard from './pages/AdminDashboard'
import CreateClubPage from './pages/CreateClubPage'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-club" element={<CreateClubPage />} />
          <Route path="/:orgSlug" element={<OrganizationPublic />} />
          <Route path="/:orgSlug/admin" element={<OrganizationAdmin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}