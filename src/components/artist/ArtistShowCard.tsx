import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  Calendar,
  MapPin,
  Building2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Mail,
  ExternalLink,
} from 'lucide-react'
import {
  type ArtistShow,
  SHOW_STATUS_BADGE,
  PAYMENT_STATUS_BADGE,
} from '@/mocks/artistPortalData'
import type { BadgeVariant } from '@/components/ui/badge'

interface ArtistShowCardProps {
  show: ArtistShow
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function ArtistShowCard({ show }: ArtistShowCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'optout' | 'decline' | 'withdraw' | null>(null)

  const statusBadge = SHOW_STATUS_BADGE[show.status]
  const paymentBadge = PAYMENT_STATUS_BADGE[show.payment_status]

  const handleConfirmAction = () => {
    // Prototype — just close the dialog
    setConfirmAction(null)
  }

  const getConfirmText = () => {
    switch (confirmAction) {
      case 'optout':
        return {
          title: 'Opt Out of Event',
          description: `Are you sure you want to opt out of ${show.event_title}? The producer will be notified and your spot may be given to another artist.`,
          action: 'Opt Out',
        }
      case 'decline':
        return {
          title: 'Decline Invitation',
          description: `Are you sure you want to decline the invitation to ${show.event_title}? You can always re-apply later if spots are available.`,
          action: 'Decline',
        }
      case 'withdraw':
        return {
          title: 'Withdraw Application',
          description: `Are you sure you want to withdraw your application to ${show.event_title}? You can re-apply before the deadline.`,
          action: 'Withdraw',
        }
      default:
        return { title: '', description: '', action: '' }
    }
  }

  return (
    <>
      <Card className={`overflow-hidden ${show.is_past ? 'opacity-70' : ''}`}>
        {/* Color accent bar */}
        <div
          className={`h-1 ${
            show.status === 'approved'
              ? 'bg-green-500'
              : show.status === 'invited'
                ? 'bg-purple-500'
                : show.status === 'pending'
                  ? 'bg-yellow-500'
                  : show.status === 'rejected'
                    ? 'bg-red-500'
                    : 'bg-orange-500'
          }`}
        />
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            {/* Event Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{show.event_title}</h3>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>
                    {formatDate(show.event_date)}
                    {show.event_end_date &&
                      ` — ${formatTime(show.event_date)} to ${formatTime(show.event_end_date)}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>
                    {show.venue_name}, {show.city}, {show.state}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  <span>{show.organization_name}</span>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
              <Badge variant={statusBadge.variant as BadgeVariant}>{statusBadge.label}</Badge>
              {show.status === 'approved' && show.payment_status !== 'not_required' && (
                <Badge variant={paymentBadge.variant as BadgeVariant}>{paymentBadge.label}</Badge>
              )}
              {show.vendor_category && (
                <Badge variant="tintNeutralFaint">{show.vendor_category}</Badge>
              )}
              {show.is_past && <Badge variant="tintMuted">Past</Badge>}
            </div>
          </div>

          {/* Action Buttons */}
          {!show.is_past && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    View Details
                  </>
                )}
              </Button>

              {show.status === 'invited' && (
                <>
                  <Button size="sm" variant="gradient">
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmAction('decline')}
                  >
                    Decline
                  </Button>
                </>
              )}

              {show.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmAction('withdraw')}
                >
                  Withdraw Application
                </Button>
              )}

              {show.status === 'approved' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
                  onClick={() => setConfirmAction('optout')}
                >
                  Opt Out
                </Button>
              )}
            </div>
          )}

          {/* Expanded Details */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">{show.event_description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {show.venue_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">Venue</p>
                      <p className="text-xs text-foreground">{show.venue_name}</p>
                      <p className="text-xs text-muted-foreground">{show.venue_address}</p>
                    </div>
                  </div>
                )}

                {show.install_date && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">Install</p>
                      <p className="text-xs text-foreground">
                        {formatDate(show.install_date)} at {show.install_time}
                      </p>
                    </div>
                  </div>
                )}

                {show.booth_price !== null && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">Booth Fee</p>
                      <p className="text-xs text-foreground">${show.booth_price}</p>
                      {show.payment_deadline && (
                        <p className="text-xs text-muted-foreground">
                          Due by {formatDate(show.payment_deadline)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {show.application_deadline && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">
                        Application Deadline
                      </p>
                      <p className="text-xs text-foreground">{formatDate(show.application_deadline)}</p>
                    </div>
                  </div>
                )}
              </div>

              {show.producer_contact_email && (
                <div className="flex items-center gap-2 pt-2">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <a
                    href={`mailto:${show.producer_contact_email}`}
                    className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    {show.producer_contact_email}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getConfirmText().title}</AlertDialogTitle>
            <AlertDialogDescription>{getConfirmText().description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {getConfirmText().action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
