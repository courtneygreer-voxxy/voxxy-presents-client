// QR Code Service for Digital Ticket Generation and Validation
// v1.9.0 Email & Notification System

import QRCode from 'qrcode';
import {
  DigitalTicket,
  QRTicketData,
  TicketValidationResult,
  QRCodeOptions,
  TicketGenerationRequest,
  TicketGenerationResponse
} from '@/types/ticket';

/**
 * QR Code Service for generating and validating digital tickets
 * Handles ticket creation, QR code generation, and validation
 */
export class QRCodeService {
  private get JWT_SECRET(): string {
    const secret = import.meta.env.VITE_JWT_SECRET;
    if (!secret) {
      throw new Error('VITE_JWT_SECRET environment variable is required for ticket generation');
    }
    return secret;
  }
  private readonly DEFAULT_EXPIRY_HOURS = 24; // Tickets expire 24 hours after event end

  /**
   * Generate a complete digital ticket with QR code
   */
  async generateTicket(request: TicketGenerationRequest): Promise<TicketGenerationResponse> {
    try {
      // Generate unique ticket ID
      const ticketId = this.generateTicketId(request.organizationId);

      // Generate 6-digit access code
      const accessCode = this.generateAccessCode();

      // Create ticket expiration (24 hours after event - would need event data)
      const validUntil = new Date();
      validUntil.setHours(validUntil.getHours() + this.DEFAULT_EXPIRY_HOURS);

      // Create QR ticket data for JWT
      const qrData: QRTicketData = {
        ticketId,
        eventId: request.eventId,
        attendeeEmail: request.attendeeEmail,
        rsvpStatus: request.rsvpStatus,
        issuedAt: Date.now(),
        expiresAt: validUntil.getTime(),
        organizationId: request.organizationId
      };

      // Generate QR code with signed JWT
      const qrCode = await this.generateQRCode(qrData);

      // Create complete digital ticket
      const ticket: DigitalTicket = {
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ticketId,
        eventId: request.eventId,
        attendeeEmail: request.attendeeEmail,
        attendeeName: request.attendeeName,
        rsvpStatus: request.rsvpStatus,
        qrCode,
        accessCode,
        isScanned: false,
        validUntil,
        createdAt: new Date(),
        organizationId: request.organizationId
      };

      return {
        success: true,
        ticket
      };

    } catch (error) {
      console.error('Ticket generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate QR code image from ticket data
   */
  private async generateQRCode(
    ticketData: QRTicketData,
    options?: QRCodeOptions
  ): Promise<string> {
    // Create signed JWT token (simplified - in production use proper JWT library)
    const token = this.createSimpleJWT(ticketData);

    // QR code generation options
    const qrOptions = {
      width: options?.width || 200,
      height: options?.height || 200,
      color: {
        dark: options?.color?.dark || '#7c3aed', // Purple theme
        light: options?.color?.light || '#ffffff'
      },
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      margin: options?.margin || 2
    };

    try {
      // Generate QR code as base64 image
      const qrCodeDataURL = await QRCode.toDataURL(token, qrOptions);
      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`QR code generation failed: ${error}`);
    }
  }

  /**
   * Validate a QR code ticket
   */
  async validateTicket(qrCodeData: string): Promise<TicketValidationResult> {
    try {
      // Extract JWT token from QR code data
      const token = this.extractTokenFromQR(qrCodeData);

      // Verify and decode JWT
      const ticketData = this.verifySimpleJWT(token);

      if (!ticketData) {
        return {
          valid: false,
          message: 'Invalid or corrupted ticket'
        };
      }

      // Check expiration
      if (Date.now() > ticketData.expiresAt) {
        return {
          valid: false,
          message: 'Ticket has expired',
          expired: true
        };
      }

      // TODO: Check if ticket was already scanned (would require database lookup)
      // For now, we'll assume it's valid if JWT is valid and not expired

      return {
        valid: true,
        message: 'Valid ticket',
        attendeeName: 'Ticket Holder', // TODO: Get from database
        eventName: 'Event Name', // TODO: Get from database
        rsvpStatus: ticketData.rsvpStatus,
        alreadyScanned: false // TODO: Check database
      };

    } catch (error) {
      return {
        valid: false,
        message: 'Invalid ticket format'
      };
    }
  }

  /**
   * Validate ticket by access code (backup method)
   */
  async validateByAccessCode(accessCode: string): Promise<TicketValidationResult> {
    // TODO: Implement database lookup by access code
    // For now, return placeholder validation

    if (accessCode.length !== 6 || !/^\d{6}$/.test(accessCode)) {
      return {
        valid: false,
        message: 'Access code must be 6 digits'
      };
    }

    // In real implementation, would lookup ticket by access code in database
    return {
      valid: true,
      message: 'Valid access code',
      attendeeName: 'Ticket Holder',
      eventName: 'Event Name',
      rsvpStatus: 'going'
    };
  }

  /**
   * Generate unique ticket ID with organization prefix
   */
  private generateTicketId(organizationId: string): string {
    // Extract organization prefix (e.g., "brooklyn-hearts-club" -> "BHC")
    const prefix = this.getOrganizationPrefix(organizationId);

    // Generate random suffix
    const suffix = Math.random().toString(36).substr(2, 8).toUpperCase();

    // Generate sequential number (in real implementation, would be from database)
    const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');

    return `${prefix}-${sequence}-${suffix}`;
  }

  /**
   * Extract organization prefix from ID
   */
  private getOrganizationPrefix(organizationId: string): string {
    // Convert organization slug to prefix
    const words = organizationId.split('-');
    if (words.length >= 3) {
      return words.slice(0, 3).map(word => word.charAt(0).toUpperCase()).join('');
    } else if (words.length === 2) {
      return words.map(word => word.substring(0, 2).toUpperCase()).join('');
    } else {
      return organizationId.substring(0, 3).toUpperCase();
    }
  }

  /**
   * Generate 6-digit access code
   */
  private generateAccessCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create simple JWT token (simplified implementation)
   * In production, use proper JWT library like 'jsonwebtoken'
   */
  private createSimpleJWT(data: QRTicketData): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(data));

    // Simplified signature (in production, use proper HMAC)
    const signature = btoa(`${header}.${payload}.${this.JWT_SECRET}`).substring(0, 16);

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Verify simple JWT token
   */
  private verifySimpleJWT(token: string): QRTicketData | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [header, payload, signature] = parts;

      // Verify signature (simplified)
      const expectedSignature = btoa(`${header}.${payload}.${this.JWT_SECRET}`).substring(0, 16);
      if (signature !== expectedSignature) return null;

      // Decode payload
      const data = JSON.parse(atob(payload));
      return data as QRTicketData;
    } catch {
      return null;
    }
  }

  /**
   * Extract token from QR code data
   */
  private extractTokenFromQR(qrData: string): string {
    // QR code might contain just the token or a full URL
    // Handle both cases
    if (qrData.includes('://')) {
      // Extract token from URL
      const url = new URL(qrData);
      return url.searchParams.get('token') || url.pathname.split('/').pop() || qrData;
    }
    return qrData;
  }

  /**
   * Mark ticket as scanned (for admin use)
   */
  async markTicketScanned(ticketId: string): Promise<boolean> {
    // TODO: Update database to mark ticket as scanned
    // For now, return success
    console.log(`Marking ticket ${ticketId} as scanned`);
    return true;
  }

  /**
   * Get ticket statistics for admin dashboard
   */
  async getTicketStats(eventId: string): Promise<{
    totalGenerated: number;
    totalScanned: number;
    goingTickets: number;
    maybeTickets: number;
  }> {
    // TODO: Query database for actual statistics
    // For now, return mock data
    return {
      totalGenerated: 45,
      totalScanned: 12,
      goingTickets: 38,
      maybeTickets: 7
    };
  }
}

// Export lazy singleton instance
let _qrCodeServiceInstance: QRCodeService | null = null;

export const qrCodeService = {
  get instance(): QRCodeService {
    if (!_qrCodeServiceInstance) {
      _qrCodeServiceInstance = new QRCodeService();
    }
    return _qrCodeServiceInstance;
  },

  // Proxy methods to maintain the same API
  async generateTicket(request: TicketGenerationRequest): Promise<TicketGenerationResponse> {
    return this.instance.generateTicket(request);
  },

  async generateQRCode(data: QRTicketData, options?: QRCodeOptions): Promise<string> {
    return this.instance.generateQRCode(data, options);
  },

  async validateTicket(qrData: string): Promise<TicketValidationResult> {
    return this.instance.validateTicket(qrData);
  },

  async validateByAccessCode(accessCode: string): Promise<TicketValidationResult> {
    return this.instance.validateByAccessCode(accessCode);
  }
};

// Export class for testing
export { QRCodeService as QRCodeServiceClass };