import { CheckCircle2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { ColumnMapping } from './types'
import { RECOGNIZED_FIELDS } from './constants'
import { isNameMapped } from './columnMapping'

interface StepColumnMappingProps {
  fileName: string
  totalRows: number
  mappings: ColumnMapping[]
  onAssignField: (fieldKey: string, csvHeader: string | null) => void
  onConfirm: () => void
  onBack: () => void
}

const NONE_VALUE = '__none__'

export function StepColumnMapping({
  fileName,
  totalRows,
  mappings,
  onAssignField,
  onConfirm,
  onBack,
}: StepColumnMappingProps) {
  const nameMapped = isNameMapped(mappings)
  const emailMapped = mappings.some((m) => m.mappedTo === 'email')
  const unusedColumns = mappings.filter((m) => m.mappedTo === null)

  return (
    <div className="space-y-4">
      {/* File info */}
      <div className="flex flex-wrap items-center justify-between gap-1 px-3 py-2 bg-background/5 border border-primary/20 rounded-lg">
        <span className="text-xs text-foreground/90 break-words">
          <strong>{fileName}</strong> — {totalRows} rows, {mappings.length} columns
        </span>
      </div>

      {/* Validation warnings */}
      {!nameMapped && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <span className="text-xs text-red-300">
            <strong>Name</strong> is required. Choose a CSV column for it below to continue.
          </span>
        </div>
      )}
      {!emailMapped && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <span className="text-xs text-red-300">
            <strong>Email</strong> is required — it&apos;s the unique identifier used to match
            existing contacts and reach imported ones. Choose a CSV column for it below to continue.
          </span>
        </div>
      )}

      {/* Field mapping table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[minmax(100px,1.2fr)_28px_minmax(140px,1fr)_minmax(140px,1.6fr)] items-center gap-2 px-3 py-1.5 bg-primary/10 border-b border-primary/20 text-[10px] font-semibold uppercase tracking-wide text-foreground/60">
          <span>Field</span>
          <span />
          <span>CSV Column</span>
          <span>Example Data</span>
        </div>

        <div className="divide-y divide-border max-h-[45vh] overflow-y-auto">
          {RECOGNIZED_FIELDS.map((field) => {
            const assigned = mappings.find((m) => m.mappedTo === field.key)

            return (
              <div
                key={field.key}
                className="grid grid-cols-[minmax(100px,1.2fr)_28px_minmax(140px,1fr)_minmax(140px,1.6fr)] items-center gap-2 px-3 py-2"
              >
                <span className="text-xs text-foreground/90 truncate">
                  {field.label}
                  {field.required && <span className="text-red-400"> *</span>}
                </span>

                <span className="flex justify-center">
                  {assigned && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
                </span>

                <Select
                  value={assigned?.csvHeader ?? NONE_VALUE}
                  onValueChange={(val) =>
                    onAssignField(field.key, val === NONE_VALUE ? null : val)
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>
                      <span className="text-foreground/50">Select column</span>
                    </SelectItem>
                    {mappings.map((m) => {
                      const disabled = m.mappedTo !== null && m.mappedTo !== field.key
                      return (
                        <SelectItem key={m.csvHeader} value={m.csvHeader} disabled={disabled}>
                          {m.csvHeader}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                <span className="text-[10px] text-foreground/50 truncate">
                  {assigned?.sampleValues.length ? assigned.sampleValues.slice(0, 3).join('; ') : '—'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Unused columns note */}
      {unusedColumns.length > 0 && (
        <p className="text-[10px] text-foreground/40 truncate">
          {unusedColumns.length} column{unusedColumns.length !== 1 ? 's' : ''} not mapped to a field
          will be ignored: {unusedColumns.map((m) => m.csvHeader).join(', ')}
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-1">
        <Button variant="outline" onClick={onBack} size="sm" className="text-xs h-8">
          Choose Different File
        </Button>
        <Button
          onClick={onConfirm}
          size="sm"
          className="text-xs h-8"
          disabled={!nameMapped || !emailMapped}
        >
          Continue to Preview
        </Button>
      </div>
    </div>
  )
}
