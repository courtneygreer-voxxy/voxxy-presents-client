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
    <div className="px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Events</h1>
          <p className="text-base text-white/60">Manage your event postings and applications</p>
        </div>
        <button
          onClick={onCreateEvent}
          className="flex items-center gap-2 px-4 py-2.5 lg:px-6 lg:py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all text-sm lg:text-base"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="hidden sm:inline">Create New Event</span>
          <span className="sm:hidden">New Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
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
                className="bg-[#1e1536] rounded-xl p-5 lg:p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all shadow-lg"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl lg:text-2xl font-bold text-white">
                        {event.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Event Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
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

                  {/* Action Buttons */}
                  <div className="flex gap-2 lg:gap-3">
                    <button
                      onClick={() => onCommandCenter(event.slug)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all text-sm whitespace-nowrap"
                    >
                      Command Center
                    </button>
                    <button
                      onClick={() => onEditEvent(event.slug)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/30 text-white/90 hover:bg-white/5 hover:text-white hover:border-white/50 transition-all text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
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
