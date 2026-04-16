import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, Loader2, Mail, User, Lock, Users, Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail, validatePassword } from '@/utils/validation'

interface UnifiedSignUpFormProps {
  onSuccess?: (email: string) => void
  onSwitchToLogin?: () => void
  defaultTab?: 'venue_owner' | 'vendor'
}

interface FormData {
  displayName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  userType: 'venue_owner' | 'vendor'
}

interface FormErrors {
  displayName?: string
  email?: string
  password?: string[]
  confirmPassword?: string
  acceptTerms?: string
  submit?: string
}

type UserType = 'venue_owner' | 'vendor'

export function UnifiedSignUpForm({
  onSuccess,
  onSwitchToLogin,
  defaultTab = 'venue_owner'
}: UnifiedSignUpFormProps) {
  const { signUp, loading, error, clearError } = useAuth()
  const [activeTab, setActiveTab] = useState<UserType>(defaultTab)
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    userType: defaultTab
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update user type when tab changes
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, userType: activeTab }))
  }, [activeTab])

  // Real-time validation
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

  // Handle input changes with validation
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear previous errors for this field (skip userType as it's not in FormErrors)
    if (field !== 'userType' && errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Clear general auth error when user starts typing
    if (error) {
      clearError()
    }
  }

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate each field explicitly
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors(prev => ({ ...prev, submit: undefined }))

    try {
      await signUp({
        email: formData.email.trim(),
        password: formData.password,
        displayName: formData.displayName.trim(),
        userType: formData.userType
      })

      onSuccess?.(formData.email.trim())
    } catch (err) {
      console.error('Signup error:', err)
      setErrors(prev => ({ ...prev, submit: 'Failed to create account. Please try again.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTabContent = (userType: UserType) => {
    const isProducer = userType === 'venue_owner'

    return (
      <div className="space-y-6">
        {/* Tab Description */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            {isProducer ? (
              <Users className="h-5 w-5 text-purple-400" />
            ) : (
              <Building2 className="h-5 w-5 text-purple-400" />
            )}
            <h3 className="text-lg font-semibold text-foreground">
              {isProducer ? 'Create Producer Account' : 'Create Vendor Account'}
            </h3>
          </div>
          <p className="text-muted-foreground text-sm">
            {isProducer
              ? 'Start organizing and managing your events'
              : 'Join as a vendor and connect with event producers'
            }
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name Field */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground">
              {isProducer ? 'Your Name' : 'Business/Artist Name'}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="displayName"
                type="text"
                placeholder={isProducer ? "Enter your name" : "Enter your business or artist name"}
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="pl-10 bg-background/10 border-border text-foreground placeholder:text-muted-foreground focus:border-purple-400"
                disabled={isSubmitting}
              />
            </div>
            {errors.displayName && (
              <p className="text-red-400 text-sm">{errors.displayName}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10 bg-background/10 border-border text-foreground placeholder:text-muted-foreground focus:border-purple-400"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10 bg-background/10 border-border text-foreground placeholder:text-muted-foreground focus:border-purple-400"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
            <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="pl-10 pr-10 bg-background/10 border-border text-foreground placeholder:text-muted-foreground focus:border-purple-400"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                className="w-4 h-4 mt-1 text-purple-600 bg-background/10 border-border rounded focus:ring-purple-500 focus:ring-2"
                disabled={isSubmitting}
              />
              <Label htmlFor="acceptTerms" className="text-foreground/90 dark:text-muted-foreground text-sm leading-relaxed">
                I agree to the{' '}
                <a href="/legal/terms" className="text-purple-400 hover:text-purple-300 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/legal/privacy" className="text-purple-400 hover:text-purple-300 underline">
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
            className="w-full voxxy-btn-solid"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              `Create ${isProducer ? 'Producer' : 'Vendor'} Account`
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
      </div>
    )
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserType)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/10 backdrop-blur-sm">
          <TabsTrigger
            value="venue_owner"
            className="data-[state=active]:bg-violet-200 data-[state=active]:text-foreground dark:data-[state=active]:bg-purple-600 dark:data-[state=active]:text-primary-foreground text-muted-foreground"
          >
            <Users className="h-4 w-4 mr-2" />
            Producer
          </TabsTrigger>
          <TabsTrigger
            value="vendor"
            className="data-[state=active]:bg-violet-200 data-[state=active]:text-foreground dark:data-[state=active]:bg-purple-600 dark:data-[state=active]:text-primary-foreground text-muted-foreground"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Vendor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="venue_owner" className="mt-0">
          {getTabContent('venue_owner')}
        </TabsContent>

        <TabsContent value="vendor" className="mt-0">
          {getTabContent('vendor')}
        </TabsContent>
      </Tabs>
    </div>
  )
}