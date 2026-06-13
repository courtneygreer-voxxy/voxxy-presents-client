import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mail, MailX, Building2, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { unsubscribeApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UnsubscribeContext {
  email: string
  event: {
    id: number
    title: string
    slug: string
    event_date: string
  } | null
  organization: {
    id: number
    name: string
    slug: string
  } | null
  subscription_status: {
    event_unsubscribed: boolean
    organization_unsubscribed: boolean
    globally_unsubscribed: boolean
  }
  available_scopes: string[]
}

export default function UnsubscribePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [context, setContext] = useState<UnsubscribeContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedScope, setSelectedScope] = useState<'event' | 'organization' | 'global'>('event')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isResubscribing, setIsResubscribing] = useState(false)

  useEffect(() => {
    if (token) {
      fetchUnsubscribeContext(token)
    }
  }, [token])

  const fetchUnsubscribeContext = async (unsubscribeToken: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await unsubscribeApi.getByToken(unsubscribeToken)
      setContext(data)

      // Set default scope based on what's available
      if (data.available_scopes.includes('event')) {
        setSelectedScope('event')
      } else if (data.available_scopes.includes('organization')) {
        setSelectedScope('organization')
      } else {
        setSelectedScope('global')
      }
    } catch (err: any) {
      console.error('Failed to fetch unsubscribe context:', err)
      setError(err.message || 'Invalid or expired unsubscribe link')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!token || !selectedScope) return

    try {
      setIsSubmitting(true)
      setError(null)
      const response = await unsubscribeApi.confirm(token, selectedScope)
      setSuccess(true)
      setSuccessMessage(response.message)
    } catch (err: any) {
      console.error('Failed to unsubscribe:', err)
      setError(err.message || 'Failed to process unsubscribe request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResubscribe = async () => {
    if (!token) return

    try {
      setIsResubscribing(true)
      setError(null)
      const response = await unsubscribeApi.resubscribe(token)
      // Reset success state and show resubscribe message
      setSuccess(false)
      setSuccessMessage('')
      // Reload the page to show updated subscription status
      window.location.reload()
    } catch (err: any) {
      console.error('Failed to resubscribe:', err)
      setError(err.message || 'Failed to resubscribe')
    } finally {
      setIsResubscribing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const pageShell =
    'dark voxxy-public-page relative min-h-screen voxxy-gradient-marketing-hero flex items-center justify-center p-4'
  const cardShell = 'voxxy-contact-form-shell p-0 overflow-hidden text-white'
  const contextRow = 'bg-white/5 rounded-lg p-4 border border-white/12'

  if (loading) {
    return (
      <div className={`${pageShell} p-0`}>
        <div className="w-12 h-12 border-4 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !context) {
    return (
      <div className={pageShell}>
        <div className={`${cardShell} max-w-md w-full`}>
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-white text-2xl font-bold mb-2">Link Not Valid</h2>
            <p className="text-white/65 mb-6">
              {error || 'We could not validate this unsubscribe link.'}
            </p>
            <Button onClick={() => navigate('/')} className="voxxy-btn-brand px-8">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className={pageShell}>
        <div className={`${cardShell} max-w-md w-full`}>
          <div className="p-8 space-y-5">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-white text-2xl font-bold mb-2">Successfully Unsubscribed</h2>
              <p className="text-white/70 text-base">{successMessage}</p>
            </div>
            <div className={contextRow}>
              <p className="text-white/75 text-sm text-center">
                You will no longer receive the emails you selected to unsubscribe from.
              </p>
            </div>
            {error && (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2 flex flex-col items-center">
              <Button
                onClick={handleResubscribe}
                disabled={isResubscribing}
                className="voxxy-btn-public-secondary px-6"
              >
                {isResubscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Changed Your Mind? Resubscribe'
                )}
              </Button>
              <button
                onClick={() => navigate('/')}
                className="text-white/50 hover:text-white/80 text-sm transition-colors py-1"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if already unsubscribed
  const alreadyUnsubscribed = context.subscription_status.globally_unsubscribed

  return (
    <div className={pageShell}>
      <div className={`${cardShell} max-w-2xl w-full`}>
        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-white/12">
          <MailX className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold">Manage Email Preferences</h2>
          <p className="text-white/60 mt-2">Choose which emails you'd like to stop receiving</p>
        </div>

        <div className="p-8 space-y-5">
          {/* Email Context */}
          <div className={contextRow}>
            <div className="flex items-center gap-2 text-white/85 mb-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Email Address</span>
            </div>
            <p className="text-white/65 text-sm">{context.email}</p>
          </div>

          {/* Event Context */}
          {context.event && (
            <div className={contextRow}>
              <div className="flex items-center gap-2 text-white/85 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Event</span>
              </div>
              <p className="text-white/75 text-sm font-medium">{context.event.title}</p>
              <p className="text-white/45 text-xs mt-1">{formatDate(context.event.event_date)}</p>
            </div>
          )}

          {/* Organization Context */}
          {context.organization && (
            <div className={contextRow}>
              <div className="flex items-center gap-2 text-white/85 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Event Producer</span>
              </div>
              <p className="text-white/65 text-sm">{context.organization.name}</p>
            </div>
          )}

          {alreadyUnsubscribed && (
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300/90">
                You are already unsubscribed from all Voxxy emails.
              </AlertDescription>
            </Alert>
          )}

          {/* Unsubscribe Options */}
          {!alreadyUnsubscribed && (
            <div className="space-y-4">
              <p className="text-white/85 text-sm font-medium">
                What would you like to unsubscribe from?
              </p>

              <RadioGroup
                value={selectedScope}
                onValueChange={(value) => setSelectedScope(value as any)}
              >
                {context.available_scopes.includes('event') && context.event && (
                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-white/12 hover:bg-white/5 transition-colors cursor-pointer">
                    <RadioGroupItem
                      value="event"
                      id="event"
                      className="mt-1 border-white/40 text-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="event" className="flex-1 cursor-pointer">
                      <div className="text-white font-medium text-sm">This event only</div>
                      <div className="text-white/55 text-xs mt-1">
                        Unsubscribe from emails about {context.event.title}
                      </div>
                    </Label>
                  </div>
                )}

                {context.available_scopes.includes('organization') && context.organization && (
                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-white/12 hover:bg-white/5 transition-colors cursor-pointer">
                    <RadioGroupItem
                      value="organization"
                      id="organization"
                      className="mt-1 border-white/40 text-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="organization" className="flex-1 cursor-pointer">
                      <div className="text-white font-medium text-sm">
                        All emails from this producer
                      </div>
                      <div className="text-white/55 text-xs mt-1">
                        Unsubscribe from all emails from {context.organization.name} (current and
                        future events)
                      </div>
                    </Label>
                  </div>
                )}

                {context.available_scopes.includes('global') && (
                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-white/12 hover:bg-white/5 transition-colors cursor-pointer">
                    <RadioGroupItem
                      value="global"
                      id="global"
                      className="mt-1 border-white/40 text-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="global" className="flex-1 cursor-pointer">
                      <div className="text-white font-medium text-sm">All Voxxy emails</div>
                      <div className="text-white/55 text-xs mt-1">
                        Unsubscribe from all emails from voxxypresents.com
                      </div>
                    </Label>
                  </div>
                )}
              </RadioGroup>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300/90">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleUnsubscribe}
                  disabled={isSubmitting}
                  className="voxxy-btn-brand px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Unsubscribe'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
