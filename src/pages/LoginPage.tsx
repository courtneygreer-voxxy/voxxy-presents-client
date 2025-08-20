import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { PasswordResetForm } from '@/components/auth/PasswordResetForm'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [showForgotPassword, setShowForgotPassword] = React.useState(false)

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleSuccess = () => {
    // After successful login, redirect to profile page or intended destination
    const intendedPath = new URLSearchParams(window.location.search).get('redirect')
    navigate(intendedPath || '/profile')
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {showForgotPassword ? (
          <PasswordResetForm
            onSuccess={handleBackToLogin}
            onBackToLogin={handleBackToLogin}
          />
        ) : (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToSignUp={handleSwitchToSignUp}
            onForgotPassword={handleForgotPassword}
          />
        )}
      </div>
    </div>
  )
}