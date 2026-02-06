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
  install?: {
    install_date?: string;
    install_start_time?: string;
    install_end_time?: string;
  };
  application_tags?: string;
}

interface Event {
  id: number;
  title: string;
  slug: string;
  description?: string;
  dates: {
    start?: string;
    end?: string;
    start_time?: string;
    end_time?: string;
  };
  venue?: string;
  location?: string;
  age_restriction?: string;
  poster_url?: string;
  ticket_url?: string;
  ticket_link?: string;
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

  const formatTimeString = (timeString?: string) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const normalizeUrl = (url?: string) => {
    if (!url) return '';
    // If URL already has a protocol, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Otherwise, prepend https://
    return `https://${url}`;
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
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Main Card Container */}
        <div className="bg-[#1e1b2e] border border-white/10 rounded-lg p-4 md:p-5">
          {/* Event Title and Location */}
          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-1">
              {event.title}
            </h1>
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <MapPin className="w-3.5 h-3.5" />
              <span>{event.location}</span>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="py-4 border-t border-b border-white/10 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Venue */}
              {event.venue && (
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-[10px] mb-0.5">Venue</p>
                    <p className="text-white text-xs">{event.venue}</p>
                  </div>
                </div>
              )}

              {/* Tickets */}
              {(event.ticket_link || event.ticket_url) && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-[10px] mb-0.5">Tickets</p>
                    <a
                      href={normalizeUrl(event.ticket_link || event.ticket_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      Buy Tickets
                    </a>
                  </div>
                </div>
              )}

              {/* Apply By */}
              {event.application_deadline && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-[10px] mb-0.5">Apply By</p>
                    <p className="text-white text-xs">
                      {new Date(event.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Age */}
              {event.age_restriction && (
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-[10px] mb-0.5">Age</p>
                    <p className="text-white text-xs">{event.age_restriction}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* About This Event */}
        {event.description && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-3">About This Event</h2>
            <p className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* Application Categories */}
        {event.vendor_applications && event.vendor_applications.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-3">Application Categories</h2>

            {/* Map through all vendor applications */}
            <div className="space-y-3">
              {event.vendor_applications.map((application) => (
                <div key={application.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  {/* Title Row - Price hidden for Pancakes & Booze pilot */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-bold text-white">
                      {application.name}
                    </h3>
                    {/* Price display commented out for pilot - payment handled via external integration */}
                    {/* <div className="text-right">
                      {application.booth_price && (
                        <>
                          <p className="text-xl font-bold text-purple-400">
                            ${Number(application.booth_price).toFixed(0)}
                          </p>
                          {event.application_deadline && (
                            <p className="text-white/60 text-[10px] mt-0.5">
                              Early bird: {new Date(event.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </>
                      )}
                    </div> */}
                  </div>

                  {/* Description */}
                  {application.description && (
                    <p className="text-white/80 text-xs mb-3">
                      {application.description}
                    </p>
                  )}

                  {/* Tags */}
                  {application.application_tags && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {application.application_tags.split(',').map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px]"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Install Date & Time */}
                  {application.install?.install_date && (
                    <div className="flex items-center gap-3 text-white/80 text-xs mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>Install: {new Date(application.install.install_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      {(application.install.install_start_time || application.install.install_end_time) && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>
                            {application.install.install_start_time && formatTimeString(application.install.install_start_time)}
                            {application.install.install_start_time && application.install.install_end_time && ' - '}
                            {application.install.install_end_time && formatTimeString(application.install.install_end_time)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Apply Now Button */}
                  <a
                    href={`/events/${event.slug}/apply/${application.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#d946ef] via-[#a855f7] to-[#3b82f6] text-white font-semibold hover:opacity-90 transition-all text-sm"
                  >
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        {/* Powered by Voxxy Presents */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
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
