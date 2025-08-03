import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, ExternalLink, Calendar, CheckCircle } from "lucide-react"
import { registrationsApi, ApiError } from '@/services/api'
import type { Event } from '@/hooks/useBrooklynHeartsClub'

interface EventRegistrationProps {
  event: Event
}

export default function EventRegistration({ event }: EventRegistrationProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'rsvp' | 'presale'>('rsvp')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rsvpType: 'rsvp_yes' as 'rsvp_yes' | 'rsvp_maybe',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Determine which button to show based on event properties
  const getButtonType = () => {
    if (event.eventbriteUrl) {
      return 'eventbrite'
    } else if (event.presaleEnabled) {
      return 'presale'
    } else if (event.registrationRequired || event.price.type === 'free') {
      return 'rsvp'
    }
    return null
  }

  const handleButtonClick = (type: 'rsvp' | 'presale') => {
    setDialogType(type)
    setDialogOpen(true)
    setSubmitSuccess(false)
    setSubmitError(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      rsvpType: 'rsvp_yes',
      notes: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      let registrationType: 'rsvp_yes' | 'rsvp_maybe' | 'presale_request'
      
      if (dialogType === 'presale') {
        registrationType = 'presale_request'
      } else {
        registrationType = formData.rsvpType
      }

      await registrationsApi.create({
        eventId: event.id,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        registrationType,
        notes: formData.notes || undefined
      })

      setSubmitSuccess(true)
      setTimeout(() => {
        setDialogOpen(false)
        setSubmitSuccess(false)
      }, 2000)

    } catch (error) {
      console.error('Error submitting registration:', error)
      if (error instanceof ApiError) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Failed to submit registration. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const buttonType = getButtonType()

  if (!buttonType) {
    return null // No registration available
  }

  return (
    <>
      {/* Main Button */}
      <div className="flex flex-col sm:flex-row gap-2">
        {buttonType === 'eventbrite' && (
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => window.open(event.eventbriteUrl, '_blank')}
          >
            Get Tickets
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {buttonType === 'presale' && (
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => handleButtonClick('presale')}
          >
            Presale
            <Mail className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {buttonType === 'rsvp' && (
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => handleButtonClick('rsvp')}
          >
            RSVP
            <Calendar className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Registration Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogType === 'presale' ? (
                <>
                  <Mail className="h-5 w-5 text-purple-600" />
                  Request Presale Information
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 text-purple-600" />
                  RSVP for Event
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'presale' ? (
                <>Get notified when tickets become available for <strong>{event.title}</strong></>
              ) : (
                <>Let us know if you're planning to attend <strong>{event.title}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>

          {!submitSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email {dialogType === 'presale' ? '*' : '(optional)'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required={dialogType === 'presale'}
                />
              </div>

              {dialogType === 'rsvp' && (
                <div className="space-y-2">
                  <Label>Will you attend?</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.rsvpType === 'rsvp_yes' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, rsvpType: 'rsvp_yes' }))}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={formData.rsvpType === 'rsvp_maybe' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, rsvpType: 'rsvp_maybe' }))}
                    >
                      Maybe
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>

              {submitError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {submitError}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || (dialogType === 'presale' && !formData.email)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? 'Submitting...' : dialogType === 'presale' ? 'Send Request' : 'Submit RSVP'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {dialogType === 'presale' ? 'Request Sent!' : 'RSVP Submitted!'}
              </h3>
              <p className="text-gray-600">
                {dialogType === 'presale' 
                  ? 'The organizer will contact you when tickets are available.'
                  : 'Thanks for letting us know! See you at the event.'
                }
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}