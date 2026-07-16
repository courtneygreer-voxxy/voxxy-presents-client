import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { CheckCircle2, AlertCircle, Download } from 'lucide-react'
import type { BulkImportResult } from '@/services/api'
import { downloadErrorReport } from '@/utils/csvTemplateGenerator'

interface StepValidationResultProps {
  result: BulkImportResult
  discoveredTags: string[]
  onImport: () => void
  onBack: () => void
}

const MAX_ERRORS_SHOWN = 20

function StatRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: number
  tone: 'green' | 'blue' | 'yellow' | 'red'
}) {
  const toneClass = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  }[tone]

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2">
      <span className="flex items-center gap-2 text-xs text-foreground/80 min-w-0">
        <span className={toneClass}>{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <span className={`text-xs font-semibold shrink-0 ${toneClass}`}>{value}</span>
    </div>
  )
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
        <p className="text-xs text-foreground/70 text-center truncate">
          Tags found in this file: <span className="text-foreground">{discoveredTags.join(', ')}</span>
        </p>
      )}

      {/* Clean one-line-per-stat summary */}
      <div className="rounded-lg border border-border divide-y divide-border">
        {wouldCreate > 0 && (
          <StatRow icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Will be created" value={wouldCreate} tone="green" />
        )}
        {wouldUpdate > 0 && (
          <StatRow icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Will be updated" value={wouldUpdate} tone="blue" />
        )}
        {wouldSkip > 0 && (
          <StatRow icon={<AlertCircle className="h-3.5 w-3.5" />} label="Duplicates (skipped)" value={wouldSkip} tone="yellow" />
        )}
        {failed > 0 && (
          <StatRow icon={<AlertCircle className="h-3.5 w-3.5" />} label="Invalid rows (skipped)" value={failed} tone="red" />
        )}
      </div>

      {/* Error list — one line per row, truncated with hover for the full message */}
      {hasErrors && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-red-500/20">
            <span className="text-xs font-medium text-red-300 truncate">
              {result.errors.length} row{result.errors.length !== 1 ? 's' : ''} have errors
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadErrorReport(result.errors)}
              className="h-6 px-2 text-[10px] shrink-0"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
          <TooltipProvider delayDuration={150}>
            <ul className="max-h-28 overflow-y-auto divide-y divide-red-500/10">
              {result.errors.slice(0, MAX_ERRORS_SHOWN).map((error, idx) => (
                <li key={idx} className="flex items-center gap-2 px-3 py-1.5 text-[11px] min-w-0">
                  <span className="shrink-0 text-red-400/70 font-mono text-[10px]">Row {error.row}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate text-red-200 cursor-default">{error.message}</span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="max-w-xs bg-red-950 border-red-500/40 text-red-100"
                    >
                      {error.message}
                    </TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </TooltipProvider>
          {result.errors.length > MAX_ERRORS_SHOWN && (
            <p className="px-3 py-1 text-[10px] text-foreground/40 border-t border-red-500/10">
              +{result.errors.length - MAX_ERRORS_SHOWN} more — download the report for the full list
            </p>
          )}
        </div>
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
