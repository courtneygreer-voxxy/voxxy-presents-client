import { useState, useEffect } from 'react';
import { Users, Search, X, Building2, Mail, XCircle, Filter, Check, AlertTriangle } from 'lucide-react';
import { vendorContactsApi, contactListsApi, VendorContact } from '@/services/api';
import ListSelector from './CreateEventWizard/ListSelector';

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

export default function GoLiveInvitationEditor({
  event,
  organizationId,
  onSave,
  onCancel,
}: GoLiveInvitationEditorProps) {
  // Initialize state from event's invitation_draft
  const [selectedListIds, setSelectedListIds] = useState<number[]>(
    event.invitation_draft?.list_ids || []
  );
  const [invitedContactIds, setInvitedContactIds] = useState<number[]>(
    event.invitation_draft?.contact_ids || []
  );
  const [excludedContactIds, setExcludedContactIds] = useState<number[]>(
    event.invitation_draft?.excluded_ids || []
  );

  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<VendorContact[]>([]);
  const [listContacts, setListContacts] = useState<VendorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingListContacts, setLoadingListContacts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [totalContactsCount, setTotalContactsCount] = useState(0);

  useEffect(() => {
    if (organizationId) {
      fetchContacts();
    }
  }, [organizationId]);

  // Fetch contacts from selected lists
  useEffect(() => {
    if (selectedListIds.length > 0 && organizationId) {
      fetchListContacts();
    } else {
      setListContacts([]);
    }
  }, [selectedListIds, organizationId]);

  useEffect(() => {
    // Filter contacts based on search and type
    let filtered = contacts;

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.contact_name.toLowerCase().includes(search) ||
          c.business_name?.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.tags?.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((c) => c.contact_type === filterType);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, filterType]);

  const fetchContacts = async () => {
    if (!organizationId) {
      setError('Organization ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await vendorContactsApi.getAll(organizationId, {
        page: 1,
        per_page: 100,
      });
      const contactsData = response?.vendor_contacts || [];
      const total = response?.meta?.total_count || contactsData.length;

      setContacts(contactsData);
      setFilteredContacts(contactsData);
      setTotalContactsCount(total);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
      setContacts([]);
      setFilteredContacts([]);
      setTotalContactsCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchListContacts = async () => {
    try {
      setLoadingListContacts(true);

      // Fetch contacts from all selected lists
      const listContactPromises = selectedListIds.map(async (listId) => {
        const response = await contactListsApi.getContacts(listId, 1, 1000);
        return response.vendor_contacts || [];
      });

      const listContactArrays = await Promise.all(listContactPromises);

      // Flatten and de-duplicate by contact ID
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

  const handleToggleContact = (contactId: number) => {
    // Check if this contact is from a selected list
    const isFromList = listContacts.some((c) => c.id === contactId);

    if (isFromList) {
      // If contact is from a list, toggle their exclusion status
      const isExcluded = excludedContactIds.includes(contactId);
      const newExcluded = isExcluded
        ? excludedContactIds.filter((id) => id !== contactId)
        : [...excludedContactIds, contactId];

      setExcludedContactIds(newExcluded);
    } else {
      // If contact is NOT from a list, toggle manual selection
      const newIds = invitedContactIds.includes(contactId)
        ? invitedContactIds.filter((id) => id !== contactId)
        : [...invitedContactIds, contactId];

      setInvitedContactIds(newIds);
    }
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredContacts.map((c) => c.id);
    const allSelected = allFilteredIds.every((id) => finalContactIds.includes(id));

    if (allSelected) {
      // Deselect all filtered contacts
      const listContactIds = listContacts.map((c) => c.id);
      const toExclude = allFilteredIds.filter((id) => listContactIds.includes(id));
      const toRemoveFromManual = allFilteredIds.filter((id) => !listContactIds.includes(id));

      setExcludedContactIds([
        ...excludedContactIds,
        ...toExclude.filter((id) => !excludedContactIds.includes(id)),
      ]);
      setInvitedContactIds(invitedContactIds.filter((id) => !toRemoveFromManual.includes(id)));
    } else {
      // Select all filtered contacts
      const listContactIds = listContacts.map((c) => c.id);
      const toUnexclude = allFilteredIds.filter((id) => listContactIds.includes(id));
      const toAddToManual = allFilteredIds.filter(
        (id) => !listContactIds.includes(id) && !finalContactIds.includes(id)
      );

      setExcludedContactIds(excludedContactIds.filter((id) => !toUnexclude.includes(id)));
      setInvitedContactIds([...invitedContactIds, ...toAddToManual]);
    }
  };

  const handleClearAll = () => {
    setInvitedContactIds([]);
    setExcludedContactIds([]);
  };

  const handleToggleExclusion = (contactId: number) => {
    const newExcluded = excludedContactIds.includes(contactId)
      ? excludedContactIds.filter((id) => id !== contactId)
      : [...excludedContactIds, contactId];

    setExcludedContactIds(newExcluded);
  };

  const handleSave = () => {
    onSave({
      invitation_list_ids: selectedListIds,
      invitation_contact_ids: invitedContactIds,
      invitation_excluded_ids: excludedContactIds,
    });
  };

  // Calculate final merged contacts: (list contacts + manually selected) - excluded
  const getMergedContactIds = (): number[] => {
    const listContactIds = listContacts.map((c) => c.id);
    const merged = Array.from(new Set([...listContactIds, ...invitedContactIds]));
    return merged.filter((id) => !excludedContactIds.includes(id));
  };

  const finalContactIds = getMergedContactIds();

  // Get all contacts (list + manual) for display
  const allAvailableContacts = Array.from(
    new Map([...listContacts, ...contacts].map((c) => [c.id, c])).values()
  );

  // Get selected contacts for display
  const selectedContacts = allAvailableContacts.filter((c) => finalContactIds.includes(c.id));

  // Calculate unsubscribed contacts count
  const unsubscribedContacts = selectedContacts.filter(
    (c) => c.unsubscribe_status?.is_unsubscribed
  );
  const unsubscribedCount = unsubscribedContacts.length;

  // Get contacts from lists that can be excluded
  const listOnlyContacts = listContacts.filter((c) => !invitedContactIds.includes(c.id));

  // No organization ID - shouldn't happen but handle gracefully
  if (!organizationId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-400 mb-4">Organization information is missing</p>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Loading your contacts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchContacts}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const allFilteredSelected =
    filteredContacts.length > 0 && filteredContacts.every((c) => finalContactIds.includes(c.id));

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Edit Invitation List</h2>
          <p className="text-white/60 text-sm mt-1">
            Review and update who will be invited when you go live
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">{/* Content wrapper */}

        {/* Current Count Summary */}
        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-white">
                  {finalContactIds.length} contacts will be invited
                </p>
                {selectedListIds.length > 0 && (
                  <p className="text-xs text-white/50 mt-0.5">
                    {listContacts.length} from lists, {invitedContactIds.length} manual
                    {excludedContactIds.length > 0 && `, ${excludedContactIds.length} excluded`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Unsubscribe Warning Banner */}
        {unsubscribedCount > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-300">
                  <strong>Warning:</strong> {unsubscribedCount} {unsubscribedCount === 1 ? 'contact is' : 'contacts are'} unsubscribed and won't receive invitations
                </p>
                <p className="text-xs text-yellow-300/70 mt-1">
                  Unsubscribed contacts are highlighted below. They opted out at the global or organization level.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* List Selector */}
        {organizationId && (
          <ListSelector
            organizationId={organizationId}
            selectedListIds={selectedListIds}
            onListsChange={setSelectedListIds}
          />
        )}

        {/* Exclusion UI - Show when lists are selected */}
        {selectedListIds.length > 0 && listOnlyContacts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-white">Exclude Contacts (Optional)</h4>
                <p className="text-xs text-white/50 mt-0.5">
                  Uncheck contacts from your selected lists that you don't want to invite
                </p>
              </div>
              {excludedContactIds.length > 0 && (
                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
                  {excludedContactIds.length} excluded
                </span>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {listOnlyContacts.map((contact) => {
                const isExcluded = excludedContactIds.includes(contact.id);
                return (
                  <label
                    key={contact.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isExcluded
                        ? 'bg-white/5 border-white/10 opacity-50'
                        : 'bg-purple-500/10 border-purple-500/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!isExcluded}
                      onChange={() => handleToggleExclusion(contact.id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white truncate">{contact.contact_name}</span>
                        {contact.business_name && (
                          <>
                            <span className="text-white/30">•</span>
                            <span className="text-xs text-white/50 truncate">
                              {contact.business_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {isExcluded && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Divider when lists are selected */}
        {selectedListIds.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-white/40">Or select individual contacts</span>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, business, email, or tags..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="all">All Types</option>
            <option value="vendor">Vendors</option>
            <option value="partner">Partners</option>
            <option value="sponsor">Sponsors</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Selection Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">
              <strong className="text-white">{finalContactIds.length}</strong> selected
            </span>
            {(invitedContactIds.length > 0 || selectedListIds.length > 0) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {filteredContacts.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {allFilteredSelected ? 'Deselect' : 'Select'} all
            </button>
          )}
        </div>

        {/* Contacts List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/50 text-sm">No contacts match your search criteria</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="mt-3 text-purple-400 hover:text-purple-300 text-sm transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = finalContactIds.includes(contact.id);
              const isFromList = listContacts.some((c) => c.id === contact.id);
              const isUnsubscribed = contact.unsubscribe_status?.is_unsubscribed;
              const unsubscribeScope = contact.unsubscribe_status?.scope;

              return (
                <label
                  key={contact.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-500/40'
                      : isUnsubscribed
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleContact(contact.id)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-white truncate">{contact.contact_name}</span>
                      {contact.business_name && (
                        <>
                          <span className="text-white/30">•</span>
                          <span className="text-xs text-white/50 truncate">{contact.business_name}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isUnsubscribed && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          unsubscribeScope === 'global'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}
                      >
                        {unsubscribeScope === 'global' ? 'Unsubscribed (Global)' : 'Unsubscribed (Org)'}
                      </span>
                    )}
                    {isFromList && (
                      <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                        From List
                      </span>
                    )}
                  </div>
                </label>
              );
            })
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Save {finalContactIds.length} contacts
        </button>
      </div>
    </div>
  );
}
