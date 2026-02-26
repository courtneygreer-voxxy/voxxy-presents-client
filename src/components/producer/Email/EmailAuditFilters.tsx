/**
 * EmailAuditFilters - Filter controls for email audit log
 *
 * Filters:
 * - Global text search (name/email)
 * - Email Name dropdown
 * - Category dropdown
 * - Status dropdown
 */

import { Search, X } from 'lucide-react';
import type { AuditEntry, AuditFilters, DeliveryStatus } from '@/types/email';

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

  const hasActiveFilters = !!(
    filters.search ||
    filters.email_name ||
    filters.category ||
    filters.status
  );

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="p-4 border border-white/10 rounded-lg bg-white/5 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search by recipient name or email..."
          value={filters.search || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value || undefined })
          }
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Email Name */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">
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
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
          <label className="block text-xs font-medium text-white/60 mb-1.5">
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
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
          <label className="block text-xs font-medium text-white/60 mb-1.5">
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
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <p className="text-xs text-white/60">
            {Object.keys(filters).filter((k) => filters[k as keyof AuditFilters]).length}{' '}
            filter(s) active
          </p>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
          >
            <X className="w-3 h-3" />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
