import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { authApi, ApiError } from '@/services/api'
import { validatePassword } from '@/utils/validation'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token. Please check your email again or request a new reset link.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPasswordErrors([])

    // Validate token exists
    if (!token) {
      setError('Invalid or missing token. Please check your email again.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true)

    try {
      await authApi.resetPasswordWithToken(token, password)
      setSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login/club-owner'), 3000)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to reset password. Please try again.')
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: 'password' | 'confirmPassword', value: string) => {
    if (field === 'password') {
      setPassword(value)
    } else {
      setConfirmPassword(value)
    }

    // Clear errors when user starts typing
    if (error) setError('')
    if (passwordErrors.length > 0) setPasswordErrors([])
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
          <Lock className="h-20 w-20 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Reset Password</h1>
          <p className="voxxy-auth-hero-copy max-w-md text-center text-xl">
            {!success
              ? "Create a new secure password for your Voxxy account"
              : "Your password has been reset successfully!"
            }
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 voxxy-auth-panel relative overflow-hidden">
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
              <Lock className="voxxy-auth-accent mx-auto mb-4 h-16 w-16" />
              <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
            </div>

            <Card className="voxxy-auth-card w-full">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Lock className="voxxy-auth-accent h-6 w-6" />
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {!success ? 'Reset Your Password' : 'Password Reset Successful!'}
                  </CardTitle>
                </div>
                <CardDescription>
                  {!success
                    ? 'Create a new secure password for your account'
                    : "You'll be redirected to login in a few seconds..."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!success ? (
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

                    {/* Password Validation Errors */}
                    {passwordErrors.length > 0 && (
                      <Alert className="bg-red-500/20 border-red-500 border-2 mb-6 shadow-lg">
                        <AlertDescription>
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-foreground font-medium mb-2">Password Requirements:</div>
                                <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                                {passwordErrors.map((err, index) => (
                                  <li key={index}>• {err}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* New Password Field */}
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your new password"
                            value={password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="voxxy-input-frost pl-10 pr-10"
                            disabled={loading || !token}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            disabled={loading || !token}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password Field */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="voxxy-input-frost pl-10 pr-10"
                            disabled={loading || !token}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            disabled={loading || !token}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={loading || !token}
                        className="w-full voxxy-btn-cta font-semibold shadow-md dark:shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting Password...
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </Button>
                    </form>

                    {/* Request New Link */}
                    <div className="mt-6 text-center">
                      <p className="text-muted-foreground text-sm mb-2">
                        Link expired or invalid?
                      </p>
                      <button
                        onClick={() => navigate('/forgot-password')}
                        className="voxxy-auth-link text-sm font-medium transition-colors"
                        disabled={loading}
                      >
                        Request New Reset Link
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
                          Your password has been updated successfully. You can now sign in with your new password.
                        </div>
                      </AlertDescription>
                    </Alert>

                    {/* Sign In Button */}
                    <Button
                      onClick={() => navigate('/login/club-owner')}
                      className="w-full voxxy-btn-cta font-semibold shadow-md dark:shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                    >
                      Go to Sign In
                    </Button>
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
