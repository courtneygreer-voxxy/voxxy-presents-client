import { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { contactListsApi, vendorContactsApi, ContactList } from '@/services/api';

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: number;
  onImport: (contactIds: number[], source: 'all' | 'lists') => void;
}

export default function ImportContactsModal({
  isOpen,
  onClose,
  organizationId,
  onImport,
}: ImportContactsModalProps) {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);
  const [inviteAllSelected, setInviteAllSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalContactsCount, setTotalContactsCount] = useState(0);
  const [estimatedCount, setEstimatedCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    } else {
      // Reset when closed
      setSelectedListIds([]);
      setInviteAllSelected(false);
    }
  }, [isOpen, organizationId]);

  useEffect(() => {
    // Calculate estimated contact count
    if (inviteAllSelected) {
      setEstimatedCount(totalContactsCount);
    } else if (selectedListIds.length > 0) {
      const count = lists
        .filter((list) => selectedListIds.includes(list.id))
        .reduce((sum, list) => sum + (list.contacts_count || 0), 0);
      setEstimatedCount(count);
    } else {
      setEstimatedCount(0);
    }
  }, [inviteAllSelected, selectedListIds, lists, totalContactsCount]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch lists and total contact count in parallel
      const [listsResponse, contactsResponse] = await Promise.all([
        contactListsApi.getAll(organizationId),
        vendorContactsApi.getAll(organizationId, { page: 1, per_page: 1 })
      ]);

      // API returns { contact_lists: [...] }
      setLists(listsResponse?.contact_lists || []);
      setTotalContactsCount(contactsResponse?.meta?.total_count || 0);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setLists([]);
      setTotalContactsCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInviteAll = () => {
    if (!inviteAllSelected) {
      // Selecting "Invite All" - clear list selections
      setInviteAllSelected(true);
      setSelectedListIds([]);
    } else {
      setInviteAllSelected(false);
    }
  };

  const handleToggleList = (listId: number) => {
    if (inviteAllSelected) {
      // If "Invite All" is selected, deselect it first
      setInviteAllSelected(false);
    }

    setSelectedListIds((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId]
    );
  };

  const handleClearAll = () => {
    setSelectedListIds([]);
    setInviteAllSelected(false);
  };

  const handleImport = async () => {
    try {
      if (inviteAllSelected) {
        // Fetch all contact IDs
        const result = await vendorContactsApi.getAllIds(organizationId, {});
        onImport(result.ids, 'all');
      } else if (selectedListIds.length > 0) {
        // Fetch ALL contacts from selected lists (handling pagination)
        const listContactPromises = selectedListIds.map(async (listId) => {
          let allContacts: any[] = [];
          let currentPage = 1;
          let hasMore = true;

          // Fetch all pages for this list
          while (hasMore) {
            const response = await contactListsApi.getContacts(listId, currentPage, 100);
            const pageContacts = response.vendor_contacts || [];
            allContacts = [...allContacts, ...pageContacts];

            // Check if there are more pages
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

        onImport(uniqueContactIds, 'lists');
      }
      onClose();
    } catch (err) {
      console.error('Failed to import contacts:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Import from Network</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Invite All Option */}
              <label
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  inviteAllSelected
                    ? 'bg-purple-500/20 border-purple-500/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={inviteAllSelected}
                  onChange={handleToggleInviteAll}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
                />
                <div className="flex-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Invite All Contacts</span>
                </div>
                <div className="text-xs text-white/60">
                  ({totalContactsCount})
                </div>
              </label>

              {/* Lists */}
              {lists.map((list) => (
                <label
                  key={list.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedListIds.includes(list.id)
                      ? 'bg-purple-500/20 border-purple-500/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedListIds.includes(list.id)}
                    onChange={() => handleToggleList(list.id)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{list.name}</div>
                  </div>
                  <div className="text-xs text-white/60">
                    ({list.contacts_count || 0})
                  </div>
                </label>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleClearAll}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={handleImport}
            disabled={!inviteAllSelected && selectedListIds.length === 0}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            Add {estimatedCount} contacts
          </button>
        </div>
      </div>
    </div>
  );
}
