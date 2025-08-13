import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Users, Calendar, Settings } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { 
  createOrganization, 
  createEvent, 
  getEventsByOrganization,
  getOrganizationBySlug 
} from '@/lib/database'
import type { Organization, Event } from '@/types/database'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])


  // Test Voxxy Presents NYC organization
  const testVoxxyPresentsNYC = async () => {
    setLoading(true)
    try {
      const org = await getOrganizationBySlug("voxxy-presents-nyc")
      if (org) {
        setTestResults(prev => [...prev, `✅ Voxxy Presents NYC found: ${org.name}`])
        
        // Get events for this organization
        const eventsList = await getEventsByOrganization(org.id)
        setEvents(eventsList)
        setTestResults(prev => [...prev, `✅ Found ${eventsList.length} events for Voxxy Presents NYC`])
      } else {
        setTestResults(prev => [...prev, `❌ Voxxy Presents NYC not found - run seed script first`])
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error testing Voxxy Presents NYC: ${error}`])
    }
    setLoading(false)
  }

  // Test organization creation
  const testCreateOrganization = async () => {
    setLoading(true)
    try {
      const orgId = await createOrganization({
        name: "Brooklyn Hearts Club",
        slug: "brooklyn-hearts-club",
        description: "An art club for adults that welcomes everyone",
        background: "We aim to bring back whimsy and joy to the process of creating art in a shame-free, judgment-free zone where we can creatively express ourselves.",
        contactEmail: "info@brooklynheartsclub.com",
        socialLinks: {
          instagram: "@brooklynheartsclub",
          eventbrite: "https://eventbrite.com/brooklyn-hearts-club"
        },
        settings: {
          defaultLocation: "Crystal Lake",
          defaultAddress: "647 Grand Street, Brooklyn, NY 11211",
          theme: {
            primaryColor: "#7c3aed",
            backgroundColor: "#ffffff"
          }
        },
        ownerId: user?.uid || "test-user"
      })
      
      setTestResults(prev => [...prev, `✅ Organization created with ID: ${orgId}`])
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error creating organization: ${error}`])
    }
    setLoading(false)
  }

  // Test organization retrieval
  const testGetOrganization = async () => {
    setLoading(true)
    try {
      const org = await getOrganizationBySlug("brooklyn-hearts-club")
      if (org) {
        setTestResults(prev => [...prev, `✅ Organization found: ${org.name}`])
        return org
      } else {
        setTestResults(prev => [...prev, `❌ Organization not found`])
        return null
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error retrieving organization: ${error}`])
      return null
    } finally {
      setLoading(false)
    }
  }

  // Test event creation
  const testCreateEvent = async () => {
    setLoading(true)
    try {
      // First get the organization
      const org = await getOrganizationBySlug("brooklyn-hearts-club")
      if (!org) {
        setTestResults(prev => [...prev, `❌ Need to create organization first`])
        setLoading(false)
        return
      }

      const eventId = await createEvent({
        organizationId: org.id,
        title: "Sunday Stitch & B!tch",
        description: "A casual meet up with no strings attached - apart from those you stitch ;)",
        fullDescription: "Bring your own supplies: yarn, needles, embroidery supplies, etc. Chat up fellow enthusiasts while you work on your latest project.",
        date: new Date("2024-08-03T14:00:00"),
        time: "2:00 PM - 4:00 PM",
        location: "Crystal Lake",
        address: "647 Grand Street, Brooklyn, NY 11211",
        price: {
          type: "free",
          description: "Free"
        },
        registrationRequired: false,
        presaleEnabled: false,
        isRecurring: false,
        status: "published"
      })
      
      setTestResults(prev => [...prev, `✅ Event created with ID: ${eventId}`])
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error creating event: ${error}`])
    }
    setLoading(false)
  }

  // Test events retrieval
  const testGetEvents = async () => {
    setLoading(true)
    try {
      const org = await getOrganizationBySlug("brooklyn-hearts-club")
      if (!org) {
        setTestResults(prev => [...prev, `❌ Need to create organization first`])
        setLoading(false)
        return
      }

      const eventsList = await getEventsByOrganization(org.id)
      setEvents(eventsList)
      setTestResults(prev => [...prev, `✅ Found ${eventsList.length} events`])
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error retrieving events: ${error}`])
    }
    setLoading(false)
  }

  const clearTestResults = () => {
    setTestResults([])
    setEvents([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your events and organizations</p>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {user.email}
                </Badge>
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Database Testing Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Testing
              </CardTitle>
              <CardDescription>
                Test Firebase Firestore connection and basic operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={testVoxxyPresentsNYC} 
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  Test Voxxy NYC
                </Button>
                <Button 
                  onClick={testCreateOrganization} 
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  Create Org
                </Button>
                <Button 
                  onClick={testGetOrganization} 
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  Get Org
                </Button>
                <Button 
                  onClick={testCreateEvent} 
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  Create Event
                </Button>
                <Button 
                  onClick={testGetEvents} 
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  Get Events
                </Button>
              </div>
              
              <Button 
                onClick={clearTestResults} 
                variant="secondary" 
                size="sm"
                className="w-full"
              >
                Clear Results
              </Button>

              {/* Test Results */}
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
                {testResults.length === 0 ? (
                  <div className="text-gray-500">Ready to test database operations...</div>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Events
              </CardTitle>
              <CardDescription>
                Events retrieved from database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No events found. Click "Get Events" to load them.
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{event.date.toLocaleDateString()}</span>
                            <span>{event.time}</span>
                          </div>
                        </div>
                        <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
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
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Database Status</p>
                  <p className="text-2xl font-bold text-green-600">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Auth Status</p>
                  <p className="text-2xl font-bold text-green-600">
                    {user ? 'Signed In' : 'Anonymous'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}