// Event Portal API Service
// Handles vendor portal authentication and data fetching

import { getApiUrl } from '@/config/environments'
import type {
  VerifyAccessRequest,
  VerifyAccessResponse,
  EventPortalData,
  PortalApiResponse,
  PortalSession,
} from '@/types/eventPortal'

const API_BASE_URL = getApiUrl() || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Portal session token management (separate from regular auth)
const PORTAL_SESSION_KEY = 'vendorPortalSession'

export function savePortalSession(session: PortalSession): void {
  try {
    localStorage.setItem(PORTAL_SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('Failed to save portal session:', error)
  }
}

export function getPortalSession(): PortalSession | null {
  try {
    const sessionData = localStorage.getItem(PORTAL_SESSION_KEY)
    if (!sessionData) return null

    const session: PortalSession = JSON.parse(sessionData)

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      clearPortalSession()
      return null
    }

    return session
  } catch (error) {
    console.error('Failed to get portal session:', error)
    return null
  }
}

export function clearPortalSession(): void {
  try {
    localStorage.removeItem(PORTAL_SESSION_KEY)
  } catch (error) {
    console.error('Failed to clear portal session:', error)
  }
}

class PortalApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'PortalApiError'
  }
}

/**
 * Verify vendor access to event portal
 * POST /api/v1/presents/portals/verify
 */
export async function verifyPortalAccess(
  request: VerifyAccessRequest
): Promise<VerifyAccessResponse> {
  const url = `${API_BASE_URL}/v1/presents/portals/verify`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    const data: VerifyAccessResponse = await response.json()

    if (!response.ok) {
      throw new PortalApiError(
        data.error || 'Access verification failed',
        response.status
      )
    }

    // If access granted, save session
    if (data.access_granted && data.portal_token && data.event_slug) {
      const session: PortalSession = {
        token: data.portal_token,
        eventSlug: data.event_slug,
        email: request.email,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }
      savePortalSession(session)
    }

    return data
  } catch (error) {
    if (error instanceof PortalApiError) {
      throw error
    }
    console.error('Portal access verification error:', error)
    throw new PortalApiError(
      'Network error. Please check your connection and try again.',
      0
    )
  }
}

/**
 * Fetch event portal data by access token (primary method)
 * GET /api/v1/presents/portals/token/:access_token
 */
export async function fetchPortalDataByToken(accessToken: string): Promise<EventPortalData> {
  const session = getPortalSession()

  if (!session) {
    throw new PortalApiError('No active portal session. Please log in again.', 401)
  }

  const url = `${API_BASE_URL}/v1/presents/portals/token/${accessToken}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Portal-Token': session.token,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        clearPortalSession()
        throw new PortalApiError('Session expired. Please log in again.', 401)
      }

      const errorData = await response.json().catch(() => ({
        error: 'Failed to fetch portal data',
      }))

      throw new PortalApiError(
        errorData.error || 'Failed to fetch portal data',
        response.status
      )
    }

    const result: PortalApiResponse = await response.json()
    return result.data
  } catch (error) {
    if (error instanceof PortalApiError) {
      throw error
    }
    console.error('Portal data fetch error:', error)
    throw new PortalApiError(
      'Network error. Please check your connection and try again.',
      0
    )
  }
}

/**
 * Fetch event portal data by event slug (legacy method for backward compatibility)
 * GET /api/v1/presents/portals/:event_slug
 */
export async function fetchPortalData(eventSlug: string): Promise<EventPortalData> {
  const session = getPortalSession()

  if (!session) {
    throw new PortalApiError('No active portal session. Please log in again.', 401)
  }

  const url = `${API_BASE_URL}/v1/presents/portals/${encodeURIComponent(eventSlug)}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Portal-Token': session.token,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        clearPortalSession()
        throw new PortalApiError('Session expired. Please log in again.', 401)
      }

      const errorData = await response.json().catch(() => ({
        error: 'Failed to fetch portal data',
      }))

      throw new PortalApiError(
        errorData.error || 'Failed to fetch portal data',
        response.status
      )
    }

    const result: PortalApiResponse = await response.json()
    return result.data
  } catch (error) {
    if (error instanceof PortalApiError) {
      throw error
    }
    console.error('Portal data fetch error:', error)
    throw new PortalApiError(
      'Network error. Please check your connection and try again.',
      0
    )
  }
}

/**
 * Check if user has an active portal session for a specific event
 */
export function hasActiveSession(eventSlug?: string): boolean {
  const session = getPortalSession()
  if (!session) return false
  if (eventSlug && session.eventSlug !== eventSlug) return false
  return true
}
