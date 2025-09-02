import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Building2, 
  Calendar, 
  Users, 
  ArrowRight,
  Mail,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface ProfileOverviewProps {
  onTabChange?: (tab: 'clubs' | 'settings') => void
}

export function ProfileOverview({ onTabChange }: ProfileOverviewProps) {
  const { currentUser, userProfile, isEmailVerified, resendVerification } = useAuth()
  const [isResendingVerification, setIsResendingVerification] = React.useState(false)

  const handleResendVerification = async () => {
    setIsResendingVerification(true)
    try {
      await resendVerification()
      // Success feedback could be added here
    } catch (error) {
      console.error('Failed to resend verification:', error)
    } finally {
      setIsResendingVerification(false)
    }
  }

  const clubCount = userProfile?.organizationIds?.length || 0
  const isNewUser = clubCount === 0
  const joinDate = currentUser?.metadata.creationTime ? 
    new Date(currentUser.metadata.creationTime) : null

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Welcome to Voxxy Presents!</h2>
          </div>
          <p className="text-gray-300 text-sm">
            Your dashboard for managing clubs and events
          </p>
        </div>
        <div className="px-6 pb-6">
          {isNewUser ? (
            <div className="space-y-4 text-center">
              <p className="text-gray-200">
                Ready to create your first club? Our platform makes it easy to manage 
                recurring events, track registrations, and keep your community connected.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/create-club"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Club
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-200">
                Great to see you back! You're currently managing {clubCount} club{clubCount !== 1 ? 's' : ''}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/create-club"
                  className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Another Club
                </Link>
                <button
                  onClick={() => onTabChange?.('clubs')}
                  className="inline-flex items-center justify-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Existing Clubs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Verification Alert */}
      {!isEmailVerified && (
        <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-4 w-4 text-red-300 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-red-200">
                  <span className="font-medium">Email verification required</span> - Please verify your email to create clubs.
                </div>
                <button
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded transition-colors duration-200"
                >
                  {isResendingVerification ? 'Sending...' : 'Resend Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Overview */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-white">Account Overview</h2>
        </div>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/20 backdrop-blur-sm rounded-lg border border-purple-400/30">
                  <Building2 className="h-4 w-4 text-purple-300" />
                </div>
                <div>
                  <p className="font-medium text-white">Clubs Created</p>
                  <p className="text-sm text-gray-300">Organizations you manage</p>
                </div>
              </div>
              <div className="bg-white/20 text-white px-3 py-2 rounded text-lg font-medium">
                {clubCount}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-400/30">
                  <Mail className="h-4 w-4 text-blue-300" />
                </div>
                <div>
                  <p className="font-medium text-white">Email Status</p>
                  <p className="text-sm text-gray-300">Verification status</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs flex items-center ${
                isEmailVerified 
                  ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-400/30'
              }`}>
                {isEmailVerified ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </>
                )}
              </div>
            </div>

            {joinDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-400/30">
                    <Calendar className="h-4 w-4 text-green-300" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Member Since</p>
                    <p className="text-sm text-gray-300">Account created</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-200">
                  {joinDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Getting Started Guide for New Users */}
      {isNewUser && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-semibold text-white">Getting Started</h2>
            <p className="text-sm text-gray-300 mt-1">
              Follow these steps to create your first club and start building your community
            </p>
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-white">Create Your Club</h4>
                  <p className="text-sm text-gray-300">
                    Set up your club's name, description, and branding to establish your identity.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 text-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-white">Add Your First Event</h4>
                  <p className="text-sm text-gray-300">
                    Create events to start building your community and track attendance.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 text-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-white">Share Your Club</h4>
                  <p className="text-sm text-gray-300">
                    Invite members and promote your events to grow your community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}