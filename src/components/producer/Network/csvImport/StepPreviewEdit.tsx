import { useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, ArrowDown } from 'lucide-react'
import type { ImportRow } from './types'
import { FIELD_LABELS } from './constants'
import { VirtualizedImportTable } from './VirtualizedImportTable'
import { PRIMARY_TAG_HELPER } from '../copy'

interface StepPreviewEditProps {
  fileName: string
  rows: ImportRow[]
  visibleFields: string[]
  bulkTags: string
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
  onEditCell,
  onToggleSkip,
  onSetBulkTags,
  onValidate,
  onBack,
}: StepPreviewEditProps) {
  const errorRowRef = useRef<HTMLDivElement | null>(null)

  const stats = useMemo(() => {
    let valid = 0
    let errors = 0
    let skipped = 0
    let errorRowCount = 0

    for (const row of rows) {
      if (row._skipped) {
        skipped++
        continue
      }
      if (row._status === 'error') {
        errors += Object.values(row._errors).reduce((sum, arr) => sum + arr.length, 0)
        errorRowCount++
      } else {
        valid++
      }
    }
    return { valid, errors, errorRowCount, skipped, total: rows.length }
  }, [rows])

  const jumpToNextError = () => {
    errorRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="space-y-3">
      {/* File + stats bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-background/5 border border-primary/20 rounded-lg text-[11px]">
        <span className="text-foreground/90">
          <strong>{fileName}</strong>
        </span>
        <div className="flex items-center gap-3 text-foreground/70">
          <span className="text-green-400">{stats.valid} valid</span>
          {stats.errorRowCount > 0 && (
            <span className="text-red-400">
              {stats.errors} error{stats.errors !== 1 ? 's' : ''} in {stats.errorRowCount} row
              {stats.errorRowCount !== 1 ? 's' : ''}
            </span>
          )}
          {stats.skipped > 0 && (
            <span className="text-foreground/50">{stats.skipped} skipped</span>
          )}
        </div>
      </div>

      {/* Error jump */}
      {stats.errorRowCount > 0 && (
        <button
          onClick={jumpToNextError}
          className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-300 transition-colors"
        >
          <ArrowDown className="h-3 w-3" />
          Jump to first error
        </button>
      )}

      {/* Click-to-edit hint */}
      <p className="text-[10px] text-foreground/40">
        Click any cell to edit. Check &quot;Skip&quot; to exclude a row.{' '}
        {visibleFields.map((f) => FIELD_LABELS[f] || f).join(', ')}
      </p>

      {/* Virtualized table */}
      <VirtualizedImportTable
        rows={rows}
        visibleFields={visibleFields}
        onEditCell={onEditCell}
        onToggleSkip={onToggleSkip}
        errorRowRef={errorRowRef}
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
          disabled={stats.valid === 0}
        >
          Validate {stats.valid} Contact{stats.valid !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  )
}
