// Email template service with default templates and rendering engine
import { EmailTemplate } from '@/types/database'

export interface TemplateVariable {
  name: string
  description: string
  required: boolean
  type: 'string' | 'date' | 'number' | 'url'
}

export interface TemplateContext {
  variables: Record<string, any>
  organizationName?: string
  organizationContactEmail?: string
  unsubscribeUrl?: string
  baseUrl?: string
}

export type EmailType = 'waitlist_confirmation' | 'spot_available' | 'event_reminder' | 'event_cancelled' | 'contact_inquiry' | 'beta_request' | 'newsletter_signup' | 'registration_confirmation' | 'event_update' | 'event_notification' | 'waitlist_notification' | 'organization_communication'

// Template rendering engine
export class EmailTemplateEngine {
  /**
   * Render a template with provided data
   */
  static render(template: string, context: TemplateContext): string {
    let rendered = template

    // Replace all variables using double braces syntax: {{variableName}}
    const variableRegex = /\{\{([^}]+)\}\}/g
    
    rendered = rendered.replace(variableRegex, (match, variableName) => {
      const trimmedName = variableName.trim()
      
      // Handle nested object properties (e.g., {{user.name}})
      const value = this.getNestedValue(context.variables, trimmedName)
      
      if (value !== undefined && value !== null) {
        // Format dates if needed
        if (value instanceof Date) {
          return this.formatDate(value)
        }
        return String(value)
      }
      
      // Keep the original placeholder if variable not found
      console.warn(`Template variable not found: ${trimmedName}`)
      return match
    })

    return rendered
  }

  /**
   * Validate that all required variables are provided
   */
  static validateContext(templateVariables: string[], context: TemplateContext): string[] {
    const missing: string[] = []
    
    for (const variable of templateVariables) {
      const value = this.getNestedValue(context.variables, variable)
      if (value === undefined || value === null || value === '') {
        missing.push(variable)
      }
    }
    
    return missing
  }

  /**
   * Extract all variables from a template string
   */
  static extractVariables(template: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g
    const variables: string[] = []
    let match

    while ((match = variableRegex.exec(template)) !== null) {
      const variableName = match[1].trim()
      if (!variables.includes(variableName)) {
        variables.push(variableName)
      }
    }

    return variables
  }

  /**
   * Get nested object value using dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current?.[key]
    }, obj)
  }

  /**
   * Format date for email display
   */
  private static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

// Default email templates
export const DEFAULT_EMAIL_TEMPLATES: Record<EmailType, Partial<EmailTemplate>> = {
  contact_inquiry: {
    name: 'Contact Inquiry Auto-Response',
    type: 'contact_inquiry',
    subject: 'Thank you for contacting Voxxy Presents',
    htmlTemplate: '<p>Hi {{name}},</p><p>Thank you for reaching out!</p>',
    textTemplate: 'Hi {{name}},\n\nThank you for reaching out!',
    variables: ['name', 'email', 'inquiryType', 'organizationName', 'description', 'baseUrl', 'unsubscribeUrl'],
    isActive: true
  },

  beta_request: {
    name: 'Beta Request Confirmation',
    type: 'beta_request',
    subject: 'Welcome to the Voxxy Presents Beta Program!',
    htmlTemplate: '<p>Hi {{name}},</p><p>Thank you for your beta request for {{organizationName}}!</p>',
    textTemplate: 'Hi {{name}},\n\nThank you for your beta request for {{organizationName}}!',
    variables: ['name', 'organizationName', 'description', 'baseUrl'],
    isActive: true
  },

  newsletter_signup: {
    name: 'Newsletter Signup Confirmation',
    type: 'newsletter_signup',
    subject: 'Welcome to Voxxy Presents Updates!',
    htmlTemplate: '<p>Hi {{name}},</p><p>Thanks for subscribing to updates!</p>',
    textTemplate: 'Hi {{name}},\n\nThanks for subscribing to updates!',
    variables: ['name', 'baseUrl', 'unsubscribeUrl'],
    isActive: true
  },

  registration_confirmation: {
    name: 'Event Registration Confirmation',
    type: 'registration_confirmation',
    subject: '✅ Registration Confirmed - {{eventTitle}}',
    htmlTemplate: '<p>Hi {{recipientName}},</p><p>Your registration for {{eventTitle}} is confirmed!</p>',
    textTemplate: 'Hi {{recipientName}},\n\nYour registration for {{eventTitle}} is confirmed!',
    variables: ['recipientName', 'eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'organizationName', 'contactEmail', 'eventUrl', 'unsubscribeUrl', 'waitlistPosition'],
    isActive: true
  },

  event_notification: {
    name: 'Event Notification',
    type: 'event_notification',
    subject: '📅 Event Update - {{eventTitle}}',
    htmlTemplate: '<p>Hi {{recipientName}},</p><p>Update about {{eventTitle}}: {{updateMessage}}</p>',
    textTemplate: 'Hi {{recipientName}},\n\nUpdate about {{eventTitle}}: {{updateMessage}}',
    variables: ['recipientName', 'eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'organizationName', 'contactEmail', 'eventUrl', 'unsubscribeUrl', 'updateMessage'],
    isActive: true
  },

  event_update: {
    name: 'Event Update',
    type: 'event_update',
    subject: '📅 {{eventTitle}} - Important Update',
    htmlTemplate: '<p>Hi {{recipientName}},</p><p>Update about {{eventTitle}}: {{updateMessage}}</p>',
    textTemplate: 'Hi {{recipientName}},\n\nUpdate about {{eventTitle}}: {{updateMessage}}',
    variables: ['recipientName', 'eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'organizationName', 'contactEmail', 'eventUrl', 'unsubscribeUrl', 'updateMessage'],
    isActive: true
  },

  waitlist_notification: {
    name: 'Waitlist Spot Available',
    type: 'waitlist_notification', 
    subject: '🎉 Spot Available - {{eventTitle}}',
    htmlTemplate: '<p>Hi {{recipientName}},</p><p>A spot just became available for {{eventTitle}}!</p>',
    textTemplate: 'Hi {{recipientName}},\n\nA spot just became available for {{eventTitle}}!',
    variables: ['recipientName', 'eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'organizationName', 'contactEmail', 'eventUrl'],
    isActive: true
  },

  organization_communication: {
    name: 'Organization Communication',
    type: 'organization_communication',
    subject: 'Message from {{organizationName}}',
    htmlTemplate: '<p>Hi {{recipientName}},</p><p>{{organizationName}} has sent you a message: {{message}}</p>',
    textTemplate: 'Hi {{recipientName}},\n\n{{organizationName}} has sent you a message: {{message}}',
    variables: ['recipientName', 'organizationName', 'message', 'organizationUrl', 'contactEmail', 'unsubscribeUrl'],
    isActive: true
  },

  waitlist_confirmation: {
    name: 'Waitlist Confirmation',
    type: 'waitlist_confirmation',
    subject: 'Waitlist Confirmation - {{eventTitle}}',
    htmlTemplate: '<p>Hi {{recipientName}},</p><p>You have been added to the waitlist for {{eventTitle}}.</p>',
    textTemplate: 'Hi {{recipientName}},\n\nYou have been added to the waitlist for {{eventTitle}}.',
    variables: ['recipientName', 'eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'organizationName'],
    isActive: true
  },

  spot_available: {
    name: 'Spot Available Notification',
    type: 'spot_available',
    subject: 'Spot Available - {{eventTitle}}',
    htmlTemplate: '<p>Hi {{recipientName}},</p><p>A spot is now available for {{eventTitle}}!</p>',
    textTemplate: 'Hi {{recipientName}},\n\nA spot is now available for {{eventTitle}}!',
    variables: ['recipientName', 'eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'organizationName'],
    isActive: true
  },

  event_reminder: {
    name: 'Event Reminder',
    type: 'event_reminder',
    subject: 'Reminder: {{eventTitle}} is coming up!',
    htmlTemplate: '<p>Hi {{recipientName}},</p><p>Just a reminder that {{eventTitle}} is coming up soon!</p>',
    textTemplate: 'Hi {{recipientName}},\n\nJust a reminder that {{eventTitle}} is coming up soon!',
    variables: ['recipientName', 'eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'organizationName'],
    isActive: true
  },

  event_cancelled: {
    name: 'Event Cancellation Notice',
    type: 'event_cancelled',
    subject: 'Event Cancelled: {{eventTitle}}',
    htmlTemplate: '<p>Hi {{recipientName}},</p><p>Unfortunately, {{eventTitle}} has been cancelled. We apologize for any inconvenience.</p>',
    textTemplate: 'Hi {{recipientName}},\n\nUnfortunately, {{eventTitle}} has been cancelled. We apologize for any inconvenience.',
    variables: ['recipientName', 'eventTitle', 'eventDate', 'eventTime', 'organizationName', 'contactEmail'],
    isActive: true
  }
}

// Template variable definitions for validation and UI
export const TEMPLATE_VARIABLES: Record<EmailType, TemplateVariable[]> = {
  contact_inquiry: [
    { name: 'name', description: 'Recipient name', required: true, type: 'string' },
    { name: 'email', description: 'Recipient email', required: true, type: 'string' },
    { name: 'inquiryType', description: 'Type of inquiry', required: true, type: 'string' },
    { name: 'organizationName', description: 'Organization name (optional)', required: false, type: 'string' },
    { name: 'description', description: 'Message description (optional)', required: false, type: 'string' },
    { name: 'baseUrl', description: 'Website base URL', required: true, type: 'url' },
    { name: 'unsubscribeUrl', description: 'Unsubscribe link', required: true, type: 'url' }
  ],
  beta_request: [
    { name: 'name', description: 'Recipient name', required: true, type: 'string' },
    { name: 'organizationName', description: 'Organization name', required: true, type: 'string' },
    { name: 'description', description: 'Organization description', required: true, type: 'string' },
    { name: 'baseUrl', description: 'Website base URL', required: true, type: 'url' }
  ],
  newsletter_signup: [
    { name: 'name', description: 'Recipient name', required: true, type: 'string' },
    { name: 'baseUrl', description: 'Website base URL', required: true, type: 'url' },
    { name: 'unsubscribeUrl', description: 'Unsubscribe link', required: true, type: 'url' }
  ],
  registration_confirmation: [
    { name: 'recipientName', description: 'Recipient name', required: true, type: 'string' },
    { name: 'eventTitle', description: 'Event title', required: true, type: 'string' },
    { name: 'eventDate', description: 'Event date', required: true, type: 'date' },
    { name: 'eventTime', description: 'Event time', required: true, type: 'string' },
    { name: 'eventLocation', description: 'Event location', required: true, type: 'string' },
    { name: 'organizationName', description: 'Organization name', required: true, type: 'string' },
    { name: 'contactEmail', description: 'Organization contact email', required: true, type: 'string' },
    { name: 'eventUrl', description: 'Event page URL', required: true, type: 'url' },
    { name: 'unsubscribeUrl', description: 'Unsubscribe link', required: true, type: 'url' },
    { name: 'waitlistPosition', description: 'Position on waitlist (optional)', required: false, type: 'number' }
  ],
  event_notification: [
    { name: 'recipientName', description: 'Recipient name', required: true, type: 'string' },
    { name: 'eventTitle', description: 'Event title', required: true, type: 'string' },
    { name: 'eventDate', description: 'Event date', required: true, type: 'date' },
    { name: 'eventTime', description: 'Event time', required: true, type: 'string' },
    { name: 'eventLocation', description: 'Event location', required: true, type: 'string' },
    { name: 'organizationName', description: 'Organization name', required: true, type: 'string' },
    { name: 'contactEmail', description: 'Organization contact email', required: true, type: 'string' },
    { name: 'eventUrl', description: 'Event page URL', required: true, type: 'url' },
    { name: 'unsubscribeUrl', description: 'Unsubscribe link', required: true, type: 'url' },
    { name: 'updateMessage', description: 'Update message', required: true, type: 'string' }
  ],
  event_update: [
    { name: 'recipientName', description: 'Recipient name', required: true, type: 'string' },
    { name: 'eventTitle', description: 'Event title', required: true, type: 'string' },
    { name: 'eventDate', description: 'Event date', required: true, type: 'date' },
    { name: 'eventTime', description: 'Event time', required: true, type: 'string' },
    { name: 'eventLocation', description: 'Event location', required: true, type: 'string' },
    { name: 'organizationName', description: 'Organization name', required: true, type: 'string' },
    { name: 'contactEmail', description: 'Organization contact email', required: true, type: 'string' },
    { name: 'eventUrl', description: 'Event page URL', required: true, type: 'url' },
    { name: 'unsubscribeUrl', description: 'Unsubscribe link', required: true, type: 'url' },
    { name: 'updateMessage', description: 'Update message', required: true, type: 'string' }
  ],
  waitlist_notification: [
    { name: 'recipientName', description: 'Recipient name', required: true, type: 'string' },
    { name: 'eventTitle', description: 'Event title', required: true, type: 'string' },
    { name: 'eventDate', description: 'Event date', required: true, type: 'date' },
    { name: 'eventTime', description: 'Event time', required: true, type: 'string' },
    { name: 'eventLocation', description: 'Event location', required: true, type: 'string' },
    { name: 'organizationName', description: 'Organization name', required: true, type: 'string' },
    { name: 'contactEmail', description: 'Organization contact email', required: true, type: 'string' },
    { name: 'eventUrl', description: 'Event page URL', required: true, type: 'url' }
  ],
  organization_communication: [
    { name: 'recipientName', description: 'Recipient name', required: true, type: 'string' },
    { name: 'organizationName', description: 'Organization name', required: true, type: 'string' },
    { name: 'message', description: 'Message content', required: true, type: 'string' },
    { name: 'organizationUrl', description: 'Organization page URL', required: true, type: 'url' },
    { name: 'contactEmail', description: 'Organization contact email', required: true, type: 'string' },
    { name: 'unsubscribeUrl', description: 'Unsubscribe link', required: true, type: 'url' }
  ],
  waitlist_confirmation: [
    { name: 'recipientName', description: 'Recipient name', required: true, type: 'string' },
    { name: 'eventTitle', description: 'Event title', required: true, type: 'string' },
    { name: 'eventDate', description: 'Event date', required: true, type: 'date' },
    { name: 'eventTime', description: 'Event time', required: true, type: 'string' },
    { name: 'eventLocation', description: 'Event location', required: true, type: 'string' },
    { name: 'organizationName', description: 'Organization name', required: true, type: 'string' }
  ],
  spot_available: [
    { name: 'recipientName', description: 'Recipient name', required: true, type: 'string' },
    { name: 'eventTitle', description: 'Event title', required: true, type: 'string' },
    { name: 'eventDate', description: 'Event date', required: true, type: 'date' },
    { name: 'eventTime', description: 'Event time', required: true, type: 'string' },
    { name: 'eventLocation', description: 'Event location', required: true, type: 'string' },
    { name: 'organizationName', description: 'Organization name', required: true, type: 'string' }
  ],
  event_reminder: [
    { name: 'recipientName', description: 'Recipient name', required: true, type: 'string' },
    { name: 'eventTitle', description: 'Event title', required: true, type: 'string' },
    { name: 'eventDate', description: 'Event date', required: true, type: 'date' },
    { name: 'eventTime', description: 'Event time', required: true, type: 'string' },
    { name: 'eventLocation', description: 'Event location', required: true, type: 'string' },
    { name: 'organizationName', description: 'Organization name', required: true, type: 'string' }
  ],
  event_cancelled: [
    { name: 'recipientName', description: 'Recipient name', required: true, type: 'string' },
    { name: 'eventTitle', description: 'Event title', required: true, type: 'string' },
    { name: 'eventDate', description: 'Event date', required: true, type: 'date' },
    { name: 'eventTime', description: 'Event time', required: true, type: 'string' },
    { name: 'organizationName', description: 'Organization name', required: true, type: 'string' },
    { name: 'contactEmail', description: 'Organization contact email', required: true, type: 'string' }
  ]
}