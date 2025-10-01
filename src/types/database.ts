// Database schema types for Firestore

export interface Organization {
  id: string
  name: string
  slug: string // URL-friendly name (e.g., 'brooklyn-hearts-club')
  description: string
  background: string
  logoUrl?: string
  bannerUrl?: string
  aboutImageUrl?: string // Legacy single image field (for backwards compatibility)
  aboutImages?: string[] // New multiple images field
  aboutStory?: string
  aboutOfferings?: string[]
  backgroundStyle?: string // Dynamic background style (stars, gradient-purple, gradient-sunset, minimal-grid, abstract-waves)
  contactEmail: string
  socialLinks: {
    instagram?: string
    website?: string
    linktree?: string
    venmo?: string
    other?: string
  }
  settings: {
    defaultLocation: string
    defaultAddress: string
    theme: {
      primaryColor: string
      backgroundColor: string
    }
    emailConfiguration?: {
      fromEmail?: string
      fromName?: string
      replyToEmail?: string
      autoResponseEnabled?: boolean
      notificationSettings?: {
        adminEmails: string[]
        notifyOnRegistration: boolean
        notifyOnEventUpdate: boolean
        forwardToAdmin: boolean
      }
    }
  }
  status?: 'active' | 'inactive' | 'pending' // Organization status for admin management
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
    type: 'free' | 'paid' | 'group_deal'
    amount?: number
    description: string // e.g., "Day of: $20 cash, $25 Venmo"
    advancePrice?: number
    groupDealDetails?: {
      minimumPeople: number
      pricePerPerson: number
      normalPricePerPerson: number
    }
  }
  
  // Capacity and registration
  capacity?: number
  registrationRequired: boolean
  presaleEnabled?: boolean // Deprecated: Use status 'presale' instead
  
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
  status: 'draft' | 'presale' | 'published' | 'sold_out' | 'cancelled' | 'completed'
  
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
  
  // Subscription preferences
  subscribeToUpdates?: boolean
  subscribeToNewsletter?: boolean
}

export interface Waitlist {
  id: string
  eventId: string // References events collection
  organizationId: string // References organizations collection
  
  // User info
  name: string
  email: string
  phone?: string
  
  // Waitlist details
  position: number
  joinedAt: Date
  notifiedAt?: Date
  
  // Additional data
  notes?: string
  source: 'website' | 'eventbrite' | 'manual'
}

export interface User {
  id: string // Firebase Auth UID
  email: string
  name?: string
  role: 'admin' | 'organizer' | 'venue_owner' | 'user'

  // Beta Access Control
  betaStatus: 'pending' | 'approved' | 'denied'
  betaRequestedAt?: Date
  betaApprovedAt?: Date
  betaApprovedBy?: string // Admin user ID who approved

  // Profile
  profilePicture?: string
  background?: string

  // Permissions
  organizationIds: string[] // Organizations they can manage

  // Venue Owner Profile (new for v2.0.0)
  venueOwnerProfile?: {
    venueIds: string[] // Venues they own/manage
    businessInfo?: string
    phone?: string
    preferredContactMethod: 'email' | 'phone'
    businessType?: 'bar' | 'restaurant' | 'community_center' | 'outdoor' | 'event_space' | 'other'
    onboardingCompleted: boolean
    approvedAt?: Date // When they were approved as a venue owner
  }

  // Settings
  emailNotifications: boolean

  createdAt: Date
  updatedAt: Date
}

export interface EmailTemplate {
  id: string
  organizationId: string
  name: string
  type: 'waitlist_confirmation' | 'spot_available' | 'event_reminder' | 'event_cancelled' | 'contact_inquiry' | 'beta_request' | 'newsletter_signup' | 'registration_confirmation' | 'event_update' | 'event_notification' | 'waitlist_notification' | 'organization_communication'
  subject: string
  htmlContent: string
  textContent: string
  htmlTemplate: string // Template content with variables
  textTemplate: string // Template content with variables
  variables: string[] // e.g., ['eventTitle', 'eventDate', 'userName']
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EmailThread {
  id: string
  subject: string
  participants: string[]
  messageIds: string[]
  organizationId?: string
  eventId?: string
  type: 'waitlist_confirmation' | 'spot_available' | 'event_reminder' | 'event_cancelled' | 'contact_inquiry' | 'beta_request' | 'newsletter_signup' | 'registration_confirmation' | 'event_update' | 'event_notification' | 'waitlist_notification' | 'organization_communication'
  status: 'active' | 'closed'
  createdAt: Date
  updatedAt: Date
}

export interface EmailMessage {
  id: string
  threadId: string
  messageId: string // RFC 2822 Message-ID
  references: string[] // Email threading headers
  inReplyTo?: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  replyTo?: string
  subject: string
  htmlContent: string
  textContent: string
  templateId?: string
  templateData?: Record<string, any>
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced'
  sentAt?: Date
  deliveredAt?: Date
  failureReason?: string
  retryCount: number
  organizationId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ContactFormSubmission {
  id: string
  type: 'beta_request' | 'newsletter_signup' | 'general_contact'
  name: string
  email: string
  organizationName?: string
  description?: string
  source: 'contact_page' | 'organization_page' | 'event_page'
  status: 'received' | 'processing' | 'responded' | 'closed'
  emailThreadId?: string
  submittedAt: Date
  respondedAt?: Date
  notes?: string
}

export interface EmailRecipient {
  id: string
  email: string
  name?: string
  role: 'admin' | 'organizer' | 'guest' | 'subscriber'
  organizationId?: string
  userId?: string
  preferences: {
    eventUpdates: boolean
    newsletters: boolean
    adminNotifications: boolean
    marketingEmails: boolean
  }
  unsubscribedAt?: Date
  bounceCount: number
  lastEmailSent?: Date
  createdAt: Date
  updatedAt: Date
}

// Utility types for forms and API
export type CreateEventData = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateEventData = Partial<CreateEventData>
export type CreateRegistrationData = Omit<Registration, 'id' | 'registeredAt' | 'waitlistPosition'>
export type CreateWaitlistData = Omit<Waitlist, 'id' | 'position' | 'joinedAt'>

// Email system utility types
export type CreateEmailThreadData = Omit<EmailThread, 'id' | 'createdAt' | 'updatedAt'>
export type CreateEmailMessageData = Omit<EmailMessage, 'id' | 'createdAt' | 'updatedAt' | 'sentAt' | 'deliveredAt'>
export type CreateContactSubmissionData = Omit<ContactFormSubmission, 'id' | 'submittedAt' | 'status'>
export type CreateEmailRecipientData = Omit<EmailRecipient, 'id' | 'createdAt' | 'updatedAt' | 'bounceCount'>
export type UpdateEmailTemplateData = Partial<Omit<EmailTemplate, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>>