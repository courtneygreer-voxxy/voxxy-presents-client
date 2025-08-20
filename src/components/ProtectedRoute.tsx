import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireEmailVerification?: boolean
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requireEmailVerification = false,
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { currentUser, loading, isAuthenticated, isEmailVerified } = useAuth()
  const location = useLocation()

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login with current location
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={`${fallbackPath}?redirect=${encodeURIComponent(location.pathname)}`}
        replace 
      />
    )
  }

  // If email verification is required but user hasn't verified
  if (requireEmailVerification && !isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Alert>
            <AlertDescription className="text-center">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Email Verification Required</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please verify your email address to access this feature.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>We sent a verification email to:</p>
                  <p className="font-medium">{currentUser?.email}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    className="text-primary underline hover:no-underline text-sm"
                    onClick={() => window.location.reload()}
                  >
                    I've verified my email - Refresh page
                  </button>
                  <button 
                    className="text-muted-foreground underline hover:no-underline text-sm"
                    onClick={() => {
                      // Redirect to home or login
                      window.location.href = '/'
                    }}
                  >
                    Go back to home
                  </button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // User is authenticated (and email verified if required)
  return <>{children}</>
}

// Component for routes that should redirect authenticated users away
interface RedirectIfAuthenticatedProps {
  children: React.ReactNode
  redirectTo?: string
}

export function RedirectIfAuthenticated({ 
  children, 
  redirectTo = '/' 
}: RedirectIfAuthenticatedProps) {
  const { isAuthenticated, loading } = useAuth()

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If authenticated, redirect away from auth pages
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Not authenticated, show the auth page
  return <>{children}</>
}