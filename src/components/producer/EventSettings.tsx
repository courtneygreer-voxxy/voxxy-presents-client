import { useState, useEffect } from 'react'
import {
  Trash2,
  FileText,
  Edit,
  Link,
  ExternalLink,
  Check,
  X,
  Plus,
  Copy,
  AlertCircle,
  DollarSign,
  Save,
  Webhook,
} from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  vendorApplicationsApi,
  registrationsApi,
  eventInvitationsApi,
  eventsApi,
} from '@/services/api'
import CreateApplicationForm from './CreateApplicationForm'
import Step3PaymentConfig from './CreateEventWizard/steps/Step3PaymentConfig'
import {
  WizardState,
  ApplicationRow,
  PaymentEngineConfig,
  CurrencyCode,
} from './CreateEventWizard/types'
import { formatDateForInput, formatEventDate } from '@/utils/dateHelpers'
import { DebugPanel } from './DebugPanel'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { useAuth } from '@/hooks/useAuth'

interface Event {
  id: number
  slug: string
  namespaced_slug?: string
  title: string
  description?: string
  event_date?: string
  event_end_date?: string
  start_time?: string
  end_time?: string
  venue?: string
  location?: string
  application_deadline?: string
  payment_deadline?: string
  vendor_fee_currency?: string
  payment_engines?: PaymentEngineConfig[]
  ticket_link?: string
  age_restriction?: string
  status?: {
    published?: boolean
    registration_open?: boolean
    status?: 'draft' | 'published' | 'cancelled' | 'completed'
    is_live?: boolean
  }
  published?: boolean
  capacity?: {
    total?: number
    registered?: number
    remaining?: number
    is_full?: boolean
  }
  event_portal?: {
    access_token: string
    view_count: number
  }
}

interface VendorApplication {
  id: number
  name: string
  description?: string
  status: 'active' | 'inactive'
  categories: string[]
  submissions_count: number
  shareable_code: string
  shareable_url: string
  created_at: string
  updated_at: string
  pricing?: {
    booth_price: number
    currency: string
  }
  install_date?: string
  install_start_time?: string
  install_end_time?: string
  payment_link?: string
  payment_prices?: any[]
  payment_engines?: PaymentEngineConfig[]
  eventbrite_event_id?: string
  application_tags?: string
  category_id?: number
  category_color?: string
  category_icon?: string
}

interface EventSettingsProps {
  event: Event
  onUpdate?: (eventSlug: string, updates: any) => Promise<void>
  onDelete?: (eventSlug: string) => Promise<void>
  isAdmin?: boolean
}

type View = 'settings' | 'create_app'

export default function EventSettings({ event, onUpdate, onDelete, isAdmin }: EventSettingsProps) {
  const { currentUser } = useAuth()
  const [currentView, setCurrentView] = useState<View>('settings')
  const [applications, setApplications] = useState<VendorApplication[]>([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  // Payment configuration state (adapter for Step3PaymentConfig)
  const [paymentWizardState, setPaymentWizardState] = useState<WizardState | null>(null)
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({})
  const [savingPayment, setSavingPayment] = useState(false)
  const [paymentDirty, setPaymentDirty] = useState(false)

  // Helper to get the current event status in UI format
  const getCurrentStatusForUI = () => {
    return event.status?.is_live ? 'live' : event.status?.status || 'draft'
  }

  const handleCopyLink = (url: string, label: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(label)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  // Event details edit state
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [eventFormData, setEventFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    event_date: formatDateForInput(event.event_date) || '',
    event_end_date: formatDateForInput(event.event_end_date) || '',
    start_time: event.start_time || '',
    end_time: event.end_time || '',
    venue: event.venue || '',
    location: event.location || '',
    application_deadline: formatDateForInput(event.application_deadline) || '',
    payment_deadline: formatDateForInput(event.payment_deadline) || '',
  })

  // Inline application editing state
  const [editingAppId, setEditingAppId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    booth_price: 0,
    install_date: '',
    install_start_time: '',
    install_end_time: '',
    payment_link: '',
    status: 'active' as 'active' | 'inactive',
  })
  const [editTags, setEditTags] = useState<string[]>([])
  const [editNewTag, setEditNewTag] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Event status management state
  // Display "live" when event is live (is_live=true), otherwise show the actual status
  const [eventStatus, setEventStatus] = useState<string>(getCurrentStatusForUI())
  const [savingStatus, setSavingStatus] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellingEvent, setCancellingEvent] = useState(false)
  const [recipientCount, setRecipientCount] = useState(0)
  const [eventJustCancelled, setEventJustCancelled] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [event.slug])

  const fetchApplications = async () => {
    try {
      setLoadingApps(true)
      const data = await vendorApplicationsApi.getByEvent(event.slug)
      setApplications(data)
    } catch (err: any) {
      console.error('Failed to fetch applications:', err)
    } finally {
      setLoadingApps(false)
    }
  }

  // Build payment wizard state from applications when they load
  useEffect(() => {
    if (applications.length === 0) return

    const appRows: ApplicationRow[] = applications.map((app) => ({
      id: String(app.id),
      category_id: app.category_id || 0,
      category_name: app.name,
      category_color: app.category_color,
      category_icon: app.category_icon,
      name: app.name,
      booth_price: app.pricing?.booth_price || 0,
      description: app.description || '',
      install_date: app.install_date,
      install_start_time: app.install_start_time,
      install_end_time: app.install_end_time,
      payment_link: app.payment_link || '',
      application_tags: app.application_tags
        ? app.application_tags.split(',').map((t) => t.trim())
        : [],
      payment_prices:
        app.payment_prices && app.payment_prices.length > 0
          ? app.payment_prices
          : [
              {
                type: 'booth_price' as const,
                label: 'Booth Fee',
                amount: app.pricing?.booth_price || 0,
                is_percentage: false,
              },
            ],
      payment_engines: app.payment_engines || [],
    }))

    setPaymentWizardState({
      currentStep: 3,
      eventDetails: {
        title: event.title,
        description: event.description || '',
        event_date: event.event_date || '',
        event_end_date: event.event_end_date,
        start_time: event.start_time,
        end_time: event.end_time,
        venue: event.venue,
        location: event.location || '',
        application_deadline: event.application_deadline || '',
      },
      applicationDetails: { applications: appRows },
      paymentConfiguration: {
        currency: (event.vendor_fee_currency as CurrencyCode) || 'USD',
        payment_deadline: event.payment_deadline || '',
        payment_engines: event.payment_engines || [],
      },
      automaticMessages: { messages: [] },
      inviteList: { selectedListIds: [], invitedContactIds: [], excludedContactIds: [] },
    })
    setPaymentDirty(false)
  }, [applications])

  const updatePaymentWizardState = (updates: Partial<WizardState>) => {
    setPaymentWizardState((prev) => (prev ? { ...prev, ...updates } : prev))
    setPaymentDirty(true)
  }

  const handleSavePaymentConfig = async () => {
    if (!paymentWizardState) return
    setSavingPayment(true)
    try {
      // Save event-level payment config (currency, engines, deadline)
      const { paymentConfiguration } = paymentWizardState
      await eventsApi.update(event.slug, {
        payment_deadline: paymentConfiguration.payment_deadline,
        vendor_fee_currency: paymentConfiguration.currency,
        payment_engines: paymentConfiguration.payment_engines,
      })

      // Save per-application payment prices
      for (const app of paymentWizardState.applicationDetails.applications) {
        const appId = parseInt(app.id)
        if (isNaN(appId)) continue
        await vendorApplicationsApi.update(appId, {
          payment_prices: app.payment_prices,
          payment_link: app.payment_link,
          booth_price: app.booth_price,
        })
      }

      setPaymentDirty(false)
      toast.success('Payment configuration saved')
    } catch (err) {
      console.error('Failed to save payment config:', err)
      toast.error('Failed to save payment configuration')
    } finally {
      setSavingPayment(false)
    }
  }

  const handleSaveEventDetails = async () => {
    if (!onUpdate) {
      alert('Event details will be saved')
      return
    }

    try {
      setIsSaving(true)
      await onUpdate(event.slug, eventFormData)
      setIsEditingDetails(false)
      alert('Event details saved successfully!')
    } catch (err) {
      console.error('Failed to save event details:', err)
      alert('Failed to save event details. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEditDetails = () => {
    setEventFormData({
      title: event.title || '',
      description: event.description || '',
      event_date: formatDateForInput(event.event_date) || '',
      event_end_date: formatDateForInput(event.event_end_date) || '',
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      venue: event.venue || '',
      location: event.location || '',
      application_deadline: formatDateForInput(event.application_deadline) || '',
      payment_deadline: formatDateForInput(event.payment_deadline) || '',
    })
    setIsEditingDetails(false)
  }

  const handleDeleteEvent = async () => {
    if (!onDelete) {
      alert('Event will be deleted')
      return
    }

    try {
      await onDelete(event.namespaced_slug || event.slug)
      setShowDeleteConfirm(false)
    } catch (err) {
      console.error('Failed to delete event:', err)
      alert('Failed to delete event. Please try again.')
    }
  }

  const handleSaveEventStatus = async () => {
    if (!onUpdate) {
      toast.error('Unable to update event status')
      return
    }

    // Special handling for cancellation - show confirmation modal
    if (eventStatus === 'cancelled' && event.status?.status !== 'cancelled') {
      try {
        // Fetch recipient count for the modal
        const data = await eventsApi.checkCancellationImpact(event.namespaced_slug || event.slug)
        setRecipientCount(data.recipient_count || 0)
        setShowCancelModal(true)
      } catch (err) {
        console.error('Failed to check cancellation impact:', err)
        toast.error('Failed to prepare cancellation')
      }
      return
    }

    // For non-cancellation status changes, save normally
    try {
      setSavingStatus(true)
      // Convert "live" to "published" for backend compatibility
      const backendStatus = eventStatus === 'live' ? 'published' : eventStatus
      await onUpdate(event.namespaced_slug || event.slug, { status: backendStatus })
      toast.success('Event status updated')
    } catch (err) {
      console.error('Failed to save event status:', err)
      toast.error('Failed to save event status')
    } finally {
      setSavingStatus(false)
    }
  }

  const handleConfirmCancellation = async () => {
    try {
      setCancellingEvent(true)
      setSavingStatus(true)

      // Send cancellation emails - backend will also update status to 'cancelled'
      const result = await eventsApi.sendCancellationEmails(event.namespaced_slug || event.slug)

      // Close modal
      setShowCancelModal(false)

      // Notify parent to refresh event data from backend
      // The backend has already updated the status to 'cancelled' via sendCancellationEmails,
      // so this onUpdate call will fetch the fresh data and update parent component state
      if (onUpdate) {
        await onUpdate(event.namespaced_slug || event.slug, { status: 'cancelled' })
      }

      // Update local UI state (provides immediate feedback while parent refreshes)
      setEventStatus('cancelled')
      setEventJustCancelled(true) // Mark as cancelled in this session

      // Show success toast
      toast.success(
        `Event cancelled. ${result.sent_count} vendor${result.sent_count !== 1 ? 's' : ''} notified.`,
      )
    } catch (err) {
      console.error('Failed to cancel event:', err)
      toast.error('Failed to cancel event')
    } finally {
      setCancellingEvent(false)
      setSavingStatus(false)
    }
  }

  const handleApplicationSuccess = () => {
    fetchApplications()
    setCurrentView('settings')
  }

  const startEditing = (app: VendorApplication) => {
    setEditingAppId(app.id)
    setEditFormData({
      name: app.name || '',
      description: app.description || '',
      booth_price: app.pricing?.booth_price || 0,
      install_date: formatDateForInput(app.install_date) || '',
      install_start_time: app.install_start_time || '',
      install_end_time: app.install_end_time || '',
      payment_link: app.payment_link || '',
      status: app.status || 'active',
    })
    setEditTags(
      app.application_tags
        ? app.application_tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t)
        : [],
    )
    setEditNewTag('')
    setEditError(null)
  }

  const handleCancelInlineEdit = () => {
    setEditingAppId(null)
    setEditError(null)
  }

  const handleSaveInlineEdit = async () => {
    if (!editFormData.name.trim()) {
      setEditError('Application name is required')
      return
    }
    if (editFormData.booth_price < 0) {
      setEditError('Booth price must be $0 or greater')
      return
    }

    try {
      setEditLoading(true)
      setEditError(null)
      await vendorApplicationsApi.update(editingAppId!, {
        name: editFormData.name.trim(),
        description: editFormData.description.trim() || undefined,
        booth_price: editFormData.booth_price,
        status: editFormData.status,
        install_date: editFormData.install_date || undefined,
        install_start_time: editFormData.install_start_time || undefined,
        install_end_time: editFormData.install_end_time || undefined,
        payment_link: editFormData.payment_link || undefined,
        application_tags: editTags.length > 0 ? editTags.join(',') : undefined,
      })
      setEditingAppId(null)
      fetchApplications()
    } catch (err: any) {
      console.error('Failed to save application:', err)
      setEditError(err.message || 'Failed to save application')
    } finally {
      setEditLoading(false)
    }
  }

  const handleAddEditTag = () => {
    const trimmed = editNewTag.trim()
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags([...editTags, trimmed])
      setEditNewTag('')
    }
  }

  const handleExportInvitesCSV = async () => {
    try {
      console.log('🔍 === CSV Export Debug ===')
      console.log('Event slug:', event.slug)

      // Fetch all invitations and registrations
      let invitationsResponse: any = { invitations: [] }
      let registrations: any = { vendor_registrations: [] }

      try {
        invitationsResponse = await eventInvitationsApi.getByEvent(event.slug, 1, 1000)
        console.log('📨 Invitations API Response:', {
          count: invitationsResponse?.invitations?.length || 0,
          sampleInvitation: invitationsResponse?.invitations?.[0] || 'none',
          allFieldsInSample: invitationsResponse?.invitations?.[0]
            ? Object.keys(invitationsResponse.invitations[0])
            : [],
        })
      } catch (err) {
        console.warn('No invitations found or error fetching invitations:', err)
      }

      try {
        registrations = await registrationsApi.getByEvent(event.slug)
        console.log('📝 Registrations API Response:', {
          count: registrations?.vendor_registrations?.length || 0,
          sampleRegistration: registrations?.vendor_registrations?.[0] || 'none',
          allFieldsInSample: registrations?.vendor_registrations?.[0]
            ? Object.keys(registrations.vendor_registrations[0])
            : [],
        })
      } catch (err) {
        console.warn('No registrations found or error fetching registrations:', err)
      }

      // Combine and format data for CSV
      const csvData: any[] = []

      // Add invitations
      const invitations = invitationsResponse?.invitations || []
      invitations.forEach((inv: any) => {
        const csvRow = {
          name: inv.contact_name || inv.name || '',
          email: inv.contact_email || inv.email || '',
          business_name: inv.business_name || '',
          category: inv.vendor_category || '',
          status: 'Invited',
          invited_at: inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '',
          applied: 'No',
          application_date: '',
          application_status: '',
          payment_status: '',
        }
        csvData.push(csvRow)
      })
      console.log(`✅ Processed ${invitations.length} invitations`)

      // Add registrations (applications)
      const registrationList = registrations?.vendor_registrations || []
      registrationList.forEach((reg: any) => {
        const csvRow = {
          name: reg.name || '',
          email: reg.email || '',
          business_name: reg.business_name || '',
          category: reg.vendor_category || '',
          status: 'Applied',
          invited_at: '',
          applied: 'Yes',
          application_date: reg.created_at ? new Date(reg.created_at).toLocaleDateString() : '',
          application_status: reg.status || '',
          payment_status: reg.payment_status || '',
        }
        csvData.push(csvRow)
      })
      console.log(`✅ Processed ${registrationList.length} registrations`)

      console.log('📊 CSV Data Summary:', {
        totalRows: csvData.length,
        sampleRows: csvData.slice(0, 3),
        emptyFields: csvData
          .map((row) => ({
            name: !row.name,
            email: !row.email,
            business_name: !row.business_name,
            category: !row.category,
          }))
          .filter((row) => row.name || row.email || row.business_name || row.category).length,
      })

      // Convert to CSV
      if (csvData.length === 0) {
        alert('No data to export')
        return
      }

      const headers = [
        'Name',
        'Email',
        'Business Name',
        'Category',
        'Status',
        'Invited At',
        'Applied',
        'Application Date',
        'Application Status',
        'Payment Status',
      ]
      const csvContent = [
        headers.join(','),
        ...csvData.map((row) =>
          [
            `"${row.name}"`,
            `"${row.email}"`,
            `"${row.business_name}"`,
            `"${row.category}"`,
            `"${row.status}"`,
            `"${row.invited_at}"`,
            `"${row.applied}"`,
            `"${row.application_date}"`,
            `"${row.application_status}"`,
            `"${row.payment_status}"`,
          ].join(','),
        ),
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `${event.slug}-invites-and-applications-${new Date().toISOString().split('T')[0]}.csv`,
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      console.error('Failed to export CSV:', err)
      alert('Failed to export CSV: ' + (err.message || 'Unknown error'))
    }
  }

  // Generate public event page URL using namespaced slug
  const eventPageLink = `${window.location.origin}/events/${event.namespaced_slug || event.slug}`
  const portalLink = `${window.location.origin}/portal/${event.namespaced_slug || event.slug}`

  const inputClasses = cn(
    'voxxy-input-frost w-full rounded-lg px-3 py-2 text-sm',
    'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40',
  )

  const sectionShell = cn('glass-card rounded-2xl overflow-hidden shadow-sm')

  const innerGlassWell = cn('voxxy-surface-subtle rounded-xl p-4 shadow-sm')

  const compactWell = cn('voxxy-surface-subtle rounded-lg p-3')

  const triggerHoverClass =
    'voxxy-hover-row px-4 hover:no-underline hover:bg-accent/40 dark:hover:bg-background/10'
  const subtleButtonClass =
    'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
  const utilityActionClass =
    'voxxy-hover-row flex items-center gap-1 rounded px-2 py-1 text-[11px] transition-colors hover:bg-accent/60 dark:hover:bg-background/10'

  // Show create form
  if (currentView === 'create_app') {
    return (
      <CreateApplicationForm
        event={{
          slug: event.slug,
          title: event.title,
          event_date: event.event_date,
          location: event.location,
        }}
        onBack={() => setCurrentView('settings')}
        onSuccess={handleApplicationSuccess}
      />
    )
  }

  return (
    <div className="px-3 md:px-4 max-w-6xl mx-auto space-y-4">
      {/* Accordion Sections */}
      <div className={sectionShell}>
        <Accordion type="multiple" defaultValue={['event-status', 'event-details']}>
          {/* Event Status Section */}
          <AccordionItem value="event-status" className="border-border">
            <AccordionTrigger className={triggerHoverClass}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/20">
                  <AlertCircle className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-foreground">Event Status</span>
                  <p className="text-xs text-muted-foreground font-normal">
                    Manage event lifecycle and cancellation
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className={cn(innerGlassWell, 'border border-blue-500/20')}>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Current Status</p>
                    {event.status?.status === 'cancelled' ? (
                      <div className="space-y-2">
                        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-foreground text-sm">
                          ❌ Cancelled (Locked)
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          Event cancellation is permanent and cannot be reversed.
                        </p>
                      </div>
                    ) : (
                      <>
                        <select
                          value={eventStatus}
                          onChange={(e) => setEventStatus(e.target.value)}
                          className={cn(inputClasses, 'bg-card/80 border-border text-foreground')}
                        >
                          {!event.status?.is_live && <option value="draft">Draft</option>}
                          {event.status?.is_live && <option value="live">Live</option>}
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>

                        {!event.status?.is_live && (
                          <p className="text-xs text-muted-foreground italic mt-2">
                            💡 To go live, go to the dashboard and review invitations / go live
                          </p>
                        )}

                        {event.status?.is_live && (
                          <p className="text-xs text-muted-foreground italic mt-2">
                            ℹ️ This event has gone live and invitations have been sent. It cannot be
                            reverted to draft status.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className={compactWell}>
                    <p className="text-xs text-foreground/80">
                      {eventStatus === 'draft' &&
                        '📝 Draft: Invites not sent, scheduled emails paused. Vendors can still apply if they have the link.'}
                      {eventStatus === 'live' &&
                        '✅ Live: Invites sent, scheduled emails active, event is publicly visible.'}
                      {eventStatus === 'cancelled' &&
                        '❌ Cancelled: Event has been cancelled. Vendors will be notified.'}
                      {eventStatus === 'completed' && '✓ Completed: Event has concluded.'}
                    </p>
                  </div>

                  {eventStatus === 'cancelled' && event.status?.status !== 'cancelled' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-xs text-yellow-900 dark:text-yellow-200 font-medium mb-1">
                        ⚠️ Cancellation Notice
                      </p>
                      <p className="text-xs text-yellow-900/80 dark:text-yellow-200/80">
                        When you save this status change, you will be prompted to send cancellation
                        emails to all registered vendors.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveEventStatus}
                      disabled={
                        savingStatus ||
                        cancellingEvent ||
                        eventJustCancelled ||
                        eventStatus === getCurrentStatusForUI()
                      }
                      className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingStatus || cancellingEvent ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {cancellingEvent ? 'Cancelling...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Save Status
                        </>
                      )}
                    </button>
                    {eventStatus !== getCurrentStatusForUI() && (
                      <button
                        onClick={() => setEventStatus(getCurrentStatusForUI())}
                        type="button"
                        className={subtleButtonClass}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Event Details Section */}
          <AccordionItem value="event-details" className="border-border">
            <AccordionTrigger className={triggerHoverClass}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/20">
                  <Edit className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-foreground">Event Details</span>
                  <p className="text-xs text-foreground/50 font-normal">
                    Manage basic event information
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className={innerGlassWell}>
                {!isEditingDetails ? (
                  <>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-foreground/60 mb-0.5">Event Title</p>
                          <p className="text-sm text-foreground">{event.title}</p>
                        </div>
                        <div>
                          <p className="text-xs text-foreground/60 mb-0.5">Venue</p>
                          <p className="text-sm text-foreground">{event.venue || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-foreground/60 mb-0.5">Location</p>
                          <p className="text-sm text-foreground">{event.location || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-foreground/60 mb-0.5">Event Date</p>
                          <p className="text-sm text-foreground">
                            {event.event_date
                              ? formatEventDate(event.event_date, 'MMM d, yyyy')
                              : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-foreground/60 mb-0.5">Application Deadline</p>
                          <p className="text-sm text-foreground">
                            {event.application_deadline
                              ? formatEventDate(event.application_deadline, 'MMM d, yyyy')
                              : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-foreground/60 mb-0.5">Payment Deadline</p>
                          <p className="text-sm text-foreground">
                            {event.payment_deadline
                              ? formatEventDate(event.payment_deadline, 'MMM d, yyyy')
                              : '—'}
                          </p>
                        </div>
                      </div>
                      {event.description && (
                        <div>
                          <p className="text-xs text-foreground/60 mb-0.5">Description</p>
                          <p className="text-foreground text-sm">{event.description}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => setIsEditingDetails(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg voxxy-btn-solid transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit Details
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                          Event Title *
                        </label>
                        <input
                          type="text"
                          value={eventFormData.title}
                          onChange={(e) =>
                            setEventFormData({ ...eventFormData, title: e.target.value })
                          }
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                          Description
                        </label>
                        <textarea
                          value={eventFormData.description}
                          onChange={(e) =>
                            setEventFormData({ ...eventFormData, description: e.target.value })
                          }
                          rows={3}
                          className={inputClasses}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                            Venue
                          </label>
                          <input
                            type="text"
                            value={eventFormData.venue}
                            onChange={(e) =>
                              setEventFormData({ ...eventFormData, venue: e.target.value })
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={eventFormData.location}
                            onChange={(e) =>
                              setEventFormData({ ...eventFormData, location: e.target.value })
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                            Event Date
                          </label>
                          <input
                            type="date"
                            value={eventFormData.event_date}
                            onChange={(e) =>
                              setEventFormData({ ...eventFormData, event_date: e.target.value })
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={eventFormData.event_end_date}
                            onChange={(e) =>
                              setEventFormData({ ...eventFormData, event_end_date: e.target.value })
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={eventFormData.start_time}
                            onChange={(e) =>
                              setEventFormData({ ...eventFormData, start_time: e.target.value })
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={eventFormData.end_time}
                            onChange={(e) =>
                              setEventFormData({ ...eventFormData, end_time: e.target.value })
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                            Application Deadline
                          </label>
                          <input
                            type="date"
                            value={eventFormData.application_deadline}
                            onChange={(e) =>
                              setEventFormData({
                                ...eventFormData,
                                application_deadline: e.target.value,
                              })
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                            Payment Deadline
                          </label>
                          <input
                            type="date"
                            value={eventFormData.payment_deadline}
                            onChange={(e) =>
                              setEventFormData({
                                ...eventFormData,
                                payment_deadline: e.target.value,
                              })
                            }
                            className={inputClasses}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleSaveEventDetails}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg voxxy-btn-solid transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-border border-t-primary rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEditDetails}
                        disabled={isSaving}
                        className={subtleButtonClass}
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Application Settings Section */}
          <AccordionItem value="applications" className="border-border">
            <AccordionTrigger className={triggerHoverClass}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/20 p-1.5">
                  <FileText className="h-4 w-4 text-orange-800 dark:text-orange-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-foreground">
                    Application Settings
                  </span>
                  <p className="text-xs text-foreground/50 font-normal">
                    Control which categories are accepting applications
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              {/* Category Controls */}
              <div className="space-y-3">
                <p className="text-foreground/60 text-xs uppercase tracking-wide font-semibold">
                  Category Controls
                </p>

                {loadingApps ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : applications.length === 0 ? (
                  <div className={`${innerGlassWell} text-center`}>
                    <FileText className="w-10 h-10 text-foreground/40 mx-auto mb-2" />
                    <p className="text-foreground/60 text-sm mb-3">
                      No application categories created yet
                    </p>
                    <button
                      onClick={() => setCurrentView('create_app')}
                      className="px-4 py-2 text-sm rounded-lg voxxy-btn-cta font-semibold hover:shadow-lg transition-all"
                    >
                      Create First Category
                    </button>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className={cn(
                        innerGlassWell,
                        'voxxy-hover-panel hover:border-primary/35 transition-all',
                      )}
                    >
                      {/* Category Row */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-0.5">
                            <h4 className="text-sm text-foreground font-semibold">{app.name}</h4>
                            <span
                              className={`text-[10px] font-medium ${app.status === 'active' ? 'text-emerald-800 dark:text-green-400' : 'text-muted-foreground'}`}
                            >
                              {app.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-foreground/60 text-xs">
                            {app.submissions_count}{' '}
                            {app.submissions_count === 1 ? 'application' : 'applications'}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            editingAppId === app.id ? handleCancelInlineEdit() : startEditing(app)
                          }
                          className="flex items-center gap-2 rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-foreground transition-all hover:bg-card dark:bg-background/20 dark:hover:bg-background/30"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span className="text-xs">
                            {editingAppId === app.id ? 'Cancel' : 'Edit'}
                          </span>
                        </button>
                      </div>

                      {/* Inline Edit Form */}
                      {editingAppId === app.id && (
                        <div className="border-t border-primary/20 p-4 space-y-3">
                          {editError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                              <p className="text-xs text-red-800 dark:text-red-400">{editError}</p>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                              Category Name *
                            </label>
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, name: e.target.value })
                              }
                              className={inputClasses}
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                              Description
                            </label>
                            <textarea
                              value={editFormData.description}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, description: e.target.value })
                              }
                              rows={2}
                              className={inputClasses}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                                Install Date
                              </label>
                              <input
                                type="date"
                                value={editFormData.install_date}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, install_date: e.target.value })
                                }
                                className={inputClasses}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                                Install Start
                              </label>
                              <input
                                type="time"
                                value={editFormData.install_start_time}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    install_start_time: e.target.value,
                                  })
                                }
                                className={inputClasses}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                                Install End
                              </label>
                              <input
                                type="time"
                                value={editFormData.install_end_time}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    install_end_time: e.target.value,
                                  })
                                }
                                className={inputClasses}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                                Payment Link
                              </label>
                              <input
                                type="url"
                                value={editFormData.payment_link}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, payment_link: e.target.value })
                                }
                                placeholder="https://..."
                                className={inputClasses}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                                Status
                              </label>
                              <select
                                value={editFormData.status}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    status: e.target.value as 'active' | 'inactive',
                                  })
                                }
                                className={`${inputClasses} cursor-pointer`}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                          </div>

                          {/* Tags */}
                          <div>
                            <label className="block text-xs text-foreground dark:text-foreground/60 mb-1">
                              Tags
                            </label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={editNewTag}
                                onChange={(e) => setEditNewTag(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddEditTag()
                                  }
                                }}
                                placeholder="Add tag..."
                                className={`${inputClasses} flex-1`}
                              />
                              <button
                                type="button"
                                onClick={handleAddEditTag}
                                className="px-2.5 py-2 rounded-lg voxxy-btn-solid transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {editTags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {editTags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-foreground text-[11px]"
                                  >
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => setEditTags(editTags.filter((t) => t !== tag))}
                                      className="text-foreground/60 hover:text-foreground"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Save / Cancel */}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={handleSaveInlineEdit}
                              disabled={editLoading}
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg voxxy-btn-solid transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {editLoading ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-border border-t-primary rounded-full animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Save
                                </>
                              )}
                            </button>
                            <button
                              onClick={handleCancelInlineEdit}
                              disabled={editLoading}
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-background/5 transition-all disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {applications.length > 0 && (
                  <button
                    onClick={() => setCurrentView('create_app')}
                    className="w-full rounded-lg border-2 border-dashed border-border px-4 py-2.5 text-sm text-foreground/60 transition-all hover:border-primary/40 hover:text-foreground dark:border-violet-400/16 dark:hover:border-violet-400/28"
                  >
                    + Add Category
                  </button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Payment Configuration Section */}
          <AccordionItem value="payment-config" className="border-border">
            <AccordionTrigger className={triggerHoverClass}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/20 p-1.5">
                  <DollarSign className="h-4 w-4 text-green-700 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-foreground">
                    Payment Configuration
                  </span>
                  <p className="text-xs text-foreground/50 font-normal">
                    Currency, payment methods, and per-category pricing
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              {paymentWizardState ? (
                <div className="space-y-4">
                  <Step3PaymentConfig
                    wizardState={paymentWizardState}
                    updateWizardState={updatePaymentWizardState}
                    errors={paymentErrors}
                    setErrors={setPaymentErrors}
                    isAdmin={isAdmin}
                    organizationId={currentUser?.organization_id || 0}
                    standalone
                  />
                  {paymentDirty && (
                    <div className="flex justify-end pt-2 border-t border-border">
                      <button
                        onClick={handleSavePaymentConfig}
                        disabled={savingPayment}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg voxxy-btn-solid transition-all disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {savingPayment ? 'Saving...' : 'Save Payment Configuration'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-foreground/50">
                  {loadingApps
                    ? 'Loading payment configuration...'
                    : 'No categories configured yet.'}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* n8n Webhook Integration Status */}
          <AccordionItem value="n8n-webhook" className="border-border">
            <AccordionTrigger className={triggerHoverClass}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/20 p-1.5">
                  <Webhook className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-foreground">
                    n8n Payment Sync Status
                  </span>
                  <p className="text-xs text-foreground/50 font-normal">
                    Eventbrite Event ID auto-detection status per category
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-3">
                <div className={cn(compactWell, 'bg-blue-500/5 border border-blue-500/20')}>
                  <p className="text-xs text-foreground/70 mb-2">
                    <strong>✨ Auto-Detection Enabled:</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Webhook configuration is now organization-wide! When you add Eventbrite payment
                    links to categories below, we automatically extract the Eventbrite Event ID.
                    Your n8n workflow will detect the correct event without any manual
                    configuration.
                  </p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      window.location.href = '/dashboard/settings'
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg voxxy-btn-cta transition-all"
                  >
                    <Webhook className="h-4 w-4" />
                    Configure Webhook in Settings
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {applications.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Category Status:</p>
                    <div className="space-y-2">
                      {applications.map((app) => {
                        const hasEventbriteEngine = app.payment_engines?.some(
                          (pe) => pe.engine === 'eventbrite',
                        )
                        const hasEventbriteId = !!app.eventbrite_event_id

                        return (
                          <div key={app.id} className={cn(compactWell, 'voxxy-hover-panel')}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-foreground">{app.name}</p>
                                {hasEventbriteId ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[10px] font-medium text-green-800 dark:text-green-400">
                                    <Check className="w-3 h-3" />
                                    n8n Ready
                                  </span>
                                ) : hasEventbriteEngine ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-medium text-amber-800 dark:text-amber-400">
                                    <AlertCircle className="w-3 h-3" />
                                    Invalid URL
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border text-[10px] font-medium text-muted-foreground">
                                    No Eventbrite
                                  </span>
                                )}
                              </div>
                              {hasEventbriteId && (
                                <p className="text-[10px] font-mono text-muted-foreground">
                                  ID: {app.eventbrite_event_id}
                                </p>
                              )}
                            </div>
                            {hasEventbriteEngine && !hasEventbriteId && (
                              <p className="text-[10px] text-muted-foreground mt-1">
                                ⚠️ Eventbrite link found but ID extraction failed. Check URL format
                                in Payment Config.
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className={cn(compactWell, 'bg-accent/30')}>
                  <p className="text-xs text-muted-foreground">
                    <strong>How it works:</strong> Add Eventbrite payment links in Payment
                    Configuration above. We automatically extract the Event ID from URLs like{' '}
                    <code className="bg-background/50 px-1 rounded">
                      eventbrite.com/e/event-name-123456
                    </code>
                    . Your n8n workflow sends this ID in the payload, and we match it to the correct
                    category automatically!
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Event Links Section */}
          <AccordionItem value="links" className="border-border border-b-0">
            <AccordionTrigger className={triggerHoverClass}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/20 p-1.5">
                  <Link className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-foreground">Links & Sharing</span>
                  <p className="text-xs text-foreground/50 font-normal">
                    Event page links, portal access, and data export
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-3">
                {/* Application Page */}
                <div className={cn(compactWell, 'voxxy-hover-panel')}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-foreground">Application Page</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyLink(eventPageLink, 'application')}
                        className={`${utilityActionClass} text-muted-foreground`}
                      >
                        {copiedLink === 'application' ? (
                          <Check className="h-3 w-3 text-emerald-700 dark:text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedLink === 'application' ? 'Copied!' : 'Copy'}
                      </button>
                      <a
                        href={eventPageLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${utilityActionClass} text-primary dark:text-primary`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open
                      </a>
                    </div>
                  </div>
                  <p className="break-all font-mono text-[11px] text-muted-foreground">
                    {eventPageLink}
                  </p>
                </div>

                {/* Vendor Portal */}
                <div className={cn(compactWell, 'voxxy-hover-panel')}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-foreground">Vendor Portal</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyLink(portalLink, 'portal')}
                        className={`${utilityActionClass} text-muted-foreground`}
                      >
                        {copiedLink === 'portal' ? (
                          <Check className="h-3 w-3 text-emerald-700 dark:text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedLink === 'portal' ? 'Copied!' : 'Copy'}
                      </button>
                      <a
                        href={portalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${utilityActionClass} text-blue-700 dark:text-blue-300`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open
                      </a>
                    </div>
                  </div>
                  <p className="break-all font-mono text-[11px] text-muted-foreground">
                    {portalLink}
                  </p>
                </div>

                {/* Category Application Links */}
                {applications.length > 0 && (
                  <div>
                    <p className="text-[10px] text-foreground/60 uppercase tracking-wide font-semibold mb-2">
                      Category Application Links
                    </p>
                    <div className="space-y-2">
                      {applications.map((app) => {
                        const appUrl = `${window.location.origin}/events/${event.slug}/apply/${app.id}`
                        return (
                          <div
                            key={app.id}
                            className={cn(
                              compactWell,
                              'voxxy-hover-panel',
                              app.status !== 'active' && 'opacity-50',
                            )}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-foreground">{app.name}</p>
                                <span
                                  className={`text-[10px] font-medium ${app.status === 'active' ? 'text-emerald-800 dark:text-green-400' : 'text-muted-foreground'}`}
                                >
                                  {app.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditing(app)}
                                  className={`${utilityActionClass} text-muted-foreground`}
                                >
                                  <Edit className="h-3 w-3" />
                                  Edit
                                </button>
                                {app.status === 'active' && (
                                  <>
                                    <button
                                      onClick={() => handleCopyLink(appUrl, `cat-${app.id}`)}
                                      className={`${utilityActionClass} text-muted-foreground`}
                                    >
                                      {copiedLink === `cat-${app.id}` ? (
                                        <Check className="h-3 w-3 text-emerald-700 dark:text-green-400" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </button>
                                    <a
                                      href={appUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`${utilityActionClass} text-primary dark:text-primary`}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      Open
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="break-all font-mono text-[11px] text-muted-foreground">
                              {appUrl}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Danger Zone - Admin Only */}
      {isAdmin && (
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-red-700 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-foreground font-semibold mb-1">
                Danger Zone (Admin Only)
              </h3>
              <p className="text-foreground/60 text-xs mb-3">
                Permanently delete this event and all associated data. This action cannot be undone.
                Only available for testing/cleanup purposes.
              </p>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-800 transition-all hover:bg-red-500/10 dark:text-red-400"
                >
                  Delete Event
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="px-3 py-2 text-sm rounded-lg bg-red-500 text-destructive-foreground font-medium hover:bg-red-600 transition-all"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className={subtleButtonClass}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Event Settings Tab"
        data={{
          event,
          currentView,
          applications,
          editingAppId,
        }}
        isAdmin={isAdmin}
      />

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancellation}
        title="Cancel Event"
        description={`Are you sure you want to cancel this event? This will send a cancellation email to ${recipientCount} registered vendor${recipientCount !== 1 ? 's' : ''}.`}
        confirmText="Yes, Cancel Event"
        cancelText="No, Keep Event"
        isDestructive={true}
        isLoading={cancellingEvent}
      />
    </div>
  )
}
