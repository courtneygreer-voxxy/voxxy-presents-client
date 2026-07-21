/**
 * Auto-detect column mappings for Google Sheets payment sync.
 * Fields to match: email_column, phone_column, ticket_code_column, paid_status_column
 * Plus auto-detect the "paid value" by scanning column data.
 */

/** Normalize a header for comparison: lowercase, trim, underscores */
function normalize(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_')
}

// Headers that map to the email identifier column
const EMAIL_PATTERNS = [
  'email', 'e_mail', 'email_address', 'e_mail_address',
  'vendor_email', 'contact_email',
]

// Headers that map to the phone identifier column
const PHONE_PATTERNS = [
  'phone', 'phone_number', 'cell', 'cell_phone',
  'mobile', 'mobile_phone', 'telephone', 'tel',
]

// Headers that map to the ticket code column
const TICKET_CODE_PATTERNS = [
  'ticket_code', 'ticketcode', 'ticket', 'code',
  'application_code', 'confirmation_code', 'ref_code',
  'reference', 'ref',
]

// Headers that map to the paid status column
const PAID_STATUS_PATTERNS = [
  'payment_status', 'paid', 'payment', 'status',
  'paid_status', 'pay_status', 'is_paid',
]

// Common values that mean "paid" in a spreadsheet
const PAID_VALUE_CANDIDATES = [
  'TRUE', 'true', 'True',
  'YES', 'yes', 'Yes',
  'PAID', 'paid', 'Paid',
  'X', 'x',
  '1',
  'Completed', 'completed', 'COMPLETED',
]

export interface AutoDetectResult {
  emailColumn: string | null
  phoneColumn: string | null
  ticketCodeColumn: string | null
  paidStatusColumn: string | null
  paidValue: string | null
  confidence: 'high' | 'medium' | 'low'
}

function tryMatch(
  header: string,
  norm: string,
  patterns: string[],
): boolean {
  if (patterns.includes(norm)) return true
  if (patterns.some((p) => norm.includes(p) || p.includes(norm))) return true
  return false
}

/**
 * Auto-detect which sheet columns map to email, phone, ticket code, and paid status.
 * @param headers - column header strings from the sheet
 * @param sampleRows - first few data rows as arrays of strings (matching header order)
 */
export function autoDetectColumns(
  headers: string[],
  sampleRows?: string[][],
): AutoDetectResult {
  let emailColumn: string | null = null
  let phoneColumn: string | null = null
  let ticketCodeColumn: string | null = null
  let paidStatusColumn: string | null = null
  let paidValue: string | null = null
  let matchCount = 0

  for (const header of headers) {
    const norm = normalize(header)

    if (!emailColumn && tryMatch(header, norm, EMAIL_PATTERNS)) {
      emailColumn = header
      matchCount++
      continue
    }

    if (!phoneColumn && tryMatch(header, norm, PHONE_PATTERNS)) {
      phoneColumn = header
      matchCount++
      continue
    }

    if (!ticketCodeColumn && tryMatch(header, norm, TICKET_CODE_PATTERNS)) {
      ticketCodeColumn = header
      matchCount++
      continue
    }

    if (!paidStatusColumn && tryMatch(header, norm, PAID_STATUS_PATTERNS)) {
      paidStatusColumn = header
      matchCount++
      continue
    }
  }

  // Auto-detect paid value by scanning the paid status column's data
  if (paidStatusColumn && sampleRows && sampleRows.length > 0) {
    const colIndex = headers.indexOf(paidStatusColumn)
    if (colIndex >= 0) {
      const values = sampleRows
        .map((row) => row[colIndex]?.trim())
        .filter(Boolean)

      for (const candidate of PAID_VALUE_CANDIDATES) {
        if (values.some((v) => v === candidate)) {
          paidValue = candidate
          break
        }
      }
    }
  }

  // Default paid value if we found a status column but no data match
  if (paidStatusColumn && !paidValue) {
    paidValue = 'TRUE'
  }

  const confidence = matchCount >= 3 ? 'high' : matchCount >= 2 ? 'medium' : 'low'

  return { emailColumn, phoneColumn, ticketCodeColumn, paidStatusColumn, paidValue, confidence }
}
