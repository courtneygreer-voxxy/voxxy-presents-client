import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Users, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Download,
  AlertCircle,
  CheckCircle,
  Loader
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

interface EventRegistrationDropdownProps {
  event: Event
}

export default function EventRegistrationDropdown({ event }: EventRegistrationDropdownProps) {
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
  const [isOpen, setIsOpen] = useState(false)

  // Load registration data when dropdown opens
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
      const data = await registrationsApi.getByEvent(event.id)
      setRegistrations(Array.isArray(data) ? data : [])
      
      // Calculate stats
      const newStats = {
        rsvpYes: data.filter((r: Registration) => r.registrationType === 'rsvp_yes').length,
        rsvpMaybe: data.filter((r: Registration) => r.registrationType === 'rsvp_maybe').length,
        presaleRequests: data.filter((r: Registration) => r.registrationType === 'presale_request').length,
        totalRegistrations: data.length
      }
      setStats(newStats)
      
    } catch (err) {
      console.error('Failed to load registrations:', err)
      setError('Failed to load registration data')
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

  const exportRegistrations = () => {
    if (registrations.length === 0) return
    
    const csvData = [
      ['Name', 'Email', 'Phone', 'Type', 'Notes', 'Registered At'],
      ...registrations.map(r => [
        r.name || '',
        r.email || '',
        r.phone || '',
        r.registrationType,
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

  const remaining = calculateRemainingCapacity()
  const capacityStatus = getCapacityStatus()

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Manage
          {stats.totalRegistrations > 0 && (
            <Badge variant="secondary" className="ml-2">
              {stats.totalRegistrations}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registration Management
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Loading registrations...
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            {!loading && !error && (
              <>
                {/* Registration Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">RSVP Yes</span>
                    </div>
                    <Badge variant="default">{stats.rsvpYes}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">RSVP Maybe</span>
                    </div>
                    <Badge variant="secondary">{stats.rsvpMaybe}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Presale Requests</span>
                    </div>
                    <Badge variant="outline">{stats.presaleRequests}</Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between font-medium">
                    <span>Total Registrations</span>
                    <Badge variant="default" className="bg-black">
                      {stats.totalRegistrations}
                    </Badge>
                  </div>
                </div>

                {/* Capacity Management */}
                {event.capacity && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Event Capacity</span>
                        <span className="text-sm">{event.capacity}</span>
                      </div>
                      
                      <div>
                        <Label htmlFor="manual-sales" className="text-sm">
                          External Sales (manual entry)
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
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Remaining Capacity</span>
                        <div className="flex items-center gap-2">
                          {capacityStatus && (
                            <Badge variant={capacityStatus.color as any}>
                              {capacityStatus.text}
                            </Badge>
                          )}
                          <span className="text-sm font-bold">
                            {remaining !== null ? remaining : 'Unlimited'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Quick Actions */}
                <Separator />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={exportRegistrations}
                    disabled={registrations.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadRegistrations}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}