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
  Users
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { registrationsApi } from "@/services/api"
import type { Event } from '@/types/database'

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
      const result = await registrationsApi.create({
        eventId: event.id,
        name: formData.name,
        email: formData.email || undefined,
        registrationType: formData.registrationType,
        source: 'website'
      })

      setIsSuccess(true)

      toast({
        title: "🎉 RSVP Confirmed!",
        description: `Great! We've got you down for ${event.title}.`
      })

      // Reset form after short delay to allow calendar view
      setTimeout(() => {
        setFormData(INITIAL_FORM)
        generateCaptcha()
      }, 5000)

    } catch (error) {
      console.error('RSVP failed:', error)
      toast({
        variant: "destructive",
        title: "RSVP Failed",
        description: "Something went wrong. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setFormData(INITIAL_FORM)
    setIsSuccess(false)
    setIsOpen(false)
    generateCaptcha()
  }

  const generateCalendarFile = () => {
    const startDate = new Date(event.date)
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours default

    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Voxxy Presents//Event//EN
BEGIN:VEVENT
UID:${event.id}@voxxy.app
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}${event.address ? `, ${event.address}` : ''}
END:VEVENT
END:VCALENDAR`

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

    const title = encodeURIComponent(event.title)
    const details = encodeURIComponent(event.description)
    const location = encodeURIComponent(`${event.location}${event.address ? `, ${event.address}` : ''}`)

    if (type === 'google') {
      const start = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`
    } else {
      const start = startDate.toISOString()
      const end = endDate.toISOString()
      return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}&body=${details}&location=${location}`
    }
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
        <DialogContent className="sm:max-w-lg bg-white/15 backdrop-blur-md border-white/30 text-white">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">You're Going! 🎉</h3>
            <p className="text-gray-300 mb-6">
              Thanks for RSVPing to <strong>{event.title}</strong>
            </p>

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