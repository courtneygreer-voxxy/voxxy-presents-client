import { useState, useRef } from 'react'
import { TABLE_ROW_CLASSES } from '@/components/shared/tableStyles'
import { format } from 'date-fns'
import {
  MoreVertical,
  Eye,
  Edit2,
  Play,
  Pause,
  Trash2,
  RefreshCcw,
  Users,
  Megaphone,
  FileText,
  CreditCard,
  Calendar,
  PartyPopper,
  MessageSquare,
  Settings2,
  AlertTriangle,
  Clock,
  Zap,
} from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  ScheduledEmail,
  EmailCategory,
  AuditFilters,
  DeliveryStatus,
  TRIGGER_TYPES,
} from '@/types/email'
import DeliveryStatusBadge from './DeliveryStatusBadge'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import RecipientsModal from './RecipientsModal'
import { backendToFrontend } from '@/utils/emailVariables'
import { getEmailTypeInfo } from '@/utils/emailTypeHelper'
import { logger } from '@/utils/logger'

interface EmailRowProps {
  email: ScheduledEmail
  eventSlug: string
  onEdit?: (email: ScheduledEmail) => void
  onPause?: (emailId: number) => Promise<void>
  onResume?: (emailId: number) => Promise<void>
  onSendNow?: (emailId: number) => Promise<void>
  onRetryFailed?: (emailId: number) => Promise<void>
  onRetryEmail?: (emailId: number) => Promise<void>
  onDelete?: (emailId: number) => Promise<void>
  onViewAuditLog?: (filters: AuditFilters) => void
}

export default function EmailRow({
  email,
  eventSlug,
  onEdit,
  onPause,
  onResume,
  onSendNow,
  onRetryFailed,
  onRetryEmail,
  onDelete,
  onViewAuditLog,
}: EmailRowProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRecipientsModal, setShowRecipientsModal] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true)
    setShowMenu(false)
    try {
      await action()
    } catch (error) {
      logger.error('Email row action failed', { emailId: email.id, error })
    } finally {
      setIsProcessing(false)
    }
  }

  // Get email type info from trigger type using the correct utility
  const emailTypeInfo = getEmailTypeInfo(email.trigger_type)

  // Map email type labels to icons
  const getIconForEmailType = (label: string) => {
    if (label.includes('Announcement')) return Megaphone
    if (label.includes('Application')) return FileText
    if (label.includes('Payment')) return CreditCard
    if (label.includes('Countdown')) return Calendar
    return Settings2 // Default for "Other"
  }

  const CategoryIcon = getIconForEmailType(emailTypeInfo.label)

  // For audience display logic, infer category from trigger
  const getAudienceCategory = (): string => {
    const trigger = email.trigger_type
    if (
      trigger === 'on_invitation_send' ||
      trigger === 'days_before_deadline' ||
      trigger === 'days_after_deadline' ||
      trigger === 'on_bulletin_post' ||
      trigger === 'on_event_update' ||
      trigger === 'on_event_cancel'
    ) {
      return 'event_announcements'
    }
    if (
      trigger === 'on_application_submit' ||
      trigger === 'on_approval' ||
      trigger === 'on_rejection' ||
      trigger === 'on_waitlist' ||
      trigger === 'on_category_change' ||
      trigger === 'on_application_open'
    ) {
      return 'application_updates'
    }
    return 'other'
  }

  const audienceCategory = getAudienceCategory()

  const scheduledDate = email.scheduled_for ? new Date(email.scheduled_for) : null
  const isPast = scheduledDate && scheduledDate < new Date()
  const isSent = email.status === 'sent'
  const isPaused = email.status === 'paused'
  const isScheduled = email.status === 'scheduled'
  const isFailed = email.status === 'failed'

  // Determine if this is a system/trigger email (matches backend SYSTEM_TRIGGERS)
  // System emails are event-triggered and cannot be deleted
  const systemTriggers = [
    'on_application_submit',
    'on_approval',
    'on_rejection',
    'on_waitlist',
    'on_payment_received',
    'on_category_change',
    'on_event_update',
    'on_event_cancel',
    'on_invitation_send',
    'on_bulletin_post',
  ]
  const isSystemEmail = systemTriggers.includes(email.trigger_type)

  // Status badge component
  const getStatusBadge = () => {
    if (isSent) {
      return <DeliveryStatusBadge status={email.status as DeliveryStatus} />
    }

    const statusVariants: Record<string, BadgeVariant> = {
      scheduled: 'tintBlueSoft',
      paused: 'tintYellowSoft',
      active: 'tintGreenSoft',
      failed: 'tintRedSoft',
      cancelled: 'tintMutedSoft',
    }

    const variant = statusVariants[email.status] ?? 'tintMutedSoft'

    return (
      <Badge variant={variant} className="rounded px-2 py-0.5 text-[10px] font-medium">
        {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
      </Badge>
    )
  }

  // Get delivery counts from backend (populated via SendGrid webhooks)
  const undeliveredCount = email.undelivered_count || 0
  const unsubscribedCount = email.unsubscribed_count || 0

  // Check if we have delivery data to show in tooltip
  const deliveryCounts = email.delivery_counts
  const hasDeliveryData = deliveryCounts && deliveryCounts.total_sent > 0

  // Render delivery stats tooltip content
  const DeliveryTooltipContent = () => {
    if (!deliveryCounts) return null

    return (
      <div className="space-y-1">
        <div className="font-semibold text-xs mb-2 border-b border-border pb-1">
          Delivery Status
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-green-400">✓ Delivered:</span>
          <span className="font-medium">{deliveryCounts.delivered}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-red-400">✕ Bounced:</span>
          <span className="font-medium">{deliveryCounts.bounced}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-orange-400">⊘ Dropped:</span>
          <span className="font-medium">{deliveryCounts.dropped}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-yellow-400">⊗ Unsubscribed:</span>
          <span className="font-medium">{deliveryCounts.unsubscribed}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-blue-400">⋯ Pending:</span>
          <span className="font-medium">{deliveryCounts.pending}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs pt-1 mt-1 border-t border-border">
          <span className="font-semibold">Total Sent:</span>
          <span className="font-bold">{deliveryCounts.total_sent}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`voxxy-table-row voxxy-table-row-hover grid grid-cols-[minmax(180px,1.2fr),minmax(200px,1.5fr),minmax(120px,0.9fr),minmax(110px,0.9fr),minmax(80px,0.7fr),70px,80px,minmax(90px,0.8fr),50px] px-4 py-1.5 ${TABLE_ROW_CLASSES} last:border-0`}>
      {/* Email Name */}
      <div className="flex items-center gap-2 min-w-0">
        {email.overdue && email.overdue_message && (
          <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 bg-red-900/90 text-destructive-foreground px-3 py-2 rounded-lg shadow-xl border border-red-500/30"
                  sideOffset={5}
                >
                  <div className="text-xs font-semibold">Overdue: {email.overdue_message}</div>
                  <Tooltip.Arrow className="fill-red-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}
        <div className="flex-1 min-w-0">
          <div
            className={`truncate font-medium ${email.overdue ? 'text-red-600 dark:text-red-400' : 'text-foreground'} ${onEdit ? 'cursor-pointer transition-colors hover:text-violet-700 dark:hover:text-primary' : ''}`}
            onClick={(e) => {
              if (onEdit) {
                e.stopPropagation()
                onEdit(email)
              }
            }}
          >
            {email.name}
          </div>
        </div>
      </div>

      {/* Subject */}
      <div
        className={`truncate text-foreground/75 ${onEdit ? 'cursor-pointer transition-colors hover:text-violet-700 dark:hover:text-primary' : ''}`}
        title={backendToFrontend(email.subject_template || '')}
        onClick={(e) => {
          if (onEdit) {
            e.stopPropagation()
            onEdit(email)
          }
        }}
      >
        {backendToFrontend(email.subject_template || '')}
      </div>

      {/* Scheduled Date/Time or Trigger */}
      <div className="text-muted-foreground">
        {isSystemEmail ? (
          // Show trigger type for system/trigger emails (event-based)
          <span className="text-[11px] text-muted-foreground">
            {TRIGGER_TYPES.find((t) => t.value === email.trigger_type)?.label || 'Event-triggered'}
          </span>
        ) : scheduledDate ? (
          // Show date/time for scheduled emails (time-based)
          <div className="flex flex-col">
            <span className="text-[11px]">{format(scheduledDate, 'MMM d, yyyy')}</span>
            <span className="text-[10px] text-foreground/55 dark:text-foreground/40">
              {format(scheduledDate, 'h:mm a')}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-foreground/55 dark:text-foreground/40">
            Event-triggered
          </span>
        )}
      </div>

      {/* Email Type Badge */}
      <div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${emailTypeInfo.color}`}
        >
          <CategoryIcon className="w-3 h-3" />
          {emailTypeInfo.label}
        </span>
      </div>

      {/* Vendor Category */}
      <div className="truncate text-[11px] text-muted-foreground">
        {email.category?.name ||
          (audienceCategory === 'application_updates' ? 'All Invitations' : 'All Vendors')}
      </div>

      {/* Recipients Count */}
      <div className="flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation()
            // ✅ Fixed: All emails (including Position 1 Initial Invitation) now open audit log
            if (onViewAuditLog) {
              onViewAuditLog({ email_name: email.name })
            }
          }}
          className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-background/10 hover:text-foreground"
          title="Click to view audit log for this email"
        >
          <Users className="w-3 h-3" />
          <span>{email.recipient_count || 0}</span>
        </button>
      </div>

      {/* Undelivered Count */}
      <div className="text-center text-muted-foreground">
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (email.status === 'sent' && onViewAuditLog && undeliveredCount > 0) {
              onViewAuditLog({ email_name: email.name, status: 'undelivered' })
            }
          }}
          disabled={email.status !== 'sent' || !onViewAuditLog || undeliveredCount === 0}
          className={`${undeliveredCount > 0 ? 'font-medium text-red-600 dark:text-red-400' : ''} ${email.status === 'sent' && onViewAuditLog && undeliveredCount > 0 ? 'cursor-pointer rounded px-2 py-1 transition-colors hover:bg-background/10 hover:text-red-700 dark:hover:text-red-300' : ''}`}
          title={
            email.status === 'sent' && undeliveredCount > 0
              ? 'Click to view undelivered emails in audit log'
              : undefined
          }
        >
          {undeliveredCount}
        </button>
      </div>

      {/* Status */}
      <div className="flex justify-center">{getStatusBadge()}</div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <>
          <button
            ref={menuButtonRef}
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1.5 hover:bg-background/10 text-foreground/70 hover:text-foreground rounded transition-colors relative z-0"
            title="Actions"
            disabled={isProcessing}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && menuButtonRef.current && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
              <div
                className="fixed z-[101] bg-muted border border-border rounded-lg shadow-xl py-1 min-w-[140px]"
                style={{
                  right: `${window.innerWidth - menuButtonRef.current.getBoundingClientRect().right}px`,
                  top: `${menuButtonRef.current.getBoundingClientRect().bottom + 4}px`,
                }}
              >
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onEdit(email)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background/10 flex items-center gap-2 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    {isSent ? 'View' : 'Edit'}
                  </button>
                )}
                {(isScheduled || isPaused) && !isSent && onSendNow && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction(() => onSendNow(email.id))
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background/10 flex items-center gap-2 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Send Now
                  </button>
                )}
                {isScheduled && onPause && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction(() => onPause(email.id))
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background/10 flex items-center gap-2 transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </button>
                )}
                {isSent && undeliveredCount > 0 && onRetryFailed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction(() => onRetryFailed(email.id))
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 transition-colors"
                    title="Retry failed email deliveries (soft bounces only)"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Retry Failed
                  </button>
                )}
                {isFailed && onRetryEmail && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction(() => onRetryEmail(email.id))
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background/10 flex items-center gap-2 transition-colors"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                )}
                {!isSent && !isSystemEmail && onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction(() => onDelete(email.id))
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-border"
                    title="Delete custom email"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </>
      </div>

      {/* Error message row (spans full width) */}
      {isFailed && email.error_message && (
        <div className="col-span-9 -mt-1 mb-1 px-3 py-2 rounded bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs">
            Sorry, an internal error occurred while sending this email. Please retry using the actions menu above.
          </p>
        </div>
      )}

      {/* Recipients Modal */}
      <RecipientsModal
        isOpen={showRecipientsModal}
        onClose={() => setShowRecipientsModal(false)}
        eventSlug={eventSlug}
        emailId={email.id}
        emailName={email.name}
      />
    </div>
  )
}
