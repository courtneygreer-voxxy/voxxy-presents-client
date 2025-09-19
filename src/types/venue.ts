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
  instagram?: string
  tiktok?: string
}

export type VenueType = 'bar' | 'restaurant' | 'community_center' | 'outdoor' | 'event_space' | 'other'

export type VenueClaimStatus = 'unclaimed' | 'pending' | 'claimed'

export interface VenueAccessibility {
  wheelchairAccessible: boolean
  lgbtqFriendly: boolean
  '420Friendly': boolean
  genderNeutralBathrooms?: boolean
  hearingAccessible?: boolean
  visuallyAccessible?: boolean
}

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
  accessibility: VenueAccessibility
  claimStatus: VenueClaimStatus
  ownerId?: string
  pricingType: 'paid' | 'free' | 'both'
  createdAt: Date
  updatedAt: Date
}

export interface VenueSearchFilters {
  location?: string
  capacity?: {
    min?: number
    max?: number
  }
  pricingType?: 'paid' | 'free' | 'both'
  availability?: string // Coming soon feature - will be grayed out
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