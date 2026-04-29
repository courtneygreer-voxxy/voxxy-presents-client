import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Stub environment variables so tests don't hit real APIs
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3001/api')
vi.stubEnv('VITE_ENVIRONMENT', 'test')
