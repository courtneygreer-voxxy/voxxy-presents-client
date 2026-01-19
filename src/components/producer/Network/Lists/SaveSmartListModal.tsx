import { useState } from 'react';
import { X, Save, Filter, MapPin, Tag, Star } from 'lucide-react';
import { contactListsApi, ContactList } from '@/services/api';

interface SaveSmartListModalProps {
  organizationId: number;
  filters: {
    locations?: string[];
    categories?: string[];
    tags?: string[];
    featured?: boolean;
  };
  onClose: () => void;
  onSuccess: (list: ContactList) => void;
}

export default function SaveSmartListModal({
  organizationId,
  filters,
  onClose,
  onSuccess,
}: SaveSmartListModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('List name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const newList = await contactListsApi.create(organizationId, {
        name: name.trim(),
        description: description.trim() || undefined,
        list_type: 'smart',
        filters: filters,
      });

      onSuccess(newList);
    } catch (err: any) {
      setError(err.message || 'Failed to save smart list');
    } finally {
      setSaving(false);
    }
  };

  // Check if any filters are active
  const hasFilters =
    (filters.locations && filters.locations.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    filters.featured !== undefined;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-white/10 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">Save as Smart List</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Save your current filters as a reusable smart list
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Current Filters Preview */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-medium text-white">Current Filters</h3>
            </div>

            {!hasFilters && (
              <p className="text-xs text-white/50">No filters applied</p>
            )}

            {hasFilters && (
              <div className="space-y-2">
                {filters.locations && filters.locations.length > 0 && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-xs text-white/70">
                      Locations: {filters.locations.join(', ')}
                    </span>
                  </div>
                )}

                {filters.categories && filters.categories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-xs text-white/70">
                      Categories: {filters.categories.join(', ')}
                    </span>
                  </div>
                )}

                {filters.tags && filters.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-xs text-white/70">
                      Tags: {filters.tags.join(', ')}
                    </span>
                  </div>
                )}

                {filters.featured && (
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs text-white/70">
                      Voxxy Cards Only
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              List Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error && e.target.value.trim()) setError(null);
              }}
              placeholder="e.g., NYC Food Vendors"
              className={`w-full px-3 py-2 bg-white/5 border ${
                error ? 'border-red-500' : 'border-white/10'
              } rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this list..."
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Info Note */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-200/80">
              <strong>Smart Lists</strong> automatically update as contacts match the filters.
              You can use this list to quickly invite vendors to events.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Smart List
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
