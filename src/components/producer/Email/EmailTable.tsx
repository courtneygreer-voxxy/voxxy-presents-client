import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { ScheduledEmail, AuditFilters } from '@/types/email';
import EmailRow from './EmailRow';

type SortColumn = 'name' | 'subject' | 'scheduled_for' | 'email_type' | 'category' | 'recipient_count' | 'undelivered_count' | 'unsubscribed_count' | 'status';
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
  if (emails.length === 0) {
    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-12 text-center">
        <p className="text-white/60">No emails found</p>
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
        className={`flex items-center gap-1 hover:text-white transition-colors ${sortColumn === column ? 'text-white' : ''} ${className ?? ''}`}
        title={title}
      >
        {label}
        <SortIcon column={column} sortColumn={sortColumn} sortDirection={sortDirection} />
      </button>
    );
  };

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-white/10">
        <div className="grid grid-cols-[200px,220px,130px,120px,90px,80px,80px,80px,100px,80px] gap-3 px-4 py-2 items-center text-xs font-semibold text-white/70 uppercase tracking-wide">
          {col('name', 'Email Name')}
          <div className="flex items-center gap-1">Subject</div>
          {col('scheduled_for', 'Scheduled')}
          {col('email_type', 'Email Type')}
          {col('category', 'Category')}
          {col('recipient_count', 'Recipients', 'justify-center')}
          <div className="flex items-center justify-center" title="Emails that bounced or were dropped by SendGrid">Undelivered</div>
          <div className="flex items-center justify-center" title="Recipients who unsubscribed from emails">Unsub</div>
          <div className="flex items-center justify-center">Status</div>
          <div className="text-right">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div>
        {emails.map((email) => (
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
      </div>
    </div>
  );
}
