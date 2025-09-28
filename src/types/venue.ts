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

export type VenueClaimStatus = 'pending' | 'approved' | 'rejected'

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

  // Updated approval system (no claiming)
  claimStatus: VenueClaimStatus
  ownerId: string // REQUIRED - no unclaimed venues
  approvedBy?: string // Admin user ID who approved
  approvedAt?: Date
  rejectedReason?: string

  // New fields for venue owners
  ownerPreferences?: {
    enablePublicScreen: boolean
    autoApproveEvents: boolean
    preferredContactMethod: 'email' | 'phone' | 'platform'
    businessHours?: VenueHours
  }

  // Enhanced for CRM
  eventHistory?: {
    totalEvents: number
    lastEventDate?: Date
    preferredEventTypes: string[]
  }

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

// Updated for v2.0.0: Venue creation instead of claiming
export interface VenueCreationRequest {
  // Venue Details
  name: string
  description: string
  address: string
  coordinates?: VenueCoordinates
  venueType: VenueType
  capacity: number
  amenities: string[]
  photos: string[]
  hours: VenueHours
  contactInfo: VenueContactInfo
  accessibility: VenueAccessibility
  pricingType: 'paid' | 'free' | 'both'

  // Owner Information
  ownerName: string
  ownerEmail: string
  ownerPhone?: string
  businessInfo?: string
  message?: string
  preferredContactMethod: 'email' | 'phone'
}

// Legacy interface for backward compatibility
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

// New interfaces for v2.0.0 admin system
export interface VenueApprovalRequest {
  venueId: string
  action: 'approve' | 'reject'
  adminId: string
  reason?: string // Required for rejection
  adminNotes?: string
}

export interface VenueApprovalResult {
  success: boolean
  venue?: Venue
  message: string
}

// Admin venue management
export interface AdminVenueListItem {
  id: string
  name: string
  address: string
  venueType: VenueType
  claimStatus: VenueClaimStatus
  ownerName: string
  ownerEmail: string
  createdAt: Date
  approvedAt?: Date
  approvedBy?: string
}