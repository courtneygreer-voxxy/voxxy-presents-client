import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Building2, 
  Settings, 
  Plus, 
  LogOut, 
  Calendar, 
  Users,
  Mail,
  Shield,
  ExternalLink,
  Edit3
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ProfileOverview } from '@/components/profile/ProfileOverview'
import { ClubsManagement } from '@/components/profile/ClubsManagement'
import { ProfileSettings } from '@/components/profile/ProfileSettings'

type TabValue = 'overview' | 'clubs' | 'settings'

export default function ProfilePage() {
  const { currentUser, userProfile, signOut, isEmailVerified } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabValue>('overview')
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Failed to sign out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (!currentUser) {
    return null // This should be handled by ProtectedRoute, but just in case
  }

  const userInitials = (currentUser.displayName || currentUser.email || 'U')
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-purple-600 hover:text-purple-700">
                Voxxy Presents
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold text-gray-900">Your Dashboard</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:w-80">
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser.photoURL || undefined} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-xl font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {currentUser.displayName || 'Club Owner'}
                </CardTitle>
                <CardDescription className="flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{currentUser.email}</span>
                </CardDescription>
                <div className="flex justify-center mt-2">
                  {isEmailVerified ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <Shield className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                
                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Clubs</span>
                    </div>
                    <Badge variant="outline">
                      {userProfile?.organizationIds?.length || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Member since</span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {currentUser.metadata.creationTime && 
                        new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })
                      }
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link to="/create-club">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Club
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Browse Clubs
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="clubs" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>My Clubs</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="overview">
                  <ProfileOverview />
                </TabsContent>
                
                <TabsContent value="clubs">
                  <ClubsManagement />
                </TabsContent>
                
                <TabsContent value="settings">
                  <ProfileSettings />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}