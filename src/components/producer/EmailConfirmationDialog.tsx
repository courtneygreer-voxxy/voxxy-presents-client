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
      <AlertDialogContent className="bg-card text-card-foreground border border-border">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isHighPriority ? 'bg-red-500/20' : 'bg-primary/20'}`}>
              {isHighPriority ? (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              ) : (
                <Mail className="h-5 w-5 text-primary" />
              )}
            </div>
            <AlertDialogTitle className="text-foreground">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2">
              <p className="text-sm text-foreground/60">{warning}</p>

              {isBulkEmail && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 p-3 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-primary font-medium">
                    {recipientCount} {recipientCount === 1 ? 'recipient' : 'recipients'} will receive this email
                  </span>
                </div>
              )}

              {recipientEmail && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 font-medium">
                    Recipient: {recipientEmail}
                  </span>
                </div>
              )}

              {isHighPriority && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm">
                  <p className="text-red-400 font-medium">This action cannot be undone</p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="border-border text-foreground hover:bg-background/5 hover:text-foreground bg-transparent"
          >
            {type === 'category_changed' ? 'Skip Notification' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className={
              isHighPriority
                ? 'bg-red-600 hover:bg-red-700 text-destructive-foreground'
                : 'voxxy-btn-solid'
            }
          >
            {isLoading ? 'Sending...' : type === 'category_changed' ? 'Send Notification' : isBulkEmail ? 'Yes, Send Emails' : 'Yes, Send Email'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
