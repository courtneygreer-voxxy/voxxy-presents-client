import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/services/api'
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
  Calendar,
  UserCog
} from 'lucide-react'

type UserRole = 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'

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
    isProducer,
    isVendor,
    isGuest,
    isAdmin,
    signOut,
    refreshUserProfile
  } = useAuth()

  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSwitchingRole, setIsSwitchingRole] = useState(false)

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
      // V3.0 Roles
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'producer': return 'bg-green-100 text-green-800'
      case 'vendor': return 'bg-blue-100 text-blue-800'
      case 'consumer': return 'bg-amber-100 text-amber-800'
      case 'guest': return 'bg-gray-100 text-gray-800'
      // Legacy Roles (deprecated)
      case 'venue_owner': return 'bg-blue-100 text-blue-800'
      case 'organizer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRoleSwitch = async (newRole: UserRole) => {
    if (!userProfile || !currentUser) {
      console.error('❌ No user profile found')
      return
    }

    try {
      setIsSwitchingRole(true)
      console.log(`🔄 Switching role from ${userProfile.role} to ${newRole}`)

      // Update user role via API
      await authApi.updateUser(userProfile.id, { role: newRole })

      console.log(`✅ Role switched to ${newRole}, refreshing user profile...`)

      // Refresh user profile to get updated data
      await refreshUserProfile()

      console.log(`✅ Profile refreshed, reloading page to apply changes...`)

      // Force page reload to apply new role routing
      window.location.reload()
    } catch (error) {
      console.error('❌ Failed to switch role:', error)
      alert(`Failed to switch role: ${error}`)
      setIsSwitchingRole(false)
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

          {/* Current Role & Role Switcher */}
          {userProfile && (
            <div className="space-y-2 border-2 border-yellow-500/50 rounded p-2 bg-yellow-900/20">
              <div className="font-semibold text-yellow-300 flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                🎭 CURRENT ROLE
              </div>
              <div className="flex items-center justify-center">
                <Badge className={`${getRoleColor(userProfile.role)} text-base px-4 py-2 font-bold`}>
                  {userProfile.role?.toUpperCase() || 'NO ROLE'}
                </Badge>
              </div>

              <div className="pt-2 space-y-2">
                <div className="font-semibold text-yellow-300 text-center">Switch Role (Testing)</div>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    onClick={() => handleRoleSwitch('producer')}
                    disabled={isSwitchingRole || userProfile.role === 'producer'}
                    size="sm"
                    variant="outline"
                    className={`h-7 text-xs ${userProfile.role === 'producer' ? 'bg-green-900/50 border-green-500' : 'border-green-500/50 text-green-400 hover:bg-green-900/30'}`}
                  >
                    🎯 Producer
                  </Button>
                  <Button
                    onClick={() => handleRoleSwitch('vendor')}
                    disabled={isSwitchingRole || userProfile.role === 'vendor'}
                    size="sm"
                    variant="outline"
                    className={`h-7 text-xs ${userProfile.role === 'vendor' ? 'bg-blue-900/50 border-blue-500' : 'border-blue-500/50 text-blue-400 hover:bg-blue-900/30'}`}
                  >
                    🏢 Vendor
                  </Button>
                  <Button
                    onClick={() => handleRoleSwitch('consumer')}
                    disabled={isSwitchingRole || userProfile.role === 'consumer'}
                    size="sm"
                    variant="outline"
                    className={`h-7 text-xs ${userProfile.role === 'consumer' ? 'bg-amber-900/50 border-amber-500' : 'border-amber-500/50 text-amber-400 hover:bg-amber-900/30'}`}
                  >
                    👤 Consumer
                  </Button>
                  <Button
                    onClick={() => handleRoleSwitch('admin')}
                    disabled={isSwitchingRole || userProfile.role === 'admin'}
                    size="sm"
                    variant="outline"
                    className={`h-7 text-xs ${userProfile.role === 'admin' ? 'bg-purple-900/50 border-purple-500' : 'border-purple-500/50 text-purple-400 hover:bg-purple-900/30'}`}
                  >
                    👑 Admin
                  </Button>
                </div>
                {isSwitchingRole && (
                  <div className="text-center text-yellow-400 animate-pulse">
                    ⏳ Switching role...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Info */}
          {currentUser && (
            <div className="space-y-2">
              <div className="font-semibold text-gray-300">👤 Current User</div>
              <div className="bg-slate-800/50 p-2 rounded text-xs text-gray-200">
                <div><strong className="text-gray-100">ID:</strong> {currentUser.id}</div>
                <div><strong className="text-gray-100">Email:</strong> {currentUser.email}</div>
                <div><strong className="text-gray-100">Email Verified:</strong> {currentUser.confirmed_at ? '✅' : '❌'}</div>
              </div>
            </div>
          )}

          {/* User Profile */}
          {userProfile && (
            <div className="space-y-2">
              <div className="font-semibold text-gray-300">📋 User Profile</div>
              <div className="space-y-1">
                <div className="bg-slate-800/50 p-2 rounded text-gray-200">
                  <div><strong className="text-gray-100">ID:</strong> {userProfile.id || 'N/A'}</div>
                  <div><strong className="text-gray-100">Name:</strong> {userProfile.name || 'N/A'}</div>
                  <div><strong className="text-gray-100">Username:</strong> {userProfile.username || 'N/A'}</div>
                  <div><strong className="text-gray-100">Status:</strong> {userProfile.status || 'N/A'}</div>
                  <div><strong className="text-gray-100">Product Context:</strong> {userProfile.product_context || 'N/A'}</div>
                  <div><strong className="text-gray-100">Confirmed:</strong> {userProfile.confirmed_at ? '✅ Yes' : '❌ No'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Role Flags */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-300">🏷️ Role Flags (V3.0)</div>
            <div className="grid grid-cols-2 gap-1">
              <Badge variant={isProducer ? 'default' : 'secondary'} className="text-xs">
                {isProducer ? '🎯 Producer' : '⭕ Not Producer'}
              </Badge>
              <Badge variant={isVendor ? 'default' : 'secondary'} className="text-xs">
                {isVendor ? '🏢 Vendor' : '⭕ Not Vendor'}
              </Badge>
              <Badge variant={isGuest ? 'default' : 'secondary'} className="text-xs">
                {isGuest ? '👤 Consumer/Guest' : '⭕ Not Consumer'}
              </Badge>
              <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-xs">
                {isAdmin ? '👑 Admin' : '⭕ Not Admin'}
              </Badge>
            </div>
            {isExpanded && (
              <>
                <div className="font-semibold text-gray-400 text-[10px] pt-2">DEPRECATED FLAGS (Legacy)</div>
                <div className="grid grid-cols-2 gap-1">
                  <Badge variant={isVenueOwner ? 'default' : 'secondary'} className="text-xs opacity-60">
                    {isVenueOwner ? '🏢 Venue Owner' : '⭕ Not Venue'}
                  </Badge>
                  <Badge variant={isOrganizer ? 'default' : 'secondary'} className="text-xs opacity-60">
                    {isOrganizer ? '🎯 Organizer' : '⭕ Not Organizer'}
                  </Badge>
                </div>
              </>
            )}
          </div>


          {/* Producer/Organizer Profile */}
          {(isProducer || isOrganizer) && isExpanded && (
            <div className="space-y-2">
              <div className="font-semibold text-gray-300">🎯 Producer Debug</div>
              <div className="bg-green-900/30 p-2 rounded text-xs text-green-200">
                <div><strong className="text-green-100">isProducer:</strong> {isProducer ? '✅ True' : '❌ False'}</div>
                <div><strong className="text-green-100">isOrganizer (deprecated):</strong> {isOrganizer ? '✅ True' : '❌ False'}</div>
                <div className="mt-1 pt-1 border-t border-green-700/50">
                  <div className="text-gray-400 text-[10px]">Organizations managed by this user will appear in the producer dashboard</div>
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
              <div><strong className="text-gray-100">⚠️ Current User:</strong> {currentUser?.email || 'N/A'}</div>
              {localStorage.getItem('voxxy_admin_session') === 'true' && currentUser?.email !== 'team@voxxypresents.com' && (
                <div className="text-red-400 font-bold">🔥 SPLIT BRAIN: Admin localStorage but different user!</div>
              )}
            </div>
          </div>

          {/* Current URL */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-300">🌐 Current State</div>
            <div className="bg-slate-800/50 p-2 rounded text-xs text-gray-200">
              <div><strong className="text-gray-100">URL:</strong> {window.location.pathname}</div>
              <div><strong className="text-gray-100">API Base:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}</div>
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

            {/* API Connection Test */}
            <Button
              onClick={async () => {
                try {
                  console.log('🔍 DEBUG: Testing API connection...')
                  const response = await authApi.getCurrentUser()
                  console.log('🔍 DEBUG: API test result:', response)
                  alert(`API Test Success:\nUser: ${response.email}\nRole: ${response.role}\nID: ${response.id}`)
                } catch (error) {
                  console.error('🔍 DEBUG: API test failed:', error)
                  alert(`API Test Failed: ${error}`)
                }
              }}
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs border-green-500/50 text-green-400 hover:bg-green-900/30"
            >
              🔍 Test API Connection
            </Button>

            {/* Venue Debug Controls */}
            {isVenueOwner && currentUser && (
              <Button
                onClick={async () => {
                  try {
                    console.log('🔍 DEBUG: Manual venue lookup for user:', currentUser.id)
                    // Use the same venuesApi service to be consistent
                    const { venuesApi } = await import('@/services/api')
                    const data = await venuesApi.getByOwner(String(currentUser.id))
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