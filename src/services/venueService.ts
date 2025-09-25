import {
  Venue,
  VenueSearchFilters,
  VenueSearchResult,
  VenueOwnerSignup,
  VenueContactRequest
} from '@/types/venue'
import { getApiUrl } from '@/config/environments'
import { rateLimitedFetch, rateLimitedPost } from '@/utils/rateLimitedFetch'

const API_BASE_URL = getApiUrl()

class VenueService {
  
  /**
   * Search venues with filters
   */
  async searchVenues(filters: VenueSearchFilters = {}): Promise<VenueSearchResult> {
    const params = new URLSearchParams()

    if (filters.location) params.append('location', filters.location)
    if (filters.capacity?.min !== undefined) {
      params.append('capacity_min', filters.capacity.min.toString())
    }
    if (filters.capacity?.max !== undefined) {
      params.append('capacity_max', filters.capacity.max.toString())
    }
    if (filters.pricingType && filters.pricingType !== 'both') {
      params.append('pricing_type', filters.pricingType)
    }

    try {
      const response = await rateLimitedFetch(`${API_BASE_URL}/venues?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        rateLimitKey: 'venue-search'
      })

      if (!response.ok) {
        throw new Error(`Failed to search venues: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error searching venues:', error)
      throw error
    }
  }

  /**
   * Get venue by slug
   */
  async getVenueBySlug(slug: string): Promise<Venue> {
    try {
      const response = await fetch(`${API_BASE_URL}/venues/${slug}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Venue not found')
        }
        throw new Error(`Failed to fetch venue: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching venue:', error)
      throw error
    }
  }

  /**
   * Get venue by ID
   */
  async getVenueById(id: string): Promise<Venue> {
    try {
      const response = await fetch(`${API_BASE_URL}/venues/by-id/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Venue not found')
        }
        throw new Error(`Failed to fetch venue: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching venue by ID:', error)
      throw error
    }
  }

  /**
   * Quick venue search for event creation (autocomplete)
   */
  async quickSearchVenues(query: string): Promise<Venue[]> {
    if (!query.trim()) return []

    const params = new URLSearchParams({
      location: query,
      limit: '10',
      fields: 'id,slug,name,address,venueType'
    })

    try {
      const response = await fetch(`${API_BASE_URL}/venues/search?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to search venues: ${response.statusText}`)
      }

      const result = await response.json()
      return result.venues || []
    } catch (error) {
      console.error('Error in quick venue search:', error)
      return []
    }
  }

  /**
   * Submit venue owner signup
   */
  async submitVenueOwnerSignup(signup: VenueOwnerSignup): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/venue-owner-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signup),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit signup')
      }

      return result
    } catch (error) {
      console.error('Error submitting venue owner signup:', error)
      throw error
    }
  }

  /**
   * Send contact request to venue
   */
  async sendVenueContactRequest(request: VenueContactRequest): Promise<{ success: boolean; message: string }> {
    try {
      return await rateLimitedPost(`${API_BASE_URL}/venues/${request.venueId}/contact`, request, {
        rateLimitKey: `venue-contact:${request.venueId}`
      })
    } catch (error) {
      console.error('Error sending venue contact request:', error)
      throw error
    }
  }
}

// Create singleton instance
export const venueService = new VenueService()
export default venueService