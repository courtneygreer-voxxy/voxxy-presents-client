export interface VenueHours {
  monday?: { open: string; close: string } | null
  tuesday?: { open: string; close: string } | null
  wednesday?: { open: string; close: string } | null
  thursday?: { open: string; close: string } | null
  friday?: { open: string; close: string } | null
  saturday?: { open: string; close: string } | null
  sunday?: { open: string; close: string } | null
}

export interface VenueCoordinates {
  lat: number
  lng: number
}

export interface VenueContactInfo {
  email: string
  phone?: string
  website?: string
}

export type VenueType = 'bar' | 'restaurant' | 'community_center' | 'outdoor' | 'event_space' | 'other'

export type VenueClaimStatus = 'unclaimed' | 'pending' | 'claimed'

export interface Venue {
  id: string
  slug: string
  name: string
  description: string
  address: string
  coordinates: VenueCoordinates
  hours: VenueHours
  capacity: number
  venueType: VenueType
  amenities: string[]
  photos: string[]
  contactInfo: VenueContactInfo
  claimStatus: VenueClaimStatus
  ownerId?: string
  createdAt: Date
  updatedAt: Date
}

export interface VenueSearchFilters {
  query?: string
  location?: string
  venueType?: VenueType[]
  capacity?: {
    min?: number
    max?: number
  }
  amenities?: string[]
}

export interface VenueSearchResult {
  venues: Venue[]
  total: number
  hasMore: boolean
}

export interface VenueOwnerSignup {
  firstName: string
  lastName: string
  email: string
  phone?: string
  venueId: string
  businessInfo?: string
  message?: string
}

export interface VenueContactRequest {
  venueId: string
  fromName: string
  fromEmail: string
  eventDate?: string
  attendeeCount?: number
  eventType?: string
  message: string
}