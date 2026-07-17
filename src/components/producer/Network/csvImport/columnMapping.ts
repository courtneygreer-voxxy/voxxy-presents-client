import type { ColumnMapping, ImportRow } from './types'
import { RECOGNIZED_FIELD_KEYS, HEADER_ALIASES, MERGE_FIELDS } from './constants'

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

    // 3. Merge field (first_name, last_name → name)
    const mergeField = MERGE_FIELDS[normalized]
    if (mergeField && !claimed.has(mergeField.target)) {
      // Don't claim yet — let both parts map. We'll merge in buildImportRows.
      mappings.push({ csvHeader: header, mappedTo: normalized, confidence: 'alias', sampleValues: samples })
      continue
    }

    // 4. Fuzzy substring match
    const fuzzyMatch = RECOGNIZED_FIELD_KEYS.find(
      (key) => !claimed.has(key) && (normalized.includes(key) || key.includes(normalized)),
    )
    if (fuzzyMatch) {
      claimed.add(fuzzyMatch)
      mappings.push({ csvHeader: header, mappedTo: fuzzyMatch, confidence: 'fuzzy', sampleValues: samples })
      continue
    }

    // 5. Alias target already claimed or no match
    if (aliasTarget && claimed.has(aliasTarget)) {
      mappings.push({ csvHeader: header, mappedTo: null, confidence: 'none', sampleValues: samples })
      continue
    }

    // 6. No match
    mappings.push({ csvHeader: header, mappedTo: null, confidence: 'none', sampleValues: samples })
  }

  return mappings
}

/**
 * Convert raw CSV rows + column mappings into ImportRows with mapped field keys.
 * Handles first_name + last_name merge into name.
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

  // Check for first_name/last_name merge
  const hasMerge = mappings.some((m) => {
    const norm = normalizeHeader(m.csvHeader)
    return MERGE_FIELDS[norm] !== undefined
  })
  const mergeHeaders: Record<string, string> = {}
  if (hasMerge) {
    for (const m of mappings) {
      const norm = normalizeHeader(m.csvHeader)
      if (MERGE_FIELDS[norm]) {
        mergeHeaders[norm] = m.csvHeader
      }
    }
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
      const norm = normalizeHeader(csvHeader)
      // Skip merge-source fields (they'll be combined into 'name')
      if (MERGE_FIELDS[norm]) continue
      row[fieldKey] = raw[csvHeader]?.trim() ?? ''
    }

    // Handle first_name + last_name → name merge
    // Collect ALL merge-source values regardless of naming convention
    // (handles mixed cases like `firstname` + `last_name`)
    if (Object.keys(mergeHeaders).length > 0 && ![...headerToField.values()].includes('name')) {
      const nameParts: string[] = []
      for (const csvHeader of Object.values(mergeHeaders)) {
        const val = raw[csvHeader]?.trim()
        if (val) nameParts.push(val)
      }
      if (nameParts.length > 0) {
        row.name = nameParts.join(' ')
      }
    }

    return row
  })
}

/**
 * Check if the required 'name' field is mapped (either directly or via merge fields).
 */
export function isNameMapped(mappings: ColumnMapping[]): boolean {
  // Direct name mapping
  if (mappings.some((m) => m.mappedTo === 'name')) return true

  // Merged via first_name + last_name
  const mergeNorms = mappings
    .filter((m) => m.mappedTo !== null)
    .map((m) => normalizeHeader(m.csvHeader))
  const hasFirstName = mergeNorms.some(
    (n) => n === 'first_name' || n === 'firstname',
  )
  const hasLastName = mergeNorms.some(
    (n) => n === 'last_name' || n === 'lastname',
  )
  return hasFirstName || hasLastName
}
