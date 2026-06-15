import { useState } from 'react'
import { AlertCircle, Loader2, Mail, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CancellationEmailDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  recipientCount: number
  eventTitle: string
}

export function CancellationEmailDialog({
  isOpen,
  onClose,
  onConfirm,
  recipientCount,
  eventTitle,
}: CancellationEmailDialogProps) {
  const [isSending, setIsSending] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsSending(true)
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Failed to send cancellation emails:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="voxxy-surface-elevated border-white/10 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
              disabled={isSending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Confirm Event Cancellation
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Cancelling this event will automatically notify all registered vendors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Event Info */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-white/60 mb-1">Event</p>
            <p className="font-semibold text-white">{eventTitle}</p>
          </div>

          {/* Recipient Count */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-white/60">Recipients</p>
                <p className="font-semibold text-white">
                  {recipientCount} {recipientCount === 1 ? 'vendor' : 'vendors'}
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-sm text-yellow-200">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-sm text-yellow-200/90 mt-2 space-y-1 list-disc list-inside">
              <li>Event status will be set to "Cancelled"</li>
              <li>
                All {recipientCount} registered {recipientCount === 1 ? 'vendor' : 'vendors'} will
                be notified via email
              </li>
              <li>Emails will include refund information if applicable</li>
              <li>No new applications will be accepted</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSending}
              className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Confirm Cancellation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
