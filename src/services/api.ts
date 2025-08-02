// API service for connecting to voxxy-presents-api backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

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
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.message || 'API request failed', response.status)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Network error', 0)
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
    name: string
    email?: string
    registrationType: 'rsvp_yes' | 'rsvp_maybe' | 'presale_request'
    phone?: string
    notes?: string
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

export { ApiError }