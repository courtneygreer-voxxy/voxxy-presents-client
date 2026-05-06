import { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Search, Building2, Mail, Phone, MapPin, Instagram, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { WizardStepProps } from '../types';
import { vendorContactsApi, contactListsApi, VendorContact, ContactList } from '@/services/api';
import { DebugPanel } from '../../DebugPanel';

interface Step3InviteListProps extends WizardStepProps {
  organizationId: number;
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
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [inviteAllSelected, setInviteAllSelected] = useState(false);
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);
  const [totalContactsCount, setTotalContactsCount] = useState(0);
  const perPage = 50;

  // Track which IDs we've already fetched to avoid redundant requests
  const fetchedIdsRef = useRef<string>('');

  const { inviteList } = wizardState;
  const invitedContactIds = inviteList.invitedContactIds ?? [];

  // Stable serialized key for the invited IDs — avoids re-running effect on ref changes
  const invitedIdsKey = JSON.stringify(invitedContactIds);

  // Load contact lists on mount
  useEffect(() => {
    fetchLists();
  }, [organizationId]);

  // Load full contact details when we have IDs (and they've actually changed)
  useEffect(() => {
    if (invitedContactIds.length > 0 && fetchedIdsRef.current !== invitedIdsKey) {
      fetchContactDetails();
    } else if (invitedContactIds.length === 0) {
      setContacts([]);
      fetchedIdsRef.current = '';
    }
  }, [invitedIdsKey, organizationId]);

  const fetchLists = async () => {
    try {
      setLoadingLists(true);
      const [listsResponse, contactsResponse] = await Promise.all([
        contactListsApi.getAll(organizationId),
        vendorContactsApi.getAll(organizationId, { page: 1, per_page: 1 })
      ]);
      setLists(listsResponse?.contact_lists || []);
      setTotalContactsCount(contactsResponse?.meta?.total_count || 0);
    } catch (err) {
      console.error('Failed to fetch lists:', err);
      setLists([]);
      setTotalContactsCount(0);
    } finally {
      setLoadingLists(false);
    }
  };

  const fetchContactDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch page 1 to get total_pages, then remaining pages in parallel
      const firstPage = await vendorContactsApi.getAll(organizationId, {
        page: 1,
        per_page: 200,
      });

      let allContacts: VendorContact[] = firstPage?.vendor_contacts || [];
      const totalPages = firstPage?.meta?.total_pages || 1;

      if (totalPages > 1) {
        // Fetch remaining pages in parallel
        const remainingPages = Array.from(
          { length: totalPages - 1 },
          (_, i) => i + 2
        );
        const pageResults = await Promise.all(
          remainingPages.map((page) =>
            vendorContactsApi.getAll(organizationId, { page, per_page: 200 })
          )
        );
        for (const result of pageResults) {
          allContacts = allContacts.concat(result?.vendor_contacts || []);
        }
      }

      // Filter to only invited contacts using a Set for O(1) lookups
      const invitedSet = new Set(invitedContactIds);
      const invitedContacts = allContacts.filter((c) => invitedSet.has(c.id));
      setContacts(invitedContacts);
      fetchedIdsRef.current = invitedIdsKey;
    } catch (err) {
      console.error('Failed to fetch contact details:', err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, invitedIdsKey]);

  // Import contacts immediately when selection changes
  useEffect(() => {
    if (invitedContactIds.length === 0) {
      // Only auto-import if we're in selection mode (not already imported)
      handleAutoImport();
    }
  }, []);

  const handleAutoImport = async (inviteAll?: boolean, listIds?: number[]) => {
    const shouldInviteAll = inviteAll ?? false;
    const selectedLists = listIds ?? [];

    if (!shouldInviteAll && selectedLists.length === 0) {
      // Clear selection
      updateWizardState({
        inviteList: {
          ...inviteList,
          invitedContactIds: [],
        },
      });
      setContacts([]);
      return;
    }

    try {
      setLoading(true);

      let contactIds: number[] = [];

      if (shouldInviteAll) {
        // Fetch all contacts
        const firstPage = await vendorContactsApi.getAll(organizationId, {
          page: 1,
          per_page: 200,
        });

        let allContacts: VendorContact[] = firstPage?.vendor_contacts || [];
        const totalPages = firstPage?.meta?.total_pages || 1;

        if (totalPages > 1) {
          const remainingPages = Array.from(
            { length: totalPages - 1 },
            (_, i) => i + 2
          );
          const pageResults = await Promise.all(
            remainingPages.map((page) =>
              vendorContactsApi.getAll(organizationId, { page, per_page: 200 })
            )
          );
          for (const result of pageResults) {
            allContacts = allContacts.concat(result?.vendor_contacts || []);
          }
        }
        contactIds = allContacts.map(c => c.id);
      } else if (selectedLists.length > 0) {
        // Fetch contacts from selected lists
        const listContactPromises = selectedLists.map(async (listId) => {
          let allContacts: any[] = [];
          let currentPage = 1;
          let hasMore = true;

          while (hasMore) {
            const response = await contactListsApi.getContacts(listId, currentPage, 100);
            const pageContacts = response.vendor_contacts || [];
            allContacts = [...allContacts, ...pageContacts];

            const meta = response.meta;
            if (meta && currentPage < meta.total_pages) {
              currentPage++;
            } else {
              hasMore = false;
            }
          }
          return allContacts;
        });

        const listContactArrays = await Promise.all(listContactPromises);
        const allListContacts = listContactArrays.flat();

        // De-duplicate by contact ID
        const uniqueContactIds = Array.from(
          new Set(allListContacts.map(contact => contact.id))
        );

        contactIds = uniqueContactIds;
      }

      // Update wizard state immediately
      updateWizardState({
        inviteList: {
          ...inviteList,
          invitedContactIds: contactIds,
        },
      });
    } catch (err) {
      console.error('Failed to import contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInviteAll = () => {
    const newInviteAll = !inviteAllSelected;
    setInviteAllSelected(newInviteAll);

    if (newInviteAll) {
      // Deselect all lists when selecting "Invite All"
      setSelectedListIds([]);
      handleAutoImport(true, []);
    } else {
      // Clear selection
      handleAutoImport(false, []);
    }
  };

  const handleToggleList = (listId: number) => {
    // Deselect "Invite All" when selecting a list
    if (inviteAllSelected) {
      setInviteAllSelected(false);
    }

    const newSelectedLists = selectedListIds.includes(listId)
      ? selectedListIds.filter((id) => id !== listId)
      : [...selectedListIds, listId];

    setSelectedListIds(newSelectedLists);
    handleAutoImport(false, newSelectedLists);
  };

  const handleRemoveContact = (contactId: number) => {
    updateWizardState({
      inviteList: {
        ...inviteList,
        invitedContactIds: invitedContactIds.filter((id) => id !== contactId),
      },
    });
    // Remove from selection if it was selected
    setSelectedContactIds((prev) => prev.filter((id) => id !== contactId));
  };

  const handleToggleSelect = (contactId: number) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContactIds.length === paginatedContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(paginatedContacts.map((c) => c.id));
    }
  };

  const handleDeleteSelected = () => {
    updateWizardState({
      inviteList: {
        ...inviteList,
        invitedContactIds: invitedContactIds.filter((id) => !selectedContactIds.includes(id)),
      },
    });
    setSelectedContactIds([]);
  };

  // Filter contacts by search term
  const filteredContacts = contacts.filter((contact) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      contact.contact_name.toLowerCase().includes(search) ||
      contact.business_name?.toLowerCase().includes(search) ||
      contact.email.toLowerCase().includes(search)
    );
  });

  // Paginate filtered contacts
  const totalPages = Math.ceil(filteredContacts.length / perPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // Calculate unsubscribed contacts count
  const unsubscribedContacts = contacts.filter(
    (c) => c.unsubscribe_status?.is_unsubscribed
  );
  const unsubscribedCount = unsubscribedContacts.length;


  // Selection UI - no contacts invited yet
  if (invitedContactIds.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-background/5 rounded-2xl p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Select Contacts to Invite</h2>
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
                <div className="text-xs text-foreground/60">
                  ({totalContactsCount})
                </div>
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
                  <div className="text-xs text-foreground/60">
                    ({list.contacts_count || 0})
                  </div>
                </label>
              ))}

              {lists.length === 0 && (
                <div className="text-center py-8 bg-background/5 rounded-lg border border-border">
                  <p className="text-foreground/50 text-sm">No contact lists available</p>
                  <p className="text-foreground/40 text-xs mt-1">Create lists in your Network page</p>
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
    );
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
                {filteredContacts.length} contacts
              </p>
            </div>
            <button
              onClick={() => {
                updateWizardState({
                  inviteList: {
                    ...inviteList,
                    invitedContactIds: [],
                  },
                });
                setContacts([]);
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
              <strong>Note:</strong> Select who's invited - you can edit this list later before going live
            </p>
          </div>

          {/* Unsubscribe Warning Banner */}
          {unsubscribedCount > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700 dark:text-yellow-400" />
                <div>
                  <p className="text-sm text-amber-800 dark:text-yellow-300">
                    <strong>Warning:</strong> {unsubscribedCount} {unsubscribedCount === 1 ? 'contact is' : 'contacts are'} unsubscribed and won't receive invitations
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-yellow-300/70">
                    Unsubscribed contacts are highlighted below. They opted out at the global or organization level.
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
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
                  <div className="voxxy-table-header-row grid min-w-[1700px] grid-cols-[28px,100px,200px,200px,120px,220px,140px,160px,120px,70px] items-center gap-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedContactIds.length === paginatedContacts.length && paginatedContacts.length > 0}
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 rounded border-border bg-background/10 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
                      />
                    </div>
                    <div>Status</div>
                    <div>Name</div>
                    <div>Business</div>
                    <div>Category</div>
                    <div>Email</div>
                    <div>Phone</div>
                    <div>Location</div>
                    <div>Tags</div>
                    <div>Social</div>
                  </div>
                </div>

                {/* Table Body */}
                <div>
                  {paginatedContacts.map((contact) => {
                    const isSelected = selectedContactIds.includes(contact.id);
                    const isUnsubscribed = contact.unsubscribe_status?.is_unsubscribed;
                    const unsubscribeScope = contact.unsubscribe_status?.scope;

                    // Determine background color based on selection and unsubscribe status
                    let bgClass = '';
                    if (isSelected) {
                      bgClass = 'bg-primary/10';
                    } else if (isUnsubscribed) {
                      bgClass = 'bg-red-500/5';
                    }

                    return (
                      <div
                        key={contact.id}
                        className={`voxxy-table-row voxxy-table-row-hover grid min-w-[1700px] grid-cols-[28px,100px,200px,200px,120px,220px,140px,160px,120px,70px] items-center gap-2 px-2 py-1 text-[11px] ${bgClass}`}
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

                        {/* Name */}
                        <div className="flex items-center gap-1">
                          <span className="text-foreground truncate">{contact.contact_name}</span>
                        </div>

                        {/* Business */}
                        <div className="flex items-center gap-0.5 text-foreground/60 truncate">
                          {contact.business_name && (
                            <>
                              <Building2 className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{contact.business_name}</span>
                            </>
                          )}
                        </div>

                        {/* Category */}
                        <div>
                          <span className="px-1 py-0.5 bg-background/10 text-foreground/60 rounded text-[10px]">
                            {contact.contact_type}
                          </span>
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
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination Footer - Always show */}
              <div className="bg-background/5 border-t border-border px-3 py-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="text-foreground/60">
                    Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filteredContacts.length)} of {filteredContacts.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 bg-background/10 hover:bg-background/20 disabled:bg-background/5 disabled:text-foreground/30 text-foreground rounded transition-colors text-[11px]"
                    >
                      Previous
                    </button>
                    <span className="text-foreground/60">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
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
  );
}
