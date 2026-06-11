import { DateTime } from 'luxon'

/**
 * Parse an ISO date string into a Luxon DateTime object in the specified timezone
 * @param dateString ISO 8601 date string from backend (e.g., "2025-05-20T12:00:00Z")
 * @param timezone IANA timezone string (e.g., "America/Los_Angeles")
 * @returns Luxon DateTime object or null if invalid
 */
export const parseEventDate = (
  dateString: string | null | undefined,
  timezone: string = 'America/Los_Angeles',
): DateTime | null => {
  if (!dateString) return null

  try {
    return DateTime.fromISO(dateString, { zone: timezone })
  } catch (error) {
    console.error('Failed to parse date:', dateString, error)
    return null
  }
}

/**
 * Format a date for display
 * For date-only values (event dates, deadlines), preserves the date without timezone shift
 * @param dateString ISO 8601 date string from backend
 * @param format Luxon format string (default: "MMM d, yyyy")
 * @returns Formatted date string
 */
export const formatEventDate = (
  dateString: string | null | undefined,
  format: string = 'MMM d, yyyy',
): string => {
  if (!dateString) return ''

  try {
    // Parse as UTC to preserve the date value (prevent timezone shifting for date-only fields)
    const dt = DateTime.fromISO(dateString, { zone: 'utc' })
    if (!dt.isValid) return ''

    return dt.toFormat(format)
  } catch (error) {
    console.error('Failed to format date:', dateString, error)
    return ''
  }
}

/**
 * Format a datetime for display with time in the user's timezone
 * @param dateString ISO 8601 datetime string from backend
 * @param timezone IANA timezone string
 * @returns Formatted datetime string (e.g., "May 20, 2025 at 3:00 PM")
 */
export const formatEventDateTime = (
  dateString: string | null | undefined,
  timezone?: string,
): string => {
  const dt = parseEventDate(dateString, timezone)
  if (!dt || !dt.isValid) return ''

  return dt.toFormat("MMM d, yyyy 'at' h:mm a ZZZZ")
}

/**
 * Format just the time portion in the user's timezone
 * @param dateString ISO 8601 datetime string from backend
 * @param timezone IANA timezone string
 * @returns Formatted time string (e.g., "3:00 PM")
 */
export const formatEventTime = (
  dateString: string | null | undefined,
  timezone?: string,
): string => {
  const dt = parseEventDate(dateString, timezone)
  if (!dt || !dt.isValid) return ''

  return dt.toFormat('h:mm a')
}

/**
 * Get the timezone abbreviation for display (e.g., "PST", "PDT")
 * @param timezone IANA timezone string
 * @returns Timezone abbreviation
 */
export const getTimezoneAbbr = (timezone: string = 'America/Los_Angeles'): string => {
  const now = DateTime.now().setZone(timezone)
  return now.toFormat('ZZZZ')
}

/**
 * Check if a date is in the past
 * @param dateString ISO 8601 date string from backend
 * @param timezone IANA timezone string
 * @returns True if the date has passed
 */
export const isDatePast = (dateString: string | null | undefined, timezone?: string): boolean => {
  const dt = parseEventDate(dateString, timezone)
  if (!dt || !dt.isValid) return false

  const now = DateTime.now().setZone(timezone || 'America/Los_Angeles')
  return dt < now
}

/**
 * Get days until a date
 * @param dateString ISO 8601 date string from backend
 * @param timezone IANA timezone string
 * @returns Number of days until the date (negative if past)
 */
export const getDaysUntil = (dateString: string | null | undefined, timezone?: string): number => {
  const dt = parseEventDate(dateString, timezone)
  if (!dt || !dt.isValid) return 0

  const now = DateTime.now().setZone(timezone || 'America/Los_Angeles')
  return Math.ceil(dt.diff(now, 'days').days)
}

/**
 * Format a date for input fields (YYYY-MM-DD format)
 * Preserves the date value without timezone conversion (prevents off-by-one errors)
 * @param dateString ISO 8601 date string from backend
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return ''

  try {
    // For date-only inputs, we want to preserve the date value without timezone conversion
    // Parse as UTC and extract just the date portion
    const dt = DateTime.fromISO(dateString, { zone: 'utc' })
    if (!dt.isValid) return ''

    return dt.toFormat('yyyy-MM-dd')
  } catch (error) {
    console.error('Failed to format date for input:', dateString, error)
    return ''
  }
}

/**
 * Convert a local date input (YYYY-MM-DD) to ISO string for backend
 * @param dateString Date string from input field (YYYY-MM-DD)
 * @param timezone IANA timezone string
 * @returns ISO 8601 string for backend
 */
export const convertLocalDateToISO = (
  dateString: string,
  timezone: string = 'America/Los_Angeles',
): string | null => {
  if (!dateString) return null

  try {
    const dt = DateTime.fromISO(dateString, { zone: timezone })
    return dt.toISO()
  } catch (error) {
    console.error('Failed to convert date to ISO:', dateString, error)
    return null
  }
}
