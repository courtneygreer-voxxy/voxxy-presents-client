import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Save, Upload } from 'lucide-react'
import type { Venue } from '@/types/venue'

interface VenueProfileEditorProps {
  venue: Venue
  onUpdate: (updatedVenue: Venue) => void
}

export function VenueProfileEditor({ venue, onUpdate }: VenueProfileEditorProps) {
  const [formData, setFormData] = useState({
    name: venue.name,
    description: venue.description,
    capacity: venue.capacity,
    amenities: venue.amenities.join(', ')
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      console.log('Saving venue profile:', formData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedVenue: Venue = {
        ...venue,
        name: formData.name,
        description: formData.description,
        capacity: formData.capacity,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        updatedAt: new Date()
      }

      onUpdate(updatedVenue)
      setIsEditing(false)
      setSaveMessage('Profile updated successfully!')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving venue profile:', error)
      setSaveMessage('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: venue.name,
      description: venue.description,
      capacity: venue.capacity,
      amenities: venue.amenities.join(', ')
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {saveMessage && (
        <Alert className={`${saveMessage.includes('successfully') ? 'bg-green-400/10 border-green-400/30' : 'bg-red-400/10 border-red-400/30'}`}>
          <AlertDescription className={saveMessage.includes('successfully') ? 'text-green-300' : 'text-red-300'}>
            {saveMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Basic Information</h2>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Venue Name */}
          <div>
            <Label htmlFor="name" className="text-white">Venue Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
              />
            ) : (
              <p className="text-gray-300 mt-1">{venue.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
              />
            ) : (
              <p className="text-gray-300 mt-1">{venue.description}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <Label htmlFor="capacity" className="text-white">Capacity</Label>
            {isEditing ? (
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
              />
            ) : (
              <p className="text-gray-300 mt-1">{venue.capacity} people</p>
            )}
          </div>

          {/* Amenities */}
          <div>
            <Label htmlFor="amenities" className="text-white">Amenities</Label>
            {isEditing ? (
              <div>
                <Textarea
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => handleInputChange('amenities', e.target.value)}
                  placeholder="Enter amenities separated by commas..."
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Separate amenities with commas (e.g., WiFi, Sound System, Full Bar)
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {venue.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="bg-purple-600/80 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Location */}
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Contact & Location</h2>

        <div className="space-y-4">
          <div>
            <Label className="text-white">Address</Label>
            <p className="text-gray-300 mt-1">{venue.address}</p>
          </div>

          <div>
            <Label className="text-white">Venue Type</Label>
            <p className="text-gray-300 mt-1 capitalize">{venue.venueType.replace('_', ' ')}</p>
          </div>

          <div>
            <Label className="text-white">Pricing Type</Label>
            <p className="text-gray-300 mt-1 capitalize">{venue.pricingType}</p>
          </div>
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Accessibility Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {venue.accessibility.wheelchairAccessible && (
            <div className="bg-green-400/20 border border-green-400/30 rounded-lg p-3">
              <p className="text-green-400 font-medium">♿ Wheelchair Accessible</p>
            </div>
          )}
          {venue.accessibility.lgbtqFriendly && (
            <div className="bg-blue-400/20 border border-blue-400/30 rounded-lg p-3">
              <p className="text-blue-400 font-medium">🏳️‍🌈 LGBTQ+ Friendly</p>
            </div>
          )}
          {venue.accessibility.genderNeutralBathrooms && (
            <div className="bg-purple-400/20 border border-purple-400/30 rounded-lg p-3">
              <p className="text-purple-400 font-medium">🚻 Gender Neutral Bathrooms</p>
            </div>
          )}
          {!venue.accessibility.wheelchairAccessible &&
           !venue.accessibility.lgbtqFriendly &&
           !venue.accessibility.genderNeutralBathrooms && (
            <p className="text-gray-400 col-span-2">No accessibility features specified</p>
          )}
        </div>
      </div>

      {/* Photos Section */}
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Venue Photos</h2>
          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Photo upload placeholders */}
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="aspect-square bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
            >
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-sm mt-4">
          Upload high-quality photos to showcase your venue. Recommended: exterior, interior, and key features.
        </p>
      </div>
    </div>
  )
}