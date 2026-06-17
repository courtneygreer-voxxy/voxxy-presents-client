import { useState } from 'react'
import { X, Tag, List, Trash2 } from 'lucide-react'
import type { Category } from '@/types/category'
import type { ContactList } from '@/services/api'
import {
  BULK_EDIT_EMPTY_HINT,
  BULK_EDIT_LABEL,
  BULK_EDIT_NO_LISTS_HINT,
  BULK_EDIT_FILTER_LIST_HINT,
  BULK_EDIT_MANUAL_LIST_HINT,
} from './copy'

interface BulkEditModalProps {
  open: boolean
  onClose: () => void
  selectedCount: number
  categories: Category[]
  lists: ContactList[]
  onAddCategory: (categoryNames: string[]) => void
  onAddToList: (listId: number) => void
  onDelete: () => void
  onClearSelection: () => void
  loading?: boolean
}

export default function BulkEditModal({
  open,
  onClose,
  selectedCount,
  categories,
  lists,
  onAddCategory,
  onAddToList,
  onDelete,
  onClearSelection,
  loading = false,
}: BulkEditModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedListId, setSelectedListId] = useState<number | null>(null)

  const selectedList = lists.find((l) => l.id === selectedListId)

  const handleAddCategory = () => {
    if (!selectedCategoryId) return
    const category = categories.find((c) => c.id === selectedCategoryId)
    if (!category) return
    onAddCategory([category.name])
    setSelectedCategoryId(null)
  }

  const handleAddToList = () => {
    if (!selectedListId) return
    onAddToList(selectedListId)
    setSelectedListId(null)
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
                    onClick={handleAddCategory}
                    disabled={!selectedCategoryId || loading}
                    className="px-4 py-2 voxxy-btn-solid disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                  <List className="w-3.5 h-3.5" />
                  List
                </label>
                {lists.length === 0 ? (
                  <p className="text-xs text-foreground/50">{BULK_EDIT_NO_LISTS_HINT}</p>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedListId || ''}
                        onChange={(e) =>
                          setSelectedListId(e.target.value ? Number(e.target.value) : null)
                        }
                        className="flex-1 px-3 py-2 bg-background/10 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                        disabled={loading}
                      >
                        <option value="">Select list...</option>
                        {lists.map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddToList}
                        disabled={!selectedListId || loading}
                        className="px-4 py-2 voxxy-btn-solid disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                      >
                        {loading ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                    {selectedList && (
                      <p className="text-[11px] text-foreground/50">
                        {selectedList.list_type === 'manual'
                          ? BULK_EDIT_MANUAL_LIST_HINT
                          : BULK_EDIT_FILTER_LIST_HINT}
                      </p>
                    )}
                  </>
                )}
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
