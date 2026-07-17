import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Download } from 'lucide-react'
import type { BulkImportResult } from '@/services/api'
import { downloadErrorReport } from '@/utils/csvTemplateGenerator'

interface StepValidationResultProps {
  result: BulkImportResult
  errorMessage?: string
  onImport: () => void
  onBack: () => void
}

/** Group an array of {row, field, message} by message, returning sorted counts. */
function groupByMessage(items: Array<{ row: number; field: string; message: string }>) {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item.message, (counts.get(item.message) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([message, count]) => ({ message, count }))
}

export function StepValidationResult({
  result,
  errorMessage,
  onImport,
  onBack,
}: StepValidationResultProps) {
  const hasErrors = result.errors.length > 0
  const warnings = result.warnings ?? []
  const hasWarnings = warnings.length > 0
  const wouldCreate = result.summary.would_create || 0
  const wouldUpdate = result.summary.would_update || 0
  const wouldSkip = result.summary.would_skip || 0
  const failed = result.summary.failed || 0
  const importable = wouldCreate + wouldUpdate

  const groupedErrors = useMemo(() => groupByMessage(result.errors), [result.errors])
  const groupedWarnings = useMemo(() => groupByMessage(warnings), [warnings])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-background/5 px-8 py-10 space-y-6">
        {/* Hero */}
        <div className="text-center">
          {importable > 0 ? (
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          )}
          <p className="text-4xl font-bold text-foreground">{importable}</p>
          <p className="text-sm text-foreground/60 mt-1">
            contact{importable !== 1 ? 's' : ''} ready to import
          </p>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Breakdown */}
        <div className="text-sm text-foreground/60 space-y-2 border-t border-border/30 pt-5">
          {wouldCreate > 0 && (
            <div className="flex justify-between">
              <span>New contacts</span>
              <span className="text-green-400 font-medium">{wouldCreate}</span>
            </div>
          )}
          {wouldUpdate > 0 && (
            <div className="flex justify-between">
              <span>Existing (will update)</span>
              <span className="text-blue-400 font-medium">{wouldUpdate}</span>
            </div>
          )}
          {wouldSkip > 0 && (
            <div className="flex justify-between">
              <span>Duplicates (skipped)</span>
              <span className="text-foreground/40">{wouldSkip}</span>
            </div>
          )}
        </div>

        {/* Issue breakdown — grouped by message */}
        {(hasWarnings || hasErrors) && (
          <div className="space-y-3">
            {hasWarnings && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
                <p className="text-xs font-medium text-yellow-300 mb-2">
                  Formatting warnings — will still import
                </p>
                <div className="space-y-1.5">
                  {groupedWarnings.map(({ message, count }) => (
                    <div key={message} className="flex justify-between gap-3 text-xs">
                      <span className="text-yellow-200/70 truncate">{message}</span>
                      <span className="text-yellow-400 font-medium shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasErrors && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-red-300">
                    Errors — {failed} row{failed !== 1 ? 's' : ''} will not import
                  </p>
                  <button
                    onClick={() => downloadErrorReport(result.errors)}
                    className="flex items-center gap-1 text-[11px] text-foreground/40 hover:text-foreground/60"
                  >
                    <Download className="h-3 w-3" />
                    report
                  </button>
                </div>
                <div className="space-y-1.5">
                  {groupedErrors.map(({ message, count }) => (
                    <div key={message} className="flex justify-between gap-3 text-xs">
                      <span className="text-red-200/70 truncate">{message}</span>
                      <span className="text-red-400 font-medium shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="outline" onClick={onBack} className="text-sm h-10 px-5">
            Back
          </Button>
          <Button
            onClick={onImport}
            className="text-sm h-10 px-6 min-w-[180px]"
            disabled={importable === 0}
          >
            {importable === 0
              ? 'Nothing to import'
              : `Import ${importable} Contact${importable !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
