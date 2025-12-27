import { useState, useEffect } from 'react';
import { Users, Search, UserPlus, X, Building2, Mail } from 'lucide-react';
import { WizardStepProps } from '../types';
import { vendorContactsApi, VendorContact } from '@/services/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const { inviteList } = wizardState;

  useEffect(() => {
    fetchContacts();
  }, [organizationId]);

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

      const response = await vendorContactsApi.getAll(organizationId);
      const contactsData = response?.vendor_contacts || [];

      setContacts(contactsData);
      setFilteredContacts(contactsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
      setContacts([]);
      setFilteredContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleContact = (contactId: number) => {
    const currentIds = inviteList.invitedContactIds;
    const newIds = currentIds.includes(contactId)
      ? currentIds.filter((id) => id !== contactId)
      : [...currentIds, contactId];

    updateWizardState({
      inviteList: {
        invitedContactIds: newIds,
      },
    });
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredContacts.map((c) => c.id);
    const allSelected = allFilteredIds.every((id) =>
      inviteList.invitedContactIds.includes(id)
    );

    if (allSelected) {
      // Deselect all filtered contacts
      updateWizardState({
        inviteList: {
          invitedContactIds: inviteList.invitedContactIds.filter(
            (id) => !allFilteredIds.includes(id)
          ),
        },
      });
    } else {
      // Select all filtered contacts
      const combinedIds = [
        ...inviteList.invitedContactIds,
        ...allFilteredIds.filter((id) => !inviteList.invitedContactIds.includes(id)),
      ];
      updateWizardState({
        inviteList: {
          invitedContactIds: combinedIds,
        },
      });
    }
  };

  const handleClearAll = () => {
    updateWizardState({
      inviteList: {
        invitedContactIds: [],
      },
    });
  };

  // Get selected contacts for display
  const selectedContacts = contacts.filter((c) =>
    inviteList.invitedContactIds.includes(c.id)
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
              You don't have any vendor contacts yet. You can skip this step and add
              contacts to your network later from the Network page.
            </p>
            <p className="text-white/40 text-xs">
              This step is optional - click Next to continue
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allFilteredSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => inviteList.invitedContactIds.includes(c.id));

  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-white">Invite Vendors</h2>
          <p className="text-white/60 text-sm mt-1">
            Select contacts from your network to invite to this event
          </p>
        </div>

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
        <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/90">
                {inviteList.invitedContactIds.length} of {contacts.length} selected
              </span>
            </div>
            {inviteList.invitedContactIds.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Clear All
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
              const isSelected = inviteList.invitedContactIds.includes(contact.id);

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
                      <div className="flex items-center gap-2 mb-1">
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

        {/* Optional Step Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-200/80">
            <strong>Optional:</strong> You can skip this step and invite vendors later.
            Selected contacts will receive invitation notifications once the event is
            created.
          </p>
        </div>
      </div>
    </div>
  );
}
