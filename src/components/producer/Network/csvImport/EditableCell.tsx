import { useState, useRef, useEffect } from 'react'

interface EditableCellProps {
  value: string
  fieldKey: string
  errors?: string[]
  onCommit: (value: string) => void
}

export function EditableCell({ value, fieldKey, errors, onCommit }: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasErrors = errors && errors.length > 0

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft !== value) {
      onCommit(draft)
    }
  }

  const cancel = () => {
    setEditing(false)
    setDraft(value)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') cancel()
        }}
        className={`w-full px-1.5 py-0.5 text-[11px] rounded border bg-background/80 outline-none ${
          hasErrors
            ? 'border-red-500/60 focus:border-red-400'
            : 'border-primary/30 focus:border-primary'
        }`}
        aria-label={`Edit ${fieldKey}`}
      />
    )
  }

  return (
    <div
      className={`truncate cursor-pointer px-1 py-0.5 rounded transition-colors hover:bg-background/10 ${
        hasErrors ? 'text-red-300' : ''
      }`}
      onClick={() => {
        setDraft(value)
        setEditing(true)
      }}
      title={hasErrors ? errors.join('; ') : value || undefined}
    >
      {value || <span className="text-foreground/25">—</span>}
      {hasErrors && (
        <span className="ml-1 text-[9px] text-red-400" aria-label="Validation error">
          !
        </span>
      )}
    </div>
  )
}
