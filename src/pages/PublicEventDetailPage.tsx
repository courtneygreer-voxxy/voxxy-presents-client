import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Calendar, MapPin, Users, DollarSign, ArrowRight, Clock, Building2 } from 'lucide-react'
import { eventsApi } from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { useForceTheme } from '@/hooks/useForceTheme'

interface VendorApplication {
  id: number
  name: string
  description?: string
  categories: string[]
  booth_price?: number
  submissions_count: number
  install?: {
    install_date?: string
    install_start_time?: string
    install_end_time?: string
  }
  application_tags?: string
}

interface Event {
  id: number
  title: string
  slug: string
  description?: string
  status?: {
    published?: boolean
    registration_open?: boolean
    status?: string
    is_live?: boolean
  }
  dates: {
    start?: string
    end?: string
    start_time?: string
    end_time?: string
  }
  venue?: string
  location?: string
  age_restriction?: string
  poster_url?: string
  ticket_url?: string
  ticket_link?: string
  application_deadline?: string
  pricing: {
    ticket_price?: number
    booth_price?: number
    currency: string
  }
  capacity: {
    total?: number
    registered?: number
    remaining?: number
    is_full?: boolean
  }
  organization: {
    id: number
    name: string
    email?: string
    city?: string
    state?: string
  }
  vendor_applications?: VendorApplication[]
}

export default function PublicEventDetailPage() {
  useForceTheme('dark')
  const location = useLocation()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extract slug from path: /events/[slug] or /events/[org-slug]-[org_id]/[event-slug]-[event_id]
  // Preserve full namespaced slug (e.g., org-slug-id/event-slug-id)
  const slug = location.pathname.replace('/events/', '')

  console.log('🔍 [PublicEventDetailPage] RENDERING - pathname:', location.pathname, 'slug:', slug)

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Applications closed'
    if (diffDays === 0) return 'Applications close today'
    if (diffDays === 1) return '1 day left until applications close'
    return `${diffDays} days left until applications close`
  }

  useEffect(() => {
    if (slug) {
      fetchEvent(slug)
    }
  }, [slug])

  const fetchEvent = async (eventSlug: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await eventsApi.getById(eventSlug)
      setEvent(data)
    } catch (err: any) {
      console.error('Failed to fetch event:', err)
      setError(err.message || 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBA'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatTimeString = (timeString?: string) => {
    if (!timeString) return ''
    try {
      const [hours, minutes] = timeString.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes))
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return timeString
    }
  }

  const normalizeUrl = (url?: string) => {
    if (!url) return ''
    // If URL already has a protocol, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // Otherwise, prepend https://
    return `https://${url}`
  }

  if (loading) {
    return (
      <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
          <p className="text-foreground/60 mb-6">
            {error || 'The event you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg voxxy-btn-cta transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  // Show cancellation message if event is cancelled
  if (event.status?.status === 'cancelled') {
    return (
      <div className="min-h-screen voxxy-gradient-page-cool">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Event Cancelled</h1>
            <p className="text-lg text-white/90 mb-4">{event.title}</p>
            <p className="text-white/70 mb-6">
              This event has been cancelled by the event organizer. If you submitted payment, you
              will be contacted regarding refund details.
            </p>

            {/* Organization Contact Info */}
            {event.organization && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6 max-w-md mx-auto">
                <p className="text-sm text-white/60 mb-3">
                  For questions about this cancellation, please contact:
                </p>
                <p className="text-lg font-semibold text-white mb-2">{event.organization.name}</p>
                {event.organization.email ? (
                  <a
                    href={`mailto:${event.organization.email}`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/70 text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {event.organization.email}
                  </a>
                ) : (
                  <p className="text-sm text-white/60 italic">Contact information not available</p>
                )}
                <p className="text-xs text-white/50 mt-4">
                  This event was managed through Voxxy, but all event decisions including
                  cancellations are made by the event organizer.
                </p>
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen voxxy-gradient-page-cool">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Main Card Container */}
        <div className="voxxy-gradient-panel rounded-2xl border border-white/15 p-5 ring-1 ring-white/10 md:p-6">
          {/* Event Title and Location */}
          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-1">
              {event.title}
            </h1>
            <div className="flex items-center gap-1.5 text-foreground/60 text-xs">
              <MapPin className="w-3.5 h-3.5" />
              <span>{event.location}</span>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="py-4 border-t border-b border-border mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Venue */}
              {event.venue && (
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-violet-700 dark:text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground/60 text-[10px] mb-0.5">Venue</p>
                    <p className="text-foreground text-xs">{event.venue}</p>
                  </div>
                </div>
              )}

              {/* Tickets */}
              {(event.ticket_link || event.ticket_url) && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-violet-700 dark:text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground/60 text-[10px] mb-0.5">Tickets</p>
                    <a
                      href={normalizeUrl(event.ticket_link || event.ticket_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-800 hover:text-violet-950 dark:text-primary dark:hover:text-primary/70 text-sm transition-colors"
                    >
                      Buy Tickets
                    </a>
                  </div>
                </div>
              )}

              {/* Apply By */}
              {event.application_deadline && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-violet-700 dark:text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground/60 text-[10px] mb-0.5">Apply By</p>
                    <p className="text-foreground text-xs">
                      {new Date(event.application_deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Age */}
              {event.age_restriction && (
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-violet-700 dark:text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground/60 text-[10px] mb-0.5">Age</p>
                    <p className="text-foreground text-xs">{event.age_restriction}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* About This Event */}
          {event.description && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground mb-3">About This Event</h2>
              <p className="text-foreground/80 text-xs leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Application Categories */}
          {event.vendor_applications && event.vendor_applications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Application Categories</h2>

              {/* Map through all vendor applications */}
              <div className="space-y-3">
                {event.vendor_applications.map((application) => (
                  <div
                    key={application.id}
                    className="bg-background/5 border border-border rounded-lg p-4"
                  >
                    {/* Title Row - Price hidden for Pancakes & Booze pilot */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-foreground">{application.name}</h3>
                      {/* Price display commented out for pilot - payment handled via external integration */}
                      {/* <div className="text-right">
                      {application.booth_price && (
                        <>
                          <p className="text-xl font-bold text-violet-900 dark:text-primary">
                            ${Number(application.booth_price).toFixed(0)}
                          </p>
                          {event.application_deadline && (
                            <p className="text-foreground/60 text-[10px] mt-0.5">
                              Early bird: {new Date(event.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </>
                      )}
                    </div> */}
                    </div>

                    {/* Description */}
                    {application.description && (
                      <p className="text-foreground/80 text-xs mb-3 whitespace-pre-wrap">
                        {application.description}
                      </p>
                    )}

                    {/* Tags */}
                    {application.application_tags && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {application.application_tags.split(',').map((tag, idx) => (
                          <Badge key={idx} variant="tintPurple" className="px-2 py-0.5 text-[10px]">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Apply Now Button */}
                    <a
                      href={`/events/${event.slug}/apply/${application.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-5 py-2.5 rounded-lg voxxy-btn-cta font-semibold hover:opacity-90 transition-all text-sm"
                    >
                      Apply Now
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Powered by VOXXY */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-foreground/40 text-xs">
            <span>powered by</span>
            <img src="/VoxxyTriangle.svg" alt="Voxxy" className="w-4 h-4 opacity-60" />
            <span className="font-semibold">VOXXY</span>
          </div>
        </div>
      </div>
    </div>
  )
}
