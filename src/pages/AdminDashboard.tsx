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
import { VenuesManagement } from '@/components/admin/VenuesManagement'
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
  const [emailLoading, setEmailLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Email filtering state
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'beta_request' | 'newsletter_signup' | 'general_contact'>('all')

  // Check if user is admin (either Firebase auth or localStorage session)
  const isAdmin = currentUser?.email === 'team@voxxypresents.com' ||
                  localStorage.getItem('voxxy_admin_session') === 'true'

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }

    // Load organizations
    const loadOrganizations = async () => {
      try {
        // For staging/development, load all organizations
        // For production, filter by active status
        const snapshot = await getDocs(organizationsRef)
        const orgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Organization[]

        // Filter for active organizations, but include those without status field (for test data compatibility)
        const filteredOrgs = orgs.filter(org => !org.status || org.status === 'active')

        console.log('Loaded organizations:', filteredOrgs)
        setOrganizations(filteredOrgs)
      } catch (error) {
        console.error('Error loading organizations:', error)
      } finally {
        setLoading(false)
      }
    }

    // Load venues for approval management
    const loadVenues = async () => {
      try {
        const result = await venueService.searchVenues({})
        console.log('Loaded venues for admin:', result)
        setVenues(result.venues || [])
      } catch (error) {
        console.error('Error loading venues:', error)
        // Set empty array if API fails, but still show the venue management interface
        setVenues([])
      } finally {
        setVenueLoading(false)
      }
    }

    // Load email data (temporarily disabled - email endpoint not available in local API)
    const loadEmailData = async () => {
      setEmailLoading(true)
      try {
        // const response = await fetch('/api/admin/email-dashboard')
        // if (response.ok) {
        //   const data = await response.json()
        //   setEmailData(data)
        //   setLastRefresh(new Date())
        // }
        setEmailData(null) // Empty for now
        setLastRefresh(new Date())
      } catch (error) {
        console.error('Error loading email data:', error)
      } finally {
        setEmailLoading(false)
      }
    }

    loadOrganizations()
    loadVenues()
    loadEmailData()
  }, [isAdmin, navigate])

  const handleRefreshEmailData = async () => {
    setEmailLoading(true)
    try {
      const response = await fetch('/api/admin/email-dashboard?refresh=true')
      if (response.ok) {
        const data = await response.json()
        setEmailData(data)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Error refreshing email data:', error)
    } finally {
      setEmailLoading(false)
    }
  }

  const handleLogout = () => {
    // Clear admin session
    localStorage.removeItem('voxxy_admin_session')
    localStorage.removeItem('voxxy_admin_email')
    navigate('/admin/login')
  }

  // Filter submissions
  const filteredSubmissions = (emailData?.submissions || []).filter(submission => {
    const matchesSearch = searchQuery === '' ||
      submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (submission.organizationName && submission.organizationName.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = typeFilter === 'all' || submission.type === typeFilter

    return matchesSearch && matchesType
  }) || []

  const clearFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
  }

  const getSubmissionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'beta_request': 'Beta Request',
      'newsletter_signup': 'Product Updates',
      'general_contact': 'Email Click'
    }
    return labels[type] || type
  }

  const getSubmissionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'beta_request': 'bg-purple-100 text-purple-800',
      'newsletter_signup': 'bg-blue-100 text-blue-800',
      'general_contact': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getVenueTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'bar': 'Bar',
      'restaurant': 'Restaurant',
      'community_center': 'Community Center',
      'outdoor': 'Outdoor Space',
      'event_space': 'Event Space',
      'other': 'Other'
    }
    return labels[type] || type
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
                  <div className="text-2xl font-bold text-purple-600">{emailData?.stats?.beta_requests || 0}</div>
                  <p className="text-xs text-muted-foreground">Paid beta interest</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Product Updates</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{emailData?.stats?.newsletter_signups || 0}</div>
                  <p className="text-xs text-muted-foreground">Newsletter signups</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Button Clicks</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">{emailData?.stats?.general_contacts || 0}</div>
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
                    <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
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
                              <h4 className="font-semibold text-gray-900">{submission.name}</h4>
                              <Badge variant="outline" className={`text-xs ${getSubmissionTypeColor(submission.type)}`}>
                                {getSubmissionTypeLabel(submission.type)}
                              </Badge>
                              {submission.status && (
                                <Badge variant="outline" className="text-xs">
                                  {submission.status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">{submission.email}</p>
                            {submission.organizationName && (
                              <p className="text-purple-600 text-sm font-medium">
                                Club: {submission.organizationName}
                              </p>
                            )}
                            {submission.description && (
                              <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                                {submission.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs text-gray-500 space-y-1">
                            <div>Source: {submission.source}</div>
                            <div>{new Date(submission.submittedAt).toLocaleDateString()}</div>
                            {submission.emailThreadId && (
                              <div className="text-blue-600">Thread: {submission.emailThreadId}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                    <p className="text-gray-600">
                      {searchQuery || typeFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Email submissions will appear here as they come in'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Venue Management Tab */}
          <TabsContent value="venues" className="space-y-6">
            <VenuesManagement
              venues={venues}
              onVenueUpdate={(updatedVenue) => {
                setVenues(prev => prev.map(v => v.id === updatedVenue.id ? updatedVenue : v))
              }}
            />
          </TabsContent>

          {/* Club Management Tab */}
          <TabsContent value="clubs" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Club Management</h2>
                <p className="text-gray-600">Manage all clubs on the platform</p>
              </div>
            </div>

            {/* Debug Section for Club Validation */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  🔍 Club Debug Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-700">Database Query Status</div>
                    <div className="mt-1">
                      <div>Loading: {loading ? '⏳ Yes' : '✅ Complete'}</div>
                      <div>Organizations Found: {organizations.length}</div>
                      <div>Last Refresh: {lastRefresh.toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">Organization Details</div>
                    <div className="mt-1">
                      {organizations.map((org, index) => (
                        <div key={org.id} className="text-xs bg-white p-1 rounded mb-1">
                          {index + 1}. {org.name}
                          <div className="text-gray-500">ID: {org.id}</div>
                          <div className="text-gray-500">Status: {org.status || 'no status'}</div>
                          <div className="text-gray-500">Owner: {org.ownerId}</div>
                        </div>
                      ))}
                      {organizations.length === 0 && (
                        <div className="text-red-600 font-bold">⚠️ NO ORGANIZATIONS FOUND</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">Test Account Check</div>
                    <div className="mt-1 text-xs">
                      <div>Test Org Expected: "Test Events Co"</div>
                      <div>Expected Owner: starts with organizer test ID</div>
                      <div className="mt-2">
                        <Button
                          onClick={() => {
                            console.log('🔍 ADMIN DEBUG: Current organizations:', organizations)
                            console.log('🔍 ADMIN DEBUG: Organization details:', organizations.map(org => ({
                              id: org.id,
                              name: org.name,
                              ownerId: org.ownerId,
                              status: org.status
                            })))
                          }}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          Log Debug to Console
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading clubs...</p>
              </div>
            ) : organizations.length === 0 ? (
              /* No Organizations State */
              <Card className="max-w-2xl mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No clubs yet</h3>
                  <p className="text-gray-600 text-center mb-6 max-w-md">
                    Clubs will appear here as they sign up for the platform.
                  </p>
                </CardContent>
              </Card>
            ) : (
              /* Organizations Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org) => (
                  <Card key={org.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-0">
                      {/* Organization Image */}
                      {org.logoUrl ? (
                        <img
                          src={org.logoUrl}
                          alt={`${org.name} logo`}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg flex items-center justify-center">
                          <span className="text-white font-semibold">{org.name}</span>
                        </div>
                      )}

                      {/* Organization Info */}
                      <div className="p-6">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 -mt-8">
                            <Users className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">{org.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{org.description}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {'CLUB'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {'ACTIVE'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            0 members
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
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`/${org.slug}/admin`, '_blank')
                              }}
                              className="flex items-center gap-1"
                            >
                              <Settings className="h-3 w-3" />
                              Admin
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}