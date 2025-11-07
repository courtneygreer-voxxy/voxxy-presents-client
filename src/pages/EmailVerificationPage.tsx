import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { authApi, ApiError } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'

export default function EmailVerificationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshUserProfile } = useAuth()

  const emailFromUrl = searchParams.get('email') || ''

  const [verificationCode, setVerificationCode] = useState('')
  const [email, setEmail] = useState(emailFromUrl)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code')
      return
    }

    setIsVerifying(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await authApi.verifyEmailCode(verificationCode)
      setIsVerified(true)
      setSuccessMessage(response.message || 'Email verified successfully!')

      // Refresh user profile to get updated confirmed_at status
      await refreshUserProfile()

      // Redirect to appropriate dashboard after 2 seconds
      setTimeout(() => {
        navigate('/profile')
      }, 2000)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to verify email. Please try again.')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    if (!email || !email.trim()) {
      setError('Please enter your email address to resend the verification code')
      return
    }

    setIsResending(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await authApi.resendVerificationEmail(email)
      setSuccessMessage(response.message || 'Verification code has been resent to your email')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to resend verification email. Please try again.')
      }
    } finally {
      setIsResending(false)
    }
  }

  // Auto-focus on verification code input
  useEffect(() => {
    const input = document.getElementById('verification-code')
    if (input) {
      input.focus()
    }
  }, [])

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
        <div className="max-w-md w-full space-y-8">
          <Card className="w-full bg-white/5 backdrop-blur-xl border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <CardHeader className="text-center relative pt-12">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="absolute top-4 left-4 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>

              {isVerified ? (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <CardTitle className="text-2xl font-bold text-white">Email Verified!</CardTitle>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Mail className="h-6 w-6 text-pink-400" />
                  <CardTitle className="text-2xl font-bold text-white">Verify Your Email</CardTitle>
                </div>
              )}

              <CardDescription className="text-gray-300">
                {isVerified
                  ? 'Your email has been successfully verified. Redirecting to your dashboard...'
                  : 'Enter the 6-digit verification code sent to your email'
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Success Message */}
              {successMessage && (
                <Alert className="bg-green-500/20 border-green-500 mb-4">
                  <AlertDescription className="text-white font-medium">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert className="bg-red-500/20 border-red-500 mb-4">
                  <AlertDescription className="text-white font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {!isVerified && (
                <form onSubmit={handleVerify} className="space-y-6">
                  {/* Email Field (for resending) */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-white text-sm">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                      disabled={isVerifying || isResending}
                    />
                  </div>

                  {/* Verification Code Field */}
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
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 text-center text-2xl tracking-widest font-mono"
                      disabled={isVerifying || isResending}
                    />
                    <p className="text-xs text-gray-400 text-center">
                      Check your email for the 6-digit code
                    </p>
                  </div>

                  {/* Verify Button */}
                  <Button
                    type="submit"
                    disabled={isVerifying || isResending || verificationCode.length !== 6}
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(236,72,153,0.5)]"
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

                  {/* Resend Code */}
                  <div className="text-center">
                    <p className="text-gray-300 text-sm mb-2">
                      Didn't receive the code?
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendCode}
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
                </form>
              )}

              {/* Success state - show nothing, just the success message above */}
              {isVerified && (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-400" />
                  <p className="text-gray-300 mt-4">Redirecting to your dashboard...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
