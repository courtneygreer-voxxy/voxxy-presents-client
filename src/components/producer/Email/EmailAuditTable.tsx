/**
 * EmailAuditTable - Displays audit entries in a sortable table
 *
 * 8 Columns:
 * 1. Date Sent (sortable)
 * 2. Recipient Name (sortable)
 * 3. Email Address (sortable)
 * 4. Email Name (sortable)
 * 5. Category (badge, sortable)
 * 6. Status (badge, sortable)
 * 7. Details (truncated text with hover)
 * 8. Action (vertical ellipsis dropdown, only for failed deliveries)
 */

import { ChevronUp, ChevronDown, ChevronsUpDown, MoreVertical, MessageCircleQuestion } from 'lucide-react';
import { format } from 'date-fns';
import type { AuditEntry } from '@/types/email';
import { DELIVERY_STATUS_CONFIGS } from '@/types/email';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export type SortColumn = 'sent_at' | 'recipient_name' | 'recipient_email' | 'email_name' | 'category' | 'status';
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
  sortDirection?: SortDirection;
}) {
  if (sortColumn !== column) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
  return sortDirection === 'asc'
    ? <ChevronUp className="w-3 h-3 text-purple-400" />
    : <ChevronDown className="w-3 h-3 text-purple-400" />;
}

function StatusBadge({ status }: { status: AuditEntry['status'] }) {
  const config = DELIVERY_STATUS_CONFIGS[status] || DELIVERY_STATUS_CONFIGS['pending'];
  const colorClasses = {
    gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border ${colorClasses[config.color]}`}
      title={config.description}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

const CATEGORY_CONFIG: Record<string, { label: string; text: string; bg: string; border: string }> = {
  'pre_application': { label: 'Announcements', text: 'text-purple-300', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  'application':     { label: 'Application',   text: 'text-pink-300',   bg: 'bg-pink-500/20',   border: 'border-pink-500/30' },
  'payment':         { label: 'Payment',        text: 'text-blue-300',   bg: 'bg-blue-500/20',   border: 'border-blue-500/30' },
  'pre_event':       { label: 'Countdown',      text: 'text-green-300',  bg: 'bg-green-500/20',  border: 'border-green-500/30' },
  'event_day':       { label: 'Event Day',      text: 'text-orange-300', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  'post_event':      { label: 'Post-Event',     text: 'text-cyan-300',   bg: 'bg-cyan-500/20',   border: 'border-cyan-500/30' },
  'system':          { label: 'System',          text: 'text-yellow-300', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
};

const DEFAULT_CATEGORY = { label: '', text: 'text-gray-300', bg: 'bg-gray-500/20', border: 'border-gray-500/30' };

function CategoryBadge({ category }: { category: string }) {
  const config = CATEGORY_CONFIG[category] || DEFAULT_CATEGORY;
  const label = config.label || category;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border truncate max-w-full ${config.bg} ${config.text} ${config.border}`}
      title={label}
    >
      {label}
    </span>
  );
}

/** Returns true for statuses that indicate a delivery problem */
function hasDeliveryIssue(status: AuditEntry['status']): boolean {
  return status === 'bounced' || status === 'dropped';
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

  const col = (column: SortColumn, label: string) => (
    <button
      onClick={() => onSort?.(column)}
      className={`flex items-center gap-1 hover:text-white transition-colors ${sortColumn === column ? 'text-white' : ''}`}
    >
      {label}
      <SortIcon column={column} sortColumn={sortColumn} sortDirection={sortDirection} />
    </button>
  );

  // 8 columns: Date | Recipient | Email | Email Name | Category | Status | Details | Action
  const gridCols = 'grid-cols-[100px_minmax(60px,0.8fr)_minmax(80px,1fr)_minmax(80px,1fr)_minmax(50px,0.7fr)_100px_minmax(80px,1.2fr)_36px]';

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-white/10">
        <div className={`grid ${gridCols} gap-2 px-4 py-2 items-center text-[10px] font-semibold text-white/70 uppercase tracking-wide min-w-[800px]`}>
          {col('sent_at', 'Date Sent')}
          {col('recipient_name', 'Recipient')}
          {col('recipient_email', 'Email')}
          {col('email_name', 'Email Name')}
          {col('category', 'Category')}
          {col('status', 'Status')}
          <div>Details</div>
          <div>Action</div>
        </div>
      </div>

      {/* Table Body */}
      <div>
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`grid ${gridCols} gap-2 px-4 py-1.5 items-center border-b border-white/5 hover:bg-white/5 transition-colors min-w-[800px]`}
          >
            {/* Date Sent */}
            <div className="text-[11px] text-white/80">
              {entry.sent_at
                ? format(new Date(entry.sent_at), 'MMM d, h:mm a')
                : entry.scheduled_for
                  ? <span className="text-blue-300">{format(new Date(entry.scheduled_for), 'MMM d, h:mm a')}</span>
                  : <span className="text-white/40">--</span>
              }
            </div>

            {/* Recipient Name */}
            <div className="text-[11px] text-white/80 truncate" title={entry.recipient_name || 'Unknown'}>
              {entry.recipient_name || <span className="text-white/40">Unknown</span>}
            </div>

            {/* Email Address */}
            <div className="text-[11px] text-white/60 font-mono truncate" title={entry.recipient_email}>
              {entry.recipient_email}
            </div>

            {/* Email Name */}
            <div className="text-[11px] text-white/80 truncate" title={entry.email_name}>
              {entry.email_name}
            </div>

            {/* Category */}
            <div className="min-w-0">
              <CategoryBadge category={entry.category} />
            </div>

            {/* Status */}
            <div>
              <StatusBadge status={entry.status} />
            </div>

            {/* Details - truncated text with hover tooltip */}
            <div className="min-w-0">
              {(entry.bounce_reason || entry.drop_reason) ? (
                <span
                  className="text-[11px] text-red-400/80 truncate block cursor-help"
                  title={entry.bounce_reason || entry.drop_reason || ''}
                >
                  {entry.bounce_reason || entry.drop_reason}
                </span>
              ) : (
                <span className="text-[11px] text-white/30">-</span>
              )}
            </div>

            {/* Action - dropdown only for delivery issues */}
            <div className="flex justify-center">
              {hasDeliveryIssue(entry.status) ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Actions"
                    >
                      <MoreVertical className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[140px]">
                    <DropdownMenuItem
                      onClick={() => onContactSupport?.(entry)}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <MessageCircleQuestion className="w-3.5 h-3.5" />
                      Contact Us
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="text-white/10">-</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
