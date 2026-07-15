import type { ImportRow } from './types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9\-().\s+]+$/
const SOCIAL_HANDLE_REGEX = /^[a-z0-9._]+$/i
const MAX_SOCIAL_HANDLE_LENGTH = 30
const MAX_AFFILIATION_LENGTH = 5000
const URL_REGEX = /^https?:\/\/.+/i

/**
 * Validate a single import row. Returns errors keyed by field.
 */
export function validateRow(row: ImportRow): Record<string, string[]> {
  const errors: Record<string, string[]> = {}

  const addError = (field: string, message: string) => {
    if (!errors[field]) errors[field] = []
    errors[field].push(message)
  }

  // Name: required
  const name = String(row.name ?? '').trim()
  if (!name) {
    addError('name', 'Name is required')
  }

  // Email: valid format if present
  const email = String(row.email ?? '').trim()
  if (email && !EMAIL_REGEX.test(email)) {
    addError('email', 'Invalid email format')
  }

  // Phone: digits, dashes, parens, spaces, dots, plus
  const phone = String(row.phone ?? '').trim()
  if (phone && !PHONE_REGEX.test(phone)) {
    addError('phone', 'Invalid phone format')
  }

  // Instagram handle
  const ig = String(row.instagram_handle ?? '').trim()
  if (ig) {
    const cleaned = ig.replace(/^@/, '')
    if (!SOCIAL_HANDLE_REGEX.test(cleaned)) {
      addError('instagram_handle', 'Letters, numbers, periods, and underscores only')
    } else if (cleaned.length > MAX_SOCIAL_HANDLE_LENGTH) {
      addError('instagram_handle', `Max ${MAX_SOCIAL_HANDLE_LENGTH} characters`)
    }
  }

  // TikTok handle
  const tt = String(row.tiktok_handle ?? '').trim()
  if (tt) {
    const cleaned = tt.replace(/^@/, '')
    if (!SOCIAL_HANDLE_REGEX.test(cleaned)) {
      addError('tiktok_handle', 'Letters, numbers, periods, and underscores only')
    } else if (cleaned.length > MAX_SOCIAL_HANDLE_LENGTH) {
      addError('tiktok_handle', `Max ${MAX_SOCIAL_HANDLE_LENGTH} characters`)
    }
  }

  // Website: valid URL
  const website = String(row.website ?? '').trim()
  if (website && !URL_REGEX.test(website)) {
    // Try with https:// prefix
    if (!URL_REGEX.test(`https://${website}`)) {
      addError('website', 'Must be a valid URL')
    }
  }

  // Affiliation: max length
  const affiliation = String(row.affiliation ?? '').trim()
  if (affiliation && affiliation.length > MAX_AFFILIATION_LENGTH) {
    addError('affiliation', `Max ${MAX_AFFILIATION_LENGTH} characters`)
  }

  return errors
}

/**
 * Validate all rows. Mutates _errors and _status in place for performance.
 * Returns count of error rows.
 */
export function validateAllRows(rows: ImportRow[]): number {
  let errorCount = 0
  for (const row of rows) {
    if (row._skipped) continue
    const errors = validateRow(row)
    row._errors = errors
    row._status = Object.keys(errors).length > 0 ? 'error' : 'valid'
    if (row._status === 'error') errorCount++
  }
  return errorCount
}

/**
 * Get row-level status for a single row after edit.
 */
export function revalidateRow(row: ImportRow): { errors: Record<string, string[]>; status: ImportRow['_status'] } {
  const errors = validateRow(row)
  const status: ImportRow['_status'] = Object.keys(errors).length > 0 ? 'error' : 'valid'
  return { errors, status }
}
