import { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw, Mail, Building2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminApi } from '@/services/api'
import { logger } from '@/utils/logger'

interface FailedEmail {
  id: number
  name: string
  email_type: string | null
  error_message: string | null
  failed_at: string
  event: {
    id: number
    title: string
  }
  organization: {
    id: number
    name: string
    owner_email: string
  }
  retryable: boolean
}

export default function FailedEmailsPanel() {
  const [failedEmails, setFailedEmails] = useState<FailedEmail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFailedEmails = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getFailedEmails(50)
      setFailedEmails(data)
    } catch (err) {
      logger.error('Failed to fetch failed emails', { error: err })
      setError('Failed to load failed emails')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFailedEmails()
  }, [])

  return (
    <div className="rounded-lg border-2 border-red-500/50 bg-card/90 p-4 shadow-lg shadow-red-500/20 backdrop-blur-sm dark:bg-black/40 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 border border-red-400/50 rounded flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-300 font-mono flex items-center gap-2">
              <span className="text-green-400">{'>'}</span> FAILED_EMAILS
              {failedEmails.length > 0 && (
                <span className="text-xs bg-red-500/30 border border-red-400/50 rounded px-2 py-0.5">
                  {failedEmails.length}
                </span>
              )}
            </h2>
            <p className="text-xs text-red-400/60 font-mono">system.admin.email_campaigns.failed</p>
          </div>
        </div>
        <Button
          onClick={fetchFailedEmails}
          variant="outline"
          size="sm"
          className="bg-red-500/20 border border-red-400/50 text-red-950 dark:text-red-300 hover:bg-red-500/30 font-mono text-xs"
          disabled={loading}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'LOADING...' : 'REFRESH'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-400/50 rounded p-4 text-center font-mono mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {!loading && failedEmails.length === 0 && !error && (
        <div className="bg-green-500/10 border border-green-400/50 rounded p-6 text-center font-mono">
          <p className="text-green-300 font-bold text-sm">NO FAILED EMAILS</p>
          <p className="text-green-400/60 text-xs mt-1">All email campaigns are healthy</p>
        </div>
      )}

      {failedEmails.length > 0 && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {failedEmails.map((email) => (
            <div
              key={email.id}
              className="rounded border border-red-500/30 bg-card/95 p-3 dark:bg-black/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Mail className="h-3.5 w-3.5 text-red-300 flex-shrink-0" />
                    <span className="text-foreground font-mono text-sm font-bold truncate">
                      {email.name}
                    </span>
                    {email.email_type && (
                      <span className="px-2 py-0.5 bg-red-500/20 border border-red-400/50 rounded text-red-300 font-mono text-[9px]">
                        {email.email_type}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[9px] border ${
                        email.retryable
                          ? 'bg-green-500/20 text-emerald-900 dark:text-green-300 border-green-400/50'
                          : 'bg-yellow-500/20 text-yellow-950 dark:text-yellow-300 border-yellow-400/50'
                      }`}
                    >
                      {email.retryable ? 'RETRYABLE' : 'PARTIAL SEND'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-red-400/60 mb-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {email.organization.name} ({email.organization.owner_email})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {email.event.title}
                    </span>
                  </div>

                  {email.error_message && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                      <p className="text-red-400 text-[10px] font-mono break-all">
                        {email.error_message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-red-400/60 font-mono text-[9px]">
                    {new Date(email.failed_at).toLocaleDateString()}
                  </div>
                  <div className="text-red-400/60 font-mono text-[9px]">
                    {new Date(email.failed_at).toLocaleTimeString()}
                  </div>
                  <div className="text-red-400/60 font-mono text-[9px] mt-1">
                    ID: {email.id}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
