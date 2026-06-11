import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/admin-dark-theme.css'
import App from './App.tsx'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { validateEnv } from './utils/validateEnv'
import { initializeErrorMonitoring } from './utils/errorMonitoring'

// Validate environment variables before app starts
validateEnv()

// Initialize Sentry error monitoring
initializeErrorMonitoring()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
