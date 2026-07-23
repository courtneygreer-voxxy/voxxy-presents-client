import Papa from 'papaparse'
import type { ImportRow, ColumnMapping } from './types'
import { RECOGNIZED_FIELD_KEYS, NAME_PART_KEYS } from './constants'

/** Backend-canonical fields — first_name/last_name fold into `name` on submit. */
const SUBMISSION_FIELD_KEYS = RECOGNIZED_FIELD_KEYS.filter(
  (key) => !NAME_PART_KEYS.includes(key as (typeof NAME_PART_KEYS)[number]),
)

/** Join first + last name for a row, falling back to an explicit Full Name. */
function resolveName(row: ImportRow): string {
  const explicit = String(row.name ?? '').trim()
  if (explicit) return explicit
  return NAME_PART_KEYS.map((key) => String(row[key] ?? '').trim())
    .filter(Boolean)
    .join(' ')
}

/**
 * Build the file + column_mapping to send to the server.
 *
 * - If no cells were edited / rows skipped / name parts to join: return the
 *   original file + column_mapping JSON (backend applies the mapping).
 * - Otherwise: reconstruct the CSV with canonical headers using Papa.unparse().
 *   First name + last name are joined into a single canonical `name` column,
 *   since the backend stores one name field.
 */
export function prepareSubmission(
  originalFile: File,
  mappings: ColumnMapping[],
  importRows: ImportRow[],
  cellsEdited: boolean,
): { file: File; columnMapping: Record<string, string> | null } {
  // Build column mapping: csvHeader → recognizedFieldKey (backend fields only)
  const columnMapping: Record<string, string> = {}
  for (const m of mappings) {
    if (m.mappedTo && SUBMISSION_FIELD_KEYS.includes(m.mappedTo)) {
      columnMapping[m.csvHeader] = m.mappedTo
    }
  }

  const hasSkippedRows = importRows.some((r) => r._skipped)
  // first_name/last_name aren't backend fields, so whenever they're mapped we
  // must reconstruct the CSV to join them into `name`.
  const hasNameParts = mappings.some(
    (m) => m.mappedTo === 'first_name' || m.mappedTo === 'last_name',
  )

  if (!cellsEdited && !hasSkippedRows && !hasNameParts) {
    return {
      file: originalFile,
      columnMapping: Object.keys(columnMapping).length > 0 ? columnMapping : null,
    }
  }

  // Reconstruct CSV from edited importRows using canonical backend headers.
  const activeRows = importRows.filter((r) => !r._skipped)
  const activeFields = SUBMISSION_FIELD_KEYS.filter((key) => {
    if (key === 'name') {
      return mappings.some(
        (m) => m.mappedTo === 'name' || m.mappedTo === 'first_name' || m.mappedTo === 'last_name',
      )
    }
    return mappings.some((m) => m.mappedTo === key)
  })

  const csvData = activeRows.map((row) => {
    const obj: Record<string, string> = {}
    for (const field of activeFields) {
      obj[field] = field === 'name' ? resolveName(row) : String(row[field] ?? '')
    }
    return obj
  })

  const csvString = Papa.unparse(csvData, { header: true })
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const reconstructedFile = new File([blob], originalFile.name, { type: 'text/csv' })

  return {
    file: reconstructedFile,
    columnMapping: null, // Headers are already canonical
  }
}
