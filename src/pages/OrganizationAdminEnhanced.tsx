import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Settings, 
  Calendar, 
  Users, 
  BarChart3,
  Eye,
  Loader,
  Edit,
  Plus,
  MapPin,
  Mail,
  User,
  Link2,
  Download,
  Ticket
} from "lucide-react"
import { useOrganization } from "@/hooks/useOrganization"
import { useAuth } from "@/hooks/useAuth"
import { OrganizationEditForm } from "@/components/OrganizationEditForm"
import { OrganizationDangerZone } from "@/components/OrganizationDangerZone"
import { ShareButton } from "@/components/ShareButton"
import AboutImagesManager from "@/components/AboutImagesManager"
import EventCreateFlow from "@/components/EventCreateFlow"
import EventEditForm from "@/components/EventEditForm"
import EventRegistrationModal from "@/components/EventRegistrationModal"
import SubscribersList from "@/components/SubscribersList"
import { PlatformConnectionManager } from "@/components/platform/PlatformConnectionManager"
import { EventImportInterface } from "@/components/platform/EventImportInterface"
import { TicketManagementCenter } from "@/components/platform/TicketManagementCenter"
import { ClubEventSyncManager } from "@/components/ClubEventSyncManager"
import { TicketManagementManager } from "@/components/TicketManagementManager"
import { PreviewBadge } from '@/components/ui/preview-badge'
import { isFeatureEnabled } from '@/config/environments'
import { getUserPlatformConnections } from '@/services/platformIntegrationService'
import type { Organization, Event } from '@/types/database'
import type { PlatformConnection, PlatformType } from '@/types/platformIntegration'

export default function OrganizationAdminEnhanced() {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { organization, events, loading, error, updateOrganization, deleteOrganization, refreshEvents } = useOrganization(orgSlug || '')
  
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  
  // Feature flags for platform integration
  const isPreviewMode = isFeatureEnabled('platformIntegrationPreview')
  const isBetaMode = isFeatureEnabled('platformIntegrationBeta')
  const previewMode = isBetaMode ? 'beta' : 'preview'
  const isComingSoonMode = !isPreviewMode && !isBetaMode
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [registrationModalEvent, setRegistrationModalEvent] = useState<Event | null>(null)
  
  // Platform integration state
  const [platformConnections, setPlatformConnections] = useState<PlatformConnection[]>([])
  const [connectionsLoading, setConnectionsLoading] = useState(true)

  const adminEnabled = isFeatureEnabled('adminControls')

  // Load platform connections
  React.useEffect(() => {
    if (currentUser && organization) {
      loadPlatformConnections()
    }
  }, [currentUser, organization])

  const loadPlatformConnections = async () => {
    if (!currentUser) return
    
    try {
      const connections = await getUserPlatformConnections(currentUser.uid)
      // Filter connections for this organization or user-level connections
      const orgConnections = connections.filter(conn => 
        !conn.organizationId || conn.organizationId === organization?.id
      )
      setPlatformConnections(orgConnections)
    } catch (error) {
      console.error('Failed to load platform connections:', error)
    } finally {
      setConnectionsLoading(false)
    }
  }

  const handleSaveOrganization = async (updates: Partial<Organization>) => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      await updateOrganization(updates)
      setSaveMessage('✅ Organization updated successfully! Changes are now live.')
      setTimeout(() => setSaveMessage(null), 4000)
    } catch (error) {
      console.error('Failed to save organization:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSaveMessage(`❌ Failed to save changes: ${errorMessage}. Please try again.`)
      setTimeout(() => setSaveMessage(null), 7000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEventCreated = (event: any) => {
    setSaveMessage('✅ Event created successfully!')
    setTimeout(() => setSaveMessage(null), 4000)
    refreshEvents()
  }

  const handleEventUpdated = (event: any) => {
    setSaveMessage('✅ Event updated successfully!')
    setTimeout(() => setSaveMessage(null), 4000)
    refreshEvents()
    setEditingEvent(null)
  }

  const handleEventDeleted = (eventId: string) => {
    setSaveMessage('✅ Event deleted successfully!')
    setTimeout(() => setSaveMessage(null), 4000)
    refreshEvents()
    setEditingEvent(null)
  }

  const openRegistrationModal = (event: Event) => {
    setRegistrationModalEvent(event)
  }

  const handleDeleteOrganization = async () => {
    setIsDeleting(true)
    setSaveMessage(null)

    try {
      await deleteOrganization()
      setSaveMessage('✅ Organization deleted successfully!')
      
      setTimeout(() => {
        navigate('/')
      }, 2000)
      
    } catch (error) {
      console.error('Failed to delete organization:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSaveMessage(`❌ Failed to delete organization: ${errorMessage}. Please try again.`)
      setTimeout(() => setSaveMessage(null), 7000)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!adminEnabled) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      <div className="relative z-10">
        <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access Disabled</h1>
          <p className="text-gray-300 mb-6">Admin controls are not available in this environment.</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      <div className="relative z-10">
        <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Loading admin panel...</p>
        </div>
      </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      <div className="relative z-10">
        <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Organization Not Found</h1>
          <p className="text-gray-300 mb-6">{error || 'The requested organization could not be found.'}</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
      </div>
    )
  }

  const connectedPlatforms = platformConnections
    .filter(conn => conn.status === 'connected')
    .map(conn => conn.platform)
    
  const connectionCount = platformConnections.filter(conn => conn.status === 'connected').length

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{organization.name} Admin</h1>
              <p className="text-gray-300 mt-1">
                Manage your organization and events
                {connectionCount > 0 && (
                  <span className="text-blue-400">
                    {' '}• {connectionCount} platform{connectionCount !== 1 ? 's' : ''} connected
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <ShareButton
                url={`${window.location.origin}/${orgSlug}`}
                title={organization.name}
                description={organization.description}
                variant="outline"
                size="sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/${orgSlug}`)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Public Page
              </Button>
            </div>
          </div>

          {/* Save Status */}
          {saveMessage && (
            <div className={`mt-4 p-4 rounded-lg border backdrop-blur-sm ${
              saveMessage.includes('✅') 
                ? 'bg-green-500/20 border-green-400/30 text-green-200' 
                : 'bg-red-500/20 border-red-400/30 text-red-200'
            }`}>
              <p className="text-sm font-medium">{saveMessage}</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-4 gap-4 px-4 py-8">
        <div></div>
        <div className="col-span-2">
        <Tabs defaultValue="organization" className="flex gap-8" orientation="vertical">
          <div className="w-64 flex-shrink-0">
            <TabsList className="flex flex-col h-fit w-full">
              <TabsTrigger value="organization" className="flex items-center gap-2 w-full justify-start">
                <Edit className="h-4 w-4" />
                Organization
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2 w-full justify-start">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="subscribers" className="flex items-center gap-2 w-full justify-start">
                <Users className="h-4 w-4" />
                Subscribers
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 w-full justify-start">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 min-w-0">

            {/* Organization Settings Tab */}
            <TabsContent value="organization">
              <div className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 mx-8">
                  <CardHeader>
                    <CardTitle>Organization Settings</CardTitle>
                    <CardDescription>
                      Update your organization's information, branding, and contact details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OrganizationEditForm
                      organization={organization}
                      onSave={handleSaveOrganization}
                      onCancel={() => {}}
                      isFullPage={true}
                      isSaving={isSaving}
                    />
                  </CardContent>
                </Card>

                <AboutImagesManager
                  organization={organization}
                  onSave={handleSaveOrganization}
                  isSaving={isSaving}
                />

              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Events</h2>
                    <p className="text-gray-300">Create, import, and manage your organization's events</p>
                  </div>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setIsCreateEventOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Button>
                </div>

                {/* Event Sync Section */}
                <ClubEventSyncManager 
                  organization={organization}
                  onEventsImported={(events) => {
                    setSaveMessage('✅ Events synced successfully!')
                    setTimeout(() => setSaveMessage(null), 4000)
                    refreshEvents()
                  }}
                />

                {/* Ticket Management Section */}
                <TicketManagementManager />

                {events.length === 0 ? (
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 mx-8">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No events yet</h3>
                      <p className="text-gray-300 text-center mb-6">
                        Create your first event to start building your community.
                      </p>
                      <Button onClick={() => setIsCreateEventOpen(true)}>
                        Create Your First Event
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Card key={event.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                              <div className="flex-1 mb-4 md:mb-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge variant={
                                    event.status === 'published' ? 'default' :
                                    event.status === 'presale' ? 'secondary' :
                                    event.status === 'sold_out' ? 'destructive' :
                                    event.status === 'cancelled' ? 'destructive' :
                                    event.status === 'completed' ? 'outline' :
                                    'secondary'
                                  }>
                                    {event.status === 'presale' ? 'PreSale' :
                                     event.status === 'sold_out' ? 'Sold Out' :
                                     event.status === 'cancelled' ? 'Canceled' :
                                     event.status === 'completed' ? 'Complete' :
                                     event.status === 'published' ? 'Published' :
                                     event.status === 'draft' ? 'Draft' :
                                     event.status}
                                  </Badge>
                                  <h4 className="text-xl font-semibold text-white">{event.title}</h4>
                                </div>

                                <p className="text-gray-300 mb-3">{event.description}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-300 mb-3">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {event.date instanceof Date 
                                      ? event.date.toLocaleDateString() 
                                      : new Date(event.date).toLocaleDateString()
                                    } • {event.time}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {event.location}
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-white">Price: {event.price.description}</div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 md:ml-6">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditingEvent(event)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openRegistrationModal(event)}
                                >
                                  <Users className="h-4 w-4 mr-2" />
                                  Manage
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>


            {/* Subscribers Tab */}
            <TabsContent value="subscribers">
              <Card>
                <CardHeader>
                  <CardTitle>Subscriber Management</CardTitle>
                  <CardDescription>
                    Manage club subscribers and event update requests.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {organization && (
                    <SubscribersList 
                      organizationId={organization.id}
                      events={events}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="space-y-6">
                {/* Platform Connections */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 mx-8">
                  <CardHeader>
                    <CardTitle>Platform Connections</CardTitle>
                    <CardDescription>
                      Connect your event platforms to sync events, attendees, and data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PlatformConnectionManager
                      organizationId={organization.id}
                      showAddConnection={true}
                      compact={false}
                    />
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <OrganizationDangerZone
                  organization={organization}
                  onDelete={handleDeleteOrganization}
                  isDeleting={isDeleting}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
        </div>
        <div></div>
      </div>

      {/* Create Event Flow */}
      {isCreateEventOpen && organization && (
        <EventCreateFlow
          organization={organization}
          isOpen={isCreateEventOpen}
          onClose={() => setIsCreateEventOpen(false)}
          onSuccess={handleEventCreated}
        />
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <EventEditForm
          event={editingEvent}
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={handleEventUpdated}
          onDelete={handleEventDeleted}
        />
      )}

      {registrationModalEvent && (
        <EventRegistrationModal
          event={registrationModalEvent}
          isOpen={!!registrationModalEvent}
          onClose={() => setRegistrationModalEvent(null)}
        />
      )}
    </div>
  )
}