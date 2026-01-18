import { useState, useEffect } from 'react';
import { Search, Users, Filter, MapPin, Tag, Check } from 'lucide-react';
import { vendorContactsApi, VendorContact } from '@/services/api';

interface ManualListBuilderProps {
  organizationId: number;
  selectedContactIds: number[];
  onSelectionChange: (contactIds: number[]) => void;
}

export default function ManualListBuilder({
  organizationId,
  selectedContactIds,
  onSelectionChange,
}: ManualListBuilderProps) {
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [organizationId, searchTerm, categoryFilter, locationFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await vendorContactsApi.getAll(organizationId, {
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        location: locationFilter || undefined,
        per_page: 1000, // Get all contacts for manual selection
      });

      setContacts(response.vendor_contacts || []);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleContact = (contactId: number) => {
    const updated = selectedContactIds.includes(contactId)
      ? selectedContactIds.filter((id) => id !== contactId)
      : [...selectedContactIds, contactId];

    onSelectionChange(updated);
  };

  const handleSelectAll = () => {
    if (selectedContactIds.length === contacts.length && contacts.length > 0) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all visible contacts
      onSelectionChange(contacts.map((c) => c.id));
    }
  };

  // Get unique categories and locations for filters
  const uniqueCategories = Array.from(
    new Set(contacts.flatMap((c) => c.categories || []))
  ).sort();
  const uniqueLocations = Array.from(
    new Set(contacts.map((c) => c.location).filter(Boolean))
  ).sort() as string[];

  const allSelected = contacts.length > 0 && selectedContactIds.length === contacts.length;
  const someSelected = selectedContactIds.length > 0 && selectedContactIds.length < contacts.length;

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white mb-1">
              Manual List Selection
            </p>
            <p className="text-xs text-white/60">
              Select specific contacts to include in this list. The list will remain static unless you manually edit it later.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, business, or email..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Category Filter */}
          {uniqueCategories.length > 0 && (
            <div className="relative flex-1">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white appearance-none cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-gray-900">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category} className="bg-gray-900">
                    {category}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            </div>
          )}

          {/* Location Filter */}
          {uniqueLocations.length > 0 && (
            <div className="relative flex-1">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white appearance-none cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-gray-900">All Locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location} className="bg-gray-900">
                    {location}
                  </option>
                ))}
              </select>
              <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            </div>
          )}

          {/* Clear Filters */}
          {(categoryFilter || locationFilter || searchTerm) && (
            <button
              onClick={() => {
                setCategoryFilter('');
                setLocationFilter('');
                setSearchTerm('');
              }}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs rounded-lg transition-colors border border-white/10 whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/10">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-white/60">Selected:</span>
          <span className="font-semibold text-white">
            {selectedContactIds.length} {selectedContactIds.length === 1 ? 'contact' : 'contacts'}
          </span>
        </div>
        <button
          onClick={handleSelectAll}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          {allSelected ? 'Deselect All' : 'Select All Visible'}
        </button>
      </div>

      {/* Contacts List */}
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm text-white/40">
                {searchTerm || categoryFilter || locationFilter
                  ? 'No contacts found matching your filters'
                  : 'No contacts available'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {contacts.map((contact) => {
                const isSelected = selectedContactIds.includes(contact.id);
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleToggleContact(contact.id)}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 transition-all text-left
                      ${
                        isSelected
                          ? 'bg-blue-500/20'
                          : 'bg-transparent hover:bg-white/5'
                      }
                    `}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-white/30'
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-white truncate">
                          {contact.contact_name}
                        </p>
                        {contact.featured && (
                          <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                            Voxxy Card
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        {contact.business_name && (
                          <span className="truncate">{contact.business_name}</span>
                        )}
                        {contact.location && (
                          <>
                            {contact.business_name && <span>•</span>}
                            <span className="truncate">{contact.location}</span>
                          </>
                        )}
                      </div>
                      {contact.categories && contact.categories.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {contact.categories.slice(0, 2).map((category) => (
                            <span
                              key={category}
                              className="text-xs px-1.5 py-0.5 bg-white/5 text-white/60 rounded"
                            >
                              {category}
                            </span>
                          ))}
                          {contact.categories.length > 2 && (
                            <span className="text-xs text-white/40">
                              +{contact.categories.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
