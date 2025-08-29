// Email system types for Firestore database and API communication

export type EmailType = 
  | 'waitlist_confirmation' 
  | 'spot_available' 
  | 'event_reminder' 
  | 'event_cancelled' 
  | 'contact_inquiry' 
  | 'beta_request' 
  | 'newsletter_signup' 
  | 'registration_confirmation' 
  | 'event_update' 
  | 'event_notification' 
  | 'waitlist_notification' 
  | 'organization_communication'

export interface EmailThread {
  id: string
  subject: string
  participants: string[]
  messageIds: string[]
  organizationId?: string
  eventId?: string
  type: EmailType
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
}

export interface EmailTemplate {
  id: string
  name: string
  type: EmailType
  subject: string
  htmlTemplate: string
  textTemplate: string
  variables: string[]
  organizationId?: string // For org-specific templates
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EmailConfiguration {
  organizationId: string
  fromEmail: string
  fromName: string
  replyToEmail: string
  emailDomain?: string // Future: custom domains
  templates: Record<EmailType, string> // Template ID overrides
  notificationSettings: {
    adminEmails: string[]
    autoResponseEnabled: boolean
    forwardToAdmin: boolean
    notifyOnRegistration: boolean
    notifyOnEventUpdate: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface EmailRecipient {
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

// API Request/Response types
export interface SendEmailRequest {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  htmlContent?: string
  textContent?: string
  templateId?: string
  templateData?: Record<string, any>
  organizationId?: string
  eventId?: string
  type: EmailType
  replyToThreadId?: string
}

export interface SendEmailResponse {
  messageId: string
  threadId: string
  status: 'queued' | 'sent'
  estimatedDelivery?: Date
}

export interface EmailDeliveryStatus {
  messageId: string
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced'
  timestamp: Date
  details?: string
}

// Notification trigger types
export interface NotificationTrigger {
  event: 'registration_confirmed' | 'event_updated' | 'event_cancelled' | 'spot_available' | 'contact_form_submitted'
  recipients: EmailRecipient[]
  template: string
  data: Record<string, any>
  organizationId?: string
  eventId?: string
  priority: 'high' | 'normal' | 'low'
  scheduledFor?: Date
}

// Template variables for common email types
export interface ContactInquiryData {
  name: string
  email: string
  inquiryType: 'beta_request' | 'general_contact' | 'newsletter_signup'
  organizationName?: string
  description?: string
  submissionId: string
}

export interface EventNotificationData {
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  organizationName: string
  recipientName: string
  eventUrl: string
  unsubscribeUrl: string
}

export interface RegistrationConfirmationData {
  recipientName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  registrationType: 'confirmed' | 'waitlist'
  waitlistPosition?: number
  organizationName: string
  contactEmail: string
  eventUrl: string
  unsubscribeUrl: string
}

// Utility types
export type CreateEmailThreadData = Omit<EmailThread, 'id' | 'createdAt' | 'updatedAt'>
export type CreateEmailMessageData = Omit<EmailMessage, 'id' | 'sentAt' | 'deliveredAt' | 'retryCount'>
export type CreateContactSubmissionData = Omit<ContactFormSubmission, 'id' | 'submittedAt' | 'status'>
export type UpdateEmailConfigurationData = Partial<Omit<EmailConfiguration, 'organizationId' | 'createdAt' | 'updatedAt'>>