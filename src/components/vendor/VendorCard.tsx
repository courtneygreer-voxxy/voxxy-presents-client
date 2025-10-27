import React from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Users,
  Star,
  Wifi,
  Car,
  Utensils,
  Music,
  Accessibility,
  ChefHat,
  Mic2,
  ShoppingBag,
  Building2
} from 'lucide-react'
import { Vendor, VendorType, isVenue, isCatering, isEntertainment, isMarketVendor } from '@/types/vendor'

// Vendor type styling
const VENDOR_TYPE_COLORS: Record<VendorType, string> = {
  'venue': 'bg-purple-100 text-purple-800',
  'catering': 'bg-orange-100 text-orange-800',
  'entertainment': 'bg-pink-100 text-pink-800',
  'market_vendor': 'bg-green-100 text-green-800'
}

const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  'venue': 'Venue',
  'catering': 'Catering',
  'entertainment': 'Entertainment',
  'market_vendor': 'Market Vendor'
}

const VENDOR_TYPE_ICONS: Record<VendorType, React.ReactNode> = {
  'venue': <Building2 className="h-4 w-4" />,
  'catering': <ChefHat className="h-4 w-4" />,
  'entertainment': <Mic2 className="h-4 w-4" />,
  'market_vendor': <ShoppingBag className="h-4 w-4" />
}

// Venue-specific amenities
const FEATURED_AMENITIES = ['WiFi', 'Parking', 'Full Bar', 'Sound System', 'ADA Accessible']

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-3 w-3" />,
  'Parking': <Car className="h-3 w-3" />,
  'Full Bar': <Utensils className="h-3 w-3" />,
  'Sound System': <Music className="h-3 w-3" />,
  'ADA Accessible': <Accessibility className="h-3 w-3" />
}

interface VendorCardProps {
  vendor: Vendor
  compact?: boolean
}

export function VendorCard({ vendor, compact = false }: VendorCardProps) {
  // Get vendor-type-specific features to display
  const getFeatures = () => {
    if (isVenue(vendor) && vendor.venueDetails) {
      // Venue: Show featured amenities
      return vendor.venueDetails.amenities
        .filter(amenity => FEATURED_AMENITIES.includes(amenity))
        .slice(0, 3)
        .map(amenity => ({
          label: amenity,
          icon: AMENITY_ICONS[amenity] || <Star className="h-3 w-3" />
        }))
    }

    if (isCatering(vendor) && vendor.cateringDetails) {
      // Catering: Show cuisine types
      return vendor.cateringDetails.cuisineTypes.slice(0, 3).map(cuisine => ({
        label: cuisine,
        icon: <ChefHat className="h-3 w-3" />
      }))
    }

    if (isEntertainment(vendor) && vendor.entertainmentDetails) {
      // Entertainment: Show genres
      return vendor.entertainmentDetails.genres.slice(0, 3).map(genre => ({
        label: genre,
        icon: <Music className="h-3 w-3" />
      }))
    }

    if (isMarketVendor(vendor) && vendor.marketVendorDetails) {
      // Market Vendor: Show product types
      return vendor.marketVendorDetails.productTypes.slice(0, 3).map(product => ({
        label: product,
        icon: <ShoppingBag className="h-3 w-3" />
      }))
    }

    return []
  }

  // Get vendor-type-specific metadata
  const getMetadata = () => {
    if (isVenue(vendor) && vendor.venueDetails) {
      return {
        icon: <Users className="h-4 w-4 text-gray-400" />,
        label: `Capacity: ${vendor.venueDetails.capacity} people`
      }
    }

    if (isCatering(vendor) && vendor.cateringDetails) {
      const serviceTypes = vendor.cateringDetails.serviceTypes.join(', ')
      return {
        icon: <ChefHat className="h-4 w-4 text-gray-400" />,
        label: serviceTypes || 'Full-service catering'
      }
    }

    if (isEntertainment(vendor) && vendor.entertainmentDetails) {
      return {
        icon: <Mic2 className="h-4 w-4 text-gray-400" />,
        label: vendor.entertainmentDetails.performerType.replace('_', ' ')
      }
    }

    if (isMarketVendor(vendor) && vendor.marketVendorDetails) {
      return {
        icon: <ShoppingBag className="h-4 w-4 text-gray-400" />,
        label: vendor.marketVendorDetails.priceRange || 'Artisan goods'
      }
    }

    return null
  }

  const features = getFeatures()
  const metadata = getMetadata()
  const totalFeatures = features.length

  if (compact) {
    return (
      <Link to={`/vendor/${vendor.slug}`}>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/15 hover:border-white/30 transition-all duration-300 cursor-pointer">
          <div className="flex gap-3">
            {vendor.photos[0] && (
              <img
                src={vendor.photos[0]}
                alt={vendor.name}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white truncate">{vendor.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${VENDOR_TYPE_COLORS[vendor.vendorType]}`}>
                  {VENDOR_TYPE_LABELS[vendor.vendorType]}
                </span>
              </div>

              {vendor.address && (
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{vendor.address}</span>
                </div>
              )}

              {metadata && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  {metadata.icon}
                  <span className="truncate">{metadata.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 hover:border-white/30 transition-all duration-300 group">
      <Link to={`/vendor/${vendor.slug}`}>
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          {vendor.photos[0] ? (
            <img
              src={vendor.photos[0]}
              alt={vendor.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-white/5 border border-white/10 flex items-center justify-center">
              {VENDOR_TYPE_ICONS[vendor.vendorType]}
            </div>
          )}

          {/* Vendor Type Badge */}
          <div className="absolute top-3 right-3">
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full backdrop-blur-sm ${VENDOR_TYPE_COLORS[vendor.vendorType]} font-medium text-xs`}>
              {VENDOR_TYPE_ICONS[vendor.vendorType]}
              <span>{VENDOR_TYPE_LABELS[vendor.vendorType]}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="mb-3">
            <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
              {vendor.name}
            </h3>
            {vendor.address && (
              <div className="flex items-center gap-2 mt-1 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{vendor.address}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-200 text-sm mb-4 line-clamp-2">
            {vendor.description}
          </p>

          {/* Metadata (capacity, performer type, etc.) */}
          {metadata && (
            <div className="flex items-center gap-2 mb-4">
              {metadata.icon}
              <span className="text-sm text-gray-200">
                <span className="font-medium capitalize">{metadata.label}</span>
              </span>
            </div>
          )}

          {/* Features (amenities, cuisines, genres, products) */}
          <div className="mb-4 min-h-[32px] flex items-center">
            {features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs text-gray-300 bg-white/10 px-2 py-1 rounded-full">
                    <div className="text-purple-400">
                      {feature.icon}
                    </div>
                    <span>{feature.label}</span>
                  </div>
                ))}
                {totalFeatures > 3 && (
                  <div className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">
                    +{totalFeatures - 3} more
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No details listed</div>
            )}
          </div>

          {/* Action */}
          <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 group-hover:bg-purple-500 text-white transition-colors duration-200 rounded-lg">
            View Details
          </button>
        </div>
      </Link>
    </div>
  )
}

// Backward-compatible alias
export { VendorCard as VenueCard }
