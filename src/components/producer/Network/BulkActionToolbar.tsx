import { useState } from 'react';
import { X, Tag, Users, Trash2, MapPin } from 'lucide-react';
import type { Category } from '@/types/category';

interface BulkActionToolbarProps {
  selectedCount: number;
  categories: Category[];
  onCategoryUpdate: (categoryNames: string[]) => void;
  onLocationUpdate: (location: string) => void;
  onDelete: () => void;
  onClear: () => void;
  loading?: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  categories,
  onCategoryUpdate,
  onLocationUpdate,
  onDelete,
  onClear,
  loading = false,
}: BulkActionToolbarProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [locationInput, setLocationInput] = useState('');

  const handleApplyCategory = () => {
    if (!selectedCategoryId) return;

    const category = categories.find(c => c.id === selectedCategoryId);
    if (!category) return;

    onCategoryUpdate([category.name]);
    setSelectedCategoryId(null);
  };

  const handleApplyLocation = () => {
    if (!locationInput.trim()) return;

    onLocationUpdate(locationInput.trim());
    setLocationInput('');
  };

  if (selectedCount === 0) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Selection info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedCount} {selectedCount === 1 ? 'contact' : 'contacts'} selected
              </p>
              <p className="text-xs text-foreground/60">
                Apply bulk actions to selected contacts
              </p>
            </div>
          </div>
        </div>

        {/* Center: Bulk Actions */}
        <div className="flex items-center gap-4">
          {/* Category selector */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-foreground/60" />
            <select
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 bg-background/10 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              disabled={loading}
            >
              <option value="">Select category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon ? `${category.icon} ${category.name}` : category.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleApplyCategory}
              disabled={!selectedCategoryId || loading}
              className="px-4 py-2 voxxy-btn-solid disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Updating...' : 'Apply'}
            </button>
          </div>

          {/* Location input */}
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <MapPin className="w-4 h-4 text-foreground/60" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyLocation();
                }
              }}
              placeholder="City, State..."
              className="px-3 py-2 bg-background/10 border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary w-40"
              disabled={loading}
            />

            <button
              onClick={handleApplyLocation}
              disabled={!locationInput.trim() || loading}
              className="px-4 py-2 voxxy-btn-solid disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Updating...' : 'Apply'}
            </button>
          </div>
        </div>

        {/* Right: Delete and Clear buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Delete selected contacts"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <button
            onClick={onClear}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-background/10 rounded-lg transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
