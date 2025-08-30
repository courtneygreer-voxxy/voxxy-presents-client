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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>Welcome to Voxxy Presents!</span>
          </CardTitle>
          <CardDescription>
            Your dashboard for managing clubs and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isNewUser ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Ready to create your first club? Our platform makes it easy to manage 
                recurring events, track registrations, and keep your community connected.
              </p>
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link to="/create-club">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Club
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Great to see you back! You're currently managing {clubCount} club{clubCount !== 1 ? 's' : ''}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link to="/create-club">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Another Club
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => onTabChange?.('clubs')}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Existing Clubs
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Verification Alert */}
      {!isEmailVerified && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Email verification required</strong> - Please verify your email to create clubs.
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleResendVerification}
                disabled={isResendingVerification}
              >
                {isResendingVerification ? 'Sending...' : 'Resend Email'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Clubs Created</p>
                  <p className="text-sm text-gray-600">Organizations you manage</p>
                </div>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {clubCount}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Email Status</p>
                  <p className="text-sm text-gray-600">Verification status</p>
                </div>
              </div>
              <Badge variant={isEmailVerified ? "secondary" : "destructive"}>
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
              </Badge>
            </div>

            {joinDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-gray-600">Account created</p>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {joinDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/create-club">
                <Plus className="h-4 w-4 mr-3" />
                Create New Club
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>

            {clubCount > 0 && (
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => onTabChange?.('clubs')}
              >
                <Building2 className="h-4 w-4 mr-3" />
                Manage Clubs
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            )}

            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onTabChange?.('settings')}
            >
              <Users className="h-4 w-4 mr-3" />
              Profile Settings
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>

            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/voxxy-shop">
                <Building2 className="h-4 w-4 mr-3" />
                Browse Voxxy Shop
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide for New Users */}
      {isNewUser && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to create your first club and start building your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Create Your Club</h4>
                  <p className="text-sm text-gray-600">
                    Set up your club's name, description, and branding to establish your identity.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Add Your First Event</h4>
                  <p className="text-sm text-gray-600">
                    Create events to start building your community and track attendance.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Share Your Club</h4>
                  <p className="text-sm text-gray-600">
                    Invite members and promote your events to grow your community.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}