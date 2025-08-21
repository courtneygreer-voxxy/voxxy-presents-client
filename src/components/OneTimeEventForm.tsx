import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, ArrowLeft, Loader } from "lucide-react"
import { format } from "date-fns"
import { eventsApi } from "@/services/api"
import { createEvent } from "@/lib/database"
import { getDataSource } from "@/config/environments"
import type { CreateEventData, Organization } from "@/types/database"

interface OneTimeEventFormProps {
  organization: Organization
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  onSuccess: (event: any) => void
}

export default function OneTimeEventForm({ organization, isOpen, onClose, onBack, onSuccess }: OneTimeEventFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  
  const [formData, setFormData] = useState<Partial<CreateEventData>>({
    organizationId: organization.id,
    title: '',
    description: '',
    fullDescription: '',
    time: '',
    duration: '',
    location: organization.settings.defaultLocation || '',
    address: organization.settings.defaultAddress || '',
    price: {
      type: 'free',
      description: ''
    },
    eventbriteUrl: '',
    status: 'draft'
  })

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('price.')) {
      const priceField = field.split('.')[1]
      setFormData(prev => {
        const newPrice = { ...prev.price! }
        if (value === undefined || value === '') {
          if (priceField === 'amount' || priceField === 'advancePrice') {
            delete (newPrice as any)[priceField]
          } else if (priceField === 'type') {
            newPrice.type = 'free'
          } else if (priceField === 'description') {
            newPrice.description = ''
          }
        } else {
          (newPrice as any)[priceField] = value
        }
        return { ...prev, price: newPrice }
      })
    } else {
      setFormData(prev => {
        if (value === undefined || value === '') {
          const newData = { ...prev }
          delete (newData as any)[field]
          return newData
        } else {
          return { ...prev, [field]: value }
        }
      })
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
      if (!selectedDate && formData.status !== 'draft') {
        throw new Error('Please select an event date')
      }

      const rawEventData: CreateEventData = {
        ...formData as CreateEventData,
        date: selectedDate,
        endDate: endDate
      }

      // Clean the data to remove any undefined values
      const eventData = cleanObject(rawEventData) as CreateEventData

      // Use appropriate data source based on environment
      const dataSource = getDataSource()
      let response: any

      if (dataSource === 'firebase') {
        console.log('Creating one-time event via Firebase (development)')
        const eventId = await createEvent(eventData)
        response = { id: eventId, ...eventData }
        console.log('✅ One-time event created successfully:', { id: eventId, title: eventData.title })
      } else {
        console.log('Creating one-time event via API')
        response = await eventsApi.create(eventData)
        console.log('✅ One-time event created via API:', response)
      }
      
      onSuccess(response)
      onClose()
      
      // Reset form
      setFormData({
        organizationId: organization.id,
        title: '',
        description: '',
        fullDescription: '',
        time: '',
        duration: '',
        location: organization.settings.defaultLocation || '',
        address: organization.settings.defaultAddress || '',
        price: {
          type: 'free',
          description: ''
        },
        eventbriteUrl: '',
        status: 'draft'
      })
      setSelectedDate(undefined)
      setEndDate(undefined)
    } catch (err) {
      console.error('Failed to create one-time event:', err)
      setError(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle>Create One-Time Event</DialogTitle>
              <DialogDescription>
                Create a single event for {organization.name}
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

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                required={formData.status !== 'draft'}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
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
            <Label htmlFor="description">Brief Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the event"
              rows={2}
              required={formData.status !== 'draft'}
            />
          </div>

          <div>
            <Label htmlFor="fullDescription">Full Description</Label>
            <Textarea
              id="fullDescription"
              value={formData.fullDescription}
              onChange={(e) => handleInputChange('fullDescription', e.target.value)}
              placeholder="Detailed description of the event"
              rows={4}
            />
          </div>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">When</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Event Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required={formData.status !== 'draft'}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 2 hours"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Where</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Venue name"
                    required={formData.status !== 'draft'}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Full address"
                    required={formData.status !== 'draft'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Price Type</Label>
                <Select
                  value={formData.price?.type}
                  onValueChange={(value) => handleInputChange('price.type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.price?.type === 'paid' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Price Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.price?.amount || ''}
                        onChange={(e) => handleInputChange('price.amount', parseFloat(e.target.value) || undefined)}
                        placeholder="20.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="advancePrice">Advance Price</Label>
                      <Input
                        id="advancePrice"
                        type="number"
                        step="0.01"
                        value={formData.price?.advancePrice || ''}
                        onChange={(e) => handleInputChange('price.advancePrice', parseFloat(e.target.value) || undefined)}
                        placeholder="15.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="eventbriteUrl">Ticket Purchase Link {formData.status === 'published' ? '*' : '(optional)'}</Label>
                    <Input
                      id="eventbriteUrl"
                      value={formData.eventbriteUrl}
                      onChange={(e) => handleInputChange('eventbriteUrl', e.target.value)}
                      placeholder="https://eventbrite.com/... or https://venmo.com/..."
                      required={formData.status === 'published'}
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="priceDescription">Price Description</Label>
                <Input
                  id="priceDescription"
                  value={formData.price?.description}
                  onChange={(e) => handleInputChange('price.description', e.target.value)}
                  placeholder="e.g., Day of: $20 cash, $25 Venmo"
                />
              </div>

              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || undefined)}
                  placeholder="Maximum attendees"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}