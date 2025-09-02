// Profile-level Platform Integration Service
// Handles platform connections at the user profile level for event sync and management

import { doc, updateDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { 
  PlatformType, 
  PlatformConnection, 
  PlatformEvent, 
  CreatePlatformConnectionData,
  UpdatePlatformConnectionData,
  PlatformAuthUrl,
  PlatformAuthCallback,
  ConnectionTestResult,
  SyncJob
} from '@/types/platformIntegration'
import { 
  initiatePlatformAuth,
  completePlatformAuth,
  testPlatformConnection,
  getPlatformEvents,
  syncPlatformData as syncPlatformDataBase
} from './platformIntegrationService'

/**
 * Profile-Level Platform Connection Management
 * These functions handle platform integrations at the user profile level
 */

export async function getUserProfileConnections(userId: string): Promise<PlatformConnection[]> {
  try {
    const connectionsRef = collection(db, 'platformConnections')
    const q = query(connectionsRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PlatformConnection[]
  } catch (error) {
    console.error('Failed to fetch user platform connections:', error)
    // Fall back to mock data for development
    return []
  }
}

export async function createProfileConnection(
  userId: string, 
  connectionData: Omit<CreatePlatformConnectionData, 'userId'>
): Promise<PlatformConnection> {
  try {
    const newConnection: CreatePlatformConnectionData = {
      ...connectionData,
      userId,
      connectedAt: new Date(),
      syncSettings: {
        autoSync: false,
        syncFrequency: 'manual',
        syncEvents: true,
        syncOrganizationInfo: false,
        syncAttendees: false
      }
    }

    const connectionsRef = collection(db, 'platformConnections')
    const docRef = await addDoc(connectionsRef, {
      ...newConnection,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Update user profile with new connection ID
    await updateUserPlatformConnections(userId, docRef.id, 'add')

    return {
      id: docRef.id,
      ...newConnection,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  } catch (error) {
    console.error('Failed to create platform connection:', error)
    throw new Error('Failed to create platform connection')
  }
}

export async function updateProfileConnection(
  connectionId: string,
  updates: UpdatePlatformConnectionData
): Promise<PlatformConnection> {
  try {
    const connectionRef = doc(db, 'platformConnections', connectionId)
    const updateData = {
      ...updates,
      updatedAt: new Date()
    }
    
    await updateDoc(connectionRef, updateData)
    
    // Return updated connection (in a real app, you'd fetch from DB)
    const existingConnection = await getProfileConnection(connectionId)
    return {
      ...existingConnection,
      ...updateData
    }
  } catch (error) {
    console.error('Failed to update platform connection:', error)
    throw new Error('Failed to update platform connection')
  }
}

export async function getProfileConnection(connectionId: string): Promise<PlatformConnection> {
  try {
    // For now, use the existing service which has mock data
    const connections = await getUserProfileConnections('current-user')
    const connection = connections.find(conn => conn.id === connectionId)
    
    if (!connection) {
      throw new Error('Connection not found')
    }
    
    return connection
  } catch (error) {
    console.error('Failed to fetch platform connection:', error)
    throw new Error('Failed to fetch platform connection')
  }
}

export async function removeProfileConnection(userId: string, connectionId: string): Promise<void> {
  try {
    // Remove from Firestore
    const connectionRef = doc(db, 'platformConnections', connectionId)
    await deleteDoc(connectionRef)

    // Update user profile to remove connection ID
    await updateUserPlatformConnections(userId, connectionId, 'remove')
  } catch (error) {
    console.error('Failed to remove platform connection:', error)
    throw new Error('Failed to remove platform connection')
  }
}

async function updateUserPlatformConnections(
  userId: string, 
  connectionId: string, 
  action: 'add' | 'remove'
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId)
    
    if (action === 'add') {
      // Add connection ID to user's platformConnections array
      await updateDoc(userRef, {
        platformConnections: [...(await getCurrentPlatformConnections(userId)), connectionId],
        updatedAt: new Date()
      })
    } else {
      // Remove connection ID from user's platformConnections array
      const currentConnections = await getCurrentPlatformConnections(userId)
      const updatedConnections = currentConnections.filter(id => id !== connectionId)
      
      await updateDoc(userRef, {
        platformConnections: updatedConnections,
        updatedAt: new Date()
      })
    }
  } catch (error) {
    console.error('Failed to update user platform connections:', error)
    // Don't throw here as the connection operation might have succeeded
  }
}

async function getCurrentPlatformConnections(userId: string): Promise<string[]> {
  try {
    const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', userId)))
    if (!userDoc.empty) {
      const userData = userDoc.docs[0].data()
      return userData.platformConnections || []
    }
    return []
  } catch (error) {
    console.error('Failed to get current platform connections:', error)
    return []
  }
}

/**
 * Profile-Level Platform Authentication
 * Wraps the base auth functions but stores connections at profile level
 */

export async function initiateProfileAuth(platform: PlatformType, userId: string): Promise<PlatformAuthUrl> {
  // Use existing auth initiation
  return initiatePlatformAuth(platform, userId)
}

export async function completeProfileAuth(
  authData: PlatformAuthCallback,
  userId: string
): Promise<PlatformConnection> {
  try {
    // Complete the OAuth flow
    const baseConnection = await completePlatformAuth(authData)
    
    // Create a profile-level connection record
    return createProfileConnection(userId, {
      platform: baseConnection.platform,
      status: baseConnection.status,
      accessToken: baseConnection.accessToken,
      refreshToken: baseConnection.refreshToken,
      tokenExpiresAt: baseConnection.tokenExpiresAt,
      authScope: baseConnection.authScope,
      platformUserId: baseConnection.platformUserId,
      platformUsername: baseConnection.platformUsername,
      platformAccountName: baseConnection.platformAccountName,
      platformAccountEmail: baseConnection.platformAccountEmail,
      platformAccountUrl: baseConnection.platformAccountUrl,
      connectedAt: new Date(),
      syncSettings: baseConnection.syncSettings
    })
  } catch (error) {
    console.error('Failed to complete profile auth:', error)
    throw new Error('Failed to complete platform authentication')
  }
}

/**
 * Profile-Level Event Management
 * Handles event sync and management for profile-connected platforms
 */

export async function getProfilePlatformEvents(
  userId: string,
  filters?: {
    platform?: PlatformType
    startDate?: Date
    endDate?: Date
    status?: string[]
    imported?: boolean
  }
): Promise<PlatformEvent[]> {
  try {
    const connections = await getUserProfileConnections(userId)
    
    if (connections.length === 0) {
      return []
    }

    let allEvents: PlatformEvent[] = []
    
    for (const connection of connections) {
      if (filters?.platform && connection.platform !== filters.platform) {
        continue
      }
      
      try {
        const events = await getPlatformEvents(connection.id, filters)
        allEvents = [...allEvents, ...events]
      } catch (error) {
        console.error(`Failed to fetch events for connection ${connection.id}:`, error)
        // Continue with other connections
      }
    }

    return allEvents
  } catch (error) {
    console.error('Failed to fetch profile platform events:', error)
    return []
  }
}

export async function syncProfileConnection(
  connectionId: string,
  syncType: 'full_sync' | 'incremental_sync' = 'incremental_sync'
): Promise<SyncJob> {
  try {
    // Use existing sync functionality
    return syncPlatformDataBase(connectionId, syncType)
  } catch (error) {
    console.error('Failed to sync profile connection:', error)
    throw new Error('Failed to sync platform connection')
  }
}

/**
 * Profile-Level Connection Testing
 */

export async function testProfileConnection(connectionId: string): Promise<ConnectionTestResult> {
  try {
    // Use existing connection testing
    return testPlatformConnection(connectionId)
  } catch (error) {
    console.error('Failed to test profile connection:', error)
    return {
      success: false,
      error: 'Failed to test connection'
    }
  }
}

/**
 * Profile-Level Sync Settings Management
 */

export async function updateProfileSyncSettings(
  connectionId: string,
  syncSettings: PlatformConnection['syncSettings']
): Promise<void> {
  try {
    await updateProfileConnection(connectionId, { syncSettings })
  } catch (error) {
    console.error('Failed to update sync settings:', error)
    throw new Error('Failed to update sync settings')
  }
}

/**
 * Profile-Level Event Assignment
 * For assigning imported events to clubs/organizations
 */

export interface EventAssignment {
  eventId: string
  organizationId: string
  assignedAt: Date
  assignedBy: string
}

export async function assignEventToClub(
  userId: string,
  platformEventId: string,
  organizationId: string
): Promise<EventAssignment> {
  try {
    const assignment: EventAssignment = {
      eventId: platformEventId,
      organizationId,
      assignedAt: new Date(),
      assignedBy: userId
    }

    const assignmentsRef = collection(db, 'eventAssignments')
    await addDoc(assignmentsRef, assignment)

    return assignment
  } catch (error) {
    console.error('Failed to assign event to club:', error)
    throw new Error('Failed to assign event to club')
  }
}

export async function getUnassignedEvents(userId: string): Promise<PlatformEvent[]> {
  try {
    // Get all profile events
    const allEvents = await getProfilePlatformEvents(userId)
    
    // Get all assigned events
    const assignmentsRef = collection(db, 'eventAssignments')
    const assignmentsSnapshot = await getDocs(assignmentsRef)
    const assignedEventIds = new Set(assignmentsSnapshot.docs.map(doc => doc.data().eventId))

    // Return events that aren't assigned
    return allEvents.filter(event => !assignedEventIds.has(event.id))
  } catch (error) {
    console.error('Failed to get unassigned events:', error)
    return []
  }
}