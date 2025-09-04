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
  Loader,
  Instagram,
  Video
} from 'lucide-react'
import { VenueGallery } from '@/components/venue/VenueGallery'
import { VenueContactModal } from '@/components/venue/VenueContactModal'
import { Venue, VenueType } from '@/types/venue'

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="text-center relative z-10">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Loading venue...</p>
        </div>
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-bold text-white mb-4">Venue Not Found</h1>
          <p className="text-gray-300 mb-6">{error || 'The requested venue could not be found.'}</p>
          <button
            onClick={() => navigate('/voxxy-shop/venues')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 rounded-lg"
          >
            Browse All Venues
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Header - Navigation Only */}
      <div className="bg-gray-800 border-b border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => navigate('/voxxy-shop/venues')}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Venues
          </button>
        </div>
      </div>

      {/* Venue Title Section */}
      <div className="bg-gray-900 border-b border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-white">{venue.name}</h1>
                <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-sm rounded-full">
                  {VENUE_TYPE_LABELS[venue.venueType]}
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-gray-300">
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        {/* Hero Section - Gallery and Key Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Photo Gallery */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <VenueGallery photos={venue.photos} venueName={venue.name} />
          </div>

          {/* Right Side - Key Details & Booking */}
          <div className="space-y-4">
            {/* Location */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                Location
              </h2>
              <p className="text-sm text-gray-200 mb-3">{venue.address}</p>
              <div className="bg-white/5 border border-white/10 rounded-lg h-32 flex items-center justify-center">
                <p className="text-gray-400 text-xs">Interactive map coming soon</p>
              </div>
            </div>

            {/* Venue Details */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <h2 className="text-base font-semibold text-white mb-3">Venue Details</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-purple-400" />
                    <span className="text-gray-300">Capacity</span>
                  </div>
                  <span className="font-medium text-white">{venue.capacity}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-purple-400" />
                    <span className="text-gray-300">Type</span>
                  </div>
                  <span className="font-medium text-white">{VENUE_TYPE_LABELS[venue.venueType]}</span>
                </div>
                {venue.contactInfo.phone && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-purple-400" />
                      <span className="text-gray-300">Phone</span>
                    </div>
                    <span className="font-medium text-white text-xs">{venue.contactInfo.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Book This Venue */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <h2 className="text-base font-semibold text-white mb-3">Book This Venue</h2>
              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 rounded-lg font-medium flex items-center justify-center gap-2 text-sm mb-3"
              >
                <Mail className="h-4 w-4" />
                Contact for Booking
              </button>
              
              <div className="text-center p-2 bg-purple-500/10 border border-purple-400/20 rounded-lg">
                <p className="text-xs text-purple-200">
                  <strong>Coming Soon:</strong> Direct booking calendar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities & Features - Compact Tags */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">What This Venue Offers</h2>
            
            <div className="flex flex-wrap gap-2">
              {venue.amenities.map((amenity, index) => (
                <div key={index} className="inline-flex items-center gap-2 px-3 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full text-sm font-medium text-purple-200 hover:bg-purple-500/30 transition-all duration-200">
                  <div className="text-purple-300">
                    {AMENITY_ICONS[amenity] || <Star className="h-3 w-3" />}
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* About Section - Full Width */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">About {venue.name}</h2>
            <p className="text-gray-200 leading-relaxed">{venue.description}</p>
          </div>
        </div>

        {/* Contact Information & Hours - Combined Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-purple-400" />
                <span className="break-all text-gray-200 text-sm">{venue.contactInfo.email}</span>
              </div>
              {venue.contactInfo.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-200 text-sm">{venue.contactInfo.phone}</span>
                </div>
              )}
              {venue.contactInfo.website && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-4 w-4 text-purple-400" />
                  <a 
                    href={venue.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 hover:text-purple-200 transition-colors break-all text-sm"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              {venue.contactInfo.instagram && (
                <div className="flex items-center gap-3">
                  <Instagram className="h-4 w-4 text-purple-400" />
                  <a 
                    href={`https://instagram.com/${venue.contactInfo.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 hover:text-purple-200 transition-colors text-sm"
                  >
                    @{venue.contactInfo.instagram.replace('@', '')}
                  </a>
                </div>
              )}
              {venue.contactInfo.tiktok && (
                <div className="flex items-center gap-3">
                  <Video className="h-4 w-4 text-purple-400" />
                  <a 
                    href={`https://tiktok.com/@${venue.contactInfo.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 hover:text-purple-200 transition-colors text-sm"
                  >
                    @{venue.contactInfo.tiktok.replace('@', '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Hours */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-purple-400" />
              Hours
            </h2>
            <div className="space-y-2">
              {formatHours(venue.hours).map((dayHours, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-white">{dayHours.day}</span>
                  <span className={dayHours.hours === 'Closed' ? 'text-gray-400' : 'text-gray-200'}>
                    {dayHours.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Claim Ownership Banner */}
      {venue.claimStatus === 'unclaimed' && (
        <div className="bg-gray-800/50 border-t border-white/5 relative z-10">
          <div className="container mx-auto px-4 py-3 max-w-7xl">
            <div className="flex items-center justify-center">
              <button
                className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-gray-300 transition-all duration-200 rounded text-xs"
                onClick={handleClaimOwnership}
              >
                <Crown className="h-3 w-3" />
                <span>Own this venue? Claim ownership</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      <VenueContactModal
        venue={venue}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  )
}