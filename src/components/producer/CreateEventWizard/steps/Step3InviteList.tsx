import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { WizardStepProps } from '../types'
import { vendorContactsApi, contactListsApi, VendorContact, ContactList } from '@/services/api'
import { DebugPanel } from '../../DebugPanel'
import { TABLE_HEADER_CLASSES, TABLE_ROW_CLASSES } from '@/components/shared/tableStyles'

interface Step3InviteListProps extends WizardStepProps {
  organizationId: number
}

/**
 * Step3InviteList - Contact selection for event invitations
 *
 * Third step of the event creation wizard. Allows producers to select which
 * vendor contacts will receive invitations. Features immediate import with
 * live preview (no modal workflow).
 *
 * Features:
 * - **Immediate Import**: Contacts imported automatically when lists selected
 * - **Multi-select**: Can select multiple contact lists simultaneously
 * - **"Invite All Contacts"**: Single option to invite entire contact database
 * - **Live Preview**: Table view appears immediately with contact details
 * - **Unsubscribe Filtering**: Shows which contacts won't receive emails
 * - **Visual Indicators**: Color-coded unsubscribe status badges
 * - **Search**: Filter contacts by name, email, or business
 * - **Pagination**: 50 contacts per page with navigation
 * - **Bulk Actions**: Select multiple contacts to remove
 * - **Change Selection**: Reset and start over with different lists
 *
 * Selection Modes:
 * 1. Invite All Contacts - Fetches all contacts from organization
 * 2. Select Contact Lists - Choose one or more saved contact lists
 * 3. Mixed mode not supported - selecting lists deselects "Invite All"
 *
 * Unsubscribe Status:
 * - 🟢 Active: Contact will receive emails
 * - 🔴 Global: Unsubscribed at global level (won't receive any emails)
 * - 🟡 Org: Unsubscribed at organization level (won't receive emails from this org)
 *
 * Data Flow:
 * 1. User selects contact lists → Immediate API fetch
 * 2. Contacts loaded and de-duplicated by ID
 * 3. Table view updates automatically
 * 4. Unsubscribe warnings displayed if applicable
 * 5. State updates with invited contact IDs
 *
 * Validation:
 * - No validation required (step is optional)
 * - Can create event without inviting anyone
 * - Invitations can be sent later from event page
 *
 * @param {Step3InviteListProps} props - Wizard state and organization context
 * @param {WizardState} props.wizardState - Current wizard state
 * @param {Function} props.updateWizardState - Function to update wizard state
 * @param {number} props.organizationId - Current organization ID
 * @param {boolean} props.isAdmin - Whether user is admin (shows debug panel)
 *
 * @returns {JSX.Element} Step 3 contact selection UI with immediate import
 */
export default function Step3InviteList({
  wizardState,
  updateWizardState,
  organizationId,
  isAdmin,
}: Step3InviteListProps) {
  const [contacts, setContacts] = useState<VendorContact[]>([])
  const [lists, setLists] = useState<ContactList[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingLists, setLoadingLists] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([])
  const [inviteAllSelected, setInviteAllSelected] = useState(false)
  const [selectedListIds, setSelectedListIds] = useState<number[]>([])
  const [totalContactsCount, setTotalContactsCount] = useState(0)
  const perPage = 50

  // PHASE 4: Backend pagination state (like Network page)
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: perPage,
  })

  // Track which IDs we've already fetched to avoid redundant requests
  const fetchedIdsRef = useRef<string>('')

  const { inviteList } = wizardState
  const invitedContactIds = inviteList.invitedContactIds ?? []

  // Stable serialized key for the invited IDs — avoids re-running effect on ref changes
  const invitedIdsKey = JSON.stringify(invitedContactIds)

  // Load contact lists on mount
  useEffect(() => {
    fetchLists()
  }, [organizationId])

  // PERFORMANCE FIX: Disabled to prevent double-fetching
  // Contacts are now set directly in handleAutoImport instead of fetching twice
  // This eliminates the second API call that was fetching the same data again
  //
  // Load full contact details when we have IDs (and they've actually changed)
  // useEffect(() => {
  //   if (invitedContactIds.length > 0 && fetchedIdsRef.current !== invitedIdsKey) {
  //     fetchContactDetails();
  //   } else if (invitedContactIds.length === 0) {
  //     setContacts([]);
  //     fetchedIdsRef.current = '';
  //   }
  // }, [invitedIdsKey, organizationId]);

  const fetchLists = async () => {
    try {
      setLoadingLists(true)
      const [listsResponse, contactsResponse] = await Promise.all([
        contactListsApi.getAll(organizationId),
        vendorContactsApi.getAll(organizationId, { page: 1, per_page: 1 }),
      ])
      setLists(listsResponse?.contact_lists || [])
      setTotalContactsCount(contactsResponse?.meta?.total_count || 0)
    } catch (err) {
      console.error('Failed to fetch lists:', err)
      setLists([])
      setTotalContactsCount(0)
    } finally {
      setLoadingLists(false)
    }
  }

  // PHASE 4: Fetch contacts page by page (backend pagination like Network page)
  const fetchContactsPage = async (page: number, contactIds?: number[]) => {
    const idsToFetch = contactIds || invitedContactIds

    if (idsToFetch.length === 0) {
      setContacts([])
      setPaginationMeta({ current_page: 1, total_pages: 1, total_count: 0, per_page: perPage })
      return
    }

    try {
      setLoading(true)

      // Calculate which subset of IDs to fetch for this page
      const startIndex = (page - 1) * perPage
      const endIndex = startIndex + perPage
      const pageIds = idsToFetch.slice(startIndex, endIndex)

      // Use Phase 3's by_ids endpoint to fetch only this page
      const response = await vendorContactsApi.getByIds(organizationId, pageIds, {
        per_page: perPage,
      })

      const contactsData = response?.vendor_contacts || []

      // Calculate pagination metadata
      const totalCount = idsToFetch.length
      const totalPages = Math.ceil(totalCount / perPage)

      setContacts(contactsData)
      setPaginationMeta({
        current_page: page,
        total_pages: totalPages,
        total_count: totalCount,
        per_page: perPage,
      })
      setCurrentPage(page)
    } catch (err) {
      console.error('Failed to fetch contacts page:', err)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchContactDetails = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch page 1 to get total_pages, then remaining pages in parallel
      const firstPage = await vendorContactsApi.getAll(organizationId, {
        page: 1,
        per_page: 200,
      })

      let allContacts: VendorContact[] = firstPage?.vendor_contacts || []
      const totalPages = firstPage?.meta?.total_pages || 1

      if (totalPages > 1) {
        // Fetch remaining pages in parallel
        const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
        const pageResults = await Promise.all(
          remainingPages.map((page) =>
            vendorContactsApi.getAll(organizationId, { page, per_page: 200 }),
          ),
        )
        for (const result of pageResults) {
          allContacts = allContacts.concat(result?.vendor_contacts || [])
        }
      }

      // Filter to only invited contacts using a Set for O(1) lookups
      const invitedSet = new Set(invitedContactIds)
      const invitedContacts = allContacts.filter((c) => invitedSet.has(c.id))
      setContacts(invitedContacts)
      fetchedIdsRef.current = invitedIdsKey
    } catch (err) {
      console.error('Failed to fetch contact details:', err)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }, [organizationId, invitedIdsKey])

  // Import contacts immediately when selection changes
  useEffect(() => {
    if (invitedContactIds.length === 0) {
      // Only auto-import if we're in selection mode (not already imported)
      handleAutoImport()
    }
  }, [])

  // PHASE 4: Refactored to only fetch IDs (like Network page)
  const handleAutoImport = async (inviteAll?: boolean, listIds?: number[]) => {
    const shouldInviteAll = inviteAll ?? false
    const selectedLists = listIds ?? []

    if (!shouldInviteAll && selectedLists.length === 0) {
      // Clear selection
      updateWizardState({
        inviteList: {
          ...inviteList,
          invitedContactIds: [],
        },
      })
      setContacts([])
      setPaginationMeta({ current_page: 1, total_pages: 1, total_count: 0, per_page: perPage })
      fetchedIdsRef.current = ''
      return
    }

    try {
      setLoading(true)
      let contactIds: number[] = []

      if (shouldInviteAll) {
        // PHASE 4: Only fetch IDs (fast!)
        const result = await vendorContactsApi.getAllIds(organizationId, {})
        contactIds = result.ids
      } else if (selectedLists.length > 0) {
        // PHASE 4: Only fetch IDs from lists (not full contacts)
        const listContactPromises = selectedLists.map(async (listId) => {
          // Fetch first page to get total pages
          const firstPage = await contactListsApi.getContacts(listId, 1, 100)
          let allContacts: any[] = firstPage.vendor_contacts || []
          const totalPages = firstPage?.meta?.total_pages || 1

          // Fetch remaining pages in parallel (if any)
          if (totalPages > 1) {
            const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
            const pageResults = await Promise.all(
              remainingPages.map((page) => contactListsApi.getContacts(listId, page, 100)),
            )
            for (const result of pageResults) {
              allContacts = allContacts.concat(result.vendor_contacts || [])
            }
          }

          return allContacts
        })

        const listContactArrays = await Promise.all(listContactPromises)
        const allListContacts = listContactArrays.flat()

        // De-duplicate by contact ID (only store IDs)
        const uniqueIds = Array.from(new Set(allListContacts.map((contact) => contact.id)))
        contactIds = uniqueIds
      }

      // Update wizard state with IDs
      updateWizardState({
        inviteList: {
          ...inviteList,
          invitedContactIds: contactIds,
        },
      })

      // PHASE 4: Fetch first page of contacts (backend pagination)
      await fetchContactsPage(1, contactIds)
      fetchedIdsRef.current = JSON.stringify(contactIds)
    } catch (err) {
      console.error('Failed to import contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleInviteAll = () => {
    const newInviteAll = !inviteAllSelected
    setInviteAllSelected(newInviteAll)

    if (newInviteAll) {
      // Deselect all lists when selecting "Invite All"
      setSelectedListIds([])
      handleAutoImport(true, [])
    } else {
      // Clear selection
      handleAutoImport(false, [])
    }
  }

  const handleToggleList = (listId: number) => {
    // Deselect "Invite All" when selecting a list
    if (inviteAllSelected) {
      setInviteAllSelected(false)
    }

    const newSelectedLists = selectedListIds.includes(listId)
      ? selectedListIds.filter((id) => id !== listId)
      : [...selectedListIds, listId]

    setSelectedListIds(newSelectedLists)
    handleAutoImport(false, newSelectedLists)
  }

  const handleRemoveContact = (contactId: number) => {
    const newContactIds = invitedContactIds.filter((id) => id !== contactId)

    updateWizardState({
      inviteList: {
        ...inviteList,
        invitedContactIds: newContactIds,
      },
    })

    // PHASE 4: Re-fetch current page with updated IDs
    setSelectedContactIds((prev) => prev.filter((id) => id !== contactId))
    fetchedIdsRef.current = JSON.stringify(newContactIds)
    fetchContactsPage(paginationMeta.current_page, newContactIds)
  }

  const handleToggleSelect = (contactId: number) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    )
  }

  const handleSelectAll = () => {
    if (selectedContactIds.length === paginatedContacts.length) {
      setSelectedContactIds([])
    } else {
      setSelectedContactIds(paginatedContacts.map((c) => c.id))
    }
  }

  const handleDeleteSelected = () => {
    const newContactIds = invitedContactIds.filter((id) => !selectedContactIds.includes(id))

    updateWizardState({
      inviteList: {
        ...inviteList,
        invitedContactIds: newContactIds,
      },
    })

    // PHASE 4: Re-fetch current page with updated IDs
    setSelectedContactIds([])
    fetchedIdsRef.current = JSON.stringify(newContactIds)
    fetchContactsPage(paginationMeta.current_page, newContactIds)
  }

  // PHASE 4: Client-side search on current page (fast since only 50 contacts loaded)
  const filteredContacts = contacts.filter((contact) => {
    if (!searchTerm.trim()) return true
    const search = searchTerm.toLowerCase()
    return (
      contact.contact_name.toLowerCase().includes(search) ||
      contact.affiliation?.toLowerCase().includes(search) ||
      contact.email.toLowerCase().includes(search)
    )
  })

  const paginatedContacts = filteredContacts

  // Calculate unsubscribed contacts count (from current page only)
  const unsubscribedContacts = filteredContacts.filter((c) => c.unsubscribe_status?.is_unsubscribed)
  const unsubscribedCount = unsubscribedContacts.length

  // Selection UI - no contacts invited yet
  if (invitedContactIds.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-background/5 rounded-2xl p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Select Contacts to Invite
            </h2>
            <p className="text-foreground/60 text-sm">
              Choose who will receive invitations for this event
            </p>
          </div>

          {loadingLists ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Invite All Option */}
              <label
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  inviteAllSelected
                    ? 'bg-primary/20 border-primary/40'
                    : 'bg-background/5 border-border hover:bg-background/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={inviteAllSelected}
                  onChange={handleToggleInviteAll}
                  className="w-4 h-4 rounded border-border bg-background/10 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
                />
                <div className="flex-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Invite All Contacts</span>
                </div>
                <div className="text-xs text-foreground/60">({totalContactsCount})</div>
              </label>

              {/* Contact Lists */}
              {lists.map((list) => (
                <label
                  key={list.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedListIds.includes(list.id)
                      ? 'bg-primary/20 border-primary/40'
                      : 'bg-background/5 border-border hover:bg-background/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedListIds.includes(list.id)}
                    onChange={() => handleToggleList(list.id)}
                    className="w-4 h-4 rounded border-border bg-background/10 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{list.name}</div>
                  </div>
                  <div className="text-xs text-foreground/60">({list.contacts_count || 0})</div>
                </label>
              ))}

              {lists.length === 0 && (
                <div className="text-center py-8 bg-background/5 rounded-lg border border-border">
                  <p className="text-foreground/50 text-sm">No contact lists available</p>
                  <p className="text-foreground/40 text-xs mt-1">
                    Create lists in your Network page
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="mt-6 flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
                <span className="text-foreground/60 text-sm">Loading contacts...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Table view - contacts have been imported
  return (
    <>
      <div className="space-y-6">
        <div className="bg-background/5 rounded-2xl p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Invite List</h2>
              <p className="text-foreground/60 text-sm mt-1">
                {paginationMeta.total_count} contacts
              </p>
            </div>
            <button
              onClick={() => {
                updateWizardState({
                  inviteList: {
                    ...inviteList,
                    invitedContactIds: [],
                  },
                })
                setContacts([])
                setPaginationMeta({
                  current_page: 1,
                  total_pages: 1,
                  total_count: 0,
                  per_page: perPage,
                })
                setSearchTerm('')
                fetchedIdsRef.current = ''
              }}
              className="px-4 py-2 bg-background/10 hover:bg-background/20 text-foreground rounded-lg transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Change Selection
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Select who's invited - you can edit this list later before
              going live
            </p>
          </div>

          {/* Unsubscribe Warning Banner */}
          {unsubscribedCount > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700 dark:text-yellow-400" />
                <div>
                  <p className="text-sm text-amber-800 dark:text-yellow-300">
                    <strong>Warning:</strong> {unsubscribedCount}{' '}
                    {unsubscribedCount === 1 ? 'contact is' : 'contacts are'} unsubscribed and won't
                    receive invitations
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-yellow-300/70">
                    Unsubscribed contacts are highlighted below. They opted out at the global or
                    organization level.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar and Actions */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="voxxy-input-frost w-full rounded-lg py-2.5 pl-9 pr-4 text-sm"
              />
            </div>
            {selectedContactIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-destructive-foreground rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                Delete {selectedContactIds.length} Selected
              </button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : paginatedContacts.length === 0 ? (
            <div className="voxxy-surface-subtle text-center rounded-lg py-12">
              <p className="text-sm text-muted-foreground">No contacts match your search</p>
            </div>
          ) : (
            <div className="voxxy-table-shell">
              {/* Table with horizontal scroll */}
              <div className="overflow-x-auto">
                {/* Table Header */}
                <div className="voxxy-table-header">
                  <div className={`voxxy-table-header-row grid min-w-[1100px] grid-cols-[20px,72px,110px,100px,130px,165px,100px,110px,85px,55px,90px] px-2 py-1 ${TABLE_HEADER_CLASSES}`}>
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedContactIds.length === paginatedContacts.length &&
                          paginatedContacts.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 rounded border-border bg-background/10 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
                      />
                    </div>
                    <div>Status</div>
                    <div>First Name</div>
                    <div>Last Name</div>
                    <div>Affiliation</div>
                    <div>Email</div>
                    <div>Phone</div>
                    <div>Location</div>
                    <div>Tags</div>
                    <div>Social</div>
                    <div>Category</div>
                  </div>
                </div>

                {/* Table Body */}
                <div>
                  {paginatedContacts.map((contact) => {
                    const isSelected = selectedContactIds.includes(contact.id)
                    const isUnsubscribed = contact.unsubscribe_status?.is_unsubscribed
                    const unsubscribeScope = contact.unsubscribe_status?.scope

                    // Determine background color based on selection and unsubscribe status
                    let bgClass = ''
                    if (isSelected) {
                      bgClass = 'bg-primary/10'
                    } else if (isUnsubscribed) {
                      bgClass = 'bg-red-500/5'
                    }

                    return (
                      <div
                        key={contact.id}
                        className={`voxxy-table-row voxxy-table-row-hover grid min-w-[1100px] grid-cols-[20px,72px,110px,100px,130px,165px,100px,110px,85px,55px,90px] px-2 py-1 ${TABLE_ROW_CLASSES} ${bgClass}`}
                      >
                        {/* Checkbox */}
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(contact.id)}
                            className="w-3.5 h-3.5 rounded border-border bg-background/10 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* Status */}
                        <div className="flex items-center">
                          {isUnsubscribed ? (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                unsubscribeScope === 'global'
                                  ? 'bg-red-500/20 text-red-950 dark:text-red-300 border border-red-500/30'
                                  : 'bg-yellow-500/20 text-yellow-950 dark:text-yellow-300 border border-yellow-500/30'
                              }`}
                            >
                              {unsubscribeScope === 'global' ? 'Global' : 'Org'}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-green-500/20 text-emerald-900 dark:text-green-300 border border-green-500/30 rounded text-[9px] font-medium">
                              Active
                            </span>
                          )}
                        </div>

                        {/* First Name */}
                        <div className="flex items-center gap-1">
                          <span className="text-foreground truncate">{(contact.contact_name || '').split(' ')[0] || '—'}</span>
                        </div>

                        {/* Last Name */}
                        <div className="flex items-center gap-1">
                          <span className="text-foreground truncate">{(contact.contact_name || '').split(' ').slice(1).join(' ') || '—'}</span>
                        </div>

                        {/* Affiliation */}
                        <div className="flex items-center gap-0.5 text-foreground/60 truncate">
                          {contact.affiliation ? (
                            <span className="truncate">{contact.affiliation}</span>
                          ) : (
                            <span className="text-foreground/40">—</span>
                          )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-0.5 text-foreground/60 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-0.5 text-foreground/60 truncate">
                          {contact.phone && (
                            <>
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{contact.phone}</span>
                            </>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-0.5 text-foreground/60 truncate">
                          {contact.location && (
                            <>
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{contact.location}</span>
                            </>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-0.5">
                          {contact.tags && contact.tags.length > 0 && (
                            <>
                              {contact.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1 py-0.5 text-[9px] bg-primary/20 text-violet-950 dark:text-primary rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {contact.tags.length > 2 && (
                                <span className="px-1 py-0.5 text-[9px] bg-background/10 text-foreground/50 rounded">
                                  +{contact.tags.length - 2}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Social */}
                        <div className="flex items-center gap-1">
                          {contact.instagram_handle && (
                            <a
                              href={`https://instagram.com/${contact.instagram_handle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground/60 hover:text-foreground transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Instagram className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {contact.website && (
                            <a
                              href={contact.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground/60 hover:text-foreground transition-colors text-[10px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              🔗
                            </a>
                          )}
                        </div>

                        {/* Category */}
                        <div>
                          <span className="px-1 py-0.5 bg-background/10 text-foreground/60 rounded text-[10px]">
                            {contact.contact_type}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* PHASE 4: Backend Pagination Footer */}
              <div className="bg-background/5 border-t border-border px-3 py-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="text-foreground/60">
                    Showing {(paginationMeta.current_page - 1) * perPage + 1}-
                    {Math.min(paginationMeta.current_page * perPage, paginationMeta.total_count)} of{' '}
                    {paginationMeta.total_count}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchContactsPage(paginationMeta.current_page - 1)}
                      disabled={paginationMeta.current_page === 1}
                      className="px-2.5 py-1 bg-background/10 hover:bg-background/20 disabled:bg-background/5 disabled:text-foreground/30 text-foreground rounded transition-colors text-[11px]"
                    >
                      Previous
                    </button>
                    <span className="text-foreground/60">
                      Page {paginationMeta.current_page} of {paginationMeta.total_pages}
                    </span>
                    <button
                      onClick={() => fetchContactsPage(paginationMeta.current_page + 1)}
                      disabled={paginationMeta.current_page === paginationMeta.total_pages}
                      className="px-2.5 py-1 bg-background/10 hover:bg-background/20 disabled:bg-background/5 disabled:text-foreground/30 text-foreground rounded transition-colors text-[11px]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Step 3: Invite List"
        data={{
          wizardState,
          inviteList: wizardState.inviteList,
          contacts,
          unsubscribedCount,
          loading,
        }}
        isAdmin={isAdmin}
      />
    </>
  )
}
