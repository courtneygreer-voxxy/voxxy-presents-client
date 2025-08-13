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
import { getWaitlistByEvent } from '@/lib/database'
import { getDataSource } from '@/config/environments'
import type { Event, Waitlist } from '@/types/database'

interface SubscribersListProps {
  organizationId: string
  events: Event[]
}

export default function SubscribersList({ organizationId, events }: SubscribersListProps) {
  const [waitlists, setWaitlists] = useState<Record<string, Waitlist[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dataSource = getDataSource()

  useEffect(() => {
    const loadWaitlists = async () => {
      if (dataSource !== 'firebase') {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const waitlistData: Record<string, Waitlist[]> = {}

        // Load waitlists for all events
        for (const event of events) {
          if (event.status === 'sold_out') {
            const eventWaitlist = await getWaitlistByEvent(event.id)
            if (eventWaitlist.length > 0) {
              waitlistData[event.id] = eventWaitlist
            }
          }
        }

        setWaitlists(waitlistData)
      } catch (err) {
        console.error('Error loading waitlists:', err)
        setError('Failed to load waitlists')
      } finally {
        setLoading(false)
      }
    }

    loadWaitlists()
  }, [events, dataSource])

  // Calculate stats
  const totalWaitlistCount = Object.values(waitlists).reduce((total, list) => total + list.length, 0)
  const eventsWithWaitlists = Object.keys(waitlists).length

  if (dataSource !== 'firebase') {
    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Email Subscribers</p>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-gray-500">API Mode</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Waitlists</p>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-gray-500">API Mode</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Events with Interest</p>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-gray-500">API Mode</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">API Mode</h3>
            <p className="text-gray-600 text-center">
              Subscriber data is available through the API in staging/production environments.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
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
            <div className="text-center">Loading waitlists...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Mail className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Email Subscribers</p>
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Waitlists</p>
              <p className="text-2xl font-bold">{totalWaitlistCount}</p>
              <p className="text-xs text-gray-500">{eventsWithWaitlists} events</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Event Interests</p>
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waitlist Data */}
      {totalWaitlistCount > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Event Waitlists</CardTitle>
              <CardDescription>
                People waiting for sold-out events
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
            <div className="space-y-6">
              {Object.entries(waitlists).map(([eventId, waitlist]) => {
                const event = events.find(e => e.id === eventId)
                if (!event) return null

                return (
                  <div key={eventId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge className="bg-red-600 text-white text-xs">SOLD OUT</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {event.date instanceof Date ? event.date.toLocaleDateString() : new Date(event.date).toLocaleDateString()} • {waitlist.length} on waitlist
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Contact Waitlist
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {waitlist.slice(0, 5).map((person, index) => (
                        <div key={person.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">#{person.position}</Badge>
                            <div>
                              <p className="font-medium text-sm">{person.name}</p>
                              <p className="text-xs text-gray-600">{person.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {person.joinedAt.toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      
                      {waitlist.length > 5 && (
                        <div className="text-center py-2">
                          <Button variant="ghost" size="sm">
                            Show {waitlist.length - 5} more
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
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Waitlists Yet</h3>
            <p className="text-gray-600 text-center">
              When events are sold out and people join waitlists, they'll appear here.
            </p>
          </CardContent>
        </Card>
      )}

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