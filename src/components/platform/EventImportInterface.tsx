import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  ExternalLink, 
  Download, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react"
import { format } from 'date-fns'
import type { PlatformEvent, PlatformConnection, PlatformType } from '@/types/platformIntegration'
import { getPlatformEvents, importPlatformEvents } from '@/services/platformIntegrationService'
import { useToast } from '@/hooks/use-toast'

interface EventImportInterfaceProps {
  connections: PlatformConnection[]
  organizationId: string
  onEventImported?: (importedEvents: any[]) => void
}

interface ImportJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  platform: PlatformType
  selectedEventIds: string[]
  results?: {
    imported: number
    skipped: number
    failed: number
  }
}

export function EventImportInterface({ connections, organizationId, onEventImported }: EventImportInterfaceProps) {
  const [eventsByPlatform, setEventsByPlatform] = useState<Record<PlatformType, PlatformEvent[]>>({
    eventbrite: [],
    luma: [],
    meetup: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const [importJobs, setImportJobs] = useState<ImportJob[]>([])
  const [activeTab, setActiveTab] = useState<PlatformType>('eventbrite')
  const [filters, setFilters] = useState({
    status: 'all',
    imported: 'all',
    dateRange: 'future'
  })
  
  const { toast } = useToast()

  const connectedPlatforms = connections.filter(conn => conn.status === 'connected')

  useEffect(() => {
    if (connectedPlatforms.length > 0) {
      loadAllEvents()
      setActiveTab(connectedPlatforms[0].platform)
    }
  }, [connections])

  const loadAllEvents = async () => {
    setLoading(true)
    
    try {
      const eventPromises = connectedPlatforms.map(async connection => {
        try {
          const events = await getPlatformEvents(connection.id, {
            startDate: filters.dateRange === 'future' ? new Date() : undefined,
            imported: filters.imported === 'all' ? undefined : filters.imported === 'imported'
          })
          return { platform: connection.platform, events }
        } catch (error) {
          console.error(`Failed to load events for ${connection.platform}:`, error)
          return { platform: connection.platform, events: [] }
        }
      })

      const results = await Promise.all(eventPromises)
      
      const newEventsByPlatform = { ...eventsByPlatform }
      results.forEach(({ platform, events }) => {
        newEventsByPlatform[platform] = events
      })
      
      setEventsByPlatform(newEventsByPlatform)
    } catch (error) {
      console.error('Failed to load platform events:', error)
      toast({
        variant: "destructive",
        title: "Load Failed",
        description: "Failed to load events from connected platforms."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEventToggle = (eventId: string, checked: boolean) => {
    const newSelected = new Set(selectedEvents)
    if (checked) {
      newSelected.add(eventId)
    } else {
      newSelected.delete(eventId)
    }
    setSelectedEvents(newSelected)
  }

  const handleSelectAll = (platform: PlatformType, checked: boolean) => {
    const platformEvents = eventsByPlatform[platform] || []
    const platformEventIds = platformEvents
      .filter(event => !event.isImported)
      .map(event => event.id)
    
    const newSelected = new Set(selectedEvents)
    
    if (checked) {
      platformEventIds.forEach(id => newSelected.add(id))
    } else {
      platformEventIds.forEach(id => newSelected.delete(id))
    }
    
    setSelectedEvents(newSelected)
  }

  const handleImportSelected = async () => {
    if (selectedEvents.size === 0) return

    // Group selected events by platform
    const eventsByPlatformToImport: Record<PlatformType, string[]> = {
      eventbrite: [],
      luma: [],
      meetup: []
    }

    // Categorize selected events by platform
    Object.entries(eventsByPlatform).forEach(([platform, events]) => {
      const platformSelectedEvents = events
        .filter(event => selectedEvents.has(event.id))
        .map(event => event.id)
      eventsByPlatformToImport[platform as PlatformType] = platformSelectedEvents
    })

    // Create import jobs for each platform with selected events
    const jobPromises = Object.entries(eventsByPlatformToImport)
      .filter(([_, eventIds]) => eventIds.length > 0)
      .map(async ([platform, eventIds]) => {
        const connection = connections.find(conn => conn.platform === platform)
        if (!connection) return null

        const job: ImportJob = {
          id: `import-${platform}-${Date.now()}`,
          status: 'pending',
          platform: platform as PlatformType,
          selectedEventIds: eventIds
        }

        setImportJobs(prev => [...prev, job])

        try {
          job.status = 'running'
          setImportJobs(prev => prev.map(j => j.id === job.id ? job : j))

          const syncJob = await importPlatformEvents(
            connection.id, 
            eventIds, 
            organizationId
          )

          // Simulate job completion (in real app, you'd poll for status)
          setTimeout(() => {
            job.status = 'completed'
            job.results = {
              imported: eventIds.length,
              skipped: 0,
              failed: 0
            }
            setImportJobs(prev => prev.map(j => j.id === job.id ? job : j))
            
            // Mark events as imported
            setEventsByPlatform(prev => ({
              ...prev,
              [platform]: prev[platform as PlatformType].map(event => 
                eventIds.includes(event.id) 
                  ? { ...event, isImported: true, importedAt: new Date() }
                  : event
              )
            }))
          }, 2000 + Math.random() * 3000)

          return job
        } catch (error) {
          job.status = 'failed'
          setImportJobs(prev => prev.map(j => j.id === job.id ? job : j))
          return job
        }
      })

    const jobs = await Promise.all(jobPromises)
    const validJobs = jobs.filter(job => job !== null)

    toast({
      title: "Import Started",
      description: `Importing ${selectedEvents.size} events from ${validJobs.length} platform(s)`
    })

    // Clear selection
    setSelectedEvents(new Set())
  }

  const getEventCard = (event: PlatformEvent) => (
    <Card 
      key={event.id} 
      className={`transition-all ${event.isImported ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={selectedEvents.has(event.id)}
            onCheckedChange={(checked) => handleEventToggle(event.id, !!checked)}
            disabled={event.isImported}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 truncate pr-2">
                {event.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {event.isImported && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Imported
                  </Badge>
                )}
                <a
                  href={event.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {event.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{format(event.startDate, 'MMM d, yyyy • h:mm a')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="truncate">{event.location}</span>
              </div>
              
              {event.attendeeCount !== undefined && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{event.attendeeCount} attending</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span>{event.isFree ? 'Free' : `$${event.ticketPrice}`}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (connectedPlatforms.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No platform connections found. Please connect to Eventbrite, Luma, or Meetup first.
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  const totalEvents = Object.values(eventsByPlatform).flat().length
  const importedEvents = Object.values(eventsByPlatform).flat().filter(e => e.isImported).length
  const selectedCount = selectedEvents.size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Import Events</h2>
          <p className="text-gray-600">
            Select events from your connected platforms to import into Voxxy
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadAllEvents}
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {selectedCount > 0 && (
            <Button
              onClick={handleImportSelected}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Import {selectedCount} Events
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{importedEvents}</div>
            <div className="text-sm text-gray-600">Already Imported</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{selectedCount}</div>
            <div className="text-sm text-gray-600">Selected</div>
          </CardContent>
        </Card>
      </div>

      {/* Import Jobs Status */}
      {importJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Import Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm`}>
                      🎫
                    </div>
                    <div>
                      <div className="font-medium">
                        {job.platform} - {job.selectedEventIds.length} events
                      </div>
                      {job.results && (
                        <div className="text-sm text-gray-600">
                          {job.results.imported} imported, {job.results.skipped} skipped
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Badge 
                    variant={
                      job.status === 'completed' ? 'default' : 
                      job.status === 'failed' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {job.status === 'running' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                    {job.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PlatformType)}>
        <TabsList className="grid w-full grid-cols-3">
          {connectedPlatforms.map(connection => {
            const events = eventsByPlatform[connection.platform] || []
            const unimportedCount = events.filter(e => !e.isImported).length
            
            return (
              <TabsTrigger key={connection.platform} value={connection.platform} className="flex items-center gap-2">
                {connection.platform === 'eventbrite' && '🎫'}
                {connection.platform === 'luma' && '✨'}
                {connection.platform === 'meetup' && '👥'}
                {connection.platform.charAt(0).toUpperCase() + connection.platform.slice(1)}
                {unimportedCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {unimportedCount}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {connectedPlatforms.map(connection => {
          const events = eventsByPlatform[connection.platform] || []
          const unimportedEvents = events.filter(e => !e.isImported)
          const platformSelectedCount = events.filter(e => selectedEvents.has(e.id)).length

          return (
            <TabsContent key={connection.platform} value={connection.platform} className="space-y-4">
              {/* Platform Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={unimportedEvents.length > 0 && unimportedEvents.every(e => selectedEvents.has(e.id))}
                    onCheckedChange={(checked) => handleSelectAll(connection.platform, !!checked)}
                    disabled={unimportedEvents.length === 0}
                  />
                  <span className="text-sm text-gray-600">
                    Select all ({unimportedEvents.length} available)
                  </span>
                  {platformSelectedCount > 0 && (
                    <Badge variant="outline">
                      {platformSelectedCount} selected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Events List */}
              <div className="space-y-3">
                {events.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No events found for {connection.platform}
                  </div>
                ) : (
                  events.map(getEventCard)
                )}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}