import { useState, useEffect } from 'react';
import { Filter, Users, Calendar, Trash2, Edit3, Eye, X, Save, Plus, Download, Loader2 } from 'lucide-react';
import { contactListsApi, ContactList } from '@/services/api';
import type { VendorContact } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import SmartListBuilder from './SmartListBuilder';
import { contactsToCsv, triggerCsvDownload } from '../contactsCsvExport';

interface ListsManagementProps {
  organizationId: number;
  onViewList?: (filters: { locations?: string[]; categories?: string[]; tags?: string[] }) => void;
  onViewManualList?: (listId: number, listName: string) => void;
}

export default function ListsManagement({ organizationId, onViewList, onViewManualList }: ListsManagementProps) {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFilters, setEditFilters] = useState<{
    categories?: string[];
    locations?: string[];
    tags?: string[];
  }>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Create list state
  const [isCreating, setIsCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createFilters, setCreateFilters] = useState<{
    categories?: string[];
    locations?: string[];
    tags?: string[];
  }>({});
  const [savingCreate, setSavingCreate] = useState(false);

  // Download state
  const [downloadingListId, setDownloadingListId] = useState<number | null>(null);

  const handleDownloadList = async (listId: number, listName: string) => {
    setDownloadingListId(listId);
    try {
      let allContacts: VendorContact[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await contactListsApi.getContacts(listId, page, 200);
        allContacts.push(...(response.vendor_contacts || []));
        totalPages = response.meta?.total_pages || 1;
        page++;
      } while (page <= totalPages);

      const csv = contactsToCsv(allContacts);
      const safeName = listName.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
      const date = new Date().toISOString().slice(0, 10);
      triggerCsvDownload(csv, `list-${safeName}-${date}.csv`);
    } catch (err: any) {
      alert(err.message || 'Failed to export list');
    } finally {
      setDownloadingListId(null);
    }
  };

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
      if (editingId === listId) setEditingId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete list');
    }
  };

  const handleStartEdit = (list: ContactList) => {
    setEditingId(list.id);
    setEditName(list.name);
    setEditDescription(list.description || '');
    setEditFilters(list.filters || {});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
    setEditFilters({});
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await contactListsApi.update(editingId, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        filters: editFilters,
      });
      setLists(prev => prev.map(l => l.id === editingId ? { ...l, ...updated, name: editName.trim(), description: editDescription.trim(), filters: editFilters } : l));
      setEditingId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update list');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setCreateName('');
    setCreateDescription('');
    setCreateFilters({});
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setCreateName('');
    setCreateDescription('');
    setCreateFilters({});
  };

  const handleSaveCreate = async () => {
    if (!createName.trim()) return;
    setSavingCreate(true);
    try {
      const newList = await contactListsApi.create(organizationId, {
        name: createName.trim(),
        description: createDescription.trim() || undefined,
        list_type: 'smart',
        filters: createFilters,
      });
      setLists(prev => [newList, ...prev]);
      setIsCreating(false);
      setCreateName('');
      setCreateDescription('');
      setCreateFilters({});
    } catch (err: any) {
      alert(err.message || 'Failed to create list');
    } finally {
      setSavingCreate(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-foreground/60">Loading your lists...</p>
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
            className="px-4 py-2 bg-background/10 hover:bg-background/20 text-foreground rounded-lg transition-colors"
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-card/80 dark:bg-background/10">
              <Filter className="w-8 h-8 text-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Saved Lists Yet
            </h3>
            <p className="text-foreground/50 text-sm mb-4">
              Create a smart list with filter combinations or use the filters on the All Contacts tab and save them as a reusable list.
            </p>
            <button
              onClick={handleStartCreate}
              className="mb-4 flex items-center gap-2 px-5 py-2.5 voxxy-btn-cta text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Smart List
            </button>
            <div className="voxxy-surface-subtle rounded-lg p-4 text-left">
              <p className="text-foreground/70 text-xs font-medium mb-2">How it works:</p>
              <ol className="text-foreground/50 text-xs space-y-1.5 list-decimal list-inside">
                <li>Create a list with custom filters or from the All Contacts tab</li>
                <li>Select filters for locations, categories, or tags</li>
                <li>Save the filter combination with a name</li>
                <li>Use saved lists to quickly invite contacts to events</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Create List Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-[90vw] max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-card text-card-foreground shadow-2xl dark:border-white/8 dark:bg-[rgba(39,28,63,0.96)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_24px_48px_rgba(2,2,8,0.34)]">
              {/* Modal Header */}
              <div className="sticky top-0 voxxy-gradient-modal-header backdrop-blur-md border-b border-primary/20 px-6 py-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Create Smart List</h2>
                <button
                  onClick={handleCancelCreate}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* List Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1.5">List Name</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background/10 border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="List name"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1.5">Description (optional)</label>
                  <textarea
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background/10 border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                    rows={2}
                    placeholder="Description (optional)"
                  />
                </div>

                {/* Filters */}
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-2">Filters</label>
                  <SmartListBuilder
                    organizationId={organizationId}
                    filters={createFilters}
                    onFiltersChange={setCreateFilters}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCancelCreate}
                    className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg border border-border text-foreground/90 hover:bg-background/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCreate}
                    disabled={savingCreate || !createName.trim()}
                    className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg voxxy-btn-cta hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {savingCreate ? (
                      <>
                        <span className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Create List
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Saved Lists</h3>
          <p className="text-sm text-foreground/60">
            {lists.length} {lists.length === 1 ? 'list' : 'lists'} saved
          </p>
        </div>
        <button
          onClick={handleStartCreate}
          className="flex items-center gap-2 px-4 py-2.5 voxxy-btn-cta text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Smart List
        </button>
      </div>

      {/* Lists Table */}
      <div className="voxxy-table-shell">
        <table className="w-full">
          <thead>
            <tr className="voxxy-table-header">
              <th className="px-4 py-3 text-left">
                <span className="voxxy-table-header-row text-xs font-semibold uppercase tracking-wide">Name</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="voxxy-table-header-row text-xs font-semibold uppercase tracking-wide">Filters</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="voxxy-table-header-row text-xs font-semibold uppercase tracking-wide">Contacts</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="voxxy-table-header-row text-xs font-semibold uppercase tracking-wide">Last Used</span>
              </th>
              <th className="px-4 py-3 text-right">
                <span className="voxxy-table-header-row text-xs font-semibold uppercase tracking-wide">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lists.map(list => (
              <tr
                key={list.id}
                className="voxxy-table-row voxxy-table-row-hover group"
              >
                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {list.name}
                      </p>
                      {list.description && (
                        <p className="text-xs text-foreground/50 truncate">
                          {list.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Filters */}
                <td className="px-4 py-3">
                  {list.filters ? (
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {list.filters.categories && list.filters.categories.length > 0 && (
                        list.filters.categories.map(cat => (
                          <span key={cat} className="text-xs px-1.5 py-0.5 bg-blue-500/15 text-blue-950 dark:text-blue-300 rounded">
                            {cat}
                          </span>
                        ))
                      )}
                      {list.filters.locations && list.filters.locations.length > 0 && (
                        list.filters.locations.map(loc => (
                          <span key={loc} className="text-xs px-1.5 py-0.5 bg-primary/15 text-violet-950 dark:text-primary rounded">
                            {loc}
                          </span>
                        ))
                      )}
                      {list.filters.tags && list.filters.tags.length > 0 && (
                        list.filters.tags.map(tag => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 bg-green-500/15 text-emerald-950 dark:text-green-300 rounded">
                            {tag}
                          </span>
                        ))
                      )}
                      {!list.filters.categories?.length && !list.filters.locations?.length && !list.filters.tags?.length && (
                        <span className="text-xs text-foreground/75 dark:text-muted-foreground">No filters</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-foreground/75 dark:text-muted-foreground">No filters</span>
                  )}
                </td>

                {/* Contacts Count */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-foreground/70">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">{list.contacts_count}</span>
                  </div>
                </td>

                {/* Last Used */}
                <td className="px-4 py-3">
                  {list.last_used_at ? (
                    <div className="flex items-center gap-1.5 text-foreground/50">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {formatDistanceToNow(new Date(list.last_used_at), { addSuffix: true })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-foreground/30">Never</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleDownloadList(list.id, list.name)}
                      disabled={downloadingListId === list.id}
                      className="rounded p-1.5 text-foreground/60 transition-colors hover:bg-accent/60 hover:text-foreground dark:hover:bg-background/10"
                      title="Export list as CSV"
                    >
                      {downloadingListId === list.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (list.filters && onViewList) {
                          onViewList(list.filters);
                        } else if (list.list_type === 'manual' && onViewManualList) {
                          onViewManualList(list.id, list.name);
                        }
                      }}
                      className="rounded p-1.5 text-foreground/60 transition-colors hover:bg-accent/60 hover:text-foreground dark:hover:bg-background/10"
                      title={list.list_type === 'manual' ? 'View list contacts' : 'View filtered contacts'}
                      disabled={!list.filters && list.list_type !== 'manual'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(list)}
                      className="rounded p-1.5 text-foreground/60 transition-colors hover:bg-accent/60 hover:text-foreground dark:hover:bg-background/10"
                      title="Edit list"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id, list.name)}
                      className="p-1.5 hover:bg-red-500/20 rounded text-foreground/60 hover:text-red-400 transition-colors"
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

      {/* Edit List Modal */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-[90vw] max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-card text-card-foreground shadow-2xl dark:border-white/8 dark:bg-[rgba(39,28,63,0.96)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_24px_48px_rgba(2,2,8,0.34)]">
            {/* Modal Header */}
            <div className="sticky top-0 voxxy-gradient-modal-header backdrop-blur-md border-b border-primary/20 px-6 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Edit List</h2>
              <button
                onClick={handleCancelEdit}
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* List Name */}
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1.5">List Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background/10 border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="List name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1.5">Description (optional)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background/10 border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                  rows={2}
                  placeholder="Description (optional)"
                />
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-2">Filters</label>
                <SmartListBuilder
                  organizationId={organizationId}
                  filters={editFilters}
                  onFiltersChange={setEditFilters}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg border border-border text-foreground/90 hover:bg-background/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editName.trim()}
                  className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg voxxy-btn-cta hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {savingEdit ? (
                    <>
                      <span className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create List Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-[90vw] max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-card text-card-foreground shadow-2xl dark:border-white/8 dark:bg-[rgba(39,28,63,0.96)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_24px_48px_rgba(2,2,8,0.34)]">
            {/* Modal Header */}
            <div className="sticky top-0 voxxy-gradient-modal-header backdrop-blur-md border-b border-primary/20 px-6 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Create Smart List</h2>
              <button
                onClick={handleCancelCreate}
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* List Name */}
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1.5">List Name</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background/10 border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="List name"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-1.5">Description (optional)</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background/10 border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                  rows={2}
                  placeholder="Description (optional)"
                />
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground/90 mb-2">Filters</label>
                <SmartListBuilder
                  organizationId={organizationId}
                  filters={createFilters}
                  onFiltersChange={setCreateFilters}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancelCreate}
                  className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg border border-border text-foreground/90 hover:bg-background/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCreate}
                  disabled={savingCreate || !createName.trim()}
                  className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg voxxy-btn-cta hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {savingCreate ? (
                    <>
                      <span className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create List
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
