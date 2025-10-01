// API service for connecting to voxxy-presents-api backend
import { getApiUrl } from '@/config/environments'

const API_BASE_URL = getApiUrl() || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'


class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // Add admin key for admin endpoints
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  }

  // Add admin key for admin endpoints
  if (endpoint.startsWith('/admin/')) {
    headers['x-admin-key'] = import.meta.env.VITE_ADMIN_API_KEY || 'voxxy-admin-2024'
  }

  // Add Firebase auth token for authenticated endpoints
  if (endpoint.startsWith('/users/')) {
    try {
      const { auth } = await import('@/lib/firebase')
      const currentUser = auth.currentUser
      if (currentUser) {
        const idToken = await currentUser.getIdToken()
        headers['Authorization'] = `Bearer ${idToken}`
        console.log('🔐 Added Firebase auth token to API request')
      } else {
        console.warn('⚠️ No authenticated user for API request')
      }
    } catch (error) {
      console.error('❌ Failed to get Firebase auth token:', error)
    }
  }

  // Debug logging
  console.log(`🌐 API DEBUG: ${options?.method || 'GET'} ${url}`)
  if (options?.body) {
    console.log(`📦 API DEBUG: Request body:`, JSON.parse(options.body as string))
  }

  try {
    const response = await fetch(url, {
      headers,
      ...options,
    })

    if (!response.ok) {
      let errorData: any = {}
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` }
      }
      
      console.error('API Error:', {
        url,
        status: response.status,
        message: errorData.message || errorData.error
      })
      
      const errorMessage = errorData.message || errorData.error || `API request failed (${response.status})`
      throw new ApiError(errorMessage, response.status)
    }

    const data = await response.json()
    console.log(`✅ API DEBUG: ${options?.method || 'GET'} ${url} - Success:`, data)
    return data
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    console.error('Network Error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`, 0)
  }
}

// Organizations API
export const organizationsApi = {
  async getBySlug(slug: string) {
    return fetchApi<any>(`/organizations/${slug}`)
  },

  async create(data: any) {
    return fetchApi<any>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return fetchApi<any>(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async updateBySlug(slug: string, data: any) {
    return fetchApi<any>(`/organizations/slug/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return fetchApi<any>(`/organizations/${id}`, {
      method: 'DELETE',
    })
  },

  async deleteBySlug(slug: string) {
    return fetchApi<any>(`/organizations/slug/${slug}`, {
      method: 'DELETE',
    })
  },
}

// Events API
export const eventsApi = {
  async getById(id: string) {
    return fetchApi<any>(`/events/${id}`)
  },

  async getByOrganization(organizationId: string) {
    return fetchApi<any[]>(`/events?organization=${organizationId}`)
  },

  async getAll() {
    return fetchApi<any[]>('/events')
  },

  async create(data: any) {
    return fetchApi<any>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: any) {
    return fetchApi<any>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return fetchApi<any>(`/events/${id}`, {
      method: 'DELETE',
    })
  },
}

// Registrations API
export const registrationsApi = {
  async create(data: {
    eventId: string
    organizationId?: string
    name: string
    email?: string
    registrationType: 'rsvp_yes' | 'rsvp_maybe' | 'subscription'
    phone?: string
    notes?: string
    subscribeToUpdates?: boolean
    subscribeToNewsletter?: boolean
    source?: 'website' | 'manual'
  }) {
    return fetchApi<any>('/registrations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getByEvent(eventId: string) {
    return fetchApi<any>(`/registrations/event/${eventId}`)
  },

  async markEmailSent(registrationId: string) {
    return fetchApi<any>(`/registrations/${registrationId}/email-sent`, {
      method: 'PATCH',
    })
  },
}

// Email API endpoints
export const emailApi = {
  async submitContactForm(data: {
    type: 'beta_request' | 'newsletter_signup' | 'general_contact'
    name: string
    email: string
    organizationName?: string
    description?: string
    source: 'contact_page' | 'organization_page' | 'event_page'
  }) {
    return fetchApi<any>('/email/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getContactSubmissions() {
    return fetchApi<any[]>('/email/contact')
  },

  async sendEmail(data: {
    to: string[]
    subject: string
    htmlContent?: string
    textContent?: string
    templateId?: string
    templateData?: Record<string, any>
  }) {
    return fetchApi<any>('/email/send', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getEmailTemplates() {
    return fetchApi<any[]>('/email/templates')
  },

  async getEmailThreads(organizationId?: string) {
    const endpoint = organizationId ? `/email/threads?organization=${organizationId}` : '/email/threads'
    return fetchApi<any[]>(endpoint)
  }
}

// Venues API
export const venuesApi = {
  async create(data: any) {
    return fetchApi<any>('/venues', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getAll(params?: {
    location?: string
    capacity_min?: number
    capacity_max?: number
    pricing_type?: string
    venue_type?: string
    claim_status?: string
    limit?: number
    offset?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    return fetchApi<any>(`/venues?${queryParams}`)
  },

  async getBySlug(slug: string) {
    return fetchApi<any>(`/venues/${slug}`)
  },

  async getById(id: string) {
    return fetchApi<any>(`/venues/by-id/${id}`)
  },
  async getByOwner(ownerId: string) {
    return fetchApi<any>(`/venues/by-owner/${ownerId}`)
  },

  async update(id: string, data: any) {
    return fetchApi<any>(`/venues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return fetchApi<any>(`/venues/${id}`, {
      method: 'DELETE',
    })
  },

  async contact(id: string, data: {
    fromName: string
    fromEmail: string
    eventDate?: string
    attendeeCount?: number
    eventType?: string
    message: string
  }) {
    return fetchApi<any>(`/venues/${id}/contact`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// Users API
export const usersApi = {
  async getCurrentUser() {
    return fetchApi<any>('/users/me')
  }
}

// Admin API
export const adminApi = {
  async getAllUsers() {
    return fetchApi<any[]>('/admin/users')
  },

  async updateUserBetaStatus(userId: string, status: 'approved' | 'denied', notes?: string) {
    return fetchApi<any>(`/admin/users/${userId}/beta-status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    })
  },

  async approveAllBetaUsers() {
    return fetchApi<any>('/admin/approve-all-beta-users', {
      method: 'POST',
    })
  },

  // Venue approval endpoints
  async approveVenue(venueId: string, adminNotes?: string) {
    return fetchApi<any>(`/admin/venues/${venueId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ adminNotes }),
    })
  },

  async rejectVenue(venueId: string, reason: string, adminNotes?: string) {
    return fetchApi<any>(`/admin/venues/${venueId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason, adminNotes }),
    })
  }
}

// Budget API
export const budgetsApi = {
  // Get budget for event
  async getEventBudget(eventId: string) {
    return fetchApi<{
      success: boolean
      budget: any
      lineItems: any[]
    }>(`/events/${eventId}/budget`)
  },

  // Create budget for event
  async createEventBudget(eventId: string, data: any) {
    return fetchApi<{
      success: boolean
      budget: any
    }>(`/events/${eventId}/budget`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update budget
  async updateBudget(budgetId: string, data: any) {
    return fetchApi<{
      success: boolean
      budget: any
    }>(`/budgets/${budgetId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete budget
  async deleteBudget(budgetId: string) {
    return fetchApi<{
      success: boolean
      message: string
    }>(`/budgets/${budgetId}`, {
      method: 'DELETE',
    })
  },

  // Get budget summary
  async getBudgetSummary(budgetId: string) {
    return fetchApi<{
      success: boolean
      summary: any
    }>(`/budgets/${budgetId}/summary`)
  },

  // Get line items for budget
  async getLineItems(budgetId: string) {
    return fetchApi<{
      success: boolean
      lineItems: any[]
    }>(`/budgets/${budgetId}/line-items`)
  },

  // Add line item to budget
  async addLineItem(budgetId: string, data: any) {
    return fetchApi<{
      success: boolean
      lineItem: any
    }>(`/budgets/${budgetId}/line-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update line item
  async updateLineItem(lineItemId: string, data: any) {
    return fetchApi<{
      success: boolean
      lineItem: any
    }>(`/line-items/${lineItemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete line item
  async deleteLineItem(lineItemId: string) {
    return fetchApi<{
      success: boolean
      message: string
    }>(`/line-items/${lineItemId}`, {
      method: 'DELETE',
    })
  }
}

export { ApiError }