import { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Upload } from 'lucide-react';
import { vendorContactsApi, VendorContact } from '@/services/api';
import ContactsTable from './ContactsTable';
import AddContactModal from './AddContactModal';
import EditContactModal from './EditContactModal';
import { CSVUploadModal } from './CSVUploadModal';

interface NetworkPageProps {
  organizationId: number;
}

export default function NetworkPage({ organizationId }: NetworkPageProps) {
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVUploadModal, setShowCSVUploadModal] = useState(false);
  const [editingContact, setEditingContact] = useState<VendorContact | null>(null);

  // Filter states
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [organizationId, locationFilter, categoryFilter, featuredFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await vendorContactsApi.getAll(organizationId, {
        search: searchTerm || undefined,
        location: locationFilter || undefined,
        category: categoryFilter || undefined,
        featured: featuredFilter || undefined,
      });

      // Handle different response formats
      const contactsData = response?.vendor_contacts || [];

      setContacts(contactsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
      setContacts([]); // Set to empty array on error to prevent crashes
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchSubmit = () => {
    fetchContacts();
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

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to remove this contact from your network?')) {
      return;
    }

    try {
      await vendorContactsApi.delete(contactId);
      // Remove from local state
      setContacts(prev => prev.filter(c => c.id !== contactId));
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete contact');
    }
  };

  const handleToggleFeatured = async (contactId: number) => {
    try {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return;

      const updatedContact = await vendorContactsApi.update(contactId, {
        featured: !contact.featured,
      });

      setContacts(prev =>
        prev.map(c => (c.id === contactId ? updatedContact : c))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update featured status');
    }
  };

  // Get unique locations and categories for filter dropdowns
  const uniqueLocations = Array.from(new Set(contacts.map(c => c.location).filter(Boolean))) as string[];
  const uniqueCategories = Array.from(new Set(contacts.flatMap(c => c.categories || []))).sort();

  // Loading state
  if (loading) {
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
  if (error) {
    return (
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
    );
  }

  // Empty state
  if (contacts.length === 0 && !searchTerm) {
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
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              Add Your First Contact
            </button>
            <p className="text-white/40 text-xs mt-3">
              You can also add vendors from your event submissions
            </p>
          </div>
        </div>

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
      </>
    );
  }

  // No search results
  if (contacts.length === 0 && searchTerm) {
    return (
      <>
        <div className="space-y-4">
          {/* Header with search */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">My Vendor Network</h2>
              <p className="text-white/50 text-xs mt-0.5">Manage your vendor contacts</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Add Contact
            </button>
          </div>

          {/* Search bar */}
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

          {/* No results */}
          <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/50 text-sm">No contacts found for "{searchTerm}"</p>
            <button
              onClick={() => {
                setSearchTerm('');
                fetchContacts();
              }}
              className="mt-3 text-purple-400 hover:text-purple-300 text-sm underline"
            >
              Clear search
            </button>
          </div>
        </div>

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

      {/* Filter dropdowns */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Location Filter */}
        <div className="relative">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="pl-3 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white appearance-none cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="" className="bg-gray-900">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location} className="bg-gray-900">{location}</option>
            ))}
          </select>
          <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-3 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white appearance-none cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="" className="bg-gray-900">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category} className="bg-gray-900">{category}</option>
            ))}
          </select>
          <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
        </div>

        {/* Featured/Voxxy Card Filter */}
        <div className="relative">
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="pl-3 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white appearance-none cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="" className="bg-gray-900">All Contacts</option>
            <option value="true" className="bg-gray-900">Voxxy Cards Only</option>
          </select>
          <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
        </div>

        {/* Clear Filters Button */}
        {(locationFilter || categoryFilter || featuredFilter) && (
          <button
            onClick={() => {
              setLocationFilter('');
              setCategoryFilter('');
              setFeaturedFilter('');
            }}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs rounded-lg transition-colors border border-white/10"
          >
            Clear Filters
          </button>
        )}
      </div>

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
        <div className="flex items-center gap-3 text-xs text-white/60 bg-white/5 rounded-lg px-3 py-2">
          <span className="font-medium">{selectedContacts.length} selected</span>
          <button
            onClick={() => setSelectedContacts([])}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Contacts Table */}
      <ContactsTable
        contacts={contacts}
        selectedContacts={selectedContacts}
        onSelectContact={handleSelectContact}
        onSelectAll={handleSelectAll}
        onDeleteContact={handleDeleteContact}
        onEditContact={(contact) => setEditingContact(contact)}
        onToggleFeatured={handleToggleFeatured}
      />

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
            // Refresh contacts list after successful import
            fetchContacts();
          }}
        />
      )}
    </div>
  );
}
