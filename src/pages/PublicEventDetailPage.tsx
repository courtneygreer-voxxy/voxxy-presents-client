import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, ArrowRight, Clock, Building2 } from 'lucide-react';
import { eventsApi } from '@/services/api';

interface VendorApplication {
  id: number;
  name: string;
  description?: string;
  categories: string[];
  booth_price?: number;
  submissions_count: number;
}

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
  application_deadline?: string;
  pricing: {
    ticket_price?: number;
    booth_price?: number;
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
  vendor_applications?: VendorApplication[];
}

export default function PublicEventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Applications closed';
    if (diffDays === 0) return 'Applications close today';
    if (diffDays === 1) return '1 day left until applications close';
    return `${diffDays} days left until applications close`;
  };

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
      <div className="relative h-[180px] md:h-[300px] overflow-hidden">
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
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
              {event.title}
            </h1>
            <p className="text-white/80 text-base md:text-lg">
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
            {/* Vendor Applications Section */}
            {event.vendor_applications && event.vendor_applications.length > 0 && (
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Vendor Opportunities
                </h2>

                {/* Application Deadline Timer */}
                {event.application_deadline && (
                  <div className="mb-6 flex items-center gap-2 text-purple-300">
                    <Clock className="w-4 h-4" />
                    <p className="text-sm font-medium">
                      {getDaysUntilDeadline(event.application_deadline)}
                    </p>
                  </div>
                )}

                {/* Map through all vendor applications */}
                <div className="space-y-6">
                  {event.vendor_applications.map((application) => (
                    <div key={application.id} className="pb-6 last:pb-0 border-b border-white/10 last:border-0">
                      <p className="text-lg text-purple-300 mb-2">
                        {application.name}
                      </p>

                      {/* Booth Price */}
                      {application.booth_price && (
                        <p className="text-2xl font-bold text-white mb-4">
                          ${Number(application.booth_price).toFixed(2)}
                        </p>
                      )}

                      {application.description && (
                        <p className="text-white/80 mb-6 whitespace-pre-wrap">
                          {application.description}
                        </p>
                      )}

                      {/* Categories */}
                      {application.categories.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-white/60 mb-2">
                            Seeking Vendors In:
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {application.categories.map((category) => (
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

                      <a
                        href={`/events/${event.slug}/apply/${application.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg"
                      >
                        Apply as Vendor
                        <ArrowRight className="w-5 h-5" />
                      </a>

                      <p className="text-white/40 text-sm mt-4">
                        {application.submissions_count} vendors have applied
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization Details */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-purple-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white/60 mb-1">
                    Presented By
                  </h3>
                  <p className="text-white font-medium mb-2">
                    {event.organization.name}
                  </p>
                  {event.organization.city && event.organization.state && (
                    <p className="text-white/60 text-sm mb-4">
                      {event.organization.city}, {event.organization.state}
                    </p>
                  )}
                  {event.description && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="border-l-4 border-purple-400 pl-4">
                        <p className="text-white/90 italic text-sm leading-relaxed whitespace-pre-wrap">
                          "{event.description}"
                        </p>
                      </div>
                      <p className="text-white/60 text-xs mt-3">
                        — {event.organization.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

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

        {/* Powered by Voxxy Presents */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <span>Powered by</span>
            <img
              src="/VoxxyTriangle.svg"
              alt="Voxxy"
              className="w-4 h-4 opacity-60"
            />
            <span className="font-semibold">Voxxy Presents</span>
          </div>
        </div>
      </div>
    </div>
  );
}
