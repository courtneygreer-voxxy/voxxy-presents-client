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
  ExternalLink
} from "lucide-react"
import { useOrganization } from "@/hooks/useOrganization"
import { OrganizationEditForm } from "@/components/OrganizationEditForm"
import { getCurrentEnvironment, isFeatureEnabled } from '@/config/environments'
import type { Organization } from '@/types/database'

export default function OrganizationAdmin() {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const navigate = useNavigate()
  const { organization, events, loading, error, updateOrganization } = useOrganization(orgSlug || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

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
        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Registrations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

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
                <Button className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
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
                    <Button>Create Your First Event</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                              <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                                {event.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{event.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                {event.date instanceof Date 
                                  ? event.date.toLocaleDateString() 
                                  : new Date(event.date).toLocaleDateString()
                                } • {event.time}
                              </span>
                              <span>{event.location}</span>
                              <span>{event.price.description}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations">
            <Card>
              <CardHeader>
                <CardTitle>Registrations</CardTitle>
                <CardDescription>
                  View and manage event registrations and attendee information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration Management</h3>
                  <p className="text-gray-600 text-center">
                    Registration management features will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Track your organization's performance and audience engagement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600 text-center">
                    Analytics and insights will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}