import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, ArrowRight } from 'lucide-react';
import { eventsApi } from '@/services/api';

interface Event {
  id: number;
  title: string;
  slug: string;
  description?: string;
  dates: {
    start?: string;
    end?: string;
  };
  location?: string;
  poster_url?: string;
  ticket_url?: string;
  pricing: {
    ticket_price?: number;
    currency: string;
  };
  capacity: {
    total?: number;
    registered?: number;
    remaining?: number;
    is_full?: boolean;
  };
  organization: {
    id: number;
    name: string;
    city?: string;
    state?: string;
  };
  vendor_application?: {
    id: number;
    name: string;
    description?: string;
    categories: string[];
    submissions_count: number;
  };
}

export default function PublicEventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchEvent(slug);
    }
  }, [slug]);

  const fetchEvent = async (eventSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getById(eventSlug);
      setEvent(data);
    } catch (err: any) {
      console.error('Failed to fetch event:', err);
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-white/60 mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820]">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-900 to-blue-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0d2e] via-[#1a0d2e]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
              {event.title}
            </h1>
            <p className="text-white/80 text-lg">
              Presented by {event.organization.name}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Details */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-white/80 whitespace-pre-wrap">
                {event.description || 'No description available.'}
              </p>
            </div>

            {/* Vendor Application Section */}
            {event.vendor_application && (
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Vendor Opportunities
                </h2>
                <p className="text-lg text-purple-300 mb-4">
                  {event.vendor_application.name}
                </p>
                {event.vendor_application.description && (
                  <p className="text-white/80 mb-6 whitespace-pre-wrap">
                    {event.vendor_application.description}
                  </p>
                )}

                {/* Categories */}
                {event.vendor_application.categories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white/60 mb-2">
                      Seeking Vendors In:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.vendor_application.categories.map((category) => (
                        <span
                          key={category}
                          className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/events/${event.slug}/apply`)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg"
                >
                  Apply as Vendor
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-white/40 text-sm mt-4">
                  {event.vendor_application.submissions_count} vendors have applied
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <Calendar className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold text-white/60 mb-1">Date & Time</h3>
                  <p className="text-white">
                    {formatDate(event.dates.start)}
                  </p>
                  {event.dates.start && (
                    <p className="text-white/60 text-sm">
                      {formatTime(event.dates.start)}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/60 mb-1">Location</h3>
                    <p className="text-white">{event.location}</p>
                  </div>
                </div>
              )}

              {/* Capacity */}
              {event.capacity.total && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/60 mb-1">Capacity</h3>
                    <p className="text-white">
                      {event.capacity.registered || 0} / {event.capacity.total} registered
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Ticket Price */}
            {event.pricing.ticket_price && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/60 mb-1">Ticket Price</h3>
                    <p className="text-white text-2xl font-bold">
                      ${event.pricing.ticket_price}
                    </p>
                  </div>
                </div>
                {event.ticket_url && (
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    Get Tickets
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
