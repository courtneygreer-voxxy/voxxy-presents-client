import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowRight,
  CheckCircle,
  Mail,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  DollarSign,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { authApi, ApiError } from '@/services/api'
import { Separator } from '@/components/ui/separator'
import { stripeService } from '@/services/stripeService'
import { useForceTheme } from '@/hooks/useForceTheme'

export default function BetaPendingPage() {
  useForceTheme('dark')
  const navigate = useNavigate()
  const { userProfile, signOut, refreshUserProfile, isProducer, isEmailVerified, isPaid } =
    useAuth()

  // Payment state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Email verification state
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null)

  // Delete account state
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Account status checks
  const needsPayment = isProducer && !isPaid

  // Redirect to dashboard if already paid
  useEffect(() => {
    if (isEmailVerified && isPaid) {
      navigate('/dashboard')
    }
  }, [isEmailVerified, isPaid, navigate])

  // Reset payment state when user returns to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsProcessingPayment(false)
        setPaymentError(null)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
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
      await refreshUserProfile()
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
      await stripeService.redirectToCheckout()
    } catch (error) {
      console.error('Failed to start payment:', error)
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
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('Failed to delete account. Please try again or contact support.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="dark voxxy-public-page min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 voxxy-gradient-hero-split relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-foreground">
          <div className="text-center space-y-6">
            <Sparkles className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-4">Almost There</h1>
            <p className="text-xl text-white/80 max-w-md">
              Complete your setup to start managing events, vendors, and email campaigns with Voxxy
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Setup Steps */}
      <div className="w-full lg:w-1/2 voxxy-auth-panel relative overflow-hidden">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 z-50 text-muted-foreground hover:text-foreground hover:bg-background/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.3] lg:opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23a855f7' fillOpacity='0.3'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Sparkles className="h-16 w-16 mx-auto text-primary mb-4" />
              <h1 className="text-3xl font-bold text-foreground">Almost There</h1>
            </div>

            <Card className="w-full bg-background/5 backdrop-blur-xl border border-primary/30 shadow-[0_0_50px_rgba(144,84,227,0.3)]">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Complete Your Setup
                </CardTitle>
                <CardDescription>
                  {!isEmailVerified
                    ? 'Verify your email to continue'
                    : needsPayment
                      ? 'Activate your producer account'
                      : 'Your account is ready!'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Step 1: Email Verification */}
                {!isEmailVerified ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-5 w-5 text-pink-400" />
                      <h3 className="text-sm font-semibold text-foreground">Verify Your Email</h3>
                      <span className="ml-auto text-xs text-muted-foreground">Step 1 of 2</span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      We sent a 6-digit code to{' '}
                      <span className="text-foreground font-medium">{userProfile?.email}</span>
                    </p>

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

                    <form onSubmit={handleVerifyEmail} className="space-y-4">
                      <Input
                        type="text"
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                          setVerificationCode(value)
                        }}
                        maxLength={6}
                        className="bg-background/10 border-primary/30 text-foreground placeholder:text-muted-foreground h-12 text-center text-2xl tracking-widest font-mono focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                        disabled={isVerifying || isResending}
                      />

                      <Button
                        type="submit"
                        disabled={isVerifying || isResending || verificationCode.length !== 6}
                        className="w-full voxxy-btn-cta font-semibold shadow-md dark:shadow-[0_0_20px_rgba(236,72,153,0.5)]"
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

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isVerifying || isResending}
                        className="text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isResending ? 'Sending...' : "Didn't get the code? Resend"}
                      </button>
                    </div>
                  </>
                ) : needsPayment ? (
                  /* Step 2: Payment */
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-sm text-green-400">Email verified</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-pink-400" />
                      <h3 className="text-sm font-semibold text-foreground">
                        Activate Your Account
                      </h3>
                      <span className="ml-auto text-xs text-muted-foreground">Step 2 of 2</span>
                    </div>

                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-foreground">$40</div>
                      <div className="text-muted-foreground">/month</div>
                      <p className="text-sm text-primary font-medium mt-2">
                        Limited time pricing for early customers
                      </p>
                    </div>

                    {paymentError && (
                      <Alert className="bg-red-500/20 border-red-500">
                        <AlertDescription className="text-foreground font-medium flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {paymentError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={handleStartPayment}
                      disabled={isProcessingPayment}
                      className="w-full voxxy-btn-cta font-semibold shadow-md dark:shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting Checkout...
                        </>
                      ) : (
                        <>
                          Start Your Producer Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      Secure payment powered by Stripe. Cancel anytime.
                    </p>
                  </>
                ) : (
                  /* All done */
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <p className="text-foreground font-semibold">Your account is active!</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Redirecting to dashboard...
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4">
                  <Separator className="bg-background/20" />
                  <div className="text-center mt-4 space-y-3">
                    <p className="text-muted-foreground text-sm">
                      Need a different account?{' '}
                      <button
                        onClick={handleSignOut}
                        className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
                      >
                        Sign out
                      </button>
                    </p>

                    {/* Delete Account */}
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                      >
                        <Trash2 className="h-3 w-3 inline mr-1" />
                        Delete account
                      </button>
                    ) : (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-2 text-left">
                        <p className="text-sm text-red-300 font-medium">
                          Permanently delete your account?
                        </p>
                        <div className="flex gap-2">
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
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              'Yes, Delete'
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
    </div>
  )
}
