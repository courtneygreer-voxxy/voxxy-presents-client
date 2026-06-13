import { useState, useEffect } from 'react'
import { Mail, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/AuthContext'
import { bulletinsApi } from '@/services/api'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'
import type {
  Bulletin,
  CreateBulletinRequest,
  EmailAudienceCriteria,
  RecipientPreview,
} from '@/types/bulletin'

interface CreateBulletinModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateBulletinRequest) => Promise<void>
  editBulletin?: Bulletin
  eventSlug: string
}

export function CreateBulletinModal({
  isOpen,
  onClose,
  onSubmit,
  editBulletin,
  eventSlug,
}: CreateBulletinModalProps) {
  const { userProfile } = useAuth()
  const [subject, setSubject] = useState(editBulletin?.subject || '')
  const [body, setBody] = useState(editBulletin?.body || '')
  const [pinned, setPinned] = useState(editBulletin?.pinned || false)
  const [sendEmail, setSendEmail] = useState(editBulletin?.send_email_notification || false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Audience selection state
  const [audienceType, setAudienceType] = useState<'approved' | 'all'>('approved')
  const [recipientPreview, setRecipientPreview] = useState<RecipientPreview | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Build audience criteria based on selections
  const buildAudienceCriteria = (): EmailAudienceCriteria => {
    if (audienceType === 'all') {
      return { include_all: true }
    } else {
      // 'approved' - default behavior (approved + confirmed vendors)
      return { statuses: ['approved', 'confirmed'] }
    }
  }

  // Fetch recipient preview whenever audience selection changes
  useEffect(() => {
    if (!sendEmail || !eventSlug) {
      return
    }

    const fetchPreview = async () => {
      try {
        setLoadingPreview(true)
        const criteria = buildAudienceCriteria()
        const preview = await bulletinsApi.previewRecipients(eventSlug, criteria)
        setRecipientPreview(preview)
      } catch (err) {
        logger.error('Failed to fetch bulletin recipient preview', { eventSlug, error: err })
      } finally {
        setLoadingPreview(false)
      }
    }

    fetchPreview()
  }, [sendEmail, audienceType, eventSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !body.trim()) {
      setError('Subject and message are required')
      return
    }

    // Show confirmation modal if sending email
    if (sendEmail) {
      setShowConfirmModal(true)
    } else {
      await submitBulletin()
    }
  }

  const submitBulletin = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const data: CreateBulletinRequest = {
        subject,
        body,
        pinned,
        send_email_notification: sendEmail,
        email_audience_criteria: sendEmail ? buildAudienceCriteria() : undefined,
      }

      await onSubmit(data)
      handleClose()

      if (sendEmail && recipientPreview) {
        toast.success(`Bulletin posted and emailed to ${recipientPreview.total} vendors`)
      } else {
        toast.success('Bulletin posted successfully')
      }
    } catch (err) {
      logger.error('Failed to create bulletin', { eventSlug, error: err })
      setError(err instanceof Error ? err.message : 'Failed to create bulletin')
    } finally {
      setIsSubmitting(false)
      setShowConfirmModal(false)
    }
  }

  const handleClose = () => {
    setSubject('')
    setBody('')
    setPinned(false)
    setSendEmail(false)
    setAudienceType('approved')
    setRecipientPreview(null)
    setError(null)
    setShowConfirmModal(false)
    onClose()
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl voxxy-gradient-card-deep border-primary/20 p-0 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {editBulletin ? 'Edit Bulletin Message' : 'Create Bulletin Message'}
            </DialogTitle>
          </div>

          {/* Producer Info */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-foreground font-bold text-lg">
                  {userProfile?.name ? getInitials(userProfile.name) : 'GG'}
                </span>
              </div>
              <div>
                <p className="text-foreground font-semibold">{userProfile?.name || 'Producer'}</p>
                <p className="text-sm text-foreground/60">Producer</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Subject */}
            <Input
              type="text"
              placeholder="Subject or title for your message..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-background/5 border-border text-foreground placeholder:text-foreground/40 focus:border-primary/50"
              autoFocus
            />

            {/* Body */}
            <div className="space-y-2">
              <Textarea
                placeholder="What would you like to share with vendors?"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="bg-background/5 border-border text-foreground placeholder:text-foreground/40 focus:border-primary/50 resize-none"
              />
              <p className="text-xs text-foreground/50">You can format your message with:</p>
              <ul className="text-xs text-foreground/40 space-y-1 pl-4">
                <li>• Bullet points</li>
                <li>• Multiple paragraphs</li>
                <li>• Important announcements</li>
              </ul>
            </div>

            {/* Pin Option */}
            <div className="flex items-center justify-between p-3 bg-background/5 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Pin this message</p>
                <p className="text-xs text-foreground/60">Pinned messages appear at the top</p>
              </div>
              <Switch checked={pinned} onCheckedChange={setPinned} />
            </div>

            {/* Send Email Option */}
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Send as Email</p>
                  <p className="text-xs text-foreground/60">Email vendors with this bulletin</p>
                </div>
              </div>
              <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
            </div>

            {/* Audience Selection (shown when email is enabled) */}
            {sendEmail && (
              <div className="space-y-4 border-t border-border pt-4">
                <label className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Email Audience
                </label>

                {/* Audience Type Selector */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setAudienceType('approved')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      audienceType === 'approved'
                        ? 'voxxy-btn-solid border-2 border-violet-400'
                        : 'bg-background/5 text-foreground/70 border border-border hover:bg-background/10'
                    }`}
                  >
                    Approved Vendors
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudienceType('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      audienceType === 'all'
                        ? 'voxxy-btn-solid border-2 border-violet-400'
                        : 'bg-background/5 text-foreground/70 border border-border hover:bg-background/10'
                    }`}
                  >
                    All Vendors
                  </button>
                </div>

                {/* Recipient Preview */}
                {loadingPreview ? (
                  <div className="bg-primary/10 border border-primary/30 rounded p-3 text-center">
                    <p className="text-sm text-foreground/60">Loading recipient count...</p>
                  </div>
                ) : recipientPreview && recipientPreview.total > 0 ? (
                  <div className="bg-primary/10 border border-primary/30 rounded p-3">
                    <p className="text-sm text-foreground/90">
                      Will send to{' '}
                      <strong className="text-primary text-lg">{recipientPreview.total}</strong>{' '}
                      vendor{recipientPreview.total !== 1 ? 's' : ''}
                    </p>
                    {Object.keys(recipientPreview.by_category).length > 0 && (
                      <p className="text-xs text-foreground/60 mt-1">
                        {Object.entries(recipientPreview.by_category)
                          .map(([cat, count]) => `${count} ${cat || 'Uncategorized'}`)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                    <p className="text-sm text-yellow-200">
                      No vendors match the selected criteria
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="bg-background/5 border-border text-foreground hover:bg-background/10"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !subject.trim() ||
                  !body.trim() ||
                  (sendEmail && recipientPreview?.total === 0)
                }
                className="voxxy-btn-cta-pink"
              >
                {isSubmitting ? 'Posting...' : 'Post to Bulletin'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      {showConfirmModal && recipientPreview && (
        <Dialog open={showConfirmModal} onOpenChange={() => setShowConfirmModal(false)}>
          <DialogContent className="max-w-md voxxy-gradient-card-deep border-primary/20">
            <DialogTitle className="text-xl font-bold text-foreground">
              Send Bulletin Email?
            </DialogTitle>

            <div className="space-y-4 pt-4">
              <p className="text-foreground/80">
                This will send an email to{' '}
                <strong className="text-primary text-lg">{recipientPreview.total}</strong> vendor
                {recipientPreview.total !== 1 ? 's' : ''}.
              </p>

              {Object.keys(recipientPreview.by_category).length > 0 && (
                <div className="bg-background/5 rounded-lg p-3 border border-border">
                  <p className="text-xs text-foreground/60 mb-2">Breakdown by category:</p>
                  <ul className="text-sm text-foreground/80 space-y-1">
                    {Object.entries(recipientPreview.by_category).map(([cat, count]) => (
                      <li key={cat}>
                        • {count} {cat || 'Uncategorized'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Object.keys(recipientPreview.by_status).length > 0 && (
                <div className="bg-background/5 rounded-lg p-3 border border-border">
                  <p className="text-xs text-foreground/60 mb-2">Breakdown by status:</p>
                  <ul className="text-sm text-foreground/80 space-y-1">
                    {Object.entries(recipientPreview.by_status).map(([status, count]) => (
                      <li key={status} className="capitalize">
                        • {count} {status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-background/5 border-border text-foreground hover:bg-background/10"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submitBulletin}
                  disabled={isSubmitting}
                  className="flex-1 voxxy-btn-cta-pink"
                >
                  {isSubmitting ? 'Sending...' : 'Confirm & Send'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
