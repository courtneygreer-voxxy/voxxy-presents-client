/**
 * VendorProfilePage - Universal profile page for all vendor types
 *
 * Displays vendor information with type-specific sections:
 * - Venues: Hours, capacity, amenities, accessibility
 * - Catering: Cuisines, service types, dietary options
 * - Entertainment: Genres, equipment, portfolio
 * - Market Vendors: Products, booth requirements, pricing
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  MapPin,
  Globe,
  Mail,
  Phone,
  Instagram,
  Users,
  Clock,
  ChefHat,
  Mic2,
  ShoppingBag,
  Building2,
  Loader,
  Music,
  Utensils,
  Calendar,
  Star,
  Camera
} from 'lucide-react'
import { Vendor, VendorType, isVenue, isCatering, isEntertainment, isMarketVendor } from '@/types/vendor'
import { vendorService } from '@/services/vendorService'

const VENDOR_TYPE_ICONS: Record<VendorType, React.ReactNode> = {
  venue: <Building2 className="h-5 w-5" />,
  artist: <Music className="h-5 w-5" />,
  entertainer: <Mic2 className="h-5 w-5" />,
  entertainment: <Mic2 className="h-5 w-5" />,
  lighting_tech: <Star className="h-5 w-5" />,
  catering: <ChefHat className="h-5 w-5" />,
  photographer: <Camera className="h-5 w-5" />,
  market_vendor: <ShoppingBag className="h-5 w-5" />
}

const VENDOR_TYPE_COLORS: Record<VendorType, string> = {
  venue: 'bg-purple-100 text-purple-800',
  artist: 'bg-blue-100 text-blue-800',
  entertainer: 'bg-indigo-100 text-indigo-800',
  entertainment: 'bg-pink-100 text-pink-800',
  lighting_tech: 'bg-yellow-100 text-yellow-800',
  catering: 'bg-orange-100 text-orange-800',
  photographer: 'bg-gray-100 text-gray-800',
  market_vendor: 'bg-green-100 text-green-800'
}

export default function VendorProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      loadVendor()
    }
  }, [slug])

  const loadVendor = async () => {
    if (!slug) return

    setLoading(true)
    setError(null)

    try {
      // Try to load as vendor first (supports all types)
      const vendorData = await vendorService.getVendorBySlug(slug)
      setVendor(vendorData)
    } catch (err: any) {
      console.error('Error loading vendor:', err)
      setError(err.message || 'Failed to load vendor')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading vendor...</p>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] flex items-center justify-center">
        <div className="bg-white/10 border border-white/20 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Vendor Not Found</h2>
          <p className="text-gray-300 mb-6">{error || 'The vendor you\'re looking for doesn\'t exist.'}</p>
          <Button onClick={() => navigate('/marketplace')} className="w-full">
            Back to Marketplace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a]">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-white hover:text-purple-400"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Hero Image */}
        {vendor.photos && vendor.photos[0] && (
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6">
            <img
              src={vendor.photos[0]}
              alt={vendor.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <Badge className={`${VENDOR_TYPE_COLORS[vendor.vendorType]} flex items-center gap-1`}>
                {VENDOR_TYPE_ICONS[vendor.vendorType]}
                <span className="capitalize">{vendor.vendorType.replace('_', ' ')}</span>
              </Badge>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">{vendor.name}</h1>

          {vendor.address && (
            <div className="flex items-center gap-2 text-gray-300 mb-4">
              <MapPin className="h-5 w-5" />
              <span>{vendor.address}</span>
            </div>
          )}

          <p className="text-gray-200 mb-6">{vendor.description}</p>

          {/* Contact Information */}
          <div className="flex flex-wrap gap-4">
            {vendor.contactInfo.website && (
              <a
                href={vendor.contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
              >
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </a>
            )}
            {vendor.contactInfo.email && (
              <a
                href={`mailto:${vendor.contactInfo.email}`}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </a>
            )}
            {vendor.contactInfo.phone && (
              <a
                href={`tel:${vendor.contactInfo.phone}`}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
              >
                <Phone className="h-4 w-4" />
                <span>{vendor.contactInfo.phone}</span>
              </a>
            )}
            {vendor.contactInfo.instagram && (
              <a
                href={`https://instagram.com/${vendor.contactInfo.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
              >
                <Instagram className="h-4 w-4" />
                <span>{vendor.contactInfo.instagram}</span>
              </a>
            )}
          </div>
        </div>

        {/* Vendor-Type-Specific Details */}
        {isVenue(vendor) && vendor.venueDetails && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Venue Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Capacity */}
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Capacity</p>
                  <p className="text-white font-medium">{vendor.venueDetails.capacity} people</p>
                </div>
              </div>

              {/* Venue Type */}
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="text-white font-medium capitalize">{vendor.venueDetails.venueType.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {vendor.venueDetails.amenities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.venueDetails.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isCatering(vendor) && vendor.cateringDetails && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Catering Details</h2>

            {/* Cuisine Types */}
            {vendor.cateringDetails.cuisineTypes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Cuisines</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.cateringDetails.cuisineTypes.map((cuisine, index) => (
                    <Badge key={index} className="bg-orange-500">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Service Types */}
            {vendor.cateringDetails.serviceTypes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Service Types</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.cateringDetails.serviceTypes.map((service, index) => (
                    <Badge key={index} variant="secondary" className="capitalize">
                      {service.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Key Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.cateringDetails.servesAlcohol && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Utensils className="h-4 w-4 text-orange-400" />
                  <span>Serves Alcohol</span>
                </div>
              )}
              {vendor.cateringDetails.deliveryAvailable && (
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  <span>Delivery Available {vendor.cateringDetails.deliveryRadius && `(${vendor.cateringDetails.deliveryRadius} mi)`}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {isEntertainment(vendor) && vendor.entertainmentDetails && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Entertainment Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <Mic2 className="h-5 w-5 text-pink-400" />
                <div>
                  <p className="text-sm text-gray-400">Performer Type</p>
                  <p className="text-white font-medium capitalize">{vendor.entertainmentDetails.performerType}</p>
                </div>
              </div>

              {vendor.entertainmentDetails.groupSize && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-pink-400" />
                  <div>
                    <p className="text-sm text-gray-400">Group Size</p>
                    <p className="text-white font-medium">{vendor.entertainmentDetails.groupSize} {vendor.entertainmentDetails.groupSize === 1 ? 'performer' : 'performers'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Genres */}
            {vendor.entertainmentDetails.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.entertainmentDetails.genres.map((genre, index) => (
                    <Badge key={index} className="bg-pink-500">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Links */}
            {vendor.entertainmentDetails.portfolioLinks && vendor.entertainmentDetails.portfolioLinks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Portfolio</h3>
                <div className="space-y-2">
                  {vendor.entertainmentDetails.portfolioLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-pink-400 hover:text-pink-300 truncate"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isMarketVendor(vendor) && vendor.marketVendorDetails && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Market Vendor Details</h2>

            {/* Product Types */}
            {vendor.marketVendorDetails.productTypes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Products</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.marketVendorDetails.productTypes.map((product, index) => (
                    <Badge key={index} className="bg-green-500">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vendor.marketVendorDetails.priceRange && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Price Range</p>
                  <p className="text-white font-medium">{vendor.marketVendorDetails.priceRange}</p>
                </div>
              )}

              {vendor.marketVendorDetails.acceptsCustomOrders && (
                <div className="flex items-center gap-2 text-gray-300">
                  <ShoppingBag className="h-4 w-4 text-green-400" />
                  <span>Accepts Custom Orders</span>
                </div>
              )}

              {vendor.marketVendorDetails.shipsProducts && (
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <span>Ships Products</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        {vendor.photos && vendor.photos.length > 1 && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {vendor.photos.slice(1).map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`${vendor.name} photo ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Backward-compatible export
export { VendorProfilePage as VenueProfilePage }
