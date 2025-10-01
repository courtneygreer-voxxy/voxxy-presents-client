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

  // Hide in production
  if (!isDevelopment && !isStaging) {
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
      <div className="fixed top-4 right-4 z-50">
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
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-2 border-red-500 bg-white shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-red-600 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              DEBUG PANEL
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
              >
                {isExpanded ? '−' : '+'}
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-xs">
          {/* Auth State */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-700">🔐 Auth State</div>
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
              <div className="font-semibold text-gray-700">👤 Firebase User</div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div><strong>UID:</strong> {currentUser.uid}</div>
                <div><strong>Email:</strong> {currentUser.email}</div>
                <div><strong>Email Verified:</strong> {currentUser.emailVerified ? '✅' : '❌'}</div>
              </div>
            </div>
          )}

          {/* User Profile */}
          {userProfile && (
            <div className="space-y-2">
              <div className="font-semibold text-gray-700">📋 User Profile</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(userProfile.role)}>
                    {userProfile.role?.toUpperCase() || 'NO ROLE'}
                  </Badge>
                  <Badge className={getStatusColor(userProfile.betaStatus)}>
                    Beta: {userProfile.betaStatus || 'N/A'}
                  </Badge>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <div><strong>Name:</strong> {userProfile.name || 'N/A'}</div>
                  <div><strong>Created:</strong> {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Role Flags */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-700">🏷️ Role Flags</div>
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
              <div className="font-semibold text-gray-700">🏢 Venue Owner Profile</div>
              <div className="bg-blue-50 p-2 rounded text-xs">
                <div><strong>Onboarding:</strong> {userProfile.venueOwnerProfile.onboardingCompleted ? '✅ Complete' : '❌ Incomplete'}</div>
                <div><strong>Venue IDs:</strong> {userProfile.venueOwnerProfile.venueIds?.length || 0}</div>
                <div><strong>Business Info:</strong> {userProfile.venueOwnerProfile.businessInfo || 'N/A'}</div>
                <div><strong>Phone:</strong> {userProfile.venueOwnerProfile.phone || 'N/A'}</div>
              </div>
            </div>
          )}

          {/* Organizer Profile */}
          {(userProfile as any)?.organizerProfile && isExpanded && (
            <div className="space-y-2">
              <div className="font-semibold text-gray-700">🎯 Organizer Profile</div>
              <div className="bg-green-50 p-2 rounded text-xs">
                <div><strong>Org IDs:</strong> {(userProfile as any).organizerProfile.organizationIds?.length || 0}</div>
              </div>
            </div>
          )}

          {/* Admin Session State */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-700">👑 Admin Session</div>
            <div className="bg-red-50 p-2 rounded text-xs">
              <div><strong>Admin Session:</strong> {localStorage.getItem('voxxy_admin_session') || 'false'}</div>
              <div><strong>Admin Email:</strong> {localStorage.getItem('voxxy_admin_email') || 'N/A'}</div>
              <div><strong>⚠️ Firebase User:</strong> {currentUser?.email || 'N/A'}</div>
              {localStorage.getItem('voxxy_admin_session') === 'true' && currentUser?.email !== 'team@voxxypresents.com' && (
                <div className="text-red-600 font-bold">🔥 SPLIT BRAIN: Admin localStorage but different Firebase user!</div>
              )}
            </div>
          </div>

          {/* Current URL */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-700">🌐 Current State</div>
            <div className="bg-gray-50 p-2 rounded text-xs">
              <div><strong>URL:</strong> {window.location.pathname}</div>
              <div><strong>Firebase Project:</strong> {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not Set'}</div>
              <div><strong>Environment:</strong> {import.meta.env.VITE_ENVIRONMENT || 'Auto-detected'}</div>
              <div><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t">
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
                className="flex-1 h-8 text-xs"
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
                className="w-full h-8 text-xs border-red-200 text-red-600"
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
              className="w-full h-8 text-xs border-green-200 text-green-600"
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
                className="w-full h-8 text-xs border-blue-200 text-blue-600"
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