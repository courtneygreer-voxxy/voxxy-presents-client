import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, X, Plus, Loader, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { eventsApi } from "@/services/api"
import type { Event, UpdateEventData } from "@/types/database"

interface EventEditFormProps {
  event: Event
  isOpen: boolean
  onClose: () => void
  onSuccess: (event: any) => void
  onDelete?: (eventId: string) => void
}

interface RecurringDate {
  date: string
  theme: string
  description: string
}

export default function EventEditForm({ event, isOpen, onClose, onSuccess, onDelete }: EventEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [recurringDates, setRecurringDates] = useState<RecurringDate[]>([])
  
  const [formData, setFormData] = useState<Partial<UpdateEventData>>({})

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        fullDescription: event.fullDescription,
        time: event.time,
        duration: event.duration,
        location: event.location,
        address: event.address,
        price: { ...event.price },
        capacity: event.capacity,
        registrationRequired: event.registrationRequired,
        eventbriteUrl: event.eventbriteUrl,
        presaleEnabled: event.presaleEnabled,
        series: event.series ? { ...event.series } : undefined,
        isRecurring: event.isRecurring,
        imageUrl: event.imageUrl,
        status: event.status
      })
      
      setSelectedDate(event.date instanceof Date ? event.date : new Date(event.date))
      setEndDate(event.endDate ? (event.endDate instanceof Date ? event.endDate : new Date(event.endDate)) : undefined)
      setRecurringDates(event.recurringDates || [])
    }
  }, [event])

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('price.')) {
      const priceField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        price: {
          ...prev.price!,
          [priceField]: value
        }
      }))
    } else if (field.startsWith('series.')) {
      const seriesField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        series: {
          ...prev.series!,
          [seriesField]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const addRecurringDate = () => {
    setRecurringDates(prev => [...prev, { date: '', theme: '', description: '' }])
  }

  const updateRecurringDate = (index: number, field: keyof RecurringDate, value: string) => {
    setRecurringDates(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const removeRecurringDate = (index: number) => {
    setRecurringDates(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!selectedDate) {
        throw new Error('Please select an event date')
      }

      const updateData: UpdateEventData = {
        ...formData,
        date: selectedDate,
        endDate: endDate,
        recurringDates: formData.isRecurring && recurringDates.length > 0 ? recurringDates : undefined
      }

      const response = await eventsApi.update(event.id, updateData)
      onSuccess(response)
      onClose()
    } catch (err) {
      console.error('Failed to update event:', err)
      setError(err instanceof Error ? err.message : 'Failed to update event')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`
    )
    
    if (!confirmDelete) return

    setIsDeleting(true)
    setError(null)

    try {
      await eventsApi.delete(event.id)
      onDelete(event.id)
      onClose()
    } catch (err) {
      console.error('Failed to delete event:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete event')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the details for "{event.title}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                required
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
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the event"
              rows={2}
              required
            />
          </div>

          <div>
            <Label htmlFor="fullDescription">Full Description</Label>
            <Textarea
              id="fullDescription"
              value={formData.fullDescription || ''}
              onChange={(e) => handleInputChange('fullDescription', e.target.value)}
              placeholder="Detailed description of the event"
              rows={4}
            />
          </div>

          {/* Date & Time */}
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
                value={formData.time || ''}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration || ''}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 2 hours"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Venue name"
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full address"
                required
              />
            </div>
          </div>

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
                    <SelectItem value="donation">Donation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.price?.type === 'paid' && (
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
              )}

              <div>
                <Label htmlFor="priceDescription">Price Description</Label>
                <Input
                  id="priceDescription"
                  value={formData.price?.description || ''}
                  onChange={(e) => handleInputChange('price.description', e.target.value)}
                  placeholder="e.g., Day of: $20 cash, $25 Venmo"
                />
              </div>
            </CardContent>
          </Card>

          {/* Registration Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="registrationRequired"
                  checked={formData.registrationRequired || false}
                  onCheckedChange={(checked) => handleInputChange('registrationRequired', checked)}
                />
                <Label htmlFor="registrationRequired">Registration Required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="presaleEnabled"
                  checked={formData.presaleEnabled || false}
                  onCheckedChange={(checked) => handleInputChange('presaleEnabled', checked)}
                />
                <Label htmlFor="presaleEnabled">Enable Presale</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="eventbriteUrl">Eventbrite URL</Label>
                  <Input
                    id="eventbriteUrl"
                    value={formData.eventbriteUrl || ''}
                    onChange={(e) => handleInputChange('eventbriteUrl', e.target.value)}
                    placeholder="https://eventbrite.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Series Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Series (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seriesName">Series Name</Label>
                <Input
                  id="seriesName"
                  value={formData.series?.name || ''}
                  onChange={(e) => handleInputChange('series.name', e.target.value)}
                  placeholder="e.g., Weekly Figure Drawing"
                />
              </div>

              <div>
                <Label htmlFor="seriesDescription">Series Description</Label>
                <Textarea
                  id="seriesDescription"
                  value={formData.series?.description || ''}
                  onChange={(e) => handleInputChange('series.description', e.target.value)}
                  placeholder="Description of the event series"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recurring Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recurring Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRecurring"
                  checked={formData.isRecurring || false}
                  onCheckedChange={(checked) => {
                    handleInputChange('isRecurring', checked)
                    if (!checked) {
                      setRecurringDates([])
                    }
                  }}
                />
                <Label htmlFor="isRecurring">This is a recurring event</Label>
              </div>

              {formData.isRecurring && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Recurring Dates & Themes</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addRecurringDate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Date
                    </Button>
                  </div>

                  {recurringDates.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                          placeholder="Date (e.g., Jan 15)"
                          value={item.date}
                          onChange={(e) => updateRecurringDate(index, 'date', e.target.value)}
                        />
                        <Input
                          placeholder="Theme"
                          value={item.theme}
                          onChange={(e) => updateRecurringDate(index, 'theme', e.target.value)}
                        />
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateRecurringDate(index, 'description', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecurringDate(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl || ''}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {onDelete && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Event
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Update Event
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}