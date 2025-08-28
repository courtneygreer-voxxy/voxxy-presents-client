import type { OrganizationDesign } from '@/types/design'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// API Response types
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface DesignUpdateResponse {
  design: OrganizationDesign
  version: number
  updatedAt: string
}

interface DesignHistoryEntry {
  id: string
  design: OrganizationDesign
  version: number
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  comment?: string
}

// Design API Service
export class DesignService {
  private static instance: DesignService
  private abortController?: AbortController

  static getInstance(): DesignService {
    if (!DesignService.instance) {
      DesignService.instance = new DesignService()
    }
    return DesignService.instance
  }

  // Cancel any pending requests
  cancelPendingRequests(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
    this.abortController = new AbortController()
  }

  // Get current design for organization
  async getOrganizationDesign(organizationId: string): Promise<OrganizationDesign | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/design`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: this.abortController?.signal,
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null // No design saved yet
        }
        throw new Error(`Failed to fetch design: ${response.statusText}`)
      }

      const result: ApiResponse<{ design: OrganizationDesign }> = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch design')
      }

      return result.data.design
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled')
      }
      console.error('Error fetching organization design:', error)
      throw error
    }
  }

  // Save design changes
  async saveOrganizationDesign(
    organizationId: string, 
    design: OrganizationDesign,
    options?: {
      comment?: string
      publish?: boolean
    }
  ): Promise<DesignUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/design`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          design,
          comment: options?.comment,
          publish: options?.publish ?? true,
        }),
        signal: this.abortController?.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Failed to save design: ${response.statusText}`)
      }

      const result: ApiResponse<DesignUpdateResponse> = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to save design')
      }

      return result.data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled')
      }
      console.error('Error saving organization design:', error)
      throw error
    }
  }

  // Get design history/versions
  async getDesignHistory(
    organizationId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<DesignHistoryEntry[]> {
    try {
      const params = new URLSearchParams()
      if (options?.limit) params.set('limit', options.limit.toString())
      if (options?.offset) params.set('offset', options.offset.toString())

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/design/history?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: this.abortController?.signal,
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch design history: ${response.statusText}`)
      }

      const result: ApiResponse<{ history: DesignHistoryEntry[] }> = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch design history')
      }

      return result.data.history
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled')
      }
      console.error('Error fetching design history:', error)
      throw error
    }
  }

  // Restore previous design version
  async restoreDesignVersion(
    organizationId: string, 
    versionId: string,
    comment?: string
  ): Promise<DesignUpdateResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/design/restore/${versionId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment }),
          signal: this.abortController?.signal,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Failed to restore design: ${response.statusText}`)
      }

      const result: ApiResponse<DesignUpdateResponse> = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to restore design')
      }

      return result.data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled')
      }
      console.error('Error restoring design version:', error)
      throw error
    }
  }

  // Validate design before saving
  async validateDesign(
    organizationId: string, 
    design: OrganizationDesign
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/design/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ design }),
          signal: this.abortController?.signal,
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to validate design: ${response.statusText}`)
      }

      const result: ApiResponse<{ valid: boolean; errors: string[]; warnings: string[] }> = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to validate design')
      }

      return result.data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled')
      }
      console.error('Error validating design:', error)
      // Return client-side validation as fallback
      const { validateDesign: clientValidate } = await import('@/contexts/DesignContext')
      const errors = clientValidate(design)
      return {
        valid: errors.length === 0,
        errors,
        warnings: []
      }
    }
  }

  // Export design for backup/sharing
  async exportDesign(
    organizationId: string,
    format: 'json' | 'css' | 'zip' = 'json'
  ): Promise<Blob> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/design/export?format=${format}`,
        {
          method: 'GET',
          signal: this.abortController?.signal,
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to export design: ${response.statusText}`)
      }

      return response.blob()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled')
      }
      console.error('Error exporting design:', error)
      throw error
    }
  }

  // Import design from file
  async importDesign(
    organizationId: string, 
    file: File,
    merge: boolean = false
  ): Promise<{ design: OrganizationDesign; warnings: string[] }> {
    try {
      const formData = new FormData()
      formData.append('design_file', file)
      formData.append('merge', merge.toString())

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/design/import`,
        {
          method: 'POST',
          body: formData,
          signal: this.abortController?.signal,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Failed to import design: ${response.statusText}`)
      }

      const result: ApiResponse<{ design: OrganizationDesign; warnings: string[] }> = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to import design')
      }

      return result.data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled')
      }
      console.error('Error importing design:', error)
      throw error
    }
  }

  // Get design analytics/usage stats
  async getDesignAnalytics(
    organizationId: string,
    timeRange: '7d' | '30d' | '90d' = '30d'
  ): Promise<{
    pageViews: number
    uniqueVisitors: number
    conversionRate: number
    topColors: { color: string; usage: number }[]
    performanceScore: number
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/design/analytics?range=${timeRange}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: this.abortController?.signal,
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`)
      }

      const result: ApiResponse<{
        pageViews: number
        uniqueVisitors: number
        conversionRate: number
        topColors: { color: string; usage: number }[]
        performanceScore: number
      }> = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch analytics')
      }

      return result.data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled')
      }
      console.error('Error fetching design analytics:', error)
      throw error
    }
  }
}

// Singleton instance export
export const designService = DesignService.getInstance()

// Utility functions for common operations
export async function saveDesignWithOptimization(
  organizationId: string,
  design: OrganizationDesign,
  options?: {
    comment?: string
    publish?: boolean
    optimize?: boolean
  }
): Promise<DesignUpdateResponse> {
  // Pre-save optimization
  let optimizedDesign = design
  
  if (options?.optimize !== false) {
    // Optimize image URLs for performance
    if (design.background.type === 'image') {
      // Image optimization not needed for color-only design
    // const { getOptimizedImageUrl } = await import('@/services/assetProvider')
      // Skip image optimization for color-only design
      optimizedDesign = design
    }
  }

  return designService.saveOrganizationDesign(organizationId, optimizedDesign, options)
}

export async function loadDesignWithFallback(
  organizationId: string,
  fallbackDesign?: OrganizationDesign
): Promise<OrganizationDesign> {
  try {
    const design = await designService.getOrganizationDesign(organizationId)
    return design || fallbackDesign || (await import('@/contexts/DesignContext')).DEFAULT_DESIGN
  } catch (error) {
    console.warn('Failed to load design, using fallback:', error)
    return fallbackDesign || (await import('@/contexts/DesignContext')).DEFAULT_DESIGN
  }
}

// Design caching utilities
class DesignCache {
  private cache = new Map<string, { design: OrganizationDesign; timestamp: number }>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  set(organizationId: string, design: OrganizationDesign): void {
    this.cache.set(organizationId, { design, timestamp: Date.now() })
  }

  get(organizationId: string): OrganizationDesign | null {
    const cached = this.cache.get(organizationId)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(organizationId)
      return null
    }
    
    return cached.design
  }

  clear(organizationId?: string): void {
    if (organizationId) {
      this.cache.delete(organizationId)
    } else {
      this.cache.clear()
    }
  }
}

export const designCache = new DesignCache()