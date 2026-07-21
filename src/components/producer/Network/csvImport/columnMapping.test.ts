import { describe, it, expect } from 'vitest'
import { autoDetectMappings, buildImportRows, isNameMapped } from './columnMapping'
import type { ColumnMapping } from './types'

// ─── autoDetectMappings ──────────────────────────────────────────────

describe('autoDetectMappings', () => {
  const rows = [
    { Name: 'Alice', Email: 'alice@example.com', Phone: '555-1234' },
    { Name: 'Bob', Email: 'bob@example.com', Phone: '555-5678' },
  ]

  it('exact-matches recognized field keys', () => {
    const mappings = autoDetectMappings(['name', 'email', 'phone'], [
      { name: 'Alice', email: 'alice@example.com', phone: '555-1234' },
    ])
    expect(mappings).toHaveLength(3)
    expect(mappings[0]).toMatchObject({ csvHeader: 'name', mappedTo: 'name', confidence: 'exact' })
    expect(mappings[1]).toMatchObject({ csvHeader: 'email', mappedTo: 'email', confidence: 'exact' })
    expect(mappings[2]).toMatchObject({ csvHeader: 'phone', mappedTo: 'phone', confidence: 'exact' })
  })

  it('matches header aliases (company → affiliation)', () => {
    const mappings = autoDetectMappings(['Name', 'Email', 'Company'], rows)
    const company = mappings.find((m) => m.csvHeader === 'Company')
    expect(company?.mappedTo).toBe('affiliation')
    expect(company?.confidence).toBe('alias')
  })

  it('matches header aliases case-insensitively', () => {
    const mappings = autoDetectMappings(['NAME', 'EMAIL_ADDRESS'], [
      { NAME: 'Alice', EMAIL_ADDRESS: 'a@b.com' },
    ])
    expect(mappings[0]).toMatchObject({ mappedTo: 'name', confidence: 'exact' })
    expect(mappings[1]).toMatchObject({ mappedTo: 'email', confidence: 'alias' })
  })

  it('maps first_name/last_name as merge fields', () => {
    const mappings = autoDetectMappings(['first_name', 'last_name', 'email'], [
      { first_name: 'Alice', last_name: 'Smith', email: 'a@b.com' },
    ])
    const fn = mappings.find((m) => m.csvHeader === 'first_name')
    const ln = mappings.find((m) => m.csvHeader === 'last_name')
    expect(fn?.mappedTo).toBe('first_name')
    expect(ln?.mappedTo).toBe('last_name')
  })

  it('maps firstname/lastname (no underscore) as merge fields', () => {
    const mappings = autoDetectMappings(['firstname', 'lastname', 'email'], [
      { firstname: 'Alice', lastname: 'Smith', email: 'a@b.com' },
    ])
    const fn = mappings.find((m) => m.csvHeader === 'firstname')
    const ln = mappings.find((m) => m.csvHeader === 'lastname')
    expect(fn?.mappedTo).toBe('firstname')
    expect(ln?.mappedTo).toBe('lastname')
  })

  it('sets unmapped columns to null with confidence none', () => {
    const mappings = autoDetectMappings(['Name', 'Email', 'FavoriteColor'], rows)
    const unknown = mappings.find((m) => m.csvHeader === 'FavoriteColor')
    expect(unknown?.mappedTo).toBeNull()
    expect(unknown?.confidence).toBe('none')
  })

  it('does not double-claim the same field', () => {
    const mappings = autoDetectMappings(['email', 'Email Address'], [
      { email: 'a@b.com', 'Email Address': 'a@b.com' },
    ])
    const emailMappings = mappings.filter((m) => m.mappedTo === 'email')
    expect(emailMappings).toHaveLength(1)
    // Second column should be unmapped
    const second = mappings.find((m) => m.csvHeader === 'Email Address')
    expect(second?.mappedTo).toBeNull()
  })

  it('collects sample values from rows', () => {
    const mappings = autoDetectMappings(['Name'], rows)
    expect(mappings[0].sampleValues).toEqual(['Alice', 'Bob'])
  })
})

// ─── buildImportRows ─────────────────────────────────────────────────

describe('buildImportRows', () => {
  it('maps raw CSV data to ImportRows using column mappings', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'Full Name', mappedTo: 'name', confidence: 'alias', sampleValues: [] },
      { csvHeader: 'Email', mappedTo: 'email', confidence: 'exact', sampleValues: [] },
    ]
    const rawRows = [
      { 'Full Name': 'Alice Smith', Email: 'alice@test.com' },
      { 'Full Name': 'Bob Jones', Email: 'bob@test.com' },
    ]

    const rows = buildImportRows(rawRows, mappings)

    expect(rows).toHaveLength(2)
    expect(rows[0].name).toBe('Alice Smith')
    expect(rows[0].email).toBe('alice@test.com')
    expect(rows[0]._originalIndex).toBe(2) // 1-indexed + header
    expect(rows[1]._originalIndex).toBe(3)
    expect(rows[0]._skipped).toBe(false)
    expect(rows[0]._status).toBe('valid')
  })

  it('merges first_name + last_name into name', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'first_name', mappedTo: 'first_name', confidence: 'alias', sampleValues: [] },
      { csvHeader: 'last_name', mappedTo: 'last_name', confidence: 'alias', sampleValues: [] },
      { csvHeader: 'email', mappedTo: 'email', confidence: 'exact', sampleValues: [] },
    ]
    const rawRows = [{ first_name: 'Alice', last_name: 'Smith', email: 'a@b.com' }]

    const rows = buildImportRows(rawRows, mappings)

    expect(rows[0].name).toBe('Alice Smith')
  })

  it('merges firstname + lastname (no underscore) into name', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'firstname', mappedTo: 'firstname', confidence: 'alias', sampleValues: [] },
      { csvHeader: 'lastname', mappedTo: 'lastname', confidence: 'alias', sampleValues: [] },
      { csvHeader: 'email', mappedTo: 'email', confidence: 'exact', sampleValues: [] },
    ]
    const rawRows = [{ firstname: 'Alice', lastname: 'Smith', email: 'a@b.com' }]

    const rows = buildImportRows(rawRows, mappings)

    expect(rows[0].name).toBe('Alice Smith')
  })

  it('handles first_name only (no last_name)', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'first_name', mappedTo: 'first_name', confidence: 'alias', sampleValues: [] },
      { csvHeader: 'email', mappedTo: 'email', confidence: 'exact', sampleValues: [] },
    ]
    const rawRows = [{ first_name: 'Alice', email: 'a@b.com' }]

    const rows = buildImportRows(rawRows, mappings)

    expect(rows[0].name).toBe('Alice')
  })

  it('does not overwrite direct name mapping with merge', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'Name', mappedTo: 'name', confidence: 'exact', sampleValues: [] },
      { csvHeader: 'first_name', mappedTo: 'first_name', confidence: 'alias', sampleValues: [] },
      { csvHeader: 'email', mappedTo: 'email', confidence: 'exact', sampleValues: [] },
    ]
    const rawRows = [{ Name: 'Direct Name', first_name: 'Merged', email: 'a@b.com' }]

    const rows = buildImportRows(rawRows, mappings)

    expect(rows[0].name).toBe('Direct Name')
  })

  it('skips unmapped columns', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'Name', mappedTo: 'name', confidence: 'exact', sampleValues: [] },
      { csvHeader: 'Junk', mappedTo: null, confidence: 'none', sampleValues: [] },
    ]
    const rawRows = [{ Name: 'Alice', Junk: 'whatever' }]

    const rows = buildImportRows(rawRows, mappings)

    expect(rows[0].name).toBe('Alice')
    expect(rows[0]).not.toHaveProperty('Junk')
  })

  it('trims whitespace from values', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'name', mappedTo: 'name', confidence: 'exact', sampleValues: [] },
    ]
    const rawRows = [{ name: '  Alice Smith  ' }]

    const rows = buildImportRows(rawRows, mappings)

    expect(rows[0].name).toBe('Alice Smith')
  })
})

// ─── isNameMapped ────────────────────────────────────────────────────

describe('isNameMapped', () => {
  it('returns true when name is directly mapped', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'Name', mappedTo: 'name', confidence: 'exact', sampleValues: [] },
    ]
    expect(isNameMapped(mappings)).toBe(true)
  })

  it('returns true when first_name is mapped (merge)', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'first_name', mappedTo: 'first_name', confidence: 'alias', sampleValues: [] },
    ]
    expect(isNameMapped(mappings)).toBe(true)
  })

  it('returns true when lastname (no underscore) is mapped', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'lastname', mappedTo: 'lastname', confidence: 'alias', sampleValues: [] },
    ]
    expect(isNameMapped(mappings)).toBe(true)
  })

  it('returns false when no name-related field is mapped', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'email', mappedTo: 'email', confidence: 'exact', sampleValues: [] },
      { csvHeader: 'phone', mappedTo: 'phone', confidence: 'exact', sampleValues: [] },
    ]
    expect(isNameMapped(mappings)).toBe(false)
  })

  it('returns false when all mappings are null', () => {
    const mappings: ColumnMapping[] = [
      { csvHeader: 'Junk', mappedTo: null, confidence: 'none', sampleValues: [] },
    ]
    expect(isNameMapped(mappings)).toBe(false)
  })
})
