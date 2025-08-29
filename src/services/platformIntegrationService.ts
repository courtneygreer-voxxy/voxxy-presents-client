// Platform Integration Service - Handles third-party platform connections and data sync
import { apiCall } from './api'
import type { 
  PlatformType, 
  PlatformConnection, 
  PlatformEvent, 
  PlatformOrganization, 
  PlatformTicketSales,
  ImportPreferences,
  SyncJob,
  PlatformAuthUrl,
  PlatformAuthCallback,
  ConnectionTestResult,
  CreatePlatformConnectionData,
  UpdatePlatformConnectionData,
  CreateImportPreferencesData,
  UpdateImportPreferencesData
} from '@/types/platformIntegration'
import { 
  getAllMockConnections, 
  getAllMockEvents, 
  getAllMockOrgs,
  getMockEventsByPlatform,
  getMockOrgsByPlatform,
  getMockConnectionByPlatform,
  mockTicketSales
} from './mockPlatformData'

// Environment check for mock mode
const USE_MOCK_DATA = import.meta.env.VITE_ENVIRONMENT === 'development' || import.meta.env.VITE_USE_MOCK_PLATFORM_DATA === 'true'

/**
 * Platform Connection Management
 */

export async function getUserPlatformConnections(userId: string): Promise<PlatformConnection[]> {
  if (USE_MOCK_DATA) {
    // Return mock connections filtered by userId
    return getAllMockConnections().filter(conn => conn.userId === userId)
  }
  
  return apiCall('/platform/connections', {
    method: 'GET',
    params: { userId }
  })
}

export async function getPlatformConnection(connectionId: string): Promise<PlatformConnection> {
  if (USE_MOCK_DATA) {
    const connection = getAllMockConnections().find(conn => conn.id === connectionId)
    if (!connection) {
      throw new Error('Platform connection not found')
    }
    return connection
  }
  
  return apiCall(`/platform/connections/${connectionId}`)
}

export async function initiatePlatformAuth(platform: PlatformType, userId: string): Promise<PlatformAuthUrl> {
  if (USE_MOCK_DATA) {
    // Return mock auth URL for development
    return {
      platform,
      authUrl: `https://mock-${platform}-auth.com/oauth/authorize?client_id=mock&redirect_uri=mock&state=mock-state-${Date.now()}`,
      state: `mock-state-${Date.now()}`,
      codeVerifier: platform === 'eventbrite' ? undefined : `mock-verifier-${Date.now()}`
    }
  }
  
  return apiCall('/platform/auth/initiate', {
    method: 'POST',
    body: { platform, userId }
  })
}

export async function completePlatformAuth(authData: PlatformAuthCallback): Promise<PlatformConnection> {
  if (USE_MOCK_DATA) {
    // Return mock successful connection
    const mockConnection = getMockConnectionByPlatform(authData.platform)
    if (mockConnection) {
      return {
        ...mockConnection,
        id: `conn-${authData.platform}-${Date.now()}`,
        connectedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
    throw new Error('Failed to create mock connection')
  }
  
  return apiCall('/platform/auth/complete', {
    method: 'POST',
    body: authData
  })
}

export async function testPlatformConnection(connectionId: string): Promise<ConnectionTestResult> {
  if (USE_MOCK_DATA) {
    const connection = getAllMockConnections().find(conn => conn.id === connectionId)
    if (!connection) {
      return { success: false, error: 'Connection not found' }
    }
    
    if (connection.status === 'error') {
      return { 
        success: false, 
        error: connection.errorMessage || 'Connection has errors'
      }
    }
    
    return {
      success: true,
      accountInfo: {
        id: connection.platformUserId || '',
        name: connection.platformAccountName || '',
        email: connection.platformAccountEmail,
        url: connection.platformAccountUrl
      }
    }
  }
  
  return apiCall(`/platform/connections/${connectionId}/test`, {
    method: 'POST'
  })
}

export async function updatePlatformConnection(
  connectionId: string, 
  updates: UpdatePlatformConnectionData
): Promise<PlatformConnection> {
  if (USE_MOCK_DATA) {
    const connection = getAllMockConnections().find(conn => conn.id === connectionId)
    if (!connection) {
      throw new Error('Platform connection not found')
    }
    return {
      ...connection,
      ...updates,
      updatedAt: new Date()
    }
  }
  
  return apiCall(`/platform/connections/${connectionId}`, {
    method: 'PATCH',
    body: updates
  })
}

export async function disconnectPlatform(connectionId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    // Mock disconnection - in real implementation would remove the connection
    console.log(`Mock: Disconnected platform connection ${connectionId}`)
    return
  }
  
  return apiCall(`/platform/connections/${connectionId}`, {
    method: 'DELETE'
  })
}

/**
 * Event and Organization Data
 */

export async function getPlatformEvents(connectionId: string, filters?: {
  startDate?: Date
  endDate?: Date
  status?: string[]
  imported?: boolean
}): Promise<PlatformEvent[]> {
  if (USE_MOCK_DATA) {
    const connection = getAllMockConnections().find(conn => conn.id === connectionId)
    if (!connection) return []
    
    let events = getMockEventsByPlatform(connection.platform)
    
    // Apply filters
    if (filters?.startDate) {
      events = events.filter(event => event.startDate >= filters.startDate!)
    }
    if (filters?.endDate) {
      events = events.filter(event => event.startDate <= filters.endDate!)
    }
    if (filters?.status?.length) {
      events = events.filter(event => filters.status!.includes(event.status))
    }
    if (filters?.imported !== undefined) {
      events = events.filter(event => event.isImported === filters.imported)
    }
    
    return events
  }
  
  return apiCall(`/platform/connections/${connectionId}/events`, {
    method: 'GET',
    params: filters
  })
}

export async function getPlatformOrganizations(connectionId: string): Promise<PlatformOrganization[]> {
  if (USE_MOCK_DATA) {
    const connection = getAllMockConnections().find(conn => conn.id === connectionId)
    if (!connection) return []
    
    return getMockOrgsByPlatform(connection.platform)
  }
  
  return apiCall(`/platform/connections/${connectionId}/organizations`)
}

export async function getPlatformTicketSales(
  connectionId: string,
  eventId?: string
): Promise<PlatformTicketSales[]> {
  if (USE_MOCK_DATA) {
    let sales = mockTicketSales
    if (eventId) {
      sales = sales.filter(sale => sale.eventId === eventId)
    }
    return sales
  }
  
  return apiCall(`/platform/connections/${connectionId}/tickets`, {
    method: 'GET',
    params: eventId ? { eventId } : undefined
  })
}

/**
 * Import and Sync Operations
 */

export async function importPlatformEvents(
  connectionId: string,
  eventIds: string[],
  organizationId: string,
  preferences?: Partial<ImportPreferences>
): Promise<SyncJob> {
  if (USE_MOCK_DATA) {
    const mockJob: SyncJob = {
      id: `job-import-${Date.now()}`,
      connectionId,
      type: 'import_events',
      status: 'running',
      totalItems: eventIds.length,
      processedItems: 0,
      failedItems: 0,
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Simulate async processing
    setTimeout(() => {
      mockJob.status = 'completed'
      mockJob.processedItems = eventIds.length
      mockJob.completedAt = new Date()
      mockJob.results = {
        eventsImported: eventIds.length,
        eventsUpdated: 0,
        eventsSkipped: 0
      }
    }, 2000)
    
    return mockJob
  }
  
  return apiCall('/platform/import/events', {
    method: 'POST',
    body: {
      connectionId,
      eventIds,
      organizationId,
      preferences
    }
  })
}

export async function importPlatformOrganization(
  connectionId: string,
  platformOrgId: string
): Promise<SyncJob> {
  if (USE_MOCK_DATA) {
    const mockJob: SyncJob = {
      id: `job-import-org-${Date.now()}`,
      connectionId,
      type: 'import_organization',
      status: 'running',
      totalItems: 1,
      processedItems: 0,
      failedItems: 0,
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Simulate async processing
    setTimeout(() => {
      mockJob.status = 'completed'
      mockJob.processedItems = 1
      mockJob.completedAt = new Date()
      mockJob.results = {
        organizationsImported: 1,
        organizationsUpdated: 0
      }
    }, 1500)
    
    return mockJob
  }
  
  return apiCall('/platform/import/organization', {
    method: 'POST',
    body: {
      connectionId,
      platformOrgId
    }
  })
}

export async function syncPlatformData(connectionId: string, syncType: 'full_sync' | 'incremental_sync'): Promise<SyncJob> {
  if (USE_MOCK_DATA) {
    const mockJob: SyncJob = {
      id: `job-sync-${Date.now()}`,
      connectionId,
      type: syncType,
      status: 'running',
      totalItems: 10, // Mock total items
      processedItems: 0,
      failedItems: 0,
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Simulate async processing with progress updates
    setTimeout(() => {
      mockJob.status = 'completed'
      mockJob.processedItems = 10
      mockJob.completedAt = new Date()
      mockJob.duration = 3000
      mockJob.results = {
        eventsImported: 3,
        eventsUpdated: 5,
        eventsSkipped: 2,
        organizationsUpdated: 1
      }
    }, 3000)
    
    return mockJob
  }
  
  return apiCall('/platform/sync', {
    method: 'POST',
    body: {
      connectionId,
      syncType
    }
  })
}

export async function getSyncJob(jobId: string): Promise<SyncJob> {
  if (USE_MOCK_DATA) {
    // Return a mock completed job
    return {
      id: jobId,
      connectionId: 'mock-connection',
      type: 'full_sync',
      status: 'completed',
      totalItems: 10,
      processedItems: 10,
      failedItems: 0,
      startedAt: new Date(Date.now() - 30000),
      completedAt: new Date(),
      duration: 30000,
      results: {
        eventsImported: 3,
        eventsUpdated: 5,
        eventsSkipped: 2,
        organizationsUpdated: 1
      },
      createdAt: new Date(Date.now() - 30000),
      updatedAt: new Date()
    }
  }
  
  return apiCall(`/platform/sync/jobs/${jobId}`)
}

/**
 * Import Preferences Management
 */

export async function getUserImportPreferences(userId: string, organizationId?: string): Promise<ImportPreferences | null> {
  if (USE_MOCK_DATA) {
    // Return mock preferences
    return {
      userId,
      organizationId,
      importEvents: true,
      importOrganizationInfo: true,
      importAttendees: false,
      importTicketSales: true,
      autoImport: false,
      importFrequency: 'manual',
      onConflict: 'ask',
      importPastEvents: false,
      importFutureEvents: true,
      futureEventsDays: 365,
      onlyMyEvents: true,
      eventStatusFilter: ['published', 'presale'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  try {
    return await apiCall('/platform/preferences', {
      method: 'GET',
      params: { userId, organizationId }
    })
  } catch (error) {
    // Return null if preferences don't exist yet
    return null
  }
}

export async function saveImportPreferences(preferences: CreateImportPreferencesData): Promise<ImportPreferences> {
  if (USE_MOCK_DATA) {
    return {
      ...preferences,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  return apiCall('/platform/preferences', {
    method: 'POST',
    body: preferences
  })
}

export async function updateImportPreferences(
  userId: string,
  updates: UpdateImportPreferencesData,
  organizationId?: string
): Promise<ImportPreferences> {
  if (USE_MOCK_DATA) {
    const existing = await getUserImportPreferences(userId, organizationId)
    return {
      ...existing!,
      ...updates,
      updatedAt: new Date()
    }
  }
  
  return apiCall('/platform/preferences', {
    method: 'PATCH',
    body: { userId, organizationId, ...updates }
  })
}

/**
 * Cross-Platform Analytics
 */

export async function getCrossPlatformEventAnalytics(organizationId: string): Promise<{
  totalEvents: number
  totalTicketsSold: number
  totalRevenue: number
  platformBreakdown: Array<{
    platform: PlatformType
    events: number
    ticketsSold: number
    revenue: number
  }>
  recentEvents: PlatformEvent[]
}> {
  if (USE_MOCK_DATA) {
    return {
      totalEvents: 12,
      totalTicketsSold: 847,
      totalRevenue: 18925,
      platformBreakdown: [
        { platform: 'eventbrite', events: 8, ticketsSold: 623, revenue: 13475 },
        { platform: 'luma', events: 3, ticketsSold: 124, revenue: 2450 },
        { platform: 'meetup', events: 1, ticketsSold: 100, revenue: 3000 }
      ],
      recentEvents: getAllMockEvents().slice(0, 5)
    }
  }
  
  return apiCall(`/platform/analytics/events`, {
    method: 'GET',
    params: { organizationId }
  })
}