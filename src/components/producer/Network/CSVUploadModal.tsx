import { useMemo, useCallback } from 'react'
import Papa from 'papaparse'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { vendorContactsApi, contactListsApi } from '@/services/api'

import { useImportState } from './csvImport/useImportState'
import { autoDetectMappings, buildImportRows } from './csvImport/columnMapping'
import { validateAllRows, revalidateRow } from './csvImport/clientValidation'
import { prepareSubmission } from './csvImport/csvRewriter'
import { RECOGNIZED_FIELD_KEYS } from './csvImport/constants'
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

  const discoveredTags = useMemo(
    () => discoverTagsFromRows(state.rawRows, parseTagsFromValue(state.bulkTags)),
    [state.rawRows, state.bulkTags],
  )

  const primaryTag = getPrimaryTag(state.bulkTags)

  const tagCounts = useMemo(
    () => countTagsFromRows(state.rawRows, parseTagsFromValue(state.bulkTags)),
    [state.rawRows, state.bulkTags],
  )

  const visibleFields = useMemo(
    () =>
      state.columnMappings
        .filter((m) => m.mappedTo !== null && RECOGNIZED_FIELD_KEYS.includes(m.mappedTo!))
        .map((m) => m.mappedTo!),
    [state.columnMappings],
  )

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
      const { errors, status } = revalidateRow(updatedRow)
      dispatch({ type: 'UPDATE_ROW_ERRORS', rowIndex, errors, status })
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

  const handleClose = () => {
    reset()
    onClose()
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
            onUpdateMapping={(idx, mappedTo) =>
              dispatch({ type: 'UPDATE_COLUMN_MAPPING', index: idx, mappedTo })
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
            discoveredTags={discoveredTags}
            onImport={handleImport}
            onBack={handleConfirmMappings}
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="voxxy-modal-surface max-h-[85vh] w-[95vw] max-w-5xl overflow-y-auto p-5">
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
  )
}
