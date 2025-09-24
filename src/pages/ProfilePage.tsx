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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      
      {/* Header */}
      <div className="bg-gray-800 border-b border-white/10 relative">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
                Voxxy Presents
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <h1 className="text-xl font-semibold text-gray-200">Your Dashboard</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 flex items-center space-x-2"
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
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <div className="text-center p-6 pb-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20 ring-2 ring-white/20">
                    <AvatarImage src={currentUser.photoURL || undefined} />
                    <AvatarFallback className="bg-purple-500/30 text-purple-200 text-xl font-semibold backdrop-blur-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {currentUser.displayName || 'Club Owner'}
                </h2>
                <div className="flex items-center justify-center space-x-2 text-gray-300 mt-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{currentUser.email}</span>
                </div>
                <div className="flex justify-center mt-3">
                  {isEmailVerified ? (
                    <div className="bg-green-500/20 text-green-300 border border-green-400/30 px-3 py-1 rounded-full text-xs flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  ) : (
                    <div className="bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1 rounded-full text-xs flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      Unverified
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 pt-0 pb-6">
                <div className="h-px bg-white/10 mb-4" />
                
                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Clubs</span>
                    </div>
                    <div className="bg-white/10 text-white px-2 py-1 rounded text-xs">
                      {userProfile?.organizationIds?.length || 0}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Member since</span>
                    </div>
                    <span className="text-sm text-gray-200">
                      {currentUser.metadata.creationTime && 
                        new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })
                      }
                    </span>
                  </div>
                </div>

                <div className="h-px bg-white/10 my-4" />
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white border-none" size="sm">
                    <Link to="/create-club">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Club
                    </Link>
                  </Button>
                  <button
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 px-3 py-2 rounded text-sm flex items-center justify-center"
                    onClick={() => setActiveTab('clubs')}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    My Clubs
                  </button>
                  <Link
                    to="/voxxy-shop"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 px-3 py-2 rounded text-sm flex items-center justify-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Browse Voxxy Shop
                  </Link>
                  <button
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 px-3 py-2 rounded text-sm flex items-center justify-center"
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              {/* Tab Navigation */}
              <div className="border-b border-white/10 p-1">
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded transition-all duration-200 text-sm font-medium ${
                      activeTab === 'overview'
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Overview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('clubs')}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded transition-all duration-200 text-sm font-medium ${
                      activeTab === 'clubs'
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>My Clubs</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded transition-all duration-200 text-sm font-medium ${
                      activeTab === 'settings'
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <ProfileOverview onTabChange={setActiveTab} />
                )}
                
                {activeTab === 'clubs' && (
                  <ClubsManagement />
                )}
                
                {activeTab === 'settings' && (
                  <ProfileSettings />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}