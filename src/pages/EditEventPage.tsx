import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowLeft, Eye, Trash2, AlertTriangle, Loader, ChevronLeft } from "lucide-react"
import { format } from "date-fns"
import { eventsApi } from "@/services/api"
import { updateEvent, getEvent } from "@/lib/database"
import { getDataSource } from "@/config/environments"
import { organizationsApi } from "@/services/api"
import { getOrganizationBySlug } from "@/lib/database"
import type { Event, UpdateEventData, Organization } from "@/types/database"
import { FORM_STYLES } from "@/styles/forms"

export default function EditEventPage() {
  const navigate = useNavigate()
  const { orgSlug, eventId } = useParams<{ orgSlug: string; eventId: string }>()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState<Partial<UpdateEventData>>({
    title: '',
    description: '',
    fullDescription: '',
    time: '',
    duration: '2 hours',
    location: '',
    address: '',
    price: {
      type: 'free',
      description: 'Free Event',
      amount: 0
    },
    capacity: undefined,
    imageUrl: '',
    status: 'draft'
  })

  // Load organization and event data
  useEffect(() => {
    const loadData = async () => {
      if (!orgSlug || !eventId) {
        setError('Organization slug or event ID missing')
        setIsLoadingData(false)
        return
      }

      try {
        const dataSource = getDataSource()
        let orgData: Organization | null = null
        let eventData: Event | null = null

        if (dataSource === 'firebase') {
          orgData = await getOrganizationBySlug(orgSlug)
          eventData = await getEvent(eventId)
        } else {
          const [orgResponse, eventResponse] = await Promise.all([
            organizationsApi.getBySlug(orgSlug),
            eventsApi.getById(eventId)
          ])
          orgData = orgResponse
          eventData = eventResponse
        }

        if (!orgData) {
          setError('Organization not found')
          setIsLoadingData(false)
          return
        }

        if (!eventData) {
          setError('Event not found')
          setIsLoadingData(false)
          return
        }

        setOrganization(orgData)
        setEvent(eventData)

        // Initialize form data
        setFormData({
          title: eventData.title,
          description: eventData.description,
          fullDescription: eventData.fullDescription,
          time: eventData.time,
          duration: eventData.duration,
          location: eventData.location,
          address: eventData.address,
          price: { ...eventData.price },
          capacity: eventData.capacity,
          imageUrl: eventData.imageUrl,
          status: eventData.status
        })

        setSelectedDate(eventData.date instanceof Date ? eventData.date : new Date(eventData.date))

      } catch (error) {
        console.error('Failed to load data:', error)
        setError('Failed to load event data')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [orgSlug, eventId])

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
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization || !event || !selectedDate) return

    setIsLoading(true)
    setError(null)

    try {
      const updateData: UpdateEventData = {
        ...formData,
        date: selectedDate
      }

      const dataSource = getDataSource()

      if (dataSource === 'firebase') {
        await updateEvent(event.id, updateData)
      } else {
        await eventsApi.update(event.id, updateData)
      }

      navigate(`/${orgSlug}/admin?tab=events`)
    } catch (error) {
      console.error('Failed to update event:', error)
      setError('Failed to update event. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event || !organization) return

    const confirmed = window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)
    if (!confirmed) return

    setIsDeleting(true)
    setError(null)

    try {
      const dataSource = getDataSource()

      if (dataSource === 'firebase') {
        // Firebase delete implementation would go here
        console.log('Delete via Firebase not implemented yet')
      } else {
        await eventsApi.delete(event.id)
      }

      navigate(`/${orgSlug}/admin?tab=events`)
    } catch (error) {
      console.error('Failed to delete event:', error)
      setError('Failed to delete event. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="container max-w-4xl mx-auto pt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/${orgSlug}/admin`)}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!organization || !event) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden py-8">
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-white">
              Edit Event ✏️
            </h1>
          </div>
          <p className="text-gray-200">
            Update your event details for {organization.name}
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-gray-300 hover:bg-white/10"
          >
            <Link to={`/${orgSlug}/admin?tab=events`}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg mb-8">
          <div className="p-6">
            {showPreview ? (
              /* Preview Mode */
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Event Preview</h2>
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/15"
                  >
                    Edit Form
                  </Button>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {formData.status}
                      </Badge>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {formData.title || 'Event Title'}
                      </h3>
                      <p className="text-gray-300 mb-3">
                        {formData.description || 'Event description will appear here...'}
                      </p>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : 'Date not set'} • {formData.time || 'Time not set'}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          {formData.location || 'Location not set'}
                        </div>
                        <div className="text-sm font-medium text-white">
                          Price: {formData.price?.description || 'Price not set'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Event Details</h2>
                  <Button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/15"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title" className="text-white">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={FORM_STYLES.input}
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-white">Short Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={FORM_STYLES.textarea}
                      placeholder="Brief description for event listings"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="fullDescription" className="text-white">Full Description</Label>
                    <Textarea
                      id="fullDescription"
                      value={formData.fullDescription || ''}
                      onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                      className={FORM_STYLES.textarea}
                      placeholder="Detailed event description and information"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label className="text-white">Event Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={FORM_STYLES.input + " justify-start text-left font-normal"}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white/15 backdrop-blur-md border-white/30">
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
                    <Label htmlFor="time" className="text-white">Start Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className={FORM_STYLES.input}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-white">Venue Name *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className={FORM_STYLES.input}
                      placeholder="Venue or location name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-white">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={FORM_STYLES.input}
                      placeholder="Full address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="priceType" className="text-white">Price Type</Label>
                    <Select
                      value={formData.price?.type}
                      onValueChange={(value) => handleInputChange('price.type', value)}
                    >
                      <SelectTrigger className={FORM_STYLES.select}>
                        <SelectValue placeholder="Select price type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/15 backdrop-blur-md border-white/30">
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priceDescription" className="text-white">Price Description</Label>
                    <Input
                      id="priceDescription"
                      value={formData.price?.description}
                      onChange={(e) => handleInputChange('price.description', e.target.value)}
                      className={FORM_STYLES.input}
                      placeholder="e.g., Free Event, $25, Suggested $10 donation"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-white">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className={FORM_STYLES.select}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/15 backdrop-blur-md border-white/30">
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="capacity" className="text-white">Capacity (optional)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity || ''}
                      onChange={(e) => handleInputChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                      className={FORM_STYLES.input}
                      placeholder="Maximum attendees"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800">
                    {error}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        {!showPreview && (
          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </>
              )}
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedDate}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Event'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}