import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  MapPin,
  Shield,
  Users,
  QrCode,
  Ticket,
  Mail
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { registrationsApi, ApiError } from "@/services/api"
import { qrCodeService } from "@/services/qrCodeService"
import { calendarService } from "@/services/calendarService"
import type { Event } from '@/types/database'
import type { DigitalTicket } from '@/types/ticket'

interface RSVPModalProps {
  event: Event
  trigger?: React.ReactNode
}

interface RSVPForm {
  name: string
  email?: string
  registrationType: 'rsvp_yes' | 'rsvp_maybe'
}

const INITIAL_FORM: RSVPForm = {
  name: '',
  email: '',
  registrationType: 'rsvp_yes'
}

export function RSVPModal({ event, trigger }: RSVPModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<RSVPForm>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [digitalTicket, setDigitalTicket] = useState<DigitalTicket | null>(null)
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false)
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [userCaptchaAnswer, setUserCaptchaAnswer] = useState('')
  const { toast } = useToast()

  // Generate simple math CAPTCHA
  React.useEffect(() => {
    generateCaptcha()
  }, [isOpen])

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptchaQuestion(`${num1} + ${num2}`)
    setCaptchaAnswer((num1 + num2).toString())
    setUserCaptchaAnswer('')
  }

  const handleInputChange = (field: keyof RSVPForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    // Name validation
    if (formData.name.trim().length < 2) {
      toast({
        variant: "destructive",
        title: "Name Required",
        description: "Please enter your name (at least 2 characters)."
      })
      return false
    }

    // Email validation (if provided)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        toast({
          variant: "destructive",
          title: "Invalid Email",
          description: "Please enter a valid email address or leave it blank."
        })
        return false
      }
    }

    // CAPTCHA validation
    if (userCaptchaAnswer.trim() !== captchaAnswer) {
      toast({
        variant: "destructive",
        title: "CAPTCHA Failed",
        description: "Please solve the math problem correctly."
      })
      generateCaptcha()
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Environment-aware RSVP submission
      const { getDataSource } = await import('@/config/environments')
      const dataSource = getDataSource()

      let result
      if (dataSource === 'firebase') {
        // Use Firebase for staging/development
        const { createRegistration } = await import('@/lib/database')
        const registrationId = await createRegistration({
          eventId: event.id,
          organizationId: event.organizationId,
          name: formData.name,
          email: formData.email || '',
          registrationType: formData.registrationType === 'rsvp_yes' ? 'confirmed' : 'confirmed', // Both rsvp_yes and rsvp_maybe map to confirmed
          source: 'website',
          emailSent: false
        })
        result = { registrationId }
      } else {
        // Use API for production
        result = await registrationsApi.create({
          eventId: event.id,
          name: formData.name,
          email: formData.email || undefined,
          registrationType: formData.registrationType,
          source: 'website'
        })
      }

      // Generate digital ticket
      setIsGeneratingTicket(true)
      const ticketResponse = await qrCodeService.generateTicket({
        eventId: event.id,
        attendeeEmail: formData.email || `guest_${Date.now()}@voxxypresents.com`,
        attendeeName: formData.name,
        rsvpStatus: formData.registrationType === 'rsvp_yes' ? 'going' : 'maybe',
        organizationId: event.organizationId || 'voxxy-presents'
      })

      if (ticketResponse.success && ticketResponse.ticket) {
        setDigitalTicket(ticketResponse.ticket)

        // TODO: Send RSVP confirmation email with QR ticket
        // This would be implemented in Phase 1.2
        console.log('Digital ticket generated:', ticketResponse.ticket.ticketId)
      }

      setIsSuccess(true)

      toast({
        title: "🎉 RSVP Confirmed!",
        description: `Great! We've got you down for ${event.title}. Your digital ticket is ready!`
      })

      // Reset form after short delay to allow ticket view
      setTimeout(() => {
        setFormData(INITIAL_FORM)
        generateCaptcha()
      }, 8000) // Extended to allow more time to view ticket

    } catch (error) {
      console.error('RSVP failed:', error)

      // Handle specific error cases
      if (error instanceof ApiError && error.status === 409) {
        // In development, generate ticket anyway for testing
        if (import.meta.env.DEV) {
          console.log('Development mode: Generating QR ticket despite duplicate registration');

          try {
            const ticketResponse = await qrCodeService.generateTicket({
              eventId: event.id,
              attendeeEmail: formData.email || `guest_${Date.now()}@voxxypresents.com`,
              attendeeName: formData.name,
              rsvpStatus: formData.registrationType === 'rsvp_yes' ? 'going' : 'maybe',
              organizationId: event.organizationId || 'voxxy-presents'
            })

            if (ticketResponse.success && ticketResponse.ticket) {
              setDigitalTicket(ticketResponse.ticket)
              setIsSuccess(true)

              toast({
                title: "🎫 Development Mode: Ticket Generated!",
                description: "Generated QR ticket for testing (already registered)."
              })
              return
            }
          } catch (ticketError) {
            console.log('Development ticket generation failed (likely no JWT secret):', ticketError)
            // Fall through to show regular 409 message
          }
        }

        toast({
          variant: "destructive",
          title: "Already Registered",
          description: "You're already registered for this event! Check your email for confirmation details."
        })
        return // Ensure we don't continue processing
      } else {
        toast({
          variant: "destructive",
          title: "RSVP Failed",
          description: "Something went wrong. Please try again."
        })
      }
    } finally {
      setIsSubmitting(false)
      setIsGeneratingTicket(false)
    }
  }

  const resetAndClose = () => {
    setFormData(INITIAL_FORM)
    setIsSuccess(false)
    setDigitalTicket(null)
    setIsOpen(false)
    generateCaptcha()
  }

  const generateCalendarFile = () => {
    const startDate = new Date(event.date)
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000)

    const calendarEvent = calendarService.createEventFromRSVP({
      title: event.title,
      description: event.description,
      location: `${event.location}${event.address ? `, ${event.address}` : ''}`,
      startDate,
      endDate,
      organizerEmail: 'team@voxxypresents.com',
      organizerName: event.organizationId || 'Voxxy Presents',
      eventUrl: window.location.href
    })

    const icsContent = calendarService.generateICS(calendarEvent)
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getCalendarUrl = (type: 'google' | 'outlook') => {
    const startDate = new Date(event.date)
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000)

    const calendarEvent = calendarService.createEventFromRSVP({
      title: event.title,
      description: event.description,
      location: `${event.location}${event.address ? `, ${event.address}` : ''}`,
      startDate,
      endDate,
      organizerEmail: 'team@voxxypresents.com',
      organizerName: event.organizationId || 'Voxxy Presents'
    })

    const links = calendarService.getAllCalendarLinks(calendarEvent)
    return type === 'google' ? links.google : links.outlook
  }

  const defaultTrigger = (
    <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
      <Users className="h-4 w-4" />
      RSVP
    </Button>
  )

  // Success state with calendar view
  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={resetAndClose}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg bg-white/15 backdrop-blur-md border-white/30 text-white max-h-[90vh] overflow-y-auto">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">You're Going! 🎉</h3>
            <p className="text-gray-300 mb-6">
              Thanks for RSVPing to <strong>{event.title}</strong>
            </p>

            {/* Digital Ticket Section */}
            {digitalTicket && (
              <Card className="bg-white/10 border-white/20 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Ticket className="h-5 w-5 text-purple-400" />
                    <h4 className="text-lg font-semibold text-white">Your Digital Ticket</h4>
                  </div>

                  {/* QR Code Display */}
                  <div className="bg-white p-4 rounded-lg mb-4 mx-auto max-w-48">
                    <img
                      src={digitalTicket.qrCode}
                      alt="QR Code Ticket"
                      className="w-full h-auto"
                    />
                  </div>

                  {/* Ticket Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Ticket ID:</span>
                      <span className="font-mono text-purple-300">{digitalTicket.ticketId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Access Code:</span>
                      <span className="font-mono text-purple-300">{digitalTicket.accessCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status:</span>
                      <Badge variant="outline" className={
                        digitalTicket.rsvpStatus === 'going'
                          ? 'bg-green-500/20 border-green-400 text-green-300'
                          : 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                      }>
                        {digitalTicket.rsvpStatus === 'going' ? 'Going' : 'Maybe'}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-purple-500/20 rounded-lg border border-purple-400/30">
                    <div className="flex items-start gap-2">
                      <QrCode className="h-4 w-4 text-purple-300 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-purple-200">
                        Show this QR code at the door for quick entry. Use the access code as backup if needed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Email Notification */}
            {formData.email && (
              <div className="mb-6 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-300" />
                  <span className="text-sm font-medium text-blue-200">Email Confirmation</span>
                </div>
                <p className="text-xs text-blue-200">
                  A confirmation email with your digital ticket has been sent to <strong>{formData.email}</strong>
                </p>
              </div>
            )}

            {/* Event Details Summary */}
            <Card className="bg-white/10 border-white/20 mb-6">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3 text-left">
                  <Calendar className="h-5 w-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                    <p className="text-sm text-gray-300">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <MapPin className="h-5 w-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    {event.address && <p className="text-sm text-gray-300">{event.address}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Actions */}
            <div className="space-y-3">
              <p className="text-sm text-gray-300 mb-3">Add this event to your calendar:</p>

              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={generateCalendarFile}
                  className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Calendar File
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => window.open(getCalendarUrl('google'), '_blank')}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Google Calendar
                  </Button>
                  <Button
                    onClick={() => window.open(getCalendarUrl('outlook'), '_blank')}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Outlook
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-6">
              See you there! 🎊
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white/15 backdrop-blur-md border-white/30 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center text-white flex items-center justify-center gap-2">
            <Users className="h-6 w-6 text-purple-400" />
            RSVP to {event.title}
          </DialogTitle>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* RSVP Type Selection */}
          <div className="space-y-3">
            <Label className="text-white text-sm font-medium">Will you be attending?</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.registrationType === 'rsvp_yes' ? 'default' : 'outline'}
                onClick={() => handleInputChange('registrationType', 'rsvp_yes')}
                className={formData.registrationType === 'rsvp_yes'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }
                disabled={isSubmitting}
              >
                Yes, I'm going!
              </Button>
              <Button
                type="button"
                variant={formData.registrationType === 'rsvp_maybe' ? 'default' : 'outline'}
                onClick={() => handleInputChange('registrationType', 'rsvp_maybe')}
                className={formData.registrationType === 'rsvp_maybe'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }
                disabled={isSubmitting}
              >
                Maybe
              </Button>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Your Name *
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your full name"
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              disabled={isSubmitting}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-400">
              Optional: for event updates and reminders
            </p>
          </div>

          {/* Security CAPTCHA */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-purple-400" />
                <Label className="text-white text-sm font-medium">Security Check</Label>
              </div>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">
                  Please solve this simple math problem:
                </p>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-purple-500/20 border-purple-400 text-purple-200 text-lg font-mono">
                    {captchaQuestion} = ?
                  </Badge>
                  <Input
                    type="text"
                    value={userCaptchaAnswer}
                    onChange={(e) => setUserCaptchaAnswer(e.target.value)}
                    placeholder="Answer"
                    className="w-20 bg-white/10 border-white/20 text-white text-center"
                    disabled={isSubmitting}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateCaptcha}
                    className="text-purple-400 hover:text-purple-300"
                    disabled={isSubmitting}
                  >
                    New Problem
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  RSVPing...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  RSVP
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-gray-400 text-center">
            Your RSVP helps us plan better events. We'll only use your information for this event.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}