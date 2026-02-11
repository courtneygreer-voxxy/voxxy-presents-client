import { useState, useEffect } from 'react';
import { Plus, List, Filter, Users, Calendar, Trash2, Edit3, Eye } from 'lucide-react';
import { contactListsApi, ContactList } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import CreateListModal from './CreateListModal';


interface ListsManagementProps {
  organizationId: number;
  onViewList?: (filters: { locations?: string[]; categories?: string[]; tags?: string[] }) => void;
}

export default function ListsManagement({ organizationId, onViewList }: ListsManagementProps) {
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
      <>
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

        {/* Modal */}
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
      </>
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

      {/* Lists Table */}
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">Name</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">Type</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">Filters</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">Contacts</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">Last Used</span>
              </th>
              <th className="px-4 py-3 text-right">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lists.map(list => (
              <tr
                key={list.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {list.list_type === 'smart' ? (
                      <Filter className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    ) : (
                      <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {list.name}
                      </p>
                      {list.description && (
                        <p className="text-xs text-white/50 truncate">
                          {list.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                    list.list_type === 'smart'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {list.list_type === 'smart' ? 'Smart' : 'Manual'}
                  </span>
                </td>

                {/* Filters */}
                <td className="px-4 py-3">
                  {list.list_type === 'smart' && list.filters ? (
                    <div className="space-y-0.5 max-w-xs">
                      {list.filters.categories && list.filters.categories.length > 0 && (
                        <p className="text-xs text-white/60 truncate">
                          <span className="text-white/40">Cat:</span> {list.filters.categories.join(', ')}
                        </p>
                      )}
                      {list.filters.locations && list.filters.locations.length > 0 && (
                        <p className="text-xs text-white/60 truncate">
                          <span className="text-white/40">Loc:</span> {list.filters.locations.join(', ')}
                        </p>
                      )}
                      {list.filters.tags && list.filters.tags.length > 0 && (
                        <p className="text-xs text-white/60 truncate">
                          <span className="text-white/40">Tags:</span> {list.filters.tags.join(', ')}
                        </p>
                      )}
                      {!list.filters.categories?.length && !list.filters.locations?.length && !list.filters.tags?.length && (
                        <span className="text-xs text-white/40">No filters</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-white/40">—</span>
                  )}
                </td>

                {/* Contacts Count */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-white/70">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">{list.contacts_count}</span>
                  </div>
                </td>

                {/* Last Used */}
                <td className="px-4 py-3">
                  {list.last_used_at ? (
                    <div className="flex items-center gap-1.5 text-white/50">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {formatDistanceToNow(new Date(list.last_used_at), { addSuffix: true })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-white/30">Never</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        if (list.list_type === 'smart' && list.filters && onViewList) {
                          onViewList(list.filters);
                        }
                      }}
                      className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                      title={list.list_type === 'smart' ? 'View filtered contacts' : 'Manual list view coming soon'}
                      disabled={list.list_type !== 'smart'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
