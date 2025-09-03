import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Building2,
  Loader2,
  Download
} from 'lucide-react'
import { format } from 'date-fns'
import type { PlatformEvent, PlatformConnection } from '@/types/platformIntegration'
import { 
  getProfilePlatformEvents,
  getUserProfileConnections,
  getUnassignedEvents,
  assignEventToClub
} from '@/services/profilePlatformService'
import { useToast } from '@/hooks/use-toast'

interface EventWithAssignment extends PlatformEvent {
  isAssigned?: boolean
  assignedToClub?: string
  assignedToClubName?: string
}

interface EventSyncDashboardProps {
  onEventAssigned?: (eventId: string, clubId: string) => void
}

export function EventSyncDashboard({ onEventAssigned }: EventSyncDashboardProps) {
  const { currentUser, userProfile } = useAuth()
  const { toast } = useToast()
  
  const [events, setEvents] = useState<EventWithAssignment[]>([])
  const [connections, setConnections] = useState<PlatformConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'unassigned'>('all')
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'eventbrite'>('all')
  const [assigningEvent, setAssigningEvent] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser) {
      loadDashboardData()
    }
  }, [currentUser])

  const loadDashboardData = async () => {
    if (!currentUser) return

    try {
      setLoading(true)

      // Load connections and events in parallel
      const [userConnections, platformEvents, unassignedEvents] = await Promise.all([
        getUserProfileConnections(currentUser.uid),
        getProfilePlatformEvents(currentUser.uid),
        getUnassignedEvents(currentUser.uid)
      ])

      setConnections(userConnections)

      // Mark events as assigned/unassigned
      const unassignedIds = new Set(unassignedEvents.map(e => e.id))
      const eventsWithAssignment: EventWithAssignment[] = platformEvents.map(event => ({
        ...event,
        isAssigned: !unassignedIds.has(event.id),
        assignedToClub: !unassignedIds.has(event.id) ? 'mock-club-id' : undefined,
        assignedToClubName: !unassignedIds.has(event.id) ? 'Sample Club' : undefined
      }))

      setEvents(eventsWithAssignment)

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast({
        variant: "destructive",
        title: "Load Failed",
        description: "Failed to load event sync dashboard data."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignToClub = async (eventId: string, clubId: string) => {
    if (!currentUser) return

    try {
      setAssigningEvent(eventId)
      await assignEventToClub(currentUser.uid, eventId, clubId)
      
      // Update local state
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, isAssigned: true, assignedToClub: clubId, assignedToClubName: 'Sample Club' }
          : event
      ))

      toast({
        title: "Event Assigned",
        description: "Event has been successfully assigned to your club."
      })

      onEventAssigned?.(eventId, clubId)

    } catch (error) {
      console.error('Failed to assign event:', error)
      toast({
        variant: "destructive", 
        title: "Assignment Failed",
        description: "Failed to assign event to club."
      })
    } finally {
      setAssigningEvent(null)
    }
  }

  const getFilteredEvents = () => {
    return events.filter(event => {
      // Search filter
      if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Status filter
      if (filterStatus === 'assigned' && !event.isAssigned) return false
      if (filterStatus === 'unassigned' && event.isAssigned) return false

      // Platform filter
      if (filterPlatform !== 'all' && event.platform !== filterPlatform) return false

      return true
    })
  }

  const getStatusBadgeProps = (event: EventWithAssignment) => {
    if (event.isAssigned) {
      return {
        className: "bg-green-500/20 text-green-300 border-green-400/30",
        children: (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Assigned
          </>
        )
      }
    } else {
      return {
        className: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
        children: (
          <>
            <Clock className="h-3 w-3 mr-1" />
            Unassigned
          </>
        )
      }
    }
  }

  const getEventTypeIcon = (event: EventWithAssignment) => {
    if (event.isOnline) {
      return <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">💻</div>
    }
    if (event.isFree) {
      return <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center">🎉</div>
    }
    return <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center">🎫</div>
  }

  const filteredEvents = getFilteredEvents()
  const assignedCount = events.filter(e => e.isAssigned).length
  const unassignedCount = events.filter(e => !e.isAssigned).length
  const totalRevenue = events.reduce((sum, event) => sum + (event.ticketPrice || 0) * (event.attendeeCount || 0), 0)

  if (!currentUser) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Event Sync Dashboard</h2>
        <p className="text-gray-200">Manage imported events from your connected platforms</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-200">Total Events</p>
                <p className="text-2xl font-bold text-white">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-200">Assigned</p>
                <p className="text-2xl font-bold text-green-300">{assignedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-200">Unassigned</p>
                <p className="text-2xl font-bold text-yellow-300">{unassignedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-200">Revenue</p>
                <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-white text-sm">Search Events</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by event name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-white text-sm">Status</Label>
              <div className="flex space-x-2 mt-1">
                <Button
                  size="sm"
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className={filterStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white border-white/20'}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filterStatus === 'assigned' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('assigned')}
                  className={filterStatus === 'assigned' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white border-white/20'}
                >
                  Assigned
                </Button>
                <Button
                  size="sm"
                  variant={filterStatus === 'unassigned' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('unassigned')}
                  className={filterStatus === 'unassigned' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white border-white/20'}
                >
                  Unassigned
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-white text-sm">Actions</Label>
              <div className="flex space-x-2 mt-1">
                <Button 
                  size="sm"
                  onClick={loadDashboardData}
                  disabled={loading}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Imported Events ({filteredEvents.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
              <p className="text-gray-200">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Events Found</h3>
              <p className="text-gray-200 mb-4">
                {events.length === 0 
                  ? "Connect your platforms to start importing events"
                  : "No events match your current filters"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Event Icon */}
                    {getEventTypeIcon(event)}
                    
                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-200 line-clamp-2">{event.shortDescription}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge {...getStatusBadgeProps(event)} />
                        </div>
                      </div>

                      {/* Event Meta */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-200">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-200">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{event.isOnline ? 'Virtual Event' : event.location}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-200">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{event.attendeeCount || 0} attending</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-200">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{event.isFree ? 'Free' : `$${event.ticketPrice}`}</span>
                        </div>
                      </div>

                      {/* Assignment Info */}
                      {event.isAssigned && event.assignedToClubName && (
                        <div className="flex items-center space-x-2 mt-3 text-sm">
                          <Building2 className="h-4 w-4 text-green-400" />
                          <span className="text-green-300">Assigned to: {event.assignedToClubName}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(event.platformUrl, '_blank')}
                            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on {event.platform}
                          </Button>
                          
                          {!event.isAssigned && userProfile?.organizationIds && userProfile.organizationIds.length > 0 && (
                            <Button
                              size="sm"
                              onClick={() => handleAssignToClub(event.id, userProfile.organizationIds[0])}
                              disabled={assigningEvent === event.id}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              {assigningEvent === event.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Assigning...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Assign to Club
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          Synced {format(new Date(event.lastSyncedAt), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State for No Connections */}
      {connections.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-8 text-center">
            <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Platform Connections</h3>
            <p className="text-gray-200 mb-4">
              Connect your Eventbrite account to start importing and managing events.
            </p>
            <p className="text-sm text-gray-300">
              Go back to the Platform Integrations tab to connect your account.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}