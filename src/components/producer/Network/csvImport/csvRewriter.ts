import Papa from 'papaparse'
import type { ImportRow, ColumnMapping } from './types'
import { RECOGNIZED_FIELD_KEYS } from './constants'

/**
 * Build the file + column_mapping to send to the server.
 *
 * - If no cells were edited: return the original file + column_mapping JSON
 * - If cells were edited: reconstruct CSV with canonical headers using Papa.unparse()
 */
export function prepareSubmission(
  originalFile: File,
  mappings: ColumnMapping[],
  importRows: ImportRow[],
  cellsEdited: boolean,
): { file: File; columnMapping: Record<string, string> | null } {
  // Build column mapping: csvHeader → recognizedFieldKey
  const columnMapping: Record<string, string> = {}
  for (const m of mappings) {
    if (m.mappedTo && RECOGNIZED_FIELD_KEYS.includes(m.mappedTo)) {
      columnMapping[m.csvHeader] = m.mappedTo
    }
  }

  if (!cellsEdited) {
    return {
      file: originalFile,
      columnMapping: Object.keys(columnMapping).length > 0 ? columnMapping : null,
    }
  }

  // Reconstruct CSV from edited importRows
  const activeRows = importRows.filter((r) => !r._skipped)
  const activeFields = RECOGNIZED_FIELD_KEYS.filter((key) =>
    mappings.some((m) => m.mappedTo === key),
  )

  const csvData = activeRows.map((row) => {
    const obj: Record<string, string> = {}
    for (const field of activeFields) {
      obj[field] = String(row[field] ?? '')
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
