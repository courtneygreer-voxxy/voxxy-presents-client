import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Download } from 'lucide-react'
import type { BulkImportResult } from '@/services/api'
import { downloadErrorReport } from '@/utils/csvTemplateGenerator'

interface StepValidationResultProps {
  result: BulkImportResult
  discoveredTags: string[]
  onImport: () => void
  onBack: () => void
}

export function StepValidationResult({
  result,
  discoveredTags,
  onImport,
  onBack,
}: StepValidationResultProps) {
  const hasErrors = result.errors.length > 0
  const wouldCreate = result.summary.would_create || 0
  const wouldUpdate = result.summary.would_update || 0
  const wouldSkip = result.summary.would_skip || 0
  const failed = result.summary.failed || 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 justify-center py-2">
        {hasErrors ? (
          <AlertCircle className="h-6 w-6 text-yellow-400" />
        ) : (
          <CheckCircle2 className="h-6 w-6 text-green-400" />
        )}
        <h3 className="text-sm font-semibold text-foreground">
          {hasErrors ? 'Validation Found Issues' : 'Validation Passed'}
        </h3>
      </div>

      {discoveredTags.length > 0 && (
        <p className="text-xs text-foreground/70 text-center">
          Tags found in this file:{' '}
          <span className="text-foreground">{discoveredTags.join(', ')}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {wouldCreate > 0 && (
          <div className="border border-green-500/30 bg-green-500/10 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-green-400">{wouldCreate}</div>
            <div className="text-[11px] text-foreground/60">Will be created</div>
          </div>
        )}
        {wouldUpdate > 0 && (
          <div className="border border-blue-500/30 bg-blue-500/10 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-blue-400">{wouldUpdate}</div>
            <div className="text-[11px] text-foreground/60">Will be updated</div>
          </div>
        )}
        {wouldSkip > 0 && (
          <div className="border border-yellow-500/30 bg-yellow-500/10 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-yellow-400">{wouldSkip}</div>
            <div className="text-[11px] text-foreground/60">Duplicates (skipped)</div>
          </div>
        )}
        {failed > 0 && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-red-400">{failed}</div>
            <div className="text-[11px] text-foreground/60">Invalid rows</div>
          </div>
        )}
      </div>

      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertDescription>
            <div className="space-y-1.5">
              <p className="text-xs font-medium">
                {result.errors.length} row(s) have errors and will be skipped:
              </p>
              <div className="max-h-24 overflow-y-auto text-[11px] space-y-0.5">
                {result.errors.slice(0, 5).map((error, idx) => (
                  <div key={idx}>
                    Row {error.row}: {error.message}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadErrorReport(result.errors)}
                className="mt-1 h-7 text-[11px]"
              >
                <Download className="h-3 w-3 mr-1.5" />
                Download Error Report
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-1">
        <Button variant="outline" onClick={onBack} size="sm" className="text-xs h-8">
          Back to Preview
        </Button>
        <Button onClick={onImport} size="sm" className="text-xs h-8">
          {hasErrors
            ? `Import Anyway (${wouldCreate + wouldUpdate} valid)`
            : `Import ${wouldCreate + wouldUpdate} Contacts`}
        </Button>
      </div>
    </div>
  )
}
