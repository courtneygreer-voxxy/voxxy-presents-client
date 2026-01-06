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
  SaveAsTemplateRequest,
  EmailPreviewRequest,
  EmailPreviewResponse,
  SendNowResponse,
  GenerateScheduledEmailsRequest,
  GenerateScheduledEmailsResponse,
} from '@/types/email'

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

  // Admin endpoints use JWT authentication (no separate admin key needed)
  // The backend checks if the current user has admin role via JWT token

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
    console.log('🔍 Fetching current user from /me endpoint...')

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
    console.log('📥 Current user response:', { email: data.email, role: data.role, id: data.id })

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
        'Authorization': `Bearer ${getAuthToken()}`
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
        message: data.message
      })
      throw new ApiError(
        data.error || data.message || 'Failed to update user',
        response.status,
        data.errors
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
  async update(slug: string, orgData: Partial<{
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
  }>) {
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
}

// Events API (Voxxy Presents)
export const eventsApi = {
  /**
   * Get event by ID or slug
   * GET /api/v1/presents/events/:id
   */
  async getById(id: string) {
    return fetchApi<any>(`/v1/presents/events/${id}`)
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
  async create(organizationSlug: string, eventData: {
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
    poster_url?: string
    ticket_url?: string
    ticket_price?: number
    capacity?: number
    published?: boolean
    registration_open?: boolean
    status?: 'draft' | 'published' | 'cancelled' | 'completed'
  }) {
    return fetchApi<any>(`/v1/presents/organizations/${organizationSlug}/events`, {
      method: 'POST',
      body: JSON.stringify({ event: eventData }),
    })
  },

  /**
   * Update event
   * PATCH /api/v1/presents/events/:id
   */
  async update(eventSlug: string, eventData: Partial<{
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
    poster_url: string
    ticket_url: string
    ticket_price: number
    capacity: number
    published: boolean
    registration_open: boolean
    status: 'draft' | 'published' | 'cancelled' | 'completed'
  }>) {
    return fetchApi<any>(`/v1/presents/events/${eventSlug}`, {
      method: 'PATCH',
      body: JSON.stringify({ event: eventData }),
    })
  },

  /**
   * Delete event
   * DELETE /api/v1/presents/events/:id
   */
  async delete(eventSlug: string) {
    return fetchApi<any>(`/v1/presents/events/${eventSlug}`, {
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

  /**
   * Submit vendor application (public, no auth required)
   * POST /api/v1/presents/events/:event_slug/registrations
   */
  async submitVendorApplication(eventSlug: string, data: {
    name: string
    email: string
    phone?: string
    business_name: string
    vendor_category: string
    vendor_application_id: number
    subscribed?: boolean
    instagram_handle?: string
    tiktok_handle?: string
    website?: string
    note_to_host?: string
  }) {
    return fetchApi<any>(`/v1/presents/events/${eventSlug}/registrations`, {
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
  async updateStatus(registrationId: number, status: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed') {
    return fetchApi<any>(`/v1/presents/registrations/${registrationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ registration: { status } }),
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
    return fetchApi<any[]>(`/v1/presents/events/${eventSlug}/vendor_applications`)
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
  async create(eventSlug: string, data: {
    name: string
    description?: string
    booth_price?: number
    status?: 'active' | 'inactive'
    categories?: string[]
    install_date?: string
    install_start_time?: string
    install_end_time?: string
    payment_link?: string
    application_tags?: string
  }) {
    return fetchApi<any>(`/v1/presents/events/${eventSlug}/vendor_applications`, {
      method: 'POST',
      body: JSON.stringify({ vendor_application: data }),
    })
  },

  /**
   * Update vendor application
   * PATCH /api/v1/presents/vendor_applications/:id
   */
  async update(id: number, data: Partial<{
    name: string
    description: string
    booth_price: number
    status: 'active' | 'inactive'
    categories: string[]
    install_date: string
    install_start_time: string
    install_end_time: string
    payment_link: string
    application_tags: string
  }>) {
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
  async getSubmissions(id: number, params?: {
    category?: string
    status?: string
  }) {
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
    const endpoint = organizationId ? `/email/threads?organization=${organizationId}` : '/email/threads'
    return fetchApi<any[]>(endpoint)
  }
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
  async clone(id: number, name: string, description?: string) {
    return fetchApi<EmailCampaignTemplate>(`/v1/presents/email_campaign_templates/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify({ name, description }),
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
}

// Email Template Items API (Individual emails within templates)
export const emailTemplateItemsApi = {
  /**
   * Get all email items for a template
   * GET /api/v1/presents/email_campaign_templates/:template_id/email_template_items
   */
  async getByTemplate(templateId: number) {
    return fetchApi<EmailTemplateItem[]>(
      `/v1/presents/email_campaign_templates/${templateId}/email_template_items`
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
      }
    )
  },

  /**
   * Update email item in template
   * PATCH /api/v1/presents/email_template_items/:id
   */
  async update(id: number, data: UpdateEmailRequest) {
    return fetchApi<EmailTemplateItem>(`/v1/presents/email_template_items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ email_template_item: data }),
    })
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
      }
    )
  },

  /**
   * Delete email item from template
   * DELETE /api/v1/presents/email_template_items/:id
   */
  async delete(id: number) {
    return fetchApi<void>(`/v1/presents/email_template_items/${id}`, {
      method: 'DELETE',
    })
  },
}

// Scheduled Emails API (Event-specific email instances)
export const scheduledEmailsApi = {
  /**
   * Get all scheduled emails for an event
   * GET /api/v1/presents/events/:event_slug/scheduled_emails
   */
  async getByEvent(eventSlug: string) {
    return fetchApi<ScheduledEmail[]>(`/v1/presents/events/${eventSlug}/scheduled_emails`)
  },

  /**
   * Get single scheduled email
   * GET /api/v1/presents/events/:event_slug/scheduled_emails/:id
   */
  async getById(eventSlug: string, id: number) {
    return fetchApi<ScheduledEmail>(`/v1/presents/events/${eventSlug}/scheduled_emails/${id}`)
  },

  /**
   * Generate scheduled emails for event from template
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/generate
   */
  async generate(eventSlug: string, data?: GenerateScheduledEmailsRequest) {
    return fetchApi<GenerateScheduledEmailsResponse>(
      `/v1/presents/events/${eventSlug}/scheduled_emails/generate`,
      {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }
    )
  },

  /**
   * Update scheduled email (event-specific customization)
   * PATCH /api/v1/presents/events/:event_slug/scheduled_emails/:id
   */
  async update(eventSlug: string, id: number, data: UpdateEmailRequest) {
    return fetchApi<ScheduledEmail>(`/v1/presents/events/${eventSlug}/scheduled_emails/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduled_email: data }),
    })
  },

  /**
   * Pause scheduled email
   * PATCH /api/v1/presents/events/:event_slug/scheduled_emails/:id/pause
   */
  async pause(eventSlug: string, id: number) {
    return fetchApi<ScheduledEmail>(`/v1/presents/events/${eventSlug}/scheduled_emails/${id}/pause`, {
      method: 'PATCH',
    })
  },

  /**
   * Resume paused scheduled email
   * PATCH /api/v1/presents/events/:event_slug/scheduled_emails/:id/resume
   */
  async resume(eventSlug: string, id: number) {
    return fetchApi<ScheduledEmail>(`/v1/presents/events/${eventSlug}/scheduled_emails/${id}/resume`, {
      method: 'PATCH',
    })
  },

  /**
   * Send scheduled email immediately
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/:id/send_now
   */
  async sendNow(eventSlug: string, id: number) {
    return fetchApi<SendNowResponse>(`/v1/presents/events/${eventSlug}/scheduled_emails/${id}/send_now`, {
      method: 'POST',
    })
  },

  /**
   * Preview email with resolved variables for a specific registration
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/:id/preview
   */
  async preview(eventSlug: string, id: number, data: EmailPreviewRequest) {
    return fetchApi<EmailPreviewResponse>(
      `/v1/presents/events/${eventSlug}/scheduled_emails/${id}/preview`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  },

  /**
   * Delete/cancel scheduled email
   * DELETE /api/v1/presents/events/:event_slug/scheduled_emails/:id
   */
  async delete(eventSlug: string, id: number) {
    return fetchApi<void>(`/v1/presents/events/${eventSlug}/scheduled_emails/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Save event's scheduled emails as new reusable template
   * POST /api/v1/presents/events/:event_slug/scheduled_emails/save_as_template
   */
  async saveAsTemplate(eventSlug: string, data: SaveAsTemplateRequest) {
    return fetchApi<EmailCampaignTemplate>(
      `/v1/presents/events/${eventSlug}/scheduled_emails/save_as_template`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  },
}

// Email Deliveries API (Delivery tracking and statistics)
export const emailDeliveriesApi = {
  /**
   * Get all deliveries for a scheduled email
   * GET /api/v1/presents/scheduled_emails/:scheduled_email_id/email_deliveries
   */
  async getByScheduledEmail(scheduledEmailId: number) {
    return fetchApi<EmailDelivery[]>(`/v1/presents/scheduled_emails/${scheduledEmailId}/email_deliveries`)
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
    }>(`/v1/presents/events/${eventSlug}/email_deliveries/stats`)
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
    // Admin endpoints are at root level (not /api prefix)
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/admin/user_breakdown`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch users' }))
      throw new ApiError(errorData.error || errorData.message || 'Failed to fetch users', response.status)
    }

    const data = await response.json()
    // Rails endpoint returns paginated data with { users: [...], pagination: {...} }
    return data.users || data
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

// Vendor Contacts API (Network/CRM)
export interface VendorContact {
  id: number
  organization_id: number
  contact_name: string
  business_name?: string
  job_title?: string
  email: string
  phone?: string
  contact_type: 'vendor' | 'partner' | 'sponsor' | 'staff'
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'closed'
  tags?: string[]
  notes?: string
  source: 'manual' | 'event_application'
  source_registration_id?: number
  interaction_count: number
  events_participated?: number
  last_contacted_at?: string
  imported_at?: string
  created_at: string
  updated_at: string
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
  summary: {
    total_rows: number
    created: number
    updated: number
    skipped: number
    failed: number
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
}

export const vendorContactsApi = {
  /**
   * Get all vendor contacts for an organization
   * GET /api/v1/presents/organizations/:organization_id/vendor_contacts
   */
  async getAll(organizationId: number, params?: {
    search?: string
    contact_type?: string
    status?: string
    tags?: string[]
    page?: number
    per_page?: number
    sort?: string
    order?: 'asc' | 'desc'
  }): Promise<VendorContactsListResponse> {
    const queryParams = new URLSearchParams()

    if (params?.search) queryParams.append('search', params.search)
    if (params?.contact_type) queryParams.append('contact_type', params.contact_type)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)

    const queryString = queryParams.toString()
    const endpoint = `/v1/presents/organizations/${organizationId}/vendor_contacts${queryString ? `?${queryString}` : ''}`

    const response = await fetchApi<any>(endpoint)

    // Map backend field names to frontend field names
    const mapContact = (contact: any): VendorContact => {
      const mapped: VendorContact = {
        id: contact.id,
        organization_id: contact.organization_id,
        contact_name: contact.contact_info?.name || '',
        business_name: contact.contact_info?.company_name || undefined,
        job_title: contact.contact_info?.job_title || undefined,
        email: contact.contact_info?.email || '',
        phone: contact.contact_info?.phone || undefined,
        contact_type: contact.crm_data?.contact_type || 'vendor',
        status: contact.crm_data?.status || 'new',
        tags: contact.crm_data?.tags || [],
        notes: contact.crm_data?.notes || undefined,
        source: contact.metadata?.source || 'manual',
        source_registration_id: contact.registration_id || undefined,
        interaction_count: contact.activity?.interaction_count || 0,
        last_contacted_at: contact.activity?.last_contacted_at || undefined,
        imported_at: contact.metadata?.imported_at || undefined,
        created_at: contact.metadata?.created_at || '',
        updated_at: contact.metadata?.updated_at || '',
      }
      return mapped
    }

    // Handle both array and object response formats
    if (Array.isArray(response)) {
      // Backend returned plain array
      return {
        vendor_contacts: response.map(mapContact),
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
      vendor_contacts: response.vendor_contacts?.map(mapContact) || [],
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
    const response = await fetchApi<any>(
      `/v1/presents/vendor_contacts/${id}`
    )
    const contact = response.vendor_contact || response
    return {
      id: contact.id,
      organization_id: contact.organization_id,
      contact_name: contact.contact_info?.name || '',
      business_name: contact.contact_info?.company_name || undefined,
      job_title: contact.contact_info?.job_title || undefined,
      email: contact.contact_info?.email || '',
      phone: contact.contact_info?.phone || undefined,
      contact_type: contact.crm_data?.contact_type || 'vendor',
      status: contact.crm_data?.status || 'new',
      tags: contact.crm_data?.tags || [],
      notes: contact.crm_data?.notes || undefined,
      source: contact.metadata?.source || 'manual',
      source_registration_id: contact.registration_id || undefined,
      interaction_count: contact.activity?.interaction_count || 0,
      last_contacted_at: contact.activity?.last_contacted_at || undefined,
      imported_at: contact.metadata?.imported_at || undefined,
      created_at: contact.metadata?.created_at || '',
      updated_at: contact.metadata?.updated_at || '',
    }
  },

  /**
   * Create new vendor contact
   * POST /api/v1/presents/vendor_contacts
   */
  async create(organizationId: number, data: {
    contact_name: string
    business_name?: string
    job_title?: string
    email: string
    phone?: string
    contact_type?: 'vendor' | 'partner' | 'sponsor' | 'staff'
    tags?: string[]
    notes?: string
    source?: 'manual' | 'event_application'
    vendor_id?: number
    registration_id?: number
  }): Promise<VendorContact> {
    // Backend expects FLAT structure for create (not nested)
    const backendData = {
      organization_id: organizationId,
      vendor_id: data.vendor_id,
      registration_id: data.registration_id,
      name: data.contact_name,
      email: data.email,
      phone: data.phone,
      company_name: data.business_name,
      job_title: data.job_title,
      contact_type: data.contact_type || 'vendor',
      status: 'new',
      notes: data.notes,
      tags: data.tags || [],
      source: data.source || 'manual',
    }

    const response = await fetchApi<any>(
      '/v1/presents/vendor_contacts',
      {
        method: 'POST',
        body: JSON.stringify({
          vendor_contact: backendData,
        }),
      }
    )

    // Response comes back in NESTED format from serializer
    const contact = response.vendor_contact || response

    return {
      id: contact.id,
      organization_id: contact.organization_id,
      contact_name: contact.contact_info?.name || '',
      business_name: contact.contact_info?.company_name || undefined,
      job_title: contact.contact_info?.job_title || undefined,
      email: contact.contact_info?.email || '',
      phone: contact.contact_info?.phone || undefined,
      contact_type: contact.crm_data?.contact_type || 'vendor',
      status: contact.crm_data?.status || 'new',
      tags: contact.crm_data?.tags || [],
      notes: contact.crm_data?.notes || undefined,
      source: contact.metadata?.source || 'manual',
      source_registration_id: contact.registration_id || undefined,
      interaction_count: contact.activity?.interaction_count || 0,
      last_contacted_at: contact.activity?.last_contacted_at || undefined,
      imported_at: contact.metadata?.imported_at || undefined,
      created_at: contact.metadata?.created_at || '',
      updated_at: contact.metadata?.updated_at || '',
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
    if (data.business_name !== undefined) backendData.company_name = data.business_name
    if (data.job_title !== undefined) backendData.job_title = data.job_title
    if (data.contact_type !== undefined) backendData.contact_type = data.contact_type
    if (data.status !== undefined) backendData.status = data.status
    if (data.notes !== undefined) backendData.notes = data.notes
    if (data.tags !== undefined) backendData.tags = data.tags

    const response = await fetchApi<any>(
      `/v1/presents/vendor_contacts/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          vendor_contact: backendData,
        }),
      }
    )

    // Response comes back in NESTED format from serializer
    const contact = response.vendor_contact || response

    return {
      id: contact.id,
      organization_id: contact.organization_id,
      contact_name: contact.contact_info?.name || '',
      business_name: contact.contact_info?.company_name || undefined,
      job_title: contact.contact_info?.job_title || undefined,
      email: contact.contact_info?.email || '',
      phone: contact.contact_info?.phone || undefined,
      contact_type: contact.crm_data?.contact_type || 'vendor',
      status: contact.crm_data?.status || 'new',
      tags: contact.crm_data?.tags || [],
      notes: contact.crm_data?.notes || undefined,
      source: contact.metadata?.source || 'manual',
      source_registration_id: contact.registration_id || undefined,
      interaction_count: contact.activity?.interaction_count || 0,
      last_contacted_at: contact.activity?.last_contacted_at || undefined,
      imported_at: contact.metadata?.imported_at || undefined,
      created_at: contact.metadata?.created_at || '',
      updated_at: contact.metadata?.updated_at || '',
    }
  },

  /**
   * Delete (archive) vendor contact
   * DELETE /api/v1/presents/vendor_contacts/:id
   */
  async delete(id: number): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(
      `/v1/presents/vendor_contacts/${id}`,
      {
        method: 'DELETE',
      }
    )
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
      }
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
      }
    )
    return response.vendor_contact
  },

  /**
   * Record interaction with contact
   * POST /api/v1/presents/vendor_contacts/:id/record_interaction
   */
  async recordInteraction(id: number, interactionType: string, notes?: string): Promise<VendorContact> {
    const response = await fetchApi<{ vendor_contact: VendorContact }>(
      `/v1/presents/vendor_contacts/${id}/record_interaction`,
      {
        method: 'POST',
        body: JSON.stringify({
          interaction_type: interactionType,
          notes,
        }),
      }
    )
    return response.vendor_contact
  },

  /**
   * Send bulk email to multiple contacts
   * POST /api/v1/presents/vendor_contacts/bulk_email
   *
   * NOTE: This endpoint may not be implemented yet on backend
   */
  async bulkEmail(contactIds: number[], emailData: {
    subject: string
    message: string
    htmlMessage?: string
    includeEventLink?: boolean
    eventId?: number
  }): Promise<{ emails_sent: number; failed: any[]; message: string }> {
    // Keep mock for now as bulk email may not be implemented on backend yet
    return fetchApi<{ emails_sent: number; failed: any[]; message: string }>(
      '/v1/presents/vendor_contacts/bulk_email',
      {
        method: 'POST',
        body: JSON.stringify({
          contact_ids: contactIds,
          ...emailData,
        }),
      }
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
  async importFromRegistration(registrationId: number, organizationId: number): Promise<{
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
      }
    )
  },

  /**
   * Bulk import vendor contacts from CSV file
   * POST /api/v1/presents/vendor_contacts/bulk_import
   */
  async bulkImport(
    file: File,
    options: BulkImportOptions = {}
  ): Promise<BulkImportResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('skip_duplicates', String(options.skipDuplicates ?? true))
    formData.append('update_existing', String(options.updateExisting ?? false))

    if (options.tags && options.tags.length > 0) {
      formData.append('tags', JSON.stringify(options.tags))
    }

    const response = await fetch(
      `${API_BASE_URL}/v1/presents/vendor_contacts/bulk_import`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          // Don't set Content-Type - browser will set it with boundary for multipart
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Import failed')
    }

    return response.json()
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
    company_name: string
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
    event_date?: string  // Legacy support
    venue?: string
    location: string
    age_restriction?: string
    poster_url?: string
    application_deadline: string
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

export const eventInvitationsApi = {
  /**
   * Create batch invitations for an event
   * POST /api/v1/presents/events/:event_slug/invitations/batch
   */
  async createBatch(eventSlug: string, vendorContactIds: number[]) {
    return fetchApi<{
      invitations: EventInvitation[]
      created_count: number
      errors: any[]
    }>(
      `/v1/presents/events/${eventSlug}/invitations/batch`,
      {
        method: 'POST',
        body: JSON.stringify({ vendor_contact_ids: vendorContactIds }),
      }
    )
  },

  /**
   * Get all invitations for an event
   * GET /api/v1/presents/events/:event_slug/invitations
   */
  async getByEvent(eventSlug: string, params?: { status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)

    const query = queryParams.toString()
    return fetchApi<{
      invitations: EventInvitation[]
      meta: {
        total_count: number
        pending_count: number
        sent_count: number
        accepted_count: number
        declined_count: number
        expired_count: number
      }
    }>(
      `/v1/presents/events/${eventSlug}/invitations${query ? `?${query}` : ''}`
    )
  },

  /**
   * View invitation by token (public)
   * GET /api/v1/presents/invitations/:token
   */
  async getByToken(token: string) {
    return fetchApi<{ invitation: EventInvitation }>(
      `/v1/presents/invitations/${token}`
    )
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
      }
    )
  },
}

export { ApiError }