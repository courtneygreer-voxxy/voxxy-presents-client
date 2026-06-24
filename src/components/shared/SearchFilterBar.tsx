import { useState, useRef, useEffect } from 'react'
import { Search, X, Check, ChevronDown, Filter } from 'lucide-react'
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
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
  /** Hide the search input (e.g. when the parent already renders one). Defaults to true. */
  showSearch?: boolean
  /**
   * Layout for the filter controls:
   * - 'inline' (default): one always-visible dropdown button per field.
   * - 'button': a single "Filter" button that opens a panel of all fields,
   *   with applied filters shown as removable chips below.
   */
  variant?: 'inline' | 'button'
  /** Label for the collapsed filter button (button variant only). Defaults to 'Filter'. */
  filterButtonLabel?: string
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
  const isMulti = field.multi !== false

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value))
    } else if (isMulti) {
      onChange([...selectedValues, value])
    } else {
      onChange([value])
      setOpen(false)
      setSearch('')
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
                    className={`w-3.5 h-3.5 border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isMulti ? 'rounded' : 'rounded-full'
                    } ${
                      selectedValues.includes(option)
                        ? 'bg-primary/50 border-primary'
                        : 'border-border'
                    }`}
                  >
                    {selectedValues.includes(option) &&
                      (isMulti ? (
                        <Check className="w-2.5 h-2.5 text-foreground" strokeWidth={3} />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      ))}
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

// --- Collapsed Filter Button + Panel (button variant) ---

function FilterButtonPanel({
  label,
  filterFields,
  activeFilters,
  activeFilterCount,
  onToggleValue,
  onClearAll,
}: {
  label: string
  filterFields: FilterFieldConfig[]
  activeFilters: ActiveFilter[]
  activeFilterCount: number
  onToggleValue: (field: FilterFieldConfig, value: string) => void
  onClearAll: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
          activeFilterCount > 0
            ? 'border-primary/40 bg-primary/20 text-violet-950 dark:border-primary/30 dark:text-primary'
            : 'border-border bg-card/80 text-foreground hover:bg-accent/60 dark:bg-card/50 dark:text-foreground/80 dark:border-white/10'
        }`}
      >
        <Filter className="h-3.5 w-3.5" />
        <span>{label}</span>
        {activeFilterCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/50 text-[10px] font-bold text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 w-64 overflow-hidden rounded-lg border border-border bg-muted shadow-xl">
          <div className="max-h-96 space-y-3 overflow-y-auto p-3">
            {filterFields.map((field) => {
              const selectedValues =
                activeFilters.find((f) => f.fieldKey === field.key)?.values || []
              const isMulti = field.multi !== false
              const Icon = field.icon
              return (
                <div key={field.key}>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {field.label}
                  </div>
                  <div className="space-y-0.5">
                    {field.options.map((option) => {
                      const selected = selectedValues.includes(option)
                      return (
                        <button
                          key={option}
                          onClick={() => onToggleValue(field, option)}
                          className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-xs text-foreground/90 transition-colors hover:bg-background/10 dark:text-foreground/80"
                        >
                          <div
                            className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center border-2 transition-colors ${
                              isMulti ? 'rounded' : 'rounded-full'
                            } ${selected ? 'border-primary bg-primary/50' : 'border-border'}`}
                          >
                            {selected &&
                              (isMulti ? (
                                <Check className="h-2.5 w-2.5 text-foreground" strokeWidth={3} />
                              ) : (
                                <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                              ))}
                          </div>
                          <span className="truncate text-left">{option}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          {activeFilterCount > 0 && (
            <div className="border-t border-border p-1.5">
              <button
                onClick={onClearAll}
                className="w-full py-1 text-xs text-foreground/75 transition-colors hover:text-foreground dark:text-muted-foreground"
              >
                Clear all filters
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
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  showSearch = true,
  variant = 'inline',
  filterButtonLabel = 'Filter',
  filterFields,
  activeFilters,
  onFiltersChange,
  extraFilters,
}: SearchFilterBarProps) {
  const activeFilterCount = activeFilters.reduce((sum, f) => sum + f.values.length, 0)

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

  const handleToggleValue = (field: FilterFieldConfig, value: string) => {
    const current = activeFilters.find((f) => f.fieldKey === field.key)?.values || []
    if (current.includes(value)) {
      handleUpdateFilterValues(field.key, current.filter((v) => v !== value))
    } else if (field.multi !== false) {
      handleUpdateFilterValues(field.key, [...current, value])
    } else {
      handleUpdateFilterValues(field.key, [value])
    }
  }

  const handleClearAll = () => {
    onFiltersChange([])
  }

  // Flatten active filters into chips, keeping a reference to their field for labels.
  const appliedChips = activeFilters.flatMap((f) => {
    const field = filterFields.find((ff) => ff.key === f.fieldKey)
    return f.values.map((value) => ({ fieldKey: f.fieldKey, field, value }))
  })

  // --- Button variant: single Filter button + applied-filter chips below ---
  if (variant === 'button') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/55 dark:text-foreground/40" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-border bg-background/5 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
          {filterFields.length > 0 && (
            <FilterButtonPanel
              label={filterButtonLabel}
              filterFields={filterFields}
              activeFilters={activeFilters}
              activeFilterCount={activeFilterCount}
              onToggleValue={handleToggleValue}
              onClearAll={handleClearAll}
            />
          )}
          {extraFilters}
        </div>

        {appliedChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {appliedChips.map(({ fieldKey, field, value }) => (
              <button
                key={`${fieldKey}:${value}`}
                onClick={() => field && handleToggleValue(field, value)}
                className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/15 px-2.5 py-1 text-xs font-medium text-violet-950 transition-colors hover:bg-primary/25 dark:text-primary"
              >
                {field && <span className="text-foreground/60 dark:text-foreground/50">{field.label}:</span>}
                <span>{value}</span>
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-2 py-1 text-xs text-foreground/75 transition-colors hover:text-foreground dark:text-muted-foreground"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    )
  }

  // --- Inline variant (default): one dropdown button per field ---
  return (
    <div className="space-y-2">
      {/* Search bar */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/55 dark:text-foreground/40" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-3 py-2.5 bg-background/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>
      )}

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
