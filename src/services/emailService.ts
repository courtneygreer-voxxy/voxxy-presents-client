// Email service for handling email operations through the backend API
import { 
  ContactFormSubmission,
  CreateContactSubmissionData,
  EmailThread,
  EmailMessage,
  EmailTemplate
} from '@/types/database'
import { 
  SendEmailRequest, 
  SendEmailResponse, 
  EmailDeliveryStatus,
  EmailConfiguration,
  EmailType,
  NotificationTrigger
} from '@/types/email'
import { getApiUrl } from '@/config/environments'

const API_BASE_URL = getApiUrl() || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

class EmailServiceError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'EmailServiceError'
  }
}

async function fetchEmailApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/email${endpoint}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      let errorData: any = {}
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` }
      }
      
      console.error('Email API Error:', {
        url,
        status: response.status,
        message: errorData.message || errorData.error
      })
      
      const errorMessage = errorData.message || errorData.error || `Email API request failed (${response.status})`
      throw new EmailServiceError(errorMessage, response.status)
    }

    return await response.json()
    
  } catch (error) {
    if (error instanceof EmailServiceError) {
      throw error
    }
    
    console.error('Email Service Network Error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw new EmailServiceError(`Email service error: ${error instanceof Error ? error.message : 'Unknown error'}`, 0)
  }
}

// Contact Form API
export const contactFormApi = {
  async submitForm(data: CreateContactSubmissionData): Promise<ContactFormSubmission> {
    return fetchEmailApi<ContactFormSubmission>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getSubmissions(organizationId?: string): Promise<ContactFormSubmission[]> {
    const endpoint = organizationId ? `/contact?organization=${organizationId}` : '/contact'
    return fetchEmailApi<ContactFormSubmission[]>(endpoint)
  },

  async getSubmissionById(id: string): Promise<ContactFormSubmission> {
    return fetchEmailApi<ContactFormSubmission>(`/contact/${id}`)
  },

  async updateSubmission(id: string, updates: Partial<ContactFormSubmission>): Promise<ContactFormSubmission> {
    return fetchEmailApi<ContactFormSubmission>(`/contact/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }
}

// Email Sending API  
export const emailSendingApi = {
  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    return fetchEmailApi<SendEmailResponse>('/send', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  async sendTemplate(templateId: string, data: {
    to: string[]
    templateData: Record<string, any>
    organizationId?: string
    replyToThreadId?: string
  }): Promise<SendEmailResponse> {
    return fetchEmailApi<SendEmailResponse>('/send/template', {
      method: 'POST',
      body: JSON.stringify({
        templateId,
        ...data
      }),
    })
  },

  async getDeliveryStatus(messageId: string): Promise<EmailDeliveryStatus> {
    return fetchEmailApi<EmailDeliveryStatus>(`/status/${messageId}`)
  },

  async retryFailedEmail(messageId: string): Promise<SendEmailResponse> {
    return fetchEmailApi<SendEmailResponse>(`/retry/${messageId}`, {
      method: 'POST',
    })
  }
}

// Email Threading API
export const emailThreadingApi = {
  async getThread(threadId: string): Promise<EmailThread & { messages: EmailMessage[] }> {
    return fetchEmailApi<EmailThread & { messages: EmailMessage[] }>(`/threads/${threadId}`)
  },

  async getThreadsByOrganization(organizationId: string): Promise<EmailThread[]> {
    return fetchEmailApi<EmailThread[]>(`/threads?organization=${organizationId}`)
  },

  async getThreadsByType(type: EmailType): Promise<EmailThread[]> {
    return fetchEmailApi<EmailThread[]>(`/threads?type=${type}`)
  },

  async closeThread(threadId: string): Promise<EmailThread> {
    return fetchEmailApi<EmailThread>(`/threads/${threadId}/close`, {
      method: 'PATCH',
    })
  },

  async addMessageToThread(threadId: string, message: {
    subject: string
    htmlContent: string
    textContent: string
    to: string[]
    replyToMessageId?: string
  }): Promise<EmailMessage> {
    return fetchEmailApi<EmailMessage>(`/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    })
  }
}

// Template Management API
export const emailTemplateApi = {
  async getTemplates(organizationId?: string): Promise<EmailTemplate[]> {
    const endpoint = organizationId ? `/templates?organization=${organizationId}` : '/templates'
    return fetchEmailApi<EmailTemplate[]>(endpoint)
  },

  async getTemplate(id: string): Promise<EmailTemplate> {
    return fetchEmailApi<EmailTemplate>(`/templates/${id}`)
  },

  async getTemplateByType(type: EmailType, organizationId?: string): Promise<EmailTemplate> {
    const endpoint = organizationId 
      ? `/templates/type/${type}?organization=${organizationId}` 
      : `/templates/type/${type}`
    return fetchEmailApi<EmailTemplate>(endpoint)
  },

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    return fetchEmailApi<EmailTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    })
  },

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return fetchEmailApi<EmailTemplate>(`/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  async deleteTemplate(id: string): Promise<void> {
    await fetchEmailApi<void>(`/templates/${id}`, {
      method: 'DELETE',
    })
  }
}

// Email Configuration API
export const emailConfigApi = {
  async getConfiguration(organizationId: string): Promise<EmailConfiguration> {
    return fetchEmailApi<EmailConfiguration>(`/config/${organizationId}`)
  },

  async updateConfiguration(organizationId: string, config: Partial<EmailConfiguration>): Promise<EmailConfiguration> {
    return fetchEmailApi<EmailConfiguration>(`/config/${organizationId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    })
  },

  async getGlobalConfiguration(): Promise<EmailConfiguration> {
    return fetchEmailApi<EmailConfiguration>('/config/global')
  }
}

// Notification System API
export const notificationApi = {
  async triggerNotification(trigger: NotificationTrigger): Promise<{ messageIds: string[], threadIds: string[] }> {
    return fetchEmailApi<{ messageIds: string[], threadIds: string[] }>('/notifications/trigger', {
      method: 'POST',
      body: JSON.stringify(trigger),
    })
  },

  async scheduleNotification(trigger: NotificationTrigger): Promise<{ scheduledId: string }> {
    return fetchEmailApi<{ scheduledId: string }>('/notifications/schedule', {
      method: 'POST',
      body: JSON.stringify(trigger),
    })
  },

  async getNotificationHistory(organizationId: string): Promise<any[]> {
    return fetchEmailApi<any[]>(`/notifications/history?organization=${organizationId}`)
  }
}

// Utility functions for the frontend
export const emailUtils = {
  /**
   * Generate a unique message ID for email threading
   */
  generateMessageId(type: EmailType, entityId: string, domain: string = 'voxxypresents.com'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `<${type}.${entityId}.${timestamp}.${random}@${domain}>`
  },

  /**
   * Extract email domain from email address
   */
  extractDomain(email: string): string {
    return email.split('@')[1] || ''
  },

  /**
   * Validate email address format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Generate unsubscribe URL
   */
  generateUnsubscribeUrl(recipientEmail: string, organizationId?: string): string {
    const baseUrl = window.location.origin
    const params = new URLSearchParams({
      email: recipientEmail,
      ...(organizationId && { org: organizationId })
    })
    return `${baseUrl}/unsubscribe?${params.toString()}`
  },

  /**
   * Format email subject for threading
   */
  formatReplySubject(originalSubject: string): string {
    if (originalSubject.toLowerCase().startsWith('re:')) {
      return originalSubject
    }
    return `Re: ${originalSubject}`
  }
}

export { EmailServiceError }