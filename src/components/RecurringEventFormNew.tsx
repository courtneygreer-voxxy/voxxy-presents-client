import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, Plus, ArrowLeft, Loader, Search } from "lucide-react"
import { format } from "date-fns"
import EventDetailsCard, { EventDetails } from './EventDetailsCard'
import { eventsApi } from "@/services/api"
import { createEvent } from "@/lib/database"
import { getDataSource } from "@/config/environments"
import type { CreateEventData, Organization } from "@/types/database"

interface RecurringEventFormProps {
  organization: Organization
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  onSuccess: (events: any[]) => void
}

interface SeriesData {
  name: string
  status: 'draft' | 'presale' | 'published' | 'sold_out' | 'cancelled' | 'completed'
  description: string
  location: string
  address: string
  price: {
    type: 'free' | 'paid' | 'group_deal'
    amount?: number
    advancePrice?: number
    description: string
    groupDealDetails?: {
      minimumPeople: number
      pricePerPerson: number
      normalPricePerPerson: number
    }
  }
  capacity?: number
  startDate: Date | undefined
}

export default function RecurringEventForm({ organization, isOpen, onClose, onBack, onSuccess }: RecurringEventFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<EventDetails[]>([])
  
  const [seriesData, setSeriesData] = useState<SeriesData>({
    name: '',
    status: 'draft',
    description: '',
    location: organization.settings.defaultLocation || '',
    address: organization.settings.defaultAddress || '',
    price: {
      type: 'free',
      description: ''
    },
    startDate: undefined
  })

  const generateEventId = () => Math.random().toString(36).substr(2, 9)

  const addEvent = () => {
    const newEvent: EventDetails = {
      id: generateEventId(),
      date: undefined,
      time: '',
      title: '',
      description: '',
      location: ''
    }
    setEvents(prev => [...prev, newEvent])
  }

  const updateEvent = (index: number, field: keyof EventDetails, value: any) => {
    setEvents(prev => prev.map((event, i) => 
      i === index ? { ...event, [field]: value } : event
    ))
  }

  const removeEvent = (index: number) => {
    setEvents(prev => prev.filter((_, i) => i !== index))
  }

  const handleSeriesChange = (field: keyof SeriesData | string, value: any) => {
    if (field.startsWith('price.groupDealDetails.')) {
      const dealField = field.split('.')[2] as string
      setSeriesData(prev => ({
        ...prev,
        price: {
          ...prev.price,
          groupDealDetails: {
            ...prev.price.groupDealDetails!,
            [dealField]: value
          }
        }
      }))
    } else if (field.startsWith('price.')) {
      const priceField = field.split('.')[1] as string
      setSeriesData(prev => {
        const newPrice = { ...prev.price }
        if (value === undefined || value === '') {
          delete (newPrice as any)[priceField]
        } else {
          (newPrice as any)[priceField] = value
        }
        return { ...prev, price: newPrice }
      })
    } else {
      setSeriesData(prev => ({ ...prev, [field as keyof SeriesData]: value }))
    }
  }

  const cleanObject = (obj: any): any => {
    if (obj === null || obj === undefined) return undefined
    if (obj instanceof Date) return obj
    if (Array.isArray(obj)) return obj.map(cleanObject).filter(item => item !== undefined)
    if (typeof obj === 'object') {
      const cleaned: any = {}
      Object.keys(obj).forEach(key => {
        const value = cleanObject(obj[key])
        if (value !== undefined) {
          cleaned[key] = value
        }
      })
      return Object.keys(cleaned).length > 0 ? cleaned : undefined
    }
    return obj
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!seriesData.startDate) {
        throw new Error('Please select a start date')
      }

      if (events.length === 0) {
        throw new Error('Please add at least one event to the series')
      }

      // Validate that all events have required fields
      const invalidEvents = events.filter(event => !event.date || !event.time || !event.title.trim())
      if (invalidEvents.length > 0) {
        throw new Error('All events must have a date, time, and title')
      }

      // Create individual events for each item in the series
      const dataSource = getDataSource()
      const createdEvents: any[] = []

      for (const event of events) {
        const eventData: CreateEventData = {
          organizationId: organization.id,
          title: event.title,
          description: event.description,
          fullDescription: seriesData.description,
          date: event.date!,
          time: event.time,
          duration: '', // Could add this to EventDetails if needed
          location: event.location || seriesData.location,
          address: seriesData.address,
          price: cleanObject(seriesData.price),
          capacity: seriesData.capacity,
          registrationRequired: false,
          series: {
            name: seriesData.name,
            description: seriesData.description
          },
          isRecurring: true,
          imageUrl: '',
          status: seriesData.status
        }

        const cleanedEventData = cleanObject(eventData) as CreateEventData

        let response: any
        if (dataSource === 'firebase') {
          console.log('Creating series event via Firebase (development)', event.title)
          const eventId = await createEvent(cleanedEventData)
          response = { id: eventId, ...cleanedEventData }
        } else {
          console.log('Creating series event via API', event.title)
          response = await eventsApi.create(cleanedEventData)
        }
        
        createdEvents.push(response)
      }
      
      console.log('✅ Event series created successfully:', { 
        seriesName: seriesData.name, 
        eventCount: createdEvents.length 
      })
      
      onSuccess(createdEvents)
      onClose()
      
      // Reset form
      setSeriesData({
        name: '',
        status: 'draft',
        description: '',
        location: organization.settings.defaultLocation || '',
        address: organization.settings.defaultAddress || '',
        price: {
          type: 'free',
          description: ''
        },
        startDate: undefined
      })
      setEvents([])
    } catch (err) {
      console.error('Failed to create event series:', err)
      setError(err instanceof Error ? err.message : 'Failed to create event series')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle>Create Event Series</DialogTitle>
              <DialogDescription>
                Create a series of related events for {organization.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Series Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Series Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="seriesName">Series Name *</Label>
                  <Input
                    id="seriesName"
                    value={seriesData.name}
                    onChange={(e) => handleSeriesChange('name', e.target.value)}
                    placeholder="e.g., Weekly Figure Drawing"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={seriesData.status}
                    onValueChange={(value) => handleSeriesChange('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="presale">PreSale</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="sold_out">Sold Out</SelectItem>
                      <SelectItem value="cancelled">Canceled</SelectItem>
                      <SelectItem value="completed">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="seriesDescription">Series Description</Label>
                <Textarea
                  id="seriesDescription"
                  value={seriesData.description}
                  onChange={(e) => handleSeriesChange('description', e.target.value)}
                  placeholder="What is this series about? This will be the full description for all events."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing (applies to all events)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Price Type</Label>
                <Select
                  value={seriesData.price.type}
                  onValueChange={(value) => handleSeriesChange('price.type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="group_deal">Group Ticket Deal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {seriesData.price.type === 'paid' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Price Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={seriesData.price.amount || ''}
                        onChange={(e) => handleSeriesChange('price.amount', parseFloat(e.target.value) || undefined)}
                        placeholder="20.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="advancePrice">Advance Price</Label>
                      <Input
                        id="advancePrice"
                        type="number"
                        step="0.01"
                        value={seriesData.price.advancePrice || ''}
                        onChange={(e) => handleSeriesChange('price.advancePrice', parseFloat(e.target.value) || undefined)}
                        placeholder="15.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      placeholder="https://eventbrite.com/... or https://venmo.com/..."
                      required={seriesData.status === 'published'}
                    />
                  </div>
                </>
              )}

              {seriesData.price.type === 'group_deal' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="minimumPeople">Minimum People *</Label>
                      <Input
                        id="minimumPeople"
                        type="number"
                        value={seriesData.price.groupDealDetails?.minimumPeople || ''}
                        onChange={(e) => handleSeriesChange('price.groupDealDetails.minimumPeople', parseInt(e.target.value) || undefined)}
                        placeholder="4"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pricePerPerson">Group Price Per Person</Label>
                      <Input
                        id="pricePerPerson"
                        type="number"
                        step="0.01"
                        value={seriesData.price.groupDealDetails?.pricePerPerson || ''}
                        onChange={(e) => handleSeriesChange('price.groupDealDetails.pricePerPerson', parseFloat(e.target.value) || undefined)}
                        placeholder="15.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="normalPricePerPerson">Normal Price Per Person</Label>
                      <Input
                        id="normalPricePerPerson"
                        type="number"
                        step="0.01"
                        value={seriesData.price.groupDealDetails?.normalPricePerPerson || ''}
                        onChange={(e) => handleSeriesChange('price.groupDealDetails.normalPricePerPerson', parseFloat(e.target.value) || undefined)}
                        placeholder="20.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      placeholder="https://eventbrite.com/... or https://venmo.com/..."
                      required={seriesData.status === 'published'}
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="priceDescription">Price Description</Label>
                <Input
                  id="priceDescription"
                  value={seriesData.price.description}
                  onChange={(e) => handleSeriesChange('price.description', e.target.value)}
                  placeholder="e.g., Day of: $20 cash, $25 Venmo"
                />
              </div>

              <div>
                <Label htmlFor="capacity">Capacity (per event)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={seriesData.capacity || ''}
                  onChange={(e) => handleSeriesChange('capacity', parseInt(e.target.value) || undefined)}
                  placeholder="Maximum attendees per event"
                />
              </div>
            </CardContent>
          </Card>

          {/* Where */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Where (default location)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={seriesData.location}
                    onChange={(e) => handleSeriesChange('location', e.target.value)}
                    placeholder="Venue name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={seriesData.address}
                    onChange={(e) => handleSeriesChange('address', e.target.value)}
                    placeholder="Full address"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm mb-2">Need help finding a venue?</p>
                <button
                  type="button"
                  onClick={() => navigate('/voxxy-shop/venues')}
                  className="text-purple-300 hover:text-purple-200 transition-colors underline"
                >
                  Search Venues
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Start Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Start Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Series Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {seriesData.startDate ? format(seriesData.startDate, "PPP") : "Pick a start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={seriesData.startDate}
                      onSelect={(date) => handleSeriesChange('startDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Schedule - Individual Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Schedule</CardTitle>
                  <CardDescription>
                    Add individual events to your series. Each can have unique details.
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <p>No events added yet</p>
                  <p className="text-sm">Click "Add Event" to start building your series schedule</p>
                </div>
              )}

              {events.map((event, index) => (
                <EventDetailsCard
                  key={event.id}
                  event={event}
                  index={index}
                  mainLocation={seriesData.location}
                  onUpdate={updateEvent}
                  onRemove={removeEvent}
                />
              ))}
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Create Event Series ({events.length} events)
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}