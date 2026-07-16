import type { ImportRow } from './types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9\-().\s+]+$/
const SOCIAL_HANDLE_REGEX = /^[a-z0-9._]+$/i
const MAX_SOCIAL_HANDLE_LENGTH = 30
const MAX_AFFILIATION_LENGTH = 5000

/**
 * Producers often paste a full profile URL (e.g. "instagram.com/foo") into the
 * Instagram/TikTok handle field instead of the bare handle. The backend
 * (VendorContactFieldRules#extract_handle_from_url) strips the host and
 * accepts just the username — mirror that here so client-side validation
 * doesn't flag something the server will happily accept.
 */
function extractHandleFromUrl(cleaned: string): string {
  const igMatch = cleaned.match(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/@?([^/?#]+)/i)
  if (igMatch) return igMatch[1]

  const ttMatch = cleaned.match(/^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([^/?#]+)/i)
  if (ttMatch) return ttMatch[1]

  return cleaned
}

function socialHandleError(raw: string): string | null {
  const cleaned = extractHandleFromUrl(raw.trim()).replace(/^@/, '')
  if (cleaned.includes(' ')) {
    return 'Must not contain spaces (letters, numbers, periods, and underscores only)'
  }
  if (!SOCIAL_HANDLE_REGEX.test(cleaned)) {
    return 'Letters, numbers, periods, and underscores only'
  }
  if (cleaned.length > MAX_SOCIAL_HANDLE_LENGTH) {
    return `Max ${MAX_SOCIAL_HANDLE_LENGTH} characters`
  }
  return null
}

/**
 * Mirrors backend VendorContactFieldRules.normalize_website + WEBSITE_FORMAT:
 * bare domains get an https:// prefix, then the result must be a parseable URL.
 * Using the URL constructor instead of a hand-rolled regex catches malformed
 * URLs (e.g. "https://" with nothing after it) that a lenient regex would miss.
 */
function websiteError(raw: string): string | null {
  const cleaned = raw.trim()
  if (!cleaned) return null

  const candidate = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`

  try {
    const url = new URL(candidate)
    if (!url.hostname.includes('.')) return 'Must be a valid URL'
    return null
  } catch {
    return 'Must be a valid URL'
  }
}

export interface RowValidation {
  /** Blocking: row cannot be imported until fixed or skipped (missing Name/Email only) */
  errors: Record<string, string[]>
  /** Non-blocking in the preview: formatting issues the producer may fix inline.
   *  Note: the server's validate_row still rejects these — rows left unfixed will
   *  appear in the "Invalid rows (skipped)" count at the validation step. */
  warnings: Record<string, string[]>
}

/**
 * Validate a single import row.
 *
 * Severity model: the ONLY blocking errors are a missing Name (DB hard-requires
 * it) and a missing Email (our unique identifier for matching/de-duping).
 * Everything else — format nitpicks on phone, socials, website, location,
 * affiliation length — is a warning: we surface it so the producer can clean
 * their data inline. Rows left with warnings will be rejected by the backend's
 * validate_row and appear in the "Invalid rows (skipped)" count at the
 * validation step — they are not silently imported with bad data.
 */
export function validateRow(row: ImportRow): RowValidation {
  const errors: Record<string, string[]> = {}
  const warnings: Record<string, string[]> = {}

  const add = (bucket: Record<string, string[]>, field: string, message: string) => {
    if (!bucket[field]) bucket[field] = []
    bucket[field].push(message)
  }

  // ── Blocking errors ────────────────────────────────────────────────

  const name = String(row.name ?? '').trim()
  if (!name) {
    add(errors, 'name', 'Name is required')
  }

  const email = String(row.email ?? '').trim()
  if (!email) {
    add(errors, 'email', 'Email is required')
  }

  // ── Warnings ───────────────────────────────────────────────────────

  if (email && !EMAIL_REGEX.test(email)) {
    add(warnings, 'email', 'Email format looks invalid')
  }

  const phone = String(row.phone ?? '').trim()
  if (phone && !PHONE_REGEX.test(phone)) {
    add(warnings, 'phone', 'Phone format looks invalid')
  }

  const ig = String(row.instagram_handle ?? '').trim()
  if (ig) {
    const issue = socialHandleError(ig)
    if (issue) add(warnings, 'instagram_handle', issue)
  }

  const tt = String(row.tiktok_handle ?? '').trim()
  if (tt) {
    const issue = socialHandleError(tt)
    if (issue) add(warnings, 'tiktok_handle', issue)
  }

  const website = String(row.website ?? '').trim()
  if (website) {
    const issue = websiteError(website)
    if (issue) add(warnings, 'website', issue)
  }

  const location = String(row.location ?? '').trim()
  if (location && !location.includes(',')) {
    add(
      warnings,
      'location',
      "Consider 'City, State' format (e.g., 'San Francisco, CA')",
    )
  }

  const affiliation = String(row.affiliation ?? '').trim()
  if (affiliation && affiliation.length > MAX_AFFILIATION_LENGTH) {
    add(warnings, 'affiliation', `Max ${MAX_AFFILIATION_LENGTH} characters`)
  }

  return { errors, warnings }
}

function statusFrom(validation: RowValidation): ImportRow['_status'] {
  if (Object.keys(validation.errors).length > 0) return 'error'
  if (Object.keys(validation.warnings).length > 0) return 'warning'
  return 'valid'
}

/**
 * Validate all rows. Mutates _errors, _warnings, and _status in place for
 * performance. Returns count of blocking-error rows.
 */
export function validateAllRows(rows: ImportRow[]): number {
  let errorCount = 0
  for (const row of rows) {
    if (row._skipped) continue
    const validation = validateRow(row)
    row._errors = validation.errors
    row._warnings = validation.warnings
    row._status = statusFrom(validation)
    if (row._status === 'error') errorCount++
  }
  return errorCount
}

/**
 * Get row-level status for a single row after edit.
 */
export function revalidateRow(row: ImportRow): RowValidation & { status: ImportRow['_status'] } {
  const validation = validateRow(row)
  return { ...validation, status: statusFrom(validation) }
}
