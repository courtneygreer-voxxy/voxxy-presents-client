import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SignUpForm } from './SignUpForm'
import { LoginForm } from './LoginForm'
import { PasswordResetForm } from './PasswordResetForm'
import { EmailVerificationPrompt } from './EmailVerificationPrompt'

export type AuthModalMode = 'login' | 'signup' | 'forgot-password' | 'email-verification'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthModalMode
  onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthModalMode>(initialMode)

  const handleSuccess = () => {
    if (mode === 'signup') {
      // After successful signup, show email verification prompt
      setMode('email-verification')
    } else {
      // For login or other successful actions, close modal
      onSuccess?.()
      onClose()
    }
  }

  const handleClose = () => {
    setMode(initialMode) // Reset to initial mode when closing
    onClose()
  }

  const handleModeSwitch = (newMode: AuthModalMode) => {
    setMode(newMode)
  }

  const renderContent = () => {
    switch (mode) {
      case 'signup':
        return (
          <SignUpForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => handleModeSwitch('login')}
          />
        )
      
      case 'login':
        return (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToSignUp={() => handleModeSwitch('signup')}
            onForgotPassword={() => handleModeSwitch('forgot-password')}
          />
        )
      
      case 'forgot-password':
        return (
          <PasswordResetForm
            onSuccess={() => handleModeSwitch('login')}
            onBackToLogin={() => handleModeSwitch('login')}
          />
        )
      
      case 'email-verification':
        return (
          <EmailVerificationPrompt
            onResendSuccess={() => {
              // Stay on email verification screen with success message
            }}
            onContinue={() => {
              onSuccess?.()
              onClose()
            }}
          />
        )
      
      default:
        return null
    }
  }

  // Don't render the dialog wrapper for the auth forms since they have their own cards
  // Just return the modal content directly when open
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none">
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}