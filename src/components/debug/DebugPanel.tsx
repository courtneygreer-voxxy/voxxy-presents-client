import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  LogOut,
  Eye,
  EyeOff,
  RefreshCw,
  Database,
  Shield,
  MapPin,
  Building2,
  Calendar
} from 'lucide-react'

export function DebugPanel() {
  // Only show in development and staging environments
  const isDevelopment = import.meta.env.DEV
  const isStaging = window.location.hostname.includes('staging') ||
                   window.location.hostname.includes('dev') ||
                   import.meta.env.VITE_ENVIRONMENT === 'staging'

  // Hide in production (when NODE_ENV is production and not staging)
  const isProduction = import.meta.env.PROD &&
                      !isStaging &&
                      import.meta.env.VITE_ENVIRONMENT !== 'staging'

  if (isProduction) {
    return null
  }

  const {
    currentUser,
    userProfile,
    loading,
    isAuthenticated,
    isVenueOwner,
    isOrganizer,
    signOut
  } = useAuth()

  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-[9999]">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await signOut()
      console.log('🔓 DEBUG: User logged out')
    } catch (error) {
      console.error('❌ DEBUG: Logout error:', error)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'denied': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'venue_owner': return 'bg-blue-100 text-blue-800'
      case 'organizer': return 'bg-green-100 text-green-800'
      case 'guest': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm">
      <Card className="border-2 border-red-500/50 bg-slate-900/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-red-400 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              DEBUG PANEL
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0 text-gray-300 border-gray-600 hover:bg-slate-800"
              >
                {isExpanded ? '−' : '+'}
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0 text-gray-300 border-gray-600 hover:bg-slate-800"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-xs">
          {/* Auth State */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-300">🔐 Auth State</div>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                {isAuthenticated ? '✅ Authenticated' : '❌ Not Auth'}
              </Badge>
              <Badge variant={loading ? 'secondary' : 'default'}>
                {loading ? '⏳ Loading' : '✅ Loaded'}
              </Badge>
            </div>
          </div>

          {/* User Info */}
          {currentUser && (
            <div className="space-y-2">
              <div className="font-semibold text-gray-300">👤 Firebase User</div>
              <div className="bg-slate-800/50 p-2 rounded text-xs text-gray-200">
                <div><strong className="text-gray-100">UID:</strong> {currentUser.uid}</div>
                <div><strong className="text-gray-100">Email:</strong> {currentUser.email}</div>
                <div><strong className="text-gray-100">Email Verified:</strong> {currentUser.emailVerified ? '✅' : '❌'}</div>
              </div>
            </div>
          )}

          {/* User Profile */}
          {userProfile && (
            <div className="space-y-2">
              <div className="font-semibold text-gray-300">📋 User Profile</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(userProfile.role)}>
                    {userProfile.role?.toUpperCase() || 'NO ROLE'}
                  </Badge>
                  <Badge className={getStatusColor(userProfile.betaStatus)}>
                    Beta: {userProfile.betaStatus || 'N/A'}
                  </Badge>
                </div>

                <div className="bg-slate-800/50 p-2 rounded text-gray-200">
                  <div><strong className="text-gray-100">Name:</strong> {userProfile.name || 'N/A'}</div>
                  <div><strong className="text-gray-100">Created:</strong> {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Role Flags */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-300">🏷️ Role Flags</div>
            <div className="grid grid-cols-2 gap-1">
              <Badge variant={isVenueOwner ? 'default' : 'secondary'} className="text-xs">
                {isVenueOwner ? '🏢 Venue Owner' : '⭕ Not Venue'}
              </Badge>
              <Badge variant={isOrganizer ? 'default' : 'secondary'} className="text-xs">
                {isOrganizer ? '🎯 Organizer' : '⭕ Not Organizer'}
              </Badge>
            </div>
          </div>

          {/* Venue Owner Profile */}
          {userProfile?.venueOwnerProfile && isExpanded && (
            <div className="space-y-2">
              <div className="font-semibold text-gray-300">🏢 Venue Owner Profile</div>
              <div className="bg-blue-900/30 p-2 rounded text-xs text-blue-200">
                <div><strong className="text-blue-100">Onboarding:</strong> {userProfile.venueOwnerProfile.onboardingCompleted ? '✅ Complete' : '❌ Incomplete'}</div>
                <div><strong className="text-blue-100">Venue IDs:</strong> {userProfile.venueOwnerProfile.venueIds?.length || 0}</div>
                <div><strong className="text-blue-100">Business Info:</strong> {userProfile.venueOwnerProfile.businessInfo || 'N/A'}</div>
                <div><strong className="text-blue-100">Phone:</strong> {userProfile.venueOwnerProfile.phone || 'N/A'}</div>
              </div>
            </div>
          )}

          {/* Organizer Profile */}
          {isOrganizer && (
            <div className="space-y-2">
              <div className="font-semibold text-gray-300">🎯 Organizer Debug</div>
              <div className="bg-green-900/30 p-2 rounded text-xs text-green-200">
                <div><strong className="text-green-100">Organization IDs:</strong> {userProfile?.organizationIds?.length || 0}</div>
                {userProfile?.organizationIds?.length ? (
                  <div className="mt-1">
                    <div><strong className="text-green-100">IDs:</strong></div>
                    {userProfile.organizationIds.map((id, index) => (
                      <div key={id} className="ml-2 text-green-200">
                        {index + 1}. {id}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-red-400 font-bold">⚠️ NO ORGANIZATION IDS FOUND</div>
                )}
                <div className="mt-1 pt-1 border-t border-green-700/50">
                  <div><strong className="text-green-100">User Role:</strong> {userProfile?.role || 'undefined'}</div>
                  <div><strong className="text-green-100">isOrganizer:</strong> {isOrganizer ? '✅ True' : '❌ False'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Session State */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-300">👑 Admin Session</div>
            <div className="bg-red-900/30 p-2 rounded text-xs text-gray-200">
              <div><strong className="text-gray-100">Admin Session:</strong> {localStorage.getItem('voxxy_admin_session') || 'false'}</div>
              <div><strong className="text-gray-100">Admin Email:</strong> {localStorage.getItem('voxxy_admin_email') || 'N/A'}</div>
              <div><strong className="text-gray-100">⚠️ Firebase User:</strong> {currentUser?.email || 'N/A'}</div>
              {localStorage.getItem('voxxy_admin_session') === 'true' && currentUser?.email !== 'team@voxxypresents.com' && (
                <div className="text-red-400 font-bold">🔥 SPLIT BRAIN: Admin localStorage but different Firebase user!</div>
              )}
            </div>
          </div>

          {/* Current URL */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-300">🌐 Current State</div>
            <div className="bg-slate-800/50 p-2 rounded text-xs text-gray-200">
              <div><strong className="text-gray-100">URL:</strong> {window.location.pathname}</div>
              <div><strong className="text-gray-100">Firebase Project:</strong> {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not Set'}</div>
              <div><strong className="text-gray-100">Environment:</strong> {import.meta.env.VITE_ENVIRONMENT || 'Auto-detected'}</div>
              <div><strong className="text-gray-100">Timestamp:</strong> {new Date().toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <div className="flex gap-2">
              <Button
                onClick={handleLogout}
                size="sm"
                variant="destructive"
                className="flex-1 h-8 text-xs"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Logout
              </Button>
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs text-gray-200 border-gray-600 hover:bg-slate-800"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reload
              </Button>
            </div>

            {/* Admin Session Controls */}
            {localStorage.getItem('voxxy_admin_session') === 'true' && (
              <Button
                onClick={() => {
                  localStorage.removeItem('voxxy_admin_session')
                  localStorage.removeItem('voxxy_admin_email')
                  console.log('🔓 DEBUG: Cleared admin session')
                  window.location.reload()
                }}
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs border-red-500/50 text-red-400 hover:bg-red-900/30"
              >
                Clear Admin Session
              </Button>
            )}

            {/* Firebase Connection Test */}
            <Button
              onClick={async () => {
                try {
                  console.log('🔍 DEBUG: Testing Firebase connection...')
                  const { testFirebaseConnection } = await import('@/debug/firebase-connection-test')
                  const result = await testFirebaseConnection()
                  console.log('🔍 DEBUG: Firebase test result:', result)
                  alert(`Firebase Test:\nProject: ${result.projectId}\nOrganizations: ${result.organizationCount}`)
                } catch (error) {
                  console.error('🔍 DEBUG: Firebase test failed:', error)
                  alert(`Firebase Test Failed: ${error}`)
                }
              }}
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs border-green-500/50 text-green-400 hover:bg-green-900/30"
            >
              🔍 Test Firebase Connection
            </Button>

            {/* Venue Debug Controls */}
            {isVenueOwner && currentUser && (
              <Button
                onClick={async () => {
                  try {
                    console.log('🔍 DEBUG: Manual venue lookup for user:', currentUser.uid)
                    // Use the same venuesApi service to be consistent
                    const { venuesApi } = await import('@/services/api')
                    const data = await venuesApi.getByOwner(currentUser.uid)
                    console.log('🔍 DEBUG: Manual venues API response via venuesApi:', data)
                  } catch (error) {
                    console.error('🔍 DEBUG: Manual venue lookup failed:', error)
                  }
                }}
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs border-blue-500/50 text-blue-400 hover:bg-blue-900/30"
              >
                🔍 Manual Venue Lookup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}