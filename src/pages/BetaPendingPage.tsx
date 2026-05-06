import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Mail, Loader2, AlertCircle, ArrowLeft, Check, Sparkles, DollarSign, Calendar, Users, BarChart3, Zap, CreditCard, Building2, Trash2, Info } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { authApi, organizationsApi, ApiError } from '@/services/api'
import { Separator } from "@/components/ui/separator"
import { stripeService } from '@/services/stripeService'
import { useForceTheme } from '@/hooks/useForceTheme'

export default function BetaPendingPage() {
  useForceTheme('dark')
  const navigate = useNavigate()
  const { userProfile, signOut, refreshUserProfile, isProducer, isEmailVerified, isPaid } = useAuth()

  // Payment state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Email verification state
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null)

  // Organization state
  const [organization, setOrganization] = useState<any>(null)
  const [isLoadingOrg, setIsLoadingOrg] = useState(false)

  // Delete account state
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Account status checks (V4.0: using subscription_active from AuthContext)
  const needsPayment = isProducer && !isPaid

  // Fetch organization details for producers
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!isProducer) return

      setIsLoadingOrg(true)
      try {
        const orgData = await organizationsApi.getMine()
        setOrganization(orgData)
      } catch (error) {
        console.error('Failed to fetch organization:', error)
      } finally {
        setIsLoadingOrg(false)
      }
    }

    fetchOrganization()
  }, [isProducer])

  // Redirect to dashboard if already paid
  useEffect(() => {
    if (isEmailVerified && isPaid) {
      navigate('/dashboard')
    }
  }, [isEmailVerified, isPaid, navigate])

  // Reset payment state when user returns to page (e.g., browser back button)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reset payment state when user returns to page
        setIsProcessingPayment(false)
        setPaymentError(null)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

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

  const handleStartPayment = async () => {
    setIsProcessingPayment(true)
    setPaymentError(null)

    try {
      console.log('💳 Starting Stripe checkout flow...')
      await stripeService.redirectToCheckout()
      // User will be redirected to Stripe checkout page
    } catch (error) {
      console.error('❌ Failed to start payment:', error)
      setPaymentError('Failed to start payment process. Please try again.')
      setIsProcessingPayment(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsDeleting(true)
    try {
      await authApi.deleteAccount()
      // Sign out and redirect to home
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('Failed to delete account. Please try again or contact support.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Features list matching PaymentOnboardingPage
  const features = [
    {
      icon: Calendar,
      title: "Unlimited Events",
      description: "Create and manage as many events as you need"
    },
    {
      icon: Users,
      title: "Vendor Management",
      description: "Accept and manage vendor applications with ease"
    },
    {
      icon: Mail,
      title: "Automated Email Campaigns",
      description: "Send targeted emails to vendors and attendees"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Track registrations, payments, and engagement"
    },
    {
      icon: Zap,
      title: "Payment Integration",
      description: "Sync with Eventbrite and track vendor payments"
    },
    {
      icon: CreditCard,
      title: "Custom Branding",
      description: "Customize your event pages and application forms"
    }
  ]

  return (
    <div className="dark voxxy-public-page min-h-screen voxxy-gradient-page-alt relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23a855f7' fillOpacity='0.4'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <Card className="w-full bg-background/5 backdrop-blur-xl border border-primary/20 shadow-[0_0_50px_rgba(144,84,227,0.3)]">
            <CardHeader className="text-center relative pt-12 pb-6">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="absolute top-4 left-4 text-muted-foreground hover:text-foreground hover:bg-background/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>

              <CardTitle className="text-3xl font-bold text-foreground mb-3">
                Welcome to <span className="bg-gradient-to-r from-primary via-voxxy-pink to-primary bg-clip-text text-transparent">Voxxy</span>
              </CardTitle>
              <CardDescription className="text-base">
                Complete the steps below to finish setting up your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pb-8">
              {/* Organization Information Section (for debugging) */}
              {isProducer && organization && (
                <div className="bg-blue-500/10 border-2 border-blue-400/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Your Organization (Auto-Created)</h3>
                    <Badge variant="outline" className="ml-auto bg-blue-500/20 border-blue-400/30 text-blue-300 text-xs">
                      <Info className="h-3 w-3 mr-1" />
                      Debugging Info
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Organization Name</span>
                      <span className="text-white font-medium">{organization.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Slug</span>
                      <span className="text-gray-300 font-mono text-xs">{organization.slug}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white font-medium">{organization.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Subscription Status</span>
                      <span className="text-yellow-300 font-medium">{organization.subscription_status || 'inactive'}</span>
                    </div>
                  </div>
                  <Alert className="bg-blue-500/10 border-blue-400/30 mt-3">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200 text-xs">
                      This organization was automatically created for you. You can update these details in Settings after completing payment.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {isProducer && isLoadingOrg && (
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-gray-400 mt-2">Loading organization details...</p>
                </div>
              )}

              {/* Account Information Section */}
              {userProfile && (
                <div className="bg-background/5 rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-foreground font-medium">{userProfile.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Role</span>
                      <span className="text-primary font-semibold">
                        {userProfile.role === 'venue_owner' || userProfile.role === 'producer'
                          ? 'Producer / Venue Owner'
                          : userProfile.role?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      Meant to sign up as a different role or with another email? Use the request form below to contact us & we'll update your account information!
                    </p>
                  </div>

                  <Separator className="bg-background/10" />

                  <div className="flex flex-wrap gap-2 justify-center">
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-400/20 text-emerald-900 dark:text-green-300 text-xs rounded-md">
                        <CheckCircle className="h-3 w-3" />
                        <span>Email Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-400/20 text-yellow-950 dark:text-yellow-300 text-xs rounded-md">
                        <AlertCircle className="h-3 w-3" />
                        <span>Email Pending</span>
                      </span>
                    )}
                    {needsPayment ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-400/20 text-red-950 dark:text-red-300 text-xs rounded-md">
                        <AlertCircle className="h-3 w-3" />
                        <span>Payment Required</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-400/20 text-emerald-900 dark:text-green-300 text-xs rounded-md">
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
                      <h3 className="text-lg font-semibold text-foreground">Email Verified</h3>
                      <span className="ml-auto text-sm text-green-400 font-medium">✓ Complete</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-6 w-6 text-pink-400" />
                      <h3 className="text-lg font-semibold text-foreground">Verify Your Email</h3>
                      <span className="ml-auto text-sm text-yellow-400 font-medium">Step 1 of 2</span>
                    </>
                  )}
                </div>
                <Separator className="bg-background/10" />

                {!isEmailVerified ? (
                  <>

                    {/* Display User Email */}
                    <div className="bg-pink-500/10 border-2 border-pink-400 rounded-lg p-4">
                      <p className="text-sm text-gray-200 text-center">
                        <strong>Verification code sent to:</strong>
                      </p>
                      <p className="text-base text-foreground font-mono text-center mt-1 break-all">
                        {userProfile?.email}
                      </p>
                    </div>

                    {verificationSuccess && (
                      <Alert className="bg-green-500/20 border-green-500">
                        <AlertDescription className="text-foreground font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {verificationSuccess}
                        </AlertDescription>
                      </Alert>
                    )}

                    {verificationError && (
                      <Alert className="bg-red-500/20 border-red-500">
                        <AlertDescription className="text-foreground font-medium flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {verificationError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleVerifyEmail} className="space-y-5">
                      <div className="space-y-2">
                        <label htmlFor="verification-code" className="text-foreground text-sm">
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
                          className="bg-background/10 border-border text-foreground placeholder:text-muted-foreground h-12 text-center text-2xl tracking-widest font-mono focus:bg-background/15 focus:border-yellow-400/50 transition-all"
                          disabled={isVerifying || isResending}
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          Check your email for the 6-digit code
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={isVerifying || isResending || verificationCode.length !== 6}
                        className="w-full voxxy-btn-cta font-semibold shadow-md dark:shadow-[0_0_20px_rgba(236,72,153,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <p className="text-muted-foreground text-sm mb-2">
                        Didn't receive the code?
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResendVerification}
                        disabled={isVerifying || isResending}
                        className="text-pink-400 hover:text-pink-300 hover:bg-background/10"
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
                  <div className="bg-green-500/10 border-2 border-green-400 rounded-lg p-4 text-center">
                    <p className="text-green-300 text-sm">
                      Your email has been verified. You can now proceed with payment.
                    </p>
                  </div>
                )}
              </div>

              {/* Pricing Tiers Section - Always visible when payment needed */}
              {needsPayment && (
                <div className="space-y-6 pt-6">
                  <div className="mt-6 pt-6 border-t border-border">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <h4 className="text-2xl font-bold text-foreground">Start Your Producer Account</h4>
                      </div>
                      <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
                        Get instant access to all producer features with our $80/month plan
                      </p>
                    </div>

                    {/* Main Payment Card */}
                    <Card className="bg-background/10 backdrop-blur-md border-2 border-primary shadow-2xl max-w-4xl mx-auto">
                      <CardHeader className="text-center pb-6 space-y-4">
                        <div className="flex justify-center mb-4">
                          <div className="voxxy-accent-tile rounded-full p-4">
                            <DollarSign className="h-12 w-12 text-foreground" />
                          </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-foreground">
                          Producer Monthly Plan
                        </CardTitle>
                        <div className="flex items-baseline justify-center gap-2 pt-4">
                          <span className="text-6xl font-bold text-foreground">$80</span>
                          <span className="text-xl text-muted-foreground">/month</span>
                        </div>
                        <CardDescription className="text-lg pt-2">
                          Everything you need to manage successful events
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Features Grid */}
                        <div className="grid md:grid-cols-2 gap-4 py-6">
                          {features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-4 bg-background/5 rounded-lg border border-border hover:bg-background/10 hover:border-primary/40 transition-colors"
                            >
                              <div className="bg-primary/20 rounded-full p-2 flex-shrink-0">
                                <feature.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h5 className="text-foreground font-semibold text-sm mb-1">
                                  {feature.title}
                                </h5>
                                <p className="text-muted-foreground text-xs">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Separator className="bg-background/10" />

                        {/* Payment CTA Section */}
                        <div className="space-y-4 pt-4">
                          {!isEmailVerified ? (
                            <div className="text-center p-6 bg-yellow-500/10 border-2 border-yellow-400 rounded-lg">
                              <AlertCircle className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
                              <h5 className="text-foreground font-semibold mb-2">Email Verification Required</h5>
                              <p className="text-muted-foreground text-sm">
                                Please verify your email first (Step 1 above) to start payment
                              </p>
                            </div>
                          ) : isPaid ? (
                            <div className="text-center p-6 bg-green-500/10 border-2 border-green-400 rounded-lg">
                              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                              <h5 className="text-foreground font-semibold text-lg mb-2">Payment Complete!</h5>
                              <p className="text-muted-foreground text-sm mb-4">
                                Your producer account is active. Redirecting to dashboard...
                              </p>
                            </div>
                          ) : (
                            <>
                              {paymentError && (
                                <Alert className="bg-red-500/10 border-red-400/30">
                                  <AlertCircle className="h-4 w-4 text-red-400" />
                                  <AlertDescription className="text-red-300 text-sm">
                                    {paymentError}
                                  </AlertDescription>
                                </Alert>
                              )}

                              <Button
                                onClick={handleStartPayment}
                                disabled={isProcessingPayment}
                                size="lg"
                                className="w-full h-14 text-lg font-bold voxxy-btn-cta-pink shadow-md shadow-primary/15 hover:shadow-lg dark:shadow-primary/30 dark:hover:shadow-xl transition-all"
                              >
                                {isProcessingPayment ? (
                                  <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Starting Secure Checkout...
                                  </>
                                ) : (
                                  <>
                                    <DollarSign className="mr-2 h-5 w-5" />
                                    Start Your Producer Account ($80/mo)
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                  </>
                                )}
                              </Button>

                              <p className="text-center text-sm text-muted-foreground">
                                Secure payment powered by Stripe • Cancel anytime
                              </p>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Sign Out Section */}
              <div className="text-center pt-6 mt-6 border-t border-border space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Need to sign in with a different account?
                  </p>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="text-pink-400 hover:text-pink-300 hover:bg-background/10"
                  >
                    Sign Out
                  </Button>
                </div>

                {/* Delete Account Section */}
                <div className="pt-4 mt-4 border-t border-border/60">
                  {!showDeleteConfirm ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-3">
                        Want to start over or made a mistake during signup?
                      </p>
                      <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-500 hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete Account
                      </Button>
                    </>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <AlertCircle className="h-5 w-5" />
                        <h4 className="font-semibold">Are you sure?</h4>
                      </div>
                      <p className="text-sm text-red-800/90 dark:text-red-200">
                        This will permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <div className="flex gap-3 justify-center pt-2">
                        <Button
                          onClick={() => setShowDeleteConfirm(false)}
                          variant="outline"
                          size="sm"
                          className="border-border text-foreground hover:bg-accent/50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3 w-3 mr-2" />
                              Yes, Delete My Account
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}