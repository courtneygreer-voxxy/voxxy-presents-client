import { useState, useEffect, useRef } from 'react';
import { Search, Filter, UserPlus, Upload, Save, Trash2, X, Check, ChevronDown } from 'lucide-react';
import { vendorContactsApi, contactListsApi, VendorContact } from '@/services/api';
import ContactsTable from './ContactsTable';
import AddContactModal from './AddContactModal';
import EditContactModal from './EditContactModal';
import { CSVUploadModal } from './CSVUploadModal';
import ListsManagement from './Lists/ListsManagement';

type NetworkTab = 'contacts' | 'lists';

interface NetworkPageProps {
  organizationId: number;
}

// --- Multi-Select Filter Dropdown ---
function MultiSelectFilterDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-1.5 pl-3 pr-2.5 py-2 border rounded-lg text-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500
          ${selected.length > 0
            ? 'bg-purple-500/15 border-purple-500/40 text-purple-200'
            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }
        `}
      >
        <Filter className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
        <span>
          {selected.length === 0
            ? `All ${label}`
            : `${label} (${selected.length})`}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-64 bg-gray-900 border border-white/20 rounded-lg shadow-xl overflow-hidden">
          {options.length > 6 && (
            <div className="p-2 border-b border-white/10">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                autoFocus
              />
            </div>
          )}
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-xs text-white/40">No options found</p>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handleToggle(option)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selected.includes(option)
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-white/30'
                    }`}
                  >
                    {selected.includes(option) && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="truncate text-left">{option}</span>
                </button>
              ))
            )}
          </div>
          {selected.length > 0 && (
            <div className="p-2 border-t border-white/10">
              <button
                onClick={() => { onChange([]); setOpen(false); }}
                className="w-full px-2 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                Clear {label}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function NetworkPage({ organizationId }: NetworkPageProps) {
  const [activeTab, setActiveTab] = useState<NetworkTab>('contacts');
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVUploadModal, setShowCSVUploadModal] = useState(false);
  const [editingContact, setEditingContact] = useState<VendorContact | null>(null);

  // Multi-select filter states
  const [locationFilters, setLocationFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);

  // Filter options from backend (all unique values across entire org)
  const [filterOptions, setFilterOptions] = useState<{
    locations: string[];
    categories: string[];
    tags: string[];
  }>({ locations: [], categories: [], tags: [] });

  // Inline save list state
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [listName, setListName] = useState('');
  const [savingList, setSavingList] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(100);
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    per_page: 100,
    total_count: 0,
    total_pages: 1,
  });

  // Fetch filter options from backend on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await vendorContactsApi.getFilterOptions(organizationId);
        setFilterOptions({
          locations: options.locations || [],
          categories: options.categories || [],
          tags: options.tags || [],
        });
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    loadFilterOptions();
  }, [organizationId]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchContacts(1);
  }, [organizationId, locationFilters, categoryFilters, tagFilters]);

  const fetchContacts = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      // Send first value of each filter to backend (it only supports single values for location/category)
      // Tags already supports arrays on the backend
      const response = await vendorContactsApi.getAll(organizationId, {
        search: searchTerm || undefined,
        location: locationFilters.length > 0 ? locationFilters[0] : undefined,
        category: categoryFilters.length > 0 ? categoryFilters[0] : undefined,
        tags: tagFilters.length > 0 ? tagFilters : undefined,
        page: page,
        per_page: perPage,
      });

      let contactsData = response?.vendor_contacts || [];
      const meta = response?.meta || {
        current_page: page,
        per_page: perPage,
        total_count: contactsData.length,
        total_pages: 1,
      };

      // Client-side filtering for multi-select values beyond the first
      if (locationFilters.length > 1) {
        contactsData = contactsData.filter(c =>
          c.location && locationFilters.includes(c.location)
        );
      }
      if (categoryFilters.length > 1) {
        contactsData = contactsData.filter(c =>
          c.categories?.some(cat => categoryFilters.includes(cat))
        );
      }

      setContacts(contactsData);
      setPaginationMeta(meta);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchContacts(page);
    setSelectedContacts([]);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    fetchContacts(1);
  };

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const handleSelectAll = async () => {
    const currentPageIds = contacts.map(c => c.id);
    const allCurrentPageSelected = currentPageIds.every(id => selectedContacts.includes(id));

    if (allCurrentPageSelected && selectedContacts.length > 0) {
      setSelectedContacts([]);
    } else {
      try {
        const result = await vendorContactsApi.getAllIds(organizationId, {
          search: searchTerm || undefined,
          location: locationFilters.length > 0 ? locationFilters[0] : undefined,
          category: categoryFilters.length > 0 ? categoryFilters[0] : undefined,
          tags: tagFilters.length > 0 ? tagFilters : undefined,
        });
        setSelectedContacts(result.ids);
      } catch (err) {
        console.error('Failed to fetch all contact IDs:', err);
        setSelectedContacts(currentPageIds);
      }
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to remove this contact from your network?')) {
      return;
    }

    try {
      await vendorContactsApi.delete(contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete contact');
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedContacts.length;
    if (!confirm(`Are you sure you want to delete ${count} contact${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    const failedContacts: number[] = [];

    // Delete in parallel batches of 10
    const batchSize = 10;
    for (let i = 0; i < selectedContacts.length; i += batchSize) {
      const batch = selectedContacts.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(id => vendorContactsApi.delete(id))
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          failedCount++;
          failedContacts.push(batch[index]);
        }
      });
    }

    setContacts(prev => prev.filter(c => !selectedContacts.includes(c.id) || failedContacts.includes(c.id)));
    setSelectedContacts(failedContacts);

    if (failedCount === 0) {
      alert(`Successfully deleted ${successCount} contact${successCount > 1 ? 's' : ''}`);
    } else if (successCount === 0) {
      alert(`Failed to delete all contacts. Please try again.`);
    } else {
      alert(`Deleted ${successCount} contact${successCount > 1 ? 's' : ''}. Failed to delete ${failedCount}.`);
    }

    if (successCount > 0) {
      fetchContacts(currentPage);
      // Refresh filter options in case deleted contacts changed available values
      try {
        const options = await vendorContactsApi.getFilterOptions(organizationId);
        setFilterOptions({
          locations: options.locations || [],
          categories: options.categories || [],
          tags: options.tags || [],
        });
      } catch { /* ignore */ }
    }
  };

  const hasActiveFilters = locationFilters.length > 0 || categoryFilters.length > 0 || tagFilters.length > 0;

  const clearAllFilters = () => {
    setLocationFilters([]);
    setCategoryFilters([]);
    setTagFilters([]);
    setShowSaveInput(false);
    setListName('');
  };

  const handleSaveList = async () => {
    if (!listName.trim()) return;
    setSavingList(true);
    try {
      await contactListsApi.create(organizationId, {
        name: listName.trim(),
        list_type: 'smart',
        filters: {
          locations: locationFilters.length > 0 ? locationFilters : undefined,
          categories: categoryFilters.length > 0 ? categoryFilters : undefined,
          tags: tagFilters.length > 0 ? tagFilters : undefined,
        },
      });
      setListName('');
      setShowSaveInput(false);
      setActiveTab('lists');
    } catch (err: any) {
      alert(err.message || 'Failed to save list');
    } finally {
      setSavingList(false);
    }
  };

  const removeFilterChip = (type: 'location' | 'category' | 'tag', value: string) => {
    if (type === 'location') setLocationFilters(prev => prev.filter(v => v !== value));
    if (type === 'category') setCategoryFilters(prev => prev.filter(v => v !== value));
    if (type === 'tag') setTagFilters(prev => prev.filter(v => v !== value));
  };

  // Loading state
  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Loading your network...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchContacts()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state (no contacts at all)
  if (contacts.length === 0 && !searchTerm && !hasActiveFilters) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Start Building Your Network
            </h3>
            <p className="text-white/50 text-sm mb-6">
              Add vendors to your network to easily invite them to future events.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                Add Your First Contact
              </button>
              <button
                onClick={() => setShowCSVUploadModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all border border-white/20"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
            </div>
            <p className="text-white/40 text-xs mt-3">
              You can also add vendors from your event submissions
            </p>
          </div>
        </div>

        {showAddModal && (
          <AddContactModal
            organizationId={organizationId}
            onClose={() => setShowAddModal(false)}
            onSuccess={(newContact) => {
              setContacts(prev => [newContact, ...prev]);
              setShowAddModal(false);
            }}
          />
        )}

        {showCSVUploadModal && (
          <CSVUploadModal
            open={showCSVUploadModal}
            onClose={() => setShowCSVUploadModal(false)}
            onSuccess={() => {
              fetchContacts();
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Network</h2>
          <p className="text-sm text-white/60">
            Manage your professional contacts and relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCSVUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-all border border-white/20"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`
            px-4 py-2.5 text-sm font-medium transition-all relative
            ${activeTab === 'contacts'
              ? 'text-white'
              : 'text-white/60 hover:text-white'
            }
          `}
        >
          All Contacts
          {activeTab === 'contacts' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('lists')}
          className={`
            flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all relative
            ${activeTab === 'lists'
              ? 'text-white'
              : 'text-white/60 hover:text-white'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          Lists
          {activeTab === 'lists' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-500" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'contacts' && (
        <>
          {/* Multi-select filter dropdowns */}
          <div className="flex items-center gap-3 flex-wrap">
            <MultiSelectFilterDropdown
              label="Locations"
              options={filterOptions.locations}
              selected={locationFilters}
              onChange={setLocationFilters}
            />
            <MultiSelectFilterDropdown
              label="Categories"
              options={filterOptions.categories}
              selected={categoryFilters}
              onChange={setCategoryFilters}
            />
            <MultiSelectFilterDropdown
              label="Tags"
              options={filterOptions.tags}
              selected={tagFilters}
              onChange={setTagFilters}
            />

            {/* Clear Filters + Save as List */}
            {hasActiveFilters && (
              <>
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs rounded-lg transition-colors border border-white/10"
                >
                  Clear Filters
                </button>

                {!showSaveInput ? (
                  <button
                    onClick={() => setShowSaveInput(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 text-xs font-medium rounded-lg transition-colors border border-purple-500/30"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save as List
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveList()}
                      placeholder="List name..."
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 w-40"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveList}
                      disabled={savingList || !listName.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-3 h-3" />
                      {savingList ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setShowSaveInput(false); setListName(''); }}
                      className="p-1.5 text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5">
              {locationFilters.map(loc => (
                <span key={`loc-${loc}`} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                  {loc}
                  <button onClick={() => removeFilterChip('location', loc)} className="hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {categoryFilters.map(cat => (
                <span key={`cat-${cat}`} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                  {cat}
                  <button onClick={() => removeFilterChip('category', cat)} className="hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tagFilters.map(tag => (
                <span key={`tag-${tag}`} className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                  {tag}
                  <button onClick={() => removeFilterChip('tag', tag)} className="hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search & Actions bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="Search contacts..."
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearchSubmit}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Selection info */}
          {selectedContacts.length > 0 && (
            <div className="flex items-center justify-between gap-3 text-xs bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <div className="flex items-center gap-3 text-white/60">
                <span className="font-medium">{selectedContacts.length} selected</span>
                <button
                  onClick={() => setSelectedContacts([])}
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Clear
                </button>
              </div>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 text-xs font-medium rounded-lg transition-colors border border-red-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>
            </div>
          )}

          {/* No results message */}
          {contacts.length === 0 && (searchTerm || hasActiveFilters) && (
            <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/50 text-sm">
                {searchTerm ? `No contacts found for "${searchTerm}"` : 'No contacts match the selected filters'}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearAllFilters();
                  fetchContacts(1);
                }}
                className="mt-3 text-purple-400 hover:text-purple-300 text-sm underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Contacts Table */}
          {contacts.length > 0 && (
            <ContactsTable
              contacts={contacts}
              selectedContacts={selectedContacts}
              onSelectContact={handleSelectContact}
              onSelectAll={handleSelectAll}
              onDeleteContact={handleDeleteContact}
              onEditContact={(contact) => setEditingContact(contact)}
              paginationMeta={paginationMeta}
              onPageChange={handlePageChange}
            />
          )}

          {/* Modals */}
          {showAddModal && (
            <AddContactModal
              organizationId={organizationId}
              onClose={() => setShowAddModal(false)}
              onSuccess={(newContact) => {
                setContacts(prev => [newContact, ...prev]);
                setShowAddModal(false);
              }}
            />
          )}

          {editingContact && (
            <EditContactModal
              organizationId={organizationId}
              contact={editingContact}
              onClose={() => setEditingContact(null)}
              onSuccess={(updatedContact) => {
                setContacts(prev =>
                  prev.map(c => (c.id === updatedContact.id ? updatedContact : c))
                );
                setEditingContact(null);
              }}
            />
          )}

          {showCSVUploadModal && (
            <CSVUploadModal
              open={showCSVUploadModal}
              onClose={() => setShowCSVUploadModal(false)}
              onSuccess={() => {
                fetchContacts();
              }}
            />
          )}
        </>
      )}

      {/* Lists Tab Content */}
      {activeTab === 'lists' && (
        <ListsManagement
          organizationId={organizationId}
          onViewList={(filters) => {
            setLocationFilters(filters.locations || []);
            setCategoryFilters(filters.categories || []);
            setTagFilters(filters.tags || []);
            setActiveTab('contacts');
          }}
        />
      )}
    </div>
  );
}
