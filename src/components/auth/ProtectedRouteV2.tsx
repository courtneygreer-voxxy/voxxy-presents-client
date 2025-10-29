import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getCurrentEnvironment } from '@/config/environments'
import { User as UserV2 } from '@/types/database-v2'
import { User as UserV1 } from '@/types/database'

// V3.0: Helper function to convert V1 user to V2 compatible structure
const normalizeUserForV2 = (user: UserV1): UserV2 => {
  // For vendors (including legacy venue_owner), approval is based on having approved listings
  let approvalStatus: 'pending' | 'approved' | 'denied' = 'pending'

  if (user.role === 'vendor' || user.role === 'venue_owner') {
    // SIMPLIFIED: Vendors are always approved for routing purposes
    // Individual vendor listing approval is handled in the dashboard itself
    approvalStatus = 'approved'
  } else {
    // For producers (including legacy organizer/club_owner) and others, use betaStatus
    approvalStatus = user.betaStatus || 'pending'
  }

  // V3.0: Normalize legacy roles to new roles
  let normalizedRole: UserV2['role']
  if (user.role === 'organizer' || user.role === 'club_owner') {
    normalizedRole = 'producer' // Legacy → producer
  } else if (user.role === 'venue_owner') {
    normalizedRole = 'vendor' // Legacy → vendor
  } else if (user.role === 'user') {
    normalizedRole = 'guest' // Legacy → guest
  } else {
    normalizedRole = user.role as UserV2['role']
  }

  return {
    ...user,
    role: normalizedRole,
    approvalStatus,
    requestedAt: user.betaRequestedAt || user.createdAt,
    deniedReason: undefined,
  } as UserV2
}

interface ProtectedRouteV2Props {
  children: React.ReactNode
  requireApproval?: boolean
  allowedRoles?: UserV2['role'][]
  requireEmailVerification?: boolean
  fallbackPath?: string
}

// V3.0: Default role-based redirect paths
const getRoleBasedDashboard = (role: UserV2['role']): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'producer':
      return '/producer/dashboard'
    case 'vendor':
      return '/vendor/dashboard'
    case 'guest':
      return '/guest/dashboard'
    // LEGACY roles (should be normalized above, but handle just in case)
    case 'organizer':
    case 'club_owner':
      return '/producer/dashboard'
    case 'venue_owner':
      return '/vendor/dashboard'
    case 'user':
      return '/guest/dashboard'
    default:
      return '/'
  }
}

export default function ProtectedRouteV2({
  children,
  requireApproval = false,
  allowedRoles = [],
  requireEmailVerification = false,
  fallbackPath = '/auth'
}: ProtectedRouteV2Props) {
  const { currentUser, userProfile, loading, isAuthenticated, isEmailVerified } = useAuth()
  const location = useLocation()

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to auth with current location
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`${fallbackPath}?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  // Check environment for staging bypass
  const currentEnv = getCurrentEnvironment()
  const isStagingBypass = currentEnv === 'staging'

  // Email verification check (unless staging bypass)
  if (requireEmailVerification && !isEmailVerified && !isStagingBypass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-yellow-800">Email Verification Required</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please verify your email address to continue.
                  </p>
                </div>
                <div className="text-xs text-yellow-600">
                  <p>Verification email sent to:</p>
                  <p className="font-medium">{currentUser?.email}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    I've verified - Refresh page
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/'}
                    className="text-yellow-600 hover:bg-yellow-100"
                  >
                    Go to homepage
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // If we don't have user profile yet, show loading or redirect to profile creation
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    )
  }

  // Normalize user profile for V2 compatibility
  const normalizedUser = normalizeUserForV2(userProfile)

  // Role-based access control
  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedUser.role)) {
    // Redirect to their appropriate dashboard instead of showing error
    const roleBasedPath = getRoleBasedDashboard(normalizedUser.role)
    return <Navigate to={roleBasedPath} replace />
  }

  // Unified approval check (unless user is admin or staging bypass)
  if (requireApproval && normalizedUser.role !== 'admin' && !isStagingBypass) {
    switch (normalizedUser.approvalStatus) {
      case 'pending':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-blue-800">Approval Pending</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Your {normalizedUser.role === 'producer' ? 'producer' : normalizedUser.role === 'vendor' ? 'vendor' : 'account'}
                        {' '}account is currently being reviewed by our team.
                      </p>
                    </div>

                    <div className="bg-blue-100 p-3 rounded-lg">
                      <p className="text-xs text-blue-800 font-medium">Request submitted:</p>
                      <p className="text-xs text-blue-700">
                        {normalizedUser.requestedAt ? new Date(normalizedUser.requestedAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>

                    <div className="text-sm text-blue-700">
                      <p>We'll email you once your account has been approved. This usually takes 1-2 business days.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Check approval status
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/'}
                        className="text-blue-600 hover:bg-blue-100"
                      >
                        Browse events
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )

      case 'denied':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-red-800">Application Denied</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Unfortunately, your {normalizedUser.role === 'producer' ? 'producer' : normalizedUser.role === 'vendor' ? 'vendor' : ''}
                        {' '}application was not approved at this time.
                      </p>
                    </div>

                    {normalizedUser.deniedReason && (
                      <div className="bg-red-100 p-3 rounded-lg">
                        <p className="text-xs text-red-800 font-medium">Reason:</p>
                        <p className="text-xs text-red-700">{normalizedUser.deniedReason}</p>
                      </div>
                    )}

                    <div className="text-sm text-red-700">
                      <p>You can still browse and register for events. If you have questions, please contact support.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/contact'}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        Contact support
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/'}
                        className="text-red-600 hover:bg-red-100"
                      >
                        Browse events
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )

      case 'approved':
        // Continue to render children
        break

      default:
        // Unknown approval status - treat as pending
        console.warn('Unknown approval status:', normalizedUser.approvalStatus)
        return <Navigate to="/" replace />
    }
  }

  // Show staging bypass indicators if applicable
  const showEmailBypass = isStagingBypass && requireEmailVerification && !isEmailVerified
  const showApprovalBypass = isStagingBypass && requireApproval && normalizedUser.approvalStatus !== 'approved' && normalizedUser.role !== 'admin'

  // All checks passed - render the protected content
  return (
    <>
      {/* Staging bypass indicators */}
      {(showEmailBypass || showApprovalBypass) && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm z-50 flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>
            ⚠️ STAGING:
            {showEmailBypass && ' Email verification'}
            {showEmailBypass && showApprovalBypass && ' &'}
            {showApprovalBypass && ' Approval requirements'}
            {' bypassed for testing'}
          </span>
        </div>
      )}

      <div className={(showEmailBypass || showApprovalBypass) ? 'pt-10' : ''}>
        {children}
      </div>
    </>
  )
}

// Component for routes that should redirect authenticated users away (auth pages)
interface RedirectIfAuthenticatedV2Props {
  children: React.ReactNode
  redirectTo?: string
}

export function RedirectIfAuthenticatedV2({
  children,
  redirectTo
}: RedirectIfAuthenticatedV2Props) {
  const { isAuthenticated, loading, userProfile } = useAuth()

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated && userProfile) {
    const normalizedUser = normalizeUserForV2(userProfile)
    const targetPath = redirectTo || getRoleBasedDashboard(normalizedUser.role)
    return <Navigate to={targetPath} replace />
  }

  // Not authenticated, show the auth page
  return <>{children}</>
}