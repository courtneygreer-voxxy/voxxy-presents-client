import { useState, useEffect, useRef } from 'react';
import { Users, Search, X, Mail, Check, AlertTriangle, Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const PAGE_SIZE = 50;
import { vendorContactsApi, contactListsApi, VendorContact, ContactList } from '@/services/api';

interface GoLiveInvitationEditorProps {
  event: any;
  organizationId?: number;
  onSave: (data: {
    invitation_list_ids: number[];
    invitation_contact_ids: number[];
    invitation_excluded_ids: number[];
  }) => void | Promise<void>;
  onCancel: () => void;
}

// ── Compact List Dropdown ─────────────────────────────────────────────────────

function ListDropdown({
  organizationId,
  selectedListIds,
  onListsChange,
}: {
  organizationId: number;
  selectedListIds: number[];
  onListsChange: (ids: number[]) => void;
}) {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contactListsApi
      .getAll(organizationId)
      .then((res) => {
        setLists(res.contact_lists);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [organizationId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = (listId: number) => {
    const updated = selectedListIds.includes(listId)
      ? selectedListIds.filter((id) => id !== listId)
      : [...selectedListIds, listId];
    onListsChange(updated);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 pl-3 pr-2.5 py-2 border rounded-lg text-sm transition-colors whitespace-nowrap ${
          selectedListIds.length > 0
            ? 'border-primary/40 bg-primary/15 text-violet-800 dark:text-primary'
            : 'bg-background/5 border-border text-foreground hover:bg-background/10'
        }`}
      >
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {selectedListIds.length === 0
          ? 'Select Lists'
          : `${selectedListIds.length} list${selectedListIds.length > 1 ? 's' : ''}`}
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="voxxy-select-surface absolute z-50 mt-1 w-72 overflow-hidden rounded-lg shadow-xl">
          {loading ? (
            <div className="p-4 text-center">
              <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          ) : lists.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No saved lists yet. Create lists in the Network tab.
            </p>
          ) : (
            <>
              <div className="max-h-56 overflow-y-auto p-1">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => handleToggle(list.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground/80 hover:bg-background/10 rounded transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedListIds.includes(list.id)
                          ? 'bg-primary/50 border-primary'
                          : 'border-border'
                      }`}
                    >
                      {selectedListIds.includes(list.id) && (
                        <Check className="w-3 h-3 text-foreground" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className="truncate block">{list.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {list.contacts_count} contact{list.contacts_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {selectedListIds.length > 0 && (
                <div className="p-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      onListsChange([]);
                      setOpen(false);
                    }}
                    className="w-full rounded px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background/10 hover:text-foreground"
                  >
                    Clear Lists
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Editor ───────────────────────────────────────────────────────────────

export default function GoLiveInvitationEditor({
  event,
  organizationId,
  onSave,
  onCancel,
}: GoLiveInvitationEditorProps) {
  // ── Invitation state ──
  // Lists are purely a filter — selecting a list shows its contacts, doesn't auto-invite
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);
  const [invitedContactIds, setInvitedContactIds] = useState<number[]>(
    event.invitation_draft?.contact_ids || []
  );

  // ── Contact data ──
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [allContactIds, setAllContactIds] = useState<number[]>([]); // OPTIMIZATION: Store all IDs
  const [listContacts, setListContacts] = useState<VendorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingListContacts, setLoadingListContacts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── View mode: show only invited contacts by default ──
  const [showAllContacts, setShowAllContacts] = useState(false);

  // ── Search, filter, sort, pagination ──
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<'name' | 'email'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // OPTIMIZATION: Backend pagination state
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: PAGE_SIZE,
  });

  // ── Add email ──
  const [showAddEmailRow, setShowAddEmailRow] = useState(false);
  const [newEmailData, setNewEmailData] = useState({ name: '', email: '', type: 'vendor' });
  const [addingEmail, setAddingEmail] = useState(false);
  const [addEmailError, setAddEmailError] = useState<string | null>(null);

  // OPTIMIZATION: Fetch contact IDs only, then paginate
  useEffect(() => {
    if (organizationId) fetchContactIds();
  }, [organizationId]);

  // Fetch paginated contacts when IDs, filters, or page changes
  useEffect(() => {
    if (allContactIds.length > 0 || invitedContactIds.length > 0) {
      fetchContactsPage(currentPage);
    }
  }, [allContactIds, currentPage, showAllContacts, invitedContactIds, selectedListIds]);

  // ── Fetch contacts from selected lists ──
  useEffect(() => {
    if (selectedListIds.length > 0 && organizationId) {
      fetchListContacts();
    } else {
      setListContacts([]);
    }
  }, [selectedListIds, organizationId]);

  // OPTIMIZATION: Client-side filtering on current page only (fast since only 50 contacts)
  const filteredContacts = contacts.filter((contact) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      contact.contact_name.toLowerCase().includes(search) ||
      contact.business_name?.toLowerCase().includes(search) ||
      contact.email.toLowerCase().includes(search) ||
      contact.tags?.some((tag) => tag.toLowerCase().includes(search))
    );
  });

  const handleSort = (column: 'name' | 'email') => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // OPTIMIZATION: Fetch only contact IDs (fast!)
  const fetchContactIds = async () => {
    if (!organizationId) {
      setError('Organization ID is required');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Fetch only IDs from backend (very fast)
      const result = await vendorContactsApi.getAllIds(organizationId, {});
      setAllContactIds(result.ids);

      // One-time: resolve any previously saved list IDs into invitedContactIds
      const draftListIds: number[] = event.invitation_draft?.list_ids || [];
      const draftExcludedIds: number[] = event.invitation_draft?.excluded_ids || [];
      if (draftListIds.length > 0) {
        const promises = draftListIds.map(async (listId: number) => {
          const res = await contactListsApi.getContacts(listId, 1, 10000);
          return (res.vendor_contacts || []).map((c: VendorContact) => c.id);
        });
        const listContactIdArrays = await Promise.all(promises);
        const listContactIds = listContactIdArrays.flat();
        setInvitedContactIds((prev) => {
          const merged = Array.from(new Set([...prev, ...listContactIds]));
          return merged.filter((id) => !draftExcludedIds.includes(id));
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load contact IDs');
      setAllContactIds([]);
    } finally {
      setLoading(false);
    }
  };

  // OPTIMIZATION: Fetch one page of contacts at a time (backend pagination)
  const fetchContactsPage = async (page: number) => {
    if (!organizationId) return;

    try {
      setLoading(true);

      // Determine which IDs to fetch based on mode
      let idsToFetch: number[] = [];

      if (!showAllContacts) {
        // "Selected only" mode - show only invited contacts
        idsToFetch = invitedContactIds;
      } else {
        // "Show all" mode - show all org contacts
        idsToFetch = allContactIds;
      }

      // Apply list filter if lists are selected
      if (selectedListIds.length > 0 && listContacts.length > 0) {
        const listContactIdSet = new Set(listContacts.map((c) => c.id));
        idsToFetch = idsToFetch.filter((id) => listContactIdSet.has(id));
      }

      if (idsToFetch.length === 0) {
        setContacts([]);
        setPaginationMeta({ current_page: 1, total_pages: 1, total_count: 0, per_page: PAGE_SIZE });
        setLoading(false);
        return;
      }

      // Calculate pagination
      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const pageIds = idsToFetch.slice(startIndex, endIndex);

      // Fetch only this page's contacts
      const response = await vendorContactsApi.getByIds(organizationId, pageIds, { per_page: PAGE_SIZE });
      const contactsData = response?.vendor_contacts || [];

      setContacts(contactsData);
      setPaginationMeta({
        current_page: page,
        total_pages: Math.ceil(idsToFetch.length / PAGE_SIZE),
        total_count: idsToFetch.length,
        per_page: PAGE_SIZE,
      });
    } catch (err: any) {
      console.error('Failed to fetch contacts page:', err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchListContacts = async () => {
    try {
      setLoadingListContacts(true);
      const listContactPromises = selectedListIds.map(async (listId) => {
        const response = await contactListsApi.getContacts(listId, 1, 1000);
        return response.vendor_contacts || [];
      });
      const listContactArrays = await Promise.all(listContactPromises);
      const allListContacts = listContactArrays.flat();
      const uniqueContacts = Array.from(
        new Map(allListContacts.map((contact) => [contact.id, contact])).values()
      );
      setListContacts(uniqueContacts);
    } catch (err: any) {
      console.error('Failed to fetch list contacts:', err);
      setListContacts([]);
    } finally {
      setLoadingListContacts(false);
    }
  };

  // ── Toggle logic (simple: check/uncheck in invitedContactIds) ──
  const handleToggleContact = (contactId: number) => {
    setInvitedContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filteredContacts.map((c) => c.id);
    const allSelected = visibleIds.every((id) => invitedContactIds.includes(id));

    if (allSelected) {
      // Deselect all visible
      setInvitedContactIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible
      setInvitedContactIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleClearAll = () => {
    setSelectedListIds([]);
    setInvitedContactIds([]);
  };

  const handleSave = () => {
    onSave({
      invitation_list_ids: [],
      invitation_contact_ids: invitedContactIds,
      invitation_excluded_ids: [],
    });
  };

  // ── Add new email contact ──
  const handleAddNewEmail = async () => {
    if (!organizationId) return;
    if (!newEmailData.name.trim() || !newEmailData.email.trim()) {
      setAddEmailError('Name and email are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmailData.email)) {
      setAddEmailError('Invalid email format');
      return;
    }
    if (contacts.some((c) => c.email.toLowerCase() === newEmailData.email.toLowerCase())) {
      setAddEmailError('This email already exists in your contacts');
      return;
    }

    setAddingEmail(true);
    setAddEmailError(null);
    try {
      const newContact = await vendorContactsApi.create(organizationId, {
        contact_name: newEmailData.name,
        email: newEmailData.email,
        contact_type: newEmailData.type as 'vendor' | 'partner' | 'sponsor' | 'staff',
        source: 'manual',
      });
      setContacts((prev) => [newContact, ...prev]);
      setInvitedContactIds((prev) => [...prev, newContact.id]);
      setNewEmailData({ name: '', email: '', type: 'vendor' });
      setShowAddEmailRow(false);
    } catch (err: any) {
      setAddEmailError(err.message || 'Failed to add contact');
    } finally {
      setAddingEmail(false);
    }
  };

  // ── Reset to page 1 when filters/search change ──
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedListIds, listContacts, showAllContacts]);

  // ── Computed values ──
  const unsubscribedCount = contacts.filter(
    (c) => invitedContactIds.includes(c.id) && c.unsubscribe_status?.is_unsubscribed
  ).length;

  const allFilteredSelected =
    filteredContacts.length > 0 && filteredContacts.every((c) => invitedContactIds.includes(c.id));

  // OPTIMIZATION: Sort current page only (fast since only 50 contacts)
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const aSelected = invitedContactIds.includes(a.id) ? 0 : 1;
    const bSelected = invitedContactIds.includes(b.id) ? 0 : 1;
    if (aSelected !== bSelected) return aSelected - bSelected;

    const aVal = sortColumn === 'name' ? a.contact_name : a.email;
    const bVal = sortColumn === 'name' ? b.contact_name : b.email;
    const cmp = aVal.localeCompare(bVal);
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const paginatedContacts = sortedContacts;

  // ── Guard states ──
  if (!organizationId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-400 mb-4">Organization information is missing</p>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-background/10 hover:bg-background/20 text-foreground rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-card text-card-foreground rounded-2xl border border-border max-w-5xl w-full flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-foreground/60">Loading your contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card text-card-foreground rounded-2xl border border-border max-w-5xl w-full flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchContacts}
            className="px-4 py-2 bg-background/10 hover:bg-background/20 text-foreground rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="bg-card text-card-foreground rounded-2xl border border-border max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* ── Header ── */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Edit Invitation List</h2>
          <p className="text-foreground/50 text-xs mt-0.5">
            Review and update who will be invited when you go live
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-3 flex-shrink-0">
        {/* View toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowAllContacts(false);
              setCurrentPage(1); // Reset to page 1 when toggling
            }}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              !showAllContacts
                ? 'bg-primary/15 text-violet-800 dark:text-primary border-r border-primary/20'
                : 'bg-background/5 text-foreground/60 hover:bg-background/10 border-r border-border'
            }`}
          >
            Invited
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAllContacts(true);
              setCurrentPage(1); // Reset to page 1 when toggling
            }}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              showAllContacts
                ? 'bg-primary/15 text-violet-800 dark:text-primary'
                : 'bg-background/5 text-foreground/60 hover:bg-background/10'
            }`}
          >
            All Contacts
          </button>
        </div>

        {showAllContacts && (
          <ListDropdown
            organizationId={organizationId}
            selectedListIds={selectedListIds}
            onListsChange={setSelectedListIds}
          />
        )}

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts..."
            className="voxxy-input-frost w-full rounded-lg py-2 pl-9 pr-4 text-sm transition-all"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAddEmailRow(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary/20 hover:bg-primary/30 text-violet-950 dark:text-primary text-sm font-medium rounded-lg transition-colors border border-primary/30 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Email
        </button>
      </div>

      {/* ── Status bar ── */}
      <div className="px-5 py-2 border-b border-border flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-violet-700 dark:text-primary" />
            <span className="text-foreground">
              <span className="font-medium">{invitedContactIds.length}</span>
              <span className="text-muted-foreground"> selected out of </span>
              <span className="font-medium">{contacts.length}</span>
            </span>
          </div>

          {selectedListIds.length > 0 && (
            <span className="text-muted-foreground">
              Showing {filteredContacts.length} from {selectedListIds.length} list{selectedListIds.length !== 1 ? 's' : ''}
            </span>
          )}

          {unsubscribedCount > 0 && (
            <span className="flex items-center gap-1 text-amber-700 dark:text-yellow-400">
              <AlertTriangle className="w-3 h-3" />
              {unsubscribedCount} unsubscribed
            </span>
          )}

          {loadingListContacts && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <div className="w-3 h-3 border border-border border-t-primary rounded-full animate-spin" />
              Loading...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {invitedContactIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="voxxy-auth-link transition-colors"
            >
              Clear all
            </button>
          )}
          {filteredContacts.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              {allFilteredSelected ? 'Deselect all' : 'Select all'}
            </button>
          )}
        </div>
      </div>

      {/* ── Add email row (conditional) ── */}
      {showAddEmailRow && (
        <div className="px-5 py-2.5 border-b border-border bg-primary/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newEmailData.name}
              onChange={(e) => setNewEmailData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Contact name..."
              className="voxxy-input-frost flex-1 rounded-lg px-3 py-1.5 text-sm"
              autoFocus
            />
            <input
              type="email"
              value={newEmailData.email}
              onChange={(e) => setNewEmailData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com"
              className="voxxy-input-frost flex-1 rounded-lg px-3 py-1.5 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddNewEmail()}
            />
            <select
              value={newEmailData.type}
              onChange={(e) => setNewEmailData((prev) => ({ ...prev, type: e.target.value }))}
              className="px-3 py-1.5 bg-background/5 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="vendor">Vendor</option>
              <option value="partner">Partner</option>
              <option value="sponsor">Sponsor</option>
              <option value="staff">Staff</option>
            </select>
            <button
              type="button"
              onClick={handleAddNewEmail}
              disabled={addingEmail}
              className="px-3 py-1.5 voxxy-btn-solid text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {addingEmail ? '...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddEmailRow(false);
                setAddEmailError(null);
              }}
              className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {addEmailError && <p className="text-xs text-red-400 mt-1.5">{addEmailError}</p>}
        </div>
      )}

      {/* ── Contacts table ── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="voxxy-table-shell border-t-0 rounded-none flex-1 flex flex-col">
          {/* Table header */}
          <div className="voxxy-table-header flex-shrink-0">
            <div className="voxxy-table-header-row grid grid-cols-[36px,1fr,1fr,1.5fr,80px] items-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={allFilteredSelected && filteredContacts.length > 0}
                  onChange={handleSelectAll}
                  className="w-3.5 h-3.5 rounded border-border bg-background/10 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSort('name')}
                className="flex items-center gap-1 hover:text-foreground transition-colors text-left"
              >
                Name
                {sortColumn === 'name' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3 opacity-30" />
                )}
              </button>
              <div>Business</div>
              <button
                type="button"
                onClick={() => handleSort('email')}
                className="flex items-center gap-1 hover:text-foreground transition-colors text-left"
              >
                Email
                {sortColumn === 'email' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3 opacity-30" />
                )}
              </button>
              <div>Type</div>
            </div>
          </div>

          {/* Table body */}
          <div className="flex-1 overflow-y-auto">
            {sortedContacts.length === 0 ? (
              <div className="text-center py-16">
                {!showAllContacts && invitedContactIds.length === 0 ? (
                  <>
                    <Users className="mx-auto mb-3 h-8 w-8 text-foreground/20" />
                    <p className="text-foreground/50 text-sm">No contacts selected yet</p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAllContacts(true);
                        setCurrentPage(1);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 voxxy-btn-solid rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add contacts
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-foreground/50 text-sm">No contacts match your search criteria</p>
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="mt-3 text-primary hover:text-primary/70 text-sm transition-colors"
                    >
                      Clear search
                    </button>
                  </>
                )}
              </div>
            ) : (
              paginatedContacts.map((contact) => {
                const isSelected = invitedContactIds.includes(contact.id);
                const isUnsubscribed = contact.unsubscribe_status?.is_unsubscribed;
                const unsubscribeScope = contact.unsubscribe_status?.scope;

                return (
                  <div
                    key={contact.id}
                    onClick={() => handleToggleContact(contact.id)}
                    className={`voxxy-table-row grid grid-cols-[36px,1fr,1fr,1.5fr,80px] gap-2 px-4 py-2 items-center text-xs last:border-0 cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 hover:bg-primary/15'
                        : isUnsubscribed
                          ? 'bg-red-500/5 hover:bg-red-500/10'
                          : 'voxxy-table-row-hover'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleContact(contact.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 rounded border-border bg-background/10 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
                      />
                    </div>

                    {/* Name */}
                    <div className="min-w-0 flex items-center gap-1.5">
                      <span className="font-medium text-foreground truncate">{contact.contact_name}</span>
                      {isUnsubscribed && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                            unsubscribeScope === 'global'
                              ? 'bg-red-500/20 text-red-950 dark:text-red-300 border border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-950 dark:text-yellow-300 border border-yellow-500/30'
                          }`}
                        >
                          {unsubscribeScope === 'global' ? 'Unsub' : 'Org Unsub'}
                        </span>
                      )}
                    </div>

                    {/* Business */}
                    <div className="min-w-0">
                      <span className="text-foreground/60 truncate block">
                        {contact.business_name || '\u2014'}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="min-w-0 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-foreground/30 flex-shrink-0" />
                      <span className="text-foreground/60 truncate">{contact.email}</span>
                    </div>

                    {/* Type */}
                    <div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-background/10 text-foreground/60 capitalize">
                        {contact.contact_type}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between flex-shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-foreground/70 hover:text-foreground transition-colors"
        >
          Cancel
        </button>

        {/* OPTIMIZATION: Backend Pagination */}
        {paginationMeta.total_pages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const newPage = Math.max(1, paginationMeta.current_page - 1);
                setCurrentPage(newPage);
              }}
              disabled={paginationMeta.current_page <= 1}
              className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-background/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-foreground/60 min-w-[80px] text-center">
              Page {paginationMeta.current_page} of {paginationMeta.total_pages}
            </span>
            <button
              type="button"
              onClick={() => {
                const newPage = Math.min(paginationMeta.total_pages, paginationMeta.current_page + 1);
                setCurrentPage(newPage);
              }}
              disabled={paginationMeta.current_page >= paginationMeta.total_pages}
              className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-background/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 voxxy-btn-solid rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Save {invitedContactIds.length} contact{invitedContactIds.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
