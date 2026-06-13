import { useEffect, useState } from 'react'
import { Mail, Building2, User, Loader2, Users, Info } from 'lucide-react'
import { scheduledEmailsApi, eventInvitationsApi } from '@/services/api'
import { logger } from '@/utils/logger'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface Recipient {
  email: string
  name: string
  organization: string
}

interface RecipientsData {
  count: number
  category: string
  email_type: 'invitation_reminders' | 'registration_emails' | 'initial_invitations'
  recipients: Recipient[]
}

interface RecipientsModalProps {
  isOpen: boolean
  onClose: () => void
  eventSlug: string
  emailId: number
  emailName: string
  isInvitationAnnouncement?: boolean
}

export default function RecipientsModal({
  isOpen,
  onClose,
  eventSlug,
  emailId,
  emailName,
  isInvitationAnnouncement = false,
}: RecipientsModalProps) {
  const [recipientsData, setRecipientsData] = useState<RecipientsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchRecipients()
    } else {
      setRecipientsData(null)
      setError(null)
    }
  }, [isOpen, emailId, isInvitationAnnouncement])

  const fetchRecipients = async () => {
    setLoading(true)
    setError(null)

    try {
      if (isInvitationAnnouncement) {
        // For initial invitation emails, fetch from event invitations
        const invitationsResponse = await eventInvitationsApi.getByEvent(eventSlug)

        const recipients = invitationsResponse.invitations
          .filter((inv) => inv.vendor_contact) // Only include invitations with contact data
          .map((inv) => ({
            email: inv.vendor_contact!.email,
            name: inv.vendor_contact!.name,
            organization: inv.vendor_contact!.business_name || inv.vendor_contact!.name,
          }))

        setRecipientsData({
          count: recipients.length,
          category: 'initial_invitations',
          email_type: 'initial_invitations',
          recipients,
        })
      } else {
        // For scheduled emails, use the existing endpoint
        const data = await scheduledEmailsApi.getRecipients(eventSlug, emailId)
        setRecipientsData(data)
      }
    } catch (err) {
      logger.error('Failed to fetch recipients', { eventSlug, emailId, error: err })
      setError(err instanceof Error ? err.message : 'Failed to load recipients')
    } finally {
      setLoading(false)
    }
  }

  const getEmailTypeLabel = (type: string) => {
    if (type === 'initial_invitations') {
      return 'Initial invitation email sent to all invited vendor contacts'
    }
    if (type === 'invitation_reminders') {
      return "Targets invited contacts who haven't applied yet"
    }
    return 'Targets vendors who have submitted applications'
  }

  const getEmailTypeBadge = (type: string) => {
    if (type === 'initial_invitations') {
      return (
        <Badge variant="tintPink" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
          <Users className="h-3 w-3" />
          Initial Invitations
        </Badge>
      )
    }
    if (type === 'invitation_reminders') {
      return (
        <Badge variant="tintPurple" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
          <Users className="h-3 w-3" />
          Invitation Reminders
        </Badge>
      )
    }
    return (
      <Badge variant="tintBlue" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
        <Users className="h-3 w-3" />
        Application Emails
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="voxxy-modal-surface flex max-h-[85vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <Mail className="w-5 h-5 text-primary" />
            <span>Email Recipients</span>
          </DialogTitle>
        </DialogHeader>

        {/* Email Info Header */}
        <div className="bg-background/5 rounded-lg p-3 border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-foreground font-medium text-sm">{emailName}</h3>
            {recipientsData && (
              <div className="text-foreground font-bold text-lg">{recipientsData.count}</div>
            )}
          </div>
          {recipientsData && (
            <div className="flex items-center gap-2">
              {getEmailTypeBadge(recipientsData.email_type)}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-foreground/60 text-sm">Loading recipients...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 m-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success State */}
          {recipientsData && !loading && !error && (
            <>
              {/* Empty State */}
              {recipientsData.count === 0 ? (
                <div className="text-center py-12 bg-background/5 rounded-lg border border-border m-4">
                  <div className="w-12 h-12 rounded-full bg-background/5 flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-foreground/30" />
                  </div>
                  <p className="text-foreground/60 text-sm font-medium mb-1">No recipients found</p>
                  <p className="text-foreground/40 text-xs">
                    This email will not be sent to anyone with the current filters.
                  </p>
                </div>
              ) : (
                <>
                  {/* Recipients List - Compact Table */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Table Header */}
                    <div className="voxxy-modal-surface sticky top-0 z-10 border-b border-border">
                      <div className="grid grid-cols-[1fr,2fr,2fr] gap-3 px-4 py-2 text-[10px] font-semibold text-foreground/50 uppercase tracking-wide">
                        <div>Name</div>
                        <div>Email</div>
                        <div>Organization</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div>
                      {recipientsData.recipients.map((recipient, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-[1fr,2fr,2fr] gap-3 px-4 py-1.5 hover:bg-background/5 transition-colors border-b border-border last:border-0 items-center text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-foreground truncate">
                              {recipient.name}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <a
                              href={`mailto:${recipient.email}`}
                              className="text-foreground/70 hover:text-primary transition-colors truncate block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {recipient.email}
                            </a>
                          </div>
                          <div className="min-w-0">
                            <div className="text-foreground/60 truncate">
                              {recipient.organization && recipient.organization !== recipient.name
                                ? recipient.organization
                                : '—'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info Note - Compact */}
                  <div className="bg-blue-500/10 rounded-lg p-2.5 border border-blue-500/20 mx-4 mb-4">
                    <p className="text-blue-300 text-xs flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{getEmailTypeLabel(recipientsData.email_type)}</span>
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
