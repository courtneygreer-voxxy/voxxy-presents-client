# Rails API Implementation Patterns for Frontend

This document shows concrete code examples for common migration tasks.

## 1. Authentication Service

### Create Rails Auth Service

```typescript
// src/services/railsAuthService.ts

interface LoginResponse {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin'
  token: string
  confirmed_at: string
  // ... other user fields
}

interface SignUpData {
  email: string
  password: string
  name: string
  role?: string
}

interface User {
  id: number
  email: string
  name: string
  role: string
  confirmed_at?: string
}

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

export class RailsAuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/shared/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mobile-App': 'true'
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    return response.json()
  }

  static async signup(data: SignUpData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/shared/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: data })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0] || 'Signup failed')
    }

    return response.json()
  }

  static async logout(token: string): Promise<void> {
    await fetch(`${API_BASE_URL}/v1/shared/logout`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  }

  static async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/v1/shared/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }

    return response.json()
  }

  static saveToken(token: string): void {
    localStorage.setItem('railsAuthToken', token)
  }

  static getToken(): string | null {
    return localStorage.getItem('railsAuthToken')
  }

  static clearToken(): void {
    localStorage.removeItem('railsAuthToken')
  }
}
```

## 2. API Client Hook

```typescript
// src/hooks/useRailsApi.ts

import { useState, useCallback } from 'react'
import { RailsAuthService } from '@/services/railsAuthService'

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

interface ApiError {
  status: number
  error?: string
  errors?: string[]
}

export function useRailsApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const request = useCallback(async <T,>(
    endpoint: string,
    options?: {
      method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
      body?: any
      requiresAuth?: boolean
    }
  ): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)

      const token = RailsAuthService.getToken()
      const requiresAuth = options?.requiresAuth !== false

      if (requiresAuth && !token) {
        throw { status: 401, error: 'Not authenticated' }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (token && requiresAuth) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const fetchOptions: RequestInit = {
        method: options?.method || 'GET',
        headers
      }

      if (options?.body) {
        fetchOptions.body = JSON.stringify(options.body)
      }

      const response = await fetch(
        `${API_BASE_URL}/v1${endpoint}`,
        fetchOptions
      )

      if (!response.ok) {
        const errorData = await response.json()
        const apiError: ApiError = {
          status: response.status,
          error: errorData.error,
          errors: errorData.errors
        }
        setError(apiError)
        throw apiError
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null
      }

      const data: T = await response.json()
      return data
    } catch (err) {
      if (err instanceof Error && 'status' in err) {
        setError(err as ApiError)
      } else {
        setError({ status: 0, error: 'Unknown error' })
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback(<T,>(endpoint: string, requiresAuth = true) =>
    request<T>(endpoint, { method: 'GET', requiresAuth })
  , [request])

  const post = useCallback(<T,>(endpoint: string, body?: any, requiresAuth = true) =>
    request<T>(endpoint, { method: 'POST', body, requiresAuth })
  , [request])

  const patch = useCallback(<T,>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body, requiresAuth: true })
  , [request])

  const delete_ = useCallback(<T,>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE', requiresAuth: true })
  , [request])

  return { get, post, patch, delete: delete_, loading, error }
}
```

## 3. Updated Auth Context

```typescript
// src/contexts/AuthContext.tsx (Rails version)

import React, { createContext, useContext, useEffect, useState } from 'react'
import { RailsAuthService } from '@/services/railsAuthService'

interface User {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin'
  confirmed_at?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  
  isAuthenticated: boolean
  isVendor: boolean
  isVenueOwner: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Restore session on mount
  useEffect(() => {
    const storedToken = RailsAuthService.getToken()
    if (storedToken) {
      RailsAuthService.getCurrentUser(storedToken)
        .then(userData => {
          setUser(userData)
          setToken(storedToken)
        })
        .catch(() => {
          // Token invalid or expired
          RailsAuthService.clearToken()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await RailsAuthService.login(email, password)
      
      setUser({
        id: response.id,
        email: response.email,
        name: response.name,
        role: response.role
      })
      setToken(response.token)
      RailsAuthService.saveToken(response.token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await RailsAuthService.signup({
        email,
        password,
        name,
        role: 'consumer'
      })
      
      setUser({
        id: response.id,
        email: response.email,
        name: response.name,
        role: response.role
      })
      setToken(response.token)
      RailsAuthService.saveToken(response.token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      if (token) {
        await RailsAuthService.logout(token)
      }
    } finally {
      setUser(null)
      setToken(null)
      RailsAuthService.clearToken()
    }
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isVendor: user?.role === 'vendor',
    isVenueOwner: user?.role === 'venue_owner',
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

## 4. Vendor API Service

```typescript
// src/services/vendorService.ts

import { useRailsApi } from '@/hooks/useRailsApi'

export interface Vendor {
  id: number
  name: string
  slug: string
  vendor_type: 'venue' | 'catering' | 'entertainment' | 'market_vendor'
  description: string
  logo_url?: string
  website?: string
  instagram_handle?: string
  contact: {
    email: string
    phone: string
    website?: string
    instagram?: string
  }
  location: {
    city: string
    state: string
    latitude: number
    longitude: number
  }
  services: Record<string, any>
  pricing: Record<string, any>
  stats: {
    rating: number
    views_count: number
    verified: boolean
    active: boolean
  }
  created_at: string
  updated_at: string
}

export function useVendorApi() {
  const { get, post, patch, delete: delete_, loading, error } = useRailsApi()

  return {
    listVendors: () => get<Vendor[]>('/presents/vendors'),
    
    getVendor: (id: string) => get<Vendor>(`/presents/vendors/${id}`),
    
    searchVendors: (query: string, filters?: {
      vendor_type?: string
      city?: string
      state?: string
      verified?: boolean
    }) => {
      const params = new URLSearchParams()
      if (query) params.append('query', query)
      if (filters?.vendor_type) params.append('vendor_type', filters.vendor_type)
      if (filters?.city) params.append('city', filters.city)
      if (filters?.state) params.append('state', filters.state)
      if (filters?.verified) params.append('verified', 'true')
      
      return get<Vendor[]>(`/presents/vendors/search?${params.toString()}`)
    },
    
    createVendor: (data: Partial<Vendor>) =>
      post<Vendor>('/presents/vendors', { vendor: data }),
    
    updateVendor: (id: string, data: Partial<Vendor>) =>
      patch<Vendor>(`/presents/vendors/${id}`, { vendor: data }),
    
    deleteVendor: (id: string) =>
      delete_(`/presents/vendors/${id}`),
    
    loading,
    error
  }
}
```

## 5. Vendor Component Example

```typescript
// src/components/VendorList.tsx

import { useEffect, useState } from 'react'
import { useVendorApi, type Vendor } from '@/services/vendorService'
import { useAuth } from '@/contexts/AuthContext'

export function VendorList() {
  const { isAuthenticated } = useAuth()
  const { listVendors, searchVendors, loading, error } = useVendorApi()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    vendor_type: ''
  })

  useEffect(() => {
    const loadVendors = async () => {
      if (searchQuery || filters.city || filters.state || filters.vendor_type) {
        const results = await searchVendors(searchQuery, {
          city: filters.city || undefined,
          state: filters.state || undefined,
          vendor_type: filters.vendor_type || undefined
        })
        if (results) setVendors(results)
      } else {
        const results = await listVendors()
        if (results) setVendors(results)
      }
    }

    loadVendors()
  }, [searchQuery, filters])

  if (loading) return <div>Loading vendors...</div>
  if (error) return <div>Error: {error.error}</div>

  return (
    <div>
      <div className="search-filters">
        <input
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        />
        <input
          placeholder="State"
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
        />
        <select
          value={filters.vendor_type}
          onChange={(e) => setFilters({ ...filters, vendor_type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="venue">Venue</option>
          <option value="catering">Catering</option>
          <option value="entertainment">Entertainment</option>
          <option value="market_vendor">Market Vendor</option>
        </select>
      </div>

      <div className="vendor-grid">
        {vendors.map(vendor => (
          <div key={vendor.id} className="vendor-card">
            <h3>{vendor.name}</h3>
            <p>{vendor.description}</p>
            <p>{vendor.location.city}, {vendor.location.state}</p>
            <div className="stats">
              <span>Rating: {vendor.stats.rating}</span>
              <span>Views: {vendor.stats.views_count}</span>
              {vendor.stats.verified && <span>Verified</span>}
            </div>
            {isAuthenticated && (
              <button onClick={() => window.location.href = `/vendors/${vendor.slug}`}>
                View Details
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 6. Organization Service

```typescript
// src/services/organizationService.ts

import { useRailsApi } from '@/hooks/useRailsApi'

export interface Organization {
  id: number
  name: string
  slug: string
  description: string
  logo_url?: string
  website?: string
  instagram_handle?: string
  contact: {
    email: string
    phone: string
    website?: string
    instagram?: string
  }
  location: {
    address: string
    city: string
    state: string
    zip_code: string
    latitude: number
    longitude: number
  }
  verified: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export function useOrganizationApi() {
  const { get, post, patch, delete: delete_ } = useRailsApi()

  return {
    listOrganizations: () => get<Organization[]>('/presents/organizations'),
    
    getOrganization: (id: string) =>
      get<Organization>(`/presents/organizations/${id}`),
    
    createOrganization: (data: Partial<Organization>) =>
      post<Organization>('/presents/organizations', { organization: data }),
    
    updateOrganization: (id: string, data: Partial<Organization>) =>
      patch<Organization>(`/presents/organizations/${id}`, { organization: data }),
    
    deleteOrganization: (id: string) =>
      delete_(`/presents/organizations/${id}`)
  }
}
```

## 7. Error Handling Helper

```typescript
// src/utils/errorHandler.ts

export interface ApiError {
  status: number
  error?: string
  errors?: string[]
}

export function getErrorMessage(error: ApiError | null): string {
  if (!error) return 'Unknown error'

  switch (error.status) {
    case 401:
      return 'Please log in to continue'
    case 403:
      return 'You do not have permission to perform this action'
    case 404:
      return 'Resource not found'
    case 422:
      return error.errors?.join(', ') || 'Validation failed'
    case 429:
      return 'Too many requests. Please wait before trying again'
    default:
      return error.error || 'An error occurred'
  }
}

export function handleApiError(error: ApiError | null, onUnauthorized?: () => void) {
  if (error?.status === 401) {
    onUnauthorized?.()
  }
}
```

## 8. Login Form Example

```typescript
// src/components/LoginForm.tsx

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/utils/errorHandler'

export function LoginForm() {
  const { signIn, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, password)
      // Redirect or show success
    } catch (err) {
      // Error is shown via error state
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{getErrorMessage(error)}</div>}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit">Sign In</button>
    </form>
  )
}
```

---

## Key Takeaways

1. **Always include Authorization header** for authenticated endpoints
2. **Store JWT token** in localStorage with key `railsAuthToken`
3. **Handle 401 errors** to trigger re-authentication
4. **Check user role** before showing vendor/admin features
5. **Implement proper error handling** for 422 validation errors
6. **Use custom hooks** for API calls to keep components clean
7. **Test with cURL** before integrating with React

