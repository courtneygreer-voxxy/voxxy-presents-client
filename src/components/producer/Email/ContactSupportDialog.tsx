/**
 * ContactSupportDialog - Pre-filled support request dialog
 *
 * Submits to Discord webhook with:
 * - User name
 * - Message
 * - Checkbox: "I want Voxxy to reach out to me"
 * - Pre-filled context: recipient email, email name, status, error details
 */

import { useState } from 'react'
import { AlertCircle, Send, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { logger } from '@/utils/logger'
import type { AuditEntry } from '@/types/email'

interface ContactSupportDialogProps {
  isOpen: boolean
  onClose: () => void
  entry: AuditEntry | null
  eventTitle: string
  userEmail?: string
  userName?: string
}

export function ContactSupportDialog({
  isOpen,
  onClose,
  entry,
  eventTitle,
  userEmail = '',
  userName = '',
}: ContactSupportDialogProps) {
  const [name, setName] = useState(userName)
  const [message, setMessage] = useState('')
  const [wantCallback, setWantCallback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      // Reset after close animation
      setTimeout(() => {
        setName(userName)
        setMessage('')
        setWantCallback(false)
        setSubmitSuccess(false)
        setSubmitError(null)
      }, 300)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!entry) return
    if (!message.trim()) {
      setSubmitError('Please enter a message')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Build context information
      const context = {
        event: eventTitle,
        recipient_email: entry.recipient_email,
        recipient_name: entry.recipient_name || 'Unknown',
        email_name: entry.email_name,
        email_subject: entry.email_subject,
        status: entry.status,
        bounce_reason: entry.bounce_reason || null,
        drop_reason: entry.drop_reason || null,
        sent_at: entry.sent_at || null,
      }

      // Build Discord message
      const discordMessage = {
        embeds: [
          {
            title: '🆘 Email Audit Log Support Request',
            color: 0xff6b6b, // Red color
            fields: [
              {
                name: '👤 From',
                value: `${name || 'Anonymous'} (${userEmail || 'No email provided'})`,
                inline: false,
              },
              {
                name: '💬 Message',
                value: message,
                inline: false,
              },
              {
                name: '📞 Wants Callback',
                value: wantCallback ? '✅ Yes' : '❌ No',
                inline: true,
              },
              {
                name: '📧 Email Context',
                value: [
                  `**Event:** ${context.event}`,
                  `**Email:** ${context.email_name}`,
                  `**Subject:** ${context.email_subject}`,
                  `**Recipient:** ${context.recipient_name} (${context.recipient_email})`,
                  `**Status:** ${context.status}`,
                  context.bounce_reason ? `**Bounce Reason:** ${context.bounce_reason}` : '',
                  context.drop_reason ? `**Drop Reason:** ${context.drop_reason}` : '',
                ]
                  .filter(Boolean)
                  .join('\n'),
                inline: false,
              },
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Email Audit Log • Voxxy',
            },
          },
        ],
      }

      // Get Discord webhook URL from environment
      const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL

      if (!webhookUrl) {
        throw new Error('Discord webhook URL not configured')
      }

      // Send to Discord
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordMessage),
      })

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status}`)
      }

      // Success!
      setSubmitSuccess(true)

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleOpenChange(false)
      }, 2000)
    } catch (err: any) {
      logger.error('Failed to submit support request', { error: err })
      setSubmitError(err.message || 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact Voxxy Support</DialogTitle>
          <DialogDescription>
            Need help with this email delivery? Our team will review your request and get back to
            you.
          </DialogDescription>
        </DialogHeader>

        {submitSuccess ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
              <Send className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Request Sent!</h3>
            <p className="text-sm text-foreground/60">
              We've received your support request and will respond shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground/80 mb-1.5"
                >
                  Your Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-background/5 border-border"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground/80 mb-1.5"
                >
                  Message <span className="text-red-400">*</span>
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue you're experiencing..."
                  rows={5}
                  className="bg-background/5 border-border resize-none"
                  required
                />
              </div>

              {/* Callback checkbox */}
              <div className="flex items-start space-x-3 p-3 bg-background/5 border border-border rounded-lg">
                <Checkbox
                  id="callback"
                  checked={wantCallback}
                  onCheckedChange={(checked) => setWantCallback(checked === true)}
                />
                <div className="flex-1">
                  <label
                    htmlFor="callback"
                    className="text-sm font-medium text-foreground/80 cursor-pointer"
                  >
                    I want Voxxy to reach out to me
                  </label>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    We'll contact you at {userEmail || 'your registered email'} to help resolve this
                    issue.
                  </p>
                </div>
              </div>

              {/* Error message */}
              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{submitError}</p>
                </div>
              )}

              {/* Context preview */}
              {entry && (
                <div className="p-3 bg-background/5 border border-border rounded-lg">
                  <p className="text-xs font-medium text-foreground/60 mb-2">
                    Context that will be included:
                  </p>
                  <div className="text-xs text-foreground/50 space-y-1">
                    <div>
                      <span className="font-medium">Email:</span> {entry.email_name}
                    </div>
                    <div>
                      <span className="font-medium">Recipient:</span> {entry.recipient_email}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {entry.status}
                    </div>
                    {entry.bounce_reason && (
                      <div>
                        <span className="font-medium">Error:</span> {entry.bounce_reason}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !message.trim()} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
