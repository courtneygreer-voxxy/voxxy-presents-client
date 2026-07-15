import { useReducer, useCallback } from 'react'
import type { ImportState, ImportAction } from './types'

const initialState: ImportState = {
  step: 'idle',
  file: null,
  rawRows: [],
  rawHeaders: [],
  columnMappings: [],
  importRows: [],
  bulkTags: '',
  skipDuplicates: true,
  updateExisting: false,
  validationResult: null,
  importResult: null,
  listDrafts: [],
  errorMessage: '',
  cellsEdited: false,
}

function importReducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case 'FILE_PARSED':
      return {
        ...state,
        step: 'column_mapping',
        file: action.file,
        rawHeaders: action.headers,
        rawRows: action.rows,
        errorMessage: '',
      }

    case 'SET_COLUMN_MAPPINGS':
      return {
        ...state,
        columnMappings: action.mappings,
      }

    case 'UPDATE_COLUMN_MAPPING': {
      const mappings = [...state.columnMappings]
      mappings[action.index] = { ...mappings[action.index], mappedTo: action.mappedTo, confidence: 'exact' }
      return { ...state, columnMappings: mappings }
    }

    case 'CONFIRM_MAPPINGS':
      return {
        ...state,
        step: 'preview_editing',
        importRows: action.importRows,
        cellsEdited: false,
      }

    case 'EDIT_CELL': {
      const rows = [...state.importRows]
      rows[action.rowIndex] = {
        ...rows[action.rowIndex],
        [action.fieldKey]: action.value,
      }
      return { ...state, importRows: rows, cellsEdited: true }
    }

    case 'TOGGLE_ROW_SKIP': {
      const rows = [...state.importRows]
      rows[action.rowIndex] = {
        ...rows[action.rowIndex],
        _skipped: !rows[action.rowIndex]._skipped,
      }
      return { ...state, importRows: rows }
    }

    case 'UPDATE_ROW_ERRORS': {
      const rows = [...state.importRows]
      rows[action.rowIndex] = {
        ...rows[action.rowIndex],
        _errors: action.errors,
        _status: action.status,
      }
      return { ...state, importRows: rows }
    }

    case 'SET_BULK_TAGS':
      return { ...state, bulkTags: action.tags }

    case 'SET_SKIP_DUPLICATES':
      return { ...state, skipDuplicates: action.value }

    case 'SET_UPDATE_EXISTING':
      return { ...state, updateExisting: action.value }

    case 'SERVER_VALIDATING':
      return { ...state, step: 'server_validating', errorMessage: '' }

    case 'VALIDATION_COMPLETE':
      return { ...state, step: 'validated', validationResult: action.result }

    case 'UPLOADING':
      return { ...state, step: 'uploading', errorMessage: '' }

    case 'UPLOAD_COMPLETE':
      return { ...state, step: 'review_lists', importResult: action.result }

    case 'SET_LIST_DRAFTS':
      return { ...state, listDrafts: action.drafts }

    case 'UPDATE_LIST_DRAFT': {
      const drafts = [...state.listDrafts]
      drafts[action.index] = { ...drafts[action.index], ...action.changes }
      return { ...state, listDrafts: drafts }
    }

    case 'ERROR':
      return { ...state, step: 'idle', errorMessage: action.message }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

export function useImportState() {
  const [state, dispatch] = useReducer(importReducer, initialState)
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])
  return { state, dispatch, reset }
}
