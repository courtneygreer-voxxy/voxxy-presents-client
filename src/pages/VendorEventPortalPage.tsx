import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  DollarSign,
  Loader2,
  AlertCircle,
  Users,
  Building2,
} from 'lucide-react';
import {
  verifyPortalAccess,
  fetchPortalData,
  getPortalSession,
  clearPortalSession,
  hasActiveSession,
} from '@/services/eventPortalService';
import type { EventPortalData } from '@/types/eventPortal';

export default function VendorEventPortalPage() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const [searchParams] = useSearchParams();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Portal data state
  const [portalData, setPortalData] = useState<EventPortalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Pre-fill email from URL params on mount
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const skipAuth = searchParams.get('skip'); // TEMP: for design review

    if (emailParam) setEmail(emailParam);

    // TEMP: Skip auth for design review
    if (skipAuth === 'true') {
      setIsAuthenticated(true);
      loadMockPortalData();
      return;
    }

    // Check if user already has an active session
    if (eventSlug && hasActiveSession(eventSlug)) {
      setIsAuthenticated(true);
      loadPortalData();
    }
  }, [eventSlug, searchParams]);

  const handleAccessPortal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventSlug || !email) {
      setAuthError('Please provide your email address');
      return;
    }

    try {
      setVerifying(true);
      setAuthError(null);

      const response = await verifyPortalAccess({
        event_slug: eventSlug,
        email: email.toLowerCase().trim(),
      });

      if (response.access_granted) {
        setIsAuthenticated(true);
        loadPortalData();
      } else {
        setAuthError(response.error || 'Access denied');
      }
    } catch (error: any) {
      console.error('Portal access error:', error);
      setAuthError(error.message || 'Failed to verify access');
    } finally {
      setVerifying(false);
    }
  };

  const loadPortalData = async () => {
    if (!eventSlug) return;

    try {
      setLoading(true);
      setDataError(null);

      const data = await fetchPortalData(eventSlug);
      setPortalData(data);
    } catch (error: any) {
      console.error('Portal data error:', error);
      setDataError(error.message || 'Failed to load portal data');

      // If session expired, reset to login form
      if (error.status === 401) {
        setIsAuthenticated(false);
        clearPortalSession();
      }
    } finally {
      setLoading(false);
    }
  };

  // TEMP: Mock data for design review
  const loadMockPortalData = () => {
    setPortalData({
      id: 1,
      view_count: 42,
      last_viewed_at: new Date().toISOString(),
      event: {
        id: 1,
        title: 'Summer Art Market 2026',
        slug: 'summer-art-market',
        description: 'Join us for our annual summer art market featuring local artists, food vendors, and live music. This is a family-friendly event showcasing the best of our creative community.',
        dates: {
          event_date: '2026-06-15',
          event_end_date: '2026-06-15',
          start_time: '10:00',
          end_time: '18:00',
        },
        venue: 'Piedmont Park',
        location: '1071 Piedmont Ave NE, Atlanta, GA 30309',
        age_restriction: '21+ after 8pm',
        ticket_url: 'https://eventbrite.com/summer-market-2026',
        application_deadline: '2026-05-30',
        payment_deadline: '2026-06-01',
        organization: {
          id: 1,
          name: 'Voxxy Presents',
          slug: 'voxxy-presents',
        },
      },
      vendor_categories: [
        {
          id: 1,
          name: 'Food Vendor - Full Kitchen',
          description: 'Full kitchen setup with cooking equipment. Perfect for food trucks or vendors needing extensive cooking space.',
          categories: ['Food', 'Beverage', 'Restaurant'],
          booth_price: 350,
          payment_link: 'https://stripe.com/pay/food-vendor',
          install: {
            install_date: '2026-06-14',
            install_start_time: '08:00',
            install_end_time: '10:00',
          },
          application_tags: ['premium', 'kitchen-required'],
        },
        {
          id: 2,
          name: 'Artisan Booth - 10x10',
          description: 'Standard 10x10 booth space for artists and craftspeople. Includes table and tent.',
          categories: ['Art', 'Crafts', 'Handmade'],
          booth_price: 150,
          payment_link: 'https://stripe.com/pay/artisan-booth',
          install: {
            install_date: '2026-06-14',
            install_start_time: '14:00',
            install_end_time: '16:00',
          },
          application_tags: [],
        },
        {
          id: 3,
          name: 'Clothing & Accessories',
          description: 'Booth space for clothing, jewelry, and accessory vendors.',
          categories: ['Fashion', 'Clothing', 'Accessories'],
          booth_price: 200,
          payment_link: null,
          install: {
            install_date: '2026-06-14',
            install_start_time: '14:00',
            install_end_time: '16:00',
          },
          application_tags: [],
        },
      ],
      producer_updates: [],
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Authentication Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Event Portal Access</h1>
              <p className="text-gray-400">
                Enter your email to view event details
              </p>
            </div>

            <form onSubmit={handleAccessPortal} className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Use the email you provided when you applied to this event
                  </p>
                </div>

                {authError && (
                  <div className="flex items-start gap-2 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{authError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Access Portal'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              <p>
                This portal is only accessible to vendors who have applied to this event.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !portalData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dataError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Portal</h2>
          <p className="text-gray-400 mb-6">{dataError}</p>
          <button
            onClick={() => {
              clearPortalSession();
              setIsAuthenticated(false);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const { event, vendor_categories } = portalData;

  // Portal Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">{event.title}</h1>
            <button
              onClick={() => {
                clearPortalSession();
                setIsAuthenticated(false);
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
          {event.organization && (
            <div className="flex items-center gap-2 text-gray-400">
              <Building2 className="h-4 w-4" />
              <span>Presented by {event.organization.name}</span>
            </div>
          )}
        </div>

        {/* Event Details Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Event Details</h2>

          {event.description && (
            <p className="text-gray-300 mb-6 leading-relaxed">{event.description}</p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">Date</p>
                <p className="text-gray-300">{formatDate(event.dates.event_date)}</p>
                {event.dates.event_end_date &&
                  event.dates.event_end_date !== event.dates.event_date && (
                    <p className="text-sm text-gray-400">
                      to {formatDate(event.dates.event_end_date)}
                    </p>
                  )}
              </div>
            </div>

            {(event.dates.start_time || event.dates.end_time) && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Time</p>
                  <p className="text-gray-300">
                    {formatTime(event.dates.start_time)}
                    {event.dates.end_time && ` - ${formatTime(event.dates.end_time)}`}
                  </p>
                </div>
              </div>
            )}

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-gray-300">{event.venue}</p>
                  <p className="text-sm text-gray-400">{event.location}</p>
                </div>
              </div>
            )}

            {event.age_restriction && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Age Restriction</p>
                  <p className="text-gray-300">{event.age_restriction}</p>
                </div>
              </div>
            )}

            {event.payment_deadline && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Payment Deadline</p>
                  <p className="text-gray-300">{formatDate(event.payment_deadline)}</p>
                </div>
              </div>
            )}

            {event.ticket_url && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Event Tickets</p>
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline text-sm"
                  >
                    View Ticket Page
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vendor Categories Section */}
        {vendor_categories.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Vendor Categories & Pricing</h2>

            <div className="space-y-4">
              {vendor_categories.map((category) => (
                <div key={category.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                      {category.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {category.categories.map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-600 text-xs rounded-full text-gray-300"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {category.booth_price && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-400">
                          {formatPrice(category.booth_price)}
                        </p>
                        {category.payment_link && (
                          <a
                            href={category.payment_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded transition-colors"
                          >
                            Pay Now
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {category.description && (
                    <p className="text-gray-300 text-sm mb-3">{category.description}</p>
                  )}

                  {(category.install.install_date ||
                    category.install.install_start_time ||
                    category.install.install_end_time) && (
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-gray-400">
                        <span className="font-semibold">Install Time: </span>
                        {category.install.install_date && formatDate(category.install.install_date)}
                        {category.install.install_start_time &&
                          `, ${formatTime(category.install.install_start_time)}`}
                        {category.install.install_end_time &&
                          ` - ${formatTime(category.install.install_end_time)}`}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Producer Updates Section (Placeholder for Phase 2) */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Producer Updates</h2>
          <p className="text-gray-400 text-center py-8">
            No updates at this time. Check back later for announcements from the event producer.
          </p>
        </div>
      </div>
    </div>
  );
}
