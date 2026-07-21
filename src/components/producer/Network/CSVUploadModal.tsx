import { useMemo, useCallback, useState } from 'react'
import Papa from 'papaparse'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { vendorContactsApi, contactListsApi } from '@/services/api'

import { useImportState } from './csvImport/useImportState'
import { autoDetectMappings, buildImportRows } from './csvImport/columnMapping'
import { validateAllRows, revalidateRow } from './csvImport/clientValidation'
import { prepareSubmission } from './csvImport/csvRewriter'
import { RECOGNIZED_FIELD_KEYS, MERGE_FIELDS } from './csvImport/constants'
import type { CSVUploadModalProps } from './csvImport/types'

import { StepUpload } from './csvImport/StepUpload'
import { StepColumnMapping } from './csvImport/StepColumnMapping'
import { StepPreviewEdit } from './csvImport/StepPreviewEdit'
import { StepValidationResult } from './csvImport/StepValidationResult'
import { StepReviewLists } from './csvImport/StepReviewLists'

import {
  buildImportSession,
  countTagsFromRows,
  defaultListNameForTag,
  discoverTagsFromRows,
  getPrimaryTag,
  parseTagsFromValue,
} from './importSession'

export function CSVUploadModal({
  open,
  onClose,
  onSuccess,
  organizationId,
}: CSVUploadModalProps) {
  const { state, dispatch, reset } = useImportState()

  // Use importRows (canonical field keys) when available, rawRows as fallback
  const tagSourceRows = state.importRows.length > 0
    ? (state.importRows as unknown as Record<string, string>[])
    : state.rawRows

  const discoveredTags = useMemo(
    () => discoverTagsFromRows(tagSourceRows, parseTagsFromValue(state.bulkTags)),
    [tagSourceRows, state.bulkTags],
  )

  const primaryTag = getPrimaryTag(state.bulkTags)

  const tagCounts = useMemo(
    () => countTagsFromRows(tagSourceRows, parseTagsFromValue(state.bulkTags)),
    [tagSourceRows, state.bulkTags],
  )

  const visibleFields = useMemo(() => {
    const fields = state.columnMappings
      .filter((m) => m.mappedTo !== null && RECOGNIZED_FIELD_KEYS.includes(m.mappedTo!))
      .map((m) => m.mappedTo!)
    // If name was created via merge (first_name+last_name), ensure it appears
    const hasMerge = state.columnMappings.some(
      (m) => m.mappedTo !== null && MERGE_FIELDS[m.mappedTo!] !== undefined,
    )
    if (hasMerge && !fields.includes('name')) {
      fields.unshift('name')
    }
    return fields
  }, [state.columnMappings])

  // ─── Handlers ────────────────────────────────────────────────────

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv')) {
        dispatch({ type: 'ERROR', message: 'Please select a CSV file' })
        return
      }

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) =>
          h.trim().toLowerCase().replace(/^\uFEFF/, ''),
        complete: (results) => {
          const headers = results.meta.fields || []
          const rows = results.data as Record<string, string>[]

          dispatch({ type: 'FILE_PARSED', file, headers, rows })

          // Auto-detect column mappings
          const mappings = autoDetectMappings(headers, rows)
          dispatch({ type: 'SET_COLUMN_MAPPINGS', mappings })
        },
        error: (error) => {
          dispatch({ type: 'ERROR', message: `Failed to parse CSV: ${error.message}` })
        },
      })
    },
    [dispatch],
  )

  const handleConfirmMappings = useCallback(() => {
    const importRows = buildImportRows(state.rawRows, state.columnMappings)
    validateAllRows(importRows)
    dispatch({ type: 'CONFIRM_MAPPINGS', importRows })
  }, [state.rawRows, state.columnMappings, dispatch])

  const handleEditCell = useCallback(
    (rowIndex: number, fieldKey: string, value: string) => {
      dispatch({ type: 'EDIT_CELL', rowIndex, fieldKey, value })

      // Re-validate the edited row
      const updatedRow = { ...state.importRows[rowIndex], [fieldKey]: value }
      const { errors, warnings, status } = revalidateRow(updatedRow)
      dispatch({ type: 'UPDATE_ROW_ERRORS', rowIndex, errors, warnings, status })
    },
    [state.importRows, dispatch],
  )

  const handleValidate = useCallback(async () => {
    if (!state.file) return
    dispatch({ type: 'SERVER_VALIDATING' })

    try {
      const { file, columnMapping } = prepareSubmission(
        state.file,
        state.columnMappings,
        state.importRows,
        state.cellsEdited,
      )

      const result = await vendorContactsApi.bulkImport(file, {
        skipDuplicates: state.skipDuplicates,
        updateExisting: state.updateExisting,
        tags: parseTagsFromValue(state.bulkTags),
        validateOnly: true,
        columnMapping: columnMapping ?? undefined,
      })
      dispatch({ type: 'VALIDATION_COMPLETE', result })
    } catch (error) {
      dispatch({
        type: 'ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Validation failed. Please check your file and try again.',
      })
    }
  }, [state, dispatch])

  const handleImport = useCallback(async () => {
    if (!state.file) return
    dispatch({ type: 'UPLOADING' })

    try {
      const { file, columnMapping } = prepareSubmission(
        state.file,
        state.columnMappings,
        state.importRows,
        state.cellsEdited,
      )

      const result = await vendorContactsApi.bulkImport(file, {
        skipDuplicates: state.skipDuplicates,
        updateExisting: state.updateExisting,
        tags: parseTagsFromValue(state.bulkTags),
        columnMapping: columnMapping ?? undefined,
      })
      dispatch({ type: 'UPLOAD_COMPLETE', result })

      // Initialize list drafts
      const primary = getPrimaryTag(state.bulkTags)
      dispatch({
        type: 'SET_LIST_DRAFTS',
        drafts: discoveredTags.map((tag) => ({
          tag,
          name: defaultListNameForTag(tag),
          checked: tag === primary,
        })),
      })
    } catch (error) {
      dispatch({
        type: 'ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Upload failed. Please check your file and try again.',
      })
    }
  }, [state, dispatch, discoveredTags])

  const finishImport = useCallback(
    (listsCreated: string[]) => {
      const summary = state.importResult?.summary
      const session = buildImportSession({
        created: summary?.created ?? 0,
        updated: summary?.updated ?? 0,
        tags: discoveredTags,
        primaryTag,
        listsCreated,
        tagCounts,
      })
      onSuccess(session)
      reset()
      onClose()
    },
    [state.importResult, discoveredTags, primaryTag, tagCounts, onSuccess, reset, onClose],
  )

  const handleCreateLists = useCallback(async () => {
    const selected = state.listDrafts.filter((d) => d.checked && d.name.trim())
    if (selected.length === 0) {
      finishImport([])
      return
    }

    dispatch({ type: 'SET_LIST_DRAFTS', drafts: state.listDrafts }) // keep state while creating
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
      dispatch({
        type: 'ERROR',
        message: error instanceof Error ? error.message : 'Failed to create one or more lists.',
      })
    }
  }, [state.listDrafts, organizationId, finishImport, dispatch])

  const [confirmExitOpen, setConfirmExitOpen] = useState(false)

  // Steps where the user has meaningful work in progress that would be lost on close.
  const SAFE_TO_EXIT_STEPS = new Set(['idle', 'review_lists', 'creating_lists'])
  const hasActiveWork = !SAFE_TO_EXIT_STEPS.has(state.step)

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleAttemptClose = (requestedOpen: boolean) => {
    if (!requestedOpen && hasActiveWork) {
      setConfirmExitOpen(true)
      return
    }
    if (!requestedOpen) handleClose()
  }

  const handleConfirmExit = () => {
    setConfirmExitOpen(false)
    handleClose()
  }

  // ─── Render ──────────────────────────────────────────────────────

  const renderStep = () => {
    switch (state.step) {
      case 'idle':
        return <StepUpload onFileSelect={handleFileSelect} errorMessage={state.errorMessage} />

      case 'parsing':
        return (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )

      case 'column_mapping':
        return (
          <StepColumnMapping
            fileName={state.file?.name ?? ''}
            totalRows={state.rawRows.length}
            mappings={state.columnMappings}
            onAssignField={(fieldKey, csvHeader) =>
              dispatch({ type: 'ASSIGN_FIELD', fieldKey, csvHeader })
            }
            onConfirm={handleConfirmMappings}
            onBack={reset}
          />
        )

      case 'preview_editing':
        return (
          <StepPreviewEdit
            fileName={state.file?.name ?? ''}
            rows={state.importRows}
            visibleFields={visibleFields}
            bulkTags={state.bulkTags}
            errorMessage={state.errorMessage}
            onEditCell={handleEditCell}
            onToggleSkip={(idx) => dispatch({ type: 'TOGGLE_ROW_SKIP', rowIndex: idx })}
            onSetBulkTags={(tags) => dispatch({ type: 'SET_BULK_TAGS', tags })}
            onValidate={handleValidate}
            onBack={() => dispatch({ type: 'SET_COLUMN_MAPPINGS', mappings: state.columnMappings })}
          />
        )

      case 'server_validating':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Validating contacts...</p>
            <p className="text-xs text-foreground/50 mt-1">
              Checking for errors before importing
            </p>
          </div>
        )

      case 'validated':
        return state.validationResult ? (
          <StepValidationResult
            result={state.validationResult}
            errorMessage={state.errorMessage}
            onImport={handleImport}
            onBack={() => dispatch({ type: 'GO_TO_PREVIEW' })}
          />
        ) : null

      case 'uploading':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Importing contacts...</p>
            <p className="text-xs text-foreground/50 mt-1">
              This may take a moment for large files
            </p>
          </div>
        )

      case 'review_lists':
        return state.importResult ? (
          <StepReviewLists
            importResult={state.importResult}
            discoveredTags={discoveredTags}
            listDrafts={state.listDrafts}
            errorMessage={state.errorMessage}
            onUpdateDraft={(idx, changes) =>
              dispatch({ type: 'UPDATE_LIST_DRAFT', index: idx, changes })
            }
            onCreateLists={handleCreateLists}
            onSkipLists={() => finishImport([])}
          />
        ) : null

      case 'creating_lists':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Creating lists...</p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleAttemptClose}>
        <DialogContent
          className="voxxy-modal-surface voxxy-modal-workspace"
          onInteractOutside={(e) => {
            if (hasActiveWork) e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            if (hasActiveWork) e.preventDefault()
          }}
        >
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base text-foreground">
              Import Contacts from CSV
            </DialogTitle>
            <DialogDescription className="text-foreground/60 text-xs">
              Upload a CSV file to bulk import vendor contacts into All Contacts
            </DialogDescription>
          </DialogHeader>
          <div>{renderStep()}</div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmExitOpen} onOpenChange={setConfirmExitOpen}>
        <AlertDialogContent className="voxxy-modal-surface max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Leave import?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Your progress will be lost — the uploaded file and any edits you've made won't be
              saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">Stay</AlertDialogCancel>
            <AlertDialogAction
              className="text-xs h-8 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmExit}
            >
              Leave anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
