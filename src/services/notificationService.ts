import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from '@/hooks/use-toast'

interface AdminNotificationData {
  organizationId: string
  subscriberName: string
  subscriberEmail: string
  message?: string
  preferences: {
    events: boolean
    newsletter: boolean
    updates: boolean
  }
  source: string
}

interface ToastNotification {
  organizationId: string
  title: string
  message: string
  type: 'subscription' | 'event' | 'system'
}

class NotificationService {
  private activeNotifications = new Set<string>()

  /**
   * Notify admins of new subscription
   */
  async notifyAdminOfNewSubscription(data: AdminNotificationData) {
    try {
      // Create notification record in database
      const notificationData = {
        type: 'new_subscription',
        organizationId: data.organizationId,
        title: 'New Club Subscription',
        message: `${data.subscriberName} (${data.subscriberEmail}) has subscribed to your club updates.`,
        metadata: {
          subscriberName: data.subscriberName,
          subscriberEmail: data.subscriberEmail,
          subscriberMessage: data.message,
          preferences: data.preferences,
          source: data.source
        },
        isRead: false,
        priority: 'normal',
        createdAt: serverTimestamp()
      }

      // Save to database
      const docRef = await addDoc(collection(db, 'admin_notifications'), notificationData)

      // Show immediate toast notification to any active admins
      this.showToastNotification({
        organizationId: data.organizationId,
        title: '🎉 New Subscriber!',
        message: `${data.subscriberName} just joined your club`,
        type: 'subscription'
      })

      return { success: true, notificationId: docRef.id }

    } catch (error) {
      console.error('Failed to send admin notification:', error)
      throw error
    }
  }

  /**
   * Show real-time toast notification
   */
  showToastNotification(notification: ToastNotification) {
    const notificationKey = `${notification.organizationId}_${Date.now()}`
    
    // Prevent duplicate notifications
    if (this.activeNotifications.has(notificationKey)) {
      return
    }

    this.activeNotifications.add(notificationKey)

    // Show toast with custom styling
    toast({
      title: notification.title,
      description: notification.message,
      duration: 5000, // Show for 5 seconds
      className: "border-purple-200 bg-purple-50",
    })

    // Clean up after duration
    setTimeout(() => {
      this.activeNotifications.delete(notificationKey)
    }, 6000)
  }

  /**
   * Get unread notifications for an organization
   */
  async getUnreadNotifications(organizationId: string) {
    try {
      const q = query(
        collection(db, 'admin_notifications'),
        where('organizationId', '==', organizationId),
        where('isRead', '==', false)
      )

      const querySnapshot = await getDocs(q)
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return notifications
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return []
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      const notificationRef = collection(db, 'admin_notifications')
      // Note: In a real implementation, you'd use updateDoc here
      // For now, this is a placeholder for the update functionality
      console.log(`Marking notification ${notificationId} as read`)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  /**
   * Send email notification to admins (placeholder for SendPulse integration)
   */
  async sendEmailNotification(organizationId: string, notification: any) {
    try {
      // Placeholder for SendPulse API integration
      // This would send actual emails to admin users
      console.log(`Sending email notification for organization ${organizationId}:`, notification)
      
      // TODO: Implement SendPulse API call here
      // const response = await fetch('/api/sendpulse/notify-admins', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ organizationId, notification })
      // })
      
      return { success: true }
    } catch (error) {
      console.error('Failed to send email notification:', error)
      throw error
    }
  }

  /**
   * Create system-wide notification
   */
  async createSystemNotification(title: string, message: string, organizationId?: string) {
    try {
      const notificationData = {
        type: 'system',
        title,
        message,
        organizationId: organizationId || null,
        isRead: false,
        priority: 'high',
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'admin_notifications'), notificationData)
      
      // Show toast for immediate feedback
      this.showToastNotification({
        organizationId: organizationId || 'system',
        title,
        message,
        type: 'system'
      })

      return { success: true, notificationId: docRef.id }
    } catch (error) {
      console.error('Failed to create system notification:', error)
      throw error
    }
  }

  /**
   * Batch process notifications (for rate limiting)
   */
  private pendingNotifications: AdminNotificationData[] = []
  private batchTimer: NodeJS.Timeout | null = null

  addToBatch(notification: AdminNotificationData) {
    this.pendingNotifications.push(notification)
    
    // Process batch after 2 seconds or when batch size reaches 10
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch()
    }, 2000)

    if (this.pendingNotifications.length >= 10) {
      this.processBatch()
    }
  }

  private async processBatch() {
    if (this.pendingNotifications.length === 0) return

    const batch = [...this.pendingNotifications]
    this.pendingNotifications = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    try {
      // Process all notifications in batch
      await Promise.all(
        batch.map(notification => this.notifyAdminOfNewSubscription(notification))
      )
    } catch (error) {
      console.error('Failed to process notification batch:', error)
    }
  }
}

export const notificationService = new NotificationService()