import type { BulkImportResult } from '@/services/api'
import type { ImportSession } from '../importSession'

export interface ColumnMapping {
  csvHeader: string
  mappedTo: string | null
  confidence: 'exact' | 'alias' | 'fuzzy' | 'none'
  sampleValues: string[]
}

export interface ImportRow {
  _originalIndex: number
  _skipped: boolean
  /** Blocking issues (missing Name/Email) — row cannot be imported until fixed or skipped */
  _errors: Record<string, string[]>
  /** Non-blocking formatting issues — row can still be imported as-is */
  _warnings: Record<string, string[]>
  _status: 'valid' | 'warning' | 'error'
  [fieldKey: string]: unknown
}

export type ImportStep =
  | 'idle'
  | 'parsing'
  | 'column_mapping'
  | 'preview_editing'
  | 'server_validating'
  | 'validated'
  | 'uploading'
  | 'review_lists'
  | 'creating_lists'

export interface ListDraft {
  tag: string
  name: string
  checked: boolean
}

export interface ImportState {
  step: ImportStep
  file: File | null
  rawRows: Record<string, string>[]
  rawHeaders: string[]
  columnMappings: ColumnMapping[]
  importRows: ImportRow[]
  bulkTags: string
  skipDuplicates: boolean
  updateExisting: boolean
  validationResult: BulkImportResult | null
  importResult: BulkImportResult | null
  listDrafts: ListDraft[]
  errorMessage: string
  cellsEdited: boolean
}

export type ImportAction =
  | { type: 'FILE_PARSED'; file: File; headers: string[]; rows: Record<string, string>[] }
  | { type: 'SET_COLUMN_MAPPINGS'; mappings: ColumnMapping[] }
  | { type: 'UPDATE_COLUMN_MAPPING'; index: number; mappedTo: string | null }
  | { type: 'ASSIGN_FIELD'; fieldKey: string; csvHeader: string | null }
  | { type: 'CONFIRM_MAPPINGS'; importRows: ImportRow[] }
  | { type: 'EDIT_CELL'; rowIndex: number; fieldKey: string; value: string }
  | { type: 'TOGGLE_ROW_SKIP'; rowIndex: number }
  | { type: 'UPDATE_ROW_ERRORS'; rowIndex: number; errors: Record<string, string[]>; warnings: Record<string, string[]>; status: ImportRow['_status'] }
  | { type: 'SET_BULK_TAGS'; tags: string }
  | { type: 'SET_SKIP_DUPLICATES'; value: boolean }
  | { type: 'SET_UPDATE_EXISTING'; value: boolean }
  | { type: 'SERVER_VALIDATING' }
  | { type: 'VALIDATION_COMPLETE'; result: BulkImportResult }
  | { type: 'UPLOADING' }
  | { type: 'UPLOAD_COMPLETE'; result: BulkImportResult }
  | { type: 'SET_LIST_DRAFTS'; drafts: ListDraft[] }
  | { type: 'UPDATE_LIST_DRAFT'; index: number; changes: Partial<ListDraft> }
  | { type: 'GO_TO_PREVIEW' }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' }

export interface CSVUploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (session: ImportSession) => void
  organizationId: number
}
