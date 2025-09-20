// Calendar Service for ICS File Generation
// v1.9.0 Email & Notification System

import { CalendarEvent } from '@/types/ticket';

/**
 * Calendar Service for generating ICS calendar files
 * Creates calendar attachments for email confirmations
 */
export class CalendarService {
  /**
   * Generate ICS calendar file content
   */
  generateICS(event: CalendarEvent): string {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Voxxy Presents//Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE',
      'TZID:America/New_York',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:-0500',
      'TZOFFSETTO:-0400',
      'TZNAME:EDT',
      'DTSTART:20070311T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:-0400',
      'TZOFFSETTO:-0500',
      'TZNAME:EST',
      'DTSTART:20071104T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `UID:${this.generateUID(event)}`,
      `DTSTART;TZID=America/New_York:${this.formatDateTime(event.startDate)}`,
      `DTEND;TZID=America/New_York:${this.formatDateTime(event.endDate)}`,
      `DTSTAMP:${this.formatDateTime(new Date())}`,
      `ORGANIZER;CN=${event.organizerName}:MAILTO:${event.organizerEmail}`,
      `SUMMARY:${this.escapeText(event.title)}`,
      `DESCRIPTION:${this.escapeText(event.description)}`,
      `LOCATION:${this.escapeText(event.location)}`,
      event.url ? `URL:${event.url}` : '',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(line => line !== '').join('\r\n');

    return icsContent;
  }

  /**
   * Generate calendar download link (data URI)
   */
  generateDownloadLink(event: CalendarEvent): string {
    const icsContent = this.generateICS(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  }

  /**
   * Generate Google Calendar link
   */
  generateGoogleCalendarLink(event: CalendarEvent): string {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${this.formatGoogleDateTime(event.startDate)}/${this.formatGoogleDateTime(event.endDate)}`,
      details: event.description,
      location: event.location,
      sprop: 'website:voxxypresents.com'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate Outlook calendar link
   */
  generateOutlookLink(event: CalendarEvent): string {
    const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
    const params = new URLSearchParams({
      subject: event.title,
      startdt: event.startDate.toISOString(),
      enddt: event.endDate.toISOString(),
      body: event.description,
      location: event.location,
      path: '/calendar/action/compose'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate Apple Calendar link (webcal)
   */
  generateAppleCalendarLink(event: CalendarEvent): string {
    // For Apple Calendar, we'll use the ICS file with webcal protocol
    // In a real implementation, you'd host the ICS file and return a webcal:// URL
    return `data:text/calendar;charset=utf8,${encodeURIComponent(this.generateICS(event))}`;
  }

  /**
   * Create calendar event from RSVP data
   */
  createEventFromRSVP(eventData: {
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    organizerEmail: string;
    organizerName: string;
    eventUrl?: string;
  }): CalendarEvent {
    return {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      startDate: eventData.startDate,
      endDate: eventData.endDate || new Date(eventData.startDate.getTime() + 2 * 60 * 60 * 1000), // Default 2 hours
      organizerEmail: eventData.organizerEmail,
      organizerName: eventData.organizerName,
      url: eventData.eventUrl
    };
  }

  /**
   * Format date/time for ICS format (YYYYMMDDTHHMMSS)
   */
  private formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }

  /**
   * Format date/time for Google Calendar (YYYYMMDDTHHMMSSZ)
   */
  private formatGoogleDateTime(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  /**
   * Escape text for ICS format
   */
  private escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')    // Escape backslashes
      .replace(/;/g, '\\;')      // Escape semicolons
      .replace(/,/g, '\\,')      // Escape commas
      .replace(/\n/g, '\\n')     // Escape newlines
      .replace(/\r/g, '');       // Remove carriage returns
  }

  /**
   * Generate unique UID for calendar event
   */
  private generateUID(event: CalendarEvent): string {
    // Create UID based on event details and timestamp
    const timestamp = Date.now();
    const hash = this.simpleHash(`${event.title}${event.startDate.toISOString()}${event.location}`);
    return `${timestamp}-${hash}@voxxypresents.com`;
  }

  /**
   * Simple hash function for UID generation
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Validate calendar event data
   */
  validateEvent(event: CalendarEvent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!event.title || event.title.trim() === '') {
      errors.push('Event title is required');
    }

    if (!event.startDate || isNaN(event.startDate.getTime())) {
      errors.push('Valid start date is required');
    }

    if (!event.endDate || isNaN(event.endDate.getTime())) {
      errors.push('Valid end date is required');
    }

    if (event.startDate && event.endDate && event.startDate >= event.endDate) {
      errors.push('End date must be after start date');
    }

    if (!event.organizerEmail || !this.isValidEmail(event.organizerEmail)) {
      errors.push('Valid organizer email is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Simple email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get calendar service URLs for all platforms
   */
  getAllCalendarLinks(event: CalendarEvent): {
    google: string;
    outlook: string;
    apple: string;
    ics: string;
  } {
    return {
      google: this.generateGoogleCalendarLink(event),
      outlook: this.generateOutlookLink(event),
      apple: this.generateAppleCalendarLink(event),
      ics: this.generateDownloadLink(event)
    };
  }
}

// Export singleton instance
export const calendarService = new CalendarService();

// Export for testing
export { CalendarService };