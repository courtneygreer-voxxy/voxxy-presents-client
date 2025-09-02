import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Users, 
  Filter,
  X,
  Search
} from 'lucide-react'
import { VenueSearchFilters, VenueType } from '@/types/venue'

const VENUE_TYPES: { value: VenueType; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'community_center', label: 'Community Center' },
  { value: 'outdoor', label: 'Outdoor Space' },
  { value: 'event_space', label: 'Event Space' },
  { value: 'other', label: 'Other' }
]

const COMMON_AMENITIES = [
  'WiFi',
  'Parking',
  'Full Bar',
  'Kitchen',
  'Sound System',
  'Projector',
  'ADA Accessible',
  'Outdoor Seating',
  'Private Event Space'
]

interface VenueFiltersProps {
  filters: VenueSearchFilters
  onFiltersChange: (filters: VenueSearchFilters) => void
  onSearch: () => void
  isLoading?: boolean
}

export function VenueFilters({ filters, onFiltersChange, onSearch, isLoading }: VenueFiltersProps) {
  const updateFilter = (key: keyof VenueSearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const updateCapacity = (field: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined
    updateFilter('capacity', {
      ...filters.capacity,
      [field]: numValue
    })
  }

  const toggleVenueType = (venueType: VenueType) => {
    const currentTypes = filters.venueType || []
    const newTypes = currentTypes.includes(venueType)
      ? currentTypes.filter(type => type !== venueType)
      : [...currentTypes, venueType]
    
    updateFilter('venueType', newTypes.length > 0 ? newTypes : undefined)
  }

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = filters.amenities || []
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity]
    
    updateFilter('amenities', newAmenities.length > 0 ? newAmenities : undefined)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      query: filters.query // Keep search query but clear other filters
    })
  }

  const hasActiveFilters = () => {
    return !!(
      filters.location ||
      (filters.venueType && filters.venueType.length > 0) ||
      filters.capacity?.min ||
      filters.capacity?.max ||
      (filters.amenities && filters.amenities.length > 0)
    )
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.location) count++
    if (filters.venueType?.length) count += filters.venueType.length
    if (filters.capacity?.min || filters.capacity?.max) count++
    if (filters.amenities?.length) count += filters.amenities.length
    return count
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sticky top-4">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-300" />
            <h3 className="font-semibold text-white">Filters</h3>
            {hasActiveFilters() && (
              <div className="px-2 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs rounded-full">
                {getActiveFilterCount()}
              </div>
            )}
          </div>
          
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors duration-200 text-sm"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Search Query */}
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-200">Search Venues</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Venue name or keywords..."
                value={filters.query || ''}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearch()
                  }
                }}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-200">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Brooklyn, Manhattan, etc."
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Venue Type */}
          <div>
            <label className="text-sm font-medium mb-3 block text-gray-200">Venue Type</label>
            <div className="grid grid-cols-1 gap-3">
              {VENUE_TYPES.map((venueType) => (
                <div key={venueType.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`venue-type-${venueType.value}`}
                    checked={(filters.venueType || []).includes(venueType.value)}
                    onChange={() => toggleVenueType(venueType.value)}
                    className="w-4 h-4 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label 
                    htmlFor={`venue-type-${venueType.value}`}
                    className="text-sm font-normal cursor-pointer text-gray-200"
                  >
                    {venueType.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="text-sm font-medium mb-3 block text-gray-200">Capacity</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-300 mb-1 block">Min</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.capacity?.min || ''}
                    onChange={(e) => updateCapacity('min', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-300 mb-1 block">Max</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder="500"
                    value={filters.capacity?.max || ''}
                    onChange={(e) => updateCapacity('max', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium mb-3 block text-gray-200">Amenities</label>
            <div className="grid grid-cols-1 gap-2">
              {COMMON_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    checked={(filters.amenities || []).includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="w-4 h-4 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label 
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm font-normal cursor-pointer text-gray-200"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <button 
            onClick={onSearch} 
            disabled={isLoading}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors duration-200 rounded-lg"
          >
            {isLoading ? 'Searching...' : 'Search Venues'}
          </button>
        </div>
      </div>
    </div>
  )
}