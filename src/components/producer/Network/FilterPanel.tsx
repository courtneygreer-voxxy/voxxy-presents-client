// ⚠️ WIP — shipped prematurely. This Filter → Query UX has ACTIVE KNOWN BUGS
// (load-time regression, "Save query" not persisting, "Apply" not updating the
// table). See docs/tickets/NETWORK_QUERY_UX_KNOWN_ISSUES.md before relying on it.
import { useState, useEffect } from 'react'
import {
  X,
  Check,
  ChevronDown,
  Bookmark,
  Filter as FilterIcon,
  Tag,
  Hash,
  MapPin,
  Globe,
  Clock,
  Calendar,
  Trash2,
} from 'lucide-react'
import type { ContactList } from '@/services/api'
import {
  SAVED_QUERIES_LABEL,
  SAVE_QUERY_LABEL,
  SAVED_QUERIES_EMPTY,
} from './copy'

export interface FilterDraft {
  category: string[]
  location: string[]
  tags: string[]
  social: string[]
  updated: string
  event: string
  eventStatus: string
}

export const EMPTY_FILTER_DRAFT: FilterDraft = {
  category: [],
  location: [],
  tags: [],
  social: [],
  updated: 'all',
  event: 'all',
  eventStatus: 'all',
}

const SOCIAL_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'website', label: 'Website' },
]

const UPDATED_OPTIONS = [
  { value: 'all', label: 'Any time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '48h', label: 'Last 48 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
]

const APP_STATUS_OPTIONS = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'waitlist', label: 'Waitlist' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface FilterPanelProps {
  open: boolean
  options: {
    categories: string[]
    locations: string[]
    tags: string[]
    events: { id: number; title: string }[]
  }
  initial: FilterDraft
  savedQueries: ContactList[]
  savingQuery?: boolean
  onApply: (draft: FilterDraft) => void
  onClear: () => void
  onApplyQuery: (query: ContactList) => void
  onSaveQuery: (name: string, draft: FilterDraft) => void
  onDeleteQuery?: (query: ContactList) => void
}

function CheckboxRow({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-xs text-foreground/90 transition-colors hover:bg-accent/60 dark:hover:bg-background/10"
    >
      <div
        className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
          checked ? 'border-primary bg-primary/50' : 'border-border'
        }`}
      >
        {checked && <Check className="h-2.5 w-2.5 text-foreground" strokeWidth={3} />}
      </div>
      <span className="truncate text-left">{label}</span>
    </button>
  )
}

function Section({
  icon: Icon,
  label,
  activeCount,
  children,
  defaultOpen = false,
}: {
  icon: typeof Tag
  label: string
  activeCount: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-1 py-2.5 text-sm font-medium text-foreground"
      >
        <Icon className="h-4 w-4 text-foreground/60" />
        <span>{label}</span>
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/50 px-1 text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={`ml-auto h-4 w-4 text-foreground/40 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="space-y-0.5 pb-2">{children}</div>}
    </div>
  )
}

export default function FilterPanel({
  open,
  options,
  initial,
  savedQueries,
  savingQuery = false,
  onApply,
  onClear,
  onApplyQuery,
  onSaveQuery,
  onDeleteQuery,
}: FilterPanelProps) {
  const [draft, setDraft] = useState<FilterDraft>(initial)
  const [saveMode, setSaveMode] = useState(false)
  const [queryName, setQueryName] = useState('')

  // Re-seed the draft from current applied filters each time the panel opens.
  useEffect(() => {
    if (open) {
      setDraft(initial)
      setSaveMode(false)
      setQueryName('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const toggleArrayValue = (key: 'category' | 'location' | 'tags' | 'social', value: string) => {
    setDraft((d) => {
      const arr = d[key]
      return { ...d, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] }
    })
  }

  const hasAnyDraft =
    draft.category.length > 0 ||
    draft.location.length > 0 ||
    draft.tags.length > 0 ||
    draft.social.length > 0 ||
    draft.updated !== 'all' ||
    draft.event !== 'all' ||
    draft.eventStatus !== 'all'

  const handleSave = () => {
    if (!queryName.trim()) return
    onSaveQuery(queryName.trim(), draft)
    setSaveMode(false)
    setQueryName('')
  }

  return (
    <div className="voxxy-select-surface absolute right-0 top-full z-50 mt-2 flex max-h-[70vh] w-[360px] flex-col overflow-hidden rounded-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        {saveMode ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Query name..."
              autoFocus
              className="w-32 rounded-lg border border-border bg-background/10 px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSave}
              disabled={savingQuery || !queryName.trim()}
              className="voxxy-btn-solid rounded-lg px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {savingQuery ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setSaveMode(false)
                setQueryName('')
              }}
              className="p-1 text-foreground/50 transition-colors hover:text-foreground"
              aria-label="Cancel save"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSaveMode(true)}
            disabled={!hasAnyDraft}
            className="flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-40"
          >
            <Bookmark className="h-3.5 w-3.5" />
            {SAVE_QUERY_LABEL}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {/* Saved queries */}
        <div className="pb-1">
          <p className="px-1 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/45">
            {SAVED_QUERIES_LABEL}
          </p>
          {savedQueries.length === 0 ? (
            <p className="px-1 py-1.5 text-xs text-foreground/45">{SAVED_QUERIES_EMPTY}</p>
          ) : (
            savedQueries.map((q) => (
              <div
                key={q.id}
                className="group flex items-center gap-2 rounded px-1 py-1.5 transition-colors hover:bg-accent/60 dark:hover:bg-background/10"
              >
                <button
                  type="button"
                  onClick={() => onApplyQuery(q)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <FilterIcon className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                  <span className="truncate text-xs text-foreground/90">{q.name}</span>
                </button>
                {onDeleteQuery && (
                  <button
                    type="button"
                    onClick={() => onDeleteQuery(q)}
                    className="flex-shrink-0 p-0.5 text-foreground/30 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                    aria-label={`Delete ${q.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Category */}
        <Section icon={Tag} label="Category" activeCount={draft.category.length} defaultOpen>
          {options.categories.length === 0 ? (
            <p className="px-2 py-1 text-xs text-foreground/45">No categories</p>
          ) : (
            options.categories.map((opt) => (
              <CheckboxRow
                key={opt}
                label={opt}
                checked={draft.category.includes(opt)}
                onToggle={() => toggleArrayValue('category', opt)}
              />
            ))
          )}
        </Section>

        {/* Tags */}
        <Section icon={Hash} label="Tags" activeCount={draft.tags.length}>
          {options.tags.length === 0 ? (
            <p className="px-2 py-1 text-xs text-foreground/45">No tags yet</p>
          ) : (
            options.tags.map((opt) => (
              <CheckboxRow
                key={opt}
                label={`#${opt}`}
                checked={draft.tags.includes(opt)}
                onToggle={() => toggleArrayValue('tags', opt)}
              />
            ))
          )}
        </Section>

        {/* Location */}
        <Section icon={MapPin} label="Location" activeCount={draft.location.length}>
          {options.locations.length === 0 ? (
            <p className="px-2 py-1 text-xs text-foreground/45">No locations</p>
          ) : (
            options.locations.map((opt) => (
              <CheckboxRow
                key={opt}
                label={opt}
                checked={draft.location.includes(opt)}
                onToggle={() => toggleArrayValue('location', opt)}
              />
            ))
          )}
        </Section>

        {/* Social */}
        <Section icon={Globe} label="Social" activeCount={draft.social.length}>
          {SOCIAL_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              checked={draft.social.includes(opt.value)}
              onToggle={() => toggleArrayValue('social', opt.value)}
            />
          ))}
        </Section>

        {/* Updated */}
        <Section icon={Clock} label="Updated" activeCount={draft.updated !== 'all' ? 1 : 0}>
          {UPDATED_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              checked={draft.updated === opt.value}
              onToggle={() =>
                setDraft((d) => ({ ...d, updated: d.updated === opt.value ? 'all' : opt.value }))
              }
            />
          ))}
        </Section>

        {/* Shows Attended */}
        <Section icon={Calendar} label="Shows Attended" activeCount={draft.event !== 'all' ? 1 : 0}>
          <CheckboxRow
            label="No shows attended"
            checked={draft.event === 'none'}
            onToggle={() =>
              setDraft((d) => ({
                ...d,
                event: d.event === 'none' ? 'all' : 'none',
                eventStatus: 'all',
              }))
            }
          />
          {options.events.map((ev) => (
            <CheckboxRow
              key={ev.id}
              label={ev.title}
              checked={draft.event === String(ev.id)}
              onToggle={() =>
                setDraft((d) => ({
                  ...d,
                  event: d.event === String(ev.id) ? 'all' : String(ev.id),
                  eventStatus: 'all',
                }))
              }
            />
          ))}

          {/* App status, contextual to a specific show */}
          {draft.event !== 'all' && draft.event !== 'none' && (
            <div className="mt-1 border-t border-border pt-1">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/45">
                Application status
              </p>
              {APP_STATUS_OPTIONS.map((opt) => (
                <CheckboxRow
                  key={opt.value}
                  label={opt.label}
                  checked={draft.eventStatus === opt.value}
                  onToggle={() =>
                    setDraft((d) => ({
                      ...d,
                      eventStatus: d.eventStatus === opt.value ? 'all' : opt.value,
                    }))
                  }
                />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY_FILTER_DRAFT)
            onClear()
          }}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => onApply(draft)}
          className="voxxy-btn-cta rounded-lg px-4 py-1.5 text-xs font-semibold transition-all"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
