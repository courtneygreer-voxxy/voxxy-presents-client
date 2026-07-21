import { useState, useEffect, useRef, useCallback } from 'react'
import {
  UserPlus,
  Upload,
  X,
  Tag,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  ChevronDown,
  DollarSign,
  Percent,
  Download,
  Filter,
} from 'lucide-react'
import {
  vendorContactsApi,
  contactListsApi,
  categoriesApi,
  eventsApi,
  VendorContact,
  ContactList,
} from '@/services/api'
import type { Category, CategoryFeePreference } from '@/types/category'
import { PAYMENT_PRICE_TYPES } from '@/components/producer/CreateEventWizard/types'
import ContactsTable from './ContactsTable'
import AddContactModal from './AddContactModal'
import EditContactModal from './EditContactModal'
import ViewContactModal from './ViewContactModal'
import { CSVUploadModal } from './CSVUploadModal'
import ListsManagement from './Lists/ListsManagement'
import BulkEditModal from './BulkEditModal'
import ContactExportModal from './ContactExportModal'
import FilterPanel, { type FilterDraft } from './FilterPanel'
import type { ActiveFilter } from '@/components/shared/SearchFilterBar'
import { notify } from '@/errors/notify'
import { getApiErrorMessage } from '@/errors/getApiErrorMessage'
import {
  IMPORT_BATCH_VIEW_LABEL,
  BULK_EDIT_LABEL,
} from './copy'
import {
  type ImportSession,
  clearImportSession,
  loadImportSession,
  saveImportSession,
} from './importSession'

type NetworkTab = 'contacts' | 'lists' | 'categories'

interface NetworkPageProps {
  organizationId: number
  organizationSlug: string
  activeTab: NetworkTab
  showAddModal: boolean
  setShowAddModal: (show: boolean) => void
  showCSVUploadModal: boolean
  setShowCSVUploadModal: (show: boolean) => void
  onTabChange?: (tab: NetworkTab) => void
}

export default function NetworkPage({
  organizationId,
  organizationSlug,
  activeTab,
  showAddModal,
  setShowAddModal,
  showCSVUploadModal,
  setShowCSVUploadModal,
  onTabChange,
}: NetworkPageProps) {
  const [contacts, setContacts] = useState<VendorContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [editingContact, setEditingContact] = useState<VendorContact | null>(null)
  const [viewingContact, setViewingContact] = useState<VendorContact | null>(null)
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false)

  // Client-side filter states
  const [updatedAtRange, setUpdatedAtRange] = useState<'all' | '24h' | '48h' | '7d' | '30d'>('all')
  const [eventFilter, setEventFilter] = useState<string>('all') // 'all' | 'none' | event_id
  const [eventStatusFilter, setEventStatusFilter] = useState<string>('all') // 'all' | 'approved' | 'pending' | 'rejected' etc.
  const [socialFilter, setSocialFilter] = useState<string[]>([]) // 'instagram' | 'tiktok' | 'website'
  const [orgEvents, setOrgEvents] = useState<{ id: number; title: string }[]>([])
  const [showExportModal, setShowExportModal] = useState(false)
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const actionsMenuRef = useRef<HTMLDivElement>(null)
  const filterMenuRef = useRef<HTMLDivElement>(null)

  // SearchFilterBar state
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

  // Category objects
  const [categories, setCategories] = useState<Category[]>([])

  // Category CRUD state
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    color: '#FF6B6B',
    description: '',
  })
  const [paymentPreferences, setPaymentPreferences] = useState<CategoryFeePreference[]>([])
  const [feeTypeDropdownOpen, setFeeTypeDropdownOpen] = useState(false)

  // Filter options from backend
  const [filterOptions, setFilterOptions] = useState<{
    locations: string[]
    categories: string[]
    tags: string[]
  }>({ locations: [], categories: [], tags: [] })

  // Saved queries (smart contact lists surfaced as "queries" in the filter panel)
  const [savedQueries, setSavedQueries] = useState<ContactList[]>([])
  const [savingQuery, setSavingQuery] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(100)
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    per_page: 100,
    total_count: 0,
    total_pages: 1,
  })

  // Sort state
  const [sortField, setSortField] = useState<'last_name' | 'first_name' | 'email' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Bulk update state
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false)

  // Post-import session + saved lists (for one-click list creation)
  const [importSession, setImportSession] = useState<ImportSession | null>(null)
  const [viewingImportBatch, setViewingImportBatch] = useState(false)
  // Derive filter arrays from activeFilters
  const locationFilters = activeFilters.find((f) => f.fieldKey === 'location')?.values || []
  const categoryFilters = activeFilters.find((f) => f.fieldKey === 'category')?.values || []
  const tagFilters = activeFilters.find((f) => f.fieldKey === 'tags')?.values || []
  const hasListableFilters =
    locationFilters.length > 0 || categoryFilters.length > 0 || tagFilters.length > 0
  const hasAdvancedFilters =
    updatedAtRange !== 'all' ||
    eventFilter !== 'all' ||
    eventStatusFilter !== 'all' ||
    socialFilter.length > 0
  const hasActiveFilters = hasListableFilters || hasAdvancedFilters

  // Number of distinct active filter dimensions (drives the Filter button badge)
  const activeFilterCount =
    (categoryFilters.length > 0 ? 1 : 0) +
    (locationFilters.length > 0 ? 1 : 0) +
    (tagFilters.length > 0 ? 1 : 0) +
    (socialFilter.length > 0 ? 1 : 0) +
    (updatedAtRange !== 'all' ? 1 : 0) +
    (eventFilter !== 'all' ? 1 : 0)

  // Close actions menu / filter panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setActionsMenuOpen(false)
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterPanel(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const refreshFilterOptions = async () => {
    try {
      const options = await vendorContactsApi.getFilterOptions(organizationId)
      setFilterOptions({
        locations: options.locations || [],
        categories: options.categories || [],
        tags: options.tags || [],
      })
    } catch (err) {
      console.error('Failed to load filter options:', err)
    }
  }

  const loadSavedQueries = async () => {
    try {
      const { contact_lists } = await contactListsApi.getAll(organizationId)
      // Filters create "queries" (smart lists); manual lists are not surfaced here.
      setSavedQueries((contact_lists || []).filter((l) => l.list_type === 'smart'))
    } catch (err) {
      console.error('Failed to load saved queries:', err)
    }
  }

  // Fetch filter options + saved queries on mount
  useEffect(() => {
    refreshFilterOptions()
    loadSavedQueries()
    const stored = loadImportSession(organizationId)
    if (stored) setImportSession(stored)
  }, [organizationId])

  const handleImportSuccess = async (session: ImportSession) => {
    saveImportSession(organizationId, session)
    setImportSession(session)
    await refreshFilterOptions()
    fetchContacts(1)
  }

  const dismissImportSession = () => {
    clearImportSession(organizationId)
    setImportSession(null)
    setViewingImportBatch(false)
  }

  const viewImportUpload = () => {
    if (!importSession) return
    setSearchTerm('')
    setUpdatedAtRange('all')
    setEventFilter('all')
    setEventStatusFilter('all')
    setViewingManualList(null)

    const tagsToFilter =
      importSession.tags.length === 1 && importSession.primaryTag
        ? [importSession.primaryTag]
        : importSession.tags

    const withoutListable = activeFilters.filter(
      (f) => f.fieldKey !== 'tags' && f.fieldKey !== 'category' && f.fieldKey !== 'location',
    )
    if (tagsToFilter.length > 0) {
      setActiveFilters([...withoutListable, { fieldKey: 'tags', values: tagsToFilter }])
    } else {
      setActiveFilters(withoutListable)
    }

    setViewingImportBatch(true)
    setCurrentPage(1)
  }

  const clearImportBatchView = () => {
    setViewingImportBatch(false)
    const withoutTags = activeFilters.filter((f) => f.fieldKey !== 'tags')
    setActiveFilters(withoutTags)
    setCurrentPage(1)
    fetchContacts(1)
  }

  // Fetch org events for the event filter dropdown
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const events = await eventsApi.getByOrganization(organizationSlug)
        const list = Array.isArray(events) ? events : []
        setOrgEvents(
          list.map((ev: Record<string, unknown>) => ({
            id: Number(ev.id),
            title: String(ev.title || 'Untitled'),
          })),
        )
      } catch (err) {
        console.error('Failed to load events for filter:', err)
      }
    }
    loadEvents()
  }, [organizationSlug])

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll(organizationId, true)
      setCategories(response.categories)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [organizationId])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
    fetchContacts(1)
  }, [organizationId, locationFilters.join(','), categoryFilters.join(','), tagFilters.join(',')])

  const fetchContacts = async (page: number = currentPage) => {
    try {
      setLoading(true)
      setError(null)
      setViewingManualList(null)

      const response = await vendorContactsApi.getAll(organizationId, {
        search: searchTerm || undefined,
        location: locationFilters.length > 0 ? locationFilters : undefined,
        category: categoryFilters.length > 0 ? categoryFilters : undefined,
        tags: tagFilters.length > 0 ? tagFilters : undefined,
        page: page,
        per_page: perPage,
        sort: sortField || undefined,
        order: sortField ? sortOrder : undefined,
      })

      let contactsData = response?.vendor_contacts || []
      const meta = response?.meta || {
        current_page: page,
        per_page: perPage,
        total_count: contactsData.length,
        total_pages: 1,
      }

      // Client-side filtering for multi-select values beyond the first
      if (locationFilters.length > 1) {
        contactsData = contactsData.filter(
          (c: VendorContact) => c.location && locationFilters.includes(c.location),
        )
      }
      if (categoryFilters.length > 1) {
        contactsData = contactsData.filter((c: VendorContact) =>
          c.categories?.some((cat) => categoryFilters.includes(cat)),
        )
      }

      setContacts(contactsData)
      setPaginationMeta(meta)
      setCurrentPage(page)
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts')
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewManualList = async (listId: number, listName: string) => {
    try {
      setLoading(true)
      setError(null)
      setActiveFilters([])
      setSearchTerm('')
      setViewingManualList({ id: listId, name: listName })

      const response = await contactListsApi.getContacts(listId)
      setContacts(response.vendor_contacts || [])
      setPaginationMeta({
        current_page: 1,
        per_page: response.vendor_contacts?.length || 0,
        total_count: response.vendor_contacts?.length || 0,
        total_pages: 1,
      })
      setCurrentPage(1)
      onTabChange?.('contacts')
    } catch (err: any) {
      setError(err.message || 'Failed to load list contacts')
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchContacts(page)
    setSelectedContacts([])
  }

  const handleSearchSubmit = () => {
    setCurrentPage(1)
    fetchContacts(1)
  }

  const handleSort = useCallback((field: 'last_name' | 'first_name' | 'email' | null) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortOrder('asc')
      return field
    })
  }, [])

  // Re-fetch when sort changes
  useEffect(() => {
    if (sortField) {
      setCurrentPage(1)
      fetchContacts(1)
    }
  }, [sortField, sortOrder])

  const handleSelectContact = useCallback((contactId: number) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    )
  }, [])

  const handleSelectAll = async () => {
    const currentPageIds = contacts.map((c) => c.id)
    const allCurrentPageSelected = currentPageIds.every((id) => selectedContacts.includes(id))

    if (allCurrentPageSelected && selectedContacts.length > 0) {
      setSelectedContacts([])
    } else {
      try {
        const result = await vendorContactsApi.getAllIds(organizationId, {
          search: searchTerm || undefined,
          location: locationFilters.length > 0 ? locationFilters[0] : undefined,
          category: categoryFilters.length > 0 ? categoryFilters[0] : undefined,
          tags: tagFilters.length > 0 ? tagFilters : undefined,
        })
        setSelectedContacts(result.ids)
      } catch (err) {
        console.error('Failed to fetch all contact IDs:', err)
        setSelectedContacts(currentPageIds)
      }
    }
  }

  const handleDeleteContact = useCallback(async (contactId: number) => {
    if (!confirm('Are you sure you want to remove this contact from your network?')) return

    try {
      await vendorContactsApi.delete(contactId)
      setContacts((prev) => prev.filter((c) => c.id !== contactId))
      setSelectedContacts((prev) => prev.filter((id) => id !== contactId))
    } catch (err: unknown) {
      notify.error({
        key: 'network.deleteContactFailed',
        fallback: getApiErrorMessage(err),
      })
    }
  }, [])

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return
    if (
      !confirm(
        `Are you sure you want to delete ${selectedContacts.length} contact${selectedContacts.length === 1 ? '' : 's'}? This action cannot be undone.`,
      )
    )
      return

    try {
      setBulkUpdateLoading(true)
      const result = await vendorContactsApi.bulkDelete(organizationId, selectedContacts)
      notify.success({
        key: 'network.bulkDeleteSuccess',
        params: { count: result.deleted_count },
        fallback: result.message,
      })
      await fetchContacts(currentPage)
      try {
        const options = await vendorContactsApi.getFilterOptions(organizationId)
        setFilterOptions({
          locations: options.locations || [],
          categories: options.categories || [],
          tags: options.tags || [],
        })
      } catch {
        /* ignore */
      }
      setSelectedContacts([])
    } catch (error: unknown) {
      notify.error({
        key: 'network.bulkDeleteFailed',
        fallback: getApiErrorMessage(error),
      })
    } finally {
      setBulkUpdateLoading(false)
    }
  }

  const handleBulkCategoryUpdate = async (categoryNames: string[]) => {
    if (selectedContacts.length === 0) return

    const selectedContactObjects = contacts.filter((c) => selectedContacts.includes(c.id))
    const hasExistingCategories = selectedContactObjects.some(
      (c) => c.categories && c.categories.length > 0,
    )
    let categoryMode: 'replace' | 'append' = 'replace'
    if (hasExistingCategories) {
      const userChoice = confirm(
        `Some selected contacts already have categories.\n\nClick "OK" to ADD this category to their existing categories.\nClick "Cancel" to REPLACE their categories with this new category.`,
      )
      categoryMode = userChoice ? 'append' : 'replace'
    }

    try {
      setBulkUpdateLoading(true)
      const result = await vendorContactsApi.bulkUpdate(organizationId, selectedContacts, {
        categories: categoryNames,
        category_mode: categoryMode,
      })
      notify.success({
        key: 'network.bulkUpdateSuccess',
        params: { count: result.updated_count },
        fallback: result.message,
      })
      await fetchContacts(currentPage)
      setSelectedContacts([])
    } catch (error: unknown) {
      notify.error({
        key: 'network.bulkUpdateFailed',
        fallback: getApiErrorMessage(error),
      })
    } finally {
      setBulkUpdateLoading(false)
    }
  }

  const handleBulkTags = async (tags: string[]) => {
    if (selectedContacts.length === 0 || tags.length === 0) return

    try {
      setBulkUpdateLoading(true)
      // Append tags without clobbering existing ones (bulkUpdate replaces the tag set).
      await Promise.all(
        selectedContacts.map((contactId) =>
          Promise.all(tags.map((tag) => vendorContactsApi.addTag(contactId, tag))),
        ),
      )
      notify.success({
        key: 'network.bulkUpdateSuccess',
        params: { count: selectedContacts.length },
        fallback: `Added ${tags.length} tag${tags.length === 1 ? '' : 's'} to ${selectedContacts.length} contact${selectedContacts.length === 1 ? '' : 's'}.`,
      })
      await refreshFilterOptions()
      await fetchContacts(currentPage)
      setSelectedContacts([])
    } catch (error: unknown) {
      notify.error({
        key: 'network.bulkUpdateFailed',
        fallback: getApiErrorMessage(error),
      })
    } finally {
      setBulkUpdateLoading(false)
    }
  }

  const handleBulkLocation = async (location: string) => {
    if (selectedContacts.length === 0 || !location.trim()) return

    try {
      setBulkUpdateLoading(true)
      const result = await vendorContactsApi.bulkUpdate(organizationId, selectedContacts, {
        location: location.trim(),
      })
      notify.success({
        key: 'network.bulkUpdateSuccess',
        params: { count: result.updated_count },
        fallback: result.message,
      })
      await refreshFilterOptions()
      await fetchContacts(currentPage)
      setSelectedContacts([])
    } catch (error: unknown) {
      notify.error({
        key: 'network.bulkUpdateFailed',
        fallback: getApiErrorMessage(error),
      })
    } finally {
      setBulkUpdateLoading(false)
    }
  }

  // Manual list viewing state
  const [viewingManualList, setViewingManualList] = useState<{ id: number; name: string } | null>(
    null,
  )

  const clearAllFilters = () => {
    setActiveFilters([])
    setUpdatedAtRange('all')
    setEventFilter('all')
    setEventStatusFilter('all')
    setSocialFilter([])
    setViewingManualList(null)
    setViewingImportBatch(false)
  }

  // Apply client-side filters that the backend doesn't support
  const applyClientSideFilters = (data: VendorContact[]): VendorContact[] => {
    let filtered = data
    if (updatedAtRange !== 'all') {
      const now = Date.now()
      const ranges: Record<string, number> = {
        '24h': 86400000,
        '48h': 172800000,
        '7d': 604800000,
        '30d': 2592000000,
      }
      const cutoff = now - ranges[updatedAtRange]
      filtered = filtered.filter((c) => new Date(c.updated_at).getTime() >= cutoff)
    }
    if (eventFilter === 'none') {
      filtered = filtered.filter((c) => (c.events_participated || 0) === 0)
    } else if (eventFilter !== 'all') {
      // Filter by specific event ID
      const eventId = Number(eventFilter)
      filtered = filtered.filter((c) =>
        (c.event_history || []).some((eh) => {
          if (eh.event_id !== eventId) return false
          if (eventStatusFilter !== 'all') return eh.status?.toLowerCase() === eventStatusFilter
          return true
        }),
      )
    } else if (eventStatusFilter !== 'all') {
      // Status filter without specific event — match any event with that status
      filtered = filtered.filter((c) =>
        (c.event_history || []).some((eh) => eh.status?.toLowerCase() === eventStatusFilter),
      )
    }
    if (socialFilter.length > 0) {
      // Match contacts that have any of the selected social platforms
      filtered = filtered.filter((c) =>
        socialFilter.some((s) => {
          if (s === 'instagram') return !!c.instagram_handle
          if (s === 'tiktok') return !!c.tiktok_handle
          if (s === 'website') return !!c.website
          return false
        }),
      )
    }
    return filtered
  }

  // Fetch all filtered contacts (used by export modal)
  const fetchAllFilteredContacts = async (): Promise<VendorContact[]> => {
    let allContacts: VendorContact[] = []
    const totalPages = paginationMeta.total_pages
    for (let p = 1; p <= totalPages; p++) {
      const response = await vendorContactsApi.getAll(organizationId, {
        search: searchTerm || undefined,
        location: locationFilters.length > 0 ? locationFilters : undefined,
        category: categoryFilters.length > 0 ? categoryFilters : undefined,
        tags: tagFilters.length > 0 ? tagFilters : undefined,
        page: p,
        per_page: 200,
      })
      allContacts.push(...(response.vendor_contacts || []))
    }
    if (locationFilters.length > 1) {
      allContacts = allContacts.filter((c) => c.location && locationFilters.includes(c.location))
    }
    if (categoryFilters.length > 1) {
      allContacts = allContacts.filter((c) =>
        c.categories?.some((cat) => categoryFilters.includes(cat)),
      )
    }
    return applyClientSideFilters(allContacts)
  }

  // Fetch full contact details before opening edit modal
  const handleEditContact = useCallback(async (contact: VendorContact) => {
    try {
      // Fetch full contact with event history and change history
      const fullContact = await vendorContactsApi.getById(contact.id)
      setEditingContact(fullContact)
    } catch (error) {
      console.error('Failed to fetch contact details:', error)
      // Fallback to partial contact if fetch fails
      setEditingContact(contact)
    }
  }, [])

  const emptyCategory = {
    name: '',
    color: '#FF6B6B',
    description: '',
  }

  // Category CRUD functions
  const openAddCategoryModal = () => {
    setEditingCategory(null)
    setCategoryFormData({ ...emptyCategory })
    setPaymentPreferences([])
    setFeeTypeDropdownOpen(false)
    setShowCategoryModal(true)
  }

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      color: category.color || '#FF6B6B',
      description: category.description || '',
    })
    setPaymentPreferences(category.payment_preferences || [])
    setFeeTypeDropdownOpen(false)
    setShowCategoryModal(true)
  }

  const addFeeType = (type: CategoryFeePreference['type']) => {
    const typeDef = PAYMENT_PRICE_TYPES.find((p) => p.value === type)
    setPaymentPreferences((prev) => [
      ...prev,
      {
        type,
        label: typeDef?.label || type,
        amount: 0,
        is_percentage: typeDef?.isPercentage || false,
      },
    ])
    setFeeTypeDropdownOpen(false)
  }

  const removeFeeType = (index: number) => {
    setPaymentPreferences((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFeeAmount = (index: number, amount: number) => {
    setPaymentPreferences((prev) => prev.map((p, i) => (i === index ? { ...p, amount } : p)))
  }

  const availableFeeTypes = PAYMENT_PRICE_TYPES.filter((pt) => pt.value !== 'custom')

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      notify.error({ key: 'network.categoryNameRequired' })
      return
    }
    const payload = {
      name: categoryFormData.name.trim(),
      color: categoryFormData.color,
      description: categoryFormData.description.trim() || undefined,
      payment_preferences: paymentPreferences.length > 0 ? paymentPreferences : undefined,
    }
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, payload)
      } else {
        await categoriesApi.create(organizationId, payload)
      }
      await loadCategories()
      setShowCategoryModal(false)
      setEditingCategory(null)
      setCategoryFormData({ ...emptyCategory })
      setPaymentPreferences([])
    } catch (error: unknown) {
      notify.error({
        key: 'network.saveCategoryFailed',
        fallback: getApiErrorMessage(error),
      })
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    if (category.in_use) {
      const stats = category.usage_stats
      const usageDetails = []
      if (stats?.applications_count)
        usageDetails.push(`${stats.applications_count} vendor application(s)`)
      if (stats?.email_templates_count)
        usageDetails.push(`${stats.email_templates_count} email template(s)`)
      if (stats?.scheduled_emails_count)
        usageDetails.push(`${stats.scheduled_emails_count} scheduled email(s)`)
      notify.warning({
        key: 'network.deleteCategoryBlocked',
        params: { usageDetails: usageDetails.join('\n') },
      })
      return
    }
    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) return
    try {
      await categoriesApi.delete(category.id)
      await loadCategories()
    } catch (error: unknown) {
      notify.error({
        key: 'network.deleteCategoryFailed',
        fallback: getApiErrorMessage(error),
      })
    }
  }

  const handleViewCategory = (category: Category) => {
    setActiveFilters([{ fieldKey: 'category', values: [category.name] }])
    onTabChange?.('contacts')
  }

  // Commit a draft from the filter panel into the live (server + client) filters.
  const handleApplyFilters = (draft: FilterDraft) => {
    const nextActive: ActiveFilter[] = []
    if (draft.category.length > 0) nextActive.push({ fieldKey: 'category', values: draft.category })
    if (draft.location.length > 0) nextActive.push({ fieldKey: 'location', values: draft.location })
    if (draft.tags.length > 0) nextActive.push({ fieldKey: 'tags', values: draft.tags })
    setActiveFilters(nextActive)
    setUpdatedAtRange(draft.updated as typeof updatedAtRange)
    setEventFilter(draft.event)
    setEventStatusFilter(draft.eventStatus)
    setSocialFilter(draft.social)
    setViewingManualList(null)
    setViewingImportBatch(false)
    setShowFilterPanel(false)
  }

  // Apply a saved query (smart list) — load its filters into the active filter set.
  const handleApplyQuery = (query: ContactList) => {
    const nextActive: ActiveFilter[] = []
    const f = query.filters || {}
    if (f.categories?.length) nextActive.push({ fieldKey: 'category', values: f.categories })
    if (f.locations?.length) nextActive.push({ fieldKey: 'location', values: f.locations })
    if (f.tags?.length) nextActive.push({ fieldKey: 'tags', values: f.tags })
    setActiveFilters(nextActive)
    setUpdatedAtRange('all')
    setEventFilter('all')
    setEventStatusFilter('all')
    setSocialFilter([])
    setViewingManualList(null)
    setViewingImportBatch(false)
    setShowFilterPanel(false)
  }

  // Save the current filter draft as a reusable query (smart list).
  const handleSaveQuery = async (name: string, draft: FilterDraft) => {
    if (!name.trim()) return
    setSavingQuery(true)
    try {
      await contactListsApi.create(organizationId, {
        name: name.trim(),
        list_type: 'smart',
        filters: {
          locations: draft.location.length > 0 ? draft.location : undefined,
          categories: draft.category.length > 0 ? draft.category : undefined,
          tags: draft.tags.length > 0 ? draft.tags : undefined,
        },
      })
      await loadSavedQueries()
      notify.success({ key: 'network.saveQuerySaved', fallback: `Saved query "${name.trim()}"` })
    } catch (err: unknown) {
      notify.error({
        key: 'network.saveListFailed',
        fallback: getApiErrorMessage(err),
      })
    } finally {
      setSavingQuery(false)
    }
  }

  const handleDeleteQuery = async (query: ContactList) => {
    if (!confirm(`Delete saved query "${query.name}"?`)) return
    try {
      await contactListsApi.delete(query.id)
      await loadSavedQueries()
    } catch (err: unknown) {
      notify.error({
        key: 'network.deleteListFailed',
        fallback: getApiErrorMessage(err),
      })
    }
  }

  // Get displayed contacts (with client-side filters applied)
  const displayedContacts = applyClientSideFilters(contacts)

  // Loading state
  if (loading && contacts.length === 0 && activeTab === 'contacts') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-foreground/60">Loading your network...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && contacts.length === 0 && activeTab === 'contacts') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchContacts()}
            className="px-4 py-2 bg-background/10 hover:bg-background/20 text-foreground rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Empty state (no contacts at all)
  if (contacts.length === 0 && !searchTerm && !hasActiveFilters && activeTab === 'contacts') {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-card/80 dark:bg-background/10">
              <UserPlus className="w-8 h-8 text-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Start Building Your Network
            </h3>
            <p className="text-foreground/50 text-sm mb-6">
              Add vendors to your network to easily invite them to future events.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 voxxy-btn-cta text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                Add Your First Contact
              </button>
              <button
                onClick={() => setShowCSVUploadModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-background/10 hover:bg-background/20 text-foreground text-sm font-medium rounded-lg transition-all border border-border"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
            </div>
          </div>
        </div>

        {showAddModal && (
          <AddContactModal
            organizationId={organizationId}
            onClose={() => setShowAddModal(false)}
            onSuccess={(newContact) => {
              setContacts((prev) => [newContact, ...prev])
              setShowAddModal(false)
            }}
          />
        )}
        {showCSVUploadModal && (
          <CSVUploadModal
            open={showCSVUploadModal}
            onClose={() => setShowCSVUploadModal(false)}
            organizationId={organizationId}
            onSuccess={handleImportSuccess}
          />
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and tabs removed - now in Dashboard.tsx header */}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <>
          {/* Search & filter bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/65 dark:text-foreground/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder="Search contacts..."
                  className="voxxy-input-frost w-full rounded-lg py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-ring/40"
                />
              </div>

              {/* Filter button + panel */}
              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterPanel((p) => !p)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${
                    activeFilterCount > 0
                      ? 'border-primary/40 bg-primary/20 text-violet-950 dark:border-primary/30 dark:text-primary'
                      : 'border-border bg-card/80 text-foreground hover:bg-accent/60 dark:bg-card/50 dark:text-foreground/80 dark:border-white/10'
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/50 text-[10px] font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`}
                  />
                </button>
                <FilterPanel
                  open={showFilterPanel}
                  options={{
                    categories: filterOptions.categories,
                    locations: filterOptions.locations,
                    tags: filterOptions.tags,
                    events: orgEvents,
                  }}
                  initial={{
                    category: categoryFilters,
                    location: locationFilters,
                    tags: tagFilters,
                    social: socialFilter,
                    updated: updatedAtRange,
                    event: eventFilter,
                    eventStatus: eventStatusFilter,
                  }}
                  savedQueries={savedQueries}
                  savingQuery={savingQuery}
                  onApply={handleApplyFilters}
                  onClear={clearAllFilters}
                  onApplyQuery={handleApplyQuery}
                  onSaveQuery={handleSaveQuery}
                  onDeleteQuery={handleDeleteQuery}
                />
              </div>

              <div className="relative" ref={actionsMenuRef}>
                <button
                  onClick={() => setActionsMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-2.5 voxxy-btn-cta text-xs font-semibold rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Actions</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${actionsMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {actionsMenuOpen && (
                  <div className="voxxy-select-surface absolute right-0 top-full mt-1 z-50 w-48 rounded-lg shadow-xl overflow-hidden">
                    <button
                      onClick={() => {
                        setShowAddModal(true)
                        setActionsMenuOpen(false)
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-foreground hover:bg-primary/10 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add Contact
                    </button>
                    <button
                      onClick={() => {
                        setShowCSVUploadModal(true)
                        setActionsMenuOpen(false)
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-foreground hover:bg-primary/10 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Import CSV
                    </button>
                    <button
                      onClick={() => {
                        setShowBulkEditModal(true)
                        setActionsMenuOpen(false)
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-foreground hover:bg-primary/10 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {BULK_EDIT_LABEL}
                    </button>
                    <button
                      onClick={() => {
                        setShowExportModal(true)
                        setActionsMenuOpen(false)
                      }}
                      disabled={displayedContacts.length === 0}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-foreground hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Import batch view banner */}
          {viewingImportBatch && importSession && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/15 border border-primary/30 rounded-lg">
              <Upload className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground/80">Viewing this import</span>
              <button
                type="button"
                onClick={clearImportBatchView}
                className="ml-auto flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          )}

          {/* Manual List Banner */}
          {viewingManualList && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/15 border border-purple-500/30 rounded-lg">
              <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-sm text-foreground/80">
                Viewing list:{' '}
                <span className="font-semibold text-foreground">{viewingManualList.name}</span>
              </span>
              <button
                onClick={() => {
                  setViewingManualList(null)
                  fetchContacts(1)
                }}
                className="ml-auto flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          )}

          {/* No results */}
          {displayedContacts.length === 0 &&
            (searchTerm || hasActiveFilters || viewingManualList) && (
              <div className="voxxy-surface-subtle text-center rounded-lg py-12">
                <p className="text-foreground/80 dark:text-foreground/50 text-sm">
                  {searchTerm
                    ? `No contacts found for "${searchTerm}"`
                    : viewingManualList
                      ? 'This list has no contacts'
                      : 'No contacts match the selected filters'}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    clearAllFilters()
                    fetchContacts(1)
                  }}
                  className="mt-3 text-violet-900 hover:text-violet-800 dark:text-primary dark:hover:text-primary/70 text-sm underline transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}

          {/* Contacts Table */}
          {displayedContacts.length > 0 && (
            <ContactsTable
              contacts={displayedContacts}
              selectedContacts={selectedContacts}
              onSelectContact={handleSelectContact}
              onSelectAll={handleSelectAll}
              onDeleteContact={handleDeleteContact}
              onEditContact={handleEditContact}
              onViewContact={setViewingContact}
              paginationMeta={paginationMeta}
              onPageChange={handlePageChange}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          )}

          {/* Modals */}
          {showAddModal && (
            <AddContactModal
              organizationId={organizationId}
              onClose={() => setShowAddModal(false)}
              onSuccess={(newContact) => {
                setContacts((prev) => [newContact, ...prev])
                setShowAddModal(false)
              }}
            />
          )}
          {editingContact && (
            <EditContactModal
              organizationId={organizationId}
              contact={editingContact}
              onClose={() => setEditingContact(null)}
              onSuccess={(updatedContact) => {
                setContacts((prev) =>
                  prev.map((c) => (c.id === updatedContact.id ? updatedContact : c)),
                )
                setEditingContact(null)
              }}
            />
          )}
          {viewingContact && (
            <ViewContactModal
              contact={viewingContact}
              onClose={() => setViewingContact(null)}
              onEdit={() => {
                const contact = viewingContact
                setViewingContact(null)
                handleEditContact(contact)
              }}
            />
          )}
          {showCSVUploadModal && (
            <CSVUploadModal
              open={showCSVUploadModal}
              onClose={() => setShowCSVUploadModal(false)}
              organizationId={organizationId}
              onSuccess={handleImportSuccess}
            />
          )}
          <ContactExportModal
            open={showExportModal}
            onClose={() => setShowExportModal(false)}
            contactCount={displayedContacts.length}
            organizationSlug={organizationSlug}
            fetchAllContacts={fetchAllFilteredContacts}
          />
          <BulkEditModal
            open={showBulkEditModal}
            onClose={() => setShowBulkEditModal(false)}
            selectedCount={selectedContacts.length}
            categories={categories}
            availableTags={filterOptions.tags}
            onApplyCategory={handleBulkCategoryUpdate}
            onApplyTags={handleBulkTags}
            onApplyLocation={handleBulkLocation}
            onDelete={handleBulkDelete}
            onClearSelection={() => setSelectedContacts([])}
            loading={bulkUpdateLoading}
          />
        </>
      )}

      {/* Lists Tab */}
      {activeTab === 'lists' && (
        <ListsManagement
          organizationId={organizationId}
          onViewList={(filters) => {
            setViewingManualList(null)
            const newFilters: ActiveFilter[] = []
            if (filters.locations?.length)
              newFilters.push({ fieldKey: 'location', values: filters.locations })
            if (filters.categories?.length)
              newFilters.push({ fieldKey: 'category', values: filters.categories })
            if (filters.tags?.length) newFilters.push({ fieldKey: 'tags', values: filters.tags })
            setActiveFilters(newFilters)
            onTabChange?.('contacts')
          }}
          onViewManualList={handleViewManualList}
        />
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/60">
              Manage vendor categories for organizing contacts
            </p>
            <button
              onClick={openAddCategoryModal}
              className="flex items-center gap-2 px-4 py-2.5 voxxy-btn-cta text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="voxxy-surface-subtle text-center rounded-lg py-12">
              <Tag className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
              <p className="text-foreground/60 text-sm">No categories yet</p>
              <p className="text-foreground/40 text-xs mt-1">
                Create your first category to organize your vendors
              </p>
            </div>
          ) : (
            <div className="voxxy-table-shell divide-y divide-border rounded-lg overflow-hidden">
              {categories.map((category) => {
                const prefs = category.payment_preferences || []
                const defaultBoothPrice = category.default_booth_price
                  ? Number(category.default_booth_price)
                  : 0
                const hasPrefs = prefs.length > 0
                const hasSmartDefaults = defaultBoothPrice > 0 && !hasPrefs

                return (
                  <div
                    key={category.id}
                    className="group voxxy-table-row voxxy-table-row-hover flex items-center gap-3 px-4 py-3"
                  >
                    {/* Color swatch */}
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color || '#9054e3' }}
                    />

                    {/* Name + description */}
                    <div className="min-w-0 w-40 flex-shrink-0">
                      <div className="font-semibold text-sm text-foreground truncate">
                        {category.name}
                      </div>
                      {category.description ? (
                        <div className="text-xs text-foreground/50 truncate">
                          {category.description}
                        </div>
                      ) : (
                        <div className="text-xs text-foreground/30 italic">No description</div>
                      )}
                    </div>

                    {/* Payment preference badges */}
                    <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                      {hasPrefs ? (
                        prefs.map((pref, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20"
                          >
                            {pref.is_percentage ? (
                              <Percent className="w-3 h-3 text-primary/70" />
                            ) : (
                              <DollarSign className="w-3 h-3 text-primary/70" />
                            )}
                            <span className="text-xs font-semibold text-primary/90">
                              {pref.is_percentage
                                ? `${pref.amount}%`
                                : `$${Number(pref.amount).toFixed(2)}`}
                            </span>
                            <span className="text-[10px] text-primary/60">{pref.label}</span>
                          </div>
                        ))
                      ) : hasSmartDefaults ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                          <DollarSign className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            ${defaultBoothPrice.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-blue-600/70 dark:text-blue-400/70">
                            last event
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-foreground/5 border border-border">
                          <DollarSign className="w-3 h-3 text-foreground/40" />
                          <span className="text-xs text-foreground/40">No preferences set</span>
                        </div>
                      )}
                    </div>

                    {/* Contact count */}
                    <div className="flex items-center gap-1.5 text-xs text-foreground/50 flex-shrink-0">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {category.usage_stats?.contacts_count || 0} contact
                        {category.usage_stats?.contacts_count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewCategory(category)}
                        className="p-1.5 rounded-md hover:bg-background/10 text-foreground/60 hover:text-foreground transition-all"
                        title="View contacts"
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditCategoryModal(category)}
                        className="p-1.5 rounded-md hover:bg-background/10 text-foreground/60 hover:text-foreground transition-all"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-foreground/60 hover:text-red-400 transition-all"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 voxxy-overlay-scrim">
          <div className="w-full max-w-xl rounded-xl voxxy-modal-surface shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="voxxy-gradient-modal-header px-5 py-3 flex items-center justify-between border-b border-primary/20 flex-shrink-0 rounded-t-xl">
              <h3 className="text-sm font-semibold text-foreground">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setEditingCategory(null)
                  setCategoryFormData({ ...emptyCategory })
                  setPaymentPreferences([])
                }}
                className="p-1 rounded-lg hover:bg-background/10 text-foreground/60 hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Food Vendor, Artist, Sponsor"
                  className="voxxy-input-frost w-full"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={categoryFormData.color}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({ ...prev, color: e.target.value }))
                    }
                    className="h-8 w-12 cursor-pointer rounded border border-border bg-transparent"
                  />
                  <input
                    type="text"
                    value={categoryFormData.color}
                    onChange={(e) => {
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                        setCategoryFormData((prev) => ({ ...prev, color: e.target.value }))
                      }
                    }}
                    placeholder="#FF6B6B"
                    className="voxxy-input-frost flex-1"
                    maxLength={7}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Description <span className="text-foreground/40 font-normal">— Optional</span>
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Internal notes about this vendor category"
                  rows={2}
                  className="voxxy-input-frost w-full resize-none"
                />
              </div>

              {/* Payment Preferences — fee type picker */}
              <div className="bg-background/5 rounded-xl p-4 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground/70">Payment Preferences</p>
                  <p className="text-[10px] text-foreground/40">
                    Amounts pre-fill the event wizard. Dates set per event.
                  </p>
                </div>

                {/* Added fee rows */}
                {paymentPreferences.length === 0 && (
                  <p className="text-xs text-foreground/40 italic py-1">
                    No fee types added yet. Use "+ Add Fee Type" to set a preference.
                  </p>
                )}
                {paymentPreferences.map((pref, idx) => (
                  <div
                    key={idx}
                    className="bg-background/5 rounded-lg p-3 border border-border/60 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pref.label}
                        onChange={(e) =>
                          setPaymentPreferences((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, label: e.target.value } : p)),
                          )
                        }
                        className="voxxy-input-frost flex-1 text-xs py-1"
                        placeholder="Label (e.g. Early Bird - Aug)"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeeType(idx)}
                        className="p-1 rounded hover:bg-red-500/20 text-foreground/40 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/50 text-xs">
                        {pref.is_percentage ? <Percent className="w-3 h-3" /> : '$'}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step={pref.is_percentage ? '0.1' : '0.01'}
                        value={pref.amount || ''}
                        onChange={(e) => updateFeeAmount(idx, parseFloat(e.target.value) || 0)}
                        placeholder={pref.is_percentage ? '10' : '150.00'}
                        className="voxxy-input-frost w-full pl-6 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Fee Type strip — outside overflow-y-auto to prevent dropdown clipping */}
            <div className="px-5 py-2.5 border-t border-border/40 flex-shrink-0 relative">
              <button
                type="button"
                onClick={() => setFeeTypeDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg voxxy-btn-solid transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Fee Type
              </button>
              {feeTypeDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[90]"
                    onClick={() => setFeeTypeDropdownOpen(false)}
                  />
                  <div className="absolute left-5 bottom-full mb-1 w-72 bg-card border border-border rounded-lg shadow-xl z-[91] overflow-hidden">
                    {availableFeeTypes.map((pt) => (
                      <button
                        key={pt.value}
                        type="button"
                        onClick={() => addFeeType(pt.value as CategoryFeePreference['type'])}
                        className="w-full flex flex-col items-start px-3 py-2.5 text-left hover:bg-background/10 transition-colors"
                      >
                        <span className="text-xs font-medium text-foreground">{pt.label}</span>
                        <span className="text-[10px] text-foreground/50">{pt.description}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border flex justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setEditingCategory(null)
                  setCategoryFormData({ ...emptyCategory })
                  setPaymentPreferences([])
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-border text-foreground hover:bg-background/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={!categoryFormData.name.trim()}
                className="px-3 py-1.5 text-xs rounded-lg voxxy-btn-solid disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
              >
                {editingCategory ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
