import React from 'react'
import { useNavigate } from 'react-router-dom'
import { UnifiedSignUpForm } from '@/components/auth/UnifiedSignUpForm'
import { useAuth } from '@/hooks/useAuth'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { isAuthenticated, userProfile, isOrganizer, isVenueOwner } = useAuth()

  // If already authenticated, redirect based on role
  React.useEffect(() => {
    if (isAuthenticated && userProfile) {
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
    // After successful signup, role-based redirect will be handled by useEffect above
    // when userProfile is loaded
    console.log('Signup successful, waiting for user profile to load...')
  }

  const handleSwitchToLogin = () => {
    navigate('/login')
  }

  if (isAuthenticated) {
    return null // Prevent flash while redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <UnifiedSignUpForm
            onSuccess={handleSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </div>
      </div>
    </div>
  )
}