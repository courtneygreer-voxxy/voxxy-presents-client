import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { authApi, ApiError } from '@/services/api'
import { validateEmail } from '@/utils/validation'
import { useForceTheme } from '@/hooks/useForceTheme'

export default function ForgotPasswordPage() {
  useForceTheme('dark')
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSendResetEmail = async () => {
    setError('')

    // Validate email
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      await authApi.requestPasswordReset(email.trim())
      setEmailSent(true)
      setResendDisabled(true)
      // Enable resend after 30 seconds
      setTimeout(() => setResendDisabled(false), 30000)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to send reset email. Please try again.')
      }
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendResetEmail()
  }

  const handleTryDifferentEmail = () => {
    setEmailSent(false)
    setEmail('')
    setError('')
    setResendDisabled(false)
  }

  return (
    <div className="dark voxxy-public-page min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 voxxy-gradient-hero-split relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-foreground">
          <Mail className="h-20 w-20 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Password Reset</h1>
          <p className="voxxy-auth-hero-copy max-w-md text-center text-xl">
            {!emailSent
              ? "No worries! We'll send you reset instructions."
              : 'Check your email for the reset link'}
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
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

        {/* Subtle Background Pattern */}
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
              <Mail className="voxxy-auth-accent mx-auto mb-4 h-16 w-16" />
              <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
            </div>

            <Card className="voxxy-auth-card w-full">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Mail className="voxxy-auth-accent h-6 w-6" />
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {!emailSent ? 'Forgot Your Password?' : 'Check Your Email!'}
                  </CardTitle>
                </div>
                <CardDescription>
                  {!emailSent
                    ? "Enter your email and we'll send you a secure link to reset your password"
                    : `We've sent a password reset link to ${email}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!emailSent ? (
                  <>
                    {/* Error Display */}
                    {error && (
                      <Alert className="bg-red-500/20 border-red-500 border-2 mb-6 shadow-lg">
                        <AlertDescription className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="text-foreground font-medium">{error}</div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              if (error) setError('')
                            }}
                            className="voxxy-input-frost pl-10"
                            disabled={loading}
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full voxxy-btn-cta font-semibold shadow-md dark:shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                      <p className="text-muted-foreground text-sm mb-2">
                        Remembered your password?
                      </p>
                      <button
                        onClick={() => navigate('/login/club-owner')}
                        className="voxxy-auth-link text-sm font-medium transition-colors"
                        disabled={loading}
                      >
                        <ArrowLeft className="h-3 w-3 inline mr-1" />
                        Back to Sign In
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Success State */}
                    <Alert className="bg-green-500/20 border-green-500 border-2 mb-6 shadow-lg">
                      <AlertDescription className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="text-foreground font-medium">
                          Check your inbox and follow the instructions to reset your password.
                        </div>
                      </AlertDescription>
                    </Alert>

                    {/* Resend Button */}
                    <Button
                      onClick={handleSendResetEmail}
                      disabled={resendDisabled || loading}
                      className="w-full voxxy-btn-cta font-semibold shadow-md dark:shadow-[0_0_20px_rgba(236,72,153,0.5)] disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : resendDisabled ? (
                        'Email Sent - Wait 30s...'
                      ) : (
                        'Resend Email'
                      )}
                    </Button>

                    {/* Try Different Email */}
                    <div className="mt-6 text-center">
                      <p className="text-muted-foreground text-sm mb-2">Wrong email?</p>
                      <button
                        onClick={handleTryDifferentEmail}
                        className="voxxy-auth-link text-sm font-medium transition-colors"
                        disabled={loading}
                      >
                        Try Different Email
                      </button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
