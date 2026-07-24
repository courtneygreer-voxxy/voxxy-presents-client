import { Pencil, Trash2, X } from 'lucide-react'

interface SelectionActionBarProps {
  /** Number of currently selected rows. The bar renders only when > 0. */
  count: number
  onEdit: () => void
  onDelete: () => void
  onClear: () => void
  loading?: boolean
}

/**
 * Contextual action bar that appears directly above the contacts table when one
 * or more rows are selected. Bulk actions (Edit / Delete) live here so producers
 * can act on a selection without digging through a menu or opening a modal first.
 */
export default function SelectionActionBar({
  count,
  onEdit,
  onDelete,
  onClear,
  loading = false,
}: SelectionActionBarProps) {
  if (count <= 0) return null

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions for selected contacts"
      className="flex flex-wrap items-center gap-2 px-3 py-2 bg-primary/15 border border-primary/30 rounded-lg"
    >
      <span className="text-sm font-medium text-foreground">
        {count} selected
      </span>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground/90 hover:bg-background/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {loading ? 'Deleting...' : 'Delete'}
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="Clear selection"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
    </div>
  )
}
