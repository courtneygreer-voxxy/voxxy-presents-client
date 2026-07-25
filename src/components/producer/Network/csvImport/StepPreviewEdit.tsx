import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { ImportRow } from './types'
import { VirtualizedImportTable } from './VirtualizedImportTable'
import { PRIMARY_TAG_HELPER } from '../copy'

type RowFilter = 'all' | 'errors' | 'warnings'

interface StepPreviewEditProps {
  fileName: string
  rows: ImportRow[]
  visibleFields: string[]
  bulkTags: string
  errorMessage?: string
  onEditCell: (rowIndex: number, fieldKey: string, value: string) => void
  onToggleSkip: (rowIndex: number) => void
  onSetBulkTags: (tags: string) => void
  onValidate: () => void
  onBack: () => void
}

export function StepPreviewEdit({
  fileName,
  rows,
  visibleFields,
  bulkTags,
  errorMessage,
  onEditCell,
  onToggleSkip,
  onSetBulkTags,
  onValidate,
  onBack,
}: StepPreviewEditProps) {
  const [filter, setFilter] = useState<RowFilter>('all')

  const stats = useMemo(() => {
    let valid = 0
    let warningRowCount = 0
    let skipped = 0
    let errorRowCount = 0

    for (const row of rows) {
      if (row._skipped) { skipped++; continue }
      if (row._status === 'error') errorRowCount++
      else if (row._status === 'warning') warningRowCount++
      else valid++
    }
    const importable = valid + warningRowCount
    return { valid, warningRowCount, errorRowCount, skipped, importable, total: rows.length }
  }, [rows])

  // Build filtered view with source-index mapping so callbacks target the right row
  const filteredView = useMemo(() => {
    if (filter === 'all') return rows.map((row, i) => ({ row, sourceIndex: i }))
    return rows.reduce<{ row: ImportRow; sourceIndex: number }[]>((acc, row, i) => {
      if (row._skipped) return acc
      if (filter === 'errors' && row._status === 'error') acc.push({ row, sourceIndex: i })
      if (filter === 'warnings' && row._status === 'warning') acc.push({ row, sourceIndex: i })
      return acc
    }, [])
  }, [rows, filter])

  const displayRows = useMemo(() => filteredView.map((f) => f.row), [filteredView])

  return (
    <div className="space-y-3">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* File + filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-background/5 border border-primary/20 rounded-lg text-[11px]">
        <span className="text-foreground/90 truncate max-w-[40%]">
          <strong>{fileName}</strong>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded-full transition-colors ${
              filter === 'all'
                ? 'bg-foreground/15 text-foreground'
                : 'text-foreground/50 hover:text-foreground/70'
            }`}
          >
            All {stats.total}
          </button>
          {stats.errorRowCount > 0 && (
            <button
              onClick={() => setFilter(filter === 'errors' ? 'all' : 'errors')}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                filter === 'errors'
                  ? 'bg-red-500/20 text-red-300'
                  : 'text-red-400/70 hover:text-red-400'
              }`}
            >
              {stats.errorRowCount} blocking
            </button>
          )}
          {stats.warningRowCount > 0 && (
            <button
              onClick={() => setFilter(filter === 'warnings' ? 'all' : 'warnings')}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                filter === 'warnings'
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'text-yellow-400/70 hover:text-yellow-400'
              }`}
            >
              {stats.warningRowCount} warning{stats.warningRowCount !== 1 ? 's' : ''}
            </button>
          )}
          {stats.skipped > 0 && (
            <span className="text-foreground/40 pl-1">{stats.skipped} skipped</span>
          )}
        </div>
      </div>

      {/* Severity legend + click-to-edit hint */}
      <p className="text-[10px] text-foreground/40">
        Click any cell to edit · Check &quot;Skip&quot; to exclude a row · Hover a cell{' '}
        <span className="text-red-400/80">●</span> or{' '}
        <span className="text-yellow-400/80">●</span> to see its issue.{' '}
        <span className="text-red-400/80">Red</span> = missing First Name/Email (must fix or skip).{' '}
        <span className="text-yellow-400/80">Yellow</span> = formatting issue (will still import).
      </p>

      {/* Virtualized table */}
      <VirtualizedImportTable
        rows={displayRows}
        visibleFields={visibleFields}
        onEditCell={(filteredIdx, field, value) =>
          onEditCell(filteredView[filteredIdx].sourceIndex, field, value)
        }
        onToggleSkip={(filteredIdx) =>
          onToggleSkip(filteredView[filteredIdx].sourceIndex)
        }
      />

      {/* Bulk tags */}
      <div className="flex items-end gap-3 max-w-md">
        <div className="flex-1">
          <Label htmlFor="bulk-tags" className="text-[11px] text-foreground/70 mb-1 block">
            Primary tag for this import
          </Label>
          <Input
            id="bulk-tags"
            placeholder="e.g., Seattle, Oklahoma City"
            value={bulkTags}
            onChange={(e) => onSetBulkTags(e.target.value)}
            className="h-8 text-xs"
          />
          <p className="text-[10px] text-foreground/50 mt-1">{PRIMARY_TAG_HELPER}</p>
        </div>
      </div>

      {/* Large file warning */}
      {rows.length >= 5000 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertCircle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          <span className="text-[11px] text-yellow-300">
            Large file ({rows.length.toLocaleString()} rows).
            {rows.length >= 10000 && ' Consider splitting into smaller files for best results.'}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-1">
        <Button variant="outline" onClick={onBack} size="sm" className="text-xs h-8">
          Back to Mapping
        </Button>
        <Button
          onClick={onValidate}
          size="sm"
          className="text-xs h-8"
          disabled={stats.importable === 0}
        >
          Validate {stats.importable} Contact{stats.importable !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  )
}
