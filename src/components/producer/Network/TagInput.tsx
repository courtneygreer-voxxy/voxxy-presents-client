import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagInputProps {
  /** Current tags */
  value: string[]
  /** Called with the next tag array whenever tags are added/removed */
  onChange: (tags: string[]) => void
  /** Existing tags to surface as autocomplete suggestions */
  availableTags?: string[]
  placeholder?: string
  disabled?: boolean
  /** Extra classes for the text input */
  inputClassName?: string
  /** Max number of autocomplete suggestions to show */
  maxSuggestions?: number
}

/**
 * Shared tag editor: text input with add button, autocomplete suggestions from
 * existing tags, and removable chips. Tags are normalized to trimmed lowercase
 * and de-duplicated. Used by the Add/Edit/Bulk contact modals.
 */
export default function TagInput({
  value,
  onChange,
  availableTags = [],
  placeholder = 'Add tag...',
  disabled = false,
  inputClassName,
  maxSuggestions = 5,
}: TagInputProps) {
  const [tagInput, setTagInput] = useState('')

  const addTag = (raw?: string) => {
    const tag = (raw ?? tagInput).trim().toLowerCase()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove))
  }

  const suggestions = availableTags
    .filter((t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !value.includes(t))
    .slice(0, maxSuggestions)

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'flex-1 px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50',
              inputClassName,
            )}
          />
          <button
            type="button"
            onClick={() => addTag()}
            disabled={!tagInput.trim() || disabled}
            className="px-4 py-2.5 bg-primary/20 hover:bg-primary/30 text-violet-950 dark:text-primary text-sm rounded-lg transition-colors flex items-center gap-2 border border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
        {tagInput.length > 0 && suggestions.length > 0 && (
          <div className="absolute left-0 right-16 z-10 mt-1 bg-muted border border-border rounded-lg shadow-xl max-h-32 overflow-y-auto">
            {suggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="w-full text-left px-3 py-2 text-sm text-foreground/80 hover:bg-background/10 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-primary/20 text-violet-950 dark:text-primary rounded-full text-xs flex items-center gap-1.5 border border-primary/30"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-violet-800 dark:hover:text-primary/90"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
