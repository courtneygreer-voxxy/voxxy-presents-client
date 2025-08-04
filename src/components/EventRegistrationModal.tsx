import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users, 
  Mail, 
  Calendar, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader,
  UserCheck,
  User,
  MailOpen,
  Phone,
  FileText
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

interface EventRegistrationModalProps {
  event: Event
  isOpen: boolean
  onClose: () => void
}

export default function EventRegistrationModal({ event, isOpen, onClose }: EventRegistrationModalProps) {
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

  // Load registration data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRegistrations()
    }
  }, [isOpen, event.id])

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
      
      // Handle different response formats
      let registrationData: Registration[] = []
      
      if (Array.isArray(response)) {
        registrationData = response
      } else if (response && Array.isArray(response.data)) {
        registrationData = response.data
      } else if (response && response.registrations && Array.isArray(response.registrations)) {
        registrationData = response.registrations
      } else if (response && response.registrations && typeof response.registrations === 'object') {
        console.log('Converting registrations object to array')
        registrationData = Object.values(response.registrations)
      } else {
        console.warn('No registrations found or unexpected format')
        registrationData = []
      }
      
      console.log('Final registration data:', registrationData)
      console.log('Sample registration:', registrationData[0])
      setRegistrations(registrationData)
      
      // Calculate stats
      const newStats = {
        rsvpYes: registrationData.filter((r: Registration) => r.registrationType === 'rsvp_yes').length,
        rsvpMaybe: registrationData.filter((r: Registration) => r.registrationType === 'rsvp_maybe').length,
        presaleRequests: registrationData.filter((r: Registration) => r.registrationType === 'presale_request').length,
        totalRegistrations: registrationData.length
      }
      setStats(newStats)
      
    } catch (err) {
      console.error('Failed to load registrations:', err)
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
      case 'rsvp_yes': return 'RSVP Yes'
      case 'rsvp_maybe': return 'RSVP Maybe'
      case 'presale_request': return 'Presale Request'
      default: return type
    }
  }

  const getRegistrationTypeBadge = (type: string) => {
    switch (type) {
      case 'rsvp_yes':
        return <Badge className="bg-green-600">Yes</Badge>
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registration Management - {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-6 w-6 animate-spin mr-2" />
              Loading registrations...
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
          
          {!loading && !error && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">RSVP Yes</p>
                      <p className="text-2xl font-bold">{stats.rsvpYes}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Calendar className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">RSVP Maybe</p>
                      <p className="text-2xl font-bold">{stats.rsvpMaybe}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Mail className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Presale Requests</p>
                      <p className="text-2xl font-bold">{stats.presaleRequests}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Users className="h-8 w-8 text-gray-700" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Capacity Management */}
              {event.capacity && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Capacity Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Event Capacity</Label>
                        <p className="text-xl font-semibold">{event.capacity}</p>
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
                        <Label className="text-sm text-gray-600">App Registrations</Label>
                        <p className="text-xl font-semibold">{stats.totalRegistrations}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-600">Remaining</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {capacityStatus && (
                            <Badge variant={capacityStatus.color as any}>
                              {capacityStatus.text}
                            </Badge>
                          )}
                          <span className="text-xl font-semibold">
                            {remaining !== null ? remaining : 'Unlimited'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Registration Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Registration Details</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={loadRegistrations}>
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
                </CardHeader>
                <CardContent>
                  {registrations.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-2">No registrations yet</p>
                      <p className="text-sm text-gray-400">
                        Registrations will appear here when people RSVP or request presale info.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrations.map((registration) => {
                            console.log('Rendering registration:', registration)
                            return (
                              <TableRow key={registration.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getRegistrationTypeIcon(registration.registrationType)}
                                    {getRegistrationTypeBadge(registration.registrationType)}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {registration.name || 'No name provided'}
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {registration.email && (
                                      <div className="flex items-center gap-1 text-sm">
                                        <Mail className="h-3 w-3" />
                                        <a 
                                          href={`mailto:${registration.email}`}
                                          className="text-blue-600 hover:underline"
                                        >
                                          {registration.email}
                                        </a>
                                      </div>
                                    )}
                                    {registration.phone && (
                                      <div className="flex items-center gap-1 text-sm">
                                        <Phone className="h-3 w-3" />
                                        <a 
                                          href={`tel:${registration.phone}`}
                                          className="text-blue-600 hover:underline"
                                        >
                                          {registration.phone}
                                        </a>
                                      </div>
                                    )}
                                    {!registration.email && !registration.phone && (
                                      <span className="text-gray-400 text-sm">No contact info</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">
                                  {formatDate(registration.createdAt)}
                                </TableCell>
                                <TableCell>
                                  {registration.notes ? (
                                    <div className="flex items-start gap-1">
                                      <FileText className="h-3 w-3 mt-0.5 text-gray-400" />
                                      <span className="text-sm">{registration.notes}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">No notes</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}