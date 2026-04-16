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

interface BetaFormData {
  name: string
  email: string
  message: string
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
    <div className="min-h-screen voxxy-gradient-page-alt relative overflow-hidden">
      <Navigation activePage="contact" />

      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-violet-950 dark:text-purple-300 text-sm font-medium rounded-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Join the Pilot Program
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-8 tracking-tight leading-tight">
            Request{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Pilot Access
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Limited spots available - be part of building the future of event coordination
          </p>
        </div>
      </section>

      {/* Pilot Program Benefits */}
      <section className="py-24 bg-muted/30 backdrop-blur-sm border-y border-border relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">What You Get with the Pilot Program:</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Full Platform Access</h3>
                <p className="text-gray-200">All Voxxy Presents features at $15/month</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Vendor Coordination Tools</h3>
                <p className="text-gray-200">Vendor CRM & automated email workflows</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Locked-In Pricing</h3>
                <p className="text-gray-200">Your rate stays at $15/month for years 1-2</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Shape the Product</h3>
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
            <Card className="bg-background/5 backdrop-blur-sm border border-border">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-300" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Thanks for your interest!</h2>
                <p className="text-gray-200 mb-6">
                  We'll review your application and get back to you within 2-3 business days.
                </p>
                <Button className="voxxy-btn-solid" asChild>
                  <Link to="/">Return to Home</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-background/5 backdrop-blur-sm border border-border shadow-2xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-foreground mb-3">Request Pilot Access</CardTitle>
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
                    className="bg-background/10 border-border text-foreground placeholder:text-muted-foreground h-12 text-base focus:bg-background/15 focus:border-purple-400/50 transition-all"
                  />

                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="bg-background/10 border-border text-foreground placeholder:text-muted-foreground h-12 text-base focus:bg-background/15 focus:border-purple-400/50 transition-all"
                  />

                  <Textarea
                    id="message"
                    placeholder="Tell us about yourself and your events *"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                    rows={6}
                    className="bg-background/10 border-border text-foreground placeholder:text-muted-foreground text-base focus:bg-background/15 focus:border-purple-400/50 transition-all resize-none"
                  />

                  {submissionError && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 animate-in fade-in duration-300">
                      <p className="text-red-300 text-sm">{submissionError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full voxxy-btn-cta-pink h-12 text-base font-semibold shadow-md hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl transition-all"
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
      <section className="py-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-y border-border relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-950 dark:text-blue-300 text-sm font-medium rounded-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Coming Soon
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Are You a Vendor?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Voxxy vendor sign up is coming soon. We're building the platform to make your life easier.
          </p>

          {/* Feature Preview */}
          <div className="max-w-3xl mx-auto mb-10">
            <p className="text-lg text-gray-200 mb-6 font-semibold">Here's what you can look forward to:</p>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-background/5 backdrop-blur-sm border border-border rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-blue-400 mb-2" />
                <h3 className="text-foreground font-medium mb-1">Easy Application</h3>
                <p className="text-muted-foreground text-sm">One-click sign-up for events in your area</p>
              </div>
              <div className="bg-background/5 backdrop-blur-sm border border-border rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-blue-400 mb-2" />
                <h3 className="text-foreground font-medium mb-1">Visibility to Markets</h3>
                <p className="text-muted-foreground text-sm">See upcoming markets and events near you</p>
              </div>
              <div className="bg-background/5 backdrop-blur-sm border border-border rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-blue-400 mb-2" />
                <h3 className="text-foreground font-medium mb-1">Centralized Messaging</h3>
                <p className="text-muted-foreground text-sm">All event communication in one hub - no emails or texts</p>
              </div>
              <div className="bg-background/5 backdrop-blur-sm border border-border rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-blue-400 mb-2" />
                <h3 className="text-foreground font-medium mb-1">Simple Coordination</h3>
                <p className="text-muted-foreground text-sm">Everything you need for each event in one place</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
