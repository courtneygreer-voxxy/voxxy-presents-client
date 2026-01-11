import { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Eye, Edit2, Play, Pause, Trash2, Users, Megaphone, FileText, CreditCard, Calendar, PartyPopper, MessageSquare, Settings2 } from 'lucide-react';
import { ScheduledEmail, EmailCategory } from '@/types/email';
import DeliveryStatusBadge from './DeliveryStatusBadge';

interface EmailRowProps {
  email: ScheduledEmail;
  onEdit?: (email: ScheduledEmail) => void;
  onPreview?: (email: ScheduledEmail) => void;
  onPause?: (emailId: number) => Promise<void>;
  onResume?: (emailId: number) => Promise<void>;
  onSendNow?: (emailId: number) => Promise<void>;
  onDelete?: (emailId: number) => Promise<void>;
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
  onEdit,
  onPreview,
  onPause,
  onResume,
  onSendNow,
  onDelete,
}: EmailRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Calculate undelivered and unsubscribed counts (placeholder for now, will be populated from SendGrid data)
  const undeliveredCount = 0; // TODO: Get from email.email_deliveries when SendGrid integration is added
  const unsubscribedCount = 0; // TODO: Get from email.email_deliveries when SendGrid integration is added

  return (
    <div className="grid grid-cols-[200px,240px,130px,110px,80px,80px,80px,100px,80px] gap-3 px-4 py-1.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 items-center text-xs">
      {/* Email Name */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate">{email.name}</div>
        </div>
      </div>

      {/* Subject */}
      <div className="text-white/70 truncate" title={email.subject_template}>
        {email.subject_template}
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
      <div className="flex items-center justify-center gap-1 text-white/60">
        <Users className="w-3 h-3" />
        <span>{email.recipient_count || 0}</span>
      </div>

      {/* Undelivered Count */}
      <div className="text-center text-white/60">
        <span>{undeliveredCount}</span>
      </div>

      {/* Unsubscribed Count */}
      <div className="text-center text-white/60">
        <span>{unsubscribedCount}</span>
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
                  {onPreview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onPreview(email);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                  )}
                  {onEdit && !isSent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit(email);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                  {isScheduled && !isPast && onSendNow && (
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
    </div>
  );
}
