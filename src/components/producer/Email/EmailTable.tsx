import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, HelpCircle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ScheduledEmail, AuditFilters } from '@/types/email';
import EmailRow from './EmailRow';

type SortColumn = 'name' | 'subject' | 'scheduled_for' | 'email_type' | 'category' | 'recipient_count' | 'undelivered_count' | 'status';
type SortDirection = 'asc' | 'desc';

interface EmailTableProps {
  emails: ScheduledEmail[];
  eventSlug: string;
  onEdit?: (email: ScheduledEmail) => void;
  onPause?: (emailId: number) => Promise<void>;
  onResume?: (emailId: number) => Promise<void>;
  onSendNow?: (emailId: number) => Promise<void>;
  onRetryFailed?: (emailId: number) => Promise<void>;
  onDelete?: (emailId: number) => Promise<void>;
  onViewAuditLog?: (filters: AuditFilters) => void;
  sortColumn?: SortColumn | null;
  sortDirection?: SortDirection;
  onSort?: (column: SortColumn) => void;
}

function SortIcon({ column, sortColumn, sortDirection }: { column: SortColumn; sortColumn?: SortColumn | null; sortDirection?: SortDirection }) {
  if (sortColumn !== column) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
  return sortDirection === 'asc'
    ? <ChevronUp className="w-3 h-3 text-purple-400" />
    : <ChevronDown className="w-3 h-3 text-purple-400" />;
}

// Check if email is a custom reminder (value-based trigger)
function isCustomReminder(triggerType: string): boolean {
  const reminderTriggers = [
    'days_before_deadline',
    'days_after_deadline',
    'days_before_payment_deadline',
    'days_after_payment_deadline',
    'days_before_event',
    'days_after_event'
  ];
  return reminderTriggers.includes(triggerType);
}

export default function EmailTable({
  emails,
  eventSlug,
  onEdit,
  onPause,
  onResume,
  onSendNow,
  onRetryFailed,
  onDelete,
  onViewAuditLog,
  sortColumn,
  sortDirection,
  onSort,
}: EmailTableProps) {
  const [isSystemCollapsed, setIsSystemCollapsed] = useState(false);
  const [isRemindersCollapsed, setIsRemindersCollapsed] = useState(false);

  if (emails.length === 0) {
    return (
      <div className="bg-background/5 rounded-lg border border-border p-12 text-center">
        <p className="text-foreground/60">No emails found</p>
      </div>
    );
  }

  const col = (column: SortColumn, label: string, className?: string, title?: string) => {
    // Only show sort icons if onSort is provided (scheduled emails table)
    if (!onSort) {
      return (
        <div className={`flex items-center gap-1 ${className ?? ''}`} title={title}>
          {label}
        </div>
      );
    }

    return (
      <button
        onClick={() => onSort(column)}
        className={`flex items-center gap-1 hover:text-foreground transition-colors ${sortColumn === column ? 'text-foreground' : ''} ${className ?? ''}`}
        title={title}
      >
        {label}
        <SortIcon column={column} sortColumn={sortColumn} sortDirection={sortDirection} />
      </button>
    );
  };

  // Group emails into system and reminders
  const systemEmails = emails.filter(email => !isCustomReminder(email.trigger_type));
  const reminderEmails = emails.filter(email => isCustomReminder(email.trigger_type));

  return (
    <div className="bg-background/5 rounded-lg border border-border overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-border">
        <div className="grid grid-cols-[200px,220px,130px,120px,90px,80px,80px,100px,80px] gap-3 px-4 py-2 items-center text-xs font-semibold text-foreground dark:text-foreground/70 uppercase tracking-wide">
          {col('name', 'Email Name')}
          <div className="flex items-center gap-1">Subject</div>
          {col('scheduled_for', 'Scheduled')}
          {col('email_type', 'Email Type')}
          {col('category', 'Audience')}
          {col('recipient_count', 'Recipients', 'justify-center')}
          <div className="flex items-center justify-center" title="Emails that bounced or were dropped by SendGrid">Undelivered</div>
          <div className="flex items-center justify-center">Status</div>
          <div className="text-right">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div>
        {/* System Emails Section */}
        {systemEmails.length > 0 && (
          <>
            <button
              onClick={() => setIsSystemCollapsed(!isSystemCollapsed)}
              className="w-full bg-emerald-500/10 hover:bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isSystemCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-emerald-300" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-emerald-300" />
                )}
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  System ({systemEmails.length})
                </h3>
                <Tooltip.Provider delayDuration={200}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div
                        className="text-emerald-300 hover:text-emerald-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-muted text-foreground text-xs px-3 py-2 rounded-lg border border-emerald-400/30 shadow-xl max-w-xs z-50"
                        sideOffset={5}
                      >
                        Core system emails that are automatically triggered by vendor actions or event milestones.
                        <Tooltip.Arrow className="fill-gray-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>
            </button>
            {!isSystemCollapsed && systemEmails.map((email) => (
              <EmailRow
                key={`${email.id}-${email.scheduled_for}`}
                email={email}
                eventSlug={eventSlug}
                onEdit={onEdit}
                onPause={onPause}
                onResume={onResume}
                onSendNow={onSendNow}
                onRetryFailed={onRetryFailed}
                onDelete={onDelete}
                onViewAuditLog={onViewAuditLog}
              />
            ))}
          </>
        )}

        {/* Reminders Section */}
        {reminderEmails.length > 0 && (
          <>
            <button
              onClick={() => setIsRemindersCollapsed(!isRemindersCollapsed)}
              className="w-full bg-purple-500/10 hover:bg-purple-500/15 border-b border-purple-500/30 px-4 py-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isRemindersCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-purple-300" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-purple-300" />
                )}
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Reminders ({reminderEmails.length})
                </h3>
                <Tooltip.Provider delayDuration={200}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div
                        className="text-purple-300 hover:text-purple-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-muted text-foreground text-xs px-3 py-2 rounded-lg border border-purple-400/30 shadow-xl max-w-xs z-50"
                        sideOffset={5}
                      >
                        Time-based reminders that were added to this event's sequence.
                        <Tooltip.Arrow className="fill-gray-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>
            </button>
            {!isRemindersCollapsed && reminderEmails.map((email) => (
              <EmailRow
                key={`${email.id}-${email.scheduled_for}`}
                email={email}
                eventSlug={eventSlug}
                onEdit={onEdit}
                onPause={onPause}
                onResume={onResume}
                onSendNow={onSendNow}
                onRetryFailed={onRetryFailed}
                onDelete={onDelete}
                onViewAuditLog={onViewAuditLog}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
