// API service for connecting to voxxy-presents-api backend
import { getApiUrl } from '@/config/environments'

const API_BASE_URL = getApiUrl() || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Token management for Rails JWT authentication
const TOKEN_KEY = 'railsAuthToken'

export function saveAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    console.error('Failed to save auth token:', error)
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error('Failed to get auth token:', error)
    return null
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (error) {
    console.error('Failed to clear auth token:', error)
  }
}

class ApiError extends Error {
  status: number
  errors?: string[]
  constructor(message: string, status: number, errors?: string[]) {
    super(message)
    this.status = status
    this.errors = errors
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  }

  // Add admin key for admin endpoints
  if (endpoint.startsWith('/admin/')) {
    const adminKey = import.meta.env.VITE_ADMIN_API_KEY
    if (!adminKey) {
      throw new Error('VITE_ADMIN_API_KEY is not configured. Cannot access admin endpoints.')
    }
    headers['x-admin-key'] = adminKey
  }

  // Add Rails JWT token for authenticated endpoints (exclude public auth endpoints)
  const isPublicAuthEndpoint =
    (endpoint.startsWith('/v1/shared/login') && options?.method === 'POST') ||
    (endpoint.startsWith('/v1/shared/users') && options?.method === 'POST') ||
    endpoint.startsWith('/v1/shared/password_reset')

  if (!isPublicAuthEndpoint) {
    const token = getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
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
        message: errorData.message || errorData.error,
        errors: errorData.errors
      })

      const errorMessage = errorData.message || errorData.error || `API request failed (${response.status})`
      throw new ApiError(errorMessage, response.status, errorData.errors)
    }

    const data = await response.json()
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

// Authentication API (Rails JWT)
export const authApi = {
  /**
   * Login with email and password
   * POST /login (legacy endpoint)
   */
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mobile-App': 'true', // Required to get JWT token from Rails
      },
      body: JSON.stringify({
        email,
        password,
        product: 'presents', // Important: specify product context
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Login failed',
        response.status,
        data.errors
      )
    }

    // Validate response
    if (!data.token || !data.id) {
      throw new ApiError('Invalid response from server', 500)
    }

    // Save token
    saveAuthToken(data.token)

    return data
  },

  /**
   * Sign up new user
   * POST /users (legacy endpoint until v1/shared controllers are created)
   *
   * If user already exists (e.g., from Mobile app), attempt to login instead
   */
  async signup(data: {
    email: string
    password: string
    name: string
    role?: 'consumer' | 'vendor' | 'venue_owner' | 'producer'
  }) {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          email: data.email,
          password: data.password,
          password_confirmation: data.password,
          name: data.name,
          role: data.role || 'consumer',
          product_context: 'presents',
        },
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      // Check if user already exists (from Mobile app or previous signup)
      if (response.status === 422 && responseData.errors?.includes('Email has already been taken')) {
        // User exists - try to login with provided credentials
        try {
          console.log('Email already registered. Attempting login...')
          const loginResponse = await this.login(data.email, data.password)

          // TODO: Update product_context to 'both' if needed
          // This should be handled by the backend when user logs in from different product

          return loginResponse
        } catch (loginError) {
          // Login failed - wrong password or other issue
          throw new ApiError(
            'An account with this email already exists. Please login instead or reset your password.',
            401,
            ['Email has already been taken']
          )
        }
      }

      throw new ApiError(
        responseData.error || 'Signup failed',
        response.status,
        responseData.errors
      )
    }

    // Signup successful - now login to get token
    const loginResponse = await this.login(data.email, data.password)
    return loginResponse
  },

  /**
   * Logout current user
   * DELETE /logout (legacy endpoint)
   */
  async logout() {
    try {
      // Use legacy endpoint since v1/shared/logout controller doesn't exist yet
      await fetch(`${API_BASE_URL.replace('/api', '')}/logout`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
      })
    } finally {
      // Always clear token even if request fails
      clearAuthToken()
    }
  },

  /**
   * Get current user profile
   * GET /me (legacy endpoint until v1/shared controllers are created)
   */
  async getCurrentUser() {
    // Note: Using legacy /me endpoint since /v1/shared/me controller doesn't exist yet
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    })

    if (!response.ok) {
      throw new ApiError(`Failed to get current user: ${response.statusText}`, response.status)
    }

    const data = await response.json()
    return data
  },

  /**
   * Update user profile
   * PATCH /v1/shared/users/:id
   */
  async updateUser(userId: number, updates: any) {
    return fetchApi<any>(`/v1/shared/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ user: updates }),
    })
  },

  /**
   * Request password reset
   * POST /password_reset (legacy endpoint)
   */
  async requestPasswordReset(email: string) {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/password_reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password_reset: { email } }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Failed to send password reset email',
        response.status,
        data.errors
      )
    }

    return data
  },

  /**
   * Reset password with token
   * PATCH /password_reset (legacy endpoint)
   */
  async resetPasswordWithToken(token: string, password: string) {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/password_reset`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Failed to reset password',
        response.status,
        data.errors
      )
    }

    return data
  },

  /**
   * Verify email with code
   * POST /verify_code
   */
  async verifyEmailCode(code: string) {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/verify_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: code.trim() }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Verification failed',
        response.status,
        data.errors
      )
    }

    return data
  },

  /**
   * Resend verification email
   * POST /resend_verification
   */
  async resendVerificationEmail(email: string) {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/resend_verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Failed to resend verification email',
        response.status,
        data.errors
      )
    }

    return data
  },
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
    // Delegate to authApi for consistency
    return authApi.getCurrentUser()
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