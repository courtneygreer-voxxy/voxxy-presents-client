import { useState, useMemo } from 'react';
import { Calendar, MapPin, Plus, Eye, EyeOff, Trash2, Search, Users } from 'lucide-react';
import { formatEventDate as formatDate, isDatePast, getDaysUntil } from '../../utils/dateHelpers';
import { DebugPanel } from './DebugPanel';
import { Badge, type BadgeVariant } from '@/components/ui/badge';

interface Event {
  id: number;
  slug: string;
  namespaced_slug?: string;
  title: string;
  description?: string;
  dates?: {
    start?: string;
    end?: string;
  };
  event_date?: string;
  location?: string;
  status?: {
    published?: boolean;
    registration_open?: boolean;
    status?: 'draft' | 'published' | 'cancelled' | 'completed';
    is_live?: boolean;
  };
  published?: boolean;
  registered_count?: number;
  capacity?: {
    total?: number;
    registered?: number;
    remaining?: number;
    is_full?: boolean;
  };
}

interface EventsListProps {
  events: Event[];
  searchTerm: string;
  statusFilter: string | null;
  showPastEvents: boolean;
  sortBy: 'date' | 'status' | 'name';
  onCreateEvent: () => void;
  onEditEvent: (eventSlug: string) => void;
  onCommandCenter: (eventSlug: string) => void;
  onDeleteEvent?: (eventSlug: string) => Promise<void>;
  isAdmin?: boolean;
  loading?: boolean;
}

export default function EventsList({
  events,
  searchTerm,
  statusFilter,
  showPastEvents,
  sortBy,
  onCreateEvent,
  onEditEvent,
  onCommandCenter,
  onDeleteEvent,
  isAdmin = false,
  loading = false,
}: EventsListProps) {

  const getStatusBadge = (event: Event) => {
    if (event.status?.status === 'cancelled') {
      return { label: 'Cancelled', variant: 'tintRed' as BadgeVariant, value: 'cancelled' };
    }
    if (event.status?.status === 'completed') {
      return { label: 'Completed', variant: 'tintBlue' as BadgeVariant, value: 'completed' };
    }
    const eventDate = event.dates?.start || event.event_date;
    if (eventDate && isDatePast(eventDate)) {
      return { label: 'Past', variant: 'tintMuted' as BadgeVariant, value: 'past' };
    }
    if (event.status?.is_live) {
      return { label: 'Live', variant: 'tintGreen' as BadgeVariant, value: 'live' };
    }
    return { label: 'Draft', variant: 'tintPurple' as BadgeVariant, value: 'draft' };
  };

  const formatEventDateDisplay = (event: Event) => {
    const dateString = event.dates?.start || event.event_date;
    if (!dateString) return 'Date TBD';

    const formatted = formatDate(dateString, 'MMMM d, yyyy');
    return formatted || 'Invalid date';
  };

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          event.title?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      const badge = getStatusBadge(event);

      // Hide past and cancelled events by default unless showPastEvents is true or explicitly filtered
      const isPastOrCancelled = badge.value === 'past' || badge.value === 'cancelled';
      // When filtering by "Past", cancelled events ARE considered explicitly filtered
      const isExplicitlyFiltered = statusFilter === badge.label || (statusFilter === 'Past' && badge.value === 'cancelled');

      if (!showPastEvents && isPastOrCancelled && !isExplicitlyFiltered) {
        return false;
      }

      // When filtering by "Past", include cancelled events (they're effectively "over")
      if (statusFilter) {
        if (statusFilter === 'Past' && isPastOrCancelled) {
          // "Past" filter includes both past and cancelled events
          return true;
        } else if (badge.label !== statusFilter) {
          // For all other filters (including "Cancelled"), do exact match
          return false;
        }
      }

      return true;
    });

    // Sort events
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.dates?.start || a.event_date || 0).getTime();
        const dateB = new Date(b.dates?.start || b.event_date || 0).getTime();
        return dateB - dateA; // Newest first
      } else if (sortBy === 'name') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'status') {
        return getStatusBadge(a).label.localeCompare(getStatusBadge(b).label);
      }
      return 0;
    });

    return filtered;
  }, [events, searchTerm, statusFilter, showPastEvents, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-3 md:px-4">
      {/* Header section removed - now in Dashboard.tsx header */}

      {/* Events List */}
      <div className="space-y-2.5">
        {filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-8 text-foreground/40">
            <p className="text-xs">No events found{(searchTerm || statusFilter) && ' - try adjusting your filters'}</p>
          </div>
        ) : (
          filteredAndSortedEvents.map((event) => {
            const badge = getStatusBadge(event);
            const applicantCount = event.capacity?.registered || event.registered_count || 0;

            return (
              <div
                key={event.id}
                className="glass-card voxxy-hover-panel event-list-card p-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">
                        {event.title}
                      </h3>
                      <Badge
                        variant={badge.variant}
                        className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                      >
                        {badge.label}
                      </Badge>
                    </div>

                    {event.description && (
                      <p className="text-foreground/70 text-xs mb-1.5 line-clamp-1">
                        {event.description}
                      </p>
                    )}

                    {/* Event Meta — muted copy + brighter purple icons (restores tinted dark look) */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground/60 dark:text-purple-300/85">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0 text-purple-600 dark:text-purple-400" />
                        <span>{formatEventDateDisplay(event)}</span>
                      </div>
                      {event.location && (
                        <>
                          <span className="text-foreground/30 dark:text-purple-400/35">•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0 text-purple-600 dark:text-purple-400" />
                            <span>{event.location}</span>
                          </div>
                        </>
                      )}
                      <span className="text-foreground/30 dark:text-purple-400/35">•</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 shrink-0 text-purple-600 dark:text-purple-400" />
                        <span>{applicantCount} applicants</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCommandCenter(event.slug)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg voxxy-btn-cta font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-smooth text-sm whitespace-nowrap"
                    >
                      Command Center
                    </button>

                    {/* Admin Quick Delete Button - Only in Dev/Staging */}
                    {isAdmin && onDeleteEvent && import.meta.env.MODE !== 'production' && (
                      <button
                        onClick={() => onDeleteEvent(event.namespaced_slug || event.slug)}
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-foreground font-medium hover:shadow-lg hover:shadow-red-500/30 transition-smooth whitespace-nowrap"
                        title="Admin Quick Delete - No Confirmation (Dev/Staging Only)"
                      >
                        <div className="flex items-center gap-1.5">
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm">Delete</span>
                        </div>
                        <span className="text-[9px] text-red-200 font-bold uppercase tracking-wide">
                          ⚠️ Immediate
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Events List"
        data={{
          events,
          filteredAndSortedEvents,
          searchTerm,
          statusFilter,
          showPastEvents,
          sortBy,
          eventsCount: events.length,
          filteredCount: filteredAndSortedEvents.length,
          loading,
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
