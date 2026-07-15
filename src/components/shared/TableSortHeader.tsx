import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'

export type SortOrder = 'asc' | 'desc'

interface TableSortHeaderProps<T extends string> {
  label: string
  field: T
  currentSort?: T | null
  currentOrder?: SortOrder
  onSort?: (field: T) => void
  /** Show idle chevron icon when not active (default: false) */
  showIdleIcon?: boolean
}

export function TableSortHeader<T extends string>({
  label,
  field,
  currentSort,
  currentOrder,
  onSort,
  showIdleIcon = false,
}: TableSortHeaderProps<T>) {
  const isActive = currentSort === field
  return (
    <button
      type="button"
      onClick={() => onSort?.(field)}
      className="flex items-center gap-0.5 hover:text-foreground transition-colors text-left"
    >
      {label}
      {isActive ? (
        currentOrder === 'asc' ? (
          <ArrowUp className="w-3 h-3" />
        ) : (
          <ArrowDown className="w-3 h-3" />
        )
      ) : showIdleIcon ? (
        <ChevronsUpDown className="w-3 h-3 opacity-40" />
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
