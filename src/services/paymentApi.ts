// Payment integration API service
import { getApiUrl } from '@/config/environments'
import { getAuthToken } from './api'
import type {
  EventbriteConnectionRequest,
  EventbriteConnectionResponse,
  EventbriteStatusResponse,
  EventbriteEventsResponse,
  PaymentIntegration,
  CreatePaymentIntegrationRequest,
  UpdatePaymentIntegrationRequest,
  SyncPaymentIntegrationResponse,
  PaymentTransaction,
  MatchTransactionRequest,
} from '@/types/payment'

const API_BASE_URL = getApiUrl() || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

class PaymentApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
  ) {
    super(message)
    this.name = 'PaymentApiError'
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
    throw new PaymentApiError(
      errorData.error || `Request failed with status ${response.status}`,
      response.status,
      errorData,
    )
  }

  return response
}

// Organization-level Eventbrite integration endpoints
export const organizationIntegrationsApi = {
  // Connect Eventbrite account
  connectEventbrite: async (
    organizationId: number,
    data: EventbriteConnectionRequest,
  ): Promise<EventbriteConnectionResponse> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/organizations/${organizationId}/integrations/eventbrite/connect`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    )
    return response.json()
  },

  // Disconnect Eventbrite account
  disconnectEventbrite: async (organizationId: number): Promise<{ message: string }> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/organizations/${organizationId}/integrations/eventbrite/disconnect`,
      {
        method: 'DELETE',
      },
    )
    return response.json()
  },

  // Check Eventbrite connection status
  getEventbriteStatus: async (organizationId: number): Promise<EventbriteStatusResponse> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/organizations/${organizationId}/integrations/eventbrite/status`,
    )
    return response.json()
  },

  // Get list of Eventbrite events for this organization
  getEventbriteEvents: async (organizationId: number): Promise<EventbriteEventsResponse> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/organizations/${organizationId}/integrations/eventbrite/events`,
    )
    return response.json()
  },
}

// Event-level payment integration endpoints
export const paymentIntegrationsApi = {
  // Get all payment integrations for an event
  getByEvent: async (eventSlug: string): Promise<PaymentIntegration[]> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_integrations`,
    )
    return response.json()
  },

  // Create a new payment integration
  create: async (
    eventSlug: string,
    data: CreatePaymentIntegrationRequest,
  ): Promise<PaymentIntegration> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_integrations`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    )
    return response.json()
  },

  // Update payment integration
  update: async (
    eventSlug: string,
    integrationId: number,
    data: UpdatePaymentIntegrationRequest,
  ): Promise<PaymentIntegration> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_integrations/${integrationId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    )
    return response.json()
  },

  // Delete payment integration
  delete: async (eventSlug: string, integrationId: number): Promise<void> => {
    await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_integrations/${integrationId}`,
      {
        method: 'DELETE',
      },
    )
  },

  // Manually trigger sync
  sync: async (
    eventSlug: string,
    integrationId: number,
  ): Promise<SyncPaymentIntegrationResponse> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_integrations/${integrationId}/sync`,
      {
        method: 'POST',
      },
    )
    return response.json()
  },
}

// Payment transactions endpoints
export const paymentTransactionsApi = {
  // Get all transactions for an event
  getByEvent: async (eventSlug: string): Promise<PaymentTransaction[]> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_transactions`,
    )
    const data = await response.json()
    // Backend returns { transactions: [...] }, extract the array
    return data.transactions || data
  },

  // Get single transaction
  get: async (eventSlug: string, transactionId: number): Promise<PaymentTransaction> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_transactions/${transactionId}`,
    )
    return response.json()
  },

  // Manually match transaction to vendor contact/registration
  match: async (
    eventSlug: string,
    transactionId: number,
    data: MatchTransactionRequest,
  ): Promise<PaymentTransaction> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/v1/presents/events/${eventSlug}/payment_transactions/${transactionId}/match`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    )
    return response.json()
  },
}

export { PaymentApiError }
