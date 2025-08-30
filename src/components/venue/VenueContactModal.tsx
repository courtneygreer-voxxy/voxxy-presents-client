import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Mail, Phone, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Venue, VenueContactRequest } from '@/types/venue'
import { venueService } from '@/services/venueService'

interface VenueContactModalProps {
  venue: Venue
  isOpen: boolean
  onClose: () => void
}

export function VenueContactModal({ venue, isOpen, onClose }: VenueContactModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    fromName: '',
    fromEmail: '',
    eventDate: undefined as Date | undefined,
    attendeeCount: '',
    eventType: '',
    message: ''
  })

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.fromName.trim() || !formData.fromEmail.trim()) {
      setError('Name and email are required')
      return
    }

    if (!formData.message.trim()) {
      setError('Please include a message about your event')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const contactRequest: VenueContactRequest = {
        venueId: venue.id,
        fromName: formData.fromName.trim(),
        fromEmail: formData.fromEmail.trim(),
        eventDate: formData.eventDate?.toISOString(),
        attendeeCount: formData.attendeeCount ? parseInt(formData.attendeeCount) : undefined,
        eventType: formData.eventType.trim() || undefined,
        message: formData.message.trim()
      }

      await venueService.sendVenueContactRequest(contactRequest)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setIsSuccess(false)
      setError(null)
      setFormData({
        fromName: '',
        fromEmail: '',
        eventDate: undefined,
        attendeeCount: '',
        eventType: '',
        message: ''
      })
      onClose()
    }
  }

  const openEmailClient = () => {
    const subject = encodeURIComponent(`Event Inquiry for ${venue.name}`)
    const body = encodeURIComponent(`Hi,\n\nI'm interested in hosting an event at ${venue.name}. Please let me know about availability and pricing.\n\nThank you!`)
    window.open(`mailto:${venue.contactInfo.email}?subject=${subject}&body=${body}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {venue.name}</DialogTitle>
          <DialogDescription>
            Send a message about your event or booking inquiry
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          // Success State
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
            <p className="text-gray-600 mb-6">
              We've sent your message to {venue.name}. They'll get back to you soon.
            </p>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          // Contact Form
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Contact Info Display */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{venue.contactInfo.email}</span>
              </div>
              {venue.contactInfo.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{venue.contactInfo.phone}</span>
                </div>
              )}
              {venue.contactInfo.website && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                  <a 
                    href={venue.contactInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromName">Your Name *</Label>
                <Input
                  id="fromName"
                  value={formData.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fromEmail">Your Email *</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.eventDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.eventDate ? format(formData.eventDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.eventDate}
                      onSelect={(date) => handleInputChange('eventDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="attendeeCount">Expected Attendees</Label>
                <Input
                  id="attendeeCount"
                  type="number"
                  value={formData.attendeeCount}
                  onChange={(e) => handleInputChange('attendeeCount', e.target.value)}
                  placeholder="50"
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Input
                id="eventType"
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                placeholder="Birthday party, corporate event, workshop, etc."
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Tell us about your event, preferred dates, and any special requirements..."
                rows={4}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={openEmailClient}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Open Email
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}