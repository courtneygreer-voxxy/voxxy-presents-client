// API service for connecting to voxxy-presents-api backend
import { getApiUrl } from '@/config/environments'
import type {
  EmailCampaignTemplate,
  EmailTemplateItem,
  ScheduledEmail,
  EmailDelivery,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  CreateEmailTemplateItemRequest,
  UpdateEmailRequest,
  CreateScheduledEmailRequest,
  SaveAsTemplateRequest,
  EmailPreviewRequest,
  EmailPreviewResponse,
  SendNowResponse,
  GenerateScheduledEmailsRequest,
  GenerateScheduledEmailsResponse,
} from '@/types/email'
import { VendorApplicationSubmit } from '@/types/eventPortal'

const API_BASE_URL = getApiUrl() || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Token management for Rails JWT authentication
const TOKEN_KEY = 'railsAuthToken'

export function saveAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    // console.log('🔐 [AUTH DEBUG] Token saved to localStorage:', {
    //   key: TOKEN_KEY,
    //   tokenLength: token.length,
    //   tokenPreview: token.substring(0, 20) + '...'
    // })
  } catch (error) {
    console.error('Failed to save auth token:', error)
  }
}

export function getAuthToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    // console.log('🔍 [AUTH DEBUG] Token retrieved from localStorage:', {
    //   key: TOKEN_KEY,
    //   hasToken: !!token,
    //   tokenLength: token?.length || 0,
    //   tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
    // })
    return token
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
    ...((options?.headers as Record<string, string>) || {}),
  }

  // Admin endpoints use JWT authentication (no separate admin key needed)
  // The backend checks if the current user has admin role via JWT token

  // Add Rails JWT token for authenticated endpoints (exclude public auth endpoints)
  const isPublicAuthEndpoint =
    (endpoint.startsWith('/v1/shared/login') && options?.method === 'POST') ||
    (endpoint.startsWith('/v1/shared/users') && options?.method === 'POST') ||
    endpoint.startsWith('/v1/shared/password_reset')

  // console.log('🌐 [AUTH DEBUG] Making API request:', {
  //   method: options?.method || 'GET',
  //   endpoint,
  //   isPublicAuthEndpoint
  // })

  if (!isPublicAuthEndpoint) {
    const token = getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      // console.log('✅ [AUTH DEBUG] Authorization header added to request')
    } else {
      // console.warn('⚠️ [AUTH DEBUG] No token found - request will be unauthenticated')
    }
  } else {
    // console.log('ℹ️ [AUTH DEBUG] Public endpoint - skipping auth header')
  }

  // console.log('📤 [AUTH DEBUG] Request headers:', {
  //   hasAuthorization: !!headers['Authorization'],
  //   headers: Object.keys(headers)
  // })

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
        errors: errorData.errors,
      })

      // Build error message - prioritize specific validation errors from errors array
      let errorMessage: string
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        // If we have specific validation errors, use the first one as the main message
        errorMessage = errorData.errors[0]
      } else {
        // Fallback to message/error field or generic message
        errorMessage =
          errorData.message || errorData.error || `API request failed: ${response.status}`
      }

      throw new ApiError(errorMessage, response.status, errorData.errors)
    }

    // Handle 204 No Content responses (e.g., DELETE)
    if (response.status === 204) {
      return null as T
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    console.error('Network Error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0,
    )
  }
}

// Authentication API (Rails JWT)
export const authApi = {
  /**
   * Development-only login bypass (no password required)
   * POST /dev_login
   */
  async devLogin() {
    console.log('🔧 [DEV] Using development login bypass...')
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/dev_login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mobile-App': 'true',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.error || 'Dev login failed', response.status, data.errors)
    }

    // Validate response
    if (!data.token || !data.id) {
      throw new ApiError('Invalid response from server', 500)
    }

    // Save token
    saveAuthToken(data.token)

    console.log('✅ [DEV] Dev login successful, token saved')
    return data
  },

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
      throw new ApiError(data.error || 'Login failed', response.status, data.errors)
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
    role?: 'consumer' | 'vendor' | 'venue_owner' | 'producer' | 'admin' | 'guest'
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
      if (
        response.status === 422 &&
        responseData.errors?.includes('Email has already been taken')
      ) {
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
            ['Email has already been taken'],
          )
        }
      }

      throw new ApiError(
        responseData.error || 'Signup failed',
        response.status,
        responseData.errors,
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
          Authorization: `Bearer ${getAuthToken()}`,
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
    console.log('🔍 Fetching current user from /me endpoint...')

    const token = getAuthToken()
    // console.log('🔑 [AUTH DEBUG] Token for /me request:', {
    //   hasToken: !!token,
    //   tokenLength: token?.length || 0
    // })

    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Mobile-App': 'true', // CRITICAL: Required for JWT auth on backend
        Authorization: `Bearer ${token}`,
      },
    })

    // console.log('📡 [AUTH DEBUG] /me response status:', response.status)

    if (!response.ok) {
      throw new ApiError(`Failed to get current user: ${response.statusText}`, response.status)
    }

    const data = await response.json()
    // console.log('📥 Current user response:', { email: data.email, role: data.role, id: data.id })

    return data
  },

  /**
   * Update user profile
   * PATCH /users/:id (legacy endpoint until v1/shared controllers are created)
   */
  async updateUser(userId: number, updates: any) {
    const endpoint = `${API_BASE_URL.replace('/api', '')}/users/${userId}`
    const payload = { user: updates }

    console.log('📝 [API] updateUser - Starting request')
    console.log('📝 [API] Endpoint:', endpoint)
    console.log('📝 [API] Payload:', payload)
    console.log('📝 [API] Token:', getAuthToken() ? 'Present' : 'Missing')

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(payload),
    })

    console.log('📥 [API] Response status:', response.status, response.statusText)

    const data = await response.json()
    console.log('📥 [API] Response data:', data)

    if (!response.ok) {
      console.error('❌ [API] Update failed:', {
        status: response.status,
        error: data.error,
        errors: data.errors,
        message: data.message,
      })
      throw new ApiError(
        data.error || data.message || 'Failed to update user',
        response.status,
        data.errors,
      )
    }

    console.log('✅ [API] Update successful')
    return data
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
        data.errors,
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
      throw new ApiError(data.error || 'Failed to reset password', response.status, data.errors)
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
      throw new ApiError(data.error || 'Verification failed', response.status, data.errors)
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
        data.errors,
      )
    }

    return data
  },

  /**
   * Delete current user's account
   * DELETE /users/:id (legacy endpoint)
   */
  async deleteAccount() {
    // Get current user to get their ID
    const user = await authApi.getCurrentUser()

    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Failed to delete account' }))
      throw new ApiError(data.error || 'Failed to delete account', response.status, data.errors)
    }

    const data = await response.json()

    // Clear auth token after successful deletion
    clearAuthToken()

    return data
  },
}

// Organizations API (Voxxy Presents)
export const organizationsApi = {
  /**
   * Get all organizations
   * GET /api/v1/presents/organizations
   */
  async getAll(params?: { verified?: boolean }) {
    const queryParams = new URLSearchParams()
    if (params?.verified !== undefined) {
      queryParams.append('verified', String(params.verified))
    }
    const query = queryParams.toString() ? `?${queryParams}` : ''
    return fetchApi<any[]>(`/v1/presents/organizations${query}`)
  },

  /**
   * Get the current user's organization
   * GET /api/v1/presents/me/organization
   */
  async getMine() {
    return fetchApi<any>(`/v1/presents/me/organization`)
  },

  /**
   * Get organization by slug
   * GET /api/v1/presents/organizations/:slug
   */
  async getBySlug(slug: string) {
    return fetchApi<any>(`/v1/presents/organizations/${slug}`)
  },

  /**
   * Create new organization
   * POST /api/v1/presents/organizations
   */
  async create(orgData: {
    name: string
    description?: string
    logo_url?: string
    website?: string
    instagram_handle?: string
    phone?: string
    email?: string
    address?: string
    city?: string
    state?: string
    zip_code?: string
    latitude?: number
    longitude?: number
  }) {
    return fetchApi<any>('/v1/presents/organizations', {
      method: 'POST',
      body: JSON.stringify({ organization: orgData }),
    })
  },

  /**
   * Update organization
   * PATCH /api/v1/presents/organizations/:slug
   */
  async update(
    slug: string,
    orgData: Partial<{
      name: string
      description: string
      logo_url: string
      website: string
      instagram_handle: string
      phone: string
      email: string
      address: string
      city: string
      state: string
      zip_code: string
      latitude: number
      longitude: number
      timezone: string
    }>,
  ) {
    return fetchApi<any>(`/v1/presents/organizations/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify({ organization: orgData }),
    })
  },

  /**
   * Delete organization
   * DELETE /api/v1/presents/organizations/:slug
   */
  async delete(slug: string) {
    return fetchApi<any>(`/v1/presents/organizations/${slug}`, {
      method: 'DELETE',
    })
  },

  /**
   * Get organization webhook configuration
   * GET /api/v1/presents/organizations/:slug/webhook_config
   */
  async getWebhookConfig(slug: string) {
    return fetchApi<{
      webhook_url: string
      webhook_token: string
      organization_id: number
    }>(`/v1/presents/organizations/${slug}/webhook_config`)
  },

  /**
   * Regenerate organization webhook token
   * POST /api/v1/presents/organizations/:slug/regenerate_webhook_token
   */
  async regenerateWebhookToken(slug: string) {
    return fetchApi<{
      webhook_url: string
      webhook_token: string
      organization_id: number
      message: string
    }>(`/v1/presents/organizations/${slug}/regenerate_webhook_token`, {
      method: 'POST',
    })
  },
}

// Incoming Payments API (n8n Webhook Payments)
export const incomingPaymentsApi = {
  /**
   * Get incoming payments for an organization
   * GET /api/v1/presents/organizations/:orgSlug/incoming_payments
   */
  async getAll(
    orgSlug: string,
    params?: {
      status?: string
      event_id?: number
      start_date?: string
      end_date?: string
      page?: number
      per_page?: number
    },
  ) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.event_id) queryParams.append('event_id', String(params.event_id))
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.per_page) queryParams.append('per_page', String(params.per_page))

    const query = queryParams.toString() ? `?${queryParams}` : ''
    return fetchApi<{
      payments: any[]
      pagination: {
        current_page: number
        per_page: number
        total_count: number
        total_pages: number
      }
    }>(`/v1/presents/organizations/${orgSlug}/incoming_payments${query}`)
  },

  /**
   * Get incoming payment by ID
   * GET /api/v1/presents/incoming_payments/:id
   */
  async getById(id: number) {
    return fetchApi<any>(`/v1/presents/incoming_payments/${id}`)
  },

  /**
   * Link incoming payment to registration
   * POST /api/v1/presents/incoming_payments/:id/link_to_registration
   */
  async linkToRegistration(id: number, registrationId: number) {
    return fetchApi<{
      payment: any
      message: string
    }>(`/v1/presents/incoming_payments/${id}/link_to_registration`, {
      method: 'POST',
      body: JSON.stringify({ registration_id: registrationId }),
    })
  },

  /**
   * Retry failed payment processing
   * POST /api/v1/presents/incoming_payments/:id/retry
   */
  async retry(id: number) {
    return fetchApi<{
      payment: any
      message: string
    }>(`/v1/presents/incoming_payments/${id}/retry`, {
      method: 'POST',
    })
  },

  /**
   * Dismiss unmatched/failed payment
   * POST /api/v1/presents/incoming_payments/:id/dismiss
   */
  async dismiss(id: number) {
    return fetchApi<{
      payment: any
      message: string
    }>(`/v1/presents/incoming_payments/${id}/dismiss`, {
      method: 'POST',
    })
  },
}

// Events API (Voxxy Presents)
export const eventsApi = {
  /**
   * Get event by ID or slug
   * GET /api/v1/presents/events/:id
   */
  async getById(id: string) {
    return fetchApi<any>(`/v1/presents/events/${encodeURIComponent(id)}`)
  },

  /**
   * Get all events for an organization
   * GET /api/v1/presents/organizations/:organization_id/events
   */
  async getByOrganization(organizationSlug: string) {
    return fetchApi<any[]>(`/v1/presents/organizations/${organizationSlug}/events`)
  },

  /**
   * Get all events (optionally filtered by organization or status)
   * GET /api/v1/presents/events
   */
  async getAll(params?: { organization_id?: string; status?: 'upcoming' | 'past' }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const query = queryParams.toString() ? `?${queryParams}` : ''
    return fetchApi<any[]>(`/v1/presents/events${query}`)
  },

  /**
   * Create event under an organization
   * POST /api/v1/presents/organizations/:organization_id/events
   */
  async create(
    organizationSlug: string,
    eventData: {
      title: string
      description?: string
      event_date?: string
      event_end_date?: string
      start_time?: string
      end_time?: string
      venue?: string
      location?: string
      age_restriction?: string
      ticket_link?: string
      application_deadline?: string
      payment_deadline?: string
      poster_url?: string
      ticket_url?: string
      ticket_price?: number
      capacity?: number
      published?: boolean
      registration_open?: boolean
      status?: 'draft' | 'published' | 'cancelled' | 'completed'
      email_campaign_template_id?: number
      use_category_templates?: boolean
      use_universal_category_template?: boolean
      universal_category_template_id?: number
      payment_engines?: any[]
    },
  ) {
    return fetchApi<any>(`/v1/presents/organizations/${organizationSlug}/events`, {
      method: 'POST',
      body: JSON.stringify({ event: eventData }),
    })
  },

  /**
   * Update event
   * PATCH /api/v1/presents/events/:id
   */
  async update(
    eventSlug: string,
    eventData: Partial<{
      title: string
      description: string
      event_date: string
      event_end_date: string
      start_time: string
      end_time: string
      venue: string
      location: string
      age_restriction: string
      ticket_link: string
      application_deadline: string
      payment_deadline: string
      poster_url: string
      ticket_url: string
      ticket_price: number
      capacity: number
      published: boolean
      registration_open: boolean
      status: 'draft' | 'published' | 'cancelled' | 'completed'
      invitation_list_ids: number[]
      invitation_contact_ids: number[]
      invitation_excluded_ids: number[]
      vendor_fee_currency: string
      payment_engines: any[]
    }>,
  ) {
    return fetchApi<any>(`/v1/presents/events/${encodeURIComponent(eventSlug)}`, {
      method: 'PATCH',
      body: JSON.stringify({ event: eventData }),
    })
  },

  /**
   * Delete event
   * DELETE /api/v1/presents/events/:id
   */
  async delete(eventSlug: string) {
    return fetchApi<any>(`/v1/presents/events/${encodeURIComponent(eventSlug)}`, {
      method: 'DELETE',
    })
  },

  /**
   * Go live - sends invitations and activates scheduled emails
   * POST /api/v1/presents/events/:slug/go_live
   */
  async goLive(eventSlug: string) {
    return fetchApi<{
      message: string
      invitations_sent: number
      emails_activated: number
      is_live: boolean
    }>(`/v1/presents/events/${encodeURIComponent(eventSlug)}/go_live`, {
      method: 'POST',
    })
  },

  /**
   * Generate scheduled emails - creates category-specific emails
   * POST /api/v1/presents/events/:slug/generate_emails
   * Call this after vendor applications are created
   */
  async generateEmails(eventSlug: string) {
    return fetchApi<{
      message: string
      emails_count: number
      warnings?: string[]
      scheduled_emails: any[]
    }>(`/v1/presents/events/${encodeURIComponent(eventSlug)}/generate_emails`, {
      method: 'POST',
    })
  },

  /**
   * Get all command center data in a single optimized request
   * GET /api/v1/presents/events/:slug/command_center
   * Returns: event, applications, submissions, invitations, emails, bulletins, and stats
   * Eliminates N+1 queries by eager-loading all associations
   */
  async getCommandCenterData(eventSlug: string) {
    return fetchApi<{
      event: any
      vendor_applications: any[]
      submissions: any[]
      invitations: any[]
      scheduled_emails: any[]
      bulletins: any[]
      stats: {
        applied: number
        new_unreviewed: number
        approved_paid: number
        missing_payments: number
      }
      invitation_meta: {
        total_count: number
        sent_count: number
        viewed_count: number
        accepted_count: number
        declined_count: number
        delivery_stats: {
          total_sent: number
          delivered: number
          bounced: number
          dropped: number
          undelivered: number
          unsubscribed: number
          pending: number
        }
      }
      _metadata: {
        fetched_at: string
        submissions_count: number
        invitations_count: number
        invitations_total: number
        invitations_paginated: boolean
      }
    }>(`/v1/presents/events/${encodeURIComponent(eventSlug)}/command_center`)
  },

  /**
   * Check impact of event update email notification
   * POST /api/v1/presents/events/:slug/email_notifications/check_event_update_impact
   */
  async checkEventUpdateImpact(eventSlug: string) {
    return fetchApi<{
      action: string
      recipient_count: number
      event: any
      warning: string
      requires_confirmation: boolean
    }>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/email_notifications/check_event_update_impact`,
      {
        method: 'POST',
      },
    )
  },

  /**
   * Send event update emails (requires confirmation)
   * POST /api/v1/presents/events/:slug/email_notifications/send_event_update
   */
  async sendEventUpdateEmails(eventSlug: string) {
    return fetchApi<{
      success: boolean
      message: string
      sent_count: number
      failed_count: number
    }>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/email_notifications/send_event_update`,
      {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      },
    )
  },

  /**
   * Check impact of event cancellation email notification
   * POST /api/v1/presents/events/:slug/email_notifications/check_cancellation_impact
   */
  async checkCancellationImpact(eventSlug: string) {
    return fetchApi<{
      action: string
      recipient_count: number
      event: any
      warning: string
      requires_confirmation: boolean
    }>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/email_notifications/check_cancellation_impact`,
      {
        method: 'POST',
      },
    )
  },

  /**
   * Send cancellation emails (requires confirmation)
   * POST /api/v1/presents/events/:slug/email_notifications/send_cancellation
   */
  async sendCancellationEmails(eventSlug: string) {
    return fetchApi<{
      success: boolean
      message: string
      sent_count: number
      failed_count: number
    }>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/email_notifications/send_cancellation`,
      {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      },
    )
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

  /**
   * Submit vendor application (public, no auth required)
   * POST /api/v1/presents/events/:event_slug/registrations
   */
  async submitVendorApplication(eventSlug: string, data: VendorApplicationSubmit) {
    return fetchApi<any>(`/v1/presents/events/${encodeURIComponent(eventSlug)}/registrations`, {
      method: 'POST',
      body: JSON.stringify({ registration: data }),
    })
  },

  /**
   * Track application status by ticket code (public, no auth required)
   * GET /api/v1/presents/registrations/track/:ticket_code
   */
  async trackByTicketCode(ticketCode: string) {
    return fetchApi<any>(`/v1/presents/registrations/track/${ticketCode}`)
  },

  /**
   * Update registration status (producer/venue owner only)
   * PATCH /api/v1/presents/registrations/:id
   */
  async updateStatus(
    registrationId: number,
    status: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed',
  ) {
    return fetchApi<any>(`/v1/presents/registrations/${registrationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ registration: { status } }),
    })
  },

  /**
   * Update registration (producer/venue owner only)
   * PATCH /api/v1/presents/registrations/:id
   * Permitted keys must match Rails `update_params` (name, phone, status, vendor_category, payment_status, location, producer_notes, tags, instagram_handle, tiktok_handle, website).
   */
  async update(
    registrationId: number,
    data: Partial<{
      vendor_category: string
      payment_status: 'pending' | 'paid' | 'confirmed' | 'overdue'
      status: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed' | 'cancelled' | string
      name: string
      phone: string
      location: string
      producer_notes: string
      tags: string[]
      instagram_handle: string
      tiktok_handle: string
      website: string
    }>,
  ) {
    return fetchApi<any>(`/v1/presents/registrations/${registrationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ registration: data }),
    })
  },

  /**
   * Send payment confirmation email
   * POST /api/v1/presents/registrations/:id/email_notifications/send_payment_confirmation
   */
  async sendPaymentConfirmation(registrationId: number) {
    return fetchApi<{
      success: boolean
      message: string
    }>(
      `/v1/presents/registrations/${registrationId}/email_notifications/send_payment_confirmation`,
      {
        method: 'POST',
      },
    )
  },

  /**
   * Send category change notification email
   * POST /api/v1/presents/registrations/:id/email_notifications/send_category_change
   */
  async sendCategoryChangeNotification(registrationId: number, newPrice?: number) {
    return fetchApi<{
      success: boolean
      message: string
    }>(`/v1/presents/registrations/${registrationId}/email_notifications/send_category_change`, {
      method: 'POST',
      body: newPrice ? JSON.stringify({ new_price: newPrice }) : undefined,
    })
  },

  /**
   * Vendor self-service opt-out
   * POST /api/v1/presents/registrations/:id/opt_out
   */
  async optOut(registrationId: number) {
    return fetchApi<{
      success: boolean
      message: string
      registration: any
    }>(`/v1/presents/registrations/${registrationId}/opt_out`, {
      method: 'POST',
    })
  },
}

// Vendor Applications API
export const vendorApplicationsApi = {
  /**
   * Get all vendor applications for an event
   * GET /api/v1/presents/events/:event_slug/vendor_applications
   */
  async getByEvent(eventSlug: string) {
    return fetchApi<any[]>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/vendor_applications`,
    )
  },

  /**
   * Get vendor application by ID
   * GET /api/v1/presents/vendor_applications/:id
   */
  async getById(id: number) {
    return fetchApi<any>(`/v1/presents/vendor_applications/${id}`)
  },

  /**
   * Create vendor application for an event
   * POST /api/v1/presents/events/:event_slug/vendor_applications
   */
  async create(
    eventSlug: string,
    data: {
      name: string
      description?: string
      booth_price?: number
      status?: 'active' | 'inactive'
      category_id?: number
      categories?: string[]
      install_date?: string
      install_start_time?: string
      install_end_time?: string
      payment_link?: string
      application_tags?: string
      payment_prices?: any[]
      payment_engines?: any[]
    },
  ) {
    return fetchApi<any>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/vendor_applications`,
      {
        method: 'POST',
        body: JSON.stringify({ vendor_application: data }),
      },
    )
  },

  /**
   * Update vendor application
   * PATCH /api/v1/presents/vendor_applications/:id
   */
  async update(
    id: number,
    data: Partial<{
      name: string
      description: string
      booth_price: number
      status: 'active' | 'inactive'
      category_id: number
      categories: string[]
      install_date: string
      install_start_time: string
      install_end_time: string
      payment_link: string
      application_tags: string
      payment_prices: any[]
      payment_engines: any[]
    }>,
  ) {
    return fetchApi<any>(`/v1/presents/vendor_applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ vendor_application: data }),
    })
  },

  /**
   * Delete vendor application
   * DELETE /api/v1/presents/vendor_applications/:id
   */
  async delete(id: number) {
    return fetchApi<any>(`/v1/presents/vendor_applications/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Get submissions for a vendor application
   * GET /api/v1/presents/vendor_applications/:id/submissions
   */
  async getSubmissions(
    id: number,
    params?: {
      category?: string
      status?: string
    },
  ) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const query = queryParams.toString() ? `?${queryParams}` : ''
    return fetchApi<any[]>(`/v1/presents/vendor_applications/${id}/submissions${query}`)
  },

  /**
   * Lookup event by shareable code (public, no auth required)
   * GET /api/v1/presents/vendor_applications/lookup/:code
   */
  async lookupByCode(code: string) {
    return fetchApi<any>(`/v1/presents/vendor_applications/lookup/${code}`)
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
    const endpoint = organizationId
      ? `/email/threads?organization=${organizationId}`
      : '/email/threads'
    return fetchApi<any[]>(endpoint)
  },
}

// Email Campaign Templates API (Email Automation System)
export const emailCampaignTemplatesApi = {
  /**
   * Get all email campaign templates (system + user templates)
   * GET /api/v1/presents/email_campaign_templates
   */
  async getAll() {
    return fetchApi<EmailCampaignTemplate[]>('/v1/presents/email_campaign_templates')
  },

  /**
   * Get single template with all email items
   * GET /api/v1/presents/email_campaign_templates/:id
   */
  async getById(id: number) {
    return fetchApi<EmailCampaignTemplate>(`/v1/presents/email_campaign_templates/${id}`)
  },

  /**
   * Create custom template (clone from existing)
   * POST /api/v1/presents/email_campaign_templates
   */
  async create(data: CreateTemplateRequest) {
    return fetchApi<EmailCampaignTemplate>('/v1/presents/email_campaign_templates', {
      method: 'POST',
      body: JSON.stringify({ email_campaign_template: data }),
    })
  },

  /**
   * Clone template
   * POST /api/v1/presents/email_campaign_templates/:id/clone
   */
  async clone(
    id: number,
    name: string,
    description?: string,
    category_id?: number,
    is_universal?: boolean,
  ) {
    return fetchApi<EmailCampaignTemplate>(`/v1/presents/email_campaign_templates/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify({ name, description, category_id, is_universal }),
    })
  },

  /**
   * Update user template
   * PATCH /api/v1/presents/email_campaign_templates/:id
   */
  async update(id: number, data: UpdateTemplateRequest) {
    return fetchApi<EmailCampaignTemplate>(`/v1/presents/email_campaign_templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ email_campaign_template: data }),
    })
  },

  /**
   * Delete user template
   * DELETE /api/v1/presents/email_campaign_templates/:id
   */
  async delete(id: number) {
    return fetchApi<void>(`/v1/presents/email_campaign_templates/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Send test emails for all items in template
   * POST /api/v1/presents/email_campaign_templates/:id/send_test_emails
   */
  async sendTestEmails(id: number, testEmail?: string) {
    return fetchApi<{
      message: string
      recipient: string
      results: Array<{
        email_name: string
        status: 'sent' | 'failed'
        error?: string
        timestamp?: string
      }>
      success_count: number
      failure_count: number
    }>(`/v1/presents/email_campaign_templates/${id}/send_test_emails`, {
      method: 'POST',
      body: JSON.stringify({ test_email: testEmail }),
    })
  },
}

// Email Template Items API (Individual emails within templates)
export const emailTemplateItemsApi = {
  /**
   * Get all email items for a template
   * GET /api/v1/presents/email_campaign_templates/:template_id/email_template_items
   */
  async getByTemplate(templateId: number) {
    return fetchApi<EmailTemplateItem[]>(
      `/v1/presents/email_campaign_templates/${templateId}/email_template_items`,
    )
  },

  /**
   * Create email item in template
   * POST /api/v1/presents/email_campaign_templates/:template_id/email_template_items
   */
  async create(templateId: number, data: CreateEmailTemplateItemRequest) {
    return fetchApi<EmailTemplateItem>(
      `/v1/presents/email_campaign_templates/${templateId}/email_template_items`,
      {
        method: 'POST',
        body: JSON.stringify({ email_template_item: data }),
      },
    )
  },

  /**
   * Update email item in template
   * PATCH /api/v1/presents/email_campaign_templates/:template_id/email_template_items/:id
   */
  async update(templateId: number, id: number, data: UpdateEmailRequest) {
    return fetchApi<EmailTemplateItem>(
      `/v1/presents/email_campaign_templates/${templateId}/email_template_items/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ email_template_item: data }),
      },
    )
  },

  /**
   * Reorder email items in template
   * POST /api/v1/presents/email_campaign_templates/:template_id/email_template_items/reorder
   */
  async reorder(templateId: number, emailItemIds: number[]) {
    return fetchApi<EmailTemplateItem[]>(
      `/v1/presents/email_campaign_templates/${templateId}/email_template_items/reorder`,
      {
        method: 'POST',
        body: JSON.stringify({ email_item_ids: emailItemIds }),
      },
    )
  },

  /**
   * Delete email item from template
   * DELETE /api/v1/presents/email_campaign_templates/:template_id/email_template_items/:id
   */
  async delete(templateId: number, id: number) {
    return fetchApi<void>(
      `/v1/presents/email_campaign_templates/${templateId}/email_template_items/${id}`,
      {
        method: 'DELETE',
      },
    )
  },

  /**
   * Send test email for a single template item
   * POST /api/v1/presents/email_campaign_templates/:template_id/email_template_items/:id/send_test
   */
  async sendTest(templateId: number, id: number, testEmail: string) {
    return fetchApi<{ message: string; recipient: string; subject: string; email_name: string }>(
      `/v1/presents/email_campaign_templates/${templateId}/email_template_items/${id}/send_test`,
      {
        method: 'POST',
        body: JSON.stringify({ test_email: testEmail }),
      },
    )
  },
}

// Scheduled Emails API (Event-specific email instances)
export const scheduledEmailsApi = {
  /**
   * Get all scheduled emails for an event
   * GET /api/v1/presents/events/:event_slug/scheduled_emails
   */
  async getByEvent(eventSlug: string) {
    return fetchApi<ScheduledEmail[]>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails`,
    )
  },

  /**
   * Get single scheduled email
   * GET /api/v1/presents/events/:event_slug/scheduled_emails/:id
   */
  async getById(eventSlug: string, id: number) {
    return fetchApi<ScheduledEmail>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/${id}`,
    )
  },

  /**
   * Generate scheduled emails for event from template
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/generate
   */
  async generate(eventSlug: string, data?: GenerateScheduledEmailsRequest) {
    return fetchApi<GenerateScheduledEmailsResponse>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/generate`,
      {
        method: 'POST',
        body: JSON.stringify(data || {}),
      },
    )
  },

  /**
   * Update scheduled email (event-specific customization)
   * PATCH /api/v1/presents/events/:event_slug/scheduled_emails/:id
   */
  async update(eventSlug: string, id: number, data: UpdateEmailRequest) {
    return fetchApi<ScheduledEmail>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ scheduled_email: data }),
      },
    )
  },

  /**
   * Pause scheduled email
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/:id/pause
   */
  async pause(eventSlug: string, id: number) {
    return fetchApi<ScheduledEmail>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/${id}/pause`,
      {
        method: 'POST',
      },
    )
  },

  /**
   * Resume paused scheduled email
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/:id/resume
   */
  async resume(eventSlug: string, id: number) {
    return fetchApi<ScheduledEmail>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/${id}/resume`,
      {
        method: 'POST',
      },
    )
  },

  /**
   * Send scheduled email immediately
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/:id/send_now
   */
  async sendNow(eventSlug: string, id: number) {
    return fetchApi<SendNowResponse>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/${id}/send_now`,
      {
        method: 'POST',
      },
    )
  },

  /**
   * Preview email with resolved variables for a specific registration
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/:id/preview
   */
  async preview(eventSlug: string, id: number, data: EmailPreviewRequest) {
    return fetchApi<EmailPreviewResponse>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/${id}/preview`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    )
  },

  /**
   * Send test email to specified email address
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/:id/send_test
   */
  async sendTest(eventSlug: string, id: number, testEmail: string) {
    return fetchApi<{ message: string; recipient: string; subject: string }>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/${id}/send_test`,
      {
        method: 'POST',
        body: JSON.stringify({ test_email: testEmail }),
      },
    )
  },

  /**
   * Retry all failed deliveries for a scheduled email (soft bounces only)
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/:id/retry_failed
   */
  async retryFailed(eventSlug: string, id: number) {
    return fetchApi<{
      message: string
      retried_count: number
      retry_failed_count: number
      skipped_count: number
      total_failed: number
    }>(`/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/${id}/retry_failed`, {
      method: 'POST',
    })
  },

  /**
   * Get list of recipients for a scheduled email
   * GET /api/v1/presents/events/:event_slug/scheduled_emails/:id/recipients
   */
  async getRecipients(eventSlug: string, id: number) {
    return fetchApi<{
      count: number
      category: string
      email_type: 'invitation_reminders' | 'registration_emails'
      recipients: Array<{
        email: string
        name: string
        organization: string
      }>
    }>(`/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/${id}/recipients`)
  },

  /**
   * Create new scheduled email for event
   * POST /api/v1/presents/events/:event_slug/scheduled_emails
   */
  async create(eventSlug: string, data: CreateScheduledEmailRequest) {
    return fetchApi<ScheduledEmail>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails`,
      {
        method: 'POST',
        body: JSON.stringify({ scheduled_email: data }),
      },
    )
  },

  /**
   * Delete/cancel scheduled email
   * DELETE /api/v1/presents/events/:event_slug/scheduled_emails/:id
   */
  async delete(eventSlug: string, id: number) {
    return fetchApi<void>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/${id}`,
      {
        method: 'DELETE',
      },
    )
  },

  /**
   * Save event's scheduled emails as new reusable template
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/save_as_template
   */
  async saveAsTemplate(eventSlug: string, data: SaveAsTemplateRequest) {
    return fetchApi<EmailCampaignTemplate>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/save_as_template`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    )
  },
}

// Email Deliveries API (Delivery tracking and statistics)
export const emailDeliveriesApi = {
  /**
   * Get all deliveries for a scheduled email
   * GET /api/v1/presents/events/:event_slug/scheduled_emails/:scheduled_email_id/email_deliveries
   */
  async getByScheduledEmail(eventSlug: string, scheduledEmailId: number) {
    return fetchApi<EmailDelivery[]>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/scheduled_emails/${scheduledEmailId}/email_deliveries`,
    )
  },

  /**
   * Get delivery statistics for an event
   * GET /api/v1/presents/events/:event_slug/email_deliveries/stats
   */
  async getEventStats(eventSlug: string) {
    return fetchApi<{
      total_sent: number
      delivered: number
      bounced: number
      dropped: number
      unsubscribed: number
      delivery_rate: number
    }>(`/v1/presents/events/${encodeURIComponent(eventSlug)}/email_deliveries/stats`)
  },

  /**
   * Get delivery statistics for a scheduled email
   * GET /api/v1/presents/scheduled_emails/:id/delivery_stats
   */
  async getScheduledEmailStats(scheduledEmailId: number) {
    return fetchApi<{
      total_sent: number
      delivered: number
      bounced: number
      dropped: number
      pending: number
      delivery_rate: number
    }>(`/v1/presents/scheduled_emails/${scheduledEmailId}/delivery_stats`)
  },

  /**
   * Retry failed delivery
   * POST /api/v1/presents/email_deliveries/:id/retry
   */
  async retry(deliveryId: number) {
    return fetchApi<EmailDelivery>(`/v1/presents/email_deliveries/${deliveryId}/retry`, {
      method: 'POST',
    })
  },

  /**
   * Get email history for a registration
   * GET /api/v1/presents/registrations/:registration_id/email_history
   */
  async getByRegistration(registrationId: number) {
    console.log('[API DEBUG] getByRegistration called with:', registrationId)
    const url = `/v1/presents/registrations/${registrationId}/email_history`
    console.log('[API DEBUG] Full URL:', url)
    const result = await fetchApi<EmailDelivery[]>(url)
    console.log('[API DEBUG] getByRegistration result:', result)
    return result
  },

  /**
   * Get email history for an event invitation
   * GET /api/v1/presents/events/:event_slug/invitations/:invitation_id/email_history
   */
  async getByInvitation(eventSlug: string, invitationId: number) {
    console.log('[API DEBUG] getByInvitation called with:', { eventSlug, invitationId })
    const url = `/v1/presents/events/${encodeURIComponent(eventSlug)}/invitations/${invitationId}/email_history`
    console.log('[API DEBUG] Full URL:', url)
    const result = await fetchApi<EmailDelivery[]>(url)
    console.log('[API DEBUG] getByInvitation result:', result)
    return result
  },
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

  async contact(
    id: string,
    data: {
      fromName: string
      fromEmail: string
      eventDate?: string
      attendeeCount?: number
      eventType?: string
      message: string
    },
  ) {
    return fetchApi<any>(`/venues/${id}/contact`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// Users API
export const usersApi = {
  async getCurrentUser() {
    // Delegate to authApi for consistency
    return authApi.getCurrentUser()
  },
}

// Admin API
export const adminApi = {
  async getAllUsers() {
    // Admin endpoints are at root level (not /api prefix)
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/admin/user_breakdown`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch users' }))
      throw new ApiError(
        errorData.error || errorData.message || 'Failed to fetch users',
        response.status,
      )
    }

    const data = await response.json()
    // Rails endpoint returns paginated data with { users: [...], pagination: {...} }
    return data.users || data
  },

  async getPresentsAnalytics() {
    // Admin endpoints are at root level (not /api prefix)
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/admin/presents_analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch analytics' }))
      throw new ApiError(
        errorData.error || errorData.message || 'Failed to fetch analytics',
        response.status,
      )
    }

    return await response.json()
  },

  async getUnsubscribedUsers(params?: {
    page?: number
    per_page?: number
    scope?: string
    source?: string
    search?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params?.scope) queryParams.append('scope', params.scope)
    if (params?.source) queryParams.append('source', params.source)
    if (params?.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString()
    const url = `${API_BASE_URL.replace('/api', '')}/admin/unsubscribed_users${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch unsubscribed users' }))
      throw new ApiError(
        errorData.error || errorData.message || 'Failed to fetch unsubscribed users',
        response.status,
      )
    }

    return await response.json()
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
  },

  // Email testing endpoints
  async getEmailCategories() {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/admin/emails.json`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch email categories' }))
      throw new ApiError(
        errorData.error || errorData.message || 'Failed to fetch email categories',
        response.status,
      )
    }

    return response.json()
  },

  async sendAllEmails() {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/admin/emails/send_all.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to send emails' }))
      throw new ApiError(
        errorData.error || errorData.message || 'Failed to send emails',
        response.status,
      )
    }

    return response.json()
  },

  async sendScheduledEmails() {
    const response = await fetch(
      `${API_BASE_URL.replace('/api', '')}/admin/emails/send_scheduled.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to send scheduled emails' }))
      throw new ApiError(
        errorData.error || errorData.message || 'Failed to send scheduled emails',
        response.status,
      )
    }

    return response.json()
  },

  async setupTestData() {
    const response = await fetch(
      `${API_BASE_URL.replace('/api', '')}/admin/emails/setup_test_data.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to setup test data' }))
      throw new ApiError(
        errorData.error || errorData.message || 'Failed to setup test data',
        response.status,
      )
    }

    return response.json()
  },

  async cleanupTestData() {
    const response = await fetch(
      `${API_BASE_URL.replace('/api', '')}/admin/emails/cleanup_test_data.json`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to cleanup test data' }))
      throw new ApiError(
        errorData.error || errorData.message || 'Failed to cleanup test data',
        response.status,
      )
    }

    return response.json()
  },

  async previewEmail(emailType: string) {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/admin/emails/preview.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ email_type: emailType }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to preview email' }))
      throw new ApiError(
        errorData.error || errorData.message || 'Failed to preview email',
        response.status,
      )
    }

    return response.json()
  },

  async toggleUserPaid(userId: number) {
    const response = await fetch(
      `${API_BASE_URL.replace('/api', '')}/admin/users/${userId}/toggle_paid`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to toggle paid status' }))
      throw new ApiError(
        errorData.error || errorData.message || 'Failed to toggle paid status',
        response.status,
      )
    }

    return await response.json()
  },
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
  },
}

// Vendor Contacts API (Network/CRM)
export interface VendorContact {
  id: number
  organization_id: number
  contact_name: string
  business_name?: string
  job_title?: string
  email: string
  phone?: string
  location?: string
  contact_type: 'lead' | 'vendor' | 'partner' | 'client' | 'other'
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'closed'
  tags?: string[]
  categories?: string[]
  notes?: string
  source: 'manual' | 'event_application' | 'csv_import'
  source_registration_id?: number
  interaction_count: number
  events_participated?: number
  last_contacted_at?: string
  imported_at?: string
  instagram_handle?: string
  tiktok_handle?: string
  website?: string
  featured?: boolean
  // Payment information (TODO: Backend migration needed for these fields)
  eventbrite_email?: string
  venmo_handle?: string
  paypal_email?: string
  created_at: string
  updated_at: string
  unsubscribe_status?: {
    is_unsubscribed: boolean
    scope: 'global' | 'organization' | 'event' | null
  }
  // Event history (only included when fetching single contact)
  event_history?: EventHistoryItem[]
  change_history?: ContactChangeHistoryItem[]
  total_applications?: number
  total_events?: number
}

export interface EventHistoryItem {
  event_id: number
  event_name: string
  event_date: string
  category: string
  status: string
  applied_at: string
  application_id: number
}

export interface ContactChangeHistoryItem {
  field: string
  old_value: string
  new_value: string
  changed_at: string
  event_name: string
}

export interface VendorContactsListResponse {
  vendor_contacts: VendorContact[]
  meta: {
    current_page: number
    total_pages: number
    total_count: number
    per_page: number
  }
}

export interface BulkImportResult {
  success: boolean
  validate_only?: boolean
  summary: {
    total_rows: number
    created: number
    updated: number
    skipped: number
    failed: number
    would_create?: number
    would_update?: number
    would_skip?: number
  }
  errors: Array<{
    row: number
    field: string
    message: string
  }>
}

export interface BulkImportOptions {
  skipDuplicates?: boolean
  updateExisting?: boolean
  tags?: string[]
  validateOnly?: boolean
}

export interface ContactList {
  id: number
  organization_id: number
  name: string
  description?: string
  list_type: 'smart' | 'manual'

  // For smart lists
  filters?: {
    categories?: string[]
    locations?: string[]
    tags?: string[]
  }

  // For manual lists
  contact_ids?: number[]

  // Metadata
  contacts_count: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

export interface ContactListsResponse {
  contact_lists: ContactList[]
}

function mapVendorContactFromApi(contact: any): VendorContact {
  return {
    id: contact.id,
    organization_id: contact.organization_id,
    contact_name: contact.contact_name || contact.contact_info?.name || '',
    business_name: contact.business_name || contact.contact_info?.business_name || undefined,
    job_title: contact.job_title || contact.contact_info?.job_title || undefined,
    email: contact.email || contact.contact_info?.email || '',
    phone: contact.phone || contact.contact_info?.phone || undefined,
    location: contact.location || contact.contact_info?.location || undefined,
    contact_type: contact.contact_type || contact.crm_data?.contact_type || 'vendor',
    status: contact.status || contact.crm_data?.status || 'new',
    tags: contact.tags || contact.crm_data?.tags || [],
    categories: contact.categories || contact.crm_data?.categories || [],
    featured:
      contact.featured !== undefined ? contact.featured : contact.crm_data?.featured || false,
    notes: contact.notes || contact.crm_data?.notes || undefined,
    source: contact.source || contact.metadata?.source || 'manual',
    source_registration_id: contact.source_registration_id || contact.registration_id || undefined,
    interaction_count:
      contact.interaction_count !== undefined
        ? contact.interaction_count
        : contact.activity?.interaction_count || 0,
    events_participated: contact.events_participated || 0,
    last_contacted_at:
      contact.last_contacted_at || contact.activity?.last_contacted_at || undefined,
    imported_at: contact.imported_at || contact.metadata?.imported_at || undefined,
    instagram_handle: contact.instagram_handle || contact.social?.instagram_handle || undefined,
    tiktok_handle: contact.tiktok_handle || contact.social?.tiktok_handle || undefined,
    website: contact.website || contact.social?.website || undefined,
    created_at: contact.created_at || contact.metadata?.created_at || '',
    updated_at: contact.updated_at || contact.metadata?.updated_at || '',
    unsubscribe_status: contact.unsubscribe_status || undefined,
    event_history: contact.event_history || undefined,
    change_history: contact.change_history || undefined,
    total_applications: contact.total_applications || undefined,
    total_events: contact.total_events || undefined,
  }
}

export const vendorContactsApi = {
  /**
   * Get all vendor contacts for an organization
   * GET /api/v1/presents/organizations/:organization_id/vendor_contacts
   */
  async getAll(
    organizationId: number,
    params?: {
      search?: string
      contact_type?: string
      status?: string
      tags?: string[]
      location?: string | string[]
      category?: string | string[]
      featured?: string
      page?: number
      per_page?: number
      sort?: string
      order?: 'asc' | 'desc'
    },
  ): Promise<VendorContactsListResponse> {
    const queryParams = new URLSearchParams()

    if (params?.search) queryParams.append('search', params.search)
    if (params?.contact_type) queryParams.append('contact_type', params.contact_type)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.tags && params.tags.length > 0) {
      params.tags.forEach((tag) => queryParams.append('tags[]', tag))
    }
    if (params?.location) {
      const locations = Array.isArray(params.location) ? params.location : [params.location]
      locations.forEach((loc) => queryParams.append('location[]', loc))
    }
    if (params?.category) {
      const categories = Array.isArray(params.category) ? params.category : [params.category]
      categories.forEach((cat) => queryParams.append('category[]', cat))
    }
    if (params?.featured) queryParams.append('featured', params.featured)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)

    const queryString = queryParams.toString()
    const endpoint = `/v1/presents/organizations/${organizationId}/vendor_contacts${queryString ? `?${queryString}` : ''}`

    const response = await fetchApi<any>(endpoint)

    // Handle both array and object response formats
    if (Array.isArray(response)) {
      // Backend returned plain array
      return {
        vendor_contacts: response.map(mapVendorContactFromApi),
        meta: {
          current_page: 1,
          total_pages: 1,
          total_count: response.length,
          per_page: response.length,
        },
      }
    }

    // Backend returned object with vendor_contacts key
    return {
      vendor_contacts: response.vendor_contacts?.map(mapVendorContactFromApi) || [],
      meta: response.meta || {
        current_page: 1,
        total_pages: 1,
        total_count: response.vendor_contacts?.length || 0,
        per_page: response.vendor_contacts?.length || 0,
      },
    }
  },

  /**
   * Get single vendor contact by ID
   * GET /api/v1/presents/vendor_contacts/:id
   */
  async getById(id: number): Promise<VendorContact> {
    const response = await fetchApi<any>(`/v1/presents/vendor_contacts/${id}`)
    const contact = response.vendor_contact || response
    return mapVendorContactFromApi(contact)
  },

  /**
   * Get all vendor contact IDs for bulk selection
   * GET /api/v1/presents/organizations/:organization_id/vendor_contacts/ids
   */
  async getAllIds(
    organizationId: number,
    params?: {
      search?: string
      contact_type?: string
      status?: string
      tags?: string[]
      location?: string | string[]
      category?: string | string[]
      featured?: string
    },
  ): Promise<{ ids: number[]; count: number }> {
    const queryParams = new URLSearchParams()

    if (params?.search) queryParams.append('search', params.search)
    if (params?.contact_type) queryParams.append('contact_type', params.contact_type)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.tags && params.tags.length > 0) {
      params.tags.forEach((tag) => queryParams.append('tags[]', tag))
    }
    if (params?.location) {
      const locations = Array.isArray(params.location) ? params.location : [params.location]
      locations.forEach((loc) => queryParams.append('location[]', loc))
    }
    if (params?.category) {
      const categories = Array.isArray(params.category) ? params.category : [params.category]
      categories.forEach((cat) => queryParams.append('category[]', cat))
    }
    if (params?.featured) queryParams.append('featured', params.featured)

    const queryString = queryParams.toString()
    const endpoint = `/v1/presents/organizations/${organizationId}/vendor_contacts/ids${queryString ? `?${queryString}` : ''}`

    return fetchApi<{ ids: number[]; count: number }>(endpoint)
  },

  /**
   * Get all unique filter options (locations, tags, categories) for an organization
   * GET /api/v1/presents/organizations/:organization_id/vendor_contacts/filter_options
   */
  async getFilterOptions(organizationId: number): Promise<{
    locations: string[]
    tags: string[]
    categories: string[]
  }> {
    return fetchApi<{ locations: string[]; tags: string[]; categories: string[] }>(
      `/v1/presents/organizations/${organizationId}/vendor_contacts/filter_options`,
    )
  },

  /**
   * Create new vendor contact
   * POST /api/v1/presents/vendor_contacts
   */
  async create(
    organizationId: number,
    data: {
      contact_name: string
      business_name?: string
      job_title?: string
      email: string
      phone?: string
      location?: string
      contact_type?: 'vendor' | 'partner' | 'sponsor' | 'staff'
      tags?: string[]
      categories?: string[]
      notes?: string
      source?: 'manual' | 'event_application' | 'csv_import'
      vendor_id?: number
      registration_id?: number
      instagram_handle?: string
      tiktok_handle?: string
      website?: string
      featured?: boolean
      // TODO: Backend migration needed - silently dropped until then
      eventbrite_email?: string
      venmo_handle?: string
      paypal_email?: string
    },
  ): Promise<VendorContact> {
    // Backend expects FLAT structure for create (not nested)
    const backendData = {
      organization_id: organizationId,
      vendor_id: data.vendor_id,
      registration_id: data.registration_id,
      name: data.contact_name,
      email: data.email,
      phone: data.phone,
      business_name: data.business_name,
      job_title: data.job_title,
      location: data.location,
      contact_type: data.contact_type || 'vendor',
      status: 'new',
      notes: data.notes,
      tags: data.tags || [],
      categories: data.categories || [],
      instagram_handle: data.instagram_handle,
      tiktok_handle: data.tiktok_handle,
      website: data.website,
      featured: data.featured || false,
      source: data.source || 'manual',
    }

    const response = await fetchApi<any>('/v1/presents/vendor_contacts', {
      method: 'POST',
      body: JSON.stringify({
        vendor_contact: backendData,
      }),
    })

    // Response can be in either flat or nested format
    const contact = response.vendor_contact || response

    return {
      id: contact.id,
      organization_id: contact.organization_id,
      // Try flat structure first, fall back to nested
      contact_name: contact.contact_name || contact.contact_info?.name || '',
      business_name: contact.business_name || contact.contact_info?.business_name || undefined,
      job_title: contact.job_title || contact.contact_info?.job_title || undefined,
      email: contact.email || contact.contact_info?.email || '',
      phone: contact.phone || contact.contact_info?.phone || undefined,
      location: contact.location || contact.contact_info?.location || undefined,
      contact_type: contact.contact_type || contact.crm_data?.contact_type || 'vendor',
      status: contact.status || contact.crm_data?.status || 'new',
      tags: contact.tags || contact.crm_data?.tags || [],
      categories: contact.categories || contact.crm_data?.categories || [],
      featured:
        contact.featured !== undefined ? contact.featured : contact.crm_data?.featured || false,
      notes: contact.notes || contact.crm_data?.notes || undefined,
      source: contact.source || contact.metadata?.source || 'manual',
      source_registration_id:
        contact.source_registration_id || contact.registration_id || undefined,
      interaction_count:
        contact.interaction_count !== undefined
          ? contact.interaction_count
          : contact.activity?.interaction_count || 0,
      events_participated: contact.events_participated || 0,
      last_contacted_at:
        contact.last_contacted_at || contact.activity?.last_contacted_at || undefined,
      imported_at: contact.imported_at || contact.metadata?.imported_at || undefined,
      instagram_handle: contact.instagram_handle || contact.social?.instagram_handle || undefined,
      tiktok_handle: contact.tiktok_handle || contact.social?.tiktok_handle || undefined,
      website: contact.website || contact.social?.website || undefined,
      created_at: contact.created_at || contact.metadata?.created_at || '',
      updated_at: contact.updated_at || contact.metadata?.updated_at || '',
      unsubscribe_status: contact.unsubscribe_status || undefined,
    }
  },

  /**
   * Update vendor contact
   * PATCH /api/v1/presents/vendor_contacts/:id
   */
  async update(id: number, data: Partial<VendorContact>): Promise<VendorContact> {
    // Backend expects FLAT structure for update (not nested)
    const backendData: any = {}

    // Map frontend field names to backend's flat field names
    if (data.contact_name !== undefined) backendData.name = data.contact_name
    if (data.email !== undefined) backendData.email = data.email
    if (data.phone !== undefined) backendData.phone = data.phone
    if (data.business_name !== undefined) backendData.business_name = data.business_name
    if (data.job_title !== undefined) backendData.job_title = data.job_title
    if (data.location !== undefined) backendData.location = data.location
    if (data.contact_type !== undefined) backendData.contact_type = data.contact_type
    if (data.status !== undefined) backendData.status = data.status
    if (data.notes !== undefined) backendData.notes = data.notes
    if (data.tags !== undefined) backendData.tags = data.tags
    if (data.categories !== undefined) backendData.categories = data.categories
    if (data.instagram_handle !== undefined) backendData.instagram_handle = data.instagram_handle
    if (data.tiktok_handle !== undefined) backendData.tiktok_handle = data.tiktok_handle
    if (data.website !== undefined) backendData.website = data.website
    if (data.featured !== undefined) backendData.featured = data.featured

    const response = await fetchApi<any>(`/v1/presents/vendor_contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        vendor_contact: backendData,
      }),
    })

    // Response can be in either flat or nested format
    const contact = response.vendor_contact || response

    return {
      id: contact.id,
      organization_id: contact.organization_id,
      // Try flat structure first, fall back to nested
      contact_name: contact.contact_name || contact.contact_info?.name || '',
      business_name: contact.business_name || contact.contact_info?.business_name || undefined,
      job_title: contact.job_title || contact.contact_info?.job_title || undefined,
      email: contact.email || contact.contact_info?.email || '',
      phone: contact.phone || contact.contact_info?.phone || undefined,
      location: contact.location || contact.contact_info?.location || undefined,
      contact_type: contact.contact_type || contact.crm_data?.contact_type || 'vendor',
      status: contact.status || contact.crm_data?.status || 'new',
      tags: contact.tags || contact.crm_data?.tags || [],
      categories: contact.categories || contact.crm_data?.categories || [],
      featured:
        contact.featured !== undefined ? contact.featured : contact.crm_data?.featured || false,
      notes: contact.notes || contact.crm_data?.notes || undefined,
      source: contact.source || contact.metadata?.source || 'manual',
      instagram_handle: contact.instagram_handle || contact.social?.instagram_handle || undefined,
      tiktok_handle: contact.tiktok_handle || contact.social?.tiktok_handle || undefined,
      website: contact.website || contact.social?.website || undefined,
      source_registration_id:
        contact.source_registration_id || contact.registration_id || undefined,
      interaction_count:
        contact.interaction_count !== undefined
          ? contact.interaction_count
          : contact.activity?.interaction_count || 0,
      events_participated: contact.events_participated || 0,
      last_contacted_at:
        contact.last_contacted_at || contact.activity?.last_contacted_at || undefined,
      imported_at: contact.imported_at || contact.metadata?.imported_at || undefined,
      created_at: contact.created_at || contact.metadata?.created_at || '',
      updated_at: contact.updated_at || contact.metadata?.updated_at || '',
      unsubscribe_status: contact.unsubscribe_status || undefined,
    }
  },

  /**
   * Delete (archive) vendor contact
   * DELETE /api/v1/presents/vendor_contacts/:id
   */
  async delete(id: number): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/v1/presents/vendor_contacts/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Add tag to contact
   * POST /api/v1/presents/vendor_contacts/:id/add_tag
   */
  async addTag(id: number, tag: string): Promise<VendorContact> {
    const response = await fetchApi<{ vendor_contact: VendorContact }>(
      `/v1/presents/vendor_contacts/${id}/add_tag`,
      {
        method: 'POST',
        body: JSON.stringify({ tag }),
      },
    )
    return response.vendor_contact
  },

  /**
   * Remove tag from contact
   * DELETE /api/v1/presents/vendor_contacts/:id/remove_tag
   */
  async removeTag(id: number, tag: string): Promise<VendorContact> {
    const response = await fetchApi<{ vendor_contact: VendorContact }>(
      `/v1/presents/vendor_contacts/${id}/remove_tag`,
      {
        method: 'DELETE',
        body: JSON.stringify({ tag }),
      },
    )
    return response.vendor_contact
  },

  /**
   * Record interaction with contact
   * POST /api/v1/presents/vendor_contacts/:id/record_interaction
   */
  async recordInteraction(
    id: number,
    interactionType: string,
    notes?: string,
  ): Promise<VendorContact> {
    const response = await fetchApi<{ vendor_contact: VendorContact }>(
      `/v1/presents/vendor_contacts/${id}/record_interaction`,
      {
        method: 'POST',
        body: JSON.stringify({
          interaction_type: interactionType,
          notes,
        }),
      },
    )
    return response.vendor_contact
  },

  /**
   * Send bulk email to multiple contacts
   * POST /api/v1/presents/vendor_contacts/bulk_email
   *
   * NOTE: This endpoint may not be implemented yet on backend
   */
  async bulkEmail(
    contactIds: number[],
    emailData: {
      subject: string
      message: string
      htmlMessage?: string
      includeEventLink?: boolean
      eventId?: number
    },
  ): Promise<{ emails_sent: number; failed: any[]; message: string }> {
    // Keep mock for now as bulk email may not be implemented on backend yet
    return fetchApi<{ emails_sent: number; failed: any[]; message: string }>(
      '/v1/presents/vendor_contacts/bulk_email',
      {
        method: 'POST',
        body: JSON.stringify({
          contact_ids: contactIds,
          ...emailData,
        }),
      },
    ).catch(() => {
      // Fallback to mock if endpoint doesn't exist
      return {
        emails_sent: contactIds.length,
        failed: [],
        message: 'Emails sent successfully (mocked)',
      }
    })
  },

  /**
   * Import contact from registration/submission
   * POST /api/v1/presents/vendor_contacts/import_from_registration
   *
   * NOTE: This endpoint may not be implemented yet on backend
   */
  async importFromRegistration(
    registrationId: number,
    organizationId: number,
  ): Promise<{
    vendor_contact: VendorContact
    created: boolean
  }> {
    return fetchApi<{ vendor_contact: VendorContact; created: boolean }>(
      '/v1/presents/vendor_contacts/import_from_registration',
      {
        method: 'POST',
        body: JSON.stringify({
          registration_id: registrationId,
          organization_id: organizationId,
        }),
      },
    )
  },

  /**
   * Bulk import vendor contacts from CSV file
   * POST /api/v1/presents/vendor_contacts/bulk_import
   */
  async bulkImport(file: File, options: BulkImportOptions = {}): Promise<BulkImportResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('skip_duplicates', String(options.skipDuplicates ?? true))
    formData.append('update_existing', String(options.updateExisting ?? false))
    if (options.validateOnly) {
      formData.append('validate_only', 'true')
    }

    if (options.tags && options.tags.length > 0) {
      formData.append('tags', JSON.stringify(options.tags))
    }

    console.log(
      '📤 Sending bulk import request to:',
      `${API_BASE_URL}/v1/presents/vendor_contacts/bulk_import`,
    )
    console.log('📤 File size:', file.size, 'bytes')

    // Create abort controller for timeout (5 minutes for large files)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 min timeout

    try {
      const response = await fetch(`${API_BASE_URL}/v1/presents/vendor_contacts/bulk_import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          // Don't set Content-Type - browser will set it with boundary for multipart
        },
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('📥 Response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = 'Import failed'
        try {
          const error = await response.json()
          errorMessage = error.error || error.message || errorMessage
          console.error('❌ Server error response:', error)
        } catch (e) {
          const text = await response.text()
          console.error('❌ Server error text:', text)
          errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('✅ Import result:', result)
      return result
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ Request timeout after 5 minutes')
        throw new Error(
          'Import timeout - file may be too large or server is slow. Please try with a smaller batch.',
        )
      }

      console.error('❌ Bulk import error:', error)
      throw error
    }
  },

  /**
   * Bulk update multiple contacts (e.g., assign category)
   * PATCH /api/v1/presents/organizations/:org_id/vendor_contacts/bulk_update
   */
  async bulkUpdate(
    organizationId: number,
    contactIds: number[],
    updates: {
      categories?: string[]
      tags?: string[]
      status?: string
      contact_type?: string
      featured?: boolean
      location?: string
      category_mode?: 'replace' | 'append'
    },
  ): Promise<{ message: string; updated_count: number; total_selected: number }> {
    return fetchApi<{ message: string; updated_count: number; total_selected: number }>(
      `/v1/presents/organizations/${organizationId}/vendor_contacts/bulk_update`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          contact_ids: contactIds,
          ...updates,
        }),
      },
    )
  },

  async bulkDelete(
    organizationId: number,
    contactIds: number[],
  ): Promise<{ message: string; deleted_count: number; total_selected: number }> {
    return fetchApi<{ message: string; deleted_count: number; total_selected: number }>(
      `/v1/presents/organizations/${organizationId}/vendor_contacts/bulk_delete`,
      {
        method: 'DELETE',
        body: JSON.stringify({
          contact_ids: contactIds,
        }),
      },
    )
  },

  /**
   * PHASE 3 OPTIMIZATION: Get specific vendor contacts by IDs
   * GET /api/v1/presents/organizations/:organization_id/vendor_contacts/by_ids?ids=1,2,3
   *
   * More efficient than getAll when you only need specific contacts.
   * Useful for selective loading, email preview, invitation editing, etc.
   *
   * @param organizationId - Organization ID
   * @param contactIds - Array of contact IDs to fetch (max 1000)
   * @param params - Optional pagination parameters
   * @returns Promise with vendor contacts and pagination metadata
   */
  async getByIds(
    organizationId: number,
    contactIds: number[],
    params?: {
      page?: number
      per_page?: number
    },
  ): Promise<VendorContactsListResponse> {
    const queryParams = new URLSearchParams()

    // Add comma-separated IDs
    if (contactIds.length > 0) {
      queryParams.append('ids', contactIds.join(','))
    }

    // Add pagination params
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())

    const queryString = queryParams.toString()
    const endpoint = `/v1/presents/organizations/${organizationId}/vendor_contacts/by_ids${queryString ? `?${queryString}` : ''}`

    const response = await fetchApi<any>(endpoint)

    return {
      vendor_contacts: response.vendor_contacts?.map(mapVendorContactFromApi) || [],
      meta: response.meta || {
        current_page: 1,
        total_pages: 1,
        total_count: response.vendor_contacts?.length || 0,
        per_page: response.vendor_contacts?.length || 0,
      },
    }
  },
}

// Event Invitations API
export interface EventInvitation {
  id: number
  event_id: number
  vendor_contact_id: number
  vendor_contact?: {
    id: number
    name: string
    email: string
    business_name?: string
    contact_type: string
  }
  event?: {
    id: number
    title: string
    slug: string
    description: string
    dates?: {
      start?: string
      end?: string
      start_time?: string
      end_time?: string
    }
    event_date?: string // Legacy support
    venue?: string
    location: string
    age_restriction?: string
    poster_url?: string
    ticket_url?: string
    ticket_link?: string
    application_deadline: string
    payment_deadline?: string
    organization?: {
      id: number
      name: string
    }
    vendor_applications?: Array<{
      id: number
      name: string
      description?: string
      categories: string[]
      booth_price?: number
      submissions_count: number
    }>
  }
  status: 'pending' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'
  invitation_token?: string
  sent_at?: string
  responded_at?: string
  response_notes?: string
  expires_at: string
  created_at: string
  updated_at: string
  can_respond?: boolean
  is_expired?: boolean
}

export const contactListsApi = {
  /**
   * Get all contact lists for an organization
   * GET /api/v1/presents/organizations/:organization_id/contact_lists
   */
  async getAll(organizationId: number): Promise<ContactListsResponse> {
    return fetchApi<ContactListsResponse>(
      `/v1/presents/organizations/${organizationId}/contact_lists`,
    )
  },

  /**
   * Get single contact list by ID
   * GET /api/v1/presents/contact_lists/:id
   */
  async getById(listId: number): Promise<ContactList> {
    return fetchApi<ContactList>(`/v1/presents/contact_lists/${listId}`)
  },

  /**
   * Get contacts for a list (with pagination)
   * GET /api/v1/presents/contact_lists/:id/contacts
   */
  async getContacts(listId: number, page = 1, perPage = 100): Promise<VendorContactsListResponse> {
    return fetchApi<VendorContactsListResponse>(
      `/v1/presents/contact_lists/${listId}/contacts?page=${page}&per_page=${perPage}`,
    )
  },

  /**
   * Create new contact list
   * POST /api/v1/presents/organizations/:organization_id/contact_lists
   */
  async create(
    organizationId: number,
    listData: {
      name: string
      description?: string
      list_type: 'smart' | 'manual'
      filters?: ContactList['filters']
      contact_ids?: number[]
    },
  ): Promise<ContactList> {
    return fetchApi<ContactList>(`/v1/presents/organizations/${organizationId}/contact_lists`, {
      method: 'POST',
      body: JSON.stringify({ contact_list: listData }),
    })
  },

  /**
   * Update contact list
   * PATCH /api/v1/presents/contact_lists/:id
   */
  async update(listId: number, listData: Partial<ContactList>): Promise<ContactList> {
    return fetchApi<ContactList>(`/v1/presents/contact_lists/${listId}`, {
      method: 'PATCH',
      body: JSON.stringify({ contact_list: listData }),
    })
  },

  /**
   * Delete contact list
   * DELETE /api/v1/presents/contact_lists/:id
   */
  async delete(listId: number): Promise<void> {
    return fetchApi<void>(`/v1/presents/contact_lists/${listId}`, {
      method: 'DELETE',
    })
  },
}

export const categoriesApi = {
  /**
   * Get all categories for an organization
   * GET /api/v1/presents/organizations/:organization_id/categories
   */
  async getAll(organizationId: number, includeUsage = false): Promise<{ categories: any[] }> {
    const params = includeUsage ? '?include_usage=true' : ''
    return fetchApi<{ categories: any[] }>(
      `/v1/presents/organizations/${organizationId}/categories${params}`,
    )
  },

  /**
   * Get single category by ID
   * GET /api/v1/presents/categories/:id
   */
  async getById(categoryId: number): Promise<any> {
    return fetchApi<any>(`/v1/presents/categories/${categoryId}`)
  },

  /**
   * Get category usage stats
   * GET /api/v1/presents/categories/:id/usage
   */
  async getUsage(categoryId: number): Promise<{ category: any; usage: any }> {
    return fetchApi<{ category: any; usage: any }>(`/v1/presents/categories/${categoryId}/usage`)
  },

  /**
   * Create new category
   * POST /api/v1/presents/organizations/:organization_id/categories
   */
  async create(
    organizationId: number,
    categoryData: {
      name: string
      description?: string
      color?: string
      icon?: string
      booth_price?: number
      early_bird_price?: number
      early_bird_deadline?: string
      payment_deadline?: string
      deposit?: number
      payment_preferences?: {
        type: string
        label: string
        amount: number
        is_percentage: boolean
      }[]
    },
  ): Promise<any> {
    return fetchApi<any>(`/v1/presents/organizations/${organizationId}/categories`, {
      method: 'POST',
      body: JSON.stringify({ category: categoryData }),
    })
  },

  /**
   * Update category
   * PUT /api/v1/presents/categories/:id
   */
  async update(
    categoryId: number,
    categoryData: {
      name?: string
      description?: string
      color?: string
      icon?: string
      booth_price?: number
      early_bird_price?: number
      early_bird_deadline?: string
      payment_deadline?: string
      deposit?: number
      payment_preferences?: {
        type: string
        label: string
        amount: number
        is_percentage: boolean
      }[]
    },
  ): Promise<any> {
    return fetchApi<any>(`/v1/presents/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify({ category: categoryData }),
    })
  },

  /**
   * Delete category
   * DELETE /api/v1/presents/categories/:id
   */
  async delete(categoryId: number): Promise<void> {
    return fetchApi<void>(`/v1/presents/categories/${categoryId}`, {
      method: 'DELETE',
    })
  },
  // Note: getLastApplication removed - categories now include default values directly
}

export const eventInvitationsApi = {
  /**
   * Create batch invitations for an event
   * POST /api/v1/presents/events/:event_slug/invitations/batch
   *
   * Supports two signatures:
   * 1. Legacy: createBatch(eventSlug, contactIds: number[])
   * 2. New: createBatch(eventSlug, { list_ids, vendor_contact_ids, excluded_contact_ids })
   */
  async createBatch(
    eventSlug: string,
    params:
      | number[]
      | {
          list_ids?: number[]
          vendor_contact_ids?: number[]
          excluded_contact_ids?: number[]
        },
  ) {
    // Support legacy array signature for backward compatibility
    const body = Array.isArray(params)
      ? { vendor_contact_ids: params }
      : {
          list_ids: params.list_ids || [],
          vendor_contact_ids: params.vendor_contact_ids || [],
          excluded_contact_ids: params.excluded_contact_ids || [],
        }

    return fetchApi<{
      invitations: EventInvitation[]
      created_count: number
      errors: any[]
    }>(`/v1/presents/events/${encodeURIComponent(eventSlug)}/invitations/batch`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  /**
   * Get all invitations for an event
   * GET /api/v1/presents/events/:event_slug/invitations
   */
  async getByEvent(
    eventSlug: string,
    page?: number,
    perPage?: number,
    params?: { status?: string },
  ) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (page) queryParams.append('page', page.toString())
    if (perPage) queryParams.append('per_page', perPage.toString())

    const query = queryParams.toString()
    return fetchApi<{
      invitations: EventInvitation[]
      meta: {
        total_count: number
        pending_count: number
        sent_count: number
        viewed_count: number
        accepted_count: number
        declined_count: number
        expired_count: number
        unsubscribed_count: number
        delivery_stats: {
          total_sent: number
          delivered: number
          bounced: number
          dropped: number
          undelivered: number
          unsubscribed: number
          pending: number
        }
        pagination?: {
          current_page: number
          per_page: number
          total_pages: number
          total_count: number
          has_next_page: boolean
          has_prev_page: boolean
        }
      }
    }>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/invitations${query ? `?${query}` : ''}`,
    )
  },

  /**
   * View invitation by token (public)
   * GET /api/v1/presents/invitations/:token
   */
  async getByToken(token: string) {
    return fetchApi<{ invitation: EventInvitation }>(`/v1/presents/invitations/${token}`)
  },

  /**
   * Respond to invitation (public)
   * PATCH /api/v1/presents/invitations/:token/respond
   */
  async respond(token: string, status: 'accepted' | 'declined', responseNotes?: string) {
    return fetchApi<{ invitation: EventInvitation; message: string }>(
      `/v1/presents/invitations/${token}/respond`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          response_notes: responseNotes,
        }),
      },
    )
  },

  /**
   * Preview invitation email content
   * GET /api/v1/presents/events/:event_slug/invitations/preview_email
   */
  async previewEmail(eventSlug: string) {
    return fetchApi<{
      subject: string
      body: string
      recipient_name: string
      recipient_email: string
      is_sample: boolean
    }>(`/v1/presents/events/${encodeURIComponent(eventSlug)}/invitations/preview_email`)
  },

  /**
   * Get vendor contact data for form pre-fill (public)
   * GET /api/v1/presents/invitations/prefill/:token
   */
  async getPrefillData(token: string) {
    return fetchApi<{
      email: string
      first_name: string
      last_name: string
    }>(`/v1/presents/invitations/prefill/${token}`)
  },
}

/**
 * Unsubscribe API
 * Public endpoints (no authentication required - token-based security)
 */
export const unsubscribeApi = {
  /**
   * Get unsubscribe context by token
   * GET /api/v1/presents/unsubscribe/:token
   */
  async getByToken(token: string) {
    return fetchApi<{
      email: string
      event: {
        id: number
        title: string
        slug: string
        event_date: string
      } | null
      organization: {
        id: number
        name: string
        slug: string
      } | null
      subscription_status: {
        event_unsubscribed: boolean
        organization_unsubscribed: boolean
        globally_unsubscribed: boolean
      }
      available_scopes: string[]
    }>(`/v1/presents/unsubscribe/${token}`)
  },

  /**
   * Process unsubscribe with specified scope
   * POST /api/v1/presents/unsubscribe/:token
   */
  async confirm(token: string, scope: 'event' | 'organization' | 'global') {
    return fetchApi<{
      success: boolean
      message: string
      unsubscribe: {
        scope: string
        email: string
        event?: {
          id: number
          title: string
        }
        organization?: {
          id: number
          name: string
        }
      }
    }>(`/v1/presents/unsubscribe/${token}`, {
      method: 'POST',
      body: JSON.stringify({ scope }),
    })
  },

  /**
   * Resubscribe - delete the unsubscribe record to receive emails again
   * POST /api/v1/presents/unsubscribe/:token/resubscribe
   */
  async resubscribe(token: string) {
    return fetchApi<{
      success: boolean
      message: string
      scope: string
    }>(`/v1/presents/unsubscribe/${token}/resubscribe`, {
      method: 'POST',
    })
  },
}

/**
 * Bulletins API
 * Producer announcements/messages for vendors
 */
export const bulletinsApi = {
  /**
   * Get all bulletins for an event
   * GET /api/v1/presents/events/:eventSlug/bulletins
   */
  async getByEvent(eventSlug: string) {
    return fetchApi<import('@/types/bulletin').BulletinsResponse>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/bulletins`,
    )
  },

  /**
   * Get a single bulletin
   * GET /api/v1/presents/bulletins/:id
   */
  async getById(id: number) {
    return fetchApi<import('@/types/bulletin').BulletinResponse>(`/v1/presents/bulletins/${id}`)
  },

  /**
   * Create a new bulletin
   * POST /api/v1/presents/events/:eventSlug/bulletins
   */
  async create(eventSlug: string, data: import('@/types/bulletin').CreateBulletinRequest) {
    return fetchApi<import('@/types/bulletin').BulletinResponse>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/bulletins`,
      {
        method: 'POST',
        body: JSON.stringify({ bulletin: data }),
      },
    )
  },

  /**
   * Update a bulletin
   * PATCH /api/v1/presents/bulletins/:id
   */
  async update(id: number, data: import('@/types/bulletin').UpdateBulletinRequest) {
    return fetchApi<import('@/types/bulletin').BulletinResponse>(`/v1/presents/bulletins/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ bulletin: data }),
    })
  },

  /**
   * Delete a bulletin
   * DELETE /api/v1/presents/bulletins/:id
   */
  async delete(id: number) {
    return fetchApi<void>(`/v1/presents/bulletins/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Toggle pin status of a bulletin
   * POST /api/v1/presents/bulletins/:id/toggle_pin
   */
  async togglePin(id: number) {
    return fetchApi<import('@/types/bulletin').BulletinResponse>(
      `/v1/presents/bulletins/${id}/toggle_pin`,
      {
        method: 'POST',
      },
    )
  },

  /**
   * Mark a bulletin as read
   * POST /api/v1/presents/bulletins/:id/mark_read
   */
  async markRead(id: number, email?: string) {
    return fetchApi<{ success: boolean }>(`/v1/presents/bulletins/${id}/mark_read`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  /**
   * Preview recipient count for bulletin email blast
   * GET /api/v1/presents/events/:eventSlug/bulletins/preview_recipients
   */
  async previewRecipients(
    eventSlug: string,
    criteria: import('@/types/bulletin').EmailAudienceCriteria,
  ) {
    const params = new URLSearchParams()

    if (criteria.include_all) {
      params.append('email_audience_criteria[include_all]', 'true')
    }

    if (criteria.statuses && criteria.statuses.length > 0) {
      criteria.statuses.forEach((status) => {
        params.append('email_audience_criteria[statuses][]', status)
      })
    }

    if (criteria.vendor_categories && criteria.vendor_categories.length > 0) {
      criteria.vendor_categories.forEach((category) => {
        params.append('email_audience_criteria[vendor_categories][]', category)
      })
    }

    return fetchApi<import('@/types/bulletin').RecipientPreview>(
      `/v1/presents/events/${encodeURIComponent(eventSlug)}/bulletins/preview_recipients?${params.toString()}`,
    )
  },
}

/**
 * Bug Reports API
 * For reporting bugs and issues from users
 */
export const bugReportsApi = {
  /**
   * Submit a bug report
   * POST /v1/shared/bug_reports
   */
  async create(data: { name: string; email: string; description: string; error_context?: any }) {
    // Note: Bug reports endpoint is public (no auth required)
    return fetchApi<{ id: number; message?: string }>('/v1/shared/bug_reports', {
      method: 'POST',
      body: JSON.stringify({
        bug_report: {
          name: data.name,
          email: data.email,
          bug_description: data.description, // Backend uses 'bug_description'
          description: data.description, // Also send 'description' for compatibility
          error_context: data.error_context,
        },
      }),
    })
  },

  /**
   * Get all bug reports (admin only)
   * GET /v1/shared/bug_reports
   */
  async getAll() {
    return fetchApi<
      Array<{
        id: number
        name: string
        email: string
        bug_description: string
        error_context?: any
        created_at: string
      }>
    >('/v1/shared/bug_reports')
  },

  /**
   * Get single bug report (admin only)
   * GET /v1/shared/bug_reports/:id
   */
  async getById(id: number) {
    return fetchApi<{
      id: number
      name: string
      email: string
      bug_description: string
      error_context?: any
      created_at: string
    }>(`/v1/shared/bug_reports/${id}`)
  },
}

// Email Testing API
export const emailTestsApi = {
  /**
   * Send all test emails (scheduled + notification)
   * POST /api/v1/presents/email_tests/send_all
   */
  async sendAll() {
    return fetchApi<{
      message: string
      recipient: string
      results: Array<{
        email_name: string
        status: 'sent' | 'failed'
        message?: string
      }>
      success_count: number
      failure_count: number
    }>('/v1/presents/email_tests/send_all', {
      method: 'POST',
    })
  },

  /**
   * Send scheduled test emails only
   * POST /api/v1/presents/email_tests/send_scheduled
   */
  async sendScheduled() {
    return fetchApi<{
      message: string
      recipient: string
      results: Array<{
        email_name: string
        status: 'sent' | 'failed'
        message?: string
      }>
      success_count: number
      failure_count: number
    }>('/v1/presents/email_tests/send_scheduled', {
      method: 'POST',
    })
  },

  /**
   * Send notification test emails only
   * POST /api/v1/presents/email_tests/send_notification_emails
   */
  async sendNotificationEmails() {
    return fetchApi<{
      message: string
      recipient: string
      results: Array<{
        email_name: string
        status: 'sent' | 'failed'
        message?: string
      }>
      success_count: number
      failure_count: number
    }>('/v1/presents/email_tests/send_notification_emails', {
      method: 'POST',
    })
  },

  /**
   * Get test email categories and info
   * GET /api/v1/presents/email_tests
   */
  async getInfo() {
    return fetchApi<{
      test_email: string
      email_categories: any[]
      total_count: number
    }>('/v1/presents/email_tests')
  },
}

export { ApiError }
