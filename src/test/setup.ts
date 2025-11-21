import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables before any modules are imported
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3001/api')
vi.stubEnv('VITE_ENVIRONMENT', 'development')
