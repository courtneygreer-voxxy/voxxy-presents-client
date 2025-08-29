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

export const mockLumaEvents: PlatformEvent[] = [
  {
    id: 'luma-event-1',
    platformId: 'evt-abc123def456',
    platform: 'luma',
    connectionId: 'conn-luma-1',
    title: 'NYC Tech Meetup: AI & Machine Learning',
    description: 'Join fellow tech enthusiasts for an evening of AI and ML discussions, networking, and demos. Featured speakers from leading tech companies will share insights.',
    shortDescription: 'AI & ML tech meetup with industry speakers',
    startDate: new Date('2024-02-18T19:00:00Z'),
    endDate: new Date('2024-02-18T22:00:00Z'),
    timezone: 'America/New_York',
    location: 'WeWork Dumbo Heights',
    address: '81 Prospect St, Brooklyn, NY 11201',
    isOnline: false,
    isFree: true,
    capacity: 80,
    remainingCapacity: 23,
    platformUrl: 'https://lu.ma/nyc-tech-ai-ml-meetup',
    status: 'published',
    visibility: 'public',
    imageUrl: 'https://images.lumacdn.com/event-covers/abc123def456/cover.jpg',
    organizerName: 'NYC Tech Community',
    attendeeCount: 57,
    interestedCount: 34,
    viewCount: 423,
    lastSyncedAt: new Date('2024-01-20T10:30:00Z'),
    isImported: false,
    platformData: {
      event_type: 'in_person',
      approval_required: false,
      waiting_list_enabled: true
    },
    createdAt: new Date('2024-01-08T11:45:00Z'),
    updatedAt: new Date('2024-01-20T10:30:00Z')
  },
  {
    id: 'luma-event-2',
    platformId: 'evt-def456ghi789',
    platform: 'luma',
    connectionId: 'conn-luma-1',
    title: 'Virtual Coffee Chat: Startup Founders',
    description: 'Monthly virtual coffee chat for startup founders to share experiences, challenges, and advice. Bring your questions and stories!',
    shortDescription: 'Monthly virtual networking for startup founders',
    startDate: new Date('2024-02-25T15:00:00Z'),
    endDate: new Date('2024-02-25T16:30:00Z'),
    timezone: 'America/New_York',
    location: 'Virtual Event',
    isOnline: true,
    onlineUrl: 'https://zoom.us/j/123456789',
    isFree: true,
    capacity: 50,
    remainingCapacity: 32,
    platformUrl: 'https://lu.ma/startup-founders-coffee-chat',
    status: 'published',
    visibility: 'public',
    organizerName: 'Startup Network NYC',
    attendeeCount: 18,
    interestedCount: 27,
    viewCount: 189,
    lastSyncedAt: new Date('2024-01-20T10:30:00Z'),
    isImported: false,
    platformData: {
      event_type: 'online',
      approval_required: false,
      recurring: true,
      recurrence_rule: 'FREQ=MONTHLY;BYMONTHDAY=25'
    },
    createdAt: new Date('2024-01-15T14:20:00Z'),
    updatedAt: new Date('2024-01-20T10:30:00Z')
  }
]

export const mockMeetupEvents: PlatformEvent[] = [
  {
    id: 'meetup-event-1',
    platformId: '298765432',
    platform: 'meetup',
    connectionId: 'conn-meetup-1',
    title: 'Brooklyn Photography Walk: Street Art & Murals',
    description: 'Explore Brooklyn\'s vibrant street art scene with fellow photography enthusiasts. We\'ll visit the best mural spots in Bushwick and Williamsburg.',
    shortDescription: 'Photography walk exploring Brooklyn street art',
    startDate: new Date('2024-02-17T13:00:00Z'),
    endDate: new Date('2024-02-17T17:00:00Z'),
    timezone: 'America/New_York',
    location: 'Bushwick Art Book Fair',
    address: '56 Bogart St, Brooklyn, NY 11206',
    isOnline: false,
    isFree: true,
    capacity: 25,
    remainingCapacity: 9,
    platformUrl: 'https://meetup.com/brooklyn-photography/events/298765432',
    status: 'published',
    visibility: 'public',
    imageUrl: 'https://secure.meetupstatic.com/photos/event/a/b/c/d/600_298765432.jpeg',
    organizerName: 'Brooklyn Photography Meetup',
    organizerId: 'organizer-photo-bk',
    attendeeCount: 16,
    interestedCount: 8,
    viewCount: 267,
    lastSyncedAt: new Date('2024-01-20T10:30:00Z'),
    isImported: false,
    platformData: {
      group_id: '987654321',
      group_name: 'Brooklyn Photography Meetup',
      rsvp_limit: 25,
      waitlist_enabled: true,
      venue_visibility: 'public'
    },
    createdAt: new Date('2024-01-05T16:30:00Z'),
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

export const mockLumaOrgs: PlatformOrganization[] = [
  {
    id: 'luma-org-1',
    platformId: 'org-luma-tech-nyc',
    platform: 'luma',
    connectionId: 'conn-luma-1',
    name: 'NYC Tech Community',
    description: 'The largest tech community in NYC, hosting monthly meetups, workshops, and networking events for developers, designers, and entrepreneurs.',
    logoUrl: 'https://images.lumacdn.com/avatars/org-luma-tech-nyc/avatar.jpg',
    websiteUrl: 'https://nyctechcommunity.com',
    email: 'organizers@nyctechcommunity.com',
    location: 'New York, NY',
    timezone: 'America/New_York',
    socialLinks: {
      website: 'https://nyctechcommunity.com',
      linkedin: 'https://linkedin.com/company/nyc-tech-community',
      twitter: 'https://twitter.com/nyc_tech_comm'
    },
    platformUrl: 'https://lu.ma/org-luma-tech-nyc',
    followerCount: 1523,
    eventCount: 28,
    lastSyncedAt: new Date('2024-01-20T10:30:00Z'),
    isImported: false,
    platformData: {
      organization_type: 'community',
      verified: true,
      membership_required: false
    },
    createdAt: new Date('2024-01-08T11:45:00Z'),
    updatedAt: new Date('2024-01-20T10:30:00Z')
  }
]

export const mockMeetupOrgs: PlatformOrganization[] = [
  {
    id: 'meetup-org-1',
    platformId: '987654321',
    platform: 'meetup',
    connectionId: 'conn-meetup-1',
    name: 'Brooklyn Photography Meetup',
    description: 'A group for photography enthusiasts in Brooklyn to share techniques, explore the city together, and improve their craft through workshops and photo walks.',
    logoUrl: 'https://secure.meetupstatic.com/photos/group/a/b/c/d/600_987654321.jpeg',
    websiteUrl: 'https://brooklynphoto.meetup.com',
    email: 'organizers@brooklynphoto.com',
    location: 'Brooklyn, NY',
    timezone: 'America/New_York',
    socialLinks: {
      website: 'https://brooklynphoto.meetup.com',
      instagram: 'https://instagram.com/brooklynphotomeetup'
    },
    platformUrl: 'https://meetup.com/brooklyn-photography',
    followerCount: 892,
    eventCount: 67,
    lastSyncedAt: new Date('2024-01-20T10:30:00Z'),
    isImported: false,
    platformData: {
      group_id: '987654321',
      category: 'Photography',
      status: 'active',
      created: '2021-09-10T14:30:00Z'
    },
    createdAt: new Date('2024-01-05T16:30:00Z'),
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
  },
  {
    id: 'conn-luma-1',
    userId: 'user-123',
    platform: 'luma',
    status: 'connected',
    accessToken: 'mock-luma-token-789',
    platformUserId: 'luma-user-456',
    platformAccountName: 'NYC Tech Community',
    platformAccountEmail: 'organizers@nyctechcommunity.com',
    platformAccountUrl: 'https://lu.ma/org-luma-tech-nyc',
    connectedAt: new Date('2024-01-08T11:45:00Z'),
    lastSyncAt: new Date('2024-01-20T10:30:00Z'),
    syncSettings: {
      autoSync: false,
      syncFrequency: 'manual',
      syncEvents: true,
      syncOrganizationInfo: true,
      syncAttendees: true
    },
    createdAt: new Date('2024-01-08T11:45:00Z'),
    updatedAt: new Date('2024-01-20T10:30:00Z')
  },
  {
    id: 'conn-meetup-1',
    userId: 'user-123',
    platform: 'meetup',
    status: 'error',
    lastErrorAt: new Date('2024-01-19T14:22:00Z'),
    errorMessage: 'Token expired. Please reconnect your Meetup account.',
    platformUserId: 'meetup-987654321',
    platformAccountName: 'Brooklyn Photography Meetup',
    connectedAt: new Date('2024-01-05T16:30:00Z'),
    syncSettings: {
      autoSync: true,
      syncFrequency: 'weekly',
      syncEvents: true,
      syncOrganizationInfo: false,
      syncAttendees: false
    },
    createdAt: new Date('2024-01-05T16:30:00Z'),
    updatedAt: new Date('2024-01-19T14:22:00Z')
  }
]

// Utility functions to get mock data
export function getMockEventsByPlatform(platform: PlatformType): PlatformEvent[] {
  switch (platform) {
    case 'eventbrite':
      return mockEventbriteEvents
    case 'luma':
      return mockLumaEvents
    case 'meetup':
      return mockMeetupEvents
    default:
      return []
  }
}

export function getMockOrgsByPlatform(platform: PlatformType): PlatformOrganization[] {
  switch (platform) {
    case 'eventbrite':
      return mockEventbriteOrgs
    case 'luma':
      return mockLumaOrgs
    case 'meetup':
      return mockMeetupOrgs
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
  return [
    ...mockEventbriteEvents,
    ...mockLumaEvents,
    ...mockMeetupEvents
  ]
}

export function getAllMockOrgs(): PlatformOrganization[] {
  return [
    ...mockEventbriteOrgs,
    ...mockLumaOrgs,
    ...mockMeetupOrgs
  ]
}