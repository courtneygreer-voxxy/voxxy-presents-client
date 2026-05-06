import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { useForceTheme } from '@/hooks/useForceTheme'

interface BetaFormData {
  name: string
  email: string
  message: string
}

export default function ContactPage() {
  useForceTheme('dark')
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  usePageTracking('Contact')
  const betaFormTracking = useFormTracking('beta_request', 'Contact')

  const [formData, setFormData] = useState<BetaFormData>({
    name: '',
    email: '',
    message: ''
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

    betaFormTracking.trackFormSubmit({})

    try {
      const submissionData: CreateContactSubmissionData = {
        type: 'beta_request',
        name: formData.name,
        email: formData.email,
        description: formData.message,
        source: 'contact_page'
      }

      await contactFormApi.submitForm(submissionData)
      setIsSubmitted(true)

      // Track successful conversion
      analytics.trackConversionStep('Form Submitted', 'Contact')

      analytics.setUserProperties({
        conversion_stage: 'submitted',
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
    <div className="relative min-h-screen overflow-hidden voxxy-gradient-marketing-hero">
      <Navigation activePage="contact" />

      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/20 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Join the Pilot Program
            </div>
          </div>

          <h1 className="mb-8 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            Request{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#cc30e8] to-[#9054e3]">
              Pilot Access
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-white/65">
            Limited spots available - be part of building the future of event coordination
          </p>
        </div>
      </section>

      {/* Pilot Program Benefits */}
      <section className="relative z-10 border-y border-slate-200 bg-[#faf9fc] py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-950 md:text-4xl">What You Get with the Pilot Program:</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-violet-700" />
              <div>
                <h3 className="mb-1 text-lg font-semibold text-slate-950">Full Platform Access</h3>
                <p className="text-slate-600">All Voxxy Presents features at $15/month</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-violet-700" />
              <div>
                <h3 className="mb-1 text-lg font-semibold text-slate-950">Vendor Coordination Tools</h3>
                <p className="text-slate-600">Vendor CRM & automated email workflows</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-violet-700" />
              <div>
                <h3 className="mb-1 text-lg font-semibold text-slate-950">Locked-In Pricing</h3>
                <p className="text-slate-600">Your rate stays at $15/month for years 1-2</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-violet-700" />
              <div>
                <h3 className="mb-1 text-lg font-semibold text-slate-950">Shape the Product</h3>
                <p className="text-slate-600">Direct influence on features and roadmap</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto max-w-2xl px-4">
          {isSubmitted ? (
            <Card className="marketing-card border border-slate-200">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-300" />
                </div>
                <h2 className="mb-4 text-2xl font-bold text-slate-950">Thanks for your interest!</h2>
                <p className="mb-6 text-slate-600">
                  We'll review your application and get back to you within 2-3 business days.
                </p>
                <Button className="voxxy-btn-brand text-white hover:-translate-y-0.5 hover:brightness-105" asChild>
                  <Link to="/">Return to Home</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="marketing-card border border-slate-200 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="mb-3 text-3xl font-bold text-slate-950">Request Pilot Access</CardTitle>
                <CardDescription className="text-lg">
                  Tell us about yourself and we'll get you set up
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
                    className="h-12 border-slate-200 bg-white text-base text-slate-950 placeholder:text-slate-400 transition-all focus:border-primary/50 focus:bg-white"
                  />

                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-12 border-slate-200 bg-white text-base text-slate-950 placeholder:text-slate-400 transition-all focus:border-primary/50 focus:bg-white"
                  />

                  <Textarea
                    id="message"
                    placeholder="Tell us about yourself and your events *"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                    rows={6}
                    className="resize-none border-slate-200 bg-white text-base text-slate-950 placeholder:text-slate-400 transition-all focus:border-primary/50 focus:bg-white"
                  />

                  {submissionError && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 animate-in fade-in duration-300">
                      <p className="text-red-300 text-sm">{submissionError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full voxxy-btn-brand text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lg"
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

      {/* Vendor Coming Soon */}
      <section className="relative z-10 border-y border-white/10 voxxy-gradient-marketing-hero py-24">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Coming Soon
            </div>
          </div>
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Are You a Vendor?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-white/70">
            Voxxy vendor sign up is coming soon. We're building the platform to make your life easier.
          </p>

          {/* Feature Preview */}
          <div className="max-w-3xl mx-auto mb-10">
            <p className="mb-6 text-lg font-semibold text-white/80">Here's what you can look forward to:</p>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="rounded-lg border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-blue-400 mb-2" />
                <h3 className="mb-1 font-medium text-white">Easy Application</h3>
                <p className="text-sm text-white/65">One-click sign-up for events in your area</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-blue-400 mb-2" />
                <h3 className="mb-1 font-medium text-white">Visibility to Markets</h3>
                <p className="text-sm text-white/65">See upcoming markets and events near you</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-blue-400 mb-2" />
                <h3 className="mb-1 font-medium text-white">Centralized Messaging</h3>
                <p className="text-sm text-white/65">All event communication in one hub - no emails or texts</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-blue-400 mb-2" />
                <h3 className="mb-1 font-medium text-white">Simple Coordination</h3>
                <p className="text-sm text-white/65">Everything you need for each event in one place</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
