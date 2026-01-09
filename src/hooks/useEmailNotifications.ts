import { useState } from 'react'
import { eventsApi, registrationsApi } from '@/services/api'
import { toast } from 'sonner'

interface EmailNotification {
  type: 'event_details_changed' | 'event_canceled' | 'payment_confirmed' | 'category_changed'
  requires_confirmation: boolean
  recipient_count?: number
  recipient_email?: string
  warning: string
  changed_fields?: string[]
  endpoint?: {
    check?: string
    send?: string
  }
}

interface UseEmailNotificationsReturn {
  // Dialog state
  dialogOpen: boolean
  dialogProps: {
    title: string
    warning: string
    recipientCount?: number
    recipientEmail?: string
    type: EmailNotification['type'] | undefined
    isLoading: boolean
  }
  // Actions
  handleEmailNotification: (notification: EmailNotification | null, eventSlug?: string, registrationId?: number) => void
  handleConfirmSend: () => void
  closeDialog: () => void
}

export function useEmailNotifications(): UseEmailNotificationsReturn {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<EmailNotification | null>(null)
  const [eventSlug, setEventSlug] = useState<string | undefined>()
  const [registrationId, setRegistrationId] = useState<number | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailNotification = (
    notification: EmailNotification | null,
    slug?: string,
    regId?: number
  ) => {
    if (!notification || !notification.requires_confirmation) {
      return
    }

    setCurrentNotification(notification)
    setEventSlug(slug)
    setRegistrationId(regId)
    setDialogOpen(true)
  }

  const handleConfirmSend = async () => {
    if (!currentNotification) return

    setIsLoading(true)

    try {
      let result: { success: boolean; message: string; sent_count?: number; failed_count?: number }

      switch (currentNotification.type) {
        case 'event_details_changed':
          if (!eventSlug) throw new Error('Event slug is required')
          result = await eventsApi.sendEventUpdateEmails(eventSlug)
          toast.success(result.message, {
            description: `Sent to ${result.sent_count} recipients${
              result.failed_count ? ` (${result.failed_count} failed)` : ''
            }`,
          })
          break

        case 'event_canceled':
          if (!eventSlug) throw new Error('Event slug is required')
          result = await eventsApi.sendCancellationEmails(eventSlug)
          toast.success(result.message, {
            description: `Sent to ${result.sent_count} recipients${
              result.failed_count ? ` (${result.failed_count} failed)` : ''
            }`,
          })
          break

        case 'payment_confirmed':
          if (!registrationId) throw new Error('Registration ID is required')
          result = await registrationsApi.sendPaymentConfirmation(registrationId)
          toast.success(result.message)
          break

        case 'category_changed':
          if (!registrationId) throw new Error('Registration ID is required')
          result = await registrationsApi.sendCategoryChangeNotification(registrationId)
          toast.success(result.message)
          break

        default:
          throw new Error(`Unknown notification type: ${currentNotification.type}`)
      }

      setDialogOpen(false)
      setCurrentNotification(null)
    } catch (error: any) {
      console.error('Failed to send email notification:', error)
      toast.error('Failed to send email', {
        description: error.message || 'An unexpected error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setCurrentNotification(null)
    setEventSlug(undefined)
    setRegistrationId(undefined)
  }

  const getDialogTitle = () => {
    switch (currentNotification?.type) {
      case 'event_details_changed':
        return 'Send Event Update Email?'
      case 'event_canceled':
        return 'Send Cancellation Email?'
      case 'payment_confirmed':
        return 'Send Payment Confirmation?'
      case 'category_changed':
        return 'Send Category Change Notification?'
      default:
        return 'Send Email Notification?'
    }
  }

  return {
    dialogOpen,
    dialogProps: {
      title: getDialogTitle(),
      warning: currentNotification?.warning || '',
      recipientCount: currentNotification?.recipient_count,
      recipientEmail: currentNotification?.recipient_email,
      type: currentNotification?.type,
      isLoading,
    },
    handleEmailNotification,
    handleConfirmSend,
    closeDialog,
  }
}
