import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Plus, AlertCircle } from "lucide-react"
import { PlatformConnectionCard } from './PlatformConnectionCard'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import type { PlatformConnection, PlatformType } from '@/types/platformIntegration'
import {
  getUserPlatformConnections,
  initiatePlatformAuth,
  testPlatformConnection,
  syncPlatformData,
  disconnectPlatform,
  updatePlatformConnection
} from '@/services/platformIntegrationService'

interface PlatformConnectionManagerProps {
  organizationId?: string
  showAddConnection?: boolean
  compact?: boolean
}

const supportedPlatforms: PlatformType[] = ['eventbrite', 'luma', 'meetup']

export function PlatformConnectionManager({ 
  organizationId, 
  showAddConnection = true,
  compact = false 
}: PlatformConnectionManagerProps) {
  const [connections, setConnections] = useState<PlatformConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  
  const { currentUser } = useAuth()
  const { toast } = useToast()

  // Load connections on mount and when user changes
  useEffect(() => {
    if (currentUser) {
      loadConnections()
    }
  }, [currentUser])

  const loadConnections = async () => {
    if (!currentUser) return

    try {
      setError(null)
      const userConnections = await getUserPlatformConnections(currentUser.uid)
      
      // Filter by organization if specified
      const filteredConnections = organizationId 
        ? userConnections.filter(conn => conn.organizationId === organizationId)
        : userConnections

      // Ensure we have entries for all supported platforms
      const connectionMap = new Map(filteredConnections.map(conn => [conn.platform, conn]))
      
      const allConnections: PlatformConnection[] = supportedPlatforms.map(platform => {
        const existing = connectionMap.get(platform)
        if (existing) {
          return existing
        }
        
        // Create placeholder for disconnected platform
        return {
          id: `placeholder-${platform}`,
          userId: currentUser.uid,
          organizationId,
          platform,
          status: 'disconnected',
          connectedAt: new Date(),
          syncSettings: {
            autoSync: false,
            syncFrequency: 'manual',
            syncEvents: true,
            syncOrganizationInfo: true,
            syncAttendees: false
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      setConnections(allConnections)
    } catch (err) {
      console.error('Failed to load platform connections:', err)
      setError('Failed to load platform connections. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (platform: PlatformType) => {
    if (!currentUser) return

    try {
      // Initiate OAuth flow
      const authData = await initiatePlatformAuth(platform, currentUser.uid)
      
      // In a real implementation, this would redirect to the OAuth URL
      // For now, we'll simulate a successful connection
      if (authData.authUrl.includes('mock-')) {
        toast({
          title: "Mock Connection",
          description: `Simulated connection to ${platform}. In production, this would open the OAuth flow.`
        })
        
        // Simulate successful connection after a delay
        setTimeout(() => {
          loadConnections()
          toast({
            title: "Connected",
            description: `Successfully connected to ${platform}!`
          })
        }, 2000)
      } else {
        // Real OAuth flow - redirect to auth URL
        window.location.href = authData.authUrl
      }
    } catch (err) {
      console.error(`Failed to connect to ${platform}:`, err)
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: `Failed to connect to ${platform}. Please try again.`
      })
    }
  }

  const handleDisconnect = async (connectionId: string) => {
    try {
      await disconnectPlatform(connectionId)
      toast({
        title: "Disconnected",
        description: "Platform connection removed successfully."
      })
      await loadConnections()
    } catch (err) {
      console.error('Failed to disconnect platform:', err)
      toast({
        variant: "destructive",
        title: "Disconnect Failed",
        description: "Failed to disconnect platform. Please try again."
      })
    }
  }

  const handleTest = async (connectionId: string) => {
    try {
      const result = await testPlatformConnection(connectionId)
      
      if (result.success) {
        toast({
          title: "Connection Test Successful",
          description: `Connected to ${result.accountInfo?.name || 'account'}`
        })
      } else {
        toast({
          variant: "destructive",
          title: "Connection Test Failed",
          description: result.error || "Unknown error occurred"
        })
      }
    } catch (err) {
      console.error('Failed to test connection:', err)
      toast({
        variant: "destructive",
        title: "Test Failed",
        description: "Failed to test connection. Please try again."
      })
    }
  }

  const handleSync = async (connectionId: string) => {
    try {
      const syncJob = await syncPlatformData(connectionId, 'incremental_sync')
      
      toast({
        title: "Sync Started",
        description: `Syncing platform data. Job ID: ${syncJob.id}`
      })
      
      // In a real implementation, you might poll for job status
      // For now, refresh connections after a delay
      setTimeout(() => {
        loadConnections()
        toast({
          title: "Sync Complete",
          description: "Platform data synchronized successfully!"
        })
      }, 3000)
    } catch (err) {
      console.error('Failed to sync platform data:', err)
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Failed to sync platform data. Please try again."
      })
    }
  }

  const handleUpdateSettings = async (connectionId: string, settings: any) => {
    try {
      await updatePlatformConnection(connectionId, settings)
      toast({
        title: "Settings Updated",
        description: "Connection settings updated successfully."
      })
      await loadConnections()
    } catch (err) {
      console.error('Failed to update connection settings:', err)
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update connection settings. Please try again."
      })
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadConnections()
    setRefreshing(false)
  }

  const connectedCount = connections.filter(conn => conn.status === 'connected').length
  const errorCount = connections.filter(conn => conn.status === 'error').length

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Connections</h2>
            <p className="text-gray-600">
              Connect your Eventbrite, Luma, and Meetup accounts to sync events and data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      )}

      {/* Status Summary */}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{connectedCount}</div>
                <div className="text-sm text-gray-600">Connected</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{supportedPlatforms.length}</div>
                <div className="text-sm text-gray-600">Platforms</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connection Cards */}
      <div className="space-y-4">
        {connections.map(connection => (
          <PlatformConnectionCard
            key={connection.id}
            connection={connection}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onTest={handleTest}
            onSync={handleSync}
            onUpdateSettings={handleUpdateSettings}
            isLoading={refreshing}
          />
        ))}
      </div>

      {/* Help Text */}
      {!compact && connectedCount === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <Plus className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Connect Your Event Platforms
              </h3>
              <p className="text-blue-700 mb-4 max-w-md mx-auto">
                Connect your existing event platforms to import events, sync attendees, 
                and manage everything from one place.
              </p>
              <ul className="text-sm text-blue-600 space-y-1 max-w-sm mx-auto">
                <li>• Import events from Eventbrite, Luma, and Meetup</li>
                <li>• Sync attendee data automatically</li>
                <li>• Track ticket sales across platforms</li>
                <li>• Keep events up to date</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}