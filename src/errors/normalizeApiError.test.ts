import { describe, it, expect } from 'vitest'
import { ApiError } from '@/services/api'
import { normalizeApiError } from './normalizeApiError'

describe('normalizeApiError', () => {
  it('maps network failures (status 0)', () => {
    const result = normalizeApiError(new ApiError('Network error: Failed to fetch', 0))
    expect(result.key).toBe('global.network')
    expect(result.passThrough).toBe(false)
  })

  it('passes through 422 validation errors', () => {
    const result = normalizeApiError(
      new ApiError('Validation failed', 422, ['Email has already been taken'])
    )
    expect(result.message).toBe('Email has already been taken')
    expect(result.passThrough).toBe(true)
  })

  it('uses invalid credentials for 401 in auth context without message', () => {
    const result = normalizeApiError(new ApiError('', 401), { context: 'auth' })
    expect(result.key).toBe('auth.invalidCredentials')
  })

  it('passes through server message for 401 in auth context', () => {
    const result = normalizeApiError(new ApiError('Invalid email or password', 401), {
      context: 'auth',
    })
    expect(result.message).toBe('Invalid email or password')
    expect(result.passThrough).toBe(true)
  })

  it('maps 401 outside auth context to session expired', () => {
    const result = normalizeApiError(new ApiError('Unauthorized', 401))
    expect(result.key).toBe('auth.sessionExpired')
  })

  it('falls back to generic message when no details', () => {
    const result = normalizeApiError(new ApiError('', 500))
    expect(result.key).toBe('global.requestFailed')
  })

  it('handles non-Error values', () => {
    const result = normalizeApiError('oops')
    expect(result.key).toBe('global.unexpected')
  })
})
