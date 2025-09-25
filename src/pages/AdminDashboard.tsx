import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Settings, Eye, Users, Calendar, ExternalLink, Mail, TrendingUp, BarChart3, LogOut, Shield, RefreshCw, Search, Filter, X, CheckCircle, XCircle, MapPin, Building2 } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { organizationsRef } from '@/lib/database'
import { getDocs, query, where } from 'firebase/firestore'
import type { Organization } from '@/types/database'
import type { Venue } from '@/types/venue'
import BetaUsersManagement from '@/components/admin/BetaUsersManagement'
import { venueService } from '@/services/venueService'

interface ContactSubmission {
  id: string
  type: 'beta_request' | 'newsletter_signup' | 'general_contact'
  name: string
  email: string
  organizationName?: string
  description?: string
  source: string
  status: string
  submittedAt: string
  emailThreadId?: string
}

interface AdminStats {
  beta_requests: number
  newsletter_signups: number
  general_contacts: number
}

interface EmailDashboardData {
  submissions: ContactSubmission[]
  total: number
  stats: AdminStats
}

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [emailData, setEmailData] = useState<EmailDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [venueLoading, setVenueLoading] = useState(true)
  const [emailLoading, setEmailLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')


  // Filter submissions based on search and filters
  const filteredSubmissions = emailData?.submissions ? emailData.submissions.filter(submission => {
    const matchesSearch = searchQuery === '' || 
      submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (submission.organizationName && submission.organizationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (submission.description && submission.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = typeFilter === 'all' || submission.type === typeFilter
    
    return matchesSearch && matchesType
  }) : []

  const clearFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
  }


  // Check admin authentication
  useEffect(() => {
    const adminSession = localStorage.getItem('voxxy_admin_session')
    const adminEmail = localStorage.getItem('voxxy_admin_email')
    
    if (adminSession === 'true' && adminEmail === 'team@voxxypresents.com') {
      setIsAdmin(true)
    } else {
      navigate('/admin/login')
      return
    }
  }, [navigate])

  // Load user's organizations
  useEffect(() => {
    if (!isAdmin) return

    const loadOrganizations = async () => {
      setLoading(true)
      try {
        const querySnapshot = await getDocs(organizationsRef)
        const orgs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as Organization[]
        setOrganizations(orgs)
      } catch (error) {
        console.error('Failed to load organizations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrganizations()
  }, [isAdmin])

  // Load venues
  useEffect(() => {
    if (!isAdmin) return

    const loadVenues = async () => {
      setVenueLoading(true)
      try {
        const result = await venueService.searchVenues({})
        setVenues(result.venues || [])
      } catch (error) {
        console.error('Failed to load venues:', error)
      } finally {
        setVenueLoading(false)
      }
    }

    loadVenues()
  }, [isAdmin])

  // Load email dashboard data
  useEffect(() => {
    if (!isAdmin) return
    
    const loadEmailData = async () => {
      setEmailLoading(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/email/contact`)
        if (response.ok) {
          const data = await response.json()
          setEmailData(data)
          setLastRefresh(new Date())
        }
      } catch (error) {
        console.error('Failed to load email data:', error)
      } finally {
        setEmailLoading(false)
      }
    }

    loadEmailData()
    
    // Auto-refresh email data every 30 seconds
    const interval = setInterval(loadEmailData, 30000)
    return () => clearInterval(interval)
  }, [isAdmin])

  const handleLogout = () => {
    localStorage.removeItem('voxxy_admin_session')
    localStorage.removeItem('voxxy_admin_email')
    navigate('/admin/login')
  }

  const handleRefreshEmailData = async () => {
    setEmailLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/email/contact`)
      if (response.ok) {
        const data = await response.json()
        setEmailData(data)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Failed to refresh email data:', error)
    } finally {
      setEmailLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'beta_request': return 'bg-purple-100 text-purple-800'
      case 'newsletter_signup': return 'bg-blue-100 text-blue-800'
      case 'general_contact': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'beta_request': return 'Beta Request'
      case 'newsletter_signup': return 'Newsletter'
      case 'general_contact': return 'Email Click'
      default: return type
    }
  }


  if (!isAdmin) {
    return null // Will redirect to login
  }

  if (loading || venueLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your clubs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Voxxy Presents Admin</h1>
                <p className="text-gray-600 mt-1">Platform administration and analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                team@voxxypresents.com
              </Badge>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="beta" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="beta">Beta Users</TabsTrigger>
            <TabsTrigger value="email">Email Analytics</TabsTrigger>
            <TabsTrigger value="venues">Venue Management</TabsTrigger>
            <TabsTrigger value="clubs">Club Management</TabsTrigger>
          </TabsList>

          {/* Beta Users Tab */}
          <TabsContent value="beta" className="space-y-6">
            <BetaUsersManagement />
          </TabsContent>

          {/* Email Analytics Tab */}
          <TabsContent value="email" className="space-y-6">
            {/* Email Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailData?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">All contact forms</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Beta Requests</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{emailData?.stats.beta_requests || 0}</div>
                  <p className="text-xs text-muted-foreground">Paid beta interest</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Product Updates</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{emailData?.stats.newsletter_signups || 0}</div>
                  <p className="text-xs text-muted-foreground">Newsletter signups</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Button Clicks</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">{emailData?.stats.general_contacts || 0}</div>
                  <p className="text-xs text-muted-foreground">Direct contact clicks</p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Submissions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Contact Submissions</CardTitle>
                    <CardDescription>All contact form submissions and email interactions</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      Last updated: {lastRefresh.toLocaleTimeString()}
                    </p>
                    <Button 
                      onClick={handleRefreshEmailData} 
                      variant="outline" 
                      size="sm"
                      disabled={emailLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${emailLoading ? 'animate-spin' : ''}`} />
                      {emailLoading ? 'Syncing...' : 'Sync Data'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter Controls */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Filters</span>
                    </div>
                    {(searchQuery || typeFilter !== 'all') && (
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search name, email, club..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Type Filter */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="beta_request">Beta Requests</SelectItem>
                        <SelectItem value="newsletter_signup">Product Updates</SelectItem>
                        <SelectItem value="general_contact">Email Clicks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Results Count */}
                  <div className="text-sm text-gray-600">
                    Showing {filteredSubmissions.length} of {emailData?.total || 0} submissions
                  </div>
                </div>

                {emailLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading email data...</p>
                  </div>
                ) : filteredSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredSubmissions
                      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                      .map((submission) => (
                      <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{submission.name}</h3>
                              <Badge className={getTypeColor(submission.type)}>
                                {getTypeLabel(submission.type)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {submission.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <Mail className="h-3 w-3 inline mr-1" />
                              {submission.email}
                            </p>
                            {submission.organizationName && (
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Club:</strong> {submission.organizationName}
                              </p>
                            )}
                            {submission.description && (
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Message:</strong> {submission.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>{new Date(submission.submittedAt).toLocaleDateString()}</p>
                            <p>{new Date(submission.submittedAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>ID: {submission.id}</span>
                          {submission.emailThreadId && (
                            <span>Thread: {submission.emailThreadId}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : emailData?.submissions && emailData.submissions.length > 0 ? (
                  <div className="text-center py-12">
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No submissions match your filters</p>
                    <Button 
                      onClick={clearFilters}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No email submissions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Venue Management Tab */}
          <TabsContent value="venues" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Venue Management</h2>
                <p className="text-gray-600">Manage all venues on the platform</p>
              </div>
            </div>

            {venueLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading venues...</p>
              </div>
            ) : venues.length === 0 ? (
              /* No Venues State */
              <Card className="max-w-2xl mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Building2 className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues yet</h3>
                  <p className="text-gray-600 text-center mb-6 max-w-md">
                    Venues will appear here as they are added to the platform.
                  </p>
                </CardContent>
              </Card>
            ) : (
              /* Venues Grid */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {venues.map((venue) => (
                    <Card key={venue.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardContent className="p-0">
                        {/* Venue Image */}
                        {venue.photos && venue.photos.length > 0 ? (
                          <img
                            src={venue.photos[0]}
                            alt={`${venue.name}`}
                            className="w-full h-32 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg flex items-center justify-center">
                            <span className="text-white font-semibold">{venue.name}</span>
                          </div>
                        )}

                        {/* Venue Info */}
                        <div className="p-6">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 -mt-8">
                              <Building2 className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">{venue.name}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{venue.description}</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate">{venue.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {venue.venueType.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  venue.claimStatus === 'claimed' ? 'bg-green-100 text-green-800' :
                                  venue.claimStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {venue.claimStatus}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              Capacity: {venue.capacity} • {venue.pricingType}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              /{venue.slug}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(`/venue/${venue.slug}`, '_blank')
                                }}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Stats for Venues */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Building2 className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Venues</p>
                          <p className="text-2xl font-bold text-gray-900">{venues.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Claimed</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {venues.filter(v => v.claimStatus === 'claimed').length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <XCircle className="h-8 w-8 text-gray-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Unclaimed</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {venues.filter(v => v.claimStatus === 'unclaimed').length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <MapPin className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Venue Types</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {new Set(venues.map(v => v.venueType)).size}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Club Management Tab */}
          <TabsContent value="clubs" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Club Management</h2>
                <p className="text-gray-600">Manage all clubs on the platform</p>
              </div>
              <Button onClick={() => navigate('/create-club')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Club
              </Button>
            </div>

        {organizations.length === 0 ? (
          /* No Clubs State */
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No clubs yet</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Create your first club to start building your community and organizing events.
              </p>
              <Button onClick={() => navigate('/create-club')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Club
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Clubs Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-0">
                  {/* Club Banner */}
                  {org.bannerUrl ? (
                    <img 
                      src={org.bannerUrl} 
                      alt={`${org.name} banner`}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg flex items-center justify-center">
                      <span className="text-white font-semibold">{org.name}</span>
                    </div>
                  )}
                  
                  {/* Club Info */}
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      {org.logoUrl ? (
                        <img 
                          src={org.logoUrl} 
                          alt={`${org.name} logo`}
                          className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-sm flex-shrink-0 -mt-8"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 -mt-8">
                          <span className="text-gray-600 text-xs font-bold">{org.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{org.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{org.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        /{org.slug}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`/${org.slug}`, '_blank')
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/${org.slug}/admin`)}
                          className="flex items-center gap-1"
                        >
                          <Settings className="h-3 w-3" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Create New Club Card */}
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer group border-dashed border-2 border-gray-300 hover:border-purple-400"
              onClick={() => navigate('/create-club')}
            >
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Plus className="h-12 w-12 text-gray-400 group-hover:text-purple-500 mb-4 transition-colors" />
                <h3 className="font-semibold text-gray-900 mb-2">Create New Club</h3>
                <p className="text-sm text-gray-600">Start building your community</p>
              </CardContent>
            </Card>
          </div>
        )}
            
            {/* Stats for Clubs */}
            {organizations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Clubs</p>
                        <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Events</p>
                        <p className="text-2xl font-bold text-gray-900">-</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <ExternalLink className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Pages</p>
                        <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}