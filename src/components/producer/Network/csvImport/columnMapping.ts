import type { ColumnMapping, ImportRow } from './types'
import { RECOGNIZED_FIELD_KEYS, HEADER_ALIASES } from './constants'

/**
 * Normalize a CSV header for matching: lowercase, trim, replace spaces with underscores.
 */
function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_').replace(/^\uFEFF/, '')
}

/**
 * Collect first N non-empty sample values for a given header across rows.
 */
function sampleValues(header: string, rows: Record<string, string>[], count = 3): string[] {
  const samples: string[] = []
  for (const row of rows) {
    const val = row[header]?.trim()
    if (val) {
      samples.push(val)
      if (samples.length >= count) break
    }
  }
  return samples
}

/**
 * Auto-detect column mappings from CSV headers.
 * Returns one ColumnMapping per CSV column.
 */
export function autoDetectMappings(
  csvHeaders: string[],
  rows: Record<string, string>[],
): ColumnMapping[] {
  const claimed = new Set<string>()
  const mappings: ColumnMapping[] = []

  for (const header of csvHeaders) {
    const normalized = normalizeHeader(header)
    const samples = sampleValues(header, rows)

    // 1. Exact match
    if (RECOGNIZED_FIELD_KEYS.includes(normalized) && !claimed.has(normalized)) {
      claimed.add(normalized)
      mappings.push({ csvHeader: header, mappedTo: normalized, confidence: 'exact', sampleValues: samples })
      continue
    }

    // 2. Alias match
    const aliasTarget = HEADER_ALIASES[normalized]
    if (aliasTarget && !claimed.has(aliasTarget)) {
      claimed.add(aliasTarget)
      mappings.push({ csvHeader: header, mappedTo: aliasTarget, confidence: 'alias', sampleValues: samples })
      continue
    }

    // 3. Fuzzy substring match
    const fuzzyMatch = RECOGNIZED_FIELD_KEYS.find(
      (key) => !claimed.has(key) && (normalized.includes(key) || key.includes(normalized)),
    )
    if (fuzzyMatch) {
      claimed.add(fuzzyMatch)
      mappings.push({ csvHeader: header, mappedTo: fuzzyMatch, confidence: 'fuzzy', sampleValues: samples })
      continue
    }

    // 4. Alias target already claimed or no match
    if (aliasTarget && claimed.has(aliasTarget)) {
      mappings.push({ csvHeader: header, mappedTo: null, confidence: 'none', sampleValues: samples })
      continue
    }

    // 5. No match
    mappings.push({ csvHeader: header, mappedTo: null, confidence: 'none', sampleValues: samples })
  }

  return mappings
}

/**
 * Convert raw CSV rows + column mappings into ImportRows with mapped field keys.
 * First name and last name are kept as separate columns; they're only joined
 * into a single `name` at submission time (see csvRewriter).
 */
export function buildImportRows(
  rawRows: Record<string, string>[],
  mappings: ColumnMapping[],
): ImportRow[] {
  // Build header → field key map
  const headerToField = new Map<string, string>()
  for (const m of mappings) {
    if (m.mappedTo) headerToField.set(m.csvHeader, m.mappedTo)
  }

  return rawRows.map((raw, idx) => {
    const row: ImportRow = {
      _originalIndex: idx + 2, // 1-indexed + header row
      _skipped: false,
      _errors: {},
      _warnings: {},
      _status: 'valid',
    }

    for (const [csvHeader, fieldKey] of headerToField) {
      row[fieldKey] = raw[csvHeader]?.trim() ?? ''
    }

    return row
  })
}

/**
 * Check if the name requirement is satisfied — either a single Full Name column
 * or a First Name column is mapped. (Last name alone is not sufficient.)
 */
export function isNameMapped(mappings: ColumnMapping[]): boolean {
  return mappings.some((m) => m.mappedTo === 'name' || m.mappedTo === 'first_name')
}
