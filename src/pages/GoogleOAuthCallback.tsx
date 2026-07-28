import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { googleSheetsOauthApi } from '@/services/googleSheetsApi'
import { toast } from 'sonner'

export default function GoogleOAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const exchangedRef = useRef(false)

  useEffect(() => {
    if (exchangedRef.current) return
    exchangedRef.current = true
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(errorParam === 'access_denied' ? 'Google Sheets access was denied.' : errorParam)
      return
    }

    if (!code) {
      setError('No authorization code received from Google.')
      return
    }

    const orgId = localStorage.getItem('gsheets_org_id')
    if (!orgId) {
      setError('Missing organization context. Please try connecting again from your event settings.')
      return
    }

    const exchangeCode = async () => {
      try {
        const redirectUri = `${window.location.origin}/google/callback`
        await googleSheetsOauthApi.callback(Number(orgId), code, redirectUri)
        localStorage.removeItem('gsheets_org_id')
        toast.success('Google Sheets connected successfully!')

        // Redirect back to event settings — use stored slug or dashboard
        const returnSlug = localStorage.getItem('gsheets_return_slug')
        localStorage.removeItem('gsheets_return_slug')
        if (returnSlug) {
          navigate(`/dashboard?tab=settings&event=${returnSlug}&gsheets=connected`, { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to connect Google Sheets'
        setError(message)
      }
    }

    exchangeCode()
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Connection Failed</h2>
            <p className="text-sm text-foreground/60 mt-1">{error}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium rounded-lg voxxy-btn-solid transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-foreground/60">Connecting Google Sheets...</p>
      </div>
    </div>
  )
}
