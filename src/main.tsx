import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/admin-dark-theme.css'
import App from './App.tsx'
import { validateEnv } from './utils/validateEnv'

// Validate environment variables before app starts
validateEnv()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)