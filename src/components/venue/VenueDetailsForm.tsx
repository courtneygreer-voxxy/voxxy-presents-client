import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { VenueCreationRequest, VenueType, VenueHours } from '@/types/venue'

interface VenueDetailsFormProps {
  initialData?: Partial<VenueCreationRequest>
  onComplete: (data: Partial<VenueCreationRequest>) => void
  onBack: () => void
}

const VENUE_TYPES: { value: VenueType; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'community_center', label: 'Community Center' },
  { value: 'outdoor', label: 'Outdoor Space' },
  { value: 'event_space', label: 'Event Space' },
  { value: 'other', label: 'Other' }
]

const COMMON_AMENITIES = [
  'WiFi', 'Sound System', 'Full Bar', 'Kitchen', 'Outdoor Seating',
  'Private Event Space', 'Projector', 'Stage Area', 'Parking',
  'ADA Accessible', 'Loading Dock', 'High Ceilings'
]

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
] as const

export function VenueDetailsForm({ initialData, onComplete, onBack }: VenueDetailsFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    venueType: initialData?.venueType || ('bar' as VenueType),
    capacity: initialData?.capacity || 50,
    amenities: initialData?.amenities || [],
    pricingType: initialData?.pricingType || ('both' as 'paid' | 'free' | 'both'),
    hours: initialData?.hours || {} as VenueHours,
    accessibility: initialData?.accessibility || {
      wheelchairAccessible: false,
      lgbtqFriendly: false,
      '420Friendly': false,
      genderNeutralBathrooms: false
    }
  })

  const [customAmenity, setCustomAmenity] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addAmenity = (amenity: string) => {
    if (amenity && !formData.amenities.includes(amenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }))
    }
  }

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }))
  }

  const addCustomAmenity = () => {
    if (customAmenity.trim()) {
      addAmenity(customAmenity.trim())
      setCustomAmenity('')
    }
  }

  const handleHoursChange = (day: keyof VenueHours, timeType: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: prev.hours[day] ? { ...prev.hours[day], [timeType]: value } : { open: '', close: '', [timeType]: value }
      }
    }))
  }

  const toggleDayClosed = (day: keyof VenueHours) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: prev.hours[day] ? null : { open: '09:00', close: '17:00' }
      }
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Venue name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onComplete(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Basic Information</h3>
          <p className="text-gray-300">
            Tell us about your venue's key details
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Venue Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., The Brooklyn Lounge"
              className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 ${errors.name ? 'border-red-400' : ''}`}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your venue's atmosphere, style, and what makes it special..."
              rows={4}
              className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 ${errors.description ? 'border-red-400' : ''}`}
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label htmlFor="address" className="text-white">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main St, Brooklyn, NY 11201"
              className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 ${errors.address ? 'border-red-400' : ''}`}
            />
            {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="venueType" className="text-white">Venue Type</Label>
              <Select value={formData.venueType} onValueChange={(value) => handleInputChange('venueType', value as VenueType)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {VENUE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-700">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="capacity" className="text-white">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 ${errors.capacity ? 'border-red-400' : ''}`}
              />
              {errors.capacity && <p className="text-red-400 text-sm mt-1">{errors.capacity}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Amenities</h3>
          <p className="text-gray-300">
            What features and amenities does your venue offer?
          </p>
        </div>
        <div className="space-y-4">
          {/* Common Amenities */}
          <div className="flex flex-wrap gap-2">
            {COMMON_AMENITIES.map(amenity => (
              <Button
                key={amenity}
                type="button"
                variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                size="sm"
                onClick={() => formData.amenities.includes(amenity) ? removeAmenity(amenity) : addAmenity(amenity)}
                className={formData.amenities.includes(amenity) ?
                  "bg-purple-600 hover:bg-purple-700 text-white" :
                  "bg-white/10 border-white/20 text-white hover:bg-white/20"}
              >
                {amenity}
              </Button>
            ))}
          </div>

          {/* Selected Amenities */}
          {formData.amenities.length > 0 && (
            <div>
              <Label className="text-white">Selected Amenities</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.amenities.map(amenity => (
                  <Badge key={amenity} className="bg-purple-600/80 text-white flex items-center gap-1">
                    {amenity}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-400"
                      onClick={() => removeAmenity(amenity)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Custom Amenity */}
          <div className="flex gap-2">
            <Input
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              placeholder="Add custom amenity..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
            />
            <Button
              type="button"
              onClick={addCustomAmenity}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Accessibility</h3>
          <p className="text-gray-300">
            Help event organizers understand your venue's accessibility features
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="wheelchairAccessible" className="text-white">Wheelchair Accessible</Label>
              <Switch
                id="wheelchairAccessible"
                checked={formData.accessibility.wheelchairAccessible}
                onCheckedChange={(checked) => handleInputChange('accessibility', {
                  ...formData.accessibility,
                  wheelchairAccessible: checked
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lgbtqFriendly" className="text-white">LGBTQ+ Friendly</Label>
              <Switch
                id="lgbtqFriendly"
                checked={formData.accessibility.lgbtqFriendly}
                onCheckedChange={(checked) => handleInputChange('accessibility', {
                  ...formData.accessibility,
                  lgbtqFriendly: checked
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="genderNeutralBathrooms" className="text-white">Gender Neutral Bathrooms</Label>
              <Switch
                id="genderNeutralBathrooms"
                checked={formData.accessibility.genderNeutralBathrooms || false}
                onCheckedChange={(checked) => handleInputChange('accessibility', {
                  ...formData.accessibility,
                  genderNeutralBathrooms: checked
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Continue to Owner Info
        </Button>
      </div>
    </form>
  )
}