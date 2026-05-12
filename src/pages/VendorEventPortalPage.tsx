import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ExternalLink,
  DollarSign,
  Loader2,
  AlertCircle,
  Users,
  Megaphone,
  Pin,
  LayoutList,
  Tags,
  ArrowUpRight,
} from 'lucide-react';
import {
  verifyPortalAccess,
  fetchPortalData,
  fetchPortalDataByToken,
  clearPortalSession,
  hasActiveSession,
} from '@/services/eventPortalService';
import { useAuth } from '@/contexts/AuthContext';
import { useForceTheme } from '@/hooks/useForceTheme';
import { eventsApi, vendorApplicationsApi, bulletinsApi } from '@/services/api';
import type { EventPortalData } from '@/types/eventPortal';
import type { Bulletin } from '@/types/bulletin';
import { VendorPortalHero } from '@/components/vendor-portal/VendorPortalHero';
import { VendorPortalLocationMap } from '@/components/vendor-portal/VendorPortalLocationMap';
import { VendorPortalPageCanvas } from '@/components/vendor-portal/VendorPortalPageCanvas';
import { VendorPortalSection } from '@/components/vendor-portal/VendorPortalSection';
import { formatDistanceToNow } from 'date-fns';

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
          poster_url: eventData.poster_url ?? null,
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
        poster_url:
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1920&q=80',
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

  // Authentication Form
  if (!isAuthenticated) {
    return (
      <VendorPortalPageCanvas className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=60')] bg-cover bg-center opacity-[0.1]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/70" />
        <div className="container relative mx-auto px-4 py-16">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Applicants
              </p>
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Your event portal</h1>
              <p className="text-muted-foreground">
                Sign in with the email you used when you applied—then view your event info, fees, and updates.
              </p>
            </div>

            <form
              onSubmit={handleAccessPortal}
              className="voxxy-gradient-panel rounded-3xl border border-white/15 p-6 shadow-sm ring-1 ring-white/10 backdrop-blur-md"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="voxxy-input-frost w-full rounded-lg px-4 py-2"
                    required
                    autoFocus
                  />
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Same email as your application so we can match you to this event.
                  </p>
                </div>

                {authError && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{authError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={verifying}
                  className="voxxy-btn-cta flex w-full items-center justify-center gap-2 rounded-full py-3 px-6 font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Continue to portal'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm leading-relaxed text-muted-foreground">
              <p>Only applicants for this event can open this page.</p>
            </div>
          </div>
        </div>
      </VendorPortalPageCanvas>
    );
  }

  // Loading state
  if (loading || !portalData) {
    return (
      <VendorPortalPageCanvas className="flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your portal…</p>
        </div>
      </VendorPortalPageCanvas>
    );
  }

  // Error state
  if (dataError) {
    return (
      <VendorPortalPageCanvas className="flex items-center justify-center px-4">
        <div className="max-w-md rounded-3xl voxxy-gradient-panel border border-white/15 p-8 text-center shadow-sm ring-1 ring-white/10">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-2xl font-semibold tracking-tight">Error loading portal</h2>
          <p className="mb-6 text-muted-foreground">{dataError}</p>
          <button
            onClick={() => {
              clearPortalSession();
              setIsAuthenticated(false);
            }}
            className="voxxy-btn-solid rounded-full px-6 py-2.5 text-sm font-semibold transition"
          >
            Back to login
          </button>
        </div>
      </VendorPortalPageCanvas>
    );
  }

  const { event, vendor_categories } = portalData;

  // Show cancellation message if event is cancelled
  if (event.status === 'cancelled') {
    return (
      <VendorPortalPageCanvas>
        <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
          {isProducerPreview && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-white/15 bg-background/5 px-4 py-3 text-sm shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
                <span className="inline-flex w-fit shrink-0 rounded-md bg-primary/20 px-2.5 py-1 text-xs font-semibold text-foreground">
                  Applicant preview
                </span>
                <p className="text-muted-foreground">
                  You&apos;re viewing this cancellation notice the same way an applicant would.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-red-500/30 bg-background/5 p-8 text-center shadow-sm ring-1 ring-white/10 text-foreground">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">Event cancelled</h1>
            <p className="mb-4 text-lg text-muted-foreground">{event.title}</p>
            <p className="mb-6 text-muted-foreground">
              This event has been cancelled by the event organizer. If you submitted payment, you will be contacted regarding refund details.
            </p>

            {event.organization && (
              <div className="mx-auto mb-6 max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
                <p className="mb-3 text-sm text-muted-foreground">For questions about this cancellation, please contact:</p>
                <p className="mb-2 text-lg font-semibold text-foreground">{event.organization.name}</p>
                {event.organization.email ? (
                  <a
                    href={`mailto:${event.organization.email}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {event.organization.email}
                  </a>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Contact information not available</p>
                )}
                <p className="mt-4 text-xs text-muted-foreground">
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
                className="rounded-full bg-white/10 border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </VendorPortalPageCanvas>
    );
  }

  // Portal Dashboard
  return (
    <VendorPortalPageCanvas>
      <VendorPortalHero
        event={event}
        formatDate={formatDate}
        formatTime={formatTime}
        isProducerPreview={isProducerPreview}
        onSignOut={() => {
          clearPortalSession();
          setIsAuthenticated(false);
        }}
      />

      <div className="relative mx-auto mt-6 max-w-5xl space-y-6 px-4 pb-16 pt-0 sm:px-6 md:mt-8 md:space-y-8 md:px-8 lg:px-10">
        <VendorPortalSection
          title="Event details"
          description="Schedule context, venue, deadlines, and links your organizer has shared."
          icon={LayoutList}
        >
          {event.description ? (
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground md:text-base">{event.description}</p>
          ) : null}
          <div className="divide-y divide-border rounded-2xl border border-border bg-background/5">
            {event.location ? (
              <div className="flex gap-3 px-4 py-3.5 md:px-5 md:py-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{event.venue}</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                  <VendorPortalLocationMap venue={event.venue} location={event.location} />
                </div>
              </div>
            ) : null}
            {event.application_deadline ? (
              <div className="flex gap-3 px-4 py-3.5 md:px-5 md:py-4">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Apply by
                  </p>
                  <p className="font-medium text-foreground">{formatDate(event.application_deadline)}</p>
                </div>
              </div>
            ) : null}
            {event.age_restriction ? (
              <div className="flex gap-3 px-4 py-3.5 md:px-5 md:py-4">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Audience
                  </p>
                  <p className="text-foreground">{event.age_restriction}</p>
                </div>
              </div>
            ) : null}
            {event.payment_deadline ? (
              <div className="flex gap-3 px-4 py-3.5 md:px-5 md:py-4">
                <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment due
                  </p>
                  <p className="text-foreground">{formatDate(event.payment_deadline)}</p>
                </div>
              </div>
            ) : null}
            {event.ticket_url ? (
              <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-5 md:py-4">
                <div className="flex gap-3">
                  <ExternalLink className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Tickets
                    </p>
                    <p className="text-sm text-muted-foreground">Public ticket link</p>
                  </div>
                </div>
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="voxxy-btn-public-secondary inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium"
                >
                  View tickets
                  <ArrowUpRight className="h-4 w-4 opacity-70" aria-hidden />
                </a>
              </div>
            ) : null}
          </div>
        </VendorPortalSection>

        {vendor_categories.length > 0 ? (
          <VendorPortalSection
            title="Your booth & payment"
            description="Find your category and complete payment when the organizer has enabled online checkout."
            icon={Tags}
            headerClassName="mb-4 md:mb-5"
          >
            <div className="flex flex-wrap gap-3 md:gap-4">
              {vendor_categories.map(category => (
                <div
                  key={category.id}
                  className="flex min-w-[min(100%,17.5rem)] flex-1 basis-[17.5rem] flex-col rounded-2xl border border-border bg-background/5 p-4 shadow-sm ring-1 ring-white/5 transition-[box-shadow] duration-200 hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex flex-col gap-3">
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold leading-snug tracking-tight text-foreground md:text-base">
                        {category.name}
                      </h3>
                      {category.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {category.categories.map((cat, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-md bg-primary/20 px-2 py-0.5 text-xs font-medium text-foreground"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {category.payment_link ? (
                      <div className="border-t border-border pt-3">
                        <a
                          href={category.payment_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="voxxy-btn-cta inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2"
                        >
                          Pay online
                          <ExternalLink className="h-3.5 w-3.5 opacity-90" aria-hidden />
                        </a>
                      </div>
                    ) : null}
                  </div>
                  {category.description ? (
                    <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground line-clamp-4">
                      {category.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </VendorPortalSection>
        ) : null}

        <VendorPortalSection
          title="Updates from the organizer"
          description="Official notes about schedule changes, load-in, rules, or anything applicants should know."
          icon={Megaphone}
        >
          {portalData.producer_updates && portalData.producer_updates.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {portalData.producer_updates.map((bulletin: Bulletin) => {
                const getInitials = (name: string) =>
                  name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                return (
                  <article
                    key={bulletin.id}
                    className={`rounded-2xl border border-border bg-background/5 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md md:p-5 ${
                      bulletin.pinned ? 'border-l-4 border-l-primary pl-5 md:pl-6' : ''
                    }`}
                  >
                    <div className="mb-3 flex items-start gap-3 md:mb-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-foreground md:text-sm">
                        {getInitials(bulletin.author.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground md:text-base">{bulletin.subject}</h3>
                          {bulletin.pinned ? (
                            <Pin className="h-3.5 w-3.5 shrink-0 fill-primary text-primary" aria-label="Pinned" />
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground md:text-sm">
                          {bulletin.author.name} ·{' '}
                          {formatDistanceToNow(new Date(bulletin.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground md:text-base">
                      {bulletin.body}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-background/5 py-10 text-center text-sm leading-relaxed text-muted-foreground md:text-base">
              No announcements yet. When the organizer posts something, it will show up here.
            </p>
          )}
        </VendorPortalSection>
      </div>
    </VendorPortalPageCanvas>
  );
}
