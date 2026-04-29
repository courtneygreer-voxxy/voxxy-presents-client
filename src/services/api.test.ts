import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  saveAuthToken,
  getAuthToken,
  clearAuthToken,
  organizationsApi,
} from './api'

// ─── Helpers ────────────────────────────────────────────────────────
// We mock global fetch to test how fetchApi (internal) handles
// different HTTP responses. We test through exported API objects
// so we're testing real usage, not implementation details.

function mockFetchResponse(body: unknown, status = 200) {
  return vi.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? 'Not Found' : 'OK',
    json: async () => body,
  })
}

function mockFetchNetworkError(message = 'Failed to fetch') {
  return vi.fn().mockRejectedValueOnce(new TypeError(message))
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('fetchApi behavior (via organizationsApi)', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  // ── Happy path ──────────────────────────────────────────────────

  it('returns parsed JSON on success', async () => {
    const mockOrg = { id: 1, name: 'Test Org', slug: 'test-org' }
    globalThis.fetch = mockFetchResponse(mockOrg)

    const result = await organizationsApi.getBySlug('test-org')
    expect(result).toEqual(mockOrg)
  })

  // ── Auth header behavior ────────────────────────────────────────

  it('includes Authorization header when token is saved', async () => {
    saveAuthToken('my-jwt-token')
    globalThis.fetch = mockFetchResponse({ id: 1 })

    await organizationsApi.getBySlug('test-org')

    const [, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(options.headers['Authorization']).toBe('Bearer my-jwt-token')
  })

  it('omits Authorization header when no token exists', async () => {
    globalThis.fetch = mockFetchResponse({ id: 1 })

    await organizationsApi.getBySlug('test-org')

    const [, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(options.headers['Authorization']).toBeUndefined()
  })

  // ── HTTP error handling ─────────────────────────────────────────

  it('throws with status and message on 404', async () => {
    globalThis.fetch = mockFetchResponse(
      { message: 'Organization not found' },
      404
    )

    await expect(organizationsApi.getBySlug('no-such-org'))
      .rejects.toMatchObject({
        name: 'ApiError',
        status: 404,
        message: 'Organization not found',
      })
  })

  it('throws with status on 500 server error', async () => {
    globalThis.fetch = mockFetchResponse(
      { error: 'Internal server error' },
      500
    )

    await expect(organizationsApi.getBySlug('test-org'))
      .rejects.toMatchObject({
        name: 'ApiError',
        status: 500,
      })
  })

  it('handles error response with errors array', async () => {
    globalThis.fetch = mockFetchResponse(
      { message: 'Validation failed', errors: ['Name is required', 'Slug is taken'] },
      422
    )

    try {
      await organizationsApi.create({ name: '' })
      expect.fail('Should have thrown')
    } catch (error: any) {
      expect(error.name).toBe('ApiError')
      expect(error.status).toBe(422)
      expect(error.errors).toEqual(['Name is required', 'Slug is taken'])
    }
  })

  it('handles non-JSON error response gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => { throw new SyntaxError('Unexpected token') },
    })

    await expect(organizationsApi.getBySlug('test-org'))
      .rejects.toMatchObject({
        name: 'ApiError',
        status: 502,
        message: expect.stringContaining('502'),
      })
  })

  // ── Network error handling ──────────────────────────────────────

  it('wraps network errors in ApiError with status 0', async () => {
    globalThis.fetch = mockFetchNetworkError('Failed to fetch')

    await expect(organizationsApi.getBySlug('test-org'))
      .rejects.toMatchObject({
        name: 'ApiError',
        status: 0,
        message: expect.stringContaining('Failed to fetch'),
      })
  })

  // ── Content-Type header ─────────────────────────────────────────

  it('sends Content-Type: application/json on all requests', async () => {
    globalThis.fetch = mockFetchResponse({ id: 1 })

    await organizationsApi.getBySlug('test-org')

    const [, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(options.headers['Content-Type']).toBe('application/json')
  })
})
