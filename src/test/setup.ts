import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables before any modules are imported
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3001/api')
vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com')
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789')
vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id')

// Mock Firebase functions for testing
vi.mock('../lib/firebase', () => ({
  auth: {},
  db: {},
  analytics: null,
}))