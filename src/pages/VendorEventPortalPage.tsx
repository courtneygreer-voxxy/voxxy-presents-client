import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
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
  Megaphone,
  Pin,
  Eye,
} from 'lucide-react';
import {
  verifyPortalAccess,
  fetchPortalData,
  fetchPortalDataByToken,
  getPortalSession,
  clearPortalSession,
  hasActiveSession,
} from '@/services/eventPortalService';
import { useAuth } from '@/contexts/AuthContext';
import { eventsApi, vendorApplicationsApi, bulletinsApi } from '@/services/api';
import type { EventPortalData } from '@/types/eventPortal';
import type { Bulletin } from '@/types/bulletin';
import { formatDistanceToNow } from 'date-fns';
import { useForceTheme } from '@/hooks/useForceTheme';

export default function VendorEventPortalPage() {
  useForceTheme('dark');
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated: isLoggedIn, isProducer, isAdmin } = useAuth();

  // Extract identifier from path: /portal/[identifier] or /portal/[org-slug]-[org_id]/[event-slug]-[event_id]
  const portalIdentifier = location.pathname.replace('/portal/', '');

  // Detect if portalIdentifier is a token (long base64) or slug (short kebab-case or namespaced)
  // Tokens are 43 chars (urlsafe_base64(32)), slugs can have slashes for namespaced format
  const isToken = portalIdentifier && portalIdentifier.length > 40 && !/[^A-Za-z0-9_-]/.test(portalIdentifier);
  const eventSlug = !isToken ? portalIdentifier : undefined;
  const accessToken = isToken ? portalIdentifier : undefined;

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isProducerPreview, setIsProducerPreview] = useState(false);

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

    // Producer/admin bypass: skip email gate, fetch via authenticated APIs
    if (isLoggedIn && (isProducer || isAdmin)) {
      loadPortalDataAsProducer();
      return;
    }

    // Check if user already has an active session
    if (eventSlug && hasActiveSession(eventSlug)) {
      setIsAuthenticated(true);
      loadPortalData();
    }
  }, [portalIdentifier, eventSlug, searchParams, isLoggedIn, isProducer, isAdmin]);

  const handleAccessPortal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!portalIdentifier || !email) {
      setAuthError('Please provide your email address');
      return;
    }

    try {
      setVerifying(true);
      setAuthError(null);

      // Build request with either access_token or event_slug
      const request = isToken
        ? { access_token: accessToken, email: email.toLowerCase().trim() }
        : { event_slug: eventSlug, email: email.toLowerCase().trim() };

      const response = await verifyPortalAccess(request);

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
    if (!portalIdentifier) return;

    try {
      setLoading(true);
      setDataError(null);

      // Use token-based fetch if we have a token, otherwise use slug-based fetch
      const data = isToken && accessToken
        ? await fetchPortalDataByToken(accessToken)
        : await fetchPortalData(eventSlug!);
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

  // Producer bypass: load portal data using authenticated producer APIs
  const loadPortalDataAsProducer = async () => {
    try {
      setLoading(true);
      setIsAuthenticated(true);
      setIsProducerPreview(true);

      let slug = eventSlug;

      // For token-based URLs, resolve the token to an event slug
      if (isToken && accessToken) {
        const events = await eventsApi.getAll();
        const matchingEvent = (events as any[]).find(
          (e: any) => e.event_portal?.access_token === accessToken
        );
        if (matchingEvent) {
          slug = matchingEvent.namespaced_slug || matchingEvent.slug;
        } else {
          throw new Error('Could not find event for this portal link');
        }
      }

      if (!slug) {
        throw new Error('Could not determine event');
      }

      // Fetch event data, vendor applications, and bulletins in parallel
      const [eventData, vendorApps, bulletinsResponse] = await Promise.all([
        eventsApi.getById(slug),
        vendorApplicationsApi.getByEvent(slug).catch(() => []),
        bulletinsApi.getByEvent(slug).catch(() => ({ bulletins: [] })),
      ]);

      // Map to EventPortalData shape
      const data: EventPortalData = {
        id: eventData.id,
        view_count: eventData.event_portal?.view_count || 0,
        last_viewed_at: null,
        event: {
          id: eventData.id,
          title: eventData.title,
          slug: eventData.slug,
          description: eventData.description || '',
          status: eventData.status?.status || eventData.status || null,
          dates: {
            event_date: eventData.event_date,
            event_end_date: eventData.event_end_date || null,
            start_time: eventData.start_time || null,
            end_time: eventData.end_time || null,
          },
          venue: eventData.venue || '',
          location: eventData.location || '',
          age_restriction: eventData.age_restriction || null,
          ticket_url: eventData.ticket_url || eventData.ticket_link || null,
          application_deadline: eventData.application_deadline || null,
          payment_deadline: eventData.payment_deadline || null,
          organization: eventData.organization || null,
        },
        vendor_categories: (Array.isArray(vendorApps) ? vendorApps : []).map((app: any) => ({
          id: app.id,
          name: app.name,
          description: app.description || '',
          categories: app.categories || [],
          booth_price: app.pricing?.booth_price || app.booth_price || null,
          payment_link: app.payment_link || null,
          install: {
            install_date: app.install_date || null,
            install_start_time: app.install_start_time || null,
            install_end_time: app.install_end_time || null,
          },
          application_tags: app.application_tags || [],
        })),
        producer_updates: (bulletinsResponse as any)?.bulletins || [],
      };

      setPortalData(data);
    } catch (error: any) {
      console.error('Producer portal preview error:', error);
      setDataError(error.message || 'Failed to load portal preview');
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
      <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Event Portal Access</h1>
              <p className="text-muted-foreground">
                Enter your email to view event details
              </p>
            </div>

            <form onSubmit={handleAccessPortal} className="bg-muted rounded-lg p-6 shadow-xl">
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
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">
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
                  className="w-full voxxy-btn-solid disabled:bg-muted disabled:cursor-not-allowed font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
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

            <div className="mt-6 text-center text-sm text-muted-foreground">
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
      <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dataError) {
    return (
      <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Portal</h2>
          <p className="text-muted-foreground mb-6">{dataError}</p>
          <button
            onClick={() => {
              clearPortalSession();
              setIsAuthenticated(false);
            }}
            className="voxxy-btn-solid font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const { event, vendor_categories } = portalData;

  // Show cancellation message if event is cancelled
  if (event.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Producer Preview Banner */}
          {isProducerPreview && (
            <div className="bg-primary/20 border border-primary/30 rounded-lg p-3 mb-6 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm text-primary">
                <span className="font-semibold">Producer Preview</span> — This is how vendors see your event portal.
              </p>
            </div>
          )}

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Event Cancelled</h1>
            <p className="text-lg text-white/90 mb-4">{event.title}</p>
            <p className="text-white/70 mb-6">
              This event has been cancelled by the event organizer. If you submitted payment, you will be contacted regarding refund details.
            </p>

            {/* Organization Contact Info */}
            {event.organization && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6 max-w-md mx-auto">
                <p className="text-sm text-white/60 mb-3">For questions about this cancellation, please contact:</p>
                <p className="text-lg font-semibold text-white mb-2">{event.organization.name}</p>
                {event.organization.email ? (
                  <a
                    href={`mailto:${event.organization.email}`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/70 text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {event.organization.email}
                  </a>
                ) : (
                  <p className="text-sm text-white/60 italic">Contact information not available</p>
                )}
                <p className="text-xs text-white/50 mt-4">
                  This event was managed through Voxxy Presents, but all event decisions including cancellations are made by the event organizer.
                </p>
              </div>
            )}

            {!isProducerPreview && (
              <button
                onClick={() => {
                  clearPortalSession();
                  setIsAuthenticated(false);
                }}
                className="px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Portal Dashboard
  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 py-8">
        {/* Producer Preview Banner */}
        {isProducerPreview && (
          <div className="bg-primary/20 border border-primary/30 rounded-lg p-3 mb-6 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm text-primary">
              <span className="font-semibold">Producer Preview</span> — This is how vendors see your event portal.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h1 className="text-2xl md:text-4xl font-bold">{event.title}</h1>
            {!isProducerPreview && (
              <button
                onClick={() => {
                  clearPortalSession();
                  setIsAuthenticated(false);
                }}
                className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
          {event.organization && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Building2 className="h-4 w-4" />
              <span>Presented by {event.organization.name}</span>
            </div>
          )}
        </div>

        {/* Event Details Section */}
        <div className="bg-muted rounded-lg p-4 md:p-6 mb-6 shadow-xl">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Event Details</h2>

          {event.description && (
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">{event.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-muted-foreground">{event.venue}</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            )}

            {event.age_restriction && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Age Restriction</p>
                  <p className="text-muted-foreground">{event.age_restriction}</p>
                </div>
              </div>
            )}

            {event.payment_deadline && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Payment Deadline</p>
                  <p className="text-muted-foreground">{formatDate(event.payment_deadline)}</p>
                </div>
              </div>
            )}

            {event.ticket_url && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Event Tickets</p>
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/70 underline text-sm transition-colors"
                  >
                    View Ticket Page
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Producer Updates Section */}
        <div className="bg-muted rounded-lg p-4 md:p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg voxxy-accent-tile flex items-center justify-center">
              <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">Producer Updates</h2>
          </div>

          {portalData.producer_updates && portalData.producer_updates.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {portalData.producer_updates.map((bulletin: Bulletin) => {
                const getInitials = (name: string) => {
                  return name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                };

                return (
                  <div
                    key={bulletin.id}
                    className={`voxxy-gradient-card-deep rounded-lg p-4 md:p-6 border ${
                      bulletin.pinned ? 'border-primary' : 'border-border'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4">
                      {/* Author Avatar */}
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full voxxy-accent-tile flex items-center justify-center text-xs md:text-sm font-medium flex-shrink-0">
                        {getInitials(bulletin.author.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm md:text-base text-foreground font-semibold">{bulletin.subject}</h3>
                          {bulletin.pinned && (
                            <Pin className="w-3 h-3 md:w-4 md:h-4 text-primary fill-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs md:text-sm">
                          {bulletin.author.name} · {formatDistanceToNow(new Date(bulletin.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap">
                      {bulletin.body}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6 md:py-8 text-sm md:text-base">
              No updates at this time. Check back later for announcements from the event producer.
            </p>
          )}
        </div>

        {/* Vendor Categories Section */}
        {vendor_categories.length > 0 && (
          <div className="bg-muted rounded-lg p-4 md:p-6 shadow-xl">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Vendor Categories & Pricing</h2>

            <div className="space-y-3 md:space-y-4">
              {vendor_categories.map((category) => (
                <div key={category.id} className="bg-muted rounded-lg p-3 md:p-4 border border-border">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-semibold">{category.name}</h3>
                      {category.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2">
                          {category.categories.map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 md:py-1 bg-muted text-xs rounded-full text-muted-foreground"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {category.booth_price && (
                      <div className="flex items-center justify-between md:block md:text-right">
                        <p className="text-xl md:text-2xl font-bold text-primary">
                          {formatPrice(category.booth_price)}
                        </p>
                        {category.payment_link && (
                          <a
                            href={category.payment_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-0 md:mt-2 text-xs md:text-sm voxxy-btn-solid px-3 py-1.5 rounded transition-colors"
                          >
                            Pay Now
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {category.description && (
                    <p className="text-muted-foreground text-xs md:text-sm mb-3">{category.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
