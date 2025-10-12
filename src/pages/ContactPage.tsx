import React, { useState } from 'react'
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
import { contactFormApi, EmailServiceError } from "@/services/emailService"
import { CreateContactSubmissionData } from "@/types/database"
import { usePageTracking } from "@/hooks/usePageTracking"
import { useFormTracking } from "@/hooks/useFormTracking"

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

  const handleInputChange = (field: keyof BetaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionError(null)

    betaFormTracking.trackFormSubmit()

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
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-white/10 relative z-10 px-4 py-6">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">
            Voxxy Presents
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link to="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link>
            <Link to="/contact" className="text-purple-400 font-medium">Contact</Link>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="bg-purple-500/20 border border-purple-400/30 text-purple-300 px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Join the Pilot Program
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Request{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Pilot Access
            </span>
          </h1>

          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
            Limited spots available - be part of building the future of recurring event management
          </p>
        </div>
      </section>

      {/* Pilot Program Benefits */}
      <section className="py-12 bg-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">What You Get with the Pilot Program:</h2>
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
      <section className="py-20 relative z-10">
        <div className="container mx-auto max-w-2xl px-4">
          {isSubmitted ? (
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
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
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Request Pilot Access</CardTitle>
                <CardDescription className="text-gray-200">
                  Tell us about your events and we'll get you set up
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationName" className="text-white">Organization/Club Name *</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventFrequency" className="text-white">How often do you host events? *</Label>
                    <Select
                      value={formData.eventFrequency}
                      onValueChange={(value) => handleInputChange('eventFrequency', value)}
                      required
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="planning">Planning to start</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="typicalAttendance" className="text-white">Typical event attendance *</Label>
                    <Select
                      value={formData.typicalAttendance}
                      onValueChange={(value) => handleInputChange('typicalAttendance', value)}
                      required
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select attendance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-20">1-20 people</SelectItem>
                        <SelectItem value="21-50">21-50 people</SelectItem>
                        <SelectItem value="51-100">51-100 people</SelectItem>
                        <SelectItem value="100+">100+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biggestChallenge" className="text-white">What's your biggest event management challenge? *</Label>
                    <Textarea
                      id="biggestChallenge"
                      value={formData.biggestChallenge}
                      onChange={(e) => handleInputChange('biggestChallenge', e.target.value)}
                      required
                      rows={3}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Anything else we should know?</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  {submissionError && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                      <p className="text-red-300">{submissionError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Pilot Access'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Venue CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full flex items-center justify-center">
              <Building className="h-8 w-8 text-blue-300" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Are You a Venue Owner?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join Voxxy's Venue Network and connect with recurring event organizers looking for spaces
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
            <Link to="/signup/venue-owner">
              <MapPin className="mr-2 h-5 w-5" />
              Add Your Venue to the Network
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Voxxy Presents</h3>
              <p className="text-gray-300 mb-4">
                Event infrastructure for recurring club organizers.
              </p>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <a href="mailto:team@voxxypresents.com" className="hover:text-white transition-colors">
                  team@voxxypresents.com
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/venue-owners" className="hover:text-white transition-colors">For Venue Owners</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="https://www.heyvoxxy.com/#/about-us" className="hover:text-white transition-colors">About Us</a></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="https://www.heyvoxxy.com/#/terms" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="https://www.heyvoxxy.com/#/privacy" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2025 Voxxy, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
