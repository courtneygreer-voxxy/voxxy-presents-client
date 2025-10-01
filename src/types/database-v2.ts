// V2 Database schema types for unified approval system
// This will replace the current database.ts file

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

// V2 UNIFIED USER SCHEMA
export interface User {
  id: string // Firebase Auth UID
  email: string
  name: string
  role: 'admin' | 'organizer' | 'venue_owner' | 'club_owner' | 'guest'

  // UNIFIED APPROVAL SYSTEM (replaces betaStatus + venue approval)
  approvalStatus: 'pending' | 'approved' | 'denied'
  betaAccess?: boolean  // Legacy field support
  betaStatus?: 'pending' | 'approved' | 'denied'  // Legacy field support
  approvedBy?: string // Admin user ID who approved
  approvedAt?: Date
  deniedAt?: Date
  deniedReason?: string
  requestedAt: Date // When they initially signed up

  // Profile
  profilePicture?: string
  background?: string

  // Role-specific profiles
  organizerProfile?: {
    organizationIds: string[] // Organizations they can manage
    businessType?: 'nonprofit' | 'for_profit' | 'community' | 'other'
    betaRequestMessage?: string // Original beta request details
  }

  venueOwnerProfile?: {
    venueIds: string[] // Venues they own/manage
    businessInfo: string
    phone?: string
    preferredContactMethod: 'email' | 'phone'
    businessType?: 'bar' | 'restaurant' | 'community_center' | 'outdoor' | 'event_space' | 'other'
    onboardingCompleted: boolean
  }

  guestProfile?: {
    registrationIds: string[] // Events they've registered for
    preferences: {
      eventTypes: string[]
      notifications: boolean
      marketingEmails: boolean
    }
    favoriteOrganizations: string[]
    favoriteVenues: string[]
  }

  // Settings
  emailNotifications: boolean

  createdAt: Date
  updatedAt: Date
}

// Venue schema (mostly unchanged, but claimStatus now tied to User.approvalStatus)
export interface Venue {
  id: string
  slug: string
  name: string
  description: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  hours: {
    monday?: { open: string; close: string } | null
    tuesday?: { open: string; close: string } | null
    wednesday?: { open: string; close: string } | null
    thursday?: { open: string; close: string } | null
    friday?: { open: string; close: string } | null
    saturday?: { open: string; close: string } | null
    sunday?: { open: string; close: string } | null
  }
  capacity: number
  venueType: 'bar' | 'restaurant' | 'community_center' | 'outdoor' | 'event_space' | 'other'
  amenities: string[]
  photos: string[]
  contactInfo: {
    email: string
    phone?: string
    website?: string
    instagram?: string
    tiktok?: string
  }
  accessibility: {
    wheelchairAccessible: boolean
    lgbtqFriendly: boolean
    '420Friendly': boolean
    genderNeutralBathrooms?: boolean
    hearingAccessible?: boolean
    visuallyAccessible?: boolean
  }

  // Venue approval now ties to User.approvalStatus
  // But we keep claimStatus for backward compatibility during migration
  claimStatus: 'pending' | 'approved' | 'rejected'
  ownerId: string // REQUIRED - references User.id
  approvedBy?: string // Admin user ID who approved venue
  approvedAt?: Date
  rejectedReason?: string

  // Owner preferences
  ownerPreferences?: {
    enablePublicScreen: boolean
    autoApproveEvents: boolean
    preferredContactMethod: 'email' | 'phone' | 'platform'
    businessHours?: {
      monday?: { open: string; close: string } | null
      tuesday?: { open: string; close: string } | null
      wednesday?: { open: string; close: string } | null
      thursday?: { open: string; close: string } | null
      friday?: { open: string; close: string } | null
      saturday?: { open: string; close: string } | null
      sunday?: { open: string; close: string } | null
    }
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

// Admin approval queue item (unified for all user types)
export interface ApprovalQueueItem {
  id: string
  userId: string
  userEmail: string
  userName: string
  userRole: 'organizer' | 'venue_owner'
  approvalStatus: 'pending' | 'approved' | 'denied'

  // Request details
  requestedAt: Date
  requestType: 'beta_request' | 'venue_submission'

  // Organizer-specific fields
  organizationRequest?: {
    businessType?: string
    message?: string
  }

  // Venue owner-specific fields
  venueRequest?: {
    businessInfo: string
    businessType: string
    phone?: string
    preferredContactMethod: 'email' | 'phone'
  }

  // Admin action fields
  reviewedBy?: string
  reviewedAt?: Date
  adminNotes?: string
  deniedReason?: string
}

// Rest of schemas remain largely the same...
export interface EmailTemplate {
  id: string
  organizationId: string
  name: string
  type: 'waitlist_confirmation' | 'spot_available' | 'event_reminder' | 'event_cancelled' | 'contact_inquiry' | 'beta_request' | 'newsletter_signup' | 'registration_confirmation' | 'event_update' | 'event_notification' | 'waitlist_notification' | 'organization_communication'
  subject: string
  htmlContent: string
  textContent: string
  htmlTemplate: string
  textTemplate: string
  variables: string[]
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
  messageId: string
  references: string[]
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

// V2 specific utility types
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'approvedAt'>
export type UpdateUserData = Partial<Pick<User, 'name' | 'profilePicture' | 'emailNotifications' | 'organizerProfile' | 'venueOwnerProfile' | 'guestProfile'>>
export type ApprovalAction = {
  userId: string
  action: 'approve' | 'deny'
  adminId: string
  reason?: string
  adminNotes?: string
}

// Email system utility types
export type CreateEmailThreadData = Omit<EmailThread, 'id' | 'createdAt' | 'updatedAt'>
export type CreateEmailMessageData = Omit<EmailMessage, 'id' | 'createdAt' | 'updatedAt' | 'sentAt' | 'deliveredAt'>
export type CreateContactSubmissionData = Omit<ContactFormSubmission, 'id' | 'submittedAt' | 'status'>
export type CreateEmailRecipientData = Omit<EmailRecipient, 'id' | 'createdAt' | 'updatedAt' | 'bounceCount'>
export type UpdateEmailTemplateData = Partial<Omit<EmailTemplate, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>>