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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Events</h1>
          <p className="text-white/60">Manage your event bookings and applications</p>
        </div>
        <button
          onClick={onCreateEvent}
          className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:scale-105 transition-all text-sm lg:text-base"
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
                className="bg-white/5 rounded-xl p-4 lg:p-6 border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-lg lg:text-xl font-semibold text-white">
                        {event.title}
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-white/60 text-sm mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Event Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{formatEventDate(event)}</span>
                      </div>
                      <span>•</span>
                      <span>{applicantCount} applicants</span>
                      <span>•</span>
                      <span>{acceptedCount} accepted</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 lg:gap-3">
                    <button
                      onClick={() => onEditEvent(event.slug)}
                      className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 rounded-lg border border-white/20 text-white/90 hover:bg-white/5 hover:text-white transition-all text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => onCommandCenter(event.slug)}
                      className="px-3 py-2 lg:px-4 lg:py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:scale-105 transition-all text-sm"
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
