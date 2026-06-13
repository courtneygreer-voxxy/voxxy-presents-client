import { useState, useCallback } from 'react'
import type { EmailNotification } from '@/components/producer/EmailNotificationDialog'

/**
 * Hook to handle email notification confirmations
 *
 * Usage:
 * const { emailNotification, showEmailNotification, handleEmailConfirm } = useEmailNotification();
 *
 * // After API call that might trigger email notification
 * if (response.email_notification) {
 *   showEmailNotification(response.email_notification, async () => {
 *     await api.post(response.email_notification.endpoint.send);
 *   });
 * }
 */
export function useEmailNotification() {
  const [emailNotification, setEmailNotification] = useState<EmailNotification | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => Promise<void>) | null>(null)

  const showEmailNotification = useCallback(
    (notification: EmailNotification, onConfirm: () => Promise<void>) => {
      setEmailNotification(notification)
      setOnConfirmCallback(() => onConfirm)
      setDialogOpen(true)
    },
    [],
  )

  const handleEmailConfirm = useCallback(async () => {
    if (onConfirmCallback) {
      await onConfirmCallback()
    }
  }, [onConfirmCallback])

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
    setEmailNotification(null)
    setOnConfirmCallback(null)
  }, [])

  return {
    emailNotification,
    dialogOpen,
    showEmailNotification,
    handleEmailConfirm,
    closeDialog,
  }
}
