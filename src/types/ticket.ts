// Digital Ticket Types for v1.9.0 Email & Notification System

export interface DigitalTicket {
  // Unique identifiers
  id: string                    // Database ID
  ticketId: string             // Human-readable ticket ID (e.g., "BHC-001-ABCD")

  // Event and attendee information
  eventId: string              // Reference to event
  attendeeEmail: string        // Attendee contact
  attendeeName: string         // Attendee display name
  rsvpStatus: 'going' | 'maybe' // RSVP status

  // Ticket access data
  qrCode: string               // Base64 QR code image
  accessCode: string           // 6-digit backup access code

  // Validation and security
  isScanned: boolean           // Whether ticket has been used
  scannedAt?: Date             // When ticket was scanned
  validUntil: Date             // Ticket expiration (typically after event ends)

  // Metadata
  createdAt: Date              // When ticket was generated
  updatedAt?: Date             // Last modification
  organizationId: string       // Club/organization reference
}

export interface QRTicketData {
  // JWT payload for QR code validation
  ticketId: string             // Unique ticket identifier
  eventId: string              // Event reference
  attendeeEmail: string        // Email for validation
  rsvpStatus: 'going' | 'maybe' // Status verification
  issuedAt: number             // Unix timestamp
  expiresAt: number            // Unix timestamp
  organizationId: string       // Club reference
}

export interface TicketValidationResult {
  valid: boolean               // Whether ticket is valid
  message: string              // Validation message
  attendeeName?: string        // Attendee name if valid
  eventName?: string           // Event name if valid
  rsvpStatus?: 'going' | 'maybe' // RSVP status if valid
  alreadyScanned?: boolean     // If ticket was already used
  expired?: boolean            // If ticket is expired
}

export interface QRCodeOptions {
  // QR code generation options
  width?: number               // QR code image width (default: 200)
  height?: number              // QR code image height (default: 200)
  color?: {
    dark?: string              // Dark color (default: #000000)
    light?: string             // Light color (default: #ffffff)
  }
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' // Error correction level
  margin?: number              // Margin around QR code
}

export interface TicketEmailData {
  // Data for email template rendering
  attendeeName: string
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  organizationName: string
  qrCodeBase64: string         // Base64 QR code for email
  accessCode: string           // 6-digit backup code
  rsvpStatus: 'going' | 'maybe'
  calendarLink?: string        // ICS calendar download link
  unsubscribeLink?: string     // Unsubscribe link
}

export interface CalendarEvent {
  // ICS calendar file data
  title: string                // Event title
  description: string          // Event description
  location: string             // Event location
  startDate: Date              // Event start date/time
  endDate: Date                // Event end date/time
  organizerEmail: string       // Organizer contact
  organizerName: string        // Organizer name
  url?: string                 // Event URL
}

// Utility types for ticket generation
export type TicketGenerationRequest = {
  eventId: string
  attendeeEmail: string
  attendeeName: string
  rsvpStatus: 'going' | 'maybe'
  organizationId: string
}

export type TicketGenerationResponse = {
  success: boolean
  ticket?: DigitalTicket
  error?: string
}

// Scanner interface for admin ticket validation
export interface TicketScannerState {
  isScanning: boolean
  lastScanResult?: TicketValidationResult
  scanError?: string
}

// Statistics for admin dashboard
export interface TicketStats {
  totalGenerated: number       // Total tickets generated
  totalScanned: number         // Total tickets scanned
  goingTickets: number         // "Going" RSVP tickets
  maybeTickets: number         // "Maybe" RSVP tickets
  expiredTickets: number       // Expired tickets
  validTickets: number         // Currently valid tickets
}

// Email template data structure
export interface TicketEmailTemplate {
  subject: string
  htmlContent: string
  textContent: string
  variables: (keyof TicketEmailData)[] // Available template variables
}