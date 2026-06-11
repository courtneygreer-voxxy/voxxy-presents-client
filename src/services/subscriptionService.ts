import { sanitizeInput } from '@/utils/inputSanitization'
import { registrationsApi } from '@/services/api'

interface SubscriptionData {
  organizationId: string
  email?: string
  phone?: string
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
      // Validate that we have either email or phone
      if (!data.email && !data.phone) {
        throw new Error('Either email or phone number is required')
      }

      // Sanitize all text inputs
      const sanitizedData: any = {
        ...data,
        name: sanitizeInput(data.name.trim()),
        message: data.message ? sanitizeInput(data.message.trim()) : undefined,
      }

      // Sanitize and validate email if provided
      if (data.email) {
        sanitizedData.email = sanitizeInput(data.email.trim().toLowerCase())
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(sanitizedData.email)) {
          throw new Error('Invalid email format')
        }
      }

      // Sanitize and validate phone if provided
      if (data.phone) {
        const digitsOnly = data.phone.replace(/\D/g, '')
        if (digitsOnly.length < 10) {
          throw new Error('Phone number must have at least 10 digits')
        }
        sanitizedData.phone = digitsOnly
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
        phone: sanitizedData.phone,
        registrationType: 'subscription' as any,
        notes: sanitizedData.message,
        subscribeToUpdates: sanitizedData.preferences.updates,
        subscribeToNewsletter: sanitizedData.preferences.newsletter,
        source: 'website',
      })

      console.log('Subscription created successfully:', result)

      return {
        success: true,
        submissionId: result.registration?.id || 'created_' + Date.now(),
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

  async getOrganizationSubscribers(organizationId: string) {
    try {
      // Fetch all org subscriptions
      const subscriptions = await registrationsApi.getByEvent('org_subscription')

      // Filter by organizationId since the API returns all subscriptions
      const allSubscribers = subscriptions.registrations?.subscription || []
      const filteredSubscribers = allSubscribers.filter(
        (sub: any) => sub.organizationId === organizationId,
      )

      console.log(
        `📊 Filtered ${filteredSubscribers.length} subscribers for org ${organizationId} from ${allSubscribers.length} total`,
      )

      return filteredSubscribers
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
      return []
    }
  }
}

export const subscriptionService = new SubscriptionService()
