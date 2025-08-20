import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Loader2, Mail, User, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail, validatePassword } from '@/services/authService'

interface SignUpFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

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

export function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
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

      case 'password':
        if (!value) return ['Password is required']
        const passwordValidation = validatePassword(value)
        return passwordValidation.isValid ? undefined : passwordValidation.errors

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
    
    // Clear previous errors for this field
    if (errors[field]) {
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
    
    Object.keys(formData).forEach(key => {
      const field = key as keyof FormData
      const fieldError = validateField(field, formData[field])
      if (fieldError) {
        newErrors[field] = fieldError as any
      }
    })

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
        displayName: formData.displayName.trim()
      })
      
      onSuccess?.()
    } catch (err) {
      // Error is handled by the AuthContext
      setErrors(prev => ({ ...prev, submit: 'Failed to create account. Please try again.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Join Voxxy Presents to create and manage your club
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display auth errors */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Display form submission errors */}
        {errors.submit && (
          <Alert variant="destructive">
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name Field */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your display name"
                className="pl-10"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                onBlur={() => {
                  const error = validateField('displayName', formData.displayName)
                  if (error) setErrors(prev => ({ ...prev, displayName: error as string }))
                }}
                aria-invalid={!!errors.displayName}
                disabled={isSubmitting || loading}
              />
            </div>
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => {
                  const error = validateField('email', formData.email)
                  if (error) setErrors(prev => ({ ...prev, email: error as string }))
                }}
                aria-invalid={!!errors.email}
                disabled={isSubmitting || loading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => {
                  const error = validateField('password', formData.password)
                  if (error) setErrors(prev => ({ ...prev, password: error as string[] }))
                }}
                aria-invalid={!!errors.password}
                disabled={isSubmitting || loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <div className="space-y-1">
                {errors.password.map((error, index) => (
                  <p key={index} className="text-sm text-destructive">{error}</p>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className="pl-10 pr-10"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => {
                  const error = validateField('confirmPassword', formData.confirmPassword)
                  if (error) setErrors(prev => ({ ...prev, confirmPassword: error as string }))
                }}
                aria-invalid={!!errors.confirmPassword}
                disabled={isSubmitting || loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting || loading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <input
                id="acceptTerms"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                disabled={isSubmitting || loading}
              />
              <Label htmlFor="acceptTerms" className="text-sm leading-5">
                I agree to the{' '}
                <a href="/terms" className="text-primary underline hover:no-underline" target="_blank">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary underline hover:no-underline" target="_blank">
                  Privacy Policy
                </a>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">{errors.acceptTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || loading}
            size="lg"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Switch to Login */}
        <div className="space-y-4">
          <Separator />
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              className="text-primary underline hover:no-underline font-medium"
              onClick={onSwitchToLogin}
              disabled={isSubmitting || loading}
            >
              Sign in here
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}