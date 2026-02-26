import { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Eye, Edit2, Play, Pause, Trash2, RefreshCcw, Users, Megaphone, FileText, CreditCard, Calendar, PartyPopper, MessageSquare, Settings2, AlertTriangle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ScheduledEmail, EmailCategory, AuditFilters } from '@/types/email';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import RecipientsModal from './RecipientsModal';
import { backendToFrontend } from '@/utils/emailVariables';

interface EmailRowProps {
  email: ScheduledEmail;
  eventSlug: string;
  onEdit?: (email: ScheduledEmail) => void;
  onPause?: (emailId: number) => Promise<void>;
  onResume?: (emailId: number) => Promise<void>;
  onSendNow?: (emailId: number) => Promise<void>;
  onRetryFailed?: (emailId: number) => Promise<void>;
  onDelete?: (emailId: number) => Promise<void>;
  onViewAuditLog?: (filters: AuditFilters) => void;
}

// Category configuration
const CATEGORY_CONFIG: Record<EmailCategory, { label: string; icon: any; color: string }> = {
  pre_application: {
    label: 'Announcement',
    icon: Megaphone,
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  application: {
    label: 'Application',
    icon: FileText,
    color: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
  },
  payment: {
    label: 'Payment',
    icon: CreditCard,
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  pre_event: {
    label: 'Pre-Event',
    icon: Calendar,
    color: 'bg-green-500/20 text-green-300 border-green-500/30'
  },
  event_day: {
    label: 'Event Day',
    icon: PartyPopper,
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  },
  post_event: {
    label: 'Post-Event',
    icon: MessageSquare,
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  system: {
    label: 'System',
    icon: Settings2,
    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  }
};

export default function EmailRow({
  email,
  eventSlug,
  onEdit,
  onPause,
  onResume,
  onSendNow,
  onRetryFailed,
  onDelete,
  onViewAuditLog,
}: EmailRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true);
    setShowMenu(false);
    try {
      await action();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Infer category from email name/trigger
  const inferCategory = (): EmailCategory => {
    const name = email.name.toLowerCase();
    const trigger = email.trigger_type;

    if (name.includes('payment') || trigger.includes('payment')) return 'payment';
    if (name.includes('application') || name.includes('approval') || name.includes('rejected') || name.includes('waitlist')) return 'application';
    if (trigger === 'days_before_event' || name.includes('days before')) return 'pre_event';
    if (trigger === 'on_event_date' || name.includes('day of')) return 'event_day';
    if (trigger === 'days_after_event') return 'post_event';
    if (name.includes('announcement') || name.includes('immediate') || name.includes('invitation')) return 'pre_application';

    return 'pre_application';
  };

  const category = inferCategory();
  const categoryConfig = CATEGORY_CONFIG[category];
  const CategoryIcon = categoryConfig.icon;

  const scheduledDate = email.scheduled_for ? new Date(email.scheduled_for) : null;
  const isPast = scheduledDate && scheduledDate < new Date();
  const isSent = email.status === 'sent';
  const isPaused = email.status === 'paused';
  const isScheduled = email.status === 'scheduled';
  const isFailed = email.status === 'failed';
  const isInvitationAnnouncement = email.isInvitationAnnouncement || false;

  // Status badge component
  const getStatusBadge = () => {
    if (isSent) {
      return <DeliveryStatusBadge status={email.delivery_status || 'sent'} />;
    }

    const statusColors = {
      scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      paused: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      failed: 'bg-red-500/10 text-red-400 border-red-500/30',
      cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    };

    const colorClass = statusColors[email.status as keyof typeof statusColors] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${colorClass}`}>
        {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
      </span>
    );
  };

  // Get delivery counts from backend (populated via SendGrid webhooks)
  const undeliveredCount = email.undelivered_count || 0;
  const unsubscribedCount = email.unsubscribed_count || 0;

  // Check if we have delivery data to show in tooltip
  const deliveryCounts = email.delivery_counts;
  const hasDeliveryData = deliveryCounts && deliveryCounts.total_sent > 0;

  // Render delivery stats tooltip content
  const DeliveryTooltipContent = () => {
    if (!deliveryCounts) return null;

    return (
      <div className="space-y-1">
        <div className="font-semibold text-xs mb-2 border-b border-white/20 pb-1">Delivery Status</div>
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
        <div className="flex items-center justify-between gap-3 text-xs pt-1 mt-1 border-t border-white/20">
          <span className="font-semibold">Total Sent:</span>
          <span className="font-bold">{deliveryCounts.total_sent}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-[200px,240px,130px,110px,80px,80px,80px,100px,80px] gap-3 px-4 py-1.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 items-center text-xs">
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
                  className="z-50 bg-red-900/90 text-white px-3 py-2 rounded-lg shadow-xl border border-red-500/30"
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
            className={`font-medium truncate ${email.overdue ? 'text-red-400' : 'text-white'} ${onEdit ? 'cursor-pointer hover:text-purple-300 transition-colors' : ''}`}
            onClick={(e) => {
              if (onEdit) {
                e.stopPropagation();
                onEdit(email);
              }
            }}
          >
            {email.name}
          </div>
        </div>
      </div>

      {/* Subject */}
      <div
        className={`text-white/70 truncate ${onEdit ? 'cursor-pointer hover:text-purple-300 transition-colors' : ''}`}
        title={backendToFrontend(email.subject_template || '')}
        onClick={(e) => {
          if (onEdit) {
            e.stopPropagation();
            onEdit(email);
          }
        }}
      >
        {backendToFrontend(email.subject_template || '')}
      </div>

      {/* Scheduled Date/Time */}
      <div className="text-white/60">
        {scheduledDate ? (
          <div className="flex flex-col">
            <span className="text-[11px]">{format(scheduledDate, 'MMM d, yyyy')}</span>
            <span className="text-[10px] text-white/40">{format(scheduledDate, 'h:mm a')}</span>
          </div>
        ) : (
          <span className="text-white/40">Not scheduled</span>
        )}
      </div>

      {/* Category Badge */}
      <div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${categoryConfig.color}`}>
          <CategoryIcon className="w-3 h-3" />
          {categoryConfig.label}
        </span>
      </div>

      {/* Recipients Count */}
      <div className="flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Open audit log for all non-invitation emails (sent, scheduled, paused, failed)
            // Only show recipients modal for invitation announcement
            if (!isInvitationAnnouncement && onViewAuditLog) {
              onViewAuditLog({ email_name: email.name });
            } else {
              setShowRecipientsModal(true);
            }
          }}
          className="flex items-center gap-1 text-white/60 hover:text-white hover:bg-white/10 px-2 py-1 rounded transition-colors cursor-pointer"
          title={!isInvitationAnnouncement ? "Click to view audit log for this email" : "Click to view recipients list"}
        >
          <Users className="w-3 h-3" />
          <span>{email.recipient_count || 0}</span>
        </button>
      </div>

      {/* Undelivered Count */}
      <div className="text-center text-white/60">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (email.status === 'sent' && onViewAuditLog && undeliveredCount > 0) {
              onViewAuditLog({ email_name: email.name, status: 'undelivered' });
            }
          }}
          disabled={email.status !== 'sent' || !onViewAuditLog || undeliveredCount === 0}
          className={`${undeliveredCount > 0 ? 'text-red-400 font-medium' : ''} ${email.status === 'sent' && onViewAuditLog && undeliveredCount > 0 ? 'cursor-pointer hover:bg-white/10 px-2 py-1 rounded hover:text-red-300 transition-colors' : ''}`}
          title={email.status === 'sent' && undeliveredCount > 0 ? "Click to view undelivered emails in audit log" : undefined}
        >
          {undeliveredCount}
        </button>
      </div>

      {/* Unsubscribed Count */}
      <div className="text-center text-white/60">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (email.status === 'sent' && onViewAuditLog && unsubscribedCount > 0) {
              onViewAuditLog({ email_name: email.name, status: 'unsubscribed' });
            }
          }}
          disabled={email.status !== 'sent' || !onViewAuditLog || unsubscribedCount === 0}
          className={`${unsubscribedCount > 0 ? 'text-yellow-400 font-medium' : ''} ${email.status === 'sent' && onViewAuditLog && unsubscribedCount > 0 ? 'cursor-pointer hover:bg-white/10 px-2 py-1 rounded hover:text-yellow-300 transition-colors' : ''}`}
          title={email.status === 'sent' && unsubscribedCount > 0 ? "Click to view unsubscribed emails in audit log" : undefined}
        >
          {unsubscribedCount}
        </button>
      </div>

      {/* Status */}
      <div className="flex justify-center">
        {getStatusBadge()}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        {!isInvitationAnnouncement && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 hover:bg-white/10 text-white/70 hover:text-white rounded transition-colors relative z-0"
              title="Actions"
              disabled={isProcessing}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowMenu(false)}
                />
                <div
                  className="fixed z-[101] bg-gray-900 border border-white/20 rounded-lg shadow-xl py-1 min-w-[140px]"
                  style={{
                    right: '20px',
                    top: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().bottom + 4}px`
                  }}
                >
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit(email);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      {isSent ? 'View' : 'Edit'}
                    </button>
                  )}
                  {(isScheduled || isPaused) && !isSent && onSendNow && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(() => onSendNow(email.id));
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Send Now
                    </button>
                  )}
                  {isScheduled && onPause && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(() => onPause(email.id));
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      Pause
                    </button>
                  )}
                  {isPaused && onResume && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(() => onResume(email.id));
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Resume
                    </button>
                  )}
                  {isSent && undeliveredCount > 0 && onRetryFailed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(() => onRetryFailed(email.id));
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 transition-colors"
                      title="Retry failed email deliveries (soft bounces only)"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      Retry Failed
                    </button>
                  )}
                  {!isSent && onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(() => onDelete(email.id));
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-white/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Error message row (spans full width) */}
      {isFailed && email.error_message && (
        <div className="col-span-9 -mt-1 mb-1 px-3 py-2 rounded bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs">{email.error_message}</p>
        </div>
      )}

      {/* Recipients Modal */}
      <RecipientsModal
        isOpen={showRecipientsModal}
        onClose={() => setShowRecipientsModal(false)}
        eventSlug={eventSlug}
        emailId={email.id}
        emailName={email.name}
        isInvitationAnnouncement={isInvitationAnnouncement}
      />
    </div>
  );
}
