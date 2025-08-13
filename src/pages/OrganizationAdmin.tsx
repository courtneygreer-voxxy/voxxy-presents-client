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
  Mail
} from "lucide-react"
import { useOrganization } from "@/hooks/useOrganization"
import { OrganizationEditForm } from "@/components/OrganizationEditForm"
import EventCreateForm from "@/components/EventCreateForm"
import EventEditForm from "@/components/EventEditForm"
import EventRegistrationModal from "@/components/EventRegistrationModal"
import SubscribersList from "@/components/SubscribersList"
import { getCurrentEnvironment, isFeatureEnabled } from '@/config/environments'
import type { Organization, Event } from '@/types/database'

export default function OrganizationAdmin() {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const navigate = useNavigate()
  const { organization, events, loading, error, updateOrganization, refreshEvents } = useOrganization(orgSlug || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [registrationModalEvent, setRegistrationModalEvent] = useState<Event | null>(null)

  const currentEnv = getCurrentEnvironment()
  const adminEnabled = isFeatureEnabled('adminControls')

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

  if (!adminEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Disabled</h1>
          <p className="text-gray-600 mb-6">Admin controls are not available in the {currentEnv} environment.</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Organization Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested organization could not be found.'}</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/${orgSlug}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Public Page
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{organization.name} Admin</h1>
                <p className="text-gray-600 mt-1">Manage your organization and events</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {currentEnv}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/${orgSlug}`, '_blank')}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>

          {/* Save Status */}
          {saveMessage && (
            <div className={`mt-4 p-4 rounded-lg border ${
              saveMessage.includes('✅') 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">{saveMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="organization" className="flex gap-8" orientation="vertical">
          <div className="w-64 flex-shrink-0">
            <TabsList className="flex flex-col h-fit w-full">
              <TabsTrigger value="organization" className="flex items-center gap-2 w-full justify-start">
                <Settings className="h-4 w-4" />
                Organization
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2 w-full justify-start">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="subscribers" className="flex items-center gap-2 w-full justify-start">
                <Mail className="h-4 w-4" />
                Subscribers
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 w-full justify-start">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 min-w-0">

          {/* Organization Settings Tab */}
          <TabsContent value="organization">
            <Card>
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
                  onCancel={() => {}} // No cancel in full page mode
                  isFullPage={true}
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Events</h2>
                  <p className="text-gray-600">Manage your organization's events</p>
                </div>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setIsCreateEventOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </div>

              {events.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
                    <p className="text-gray-600 text-center mb-6">
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
                          {/* Main Event Info */}
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
                                <h4 className="text-xl font-semibold text-gray-900">{event.title}</h4>
                              </div>

                              <p className="text-gray-600 mb-3">{event.description}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 mb-3">
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
                              <div className="text-sm font-medium text-gray-900">Price: {event.price.description}</div>
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
                  Manage waitlists, email subscribers, and audience engagement.
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
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  View insights about your events and audience engagement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-16">
                  <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    Detailed analytics and insights about your events, registrations, and audience engagement will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Create Event Modal */}
      {isCreateEventOpen && organization && (
        <EventCreateForm
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
