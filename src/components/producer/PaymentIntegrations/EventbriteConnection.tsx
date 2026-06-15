import { useState, useEffect } from 'react'
import { Link2, Unlink, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { organizationIntegrationsApi } from '@/services/paymentApi'
import type { EventbriteStatusResponse } from '@/types/payment'

interface EventbriteConnectionProps {
  organizationId: number
  onConnectionChange?: (connected: boolean) => void
}

export default function EventbriteConnection({
  organizationId,
  onConnectionChange,
}: EventbriteConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectedAt, setConnectedAt] = useState<string | null>(null)
  const [apiToken, setApiToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [organizationId])

  const fetchStatus = async () => {
    try {
      setIsFetching(true)
      setError(null)
      const status = await organizationIntegrationsApi.getEventbriteStatus(organizationId)
      setIsConnected(status.connected)
      setConnectedAt(status.connected_at || null)
    } catch (err: any) {
      console.error('Failed to fetch Eventbrite status:', err)
      const errorMessage = err.data?.error || err.message || 'Failed to check connection status'
      console.error('Backend error details:', err.data)
      setError(`Failed to check status: ${errorMessage}`)
    } finally {
      setIsFetching(false)
    }
  }

  const handleConnect = async () => {
    if (!apiToken.trim()) {
      setError('Please enter an API token')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const response = await organizationIntegrationsApi.connectEventbrite(organizationId, {
        api_token: apiToken.trim(),
      })

      setIsConnected(true)
      setConnectedAt(response.connected_at || new Date().toISOString())
      setSuccess('Eventbrite connected successfully!')
      setApiToken('')
      onConnectionChange?.(true)
    } catch (err: any) {
      console.error('Failed to connect Eventbrite:', err)
      const errorMessage = err.data?.error || err.message || 'Failed to connect to Eventbrite'
      console.error('Backend error details:', err.data)
      setError(`Connection failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (
      !confirm(
        'Are you sure you want to disconnect Eventbrite? This will disable payment syncing for all events.',
      )
    ) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      await organizationIntegrationsApi.disconnectEventbrite(organizationId)

      setIsConnected(false)
      setConnectedAt(null)
      setSuccess('Eventbrite disconnected successfully')
      onConnectionChange?.(false)
    } catch (err: any) {
      console.error('Failed to disconnect Eventbrite:', err)
      setError(err.message || 'Failed to disconnect Eventbrite')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-background/5 backdrop-blur-sm rounded-2xl border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-500/20' : 'bg-background/10'}`}>
            <Link2 className={`w-5 h-5 ${isConnected ? 'text-green-400' : 'text-foreground/60'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">Eventbrite Integration</h3>
            <p className="text-sm text-foreground/60">
              {isConnected ? 'Connected' : 'Not connected'}
              {connectedAt && (
                <span className="ml-2 text-foreground/50">
                  since {new Date(connectedAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={isFetching}
          className="p-2 text-foreground/60 hover:bg-background/10 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-300">{success}</p>
        </div>
      )}

      {!isConnected ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="eventbrite-token"
              className="block text-sm font-medium text-foreground dark:text-foreground/70 mb-2"
            >
              Eventbrite Private Token
            </label>
            <input
              id="eventbrite-token"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter your Eventbrite private token"
              className="w-full px-4 py-2.5 rounded-xl bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-background/15 transition-all"
              disabled={isLoading}
            />
            <p className="mt-2 text-sm text-foreground/60">
              Get your API token from{' '}
              <a
                href="https://www.eventbrite.com/account-settings/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/70 hover:underline transition-colors"
              >
                Eventbrite Account Settings
              </a>
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={isLoading || !apiToken.trim()}
            className="w-full px-6 py-3 voxxy-btn-cta rounded-xl hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            {isLoading ? 'Connecting...' : 'Connect Eventbrite'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-green-400" />
              <h4 className="font-medium text-green-300">Connection Active</h4>
            </div>
            <p className="text-sm text-green-200/80">
              Your Eventbrite account is connected. You can now enable payment syncing for
              individual events.
            </p>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-destructive-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
          >
            <Unlink className="w-4 h-4" />
            {isLoading ? 'Disconnecting...' : 'Disconnect Eventbrite'}
          </button>
        </div>
      )}
    </div>
  )
}
