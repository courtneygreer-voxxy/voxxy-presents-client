import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  Clock,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import type { PlatformType } from '@/types/platformIntegration'
import { 
  subscribeToSyncUpdates,
  getSyncStatus,
  startBackgroundSync,
  type SyncEvent,
  type SyncStatus
} from '@/services/eventSyncService'

interface SyncStatusIndicatorProps {
  connectionId: string
  platform: PlatformType
  lastSyncAt?: Date
  compact?: boolean
  onSyncComplete?: () => void
}

export function SyncStatusIndicator({ 
  connectionId, 
  platform, 
  lastSyncAt,
  compact = false,
  onSyncComplete 
}: SyncStatusIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isManualSyncing, setIsManualSyncing] = useState(false)

  useEffect(() => {
    // Get initial sync status
    const initialStatus = getSyncStatus(connectionId)
    if (initialStatus) {
      setSyncStatus(initialStatus)
    }

    // Subscribe to sync updates
    const unsubscribe = subscribeToSyncUpdates((event: SyncEvent) => {
      if (event.connectionId === connectionId) {
        const updatedStatus = getSyncStatus(connectionId)
        setSyncStatus(updatedStatus || null)

        if (event.type === 'sync_completed') {
          setIsManualSyncing(false)
          onSyncComplete?.()
        } else if (event.type === 'sync_failed') {
          setIsManualSyncing(false)
        }
      }
    })

    return unsubscribe
  }, [connectionId, onSyncComplete])

  const handleManualSync = async () => {
    if (syncStatus?.status === 'syncing' || isManualSyncing) return

    try {
      setIsManualSyncing(true)
      await startBackgroundSync(connectionId, platform, { 
        syncType: 'incremental_sync',
        forceSync: true 
      })
    } catch (error) {
      console.error('Manual sync failed:', error)
      setIsManualSyncing(false)
    }
  }

  const getSyncStatusInfo = () => {
    if (syncStatus?.status === 'syncing' || isManualSyncing) {
      return {
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
        text: syncStatus?.progress?.message || 'Syncing...',
        className: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        showProgress: true
      }
    }

    if (syncStatus?.status === 'error') {
      return {
        icon: <AlertCircle className="h-3 w-3" />,
        text: 'Sync failed',
        className: 'bg-red-500/20 text-red-300 border-red-400/30',
        showProgress: false
      }
    }

    if (syncStatus?.status === 'completed' || lastSyncAt) {
      return {
        icon: <CheckCircle className="h-3 w-3" />,
        text: 'Up to date',
        className: 'bg-green-500/20 text-green-300 border-green-400/30',
        showProgress: false
      }
    }

    return {
      icon: <Clock className="h-3 w-3" />,
      text: 'Not synced',
      className: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
      showProgress: false
    }
  }

  const statusInfo = getSyncStatusInfo()
  const isSyncing = syncStatus?.status === 'syncing' || isManualSyncing

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Badge className={`text-xs ${statusInfo.className}`}>
          {statusInfo.icon}
          <span className="ml-1">{statusInfo.text}</span>
        </Badge>
        {!isSyncing && (
          <button
            onClick={handleManualSync}
            className="text-gray-400 hover:text-white transition-colors"
            title="Manual sync"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <Badge className={`text-xs ${statusInfo.className}`}>
          {statusInfo.icon}
          <span className="ml-1">{statusInfo.text}</span>
        </Badge>
        
        {!isSyncing && (
          <button
            onClick={handleManualSync}
            className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Sync now</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {statusInfo.showProgress && syncStatus?.progress && (
        <div className="space-y-1">
          <Progress 
            value={syncStatus.progress.current} 
            max={syncStatus.progress.total}
            className="h-1"
          />
          <p className="text-xs text-gray-400">
            {syncStatus.progress.message} ({syncStatus.progress.current}%)
          </p>
        </div>
      )}

      {/* Last Sync Time */}
      {!isSyncing && (lastSyncAt || syncStatus?.lastSync) && (
        <p className="text-xs text-gray-400">
          Last synced: {format(
            new Date(lastSyncAt || syncStatus!.lastSync!), 
            'MMM d, h:mm a'
          )}
        </p>
      )}

      {/* Error Message */}
      {syncStatus?.status === 'error' && syncStatus.error && (
        <p className="text-xs text-red-300 bg-red-500/10 p-2 rounded border border-red-500/20">
          {syncStatus.error}
        </p>
      )}
    </div>
  )
}