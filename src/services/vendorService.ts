/**
 * Vendor Service
 *
 * Generalized service layer for all vendor types (venues, catering, entertainment, market vendors)
 * Provides backward-compatible wrapper methods for existing venue code.
 */

import {
  Vendor,
  VendorType,
  VendorSearchFilters,
  VendorSearchResult,
  VendorContactRequest,
  VendorCreationRequest,
  // Backward-compatible imports
  Venue,
  VenueSearchFilters,
  VenueSearchResult,
  VenueOwnerSignup,
  VenueContactRequest,
  vendorToVenue,
  venueToVendor
} from '@/types/vendor'
import { getApiUrl } from '@/config/environments'
import { rateLimitedFetch, rateLimitedPost } from '@/utils/rateLimitedFetch'

const API_BASE_URL = getApiUrl()

class VendorService {

  // ==========================================
  // CORE VENDOR METHODS
  // ==========================================

  /**
   * Search vendors with filters (supports all vendor types)
   */
  async searchVendors(filters: VendorSearchFilters = {}): Promise<VendorSearchResult> {
    const params = new URLSearchParams()

    // Common filters
    if (filters.vendorType) params.append('vendor_type', filters.vendorType)
    if (filters.location) params.append('location', filters.location)
    if (filters.pricingType && filters.pricingType !== 'both') {
      params.append('pricing_type', filters.pricingType)
    }

    // Venue-specific filters
    if (filters.capacity?.min !== undefined) {
      params.append('capacity_min', filters.capacity.min.toString())
    }
    if (filters.capacity?.max !== undefined) {
      params.append('capacity_max', filters.capacity.max.toString())
    }
    if (filters.amenities?.length) {
      params.append('amenities', filters.amenities.join(','))
    }

    // Catering-specific filters
    if (filters.cuisineTypes?.length) {
      params.append('cuisine_types', filters.cuisineTypes.join(','))
    }

    // Entertainment-specific filters
    if (filters.genres?.length) {
      params.append('genres', filters.genres.join(','))
    }

    // Market vendor-specific filters
    if (filters.productTypes?.length) {
      params.append('product_types', filters.productTypes.join(','))
    }

    try {
      const response = await rateLimitedFetch(`${API_BASE_URL}/vendors?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        rateLimitKey: 'vendor-search'
      })

      if (!response.ok) {
        throw new Error(`Failed to search vendors: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error searching vendors:', error)
      throw error
    }
  }

  /**
   * Get vendor by slug
   */
  async getVendorBySlug(slug: string): Promise<Vendor> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/${slug}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Vendor not found')
        }
        throw new Error(`Failed to fetch vendor: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching vendor:', error)
      throw error
    }
  }

  /**
   * Get vendor by ID
   */
  async getVendorById(id: string): Promise<Vendor> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/by-id/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Vendor not found')
        }
        throw new Error(`Failed to fetch vendor: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching vendor by ID:', error)
      throw error
    }
  }

  /**
   * Quick vendor search for event creation (autocomplete)
   * Supports searching across all vendor types or filtering by type
   */
  async quickSearchVendors(query: string, vendorType?: VendorType): Promise<Vendor[]> {
    if (!query.trim()) return []

    const params = new URLSearchParams({
      q: query,
      limit: '10',
      fields: 'id,slug,name,vendorType,address'
    })

    if (vendorType) {
      params.append('vendor_type', vendorType)
    }

    try {
      const response = await fetch(`${API_BASE_URL}/vendors/search?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to search vendors: ${response.statusText}`)
      }

      const result = await response.json()
      return result.vendors || []
    } catch (error) {
      console.error('Error in quick vendor search:', error)
      return []
    }
  }

  /**
   * Create a new vendor profile
   */
  async createVendor(request: VendorCreationRequest): Promise<Vendor> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create vendor')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating vendor:', error)
      throw error
    }
  }

  /**
   * Send contact request to vendor
   */
  async sendVendorContactRequest(request: VendorContactRequest): Promise<{ success: boolean; message: string }> {
    try {
      return await rateLimitedPost(`${API_BASE_URL}/vendors/${request.vendorId}/contact`, request, {
        rateLimitKey: `vendor-contact:${request.vendorId}`
      })
    } catch (error) {
      console.error('Error sending vendor contact request:', error)
      throw error
    }
  }

  // ==========================================
  // BACKWARD-COMPATIBLE VENUE METHODS
  // ==========================================

  /**
   * Search venues with filters (backward-compatible)
   * Wraps searchVendors() with vendorType='venue' filter
   */
  async searchVenues(filters: VenueSearchFilters = {}): Promise<VenueSearchResult> {
    // Convert venue filters to vendor filters
    const vendorFilters: VendorSearchFilters = {
      ...filters,
      vendorType: 'venue'
    }

    try {
      const result = await this.searchVendors(vendorFilters)

      // Convert vendors to venues for backward compatibility
      const venues = result.vendors
        .map(vendorToVenue)
        .filter((v): v is Venue => v !== null)

      return {
        venues,
        total: result.total,
        hasMore: result.hasMore
      }
    } catch (error) {
      console.error('Error searching venues:', error)
      throw error
    }
  }

  /**
   * Get venue by slug (backward-compatible)
   */
  async getVenueBySlug(slug: string): Promise<Venue> {
    try {
      // For backward compatibility, first try the /venues endpoint
      // This allows gradual API migration
      const response = await fetch(`${API_BASE_URL}/venues/${slug}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        return await response.json()
      }

      // Fallback to vendors endpoint if venues endpoint doesn't exist yet
      if (response.status === 404) {
        const vendor = await this.getVendorBySlug(slug)
        const venue = vendorToVenue(vendor)
        if (!venue) {
          throw new Error('Vendor is not a venue')
        }
        return venue
      }

      throw new Error(`Failed to fetch venue: ${response.statusText}`)
    } catch (error) {
      console.error('Error fetching venue:', error)
      throw error
    }
  }

  /**
   * Get venue by ID (backward-compatible)
   */
  async getVenueById(id: string): Promise<Venue> {
    try {
      // Try venues endpoint first for backward compatibility
      const response = await fetch(`${API_BASE_URL}/venues/by-id/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        return await response.json()
      }

      // Fallback to vendors endpoint
      if (response.status === 404) {
        const vendor = await this.getVendorById(id)
        const venue = vendorToVenue(vendor)
        if (!venue) {
          throw new Error('Vendor is not a venue')
        }
        return venue
      }

      throw new Error(`Failed to fetch venue: ${response.statusText}`)
    } catch (error) {
      console.error('Error fetching venue by ID:', error)
      throw error
    }
  }

  /**
   * Quick venue search for event creation (backward-compatible)
   */
  async quickSearchVenues(query: string): Promise<Venue[]> {
    if (!query.trim()) return []

    try {
      // Try venues endpoint first for backward compatibility
      const params = new URLSearchParams({
        location: query,
        limit: '10',
        fields: 'id,slug,name,address,venueType'
      })

      const response = await fetch(`${API_BASE_URL}/venues/search?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        return result.venues || []
      }

      // Fallback to vendors endpoint
      const vendors = await this.quickSearchVendors(query, 'venue')
      return vendors
        .map(vendorToVenue)
        .filter((v): v is Venue => v !== null)
    } catch (error) {
      console.error('Error in quick venue search:', error)
      return []
    }
  }

  /**
   * Submit venue owner signup (backward-compatible)
   * This is deprecated in favor of createVendor()
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
   * Send contact request to venue (backward-compatible)
   */
  async sendVenueContactRequest(request: VenueContactRequest): Promise<{ success: boolean; message: string }> {
    const vendorRequest: VendorContactRequest = {
      vendorId: request.venueId,
      fromName: request.fromName,
      fromEmail: request.fromEmail,
      eventDate: request.eventDate,
      attendeeCount: request.attendeeCount,
      eventType: request.eventType,
      message: request.message
    }

    return this.sendVendorContactRequest(vendorRequest)
  }
}

// Create singleton instance
export const vendorService = new VendorService()
export default vendorService

// Re-export as venueService for backward compatibility
export const venueService = vendorService
