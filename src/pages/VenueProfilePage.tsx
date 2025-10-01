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
  Video,
  Calendar,
  DollarSign,
  Shield,
  Heart,
  Leaf,
  Share,
  Bell,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Plus,
  Settings
} from 'lucide-react'
import { VenueGallery } from '@/components/venue/VenueGallery'
import { VenueContactModal } from '@/components/venue/VenueContactModal'
import { SubscriptionModal } from '@/components/SubscriptionModal'
import { ShareButton } from '@/components/ShareButton'
import { Venue, VenueType } from '@/types/venue'
import { venuesApi } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

// Mock data for development - fallback only
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

const ACCESSIBILITY_ICONS = {
  wheelchairAccessible: <Accessibility className="h-4 w-4" />,
  lgbtqFriendly: <Heart className="h-4 w-4" />,
  '420Friendly': <Leaf className="h-4 w-4" />,
  genderNeutralBathrooms: <Users className="h-4 w-4" />,
  hearingAccessible: <Shield className="h-4 w-4" />,
  visuallyAccessible: <Shield className="h-4 w-4" />
}

const ACCESSIBILITY_LABELS = {
  wheelchairAccessible: 'Wheelchair Accessible',
  lgbtqFriendly: 'LGBTQ+ Friendly',
  '420Friendly': '420 Friendly',
  genderNeutralBathrooms: 'Gender Neutral Bathrooms',
  hearingAccessible: 'Hearing Accessible',
  visuallyAccessible: 'Visually Accessible'
}

export default function VenueProfilePage() {
  const { venueSlug } = useParams<{ venueSlug: string }>()
  const navigate = useNavigate()
  const { currentUser, isVenueOwner } = useAuth()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isPhotosExpanded, setIsPhotosExpanded] = useState(false)
  const [isOwnerOfThisVenue, setIsOwnerOfThisVenue] = useState(false)

  useEffect(() => {
    const loadVenue = async () => {
      if (!venueSlug) {
        console.error('🚨 VENUE PROFILE DEBUG: No venue slug provided')
        setError('Venue not found')
        setLoading(false)
        return
      }

      console.log('🏢 VENUE PROFILE DEBUG: Loading venue with slug:', venueSlug)

      try {
        // First try to load from real API
        console.log('🌐 VENUE PROFILE DEBUG: Attempting API call to venuesApi.getBySlug')
        const apiResponse = await venuesApi.getBySlug(venueSlug)

        console.log('🌐 VENUE PROFILE DEBUG: API response:', apiResponse)

        if (apiResponse.success && apiResponse.venue) {
          console.log('✅ VENUE PROFILE DEBUG: Found venue in API:', apiResponse.venue.name)
          setVenue(apiResponse.venue)

          // Check if current user owns this venue
          if (currentUser && isVenueOwner && apiResponse.venue.ownerId === currentUser.uid) {
            console.log('🏢 VENUE PROFILE DEBUG: Current user owns this venue')
            setIsOwnerOfThisVenue(true)
          }
        } else {
          console.log('⚠️ VENUE PROFILE DEBUG: API call failed or no venue found, trying mock data')

          // Fallback to mock data for development
          const devVenues = getDevVenues()
          const foundVenue = devVenues.find(v => v.slug === venueSlug)

          if (foundVenue) {
            console.log('✅ VENUE PROFILE DEBUG: Found venue in mock data:', foundVenue.name)
            setVenue(foundVenue)

            // Check if current user owns this venue
            if (currentUser && isVenueOwner && foundVenue.ownerId === currentUser.uid) {
              console.log('🏢 VENUE PROFILE DEBUG: Current user owns this venue (mock data)')
              setIsOwnerOfThisVenue(true)
            }
          } else {
            console.error('🚨 VENUE PROFILE DEBUG: Venue not found in API or mock data')
            setError('Venue not found')
          }
        }
      } catch (err) {
        console.error('🚨 VENUE PROFILE DEBUG: Error loading venue:', err)

        // Fallback to mock data if API fails
        try {
          console.log('⚠️ VENUE PROFILE DEBUG: API failed, trying mock data fallback')
          const devVenues = getDevVenues()
          const foundVenue = devVenues.find(v => v.slug === venueSlug)

          if (foundVenue) {
            console.log('✅ VENUE PROFILE DEBUG: Found venue in mock fallback:', foundVenue.name)
            setVenue(foundVenue)

            // Check if current user owns this venue
            if (currentUser && isVenueOwner && foundVenue.ownerId === currentUser.uid) {
              console.log('🏢 VENUE PROFILE DEBUG: Current user owns this venue (fallback)')
              setIsOwnerOfThisVenue(true)
            }
          } else {
            console.error('🚨 VENUE PROFILE DEBUG: No venue found in fallback either')
            setError('Failed to load venue information')
          }
        } catch (fallbackErr) {
          console.error('🚨 VENUE PROFILE DEBUG: Even fallback failed:', fallbackErr)
          setError('Failed to load venue information')
        }
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
          className="absolute inset-0 opacity-[0.5]"
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
          className="absolute inset-0 opacity-[0.5]"
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
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10">
        {/* Top Controls */}
        <div className="fixed top-4 left-4 right-4 z-50 flex justify-between">
          {/* Only show back to venues button if user is not a venue owner */}
          {!isVenueOwner && (
            <button
              onClick={() => navigate('/voxxy-shop/venues')}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Venues
            </button>
          )}

          {/* If venue owner, add spacing div to maintain layout */}
          {isVenueOwner && <div></div>}

          <div className="flex gap-2">
            <ShareButton
              url={`${window.location.origin}/venue/${venue.slug}`}
              title={venue.name}
              description={venue.description}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20 text-white"
            />

            {isOwnerOfThisVenue ? (
              <Button
                onClick={() => navigate('/venue-owner/dashboard')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => setIsContactModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </Button>
            )}
          </div>
        </div>

        {/* Hero Section - Welcome Style */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
              <div className="space-y-6">
                {/* Title and Badge */}
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-white">{venue.name}</h1>
                  <Badge className="bg-purple-500/20 border border-purple-400/30 text-purple-300">
                    {VENUE_TYPE_LABELS[venue.venueType]}
                  </Badge>
                </div>

                {/* About Section */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">About</h3>
                  <p className="text-gray-300 leading-relaxed">{venue.description}</p>
                </div>

                {/* Address */}
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span>{venue.address}</span>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span>Capacity: {venue.capacity}</span>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Photos Section - Collapsible */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="border border-white/10 rounded-lg overflow-hidden">
              {/* Header - Always visible */}
              <button
                onClick={() => setIsPhotosExpanded(!isPhotosExpanded)}
                className="w-full bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  {venue.photos && venue.photos.length > 0 ? (
                    <Camera className="h-5 w-5 text-purple-400" />
                  ) : (
                    <Plus className="h-5 w-5 text-gray-400" />
                  )}
                  <h3 className="text-xl font-bold text-white">
                    {venue.photos && venue.photos.length > 0
                      ? `Venue Photos (${venue.photos.length})`
                      : 'Venue Photos'
                    }
                  </h3>
                </div>
                {isPhotosExpanded ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </button>

              {/* Content - Collapsible */}
              {isPhotosExpanded && (
                <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 p-8">
                  {venue.photos && venue.photos.length > 0 ? (
                    <VenueGallery photos={venue.photos} venueName={venue.name} />
                  ) : (
                    <div className="text-center py-12">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 text-lg mb-2">No photos available</p>
                      <p className="text-gray-400 text-sm">
                        Photos of this venue will appear here when added
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Amenities Section */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
              <h3 className="text-xl font-bold text-white mb-6">What This Venue Offers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {venue.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-purple-400">
                      {AMENITY_ICONS[amenity] || <Star className="h-4 w-4" />}
                    </div>
                    <span className="text-gray-200">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
              <h3 className="text-3xl font-bold text-center text-white mb-10">
                Upcoming Events at {venue.name}
              </h3>

              {/* Placeholder for events - will integrate with event system later */}
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg mb-2">No upcoming events</p>
                <p className="text-gray-400 text-sm">
                  Events happening at this venue will appear here
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
              <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>

              {/* Contact Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Email */}
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-200">{venue.contactInfo.email}</span>
                </div>

                {/* Phone */}
                {venue.contactInfo.phone && (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Phone className="h-5 w-5 text-purple-400" />
                    <span className="text-gray-200">{venue.contactInfo.phone}</span>
                  </div>
                )}

                {/* Website */}
                {venue.contactInfo.website && (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <ExternalLink className="h-5 w-5 text-purple-400" />
                    <a
                      href={venue.contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {/* Social Media Links */}
                {venue.contactInfo.instagram && (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Instagram className="h-5 w-5 text-purple-400" />
                    <a
                      href={`https://instagram.com/${venue.contactInfo.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      @{venue.contactInfo.instagram.replace('@', '')}
                    </a>
                  </div>
                )}

                {venue.contactInfo.tiktok && (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Video className="h-5 w-5 text-purple-400" />
                    <a
                      href={`https://tiktok.com/@${venue.contactInfo.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      @{venue.contactInfo.tiktok.replace('@', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Footer */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
              <p className="text-gray-300 mb-6">
                Get notified about upcoming events and special offers at {venue.name}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {isOwnerOfThisVenue ? (
                  <Button
                    onClick={() => navigate('/venue-owner/dashboard')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsContactModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Venue
                  </Button>
                )}
                <SubscriptionModal
                  trigger={
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Subscribe for Updates
                    </Button>
                  }
                  organization={{
                    id: venue.id,
                    slug: venue.slug,
                    name: venue.name,
                    description: venue.description,
                    background: venue.description,
                    contactEmail: venue.contactInfo.email,
                    logoUrl: venue.photos[0] || '',
                    socialLinks: {
                      instagram: venue.contactInfo.instagram || '',
                      website: venue.contactInfo.website || ''
                    },
                    settings: {
                      defaultLocation: venue.address,
                      defaultAddress: venue.address,
                      theme: {
                        primaryColor: '#9333ea',
                        backgroundColor: '#111827'
                      }
                    },
                    ownerId: venue.ownerId,
                    createdAt: venue.createdAt,
                    updatedAt: venue.updatedAt
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      <VenueContactModal
        venue={venue}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  )
}