// Database schema types for Firestore

export interface Organization {
  id: string
  name: string
  slug: string // URL-friendly name (e.g., 'brooklyn-hearts-club')
  description: string
  bio: string
  logoUrl?: string
  bannerUrl?: string
  contactEmail: string
  socialLinks: {
    instagram?: string
    website?: string
    eventbrite?: string
    venmo?: string
  }
  settings: {
    defaultLocation: string
    defaultAddress: string
    theme: {
      primaryColor: string
      backgroundColor: string
    }
  }
  ownerId: string // References users collection
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  organizationId: string // References organizations collection
  title: string
  description: string
  fullDescription: string
  category: 'Workshop' | 'Figure Drawing' | 'Social' | 'Exhibition' | 'Other'
  
  // Date and time
  date: Date
  endDate?: Date
  time: string
  duration?: string // e.g., "2 hours"
  
  // Location
  location: string
  address: string
  
  // Pricing
  price: {
    type: 'free' | 'paid' | 'donation'
    amount?: number
    description: string // e.g., "Day of: $20 cash, $25 Venmo"
    advancePrice?: number
  }
  
  // Capacity and registration
  capacity?: number
  registrationRequired: boolean
  eventbriteUrl?: string
  presaleEnabled: boolean
  
  // Series information
  series?: {
    name: string
    description: string
  }
  
  // Recurring event info
  isRecurring: boolean
  recurringDates?: Array<{
    date: string
    theme: string
    description: string
  }>
  
  // Media
  imageUrl?: string
  images?: string[]
  
  // Status
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  
  createdAt: Date
  updatedAt: Date
}

export interface Registration {
  id: string
  eventId: string // References events collection
  organizationId: string // References organizations collection
  
  // User info
  email: string
  name?: string
  phone?: string
  
  // Registration details
  registrationType: 'waitlist' | 'confirmed' | 'cancelled'
  registeredAt: Date
  confirmedAt?: Date
  cancelledAt?: Date
  
  // Waitlist position
  waitlistPosition?: number
  
  // Communication
  emailSent: boolean
  lastEmailSent?: Date
  
  // Additional data
  notes?: string
  source: 'website' | 'eventbrite' | 'manual'
}

export interface User {
  id: string // Firebase Auth UID
  email: string
  name?: string
  role: 'admin' | 'organizer' | 'user'
  
  // Profile
  profilePicture?: string
  bio?: string
  
  // Permissions
  organizationIds: string[] // Organizations they can manage
  
  // Settings
  emailNotifications: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface EmailTemplate {
  id: string
  organizationId: string
  type: 'waitlist_confirmation' | 'spot_available' | 'event_reminder' | 'event_cancelled'
  subject: string
  htmlContent: string
  textContent: string
  variables: string[] // e.g., ['eventTitle', 'eventDate', 'userName']
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Utility types for forms and API
export type CreateEventData = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateEventData = Partial<CreateEventData>
export type CreateRegistrationData = Omit<Registration, 'id' | 'registeredAt' | 'waitlistPosition'>