import { useState, useEffect } from 'react';
import { Plus, List, Filter, Users, Calendar, Trash2, Edit3, Eye } from 'lucide-react';
import { contactListsApi, ContactList } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import CreateListModal from './CreateListModal';

interface ListsManagementProps {
  organizationId: number;
}

export default function ListsManagement({ organizationId }: ListsManagementProps) {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingList, setViewingList] = useState<ContactList | null>(null);

  useEffect(() => {
    fetchLists();
  }, [organizationId]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactListsApi.getAll(organizationId);
      setLists(response.contact_lists);
    } catch (err: any) {
      setError(err.message || 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId: number, listName: string) => {
    if (!confirm(`Are you sure you want to delete the list "${listName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await contactListsApi.delete(listId);
      setLists(prev => prev.filter(l => l.id !== listId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete list');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Loading your lists...</p>
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
            onClick={fetchLists}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (lists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <List className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Create Your First Contact List
          </h3>
          <p className="text-white/50 text-sm mb-6">
            Organize your contacts into smart lists or manual collections for easy event invitations.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            Create Your First List
          </button>
          <div className="mt-6 space-y-2 text-left bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/70 text-xs font-medium mb-2">List Types:</p>
            <div className="flex items-start gap-2">
              <Filter className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white text-xs font-medium">Smart Lists</p>
                <p className="text-white/50 text-xs">Auto-update based on filters like category, location, and tags</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white text-xs font-medium">Manual Lists</p>
                <p className="text-white/50 text-xs">Hand-pick specific contacts that stay fixed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lists view
  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Contact Lists</h3>
          <p className="text-sm text-white/60">
            {lists.length} {lists.length === 1 ? 'list' : 'lists'} • {lists.reduce((sum, list) => sum + list.contacts_count, 0)} total contacts
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create List
        </button>
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map(list => (
          <div
            key={list.id}
            className="bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all p-5 group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {list.list_type === 'smart' ? (
                  <Filter className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <Users className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate mb-0.5">
                    {list.name}
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    list.list_type === 'smart'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {list.list_type === 'smart' ? 'Smart' : 'Manual'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setViewingList(list)}
                  className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                  title="View list"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    // TODO: Open edit modal
                    alert('Edit functionality coming soon');
                  }}
                  className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                  title="Edit list"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteList(list.id, list.name)}
                  className="p-1.5 hover:bg-red-500/20 rounded text-white/60 hover:text-red-400 transition-colors"
                  title="Delete list"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Description */}
            {list.description && (
              <p className="text-xs text-white/50 mb-3 line-clamp-2">
                {list.description}
              </p>
            )}

            {/* Smart List Filters Preview */}
            {list.list_type === 'smart' && list.filters && (
              <div className="mb-3 space-y-1">
                {list.filters.categories && list.filters.categories.length > 0 && (
                  <div className="text-xs text-white/60">
                    <span className="text-white/40">Categories:</span> {list.filters.categories.join(', ')}
                  </div>
                )}
                {list.filters.locations && list.filters.locations.length > 0 && (
                  <div className="text-xs text-white/60">
                    <span className="text-white/40">Locations:</span> {list.filters.locations.join(', ')}
                  </div>
                )}
                {list.filters.tags && list.filters.tags.length > 0 && (
                  <div className="text-xs text-white/60">
                    <span className="text-white/40">Tags:</span> {list.filters.tags.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Footer Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-1 text-white/60">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs">
                  {list.contacts_count} {list.contacts_count === 1 ? 'contact' : 'contacts'}
                </span>
              </div>
              {list.last_used_at && (
                <div className="flex items-center gap-1 text-white/40">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(list.last_used_at), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateListModal
          organizationId={organizationId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newList) => {
            setLists(prev => [newList, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* TODO: ViewListModal */}
      {/* {viewingList && <ViewListModal list={viewingList} onClose={() => setViewingList(null)} />} */}
    </div>
  );
}
