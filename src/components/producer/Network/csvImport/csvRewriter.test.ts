import { describe, it, expect } from 'vitest'
import { prepareSubmission } from './csvRewriter'
import type { ImportRow, ColumnMapping } from './types'

function makeMapping(csvHeader: string, mappedTo: string | null): ColumnMapping {
  return { csvHeader, mappedTo, confidence: 'exact', sampleValues: [] }
}

function makeRow(overrides: Partial<ImportRow> & { email: string }): ImportRow {
  return {
    _originalIndex: 2,
    _skipped: false,
    _errors: {},
    _warnings: {},
    _status: 'valid',
    ...overrides,
  }
}

function makeFile(content = 'name,email\nAlice,alice@test.com') {
  return new File([content], 'contacts.csv', { type: 'text/csv' })
}

async function readFileText(file: File): Promise<string> {
  // jsdom's File doesn't implement .text(), use FileReader fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// ─── prepareSubmission ───────────────────────────────────────────────

describe('prepareSubmission', () => {
  const mappings: ColumnMapping[] = [
    makeMapping('Name', 'name'),
    makeMapping('Email', 'email'),
  ]

  describe('no edits, no skips', () => {
    it('returns original file when nothing changed', () => {
      const original = makeFile()
      const rows = [makeRow({ name: 'Alice', email: 'alice@test.com' })]

      const result = prepareSubmission(original, mappings, rows, false)

      expect(result.file).toBe(original) // same reference
    })

    it('returns column mapping when nothing changed', () => {
      const original = makeFile()
      const rows = [makeRow({ name: 'Alice', email: 'alice@test.com' })]

      const result = prepareSubmission(original, mappings, rows, false)

      expect(result.columnMapping).toEqual({ Name: 'name', Email: 'email' })
    })
  })

  describe('skipped rows', () => {
    it('excludes skipped rows from reconstructed CSV', async () => {
      const original = makeFile()
      const rows = [
        makeRow({ name: 'Alice', email: 'alice@test.com' }),
        makeRow({ name: 'Bob', email: 'bob@test.com', _skipped: true }),
        makeRow({ name: 'Carol', email: 'carol@test.com' }),
      ]

      const result = prepareSubmission(original, mappings, rows, false)

      // Should reconstruct (not return original)
      expect(result.file).not.toBe(original)
      expect(result.columnMapping).toBeNull()

      const text = await readFileText(result.file)
      expect(text).toContain('Alice')
      expect(text).not.toContain('Bob')
      expect(text).toContain('Carol')
    })

    it('preserves original filename', async () => {
      const original = makeFile()
      const rows = [
        makeRow({ name: 'Alice', email: 'alice@test.com', _skipped: true }),
        makeRow({ name: 'Bob', email: 'bob@test.com' }),
      ]

      const result = prepareSubmission(original, mappings, rows, false)

      expect(result.file.name).toBe('contacts.csv')
    })
  })

  describe('edited cells', () => {
    it('reconstructs CSV with canonical headers when cells edited', async () => {
      const original = makeFile()
      const rows = [
        makeRow({ name: 'Alice Edited', email: 'alice@test.com' }),
      ]

      const result = prepareSubmission(original, mappings, rows, true)

      expect(result.file).not.toBe(original)
      expect(result.columnMapping).toBeNull()

      const text = await readFileText(result.file)
      expect(text).toContain('name')
      expect(text).toContain('email')
      expect(text).toContain('Alice Edited')
    })
  })

  describe('first/last name joined at submit', () => {
    const nameParts: ColumnMapping[] = [
      makeMapping('first_name', 'first_name'),
      makeMapping('last_name', 'last_name'),
      makeMapping('Email', 'email'),
    ]

    it('reconstructs and joins first_name + last_name into a canonical name column', async () => {
      const rows = [makeRow({ first_name: 'Alice', last_name: 'Smith', email: 'alice@test.com' })]

      const result = prepareSubmission(makeFile(), nameParts, rows, false)

      // Presence of name parts forces reconstruction even without edits/skips
      expect(result.columnMapping).toBeNull()

      const text = await readFileText(result.file)
      expect(text).toContain('name')
      expect(text).not.toContain('first_name')
      expect(text).not.toContain('last_name')
      expect(text).toContain('Alice Smith')
    })

    it('joins first name only when last name is absent', async () => {
      const rows = [makeRow({ first_name: 'Alice', last_name: '', email: 'alice@test.com' })]

      const result = prepareSubmission(makeFile(), nameParts, rows, false)

      const text = await readFileText(result.file)
      expect(text).toContain('Alice')
      expect(text).not.toContain('Alice ') // no trailing space from empty last name
    })

    it('prefers an explicit Full Name over first/last when both present', async () => {
      const mixed: ColumnMapping[] = [
        makeMapping('Name', 'name'),
        makeMapping('first_name', 'first_name'),
        makeMapping('Email', 'email'),
      ]
      const rows = [
        makeRow({ name: 'Explicit Name', first_name: 'Ignored', email: 'alice@test.com' }),
      ]

      const result = prepareSubmission(makeFile(), mixed, rows, false)

      const text = await readFileText(result.file)
      expect(text).toContain('Explicit Name')
      expect(text).not.toContain('Ignored')
    })
  })

  describe('column mapping output', () => {
    it('only includes recognized fields in column mapping', () => {
      const mixedMappings: ColumnMapping[] = [
        makeMapping('Name', 'name'),
        makeMapping('Junk', null),
        makeMapping('Email', 'email'),
      ]
      const rows = [makeRow({ name: 'Alice', email: 'a@b.com' })]

      const result = prepareSubmission(makeFile(), mixedMappings, rows, false)

      expect(result.columnMapping).toEqual({ Name: 'name', Email: 'email' })
    })

    it('returns null column mapping when no fields are mapped', () => {
      const emptyMappings: ColumnMapping[] = [
        makeMapping('Junk1', null),
        makeMapping('Junk2', null),
      ]
      const rows = [makeRow({ name: 'Alice', email: 'a@b.com' })]

      const result = prepareSubmission(makeFile(), emptyMappings, rows, false)

      expect(result.columnMapping).toBeNull()
    })
  })
})
