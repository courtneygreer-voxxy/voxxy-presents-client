import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Mail, 
  Users, 
  Clock, 
  Calendar,
  Download,
  Filter
} from "lucide-react"
import { getWaitlistByEvent, getRegistrationsByEvent } from '@/lib/database'
import { registrationsApi } from '@/services/api'
import { getDataSource } from '@/config/environments'
import type { Event, Waitlist, Registration } from '@/types/database'

interface SubscribersListProps {
  organizationId: string
  events: Event[]
}

export default function SubscribersList({ organizationId, events }: SubscribersListProps) {
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([])
  const [requestUpdates, setRequestUpdates] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dataSource = getDataSource()

  useEffect(() => {
    const loadSubscriberData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const allNewsletterSubscribers: any[] = []
        const allRequestUpdates: Record<string, any[]> = {}
        
        // Load registrations for all events to find newsletter subscribers and update requests
        for (const event of events) {
          try {
            let registrations: Registration[] = []
            
            if (dataSource === 'firebase') {
              // Firebase mode (development/sandbox)
              registrations = await getRegistrationsByEvent(event.id)
            } else {
              // API mode (staging/production) - using registrationsApi
              try {
                registrations = await registrationsApi.getByEvent(event.id)
              } catch (apiErr) {
                console.warn(`API call failed for event ${event.id}, trying Firebase as fallback:`, apiErr)
                registrations = await getRegistrationsByEvent(event.id)
              }
            }
            
            // Find newsletter subscribers
            const newsletterSubs = registrations.filter(reg => reg.subscribeToNewsletter)
            allNewsletterSubscribers.push(...newsletterSubs.map(reg => ({
              id: reg.id,
              name: reg.name,
              email: reg.email,
              eventId: event.id,
              eventTitle: event.title,
              subscribedAt: reg.registeredAt
            })))
            
            // Find event update requests
            const updateRequests = registrations.filter(reg => reg.subscribeToUpdates)
            if (updateRequests.length > 0) {
              allRequestUpdates[event.id] = updateRequests.map(reg => ({
                id: reg.id,
                name: reg.name,
                email: reg.email,
                subscribedAt: reg.registeredAt
              }))
            }
          } catch (eventErr) {
            console.warn(`Failed to load registrations for event ${event.id}:`, eventErr)
          }
        }
        
        // Remove duplicates from newsletter subscribers based on email
        const uniqueNewsletterSubscribers = allNewsletterSubscribers.filter((sub, index, self) => 
          index === self.findIndex(s => s.email === sub.email)
        )
        
        setNewsletterSubscribers(uniqueNewsletterSubscribers)
        setRequestUpdates(allRequestUpdates)

      } catch (err) {
        console.error('Error loading subscriber data:', err)
        setError('Failed to load subscriber data')
      } finally {
        setLoading(false)
      }
    }

    if (events.length > 0) {
      loadSubscriberData()
    } else {
      setLoading(false)
    }
  }, [events, dataSource])

  // Calculate stats
  const totalNewsletterSubscribers = newsletterSubscribers.length
  const totalRequestUpdates = Object.values(requestUpdates).reduce((total, list) => total + list.length, 0)


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">Loading subscriber data...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Mail className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Club Subscribers</p>
              <p className="text-2xl font-bold">{totalNewsletterSubscribers}</p>
              <p className="text-xs text-gray-500">Overall organization</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Event Update Requests</p>
              <p className="text-2xl font-bold">{totalRequestUpdates}</p>
              <p className="text-xs text-gray-500">Across all events</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Newsletter Subscribers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Club Subscribers</CardTitle>
            <CardDescription>
              People subscribed to your clubs's updates
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {totalNewsletterSubscribers > 0 ? (
            <div className="space-y-4">
              {newsletterSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-sm">{subscriber.name || 'No name'}</p>
                      <p className="text-xs text-gray-600">{subscriber.email}</p>
                      <p className="text-xs text-gray-500">From: {subscriber.eventTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Club Subscribers Yet</h3>
              <p className="text-gray-600 text-center">
                When people subscribe to get alerts about your events, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Update Requests */}
      {Object.keys(requestUpdates).length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Update Requests</CardTitle>
            <CardDescription>
              People who want updates about specific events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(requestUpdates).map(([eventId, requests]) => {
                const event = events.find(e => e.id === eventId)
                if (!event) return null

                return (
                  <div key={eventId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {event.date instanceof Date ? event.date.toLocaleDateString() : new Date(event.date).toLocaleDateString()} • {requests.length} requesting updates
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Contact Subscribers
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {requests.slice(0, 5).map((person) => (
                        <div key={person.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium text-sm">{person.name || 'No name'}</p>
                              <p className="text-xs text-gray-600">{person.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(person.subscribedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      
                      {requests.length > 5 && (
                        <div className="text-center py-2">
                          <Button variant="ghost" size="sm">
                            Show {requests.length - 5} more
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error && (
        <Card>
          <CardContent className="py-4">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}