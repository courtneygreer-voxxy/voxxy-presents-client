// Google Places Service for Voxxy Presents Web App
// Uses backend proxy to keep API key secure (matches mobile app pattern)

import { getApiUrl } from '@/config/environments'

const API_BASE_URL = getApiUrl() || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Types matching Google Places API responses
export interface PlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
    main_text_matched_substrings?: Array<{
      offset: number
      length: number
    }>
  }
  types: string[]
}

export interface PlaceDetails {
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  formatted_address: string
  address_components: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
}

export interface LocationData {
  neighborhood: string
  city: string
  state: string
  country: string
  formatted: string
  latitude: number | null
  longitude: number | null
  place_id: string
}

type AddressComponent = PlaceDetails['address_components'][number]

class GooglePlacesService {
  /**
   * Google Places can represent the "city" differently depending on the market.
   * For standard cities we usually get `locality` (e.g. Los Angeles).
   * For NYC venues, the display city often lives under sublocality types
   * like `sublocality_level_1` (e.g. Brooklyn, Queens, Manhattan).
   *
   * This helper prefers structured address components over string parsing so
   * boroughs and other sub-city regions can be displayed correctly.
   */
  private getCityFromComponents(addressComponents: AddressComponent[]): string {
    const cityPriority = [
      'locality',
      'sublocality_level_1',
      'sublocality',
      'postal_town',
      'administrative_area_level_3',
    ]

    for (const type of cityPriority) {
      const component = addressComponents.find(({ types }) => types.includes(type))
      if (component) {
        return component.long_name
      }
    }

    return ''
  }

  /**
   * Search for places using Google Places Autocomplete API (via backend proxy)
   * @param input - Search query
   * @param types - Place types ('geocode' for all locations, '(cities)' for cities only, 'establishment' for businesses)
   * @returns Array of place predictions
   */
  async searchPlaces(input: string, types: string = 'establishment'): Promise<PlacePrediction[]> {
    if (!input || input.length < 2) {
      return []
    }

    try {
      const url = `${API_BASE_URL}/places/search?query=${encodeURIComponent(input)}&types=${encodeURIComponent(types)}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Places search failed:', response.status)
        return []
      }

      const data = await response.json()

      if (data.results && Array.isArray(data.results)) {
        return data.results
      }

      return []
    } catch (error) {
      console.error('Error searching places:', error)
      return []
    }
  }

  /**
   * Get place details including coordinates
   * @param placeId - Google Places place ID
   * @returns Place details with geometry
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const url = `${API_BASE_URL}/places/details?place_id=${encodeURIComponent(placeId)}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Place details fetch failed:', response.status)
        return null
      }

      const data = await response.json()

      if (data.details) {
        return data.details
      }

      return null
    } catch (error) {
      console.error('Error fetching place details:', error)
      return null
    }
  }

  /**
   * Parse location data from place prediction and details
   * Extracts city, state, coordinates, etc. in a standardized format
   * Prioritizes address_components for accuracy (ignores street addresses)
   * @param place - Place prediction from autocomplete
   * @param placeDetails - Optional detailed place info
   * @returns Standardized location data object
   */
  parseLocationData(
    place: PlacePrediction,
    placeDetails: PlaceDetails | null = null,
  ): LocationData {
    let neighborhood = ''
    let city = ''
    let state = ''
    let country = ''
    let latitude: number | null = null
    let longitude: number | null = null

    // Extract from address_components if available (most reliable)
    if (placeDetails?.address_components) {
      // Derive the display city first so NYC boroughs can win when `locality`
      // is absent but `sublocality_level_1` is present.
      city = this.getCityFromComponents(placeDetails.address_components)

      placeDetails.address_components.forEach((component) => {
        const types = component.types

        if (
          types.includes('neighborhood') ||
          types.includes('sublocality') ||
          types.includes('sublocality_level_1')
        ) {
          neighborhood = component.long_name
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name
        } else if (types.includes('country')) {
          country = component.short_name
        }
      })
    }

    // Extract coordinates
    if (placeDetails?.geometry?.location) {
      latitude = placeDetails.geometry.location.lat
      longitude = placeDetails.geometry.location.lng
    }

    // Do not derive city by splitting `secondary_text`.
    // Google already gives us normalized address components, which are far more
    // reliable than comma-separated prediction strings for venues and boroughs.
    // If components are unavailable, we intentionally leave `city` blank rather
    // than risk turning "Brooklyn, NY, USA" into the incorrect "NY, NY".

    // Create formatted address (always just city, state - never street address)
    let formattedAddress = ''
    if (city && state) {
      formattedAddress = `${city}, ${state}`
    } else if (city) {
      formattedAddress = city
    }

    return {
      neighborhood,
      city,
      state,
      country,
      formatted: formattedAddress,
      latitude,
      longitude,
      place_id: place.place_id,
    }
  }

  /**
   * Extract just the city from a location for auto-filling the location field
   * @param locationData - Parsed location data
   * @returns City and state formatted for display
   */
  getCityDisplay(locationData: LocationData): string {
    if (locationData.city && locationData.state) {
      return `${locationData.city}, ${locationData.state}`
    } else if (locationData.city) {
      return locationData.city
    }
    return ''
  }
}

export default new GooglePlacesService()
