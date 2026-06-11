import { useState, useEffect } from 'react'
import { Mail, Send, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import EmailSequenceManager from '@/components/admin/EmailSequenceManager'

interface EmailCategory {
  name: string
  description: string
  count: number
  emails: Array<{
    position?: number
    name: string
    subject: string
  }>
}

interface EmailTestResult {
  name: string
  status: 'sent' | 'failed'
  error?: string
  timestamp?: string
}

export default function EmailTestingPage({ onBack }: { onBack?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<EmailTestResult[]>([])
  const [emailCategories, setEmailCategories] = useState<EmailCategory[]>([])
  const [testEmail, setTestEmail] = useState('')

  useEffect(() => {
    fetchEmailTestInfo()
  }, [])

  const fetchEmailTestInfo = async () => {
    try {
      const token = localStorage.getItem('railsAuthToken')
      const response = await fetch('/api/v1/presents/email_tests', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch email test info')

      const data = await response.json()
      setEmailCategories(data.email_categories || [])
      setTestEmail(data.test_email || '')
    } catch (error: any) {
      console.error('Failed to fetch email test info:', error)
      toast.error('Failed to load email testing information')
    }
  }

  const sendTestEmails = async (type: 'scheduled' | 'notification' | 'all') => {
    setLoading(true)
    setResults([])

    try {
      const endpoint =
        type === 'scheduled'
          ? '/api/v1/presents/email_tests/send_scheduled'
          : type === 'notification'
            ? '/api/v1/presents/email_tests/send_notification_emails'
            : '/api/v1/presents/email_tests/send_all'

      const token = localStorage.getItem('railsAuthToken')
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send emails')
      }

      const data = await response.json()
      setResults(data.results || [])

      const successCount = data.success_count || 0
      const failureCount = data.failure_count || 0

      if (failureCount > 0) {
        toast.warning(`Sent ${successCount} emails, ${failureCount} failed`)
      } else {
        toast.success(`Successfully sent ${successCount} test emails to ${data.recipient}`)
      }
    } catch (error: any) {
      console.error('Failed to send test emails:', error)
      toast.error(error.message || 'Failed to send test emails')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: 'sent' | 'failed') => {
    if (status === 'sent') {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    }
    return <XCircle className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="min-h-screen voxxy-gradient-admin p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent mb-2">
              Email Testing Center
            </h1>
            <p className="text-foreground/60">
              Test all your email notifications • Emails will be sent to:{' '}
              <span className="font-mono text-primary">{testEmail || 'your email'}</span>
            </p>
          </div>
          {onBack && (
            <Button onClick={onBack} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>

        {/* Email Sequence Manager */}
        <EmailSequenceManager />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Scheduled Emails
              </CardTitle>
              <CardDescription className="text-[13px] text-muted-foreground">
                Send 7 automated campaign emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => sendTestEmails('scheduled')}
                disabled={loading}
                className="w-full voxxy-btn-solid"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Scheduled Emails
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                System Notifications
              </CardTitle>
              <CardDescription className="text-[13px] text-muted-foreground">
                Send 3 update notification emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => sendTestEmails('notification')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification Emails
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-pink-400" />
                All Emails
              </CardTitle>
              <CardDescription className="text-[13px] text-muted-foreground">
                Send all 10 test emails at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => sendTestEmails('all')}
                disabled={loading}
                className="w-full voxxy-btn-cta-pink"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send All Emails
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Email Categories */}
        {emailCategories.map((category, idx) => (
          <Card key={idx} className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">{category.name}</CardTitle>
              <CardDescription className="text-[13px] text-muted-foreground">
                {category.description} • {category.count} emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.emails.map((email, emailIdx) => (
                  <div
                    key={emailIdx}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/5 border border-border"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">{email.name}</div>
                      <div className="text-xs text-zinc-400">{email.subject}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Results */}
        {results.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Test Results
              </CardTitle>
              <CardDescription className="text-[13px] text-muted-foreground">
                {results.filter((r) => r.status === 'sent').length} sent •{' '}
                {results.filter((r) => r.status === 'failed').length} failed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      result.status === 'sent'
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="text-sm font-medium text-foreground">{result.name}</div>
                        {result.error && <div className="text-xs text-red-400">{result.error}</div>}
                      </div>
                    </div>
                    <div className="text-xs text-foreground/60">
                      {result.status === 'sent' ? 'Sent' : 'Failed'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
