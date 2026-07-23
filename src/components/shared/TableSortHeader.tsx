import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SortOrder = 'asc' | 'desc'

interface TableSortHeaderProps<T extends string> {
  label: string
  field: T
  currentSort?: T | null
  currentOrder?: SortOrder
  /** Omit to render a static, non-sortable header cell (keeps columns visually consistent). */
  onSort?: (field: T) => void
  /**
   * Show a muted idle affordance when the column isn't the active sort.
   * Defaults to true so every sortable column advertises that it can be sorted
   * (the affordance is no longer hidden inside the label text).
   */
  showIdleIcon?: boolean
  /** Extra classes for alignment, e.g. 'justify-center' or 'justify-end'. */
  className?: string
  /** Native tooltip text. */
  title?: string
}

/**
 * Universal sortable table-header cell.
 *
 * One consistent affordance across every producer table:
 * - idle  → muted double chevron (ChevronsUpDown), always visible so users can
 *           see the column is sortable
 * - asc   → ChevronUp   (accent color)
 * - desc  → ChevronDown (accent color)
 *
 * Pair with `createSortHandler` for the standard toggle behavior.
 */
export function TableSortHeader<T extends string>({
  label,
  field,
  currentSort,
  currentOrder,
  onSort,
  showIdleIcon = true,
  className,
  title,
}: TableSortHeaderProps<T>) {
  // Non-sortable column: render a plain label so headers stay visually aligned
  // whether or not a given column supports sorting.
  if (!onSort) {
    return (
      <div className={cn('flex items-center gap-1', className)} title={title}>
        {label}
      </div>
    )
  }

  const isActive = currentSort === field

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      aria-label={`Sort by ${label}`}
      title={title}
      className={cn(
        'flex items-center gap-1 text-left transition-colors hover:text-foreground',
        isActive && 'text-foreground',
        className,
      )}
    >
      {label}
      {isActive ? (
        currentOrder === 'asc' ? (
          <ChevronUp className="h-3 w-3 text-violet-700 dark:text-primary" />
        ) : (
          <ChevronDown className="h-3 w-3 text-violet-700 dark:text-primary" />
        )
      ) : showIdleIcon ? (
        <ChevronsUpDown className="h-3 w-3 text-foreground/45 dark:text-foreground/40" />
      ) : null}
    </button>
  )
}

/** Standard toggle handler: same field → flip direction, new field → asc */
export function createSortHandler<T extends string>(
  setSortField: React.Dispatch<React.SetStateAction<T | null>>,
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>,
) {
  return (field: T) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortOrder('asc')
      return field
    })
  }
}
