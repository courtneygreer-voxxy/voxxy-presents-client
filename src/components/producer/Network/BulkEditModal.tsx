import { useState } from 'react'
import { X, Tag, MapPin, Hash, Trash2 } from 'lucide-react'
import type { Category } from '@/types/category'
import TagInput from './TagInput'
import {
  BULK_EDIT_EMPTY_HINT,
  BULK_EDIT_LABEL,
  BULK_EDIT_TAGS_HINT,
  BULK_EDIT_LOCATION_HINT,
} from './copy'

interface BulkEditModalProps {
  open: boolean
  onClose: () => void
  selectedCount: number
  categories: Category[]
  availableTags?: string[]
  onApplyCategory: (categoryNames: string[]) => void
  onApplyTags: (tags: string[]) => void
  onApplyLocation: (location: string) => void
  onDelete: () => void
  onClearSelection: () => void
  loading?: boolean
}

export default function BulkEditModal({
  open,
  onClose,
  selectedCount,
  categories,
  availableTags = [],
  onApplyCategory,
  onApplyTags,
  onApplyLocation,
  onDelete,
  onClearSelection,
  loading = false,
}: BulkEditModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [location, setLocation] = useState('')

  const handleApplyCategory = () => {
    if (!selectedCategoryId) return
    const category = categories.find((c) => c.id === selectedCategoryId)
    if (!category) return
    onApplyCategory([category.name])
    setSelectedCategoryId(null)
  }

  const handleApplyTags = () => {
    if (tags.length === 0) return
    onApplyTags(tags)
    setTags([])
  }

  const handleApplyLocation = () => {
    const value = location.trim()
    if (!value) return
    onApplyLocation(value)
    setLocation('')
  }

  if (!open) return null

  const hasSelection = selectedCount > 0

  return (
    <div
      className="voxxy-overlay-scrim fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="voxxy-modal-surface w-full max-w-md rounded-xl overflow-hidden">
        <div className="voxxy-gradient-modal-header flex items-center justify-between border-b border-primary/20 px-5 py-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">{BULK_EDIT_LABEL}</h2>
            {hasSelection ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedCount} contact{selectedCount === 1 ? '' : 's'} selected
              </p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!hasSelection ? (
            <p className="text-sm text-foreground/70">{BULK_EDIT_EMPTY_HINT}</p>
          ) : (
            <>
              {/* Category */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                  <Tag className="w-3.5 h-3.5" />
                  Category
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategoryId || ''}
                    onChange={(e) =>
                      setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)
                    }
                    className="flex-1 px-3 py-2 bg-background/10 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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
                    className="px-4 py-2 voxxy-btn-solid disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    {loading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                  <Hash className="w-3.5 h-3.5" />
                  Tags
                </label>
                <TagInput
                  value={tags}
                  onChange={setTags}
                  availableTags={availableTags}
                  disabled={loading}
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-foreground/50">{BULK_EDIT_TAGS_HINT}</p>
                  <button
                    onClick={handleApplyTags}
                    disabled={tags.length === 0 || loading}
                    className="px-4 py-1.5 voxxy-btn-solid disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    {loading ? 'Applying...' : 'Apply tags'}
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                  <MapPin className="w-3.5 h-3.5" />
                  Location
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleApplyLocation()
                      }
                    }}
                    placeholder="City, State, ZIP"
                    disabled={loading}
                    className="flex-1 px-3 py-2 bg-background/10 border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleApplyLocation}
                    disabled={!location.trim() || loading}
                    className="px-4 py-2 voxxy-btn-solid disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    {loading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                <p className="text-[11px] text-foreground/50">{BULK_EDIT_LOCATION_HINT}</p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={onClearSelection}
                  disabled={loading}
                  className="text-xs text-foreground/60 hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete selected
                </button>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-border px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground/90 hover:bg-background/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
