import React, { useState, useEffect } from 'react'
import {
  Building2,
  Mail,
  Phone,
  Instagram,
  Music,
  Globe,
  ExternalLink,
  Star,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeftRight,
  MailX,
  Pencil,
  Copy,
  LayoutPanelLeft,
  List,
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  vendorApplicationsApi,
  registrationsApi,
  eventInvitationsApi,
  emailDeliveriesApi,
} from '@/services/api'
import { toast } from 'sonner'
import { useEmailNotifications } from '@/hooks/useEmailNotifications'
import { EmailConfirmationDialog } from './EmailConfirmationDialog'
import { EditVendorDetailsModal } from './EditVendorDetailsModal'
import { Button } from '@/components/ui/button'
import { DebugPanel } from './DebugPanel'
import ApplicantsExportModal from './ApplicantsExportModal'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import {
  SearchFilterBar,
  type FilterFieldConfig,
  type ActiveFilter,
} from '@/components/shared/SearchFilterBar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  EMAIL_HISTORY_ICON_CLASS,
  EMAIL_HISTORY_META_CLASS,
  EMAIL_HISTORY_RETRY_CLASS,
  EMAIL_HISTORY_SUBJECT_CLASS,
  getEmailDeliveryStatusTextClass,
} from '@/lib/emailDeliveryTheme'

interface Applicant {
  id: string // Changed to string to support "inv-X" and "reg-X" format
  registrationId?: number // Actual registration ID for API calls
  invitationId?: number // Invitation ID for email history
  business_name: string
  contact_name?: string
  email: string
  phone?: string
  vendor_category: string
  status:
    | 'invited'
    | 'pending'
    | 'approved'
    | 'confirmed'
    | 'waitlist'
    | 'rejected'
    | 'cancelled'
    | 'opted_out'
  payment_status?: 'paid' | 'pending' | 'confirmed' | 'overdue' | 'n/a'
  source?: 'contact' | 'net_new'
  is_returning?: boolean
  portfolio?: string
  website?: string
  instagram_handle?: string
  tiktok_handle?: string
  created_at: string
  reviewed_at?: string
  location?: string
  portfolio_images?: string[]
  producer_notes?: string
  tags?: string[]
  ticket_code?: string
  application_code?: string
  email_unsubscribed?: boolean
  unsubscribe_status?: {
    is_unsubscribed: boolean
    scope: 'global' | 'organization' | 'event' | null
  }
}

interface ApplicantsTabProps {
  eventSlug: string
  event?: any
  isAdmin?: boolean
}

type StatusFilter =
  | 'all'
  | 'invited'
  | 'pending'
  | 'approved'
  | 'confirmed'
  | 'waitlist'
  | 'rejected'
  | 'cancelled'
  | 'opted_out'

// Status filter values paired with their human-facing labels (used by the
// shared SearchFilterBar, which works in terms of display labels).
// 'opted_out' is the representative value for the merged "Opted Out" group,
// which matches both 'opted_out' and 'cancelled' applicant statuses.
const STATUS_FILTER_OPTIONS: { value: Exclude<StatusFilter, 'all'>; label: string }[] = [
  { value: 'invited', label: 'Invited' },
  { value: 'pending', label: 'New' },
  { value: 'approved', label: 'Approved' },
  { value: 'confirmed', label: 'Paid' },
  { value: 'waitlist', label: 'Waitlisted' },
  { value: 'rejected', label: 'Declined' },
  { value: 'opted_out', label: 'Opted Out' },
]

export default function ApplicantsTab({ eventSlug, event, isAdmin }: ApplicantsTabProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  // Email history state
  const [emailHistoryData, setEmailHistoryData] = useState<any[]>([])
  const [loadingEmailHistory, setLoadingEmailHistory] = useState(false)

  // Status change confirmation modal state
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    applicant: Applicant
    newStatus: 'approved' | 'waitlist' | 'rejected' | 'opted_out'
  } | null>(null)

  // View mode: focused (two-panel) or table
  const [viewMode, setViewMode] = useState<'focused' | 'table'>('focused')
  const [tablePage, setTablePage] = useState(1)
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<Set<string>>(new Set())
  const [allPagesSelected, setAllPagesSelected] = useState(false)

  // Category change confirmation modal state
  const [showCategoryConfirmModal, setShowCategoryConfirmModal] = useState(false)
  const [pendingCategoryChange, setPendingCategoryChange] = useState<{
    applicant: Applicant
    newCategory: string
  } | null>(null)
  const [sendCategoryEmail, setSendCategoryEmail] = useState(true)

  // Payment change confirmation modal state
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState(false)
  const [pendingPaymentChange, setPendingPaymentChange] = useState<{
    applicant: Applicant
    newPaymentStatus: 'paid' | 'pending'
  } | null>(null)

  const [showEditVendorModal, setShowEditVendorModal] = useState(false)

  // Invited contacts visibility
  const [showInvited, setShowInvited] = useState(false)
  const [invitedCount, setInvitedCount] = useState(0)

  // Export modal
  const [showExportModal, setShowExportModal] = useState(false)

  // Email notifications hook
  const { dialogOpen, dialogProps, handleEmailNotification, handleConfirmSend, closeDialog } =
    useEmailNotifications()

  useEffect(() => {
    fetchApplicants()
  }, [eventSlug, showInvited])

  useEffect(() => {
    setShowEditVendorModal(false)
  }, [selectedApplicant?.id])

  const fetchAllInvitations = async (slug: string): Promise<any[]> => {
    const all: any[] = []
    let page = 1
    const perPage = 100
    let hasNextPage = true
    while (hasNextPage) {
      const resp = await eventInvitationsApi.getByEvent(slug, page, perPage)
      all.push(...(resp.invitations || []))
      hasNextPage = resp.meta?.pagination?.has_next_page ?? false
      page++
    }
    return all
  }

  const fetchApplicants = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch invitations — always get page 1 for count; paginate fully only when shown
      const firstPageResp = await eventInvitationsApi.getByEvent(eventSlug, 1, 100)
      const firstPageInvitations = firstPageResp.invitations || []
      const pagination = firstPageResp.meta?.pagination
      const totalInvited =
        pagination?.total_count ??
        (pagination?.total_pages != null
          ? pagination.total_pages > 1
            ? pagination.total_pages * 100
            : firstPageInvitations.length
          : firstPageInvitations.length)
      setInvitedCount(totalInvited)

      let invitations: any[] = []
      if (showInvited) {
        // Paginate through all invitation pages (fixes 100-item cap)
        invitations = await fetchAllInvitations(eventSlug)
      }
      // When showInvited=false, invitations stays [] — invited contacts are hidden

      // Fetch all vendor applications for this event
      const applications = await vendorApplicationsApi.getByEvent(eventSlug)

      // Build available categories from vendor application names
      const categoriesSet = new Set<string>()
      applications.forEach((app: any) => {
        if (app.name) categoriesSet.add(app.name)
      })

      // Fetch all submissions concurrently (fixes N+1 sequential fetches)
      const allSubmissions: any[] = []
      const submissionResults = await Promise.all(
        applications.map((app: any) =>
          vendorApplicationsApi.getSubmissions(app.id).catch((err: any) => {
            console.error(`Failed to fetch submissions for application ${app.id}:`, err)
            return []
          }),
        ),
      )
      submissionResults.forEach((submissions: any[], idx: number) => {
        const app = applications[idx]
        submissions.forEach((sub: any) => {
          allSubmissions.push({ ...sub, vendor_application: { id: app.id, name: app.name } })
          if (sub.vendor_category) categoriesSet.add(sub.vendor_category)
        })
      })

      setAvailableCategories(Array.from(categoriesSet).sort())

      // Merge logic: match by email (case-insensitive)
      const emailMap = new Map<string, Applicant>()

      // First, add all submissions/registrations
      allSubmissions.forEach((submission) => {
        const email = submission.email?.toLowerCase()
        if (!email) return

        emailMap.set(email, {
          id: `reg-${submission.id}`,
          registrationId: submission.id,
          business_name: submission.business_name,
          contact_name: submission.contact_name || submission.name,
          email: submission.email,
          phone: submission.phone,
          instagram_handle: submission.instagram_handle,
          tiktok_handle: submission.tiktok_handle,
          website: submission.website,
          portfolio: submission.portfolio,
          vendor_category: submission.vendor_category,
          status: mapRegistrationStatus(submission.status),
          payment_status: submission.payment_status || 'pending',
          source: 'net_new', // Will be updated if matched with invitation
          created_at: submission.created_at,
          location: submission.location,
          portfolio_images: submission.portfolio_images,
          producer_notes: submission.producer_notes,
          ticket_code: submission.ticket_code,
          application_code: submission.application_code,
          email_unsubscribed: submission.email_unsubscribed,
          unsubscribe_status: submission.email_unsubscribed
            ? {
                is_unsubscribed: true,
                scope: submission.unsubscribe_scope || 'event',
              }
            : undefined,
        })
      })

      // Then, merge invitations
      invitations.forEach((invitation: any) => {
        const contact = invitation.vendor_contact
        if (!contact) return

        const email = contact.email?.toLowerCase()
        if (!email) return

        if (emailMap.has(email)) {
          // Contact applied - update source and merge contact data
          const existing = emailMap.get(email)!
          existing.source = 'contact'
          existing.is_returning = contact.source === 'returning' || contact.source === 'past_event'
          // Prefer registration data (event-specific) over vendor_contact data (global)
          existing.producer_notes = existing.producer_notes || contact.notes
          existing.tags =
            existing.tags && existing.tags.length > 0 ? existing.tags : contact.tags || []
          existing.location = existing.location || contact.location
          existing.invitationId = invitation.id
          // Merge social media - prefer application data but fall back to contact data
          existing.instagram_handle = existing.instagram_handle || contact.instagram_handle
          existing.tiktok_handle = existing.tiktok_handle || contact.tiktok_handle
          existing.website = existing.website || contact.website
          existing.phone = existing.phone || contact.phone
          // Merge unsubscribe status - prefer registration data but fall back to contact data
          existing.unsubscribe_status = existing.unsubscribe_status || contact.unsubscribe_status
          existing.email_unsubscribed =
            existing.email_unsubscribed || contact.unsubscribe_status?.is_unsubscribed
        } else {
          // Contact was invited but hasn't applied yet
          emailMap.set(email, {
            id: `inv-${invitation.id}`,
            invitationId: invitation.id,
            business_name: contact.business_name || contact.name,
            contact_name: contact.name,
            email: contact.email,
            phone: contact.phone,
            instagram_handle: contact.instagram_handle,
            tiktok_handle: contact.tiktok_handle,
            website: contact.website,
            vendor_category: 'Pending Application',
            status: 'invited',
            payment_status: 'n/a',
            source: 'contact',
            is_returning: contact.source === 'returning' || contact.source === 'past_event',
            producer_notes: contact.notes,
            tags: contact.tags || [],
            location: contact.location,
            created_at: invitation.created_at || new Date().toISOString(),
            unsubscribe_status: contact.unsubscribe_status,
            email_unsubscribed: contact.unsubscribe_status?.is_unsubscribed,
          })
        }
      })

      const mergedApplicants = Array.from(emailMap.values())
      setApplicants(mergedApplicants)

      // Auto-select first applicant if available
      if (mergedApplicants.length > 0 && !selectedApplicant) {
        setSelectedApplicant(mergedApplicants[0])
      }
    } catch (err: any) {
      console.error('Failed to fetch applicants:', err)
      setError(err.message || 'Failed to load applicants')
    } finally {
      setLoading(false)
    }
  }

  // Map registration status to applicant status
  const mapRegistrationStatus = (regStatus: string): Applicant['status'] => {
    switch (regStatus) {
      case 'pending':
        return 'pending'
      case 'approved':
        return 'approved'
      case 'confirmed':
        return 'confirmed'
      case 'waitlist':
        return 'waitlist'
      case 'rejected':
        return 'rejected'
      case 'cancelled':
        return 'cancelled'
      case 'opted_out':
        return 'opted_out'
      default:
        return 'pending'
    }
  }

  // Show confirmation modal before category change
  const requestCategoryChange = (applicant: Applicant, newCategory: string) => {
    if (newCategory === applicant.vendor_category) return
    setPendingCategoryChange({ applicant, newCategory })
    setSendCategoryEmail(true) // default to on
    setShowCategoryConfirmModal(true)
  }

  // Confirm and execute category change (email decision captured upfront via toggle)
  const confirmCategoryChange = async () => {
    if (!pendingCategoryChange) return

    const { applicant, newCategory } = pendingCategoryChange
    const shouldSendEmail = sendCategoryEmail

    setShowCategoryConfirmModal(false)
    setPendingCategoryChange(null)

    await handleUpdateCategory(applicant, newCategory, shouldSendEmail)
  }

  // Cancel category change
  const cancelCategoryChange = () => {
    setShowCategoryConfirmModal(false)
    setPendingCategoryChange(null)
    if (selectedApplicant) {
      setSelectedApplicant({ ...selectedApplicant })
    }
  }

  const handleUpdateCategory = async (
    applicant: Applicant,
    newCategory: string,
    sendEmail = false,
  ) => {
    if (!applicant.registrationId) {
      alert('Cannot update category: No application found')
      return
    }

    try {
      setIsUpdatingCategory(true)
      await registrationsApi.update(applicant.registrationId, { vendor_category: newCategory })

      // Send notification email if the producer chose to
      if (sendEmail) {
        try {
          await registrationsApi.sendCategoryChangeNotification(applicant.registrationId)
          toast.success('Category updated and notification sent')
        } catch {
          toast.success('Category updated (notification email failed)')
        }
      } else {
        toast.success('Category updated')
      }

      // Update local state
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicant.id ? { ...a, vendor_category: newCategory } : a)),
      )

      if (selectedApplicant?.id === applicant.id) {
        setSelectedApplicant({ ...selectedApplicant, vendor_category: newCategory })
      }
    } catch (err: any) {
      console.error('Failed to update category:', err)
      toast.error(`Failed to update category: ${err.message}`)
    } finally {
      setIsUpdatingCategory(false)
    }
  }

  // Show confirmation modal before status change
  const requestStatusChange = (
    applicant: Applicant,
    newStatus: 'approved' | 'waitlist' | 'rejected' | 'opted_out',
  ) => {
    setPendingStatusChange({ applicant, newStatus })
    setShowStatusConfirmModal(true)
  }

  // Confirm and execute status change
  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return

    const { applicant, newStatus } = pendingStatusChange

    // Close modal
    setShowStatusConfirmModal(false)
    setPendingStatusChange(null)

    // Execute the status change
    await handleUpdateStatus(applicant, newStatus)
  }

  // Cancel status change
  const cancelStatusChange = () => {
    setShowStatusConfirmModal(false)
    setPendingStatusChange(null)
  }

  const handleUpdateStatus = async (
    applicant: Applicant,
    newStatus: 'approved' | 'waitlist' | 'rejected' | 'opted_out',
  ) => {
    if (!applicant.registrationId) {
      alert('Cannot update status: No application found')
      return
    }

    try {
      setUpdatingId(applicant.id)

      const response = await registrationsApi.update(applicant.registrationId, {
        status: newStatus,
      })

      // Handle email notification (skip for opted_out - no emails sent)
      if (response.email_notification && newStatus !== 'opted_out') {
        handleEmailNotification(response.email_notification, undefined, applicant.registrationId)
      }

      // Update status in local state
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id
            ? { ...a, status: newStatus, reviewed_at: a.reviewed_at || new Date().toISOString() }
            : a,
        ),
      )

      // Update selected applicant if it's the one being modified
      if (selectedApplicant?.id === applicant.id) {
        setSelectedApplicant({
          ...selectedApplicant,
          status: newStatus,
          reviewed_at: selectedApplicant.reviewed_at || new Date().toISOString(),
        })
      }
    } catch (err: any) {
      console.error('Failed to update status:', err)
      alert(`Failed to update status: ${err.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  // Show confirmation modal before payment change
  const requestPaymentChange = (applicant: Applicant) => {
    if (!applicant.registrationId || applicant.status !== 'approved') return
    // Only allow marking as paid, not reversing back to pending
    if (applicant.payment_status === 'paid') return
    const newPaymentStatus = 'paid'
    setPendingPaymentChange({ applicant, newPaymentStatus })
    setShowPaymentConfirmModal(true)
  }

  // Confirm and execute payment change
  const confirmPaymentChange = async () => {
    if (!pendingPaymentChange) return

    const { applicant, newPaymentStatus } = pendingPaymentChange

    // Close modal
    setShowPaymentConfirmModal(false)
    setPendingPaymentChange(null)

    // Execute the payment change
    await handleTogglePayment(applicant, newPaymentStatus)
  }

  // Cancel payment change
  const cancelPaymentChange = () => {
    setShowPaymentConfirmModal(false)
    setPendingPaymentChange(null)
  }

  // Handle payment status toggle
  const handleTogglePayment = async (
    applicant: Applicant,
    newPaymentStatus: 'paid' | 'pending',
  ) => {
    if (!applicant.registrationId || applicant.status !== 'approved') return

    try {
      setUpdatingId(applicant.id)
      const response = await registrationsApi.update(applicant.registrationId, {
        payment_status: newPaymentStatus,
      })

      // Handle email notification
      if (response.email_notification) {
        handleEmailNotification(response.email_notification, undefined, applicant.registrationId)
      }

      setApplicants((prev) =>
        prev.map((a) => (a.id === applicant.id ? { ...a, payment_status: newPaymentStatus } : a)),
      )

      if (selectedApplicant?.id === applicant.id) {
        setSelectedApplicant({ ...selectedApplicant, payment_status: newPaymentStatus })
      }
    } catch (err: any) {
      console.error('Failed to update payment status:', err)
      alert(`Failed to update payment: ${err.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  // Fetch email history when applicant changes
  useEffect(() => {
    const fetchEmailHistory = async () => {
      if (!selectedApplicant) {
        setEmailHistoryData([])
        return
      }

      // Only fetch if applicant has registration or invitation
      if (!selectedApplicant.registrationId && !selectedApplicant.invitationId) {
        setEmailHistoryData([])
        return
      }

      try {
        setLoadingEmailHistory(true)
        let allHistory: any[] = []

        // Fetch registration emails if registrationId exists
        if (selectedApplicant.registrationId) {
          const registrationHistory = await emailDeliveriesApi.getByRegistration(
            selectedApplicant.registrationId,
          )
          allHistory = [...(registrationHistory || [])]
        }

        // Fetch invitation emails if invitationId exists
        if (selectedApplicant.invitationId) {
          const invitationHistory = await emailDeliveriesApi.getByInvitation(
            eventSlug,
            selectedApplicant.invitationId,
          )
          allHistory = [...allHistory, ...(invitationHistory || [])]
        }

        // Sort by date (most recent first)
        allHistory.sort((a, b) => {
          const dateA = new Date(a.delivered_at || a.sent_at || a.created_at).getTime()
          const dateB = new Date(b.delivered_at || b.sent_at || b.created_at).getTime()
          return dateB - dateA
        })

        setEmailHistoryData(allHistory)
      } catch (err: any) {
        console.error('Failed to fetch email history:', err)
        setEmailHistoryData([])
      } finally {
        setLoadingEmailHistory(false)
      }
    }

    fetchEmailHistory()
  }, [selectedApplicant, eventSlug])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invited':
        return {
          label: 'Invited',
          variant: 'tintSlate' as BadgeVariant,
          icon: Mail,
        }
      case 'pending':
        return {
          label: 'New',
          variant: 'tintBlue' as BadgeVariant,
          icon: Clock,
        }
      case 'approved':
        return {
          label: 'Approved',
          variant: 'tintGreen' as BadgeVariant,
          icon: CheckCircle,
        }
      case 'confirmed':
        return {
          label: 'Paid',
          variant: 'tintGreenDeep' as BadgeVariant,
          icon: CheckCircle,
        }
      case 'waitlist':
        return {
          label: 'Waitlisted',
          variant: 'tintYellow' as BadgeVariant,
          icon: AlertCircle,
        }
      case 'rejected':
        return {
          label: 'Declined',
          variant: 'tintRed' as BadgeVariant,
          icon: XCircle,
        }
      // 'cancelled' is merged into the "Opted Out" group, so it shares its label/style.
      case 'cancelled':
      case 'opted_out':
        return {
          label: 'Opted Out',
          variant: 'tintOrange' as BadgeVariant,
          icon: XCircle,
        }
      default:
        return {
          label: status,
          variant: 'tintMuted' as BadgeVariant,
          icon: Clock,
        }
    }
  }

  const handleEditVendorSaved = (
    applicantId: string,
    patch: {
      contact_name: string
      phone: string
      location?: string
      producer_notes?: string
      tags?: string[]
      instagram_handle?: string
      tiktok_handle?: string
      website?: string
    },
  ) => {
    toast.success('Vendor details updated')
    setApplicants((prev) => prev.map((a) => (a.id === applicantId ? { ...a, ...patch } : a)))
    setSelectedApplicant((prev) => (prev && prev.id === applicantId ? { ...prev, ...patch } : prev))
  }

  const getPaymentBadge = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'paid':
      case 'confirmed':
        return { label: 'Paid', variant: 'tintGreen' as BadgeVariant }
      case 'overdue':
        return { label: 'Overdue', variant: 'tintRed' as BadgeVariant }
      case 'pending':
        return { label: 'Pending', variant: 'tintYellow' as BadgeVariant }
      case 'n/a':
      default:
        return null
    }
  }

  // Filter applicants
  const filteredApplicants = applicants.filter((applicant) => {
    // Hide invited contacts unless showInvited is on
    if (!showInvited && applicant.status === 'invited') return false

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      // Guard every field: business_name (and others) can be null now that
      // business name was removed from the application form. Calling
      // .toLowerCase() on a null field throws during render and trips the
      // ErrorBoundary (see Sentry REACT-FRONT-END-8).
      const matches =
        applicant.business_name?.toLowerCase().includes(query) ||
        applicant.contact_name?.toLowerCase().includes(query) ||
        applicant.email?.toLowerCase().includes(query) ||
        applicant.vendor_category?.toLowerCase().includes(query)
      if (!matches) return false
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'opted_out') {
        // Merged group: "Opted Out" covers both opted_out and cancelled.
        if (applicant.status !== 'opted_out' && applicant.status !== 'cancelled') return false
      } else if (applicant.status !== statusFilter) {
        return false
      }
    }

    // Category filter
    if (categoryFilter !== 'all' && applicant.vendor_category !== categoryFilter) return false

    return true
  })

  // Derive unique categories from applicants
  const uniqueCategories = [
    ...new Set(applicants.map((a) => a.vendor_category).filter(Boolean)),
  ].sort()

  const hasActiveFilters =
    statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery.trim() !== ''

  // --- Shared filter bar (button + applied-chips) config ---
  const filterFieldConfigs: FilterFieldConfig[] = [
    {
      key: 'status',
      label: 'Status',
      multi: false,
      options: STATUS_FILTER_OPTIONS.map((o) => o.label),
    },
    ...(uniqueCategories.length > 0
      ? [
          {
            key: 'category',
            label: 'Category',
            multi: false,
            options: uniqueCategories as string[],
          } as FilterFieldConfig,
        ]
      : []),
  ]

  const filterBarActiveFilters: ActiveFilter[] = []
  if (statusFilter !== 'all') {
    const label = STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label
    if (label) filterBarActiveFilters.push({ fieldKey: 'status', values: [label] })
  }
  if (categoryFilter !== 'all') {
    filterBarActiveFilters.push({ fieldKey: 'category', values: [categoryFilter] })
  }

  const handleFilterBarChange = (filters: ActiveFilter[]) => {
    const statusLabel = filters.find((f) => f.fieldKey === 'status')?.values[0]
    const matchedStatus = STATUS_FILTER_OPTIONS.find((o) => o.label === statusLabel)
    const newStatus = matchedStatus ? matchedStatus.value : 'all'
    setStatusFilter(newStatus)
    // Auto-show invited contacts when the Invited filter is selected
    if (newStatus === 'invited') setShowInvited(true)

    const categoryValue = filters.find((f) => f.fieldKey === 'category')?.values[0]
    setCategoryFilter(categoryValue ?? 'all')

    setTablePage(1)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 md:p-4">
        <div className="text-center py-12">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={fetchApplicants}
            className="px-3 py-1.5 text-xs rounded-lg voxxy-btn-solid transition-smooth"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const TABLE_PAGE_SIZE = 100
  const totalTablePages = Math.max(1, Math.ceil(filteredApplicants.length / TABLE_PAGE_SIZE))
  const tableStart = (tablePage - 1) * TABLE_PAGE_SIZE
  const tablePageApplicants = filteredApplicants.slice(tableStart, tableStart + TABLE_PAGE_SIZE)
  const currentPageIds = new Set(tablePageApplicants.map((a) => a.id))
  const allCurrentPageSelected =
    tablePageApplicants.length > 0 &&
    tablePageApplicants.every((a) => selectedApplicantIds.has(a.id))

  const toggleTableRow = (id: string) => {
    setAllPagesSelected(false)
    setSelectedApplicantIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleCurrentPage = () => {
    setAllPagesSelected(false)
    if (allCurrentPageSelected) {
      setSelectedApplicantIds((prev) => {
        const next = new Set(prev)
        currentPageIds.forEach((id) => next.delete(id))
        return next
      })
    } else {
      setSelectedApplicantIds((prev) => {
        const next = new Set(prev)
        currentPageIds.forEach((id) => next.add(id))
        return next
      })
    }
  }

  const selectAllPages = () => {
    setAllPagesSelected(true)
    setSelectedApplicantIds(new Set(filteredApplicants.map((a) => a.id)))
  }

  const clearTableSelection = () => {
    setAllPagesSelected(false)
    setSelectedApplicantIds(new Set())
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header row 1: Title + actions + view toggle */}
      <div className="flex items-center justify-between px-3 md:px-4 pt-3 pb-2 border-b border-border gap-2 flex-wrap">
        <div className="shrink-0">
          <h2 className="text-2xl font-bold text-foreground">Applicants</h2>
          <p className="text-[10px] text-foreground/60">
            {filteredApplicants.length} shown
            {statusFilter !== 'all' && ` • ${statusFilter}`}
            {categoryFilter !== 'all' && ` • ${categoryFilter}`}
            {!showInvited && invitedCount > 0 && ` • ${invitedCount} invited hidden`}
          </p>
        </div>

        {/* Search — flex-1 in the middle */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/50" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setTablePage(1)
            }}
            className="w-full pl-7 pr-2 py-1.5 bg-background/5 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Invited toggle */}
          <button
            onClick={() => setShowInvited((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-smooth ${
              showInvited
                ? 'bg-primary/15 border-primary/30 text-foreground'
                : 'border-border text-foreground/60 hover:text-foreground'
            }`}
            title={showInvited ? 'Hide invited contacts' : 'Show invited contacts'}
          >
            <Users className="w-3 h-3" />
            {showInvited
              ? 'Hide Invited'
              : invitedCount > 0
                ? `Invited (${invitedCount})`
                : 'Invited'}
          </button>

          {/* Export button */}
          <button
            onClick={() => setShowExportModal(true)}
            disabled={filteredApplicants.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-border text-foreground/60 hover:text-foreground transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export applicants as CSV"
          >
            <Download className="w-3 h-3" />
            Export
          </button>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('focused')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-smooth ${
                viewMode === 'focused'
                  ? 'voxxy-nav-tab-active'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Focused view"
            >
              <LayoutPanelLeft className="w-3.5 h-3.5" />
              Focused
            </button>
            <button
              onClick={() => {
                setViewMode('table')
                setTablePage(1)
                clearTableSelection()
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-smooth ${
                viewMode === 'table'
                  ? 'voxxy-nav-tab-active'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table view"
            >
              <List className="w-3.5 h-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>
      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div className="flex-1 flex flex-col overflow-hidden p-3 md:p-4 gap-3">
          {/* Filters row */}
          <SearchFilterBar
            variant="button"
            showSearch={false}
            filterFields={filterFieldConfigs}
            activeFilters={filterBarActiveFilters}
            onFiltersChange={handleFilterBarChange}
          />

          {/* Select-all banner */}
          {allCurrentPageSelected &&
            !allPagesSelected &&
            filteredApplicants.length > TABLE_PAGE_SIZE && (
              <div className="text-xs text-center bg-primary/10 border border-primary/20 rounded-lg py-2 px-3">
                All {tablePageApplicants.length} applicants on this page are selected.{' '}
                <button onClick={selectAllPages} className="text-primary underline font-medium">
                  Select all {filteredApplicants.length} applicants
                </button>
              </div>
            )}
          {allPagesSelected && (
            <div className="text-xs text-center bg-primary/10 border border-primary/20 rounded-lg py-2 px-3">
              All {filteredApplicants.length} applicants selected.{' '}
              <button onClick={clearTableSelection} className="text-primary underline font-medium">
                Clear selection
              </button>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <div className="voxxy-table-shell">
              <table className="w-full text-xs">
                <thead className="voxxy-table-header">
                  <tr className="voxxy-table-header-row">
                    <th className="px-3 py-2.5 text-left w-8">
                      <input
                        type="checkbox"
                        checked={allCurrentPageSelected}
                        onChange={toggleCurrentPage}
                        className="rounded border-border accent-primary"
                      />
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">Name</th>
                    <th className="px-3 py-2.5 text-left font-medium">Business</th>
                    <th className="px-3 py-2.5 text-left font-medium">Email</th>
                    <th className="px-3 py-2.5 text-left font-medium">Category</th>
                    <th className="px-3 py-2.5 text-left font-medium">Status</th>
                    <th className="px-3 py-2.5 text-left font-medium">Payment</th>
                    <th className="px-3 py-2.5 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tablePageApplicants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-12 text-center text-foreground/50">
                        {hasActiveFilters ? 'No matches found' : 'No applicants yet'}
                      </td>
                    </tr>
                  ) : (
                    tablePageApplicants.map((applicant) => {
                      const statusBadge = getStatusBadge(applicant.status)
                      const paymentBadge = getPaymentBadge(applicant.payment_status)
                      return (
                        <tr key={applicant.id} className="voxxy-table-row voxxy-table-row-hover">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={selectedApplicantIds.has(applicant.id)}
                              onChange={() => toggleTableRow(applicant.id)}
                              className="rounded border-border accent-primary"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-medium text-foreground truncate max-w-[140px]">
                              {applicant.contact_name || '—'}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-foreground/70 truncate max-w-[130px]">
                              {applicant.business_name || '—'}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div
                              className="text-foreground/70 truncate max-w-[140px]"
                              title={applicant.email}
                            >
                              {applicant.email}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {applicant.status !== 'invited' ? (
                              <Badge
                                variant="tintPurple"
                                className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                              >
                                {applicant.vendor_category}
                              </Badge>
                            ) : (
                              <span className="text-foreground/40">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <Badge
                              variant={statusBadge.variant}
                              className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                            >
                              {React.createElement(statusBadge.icon, { className: 'h-2 w-2' })}
                              {statusBadge.label}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">
                            {applicant.status !== 'approved' && applicant.status !== 'confirmed' ? (
                              <Badge
                                variant="default"
                                className="rounded px-1.5 py-0.5 text-[9px] font-medium opacity-50"
                              >
                                N/A
                              </Badge>
                            ) : paymentBadge ? (
                              <Badge
                                variant={paymentBadge.variant}
                                className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                              >
                                {paymentBadge.label}
                              </Badge>
                            ) : (
                              <Badge
                                variant="tintYellow"
                                className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                              >
                                Pending
                              </Badge>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => {
                                setViewMode('focused')
                                setSelectedApplicant(applicant)
                              }}
                              className="text-primary hover:text-primary/70 transition-smooth underline text-[10px]"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Pagination */}
          {totalTablePages > 1 && (
            <div className="flex items-center justify-between text-xs text-foreground/60 pt-1">
              <span>
                Showing {tableStart + 1}–
                {Math.min(tableStart + TABLE_PAGE_SIZE, filteredApplicants.length)} of{' '}
                {filteredApplicants.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                  disabled={tablePage === 1}
                  className="p-1 rounded border border-border hover:bg-muted disabled:opacity-40 transition-smooth"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2">
                  {tablePage} / {totalTablePages}
                </span>
                <button
                  onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                  disabled={tablePage === totalTablePages}
                  className="p-1 rounded border border-border hover:bg-muted disabled:opacity-40 transition-smooth"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ── FOCUSED VIEW ── */}
      {viewMode === 'focused' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Applicant List */}
          <div className="w-80 border-r border-border flex flex-col">
            {/* List Header */}
            <div className="px-3 md:px-4 pb-3 border-b border-border">
              <div className="mb-2">
                <p className="text-[10px] text-foreground/85 dark:text-foreground/60">
                  {filteredApplicants.length} total
                  {statusFilter !== 'all' && ` • ${statusFilter}`}
                  {categoryFilter !== 'all' && ` • ${categoryFilter}`}
                </p>
              </div>

              {/* Status & Category Filters */}
              <SearchFilterBar
                variant="button"
                showSearch={false}
                filterFields={filterFieldConfigs}
                activeFilters={filterBarActiveFilters}
                onFiltersChange={handleFilterBarChange}
              />
            </div>

            {/* Applicant List */}
            <div className="flex-1 overflow-y-auto">
              {filteredApplicants.length === 0 ? (
                <div className="p-4 text-center">
                  <Building2 className="w-8 h-8 text-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-foreground/80 dark:text-foreground/60">
                    {hasActiveFilters ? 'No matches found' : 'No pending applications'}
                  </p>
                </div>
              ) : (
                <div className="py-2 px-3 md:px-4 space-y-1">
                  {filteredApplicants.map((applicant) => {
                    const statusBadge = getStatusBadge(applicant.status)
                    const StatusIcon = statusBadge.icon
                    const isSelected = selectedApplicant?.id === applicant.id

                    const paymentBadge = getPaymentBadge(applicant.payment_status)

                    return (
                      <button
                        key={applicant.id}
                        onClick={() => setSelectedApplicant(applicant)}
                        className={`w-full p-2 rounded-lg text-left transition-smooth ${
                          isSelected
                            ? 'bg-primary/20 border border-primary/50'
                            : 'voxxy-hover-row bg-card/70 dark:bg-card/50 border border-border backdrop-blur-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <h3 className="text-xs font-semibold text-foreground truncate">
                              {applicant.contact_name || applicant.business_name}
                            </h3>
                            {applicant.is_returning && (
                              <Star
                                className="w-2.5 h-2.5 text-yellow-400 flex-shrink-0"
                                fill="currentColor"
                              />
                            )}
                            {applicant.email_unsubscribed && (
                              <MailX className="w-2.5 h-2.5 text-orange-400 flex-shrink-0" />
                            )}
                          </div>
                          <Badge
                            variant={statusBadge.variant}
                            className="ml-2 inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                          >
                            <StatusIcon className="h-2 w-2" />
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-foreground/60 truncate mb-1.5">
                          {applicant.contact_name
                            ? applicant.business_name || applicant.email
                            : applicant.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-1">
                          {applicant.status !== 'invited' && (
                            <Badge
                              variant="tintPurple"
                              className="inline-block rounded px-1.5 py-0.5 text-[9px] font-medium"
                            >
                              {applicant.vendor_category}
                            </Badge>
                          )}
                          {applicant.source === 'net_new' && (
                            <Badge
                              variant="tintCyan"
                              className="inline-block rounded px-1.5 py-0.5 text-[9px] font-medium"
                            >
                              New
                            </Badge>
                          )}
                          {paymentBadge && applicant.status === 'approved' && (
                            <Badge
                              variant={paymentBadge.variant}
                              className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium"
                            >
                              <DollarSign className="h-2 w-2" />
                              {paymentBadge.label}
                            </Badge>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Detail View */}
          <div className="flex-1 overflow-y-auto">
            {!selectedApplicant ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-foreground/20 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    No Applicant Selected
                  </h3>
                  <p className="text-xs text-foreground/60">
                    Select an applicant from the list to view details
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-3 md:px-4 pb-4">
                {/* Detail Header */}
                <div className="glass-card voxxy-hover-panel p-4 mb-3">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="text-lg font-bold text-foreground">
                          {selectedApplicant.contact_name || selectedApplicant.business_name}
                        </h2>
                        {selectedApplicant.is_returning && (
                          <Badge
                            variant="tintYellow"
                            className="gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                          >
                            <Star
                              className="h-3 w-3 text-yellow-800 dark:text-yellow-400"
                              fill="currentColor"
                            />
                            Returning
                          </Badge>
                        )}
                        {selectedApplicant.source && (
                          <Badge
                            variant={
                              selectedApplicant.source === 'net_new' ? 'tintCyan' : 'tintPurple'
                            }
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          >
                            {selectedApplicant.source === 'net_new'
                              ? 'New Applicant'
                              : 'From Contacts'}
                          </Badge>
                        )}
                        {selectedApplicant.email_unsubscribed &&
                          selectedApplicant.unsubscribe_status && (
                            <Badge
                              variant="tintOrange"
                              className="gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                            >
                              <MailX className="h-3 w-3 text-orange-800 dark:text-orange-400" />
                              Unsubscribed ({selectedApplicant.unsubscribe_status.scope})
                            </Badge>
                          )}
                      </div>
                      {selectedApplicant.contact_name && selectedApplicant.business_name && (
                        <p className="text-sm text-foreground/80 mb-2">
                          {selectedApplicant.business_name}
                        </p>
                      )}
                      <Badge
                        variant={getStatusBadge(selectedApplicant.status).variant}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                      >
                        {React.createElement(getStatusBadge(selectedApplicant.status).icon, {
                          className: 'h-3 w-3',
                        })}
                        {getStatusBadge(selectedApplicant.status).label}
                      </Badge>
                    </div>
                    {selectedApplicant.registrationId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 h-8 text-xs border-border bg-background/5 hover:bg-background/10"
                        onClick={() => setShowEditVendorModal(true)}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" />
                        Edit details
                      </Button>
                    )}
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-foreground/60 mb-1">Email</p>
                      <a
                        href={`mailto:${selectedApplicant.email}`}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/70 transition-smooth"
                      >
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{selectedApplicant.email}</span>
                      </a>
                    </div>
                    {selectedApplicant.phone && (
                      <div>
                        <p className="text-[10px] text-foreground/60 mb-1">Phone</p>
                        <a
                          href={`tel:${selectedApplicant.phone}`}
                          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/70 transition-smooth"
                        >
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{selectedApplicant.phone}</span>
                        </a>
                      </div>
                    )}
                    {selectedApplicant.location && (
                      <div>
                        <p className="text-[10px] text-foreground/60 mb-1">Location</p>
                        <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-foreground/60" />
                          <span>{selectedApplicant.location}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-foreground/60 mb-1">Applied</p>
                      <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-foreground/60" />
                        <span>{formatDate(selectedApplicant.created_at)}</span>
                      </div>
                    </div>
                    {(selectedApplicant.ticket_code || selectedApplicant.application_code) && (
                      <div>
                        <p className="text-[10px] text-foreground/60 mb-1">Ticket Code</p>
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">
                            {selectedApplicant.ticket_code || selectedApplicant.application_code}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                selectedApplicant.ticket_code ||
                                  selectedApplicant.application_code ||
                                  '',
                              )
                              toast.success('Code copied')
                            }}
                            className="p-1 rounded hover:bg-background/10 text-foreground/40 hover:text-foreground transition-colors"
                            title="Copy code"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <p className="text-[10px] text-foreground/60 mb-1">Category</p>
                    {selectedApplicant.status === 'invited' ? (
                      <div className="px-2.5 py-1.5 rounded-lg bg-background/5 text-foreground/40 text-xs border border-border italic">
                        Pending Application
                      </div>
                    ) : (
                      <Select
                        value={selectedApplicant.vendor_category}
                        onValueChange={(value) => requestCategoryChange(selectedApplicant, value)}
                        disabled={isUpdatingCategory}
                      >
                        <SelectTrigger className="voxxy-hover-row h-8 w-fit min-w-[140px] rounded-lg border border-border bg-background/5 px-2.5 text-xs text-foreground transition-smooth focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50">
                          <SelectValue placeholder={selectedApplicant.vendor_category} />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-muted text-foreground shadow-xl">
                          {(availableCategories.length > 0
                            ? [
                                ...new Set([
                                  selectedApplicant.vendor_category,
                                  ...availableCategories,
                                ]),
                              ]
                                .filter(Boolean)
                                .sort()
                            : [selectedApplicant.vendor_category]
                          ).map((category) => (
                            <SelectItem
                              key={category}
                              value={category}
                              className="text-xs focus:bg-background/10"
                            >
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Tags from Network CRM */}
                  {selectedApplicant.tags && selectedApplicant.tags.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-foreground/60 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplicant.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary dark:text-primary border border-primary/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Producer Notes */}
                  <div className="mb-3">
                    <p className="text-[10px] text-foreground/60 mb-2">Producer Notes</p>
                    {selectedApplicant.producer_notes ? (
                      <div className="px-3 py-2 rounded-lg bg-background/5 border border-border">
                        <p className="text-xs text-foreground/80 whitespace-pre-wrap">
                          {selectedApplicant.producer_notes}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-foreground/40 italic px-3 py-2">
                        No notes yet. Click &quot;Edit details&quot; to add.
                      </p>
                    )}
                  </div>
                </div>

                {/* Social & Links */}
                <div className="glass-card voxxy-hover-panel p-3 mb-3">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Social & Links</h3>
                  {selectedApplicant.instagram_handle ||
                  selectedApplicant.tiktok_handle ||
                  selectedApplicant.portfolio ||
                  selectedApplicant.website ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedApplicant.instagram_handle && (
                        <a
                          href={
                            selectedApplicant.instagram_handle.startsWith('http')
                              ? selectedApplicant.instagram_handle
                              : `https://instagram.com/${selectedApplicant.instagram_handle.replace('@', '')}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/5 hover:bg-background/10 text-xs text-foreground transition-smooth border border-border"
                        >
                          <Instagram className="w-4 h-4" />
                          <span>{selectedApplicant.instagram_handle}</span>
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </a>
                      )}
                      {selectedApplicant.tiktok_handle && (
                        <a
                          href={
                            selectedApplicant.tiktok_handle.startsWith('http')
                              ? selectedApplicant.tiktok_handle
                              : `https://tiktok.com/@${selectedApplicant.tiktok_handle.replace('@', '')}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/5 hover:bg-background/10 text-xs text-foreground transition-smooth border border-border"
                        >
                          <Music className="w-4 h-4" />
                          <span>{selectedApplicant.tiktok_handle}</span>
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </a>
                      )}
                      {selectedApplicant.portfolio && (
                        <a
                          href={
                            selectedApplicant.portfolio.startsWith('http')
                              ? selectedApplicant.portfolio
                              : `https://${selectedApplicant.portfolio}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/5 hover:bg-background/10 text-xs text-foreground transition-smooth border border-border"
                        >
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>Portfolio</span>
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </a>
                      )}
                      {selectedApplicant.website && (
                        <a
                          href={
                            selectedApplicant.website.startsWith('http')
                              ? selectedApplicant.website
                              : `https://${selectedApplicant.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/5 hover:bg-background/10 text-xs text-foreground transition-smooth border border-border"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Website</span>
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground/40 italic">
                      No social links added yet. Click &quot;Edit details&quot; to add.
                    </p>
                  )}
                </div>

                {/* Portfolio Images */}
                {selectedApplicant.portfolio_images &&
                  selectedApplicant.portfolio_images.length > 0 && (
                    <div className="glass-card voxxy-hover-panel p-3 mb-3">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Images</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedApplicant.portfolio_images.map((image, idx) => (
                          <div
                            key={idx}
                            className="aspect-square rounded-lg bg-background/5 border border-border overflow-hidden"
                          >
                            <img
                              src={image}
                              alt={`Portfolio ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Status & Payment Management - Only show for applicants who have applied */}
                {selectedApplicant.status !== 'invited' && selectedApplicant.registrationId && (
                  <div className="glass-card voxxy-hover-panel p-3 mb-3">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Status & Actions</h3>
                    {updatingId === selectedApplicant.id ? (
                      <div className="flex items-center justify-center py-2">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : selectedApplicant.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => requestStatusChange(selectedApplicant, 'approved')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-400/50 bg-emerald-100 text-emerald-950 hover:bg-emerald-200/90 dark:border-green-500/30 dark:bg-transparent dark:text-green-400 dark:hover:bg-green-500/10 text-xs font-medium transition-smooth"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => requestStatusChange(selectedApplicant, 'waitlist')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/50 bg-amber-100 text-amber-950 hover:bg-amber-200/90 dark:border-yellow-500/30 dark:bg-transparent dark:text-yellow-400 dark:hover:bg-yellow-500/10 text-xs font-medium transition-smooth"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Waitlist
                        </button>
                        <button
                          onClick={() => requestStatusChange(selectedApplicant, 'rejected')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400/50 bg-red-100 text-red-950 hover:bg-red-200/90 dark:border-red-500/30 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10 text-xs font-medium transition-smooth"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Opted Out Warning Banner */}
                        {selectedApplicant.status === 'opted_out' && (
                          <div className="rounded-lg border border-orange-300/60 bg-orange-50/80 p-3 mb-3 dark:border-orange-500/30 dark:bg-orange-950/20">
                            <div className="flex items-start gap-2.5">
                              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-orange-900 dark:text-orange-100 mb-0.5">
                                  This vendor has opted out
                                </p>
                                <p className="text-[11px] text-orange-800 dark:text-orange-200/90 leading-relaxed">
                                  They will not receive any event emails. Use the dropdown below to
                                  restore their status if needed.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Vendor Status Row */}
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                          <div>
                            <p className="text-[10px] text-foreground/60 mb-1">Vendor Status</p>
                            <p className="text-xs text-foreground font-medium">
                              {getStatusBadge(selectedApplicant.status).label}
                            </p>
                          </div>
                          <Select
                            // Use a sentinel for "keep current" so it never shares a value with
                            // Change to Approved/Waitlist/Declined — duplicate values break Radix Select
                            // (double checkmarks, concatenated trigger text).
                            value="keep"
                            onValueChange={(value) => {
                              if (value === 'keep') return
                              const newStatus = value as
                                | 'approved'
                                | 'waitlist'
                                | 'rejected'
                                | 'opted_out'
                              if (newStatus !== selectedApplicant.status) {
                                requestStatusChange(selectedApplicant, newStatus)
                              }
                            }}
                          >
                            <SelectTrigger className="voxxy-hover-row h-8 w-fit min-w-[180px] rounded-lg border border-border bg-background/10 px-2.5 text-xs text-foreground transition-smooth focus:ring-2 focus:ring-primary/50">
                              <SelectValue
                                placeholder={`Keep as ${getStatusBadge(selectedApplicant.status).label}`}
                              />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-muted text-foreground shadow-xl">
                              <SelectItem value="keep" className="text-xs focus:bg-background/10">
                                Keep as {getStatusBadge(selectedApplicant.status).label}
                              </SelectItem>
                              <SelectItem
                                value="approved"
                                className="text-xs focus:bg-background/10"
                              >
                                Change to Approved
                              </SelectItem>
                              <SelectItem
                                value="waitlist"
                                className="text-xs focus:bg-background/10"
                              >
                                Change to Waitlist
                              </SelectItem>
                              <SelectItem
                                value="rejected"
                                className="text-xs focus:bg-background/10"
                              >
                                Change to Declined
                              </SelectItem>
                              <SelectItem
                                value="opted_out"
                                className="text-xs focus:bg-background/10"
                              >
                                Change to Opted Out
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Payment Status Row - Only for approved with payment tracking */}
                        {selectedApplicant.status === 'approved' &&
                          selectedApplicant.payment_status !== 'n/a' && (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[10px] text-foreground/60 mb-1">
                                  Payment Status
                                </p>
                                <Badge
                                  variant={
                                    getPaymentBadge(selectedApplicant.payment_status)?.variant ??
                                    'tintMuted'
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
                                >
                                  <DollarSign className="h-3.5 w-3.5" />
                                  {getPaymentBadge(selectedApplicant.payment_status)?.label ||
                                    'Unknown'}
                                </Badge>
                              </div>
                              {selectedApplicant.payment_status !== 'paid' && (
                                <button
                                  onClick={() => requestPaymentChange(selectedApplicant)}
                                  disabled={updatingId === selectedApplicant.id}
                                  className="px-3 py-1.5 rounded-lg bg-background/10 text-foreground text-xs border border-border hover:bg-background/20 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Mark as Paid
                                </button>
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )}

                {/* Email History */}
                {(selectedApplicant.registrationId || selectedApplicant.invitationId) && (
                  <div className="glass-card voxxy-hover-panel p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Email History</h3>

                    {loadingEmailHistory ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : emailHistoryData.length > 0 ? (
                      <div className="divide-y divide-border">
                        {emailHistoryData.map((delivery: any) => {
                          const deliveryStatus = delivery.status
                          const emailSubject =
                            delivery.subject || delivery.scheduled_email?.subject || 'Unknown Email'
                          const deliveredDate =
                            delivery.delivered_at || delivery.sent_at || delivery.created_at

                          const statusColor = getEmailDeliveryStatusTextClass(deliveryStatus)

                          return (
                            <div key={delivery.id} className="flex items-center gap-2 py-1.5">
                              <Mail
                                className={`w-3 h-3 ${EMAIL_HISTORY_ICON_CLASS} flex-shrink-0`}
                              />
                              <span
                                className={`text-[10px] ${EMAIL_HISTORY_SUBJECT_CLASS} truncate flex-1`}
                              >
                                {emailSubject}
                              </span>
                              <span
                                className={`text-[10px] ${EMAIL_HISTORY_META_CLASS} tabular-nums flex-shrink-0`}
                              >
                                {deliveredDate
                                  ? new Date(deliveredDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : '—'}
                              </span>
                              <span
                                className={`text-[10px] font-medium ${statusColor} flex-shrink-0 w-16 text-right`}
                              >
                                {deliveryStatus}
                              </span>
                              {(deliveryStatus === 'bounced' || deliveryStatus === 'dropped') && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await emailDeliveriesApi.retry(delivery.id)
                                      toast.success('Email queued for retry')
                                      let refreshedHistory: any[] = []
                                      if (selectedApplicant.registrationId) {
                                        const regHistory =
                                          await emailDeliveriesApi.getByRegistration(
                                            selectedApplicant.registrationId,
                                          )
                                        refreshedHistory = [...(regHistory || [])]
                                      }
                                      if (selectedApplicant.invitationId) {
                                        const invHistory = await emailDeliveriesApi.getByInvitation(
                                          eventSlug,
                                          selectedApplicant.invitationId,
                                        )
                                        refreshedHistory = [
                                          ...refreshedHistory,
                                          ...(invHistory || []),
                                        ]
                                      }
                                      refreshedHistory.sort((a, b) => {
                                        const dateA = new Date(
                                          a.delivered_at || a.sent_at || a.created_at,
                                        ).getTime()
                                        const dateB = new Date(
                                          b.delivered_at || b.sent_at || b.created_at,
                                        ).getTime()
                                        return dateB - dateA
                                      })
                                      setEmailHistoryData(refreshedHistory)
                                    } catch (err: any) {
                                      toast.error(`Failed to retry: ${err.message}`)
                                    }
                                  }}
                                  className={`text-[10px] ${EMAIL_HISTORY_RETRY_CLASS} flex-shrink-0`}
                                >
                                  Retry
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="py-3 px-2">
                        {selectedApplicant.unsubscribe_status?.is_unsubscribed ? (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                            <MailX className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-orange-400 font-medium mb-1">
                                No Emails Sent (Unsubscribed)
                              </p>
                              <p className="text-[10px] text-foreground/60">
                                This vendor unsubscribed from{' '}
                                {selectedApplicant.unsubscribe_status.scope} emails. No automated
                                messages will be sent.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-background/5 border border-border">
                            <Clock className="w-4 h-4 text-foreground/40 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-foreground/60 font-medium mb-1">
                                No Email History
                              </p>
                              <p className="text-[10px] text-foreground/40">
                                No automated emails have been triggered yet.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}{' '}
      {/* end focused view */}
      {selectedApplicant?.registrationId && (
        <EditVendorDetailsModal
          open={showEditVendorModal}
          onOpenChange={setShowEditVendorModal}
          applicantId={selectedApplicant.id}
          registrationId={selectedApplicant.registrationId}
          initialContactName={
            selectedApplicant.contact_name || selectedApplicant.business_name || ''
          }
          initialPhone={selectedApplicant.phone || ''}
          initialLocation={selectedApplicant.location}
          initialProducerNotes={selectedApplicant.producer_notes}
          initialTags={selectedApplicant.tags}
          initialInstagramHandle={selectedApplicant.instagram_handle}
          initialTiktokHandle={selectedApplicant.tiktok_handle}
          initialWebsite={selectedApplicant.website}
          emailReadOnly={selectedApplicant.email}
          onSaved={handleEditVendorSaved}
        />
      )}
      {/* Email Notification Dialog */}
      <EmailConfirmationDialog
        open={dialogOpen}
        onOpenChange={closeDialog}
        onConfirm={handleConfirmSend}
        title={dialogProps.title}
        warning={dialogProps.warning}
        recipientCount={dialogProps.recipientCount}
        recipientEmail={dialogProps.recipientEmail}
        type={dialogProps.type}
        isLoading={dialogProps.isLoading}
      />
      {/* Status Change Confirmation Modal */}
      {showStatusConfirmModal && pendingStatusChange && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-2xl border border-border max-w-md w-full p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  pendingStatusChange.newStatus === 'approved'
                    ? 'bg-green-500/20'
                    : pendingStatusChange.newStatus === 'rejected'
                      ? 'bg-red-500/20'
                      : 'bg-yellow-500/20'
                }`}
              >
                <Mail
                  className={`w-5 h-5 ${
                    pendingStatusChange.newStatus === 'approved'
                      ? 'text-green-400'
                      : pendingStatusChange.newStatus === 'rejected'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Change Status to{' '}
                  {pendingStatusChange.newStatus === 'approved'
                    ? 'Approved'
                    : pendingStatusChange.newStatus === 'rejected'
                      ? 'Declined'
                      : pendingStatusChange.newStatus === 'opted_out'
                        ? 'Opted Out'
                        : 'Waitlisted'}
                  ?
                </h3>
                <p className="text-sm text-foreground/60">
                  {pendingStatusChange.newStatus === 'opted_out'
                    ? 'No email will be sent for this status change'
                    : 'This will send an automated email notification'}
                </p>
              </div>
            </div>

            {/* Warning - only show for statuses that send emails */}
            {pendingStatusChange.newStatus !== 'opted_out' && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <p className="text-xs text-orange-400">
                  <strong>⚠️ Email will be sent to:</strong>
                  <br />
                  {pendingStatusChange.applicant.email}
                </p>
              </div>
            )}

            {/* Vendor Info */}
            <div className="bg-background/5 rounded-lg p-3 space-y-1">
              <p className="text-sm text-foreground font-medium">
                {pendingStatusChange.applicant.business_name}
              </p>
              <p className="text-xs text-foreground/60">
                {pendingStatusChange.applicant.contact_name || pendingStatusChange.applicant.email}
              </p>
              <p className="text-xs text-primary">
                {pendingStatusChange.applicant.vendor_category}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={cancelStatusChange}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-background/5 transition-smooth text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className={`flex-1 px-4 py-2 rounded-lg text-foreground text-sm font-medium transition-smooth ${
                  pendingStatusChange.newStatus === 'approved'
                    ? 'bg-green-600 hover:bg-green-500'
                    : pendingStatusChange.newStatus === 'rejected'
                      ? 'bg-red-600 hover:bg-red-500'
                      : pendingStatusChange.newStatus === 'opted_out'
                        ? 'bg-orange-600 hover:bg-orange-500'
                        : 'bg-yellow-600 hover:bg-yellow-500'
                }`}
              >
                {pendingStatusChange.newStatus === 'opted_out'
                  ? 'Confirm Change'
                  : 'Confirm & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Category Change Confirmation Modal */}
      {showCategoryConfirmModal && pendingCategoryChange && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-2xl border border-border max-w-md w-full p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <ArrowLeftRight className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Reassign Category?</h3>
                <p className="text-sm text-foreground/60">This may affect pricing.</p>
              </div>
            </div>

            {/* Email notification toggle */}
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Notify applicant by email</p>
                  <p className="text-xs text-foreground/60">
                    Send a category update email to {pendingCategoryChange.applicant.email}
                  </p>
                </div>
              </div>
              <Switch checked={sendCategoryEmail} onCheckedChange={setSendCategoryEmail} />
            </div>

            {/* Category Change Info */}
            <div className="bg-background/5 rounded-lg p-3 space-y-2">
              <p className="text-sm text-foreground font-medium">
                {pendingCategoryChange.applicant.business_name}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="tintRed" className="rounded px-2 py-1 line-through">
                  {pendingCategoryChange.applicant.vendor_category}
                </Badge>
                <span className="text-foreground/40">→</span>
                <Badge variant="tintGreen" className="rounded px-2 py-1">
                  {pendingCategoryChange.newCategory}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={cancelCategoryChange}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-background/5 transition-smooth text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmCategoryChange}
                className="flex-1 px-4 py-2 rounded-lg voxxy-btn-solid text-sm font-medium transition-smooth"
              >
                {sendCategoryEmail ? 'Reassign & Notify' : 'Reassign Category'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Payment Change Confirmation Modal */}
      {showPaymentConfirmModal && pendingPaymentChange && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-2xl border border-border max-w-md w-full p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  pendingPaymentChange.newPaymentStatus === 'paid'
                    ? 'bg-green-500/20'
                    : 'bg-yellow-500/20'
                }`}
              >
                <Mail
                  className={`w-5 h-5 ${
                    pendingPaymentChange.newPaymentStatus === 'paid'
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Mark as {pendingPaymentChange.newPaymentStatus === 'paid' ? 'Paid' : 'Pending'}?
                </h3>
                <p className="text-sm text-foreground/60">
                  This will send an automated email notification
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <p className="text-xs text-orange-400">
                <strong>⚠️ Email will be sent to:</strong>
                <br />
                {pendingPaymentChange.applicant.email}
              </p>
            </div>

            {/* Payment Change Info */}
            <div className="bg-background/5 rounded-lg p-3 space-y-2">
              <p className="text-sm text-foreground font-medium">
                {pendingPaymentChange.applicant.business_name}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <DollarSign className="w-4 h-4 text-foreground/60" />
                <span
                  className={`px-2 py-1 rounded ${
                    pendingPaymentChange.applicant.payment_status === 'paid'
                      ? 'bg-green-500/20 text-emerald-900 dark:text-green-400'
                      : 'bg-yellow-500/20 text-yellow-950 dark:text-yellow-400'
                  } line-through`}
                >
                  {pendingPaymentChange.applicant.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
                <span className="text-foreground/40">→</span>
                <span
                  className={`px-2 py-1 rounded ${
                    pendingPaymentChange.newPaymentStatus === 'paid'
                      ? 'bg-green-500/20 text-emerald-900 dark:text-green-400'
                      : 'bg-yellow-500/20 text-yellow-950 dark:text-yellow-400'
                  }`}
                >
                  {pendingPaymentChange.newPaymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={cancelPaymentChange}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-background/5 transition-smooth text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmPaymentChange}
                className={`flex-1 px-4 py-2 rounded-lg text-foreground text-sm font-medium transition-smooth ${
                  pendingPaymentChange.newPaymentStatus === 'paid'
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-yellow-600 hover:bg-yellow-500'
                }`}
              >
                Confirm & Send Email
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Export Modal */}
      <ApplicantsExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        applicants={filteredApplicants}
        eventSlug={eventSlug}
      />

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Applicants Tab"
        data={{
          event,
          eventSlug,
          applicants,
          selectedApplicant,
          statusFilter,
          searchQuery,
          availableCategories,
        }}
        isAdmin={isAdmin}
      />
    </div>
  )
}
