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
import { subscriptionService } from '@/services/subscriptionService'
import type { Event } from '@/types/database'

interface SubscribersListProps {
  organizationId: string
  events: Event[]
}

export default function SubscribersList({ organizationId, events }: SubscribersListProps) {
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSubscribers() {
      setLoading(true)
      setError(null)
      try {
        const subscribers = await subscriptionService.getOrganizationSubscribers(organizationId)
        setNewsletterSubscribers(subscribers)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscribers')
        setNewsletterSubscribers([])
      } finally {
        setLoading(false)
      }
    }

    loadSubscribers()
  }, [organizationId])

  // Calculate stats
  const totalNewsletterSubscribers = newsletterSubscribers.length


  if (loading) {
    return (
      <div className="admin-dark space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="!bg-white/10 backdrop-blur-sm !border-white/20">
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
        <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
          <CardContent className="py-12">
            <div className="text-center">Loading subscriber data...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="admin-dark space-y-6">
      {/* Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
          <CardContent className="flex items-center gap-3 p-4">
            <Mail className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">Club Subscribers</p>
              <p className="text-2xl font-bold text-white">{totalNewsletterSubscribers}</p>
              <p className="text-xs text-gray-400">Overall organization</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
          <CardContent className="flex items-center justify-center p-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full">
              <span className="mr-2">📡</span>
              Send a Pulse
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Club Subscribers */}
      <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Club Subscribers</CardTitle>
            <CardDescription>
              People subscribed to your clubs's updates
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2 text-purple-400" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2 text-purple-400" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {totalNewsletterSubscribers > 0 ? (
            <div className="space-y-4">
              {newsletterSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded border border-white/10">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-sm text-white">{subscriber.name || 'No name'}</p>
                      <p className="text-xs text-gray-300">{subscriber.email}</p>
                      <p className="text-xs text-gray-400">From: {subscriber.eventTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="h-3 w-3 text-purple-400" />
                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Club Subscribers Yet</h3>
              <p className="text-gray-300 text-center">
                When people subscribe to get alerts about your events, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>


      {error && (
        <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
          <CardContent className="py-4">
            <p className="text-red-400">Error: {error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}