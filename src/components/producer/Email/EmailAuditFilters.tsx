/**
 * EmailAuditFilters - Filter controls for email audit log
 *
 * Filters:
 * - Global text search (name/email)
 * - Email Name dropdown
 * - Category dropdown
 * - Status dropdown
 * - Date range (single calendar range picker)
 */

import { useState } from 'react';
import { Search, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { AuditEntry, AuditFilters, DeliveryStatus } from '@/types/email';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EmailAuditFiltersProps {
  filters: AuditFilters;
  onFiltersChange: (filters: AuditFilters) => void;
  entries: AuditEntry[]; // Used to build dropdown options
}

export function EmailAuditFilters({
  filters,
  onFiltersChange,
  entries,
}: EmailAuditFiltersProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Extract unique values for dropdowns
  const emailNames = Array.from(new Set(entries.map(e => e.email_name))).sort();
  const categories = Array.from(new Set(entries.map(e => e.category))).sort();
  const statuses: (DeliveryStatus | 'undelivered')[] = [
    'delivered',
    'undelivered', // Combined bounced + dropped
    'pending',
    'sent',
    'unsubscribed',
  ];

  // Build DateRange from filters
  const dateRange: DateRange | undefined =
    filters.date_from || filters.date_to
      ? {
          from: filters.date_from ? new Date(filters.date_from + 'T00:00:00') : undefined,
          to: filters.date_to ? new Date(filters.date_to + 'T00:00:00') : undefined,
        }
      : undefined;

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      date_from: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
      date_to: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
    });
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.email_name ||
    filters.category ||
    filters.status ||
    filters.date_from ||
    filters.date_to
  );

  const clearFilters = () => {
    onFiltersChange({});
  };

  const inputClasses = "w-full px-3 py-2 bg-background/5 border border-border rounded-lg text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer hover:bg-background/10";

  // Format the date range display text
  const dateRangeLabel = () => {
    if (filters.date_from && filters.date_to) {
      return `${format(new Date(filters.date_from + 'T00:00:00'), 'MMM d, yyyy')} – ${format(new Date(filters.date_to + 'T00:00:00'), 'MMM d, yyyy')}`;
    }
    if (filters.date_from) {
      return `From ${format(new Date(filters.date_from + 'T00:00:00'), 'MMM d, yyyy')}`;
    }
    if (filters.date_to) {
      return `Until ${format(new Date(filters.date_to + 'T00:00:00'), 'MMM d, yyyy')}`;
    }
    return 'All Dates';
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/65 dark:text-foreground/40" />
        <input
          type="text"
          placeholder="Search by recipient name or email..."
          value={filters.search || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value || undefined })
          }
          className="w-full pl-9 pr-4 py-2 bg-background/5 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Filter Dropdowns + Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Email Name */}
        <div>
          <label className="block text-[10px] font-semibold text-foreground dark:text-foreground/70 mb-1 uppercase tracking-wide">
            Email Name
          </label>
          <select
            value={filters.email_name || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                email_name: e.target.value || undefined,
              })
            }
            className={inputClasses}
          >
            <option value="">All Emails</option>
            {emailNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-semibold text-foreground dark:text-foreground/70 mb-1 uppercase tracking-wide">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                category: e.target.value || undefined,
              })
            }
            className={inputClasses}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[10px] font-semibold text-foreground dark:text-foreground/70 mb-1 uppercase tracking-wide">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: (e.target.value as DeliveryStatus | 'undelivered') || undefined,
              })
            }
            className={inputClasses}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'undelivered'
                  ? 'Undelivered (Bounced + Dropped)'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range - Single calendar picker */}
        <div>
          <label className="block text-[10px] font-semibold text-foreground dark:text-foreground/70 mb-1 uppercase tracking-wide">
            Date Range
          </label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className={`${inputClasses} flex items-center gap-2 text-left`}>
                <CalendarIcon className="w-3.5 h-3.5 text-foreground/65 dark:text-foreground/40 shrink-0" />
                <span className={filters.date_from || filters.date_to ? 'text-foreground' : 'text-foreground/75 dark:text-foreground/40'}>
                  {dateRangeLabel()}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                defaultMonth={dateRange?.from || new Date()}
              />
              {(filters.date_from || filters.date_to) && (
                <div className="border-t border-border p-2 flex justify-end">
                  <button
                    onClick={() => {
                      handleDateRangeChange(undefined);
                      setCalendarOpen(false);
                    }}
                    className="text-xs text-foreground dark:text-foreground/60 hover:text-foreground px-2 py-1 rounded hover:bg-background/10 transition-colors"
                  >
                    Clear dates
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <p className="text-sm text-foreground/85 dark:text-foreground/60 font-medium">
            {Object.keys(filters).filter((k) => filters[k as keyof AuditFilters]).length}{' '}
            active {Object.keys(filters).filter((k) => filters[k as keyof AuditFilters]).length === 1 ? 'filter' : 'filters'}
          </p>
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/90 dark:text-foreground/80 hover:text-foreground bg-background/5 hover:bg-background/10 border border-border rounded-lg transition-all hover:border-border"
          >
            <X className="w-3.5 h-3.5" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
