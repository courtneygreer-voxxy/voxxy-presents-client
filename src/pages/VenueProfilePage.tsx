import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Mail,
  Phone,
  ExternalLink,
  Star,
  Wifi,
  Car,
  Utensils,
  Music,
  Camera,
  Accessibility,
  Crown,
  Loader
} from 'lucide-react'
import { VenueGallery } from '@/components/venue/VenueGallery'
import { VenueContactModal } from '@/components/venue/VenueContactModal'
import { Venue, VenueType } from '@/types/venue'
import { venueService } from '@/services/venueService'

// Mock data for development - replace with API call
import { getDevVenues } from '../../scripts/seed-dev-venues'

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-4 w-4" />,
  'Parking': <Car className="h-4 w-4" />,
  'Full Bar': <Utensils className="h-4 w-4" />,
  'Kitchen': <Utensils className="h-4 w-4" />,
  'Sound System': <Music className="h-4 w-4" />,
  'ADA Accessible': <Accessibility className="h-4 w-4" />,
  'Projector': <Camera className="h-4 w-4" />,
  'Outdoor Seating': <Users className="h-4 w-4" />
}

const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  'bar': 'Bar',
  'restaurant': 'Restaurant',
  'community_center': 'Community Center',
  'outdoor': 'Outdoor Space',
  'event_space': 'Event Space',
  'other': 'Other'
}

export default function VenueProfilePage() {
  const { venueSlug } = useParams<{ venueSlug: string }>()
  const navigate = useNavigate()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  useEffect(() => {
    const loadVenue = async () => {
      if (!venueSlug) {
        setError('Venue not found')
        setLoading(false)
        return
      }

      try {
        // For development, use mock data
        const devVenues = getDevVenues()
        const foundVenue = devVenues.find(v => v.slug === venueSlug)
        
        if (foundVenue) {
          setVenue(foundVenue)
        } else {
          setError('Venue not found')
        }
      } catch (err) {
        console.error('Error loading venue:', err)
        setError('Failed to load venue information')
      } finally {
        setLoading(false)
      }
    }

    loadVenue()
  }, [venueSlug])

  const formatHours = (hours: Venue['hours']) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    return days.map((day, index) => {
      const dayHours = hours[day as keyof typeof hours]
      return {
        day: dayLabels[index],
        hours: dayHours ? `${dayHours.open} - ${dayHours.close}` : 'Closed'
      }
    })
  }

  const handleClaimOwnership = () => {
    // Navigate to venue owner signup with venue pre-selected
    navigate(`/venue-owner-signup?venue=${venue?.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading venue...</p>
        </div>
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Venue Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested venue could not be found.'}</p>
          <Button onClick={() => navigate('/voxxy-shop/venues')}>
            Browse All Venues
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="outline"
            onClick={() => navigate('/voxxy-shop/venues')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Venues
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
                <Badge variant="secondary">
                  {VENUE_TYPE_LABELS[venue.venueType]}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{venue.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Capacity: {venue.capacity}</span>
                </div>
              </div>
            </div>

            {venue.claimStatus === 'unclaimed' && (
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Own this venue?</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Claim ownership to manage your listing
                  </p>
                  <Button 
                    size="sm" 
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    onClick={handleClaimOwnership}
                  >
                    Claim Ownership
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Gallery and Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <Card>
              <CardContent className="p-6">
                <VenueGallery photos={venue.photos} venueName={venue.name} />
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About {venue.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{venue.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities & Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {venue.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {AMENITY_ICONS[amenity] || <Star className="h-4 w-4" />}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking and Details */}
          <div className="space-y-6">
            {/* Contact & Booking */}
            <Card>
              <CardHeader>
                <CardTitle>Book This Venue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full"
                  size="lg"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact for Booking
                </Button>
                
                <div className="text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Coming Soon:</strong> Direct booking and availability calendar
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Quick Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="break-all">{venue.contactInfo.email}</span>
                  </div>
                  {venue.contactInfo.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{venue.contactInfo.phone}</span>
                    </div>
                  )}
                  {venue.contactInfo.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                      <a 
                        href={venue.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatHours(venue.hours).map((dayHours, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{dayHours.day}</span>
                      <span className={dayHours.hours === 'Closed' ? 'text-gray-500' : 'text-gray-700'}>
                        {dayHours.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">{venue.address}</p>
                
                {/* Placeholder for Google Maps integration */}
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">
                    Interactive map coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <VenueContactModal
        venue={venue}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  )
}