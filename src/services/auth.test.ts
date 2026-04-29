import { describe, it, expect, beforeEach } from 'vitest'
import { saveAuthToken, getAuthToken, clearAuthToken } from './api'

describe('Auth token management', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('saveAuthToken', () => {
    it('stores a token that can be retrieved', () => {
      saveAuthToken('my-jwt-token-123')
      expect(localStorage.getItem('railsAuthToken')).toBe('my-jwt-token-123')
    })

    it('overwrites a previously saved token', () => {
      saveAuthToken('old-token')
      saveAuthToken('new-token')
      expect(localStorage.getItem('railsAuthToken')).toBe('new-token')
    })
  })

  describe('getAuthToken', () => {
    it('returns the saved token', () => {
      saveAuthToken('my-jwt-token-123')
      expect(getAuthToken()).toBe('my-jwt-token-123')
    })

    it('returns null when no token exists', () => {
      expect(getAuthToken()).toBeNull()
    })

    it('returns null after localStorage is cleared', () => {
      saveAuthToken('my-jwt-token-123')
      localStorage.clear()
      expect(getAuthToken()).toBeNull()
    })
  })

  describe('clearAuthToken', () => {
    it('removes the saved token', () => {
      saveAuthToken('my-jwt-token-123')
      clearAuthToken()
      expect(getAuthToken()).toBeNull()
    })

    it('does not throw when no token exists', () => {
      expect(() => clearAuthToken()).not.toThrow()
    })
  })

  describe('round-trip: save → get → clear → get', () => {
    it('completes the full lifecycle', () => {
      // No token initially
      expect(getAuthToken()).toBeNull()

      // Save and verify
      saveAuthToken('lifecycle-token')
      expect(getAuthToken()).toBe('lifecycle-token')

      // Clear and verify
      clearAuthToken()
      expect(getAuthToken()).toBeNull()
    })
  })
})
