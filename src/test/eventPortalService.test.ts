import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  verifyPortalAccess,
  fetchPortalData,
  savePortalSession,
  getPortalSession,
  clearPortalSession,
  hasActiveSession,
} from '../services/eventPortalService';
import type { VerifyAccessRequest, PortalSession } from '../types/eventPortal';

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Event Portal Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Session Management', () => {
    const mockSession: PortalSession = {
      token: 'test-jwt-token',
      eventSlug: 'summer-market',
      email: 'vendor@example.com',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    };

    it('should save portal session to localStorage', () => {
      savePortalSession(mockSession);

      const stored = localStorageMock.getItem('vendorPortalSession');
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toEqual(mockSession);
    });

    it('should retrieve valid portal session from localStorage', () => {
      savePortalSession(mockSession);

      const retrieved = getPortalSession();
      expect(retrieved).toEqual(mockSession);
    });

    it('should return null for expired session', () => {
      const expiredSession: PortalSession = {
        ...mockSession,
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      };
      savePortalSession(expiredSession);

      const retrieved = getPortalSession();
      expect(retrieved).toBeNull();
    });

    it('should clear portal session from localStorage', () => {
      savePortalSession(mockSession);
      expect(getPortalSession()).toBeTruthy();

      clearPortalSession();
      expect(getPortalSession()).toBeNull();
    });

    it('should check if active session exists', () => {
      expect(hasActiveSession()).toBe(false);

      savePortalSession(mockSession);
      expect(hasActiveSession()).toBe(true);
      expect(hasActiveSession('summer-market')).toBe(true);
      expect(hasActiveSession('other-event')).toBe(false);
    });
  });

  describe('verifyPortalAccess', () => {
    const mockRequest: VerifyAccessRequest = {
      event_slug: 'summer-market',
      email: 'vendor@example.com',
    };

    it('should verify access and save session on success', async () => {
      const mockResponse = {
        access_granted: true,
        portal_token: 'jwt-token-12345',
        event_slug: 'summer-market',
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verifyPortalAccess(mockRequest);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/presents/portals/verify'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockRequest),
        })
      );

      expect(result).toEqual(mockResponse);

      // Verify session was saved
      const session = getPortalSession();
      expect(session).toBeTruthy();
      expect(session?.token).toBe('jwt-token-12345');
      expect(session?.eventSlug).toBe('summer-market');
      expect(session?.email).toBe('vendor@example.com');
    });

    it('should handle email not found (not applied)', async () => {
      const mockResponse = {
        access_granted: false,
        error: 'Email not found. Please make sure you have applied to this event.',
      };

      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockResponse,
      });

      await expect(verifyPortalAccess(mockRequest)).rejects.toThrow(
        'Email not found. Please make sure you have applied to this event.'
      );
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(verifyPortalAccess(mockRequest)).rejects.toThrow(
        'Network error. Please check your connection and try again.'
      );
    });
  });

  describe('fetchPortalData', () => {
    const mockPortalData = {
      id: 1,
      view_count: 5,
      last_viewed_at: '2026-01-20T10:00:00Z',
      event: {
        id: 1,
        title: 'Summer Market 2026',
        slug: 'summer-market',
        description: 'A great summer market',
        dates: {
          event_date: '2026-06-15',
          event_end_date: '2026-06-15',
          start_time: '10:00',
          end_time: '18:00',
        },
        venue: 'Piedmont Park',
        location: 'Atlanta, GA',
        age_restriction: '21+',
        ticket_url: 'https://example.com/tickets',
        application_deadline: '2026-05-30',
        payment_deadline: '2026-06-01',
        organization: {
          id: 1,
          name: 'Voxxy Presents',
          slug: 'voxxy-presents',
        },
      },
      vendor_categories: [
        {
          id: 1,
          name: 'Food Vendor',
          description: 'Delicious food options',
          categories: ['Food', 'Beverage'],
          booth_price: 150,
          payment_link: 'https://example.com/pay/123',
          install: {
            install_date: '2026-06-14',
            install_start_time: '08:00',
            install_end_time: '10:00',
          },
          application_tags: [],
        },
      ],
      producer_updates: [],
    };

    beforeEach(() => {
      // Setup a valid session before each test
      const session: PortalSession = {
        token: 'valid-jwt-token',
        eventSlug: 'summer-market',
        email: 'vendor@example.com',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      savePortalSession(session);
    });

    it('should fetch portal data with valid session', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPortalData }),
      });

      const result = await fetchPortalData('summer-market');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/presents/portals/summer-market'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Portal-Token': 'valid-jwt-token',
          }),
        })
      );

      expect(result).toEqual(mockPortalData);
    });

    it('should throw error when no active session exists', async () => {
      clearPortalSession();

      await expect(fetchPortalData('summer-market')).rejects.toThrow(
        'No active portal session. Please log in again.'
      );
    });

    it('should handle expired session (401)', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid or expired session' }),
      });

      await expect(fetchPortalData('summer-market')).rejects.toThrow(
        'Session expired. Please log in again.'
      );

      // Verify session was cleared
      expect(getPortalSession()).toBeNull();
    });

    it('should handle event not found (404)', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Event not found' }),
      });

      await expect(fetchPortalData('non-existent-event')).rejects.toThrow('Event not found');
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network failure'));

      await expect(fetchPortalData('summer-market')).rejects.toThrow(
        'Network error. Please check your connection and try again.'
      );
    });
  });
});
