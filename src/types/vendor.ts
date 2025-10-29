/**
 * Vendor Type System
 *
 * Generalized vendor types supporting multiple vendor categories:
 * - Venues (physical event spaces)
 * - Catering (food/beverage services)
 * - Entertainment (performers, DJs, bands, etc.)
 * - Market Vendors (artisans, crafts, products)
 *
 * This type system is backward-compatible with the existing Venue type.
 */

// ==========================================
// COMMON TYPES (shared across vendor types)
// ==========================================

// V3.0: Expanded vendor types to match business requirements
export type VendorType = 'venue' | 'artist' | 'entertainer' | 'entertainment' | 'lighting_tech' | 'catering' | 'photographer' | 'market_vendor'

export type VendorClaimStatus = 'pending' | 'approved' | 'rejected'

export interface VendorCoordinates {
  lat: number
  lng: number
}

export interface VendorContactInfo {
  email: string
  phone?: string
  website?: string
  instagram?: string
  tiktok?: string
}

export interface VendorHours {
  monday?: { open: string; close: string } | null
  tuesday?: { open: string; close: string } | null
  wednesday?: { open: string; close: string } | null
  thursday?: { open: string; close: string } | null
  friday?: { open: string; close: string } | null
  saturday?: { open: string; close: string } | null
  sunday?: { open: string; close: string } | null
}

export interface VendorAccessibility {
  wheelchairAccessible: boolean
  lgbtqFriendly: boolean
  '420Friendly': boolean
  genderNeutralBathrooms?: boolean
  hearingAccessible?: boolean
  visuallyAccessible?: boolean
}

// ==========================================
// VENDOR-TYPE-SPECIFIC DETAILS
// ==========================================

/**
 * Venue-specific details (physical event spaces)
 */
export interface VenueSpecificDetails {
  venueType: 'bar' | 'restaurant' | 'community_center' | 'outdoor' | 'event_space' | 'other'
  capacity: number
  amenities: string[]
  accessibility: VendorAccessibility
  hours: VendorHours

  // Venue owner preferences
  ownerPreferences?: {
    enablePublicScreen: boolean
    autoApproveEvents: boolean
    preferredContactMethod: 'email' | 'phone' | 'platform'
    businessHours?: VendorHours
  }

  // Event history (CRM data)
  eventHistory?: {
    totalEvents: number
    lastEventDate?: Date
    preferredEventTypes: string[]
  }
}

/**
 * Catering-specific details (food/beverage services)
 */
export interface CateringSpecificDetails {
  cuisineTypes: string[] // Italian, Mexican, BBQ, etc.
  menuItems: MenuItem[]
  servesAlcohol: boolean
  dietaryOptions: string[] // Vegan, GF, Kosher, etc.
  serviceTypes: ('buffet' | 'plated' | 'family_style' | 'stations')[]
  minimumOrder?: number
  deliveryAvailable: boolean
  deliveryRadius?: number // miles
  setupTime?: string // "30 minutes", "1 hour"
  cleanupIncluded: boolean
}

export interface MenuItem {
  name: string
  description: string
  price?: number
  category: string // Appetizers, Entrees, Desserts, etc.
  dietary: string[] // Vegan, GF, etc.
  servingSize?: string // "Serves 10-15", "Per person"
}

/**
 * Entertainment-specific details (performers, DJs, bands, etc.)
 */
export interface EntertainmentSpecificDetails {
  performerType: 'dj' | 'band' | 'comedian' | 'dancer' | 'magician' | 'speaker' | 'other'
  genres: string[] // Music genres, comedy styles, etc.
  groupSize?: number // Solo, duo, 5-piece band, etc.
  equipmentProvided: string[] // DJ equipment, sound system, etc.
  portfolioLinks: string[] // YouTube, Spotify, etc.
  performanceDuration: string // "2 hours", "full night", etc.
  setupTime: string // "30 minutes", "1 hour", etc.
  technicalRequirements?: string[] // Stage size, power outlets, etc.
  priceRange?: {
    min: number
    max: number
    unit: 'per_hour' | 'per_event' | 'per_person'
  }
}

/**
 * Market vendor-specific details (artisans, crafts, products)
 */
export interface MarketVendorSpecificDetails {
  productTypes: string[] // Jewelry, art, clothing, crafts, etc.
  boothRequirements?: {
    spaceNeeded: string // "10x10", "20x10", etc.
    needsElectricity: boolean
    needsWater: boolean
    indoorOutdoor: 'indoor' | 'outdoor' | 'both'
  }
  inventorySize: 'small' | 'medium' | 'large'
  priceRange: string // "$5-$50", "$100-$500", etc.
  acceptsCustomOrders: boolean
  shipsProducts: boolean
}

// ==========================================
// CORE VENDOR INTERFACE
// ==========================================

/**
 * Core Vendor interface - supports all vendor types
 *
 * Common fields are always present.
 * Vendor-type-specific fields are optional and only populated for relevant types.
 */
export interface Vendor {
  id: string
  slug: string
  name: string
  description: string

  // VENDOR TYPE (core discriminator)
  vendorType: VendorType

  // COMMON FIELDS (all vendors)
  photos: string[]
  contactInfo: VendorContactInfo
  pricingType: 'paid' | 'free' | 'both' | 'custom'

  // OPTIONAL COMMON FIELDS (not all vendors need these)
  address?: string // Venues, Catering kitchens (optional for performers/market vendors)
  coordinates?: VendorCoordinates // Only for physical locations

  // VENDOR-TYPE-SPECIFIC DATA (nullable, populated based on vendorType)
  venueDetails?: VenueSpecificDetails // If vendorType === 'venue'
  cateringDetails?: CateringSpecificDetails // If vendorType === 'catering'
  entertainmentDetails?: EntertainmentSpecificDetails // If vendorType === 'entertainment'
  marketVendorDetails?: MarketVendorSpecificDetails // If vendorType === 'market_vendor'

  // APPROVAL/ADMIN FIELDS
  claimStatus: VendorClaimStatus
  ownerId: string // REQUIRED - no unclaimed vendors
  approvedBy?: string // Admin user ID who approved
  approvedAt?: Date
  rejectedReason?: string

  // TIMESTAMPS
  createdAt: Date
  updatedAt: Date
}

// ==========================================
// BACKWARD COMPATIBILITY ALIASES
// ==========================================

/**
 * Backward-compatible type aliases for existing venue code
 * Allows gradual migration without breaking changes
 */
export type VenueType = VenueSpecificDetails['venueType']
export type VenueClaimStatus = VendorClaimStatus
export type VenueCoordinates = VendorCoordinates
export type VenueContactInfo = VendorContactInfo
export type VenueHours = VendorHours
export type VenueAccessibility = VendorAccessibility

/**
 * Venue interface - backward-compatible alias for vendors with vendorType='venue'
 *
 * This allows existing code to continue using Venue type while we migrate to Vendor.
 */
export interface Venue extends Omit<Vendor, 'vendorType' | 'venueDetails'> {
  vendorType: 'venue'

  // Flatten venue-specific fields for backward compatibility
  venueType: VenueType
  capacity: number
  amenities: string[]
  accessibility: VenueAccessibility
  hours: VendorHours
  coordinates: VendorCoordinates
  address: string // Required for venues

  ownerPreferences?: VenueSpecificDetails['ownerPreferences']
  eventHistory?: VenueSpecificDetails['eventHistory']
}

// ==========================================
// VENDOR SEARCH & FILTERING
// ==========================================

export interface VendorSearchFilters {
  vendorType?: VendorType
  location?: string
  capacity?: {
    min?: number
    max?: number
  }
  pricingType?: 'paid' | 'free' | 'both' | 'custom'

  // Vendor-type-specific filters
  cuisineTypes?: string[] // Catering
  genres?: string[] // Entertainment
  productTypes?: string[] // Market vendors
  amenities?: string[] // Venues

  availability?: string // Coming soon feature
}

export interface VendorSearchResult {
  vendors: Vendor[]
  total: number
  hasMore: boolean
}

// Backward-compatible aliases for venue search
export interface VenueSearchFilters {
  location?: string
  capacity?: {
    min?: number
    max?: number
  }
  pricingType?: 'paid' | 'free' | 'both'
  availability?: string
}

export interface VenueSearchResult {
  venues: Venue[]
  total: number
  hasMore: boolean
}

// ==========================================
// VENDOR CREATION & MANAGEMENT
// ==========================================

/**
 * Vendor creation request - supports all vendor types
 */
export interface VendorCreationRequest {
  // Common vendor details
  name: string
  slug: string
  description: string
  vendorType: VendorType
  photos: string[]
  contactInfo: VendorContactInfo
  pricingType: 'paid' | 'free' | 'both' | 'custom'

  // Optional common fields
  address?: string
  coordinates?: VendorCoordinates

  // Vendor-type-specific details (only include relevant one)
  venueDetails?: Partial<VenueSpecificDetails>
  cateringDetails?: Partial<CateringSpecificDetails>
  entertainmentDetails?: Partial<EntertainmentSpecificDetails>
  marketVendorDetails?: Partial<MarketVendorSpecificDetails>

  // Owner information
  ownerName: string
  ownerEmail: string
  ownerPhone?: string
  businessInfo?: string
  message?: string
  preferredContactMethod: 'email' | 'phone'
}

/**
 * Backward-compatible venue creation request
 */
export interface VenueCreationRequest {
  // Venue Details
  name: string
  description: string
  address: string
  coordinates?: VendorCoordinates
  venueType: VenueType
  capacity: number
  amenities: string[]
  photos: string[]
  hours: VendorHours
  contactInfo: VendorContactInfo
  accessibility: VendorAccessibility
  pricingType: 'paid' | 'free' | 'both'

  // Owner Information
  ownerName: string
  ownerEmail: string
  ownerPhone?: string
  businessInfo?: string
  message?: string
  preferredContactMethod: 'email' | 'phone'
}

export interface VendorContactRequest {
  vendorId: string
  fromName: string
  fromEmail: string
  eventDate?: string
  attendeeCount?: number
  eventType?: string
  message: string
}

// Backward-compatible alias
export interface VenueContactRequest extends VendorContactRequest {
  venueId: string // Alias for vendorId
}

// ==========================================
// ADMIN INTERFACES
// ==========================================

export interface VendorApprovalRequest {
  vendorId: string
  action: 'approve' | 'reject'
  adminId: string
  reason?: string // Required for rejection
  adminNotes?: string
}

export interface VendorApprovalResult {
  success: boolean
  vendor?: Vendor
  message: string
}

export interface AdminVendorListItem {
  id: string
  name: string
  vendorType: VendorType
  address?: string
  claimStatus: VendorClaimStatus
  ownerName: string
  ownerEmail: string
  createdAt: Date
  approvedAt?: Date
  approvedBy?: string
}

// Backward-compatible aliases
export type VenueApprovalRequest = VendorApprovalRequest
export type VenueApprovalResult = VendorApprovalResult
export type AdminVenueListItem = AdminVendorListItem

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

// ==========================================
// TYPE GUARDS & UTILITIES
// ==========================================

/**
 * Type guard to check if a vendor is a venue
 */
export function isVenue(vendor: Vendor): vendor is Vendor & { vendorType: 'venue'; venueDetails: VenueSpecificDetails } {
  return vendor.vendorType === 'venue'
}

/**
 * Type guard to check if a vendor is catering
 */
export function isCatering(vendor: Vendor): vendor is Vendor & { vendorType: 'catering'; cateringDetails: CateringSpecificDetails } {
  return vendor.vendorType === 'catering'
}

/**
 * Type guard to check if a vendor is entertainment
 */
export function isEntertainment(vendor: Vendor): vendor is Vendor & { vendorType: 'entertainment'; entertainmentDetails: EntertainmentSpecificDetails } {
  return vendor.vendorType === 'entertainment'
}

/**
 * Type guard to check if a vendor is a market vendor
 */
export function isMarketVendor(vendor: Vendor): vendor is Vendor & { vendorType: 'market_vendor'; marketVendorDetails: MarketVendorSpecificDetails } {
  return vendor.vendorType === 'market_vendor'
}

/**
 * Convert a Vendor (with vendorType='venue') to legacy Venue format
 * Used for backward compatibility with existing venue-specific code
 */
export function vendorToVenue(vendor: Vendor): Venue | null {
  if (!isVenue(vendor) || !vendor.venueDetails) {
    return null
  }

  return {
    ...vendor,
    vendorType: 'venue',
    venueType: vendor.venueDetails.venueType,
    capacity: vendor.venueDetails.capacity,
    amenities: vendor.venueDetails.amenities,
    accessibility: vendor.venueDetails.accessibility,
    hours: vendor.venueDetails.hours,
    coordinates: vendor.coordinates || { lat: 0, lng: 0 },
    address: vendor.address || '',
    ownerPreferences: vendor.venueDetails.ownerPreferences,
    eventHistory: vendor.venueDetails.eventHistory
  }
}

/**
 * Convert a legacy Venue to Vendor format
 */
export function venueToVendor(venue: Venue): Vendor {
  return {
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    description: venue.description,
    vendorType: 'venue',
    photos: venue.photos,
    contactInfo: venue.contactInfo,
    pricingType: venue.pricingType,
    address: venue.address,
    coordinates: venue.coordinates,
    venueDetails: {
      venueType: venue.venueType,
      capacity: venue.capacity,
      amenities: venue.amenities,
      accessibility: venue.accessibility,
      hours: venue.hours,
      ownerPreferences: venue.ownerPreferences,
      eventHistory: venue.eventHistory
    },
    claimStatus: venue.claimStatus,
    ownerId: venue.ownerId,
    approvedBy: venue.approvedBy,
    approvedAt: venue.approvedAt,
    rejectedReason: venue.rejectedReason,
    createdAt: venue.createdAt,
    updatedAt: venue.updatedAt
  }
}
