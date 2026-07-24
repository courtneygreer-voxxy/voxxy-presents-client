import type { ImportRow } from './types'
import { validateEmail } from '@/utils/validation'

// Lenient phone format check: allows digits, dashes, parens, dots, spaces, +.
// Intentionally different from validatePhone() in utils/validation.ts which
// enforces US 10-digit format — CSV imports may contain international numbers.
const PHONE_REGEX = /^[0-9\-().\s+]+$/
const SOCIAL_HANDLE_REGEX = /^[a-z0-9._]+$/
const MAX_SOCIAL_HANDLE_LENGTH = 30
const MAX_AFFILIATION_LENGTH = 5000

/**
 * Normalize a social handle the same way the backend does:
 *   1. Extract handle from Instagram/TikTok profile URL (if pasted)
 *   2. Strip leading @
 *   3. Lowercase
 *
 * Mirrors VendorContactFieldRules.normalize_social_handle so the frontend
 * validation matches what the backend will actually store.
 */
function normalizeSocialHandle(raw: string): string {
  let cleaned = raw.trim()
  if (!cleaned) return ''

  // Extract handle from profile URL (same regexes as backend extract_handle_from_url)
  const igMatch = cleaned.match(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/@?([^/?#]+)/i)
  if (igMatch) return igMatch[1].toLowerCase()

  const ttMatch = cleaned.match(/^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([^/?#]+)/i)
  if (ttMatch) return ttMatch[1].toLowerCase()

  // Strip @ prefix, lowercase
  cleaned = cleaned.replace(/^@/, '').trim().toLowerCase()
  return cleaned
}

/**
 * Only warn if the NORMALIZED handle is still invalid — don't warn about
 * URLs, @-prefixes, or casing that we auto-clean on import.
 */
function socialHandleError(raw: string): string | null {
  const normalized = normalizeSocialHandle(raw)
  if (!normalized) return null

  if (normalized.includes(' ')) {
    return 'Handle contains spaces'
  }
  if (!SOCIAL_HANDLE_REGEX.test(normalized)) {
    return 'Handle has characters we can\'t auto-fix (only letters, numbers, periods, underscores)'
  }
  if (normalized.length > MAX_SOCIAL_HANDLE_LENGTH) {
    return `Handle is too long (max ${MAX_SOCIAL_HANDLE_LENGTH} characters)`
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
  /** Non-blocking: formatting issues the producer may fix inline.
   *  The server also treats these as warnings — rows import even if unfixed. */
  warnings: Record<string, string[]>
}

/**
 * Validate a single import row.
 *
 * Severity model: the ONLY blocking errors are a missing first name (a single
 * Full Name column also satisfies this) and a missing Email (our unique
 * identifier for matching/de-duping). Everything else — format nitpicks on
 * phone, socials, website, location, affiliation length — is a warning: we
 * surface it so the producer can clean their data inline. The backend also
 * treats these as warnings, so rows with only warnings still import.
 * Duplicate emails are a hard error, but those are only known server-side and
 * are surfaced at the validation step.
 */
export function validateRow(row: ImportRow): RowValidation {
  const errors: Record<string, string[]> = {}
  const warnings: Record<string, string[]> = {}

  const add = (bucket: Record<string, string[]>, field: string, message: string) => {
    if (!bucket[field]) bucket[field] = []
    bucket[field].push(message)
  }

  // ── Blocking errors ────────────────────────────────────────────────

  // First name is required. Files may provide either separate first/last name
  // columns or a single Full Name column, so the requirement is satisfied by
  // either. Attach the error to whichever name column is present in the row so
  // the offending cell highlights.
  const firstName = String(row.first_name ?? '').trim()
  const fullName = String(row.name ?? '').trim()
  if (!firstName && !fullName) {
    const field = row.first_name !== undefined ? 'first_name' : 'name'
    add(errors, field, 'First name is required')
  }

  const email = String(row.email ?? '').trim()
  if (!email) {
    add(errors, 'email', 'Email is required')
  }

  // ── Warnings ───────────────────────────────────────────────────────

  if (email && !validateEmail(email)) {
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
