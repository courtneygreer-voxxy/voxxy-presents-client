import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { BulkImportResult } from '@/services/api'
import type { ListDraft } from './types'
import {
  CONTACTS_ALWAYS_IN_ALL,
  LISTS_FROM_TAGS,
  TAGS_ARE_LABELS,
} from '../copy'

interface StepReviewListsProps {
  importResult: BulkImportResult
  discoveredTags: string[]
  listDrafts: ListDraft[]
  onUpdateDraft: (index: number, changes: Partial<ListDraft>) => void
  onCreateLists: () => void
  onSkipLists: () => void
}

export function StepReviewLists({
  importResult,
  discoveredTags,
  listDrafts,
  onUpdateDraft,
  onCreateLists,
  onSkipLists,
}: StepReviewListsProps) {
  const created = importResult.summary.created ?? 0
  const updated = importResult.summary.updated ?? 0
  const importedTotal = created + updated

  return (
    <div className="space-y-4">
      <div className="text-center py-1">
        <CheckCircle2 className="h-7 w-7 text-green-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-foreground">Review & Create Lists</h3>
        <p className="text-xs text-foreground/60 mt-1">Contacts imported successfully</p>
        <p className="text-[11px] text-foreground/50 mt-1">
          You can also save filters later from All Contacts.
        </p>
      </div>

      <ul className="text-xs text-foreground/70 space-y-1 list-disc list-inside bg-background/5 rounded-lg p-3 border border-border">
        <li>{CONTACTS_ALWAYS_IN_ALL}</li>
        <li>{TAGS_ARE_LABELS}</li>
        <li>{LISTS_FROM_TAGS}</li>
      </ul>

      <p className="text-xs text-foreground/80 text-center">
        You just imported: <strong>{importedTotal}</strong> contact
        {importedTotal === 1 ? '' : 's'}
        {updated > 0 && (
          <span className="text-foreground/60">
            {' '}
            ({created} created, {updated} updated)
          </span>
        )}
      </p>

      {discoveredTags.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-foreground/70 mb-2">
            New or updated tags found:{' '}
            <span className="font-normal text-foreground/80">{discoveredTags.join(', ')}</span>
          </p>
        </div>
      )}

      {listDrafts.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-foreground/70">Create lists from tags</p>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-2">
            {listDrafts.map((draft, index) => (
              <div
                key={draft.tag}
                className="flex items-start gap-2 p-2 rounded-md bg-background/5"
              >
                <Checkbox
                  id={`list-draft-${draft.tag}`}
                  checked={draft.checked}
                  onCheckedChange={(checked) =>
                    onUpdateDraft(index, { checked: !!checked })
                  }
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`list-draft-${draft.tag}`}
                    className="text-[11px] text-foreground/80 block mb-1 cursor-pointer"
                  >
                    Create a list &lsquo;{draft.name}&rsquo; (tag = {draft.tag})
                  </label>
                  <Input
                    value={draft.name}
                    onChange={(e) => onUpdateDraft(index, { name: e.target.value })}
                    className="h-7 text-xs"
                    disabled={!draft.checked}
                    aria-label={`List name for tag ${draft.tag}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {importResult.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertDescription className="text-[11px]">
            {importResult.errors.length} row(s) had errors during import.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-1">
        <Button variant="outline" onClick={onSkipLists} size="sm" className="text-xs h-8">
          Skip for now
        </Button>
        <Button onClick={onCreateLists} size="sm" className="text-xs h-8">
          {listDrafts.some((d) => d.checked)
            ? 'Create lists & finish'
            : 'Finish'}
        </Button>
      </div>
    </div>
  )
}
