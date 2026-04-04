import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function BetaPendingPage() {
  const { userProfile, signOut } = useAuth()
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Check if user is an unpaid producer
  const isProducer = userProfile?.role === 'venue_owner' || userProfile?.role === 'producer'
  const isPaid = userProfile?.paid === true
  const needsPayment = isProducer && !isPaid

  const handleSignOut = async () => {
    await signOut()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Submit contact form for access request
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/contact_submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_submission: {
            type: 'presents_access_request',
            name: formData.name,
            email: formData.email,
            description: formData.message,
            source: 'pending_access_page'
          }
        })
      })

      if (response.ok) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Failed to submit access request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-[140px] pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-[900px] text-center relative z-10">
          <h1 className="text-[52px] md:text-[56px] font-display font-bold text-white mb-5 leading-[1.1] tracking-tight">
            {needsPayment ? (
              <>
                <em className="not-italic bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">Payment Required</em>
              </>
            ) : (
              <>
                Welcome to <em className="not-italic bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">Voxxy Presents</em>
              </>
            )}
          </h1>
          <p className="text-[18px] text-white/65 max-w-[700px] mx-auto leading-relaxed mb-0">
            {needsPayment ? (
              <>
                To access Voxxy Presents, please subscribe to one of our plans. Contact us below to get started with your subscription.
              </>
            ) : (
              <>
                We see you're new here - please use the form below to request full access to Voxxy Presents and we will get back to you in 1-3 business days!
              </>
            )}
          </p>

          {/* Divider */}
          <div className="mt-9 flex items-center justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-fuchsia-500/40"></div>
            <div className="mx-4 w-2 h-2 rounded-full bg-fuchsia-500/40"></div>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-fuchsia-500/40"></div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="container mx-auto max-w-[800px]">
          {isSubmitted ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
              <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-[24px] font-bold text-gray-900 mb-4">Request Received!</h3>
              <p className="text-gray-600 mb-6">
                We've received your access request. Our team will review it and get back to you within 1-3 business days.
              </p>
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Sign Out
                </Button>
                <Button className="bg-voxxy-purple-brand hover:bg-purple-700" asChild>
                  <Link to="/">
                    Back to Home
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
              <h2 className="text-[28px] font-display font-bold text-gray-900 mb-6 text-center">
                {needsPayment ? 'Subscribe to Voxxy Presents' : 'Request Full Access'}
              </h2>

              {userProfile && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>Signed in as:</strong> {userProfile.email}
                  </p>
                  {needsPayment && (
                    <p className="text-sm text-gray-700 mt-2">
                      <strong>Account type:</strong> Producer
                    </p>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-12 text-[15px] focus:border-purple-400 transition-all rounded-lg"
                  />
                </div>

                <div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-12 text-[15px] focus:border-purple-400 transition-all rounded-lg"
                  />
                </div>

                <div>
                  <Textarea
                    id="message"
                    placeholder={needsPayment
                      ? "Tell us about your organization and which plan you're interested in (Starter, Growth, or Enterprise)..."
                      : "Tell us about your events and why you'd like access to Voxxy Presents..."
                    }
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows={5}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 text-[15px] focus:border-purple-400 transition-all resize-none rounded-lg"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-voxxy-purple-brand hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-xl h-12"
                >
                  {isSubmitting ? 'Submitting...' : (needsPayment ? 'Contact Sales' : 'Request Access')}
                  {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </form>

              <div className="text-center pt-6 mt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  Need to sign in with a different account?
                </p>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}