import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Checkbox } from '@/components/ui/checkbox'
import { TABLE_HEADER_CLASSES } from '@/components/shared/tableStyles'
import type { ImportRow } from './types'
import { FIELD_LABELS } from './constants'
import { EditableCell } from './EditableCell'

interface VirtualizedImportTableProps {
  rows: ImportRow[]
  visibleFields: string[]
  onEditCell: (rowIndex: number, fieldKey: string, value: string) => void
  onToggleSkip: (rowIndex: number) => void
  errorRowRef?: React.MutableRefObject<HTMLDivElement | null>
}

const ROW_HEIGHT = 32

export function VirtualizedImportTable({
  rows,
  visibleFields,
  onEditCell,
  onToggleSkip,
  errorRowRef,
}: VirtualizedImportTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  return (
    <div
      ref={parentRef}
      className="max-h-[50vh] overflow-auto border border-border rounded-lg bg-background/5"
    >
      {/* Sticky header */}
      <div
        className={`sticky top-0 z-10 grid bg-primary/10 border-b border-primary/20 ${TABLE_HEADER_CLASSES}`}
        style={{
          gridTemplateColumns: `40px 36px ${visibleFields.map(() => 'minmax(120px, 1fr)').join(' ')}`,
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
          const isFirstError =
            isError && rows.findIndex((r) => r._status === 'error' && !r._skipped) === virtualRow.index

          return (
            <div
              key={virtualRow.index}
              ref={isFirstError && errorRowRef ? (el) => { errorRowRef.current = el } : undefined}
              className={`grid items-center text-[11px] border-b border-primary/10 ${
                isSkipped
                  ? 'opacity-40 line-through'
                  : isError
                    ? 'bg-red-500/5'
                    : 'hover:bg-background/5'
              }`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                gridTemplateColumns: `40px 36px ${visibleFields.map(() => 'minmax(120px, 1fr)').join(' ')}`,
              }}
            >
              {/* Row number */}
              <div className="px-1 text-center text-foreground/40 text-[10px]">
                {row._originalIndex}
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
                    onCommit={(value) => onEditCell(virtualRow.index, field, value)}
                  />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
