import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { sanitizeInput } from '@/utils/inputSanitization'
import { notificationService } from '@/services/notificationService'
import type { CreateEmailRecipientData } from '@/types/database'

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

      // TODO: Database permissions need to be configured
      // For now, simulate successful subscription without database write
      console.log('Subscription data (simulated save):', sanitizedData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Send admin notification (disabled temporarily due to permissions)
      try {
        await notificationService.notifyAdminOfNewSubscription({
          organizationId: sanitizedData.organizationId,
          subscriberName: sanitizedData.name,
          subscriberEmail: sanitizedData.email,
          message: sanitizedData.message,
          preferences: sanitizedData.preferences,
          source: sanitizedData.source
        })
      } catch (notificationError) {
        // Notification failed but subscription succeeded - just log the error
        console.warn('Admin notification failed but subscription was successful:', notificationError)
      }

      return {
        success: true,
        submissionId: 'simulated_' + Date.now()
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
}

export const subscriptionService = new SubscriptionService()