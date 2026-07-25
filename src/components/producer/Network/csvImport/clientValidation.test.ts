import { describe, it, expect } from 'vitest'
import { validateRow, validateAllRows, revalidateRow } from './clientValidation'
import type { ImportRow } from './types'

function makeRow(overrides: Partial<ImportRow> = {}): ImportRow {
  return {
    _originalIndex: 2,
    _skipped: false,
    _errors: {},
    _warnings: {},
    _status: 'valid',
    name: 'Alice Smith',
    email: 'alice@example.com',
    ...overrides,
  }
}

// ─── validateRow ─────────────────────────────────────────────────────

describe('validateRow', () => {
  describe('blocking errors', () => {
    it('returns error when the single Full Name column is missing', () => {
      const result = validateRow(makeRow({ name: '' }))
      expect(result.errors.name).toContain('First name is required')
    })

    it('returns error when email is missing', () => {
      const result = validateRow(makeRow({ email: '' }))
      expect(result.errors.email).toContain('Email is required')
    })

    it('returns errors for both when name AND email are missing', () => {
      const result = validateRow(makeRow({ name: '', email: '' }))
      expect(result.errors.name).toBeDefined()
      expect(result.errors.email).toBeDefined()
    })

    it('returns no errors for valid row', () => {
      const result = validateRow(makeRow())
      expect(Object.keys(result.errors)).toHaveLength(0)
    })
  })

  describe('first/last name columns', () => {
    it('is valid when first_name is present and there is no Full Name column', () => {
      const result = validateRow(
        makeRow({ name: undefined, first_name: 'Alice', last_name: 'Smith' }),
      )
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('blocks on the first_name cell when a first_name column is present but blank', () => {
      const result = validateRow(
        makeRow({ name: undefined, first_name: '', last_name: 'Smith' }),
      )
      expect(result.errors.first_name).toContain('First name is required')
      // The error targets the visible first_name cell, not a phantom name cell
      expect(result.errors.name).toBeUndefined()
    })

    it('is valid with first name only (last name optional)', () => {
      const result = validateRow(makeRow({ name: undefined, first_name: 'Alice' }))
      expect(Object.keys(result.errors)).toHaveLength(0)
    })
  })

  describe('email warnings', () => {
    it('warns on invalid email format', () => {
      const result = validateRow(makeRow({ email: 'not-an-email' }))
      expect(result.warnings.email).toContain('Email format looks invalid')
    })

    it('no warning on valid email', () => {
      const result = validateRow(makeRow({ email: 'good@example.com' }))
      expect(result.warnings.email).toBeUndefined()
    })
  })

  describe('phone warnings', () => {
    it('warns on invalid phone format', () => {
      const result = validateRow(makeRow({ phone: 'call me maybe' }))
      expect(result.warnings.phone).toContain('Phone format looks invalid')
    })

    it('no warning on valid phone', () => {
      const result = validateRow(makeRow({ phone: '(555) 123-4567' }))
      expect(result.warnings.phone).toBeUndefined()
    })

    it('no warning on empty phone', () => {
      const result = validateRow(makeRow({ phone: '' }))
      expect(result.warnings.phone).toBeUndefined()
    })
  })

  describe('social handle warnings', () => {
    it('warns on instagram handle with spaces', () => {
      const result = validateRow(makeRow({ instagram_handle: 'bad handle' }))
      expect(result.warnings.instagram_handle).toBeDefined()
    })

    it('no warning on valid instagram handle', () => {
      const result = validateRow(makeRow({ instagram_handle: 'alice_smith' }))
      expect(result.warnings.instagram_handle).toBeUndefined()
    })

    it('strips instagram URL to extract handle', () => {
      const result = validateRow(makeRow({ instagram_handle: 'https://instagram.com/alice_smith' }))
      expect(result.warnings.instagram_handle).toBeUndefined()
    })

    it('strips tiktok URL to extract handle', () => {
      const result = validateRow(makeRow({ tiktok_handle: 'https://tiktok.com/@alice_smith' }))
      expect(result.warnings.tiktok_handle).toBeUndefined()
    })

    it('warns on tiktok handle with special chars', () => {
      const result = validateRow(makeRow({ tiktok_handle: 'bad!handle' }))
      expect(result.warnings.tiktok_handle).toBeDefined()
    })
  })

  describe('website warnings', () => {
    it('no warning on valid URL', () => {
      const result = validateRow(makeRow({ website: 'https://example.com' }))
      expect(result.warnings.website).toBeUndefined()
    })

    it('no warning on bare domain (auto-prefixed)', () => {
      const result = validateRow(makeRow({ website: 'example.com' }))
      expect(result.warnings.website).toBeUndefined()
    })

    it('warns on invalid URL', () => {
      const result = validateRow(makeRow({ website: 'not a url at all' }))
      expect(result.warnings.website).toContain('Must be a valid URL')
    })

    it('no warning on empty website', () => {
      const result = validateRow(makeRow({ website: '' }))
      expect(result.warnings.website).toBeUndefined()
    })
  })

  describe('location warnings', () => {
    it('warns when location lacks comma', () => {
      const result = validateRow(makeRow({ location: 'San Francisco' }))
      expect(result.warnings.location).toBeDefined()
    })

    it('no warning on City, State format', () => {
      const result = validateRow(makeRow({ location: 'San Francisco, CA' }))
      expect(result.warnings.location).toBeUndefined()
    })

    it('no warning on empty location', () => {
      const result = validateRow(makeRow({ location: '' }))
      expect(result.warnings.location).toBeUndefined()
    })
  })

  describe('affiliation warnings', () => {
    it('warns when affiliation exceeds max length', () => {
      const result = validateRow(makeRow({ affiliation: 'x'.repeat(5001) }))
      expect(result.warnings.affiliation).toBeDefined()
    })

    it('no warning on normal affiliation', () => {
      const result = validateRow(makeRow({ affiliation: 'Acme Corp' }))
      expect(result.warnings.affiliation).toBeUndefined()
    })
  })
})

// ─── validateAllRows ─────────────────────────────────────────────────

describe('validateAllRows', () => {
  it('returns count of error rows', () => {
    const rows = [
      makeRow({ name: '', email: '' }), // error
      makeRow(), // valid
      makeRow({ name: '' }), // error
    ]

    const errorCount = validateAllRows(rows)

    expect(errorCount).toBe(2)
  })

  it('sets _status, _errors, _warnings on each row', () => {
    const rows = [
      makeRow({ email: 'bad-email' }), // warning
      makeRow({ name: '' }), // error
      makeRow(), // valid
    ]

    validateAllRows(rows)

    expect(rows[0]._status).toBe('warning')
    expect(rows[0]._warnings.email).toBeDefined()
    expect(rows[1]._status).toBe('error')
    expect(rows[1]._errors.name).toBeDefined()
    expect(rows[2]._status).toBe('valid')
  })

  it('skips rows marked as _skipped', () => {
    const rows = [
      makeRow({ _skipped: true, name: '' }), // skipped — should not be validated
      makeRow(), // valid
    ]

    const errorCount = validateAllRows(rows)

    expect(errorCount).toBe(0)
    // Skipped row's status should remain unchanged
    expect(rows[0]._status).toBe('valid')
  })
})

// ─── revalidateRow ───────────────────────────────────────────────────

describe('revalidateRow', () => {
  it('returns errors, warnings, and computed status', () => {
    const result = revalidateRow(makeRow({ name: '' }))

    expect(result.errors.name).toContain('First name is required')
    expect(result.status).toBe('error')
  })

  it('returns valid status for clean row', () => {
    const result = revalidateRow(makeRow())

    expect(Object.keys(result.errors)).toHaveLength(0)
    expect(Object.keys(result.warnings)).toHaveLength(0)
    expect(result.status).toBe('valid')
  })

  it('returns warning status when only warnings exist', () => {
    const result = revalidateRow(makeRow({ phone: 'abc' }))

    expect(Object.keys(result.errors)).toHaveLength(0)
    expect(result.warnings.phone).toBeDefined()
    expect(result.status).toBe('warning')
  })
})
