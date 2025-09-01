import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Users, 
  Clock,
  Star,
  Wifi,
  Car,
  Utensils,
  Music,
  Accessibility
} from 'lucide-react'
import { Venue, VenueType } from '@/types/venue'

const VENUE_TYPE_COLORS: Record<VenueType, string> = {
  'bar': 'bg-orange-100 text-orange-800',
  'restaurant': 'bg-green-100 text-green-800',
  'community_center': 'bg-blue-100 text-blue-800',
  'outdoor': 'bg-emerald-100 text-emerald-800',
  'event_space': 'bg-purple-100 text-purple-800',
  'other': 'bg-gray-100 text-gray-800'
}

const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  'bar': 'Bar',
  'restaurant': 'Restaurant',
  'community_center': 'Community Center',
  'outdoor': 'Outdoor Space',
  'event_space': 'Event Space',
  'other': 'Other'
}

const FEATURED_AMENITIES = ['WiFi', 'Parking', 'Full Bar', 'Sound System', 'ADA Accessible']

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-3 w-3" />,
  'Parking': <Car className="h-3 w-3" />,
  'Full Bar': <Utensils className="h-3 w-3" />,
  'Sound System': <Music className="h-3 w-3" />,
  'ADA Accessible': <Accessibility className="h-3 w-3" />
}

interface VenueCardProps {
  venue: Venue
  compact?: boolean
}

export function VenueCard({ venue, compact = false }: VenueCardProps) {
  const getFeaturedAmenities = () => {
    return venue.amenities.filter(amenity => 
      FEATURED_AMENITIES.includes(amenity)
    ).slice(0, 3)
  }

  const isOpenNow = () => {
    const now = new Date()
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const currentHours = venue.hours[dayName as keyof typeof venue.hours]
    
    if (!currentHours) return false
    
    const currentTime = now.getHours() * 100 + now.getMinutes()
    const openTime = parseInt(currentHours.open.replace(':', ''))
    const closeTime = parseInt(currentHours.close.replace(':', ''))
    
    // Handle venues that close after midnight
    if (closeTime < openTime) {
      return currentTime >= openTime || currentTime <= closeTime
    }
    
    return currentTime >= openTime && currentTime <= closeTime
  }

  if (compact) {
    return (
      <Link to={`/venue/${venue.slug}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {venue.photos[0] && (
                <img
                  src={venue.photos[0]}
                  alt={venue.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{venue.name}</h3>
                  <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                    {VENUE_TYPE_LABELS[venue.venueType]}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{venue.address}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-3 w-3" />
                    <span>Up to {venue.capacity}</span>
                  </div>
                  {isOpenNow() && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Open Now
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <Link to={`/venue/${venue.slug}`}>
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          {venue.photos[0] ? (
            <img
              src={venue.photos[0]}
              alt={venue.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <MapPin className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Overlays */}
          <div className="absolute top-3 left-3">
            <Badge className={VENUE_TYPE_COLORS[venue.venueType]}>
              {VENUE_TYPE_LABELS[venue.venueType]}
            </Badge>
          </div>
          
          {isOpenNow() && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-600 text-white">
                <Clock className="h-3 w-3 mr-1" />
                Open Now
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-3">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
              {venue.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{venue.address}</span>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {venue.description}
          </p>
          
          {/* Capacity */}
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              Capacity: <span className="font-medium">{venue.capacity} people</span>
            </span>
          </div>
          
          {/* Featured Amenities */}
          {getFeaturedAmenities().length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {getFeaturedAmenities().map((amenity, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                    {AMENITY_ICONS[amenity] || <Star className="h-3 w-3" />}
                    <span>{amenity}</span>
                  </div>
                ))}
                {venue.amenities.length > 3 && (
                  <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                    +{venue.amenities.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Action */}
          <Button className="w-full group-hover:bg-purple-700 transition-colors">
            View Details
          </Button>
        </CardContent>
      </Link>
    </Card>
  )
}