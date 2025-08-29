// Platform Integration Types for Third-Party Event Platform System

export type PlatformType = 'eventbrite' | 'luma' | 'meetup'

export interface PlatformConnection {
  id: string
  userId: string
  organizationId?: string
  platform: PlatformType
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  
  // OAuth/Authentication details
  accessToken?: string
  refreshToken?: string
  tokenExpiresAt?: Date
  authScope?: string[]
  
  // Platform-specific account info
  platformUserId?: string
  platformUsername?: string
  platformAccountName?: string
  platformAccountEmail?: string
  platformAccountUrl?: string
  
  // Connection metadata
  connectedAt: Date
  lastSyncAt?: Date
  lastErrorAt?: Date
  errorMessage?: string
  
  // Sync preferences
  syncSettings: {
    autoSync: boolean
    syncFrequency: 'manual' | 'daily' | 'weekly' | 'realtime'
    syncEvents: boolean
    syncOrganizationInfo: boolean
    syncAttendees: boolean
  }
  
  createdAt: Date
  updatedAt: Date
}

export interface PlatformEvent {
  // Universal event fields
  id: string
  platformId: string // ID on the external platform
  platform: PlatformType
  connectionId: string
  
  // Event details
  title: string
  description: string
  shortDescription?: string
  
  // Date and time
  startDate: Date
  endDate?: Date
  timezone: string
  
  // Location
  location: string
  address?: string
  venueId?: string
  venueName?: string
  isOnline: boolean
  onlineUrl?: string
  
  // Pricing and tickets
  isFree: boolean
  ticketPrice?: number
  currency?: string
  capacity?: number
  remainingCapacity?: number
  
  // Platform-specific URLs
  platformUrl: string
  ticketUrl?: string
  
  // Status
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  visibility: 'public' | 'private' | 'unlisted'
  
  // Media
  imageUrl?: string
  images?: string[]
  
  // Organizer info
  organizerName?: string
  organizerId?: string
  
  // Stats
  attendeeCount?: number
  interestedCount?: number
  viewCount?: number
  
  // Sync metadata
  lastSyncedAt: Date
  importedAt?: Date
  isImported: boolean
  voxxyEventId?: string // If imported into Voxxy
  
  // Platform-specific data
  platformData: Record<string, any>
  
  createdAt: Date
  updatedAt: Date
}

export interface PlatformOrganization {
  id: string
  platformId: string
  platform: PlatformType
  connectionId: string
  
  // Organization details
  name: string
  description?: string
  shortDescription?: string
  
  // Branding
  logoUrl?: string
  bannerUrl?: string
  websiteUrl?: string
  
  // Contact info
  email?: string
  phone?: string
  
  // Location
  location?: string
  address?: string
  timezone?: string
  
  // Social links
  socialLinks: {
    website?: string
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  
  // Platform URLs
  platformUrl: string
  
  // Stats
  followerCount?: number
  eventCount?: number
  
  // Sync metadata
  lastSyncedAt: Date
  importedAt?: Date
  isImported: boolean
  voxxyOrganizationId?: string
  
  // Platform-specific data
  platformData: Record<string, any>
  
  createdAt: Date
  updatedAt: Date
}

export interface PlatformTicketSales {
  id: string
  eventId: string
  platformEventId: string
  platform: PlatformType
  connectionId: string
  
  // Sales data
  totalSold: number
  totalRevenue: number
  currency: string
  
  // Capacity info
  totalCapacity?: number
  remainingCapacity?: number
  
  // Ticket types breakdown
  ticketTypes: Array<{
    name: string
    price: number
    sold: number
    capacity?: number
    remaining?: number
  }>
  
  // Time-based data
  salesByDay?: Array<{
    date: Date
    sold: number
    revenue: number
  }>
  
  // Last updated
  lastSyncedAt: Date
  
  createdAt: Date
  updatedAt: Date
}

export interface ImportPreferences {
  userId: string
  organizationId?: string
  
  // What to import
  importEvents: boolean
  importOrganizationInfo: boolean
  importAttendees: boolean
  importTicketSales: boolean
  
  // Import behavior
  autoImport: boolean
  importFrequency: 'manual' | 'daily' | 'weekly'
  
  // Conflict resolution
  onConflict: 'skip' | 'overwrite' | 'create_duplicate' | 'ask'
  
  // Date range for import
  importPastEvents: boolean
  pastEventsDays?: number // How many days back
  importFutureEvents: boolean
  futureEventsDays?: number // How many days forward
  
  // Filtering
  onlyMyEvents: boolean // Only import events I organize
  eventStatusFilter: string[] // Which statuses to import
  
  createdAt: Date
  updatedAt: Date
}

export interface SyncJob {
  id: string
  connectionId: string
  type: 'full_sync' | 'incremental_sync' | 'import_events' | 'import_organization'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  
  // Progress tracking
  totalItems?: number
  processedItems?: number
  failedItems?: number
  
  // Results
  results?: {
    eventsImported?: number
    eventsUpdated?: number
    eventsSkipped?: number
    organizationsImported?: number
    organizationsUpdated?: number
    errors?: Array<{
      item: string
      error: string
    }>
  }
  
  // Timing
  startedAt?: Date
  completedAt?: Date
  duration?: number // in milliseconds
  
  // Error details
  errorMessage?: string
  errorStack?: string
  
  createdAt: Date
  updatedAt: Date
}

// Mock data interfaces for development
export interface MockPlatformEventData {
  eventbrite: PlatformEvent[]
  luma: PlatformEvent[]
  meetup: PlatformEvent[]
}

export interface MockPlatformOrgData {
  eventbrite: PlatformOrganization[]
  luma: PlatformOrganization[]
  meetup: PlatformOrganization[]
}

// API Response types
export interface PlatformAuthUrl {
  platform: PlatformType
  authUrl: string
  state: string
  codeVerifier?: string
}

export interface PlatformAuthCallback {
  platform: PlatformType
  code: string
  state: string
  codeVerifier?: string
}

export interface ConnectionTestResult {
  success: boolean
  accountInfo?: {
    id: string
    name: string
    email?: string
    url?: string
  }
  error?: string
}

// Utility types
export type CreatePlatformConnectionData = Omit<PlatformConnection, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncAt' | 'lastErrorAt'>
export type UpdatePlatformConnectionData = Partial<Omit<PlatformConnection, 'id' | 'createdAt'>>
export type CreateImportPreferencesData = Omit<ImportPreferences, 'createdAt' | 'updatedAt'>
export type UpdateImportPreferencesData = Partial<Omit<ImportPreferences, 'createdAt'>>