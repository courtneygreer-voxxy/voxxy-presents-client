import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X, Plus, Loader, ArrowLeft, Sparkles, Search } from "lucide-react"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import { eventsApi } from "@/services/api"
import { createEvent } from "@/lib/database"
import { getDataSource } from "@/config/environments"
import { organizationsApi } from "@/services/api"
import { getOrganizationBySlug } from "@/lib/database"
import type { CreateEventData, Organization } from "@/types/database"
import { FORM_STYLES } from "@/styles/forms"

interface RecurringDate {
  date: string
  theme: string
  description: string
}

export default function CreateEventPage() {
  const navigate = useNavigate()
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOrg, setIsLoadingOrg] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [recurringDates, setRecurringDates] = useState<RecurringDate[]>([])

  // Load organization data
  useEffect(() => {
    const loadOrganization = async () => {
      console.log('🔍 Debug - orgSlug:', orgSlug)
      if (!orgSlug) {
        console.log('❌ No orgSlug provided')
        setError('Organization slug missing')
        setIsLoadingOrg(false)
        return
      }

      try {
        const dataSource = getDataSource()
        console.log('🔍 Debug - dataSource:', dataSource)
        let org: Organization | null = null

        if (dataSource === 'firebase') {
          console.log('🔍 Debug - Loading via Firebase...')
          org = await getOrganizationBySlug(orgSlug)
        } else {
          console.log('🔍 Debug - Loading via API...')
          const response = await organizationsApi.getBySlug(orgSlug)
          org = response
        }

        console.log('🔍 Debug - loaded org:', org)

        if (!org) {
          console.log('❌ Organization not found for slug:', orgSlug)
          setError('Organization not found')
          return
        }

        setOrganization(org)
      } catch (err) {
        console.error('❌ Failed to load organization:', err)
        setError('Failed to load organization')
      } finally {
        setIsLoadingOrg(false)
      }
    }

    loadOrganization()
  }, [orgSlug])

  const [formData, setFormData] = useState<Partial<CreateEventData>>({
    organizationId: '',
    title: '',
    description: '',
    fullDescription: '',
    time: '',
    duration: '',
    location: '',
    address: '',
    price: {
      type: 'free',
      description: ''
    },
    isRecurring: false,
    status: 'draft'
  })

  // Update form data when organization loads
  useEffect(() => {
    if (organization) {
      setFormData(prev => ({
        ...prev,
        organizationId: organization.id,
        location: organization.settings?.defaultLocation || '',
        address: organization.settings?.defaultAddress || ''
      }))
    }
  }, [organization])

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('price.groupDealDetails.')) {
      const dealField = field.split('.')[2]
      setFormData(prev => {
        const newPrice = { ...prev.price! }
        if (!newPrice.groupDealDetails) {
          newPrice.groupDealDetails = {
            minimumPeople: 0,
            pricePerPerson: 0,
            normalPricePerPerson: 0
          }
        }
        if (value === undefined || value === '') {
          if (dealField === 'minimumPeople' || dealField === 'pricePerPerson' || dealField === 'normalPricePerPerson') {
            newPrice.groupDealDetails[dealField] = 0
          }
        } else {
          if (dealField === 'minimumPeople' || dealField === 'pricePerPerson' || dealField === 'normalPricePerPerson') {
            newPrice.groupDealDetails[dealField] = value as number
          }
        }
        return { ...prev, price: newPrice }
      })
    } else if (field.startsWith('price.')) {
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
    } else if (field.startsWith('series.')) {
      const seriesField = field.split('.')[1]
      setFormData(prev => {
        if (value === undefined || value === '') {
          const newSeries = { ...prev.series! }
          if (seriesField === 'name' || seriesField === 'description') {
            delete (newSeries as any)[seriesField]
          }
          return { ...prev, series: Object.keys(newSeries).length > 0 ? newSeries : undefined }
        } else {
          return {
            ...prev,
            series: {
              ...prev.series!,
              [seriesField]: value
            }
          }
        }
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
    if (!organization) return

    setIsLoading(true)
    setError(null)

    try {
      if (!selectedDate) {
        throw new Error('Please select an event date')
      }

      const rawEventData: CreateEventData = {
        ...formData as CreateEventData,
        date: selectedDate,
        endDate: endDate,
        recurringDates: formData.isRecurring && recurringDates.length > 0 ? recurringDates : undefined
      }

      const eventData = cleanObject(rawEventData) as CreateEventData

      const dataSource = getDataSource()
      let response: any

      if (dataSource === 'firebase') {
        console.log('Creating event via Firebase (development)')
        const eventId = await createEvent(eventData)
        response = { id: eventId, ...eventData }
      } else {
        console.log('Creating event via API')
        response = await eventsApi.create(eventData)
      }

      // Navigate back to admin with success
      navigate(`/${orgSlug}/admin`, {
        state: {
          message: `Event "${eventData.title}" created successfully!`,
          newEvent: response
        }
      })

    } catch (err) {
      console.error('Failed to create event:', err)
      setError(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingOrg) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading organization...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
        <Card className="bg-white/15 backdrop-blur-md border-white/30 text-white shadow-2xl shadow-black/50 max-w-md">
          <CardContent className="text-center p-8">
            <p className="text-red-300 mb-4">{error || 'Organization not found'}</p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />

      {/* Header */}
      <header className="relative z-10 bg-gray-800 border-b border-white/10 px-4 py-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                asChild
                className="text-white hover:bg-white/10"
              >
                <Link to={`/${orgSlug}/admin`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                  Create New Event
                </h1>
                <p className="text-gray-300">for {organization.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto max-w-4xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Card className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-white">
              <CardContent className="p-4">
                <p className="text-sm font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Basic Info Card */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
            <CardHeader>
              <CardTitle className="text-white">Event Details</CardTitle>
              <CardDescription className="text-gray-300">
                Basic information about your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title" className={FORM_STYLES.label}>Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter event title"
                    className={FORM_STYLES.input}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status" className={FORM_STYLES.label}>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className={FORM_STYLES.select}>
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
                <Label htmlFor="description" className={FORM_STYLES.label}>Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the event"
                  rows={2}
                  className={FORM_STYLES.textarea}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fullDescription" className={FORM_STYLES.label}>Full Description</Label>
                <Textarea
                  id="fullDescription"
                  value={formData.fullDescription}
                  onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                  placeholder="Detailed description of the event"
                  rows={4}
                  className={FORM_STYLES.textarea}
                />
              </div>
            </CardContent>
          </Card>

          {/* Date & Time Card */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
            <CardHeader>
              <CardTitle className="text-white">Date & Time</CardTitle>
              <CardDescription className="text-gray-300">
                When is your event happening?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className={FORM_STYLES.label}>Event Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/15"
                      >
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
                  <Label htmlFor="time" className={FORM_STYLES.label}>Time *</Label>
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
                  <Label htmlFor="duration" className={FORM_STYLES.label}>Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 2 hours"
                    className={FORM_STYLES.input}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
            <CardHeader>
              <CardTitle className="text-white">Location</CardTitle>
              <CardDescription className="text-gray-300">
                Where is your event taking place?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className={FORM_STYLES.label}>Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Venue name"
                    className={FORM_STYLES.input}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address" className={FORM_STYLES.label}>Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Full address"
                    className={FORM_STYLES.input}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/voxxy-shop/venues')}
                  className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/15"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Help us find the venue
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
            <CardContent className="flex items-center justify-between p-6">
              <p className="text-gray-300">Ready to create your event?</p>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="bg-white/10 border-white/20 text-white hover:bg-white/15"
                >
                  <Link to={`/${orgSlug}/admin`}>Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Create Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}