import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Settings,
  Trash2,
  Calendar,
  Users,
  Building
} from "lucide-react"
import type { PlatformConnection, PlatformType } from '@/types/platformIntegration'
import { formatDistanceToNow } from 'date-fns'

interface PlatformConnectionCardProps {
  connection: PlatformConnection
  onConnect: (platform: PlatformType) => Promise<void>
  onDisconnect: (connectionId: string) => Promise<void>
  onTest: (connectionId: string) => Promise<void>
  onSync: (connectionId: string) => Promise<void>
  onUpdateSettings: (connectionId: string, settings: any) => Promise<void>
  isLoading?: boolean
}

const platformConfig = {
  eventbrite: {
    name: 'Eventbrite',
    color: 'bg-orange-500',
    icon: '🎫',
    description: 'Import events and ticket sales from Eventbrite'
  },
  luma: {
    name: 'Luma',
    color: 'bg-purple-500',
    icon: '✨',
    description: 'Sync events and communities from Luma'
  },
  meetup: {
    name: 'Meetup',
    color: 'bg-red-500',
    icon: '👥',
    description: 'Connect your Meetup groups and events'
  }
}

export function PlatformConnectionCard({ 
  connection, 
  onConnect, 
  onDisconnect, 
  onTest, 
  onSync, 
  onUpdateSettings,
  isLoading = false 
}: PlatformConnectionCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const config = platformConfig[connection.platform]
  
  const getStatusIcon = () => {
    switch (connection.status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'disconnected':
        return <AlertTriangle className="h-5 w-5 text-gray-400" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    switch (connection.status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'disconnected':
        return <Badge variant="outline">Disconnected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await onConnect(connection.platform)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await onDisconnect(connection.id)
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    try {
      await onTest(connection.id)
    } finally {
      setIsTesting(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await onSync(connection.id)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAutoSyncToggle = async (enabled: boolean) => {
    await onUpdateSettings(connection.id, {
      syncSettings: {
        ...connection.syncSettings,
        autoSync: enabled
      }
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center text-white text-lg`}>
              {config.icon}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {config.name}
                {getStatusIcon()}
              </CardTitle>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status & Info */}
        {connection.status === 'connected' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Connected as:</span>
              <span className="font-medium">{connection.platformAccountName}</span>
            </div>
            {connection.platformAccountEmail && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{connection.platformAccountEmail}</span>
              </div>
            )}
            {connection.lastSyncAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last synced:</span>
                <span className="font-medium">
                  {formatDistanceToNow(connection.lastSyncAt, { addSuffix: true })}
                </span>
              </div>
            )}
            {connection.platformAccountUrl && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Profile:</span>
                <a 
                  href={connection.platformAccountUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View Profile
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {connection.status === 'error' && connection.errorMessage && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{connection.errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Auto Sync Setting */}
        {connection.status === 'connected' && (
          <div className="flex items-center justify-between py-2 border-t">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Auto Sync</label>
              <p className="text-xs text-gray-600">
                Automatically sync events {connection.syncSettings.syncFrequency}
              </p>
            </div>
            <Switch
              checked={connection.syncSettings.autoSync}
              onCheckedChange={handleAutoSyncToggle}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Sync Capabilities */}
        {connection.status === 'connected' && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium text-gray-700">Syncing:</p>
            <div className="flex flex-wrap gap-2">
              {connection.syncSettings.syncEvents && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Events
                </Badge>
              )}
              {connection.syncSettings.syncOrganizationInfo && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Organization
                </Badge>
              )}
              {connection.syncSettings.syncAttendees && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Attendees
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {connection.status === 'disconnected' || connection.status === 'error' ? (
            <Button 
              onClick={handleConnect}
              disabled={isConnecting || isLoading}
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                `Connect ${config.name}`
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={isTesting || isLoading}
                size="sm"
              >
                {isTesting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Test'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={isSyncing || isLoading}
                size="sm"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Sync Now'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                size="sm"
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={isDisconnecting || isLoading}
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                {isDisconnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>

        {/* Advanced Settings (collapsed by default) */}
        {showSettings && connection.status === 'connected' && (
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm font-medium text-gray-700">Sync Settings:</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <label className="font-medium">Frequency:</label>
                <select 
                  value={connection.syncSettings.syncFrequency}
                  onChange={(e) => onUpdateSettings(connection.id, {
                    syncSettings: {
                      ...connection.syncSettings,
                      syncFrequency: e.target.value as any
                    }
                  })}
                  className="w-full p-1 border rounded text-sm"
                >
                  <option value="manual">Manual</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="realtime">Real-time</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Data Types:</label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={connection.syncSettings.syncEvents}
                      onChange={(e) => onUpdateSettings(connection.id, {
                        syncSettings: {
                          ...connection.syncSettings,
                          syncEvents: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                    <span className="text-xs">Events</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={connection.syncSettings.syncOrganizationInfo}
                      onChange={(e) => onUpdateSettings(connection.id, {
                        syncSettings: {
                          ...connection.syncSettings,
                          syncOrganizationInfo: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                    <span className="text-xs">Organization</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={connection.syncSettings.syncAttendees}
                      onChange={(e) => onUpdateSettings(connection.id, {
                        syncSettings: {
                          ...connection.syncSettings,
                          syncAttendees: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                    <span className="text-xs">Attendees</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}