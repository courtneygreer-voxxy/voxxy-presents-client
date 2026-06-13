import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Mail, Users, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export interface EmailNotification {
  type: 'category_changed' | 'event_details_changed' | 'payment_confirmed' | 'event_canceled'
  requires_confirmation: boolean
  recipient_count?: number
  recipient_email?: string
  warning: string
  changed_fields?: string[]
  endpoint: {
    check?: string
    send: string
  }
}

interface EmailNotificationDialogProps {
  notification: EmailNotification | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function EmailNotificationDialog({
  notification,
  open,
  onOpenChange,
  onConfirm,
}: EmailNotificationDialogProps) {
  const [sending, setSending] = useState(false)

  if (!notification) return null

  const handleConfirm = async () => {
    try {
      setSending(true)
      await onConfirm()
      onOpenChange(false)
      toast.success('Email notification sent successfully')
    } catch (error: any) {
      console.error('Failed to send email:', error)
      toast.error(error.message || 'Failed to send email notification')
    } finally {
      setSending(false)
    }
  }

  const getIcon = () => {
    if (notification.type === 'event_canceled') {
      return <AlertTriangle className="h-6 w-6 text-red-500" />
    }
    return <Mail className="h-6 w-6 text-blue-500" />
  }

  const getTitle = () => {
    switch (notification.type) {
      case 'category_changed':
        return 'Send Category Update Email?'
      case 'event_details_changed':
        return 'Send Event Update Email?'
      case 'payment_confirmed':
        return 'Send Payment Confirmation?'
      case 'event_canceled':
        return 'Send Cancellation Email?'
      default:
        return 'Send Email Notification?'
    }
  }

  const getRecipientInfo = () => {
    if (notification.recipient_count !== undefined) {
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-blue-900">
            This will send an email to{' '}
            <span className="font-semibold">{notification.recipient_count}</span>{' '}
            {notification.recipient_count === 1 ? 'vendor' : 'vendors'}
          </span>
        </div>
      )
    }

    if (notification.recipient_email) {
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm">
          <Mail className="h-4 w-4 text-blue-600" />
          <span className="text-blue-900">
            Recipient: <span className="font-mono">{notification.recipient_email}</span>
          </span>
        </div>
      )
    }

    return null
  }

  const getChangedFieldsInfo = () => {
    if (!notification.changed_fields || notification.changed_fields.length === 0) {
      return null
    }

    return (
      <div className="p-3 bg-amber-50 rounded-lg text-sm">
        <div className="font-medium text-amber-900 mb-2">Fields Updated:</div>
        <ul className="list-disc list-inside space-y-1 text-amber-800">
          {notification.changed_fields.map((field) => (
            <li key={field} className="capitalize">
              {field.replace(/_/g, ' ')}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p className="text-gray-700">{notification.warning}</p>
            {getRecipientInfo()}
            {getChangedFieldsInfo()}
            {notification.type === 'event_canceled' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900 font-medium">
                  ⚠️ This action cannot be undone. All vendors will be notified of the cancellation.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={sending}>Skip</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sending ? (
              <>
                <span className="inline-block mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
