import { useState } from 'react'
import { eventsApi, registrationsApi } from '@/services/api'
import { notify } from '@/errors/notify'
import { getApiErrorMessage } from '@/errors/getApiErrorMessage'
import { getMessage } from '@/errors/catalog'

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
  dialogOpen: boolean
  dialogProps: {
    title: string
    warning: string
    recipientCount?: number
    recipientEmail?: string
    type: EmailNotification['type'] | undefined
    isLoading: boolean
  }
  handleEmailNotification: (
    notification: EmailNotification | null,
    eventSlug?: string,
    registrationId?: number,
  ) => void
  handleConfirmSend: () => void
  closeDialog: () => void
}

function showEmailSendSuccess(result: {
  message: string
  sent_count?: number
  failed_count?: number
}) {
  const hasRecipientStats = result.sent_count !== undefined
  notify.success({
    key: 'email.sendSuccess',
    params: { message: result.message },
    fallback: result.message,
    description: hasRecipientStats
      ? getMessage('email.sendSuccessDescription', {
          sentCount: result.sent_count ?? 0,
          failedCount: result.failed_count ?? 0,
        })
      : undefined,
  })
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
    regId?: number,
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
          showEmailSendSuccess(result)
          break

        case 'event_canceled':
          if (!eventSlug) throw new Error('Event slug is required')
          result = await eventsApi.sendCancellationEmails(eventSlug)
          showEmailSendSuccess(result)
          break

        case 'payment_confirmed':
          if (!registrationId) throw new Error('Registration ID is required')
          result = await registrationsApi.sendPaymentConfirmation(registrationId)
          showEmailSendSuccess(result)
          break

        case 'category_changed':
          if (!registrationId) throw new Error('Registration ID is required')
          result = await registrationsApi.sendCategoryChangeNotification(registrationId)
          showEmailSendSuccess(result)
          break

        default:
          throw new Error(`Unknown notification type: ${currentNotification.type}`)
      }

      setDialogOpen(false)
      setCurrentNotification(null)
    } catch (error: unknown) {
      console.error('Failed to send email notification:', error)
      notify.error({
        key: 'email.sendFailed',
        fallback: getApiErrorMessage(error) || getMessage('email.sendFailedDescription'),
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
        return 'Notify Vendor of Category Change?'
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
