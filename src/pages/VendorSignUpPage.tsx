import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Mail, User, Lock, Building2, ArrowLeft, ArrowRight, Briefcase, Music, Camera, Zap, ChefHat, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail, validatePassword } from '@/services/authService'
import { usePageTracking } from '@/hooks/usePageTracking'
import { analytics } from '@/lib/analytics'
import type { VendorType } from '@/types/vendor'

interface FormData {
  // Step 1: Account
  email: string
  password: string
  confirmPassword: string

  // Step 2: Business Basics
  vendorType: VendorType | ''
  businessName: string

  acceptTerms: boolean
}

interface FormErrors {
  email?: string
  password?: string[]
  confirmPassword?: string
  vendorType?: string
  businessName?: string
  acceptTerms?: string
  submit?: string
}

const VENDOR_TYPES: { value: VendorType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'venue',
    label: 'Venue',
    icon: <Building2 className="h-6 w-6" />,
    description: 'Event spaces, bars, restaurants'
  },
  {
    value: 'artist',
    label: 'Artist/Performer',
    icon: <Music className="h-6 w-6" />,
    description: 'Musicians, DJs, live performers'
  },
  {
    value: 'photographer',
    label: 'Photographer',
    icon: <Camera className="h-6 w-6" />,
    description: 'Event photography services'
  },
  {
    value: 'lighting_tech',
    label: 'Lighting Tech',
    icon: <Zap className="h-6 w-6" />,
    description: 'Lighting design and production'
  },
  {
    value: 'entertainer',
    label: 'Entertainment',
    icon: <Music className="h-6 w-6" />,
    description: 'Acts, performers, entertainment'
  },
  {
    value: 'catering',
    label: 'Catering',
    icon: <ChefHat className="h-6 w-6" />,
    description: 'Food and beverage services'
  },
  {
    value: 'market_vendor',
    label: 'Market Vendor',
    icon: <ShoppingBag className="h-6 w-6" />,
    description: 'Product vendors, crafts, goods'
  },
]

export default function VendorSignUpPage() {
  usePageTracking('Vendor Sign Up')

  const navigate = useNavigate()
  const { signUp, loading, error, clearError } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    vendorType: '',
    businessName: '',
    acceptTerms: false
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation
  const validateField = (field: keyof FormData, value: any): string | string[] | undefined => {
    switch (field) {
      case 'businessName':
        if (!value.trim()) return 'Business name is required'
        if (value.trim().length < 2) return 'Business name must be at least 2 characters'
        if (value.trim().length > 100) return 'Business name must be less than 100 characters'
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

      case 'vendorType':
        if (!value) return 'Please select your vendor type'
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

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: FormErrors = {}

    if (stepNumber === 1) {
      const emailError = validateField('email', formData.email)
      if (emailError) newErrors.email = emailError as string

      const passwordError = validateField('password', formData.password)
      if (passwordError) newErrors.password = passwordError as string[]

      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword)
      if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError as string
    }

    if (stepNumber === 2) {
      const vendorTypeError = validateField('vendorType', formData.vendorType)
      if (vendorTypeError) newErrors.vendorType = vendorTypeError as string

      const businessNameError = validateField('businessName', formData.businessName)
      if (businessNameError) newErrors.businessName = businessNameError as string

      const acceptTermsError = validateField('acceptTerms', formData.acceptTerms)
      if (acceptTermsError) newErrors.acceptTerms = acceptTermsError as string
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      analytics.track('Sign Up Step Completed', {
        step: step,
        step_name: step === 1 ? 'Account Details' : 'Business Info',
      })
    }
  }

  const handlePrevStep = () => {
    setStep(step - 1)
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(2)) return

    setIsSubmitting(true)
    setErrors(prev => ({ ...prev, submit: undefined }))

    // Track form submission attempt
    analytics.trackConversionStep('Sign Up Form Submitted', 'Vendor Sign Up')

    try {
      await signUp({
        email: formData.email.trim(),
        password: formData.password,
        displayName: formData.businessName.trim(),
        userType: 'venue-owner', // Backend expects this for now
        vendorType: formData.vendorType as VendorType,
        businessName: formData.businessName.trim(),
      })

      // Track successful signup
      analytics.trackConversionStep('Sign Up Completed', 'Vendor Sign Up')
      analytics.setUserProperties({
        user_role: 'vendor',
        vendor_type: formData.vendorType,
        conversion_stage: 'converted',
      })

      // Redirect to vendor dashboard
      navigate('/vendor/dashboard')

    } catch (err: any) {
      console.error('Vendor signup error:', err)

      // Track signup error
      analytics.track('Sign Up Error', {
        page_name: 'Vendor Sign Up',
        error_type: 'submission_failed',
        error_message: err?.message || 'Unknown error'
      })

      // Extract meaningful error message
      let errorMessage = 'Failed to create account. Please try again.'
      if (err?.message) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }

      setErrors(prev => ({ ...prev, submit: errorMessage }))
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
        <div className="max-w-2xl w-full space-y-8">
          <Card className="w-full bg-white/5 backdrop-blur-xl border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <CardHeader className="text-center relative pt-12">
              <Button
                onClick={() => step === 1 ? navigate('/auth') : handlePrevStep()}
                variant="ghost"
                size="sm"
                className="absolute top-4 left-4 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {/* Progress indicator */}
              <div className="absolute top-4 right-4 text-sm text-gray-400">
                Step {step} of 2
              </div>

              <div className="flex items-center justify-center gap-2 mb-3 mt-2">
                <Briefcase className="h-8 w-8 text-purple-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-white">
                {step === 1 ? 'Create Your Vendor Account' : 'Tell Us About Your Business'}
              </CardTitle>
              <CardDescription className="text-gray-300 text-base mt-2">
                {step === 1
                  ? 'Join our marketplace and connect with event producers'
                  : 'Help producers find you by sharing your business type'}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* STEP 1: Account Details */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-sm">{errors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && Array.isArray(errors.password) && (
                        <ul className="text-red-400 text-sm space-y-1">
                          {errors.password.map((err, i) => (
                            <li key={i}>• {err}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}

                {/* STEP 2: Business Info */}
                {step === 2 && (
                  <div className="space-y-6">
                    {/* Vendor Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-white text-sm font-medium">
                        What type of vendor are you?
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {VENDOR_TYPES.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleInputChange('vendorType', type.value)}
                            className={`
                              p-4 rounded-lg border-2 text-left transition-all
                              ${formData.vendorType === type.value
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-white/20 bg-white/5 hover:border-white/40'
                              }
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`
                                ${formData.vendorType === type.value ? 'text-purple-400' : 'text-gray-400'}
                              `}>
                                {type.icon}
                              </div>
                              <div>
                                <div className="text-white font-medium">{type.label}</div>
                                <div className="text-gray-400 text-sm mt-1">{type.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.vendorType && (
                        <p className="text-red-400 text-sm">{errors.vendorType}</p>
                      )}
                    </div>

                    {/* Business Name */}
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-white text-sm font-medium">
                        Business Name
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="businessName"
                          type="text"
                          placeholder="Your business or artist name"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
                        />
                      </div>
                      {errors.businessName && (
                        <p className="text-red-400 text-sm">{errors.businessName}</p>
                      )}
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="acceptTerms" className="text-sm text-gray-300">
                        I agree to the{' '}
                        <a href="https://www.voxxypresents.com/terms" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
                          Terms of Service
                        </a>
                        {' '}and{' '}
                        <a href="https://www.voxxypresents.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-red-400 text-sm">{errors.acceptTerms}</p>
                    )}

                    {/* Submit Error */}
                    {errors.submit && (
                      <Alert className="bg-red-500/10 border-red-500/50">
                        <AlertDescription className="text-red-400">
                          {errors.submit}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                )}

                {/* Already have an account */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Already have an account?{' '}
                    <a href="/login/vendor" className="text-purple-400 hover:text-purple-300 font-medium">
                      Sign in
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
