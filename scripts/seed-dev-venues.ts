/**
 * Development Venue Seeding Script
 * Creates realistic venue data for development environment
 */

import { Venue, VenueType, VenueHours } from '../src/types/venue'

const generateSlug = (name: string): string => {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

const createVenueHours = (
  weekdayOpen: string,
  weekdayClose: string,
  weekendOpen?: string,
  weekendClose?: string,
  closedDays: string[] = []
): VenueHours => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const hours: VenueHours = {}
  
  days.forEach(day => {
    if (closedDays.includes(day)) {
      hours[day as keyof VenueHours] = null
      return
    }

    if (day === 'saturday' || day === 'sunday') {
      hours[day as keyof VenueHours] = {
        open: weekendOpen || weekdayOpen,
        close: weekendClose || weekdayClose
      }
    } else {
      hours[day as keyof VenueHours] = {
        open: weekdayOpen,
        close: weekdayClose
      }
    }
  })

  return hours
}

export const DEV_VENUES: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'crystal-lake',
    name: 'Crystal Lake',
    description: 'A cozy neighborhood bar with a warm, welcoming atmosphere perfect for intimate gatherings and casual meetups. Known for craft cocktails, local beers, and a friendly community vibe. Features exposed brick walls, vintage decor, and a spacious bar area that encourages conversation.',
    address: '123 Park Ave, Brooklyn, NY 11215',
    coordinates: { lat: 40.6782, lng: -73.9442 },
    hours: createVenueHours('5:00 PM', '2:00 AM', '12:00 PM', '3:00 AM', ['monday']),
    capacity: 85,
    venueType: 'bar' as VenueType,
    amenities: ['WiFi', 'Sound System', 'Full Bar', 'Kitchen', 'Outdoor Seating', 'Private Event Space'],
    photos: [
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800'
    ],
    contactInfo: {
      email: 'events@crystallake.bar',
      phone: '(718) 555-0123',
      website: 'https://crystallake.bar',
      instagram: 'crystallakebrooklyn',
      tiktok: 'crystallakebar'
    },
    accessibility: {
      wheelchairAccessible: true,
      lgbtqFriendly: true,
      '420Friendly': false,
      genderNeutralBathrooms: true
    },
    approvalStatus: 'pending',
    ownerId: 'dev-owner-1',
    pricingType: 'both'
  },
  {
    slug: 'the-foundry-brooklyn',
    name: 'The Foundry Brooklyn',
    description: 'Industrial-chic event space with soaring ceilings, exposed steel beams, and floor-to-ceiling windows. Perfect for larger gatherings, networking events, and corporate functions. Features a full commercial kitchen and flexible layout options.',
    address: '456 Atlantic Ave, Brooklyn, NY 11217',
    coordinates: { lat: 40.6838, lng: -73.9857 },
    hours: createVenueHours('10:00 AM', '11:00 PM'),
    capacity: 200,
    venueType: 'event_space' as VenueType,
    amenities: ['WiFi', 'Sound System', 'Projector', 'Stage Area', 'Full Kitchen', 'Parking', 'ADA Accessible'],
    photos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1540518614846-7eded47ee855?w=800',
      'https://images.unsplash.com/photo-1519167758481-83f29c7c1842?w=800'
    ],
    contactInfo: {
      email: 'bookings@foundrybklyn.com',
      phone: '(718) 555-0456',
      website: 'https://foundrybklyn.com'
    },
    accessibility: {
      wheelchairAccessible: true,
      lgbtqFriendly: true,
      '420Friendly': false,
      genderNeutralBathrooms: true
    },
    approvalStatus: 'pending',
    ownerId: 'dev-owner-1',
    pricingType: 'both'
  },
  {
    slug: 'prospect-community-center',
    name: 'Prospect Community Center',
    description: 'Welcoming community space in the heart of Prospect Heights. Ideal for workshops, classes, support group meetings, and community events. Features multiple rooms of varying sizes, kitchen facilities, and a focus on accessibility and inclusivity.',
    address: '789 Prospect Place, Brooklyn, NY 11216',
    coordinates: { lat: 40.6765, lng: -73.9537 },
    hours: createVenueHours('9:00 AM', '9:00 PM', '10:00 AM', '6:00 PM'),
    capacity: 120,
    venueType: 'community_center' as VenueType,
    amenities: ['WiFi', 'Sound System', 'Projector', 'Kitchen', 'Multiple Rooms', 'ADA Accessible', 'Free Parking'],
    photos: [
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800',
      'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800',
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
    ],
    contactInfo: {
      email: 'events@prospectcc.org',
      phone: '(718) 555-0789',
      website: 'https://prospectcommunitycenter.org'
    },
    accessibility: {
      wheelchairAccessible: true,
      lgbtqFriendly: true,
      '420Friendly': false,
      genderNeutralBathrooms: true
    },
    approvalStatus: 'pending',
    ownerId: 'dev-owner-1',
    pricingType: 'both'
  },
  {
    slug: 'rooftop-garden-cafe',
    name: 'Rooftop Garden Café',
    description: 'Charming rooftop café with stunning city views and lush garden atmosphere. Perfect for daytime events, brunches, book clubs, and intimate celebrations. Features retractable roof for weather flexibility and locally-sourced menu options.',
    address: '321 Court St, Brooklyn, NY 11231',
    coordinates: { lat: 40.6892, lng: -73.9982 },
    hours: createVenueHours('8:00 AM', '8:00 PM'),
    capacity: 60,
    venueType: 'restaurant' as VenueType,
    amenities: ['WiFi', 'Outdoor Seating', 'Garden Setting', 'Full Kitchen', 'Coffee Bar', 'City Views'],
    photos: [
      'https://images.unsplash.com/photo-1559329007-40df8fdc3e48?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    ],
    contactInfo: {
      email: 'hello@rooftopgarden.cafe',
      phone: '(718) 555-0321',
      website: 'https://rooftopgarden.cafe',
      instagram: 'rooftopgardencafe'
    },
    accessibility: {
      wheelchairAccessible: true,
      lgbtqFriendly: true,
      '420Friendly': false,
      genderNeutralBathrooms: true
    },
    approvalStatus: 'pending',
    ownerId: 'dev-owner-1',
    pricingType: 'both'
  },
  {
    slug: 'warehouse-23',
    name: 'Warehouse 23',
    description: 'Raw, adaptable warehouse space perfect for creative events, pop-ups, markets, and large-scale gatherings. Features polished concrete floors, high ceilings, and minimal built-ins to allow maximum customization for any event vision.',
    address: '23 Warehouse Ave, Brooklyn, NY 11222',
    coordinates: { lat: 40.7282, lng: -73.9542 },
    hours: createVenueHours('10:00 AM', '12:00 AM'),
    capacity: 300,
    venueType: 'event_space' as VenueType,
    amenities: ['Sound System', 'High Ceilings', 'Loading Dock', 'Flexible Layout', 'Industrial Kitchen', 'Parking'],
    photos: [
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
      'https://images.unsplash.com/photo-1540518614846-7eded47ee855?w=800'
    ],
    contactInfo: {
      email: 'bookings@warehouse23.nyc',
      phone: '(718) 555-2300'
    },
    accessibility: {
      wheelchairAccessible: true,
      lgbtqFriendly: true,
      '420Friendly': false,
      genderNeutralBathrooms: true
    },
    approvalStatus: 'pending',
    ownerId: 'dev-owner-1',
    pricingType: 'both'
  },
  {
    slug: 'brooklyn-beer-garden',
    name: 'Brooklyn Beer Garden',
    description: 'Spacious outdoor beer garden with picnic-style seating, string lights, and a relaxed atmosphere. Ideal for casual meetups, celebrations, and events where people can mingle freely. Features local craft beers and simple, shareable food options.',
    address: '567 5th Ave, Brooklyn, NY 11215',
    coordinates: { lat: 40.6693, lng: -73.9883 },
    hours: createVenueHours('12:00 PM', '11:00 PM', '11:00 AM', '12:00 AM', ['monday', 'tuesday']),
    capacity: 150,
    venueType: 'outdoor' as VenueType,
    amenities: ['Outdoor Seating', 'Beer Garden', 'Food Service', 'String Lights', 'Fire Pits', 'Group Tables'],
    photos: [
      'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800',
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800'
    ],
    contactInfo: {
      email: 'events@bklynbeergarden.com',
      phone: '(718) 555-5670',
      website: 'https://brooklynbeergarden.com',
      instagram: 'bklynbeergarden',
      tiktok: 'brooklynbeergarden'
    },
    accessibility: {
      wheelchairAccessible: true,
      lgbtqFriendly: true,
      '420Friendly': false,
      genderNeutralBathrooms: true
    },
    approvalStatus: 'pending',
    ownerId: 'dev-owner-1',
    pricingType: 'both'
  },
  {
    slug: 'the-study-hall',
    name: 'The Study Hall',
    description: 'Quiet, scholarly atmosphere perfect for workshops, lectures, study groups, and professional development events. Features built-in whiteboards, comfortable seating, excellent lighting, and a library aesthetic that promotes focus and learning.',
    address: '890 Eastern Parkway, Brooklyn, NY 11213',
    coordinates: { lat: 40.6695, lng: -73.9442 },
    hours: createVenueHours('8:00 AM', '10:00 PM', '9:00 AM', '8:00 PM'),
    capacity: 40,
    venueType: 'community_center' as VenueType,
    amenities: ['WiFi', 'Whiteboards', 'Projector', 'Quiet Environment', 'Study Tables', 'Library Setting', 'ADA Accessible'],
    photos: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800'
    ],
    contactInfo: {
      email: 'booking@studyhall.space',
      phone: '(718) 555-8900',
      website: 'https://studyhall.space'
    },
    accessibility: {
      wheelchairAccessible: true,
      lgbtqFriendly: true,
      '420Friendly': false,
      genderNeutralBathrooms: true
    },
    approvalStatus: 'pending',
    ownerId: 'dev-owner-1',
    pricingType: 'both'
  },
  {
    slug: 'parkside-restaurant',
    name: 'Parkside Restaurant',
    description: 'Elegant restaurant with private dining rooms and excellent catering capabilities. Perfect for business dinners, celebration meals, and events where high-quality food is a priority. Features contemporary American cuisine and professional service.',
    address: '234 Parkside Ave, Brooklyn, NY 11226',
    coordinates: { lat: 40.6559, lng: -73.9614 },
    hours: createVenueHours('5:00 PM', '10:00 PM', '11:00 AM', '11:00 PM', ['monday']),
    capacity: 75,
    venueType: 'restaurant' as VenueType,
    amenities: ['Full Kitchen', 'Private Dining Rooms', 'Full Bar', 'Professional Service', 'Catering', 'Wine Selection'],
    photos: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800'
    ],
    contactInfo: {
      email: 'events@parksiderestaurant.com',
      phone: '(718) 555-2340',
      website: 'https://parksiderestaurant.com'
    },
    accessibility: {
      wheelchairAccessible: true,
      lgbtqFriendly: true,
      '420Friendly': false,
      genderNeutralBathrooms: true
    },
    approvalStatus: 'pending',
    ownerId: 'dev-owner-1',
    pricingType: 'both'
  },
  {
    slug: 'innovation-hub',
    name: 'Innovation Hub',
    description: 'Modern co-working and event space designed for entrepreneurs, startups, and creative professionals. Features state-of-the-art technology, flexible furniture, and an inspiring atmosphere perfect for hackathons, pitch events, and networking meetups.',
    address: '456 Tech Row, Brooklyn, NY 11201',
    coordinates: { lat: 40.6942, lng: -73.9857 },
    hours: createVenueHours('9:00 AM', '9:00 PM', '10:00 AM', '6:00 PM'),
    capacity: 100,
    venueType: 'event_space' as VenueType,
    amenities: ['WiFi', 'Projector', 'Sound System', 'Whiteboards', 'Video Conferencing', 'Coffee Bar', 'Flexible Furniture'],
    photos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1519167758481-83f29c7c1842?w=800',
      'https://images.unsplash.com/photo-1540518614846-7eded47ee855?w=800'
    ],
    contactInfo: {
      email: 'events@innovationhub.nyc',
      phone: '(718) 555-4560',
      website: 'https://innovationhub.nyc'
    },
    accessibility: {
      wheelchairAccessible: true,
      lgbtqFriendly: true,
      '420Friendly': false,
      genderNeutralBathrooms: true
    },
    approvalStatus: 'pending',
    ownerId: 'dev-owner-1',
    pricingType: 'both'
  },
  {
    slug: 'sunset-terrace',
    name: 'Sunset Terrace',
    description: 'Beautiful outdoor terrace with panoramic views and stunning sunset vistas. Perfect for evening receptions, cocktail parties, and special celebrations. Features elegant outdoor furniture, ambient lighting, and optional weather protection.',
    address: '789 Heights Blvd, Brooklyn, NY 11201',
    coordinates: { lat: 40.6956, lng: -73.9969 },
    hours: createVenueHours('4:00 PM', '11:00 PM', '2:00 PM', '12:00 AM'),
    capacity: 80,
    venueType: 'outdoor' as VenueType,
    amenities: ['Outdoor Seating', 'City Views', 'Sunset Views', 'Bar Service', 'Ambient Lighting', 'Weather Protection'],
    photos: [
      'https://images.unsplash.com/photo-1559329007-40df8fdc3e48?w=800',
      'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800',
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800'
    ],
    contactInfo: {
      email: 'events@sunsetter.nyc',
      phone: '(718) 555-7890',
      website: 'https://sunsetter.nyc'
    },
    accessibility: {
      wheelchairAccessible: true,
      lgbtqFriendly: true,
      '420Friendly': true,
      genderNeutralBathrooms: true
    },
    approvalStatus: 'pending',
    ownerId: 'dev-owner-1',
    pricingType: 'free'
  }
]

/**
 * Generate venue with proper IDs and timestamps for development environment
 */
export const generateDevVenue = (venueData: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>, index: number): Venue => {
  const now = new Date()
  return {
    ...venueData,
    id: `dev-venue-${index + 1}`,
    createdAt: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)), // Stagger creation dates
    updatedAt: now
  }
}

/**
 * Get all development venues with proper IDs and timestamps
 */
export const getDevVenues = (): Venue[] => {
  return DEV_VENUES.map((venue, index) => generateDevVenue(venue, index))
}

// Log venue count for development
console.log(`Generated ${DEV_VENUES.length} development venues`)

export default { DEV_VENUES, generateDevVenue, getDevVenues }