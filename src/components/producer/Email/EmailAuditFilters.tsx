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
    <div className="p-6 border border-white/10 rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search by recipient name or email..."
          value={filters.search || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value || undefined })
          }
          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Email Name */}
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">
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
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all cursor-pointer hover:bg-white/10"
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
          <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">
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
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all cursor-pointer hover:bg-white/10"
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
          <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">
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
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all cursor-pointer hover:bg-white/10"
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
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <p className="text-sm text-white/60 font-medium">
            {Object.keys(filters).filter((k) => filters[k as keyof AuditFilters]).length}{' '}
            active {Object.keys(filters).filter((k) => filters[k as keyof AuditFilters]).length === 1 ? 'filter' : 'filters'}
          </p>
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all hover:border-white/20"
          >
            <X className="w-3.5 h-3.5" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
