// Mock data for third-party platform integration development
import type { PlatformEvent, PlatformOrganization, PlatformConnection, PlatformTicketSales, PlatformType } from '@/types/platformIntegration'

// Mock Eventbrite data
export const mockEventbriteEvents: PlatformEvent[] = [
  {
    id: 'eb-event-1',
    platformId: '789012345',
    platform: 'eventbrite',
    connectionId: 'conn-eb-1',
    title: 'Brooklyn Hearts Club: House Music & Vinyl Night',
    description: 'Join us for an intimate evening of house music, vinyl records, and good vibes. Our resident DJs will be spinning deep house, tech house, and classic disco all night long.',
    shortDescription: 'House music & vinyl night with resident DJs',
    startDate: new Date('2024-02-15T20:00:00Z'),
    endDate: new Date('2024-02-16T02:00:00Z'),
    timezone: 'America/New_York',
    location: 'Brooklyn Hearts Club',
    address: '123 Williamsburg Ave, Brooklyn, NY 11211',
    venueId: 'venue-bhc-1',
    venueName: 'Brooklyn Hearts Club Main Room',
    isOnline: false,
    isFree: false,
    ticketPrice: 25,
    currency: 'USD',
    capacity: 150,
    remainingCapacity: 45,
    platformUrl: 'https://eventbrite.com/e/brooklyn-hearts-club-house-music-vinyl-night-tickets-789012345',
    ticketUrl: 'https://eventbrite.com/e/789012345',
    status: 'published',
    visibility: 'public',
    imageUrl: 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F123456789%2F987654321%2F1%2Foriginal.jpg',
    organizerName: 'Brooklyn Hearts Club',
    organizerId: 'org-bhc-eb',
    attendeeCount: 105,
    interestedCount: 23,
    viewCount: 847,
    lastSyncedAt: new Date('2024-01-20T10:30:00Z'),
    isImported: false,
    platformData: {
      category_id: '103',
      subcategory_id: '1003',
      venue_id: '456789',
      organizer_id: '123456789',
      is_series: false,
      series_id: null
    },
    createdAt: new Date('2024-01-10T15:20:00Z'),
    updatedAt: new Date('2024-01-20T10:30:00Z')
  },
  {
    id: 'eb-event-2',
    platformId: '789012346',
    platform: 'eventbrite',
    connectionId: 'conn-eb-1',
    title: 'Creative Workshop: Screen Printing Basics',
    description: 'Learn the fundamentals of screen printing in this hands-on workshop. Perfect for beginners who want to create their own t-shirts, posters, and art prints.',
    shortDescription: 'Beginner-friendly screen printing workshop',
    startDate: new Date('2024-02-22T14:00:00Z'),
    endDate: new Date('2024-02-22T18:00:00Z'),
    timezone: 'America/New_York',
    location: 'Brooklyn Arts Studio',
    address: '456 Creative St, Brooklyn, NY 11215',
    isOnline: false,
    isFree: false,
    ticketPrice: 45,
    currency: 'USD',
    capacity: 20,
    remainingCapacity: 8,
    platformUrl: 'https://eventbrite.com/e/creative-workshop-screen-printing-basics-tickets-789012346',
    ticketUrl: 'https://eventbrite.com/e/789012346',
    status: 'published',
    visibility: 'public',
    imageUrl: 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F123456790%2F987654321%2F1%2Foriginal.jpg',
    organizerName: 'Brooklyn Hearts Club',
    attendeeCount: 12,
    interestedCount: 15,
    viewCount: 342,
    lastSyncedAt: new Date('2024-01-20T10:30:00Z'),
    isImported: false,
    platformData: {
      category_id: '105',
      subcategory_id: '1007'
    },
    createdAt: new Date('2024-01-12T09:15:00Z'),
    updatedAt: new Date('2024-01-20T10:30:00Z')
  }
]



// Mock organization data
export const mockEventbriteOrgs: PlatformOrganization[] = [
  {
    id: 'eb-org-1',
    platformId: 'org-123456789',
    platform: 'eventbrite',
    connectionId: 'conn-eb-1',
    name: 'Brooklyn Hearts Club',
    description: 'Brooklyn\'s premier destination for house music, creative workshops, and community events. We bring together music lovers, artists, and creatives in a welcoming space.',
    shortDescription: 'House music venue and creative community space',
    logoUrl: 'https://cdn.evbuc.com/images/organizer/123456789/logo.png',
    bannerUrl: 'https://cdn.evbuc.com/images/organizer/123456789/banner.jpg',
    websiteUrl: 'https://brooklynheartsclub.com',
    email: 'hello@brooklynheartsclub.com',
    phone: '+1 (718) 555-0123',
    location: 'Brooklyn, NY',
    address: '123 Williamsburg Ave, Brooklyn, NY 11211',
    timezone: 'America/New_York',
    socialLinks: {
      website: 'https://brooklynheartsclub.com',
      facebook: 'https://facebook.com/brooklynheartsclub',
      instagram: 'https://instagram.com/brooklynheartsclub',
      twitter: 'https://twitter.com/bhc_brooklyn'
    },
    platformUrl: 'https://eventbrite.com/o/brooklyn-hearts-club-123456789',
    followerCount: 2847,
    eventCount: 45,
    lastSyncedAt: new Date('2024-01-20T10:30:00Z'),
    isImported: false,
    platformData: {
      organizer_id: '123456789',
      verified: true,
      created_date: '2022-03-15T10:00:00Z'
    },
    createdAt: new Date('2024-01-10T15:20:00Z'),
    updatedAt: new Date('2024-01-20T10:30:00Z')
  }
]



// Mock ticket sales data
export const mockTicketSales: PlatformTicketSales[] = [
  {
    id: 'sales-eb-1',
    eventId: 'voxxy-event-123',
    platformEventId: '789012345',
    platform: 'eventbrite',
    connectionId: 'conn-eb-1',
    totalSold: 105,
    totalRevenue: 2625,
    currency: 'USD',
    totalCapacity: 150,
    remainingCapacity: 45,
    ticketTypes: [
      {
        name: 'Early Bird',
        price: 20,
        sold: 45,
        capacity: 50,
        remaining: 5
      },
      {
        name: 'General Admission',
        price: 25,
        sold: 60,
        capacity: 100,
        remaining: 40
      }
    ],
    salesByDay: [
      { date: new Date('2024-01-15'), sold: 12, revenue: 240 },
      { date: new Date('2024-01-16'), sold: 18, revenue: 450 },
      { date: new Date('2024-01-17'), sold: 23, revenue: 575 },
      { date: new Date('2024-01-18'), sold: 31, revenue: 775 },
      { date: new Date('2024-01-19'), sold: 21, revenue: 525 }
    ],
    lastSyncedAt: new Date('2024-01-20T10:30:00Z'),
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:30:00Z')
  }
]

// Mock platform connections
export const mockPlatformConnections: PlatformConnection[] = [
  {
    id: 'conn-eb-1',
    userId: 'user-123',
    platform: 'eventbrite',
    status: 'connected',
    accessToken: 'mock-eb-token-123',
    refreshToken: 'mock-eb-refresh-456',
    tokenExpiresAt: new Date('2024-12-31T23:59:59Z'),
    authScope: ['event:read', 'event:write', 'organization:read'],
    platformUserId: '123456789',
    platformUsername: 'brooklynheartsclub',
    platformAccountName: 'Brooklyn Hearts Club',
    platformAccountEmail: 'hello@brooklynheartsclub.com',
    platformAccountUrl: 'https://eventbrite.com/o/brooklyn-hearts-club-123456789',
    connectedAt: new Date('2024-01-10T15:20:00Z'),
    lastSyncAt: new Date('2024-01-20T10:30:00Z'),
    syncSettings: {
      autoSync: true,
      syncFrequency: 'daily',
      syncEvents: true,
      syncOrganizationInfo: true,
      syncAttendees: false
    },
    createdAt: new Date('2024-01-10T15:20:00Z'),
    updatedAt: new Date('2024-01-20T10:30:00Z')
  }
]

// Utility functions to get mock data
export function getMockEventsByPlatform(platform: PlatformType): PlatformEvent[] {
  switch (platform) {
    case 'eventbrite':
      return mockEventbriteEvents
    default:
      return []
  }
}

export function getMockOrgsByPlatform(platform: PlatformType): PlatformOrganization[] {
  switch (platform) {
    case 'eventbrite':
      return mockEventbriteOrgs
    default:
      return []
  }
}

export function getMockConnectionByPlatform(platform: PlatformType): PlatformConnection | null {
  return mockPlatformConnections.find(conn => conn.platform === platform) || null
}

export function getAllMockConnections(): PlatformConnection[] {
  return mockPlatformConnections
}

export function getAllMockEvents(): PlatformEvent[] {
  return [...mockEventbriteEvents]
}

export function getAllMockOrgs(): PlatformOrganization[] {
  return [...mockEventbriteOrgs]
}