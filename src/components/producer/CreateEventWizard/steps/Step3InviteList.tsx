import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Search, Building2, Mail, Phone, MapPin, Instagram, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { WizardStepProps } from '../types';
import { vendorContactsApi, VendorContact } from '@/services/api';
import ImportContactsModal from '../ImportContactsModal';
import { DebugPanel } from '../../DebugPanel';

interface Step3InviteListProps extends WizardStepProps {
  organizationId: number;
}

export default function Step3InviteList({
  wizardState,
  updateWizardState,
  organizationId,
  isAdmin,
}: Step3InviteListProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const perPage = 50;

  // Track which IDs we've already fetched to avoid redundant requests
  const fetchedIdsRef = useRef<string>('');

  const { inviteList } = wizardState;
  const invitedContactIds = inviteList.invitedContactIds ?? [];

  // Stable serialized key for the invited IDs — avoids re-running effect on ref changes
  const invitedIdsKey = JSON.stringify(invitedContactIds);

  // Load full contact details when we have IDs (and they've actually changed)
  useEffect(() => {
    if (invitedContactIds.length > 0 && fetchedIdsRef.current !== invitedIdsKey) {
      fetchContactDetails();
    } else if (invitedContactIds.length === 0) {
      setContacts([]);
      fetchedIdsRef.current = '';
    }
  }, [invitedIdsKey, organizationId]);

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

  const handleImport = (contactIds: number[], source: 'all' | 'lists') => {
    updateWizardState({
      inviteList: {
        ...inviteList,
        invitedContactIds: contactIds,
      },
    });
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

  // Empty state - no contacts invited yet
  if (invitedContactIds.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 rounded-2xl p-6 lg:p-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Contacts Invited Yet
            </h3>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
              Import contacts from your network to send invitations for this event
            </p>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg transition-all font-medium shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Contacts
              </div>
            </button>
          </div>
        </div>

        <ImportContactsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          organizationId={organizationId}
          onImport={handleImport}
        />
      </div>
    );
  }

  // Table view - contacts have been imported
  return (
    <>
      <div className="space-y-6">
        <div className="bg-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Invite List</h2>
              <p className="text-white/60 text-sm mt-1">
                {filteredContacts.length} contacts
              </p>
            </div>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import from Network
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> Select who's invited - you can edit this list later before going live
            </p>
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

          {/* Search Bar and Actions */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            {selectedContactIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                Delete {selectedContactIds.length} Selected
              </button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : paginatedContacts.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/50 text-sm">No contacts match your search</p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              {/* Table with horizontal scroll */}
              <div className="overflow-x-auto">
                {/* Table Header */}
                <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-white/10">
                  <div className="grid grid-cols-[28px,100px,200px,200px,120px,220px,140px,160px,120px,70px] gap-2 px-2 py-1 items-center text-[10px] font-semibold text-white/70 uppercase tracking-wide min-w-[1700px]">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedContactIds.length === paginatedContacts.length && paginatedContacts.length > 0}
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
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
                      bgClass = 'bg-purple-500/10';
                    } else if (isUnsubscribed) {
                      bgClass = 'bg-red-500/5';
                    }

                    return (
                      <div
                        key={contact.id}
                        className={`grid grid-cols-[28px,100px,200px,200px,120px,220px,140px,160px,120px,70px] gap-2 px-2 py-1 items-center border-b border-white/5 hover:bg-white/5 transition-colors text-[11px] min-w-[1700px] ${bgClass}`}
                      >
                        {/* Checkbox */}
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(contact.id)}
                            className="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* Status */}
                        <div className="flex items-center">
                          {isUnsubscribed ? (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                unsubscribeScope === 'global'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              }`}
                            >
                              {unsubscribeScope === 'global' ? 'Global' : 'Org'}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-[9px] font-medium">
                              Active
                            </span>
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex items-center gap-1">
                          <span className="text-white truncate">{contact.contact_name}</span>
                        </div>

                        {/* Business */}
                        <div className="flex items-center gap-0.5 text-white/60 truncate">
                          {contact.business_name && (
                            <>
                              <Building2 className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{contact.business_name}</span>
                            </>
                          )}
                        </div>

                        {/* Category */}
                        <div>
                          <span className="px-1 py-0.5 bg-white/10 text-white/60 rounded text-[10px]">
                            {contact.contact_type}
                          </span>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-0.5 text-white/60 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-0.5 text-white/60 truncate">
                          {contact.phone && (
                            <>
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{contact.phone}</span>
                            </>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-0.5 text-white/60 truncate">
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
                                  className="px-1 py-0.5 text-[9px] bg-purple-500/20 text-purple-300 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {contact.tags.length > 2 && (
                                <span className="px-1 py-0.5 text-[9px] bg-white/10 text-white/50 rounded">
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
                              className="text-white/60 hover:text-white transition-colors"
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
                              className="text-white/60 hover:text-white transition-colors text-[10px]"
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
              <div className="bg-white/5 border-t border-white/10 px-3 py-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="text-white/60">
                    Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filteredContacts.length)} of {filteredContacts.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded transition-colors text-[11px]"
                    >
                      Previous
                    </button>
                    <span className="text-white/60">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded transition-colors text-[11px]"
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

      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        organizationId={organizationId}
        onImport={handleImport}
      />

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
