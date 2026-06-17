import React, { useState, useRef, useMemo } from 'react'
import Papa from 'papaparse'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { vendorContactsApi, contactListsApi, BulkImportResult } from '@/services/api'
import { downloadCSVTemplate, downloadErrorReport } from '@/utils/csvTemplateGenerator'
import {
  CONTACTS_ALWAYS_IN_ALL,
  LISTS_FROM_TAGS,
  PRIMARY_TAG_HELPER,
  TAGS_ARE_LABELS,
} from './copy'
import {
  type ImportSession,
  buildImportSession,
  countTagsFromRows,
  defaultListNameForTag,
  discoverTagsFromRows,
  getPrimaryTag,
  parseTagsFromValue,
} from './importSession'

interface CSVUploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (session: ImportSession) => void
  organizationId: number
}

type UploadState =
  | 'idle'
  | 'file_selected'
  | 'validating'
  | 'server_validating'
  | 'validated'
  | 'uploading'
  | 'review_lists'
  | 'creating_lists'
  | 'error'

interface CSVPreviewData {
  headers: string[]
  rows: Record<string, string>[]
  totalRows: number
}

interface ListDraft {
  tag: string
  name: string
  checked: boolean
}

export function CSVUploadModal({
  open,
  onClose,
  onSuccess,
  organizationId,
}: CSVUploadModalProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<CSVPreviewData | null>(null)
  const [fullCsvRows, setFullCsvRows] = useState<Record<string, string>[]>([])
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [bulkTags, setBulkTags] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)
  const [validationResult, setValidationResult] = useState<BulkImportResult | null>(null)
  const [listDrafts, setListDrafts] = useState<ListDraft[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const requiredHeaders = ['name', 'email']
  const optionalHeaders = [
    'phone',
    'business_name',
    'instagram_handle',
    'tiktok_handle',
    'website',
    'location',
    'tags',
    'eventbrite_email',
    'venmo_handle',
    'paypal_email',
  ]
  const hiddenPreviewColumns = ['notes', 'featured', 'status', 'job_title', 'job title']

  const discoveredTags = useMemo(
    () => discoverTagsFromRows(fullCsvRows, parseTagsFromValue(bulkTags)),
    [fullCsvRows, bulkTags],
  )

  const primaryTag = getPrimaryTag(bulkTags)

  const tagCounts = useMemo(
    () => countTagsFromRows(fullCsvRows, parseTagsFromValue(bulkTags)),
    [fullCsvRows, bulkTags],
  )

  const initListDrafts = (tags: string[]) => {
    const primary = getPrimaryTag(bulkTags)
    setListDrafts(
      tags.map((tag) => ({
        tag,
        name: defaultListNameForTag(tag),
        checked: tag === primary,
      })),
    )
  }

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Please select a CSV file')
      setState('error')
      return
    }

    setSelectedFile(file)
    setState('validating')
    setErrorMessage('')
    setFullCsvRows([])

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) =>
        header
          .trim()
          .toLowerCase()
          .replace(/^\uFEFF/, ''),
      preview: 10,
      complete: (results) => {
        const headers = results.meta.fields || []
        const normalizedHeaders = headers.map((h) => h.replace(/\s+/g, '_'))
        const missingHeaders = requiredHeaders.filter((h) => !normalizedHeaders.includes(h))
        if (missingHeaders.length > 0) {
          setErrorMessage(
            `Missing required columns: ${missingHeaders.join(', ')}. Found columns: ${headers.join(', ')}`,
          )
          setState('error')
          return
        }

        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) =>
            header
              .trim()
              .toLowerCase()
              .replace(/^\uFEFF/, ''),
          complete: (fullResults) => {
            const allRows = fullResults.data as Record<string, string>[]
            setFullCsvRows(allRows)
            setPreviewData({
              headers,
              rows: results.data as Record<string, string>[],
              totalRows: allRows.length,
            })
            setState('file_selected')
          },
          error: (fullError) => {
            setErrorMessage(`Failed to parse CSV: ${fullError.message}`)
            setState('error')
          },
        })
      },
      error: (error) => {
        setErrorMessage(`Failed to parse CSV: ${error.message}`)
        setState('error')
      },
    })
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const getImportTags = () => parseTagsFromValue(bulkTags)

  const handleValidate = async () => {
    if (!selectedFile) return
    setState('server_validating')
    setErrorMessage('')

    try {
      const result = await vendorContactsApi.bulkImport(selectedFile, {
        skipDuplicates,
        updateExisting,
        tags: getImportTags(),
        validateOnly: true,
      })
      setValidationResult(result)
      setState('validated')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Validation failed. Please check your file and try again.',
      )
      setState('error')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setState('uploading')
    setErrorMessage('')

    try {
      const result = await vendorContactsApi.bulkImport(selectedFile, {
        skipDuplicates,
        updateExisting,
        tags: getImportTags(),
      })
      setImportResult(result)
      initListDrafts(discoveredTags)
      setState('review_lists')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Upload failed. Please check your file and try again.',
      )
      setState('error')
    }
  }

  const finishImport = (listsCreated: string[]) => {
    const summary = importResult?.summary
    const session = buildImportSession({
      created: summary?.created ?? 0,
      updated: summary?.updated ?? 0,
      tags: discoveredTags,
      primaryTag,
      listsCreated,
      tagCounts,
    })
    onSuccess(session)
    handleClose()
  }

  const handleSkipLists = () => finishImport([])

  const handleCreateLists = async () => {
    const selected = listDrafts.filter((d) => d.checked && d.name.trim())
    if (selected.length === 0) {
      finishImport([])
      return
    }

    setState('creating_lists')
    try {
      await Promise.all(
        selected.map((draft) =>
          contactListsApi.create(organizationId, {
            name: draft.name.trim(),
            list_type: 'smart',
            filters: { tags: [draft.tag] },
          }),
        ),
      )
      finishImport(selected.map((d) => d.name.trim()))
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to create one or more lists.',
      )
      setState('review_lists')
    }
  }

  const handleReset = () => {
    setState('idle')
    setSelectedFile(null)
    setPreviewData(null)
    setFullCsvRows([])
    setImportResult(null)
    setValidationResult(null)
    setListDrafts([])
    setErrorMessage('')
    setBulkTags('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const renderIdleState = () => (
    <div className="space-y-3">
      <Alert>
        <FileText className="h-3.5 w-3.5" />
        <AlertDescription className="text-xs">
          First time importing?{' '}
          <button
            onClick={downloadCSVTemplate}
            className="font-medium text-primary hover:underline"
          >
            Download our CSV template
          </button>{' '}
          to get started.
        </AlertDescription>
      </Alert>

      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-primary/40 bg-background/5 rounded-lg p-6 text-center hover:border-primary hover:bg-background/10 transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-1.5 text-xs text-foreground/80">
          Drag and drop your CSV file here, or click to browse
        </p>
        <p className="mt-0.5 text-[11px] text-foreground/50">CSV files only</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )

  const renderFileSelectedState = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-background/5 border border-primary/20 rounded-lg">
        <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-xs text-foreground/90 truncate">
          <strong>{selectedFile?.name}</strong> — {previewData?.totalRows} contacts
        </span>
      </div>

      {(() => {
        const visibleHeaders =
          previewData?.headers.filter((h) => !hiddenPreviewColumns.includes(h.toLowerCase())) || []
        return (
          <div className="border border-primary/20 rounded-lg overflow-hidden bg-background/5">
            <div className="bg-primary/10 px-3 py-1.5 border-b border-primary/20">
              <h4 className="text-[11px] font-medium text-foreground/70 uppercase tracking-wide">
                Preview (first 10 rows)
              </h4>
            </div>
            <div className="overflow-x-auto max-h-[40vh]">
              <table className="w-full text-[11px]">
                <thead className="bg-background/5 sticky top-0">
                  <tr>
                    {visibleHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-2 py-1 text-left font-medium text-foreground/80 border-b border-primary/20 whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[100px]" title={header}>
                            {header}
                          </span>
                          {requiredHeaders.includes(header) && (
                            <span className="text-red-400">*</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData?.rows.map((row, idx) => (
                    <tr key={idx} className="border-b border-primary/10 hover:bg-background/5">
                      {visibleHeaders.map((header) => (
                        <td key={header} className="px-2 py-1 text-foreground/60">
                          <div className="truncate max-w-[150px]" title={row[header] || ''}>
                            {row[header] || <span className="text-foreground/30">—</span>}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      <div className="space-y-2">
        <div className="flex items-end gap-3 max-w-md">
          <div className="flex-1">
            <Label htmlFor="bulk-tags" className="text-[11px] text-foreground/70 mb-1 block">
              Primary tag for this import
            </Label>
            <Input
              id="bulk-tags"
              placeholder="e.g., Seattle, Oklahoma City"
              value={bulkTags}
              onChange={(e) => setBulkTags(e.target.value)}
              className="h-8 text-xs"
            />
            <p className="text-[10px] text-foreground/50 mt-1">{PRIMARY_TAG_HELPER}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleValidate} size="sm" className="text-xs h-8">
            Validate {previewData?.totalRows} Contacts
          </Button>
          <Button variant="outline" onClick={handleReset} size="sm" className="text-xs h-8">
            Choose Different File
          </Button>
        </div>
      </div>
    </div>
  )

  const renderUploadingState = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <p className="text-sm font-medium">Importing contacts...</p>
      <p className="text-xs text-foreground/50 mt-1">This may take a moment for large files</p>
    </div>
  )

  const renderCreatingListsState = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <p className="text-sm font-medium">Creating lists...</p>
    </div>
  )

  const renderReviewListsState = () => {
    const created = importResult?.summary.created ?? 0
    const updated = importResult?.summary.updated ?? 0
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
                    onCheckedChange={(checked) => {
                      setListDrafts((prev) =>
                        prev.map((d, i) => (i === index ? { ...d, checked: !!checked } : d)),
                      )
                    }}
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
                      onChange={(e) => {
                        const value = e.target.value
                        setListDrafts((prev) =>
                          prev.map((d, i) => (i === index ? { ...d, name: value } : d)),
                        )
                      }}
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

        {importResult && importResult.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-[11px]">
              {importResult.errors.length} row(s) had errors during import.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between pt-1">
          <Button variant="outline" onClick={handleSkipLists} size="sm" className="text-xs h-8">
            Skip for now
          </Button>
          <Button onClick={handleCreateLists} size="sm" className="text-xs h-8">
            {listDrafts.some((d) => d.checked)
              ? 'Create lists & finish'
              : 'Finish'}
          </Button>
        </div>
      </div>
    )
  }

  const renderServerValidatingState = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <p className="text-sm font-medium">Validating contacts...</p>
      <p className="text-xs text-foreground/50 mt-1">Checking for errors before importing</p>
    </div>
  )

  const renderValidatedState = () => {
    const hasErrors = (validationResult?.errors.length || 0) > 0
    const wouldCreate = validationResult?.summary.would_create || 0
    const wouldUpdate = validationResult?.summary.would_update || 0
    const wouldSkip = validationResult?.summary.would_skip || 0
    const failed = validationResult?.summary.failed || 0

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

        {hasErrors && validationResult && (
          <Alert variant="destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription>
              <div className="space-y-1.5">
                <p className="text-xs font-medium">
                  {validationResult.errors.length} row(s) have errors and will be skipped:
                </p>
                <div className="max-h-24 overflow-y-auto text-[11px] space-y-0.5">
                  {validationResult.errors.slice(0, 5).map((error, idx) => (
                    <div key={idx}>
                      Row {error.row}: {error.message}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadErrorReport(validationResult.errors)}
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
          <Button variant="outline" onClick={handleReset} size="sm" className="text-xs h-8">
            Fix &amp; Re-upload
          </Button>
          <Button onClick={handleUpload} size="sm" className="text-xs h-8">
            {hasErrors
              ? `Import Anyway (${wouldCreate + wouldUpdate} valid)`
              : `Import ${wouldCreate + wouldUpdate} Contacts`}
          </Button>
        </div>
      </div>
    )
  }

  const renderErrorState = () => (
    <div className="space-y-3">
      <Alert variant="destructive">
        <XCircle className="h-3.5 w-3.5" />
        <AlertDescription>
          <div className="space-y-1.5">
            <p className="text-xs font-medium">Import Failed</p>
            <p className="text-xs">{errorMessage}</p>
          </div>
        </AlertDescription>
      </Alert>
      <div className="flex justify-end">
        <Button onClick={handleReset} size="sm" className="text-xs h-8">
          Try Again
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="voxxy-modal-surface max-h-[85vh] w-[95vw] max-w-5xl overflow-y-auto p-5">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-base text-foreground">Import Contacts from CSV</DialogTitle>
          <DialogDescription className="text-foreground/60 text-xs">
            Upload a CSV file to bulk import vendor contacts into All Contacts
          </DialogDescription>
        </DialogHeader>

        <div>
          {state === 'idle' && renderIdleState()}
          {state === 'validating' && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {state === 'file_selected' && renderFileSelectedState()}
          {state === 'server_validating' && renderServerValidatingState()}
          {state === 'validated' && renderValidatedState()}
          {state === 'uploading' && renderUploadingState()}
          {state === 'review_lists' && renderReviewListsState()}
          {state === 'creating_lists' && renderCreatingListsState()}
          {state === 'error' && renderErrorState()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
