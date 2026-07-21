import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Link2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sheet,
  Unlink,
  Play,
  Clock,
  Trash2,
} from 'lucide-react'
import {
  googleSheetsOauthApi,
  paymentSyncConfigApi,
} from '@/services/googleSheetsApi'
import type {
  GoogleSheetsConnectionStatus,
  PaymentSyncConfig,
  SyncResult,
} from '@/types/googleSheets'
import { autoDetectColumns } from './columnAutoDetect'
import { toast } from 'sonner'

interface GoogleSheetsSyncProps {
  organizationId: number
  eventSlug: string
  onSyncComplete?: () => void
}

export default function GoogleSheetsSync({
  organizationId,
  eventSlug,
  onSyncComplete,
}: GoogleSheetsSyncProps) {
  // Connection state
  const [connectionStatus, setConnectionStatus] =
    useState<GoogleSheetsConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // Config state
  const [config, setConfig] = useState<PaymentSyncConfig | null>(null)
  const [sheetUrl, setSheetUrl] = useState('')
  const [sheetTabName, setSheetTabName] = useState('')
  const [emailColumn, setEmailColumn] = useState('')
  const [phoneColumn, setPhoneColumn] = useState('')
  const [ticketCodeColumn, setTicketCodeColumn] = useState('')
  const [paidStatusColumn, setPaidStatusColumn] = useState('')
  const [paidValue, setPaidValue] = useState('TRUE')

  // Metadata state
  const [fetchingMetadata, setFetchingMetadata] = useState(false)
  const [metadataError, setMetadataError] = useState<string | null>(null)
  const [tabs, setTabs] = useState<string[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [autoDetected, setAutoDetected] = useState(false)

  // Save/sync state
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const fetchUrlRef = useRef<string | null>(null)

  // Load connection status + existing config
  useEffect(() => {
    const init = async () => {
      try {
        const status = await googleSheetsOauthApi.getStatus(organizationId)
        setConnectionStatus(status)

        if (status.connected) {
          try {
            const existingConfig = await paymentSyncConfigApi.get(eventSlug)
            loadConfigIntoState(existingConfig)
          } catch {
            // No config yet — that's fine
          }
        }
      } catch {
        setConnectionStatus({ connected: false, email: null, connected_at: null })
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [organizationId, eventSlug])

  const loadConfigIntoState = (c: PaymentSyncConfig) => {
    setConfig(c)
    setSheetUrl(c.sheet_url || '')
    setSheetTabName(c.sheet_tab_name || '')
    setEmailColumn(c.email_column || '')
    setPhoneColumn(c.phone_column || '')
    setTicketCodeColumn(c.ticket_code_column || '')
    setPaidStatusColumn(c.paid_status_column || '')
    setPaidValue(c.paid_value || 'TRUE')
    if (c.column_headers?.length > 0) {
      setHeaders(c.column_headers)
    }
  }

  const applyAutoDetect = (detectedHeaders: string[]) => {
    const detected = autoDetectColumns(detectedHeaders)
    if (detected.emailColumn) setEmailColumn(detected.emailColumn)
    if (detected.phoneColumn) setPhoneColumn(detected.phoneColumn)
    if (detected.ticketCodeColumn) setTicketCodeColumn(detected.ticketCodeColumn)
    if (detected.paidStatusColumn) setPaidStatusColumn(detected.paidStatusColumn)
    if (detected.paidValue) setPaidValue(detected.paidValue)
    setAutoDetected(true)
  }

  // Fetch sheet metadata when URL changes
  const fetchMetadata = useCallback(
    async (url: string, tabOverride?: string) => {
      if (!url.includes('docs.google.com/spreadsheets')) return

      fetchUrlRef.current = url
      setFetchingMetadata(true)
      setMetadataError(null)
      try {
        const metadata = await googleSheetsOauthApi.getSheetMetadata(
          organizationId,
          url,
          undefined,
          tabOverride || sheetTabName || undefined,
        )

        if (fetchUrlRef.current !== url) return

        setTabs(metadata.tabs || [])
        setHeaders(metadata.headers || [])
        if (!sheetTabName && metadata.tabs?.length > 0) {
          setSheetTabName(metadata.tabs[0])
        }

        // Auto-detect column mappings if no config exists
        if (!config && metadata.headers?.length > 0) {
          applyAutoDetect(metadata.headers)
        }

        setDirty(true)
      } catch (err) {
        if (fetchUrlRef.current !== url) return
        const message = err instanceof Error ? err.message : 'Could not access sheet'
        setMetadataError(message)
        setTabs([])
        setHeaders([])
      } finally {
        setFetchingMetadata(false)
      }
    },
    [organizationId, sheetTabName, config],
  )

  // Fetch headers when tab changes
  const fetchHeadersForTab = useCallback(
    async (tabName: string) => {
      if (!sheetUrl) return

      setFetchingMetadata(true)
      try {
        const metadata = await googleSheetsOauthApi.getSheetMetadata(
          organizationId,
          sheetUrl,
          undefined,
          tabName,
        )
        setHeaders(metadata.headers || [])

        if (metadata.headers?.length > 0) {
          applyAutoDetect(metadata.headers)
        }

        setDirty(true)
      } catch {
        setHeaders([])
      } finally {
        setFetchingMetadata(false)
      }
    },
    [organizationId, sheetUrl],
  )

  const handleConnect = async () => {
    try {
      localStorage.setItem('gsheets_org_id', String(organizationId))
      localStorage.setItem('gsheets_return_slug', eventSlug)

      const redirectUri = `${window.location.origin}/google/callback`
      const { auth_url } = await googleSheetsOauthApi.getAuthUrl(organizationId, redirectUri)
      window.location.href = auth_url
    } catch (err) {
      console.error('Failed to get auth URL:', err)
      toast.error('Failed to start Google connection')
    }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await googleSheetsOauthApi.disconnect(organizationId)
      setConnectionStatus({ connected: false, email: null, connected_at: null })
      resetFormState()
      toast.success('Google Sheets disconnected')
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }

  const handleRemoveConfig = async () => {
    if (!config) return
    setRemoving(true)
    try {
      await paymentSyncConfigApi.delete(eventSlug)
      resetFormState()
      toast.success('Sync configuration removed. You can set up a new one.')
    } catch {
      toast.error('Failed to remove configuration')
    } finally {
      setRemoving(false)
    }
  }

  const resetFormState = () => {
    setConfig(null)
    setHeaders([])
    setTabs([])
    setSheetUrl('')
    setSheetTabName('')
    setEmailColumn('')
    setPhoneColumn('')
    setTicketCodeColumn('')
    setPaidStatusColumn('')
    setPaidValue('TRUE')
    setAutoDetected(false)
    setDirty(false)
    setLastSyncResult(null)
  }

  const handleSheetUrlChange = (url: string) => {
    setSheetUrl(url)
    setDirty(true)
    if (url.includes('docs.google.com/spreadsheets')) {
      fetchMetadata(url)
    }
  }

  const handleTabChange = (tabName: string) => {
    setSheetTabName(tabName)
    setDirty(true)
    fetchHeadersForTab(tabName)
  }

  const hasIdentifier = emailColumn || phoneColumn || ticketCodeColumn

  const handleSave = async () => {
    if (!paidStatusColumn) {
      toast.error('Select a paid status column')
      return
    }
    if (!hasIdentifier) {
      toast.error('Select at least one identifier (email, phone, or ticket code)')
      return
    }

    setSaving(true)
    try {
      const data = {
        sheet_url: sheetUrl,
        sheet_tab_name: sheetTabName || undefined,
        email_column: emailColumn || undefined,
        phone_column: phoneColumn || undefined,
        ticket_code_column: ticketCodeColumn || undefined,
        paid_status_column: paidStatusColumn,
        paid_value: paidValue || 'TRUE',
        active: true,
      }

      const result = config
        ? await paymentSyncConfigApi.update(eventSlug, data)
        : await paymentSyncConfigApi.create(eventSlug, data)

      setConfig(result)
      setDirty(false)
      setAutoDetected(false)
      toast.success(config ? 'Sync settings updated' : 'Sync settings saved')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await paymentSyncConfigApi.sync(eventSlug)
      setLastSyncResult(result)

      if (config) {
        setConfig({ ...config, last_synced_at: result.last_synced_at })
      }

      const { synced, errors: errCount, skipped } = result.results
      toast.success(
        `Sync complete: ${synced} updated, ${errCount} errors, ${skipped} skipped`,
      )
      onSyncComplete?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed'
      toast.error(message)
    } finally {
      setSyncing(false)
    }
  }

  const selectClass =
    'w-full px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-foreground/50" />
        <span className="ml-2 text-sm text-foreground/50">Checking connection...</span>
      </div>
    )
  }

  // Not connected — show connect button
  if (!connectionStatus?.connected) {
    return (
      <div className="rounded-lg border border-border bg-background/5 p-6 text-center space-y-3">
        <Sheet className="w-8 h-8 mx-auto text-foreground/40" />
        <div>
          <p className="text-sm font-medium text-foreground">Connect Google Sheets</p>
          <p className="text-xs text-foreground/50 mt-1">
            Connect your Google account to sync vendor payment status from a spreadsheet.
          </p>
        </div>
        <button
          type="button"
          onClick={handleConnect}
          className="px-4 py-2 text-sm font-medium rounded-lg voxxy-btn-solid transition-colors inline-flex items-center gap-2"
        >
          <Link2 className="w-4 h-4" />
          Connect Google Sheets
        </button>
      </div>
    )
  }

  // Connected — show config UI
  return (
    <div className="space-y-4">
      {/* Connection Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-foreground/60">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          <span>
            Connected as <strong>{connectionStatus.email}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {config && (
            <button
              type="button"
              onClick={handleRemoveConfig}
              disabled={removing}
              className="text-xs text-foreground/40 hover:text-red-400 transition-colors inline-flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              {removing ? 'Removing...' : 'Remove Config'}
            </button>
          )}
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-xs text-foreground/40 hover:text-red-400 transition-colors inline-flex items-center gap-1"
          >
            <Unlink className="w-3 h-3" />
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      </div>

      {/* Sheet URL Input */}
      <div>
        <label className="block text-xs text-foreground/80 font-medium mb-1.5">
          Google Sheet URL <span className="text-red-400">*</span>
        </label>
        <input
          type="url"
          value={sheetUrl}
          onChange={(e) => handleSheetUrlChange(e.target.value)}
          placeholder="Paste your Google Sheets link here..."
          className="w-full px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
      </div>

      {/* Loading metadata */}
      {fetchingMetadata && (
        <div className="flex items-center gap-2 text-xs text-foreground/50">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Reading your spreadsheet...</span>
        </div>
      )}

      {/* Metadata error */}
      {metadataError && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg p-3">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Could not read sheet</p>
            <p className="text-red-400/80 mt-0.5">{metadataError}</p>
            <button
              type="button"
              onClick={() => sheetUrl && fetchMetadata(sheetUrl)}
              className="mt-1 text-xs underline hover:no-underline inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Column Mapping (shown when headers are loaded) */}
      {headers.length > 0 && (
        <div className="space-y-3 pt-1">
          {/* Auto-detect banner */}
          {autoDetected && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-500/10 rounded-lg p-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                We auto-detected your column mappings. Review and adjust if needed.
              </span>
            </div>
          )}

          {/* Tab Selector */}
          {tabs.length > 1 && (
            <div>
              <label className="block text-xs text-foreground/80 font-medium mb-1.5">
                Sheet Tab
              </label>
              <select
                value={sheetTabName || tabs[0]}
                onChange={(e) => handleTabChange(e.target.value)}
                className={selectClass}
              >
                {tabs.map((tab) => (
                  <option key={tab} value={tab}>
                    {tab}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="text-xs text-foreground/50">
            Map your columns for matching. At least one identifier (email, phone, or ticket code) is required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Email Column */}
            <div>
              <label className="block text-xs text-foreground/80 font-medium mb-1.5">
                Email Column
              </label>
              <select
                value={emailColumn}
                onChange={(e) => { setEmailColumn(e.target.value); setDirty(true) }}
                className={selectClass}
              >
                <option value="">-- None --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Phone Column */}
            <div>
              <label className="block text-xs text-foreground/80 font-medium mb-1.5">
                Phone Column
              </label>
              <select
                value={phoneColumn}
                onChange={(e) => { setPhoneColumn(e.target.value); setDirty(true) }}
                className={selectClass}
              >
                <option value="">-- None --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Ticket Code Column */}
            <div>
              <label className="block text-xs text-foreground/80 font-medium mb-1.5">
                Ticket Code Column
                <span className="text-foreground/40 font-normal ml-1">(optional)</span>
              </label>
              <select
                value={ticketCodeColumn}
                onChange={(e) => { setTicketCodeColumn(e.target.value); setDirty(true) }}
                className={selectClass}
              >
                <option value="">-- None --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Paid Status Column */}
            <div>
              <label className="block text-xs text-foreground/80 font-medium mb-1.5">
                Paid Status Column <span className="text-red-400">*</span>
              </label>
              <select
                value={paidStatusColumn}
                onChange={(e) => { setPaidStatusColumn(e.target.value); setDirty(true) }}
                className={selectClass}
              >
                <option value="">-- Select column --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Paid Value */}
            <div className="md:col-span-2">
              <label className="block text-xs text-foreground/80 font-medium mb-1.5">
                Value that means "paid" <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={paidValue}
                onChange={(e) => { setPaidValue(e.target.value); setDirty(true) }}
                placeholder='e.g., "YES", "Paid", "TRUE"'
                className="w-full md:w-1/2 px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Validation hint */}
          {!hasIdentifier && (
            <div className="flex items-start gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg p-3">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Select at least one identifier column (email, phone, or ticket code) for matching.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            {/* Save button — shown when dirty */}
            {dirty && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !paidStatusColumn || !hasIdentifier}
                className="px-4 py-2 text-sm font-medium rounded-lg voxxy-btn-solid transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                {saving ? 'Saving...' : config ? 'Update Settings' : 'Save Settings'}
              </button>
            )}

            {/* Sync Now button — shown when config is saved */}
            {config && !dirty && (
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2 text-sm font-medium rounded-lg voxxy-btn-solid transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                {syncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}

            {/* Last synced */}
            {config?.last_synced_at && (
              <span className="text-xs text-foreground/40 inline-flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                Last synced{' '}
                {new Date(config.last_synced_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          {/* Sync result summary */}
          {lastSyncResult && (
            <div className="text-xs bg-green-500/10 text-green-600 rounded-lg p-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                {lastSyncResult.results.synced} payment{lastSyncResult.results.synced !== 1 ? 's' : ''}{' '}
                updated
                {lastSyncResult.results.errors > 0 &&
                  `, ${lastSyncResult.results.errors} unmatched`}
                {lastSyncResult.results.skipped > 0 &&
                  `, ${lastSyncResult.results.skipped} skipped`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
