import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Download,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Plus,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'
import { getUserProfileConnections, getProfilePlatformEvents } from '@/services/profilePlatformService'
import { 
  initializeSyncService,
  cleanupSyncService,
  subscribeToSyncUpdates,
  startBackgroundSync,
  getSyncStatus
} from '@/services/eventSyncService'
import { SyncStatusIndicator } from './profile/SyncStatusIndicator'
import type { PlatformConnection, PlatformEvent } from '@/types/platformIntegration'
import type { Organization } from '@/types/database'
import { useToast } from '@/hooks/use-toast'

interface ClubEventSyncManagerProps {
  organization: Organization
  onEventsImported?: (events: PlatformEvent[]) => void
}

export function ClubEventSyncManager({ 
  organization, 
  onEventsImported 
}: ClubEventSyncManagerProps) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [eventbriteConnection, setEventbriteConnection] = useState<PlatformConnection | null>(null)
  const [events, setEvents] = useState<PlatformEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    if (currentUser) {
      loadConnectionAndEvents()
      initializeSyncService(currentUser.uid)
    }

    return () => {
      cleanupSyncService()
    }
  }, [currentUser])

  useEffect(() => {
    // Subscribe to sync updates
    const unsubscribe = subscribeToSyncUpdates((event) => {
      if (!eventbriteConnection) return

      if (event.connectionId === eventbriteConnection.id) {
        if (event.type === 'sync_completed') {
          setSyncing(false)
          setLastSync(new Date())
          loadEvents() // Refresh events after sync
          toast({
            title: "Sync Complete",
            description: "Events have been synchronized successfully."
          })
        } else if (event.type === 'sync_failed') {
          setSyncing(false)
          toast({
            variant: "destructive",
            title: "Sync Failed",
            description: event.data?.error || "Failed to sync events."
          })
        } else if (event.type === 'sync_started') {
          setSyncing(true)
        }
      }
    })

    return unsubscribe
  }, [eventbriteConnection, toast])

  const loadConnectionAndEvents = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      
      // Get user's platform connections
      const connections = await getUserProfileConnections(currentUser.uid)
      const eventbriteConn = connections.find(conn => 
        conn.platform === 'eventbrite' && conn.status === 'connected'
      )

      if (eventbriteConn) {
        setEventbriteConnection(eventbriteConn)
        setLastSync(eventbriteConn.lastSyncAt ? new Date(eventbriteConn.lastSyncAt) : null)
        await loadEvents(eventbriteConn)
      }
    } catch (error) {
      console.error('Failed to load connection and events:', error)
      toast({
        variant: "destructive",
        title: "Load Failed",
        description: "Failed to load platform connections."
      })
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async (connection?: PlatformConnection) => {
    const conn = connection || eventbriteConnection
    if (!currentUser || !conn) return

    try {
      const platformEvents = await getProfilePlatformEvents(currentUser.uid, { platform: conn.platform })
      setEvents(platformEvents)
      onEventsImported?.(platformEvents)
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  const handleSync = async () => {
    if (!eventbriteConnection) return

    try {
      setSyncing(true)
      await startBackgroundSync(eventbriteConnection.id, eventbriteConnection.platform, {
        syncType: 'incremental_sync',
        forceSync: true
      })
    } catch (error) {
      setSyncing(false)
      console.error('Sync failed:', error)
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Failed to start sync process."
      })
    }
  }

  if (loading) {
    return (
      <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Event Sync</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading platform connections...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!eventbriteConnection) {
    return (
      <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Calendar className="h-5 w-5 text-purple-400" />
            <span>Import Events from Eventbrite</span>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Automatically import and sync your existing Eventbrite events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
            <h4 className="font-semibold text-purple-300 mb-2">Why Connect Eventbrite?</h4>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Import existing events with all details automatically</li>
              <li>Keep event information synchronized across platforms</li>
              <li>Save time on manual event creation</li>
              <li>Maintain consistent event data everywhere</li>
            </ul>
          </div>

          <Alert className="!bg-blue-500/10 !border-blue-400/30">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <strong>No Eventbrite connection found.</strong> You'll need to connect your Eventbrite account through your Profile Settings first.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.open('/profile?tab=integrations', '_blank')}
              className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Eventbrite Account
            </Button>
            <Button variant="outline" className="text-gray-300 border-white/20">
              Learn More
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Platform connections are managed at the profile level and shared across all your clubs.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="admin-dark space-y-6">
      {/* Connection Status */}
      <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center">
                🎫
              </div>
              <div>
                <span>Eventbrite Sync</span>
                <p className="text-sm font-normal text-muted-foreground">
                  Connected to {eventbriteConnection.platformAccountName}
                </p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Real-time Sync Status */}
          <SyncStatusIndicator
            connectionId={eventbriteConnection.id}
            platform={eventbriteConnection.platform}
            lastSyncAt={lastSync || undefined}
            compact={false}
            onSyncComplete={() => {
              setLastSync(new Date())
              loadEvents()
            }}
          />

          {/* Manual Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{events.length}</span> events available
              </div>
              {lastSync && (
                <div className="text-sm text-muted-foreground">
                  Last synced: {format(lastSync, 'MMM d, h:mm a')}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSync}
                disabled={syncing}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => window.open(eventbriteConnection.platformAccountUrl, '_blank')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Eventbrite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Preview */}
      {events.length > 0 && (
        <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Synced Events Preview</span>
            </CardTitle>
            <CardDescription>
              Events synced from your Eventbrite account (showing latest 3)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.slice(0, 3).map((event) => (
                <div 
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.startDate), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-700 border-orange-400/30">
                    Eventbrite
                  </Badge>
                </div>
              ))}
              
              {events.length > 3 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    +{events.length - 3} more events available
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}