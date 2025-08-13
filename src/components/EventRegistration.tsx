import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, ExternalLink, Calendar, CheckCircle } from "lucide-react"
import { registrationsApi, ApiError } from '@/services/api'
import HowDidYouHearPopup from './HowDidYouHearPopup'
import type { Event } from '@/types/database'

interface EventRegistrationProps {
  event: Event
}

export default function EventRegistration({ event }: EventRegistrationProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'interest' | 'presale' | 'waitlist'>('interest')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rsvpType: 'rsvp_yes' as 'rsvp_yes' | 'rsvp_maybe',
    notes: '',
    subscribeToUpdates: false,
    subscribeToNewsletter: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showHowDidYouHear, setShowHowDidYouHear] = useState(false)

  // Determine which button to show based on event properties
  const getButtonType = () => {
    if (event.status === 'sold_out') {
      return 'waitlist'
    } else if (event.eventbriteUrl) {
      return 'eventbrite'
    } else if (event.status === 'presale') {
      return 'presale'
    } else if (event.registrationRequired || event.price.type === 'free') {
      return 'interest'
    }
    return null
  }

  const handleButtonClick = (type: 'interest' | 'presale' | 'waitlist') => {
    setDialogType(type)
    setDialogOpen(true)
    setSubmitSuccess(false)
    setSubmitError(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      rsvpType: 'rsvp_yes',
      notes: '',
      subscribeToUpdates: false,
      subscribeToNewsletter: false
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      let registrationType: 'rsvp_yes' | 'rsvp_maybe' | 'presale_request' | 'waitlist'
      
      if (dialogType === 'waitlist') {
        registrationType = 'waitlist'
      } else if (dialogType === 'presale') {
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
        notes: formData.notes || undefined,
        subscribeToUpdates: formData.subscribeToUpdates,
        subscribeToNewsletter: formData.subscribeToNewsletter
      })

      setSubmitSuccess(true)
      setTimeout(() => {
        setDialogOpen(false)
        setSubmitSuccess(false)
        // Show "How did you hear about us?" popup after successful registration
        setShowHowDidYouHear(true)
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
        
        {buttonType === 'waitlist' && (
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => handleButtonClick('waitlist')}
          >
            Join Waitlist
            <Calendar className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {buttonType === 'interest' && (
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => handleButtonClick('interest')}
          >
            I'm Interested
            <Calendar className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Registration Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogType === 'waitlist' ? (
                <>
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Join Waitlist
                </>
              ) : dialogType === 'presale' ? (
                <>
                  <Mail className="h-5 w-5 text-purple-600" />
                  Request Presale Information
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Express Interest
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'waitlist' ? (
                <>Join the waitlist for <strong>{event.title}</strong>. You'll be contacted in order if spots become available.</>
              ) : dialogType === 'presale' ? (
                <>Get notified when tickets become available for <strong>{event.title}</strong></>
              ) : (
                <>Let us know your level of interest in <strong>{event.title}</strong></>
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
                  Email {(dialogType === 'presale' || dialogType === 'waitlist') ? '*' : '(optional)'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required={dialogType === 'presale' || dialogType === 'waitlist'}
                />
              </div>

              {dialogType === 'interest' && (
                <div className="space-y-2">
                  <Label>How interested are you?</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.rsvpType === 'rsvp_yes' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, rsvpType: 'rsvp_yes' }))}
                    >
                      Very Interested
                    </Button>
                    <Button
                      type="button"
                      variant={formData.rsvpType === 'rsvp_maybe' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, rsvpType: 'rsvp_maybe' }))}
                    >
                      Somewhat Interested
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

              {/* Email Subscription Options */}
              {formData.email && (
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-sm font-medium">Email Alerts (optional)</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="subscribe-updates"
                      checked={formData.subscribeToUpdates}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, subscribeToUpdates: !!checked }))
                      }
                    />
                    <Label htmlFor="subscribe-updates" className="text-sm font-normal cursor-pointer">
                      Get updates about this event
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="subscribe-newsletter"
                      checked={formData.subscribeToNewsletter}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, subscribeToNewsletter: !!checked }))
                      }
                    />
                    <Label htmlFor="subscribe-newsletter" className="text-sm font-normal cursor-pointer">
                      Subscribe to organization newsletter
                    </Label>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Managed by event organizers. You can unsubscribe at any time.
                  </p>
                </div>
              )}

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
                  disabled={isSubmitting || !formData.name || ((dialogType === 'presale' || dialogType === 'waitlist') && !formData.email)}
                  className={`flex-1 ${dialogType === 'waitlist' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {isSubmitting ? 'Submitting...' : dialogType === 'waitlist' ? 'Join Waitlist' : dialogType === 'presale' ? 'Send Request' : 'Submit Interest'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {dialogType === 'waitlist' ? 'Added to Waitlist!' : dialogType === 'presale' ? 'Request Sent!' : 'Interest Submitted!'}
              </h3>
              <p className="text-gray-600">
                {dialogType === 'waitlist'
                  ? 'You\'ve been added to the waitlist. The organizer will contact you in order if spots become available.'
                  : dialogType === 'presale' 
                    ? 'The organizer will contact you when tickets are available.'
                    : 'Thanks for expressing your interest! This helps the organizer gauge event popularity.'
                }
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* How Did You Hear About Us Popup */}
      <HowDidYouHearPopup
        isOpen={showHowDidYouHear}
        onClose={() => setShowHowDidYouHear(false)}
        eventTitle={event.title}
      />
    </>
  )
}