// Google Sheets Payment Sync types

export interface GoogleSheetsConnectionStatus {
  connected: boolean
  email: string | null
  connected_at: string | null
}

export interface PaymentSyncConfig {
  id: number
  event_id: number
  sheet_id: string
  sheet_url: string
  sheet_tab_name: string | null
  email_column: string | null
  phone_column: string | null
  ticket_code_column: string | null
  paid_status_column: string
  paid_value: string
  active: boolean
  last_synced_at: string | null
  column_headers: string[]
  unresolved_error_count: number
  created_at: string
  updated_at: string
}

export interface CreatePaymentSyncConfigRequest {
  sheet_url?: string
  sheet_id?: string
  sheet_tab_name?: string | null
  email_column?: string | null
  phone_column?: string | null
  ticket_code_column?: string | null
  paid_status_column: string
  paid_value?: string
  active?: boolean
}

export interface UpdatePaymentSyncConfigRequest {
  sheet_tab_name?: string | null
  email_column?: string | null
  phone_column?: string | null
  ticket_code_column?: string | null
  paid_status_column?: string
  paid_value?: string
  active?: boolean
}

export interface PaymentSyncError {
  id: number
  event_id: number
  raw_row: Record<string, string>
  reason: 'no_match' | 'duplicate' | 'missing_identifier'
  resolved: boolean
  resolved_by: string | null
  resolved_at: string | null
  matched_registration_id: number | null
  created_at: string
}

export interface SheetMetadata {
  tabs: string[]
  headers: string[]
  sheet_id: string
}

export interface TestSyncPreviewRow {
  raw_data: Record<string, string>
  email: string | null
  phone: string | null
  paid_in_sheet: boolean
  match_status: 'matched' | 'no_match' | 'missing_identifier'
  matched_registration: {
    id: number
    name: string
    email: string
  } | null
  already_paid: boolean
}

export interface TestSyncResult {
  headers: string[]
  rows: TestSyncPreviewRow[]
  total_rows: number
}

export interface SyncResult {
  message: string
  results: {
    synced: number
    errors: number
    skipped: number
  }
  last_synced_at: string
}
