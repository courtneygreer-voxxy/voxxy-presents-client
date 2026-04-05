import { useState, useMemo } from 'react';
import { Calendar, Plus, Eye, EyeOff, Trash2, Search } from 'lucide-react';
import { formatEventDate as formatDate, isDatePast, getDaysUntil } from '../../utils/dateHelpers';
import { DebugPanel } from './DebugPanel';

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
  onCreateEvent: () => void;
  onEditEvent: (eventSlug: string) => void;
  onCommandCenter: (eventSlug: string) => void;
  onDeleteEvent?: (eventSlug: string) => Promise<void>;
  isAdmin?: boolean;
  loading?: boolean;
}

export default function EventsList({
  events,
  onCreateEvent,
  onEditEvent,
  onCommandCenter,
  onDeleteEvent,
  isAdmin = false,
  loading = false,
}: EventsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'name'>('date');

  const getStatusBadge = (event: Event) => {
    // Determine badge based on event date and is_live status
    const eventDate = event.dates?.start || event.event_date;
    if (!eventDate) {
      return { label: 'Draft', color: 'bg-purple-500/20 text-purple-300', value: 'draft' };
    }

    // Check if event date has passed
    if (isDatePast(eventDate)) {
      return { label: 'Past', color: 'bg-gray-500/20 text-gray-300', value: 'past' };
    }

    // Check if event is live (invitation email has been sent)
    if (event.status?.is_live) {
      return { label: 'Live', color: 'bg-green-500/20 text-green-300', value: 'live' };
    }

    // Otherwise it's still a draft
    return { label: 'Draft', color: 'bg-purple-500/20 text-purple-300', value: 'draft' };
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

      // Hide past events by default unless showPastEvents is true or 'Past' is explicitly filtered
      if (!showPastEvents && badge.value === 'past' && statusFilter !== 'Past') {
        return false;
      }

      if (statusFilter && badge.label !== statusFilter) {
        return false;
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
    <div className="p-3 md:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-bold text-white mb-0.5">Events</h1>
          <p className="text-[10px] text-white/60">
            {filteredAndSortedEvents.length} {filteredAndSortedEvents.length === 1 ? 'event' : 'events'}
            {!showPastEvents && ' (past events hidden)'}
          </p>
        </div>
        <button
          onClick={onCreateEvent}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-smooth text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Create New Event</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 space-y-2">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* Status pills + Sort + Past toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {['Live', 'Draft', 'Past'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? null : status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {status}
            </button>
          ))}
          <div className="w-px h-5 bg-white/10 mx-1" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'name')}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
          </select>
          <button
            onClick={() => setShowPastEvents(!showPastEvents)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showPastEvents
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            {showPastEvents ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showPastEvents ? 'Hide Past' : 'Show Past'}
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        {filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <p className="text-xs">No events found</p>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter(null);
                }}
                className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedEvents.map((event) => {
            const badge = getStatusBadge(event);
            const applicantCount = event.capacity?.registered || event.registered_count || 0;

            return (
              <div
                key={event.id}
                className="glass-card p-4 hover:bg-white/8 hover:border-white/20 transition-smooth"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-white">
                        {event.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-white/70 text-xs mb-1.5 line-clamp-1">
                        {event.description}
                      </p>
                    )}

                    {/* Event Meta */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/60">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        <span>{formatEventDateDisplay(event)}</span>
                      </div>
                      {event.location && (
                        <>
                          <span className="text-white/30">•</span>
                          <span>{event.location}</span>
                        </>
                      )}
                      <span className="text-white/30">•</span>
                      <span>{applicantCount} applicants</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCommandCenter(event.slug)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-smooth text-sm whitespace-nowrap"
                    >
                      Command Center
                    </button>

                    {/* Admin Quick Delete Button - Only in Dev/Staging */}
                    {isAdmin && onDeleteEvent && import.meta.env.MODE !== 'production' && (
                      <button
                        onClick={() => onDeleteEvent(event.namespaced_slug || event.slug)}
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/30 transition-smooth whitespace-nowrap"
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
