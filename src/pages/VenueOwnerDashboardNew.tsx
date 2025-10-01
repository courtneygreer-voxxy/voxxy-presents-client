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
  UserPlus,
  Star,
  Phone,
  Share,
  Copy
} from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { VenueProfileEditor } from '@/components/venue/VenueProfileEditor'
import { EventPipelineCRM } from '@/components/venue/EventPipelineCRM'
import { venuesApi } from '@/services/api'
import type { Venue } from '@/types/venue'

export default function VenueOwnerDashboardNew() {
  const navigate = useNavigate()
  const { currentUser, userProfile, isVenueOwner, isOrganizer } = useAuth()
  const [venues, setVenues] = useState<Venue[]>([])
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication and role
    if (!currentUser) {
      navigate('/login/venue-owner')
      return
    }

    // Only allow venue owners to access venue dashboard
    if (!isVenueOwner) {
      navigate('/')
      return
    }

    // SIMPLIFIED VENUE OWNER LOGIC: Skip onboarding checks, just load venues
    console.log('🏢 VENUE OWNER DEBUG: Loading venues for owner:', currentUser.uid)
    console.log('🏢 VENUE OWNER DEBUG: User profile:', userProfile)

    // Load venue data for this owner
    const loadVenueData = async () => {
      try {
        console.log('Loading venues for owner:', currentUser.uid)

        // Use environment-aware data source like useOrganization hook
        const { getDataSource } = await import('@/config/environments')
        const dataSource = getDataSource()

        let venueData: any[] = []

        if (dataSource === 'firebase') {
          // Direct Firebase access for staging/development
          console.log('Loading venues via Firebase')
          const { getVenuesByOwner } = await import('@/lib/database')
          venueData = await getVenuesByOwner(currentUser.uid)
          console.log('🏢 VENUE DEBUG: Raw venue data from Firebase:', venueData)
        } else {
          // API access for production
          console.log('Loading venues via API')
          const response = await venuesApi.getByOwner(currentUser.uid)
          if (response.success && response.venues) {
            venueData = response.venues
          }
          console.log('🏢 VENUE DEBUG: Raw venue data from API:', venueData)
        }

        setVenues(venueData)

          // Check if any venues need approval
          const pendingVenues = venueData.filter((venue: any) => venue.claimStatus === 'pending')
          const approvedVenues = venueData.filter((venue: any) => venue.claimStatus === 'approved')

          console.log('🏢 VENUE DEBUG: Pending venues:', pendingVenues.length, pendingVenues.map((v: any) => ({ id: v.id, name: v.name, claimStatus: v.claimStatus })))
          console.log('🏢 VENUE DEBUG: Approved venues:', approvedVenues.length, approvedVenues.map((v: any) => ({ id: v.id, name: v.name, claimStatus: v.claimStatus })))

          if (pendingVenues.length > 0 && approvedVenues.length === 0) {
            // All venues are pending, redirect to pending page
            console.log('🏢 VENUE DEBUG: All venues pending, redirecting to pending page')
            navigate('/venues/pending')
            return
          }

          // Select the first approved venue, or first venue if all approved
          if (approvedVenues.length > 0) {
            setSelectedVenue(approvedVenues[0])
          } else if (venueData.length > 0) {
            setSelectedVenue(venueData[0])
          }

        if (venueData.length === 0) {
          // No venues found - redirect to create venue
          console.log('🏢 VENUE OWNER DEBUG: No venues found, redirecting to create')
          navigate('/venues/create')
          return
        }
      } catch (err) {
        console.error('Error loading venues:', err)
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
    if (selectedVenue) {
      console.log('🔗 VENUE DEBUG: Navigating to public venue page:', `/venue/${selectedVenue.slug}`)
      navigate(`/venue/${selectedVenue.slug}`)
    }
  }

  const handleShareVenue = async () => {
    if (selectedVenue) {
      const publicUrl = `${window.location.origin}/venue/${selectedVenue.slug}`
      console.log('🔗 VENUE DEBUG: Sharing venue URL:', publicUrl)

      try {
        await navigator.clipboard.writeText(publicUrl)
        // TODO: Add toast notification for successful copy
        console.log('✅ VENUE DEBUG: URL copied to clipboard')
      } catch (err) {
        console.error('❌ VENUE DEBUG: Failed to copy URL:', err)
        // Fallback: show the URL in an alert
        alert(`Venue URL: ${publicUrl}`)
      }
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

  if (!selectedVenue) {
    // DEBUG: Log why no venue is selected
    console.log('🚨 VENUE DEBUG: No selected venue')
    console.log('🚨 VENUE DEBUG: Total venues loaded:', venues?.length || 0, venues)
    console.log('🚨 VENUE DEBUG: Current user ID:', currentUser?.uid)

    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center p-4">
        {/* Debug info overlay */}
        <div className="absolute top-4 left-4 bg-red-900/80 text-white p-4 rounded text-sm max-w-md z-50">
          <div className="font-bold mb-2">🚨 DEBUG: No Venue Selected</div>
          <div>User ID: {currentUser?.uid}</div>
          <div>Venues loaded: {venues?.length || 0}</div>
          <div>Loading: {loading ? 'true' : 'false'}</div>
          <div>Error: {error || 'none'}</div>
        </div>

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
    if (!selectedVenue) return <Clock className="h-5 w-5 text-yellow-400" />
    switch (selectedVenue.claimStatus) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <Clock className="h-5 w-5 text-yellow-400" />
    }
  }

  const getStatusBadge = () => {
    if (!selectedVenue) return <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">Pending Review</Badge>
    switch (selectedVenue.claimStatus) {
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
            <div>
              <h1 className="text-2xl font-bold text-white">My Venue</h1>
              <p className="text-gray-300 text-sm">Manage your venue profile and bookings</p>
            </div>
            <div className="flex items-center gap-3">
              {venues.length > 1 && (
                <select
                  value={selectedVenue?.id || ''}
                  onChange={(e) => {
                    const venue = venues.find(v => v.id === e.target.value)
                    if (venue) setSelectedVenue(venue)
                  }}
                  className="bg-white/10 border border-white/20 text-white rounded px-3 py-1 text-sm"
                >
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id} className="bg-gray-800 text-white">
                      {venue.name}
                    </option>
                  ))}
                </select>
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
        <Tabs defaultValue="venue" className="flex gap-8" orientation="vertical">
          <div className="w-64 flex-shrink-0">
            <TabsList className="flex flex-col h-fit w-full !bg-transparent backdrop-blur-sm border border-white/20">
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
            {/* My Venue Tab */}
            <TabsContent value="venue">
              <div className="space-y-6">
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20 text-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-3">
                          {selectedVenue?.name}
                          {getStatusBadge()}
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          Manage your venue profile and information that appears on the public listing.
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handlePreviewVenue}
                          variant="outline"
                          size="sm"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Public Page
                        </Button>
                        <Button
                          onClick={handleShareVenue}
                          variant="outline"
                          size="sm"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                <VenueProfileEditor venue={selectedVenue} onUpdate={setSelectedVenue} />
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
                <EventPipelineCRM venueId={selectedVenue?.id || ''} />
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