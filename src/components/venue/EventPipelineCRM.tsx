import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  X,
  Eye,
  Mail,
  Phone
} from 'lucide-react'

interface EventRequest {
  id: string
  eventName: string
  organizationName: string
  organizerName: string
  organizerEmail: string
  organizerPhone?: string
  eventDate: Date
  startTime: string
  endTime: string
  expectedAttendees: number
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  requestedAt: Date
  eventType: string
  specialRequests?: string
}

interface EventPipelineCRMProps {
  venueId: string
}

export function EventPipelineCRM({ venueId }: EventPipelineCRMProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all')
  const [events, setEvents] = useState<EventRequest[]>([
    // Mock data
    {
      id: 'event-1',
      eventName: 'Brooklyn Comedy Night',
      organizationName: 'Brooklyn Comedy Club',
      organizerName: 'Sarah Chen',
      organizerEmail: 'sarah@brooklyncomedy.com',
      organizerPhone: '(555) 123-4567',
      eventDate: new Date('2024-10-15'),
      startTime: '19:00',
      endTime: '22:00',
      expectedAttendees: 45,
      description: 'Monthly comedy showcase featuring local comedians and special guests.',
      status: 'pending',
      requestedAt: new Date('2024-09-20'),
      eventType: 'Comedy Show',
      specialRequests: 'Sound system with wireless microphones, stage lighting'
    },
    {
      id: 'event-2',
      eventName: 'Jazz & Wine Evening',
      organizationName: 'NYC Jazz Society',
      organizerName: 'Marcus Williams',
      organizerEmail: 'marcus@nycjazz.org',
      eventDate: new Date('2024-10-08'),
      startTime: '18:30',
      endTime: '21:30',
      expectedAttendees: 35,
      description: 'Intimate jazz performance with wine pairings.',
      status: 'approved',
      requestedAt: new Date('2024-09-15'),
      eventType: 'Music Performance'
    },
    {
      id: 'event-3',
      eventName: 'Book Club Social',
      organizationName: 'Brooklyn Readers',
      organizerName: 'Emily Rodriguez',
      organizerEmail: 'emily@brooklynreaders.com',
      eventDate: new Date('2024-09-25'),
      startTime: '19:00',
      endTime: '21:00',
      expectedAttendees: 20,
      description: 'Monthly book discussion and author meet-and-greet.',
      status: 'completed',
      requestedAt: new Date('2024-08-30'),
      eventType: 'Social Event'
    }
  ])
  const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' ||
      event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || event.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-400" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-400" />
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-400/20 text-green-400 border-green-400/30">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-400/20 text-red-400 border-red-400/30">Rejected</Badge>
      case 'completed':
        return <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">Completed</Badge>
      default:
        return <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">Pending Review</Badge>
    }
  }

  const handleApproveEvent = async (eventId: string) => {
    setIsProcessing(true)
    try {
      // TODO: Replace with actual API call
      console.log('Approving event:', eventId)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setEvents(prev => prev.map(event =>
        event.id === eventId ? { ...event, status: 'approved' as const } : event
      ))
    } catch (error) {
      console.error('Error approving event:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectEvent = async (eventId: string) => {
    setIsProcessing(true)
    try {
      // TODO: Replace with actual API call
      console.log('Rejecting event:', eventId)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setEvents(prev => prev.map(event =>
        event.id === eventId ? { ...event, status: 'rejected' as const } : event
      ))
    } catch (error) {
      console.error('Error rejecting event:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  const getEventCounts = () => {
    return {
      total: events.length,
      pending: events.filter(e => e.status === 'pending').length,
      approved: events.filter(e => e.status === 'approved').length,
      completed: events.filter(e => e.status === 'completed').length
    }
  }

  const counts = getEventCounts()

  return (
    <div className="space-y-6">
      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-white">{counts.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{counts.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-green-400">{counts.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-blue-400">{counts.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-white">Filters</span>
          </div>
          {(searchQuery || statusFilter !== 'all') && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events, organizations, organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white hover:bg-gray-700">All Status</SelectItem>
              <SelectItem value="pending" className="text-white hover:bg-gray-700">Pending Review</SelectItem>
              <SelectItem value="approved" className="text-white hover:bg-gray-700">Approved</SelectItem>
              <SelectItem value="rejected" className="text-white hover:bg-gray-700">Rejected</SelectItem>
              <SelectItem value="completed" className="text-white hover:bg-gray-700">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No events found</h3>
            <p className="text-gray-400">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Event requests will appear here when organizations book your venue'
              }
            </p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{event.eventName}</h3>
                    {getStatusIcon(event.status)}
                    {getStatusBadge(event.status)}
                  </div>
                  <p className="text-purple-400 font-medium">{event.organizationName}</p>
                  <p className="text-gray-300 text-sm mt-1">{event.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{event.eventDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{event.expectedAttendees} expected attendees</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-white mb-2">Organizer Contact</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">{event.organizerName}</p>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail className="h-3 w-3" />
                    <span>{event.organizerEmail}</span>
                  </div>
                  {event.organizerPhone && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="h-3 w-3" />
                      <span>{event.organizerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {event.specialRequests && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-white mb-2">Special Requests</h4>
                  <p className="text-gray-300 text-sm">{event.specialRequests}</p>
                </div>
              )}

              {event.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-white/20">
                  <Button
                    onClick={() => handleApproveEvent(event.id)}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Event
                  </Button>
                  <Button
                    onClick={() => handleRejectEvent(event.id)}
                    disabled={isProcessing}
                    variant="outline"
                    className="flex-1 bg-red-600/20 border-red-400/30 text-red-400 hover:bg-red-600/30"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Event
                  </Button>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-white/20 text-xs text-gray-400">
                <span>Requested: {event.requestedAt.toLocaleDateString()}</span>
                <span>{event.eventType}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredEvents.length > 0 && (
        <div className="text-center text-gray-400">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      )}
    </div>
  )
}