import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Share2, AlertCircle } from 'lucide-react'
import { eventsApi, registrationsApi, eventInvitationsApi } from '@/services/api'
import {
  saveFormData,
  loadFormData,
  clearFormData,
  hasSavedData,
  getSavedDataTimestamp,
  retryWithBackoff,
  isRetryableError,
} from '@/utils/formPersistence'
import { buildTikTokUrl, buildWebsiteUrl, buildInstagramUrl } from '@/utils/inputSanitization'
import ReportBug from '@/components/ReportBug'
import FloatingBugButton from '@/components/FloatingBugButton'
import { Badge } from '@/components/ui/badge'
import { useForceTheme } from '@/hooks/useForceTheme'
import { VendorApplicationFormData } from '@/types/eventPortal'
import { validatePhone } from '@/utils/validation'

interface VendorApplication {
  id: number
  name: string
  description?: string
  categories: string[]
  booth_price?: number
  submissions_count?: number
  install?: {
    install_date?: string
    install_start_time?: string
    install_end_time?: string
  }
  payment_link?: string
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
  }
  location?: string
  poster_url?: string
  application_deadline?: string
  organization?: {
    id: number
    name: string
    email?: string
  }
  vendor_applications?: VendorApplication[]
}

export default function VendorApplicationForm() {
  useForceTheme('dark')
  // Use named parameters from React Router
  // Supports both namespaced format (org-slug-id/event-slug-id) and legacy (event-slug)
  const { slug, applicationId } = useParams<{ slug: string; applicationId: string }>()

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [application, setApplication] = useState<VendorApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [showRestorePrompt, setShowRestorePrompt] = useState(false)
  const [showBugReport, setShowBugReport] = useState(false)
  const [bugReportContext, setBugReportContext] = useState<any>(null)
  const [requiredFieldsFilled, setRequiredFieldsFilled] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const failedAttemptsRef = useRef(0)

  const [formData, setFormData] = useState<VendorApplicationFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    vendor_category: '',
    instagram_handle: '',
    tiktok_handle: '',
    facebook_handle: '',
    twitter_handle: '',
    website: '',
    note_to_host: '',
    agreed_to_terms: false,
    subscribed: true,
    affiliation: '',
  })

  useEffect(() => {
    const {
      first_name,
      last_name,
      email,
      phone,
      instagram_handle,
      website,
      twitter_handle,
      facebook_handle,
      tiktok_handle,
      agreed_to_terms,
    } = formData
    setRequiredFieldsFilled(
      !!(
        first_name &&
        last_name &&
        email &&
        phone &&
        agreed_to_terms &&
        (instagram_handle || website || twitter_handle || facebook_handle || tiktok_handle)
      ),
    )
  }, [formData])

  useEffect(() => {
    if (slug && applicationId) {
      fetchEvent(slug, applicationId)
    }
  }, [slug, applicationId])

  // Pre-fill form from invitation token (Pancakes & Booze pilot feature)
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      fetchPrefillData(token)
    }
  }, [searchParams])

  // Auto-set vendor_category to application name when application loads
  useEffect(() => {
    if (application?.name) {
      setFormData((prev) => ({ ...prev, vendor_category: application.name }))
    }
  }, [application])

  // Check for saved form data on mount
  useEffect(() => {
    if (slug && applicationId) {
      const formId = `vendor-app-${slug}-${applicationId}`
      if (hasSavedData(formId)) {
        setShowRestorePrompt(true)
      }
    }
  }, [slug, applicationId])

  // Auto-save form data every 30 seconds
  useEffect(() => {
    if (!slug || !applicationId) return

    const formId = `vendor-app-${slug}-${applicationId}`

    // Schedule auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      // Only save if form has been touched (not all defaults)
      const hasData = formData.first_name || formData.last_name || formData.email
      if (hasData) {
        saveFormData(formId, formData)
        console.log('[AutoSave] Form data saved')
      }
    }, 30000) // 30 seconds

    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [formData, slug, applicationId])

  const fetchEvent = async (eventSlug: string, appId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await eventsApi.getById(eventSlug)

      // Find the specific application by ID
      const specificApplication = data.vendor_applications?.find(
        (app: VendorApplication) => app.id === parseInt(appId),
      )

      if (!specificApplication) {
        setError('This vendor application is not available or has been closed.')
        return
      }

      setEvent(data)
      setApplication(specificApplication)
    } catch (err: any) {
      console.error('Failed to fetch event:', err)
      setError(err.message || 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const fetchPrefillData = async (token: string) => {
    try {
      console.log('Fetching prefill data for token:', token)
      const data = await eventInvitationsApi.getPrefillData(token)

      // Pre-fill form fields with vendor contact data
      setFormData((prev) => ({
        ...prev,
        email: data.email || prev.email,
        first_name: data.first_name || prev.first_name,
        last_name: data.last_name || prev.last_name,
      }))

      console.log('Form pre-filled with invitation data')
    } catch (err: any) {
      console.error('Failed to fetch prefill data:', err)
      // Don't show error to user - just silently fail prefill
      // User can still fill out form manually
    }
  }

  const restoreSavedData = () => {
    if (!slug || !applicationId) return

    const formId = `vendor-app-${slug}-${applicationId}`
    const saved = loadFormData(formId)

    if (saved) {
      // Restore all fields except internal metadata
      const { _timestamp, _formId, ...savedFormData } = saved
      setFormData((prev) => ({
        ...prev,
        ...savedFormData,
      }))
      console.log('[Restore] Form data restored from', getSavedDataTimestamp(formId))
    }

    setShowRestorePrompt(false)
  }

  const discardSavedData = () => {
    if (!slug || !applicationId) return

    const formId = `vendor-app-${slug}-${applicationId}`
    clearFormData(formId)
    setShowRestorePrompt(false)
    console.log('[Restore] Saved data discarded')
  }

  const handleShareLink = async () => {
    const shareUrl = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Apply to ${event?.title}`,
          text: `Check out this vendor application for ${event?.title}`,
          url: shareUrl,
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      }
    } catch (err) {
      console.error('Failed to share:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!application || !event) {
      setError('No vendor application found for this event')
      return
    }

    // Validation
    // extra check that all required fields are done before validating individual fields, to avoid overwhelming users with multiple error messages at once. specific field errors (like invalid phone) will show after this initial check that all required fields are filled.
    if (!requiredFieldsFilled) {
      setError('Please fill in all required fields')
      return
    }

    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid phone number')
      return
    }

    // Validate at least one social/portfolio link is provided
    const hasAtLeastOneLink =
      (formData.website && formData.website.trim()) ||
      (formData.instagram_handle && formData.instagram_handle.trim()) ||
      (formData.tiktok_handle && formData.tiktok_handle.trim()) ||
      (formData.facebook_handle && formData.facebook_handle.trim())

    if (!hasAtLeastOneLink) {
      setError('Please provide at least one link to your work (website or social media)')
      return
    }

    if (!formData.agreed_to_terms) {
      setError(
        'You must agree to the Privacy Policy and Terms of Service to submit your application',
      )
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setPhoneError(null)
      setRetryAttempt(0)

      // Submit with retry logic for network/server errors
      // to-do: validate/sanitize inputs before submitting, on change. currently relies on server-side validation to reject bad inputs, but would be better to catch common issues client-side before submission.
      const response = await retryWithBackoff(
        async () => {
          return await registrationsApi.submitVendorApplication(event.slug, {
            name: formData.first_name.concat(' ', formData.last_name).trim(),
            email: formData.email,
            phone: formData.phone,
            vendor_category: formData.vendor_category,
            vendor_application_id: Number(applicationId),
            subscribed: formData.subscribed,
            instagram_handle: buildInstagramUrl(formData.instagram_handle),
            tiktok_handle: buildTikTokUrl(formData.tiktok_handle),
            website: buildWebsiteUrl(formData.website),
            note_to_host: formData.note_to_host,
            affiliation: formData.affiliation,
          })
        },
        {
          maxAttempts: 3,
          baseDelay: 2000,
          maxDelay: 8000,
          onRetry: (attempt, error) => {
            setRetryAttempt(attempt)
            console.log(`[Retry] Attempt ${attempt}/3 failed:`, error)

            // Only retry if it's a retryable error
            if (!isRetryableError(error)) {
              throw error // Stop retrying for non-retryable errors
            }
          },
        },
      )

      // Clear saved form data on successful submission
      if (slug && applicationId) {
        const formId = `vendor-app-${slug}-${applicationId}`
        clearFormData(formId)
      }

      // Redirect to confirmation page with unique ticket code (falls back to shared application code)
      const confirmationCode = response.ticket_code || response.application_code
      navigate(`/applications/success?ticket_code=${confirmationCode}&event=${event.slug}`)
    } catch (err: any) {
      console.log('Failed to submit application:', err)

      // Check for errors array first (Rails validation errors), then fallback to message
      let errorMessage = err.errors?.[0] || err.message || 'Failed to submit application.'

      // Add context based on error type
      if (isRetryableError(err)) {
        errorMessage +=
          " We tried 3 times but couldn't connect to the server. Please check your internet connection and try again."
      } else if (err.status === 422) {
        errorMessage = 'Please check your form entries. ' + errorMessage
      } else if (err.status === 409) {
        errorMessage = 'You may have already applied. ' + errorMessage
      }

      setError(errorMessage)
      setRetryAttempt(0)

      // Track failed attempts and auto-show bug report after 3 failures
      failedAttemptsRef.current += 1
      if (failedAttemptsRef.current >= 3) {
        // Auto-show bug report modal
        setBugReportContext({
          errorMessage,
          componentName: 'VendorApplicationForm',
          formData: {
            ...formData,
            // Don't include sensitive data in bug report
            agreed_to_terms: undefined,
          },
        })
        setShowBugReport(true)
        failedAttemptsRef.current = 0 // Reset counter
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Unable to Load Application</h1>
          <p className="text-foreground/60 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg voxxy-btn-cta transition-all"
          >
            Back to Voxxy
          </button>
        </div>
      </div>
    )
  }

  // Check if event is cancelled
  if (event?.status?.status === 'cancelled') {
    return (
      <div className="min-h-screen voxxy-gradient-page-cool">
        <div className="max-w-3xl mx-auto px-4 py-12">
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
              This event has been cancelled by the event organizer. Applications are no longer being
              accepted. If you submitted payment, you will be contacted regarding refund details.
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
      {/* Header */}
      <div className="voxxy-nav-surface border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                Apply to {event?.title}
              </h1>
              <p className="text-foreground/60 text-xs md:text-sm">{event?.location}</p>{' '}
            </div>
            <button
              onClick={handleShareLink}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/5 hover:bg-background/10 border border-border text-foreground/70 hover:text-foreground transition-all text-sm"
              title="Share this application"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Restore Saved Data Prompt */}
        {showRestorePrompt && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Resume Your Application?
                </h3>
                <p className="text-xs text-foreground/70 mb-3">
                  We found a previously saved version of your application from{' '}
                  {getSavedDataTimestamp(`vendor-app-${slug}-${applicationId}`)}. Would you like to
                  continue where you left off?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={restoreSavedData}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-950 dark:text-blue-300 text-xs font-medium transition-all"
                  >
                    Restore My Data
                  </button>
                  <button
                    onClick={discardSavedData}
                    className="px-3 py-1.5 rounded-lg bg-background/5 hover:bg-background/10 border border-border text-foreground/70 text-xs transition-all"
                  >
                    Start Fresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Details Card */}
        <div className="voxxy-application-highlight p-4 mb-6">
          <p className="text-foreground/60 text-[10px] mb-0.5">Applying for</p>
          <h2 className="text-lg font-bold text-foreground mb-2">
            {application?.name || 'Vendor Application'}
          </h2>

          {application?.description && (
            <p className="text-foreground/80 text-xs mb-3 whitespace-pre-wrap">
              {application.description}
            </p>
          )}

          {/* Tags */}
          {application?.application_tags && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {application.application_tags.split(',').map((tag, idx) => (
                <Badge key={idx} variant="tintPurple" className="px-2 py-0.5 text-[10px]">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}

          {/* Price - Hidden for Pancakes & Booze pilot (payment handled via external integration) */}
          {/* {application?.booth_price && (
            <div className="mt-3 pt-3 border-t border-border">
              <div>
                <p className="text-foreground/60 text-[10px] mb-0.5">Booth Price</p>
                <p className="text-2xl font-bold text-primary">
                  ${Number(application.booth_price).toFixed(0)}
                </p>
              </div>
            </div>
          )} */}
        </div>

        {/* Application Form */}
        <div className="rounded-xl border border-white/15 bg-card/90 shadow-lg backdrop-blur-md dark:bg-card/70 dark:border-white/12 p-4 md:p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Your Information */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    First Name <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Your first name"
                    className="voxxy-input-frost w-full px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-ring/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Last Name <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Your last name"
                    className="voxxy-input-frost w-full px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-ring/40"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Email <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="voxxy-input-frost w-full px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-ring/40"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Phone Number <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="voxxy-input-frost w-full px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-ring/40"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Social & Portfolio (One Link Required) */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">
                Social & Portfolio <span className="text-red-600 dark:text-red-400">*</span>
                <span className="text-xs font-normal text-foreground/60 ml-2">
                  (One Link Required)
                </span>
              </h3>

              {/* Row 1: Website and Instagram */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Link to your work */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Link to your work
                  </label>
                  <div className="voxxy-input-frost-group">
                    <div className="voxxy-input-frost-prefix">https://</div>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="yoursite.com"
                      className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Instagram
                  </label>
                  <div className="voxxy-input-frost-group">
                    <div className="voxxy-input-frost-prefix">instagram.com/</div>
                    <input
                      type="text"
                      value={formData.instagram_handle}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram_handle: e.target.value })
                      }
                      placeholder="yourhandle"
                      className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: TikTok and Facebook */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* TikTok */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">TikTok</label>
                  <div className="voxxy-input-frost-group">
                    <div className="voxxy-input-frost-prefix">tiktok.com/@</div>
                    <input
                      type="text"
                      value={formData.tiktok_handle}
                      onChange={(e) => setFormData({ ...formData, tiktok_handle: e.target.value })}
                      placeholder="yourhandle"
                      className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                    />
                  </div>
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Facebook
                  </label>
                  <div className="voxxy-input-frost-group">
                    <div className="voxxy-input-frost-prefix">facebook.com/</div>
                    <input
                      type="text"
                      value={formData.facebook_handle}
                      onChange={(e) =>
                        setFormData({ ...formData, facebook_handle: e.target.value })
                      }
                      placeholder="yourpage"
                      className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Note to Host (Optional) */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Note to Host (Optional)
              </label>
              <textarea
                value={formData.note_to_host}
                onChange={(e) => setFormData({ ...formData, note_to_host: e.target.value })}
                placeholder="Tell the event organizer about your products, experience, or anything else you'd like them to know..."
                rows={3}
                className="voxxy-input-frost w-full px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-ring/40 resize-none"
              />
            </div>

            {/* Studio/Gallery/Business Affiliation(Optional) */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Studio/Gallery/Business Affiliation (Optional)
              </label>
              <textarea
                value={formData.affiliation}
                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                placeholder="Tell the event organizer about your studio, gallery, or business affiliation..."
                rows={3}
                className="voxxy-input-frost w-full px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-ring/40 resize-none"
              />
            </div>

            {/* Permissions & Preferences */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">
                Permissions & Preferences
              </h3>
              <div className="space-y-2.5">
                {/* Terms Agreement */}
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="agreed_to_terms"
                    checked={formData.agreed_to_terms}
                    onChange={(e) =>
                      setFormData({ ...formData, agreed_to_terms: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 rounded border-border bg-background/10 text-primary focus:ring-primary"
                    required
                  />
                  <label
                    htmlFor="agreed_to_terms"
                    className="text-xs text-foreground/90 dark:text-foreground/80"
                  >
                    I agree to the{' '}
                    <a
                      href="/legal/privacy"
                      className="text-violet-800 hover:text-violet-950 dark:text-primary dark:hover:text-primary/70 underline transition-colors"
                    >
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a
                      href="/legal/acceptable-use"
                      className="text-violet-800 hover:text-violet-950 dark:text-primary dark:hover:text-primary/70 underline transition-colors"
                    >
                      Acceptable Use Policy
                    </a>{' '}
                    <span className="text-red-600 dark:text-red-400">*</span>
                    <p className="text-foreground/60 text-[10px] mt-0.5">
                      Your information will be shared with the event organizer for this application.
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-800 dark:text-red-400 text-xs">{error}</p>
              </div>
            )}
            {phoneError && <p className="text-red-800 dark:text-red-400 text-xs">{phoneError}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!requiredFieldsFilled || submitting}
              className="w-full px-5 py-3 rounded-lg voxxy-btn-cta font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                  <span>
                    {retryAttempt > 0 ? `Retrying (${retryAttempt}/3)...` : 'Submitting...'}
                  </span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                </>
              )}
            </button>

            {/* Auto-save Indicator */}
            <p className="text-center text-xs text-foreground/50 dark:text-foreground/40">
              Your progress is automatically saved every 30 seconds
            </p>
          </form>
        </div>

        {/* Powered by VOXXY */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-foreground/55 dark:text-foreground/40 text-sm">
            <span>powered by</span>
            <img src="/VoxxyTriangle.svg" alt="Voxxy" className="w-4 h-4 opacity-60" />
            <span className="font-semibold">VOXXY</span>
          </div>
        </div>
      </div>

      {/* Floating Bug Report Button */}
      <FloatingBugButton onClick={() => setShowBugReport(true)} />

      {/* Bug Report Modal */}
      <ReportBug
        isOpen={showBugReport}
        onClose={() => {
          setShowBugReport(false)
          setBugReportContext(null)
        }}
        errorContext={bugReportContext}
        autoShow={!!bugReportContext}
      />
    </div>
  )
}
