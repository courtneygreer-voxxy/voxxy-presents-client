import { useState, useEffect, useMemo } from 'react'
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
  FileSearch,
  Mail,
  Plus,
} from 'lucide-react'
import { scheduledEmailsApi, eventsApi, categoriesApi, vendorApplicationsApi } from '@/services/api'
import type {
  ScheduledEmail,
  UpdateEmailRequest,
  ScheduledEmailStatus,
  AuditFilters,
  EmailCategory,
  CreateScheduledEmailRequest,
} from '@/types/email'
import type { Category } from '@/types/category'
import EmailTable from './EmailTable'
import { EmailEditorPage } from './EmailEditorPage'
import { EmailAuditLogOverlay } from './EmailAuditLogOverlay'
import EmailSequenceEditorOverlay from './EmailSequenceEditorOverlay'
import { DebugPanel } from '../DebugPanel'
import {
  SearchFilterBar,
  type ActiveFilter,
  type FilterFieldConfig,
} from '@/components/shared/SearchFilterBar'
import { getEmailTypeInfo } from '@/utils/emailTypeHelper'
import { logger } from '@/utils/logger'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

interface EmailAutomationTabProps {
  eventSlug: string
  event?: any
  isAdmin?: boolean
}

type FilterType = 'all' | ScheduledEmailStatus

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Emails' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'paused', label: 'Paused' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

type ViewState =
  | { view: 'table' }
  | { view: 'audit-log'; filters: AuditFilters | null }
  | { view: 'sequence-editor' }
  | { view: 'email-editor'; email: ScheduledEmail; returnTo: 'table' | 'sequence-editor' }
  | {
      view: 'email-editor'
      email: null
      returnTo: 'table' | 'sequence-editor'
      sequenceContext?: { categoryId: number | null }
    }

export default function EmailAutomationTab({ eventSlug, event, isAdmin }: EmailAutomationTabProps) {
  const [emails, setEmails] = useState<ScheduledEmail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Event must be published before "Send Now" is allowed
  const isEventLive = event?.published === true || event?.status?.status === 'published'
  // Check if event is cancelled - emails become read-only
  const isEventCancelled = event?.status?.status === 'cancelled'
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [eventData, setEventData] = useState<any | null>(null)

  // Navigation state
  const [viewState, setViewState] = useState<ViewState>({ view: 'table' })

  // Retry modal state
  const [retryEmailId, setRetryEmailId] = useState<number | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  // Auto-refresh state
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

  // Category data (fetched from API)
  const [categories, setCategories] = useState<Category[]>([])

  // Sort state
  type SortColumn =
    | 'name'
    | 'subject'
    | 'scheduled_for'
    | 'email_type'
    | 'category'
    | 'recipient_count'
    | 'undelivered_count'
    | 'status'
  type SortDirection = 'asc' | 'desc'
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Load scheduled emails
  useEffect(() => {
    loadEmails()
  }, [eventSlug])

  // Load categories (only those used by this event's vendor applications)
  useEffect(() => {
    const loadCategories = async () => {
      // Try multiple ways to get organization ID
      const orgId =
        eventData?.organization?.id ||
        eventData?.organization_id ||
        event?.organization?.id ||
        event?.organization_id

      if (!orgId) {
        return
      }

      try {
        // Load all categories for the organization
        const categoriesResponse = await categoriesApi.getAll(orgId, true)
        const allCategories = categoriesResponse.categories || []

        // Load vendor applications for this event to see which categories are actually used
        const vendorApplications = await vendorApplicationsApi.getByEvent(eventSlug)

        // Extract unique category_ids from vendor applications
        // Safety check: ensure vendorApplications is an array
        const apps = Array.isArray(vendorApplications) ? vendorApplications : []
        const usedCategoryIds = new Set(
          apps.map((app: any) => app.category_id).filter((id: number | null) => id !== null),
        )

        // Filter categories to only show those used by this event
        const eventCategories = allCategories.filter((cat: Category) => usedCategoryIds.has(cat.id))

        setCategories(eventCategories)
      } catch (error) {
        logger.error('Failed to load categories', { organizationId: orgId, error })
      }
    }

    // Only load categories if we have event data
    if (eventData || event) {
      loadCategories()
    }
  }, [eventSlug, eventData, event])

  // Auto-refresh delivery stats every 30 seconds (only on table view)
  useEffect(() => {
    if (viewState.view !== 'table') return

    const interval = setInterval(() => {
      loadEmails(true) // Silent refresh
    }, 30000)

    return () => clearInterval(interval)
  }, [viewState.view, eventSlug])

  const loadEmails = async (silent = false) => {
    if (!silent) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)
    try {
      // Fetch event data (for preview calculations)
      const eventDataResponse = await eventsApi.getById(eventSlug)
      setEventData(eventDataResponse)

      // Fetch scheduled emails
      const scheduledEmailsData = await scheduledEmailsApi.getByEvent(eventSlug)

      // Safety check: ensure scheduledEmailsData is an array
      const emailsArray = Array.isArray(scheduledEmailsData) ? scheduledEmailsData : []
      setEmails(emailsArray)
      setLastRefreshTime(new Date())
    } catch (err: any) {
      logger.error('Failed to load emails', { eventSlug, error: err })
      if (!silent) {
        setError(err.message || 'Failed to load scheduled emails')
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handlePause = async (emailId: number) => {
    try {
      await scheduledEmailsApi.pause(eventSlug, emailId)
      await loadEmails() // Reload to get updated data
      showSuccess('Email paused successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to pause email')
    }
  }

  const handleResume = async (emailId: number) => {
    try {
      await scheduledEmailsApi.resume(eventSlug, emailId)
      await loadEmails()
      showSuccess('Email resumed successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to resume email')
    }
  }

  const handleSendNow = async (emailId: number) => {
    if (!confirm('Are you sure you want to send this email now? This cannot be undone.')) {
      return
    }

    try {
      const result = await scheduledEmailsApi.sendNow(eventSlug, emailId)
      await loadEmails()
      showSuccess(`Email sent to ${result.sent_count} recipients`)
    } catch (err: any) {
      setError(err.message || 'Failed to send email')
    }
  }

  const handleRetryEmail = async (emailId: number) => {
    setRetryEmailId(emailId)
  }

  const confirmRetryEmail = async () => {
    if (!retryEmailId) return
    const emailId = retryEmailId
    setIsRetrying(true)

    // Optimistic update — show "processing" immediately instead of waiting 60+ seconds
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, status: 'processing' as ScheduledEmailStatus } : e)),
    )

    try {
      const result = await scheduledEmailsApi.sendNow(eventSlug, emailId)
      await loadEmails()
      showSuccess(`Retry successful! Email sent to ${result.sent_count} recipients.`)
    } catch (err: any) {
      // Revert optimistic update on failure
      await loadEmails()
      setError(err.message || 'Retry failed. Please try again or contact support.')
    } finally {
      setIsRetrying(false)
      setRetryEmailId(null)
    }
  }

  const handleRetryFailed = async (emailId: number) => {
    if (
      !confirm(
        'Retry all failed deliveries? Only soft bounces (temporary failures like "mailbox full") will be retried. Hard bounces (invalid emails) will be skipped.',
      )
    ) {
      return
    }

    try {
      const result = await scheduledEmailsApi.retryFailed(eventSlug, emailId)
      await loadEmails() // Reload to get updated counts

      // Build success message
      let message = `Retried ${result.retried_count} failed ${result.retried_count === 1 ? 'delivery' : 'deliveries'}`
      if (result.skipped_count > 0) {
        message += ` (${result.skipped_count} hard ${result.skipped_count === 1 ? 'bounce' : 'bounces'} skipped)`
      }
      showSuccess(message)
    } catch (err: any) {
      setError(err.message || 'Failed to retry failed deliveries')
    }
  }

  const handleDelete = async (emailId: number) => {
    if (!confirm('Are you sure you want to delete this scheduled email? This cannot be undone.')) {
      return
    }

    try {
      await scheduledEmailsApi.delete(eventSlug, emailId)
      await loadEmails()
      showSuccess('Email deleted successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to delete email')
    }
  }

  const handleCreateEmail = async (data: CreateScheduledEmailRequest) => {
    try {
      const newEmail = await scheduledEmailsApi.create(eventSlug, data)
      await loadEmails()
      showSuccess('Email created successfully!')
      return newEmail
    } catch (err: any) {
      setError(err.message || 'Failed to create email')
      throw err
    }
  }

  const handleGenerateEmails = async () => {
    if (
      !confirm(
        'Generate scheduled emails from the system template? This will create automated emails for your event.',
      )
    ) {
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const result = await scheduledEmailsApi.generate(eventSlug)
      await loadEmails()
      showSuccess(`Generated ${result.generated_count} scheduled emails for your event!`)
    } catch (err: any) {
      setError(err.message || 'Failed to generate emails')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEdit = async (emailId: number, data: UpdateEmailRequest) => {
    const updated = await scheduledEmailsApi.update(eventSlug, emailId, data)

    // Force a fresh reload of emails to ensure UI updates
    setIsLoading(true)
    await loadEmails()
    setIsLoading(false)

    showSuccess('Email updated successfully')
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  // Filter field configs for SearchFilterBar
  const statusOptions = FILTER_OPTIONS.filter((o) => o.value !== 'all').map((o) => o.label)

  const categoryOptions = [
    'All Invitations',
    'All Vendors',
    ...categories.map((c) => (c.icon ? `${c.icon} ${c.name}` : c.name)),
  ]

  const emailTypeOptions = [
    'Event Announcement',
    'Application',
    'Payment',
    'Event Countdown',
    'Other',
  ]

  const filterFieldConfigs: FilterFieldConfig[] = [
    { key: 'status', label: 'Status', options: statusOptions, multi: true },
    { key: 'email_type', label: 'Email Type', options: emailTypeOptions, multi: true },
    { key: 'category', label: 'Audience', options: categoryOptions, multi: true },
  ]

  // Derive filter values from activeFilters (now supporting multi-select)
  const statusFiltersFromBar = activeFilters.find((f) => f.fieldKey === 'status')?.values || []
  const emailTypeFiltersFromBar =
    activeFilters.find((f) => f.fieldKey === 'email_type')?.values || []
  const categoryFiltersFromBar = activeFilters.find((f) => f.fieldKey === 'category')?.values || []

  // Map status labels back to FilterType values (array)
  const derivedStatusFilters: FilterType[] =
    statusFiltersFromBar.length > 0
      ? statusFiltersFromBar
          .map((label) => FILTER_OPTIONS.find((o) => o.label === label)?.value ?? 'all')
          .filter((v) => v !== 'all')
      : []

  // Email type filter values (array of direct label matches)
  const derivedEmailTypeFilters: string[] = emailTypeFiltersFromBar

  // Map category labels to category IDs and special values (array)
  const derivedCategoryFilters: (number | 'all_invitations' | 'all_vendors')[] =
    categoryFiltersFromBar
      .map((label) => {
        if (label === 'All Invitations') return 'all_invitations'
        if (label === 'All Vendors') return 'all_vendors'
        const matchedCategory = categories.find(
          (c) => (c.icon ? `${c.icon} ${c.name}` : c.name) === label,
        )
        return matchedCategory ? matchedCategory.id : null
      })
      .filter((v): v is number | 'all_invitations' | 'all_vendors' => v !== null)

  // Filter and search emails
  const filteredEmails = useMemo(() => {
    let result = emails

    // Filter by status (OR logic - email matches ANY selected status)
    if (derivedStatusFilters.length > 0) {
      result = result.filter((email) => derivedStatusFilters.includes(email.status as FilterType))
    }

    // Filter by email type (OR logic - email matches ANY selected type)
    if (derivedEmailTypeFilters.length > 0) {
      result = result.filter((email) => {
        const emailTypeInfo = getEmailTypeInfo(email.trigger_type)
        return derivedEmailTypeFilters.includes(emailTypeInfo.label)
      })
    }

    // Filter by vendor category (OR logic - email matches ANY selected category)
    if (derivedCategoryFilters.length > 0) {
      result = result.filter((email) => {
        // Helper function to infer email type using same logic as EmailRow.tsx
        const inferCategory = (): EmailCategory => {
          const name = email.name.toLowerCase()
          const trigger = email.trigger_type

          // Check triggers first (more reliable than name patterns)
          if (trigger.includes('payment')) return 'payment_reminders'
          if (
            trigger === 'on_invitation_send' ||
            trigger === 'on_application_submit' ||
            trigger === 'on_approval' ||
            trigger === 'on_rejection' ||
            trigger === 'on_waitlist'
          )
            return 'application_updates'
          if (
            trigger === 'days_before_event' ||
            trigger === 'on_event_date' ||
            trigger === 'days_after_event'
          )
            return 'event_countdown'

          // Then check name patterns
          if (name.includes('payment')) return 'payment_reminders'
          if (
            name.includes('application') ||
            name.includes('approval') ||
            name.includes('rejected') ||
            name.includes('waitlist')
          )
            return 'application_updates'
          if (name.includes('days before') || name.includes('day of')) return 'event_countdown'
          if (name.includes('announcement') || name.includes('immediate'))
            return 'event_announcements'

          return 'event_announcements'
        }

        const emailCategory = email.email_template_item?.category || inferCategory()

        // Check if email matches ANY of the selected category filters
        return derivedCategoryFilters.some((categoryFilter) => {
          // Filter by "All Invitations" - show only application emails without specific category
          if (categoryFilter === 'all_invitations') {
            return !email.category_id && emailCategory === 'application_updates'
          }

          // Filter by "All Vendors" - show only announcement emails without specific category
          if (categoryFilter === 'all_vendors') {
            return !email.category_id && emailCategory !== 'application_updates'
          }

          // Filter by specific vendor category
          if (typeof categoryFilter === 'number') {
            // Include emails that have a matching category_id
            if (email.category_id && email.category_id === categoryFilter) {
              return true
            }
            // For emails without a category_id (All Invitations / All Vendors)
            if (!email.category_id) {
              // Exclude "All Invitations" (application_updates) when filtering by specific category
              // because once someone has a vendor category, they're approved and won't receive application emails
              if (emailCategory === 'application_updates') {
                return false
              }

              // Include "All Vendors" emails (announcements, event updates, etc.)
              return true
            }
          }

          return false
        })
      })
    }

    // Search by name or subject
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (email) =>
          email.name.toLowerCase().includes(query) ||
          email.subject_template.toLowerCase().includes(query),
      )
    }

    // If a column sort is active, use that
    if (sortColumn) {
      return [...result].sort((a, b) => {
        let valA: string | number = ''
        let valB: string | number = ''

        switch (sortColumn) {
          case 'name':
            valA = a.name.toLowerCase()
            valB = b.name.toLowerCase()
            break
          case 'subject':
            valA = a.subject_template.toLowerCase()
            valB = b.subject_template.toLowerCase()
            break
          case 'scheduled_for':
            valA = a.scheduled_for ? new Date(a.scheduled_for).getTime() : 0
            valB = b.scheduled_for ? new Date(b.scheduled_for).getTime() : 0
            break
          case 'email_type': {
            // Map trigger types to email type categories
            // Must match backend groupings in EmailTemplateItem::EVENT_WIDE_TRIGGERS and CATEGORY_SPECIFIC_TRIGGERS
            const toCat: Record<string, string> = {
              // Event Announcements - Sent to invitations/contacts (people who haven't applied)
              on_invitation_send: 'event_announcements',
              on_application_open: 'event_announcements', // Legacy
              days_before_deadline: 'event_announcements',
              days_after_deadline: 'event_announcements',
              on_bulletin_post: 'event_announcements',
              on_event_update: 'event_announcements',
              on_event_cancel: 'event_announcements',

              // Application Updates - Sent to registrations (people who already applied)
              on_application_submit: 'application_updates',
              on_approval: 'application_updates',
              on_rejection: 'application_updates',
              on_waitlist: 'application_updates',
              on_category_change: 'application_updates',

              // Payment Reminders
              on_payment_received: 'payment_reminders',
              days_before_payment_deadline: 'payment_reminders',
              on_payment_deadline: 'payment_reminders',
              days_after_payment_deadline: 'payment_reminders',

              // Event Countdown
              days_before_event: 'event_countdown',
              on_event_date: 'event_countdown',
              days_after_event: 'event_countdown',
            }
            valA = (
              a.email_template_item?.email_type ??
              toCat[a.trigger_type] ??
              'event_announcements'
            ).toLowerCase()
            valB = (
              b.email_template_item?.email_type ??
              toCat[b.trigger_type] ??
              'event_announcements'
            ).toLowerCase()
            break
          }
          case 'category':
            valA = (a.category?.name ?? 'All').toLowerCase()
            valB = (b.category?.name ?? 'All').toLowerCase()
            break
          case 'recipient_count':
            valA = a.recipient_count ?? 0
            valB = b.recipient_count ?? 0
            break
          case 'undelivered_count':
            valA = a.undelivered_count ?? 0
            valB = b.undelivered_count ?? 0
            break
          case 'status':
            valA = a.status.toLowerCase()
            valB = b.status.toLowerCase()
            break
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    // Default: sort by trigger-type group, then by scheduled_for within each group
    const TRIGGER_GROUP_ORDER: Record<string, number> = {
      on_invitation_send: 1,
      on_application_open: 1,
      on_application_submit: 2,
      on_approval: 3,
      on_rejection: 3,
      on_waitlist: 4,
      days_before_payment_deadline: 5,
      on_payment_deadline: 5,
      on_payment_received: 6,
      days_before_event: 7,
      on_event_date: 8,
      days_after_event: 9,
      on_event_update: 10,
      on_event_cancel: 10,
      on_category_change: 10,
      on_bulletin_post: 10,
    }

    return [...result].sort((a, b) => {
      const groupA = TRIGGER_GROUP_ORDER[a.trigger_type] ?? 99
      const groupB = TRIGGER_GROUP_ORDER[b.trigger_type] ?? 99

      if (groupA !== groupB) return groupA - groupB

      const dateA = a.scheduled_for ? new Date(a.scheduled_for).getTime() : 0
      const dateB = b.scheduled_for ? new Date(b.scheduled_for).getTime() : 0
      return dateA - dateB
    })
  }, [
    emails,
    searchQuery,
    derivedStatusFilters,
    derivedEmailTypeFilters,
    derivedCategoryFilters,
    sortColumn,
    sortDirection,
  ])

  // Calculate statistics
  const stats = {
    total: emails.length,
    scheduled: emails.filter((e) => e.status === 'scheduled').length,
    paused: emails.filter((e) => e.status === 'paused').length,
    sent: emails.filter((e) => e.status === 'sent').length,
    failed: emails.filter((e) => e.status === 'failed').length,
  }

  // Show full-screen audit log overlay
  if (viewState.view === 'audit-log' && eventData) {
    return (
      <EmailAuditLogOverlay
        event={eventData}
        initialFilters={viewState.filters}
        onClose={() => setViewState({ view: 'table' })}
      />
    )
  }

  // Show full-screen sequence editor overlay
  if (viewState.view === 'sequence-editor') {
    return (
      <EmailSequenceEditorOverlay
        emails={emails}
        eventSlug={eventSlug}
        eventData={eventData}
        onBack={() => setViewState({ view: 'table' })}
        onEditEmail={(email) =>
          setViewState({ view: 'email-editor', email, returnTo: 'sequence-editor' })
        }
        onPause={handlePause}
        onResume={handleResume}
        onSendNow={isEventLive ? handleSendNow : undefined}
        onDelete={handleDelete}
        onCreateEmail={(categoryId) =>
          setViewState({
            view: 'email-editor',
            email: null,
            returnTo: 'sequence-editor',
            sequenceContext: { categoryId },
          })
        }
      />
    )
  }

  // Show full-screen email editor (create or edit mode)
  if (viewState.view === 'email-editor') {
    const isCreateMode = viewState.email === null
    return (
      <EmailEditorPage
        email={viewState.email}
        eventData={eventData}
        eventSlug={eventSlug}
        onBack={() =>
          setViewState({
            view: viewState.returnTo === 'sequence-editor' ? 'sequence-editor' : 'table',
          })
        }
        onSave={handleSaveEdit}
        onCreate={isCreateMode ? handleCreateEmail : undefined}
        onDelete={handleDelete}
        mode={isCreateMode ? 'create' : 'edit'}
        categories={categories}
        isAdmin={isAdmin}
        sequenceContext={isCreateMode ? viewState.sequenceContext : undefined}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="p-3 md:p-4">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-foreground/60">Loading email automation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 md:px-4">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Email Automation</h2>
            <p className="text-foreground/60">Manage automated emails for your event</p>
          </div>
          <div className="flex items-center gap-3">
            {emails.length > 0 && (
              <>
                {/* TEMPORARILY HIDDEN - Will be re-enabled later */}
                {/* <button
                  onClick={() => setViewState({ view: 'email-editor', email: null, returnTo: 'table' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-foreground hover:from-green-700 hover:to-emerald-600 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Reminder</span>
                </button> */}
                <button
                  onClick={() => setViewState({ view: 'sequence-editor' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg voxxy-btn-cta transition-all shadow-lg"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Sequence Editor</span>
                </button>
                <button
                  onClick={() => setViewState({ view: 'audit-log', filters: null })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-background/5 transition-all"
                >
                  <FileSearch className="w-4 h-4" />
                  <span className="hidden sm:inline">Audit Log</span>
                </button>
              </>
            )}
            <button
              onClick={() => loadEmails()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-background/5 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-400 flex-1">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            ×
          </button>
        </div>
      )}

      {/* Scheduled Emails */}
      {emails.length === 0 ? (
        <div className="text-center py-16 bg-background/5 rounded-2xl border border-border">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-200/80 dark:bg-gradient-to-r dark:from-primary/30 dark:to-blue-500/30 border border-border mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Scheduled Emails Yet</h3>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">
            Generate automated emails from the system template to keep your vendors informed
            throughout the event lifecycle.
          </p>
          <button
            onClick={handleGenerateEmails}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg voxxy-btn-cta font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Emails from Template
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search and Filters */}
          <SearchFilterBar
            searchPlaceholder="Search emails..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filterFields={filterFieldConfigs}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
          />

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/60">
              Showing {filteredEmails.length} of {emails.length} emails
            </p>
            {(searchQuery || activeFilters.length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActiveFilters([])
                }}
                className="text-sm text-primary hover:text-primary/70 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Locked Event Message for Cancelled Events */}
          {isEventCancelled && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/70">
                  This event has been cancelled. All emails are in read-only mode and cannot be
                  edited, paused, or sent.
                </p>
              </div>
            </div>
          )}

          {/* Unified Email Table */}
          <EmailTable
            emails={filteredEmails}
            eventSlug={eventSlug}
            onEdit={
              isEventCancelled
                ? undefined
                : (email) => setViewState({ view: 'email-editor', email, returnTo: 'table' })
            }
            onPause={isEventCancelled ? undefined : handlePause}
            onResume={isEventCancelled ? undefined : handleResume}
            onSendNow={isEventLive && !isEventCancelled ? handleSendNow : undefined}
            onRetryFailed={isEventCancelled ? undefined : handleRetryFailed}
            onRetryEmail={isEventLive && !isEventCancelled ? handleRetryEmail : undefined}
            onDelete={isEventCancelled ? undefined : handleDelete}
            onViewAuditLog={(filters) => setViewState({ view: 'audit-log', filters })}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      )}

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Email Automation Tab"
        data={{
          event,
          eventSlug,
          emails,
          isLoading,
          error,
          successMessage,
        }}
        isAdmin={isAdmin}
      />

      {/* Retry Confirmation Modal */}
      <ConfirmationModal
        isOpen={retryEmailId !== null}
        onClose={() => setRetryEmailId(null)}
        onConfirm={confirmRetryEmail}
        title="Retry Failed Email"
        description="This will attempt to resend the email to all eligible recipients. Recipients who already received this email will not be sent duplicates."
        confirmText="Retry"
        cancelText="Cancel"
        isLoading={isRetrying}
      />
    </div>
  )
}
