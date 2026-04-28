import { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Mail,
  Edit2,
  Play,
  Pause,
  Trash2,
  Eye,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import type { ScheduledEmail, DeliveryStatus } from '@/types/email';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import { backendToFrontend } from '@/utils/emailVariables';
import { logger } from '@/utils/logger';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ScheduledEmailCardProps {
  email: ScheduledEmail;
  onEdit?: (email: ScheduledEmail) => void;
  onPreview?: (email: ScheduledEmail) => void;
  onPause?: (emailId: number) => Promise<void>;
  onResume?: (emailId: number) => Promise<void>;
  onSendNow?: (emailId: number) => Promise<void>;
  onDelete?: (emailId: number) => Promise<void>;
}

export default function ScheduledEmailCard({
  email,
  onEdit,
  onPreview,
  onPause,
  onResume,
  onSendNow,
  onDelete
}: ScheduledEmailCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true);
    try {
      await action();
    } catch (error) {
      logger.error('Email card action failed', { emailId: email.id, error });
    } finally {
      setIsProcessing(false);
    }
  };

  const scheduledDate = email.scheduled_for ? new Date(email.scheduled_for) : null;
  const isPast = scheduledDate && scheduledDate < new Date();
  const isSent = email.status === 'sent';
  const isPaused = email.status === 'paused';
  const isScheduled = email.status === 'scheduled';
  const isFailed = email.status === 'failed';

  // Determine if card should be clickable (all scheduled emails are now editable)
  const isClickable = onEdit && !isSent;

  const handleCardClick = () => {
    if (isClickable && onEdit) {
      onEdit(email);
    }
  };

  // Determine status badge
  const statusBadge = isSent ? (
    <DeliveryStatusBadge status={email.status as DeliveryStatus} />
  ) : (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
        isPaused
          ? 'bg-yellow-500/10 text-yellow-400'
          : isFailed
          ? 'bg-red-500/10 text-red-400'
          : isScheduled
          ? 'bg-blue-500/10 text-blue-400'
          : 'bg-muted/10 text-muted-foreground'
      }`}
    >
      {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
    </span>
  );

  return (
    <div
      className={`bg-background/5 rounded-xl border border-border p-5 transition-all ${
        isClickable
          ? 'hover:bg-background/[0.08] hover:border-purple-500/30 cursor-pointer group'
          : 'hover:bg-background/[0.07]'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-foreground font-medium truncate ${isClickable ? 'group-hover:text-purple-300 transition-colors' : ''}`}>
              {email.name}
            </h3>
            {statusBadge}
            {isClickable && (
              <Edit2 className="w-3.5 h-3.5 text-foreground/40 group-hover:text-purple-400 transition-colors" />
            )}
          </div>

          {/* Overdue Warning */}
          {email.overdue && email.overdue_message && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-red-400">
                {email.overdue_message}
              </span>
            </div>
          )}

          <p className="text-foreground/60 text-sm line-clamp-2 mb-3">
            {backendToFrontend(email.subject_template || '')}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground/50">
            {scheduledDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(scheduledDate, 'MMM d, yyyy')}</span>
              </div>
            )}
            {scheduledDate && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{format(scheduledDate, 'h:mm a')}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{email.recipient_count || 0} recipients</span>
            </div>
            {isSent && email.email_deliveries && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>
                  {email.email_deliveries.filter(d => d.status === 'delivered').length} delivered
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Dropdown */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-background/5 transition-all"
                disabled={isProcessing}
                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking dropdown
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onPreview && (
                <DropdownMenuItem onClick={() => onPreview(email)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
              )}
              {onEdit && !isSent && (
                <DropdownMenuItem onClick={() => onEdit(email)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {isScheduled && !isPast && onSendNow && (
                <DropdownMenuItem
                  onClick={() => handleAction(() => onSendNow(email.id))}
                  disabled={isProcessing}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Send Now
                </DropdownMenuItem>
              )}
              {isScheduled && onPause && (
                <DropdownMenuItem
                  onClick={() => handleAction(() => onPause(email.id))}
                  disabled={isProcessing}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </DropdownMenuItem>
              )}
              {isPaused && onResume && (
                <DropdownMenuItem
                  onClick={() => handleAction(() => onResume(email.id))}
                  disabled={isProcessing}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </DropdownMenuItem>
              )}
              {!isSent && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleAction(() => onDelete(email.id))}
                    disabled={isProcessing}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Error message if failed */}
      {isFailed && email.error_message && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs">{email.error_message}</p>
        </div>
      )}
    </div>
  );
}
