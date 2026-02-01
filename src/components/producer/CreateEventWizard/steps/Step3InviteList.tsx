import { useState, useEffect } from 'react';
import { Users, Search, UserPlus, X, Building2, Mail, XCircle, Filter } from 'lucide-react';
import { WizardStepProps } from '../types';
import { vendorContactsApi, contactListsApi, VendorContact } from '@/services/api';
import ListSelector from '../ListSelector';

interface Step3InviteListProps extends WizardStepProps {
  organizationId: number;
}

export default function Step3InviteList({
  wizardState,
  updateWizardState,
  organizationId,
}: Step3InviteListProps) {
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<VendorContact[]>([]);
  const [listContacts, setListContacts] = useState<VendorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingListContacts, setLoadingListContacts] = useState(false);
  const [loadingAllIds, setLoadingAllIds] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [totalContactsCount, setTotalContactsCount] = useState(0);

  const { inviteList } = wizardState;

  useEffect(() => {
    fetchContacts();
  }, [organizationId]);

  // Fetch contacts from selected lists
  useEffect(() => {
    if (inviteList.selectedListIds.length > 0) {
      fetchListContacts();
    } else {
      setListContacts([]);
    }
  }, [inviteList.selectedListIds, organizationId]);

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
    try {
      setLoading(true);
      setError(null);

      const response = await vendorContactsApi.getAll(organizationId, { page: 1, per_page: 100 });
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
      const listContactPromises = inviteList.selectedListIds.map(async (listId) => {
        console.log(`Fetching contacts for list ${listId}...`);
        const response = await contactListsApi.getContacts(listId, 1, 1000); // Get first 1000 contacts
        console.log(`List ${listId} returned ${response.vendor_contacts?.length || 0} contacts`);
        return response.vendor_contacts || [];
      });

      const listContactArrays = await Promise.all(listContactPromises);

      // Flatten and de-duplicate by contact ID
      const allListContacts = listContactArrays.flat();
      const uniqueContacts = Array.from(
        new Map(allListContacts.map(contact => [contact.id, contact])).values()
      );

      console.log(`Total unique contacts from lists: ${uniqueContacts.length}`);
      if (uniqueContacts.length > 0) {
        console.log('Sample contact:', uniqueContacts[0]);
      }

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
      const isExcluded = (inviteList.excludedContactIds || []).includes(contactId);
      const newExcluded = isExcluded
        ? (inviteList.excludedContactIds || []).filter((id) => id !== contactId)
        : [...(inviteList.excludedContactIds || []), contactId];

      updateWizardState({
        inviteList: {
          ...inviteList,
          excludedContactIds: newExcluded,
        },
      });
    } else {
      // If contact is NOT from a list, toggle manual selection
      const currentIds = inviteList.invitedContactIds || [];
      const newIds = currentIds.includes(contactId)
        ? currentIds.filter((id) => id !== contactId)
        : [...currentIds, contactId];

      updateWizardState({
        inviteList: {
          ...inviteList,
          invitedContactIds: newIds,
        },
      });
    }
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredContacts.map((c) => c.id);
    // Check if all filtered contacts are in the final merged list
    const allSelected = allFilteredIds.every((id) => finalContactIds.includes(id));

    if (allSelected) {
      // Deselect all filtered contacts
      // For contacts from lists: add to excluded
      // For manually selected contacts: remove from invitedContactIds
      const listContactIds = listContacts.map((c) => c.id);
      const toExclude = allFilteredIds.filter((id) => listContactIds.includes(id));
      const toRemoveFromManual = allFilteredIds.filter((id) => !listContactIds.includes(id));

      updateWizardState({
        inviteList: {
          ...inviteList,
          excludedContactIds: [
            ...(inviteList.excludedContactIds || []),
            ...toExclude.filter((id) => !(inviteList.excludedContactIds || []).includes(id)),
          ],
          invitedContactIds: (inviteList.invitedContactIds || []).filter(
            (id) => !toRemoveFromManual.includes(id)
          ),
        },
      });
    } else {
      // Select all filtered contacts
      // For contacts from lists: remove from excluded
      // For other contacts: add to invitedContactIds
      const listContactIds = listContacts.map((c) => c.id);
      const toUnexclude = allFilteredIds.filter((id) => listContactIds.includes(id));
      const toAddToManual = allFilteredIds.filter(
        (id) => !listContactIds.includes(id) && !finalContactIds.includes(id)
      );

      updateWizardState({
        inviteList: {
          ...inviteList,
          excludedContactIds: (inviteList.excludedContactIds || []).filter(
            (id) => !toUnexclude.includes(id)
          ),
          invitedContactIds: [
            ...(inviteList.invitedContactIds || []),
            ...toAddToManual,
          ],
        },
      });
    }
  };

  const handleSelectAllContacts = async () => {
    try {
      setLoadingAllIds(true);
      console.log('Fetching all contact IDs for organization...');

      const result = await vendorContactsApi.getAllIds(organizationId, {
        search: searchTerm || undefined,
        contact_type: filterType !== 'all' ? filterType : undefined,
      });

      console.log(`Fetched ${result.ids.length} contact IDs`);

      // Set all IDs as manually selected
      updateWizardState({
        inviteList: {
          ...inviteList,
          invitedContactIds: result.ids,
        },
      });
    } catch (err: any) {
      console.error('Failed to fetch all contact IDs:', err);
      setError(err.message || 'Failed to select all contacts');
    } finally {
      setLoadingAllIds(false);
    }
  };

  const handleClearAll = () => {
    updateWizardState({
      inviteList: {
        selectedListIds: inviteList.selectedListIds,
        invitedContactIds: [],
        excludedContactIds: [],
      },
    });
  };

  const handleListsChange = (listIds: number[]) => {
    updateWizardState({
      inviteList: {
        ...inviteList,
        selectedListIds: listIds,
      },
    });
  };

  const handleToggleExclusion = (contactId: number) => {
    const currentExcluded = inviteList.excludedContactIds;
    const newExcluded = currentExcluded.includes(contactId)
      ? currentExcluded.filter((id) => id !== contactId)
      : [...currentExcluded, contactId];

    updateWizardState({
      inviteList: {
        ...inviteList,
        excludedContactIds: newExcluded,
      },
    });
  };

  // Calculate final merged contacts: (list contacts + manually selected) - excluded
  const getMergedContactIds = (): number[] => {
    const listContactIds = listContacts.map((c) => c.id);
    const manualContactIds = inviteList.invitedContactIds || [];
    const excludedContactIds = inviteList.excludedContactIds || [];

    // Merge and de-duplicate
    const merged = Array.from(new Set([...listContactIds, ...manualContactIds]));

    // Remove excluded contacts
    return merged.filter((id) => !excludedContactIds.includes(id));
  };

  const finalContactIds = getMergedContactIds();

  // Get all contacts (list + manual) for display
  const allAvailableContacts = Array.from(
    new Map([...listContacts, ...contacts].map(c => [c.id, c])).values()
  );

  // Get selected contacts for display
  const selectedContacts = allAvailableContacts.filter((c) =>
    finalContactIds.includes(c.id)
  );

  // Get contacts from lists that can be excluded
  const listOnlyContacts = listContacts.filter((c) =>
    !(inviteList.invitedContactIds || []).includes(c.id)
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/60">Loading your contacts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchContacts}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty network state
  if (contacts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 rounded-2xl p-6 lg:p-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Contacts in Your Network
            </h3>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
              You don't have any vendor contacts yet. Add contacts to your network from the Network page, then return to create events with invitations.
            </p>
            <p className="text-white/40 text-xs">
              You can skip this step and send invitations manually outside the platform
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allFilteredSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => finalContactIds.includes(c.id));

  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-white">Invite Vendors</h2>
          <p className="text-white/60 text-sm mt-1">
            Use saved lists or select individual contacts to invite to this event
          </p>
        </div>

        {/* List Selector */}
        <ListSelector
          organizationId={organizationId}
          selectedListIds={inviteList.selectedListIds}
          onListsChange={handleListsChange}
        />

        {/* Exclusion UI - Show when lists are selected */}
        {(inviteList.selectedListIds || []).length > 0 && listOnlyContacts.length > 0 && (
          <div className="bg-white/5 rounded-lg border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-white">Exclude Contacts (Optional)</h4>
                <p className="text-xs text-white/50 mt-0.5">
                  Uncheck contacts from your selected lists that you don't want to invite
                </p>
              </div>
              {(inviteList.excludedContactIds || []).length > 0 && (
                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">
                  {(inviteList.excludedContactIds || []).length} excluded
                </span>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1">
              {listOnlyContacts.map((contact) => {
                const isExcluded = (inviteList.excludedContactIds || []).includes(contact.id);
                return (
                  <label
                    key={contact.id}
                    className={`flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors ${
                      isExcluded ? 'opacity-50' : ''
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
                            <span className="text-xs text-white/50 truncate">{contact.business_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {isExcluded && (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Divider when lists are selected */}
        {(inviteList.selectedListIds || []).length > 0 && (
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
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, business, email, or tags..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="vendor">Vendors</option>
            <option value="partner">Partners</option>
            <option value="sponsor">Sponsors</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Selection Summary */}
        <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/10 space-y-3">
          {/* Top Row: Contact Count + Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/90">
                  <strong>{finalContactIds.length}</strong> total contacts to invite
                  {totalContactsCount > 0 && (
                    <span className="text-white/40 text-xs ml-2">
                      (of {totalContactsCount} total contacts)
                    </span>
                  )}
                </span>
              </div>
              {((inviteList.invitedContactIds || []).length > 0 || (inviteList.selectedListIds || []).length > 0) && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  Clear Manual Selections
                </button>
              )}
            </div>

            {filteredContacts.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {allFilteredSelected ? 'Deselect' : 'Select'} All Filtered
              </button>
            )}
          </div>

          {/* Bottom Row: Breakdown + Select All Button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/50">
              {(inviteList.selectedListIds || []).length > 0 && (
                <span>
                  {listContacts.length} from lists, {(inviteList.invitedContactIds || []).length} manual
                  {(inviteList.excludedContactIds || []).length > 0 && `, ${(inviteList.excludedContactIds || []).length} excluded`}
                </span>
              )}
            </div>

            {/* Select All Contacts Button */}
            {totalContactsCount > 0 && (
              <button
                onClick={handleSelectAllContacts}
                disabled={loadingAllIds}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white text-xs font-medium rounded-lg transition-colors"
              >
                {loadingAllIds ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3" />
                    Select All {totalContactsCount} Contacts
                  </>
                )}
              </button>
            )}
          </div>

          {/* All Contacts Selected Indicator */}
          {(inviteList.invitedContactIds || []).length === totalContactsCount && totalContactsCount > 0 && (inviteList.selectedListIds || []).length === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-300 font-medium">
                All {totalContactsCount} contacts selected
              </span>
            </div>
          )}
        </div>

        {/* Contacts List */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/50 text-sm">
              No contacts match your search criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="mt-3 text-purple-400 hover:text-purple-300 text-sm underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="bg-white/5 rounded-lg border border-white/10 divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {filteredContacts.map((contact) => {
              // Show as selected if contact is in final merged list (includes list contacts + manual - excluded)
              const isSelected = finalContactIds.includes(contact.id);
              // Check if this contact is from a list (so we know it's auto-selected, not manually selected)
              const isFromList = listContacts.some((c) => c.id === contact.id);

              return (
                <div
                  key={contact.id}
                  className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-purple-500/10' : ''
                  }`}
                  onClick={() => handleToggleContact(contact.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="pt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleContact(contact.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      {/* Name & Business */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-semibold text-white">
                          {contact.contact_name}
                        </h4>
                        {contact.business_name && (
                          <>
                            <span className="text-white/30">•</span>
                            <div className="flex items-center gap-1.5 text-white/60">
                              <Building2 className="w-3 h-3" />
                              <span className="text-xs truncate">
                                {contact.business_name}
                              </span>
                            </div>
                          </>
                        )}
                        {isFromList && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                            <Filter className="w-3 h-3" />
                            From List
                          </span>
                        )}
                      </div>

                      {/* Email & Type */}
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-white/10 text-white/60 rounded text-xs">
                          {contact.contact_type}
                        </span>
                      </div>

                      {/* Tags */}
                      {contact.tags && contact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {contact.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {contact.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs bg-white/10 text-white/50 rounded">
                              +{contact.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Contacts Preview */}
        {selectedContacts.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">
                Selected Contacts ({selectedContacts.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-xs text-white"
                >
                  <span className="truncate max-w-[150px]">
                    {contact.contact_name}
                  </span>
                  <button
                    onClick={() => handleToggleContact(contact.id)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
