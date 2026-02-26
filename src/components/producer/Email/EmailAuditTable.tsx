/**
 * EmailAuditTable - Displays audit entries in a sortable table
 *
 * 9 Columns:
 * 1. Date Sent (sortable)
 * 2. Recipient Name (sortable)
 * 3. Email Address (sortable)
 * 4. Email Name (sortable)
 * 5. Trigger (text)
 * 6. Category (badge, sortable)
 * 7. Status (badge, sortable)
 * 8. Details (tooltip with errors)
 * 9. Actions (ellipsis menu - pinned right)
 */

import { ChevronUp, ChevronDown, ChevronsUpDown, Info } from 'lucide-react';
import { format } from 'date-fns';
import type { AuditEntry } from '@/types/email';
import { DELIVERY_STATUS_CONFIGS } from '@/types/email';
import { EmailAuditActionMenu } from './EmailAuditActionMenu';

type SortColumn = 'sent_at' | 'recipient_name' | 'recipient_email' | 'email_name' | 'category' | 'status';
type SortDirection = 'asc' | 'desc';

interface EmailAuditTableProps {
  entries: AuditEntry[];
  sortColumn?: SortColumn | null;
  sortDirection?: SortDirection;
  onSort?: (column: SortColumn) => void;
  onContactSupport?: (entry: AuditEntry) => void;
}

function SortIcon({
  column,
  sortColumn,
  sortDirection
}: {
  column: SortColumn;
  sortColumn?: SortColumn | null;
  sortDirection?: SortDirection
}) {
  if (sortColumn !== column) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
  return sortDirection === 'asc'
    ? <ChevronUp className="w-3 h-3 text-purple-400" />
    : <ChevronDown className="w-3 h-3 text-purple-400" />;
}

function StatusBadge({ status }: { status: AuditEntry['status'] }) {
  const config = DELIVERY_STATUS_CONFIGS[status];
  const colorClasses = {
    gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${colorClasses[config.color]}`}
      title={config.description}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
      {category}
    </span>
  );
}

function TriggerLabel({ trigger }: { trigger: string }) {
  const labels: Record<string, string> = {
    'on_application_open': 'App Open',
    'on_application_submit': 'App Submit',
    'on_approval': 'Approval',
    'days_before_event': 'Before Event',
    'days_after_event': 'After Event',
    'days_before_deadline': 'Before Deadline',
    'on_event_date': 'Event Date',
    'days_before_payment_deadline': 'Before Payment',
    'on_payment_deadline': 'Payment Due',
  };

  return (
    <span className="text-xs text-white/60">
      {labels[trigger] || trigger}
    </span>
  );
}

export function EmailAuditTable({
  entries,
  sortColumn,
  sortDirection,
  onSort,
  onContactSupport,
}: EmailAuditTableProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-12 text-center">
        <p className="text-white/60">No audit entries found</p>
      </div>
    );
  }

  const col = (column: SortColumn, label: string, className?: string) => (
    <button
      onClick={() => onSort?.(column)}
      className={`flex items-center gap-1 hover:text-white transition-colors ${sortColumn === column ? 'text-white' : ''} ${className ?? ''}`}
    >
      {label}
      <SortIcon column={column} sortColumn={sortColumn} sortDirection={sortDirection} />
    </button>
  );

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-white/10 overflow-x-auto">
        <div className="grid grid-cols-[140px,180px,220px,200px,100px,120px,130px,80px,60px] gap-3 px-4 py-2 items-center text-xs font-semibold text-white/70 uppercase tracking-wide min-w-[1230px]">
          {col('sent_at', 'Date Sent')}
          {col('recipient_name', 'Recipient')}
          {col('recipient_email', 'Email Address')}
          {col('email_name', 'Email Name')}
          <div>Trigger</div>
          {col('category', 'Category')}
          {col('status', 'Status')}
          <div>Details</div>
          <div className="text-right pr-2">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="grid grid-cols-[140px,180px,220px,200px,100px,120px,130px,80px,60px] gap-3 px-4 py-3 items-center border-b border-white/5 hover:bg-white/5 transition-colors min-w-[1230px]"
          >
            {/* Date Sent */}
            <div className="text-sm text-white/80">
              {entry.sent_at ? format(new Date(entry.sent_at), 'MMM d, h:mm a') : '-'}
            </div>

            {/* Recipient Name */}
            <div className="text-sm text-white/80 truncate" title={entry.recipient_name || 'Unknown'}>
              {entry.recipient_name || <span className="text-white/40">Unknown</span>}
            </div>

            {/* Email Address */}
            <div className="text-sm text-white/80 truncate" title={entry.recipient_email}>
              {entry.recipient_email}
            </div>

            {/* Email Name */}
            <div className="text-sm text-white/80 truncate" title={entry.email_name}>
              {entry.email_name}
            </div>

            {/* Trigger */}
            <div>
              <TriggerLabel trigger={entry.trigger_type} />
            </div>

            {/* Category */}
            <div>
              <CategoryBadge category={entry.category} />
            </div>

            {/* Status */}
            <div>
              <StatusBadge status={entry.status} />
            </div>

            {/* Details */}
            <div className="flex justify-center">
              {(entry.bounce_reason || entry.drop_reason) ? (
                <button
                  className="p-1 hover:bg-white/10 rounded"
                  title={entry.bounce_reason || entry.drop_reason || ''}
                >
                  <Info className="w-4 h-4 text-red-400" />
                </button>
              ) : (
                <span className="text-white/40">-</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end pr-2">
              <EmailAuditActionMenu
                entry={entry}
                onContactSupport={(entry) => onContactSupport?.(entry)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
