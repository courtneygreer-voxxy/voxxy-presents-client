import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface EditableCellProps {
  value: string
  fieldKey: string
  /** Blocking issues — row cannot be imported until fixed or skipped */
  errors?: string[]
  /** Non-blocking formatting issues — row will be skipped on import unless fixed */
  warnings?: string[]
  onCommit: (value: string) => void
}

/** Wraps children in a tooltip when there are validation issues, renders children directly otherwise. */
function CellTooltip({
  errors,
  warnings,
  children,
}: {
  errors?: string[]
  warnings?: string[]
  children: ReactNode
}) {
  const hasErrors = !!errors && errors.length > 0
  const hasWarnings = !!warnings && warnings.length > 0
  if (!hasErrors && !hasWarnings) return <>{children}</>

  const borderColor = hasErrors ? '#ef4444' : '#eab308'

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="start"
        avoidCollisions
        collisionPadding={8}
        style={{
          background: '#ffffff',
          border: `1px solid ${borderColor}`,
          color: '#111111',
          zIndex: 9999,
        }}
        className="max-w-xs shadow-2xl"
      >
        <ul className="text-[11px] space-y-0.5 list-disc list-inside">
          {(errors ?? []).map((err, idx) => (
            <li key={`e-${idx}`} style={{ color: '#dc2626' }}>{err}</li>
          ))}
          {(warnings ?? []).map((warn, idx) => (
            <li key={`w-${idx}`} style={{ color: '#854d0e' }}>{warn}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  )
}

export function EditableCell({ value, fieldKey, errors, warnings, onCommit }: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasErrors = !!errors && errors.length > 0
  const hasWarnings = !!warnings && warnings.length > 0

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
            : hasWarnings
              ? 'border-yellow-500/60 focus:border-yellow-400'
              : 'border-primary/30 focus:border-primary'
        }`}
        aria-label={`Edit ${fieldKey}`}
      />
    )
  }

  return (
    <CellTooltip errors={errors} warnings={warnings}>
      <div
        className={`truncate cursor-pointer px-1 py-0.5 rounded transition-colors hover:bg-background/10 ${
          hasErrors
            ? 'text-red-300 bg-red-500/10'
            : hasWarnings
              ? 'text-yellow-300 bg-yellow-500/10'
              : ''
        }`}
        onClick={() => {
          setDraft(value)
          setEditing(true)
        }}
        title={value || undefined}
      >
        {value || <span className="text-foreground/25">—</span>}
        {hasErrors && (
          <span className="ml-1 text-[9px] text-red-400" aria-label="Blocking error">
            ●
          </span>
        )}
        {!hasErrors && hasWarnings && (
          <span className="ml-1 text-[9px] text-yellow-400" aria-label="Warning">
            ●
          </span>
        )}
      </div>
    </CellTooltip>
  )
}
