import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { vendorContactsApi, saveAuthToken } from './api'

// ─── Helpers ────────────────────────────────────────────────────────

function mockFetchResponse(body: unknown, status = 200) {
  return vi.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 422 ? 'Unprocessable Entity' : 'OK',
    json: async () => body,
  })
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('vendorContactsApi.create - 422 error handling', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    localStorage.clear()
    saveAuthToken('test-token')
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('throws ApiError with errors array on duplicate email (422)', async () => {
    globalThis.fetch = mockFetchResponse(
      {
        message: 'Validation failed',
        errors: ['Email has already been taken'],
      },
      422,
    )

    try {
      await vendorContactsApi.create(1, {
        contact_name: 'John Doe',
        email: 'duplicate@example.com',
        contact_type: 'vendor',
        source: 'manual',
      })
      expect.fail('Should have thrown')
    } catch (error: any) {
      expect(error.name).toBe('ApiError')
      expect(error.status).toBe(422)
      expect(error.errors).toEqual(['Email has already been taken'])
    }
  })

  it('throws ApiError with multiple validation errors', async () => {
    globalThis.fetch = mockFetchResponse(
      {
        message: 'Validation failed',
        errors: ['Email has already been taken', 'Instagram handle is invalid', 'Phone is invalid'],
      },
      422,
    )

    try {
      await vendorContactsApi.create(1, {
        contact_name: 'Jane',
        email: 'jane@example.com',
        phone: 'bad-phone',
        instagram_handle: 'bad!!handle',
        contact_type: 'vendor',
        source: 'manual',
      })
      expect.fail('Should have thrown')
    } catch (error: any) {
      expect(error.name).toBe('ApiError')
      expect(error.status).toBe(422)
      expect(error.errors).toHaveLength(3)
      expect(error.errors).toContain('Email has already been taken')
      expect(error.errors).toContain('Instagram handle is invalid')
      expect(error.errors).toContain('Phone is invalid')
    }
  })

  it('sends correct request body to the API', async () => {
    const mockContact = { id: 1, name: 'John Doe', email: 'john@example.com' }
    globalThis.fetch = mockFetchResponse(mockContact)

    await vendorContactsApi.create(42, {
      contact_name: 'John Doe',
      email: 'john@example.com',
      affiliation: 'John Co',
      contact_type: 'vendor',
      source: 'manual',
    })

    const [url, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]

    expect(url).toContain('/v1/presents/vendor_contacts')
    expect(options.method).toBe('POST')

    // The API takes discrete name parts and `affiliation`; `name` and
    // `business_name` are no longer part of the create payload.
    const body = JSON.parse(options.body)
    expect(body.vendor_contact.first_name).toBe('John Doe')
    expect(body.vendor_contact.email).toBe('john@example.com')
    expect(body.vendor_contact.affiliation).toBe('John Co')
  })
})

describe('Error field mapping logic', () => {
  // These tests verify the mapping logic used in AddContactModal's catch block
  // The mapping is: backend error message string → frontend form field key

  const mapErrorToField = (msg: string): string => {
    const lower = msg.toLowerCase()
    if (lower.includes('email')) return 'email'
    if (lower.includes('phone')) return 'phone'
    if (lower.includes('name')) return 'contact_name'
    if (lower.includes('website') || lower.includes('url')) return 'website'
    if (lower.includes('instagram')) return 'instagram_handle'
    if (lower.includes('tiktok')) return 'tiktok_handle'
    return 'submit'
  }

  it('maps "Email has already been taken" to email field', () => {
    expect(mapErrorToField('Email has already been taken')).toBe('email')
  })

  it('maps "Email is invalid" to email field', () => {
    expect(mapErrorToField('Email is invalid')).toBe('email')
  })

  it('maps "Phone is invalid" to phone field', () => {
    expect(mapErrorToField('Phone is invalid')).toBe('phone')
  })

  it('maps "Name can\'t be blank" to contact_name field', () => {
    expect(mapErrorToField("Name can't be blank")).toBe('contact_name')
  })

  it('maps "Website is not a valid URL" to website field', () => {
    expect(mapErrorToField('Website is not a valid URL')).toBe('website')
  })

  it('maps "Instagram handle is invalid" to instagram_handle field', () => {
    expect(mapErrorToField('Instagram handle is invalid')).toBe('instagram_handle')
  })

  it('maps "Tiktok handle is invalid" to tiktok_handle field', () => {
    expect(mapErrorToField('Tiktok handle is invalid')).toBe('tiktok_handle')
  })

  it('maps unknown errors to submit field', () => {
    expect(mapErrorToField('Something unexpected happened')).toBe('submit')
  })
})
