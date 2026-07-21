import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { BulkImportResult } from '@/services/api'
import type { ListDraft } from './types'
interface StepReviewListsProps {
  importResult: BulkImportResult
  discoveredTags: string[]
  listDrafts: ListDraft[]
  errorMessage?: string
  onUpdateDraft: (index: number, changes: Partial<ListDraft>) => void
  onCreateLists: () => void
  onSkipLists: () => void
}

const MAX_VISIBLE_ERRORS = 5

export function StepReviewLists({
  importResult,
  errorMessage,
  onSkipLists,
}: StepReviewListsProps) {
  const created = importResult.summary.created ?? 0
  const updated = importResult.summary.updated ?? 0
  const importedTotal = created + updated

  return (
    <div className="space-y-4">
      <div className="text-center py-1">
        <CheckCircle2 className="h-7 w-7 text-green-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-foreground">Import Complete</h3>
        <p className="text-xs text-foreground/60 mt-1">
          Your contacts are ready in the Network tab.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-foreground/80 text-center">
        Imported: <strong>{importedTotal}</strong> contact{importedTotal === 1 ? '' : 's'}
        {updated > 0 && (
          <span className="text-foreground/60"> ({created} created, {updated} updated)</span>
        )}
      </p>

      {importResult.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertDescription className="text-[11px] space-y-1">
            <p className="font-medium">{importResult.errors.length} row(s) had errors during import:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {importResult.errors.slice(0, MAX_VISIBLE_ERRORS).map((err, i) => (
                <li key={i}>
                  Row {err.row}: {err.field} — {err.message}
                </li>
              ))}
            </ul>
            {importResult.errors.length > MAX_VISIBLE_ERRORS && (
              <p className="text-foreground/60">
                and {importResult.errors.length - MAX_VISIBLE_ERRORS} more
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center pt-1">
        <Button onClick={onSkipLists} size="sm" className="text-xs h-8">
          Done
        </Button>
      </div>
    </div>
  )
}
