import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BrooklynHeartsClub from './pages/BrooklynHeartsClub'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/brooklynheartsclub" element={<BrooklynHeartsClub />} />
      </Routes>
    </Router>
  )
}