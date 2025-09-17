import { sanitizeInput } from '@/utils/inputSanitization'
import { registrationsApi } from '@/services/api'

interface SubscriptionData {
  organizationId: string
  email: string
  name: string
  message?: string
  preferences: {
    events: boolean
    newsletter: boolean
    updates: boolean
  }
  source: 'club_page' | 'event_page' | 'footer'
}

class SubscriptionService {
  async createSubscription(data: SubscriptionData) {
    try {
      // Sanitize all text inputs
      const sanitizedData = {
        ...data,
        email: sanitizeInput(data.email.trim().toLowerCase()),
        name: sanitizeInput(data.name.trim()),
        message: data.message ? sanitizeInput(data.message.trim()) : undefined
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(sanitizedData.email)) {
        throw new Error('Invalid email format')
      }

      // Validate name length
      if (sanitizedData.name.length < 2 || sanitizedData.name.length > 100) {
        throw new Error('Name must be between 2 and 100 characters')
      }

      // Validate message length if provided
      if (sanitizedData.message && sanitizedData.message.length > 500) {
        throw new Error('Message must be less than 500 characters')
      }

      // Create subscription using registrations API
      const result = await registrationsApi.create({
        eventId: 'org_subscription', // Special event ID for org-level subscriptions
        organizationId: sanitizedData.organizationId,
        name: sanitizedData.name,
        email: sanitizedData.email,
        registrationType: 'subscription' as any,
        notes: sanitizedData.message,
        subscribeToUpdates: sanitizedData.preferences.updates,
        subscribeToNewsletter: sanitizedData.preferences.newsletter,
        source: 'website'
      })

      console.log('Subscription created successfully:', result)

      return {
        success: true,
        submissionId: result.registration?.id || 'created_' + Date.now()
      }

    } catch (error) {
      console.error('Subscription creation failed:', error)
      throw error
    }
  }

  // Rate limiting check - simple time-based approach
  async checkRateLimit(email: string): Promise<boolean> {
    try {
      // Check if this email has subscribed recently (within last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      
      // In a real implementation, you'd query the database
      // For now, we'll use localStorage as a simple rate limiting mechanism
      const recentSubscriptions = localStorage.getItem('recent_subscriptions')
      const subscriptions = recentSubscriptions ? JSON.parse(recentSubscriptions) : {}
      
      const lastSubscription = subscriptions[email]
      if (lastSubscription && new Date(lastSubscription) > fiveMinutesAgo) {
        throw new Error('Please wait before subscribing again')
      }
      
      // Update rate limit tracking
      subscriptions[email] = new Date().toISOString()
      localStorage.setItem('recent_subscriptions', JSON.stringify(subscriptions))
      
      return true
    } catch (error) {
      console.error('Rate limit check failed:', error)
      throw error
    }
  }

  async getOrganizationSubscribers(_organizationId: string) {
    try {
      // For now, we'll create a dummy event ID for org subscriptions
      // Later we can add a proper org subscribers endpoint
      const subscriptions = await registrationsApi.getByEvent('org_subscription')

      // Filter by organization if we have that data
      return subscriptions.registrations?.subscription || []
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
      return []
    }
  }
}

export const subscriptionService = new SubscriptionService()