import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { AlertCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { TABLE_HEADER_CLASSES } from '@/components/shared/tableStyles'
import type { ImportRow } from './types'
import { FIELD_LABELS } from './constants'
import { EditableCell } from './EditableCell'

interface VirtualizedImportTableProps {
  rows: ImportRow[]
  visibleFields: string[]
  onEditCell: (rowIndex: number, fieldKey: string, value: string) => void
  onToggleSkip: (rowIndex: number) => void
}

const ROW_HEIGHT = 32

/** Narrower min for compact fields, wider for name/notes */
const WIDE_FIELDS = new Set(['name', 'email', 'notes', 'location'])

function buildColumnTemplate(visibleFields: string[]): string {
  const cols = visibleFields.map((f) =>
    WIDE_FIELDS.has(f) ? 'minmax(130px, 2fr)' : 'minmax(90px, 1fr)',
  )
  return `40px 36px ${cols.join(' ')}`
}

export function VirtualizedImportTable({
  rows,
  visibleFields,
  onEditCell,
  onToggleSkip,
}: VirtualizedImportTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  return (
    <TooltipProvider delayDuration={150}>
      <div
        ref={parentRef}
        className="max-h-[50vh] overflow-auto border border-border rounded-lg bg-background/5"
      >
        {/* Sticky header */}
        <div
          className={`sticky top-0 z-10 grid bg-background border-b border-primary/20 backdrop-blur-md ${TABLE_HEADER_CLASSES}`}
          style={{
            gridTemplateColumns: buildColumnTemplate(visibleFields),
          }}
        >
          <div className="px-1 text-center text-foreground/50">#</div>
          <div className="px-1 text-center text-foreground/50">Skip</div>
          {visibleFields.map((field) => (
            <div key={field} className="px-2 py-1.5 text-foreground/80 truncate">
              {FIELD_LABELS[field] || field}
            </div>
          ))}
        </div>

        {/* Virtualized rows */}
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]
            const isSkipped = row._skipped
            const isError = row._status === 'error'
            const isWarning = row._status === 'warning'

            return (
              <div
                key={virtualRow.index}
                className={`grid items-center text-[11px] border-b border-primary/10 ${
                  isSkipped
                    ? 'opacity-40 line-through'
                    : isError
                      ? 'bg-red-500/5'
                      : isWarning
                        ? 'bg-yellow-500/5'
                        : 'hover:bg-background/5'
                }`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  gridTemplateColumns: buildColumnTemplate(visibleFields),
                }}
              >
                {/* Row number — hover shows every issue for this row */}
                <div className="px-1 flex items-center justify-center text-foreground/40 text-[10px]">
                  {isError || isWarning ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={`flex items-center gap-0.5 cursor-help ${
                            isError ? 'text-red-400' : 'text-yellow-400'
                          }`}
                        >
                          <AlertCircle className="h-3 w-3" />
                          {row._originalIndex}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="start"
                        className={
                          isError
                            ? 'max-w-xs bg-red-950 border-red-500/40 text-red-100'
                            : 'max-w-xs bg-yellow-950 border-yellow-500/40 text-yellow-100'
                        }
                      >
                        {Object.keys(row._errors).length > 0 && (
                          <>
                            <p className="text-[11px] font-medium mb-1">Must fix (or skip row):</p>
                            <ul className="text-[11px] space-y-0.5 list-disc list-inside mb-1">
                              {Object.entries(row._errors).flatMap(([field, msgs]) =>
                                msgs.map((msg, idx) => (
                                  <li key={`${field}-${idx}`}>
                                    <span className="text-red-300">{FIELD_LABELS[field] || field}:</span> {msg}
                                  </li>
                                )),
                              )}
                            </ul>
                          </>
                        )}
                        {Object.keys(row._warnings).length > 0 && (
                          <>
                            <p className="text-[11px] font-medium mb-1 text-yellow-200">
                              Warnings (will still import — consider fixing):
                            </p>
                            <ul className="text-[11px] space-y-0.5 list-disc list-inside">
                              {Object.entries(row._warnings).flatMap(([field, msgs]) =>
                                msgs.map((msg, idx) => (
                                  <li key={`${field}-${idx}`}>
                                    <span className="text-yellow-300">{FIELD_LABELS[field] || field}:</span> {msg}
                                  </li>
                                )),
                              )}
                            </ul>
                          </>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    row._originalIndex
                  )}
                </div>

                {/* Skip checkbox */}
                <div className="px-1 flex justify-center">
                  <Checkbox
                    checked={isSkipped}
                    onCheckedChange={() => onToggleSkip(virtualRow.index)}
                    aria-label={`Skip row ${row._originalIndex}`}
                    className="h-3.5 w-3.5"
                  />
                </div>

                {/* Editable cells */}
                {visibleFields.map((field) => (
                  <div key={field} className="px-2 min-w-0">
                    <EditableCell
                      value={String(row[field] ?? '')}
                      fieldKey={field}
                      errors={row._errors[field]}
                      warnings={row._warnings[field]}
                      onCommit={(value) => onEditCell(virtualRow.index, field, value)}
                    />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
