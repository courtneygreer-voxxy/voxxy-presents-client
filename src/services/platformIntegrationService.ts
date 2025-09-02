// Platform Integration Service - Handles third-party platform connections and data sync
// Currently uses mock data for development - real API integration coming soon

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

/**
 * Platform Connection Management
 */

export async function getUserPlatformConnections(userId: string): Promise<PlatformConnection[]> {
  // Always use mock data for now - real API integration coming soon
  return getAllMockConnections().filter(conn => conn.userId === userId)
}

export async function getPlatformConnection(connectionId: string): Promise<PlatformConnection> {
  const connection = getAllMockConnections().find(conn => conn.id === connectionId)
  if (!connection) {
    throw new Error('Platform connection not found')
  }
  return connection
}

export async function initiatePlatformAuth(platform: PlatformType, userId: string): Promise<PlatformAuthUrl> {
  // Return mock auth URL for development
  return {
    platform,
    authUrl: `https://mock-${platform}-auth.com/oauth/authorize?client_id=mock&redirect_uri=mock&state=mock-state-${Date.now()}`,
    state: `mock-state-${Date.now()}`,
    codeVerifier: platform === 'eventbrite' ? undefined : `mock-verifier-${Date.now()}`
  }
}

export async function completePlatformAuth(authData: PlatformAuthCallback): Promise<PlatformConnection> {
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

export async function testPlatformConnection(connectionId: string): Promise<ConnectionTestResult> {
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

export async function updatePlatformConnection(
  connectionId: string, 
  updates: UpdatePlatformConnectionData
): Promise<PlatformConnection> {
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

export async function disconnectPlatform(connectionId: string): Promise<void> {
  // Mock disconnection - in real implementation would remove the connection
  console.log(`Mock: Disconnected platform connection ${connectionId}`)
  return
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

export async function getPlatformOrganizations(connectionId: string): Promise<PlatformOrganization[]> {
  const connection = getAllMockConnections().find(conn => conn.id === connectionId)
  if (!connection) return []
  
  return getMockOrgsByPlatform(connection.platform)
}

export async function getPlatformTicketSales(
  connectionId: string,
  eventId?: string
): Promise<PlatformTicketSales[]> {
  let sales = mockTicketSales
  if (eventId) {
    sales = sales.filter(sale => sale.eventId === eventId)
  }
  return sales
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

export async function importPlatformOrganization(
  connectionId: string,
  platformOrgId: string
): Promise<SyncJob> {
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

export async function syncPlatformData(connectionId: string, syncType: 'full_sync' | 'incremental_sync'): Promise<SyncJob> {
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

export async function getSyncJob(jobId: string): Promise<SyncJob> {
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

/**
 * Import Preferences Management
 */

export async function getUserImportPreferences(userId: string, organizationId?: string): Promise<ImportPreferences | null> {
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

export async function saveImportPreferences(preferences: CreateImportPreferencesData): Promise<ImportPreferences> {
  return {
    ...preferences,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export async function updateImportPreferences(
  userId: string,
  updates: UpdateImportPreferencesData,
  organizationId?: string
): Promise<ImportPreferences> {
  const existing = await getUserImportPreferences(userId, organizationId)
  return {
    ...existing!,
    ...updates,
    updatedAt: new Date()
  }
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
  return {
    totalEvents: 8,
    totalTicketsSold: 623,
    totalRevenue: 13475,
    platformBreakdown: [
      { platform: 'eventbrite', events: 8, ticketsSold: 623, revenue: 13475 }
    ],
    recentEvents: getAllMockEvents().slice(0, 5)
  }
}