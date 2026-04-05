import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Mail, Loader2, AlertCircle, ArrowLeft, Check, Sparkles } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { authApi, ApiError } from '@/services/api'
import { Separator } from "@/components/ui/separator"

export default function BetaPendingPage() {
  const navigate = useNavigate()
  const { userProfile, signOut, refreshUserProfile } = useAuth()

  // Contact form state
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Email verification state
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null)

  // Account status checks
  const isProducer = userProfile?.role === 'venue_owner' || userProfile?.role === 'producer'
  const isPaid = userProfile?.paid === true
  const needsPayment = isProducer && !isPaid
  const isEmailVerified = userProfile?.confirmed_at !== null && userProfile?.confirmed_at !== undefined

  // Prefill form data when userProfile loads (handles page refresh)
  useEffect(() => {
    if (userProfile && !formData.email && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.name || '',
        email: userProfile.email || ''
      }))
    }
  }, [userProfile])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setVerificationError('Please enter a valid 6-digit verification code')
      return
    }

    setIsVerifying(true)
    setVerificationError(null)
    setVerificationSuccess(null)

    try {
      const response = await authApi.verifyEmailCode(verificationCode)
      setVerificationSuccess(response.message || 'Email verified successfully!')

      // Refresh user profile to get updated confirmed_at status
      await refreshUserProfile()

      // Clear the verification code
      setVerificationCode('')
    } catch (err) {
      if (err instanceof ApiError) {
        setVerificationError(err.message)
      } else {
        setVerificationError('Failed to verify email. Please try again.')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendVerification = async () => {
    if (!userProfile?.email) {
      setVerificationError('Email address not found')
      return
    }

    setIsResending(true)
    setVerificationError(null)
    setVerificationSuccess(null)

    try {
      const response = await authApi.resendVerificationEmail(userProfile.email)
      setVerificationSuccess(response.message || 'Verification code has been resent to your email')
    } catch (err) {
      if (err instanceof ApiError) {
        setVerificationError(err.message)
      } else {
        setVerificationError('Failed to resend verification email. Please try again.')
      }
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Submit contact form for access request
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      // Strip /api from URL since /contacts is a legacy endpoint not under /api namespace
      const contactsUrl = `${API_BASE_URL.replace('/api', '')}/contacts`
      console.log('📧 Submitting access request to:', contactsUrl)
      console.log('📧 Form data:', { name: formData.name, email: formData.email })

      const subject = needsPayment
        ? 'Voxxy Presents - Payment/Subscription Request'
        : 'Voxxy Presents - Access Request'

      const response = await fetch(contactsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: {
            name: formData.name,
            email: formData.email,
            subject: subject,
            message: formData.message
          }
        })
      })

      console.log('📧 Response status:', response.status)

      if (response.ok) {
        console.log('✅ Access request submitted successfully')
        setIsSubmitted(true)
      } else {
        // Handle non-OK responses
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit request' }))
        console.error('❌ Failed to submit access request:', response.status, errorData)
        setError(errorData.message || errorData.error || `Failed to submit request (${response.status})`)
      }
    } catch (error) {
      console.error('❌ Network error submitting access request:', error)
      setError('Network error - please check your connection and try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23a855f7' fillOpacity='0.4'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <Card className="w-full bg-white/5 backdrop-blur-xl border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <CardHeader className="text-center relative pt-12 pb-6">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="absolute top-4 left-4 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>

              <CardTitle className="text-3xl font-bold text-white mb-3">
                Welcome to <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">Voxxy</span>
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Complete the steps below to finish setting up your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pb-8">
              {/* Account Information Section */}
              {userProfile && (
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white font-medium">{userProfile.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Role</span>
                      <span className="text-purple-300 font-semibold">
                        {userProfile.role === 'venue_owner' || userProfile.role === 'producer'
                          ? 'Producer / Venue Owner'
                          : userProfile.role?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 italic">
                      Meant to sign up as a different role or with another email? Use the request form below to contact us & we'll update your account information!
                    </p>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex flex-wrap gap-2 justify-center">
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-400/20 text-green-300 text-xs rounded-md">
                        <CheckCircle className="h-3 w-3" />
                        <span>Email Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-400/20 text-yellow-300 text-xs rounded-md">
                        <AlertCircle className="h-3 w-3" />
                        <span>Email Pending</span>
                      </span>
                    )}
                    {needsPayment ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-400/20 text-red-300 text-xs rounded-md">
                        <AlertCircle className="h-3 w-3" />
                        <span>Payment Required</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-400/20 text-green-300 text-xs rounded-md">
                        <CheckCircle className="h-3 w-3" />
                        <span>Paid</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Email Verification Section */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2">
                  {isEmailVerified ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Email Verified</h3>
                      <span className="ml-auto text-sm text-green-400 font-medium">✓ Complete</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-6 w-6 text-pink-400" />
                      <h3 className="text-lg font-semibold text-white">Verify Your Email</h3>
                      <span className="ml-auto text-sm text-yellow-400 font-medium">Step 1 of 2</span>
                    </>
                  )}
                </div>
                <Separator className="bg-white/10" />

                {!isEmailVerified ? (
                  <>

                    {/* Display User Email */}
                    <div className="bg-pink-500/10 border border-pink-400/30 rounded-lg p-4">
                      <p className="text-sm text-gray-200 text-center">
                        <strong>Verification code sent to:</strong>
                      </p>
                      <p className="text-base text-white font-mono text-center mt-1 break-all">
                        {userProfile?.email}
                      </p>
                    </div>

                    {verificationSuccess && (
                      <Alert className="bg-green-500/20 border-green-500">
                        <AlertDescription className="text-white font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {verificationSuccess}
                        </AlertDescription>
                      </Alert>
                    )}

                    {verificationError && (
                      <Alert className="bg-red-500/20 border-red-500">
                        <AlertDescription className="text-white font-medium flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {verificationError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleVerifyEmail} className="space-y-5">
                      <div className="space-y-2">
                        <label htmlFor="verification-code" className="text-white text-sm">
                          Verification Code
                        </label>
                        <Input
                          id="verification-code"
                          type="text"
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setVerificationCode(value)
                          }}
                          maxLength={6}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 text-center text-2xl tracking-widest font-mono focus:bg-white/15 focus:border-yellow-400/50 transition-all"
                          disabled={isVerifying || isResending}
                        />
                        <p className="text-xs text-gray-400 text-center">
                          Check your email for the 6-digit code
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={isVerifying || isResending || verificationCode.length !== 6}
                        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(236,72,153,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify Email'
                        )}
                      </Button>
                    </form>

                    <div className="text-center pt-2">
                      <p className="text-gray-300 text-sm mb-2">
                        Didn't receive the code?
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResendVerification}
                        disabled={isVerifying || isResending}
                        className="text-pink-400 hover:text-pink-300 hover:bg-white/10"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Resend Code'
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4 text-center">
                    <p className="text-green-300 text-sm">
                      Your email has been verified. You can now proceed with payment.
                    </p>
                  </div>
                )}
              </div>

              {/* Pricing Tiers Section - Always visible when payment needed */}
              {needsPayment && (
                <div className="space-y-6 pt-6">
                  <div className="mt-6 pt-6 border-t border-white/10">
                        {/* Header */}
                        <div className="text-center mb-10">
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <Sparkles className="h-6 w-6 text-purple-400" />
                            <h4 className="text-2xl font-bold text-white">Pilot Program Pricing</h4>
                          </div>
                          <p className="text-gray-300 text-base max-w-2xl mx-auto leading-relaxed">
                            As a pilot user, you'll get our Enterprise plan at a fraction of the cost. Lock in this exclusive rate for a full year!
                          </p>
                        </div>

                        {/* Pricing Cards - Vertical Stack with 2-Column Layout */}
                        <div className="flex flex-col gap-6 mb-8 max-w-4xl mx-auto">
                          {/* Enterprise Plan - HIGHLIGHTED (SHOWN FIRST) */}
                          <Card className="bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 border-2 border-fuchsia-400 shadow-xl shadow-fuchsia-500/30 relative transform hover:scale-[1.02] transition-transform duration-200">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                              <Badge className="bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white px-4 py-1.5 text-sm font-bold shadow-lg">
                                🎉 PILOT SPECIAL
                              </Badge>
                            </div>
                            <CardContent className="p-6 pt-10">
                              <div className="grid md:grid-cols-2 gap-6 items-start">
                                {/* Left: Pricing */}
                                <div className="text-center md:text-left md:border-r md:border-fuchsia-400/30 md:pr-6">
                                  <CardTitle className="text-2xl font-bold text-white mb-3">Enterprise</CardTitle>
                                  <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                    <span className="text-lg text-gray-400 line-through">$400</span>
                                    <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-300">
                                      $80
                                    </span>
                                  </div>
                                  <CardDescription className="text-fuchsia-300 text-sm font-semibold mb-4">
                                    per month - Lock in for 1 year!
                                  </CardDescription>
                                  <div className="bg-fuchsia-500/10 border border-fuchsia-400/30 rounded-lg p-3 mb-3">
                                    <p className="text-fuchsia-200 text-sm font-semibold text-center">
                                      Save $3,840/year!
                                    </p>
                                  </div>
                                  <p className="text-fuchsia-200 text-sm italic">Full enterprise features</p>
                                </div>

                                {/* Right: Features */}
                                <div>
                                  <ul className="space-y-3">
                                    <li className="flex items-start text-white text-sm">
                                      <Check className="h-5 w-5 text-fuchsia-400 mr-3 flex-shrink-0 mt-0.5" />
                                      <span><strong>Unlimited events</strong></span>
                                    </li>
                                    <li className="flex items-start text-white text-sm">
                                      <Check className="h-5 w-5 text-fuchsia-400 mr-3 flex-shrink-0 mt-0.5" />
                                      <span><strong>Unlimited contacts</strong></span>
                                    </li>
                                    <li className="flex items-start text-white text-sm">
                                      <Check className="h-5 w-5 text-fuchsia-400 mr-3 flex-shrink-0 mt-0.5" />
                                      <span>White-label automation</span>
                                    </li>
                                    <li className="flex items-start text-white text-sm">
                                      <Check className="h-5 w-5 text-fuchsia-400 mr-3 flex-shrink-0 mt-0.5" />
                                      <span>Advanced CRM & analytics</span>
                                    </li>
                                    <li className="flex items-start text-white text-sm">
                                      <Check className="h-5 w-5 text-fuchsia-400 mr-3 flex-shrink-0 mt-0.5" />
                                      <span>Dedicated account manager</span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Starter Plan */}
                          <Card className="bg-white/5 border border-white/10">
                            <CardContent className="p-6">
                              <div className="grid md:grid-cols-2 gap-6 items-center">
                                {/* Left: Pricing */}
                                <div className="text-center md:text-left md:border-r md:border-white/10 md:pr-6">
                                  <CardTitle className="text-2xl font-bold text-white mb-2">Starter</CardTitle>
                                  <div className="text-4xl font-bold text-white mb-2">$80</div>
                                  <CardDescription className="text-gray-400 text-sm mb-3">per month</CardDescription>
                                  <p className="text-gray-400 text-sm italic">Perfect for new producers</p>
                                </div>

                                {/* Right: Features */}
                                <div>
                                  <ul className="space-y-3">
                                    <li className="flex items-start text-gray-300 text-sm">
                                      <Check className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                                      <span>Up to 10 events/year</span>
                                    </li>
                                    <li className="flex items-start text-gray-300 text-sm">
                                      <Check className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                                      <span>10,000 vendor contacts</span>
                                    </li>
                                    <li className="flex items-start text-gray-300 text-sm">
                                      <Check className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                                      <span>Automated emails</span>
                                    </li>
                                    <li className="flex items-start text-gray-300 text-sm">
                                      <Check className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                                      <span>Email support</span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Growth Plan */}
                          <Card className="bg-white/5 border border-white/10">
                            <CardContent className="p-6">
                              <div className="grid md:grid-cols-2 gap-6 items-center">
                                {/* Left: Pricing */}
                                <div className="text-center md:text-left md:border-r md:border-white/10 md:pr-6">
                                  <CardTitle className="text-2xl font-bold text-white mb-2">Growth</CardTitle>
                                  <div className="text-4xl font-bold text-white mb-2">$160</div>
                                  <CardDescription className="text-gray-400 text-sm mb-3">per month</CardDescription>
                                  <p className="text-gray-400 text-sm italic">For established producers</p>
                                </div>

                                {/* Right: Features */}
                                <div>
                                  <ul className="space-y-3">
                                    <li className="flex items-start text-gray-300 text-sm">
                                      <Check className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                                      <span>Up to 50 events/year</span>
                                    </li>
                                    <li className="flex items-start text-gray-300 text-sm">
                                      <Check className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                                      <span>50,000 vendor contacts</span>
                                    </li>
                                    <li className="flex items-start text-gray-300 text-sm">
                                      <Check className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                                      <span>Advanced automation</span>
                                    </li>
                                    <li className="flex items-start text-gray-300 text-sm">
                                      <Check className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0 mt-1" />
                                      <span>Custom branding</span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                  {/* Request Access Form + CTA */}
                  <div className="mt-8 bg-white/5 rounded-lg border border-fuchsia-400/20 max-w-4xl mx-auto overflow-hidden">
                    {!isEmailVerified ? (
                      <div className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-white mb-3">Email Verification Required</h4>
                        <p className="text-gray-300 text-sm">
                          Please verify your email first (Step 1 above) to request paid access.
                        </p>
                      </div>
                    ) : isSubmitted ? (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="h-8 w-8 text-green-300" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-4">Request Sent Successfully!</h4>
                        <p className="text-white/70 mb-4">
                          We'll be in touch within 1-3 business days to get you started with your paid account.
                        </p>
                      </div>
                    ) : (
                      <div className="p-8">
                        {/* CTA Header */}
                        <div className="text-center mb-6">
                          <p className="text-xl text-white font-bold mb-2">
                            <strong className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-300">
                              Limited spots available!
                            </strong>
                          </p>
                          <p className="text-sm text-gray-300 leading-relaxed text-left">
                            We're currently working hands-on with a small group of pilot users to perfect the platform. Request access below to secure your pilot pricing and be among the first to lock in this exclusive rate.
                          </p>
                        </div>

                        <Separator className="bg-white/10 mb-6" />

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                          {/* Name and Email Row */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <Input
                              id="name"
                              placeholder="Your name"
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              required
                              className="bg-[#1a0a2e]/80 border-white/10 text-white placeholder:text-white/40 h-12 text-[15px] focus:bg-[#1a0a2e] focus:border-purple-400/50 transition-all rounded-lg"
                            />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Email address"
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              required
                              className="bg-[#1a0a2e]/80 border-white/10 text-white placeholder:text-white/40 h-12 text-[15px] focus:bg-[#1a0a2e] focus:border-purple-400/50 transition-all rounded-lg"
                            />
                          </div>

                          {/* Message */}
                          <Textarea
                            id="message"
                            placeholder="Tell us about your organization and events. How many events do you run per year?"
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            required
                            rows={4}
                            className="bg-[#1a0a2e]/80 border-white/10 text-white placeholder:text-white/40 text-[15px] focus:bg-[#1a0a2e] focus:border-purple-400/50 transition-all resize-none rounded-lg"
                          />

                          {error && (
                            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                              <p className="text-red-300 text-sm">{error}</p>
                            </div>
                          )}

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 hover:from-purple-700 hover:via-fuchsia-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white transition-all text-[15px] font-semibold rounded-xl shadow-lg shadow-fuchsia-500/20 hover:shadow-xl"
                          >
                            {isSubmitting ? 'Sending Request...' : 'Request Pilot Access'}
                            {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                          </button>

                          {/* Bottom Email Link */}
                          <p className="text-center text-[13px] text-white/50">
                            Or email us directly at{' '}
                            <a href="mailto:team@voxxypresents.com" className="text-fuchsia-400 hover:text-fuchsia-300">
                              team@voxxypresents.com
                            </a>
                          </p>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sign Out Section */}
              <div className="text-center pt-6 mt-6 border-t border-white/10">
                <p className="text-sm text-gray-300 mb-4">
                  Need to sign in with a different account?
                </p>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="text-pink-400 hover:text-pink-300 hover:bg-white/10"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}