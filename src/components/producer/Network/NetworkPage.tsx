import { useState, useEffect, useRef } from 'react';
import { UserPlus, Upload, Save, X, Filter, Tag, Plus, Edit2, Trash2, Users, Search, ChevronDown, Check } from 'lucide-react';
import { MapPin, Tags } from 'lucide-react';
import { vendorContactsApi, contactListsApi, categoriesApi, VendorContact } from '@/services/api';
import type { Category } from '@/types/category';
import ContactsTable from './ContactsTable';
import AddContactModal from './AddContactModal';
import EditContactModal from './EditContactModal';
import { CSVUploadModal } from './CSVUploadModal';
import ListsManagement from './Lists/ListsManagement';
import { BulkActionToolbar } from './BulkActionToolbar';
import type { ActiveFilter, FilterFieldConfig } from '@/components/shared/SearchFilterBar';

type NetworkTab = 'contacts' | 'lists' | 'categories';

// Filter Dropdown Component
function FilterDropdownButton({
  field,
  selectedValues,
  onChange,
}: {
  field: FilterFieldConfig;
  selectedValues: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = field.options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const Icon = field.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          selectedValues.length > 0
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            : 'bg-white/5 text-white/60 hover:text-white border border-white/10 hover:bg-white/10'
        }`}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span>{field.label}</span>
        {selectedValues.length > 0 && (
          <span className="flex items-center justify-center w-4 h-4 bg-purple-500 text-white text-[10px] font-bold rounded-full">
            {selectedValues.length}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-56 bg-gray-900 border border-white/20 rounded-lg shadow-xl overflow-hidden">
          {field.options.length > 5 && (
            <div className="p-2 border-b border-white/10">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${field.label.toLowerCase()}...`}
                className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                autoFocus
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-white/40">No options found</p>
            ) : (
              filtered.map(option => (
                <button
                  key={option}
                  onClick={() => handleToggle(option)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 rounded transition-colors"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedValues.includes(option)
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-white/30'
                    }`}
                  >
                    {selectedValues.includes(option) && (
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="truncate text-left">{option}</span>
                </button>
              ))
            )}
          </div>
          {selectedValues.length > 0 && (
            <div className="p-1.5 border-t border-white/10">
              <button
                onClick={() => onChange([])}
                className="w-full text-xs text-white/40 hover:text-white py-1 transition-colors"
              >
                Clear {field.label.toLowerCase()}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NetworkPageProps {
  organizationId: number;
  activeTab: NetworkTab;
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  showCSVUploadModal: boolean;
  setShowCSVUploadModal: (show: boolean) => void;
  onTabChange?: (tab: NetworkTab) => void;
}

export default function NetworkPage({
  organizationId,
  activeTab,
  showAddModal,
  setShowAddModal,
  showCSVUploadModal,
  setShowCSVUploadModal,
  onTabChange
}: NetworkPageProps) {
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [editingContact, setEditingContact] = useState<VendorContact | null>(null);

  // SearchFilterBar state
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // Category objects
  const [categories, setCategories] = useState<Category[]>([]);

  // Category CRUD state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', icon: '', color: '#FF6B6B' });

  // Filter options from backend
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

  // Bulk update state
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);

  // Derive filter arrays from activeFilters
  const locationFilters = activeFilters.find(f => f.fieldKey === 'location')?.values || [];
  const categoryFilters = activeFilters.find(f => f.fieldKey === 'category')?.values || [];
  const tagFilters = activeFilters.find(f => f.fieldKey === 'tags')?.values || [];
  const hasActiveFilters = locationFilters.length > 0 || categoryFilters.length > 0 || tagFilters.length > 0;

  // Filter field config for SearchFilterBar
  const filterFieldConfigs: FilterFieldConfig[] = [
    { key: 'category', label: 'Category', icon: Tag, options: filterOptions.categories, multi: true },
    { key: 'location', label: 'Location', icon: MapPin, options: filterOptions.locations, multi: true },
    { key: 'tags', label: 'Tags', icon: Tags, options: filterOptions.tags, multi: true },
  ];

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

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll(organizationId, true);
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [organizationId]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchContacts(1);
  }, [organizationId, locationFilters.join(','), categoryFilters.join(','), tagFilters.join(',')]);

  const fetchContacts = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const response = await vendorContactsApi.getAll(organizationId, {
        search: searchTerm || undefined,
        location: locationFilters.length > 0 ? locationFilters : undefined,
        category: categoryFilters.length > 0 ? categoryFilters : undefined,
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
        contactsData = contactsData.filter((c: VendorContact) =>
          c.location && locationFilters.includes(c.location)
        );
      }
      if (categoryFilters.length > 1) {
        contactsData = contactsData.filter((c: VendorContact) =>
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

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    fetchContacts(1);
  };

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
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
    if (!confirm('Are you sure you want to remove this contact from your network?')) return;

    try {
      await vendorContactsApi.delete(contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete contact');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedContacts.length} contact${selectedContacts.length === 1 ? '' : 's'}? This action cannot be undone.`)) return;

    try {
      setBulkUpdateLoading(true);
      const result = await vendorContactsApi.bulkDelete(organizationId, selectedContacts);
      alert(result.message || `Successfully deleted ${result.deleted_count} contacts`);
      await fetchContacts(currentPage);
      try {
        const options = await vendorContactsApi.getFilterOptions(organizationId);
        setFilterOptions({ locations: options.locations || [], categories: options.categories || [], tags: options.tags || [] });
      } catch { /* ignore */ }
      setSelectedContacts([]);
    } catch (error: any) {
      alert(`Failed to delete contacts: ${error.message || 'Unknown error'}`);
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  const handleBulkCategoryUpdate = async (categoryNames: string[]) => {
    if (selectedContacts.length === 0) return;

    const selectedContactObjects = contacts.filter(c => selectedContacts.includes(c.id));
    const hasExistingCategories = selectedContactObjects.some(c => c.categories && c.categories.length > 0);
    let categoryMode: 'replace' | 'append' = 'replace';
    if (hasExistingCategories) {
      const userChoice = confirm(
        `Some selected contacts already have categories.\n\nClick "OK" to ADD this category to their existing categories.\nClick "Cancel" to REPLACE their categories with this new category.`
      );
      categoryMode = userChoice ? 'append' : 'replace';
    }

    try {
      setBulkUpdateLoading(true);
      const result = await vendorContactsApi.bulkUpdate(organizationId, selectedContacts, { categories: categoryNames, category_mode: categoryMode });
      alert(result.message || `Successfully updated ${result.updated_count} contacts`);
      await fetchContacts(currentPage);
      setSelectedContacts([]);
    } catch (error: any) {
      alert(`Failed to update contacts: ${error.message || 'Unknown error'}`);
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  const handleBulkLocationUpdate = async (location: string) => {
    if (selectedContacts.length === 0) return;

    try {
      setBulkUpdateLoading(true);
      const result = await vendorContactsApi.bulkUpdate(organizationId, selectedContacts, { location });
      alert(result.message || `Successfully updated ${result.updated_count} contacts`);
      await fetchContacts(currentPage);
      setSelectedContacts([]);
    } catch (error: any) {
      alert(`Failed to update location: ${error.message || 'Unknown error'}`);
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setShowSaveInput(false);
    setListName('');
  };

  // Category CRUD functions
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: '', icon: '', color: '#FF6B6B' });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({ name: category.name, icon: category.icon || '', color: category.color || '#FF6B6B' });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      alert('Category name is required');
      return;
    }
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, {
          name: categoryFormData.name.trim(),
          icon: categoryFormData.icon.trim() || undefined,
          color: categoryFormData.color,
        });
      } else {
        await categoriesApi.create(organizationId, {
          name: categoryFormData.name.trim(),
          icon: categoryFormData.icon.trim() || undefined,
          color: categoryFormData.color,
        });
      }
      await loadCategories();
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryFormData({ name: '', icon: '', color: '#FF6B6B' });
    } catch (error: any) {
      alert(`Failed to save category: ${error.response?.data?.error || error.message || 'Please try again.'}`);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (category.in_use) {
      const stats = category.usage_stats;
      const usageDetails = [];
      if (stats?.applications_count) usageDetails.push(`${stats.applications_count} vendor application(s)`);
      if (stats?.email_templates_count) usageDetails.push(`${stats.email_templates_count} email template(s)`);
      if (stats?.scheduled_emails_count) usageDetails.push(`${stats.scheduled_emails_count} scheduled email(s)`);
      alert(`Cannot delete this category. It is currently being used by:\n\n${usageDetails.join('\n')}\n\nPlease remove these associations first.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) return;
    try {
      await categoriesApi.delete(category.id);
      await loadCategories();
    } catch (error: any) {
      alert(`Failed to delete category: ${error.response?.data?.error || error.message || 'Please try again.'}`);
    }
  };

  const handleViewCategory = (category: Category) => {
    setActiveFilters([{ fieldKey: 'category', values: [category.name] }]);
    onTabChange?.('contacts');
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
      onTabChange?.('lists');
    } catch (err: any) {
      alert(err.message || 'Failed to save list');
    } finally {
      setSavingList(false);
    }
  };

  // Loading state
  if (loading && contacts.length === 0 && activeTab === 'contacts') {
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
  if (error && contacts.length === 0 && activeTab === 'contacts') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => fetchContacts()} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state (no contacts at all)
  if (contacts.length === 0 && !searchTerm && !hasActiveFilters && activeTab === 'contacts') {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Start Building Your Network</h3>
            <p className="text-white/50 text-sm mb-6">Add vendors to your network to easily invite them to future events.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all">
                Add Your First Contact
              </button>
              <button onClick={() => setShowCSVUploadModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all border border-white/20">
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
            </div>
          </div>
        </div>

        {showAddModal && (
          <AddContactModal organizationId={organizationId} onClose={() => setShowAddModal(false)} onSuccess={(newContact) => { setContacts(prev => [newContact, ...prev]); setShowAddModal(false); }} />
        )}
        {showCSVUploadModal && (
          <CSVUploadModal open={showCSVUploadModal} onClose={() => setShowCSVUploadModal(false)} onSuccess={() => { fetchContacts(); }} />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and tabs removed - now in Dashboard.tsx header */}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <>
          {/* Search & Filter Bar with Action Buttons */}
          <div className="space-y-2">
            {/* Search Row with Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>

              {/* Import CSV & Add Contact Buttons */}
              <button
                onClick={() => setShowCSVUploadModal(true)}
                className="flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/20 whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Import CSV</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-semibold rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Contact</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* Filter Dropdowns Row */}
            {(filterFieldConfigs.length > 0) && (
              <div className="flex items-center gap-2 flex-wrap">
                {filterFieldConfigs.map(field => {
                  const selectedValues = activeFilters.find(f => f.fieldKey === field.key)?.values || [];
                  return (
                    <FilterDropdownButton
                      key={field.key}
                      field={field}
                      selectedValues={selectedValues}
                      onChange={(values) => {
                        const existing = activeFilters.find(f => f.fieldKey === field.key);
                        if (existing) {
                          if (values.length === 0) {
                            setActiveFilters(activeFilters.filter(f => f.fieldKey !== field.key));
                          } else {
                            setActiveFilters(activeFilters.map(f => f.fieldKey === field.key ? { ...f, values } : f));
                          }
                        } else if (values.length > 0) {
                          setActiveFilters([...activeFilters, { fieldKey: field.key, values }]);
                        }
                      }}
                    />
                  );
                })}
                {activeFilters.filter(f => f.values.length > 0).length > 0 && (
                  <button
                    onClick={() => setActiveFilters([])}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Save as List (when filters active) */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
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
                  <button onClick={handleSaveList} disabled={savingList || !listName.trim()} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-colors">
                    <Save className="w-3 h-3" />
                    {savingList ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => { setShowSaveInput(false); setListName(''); }} className="p-1.5 text-white/40 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {contacts.length === 0 && (searchTerm || hasActiveFilters) && (
            <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/50 text-sm">
                {searchTerm ? `No contacts found for "${searchTerm}"` : 'No contacts match the selected filters'}
              </p>
              <button onClick={() => { setSearchTerm(''); clearAllFilters(); fetchContacts(1); }} className="mt-3 text-purple-400 hover:text-purple-300 text-sm underline">
                Clear all filters
              </button>
            </div>
          )}

          {/* Bulk Action Toolbar */}
          <BulkActionToolbar
            selectedCount={selectedContacts.length}
            categories={categories}
            onCategoryUpdate={handleBulkCategoryUpdate}
            onLocationUpdate={handleBulkLocationUpdate}
            onDelete={handleBulkDelete}
            onClear={() => setSelectedContacts([])}
            loading={bulkUpdateLoading}
          />

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
            <AddContactModal organizationId={organizationId} onClose={() => setShowAddModal(false)} onSuccess={(newContact) => { setContacts(prev => [newContact, ...prev]); setShowAddModal(false); }} />
          )}
          {editingContact && (
            <EditContactModal organizationId={organizationId} contact={editingContact} onClose={() => setEditingContact(null)} onSuccess={(updatedContact) => { setContacts(prev => prev.map(c => (c.id === updatedContact.id ? updatedContact : c))); setEditingContact(null); }} />
          )}
          {showCSVUploadModal && (
            <CSVUploadModal open={showCSVUploadModal} onClose={() => setShowCSVUploadModal(false)} onSuccess={() => { fetchContacts(); }} />
          )}
        </>
      )}

      {/* Lists Tab */}
      {activeTab === 'lists' && (
        <ListsManagement
          organizationId={organizationId}
          onViewList={(filters) => {
            const newFilters: ActiveFilter[] = [];
            if (filters.locations?.length) newFilters.push({ fieldKey: 'location', values: filters.locations });
            if (filters.categories?.length) newFilters.push({ fieldKey: 'category', values: filters.categories });
            if (filters.tags?.length) newFilters.push({ fieldKey: 'tags', values: filters.tags });
            setActiveFilters(newFilters);
            onTabChange?.('contacts');
          }}
        />
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">Manage vendor categories for organizing contacts</p>
            <button
              onClick={openAddCategoryModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
              <Tag className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-sm">No categories yet</p>
              <p className="text-white/40 text-xs mt-1">Create your first category to organize your vendors</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {category.icon && <span className="text-2xl">{category.icon}</span>}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm text-white font-medium">{category.name}</h3>
                        {category.color && (
                          <div
                            className="w-4 h-4 rounded border border-white/20"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                      </div>
                      {category.usage_stats && (
                        <p className="text-xs text-white/60 mt-0.5">
                          {category.usage_stats.applications_count || 0} vendor{category.usage_stats.applications_count !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleViewCategory(category)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                      title="View contacts in this category"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditCategoryModal(category)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                      title="Edit category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-white/10 w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => { setShowCategoryModal(false); setEditingCategory(null); setCategoryFormData({ name: '', icon: '', color: '#FF6B6B' }); }}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Category Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Food Vendor, Artist, Sponsor"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Icon (Emoji) - Optional</label>
                <input
                  type="text"
                  value={categoryFormData.icon}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🍕 or 🎨 or 🎤"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10 rounded-lg cursor-pointer bg-white/10 border border-white/10"
                  />
                  <input
                    type="text"
                    value={categoryFormData.color}
                    onChange={(e) => {
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                        setCategoryFormData(prev => ({ ...prev, color: e.target.value }));
                      }
                    }}
                    placeholder="#FF6B6B"
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-white/60 mb-2">Preview:</p>
                <div className="flex items-center gap-2">
                  {categoryFormData.icon && <span className="text-2xl">{categoryFormData.icon}</span>}
                  <span className="text-sm text-white font-medium">{categoryFormData.name || 'Category Name'}</span>
                  <div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: categoryFormData.color }} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
              <button
                onClick={() => { setShowCategoryModal(false); setEditingCategory(null); setCategoryFormData({ name: '', icon: '', color: '#FF6B6B' }); }}
                className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={!categoryFormData.name.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-medium transition-all"
              >
                {editingCategory ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
