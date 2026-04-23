import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail } from '@/utils/validation'

interface PasswordResetFormProps {
  onSuccess?: () => void
  onBackToLogin?: () => void
}

export function PasswordResetForm({ onSuccess, onBackToLogin }: PasswordResetFormProps) {
  const { resetPassword, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Handle email input change
  const handleEmailChange = (value: string) => {
    setEmail(value)
    
    // Clear errors when user starts typing
    if (emailError) setEmailError(undefined)
    if (error) clearError()
  }

  // Validate email
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required')
      return false
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    
    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      await resetPassword(email.trim())
      setIsSuccess(true)
      
      // Auto redirect after showing success message
      setTimeout(() => {
        onSuccess?.()
      }, 3000)
    } catch (err) {
      // Error is handled by the AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <Card className="voxxy-auth-card mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-700 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-foreground">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent password reset instructions to <strong className="text-foreground">{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>
              Click the link in the email to reset your password.
              If you don't see the email, check your spam folder.
            </p>
            <p>
              The link will expire in 1 hour for security.
            </p>
          </div>

          <Button
            onClick={onBackToLogin}
            className="w-full bg-background/90 border-border text-foreground hover:bg-background"
            variant="outline"
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Form state
  return (
    <Card className="voxxy-auth-card mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-foreground">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display auth errors */}
        {error && (
          <Alert variant="destructive" className="bg-red-400/10 border-red-400/30">
            <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="voxxy-input-frost pl-10"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => {
                  if (email && !validateEmail(email)) {
                    setEmailError('Please enter a valid email address')
                  }
                }}
                aria-invalid={!!emailError}
                disabled={isSubmitting}
                autoComplete="email"
                autoFocus
              />
            </div>
            {emailError && (
              <p className="text-sm text-red-400">{emailError}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full voxxy-btn-solid"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Email...
              </>
            ) : (
              'Send Reset Email'
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="space-y-4">
          <Separator className="bg-background/20" />
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground hover:bg-background/10"
            onClick={onBackToLogin}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}