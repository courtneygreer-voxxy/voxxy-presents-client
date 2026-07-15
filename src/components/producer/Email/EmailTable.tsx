import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, HelpCircle } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { ScheduledEmail, AuditFilters } from '@/types/email'
import EmailRow from './EmailRow'
import { TABLE_HEADER_CLASSES } from '@/components/shared/tableStyles'

type SortColumn =
  | 'name'
  | 'subject'
  | 'scheduled_for'
  | 'email_type'
  | 'category'
  | 'recipient_count'
  | 'undelivered_count'
  | 'status'
type SortDirection = 'asc' | 'desc'

interface EmailTableProps {
  emails: ScheduledEmail[]
  eventSlug: string
  onEdit?: (email: ScheduledEmail) => void
  onPause?: (emailId: number) => Promise<void>
  onResume?: (emailId: number) => Promise<void>
  onSendNow?: (emailId: number) => Promise<void>
  onRetryFailed?: (emailId: number) => Promise<void>
  onDelete?: (emailId: number) => Promise<void>
  onViewAuditLog?: (filters: AuditFilters) => void
  sortColumn?: SortColumn | null
  sortDirection?: SortDirection
  onSort?: (column: SortColumn) => void
}

function SortIcon({
  column,
  sortColumn,
  sortDirection,
}: {
  column: SortColumn
  sortColumn?: SortColumn | null
  sortDirection?: SortDirection
}) {
  if (sortColumn !== column)
    return <ChevronsUpDown className="h-3 w-3 text-foreground/45 dark:text-foreground/40" />
  return sortDirection === 'asc' ? (
    <ChevronUp className="h-3 w-3 text-violet-700 dark:text-primary" />
  ) : (
    <ChevronDown className="h-3 w-3 text-violet-700 dark:text-primary" />
  )
}

// Check if email is a system email (matches backend SYSTEM_TRIGGERS)
// System emails are event-triggered and cannot be deleted
function isSystemEmail(triggerType: string): boolean {
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
  return systemTriggers.includes(triggerType)
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
  const [isSystemCollapsed, setIsSystemCollapsed] = useState(false)
  const [isRemindersCollapsed, setIsRemindersCollapsed] = useState(false)

  if (emails.length === 0) {
    return (
      <div className="bg-background/5 rounded-lg border border-border p-12 text-center">
        <p className="text-foreground/60">No emails found</p>
      </div>
    )
  }

  const col = (column: SortColumn, label: string, className?: string, title?: string) => {
    // Only show sort icons if onSort is provided (scheduled emails table)
    if (!onSort) {
      return (
        <div className={`flex items-center gap-1 ${className ?? ''}`} title={title}>
          {label}
        </div>
      )
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
    )
  }

  // Group emails into system and reminders
  const systemEmails = emails.filter((email) => isSystemEmail(email.trigger_type))
  const reminderEmails = emails.filter((email) => !isSystemEmail(email.trigger_type))

  return (
    <div className="voxxy-table-shell">
      {/* Table Header */}
      <div className="voxxy-table-header">
        <div className={`voxxy-table-header-row grid grid-cols-[minmax(180px,1.2fr),minmax(200px,1.5fr),minmax(120px,0.9fr),minmax(110px,0.9fr),minmax(80px,0.7fr),70px,80px,minmax(90px,0.8fr),50px] px-4 py-2 ${TABLE_HEADER_CLASSES}`}>
          {col('name', 'Email Name')}
          <div className="flex items-center gap-1">Subject</div>
          {col('scheduled_for', 'Scheduled')}
          {col('email_type', 'Email Type')}
          {col('category', 'Audience')}
          {col('recipient_count', 'Recipients', 'justify-center')}
          <div
            className="flex items-center justify-center"
            title="Emails that bounced or were dropped by SendGrid"
          >
            Undelivered
          </div>
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
                  <ChevronDown className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                )}
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  System ({systemEmails.length})
                </h3>
                <Tooltip.Provider delayDuration={200}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div
                        className="text-emerald-700 transition-colors hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-200"
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
                        Core system emails that are automatically triggered by vendor actions or
                        event milestones.
                        <Tooltip.Arrow className="fill-gray-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>
            </button>
            {!isSystemCollapsed &&
              systemEmails.map((email) => (
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
              className="w-full bg-primary/10 hover:bg-primary/15 border-b border-primary/30 px-4 py-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isRemindersCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-violet-700 dark:text-primary" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-violet-700 dark:text-primary" />
                )}
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-primary">
                  Reminders ({reminderEmails.length})
                </h3>
                <Tooltip.Provider delayDuration={200}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div
                        className="text-violet-700 transition-colors hover:text-violet-900 dark:text-primary dark:hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-muted text-foreground text-xs px-3 py-2 rounded-lg border border-primary/30 shadow-xl max-w-xs z-50"
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
            {!isRemindersCollapsed &&
              reminderEmails.map((email) => (
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
  )
}
