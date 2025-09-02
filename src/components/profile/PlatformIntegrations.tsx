import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  ExternalLink,
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Unlink,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import type { PlatformConnection, PlatformType } from '@/types/platformIntegration'
import { 
  getUserProfileConnections,
  removeProfileConnection,
  testProfileConnection,
  syncProfileConnection,
  initiateProfileAuth
} from '@/services/profilePlatformService'
import { PlatformAuthModal } from '../platform/PlatformAuthModal'
import { useToast } from '@/hooks/use-toast'

interface ConnectionStats {
  totalEvents: number
  lastSyncAt?: Date
  status: 'connected' | 'error' | 'syncing'
}

export function PlatformIntegrations() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  
  const [connections, setConnections] = useState<PlatformConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStats, setConnectionStats] = useState<Record<string, ConnectionStats>>({})
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalPlatform, setAuthModalPlatform] = useState<PlatformType | null>(null)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [syncingConnection, setSyncingConnection] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser) {
      loadConnections()
    }
  }, [currentUser])

  const loadConnections = async () => {
    if (!currentUser) return
    
    try {
      setLoading(true)
      const userConnections = await getUserProfileConnections(currentUser.uid)
      setConnections(userConnections)
      
      // Load stats for each connection
      const stats: Record<string, ConnectionStats> = {}
      for (const connection of userConnections) {
        stats[connection.id] = {
          totalEvents: Math.floor(Math.random() * 20) + 1, // Mock for now
          lastSyncAt: connection.lastSyncAt,
          status: connection.status === 'connected' ? 'connected' : 'error'
        }
      }
      setConnectionStats(stats)
      
    } catch (error) {
      console.error('Failed to load platform connections:', error)
      toast({
        variant: "destructive",
        title: "Load Failed",
        description: "Failed to load platform connections."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = (platform: PlatformType) => {
    setAuthModalPlatform(platform)
    setAuthModalOpen(true)
  }

  const handleAuthSuccess = async () => {
    setAuthModalOpen(false)
    setAuthModalPlatform(null)
    await loadConnections() // Reload to show new connection
    toast({
      title: "Connection Successful",
      description: "Your Eventbrite account has been connected successfully."
    })
  }

  const handleDisconnect = async (connectionId: string) => {
    try {
      await removeProfileConnection(currentUser!.uid, connectionId)
      await loadConnections()
      toast({
        title: "Disconnected",
        description: "Platform connection has been removed."
      })
    } catch (error) {
      console.error('Failed to disconnect platform:', error)
      toast({
        variant: "destructive",
        title: "Disconnect Failed",
        description: "Failed to disconnect platform connection."
      })
    }
  }

  const handleTestConnection = async (connectionId: string) => {
    try {
      setTestingConnection(connectionId)
      const result = await testProfileConnection(connectionId)
      
      if (result.success) {
        toast({
          title: "Connection Test Successful",
          description: "Your platform connection is working properly."
        })
      } else {
        toast({
          variant: "destructive",
          title: "Connection Test Failed",
          description: result.error || "Connection test failed."
        })
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      toast({
        variant: "destructive",
        title: "Connection Test Failed",
        description: "Failed to test platform connection."
      })
    } finally {
      setTestingConnection(null)
    }
  }

  const handleSyncData = async (connectionId: string) => {
    try {
      setSyncingConnection(connectionId)
      await syncProfileConnection(connectionId, 'incremental_sync')
      await loadConnections() // Refresh to update last sync time
      toast({
        title: "Sync Complete",
        description: "Platform data has been synchronized successfully."
      })
    } catch (error) {
      console.error('Sync failed:', error)
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Failed to synchronize platform data."
      })
    } finally {
      setSyncingConnection(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-400/30'
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
    }
  }

  const eventbriteConnection = connections.find(conn => conn.platform === 'eventbrite')
  const hasEventbriteConnection = !!eventbriteConnection

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Platform Integrations</h2>
        <p className="text-gray-200">Connect your event platforms to sync events and manage your community</p>
      </div>

      {/* Eventbrite Connection */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xl">
                🎫
              </div>
              <div>
                <h3 className="text-lg font-semibold">Eventbrite</h3>
                <p className="text-sm text-gray-200">Event ticketing and management platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasEventbriteConnection && (
                <Badge className={`${getStatusColor(eventbriteConnection.status)} text-xs`}>
                  {getStatusIcon(eventbriteConnection.status)}
                  <span className="ml-1 capitalize">{eventbriteConnection.status}</span>
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-200">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading connection status...</span>
            </div>
          ) : hasEventbriteConnection ? (
            <div className="space-y-4">
              {/* Connection Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Account Name</Label>
                  <p className="text-gray-200">{eventbriteConnection.platformAccountName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Connected</Label>
                  <p className="text-gray-200">
                    {format(new Date(eventbriteConnection.connectedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Stats */}
              {connectionStats[eventbriteConnection.id] && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span className="text-xs text-gray-200">Events</span>
                    </div>
                    <p className="text-lg font-semibold text-white mt-1">
                      {connectionStats[eventbriteConnection.id].totalEvents}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-gray-200">Last Sync</span>
                    </div>
                    <p className="text-xs text-white mt-1">
                      {eventbriteConnection.lastSyncAt 
                        ? format(new Date(eventbriteConnection.lastSyncAt), 'MMM d')
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Sync Settings */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Sync Settings</h4>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Auto-sync events</p>
                      <p className="text-xs text-gray-200">Automatically import new events from Eventbrite</p>
                    </div>
                    <Switch 
                      checked={eventbriteConnection.syncSettings.autoSync}
                      onCheckedChange={(checked) => {
                        // TODO: Update sync settings
                        console.log('Update auto sync:', checked)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Sync frequency</p>
                      <p className="text-xs text-gray-200">
                        Currently: {eventbriteConnection.syncSettings.syncFrequency}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleSyncData(eventbriteConnection.id)}
                  disabled={syncingConnection === eventbriteConnection.id}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {syncingConnection === eventbriteConnection.id ? (
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
                  onClick={() => handleTestConnection(eventbriteConnection.id)}
                  disabled={testingConnection === eventbriteConnection.id}
                  size="sm"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30"
                >
                  {testingConnection === eventbriteConnection.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    if (eventbriteConnection.platformAccountUrl) {
                      window.open(eventbriteConnection.platformAccountUrl, '_blank')
                    }
                  }}
                  size="sm"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Eventbrite
                </Button>

                <Button
                  onClick={() => handleDisconnect(eventbriteConnection.id)}
                  size="sm"
                  variant="destructive"
                  className="ml-auto"
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>

              {/* Error Message */}
              {eventbriteConnection.status === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {eventbriteConnection.errorMessage || 'Connection error. Please try reconnecting.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">🎫</div>
                </div>
                <h4 className="text-lg font-medium text-white mb-2">Connect Eventbrite</h4>
                <p className="text-gray-200 mb-4 max-w-md mx-auto">
                  Import your events, attendee data, and ticket sales from Eventbrite to streamline your event management.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-200">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Import event details and descriptions</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-200">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Sync ticket sales and attendee data</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-200">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Real-time event updates</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleConnect('eventbrite')}
                  className="mt-6 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Eventbrite Account
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon - Future Platforms */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20 opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <TrendingUp className="h-5 w-5" />
            <span>More Platforms Coming Soon</span>
          </CardTitle>
          <CardDescription className="text-gray-200">
            We're working on integrations with additional event platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center">
                  ✨
                </div>
                <div>
                  <h4 className="font-medium text-white">Luma</h4>
                  <p className="text-xs text-gray-200">Community events platform</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center">
                  👥
                </div>
                <div>
                  <h4 className="font-medium text-white">Meetup</h4>
                  <p className="text-xs text-gray-200">Group meetup platform</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-200 mt-4 text-center">
            More integrations will be available based on user feedback and demand.
          </p>
        </CardContent>
      </Card>

      {/* Platform Auth Modal */}
      {authModalPlatform && (
        <PlatformAuthModal
          platform={authModalPlatform}
          isOpen={authModalOpen}
          onClose={() => {
            setAuthModalOpen(false)
            setAuthModalPlatform(null)
          }}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}