import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Calendar,
  Mail,
  Phone,
  Loader2,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Eye,
  MapPin,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { registrationsApi } from "@/services/api"

interface RegistrationData {
  id: string
  name: string
  email?: string
  phone?: string
  registrationType: 'rsvp_yes' | 'rsvp_maybe'
  registeredAt: Date
  notes?: string
  subscribeToUpdates?: boolean
  subscribeToNewsletter?: boolean
}

interface RSVPData {
  event: {
    id: string
    title: string
    date: Date
  }
  registrations: {
    rsvp_yes: RegistrationData[]
    rsvp_maybe: RegistrationData[]
    total: number
  }
}

export default function SharedRSVPPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [rsvpData, setRsvpData] = useState<RSVPData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadRSVPs = async () => {
    if (!eventId) return

    setLoading(true)
    setError(null)
    try {
      const data = await registrationsApi.getByEvent(eventId)
      setRsvpData(data)
      setLastUpdated(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load RSVPs'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRSVPs()

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRSVPs, 30000)
    return () => clearInterval(interval)
  }, [eventId])

  const renderRSVPList = (rsvps: RegistrationData[], title: string, icon: React.ReactNode, bgColor: string) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h4 className="text-lg font-semibold text-white">{title} ({rsvps.length})</h4>
      </div>
      {rsvps.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No {title.toLowerCase()} yet</p>
      ) : (
        <div className="space-y-2">
          {rsvps.map((rsvp) => (
            <Card key={rsvp.id} className={`${bgColor} border-white/10`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{rsvp.name}</span>
                      {rsvp.subscribeToNewsletter && (
                        <Badge variant="outline" className="text-xs">
                          Newsletter
                        </Badge>
                      )}
                    </div>
                    {rsvp.email && (
                      <div className="flex items-center gap-1 text-sm text-gray-300 mb-1">
                        <Mail className="h-3 w-3" />
                        {rsvp.email}
                      </div>
                    )}
                    {rsvp.phone && (
                      <div className="flex items-center gap-1 text-sm text-gray-300 mb-1">
                        <Phone className="h-3 w-3" />
                        {rsvp.phone}
                      </div>
                    )}
                    {rsvp.notes && (
                      <p className="text-sm text-gray-400 mt-2 italic">"{rsvp.notes}"</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(rsvp.registeredAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  if (loading && !rsvpData) {
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

        <div className="container mx-auto px-4 max-w-4xl relative z-10 pt-12">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="ml-2 text-gray-300">Loading RSVPs...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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

        <div className="container mx-auto px-4 max-w-4xl relative z-10 pt-12">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Unable to Load RSVPs</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <Button
              onClick={loadRSVPs}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!rsvpData) return null

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

      <div className="container mx-auto px-4 max-w-4xl relative z-10 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Eye className="h-6 w-6 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Event RSVPs</h1>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">{rsvpData.event.title}</h2>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <Calendar className="h-4 w-4" />
              <span>{new Date(rsvpData.event.date).toLocaleDateString()} • {new Date(rsvpData.event.date).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-green-500/20 border-green-400/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-300">
                {rsvpData.registrations.rsvp_yes.length}
              </div>
              <div className="text-sm text-green-400">Going</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/20 border-yellow-400/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-300">
                {rsvpData.registrations.rsvp_maybe.length}
              </div>
              <div className="text-sm text-yellow-400">Maybe</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/20 border-purple-400/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-300">
                {rsvpData.registrations.total}
              </div>
              <div className="text-sm text-purple-400">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Auto-refresh indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 rounded-full px-4 py-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span>
              {loading ? 'Updating...' : `Last updated: ${lastUpdated?.toLocaleTimeString()}`}
            </span>
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </div>
        </div>

        {/* RSVP Lists */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
          <div className="p-6">
            <Tabs defaultValue="going" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="going" className="data-[state=active]:bg-green-500/30">
                  Going ({rsvpData.registrations.rsvp_yes.length})
                </TabsTrigger>
                <TabsTrigger value="maybe" className="data-[state=active]:bg-yellow-500/30">
                  Maybe ({rsvpData.registrations.rsvp_maybe.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="going" className="mt-6">
                {renderRSVPList(
                  rsvpData.registrations.rsvp_yes,
                  "Confirmed Attendees",
                  <CheckCircle className="h-5 w-5 text-green-400" />,
                  "bg-green-500/10"
                )}
              </TabsContent>

              <TabsContent value="maybe" className="mt-6">
                {renderRSVPList(
                  rsvpData.registrations.rsvp_maybe,
                  "Maybe Attendees",
                  <HelpCircle className="h-5 w-5 text-yellow-400" />,
                  "bg-yellow-500/10"
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            This view updates automatically every 30 seconds • Powered by{' '}
            <span className="text-purple-400 font-medium">Voxxy Presents</span>
          </p>
        </div>
      </div>
    </div>
  )
}