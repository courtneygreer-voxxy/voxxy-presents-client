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
import { Badge, type BadgeVariant } from '@/components/ui/badge';

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

const STATUS_COLOR_VARIANT: Record<
  (typeof DELIVERY_STATUS_CONFIGS)[keyof typeof DELIVERY_STATUS_CONFIGS]['color'],
  BadgeVariant
> = {
  gray: 'tintMuted',
  blue: 'tintBlue',
  green: 'tintGreen',
  red: 'tintRed',
  yellow: 'tintYellow',
};

function StatusBadge({ status }: { status: AuditEntry['status'] }) {
  const config = DELIVERY_STATUS_CONFIGS[status] || DELIVERY_STATUS_CONFIGS['pending'];
  const variant = STATUS_COLOR_VARIANT[config.color];

  return (
    <Badge
      variant={variant}
      className="inline-flex max-w-full gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium"
      title={config.description}
    >
      <span className="shrink-0">{config.icon}</span>
      <span className="truncate">{config.label}</span>
    </Badge>
  );
}

const CATEGORY_VARIANT: Record<string, BadgeVariant> = {
  pre_application: 'tintPurple',
  application: 'tintPink',
  payment: 'tintBlue',
  pre_event: 'tintGreen',
  event_day: 'tintOrange',
  post_event: 'tintCyan',
  system: 'tintYellow',
};

const CATEGORY_CONFIG_LABEL: Record<string, string> = {
  pre_application: 'Announcements',
  application: 'Application',
  payment: 'Payment',
  pre_event: 'Countdown',
  event_day: 'Event Day',
  post_event: 'Post-Event',
  system: 'System',
};

function CategoryBadge({ category }: { category: string }) {
  const variant = CATEGORY_VARIANT[category] ?? 'tintMuted';
  const label = CATEGORY_CONFIG_LABEL[category] || category;
  return (
    <Badge
      variant={variant}
      className="max-w-full truncate rounded px-1.5 py-0.5 text-[11px] font-medium"
      title={label}
    >
      {label}
    </Badge>
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
      <div className="bg-background/5 rounded-lg border border-border p-12 text-center">
        <p className="text-foreground/60">No audit entries found</p>
      </div>
    );
  }

  const col = (column: SortColumn, label: string) => (
    <button
      onClick={() => onSort?.(column)}
      className={`flex items-center gap-1 hover:text-foreground transition-colors ${sortColumn === column ? 'text-foreground' : ''}`}
    >
      {label}
      <SortIcon column={column} sortColumn={sortColumn} sortDirection={sortDirection} />
    </button>
  );

  // 8 columns: Date | Recipient | Email | Email Name | Category | Status | Details | Action
  const gridCols = 'grid-cols-[100px_minmax(60px,0.8fr)_minmax(80px,1fr)_minmax(80px,1fr)_minmax(50px,0.7fr)_100px_minmax(80px,1.2fr)_36px]';

  return (
    <div className="bg-background/5 rounded-lg border border-border overflow-hidden overflow-x-auto">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-border">
        <div className={`grid ${gridCols} gap-2 px-4 py-2 items-center text-[10px] font-semibold text-foreground dark:text-foreground/70 uppercase tracking-wide min-w-[800px]`}>
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
            className={`grid ${gridCols} gap-2 px-4 py-1.5 items-center border-b border-border hover:bg-background/5 transition-colors min-w-[800px]`}
          >
            {/* Date Sent */}
            <div className="text-[11px] text-foreground/80">
              {entry.sent_at
                ? format(new Date(entry.sent_at), 'MMM d, h:mm a')
                : entry.scheduled_for
                  ? <span className="text-blue-300">{format(new Date(entry.scheduled_for), 'MMM d, h:mm a')}</span>
                  : <span className="text-foreground/40">--</span>
              }
            </div>

            {/* Recipient Name */}
            <div className="text-[11px] text-foreground/80 truncate" title={entry.recipient_name || 'Unknown'}>
              {entry.recipient_name || <span className="text-foreground/40">Unknown</span>}
            </div>

            {/* Email Address */}
            <div className="text-[11px] text-foreground/60 font-mono truncate" title={entry.recipient_email}>
              {entry.recipient_email}
            </div>

            {/* Email Name */}
            <div className="text-[11px] text-foreground/80 truncate" title={entry.email_name}>
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
                <span className="text-[11px] text-foreground/30">-</span>
              )}
            </div>

            {/* Action - dropdown only for delivery issues */}
            <div className="flex justify-center">
              {hasDeliveryIssue(entry.status) ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 hover:bg-background/10 rounded transition-colors"
                      title="Actions"
                    >
                      <MoreVertical className="w-3.5 h-3.5 text-foreground/40 hover:text-foreground/70" />
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
                <span className="text-foreground/10">-</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
