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

interface EmailConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  warning: string
  recipientCount?: number
  type?: 'event_details_changed' | 'event_canceled' | 'payment_confirmed' | 'category_changed'
  recipientEmail?: string
  isLoading?: boolean
}

export function EmailConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  warning,
  recipientCount,
  type,
  recipientEmail,
  isLoading = false,
}: EmailConfirmationDialogProps) {
  const isBulkEmail = recipientCount !== undefined && recipientCount > 1
  const isHighPriority = type === 'event_canceled'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {isHighPriority ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Mail className="h-5 w-5 text-purple-600" />
            )}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4">
            <p className="text-sm text-gray-700">{warning}</p>

            {isBulkEmail && (
              <div className="flex items-center gap-2 rounded-md bg-purple-50 p-3 text-sm">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-purple-900 font-medium">
                  {recipientCount} {recipientCount === 1 ? 'recipient' : 'recipients'} will receive this email
                </span>
              </div>
            )}

            {recipientEmail && (
              <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900 font-medium">
                  Recipient: {recipientEmail}
                </span>
              </div>
            )}

            {isHighPriority && (
              <div className="rounded-md bg-red-50 p-3 text-sm">
                <p className="text-red-800 font-medium">⚠️ This action cannot be undone</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className={
              isHighPriority
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-600'
            }
          >
            {isLoading ? 'Sending...' : isBulkEmail ? 'Yes, Send Emails' : 'Yes, Send Email'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
