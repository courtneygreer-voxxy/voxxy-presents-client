import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users, 
  Mail, 
  Calendar, 
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader,
  UserCheck,
  User,
  MailOpen
} from "lucide-react"
import { registrationsApi } from "@/services/api"
import type { Event } from "@/types/database"

interface Registration {
  id: string
  eventId: string
  name: string
  email?: string
  phone?: string
  registrationType: 'rsvp_yes' | 'rsvp_maybe' | 'presale_request'
  notes?: string
  createdAt: string
}

interface RegistrationStats {
  rsvpYes: number
  rsvpMaybe: number
  presaleRequests: number
  totalRegistrations: number
}

interface EventRegistrationSectionProps {
  event: Event
  isExpanded: boolean
  onToggle: () => void
}

export default function EventRegistrationSection({ event, isExpanded, onToggle }: EventRegistrationSectionProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<RegistrationStats>({
    rsvpYes: 0,
    rsvpMaybe: 0,
    presaleRequests: 0,
    totalRegistrations: 0
  })
  const [manualSales, setManualSales] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load registration data when section expands
  useEffect(() => {
    if (isExpanded) {
      loadRegistrations()
    }
  }, [isExpanded, event.id])

  // Load manual sales from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`manual-sales-${event.id}`)
    if (saved) {
      setManualSales(parseInt(saved, 10) || 0)
    }
  }, [event.id])

  const loadRegistrations = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Loading registrations for event:', event.id)
      const response = await registrationsApi.getByEvent(event.id)
      console.log('Raw API Response:', response)
      console.log('Response type:', typeof response)
      console.log('Is array:', Array.isArray(response))
      
      // Handle different response formats
      let registrationData: Registration[] = []
      
      if (Array.isArray(response)) {
        console.log('Response is direct array')
        registrationData = response
      } else if (response && Array.isArray(response.data)) {
        console.log('Response has data property that is array')
        registrationData = response.data
      } else if (response && response.registrations && Array.isArray(response.registrations)) {
        console.log('Response has registrations property that is array')
        registrationData = response.registrations
      } else if (response === null || response === undefined) {
        console.log('Response is null/undefined - no registrations found')
        registrationData = []
      } else {
        console.warn('Unexpected API response format:', response)
        console.log('Response keys:', Object.keys(response || {}))
        registrationData = []
      }
      
      console.log('Final registration data:', registrationData)
      setRegistrations(registrationData)
      
      // Calculate stats
      const newStats = {
        rsvpYes: registrationData.filter((r: Registration) => r.registrationType === 'rsvp_yes').length,
        rsvpMaybe: registrationData.filter((r: Registration) => r.registrationType === 'rsvp_maybe').length,
        presaleRequests: registrationData.filter((r: Registration) => r.registrationType === 'presale_request').length,
        totalRegistrations: registrationData.length
      }
      console.log('Calculated stats:', newStats)
      setStats(newStats)
      
    } catch (err) {
      console.error('Failed to load registrations:', err)
      console.error('Error details:', err)
      setError(`Failed to load registration data: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleManualSalesChange = (value: string) => {
    const num = parseInt(value, 10) || 0
    setManualSales(num)
    localStorage.setItem(`manual-sales-${event.id}`, num.toString())
  }

  const calculateRemainingCapacity = () => {
    if (!event.capacity) return null
    return Math.max(0, event.capacity - stats.totalRegistrations - manualSales)
  }

  const getCapacityStatus = () => {
    const remaining = calculateRemainingCapacity()
    if (remaining === null) return null
    
    if (remaining === 0) return { color: 'destructive', text: 'Full' }
    if (remaining <= 5) return { color: 'secondary', text: 'Almost Full' }
    return { color: 'default', text: 'Available' }
  }

  const getRegistrationTypeIcon = (type: string) => {
    switch (type) {
      case 'rsvp_yes':
        return <UserCheck className="h-4 w-4 text-green-600" />
      case 'rsvp_maybe':
        return <User className="h-4 w-4 text-yellow-600" />
      case 'presale_request':
        return <MailOpen className="h-4 w-4 text-blue-600" />
      default:
        return <Users className="h-4 w-4 text-gray-400" />
    }
  }

  const getRegistrationTypeLabel = (type: string) => {
    switch (type) {
      case 'rsvp_yes':
        return 'RSVP Yes'
      case 'rsvp_maybe':
        return 'RSVP Maybe'
      case 'presale_request':
        return 'Presale Request'
      default:
        return type
    }
  }

  const getRegistrationTypeBadge = (type: string) => {
    switch (type) {
      case 'rsvp_yes':
        return <Badge variant="default" className="bg-green-600">Yes</Badge>
      case 'rsvp_maybe':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Maybe</Badge>
      case 'presale_request':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Presale</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const exportRegistrations = () => {
    if (registrations.length === 0) return
    
    const csvData = [
      ['Name', 'Email', 'Phone', 'Type', 'Notes', 'Registered At'],
      ...registrations.map(r => [
        r.name || '',
        r.email || '',
        r.phone || '',
        getRegistrationTypeLabel(r.registrationType),
        r.notes || '',
        new Date(r.createdAt).toLocaleDateString()
      ])
    ]
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title}-registrations.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const remaining = calculateRemainingCapacity()
  const capacityStatus = getCapacityStatus()

  return (
    <>
      {/* Manage Button */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        <Users className="h-4 w-4" />
        Manage
        {stats.totalRegistrations > 0 && (
          <Badge variant="secondary" className="ml-1">
            {stats.totalRegistrations}
          </Badge>
        )}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 ml-1" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-1" />
        )}
      </Button>

      {/* Expandable Registration Section */}
      {isExpanded && (
        <div className="mt-4 border-t pt-4">
          <Card className="border-0 shadow-sm bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Registration Management
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin mr-2" />
                  Loading registrations...
                </div>
              )}
              
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              )}
              
              {!loading && !error && (
                <>
                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">RSVP Yes</p>
                        <p className="text-xl font-bold">{stats.rsvpYes}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">RSVP Maybe</p>
                        <p className="text-xl font-bold">{stats.rsvpMaybe}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Presale</p>
                        <p className="text-xl font-bold">{stats.presaleRequests}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                      <Users className="h-5 w-5 text-gray-700" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total</p>
                        <p className="text-xl font-bold">{stats.totalRegistrations}</p>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Management */}
                  {event.capacity && (
                    <div className="bg-white p-4 rounded-lg space-y-4">
                      <h4 className="font-semibold text-gray-900">Capacity Management</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Event Capacity</Label>
                          <p className="text-lg font-semibold">{event.capacity}</p>
                        </div>
                        
                        <div>
                          <Label htmlFor="manual-sales" className="text-sm text-gray-600">
                            External Sales
                          </Label>
                          <Input
                            id="manual-sales"
                            type="number"
                            min="0"
                            value={manualSales}
                            onChange={(e) => handleManualSalesChange(e.target.value)}
                            className="mt-1"
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">Remaining</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {capacityStatus && (
                              <Badge variant={capacityStatus.color as any}>
                                {capacityStatus.text}
                              </Badge>
                            )}
                            <span className="text-lg font-semibold">
                              {remaining !== null ? remaining : 'Unlimited'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Registration Details Table */}
                  <div className="bg-white rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h4 className="font-semibold text-gray-900">Registration Details</h4>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={loadRegistrations}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={exportRegistrations}
                          disabled={registrations.length === 0}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                      </div>
                    </div>
                    
                    {registrations.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No registrations yet</p>
                        <p className="text-sm">Registrations will appear here when people RSVP or request presale info.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrations.map((registration) => (
                            <TableRow key={registration.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getRegistrationTypeIcon(registration.registrationType)}
                                  {getRegistrationTypeBadge(registration.registrationType)}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {registration.name || '-'}
                              </TableCell>
                              <TableCell>
                                {registration.email ? (
                                  <a 
                                    href={`mailto:${registration.email}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {registration.email}
                                  </a>
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                {registration.phone ? (
                                  <a 
                                    href={`tel:${registration.phone}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {registration.phone}
                                  </a>
                                ) : '-'}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {formatDate(registration.createdAt)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {registration.notes ? (
                                  <div className="max-w-xs truncate" title={registration.notes}>
                                    {registration.notes}
                                  </div>
                                ) : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}