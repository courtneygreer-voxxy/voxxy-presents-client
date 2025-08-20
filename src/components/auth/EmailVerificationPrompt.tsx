import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Mail, Loader2, CheckCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface EmailVerificationPromptProps {
  onResendSuccess?: () => void
  onContinue?: () => void
}

export function EmailVerificationPrompt({ onResendSuccess, onContinue }: EmailVerificationPromptProps) {
  const { currentUser, resendVerification, error, clearError } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Handle resending verification email
  const handleResendVerification = async () => {
    if (!currentUser) return
    
    setIsResending(true)
    setResendSuccess(false)
    
    try {
      await resendVerification()
      setResendSuccess(true)
      onResendSuccess?.()
      
      // Start cooldown timer (120 seconds to reduce Firebase rate limiting)
      setResendCooldown(120)
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (err) {
      // Error is handled by the AuthContext
    } finally {
      setIsResending(false)
    }
  }

  // Handle continue button
  const handleContinue = () => {
    clearError()
    onContinue?.()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
        <CardDescription className="text-center">
          We've sent a verification email to <strong>{currentUser?.email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success message for resend */}
        {resendSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Verification email sent successfully! Please check your inbox.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Display auth errors */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>
              Please check your email and click the verification link to activate your account.
            </p>
            <p>
              After verifying your email, you can create and manage your club.
            </p>
            <p className="text-xs">
              If you don't see the email, check your spam folder.
            </p>
            {error && error.includes('rate limiting') && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-xs text-amber-800">
                  <strong>Temporary Issue:</strong> Our email system is experiencing high volume. 
                  Your verification email will be sent as soon as possible. You can still use 
                  the platform in the meantime!
                </p>
              </div>
            )}
          </div>

          {/* Resend Email Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResendVerification}
            disabled={isResending || resendCooldown > 0}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend in {resendCooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </Button>

          {/* Continue Button */}
          <div className="space-y-2">
            <Separator />
            <Button
              type="button"
              className="w-full"
              onClick={handleContinue}
            >
              {error && error.includes('rate limiting') 
                ? 'Continue - Verify Email Later' 
                : 'I\'ll Verify Later - Continue'
              }
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {error && error.includes('rate limiting') 
                ? 'You can explore the platform now. Email verification can be completed later.'
                : 'Note: Email verification is required before creating a club'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}