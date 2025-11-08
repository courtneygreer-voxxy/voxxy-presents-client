import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  ArrowRight,
  CheckCircle,
  Sparkles,
  MapPin,
  Building
} from "lucide-react"
import { Link } from "react-router-dom"
// Inline types and API for contact form
interface CreateContactSubmissionData {
  type: string
  name: string
  email: string
  organizationName?: string
  eventFrequency?: string
  typicalAttendance?: string
  biggestChallenge?: string
  description?: string
  source?: string
}

class EmailServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmailServiceError'
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const contactFormApi = {
  async submitForm(data: CreateContactSubmissionData) {
    const response = await fetch(`${API_BASE_URL}/contact_submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_submission: data })
    })
    if (!response.ok) {
      throw new EmailServiceError('Failed to submit contact form')
    }
    return response.json()
  }
}
import { usePageTracking } from "@/hooks/usePageTracking"
import { useFormTracking } from "@/hooks/useFormTracking"
import { analytics } from "@/lib/analytics"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

interface BetaFormData {
  name: string
  email: string
  organizationName: string
  eventFrequency: string
  typicalAttendance: string
  biggestChallenge: string
  description: string
}

export default function ContactPage() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  usePageTracking('Contact')
  const betaFormTracking = useFormTracking('beta_request', 'Contact')

  const [formData, setFormData] = useState<BetaFormData>({
    name: '',
    email: '',
    organizationName: '',
    eventFrequency: '',
    typicalAttendance: '',
    biggestChallenge: '',
    description: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const [formStarted, setFormStarted] = useState(false)

  const handleInputChange = (field: keyof BetaFormData, value: string) => {
    // Track form start on first input
    if (!formStarted) {
      setFormStarted(true)
      betaFormTracking.trackFormStart('hero_form')
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // PERFORMANCE OPTIMIZATION: Prevent duplicate submissions
    if (isSubmitting || isSubmitted) {
      console.log('Form submission already in progress or completed')
      return
    }

    setIsSubmitting(true)
    setSubmissionError(null)

    betaFormTracking.trackFormSubmit({
      event_frequency: formData.eventFrequency,
      typical_attendance: formData.typicalAttendance,
      biggest_challenge: formData.biggestChallenge,
    })

    try {
      const submissionData: CreateContactSubmissionData = {
        type: 'beta_request',
        name: formData.name,
        email: formData.email,
        organizationName: formData.organizationName,
        eventFrequency: formData.eventFrequency,
        typicalAttendance: formData.typicalAttendance,
        biggestChallenge: formData.biggestChallenge,
        description: formData.description,
        source: 'contact_page'
      }

      await contactFormApi.submitForm(submissionData)
      setIsSubmitted(true)

      // Track successful conversion
      analytics.trackConversionStep('Form Submitted', 'Contact')

      // Infer event scale from attendance
      let eventScale: 'small' | 'medium' | 'large' | undefined;
      const attendance = formData.typicalAttendance.toLowerCase();
      if (attendance.includes('10-50') || attendance.includes('small')) {
        eventScale = 'small';
      } else if (attendance.includes('50-200') || attendance.includes('medium')) {
        eventScale = 'medium';
      } else if (attendance.includes('200+') || attendance.includes('large')) {
        eventScale = 'large';
      }

      analytics.setUserProperties({
        conversion_stage: 'submitted',
        organization_name: formData.organizationName,
        event_frequency: formData.eventFrequency,
        typical_attendance: formData.typicalAttendance,
        biggest_challenge: formData.biggestChallenge,
        event_scale: eventScale,
        // Increase profile confidence since we have form data
        profile_confidence: 'high',
      })

    } catch (error) {
      console.error('Beta access submission failed:', error)
      betaFormTracking.trackFormError('submission', error instanceof Error ? error.message : 'Unknown error')
      if (error instanceof EmailServiceError) {
        setSubmissionError(`Failed to submit: ${error.message}`)
      } else {
        setSubmissionError('An unexpected error occurred. Please try again or email us at team@voxxypresents.com')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <Navigation activePage="contact" />

      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-purple-300 text-sm font-medium rounded-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Join the Pilot Program
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
            Request{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Pilot Access
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Limited spots available - be part of building the future of recurring event management
          </p>
        </div>
      </section>

      {/* Pilot Program Benefits */}
      <section className="py-24 bg-gray-800/30 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">What You Get with the Pilot Program:</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Full Platform Access</h3>
                <p className="text-gray-200">All Voxxy Presents features at $15/month</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Venue Network Access</h3>
                <p className="text-gray-200">Connect with our growing marketplace of venues</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Locked-In Pricing</h3>
                <p className="text-gray-200">Your rate stays at $15/month forever</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Shape the Product</h3>
                <p className="text-gray-200">Direct influence on features and roadmap</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto max-w-2xl px-4">
          {isSubmitted ? (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Thanks for your interest!</h2>
                <p className="text-gray-200 mb-6">
                  We'll review your application and get back to you within 2-3 business days.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                  <Link to="/">Return to Home</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-white mb-3">Request Pilot Access</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Tell us about your events and we'll get you set up
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    id="name"
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 text-base focus:bg-white/15 focus:border-purple-400/50 transition-all"
                  />

                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 text-base focus:bg-white/15 focus:border-purple-400/50 transition-all"
                  />

                  <Input
                    id="organizationName"
                    placeholder="Organization/Club Name *"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 text-base focus:bg-white/15 focus:border-purple-400/50 transition-all"
                  />

                  <Select
                    value={formData.eventFrequency}
                    onValueChange={(value) => handleInputChange('eventFrequency', value)}
                    required
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 text-base focus:bg-white/15 focus:border-purple-400/50 transition-all">
                      <SelectValue placeholder="How often do you host events? *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="planning">Planning to start</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={formData.typicalAttendance}
                    onValueChange={(value) => handleInputChange('typicalAttendance', value)}
                    required
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 text-base focus:bg-white/15 focus:border-purple-400/50 transition-all">
                      <SelectValue placeholder="Typical event attendance *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-20">1-20 people</SelectItem>
                      <SelectItem value="21-50">21-50 people</SelectItem>
                      <SelectItem value="51-100">51-100 people</SelectItem>
                      <SelectItem value="100+">100+ people</SelectItem>
                    </SelectContent>
                  </Select>

                  <Textarea
                    id="biggestChallenge"
                    placeholder="What's your biggest event management challenge? *"
                    value={formData.biggestChallenge}
                    onChange={(e) => handleInputChange('biggestChallenge', e.target.value)}
                    required
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-base focus:bg-white/15 focus:border-purple-400/50 transition-all resize-none"
                  />

                  <Textarea
                    id="description"
                    placeholder="Anything else we should know?"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-base focus:bg-white/15 focus:border-purple-400/50 transition-all resize-none"
                  />

                  {submissionError && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 animate-in fade-in duration-300">
                      <p className="text-red-300 text-sm">{submissionError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Pilot Access'}
                    {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Venue CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full flex items-center justify-center">
              <Building className="h-10 w-10 text-blue-300" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Are You a Venue Owner?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join Voxxy's Venue Network and connect with recurring event organizers looking for spaces
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl font-semibold" asChild>
            <Link to="/signup/venue-owner">
              <MapPin className="mr-2 h-5 w-5" />
              Add Your Venue to the Network
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
