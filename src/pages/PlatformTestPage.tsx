import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlatformConnectionManager } from "@/components/platform/PlatformConnectionManager"
import { EventImportInterface } from "@/components/platform/EventImportInterface"
import { TicketManagementCenter } from "@/components/platform/TicketManagementCenter"
import { PlatformConnectionStep } from "@/components/platform/PlatformConnectionStep"
import type { PlatformType, PlatformConnection } from '@/types/platformIntegration'
import { getAllMockConnections } from '@/services/mockPlatformData'

export default function PlatformTestPage() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<PlatformType[]>([])
  const [connections, setConnections] = useState<PlatformConnection[]>([])

  // Mock organization for testing
  const mockOrgId = 'test-org-123'

  const handleConnect = async (platform: PlatformType) => {
    console.log(`Connecting to ${platform}...`)
    
    // Update connected platforms immediately since popup handles the delay
    setConnectedPlatforms(prev => [...prev, platform])
    // Load mock connections
    setConnections(getAllMockConnections())
    console.log(`Connected to ${platform}!`)
  }

  const handleSkip = () => {
    console.log('Skipped platform connection')
  }

  const handleContinue = () => {
    console.log('Continuing with connected platforms')
  }

  const handleCancel = () => {
    console.log('Going back to dashboard')
    // In a real app, this would navigate back to the user dashboard
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Platform Integration Testing
          </h1>
          <p className="text-gray-600">
            Test all platform integration features without authentication
          </p>
        </div>

        <Tabs defaultValue="connection-step" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="connection-step">Connection Step</TabsTrigger>
            <TabsTrigger value="manager">Connection Manager</TabsTrigger>
            <TabsTrigger value="import">Event Import</TabsTrigger>
            <TabsTrigger value="tickets">Ticket Center</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          {/* Platform Connection Step (from Create Club flow) */}
          <TabsContent value="connection-step">
            <Card>
              <CardHeader>
                <CardTitle>Platform Connection Step</CardTitle>
                <p className="text-gray-600">This is the first step in the enhanced Create Club flow</p>
              </CardHeader>
              <CardContent>
                <PlatformConnectionStep
                  onConnect={handleConnect}
                  onSkip={handleSkip}
                  onContinue={handleContinue}
                  onCancel={handleCancel}
                  connectedPlatforms={connectedPlatforms}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platform Connection Manager */}
          <TabsContent value="manager">
            <Card>
              <CardHeader>
                <CardTitle>Platform Connection Manager</CardTitle>
                <p className="text-gray-600">Manage connections to Eventbrite, Luma, and Meetup</p>
              </CardHeader>
              <CardContent>
                <PlatformConnectionManager 
                  organizationId={mockOrgId}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Import Interface */}
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Event Import Interface</CardTitle>
                <p className="text-gray-600">Import events from connected platforms</p>
              </CardHeader>
              <CardContent>
                {connections.length > 0 ? (
                  <EventImportInterface 
                    connections={connections.filter(conn => conn.status === 'connected')}
                    organizationId={mockOrgId}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Connect to platforms first to see event import interface
                    </p>
                    <Button onClick={() => setConnections(getAllMockConnections())}>
                      Load Mock Connections
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ticket Management Center */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Management Command Center</CardTitle>
                <p className="text-gray-600">Cross-platform ticket sales analytics</p>
              </CardHeader>
              <CardContent>
                <TicketManagementCenter 
                  organizationId={mockOrgId}
                  connectedPlatforms={connectedPlatforms.length > 0 ? connectedPlatforms : ['eventbrite']}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🎉 Platform Integration Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">✅ Implemented Features:</h3>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Platform connection management (OAuth-style)</li>
                        <li>• Event import with batch selection</li>
                        <li>• Cross-platform ticket analytics</li>
                        <li>• Enhanced Create Club flow</li>
                        <li>• Connection status indicators</li>
                        <li>• Auto-sync settings</li>
                        <li>• Mock data for development</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold">🔧 How to Test:</h3>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>1. Try the "Connection Step" tab</li>
                        <li>2. Click "Connect Eventbrite" to see mock flow</li>
                        <li>3. Test the "Connection Manager" tab</li>
                        <li>4. Load mock connections for "Event Import"</li>
                        <li>5. Check "Ticket Center" for analytics</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">🚀 Production Ready</h3>
                  <p className="text-blue-700 text-sm">
                    This system is architected to seamlessly connect to real APIs when you're ready. 
                    Simply update the environment variables and the mock data switches to live API calls.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}