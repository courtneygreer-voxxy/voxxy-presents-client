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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
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
    </div>
  )
}