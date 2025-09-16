import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Calendar,
  Mail,
  Phone,
  Download,
  Loader2,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { registrationsApi } from "@/services/api"
import type { Event } from '@/types/database'

interface RSVPListModalProps {
  event: Event
  trigger?: React.ReactNode
}

interface RegistrationData {
  id: string
  name: string
  email?: string
  phone?: string
  registrationType: 'rsvp_yes' | 'rsvp_maybe' | 'presale_request'
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
    presale_requests: RegistrationData[]
    total: number
  }
}

export function RSVPListModal({ event, trigger }: RSVPListModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rsvpData, setRsvpData] = useState<RSVPData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadRSVPs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await registrationsApi.getByEvent(event.id)
      setRsvpData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load RSVPs'
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      loadRSVPs()
    }
  }

  const exportRSVPs = () => {
    if (!rsvpData) return

    const allRSVPs = [
      ...rsvpData.registrations.rsvp_yes.map(r => ({...r, type: 'Yes'})),
      ...rsvpData.registrations.rsvp_maybe.map(r => ({...r, type: 'Maybe'})),
      ...rsvpData.registrations.presale_requests.map(r => ({...r, type: 'Presale'}))
    ]

    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'RSVP Type', 'Registered At', 'Subscribe to Updates', 'Subscribe to Newsletter', 'Notes']
    const csvContent = [
      headers.join(','),
      ...allRSVPs.map(rsvp => [
        `"${rsvp.name}"`,
        `"${rsvp.email || ''}"`,
        `"${rsvp.phone || ''}"`,
        `"${rsvp.type}"`,
        `"${new Date(rsvp.registeredAt).toLocaleString()}"`,
        `"${rsvp.subscribeToUpdates ? 'Yes' : 'No'}"`,
        `"${rsvp.subscribeToNewsletter ? 'Yes' : 'No'}"`,
        `"${rsvp.notes || ''}"`
      ].join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_rsvps.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "RSVPs Exported",
      description: "RSVP data has been downloaded as a CSV file."
    })
  }

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="border-green-400/50 text-green-300 hover:bg-green-500/20"
    >
      <Users className="h-4 w-4 mr-2" />
      Check RSVPs
    </Button>
  )

  const renderRSVPList = (rsvps: RegistrationData[], title: string, icon: React.ReactNode) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h4 className="text-lg font-semibold text-white">{title} ({rsvps.length})</h4>
      </div>
      {rsvps.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No {title.toLowerCase()} yet</p>
      ) : (
        <div className="space-y-2">
          {rsvps.map((rsvp) => (
            <Card key={rsvp.id} className="bg-white/5 border-white/10">
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-white/15 backdrop-blur-md border-white/30 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center text-white flex items-center justify-center gap-2">
            <Users className="h-6 w-6 text-purple-400" />
            RSVPs for {event.title}
          </DialogTitle>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="ml-2 text-gray-300">Loading RSVPs...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{error}</p>
            <Button
              onClick={loadRSVPs}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Try Again
            </Button>
          </div>
        ) : rsvpData ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-green-500/20 border-green-400/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-300">
                    {rsvpData.registrations.rsvp_yes.length}
                  </div>
                  <div className="text-sm text-green-400">Going</div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-500/20 border-yellow-400/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-300">
                    {rsvpData.registrations.rsvp_maybe.length}
                  </div>
                  <div className="text-sm text-yellow-400">Maybe</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/20 border-blue-400/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-300">
                    {rsvpData.registrations.presale_requests.length}
                  </div>
                  <div className="text-sm text-blue-400">Presale</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-500/20 border-purple-400/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-300">
                    {rsvpData.registrations.total}
                  </div>
                  <div className="text-sm text-purple-400">Total</div>
                </CardContent>
              </Card>
            </div>

            {/* Export Button */}
            <div className="flex justify-center">
              <Button
                onClick={exportRSVPs}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={rsvpData.registrations.total === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export RSVPs to CSV
              </Button>
            </div>

            {/* RSVP Lists */}
            <Tabs defaultValue="going" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/10">
                <TabsTrigger value="going" className="data-[state=active]:bg-green-500/30">
                  Going ({rsvpData.registrations.rsvp_yes.length})
                </TabsTrigger>
                <TabsTrigger value="maybe" className="data-[state=active]:bg-yellow-500/30">
                  Maybe ({rsvpData.registrations.rsvp_maybe.length})
                </TabsTrigger>
                <TabsTrigger value="presale" className="data-[state=active]:bg-blue-500/30">
                  Presale ({rsvpData.registrations.presale_requests.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="going" className="mt-6">
                {renderRSVPList(
                  rsvpData.registrations.rsvp_yes,
                  "Confirmed Attendees",
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
              </TabsContent>

              <TabsContent value="maybe" className="mt-6">
                {renderRSVPList(
                  rsvpData.registrations.rsvp_maybe,
                  "Maybe Attendees",
                  <HelpCircle className="h-5 w-5 text-yellow-400" />
                )}
              </TabsContent>

              <TabsContent value="presale" className="mt-6">
                {renderRSVPList(
                  rsvpData.registrations.presale_requests,
                  "Presale Requests",
                  <Mail className="h-5 w-5 text-blue-400" />
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}