// Custom hook for email system functionality
import { useState, useCallback, useEffect } from 'react'
import { 
  contactFormApi, 
  emailSendingApi, 
  emailTemplateApi, 
  emailConfigApi, 
  EmailServiceError 
} from '@/services/emailService'
import { 
  ContactFormSubmission, 
  EmailTemplate, 
  EmailThread, 
  EmailMessage,
  CreateContactSubmissionData
} from '@/types/database'
import { EmailDeliveryStatus } from '@/types/email'

export type EmailType = 'waitlist_confirmation' | 'spot_available' | 'event_reminder' | 'event_cancelled' | 'contact_inquiry' | 'beta_request' | 'newsletter_signup' | 'registration_confirmation' | 'event_update' | 'event_notification' | 'waitlist_notification' | 'organization_communication'

export interface UseEmailSystemOptions {
  organizationId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface EmailSystemState {
  // Contact forms
  submissions: ContactFormSubmission[]
  submissionsLoading: boolean
  
  // Templates
  templates: EmailTemplate[]
  templatesLoading: boolean
  
  // Threads
  threads: EmailThread[]
  threadsLoading: boolean
  
  // Error state
  error: string | null
  
  // Loading states
  submitting: boolean
}

export function useEmailSystem(options: UseEmailSystemOptions = {}) {
  const { organizationId, autoRefresh = false, refreshInterval = 30000 } = options
  
  const [state, setState] = useState<EmailSystemState>({
    submissions: [],
    submissionsLoading: false,
    templates: [],
    templatesLoading: false,
    threads: [],
    threadsLoading: false,
    error: null,
    submitting: false
  })

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const setSubmitting = useCallback((submitting: boolean) => {
    setState(prev => ({ ...prev, submitting }))
  }, [])

  // Contact form submissions
  const submitContactForm = useCallback(async (data: CreateContactSubmissionData): Promise<ContactFormSubmission> => {
    setSubmitting(true)
    setError(null)
    
    try {
      const submission = await contactFormApi.submitForm(data)
      
      // Add to local state
      setState(prev => ({
        ...prev,
        submissions: [submission, ...prev.submissions]
      }))
      
      return submission
      
    } catch (error) {
      const errorMessage = error instanceof EmailServiceError 
        ? error.message 
        : 'Failed to submit contact form'
      setError(errorMessage)
      throw error
      
    } finally {
      setSubmitting(false)
    }
  }, [])

  const loadSubmissions = useCallback(async () => {
    setState(prev => ({ ...prev, submissionsLoading: true }))
    setError(null)
    
    try {
      const submissions = await contactFormApi.getSubmissions(organizationId)
      setState(prev => ({ ...prev, submissions, submissionsLoading: false }))
      
    } catch (error) {
      const errorMessage = error instanceof EmailServiceError 
        ? error.message 
        : 'Failed to load contact submissions'
      setError(errorMessage)
      setState(prev => ({ ...prev, submissionsLoading: false }))
    }
  }, [organizationId])

  // Email templates
  const loadTemplates = useCallback(async () => {
    setState(prev => ({ ...prev, templatesLoading: true }))
    setError(null)
    
    try {
      const templates = await emailTemplateApi.getTemplates(organizationId)
      setState(prev => ({ ...prev, templates, templatesLoading: false }))
      
    } catch (error) {
      const errorMessage = error instanceof EmailServiceError 
        ? error.message 
        : 'Failed to load email templates'
      setError(errorMessage)
      setState(prev => ({ ...prev, templatesLoading: false }))
    }
  }, [organizationId])

  const sendEmail = useCallback(async (templateId: string, templateData: Record<string, any>, to: string[]) => {
    setSubmitting(true)
    setError(null)
    
    try {
      const result = await emailSendingApi.sendTemplate(templateId, {
        to,
        templateData,
        organizationId
      })
      
      return result
      
    } catch (error) {
      const errorMessage = error instanceof EmailServiceError 
        ? error.message 
        : 'Failed to send email'
      setError(errorMessage)
      throw error
      
    } finally {
      setSubmitting(false)
    }
  }, [organizationId])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadSubmissions()
      loadTemplates()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadSubmissions, loadTemplates])

  // Initial data load
  useEffect(() => {
    loadSubmissions()
    loadTemplates()
  }, [loadSubmissions, loadTemplates])

  return {
    // State
    ...state,
    
    // Actions
    submitContactForm,
    sendEmail,
    
    // Data loading
    loadSubmissions,
    loadTemplates,
    
    // Utilities
    clearError: () => setError(null)
  }
}

// Hook for email delivery monitoring
export function useEmailDeliveryMonitor(messageIds: string[] = []) {
  const [deliveryStatuses, setDeliveryStatuses] = useState<Record<string, EmailDeliveryStatus>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkDeliveryStatus = useCallback(async (messageId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const status = await emailSendingApi.getDeliveryStatus(messageId)
      
      setDeliveryStatuses(prev => ({
        ...prev,
        [messageId]: status
      }))
      
      return status
      
    } catch (error) {
      const errorMessage = error instanceof EmailServiceError 
        ? error.message 
        : 'Failed to check delivery status'
      setError(errorMessage)
      throw error
      
    } finally {
      setLoading(false)
    }
  }, [])

  const checkAllStatuses = useCallback(async () => {
    if (messageIds.length === 0) return

    setLoading(true)
    
    const promises = messageIds.map(id => checkDeliveryStatus(id))
    
    try {
      await Promise.allSettled(promises)
    } finally {
      setLoading(false)
    }
  }, [messageIds, checkDeliveryStatus])

  const retryFailedEmail = useCallback(async (messageId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await emailSendingApi.retryFailedEmail(messageId)
      
      // Refresh delivery status after retry
      await checkDeliveryStatus(messageId)
      
      return result
      
    } catch (error) {
      const errorMessage = error instanceof EmailServiceError 
        ? error.message 
        : 'Failed to retry email'
      setError(errorMessage)
      throw error
      
    } finally {
      setLoading(false)
    }
  }, [checkDeliveryStatus])

  // Auto-check delivery statuses
  useEffect(() => {
    if (messageIds.length > 0) {
      checkAllStatuses()
    }
  }, [messageIds, checkAllStatuses])

  return {
    deliveryStatuses,
    loading,
    error,
    checkDeliveryStatus,
    checkAllStatuses,
    retryFailedEmail,
    clearError: () => setError(null)
  }
}

// Hook for email template management
export function useEmailTemplates(organizationId?: string) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const templates = await emailTemplateApi.getTemplates(organizationId)
      setTemplates(templates)
      
    } catch (error) {
      const errorMessage = error instanceof EmailServiceError 
        ? error.message 
        : 'Failed to load templates'
      setError(errorMessage)
      
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  const getTemplateByType = useCallback(async (type: EmailType) => {
    setError(null)
    
    try {
      return await emailTemplateApi.getTemplateByType(type, organizationId)
      
    } catch (error) {
      const errorMessage = error instanceof EmailServiceError 
        ? error.message 
        : `Failed to load ${type} template`
      setError(errorMessage)
      throw error
    }
  }, [organizationId])

  const createTemplate = useCallback(async (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const newTemplate = await emailTemplateApi.createTemplate(template)
      setTemplates(prev => [...prev, newTemplate])
      return newTemplate
      
    } catch (error) {
      const errorMessage = error instanceof EmailServiceError 
        ? error.message 
        : 'Failed to create template'
      setError(errorMessage)
      throw error
      
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTemplate = useCallback(async (id: string, updates: Partial<EmailTemplate>) => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedTemplate = await emailTemplateApi.updateTemplate(id, updates)
      
      setTemplates(prev => 
        prev.map(t => t.id === id ? updatedTemplate : t)
      )
      
      return updatedTemplate
      
    } catch (error) {
      const errorMessage = error instanceof EmailServiceError 
        ? error.message 
        : 'Failed to update template'
      setError(errorMessage)
      throw error
      
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await emailTemplateApi.deleteTemplate(id)
      
      setTemplates(prev => prev.filter(t => t.id !== id))
      
    } catch (error) {
      const errorMessage = error instanceof EmailServiceError 
        ? error.message 
        : 'Failed to delete template'
      setError(errorMessage)
      throw error
      
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  return {
    templates,
    loading,
    error,
    loadTemplates,
    getTemplateByType,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    clearError: () => setError(null)
  }
}