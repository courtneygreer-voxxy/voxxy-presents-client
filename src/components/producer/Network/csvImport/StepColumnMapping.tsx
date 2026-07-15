import { CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { ColumnMapping } from './types'
import { RECOGNIZED_FIELDS, FIELD_LABELS } from './constants'
import { isNameMapped } from './columnMapping'

interface StepColumnMappingProps {
  fileName: string
  totalRows: number
  mappings: ColumnMapping[]
  onUpdateMapping: (index: number, mappedTo: string | null) => void
  onConfirm: () => void
  onBack: () => void
}

export function StepColumnMapping({
  fileName,
  totalRows,
  mappings,
  onUpdateMapping,
  onConfirm,
  onBack,
}: StepColumnMappingProps) {
  const mapped = mappings.filter((m) => m.mappedTo !== null)
  const unmapped = mappings.filter((m) => m.mappedTo === null)
  const nameMapped = isNameMapped(mappings)
  const emailMapped = mappings.some((m) => m.mappedTo === 'email')

  // Get already-claimed field keys to prevent double-mapping
  const claimedFields = new Set(mappings.filter((m) => m.mappedTo).map((m) => m.mappedTo!))

  return (
    <div className="space-y-4">
      {/* File info */}
      <div className="flex items-center justify-between px-3 py-2 bg-background/5 border border-primary/20 rounded-lg">
        <span className="text-xs text-foreground/90">
          <strong>{fileName}</strong> — {totalRows} rows, {mappings.length} columns
        </span>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 text-[11px] text-foreground/70">
        <span className="text-green-400">{mapped.length} mapped</span>
        <span className="text-foreground/40">·</span>
        {unmapped.length > 0 && (
          <>
            <span className="text-yellow-400">{unmapped.length} skipped</span>
            <span className="text-foreground/40">·</span>
          </>
        )}
        <span>{mappings.length} total columns</span>
      </div>

      {/* Validation warnings */}
      {!nameMapped && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <span className="text-xs text-red-300">
            <strong>Name</strong> column is required. Map a column to &quot;Name&quot; to continue.
          </span>
        </div>
      )}
      {nameMapped && !emailMapped && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertCircle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          <span className="text-xs text-yellow-300">
            No <strong>Email</strong> column mapped. Contacts without emails cannot receive messages.
          </span>
        </div>
      )}

      {/* Column mapping list */}
      <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
        {mappings.map((mapping, index) => {
          const icon =
            mapping.mappedTo !== null ? (
              <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
            ) : (
              <MinusCircle className="h-4 w-4 text-foreground/30 shrink-0" />
            )

          return (
            <div
              key={mapping.csvHeader}
              className="flex items-center gap-3 px-3 py-2 bg-background/5 border border-border rounded-lg"
            >
              {icon}

              {/* CSV header name + samples */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {mapping.csvHeader}
                </p>
                {mapping.sampleValues.length > 0 && (
                  <p className="text-[10px] text-foreground/50 truncate">
                    {mapping.sampleValues.slice(0, 3).join(' · ')}
                  </p>
                )}
              </div>

              {/* Dropdown */}
              <Select
                value={mapping.mappedTo ?? '__skip__'}
                onValueChange={(val) =>
                  onUpdateMapping(index, val === '__skip__' ? null : val)
                }
              >
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="Skip column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__skip__">
                    <span className="text-foreground/50">Skip column</span>
                  </SelectItem>
                  {RECOGNIZED_FIELDS.map((field) => {
                    const disabled =
                      claimedFields.has(field.key) && mapping.mappedTo !== field.key
                    return (
                      <SelectItem
                        key={field.key}
                        value={field.key}
                        disabled={disabled}
                      >
                        {field.label}
                        {field.required && ' *'}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              {/* Confidence badge */}
              {mapping.mappedTo !== null && mapping.confidence !== 'exact' && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded ${
                    mapping.confidence === 'alias'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  {mapping.confidence}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-1">
        <Button variant="outline" onClick={onBack} size="sm" className="text-xs h-8">
          Choose Different File
        </Button>
        <Button
          onClick={onConfirm}
          size="sm"
          className="text-xs h-8"
          disabled={!nameMapped}
        >
          Continue to Preview
        </Button>
      </div>
    </div>
  )
}
