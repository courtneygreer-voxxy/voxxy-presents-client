/**
 * Timezone Utilities
 *
 * Handles timezone detection and conversion for scheduled emails.
 * All emails send at 8:00 AM in the user's local timezone.
 */

/**
 * Get the user's current timezone
 * Returns IANA timezone identifier (e.g., "America/New_York", "America/Los_Angeles")
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Failed to detect timezone, defaulting to America/New_York');
    return 'America/New_York'; // Default fallback
  }
}

/**
 * Get timezone abbreviation (e.g., "PST", "EST")
 */
export function getTimezoneAbbreviation(): string {
  try {
    const timezone = getUserTimezone();
    const now = new Date();

    // Get the short timezone string
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });

    const parts = formatter.formatToParts(now);
    const tzPart = parts.find(part => part.type === 'timeZoneName');

    return tzPart?.value || 'Local Time';
  } catch (error) {
    return 'Local Time';
  }
}

/**
 * Get timezone offset in minutes
 * Positive for west of UTC, negative for east of UTC
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Convert 8:00 AM in user's local timezone to UTC time string (HH:MM format)
 *
 * Example:
 * - User in California (PST, UTC-8): 8:00 AM PST → 16:00 UTC
 * - User in New York (EST, UTC-5): 8:00 AM EST → 13:00 UTC
 * - User in London (GMT, UTC+0): 8:00 AM GMT → 08:00 UTC
 */
export function getEightAmLocalAsUTC(): string {
  // Create a date object for today at 8:00 AM local time
  const now = new Date();
  const localEightAm = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    8, // 8:00 AM
    0, // 0 minutes
    0  // 0 seconds
  );

  // Get UTC hours and minutes
  const utcHours = localEightAm.getUTCHours();
  const utcMinutes = localEightAm.getUTCMinutes();

  // Format as HH:MM
  return `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;
}

/**
 * Convert UTC time string to local time display
 *
 * @param utcTimeString - Time in HH:MM format (UTC)
 * @returns Local time display string (e.g., "8:00 AM PST")
 */
export function utcToLocalTimeDisplay(utcTimeString: string): string {
  if (!utcTimeString || !utcTimeString.includes(':')) {
    return '8:00 AM (your time)';
  }

  try {
    const [hours, minutes] = utcTimeString.split(':').map(Number);

    // Create a UTC date
    const utcDate = new Date();
    utcDate.setUTCHours(hours, minutes, 0, 0);

    // Format in local timezone
    const localTime = utcDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: getUserTimezone()
    });

    const tzAbbr = getTimezoneAbbreviation();

    return `${localTime} ${tzAbbr}`;
  } catch (error) {
    return '8:00 AM (your time)';
  }
}

/**
 * Check if a UTC time string represents 8:00 AM in user's local timezone
 * Useful for validation
 */
export function isEightAmLocal(utcTimeString: string): boolean {
  const expectedUtc = getEightAmLocalAsUTC();
  return utcTimeString === expectedUtc;
}

/**
 * Get timezone info for display
 */
export function getTimezoneInfo() {
  const timezone = getUserTimezone();
  const abbreviation = getTimezoneAbbreviation();
  const offsetMinutes = getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const offsetMins = Math.abs(offsetMinutes % 60);
  const offsetSign = offsetMinutes <= 0 ? '+' : '-'; // Note: JS offset is inverted

  return {
    timezone,
    abbreviation,
    offsetMinutes,
    offsetString: `UTC${offsetSign}${offsetHours}${offsetMins > 0 ? `:${offsetMins.toString().padStart(2, '0')}` : ''}`,
    eightAmUtc: getEightAmLocalAsUTC(),
    eightAmLocal: `8:00 AM ${abbreviation}`
  };
}

/**
 * Format a date with timezone
 */
export function formatDateWithTimezone(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleString('en-US', {
    timeZone: getUserTimezone(),
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Example usage and testing (can be removed in production)
if (typeof window !== 'undefined') {
  console.log('🌍 Timezone Detection:');
  console.log('  User Timezone:', getUserTimezone());
  console.log('  Abbreviation:', getTimezoneAbbreviation());
  console.log('  Offset:', getTimezoneOffset(), 'minutes');
  console.log('  8:00 AM Local as UTC:', getEightAmLocalAsUTC());
  console.log('  Display:', utcToLocalTimeDisplay(getEightAmLocalAsUTC()));
  console.log('  Full Info:', getTimezoneInfo());
}
