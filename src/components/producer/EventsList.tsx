import { Calendar, Edit2, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: number;
  slug: string;
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
  loading?: boolean;
}

export default function EventsList({
  events,
  onCreateEvent,
  onEditEvent,
  onCommandCenter,
  loading = false,
}: EventsListProps) {
  const getStatusBadge = (event: Event) => {
    // Determine badge based on event date and status
    const eventDate = event.dates?.start || event.event_date;
    if (!eventDate) {
      return { label: 'Draft', color: 'bg-purple-500/20 text-purple-300' };
    }

    const date = new Date(eventDate);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return { label: 'Past', color: 'bg-gray-500/20 text-gray-300' };
    } else if (daysUntil <= 7) {
      return { label: 'Upcoming', color: 'bg-blue-500/20 text-blue-300' };
    } else if (daysUntil <= 30) {
      return { label: 'Brewing', color: 'bg-yellow-500/20 text-yellow-300' };
    } else {
      return { label: 'New', color: 'bg-green-500/20 text-green-300' };
    }
  };

  const formatEventDate = (event: Event) => {
    const dateString = event.dates?.start || event.event_date;
    if (!dateString) return 'Date TBD';
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Events</h1>
          <p className="text-sm text-white/60">Manage your event postings and applications</p>
        </div>
        <button
          onClick={onCreateEvent}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create New Event</span>
          <span className="sm:hidden">New Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <p>No events found</p>
          </div>
        ) : (
          events.map((event) => {
            const badge = getStatusBadge(event);
            const applicantCount = event.capacity?.registered || event.registered_count || 0;
            const acceptedCount = Math.floor(applicantCount * 0.6); // Mock calculation

            return (
              <div
                key={event.id}
                className="bg-[#1e1536] rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg lg:text-xl font-bold text-white">
                        {event.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-white/70 text-xs mb-2 line-clamp-1">
                        {event.description}
                      </p>
                    )}

                    {/* Event Meta */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>{formatEventDate(event)}</span>
                      </div>
                      {event.location && (
                        <>
                          <span className="text-white/30">•</span>
                          <span>{event.location}</span>
                        </>
                      )}
                      <span className="text-white/30">•</span>
                      <span>{applicantCount} applicants</span>
                      <span className="text-white/30">•</span>
                      <span>{acceptedCount} accepted</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex">
                    <button
                      onClick={() => onCommandCenter(event.slug)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all text-sm whitespace-nowrap"
                    >
                      Command Center
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
