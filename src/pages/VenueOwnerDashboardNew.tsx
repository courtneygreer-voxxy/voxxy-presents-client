import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Settings,
  Calendar,
  Building2,
  Eye,
  Users,
  MapPin,
  LogOut,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Mail,
  User,
  Shield,
  Bell,
  UserPlus
} from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { VenueProfileEditor } from '@/components/venue/VenueProfileEditor'
import { EventPipelineCRM } from '@/components/venue/EventPipelineCRM'
import type { Venue } from '@/types/venue'

export default function VenueOwnerDashboardNew() {
  const navigate = useNavigate()
  const { currentUser, userProfile, isVenueOwner, isOrganizer } = useAuth()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication and role
    if (!currentUser) {
      navigate('/login')
      return
    }

    // Allow both venue owners and organizers to access venue dashboard
    if (!isVenueOwner && !isOrganizer) {
      navigate('/')
      return
    }

    // Load venue data for this owner
    const loadVenueData = async () => {
      try {
        // TODO: Replace with actual API call to get venue by ownerId
        console.log('Loading venue for owner:', currentUser.uid)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock venue data - in production this would come from the API
        const mockVenue: Venue = {
          id: 'venue-123',
          name: 'The Foundry Brooklyn',
          description: 'Industrial-chic event space with soaring ceilings, exposed steel beams, and floor-to-ceiling windows.',
          address: '456 Atlantic Ave, Brooklyn, NY 11217',
          coordinates: {
            lat: 40.6838,
            lng: -73.9857
          },
          hours: {
            monday: { open: '17:00', close: '02:00' },
            tuesday: { open: '17:00', close: '02:00' },
            wednesday: { open: '17:00', close: '02:00' },
            thursday: { open: '17:00', close: '02:00' },
            friday: { open: '17:00', close: '03:00' },
            saturday: { open: '17:00', close: '03:00' },
            sunday: { open: '17:00', close: '01:00' }
          },
          contactInfo: {
            email: 'info@brooklynlounge.com',
            phone: '(718) 555-0123',
            website: 'https://brooklynlounge.com',
            instagram: '@brooklynlounge'
          },
          ownerId: currentUser.uid,
          venueType: 'bar',
          capacity: 75,
          amenities: ['WiFi', 'Sound System', 'Full Bar', 'ADA Accessible'],
          accessibility: {
            wheelchairAccessible: true,
            lgbtqFriendly: true,
            '420Friendly': false,
            genderNeutralBathrooms: true
          },
          pricingType: 'both',
          photos: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          approvalStatus: 'approved',
          approvedAt: new Date(),
          approvedBy: 'admin-123',
          slug: 'the-foundry-brooklyn'
        }

        setVenue(mockVenue)
      } catch (err) {
        console.error('Error loading venue:', err)
        setError('Failed to load venue data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadVenueData()
  }, [currentUser, isVenueOwner, isOrganizer, navigate])

  const handleLogout = () => {
    // TODO: Implement logout
    navigate('/login')
  }

  const handlePreviewVenue = () => {
    if (venue) {
      navigate(`/venue/${venue.slug}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
        {/* Animated background dots */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your venue dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated background dots */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-8 w-full max-w-md relative z-10">
          <Alert className="bg-red-400/10 border-red-400/30">
            <XCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated background dots */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-8 w-full max-w-md relative z-10 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Venue Found</h2>
          <p className="text-gray-300 mb-6">
            You don't have any venues associated with your account yet.
          </p>
          <Button
            onClick={() => navigate('/venues/create')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Create Your Venue
          </Button>
        </div>
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (venue.approvalStatus) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <Clock className="h-5 w-5 text-yellow-400" />
    }
  }

  const getStatusBadge = () => {
    switch (venue.approvalStatus) {
      case 'approved':
        return <Badge className="bg-green-400/20 text-green-400 border-green-400/30">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-400/20 text-red-400 border-red-400/30">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">Pending Review</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated background dots */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-32 left-1/3 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-purple-300/30 rounded-full animate-pulse delay-300"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/voxxy-shop')}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">{venue.name} Admin</h1>
                <p className="text-gray-300 text-sm">Manage your venue and events</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {venue.approvalStatus === 'approved' && (
                <Button
                  onClick={handlePreviewVenue}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Tabs defaultValue="overview" className="flex gap-8" orientation="vertical">
          <div className="w-64 flex-shrink-0">
            <TabsList className="flex flex-col h-fit w-full !bg-transparent backdrop-blur-sm border border-white/20">
              <TabsTrigger value="overview" className="flex items-center gap-2 w-full justify-start !bg-transparent text-gray-400 hover:text-white hover:bg-white/10 data-[state=active]:!bg-white/20 data-[state=active]:!text-white transition-colors">
                <Building2 className="h-4 w-4 text-purple-400" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="venue" className="flex items-center gap-2 w-full justify-start !bg-transparent text-gray-400 hover:text-white hover:bg-white/10 data-[state=active]:!bg-white/20 data-[state=active]:!text-white transition-colors">
                <Building2 className="h-4 w-4 text-purple-400" />
                My Venue
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2 w-full justify-start !bg-transparent text-gray-400 hover:text-white hover:bg-white/10 data-[state=active]:!bg-white/20 data-[state=active]:!text-white transition-colors">
                <Calendar className="h-4 w-4 text-purple-400" />
                Events
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 w-full justify-start !bg-transparent text-gray-400 hover:text-white hover:bg-white/10 data-[state=active]:!bg-white/20 data-[state=active]:!text-white transition-colors">
                <Settings className="h-4 w-4 text-purple-400" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-w-0">
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Venue Overview</CardTitle>
                    <CardDescription className="text-gray-300">
                      Quick stats and recent activity for your venue.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Total Events</p>
                            <p className="text-2xl font-bold text-white">12</p>
                          </div>
                          <Calendar className="h-8 w-8 text-purple-400" />
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Pending Requests</p>
                            <p className="text-2xl font-bold text-white">3</p>
                          </div>
                          <Clock className="h-8 w-8 text-yellow-400" />
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Total Attendees</p>
                            <p className="text-2xl font-bold text-white">485</p>
                          </div>
                          <Users className="h-8 w-8 text-green-400" />
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                          <p className="text-white">New event request from <span className="text-purple-400">Brooklyn Comedy Club</span></p>
                          <p className="text-gray-400 text-sm mt-1">2 hours ago</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                          <p className="text-white">Event <span className="text-green-400">"Jazz Night"</span> completed successfully</p>
                          <p className="text-gray-400 text-sm mt-1">1 day ago</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                          <p className="text-white">Profile updated with new photos</p>
                          <p className="text-gray-400 text-sm mt-1">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* My Venue Tab */}
            <TabsContent value="venue">
              <div className="space-y-6">
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">My Venue</CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage your venue profile and information that appears on the public listing.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <VenueProfileEditor venue={venue} onUpdate={setVenue} />
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <div className="space-y-6">
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Event Management</CardTitle>
                    <CardDescription className="text-gray-300">
                      Review and manage event requests from organizations.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <EventPipelineCRM venueId={venue.id} />
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="space-y-6">
                {/* Notifications */}
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Notification Preferences</CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage how you receive updates about your venue.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Email notifications for new booking requests</p>
                          <p className="text-gray-400 text-sm">Get notified when someone requests to book your venue</p>
                        </div>
                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          <Bell className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Management */}
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Venue Administrators</CardTitle>
                    <CardDescription className="text-gray-300">
                      Add other administrators to help manage your venue.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Current administrators</p>
                          <p className="text-gray-400 text-sm">People who can manage this venue</p>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite Admin
                        </Button>
                      </div>

                      <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{userProfile?.name || 'You'}</p>
                              <p className="text-gray-400 text-sm">{userProfile?.email || currentUser?.email}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-600/80 text-white">Owner</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Settings */}
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Account Settings</CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage your account security and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Email address</p>
                          <p className="text-gray-400 text-sm">{userProfile?.email || currentUser?.email}</p>
                        </div>
                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          <Mail className="h-4 w-4 mr-2" />
                          Change Email
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Password</p>
                          <p className="text-gray-400 text-sm">Change your account password</p>
                        </div>
                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          <Shield className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}