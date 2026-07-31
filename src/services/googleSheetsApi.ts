// Google Sheets Payment Sync API service
import { getApiUrl } from '@/config/environments'
import { getAuthToken } from './api'
import type {
  GoogleSheetsConnectionStatus,
  PaymentSyncConfig,
  CreatePaymentSyncConfigRequest,
  UpdatePaymentSyncConfigRequest,
  PaymentSyncError,
  SheetMetadata,
  TestSyncResult,
  SyncResult,
} from '@/types/googleSheets'

const API_BASE_URL =
  getApiUrl() || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

class GoogleSheetsApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'GoogleSheetsApiError'
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new GoogleSheetsApiError(
      errorData.error || `Request failed with status ${response.status}`,
      response.status,
      errorData,
    )
  }

  return response
}

// Organization-level Google Sheets OAuth endpoints
export const googleSheetsOauthApi = {
  getAuthUrl: async (
    organizationId: number,
    redirectUri?: string,
  ): Promise<{ auth_url: string }> => {
    const params = redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : ''
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/organizations/${organizationId}/google_sheets/auth_url${params}`,
    )
    return response.json()
  },

  callback: async (
    organizationId: number,
    code: string,
    redirectUri?: string,
  ): Promise<GoogleSheetsConnectionStatus & { message: string }> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/organizations/${organizationId}/google_sheets/callback`,
      {
        method: 'POST',
        body: JSON.stringify({ code, redirect_uri: redirectUri }),
      },
    )
    return response.json()
  },

  getStatus: async (organizationId: number): Promise<GoogleSheetsConnectionStatus> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/organizations/${organizationId}/google_sheets/status`,
    )
    return response.json()
  },

  disconnect: async (organizationId: number): Promise<{ message: string }> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/organizations/${organizationId}/google_sheets/disconnect`,
      {
        method: 'DELETE',
      },
    )
    return response.json()
  },

  getSheetMetadata: async (
    organizationId: number,
    sheetUrl?: string,
    sheetId?: string,
    tabName?: string,
  ): Promise<SheetMetadata> => {
    const params = new URLSearchParams()
    if (sheetUrl) params.set('sheet_url', sheetUrl)
    if (sheetId) params.set('sheet_id', sheetId)
    if (tabName) params.set('tab_name', tabName)

    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/organizations/${organizationId}/google_sheets/sheet_metadata?${params}`,
    )
    return response.json()
  },
}

// Event-level payment sync config endpoints
export const paymentSyncConfigApi = {
  get: async (eventSlug: string): Promise<PaymentSyncConfig> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_sync_config`,
    )
    return response.json()
  },

  create: async (
    eventSlug: string,
    data: CreatePaymentSyncConfigRequest,
  ): Promise<PaymentSyncConfig> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_sync_config`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    )
    return response.json()
  },

  update: async (
    eventSlug: string,
    data: UpdatePaymentSyncConfigRequest,
  ): Promise<PaymentSyncConfig> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_sync_config`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    )
    return response.json()
  },

  delete: async (eventSlug: string): Promise<{ message: string }> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_sync_config`,
      {
        method: 'DELETE',
      },
    )
    return response.json()
  },

  test: async (eventSlug: string, limit?: number): Promise<TestSyncResult> => {
    const params = limit ? `?limit=${limit}` : ''
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_sync_config/test${params}`,
      {
        method: 'POST',
      },
    )
    return response.json()
  },

  sync: async (eventSlug: string): Promise<SyncResult> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_sync_config/sync`,
      {
        method: 'POST',
      },
    )
    return response.json()
  },

  getSheetMetadata: async (
    eventSlug: string,
    sheetUrl?: string,
    sheetId?: string,
    tabName?: string,
  ): Promise<SheetMetadata> => {
    const params = new URLSearchParams()
    if (sheetUrl) params.set('sheet_url', sheetUrl)
    if (sheetId) params.set('sheet_id', sheetId)
    if (tabName) params.set('tab_name', tabName)

    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_sync_config/sheet_metadata?${params}`,
    )
    return response.json()
  },
}

// Payment sync error endpoints
export const paymentSyncErrorsApi = {
  list: async (eventSlug: string, resolved?: boolean): Promise<PaymentSyncError[]> => {
    const params = resolved !== undefined ? `?resolved=${resolved}` : ''
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_sync_errors${params}`,
    )
    return response.json()
  },

  resolve: async (
    eventSlug: string,
    errorId: number,
    registrationId: number,
  ): Promise<{ message: string; error: PaymentSyncError }> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_sync_errors/${errorId}/resolve`,
      {
        method: 'PATCH',
        body: JSON.stringify({ registration_id: registrationId }),
      },
    )
    return response.json()
  },

  dismiss: async (eventSlug: string, errorId: number): Promise<{ message: string }> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_sync_errors/${errorId}/dismiss`,
      {
        method: 'POST',
      },
    )
    return response.json()
  },

  resolveAll: async (eventSlug: string): Promise<{ message: string }> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_sync_errors/resolve_all`,
      {
        method: 'POST',
      },
    )
    return response.json()
  },
}

export { GoogleSheetsApiError }
