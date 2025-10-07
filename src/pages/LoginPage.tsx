import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SplitScreenLoginForm } from '@/components/auth/SplitScreenLoginForm'
import { PasswordResetForm } from '@/components/auth/PasswordResetForm'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, userProfile, isOrganizer, isVenueOwner } = useAuth()
  const [showForgotPassword, setShowForgotPassword] = React.useState(false)

  // If already authenticated, redirect based on role
  React.useEffect(() => {
    if (isAuthenticated && userProfile) {
      // Check if there's an intended redirect path
      const intendedPath = new URLSearchParams(window.location.search).get('redirect')
      if (intendedPath) {
        navigate(intendedPath)
        return
      }

      // Role-based redirect
      if (isVenueOwner) {
        // Check if venue owner has completed onboarding (created a venue)
        const hasCompletedOnboarding = userProfile.venueOwnerProfile?.onboardingCompleted
        if (hasCompletedOnboarding) {
          navigate('/venues/dashboard')
        } else {
          // First time venue owner - redirect to venue creation
          navigate('/venues/create')
        }
      } else if (isOrganizer) {
        navigate('/profile')
      } else {
        // Fallback for other roles
        navigate('/')
      }
    }
  }, [isAuthenticated, userProfile, isVenueOwner, isOrganizer, navigate])

  const handleSuccess = () => {
    // Check for intended destination first
    const intendedPath = new URLSearchParams(window.location.search).get('redirect')
    if (intendedPath) {
      navigate(intendedPath)
      return
    }

    // Role-based redirect after successful login
    // Note: userProfile might not be loaded immediately after login, so we need to wait for it
    // We'll handle this in a useEffect that watches for userProfile changes
    console.log('Login successful, waiting for user profile to load...')
  }

  const handleSwitchToSignUp = () => {
    navigate('/sign-up')
  }

  const handleForgotPassword = () => {
    setShowForgotPassword(true)
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
  }

  if (isAuthenticated) {
    return null // Prevent flash while redirecting
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <PasswordResetForm
              onSuccess={handleBackToLogin}
              onBackToLogin={handleBackToLogin}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <SplitScreenLoginForm
      onSuccess={handleSuccess}
      onSwitchToSignUp={handleSwitchToSignUp}
      onForgotPassword={handleForgotPassword}
    />
  )
}