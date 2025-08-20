import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { useAuth } from '@/hooks/useAuth'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // If already authenticated, redirect to home or create club
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleSuccess = () => {
    // After successful signup, redirect to profile page
    navigate('/profile')
  }

  const handleSwitchToLogin = () => {
    navigate('/login')
  }

  if (isAuthenticated) {
    return null // Prevent flash while redirecting
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignUpForm
          onSuccess={handleSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </div>
    </div>
  )
}