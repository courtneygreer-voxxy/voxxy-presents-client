import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Mail, AlertCircle, Check, Users, ExternalLink, Rocket } from 'lucide-react'
import { eventsApi } from '@/services/api'
import GoLiveInvitationEditor from './GoLiveInvitationEditor'

interface GoLiveCardProps {
  event: any
  onGoLive: () => void | Promise<void>
  organizationId?: number
}

export default function GoLiveCard({ event, onGoLive, organizationId }: GoLiveCardProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [updatingInvitations, setUpdatingInvitations] = useState(false)

  // Live status state - use state instead of derived value to ensure re-renders
  const [isLive, setIsLive] = useState(event.status?.is_live || false)

  // Update isLive when event prop changes (fixes issue where state doesn't update after going live)
  useEffect(() => {
    const newIsLive = event.status?.is_live || false
    setIsLive(newIsLive)
  }, [event, event.status?.is_live])

  const invitationCount = event.invitation_draft?.total_count || 0
  const hasInvitations = invitationCount > 0

  // Count scheduled emails that are paused
  const hasScheduledEmails = true

  const handleSaveInvitations = async (data: {
    invitation_list_ids: number[]
    invitation_contact_ids: number[]
    invitation_excluded_ids: number[]
  }) => {
    setUpdatingInvitations(true)
    setError(null)

    try {
      await eventsApi.update(event.slug, data)
      await onGoLive()
      setShowEditor(false)
    } catch (err: any) {
      console.error('Failed to update invitation list:', err)
      setError(err.message || 'Failed to update invitation list')
    } finally {
      setUpdatingInvitations(false)
    }
  }

  const handleGoLive = async () => {
    setLoading(true)
    setError(null)

    try {
      await eventsApi.goLive(event.slug)

      // Show success animation briefly
      setSuccess(true)
      setShowConfirm(false)

      // Refresh parent event data
      await onGoLive()

      // Hide success animation after 2 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      console.error('Failed to go live:', err)
      setError(err.message || 'Failed to activate event')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPortal = () => {
    const slug = event.namespaced_slug || event.slug
    navigate(`/portal/${slug}`)
  }

  // Already live - show success state
  if (isLive) {
    return (
      <div className="voxxy-gradient-panel rounded-xl border border-green-500/20 p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="rounded-lg bg-green-500/20 p-3">
            <Check className="h-6 w-6 text-emerald-700 dark:text-green-400" />
          </div>
        </div>
        <div className="mb-2">
          <p className="mb-1 text-sm text-muted-foreground">Event Status</p>
          <p className="text-lg font-semibold text-foreground">Live</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {hasInvitations &&
            `${invitationCount} invitation${invitationCount !== 1 ? 's' : ''} being sent in background. `}
          Emails active.
        </p>
      </div>
    )
  }

  // Success animation
  if (success) {
    return (
      <div className="voxxy-gradient-panel animate-pulse rounded-xl border-2 border-green-500/30 p-5">
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <Check className="h-8 w-8 text-emerald-700 dark:text-green-400" />
          <p className="text-sm font-semibold text-emerald-900 dark:text-green-300">
            Going live...
          </p>
        </div>
      </div>
    )
  }

  // Confirmation dialog
  if (showConfirm) {
    return (
      <div className="voxxy-gradient-panel rounded-xl border-2 border-primary/30 p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="rounded-lg bg-primary/20 p-3">
            <AlertCircle className="h-6 w-6 text-violet-800 dark:text-primary" />
          </div>
        </div>
        <div className="mb-3">
          <p className="mb-1 text-sm text-muted-foreground">Confirm Go Live</p>
          <p className="mb-3 text-sm text-foreground/90">This will:</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {hasInvitations && (
              <li className="flex items-center gap-1.5">
                <Send className="h-3 w-3 shrink-0 text-primary dark:text-primary" />
                Send {invitationCount} invitation{invitationCount !== 1 ? 's' : ''} in background
              </li>
            )}
            {hasScheduledEmails && (
              <li className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 shrink-0 text-primary dark:text-primary" />
                Activate scheduled emails
              </li>
            )}
          </ul>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 p-2">
            <p className="text-xs text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleGoLive}
            disabled={loading}
            className="w-full px-3 py-2 voxxy-btn-cta text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                Going Live...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Confirm
              </>
            )}
          </button>
          <button
            onClick={() => {
              setShowConfirm(false)
              setError(null)
            }}
            disabled={loading}
            className="w-full px-3 py-2 bg-background/5 hover:bg-background/10 text-foreground text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Editor view - review and edit invitation list
  if (showEditor) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {updatingInvitations ? (
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
              <p className="text-foreground/60">Saving changes...</p>
            </div>
          </div>
        ) : (
          <>
            <GoLiveInvitationEditor
              event={event}
              organizationId={organizationId}
              onSave={handleSaveInvitations}
              onCancel={() => {
                setShowEditor(false)
                setError(null)
              }}
            />
            {error && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-md w-full mx-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
                <p className="text-center text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Draft state — 3 pill action buttons
  return (
    <div className="voxxy-gradient-panel rounded-xl border border-amber-500/20 p-5 transition-all">
      <div className="mb-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
            Draft
          </span>
          {hasInvitations && (
            <span className="text-xs text-muted-foreground">
              {invitationCount} contact{invitationCount !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-foreground">Ready to launch</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Set up your portal, review your invite list, then go live.
        </p>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 p-2">
          <p className="text-xs text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {/* Edit Vendor Portal */}
        <button
          onClick={handleEditPortal}
          className="group flex flex-col items-center gap-2 rounded-xl border border-purple-200/40 bg-violet-50/60 px-2 py-3.5 text-center transition-all hover:border-purple-300/60 hover:bg-violet-50 hover:shadow-sm dark:border-purple-500/20 dark:bg-purple-950/30 dark:hover:border-purple-500/35 dark:hover:bg-purple-950/45"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/12 transition-colors group-hover:bg-purple-500/20 dark:bg-purple-500/20 dark:group-hover:bg-purple-500/30">
            <ExternalLink className="h-4 w-4 text-purple-700 dark:text-purple-300" />
          </div>
          <span className="text-[11px] font-medium leading-tight text-foreground">Edit Portal</span>
        </button>

        {/* Review Invites */}
        <button
          onClick={() => {
            if (!organizationId) {
              setError('Organization information is required')
              return
            }
            setShowEditor(true)
            setError(null)
          }}
          className="group flex flex-col items-center gap-2 rounded-xl border border-purple-200/40 bg-violet-50/60 px-2 py-3.5 text-center transition-all hover:border-purple-300/60 hover:bg-violet-50 hover:shadow-sm dark:border-purple-500/20 dark:bg-purple-950/30 dark:hover:border-purple-500/35 dark:hover:bg-purple-950/45"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/12 transition-colors group-hover:bg-purple-500/20 dark:bg-purple-500/20 dark:group-hover:bg-purple-500/30">
            <Users className="h-4 w-4 text-purple-700 dark:text-purple-300" />
          </div>
          <span className="text-[11px] font-medium leading-tight text-foreground">
            Review Invites
          </span>
        </button>

        {/* Go Live */}
        <button
          onClick={() => setShowConfirm(true)}
          className="group flex flex-col items-center gap-2 rounded-xl border border-emerald-200/40 bg-emerald-50/60 px-2 py-3.5 text-center transition-all hover:border-emerald-300/60 hover:bg-emerald-50 hover:shadow-sm dark:border-emerald-500/20 dark:bg-emerald-950/30 dark:hover:border-emerald-500/35 dark:hover:bg-emerald-950/45"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/12 transition-colors group-hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30">
            <Rocket className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
          </div>
          <span className="text-[11px] font-medium leading-tight text-foreground">Go Live</span>
        </button>
      </div>
    </div>
  )
}
