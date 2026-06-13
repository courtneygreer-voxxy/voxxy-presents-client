import { useState, useRef, useEffect } from 'react'
import { Search, X, Check, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// --- Types ---

export interface FilterFieldConfig {
  key: string
  label: string
  icon?: LucideIcon
  options: string[]
  multi?: boolean // defaults to true
}

export interface ActiveFilter {
  fieldKey: string
  values: string[]
}

interface SearchFilterBarProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchSubmit?: () => void
  filterFields: FilterFieldConfig[]
  activeFilters: ActiveFilter[]
  onFiltersChange: (filters: ActiveFilter[]) => void
  /** Extra filter elements (e.g. date picker) rendered inline with filter dropdowns */
  extraFilters?: React.ReactNode
}

// --- Filter Dropdown ---

function FilterDropdown({
  field,
  selectedValues,
  onChange,
}: {
  field: FilterFieldConfig
  selectedValues: string[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = field.options.filter((opt) => opt.toLowerCase().includes(search.toLowerCase()))

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  const Icon = field.icon

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          selectedValues.length > 0
            ? 'bg-primary/20 text-violet-950 border border-primary/40 dark:text-primary dark:border-primary/30'
            : 'bg-background/5 text-foreground dark:text-foreground/60 hover:text-foreground border border-border hover:bg-background/10'
        }`}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span>{field.label}</span>
        {selectedValues.length > 0 && (
          <span className="flex items-center justify-center w-4 h-4 bg-primary/50 text-primary-foreground text-[10px] font-bold rounded-full">
            {selectedValues.length}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-foreground/65 dark:text-foreground/40 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-56 bg-muted border border-border rounded-lg shadow-xl overflow-hidden">
          {field.options.length > 5 && (
            <div className="p-2 border-b border-border">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${field.label.toLowerCase()}...`}
                className="w-full px-2.5 py-1.5 bg-background/5 border border-border rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-foreground/75 dark:text-muted-foreground">
                No options found
              </p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  onClick={() => handleToggle(option)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-foreground/90 dark:text-foreground/80 hover:bg-background/10 rounded transition-colors"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedValues.includes(option)
                        ? 'bg-primary/50 border-primary'
                        : 'border-border'
                    }`}
                  >
                    {selectedValues.includes(option) && (
                      <Check className="w-2.5 h-2.5 text-foreground" strokeWidth={3} />
                    )}
                  </div>
                  <span className="truncate text-left">{option}</span>
                </button>
              ))
            )}
          </div>
          {selectedValues.length > 0 && (
            <div className="p-1.5 border-t border-border">
              <button
                onClick={() => onChange([])}
                className="w-full text-xs text-foreground/75 dark:text-muted-foreground hover:text-foreground py-1 transition-colors"
              >
                Clear {field.label.toLowerCase()}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Main Component ---

export function SearchFilterBar({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  onSearchSubmit,
  filterFields,
  activeFilters,
  onFiltersChange,
  extraFilters,
}: SearchFilterBarProps) {
  const activeFilterCount = activeFilters.filter((f) => f.values.length > 0).length

  const handleUpdateFilterValues = (fieldKey: string, values: string[]) => {
    const existing = activeFilters.find((f) => f.fieldKey === fieldKey)
    if (existing) {
      if (values.length === 0) {
        // Remove filter when cleared
        onFiltersChange(activeFilters.filter((f) => f.fieldKey !== fieldKey))
      } else {
        onFiltersChange(activeFilters.map((f) => (f.fieldKey === fieldKey ? { ...f, values } : f)))
      }
    } else if (values.length > 0) {
      onFiltersChange([...activeFilters, { fieldKey, values }])
    }
  }

  const handleClearAll = () => {
    onFiltersChange([])
  }

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/55 dark:text-foreground/40" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-3 py-2.5 bg-background/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Filter dropdowns - always visible underneath */}
      {(filterFields.length > 0 || extraFilters) && (
        <div className="flex items-center gap-2 flex-wrap">
          {filterFields.map((field) => (
            <FilterDropdown
              key={field.key}
              field={field}
              selectedValues={activeFilters.find((f) => f.fieldKey === field.key)?.values || []}
              onChange={(values) => handleUpdateFilterValues(field.key, values)}
            />
          ))}
          {extraFilters}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-foreground/75 dark:text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}
