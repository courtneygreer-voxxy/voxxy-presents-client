import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, X, Loader2, Search, User } from 'lucide-react'
import { paymentSyncErrorsApi } from '@/services/googleSheetsApi'
import { registrationsApi } from '@/services/api'
import type { PaymentSyncError } from '@/types/googleSheets'

interface Registration {
  id: number
  name?: string
  email?: string
  phone?: string
}

interface SyncErrorsPanelProps {
  eventSlug: string
  refreshTrigger?: number
  onErrorsChange?: () => void
}

export default function SyncErrorsPanel({
  eventSlug,
  refreshTrigger = 0,
  onErrorsChange,
}: SyncErrorsPanelProps) {
  const [errors, setErrors] = useState<PaymentSyncError[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [matchingErrorId, setMatchingErrorId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [resolving, setResolving] = useState<number | null>(null)

  useEffect(() => {
    loadErrors()
  }, [eventSlug, refreshTrigger])

  const loadErrors = async () => {
    try {
      const data = await paymentSyncErrorsApi.list(eventSlug, false)
      setErrors(data)
    } catch (err) {
      console.error('Failed to load sync errors:', err)
    } finally {
      setLoading(false)
    }

    try {
      const regsData = await registrationsApi.getByEvent(eventSlug)
      const regList = (regsData?.vendor_registrations || []).map((r: any) => ({
        id: r.id,
        name: r.name || r.first_name,
        email: r.email,
        phone: r.phone,
      }))
      setRegistrations(regList)
    } catch (err) {
      console.error('Failed to load registrations:', err)
    }
  }

  const handleResolve = async (errorId: number, registrationId: number) => {
    setResolving(errorId)
    try {
      await paymentSyncErrorsApi.resolve(eventSlug, errorId, registrationId)
      setErrors((prev) => prev.filter((e) => e.id !== errorId))
      setMatchingErrorId(null)
      setSearchQuery('')
      onErrorsChange?.()
    } catch (err) {
      console.error('Failed to resolve error:', err)
    } finally {
      setResolving(null)
    }
  }

  const handleDismiss = async (errorId: number) => {
    try {
      await paymentSyncErrorsApi.dismiss(eventSlug, errorId)
      setErrors((prev) => prev.filter((e) => e.id !== errorId))
      onErrorsChange?.()
    } catch (err) {
      console.error('Failed to dismiss error:', err)
    }
  }

  const filteredRegistrations = registrations.filter((r) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.phone?.includes(q)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-4 h-4 animate-spin text-foreground/50" />
        <span className="ml-2 text-sm text-foreground/50">Loading errors...</span>
      </div>
    )
  }

  if (errors.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-6 h-6 mx-auto text-green-500 mb-2" />
        <p className="text-sm text-foreground/60">No unresolved sync errors</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-foreground/50">
        {errors.length} unmatched {errors.length === 1 ? 'row' : 'rows'} from your payment sheet.
        Match them to participants or dismiss.
      </p>

      {errors.map((error) => (
        <div
          key={error.id}
          className="bg-background/5 rounded-lg border border-border p-3 space-y-2"
        >
          {/* Error header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-xs font-medium text-foreground capitalize">
                {error.reason.replace('_', ' ')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDismiss(error.id)}
              className="p-1 rounded hover:bg-background/20 text-foreground/40 hover:text-foreground/70 transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Raw row data */}
          {error.raw_row && (
            <div className="bg-background/10 rounded p-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(error.raw_row).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-foreground/40">{key}: </span>
                    <span className="text-foreground/80">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match button or matching UI */}
          {matchingErrorId === error.id ? (
            <div className="space-y-2 pt-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredRegistrations.slice(0, 10).map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => handleResolve(error.id, reg.id)}
                    disabled={resolving === error.id}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-primary/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <User className="w-3 h-3 text-foreground/40 shrink-0" />
                    <div className="truncate">
                      <span className="font-medium text-foreground">{reg.name || 'Unknown'}</span>
                      {reg.email && (
                        <span className="text-foreground/50 ml-1.5">{reg.email}</span>
                      )}
                    </div>
                  </button>
                ))}
                {filteredRegistrations.length === 0 && (
                  <p className="text-xs text-foreground/40 py-2 text-center">No matches found</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMatchingErrorId(null)
                  setSearchQuery('')
                }}
                className="text-xs text-foreground/50 hover:text-foreground/70"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMatchingErrorId(error.id)}
              className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-primary/10 hover:border-primary/30 transition-colors inline-flex items-center gap-1.5"
            >
              <User className="w-3 h-3" />
              Match to Participant
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
