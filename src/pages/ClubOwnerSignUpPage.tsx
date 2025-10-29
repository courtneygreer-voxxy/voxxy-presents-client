import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Mail, User, Lock, Users, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail, validatePassword } from '@/services/authService'
import { usePageTracking } from '@/hooks/usePageTracking'
import { analytics } from '@/lib/analytics'

interface FormData {
  displayName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

interface FormErrors {
  displayName?: string
  email?: string
  password?: string[]
  confirmPassword?: string
  acceptTerms?: string
  submit?: string
}

export default function ClubOwnerSignUpPage() {
  usePageTracking('Club Owner Sign Up')

  const navigate = useNavigate()
  const { signUp, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStarted, setFormStarted] = useState(false)

  // Validation
  const validateField = (field: keyof FormData, value: any): string | string[] | undefined => {
    switch (field) {
      case 'displayName':
        if (!value.trim()) return 'Display name is required'
        if (value.trim().length < 2) return 'Display name must be at least 2 characters'
        if (value.trim().length > 50) return 'Display name must be less than 50 characters'
        return undefined

      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!validateEmail(value)) return 'Please enter a valid email address'
        return undefined

      case 'password': {
        if (!value) return ['Password is required']
        const passwordValidation = validatePassword(value)
        return passwordValidation.isValid ? undefined : passwordValidation.errors
      }

      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        return undefined

      case 'acceptTerms':
        if (!value) return 'You must accept the terms and conditions'
        return undefined

      default:
        return undefined
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    if (error) {
      clearError()
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    const displayNameError = validateField('displayName', formData.displayName)
    if (displayNameError) newErrors.displayName = displayNameError as string

    const emailError = validateField('email', formData.email)
    if (emailError) newErrors.email = emailError as string

    const passwordError = validateField('password', formData.password)
    if (passwordError) newErrors.password = passwordError as string[]

    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword)
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError as string

    const acceptTermsError = validateField('acceptTerms', formData.acceptTerms)
    if (acceptTermsError) newErrors.acceptTerms = acceptTermsError as string

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors(prev => ({ ...prev, submit: undefined }))

    // Track form submission attempt
    analytics.trackConversionStep('Sign Up Form Submitted', 'Club Owner Sign Up')

    try {
      await signUp({
        email: formData.email.trim(),
        password: formData.password,
        displayName: formData.displayName.trim(),
        userType: 'club-owner'
      })

      // Track successful signup
      analytics.trackConversionStep('Sign Up Completed', 'Club Owner Sign Up')
      analytics.setUserProperties({
        user_role: 'producer',  // V3.0: Use new role name
        conversion_stage: 'converted',
      })

      // Redirect to producer dashboard (V3.0: No more beta approval needed)
      navigate('/producer/dashboard')
    } catch (err) {
      console.error('Club owner signup error:', err)
      analytics.track('Sign Up Error', {
        page_name: 'Club Owner Sign Up',
        error_type: 'submission_failed',
        error_message: err instanceof Error ? err.message : 'Unknown error'
      })
      setErrors(prev => ({ ...prev, submit: 'Failed to create account. Please try again.' }))
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
        <div className="max-w-lg w-full space-y-8">
          <Card className="w-full bg-white/5 backdrop-blur-xl border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <CardHeader className="text-center relative pt-12">
              <Button
                onClick={() => navigate('/auth')}
                variant="ghost"
                size="sm"
                className="absolute top-4 left-4 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center justify-center gap-2 mb-3 mt-2">
                <Users className="h-6 w-6 text-pink-400" />
                <CardTitle className="text-2xl font-bold text-white">Club Owner Signup</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Start organizing events and building your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Display Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white">Your Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.displayName && (
                    <p className="text-red-400 text-sm">{errors.displayName}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && Array.isArray(errors.password) && (
                    <ul className="text-red-400 text-sm space-y-1">
                      {errors.password.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms Acceptance */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <input
                      id="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                      className="w-4 h-4 mt-1 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-400 focus:ring-2"
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="acceptTerms" className="text-gray-200 text-sm leading-relaxed">
                      I agree to the{' '}
                      <a href="https://www.heyvoxxy.com/#/terms" target="_blank" rel="noopener noreferrer" className="text-pink-300 hover:text-pink-200 underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="https://www.heyvoxxy.com/#/privacy" target="_blank" rel="noopener noreferrer" className="text-pink-300 hover:text-pink-200 underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-red-400 text-sm">{errors.acceptTerms}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                >
                  {isSubmitting || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Club Owner Account'
                  )}
                </Button>

                {/* Error Display */}
                {(error || errors.submit) && (
                  <Alert className="bg-red-400/10 border-red-400/30">
                    <AlertDescription className="text-red-300">
                      {error || errors.submit}
                    </AlertDescription>
                  </Alert>
                )}
              </form>

              {/* Switch to Login */}
              <div className="mt-6 text-center">
                <p className="text-gray-200 text-sm">
                  Already have a club owner account?{' '}
                  <button
                    onClick={() => navigate('/login/club-owner')}
                    className="text-pink-300 hover:text-pink-200 font-medium transition-colors"
                    disabled={isSubmitting}
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}