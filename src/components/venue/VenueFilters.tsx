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
    <Card className="sticky top-4">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters() && (
              <Badge variant="secondary">
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>
          
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Search Query */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Search Venues</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Venue name or keywords..."
                value={filters.query || ''}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
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
            <Label className="text-sm font-medium mb-2 block">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Brooklyn, Manhattan, etc."
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Venue Type */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Venue Type</Label>
            <div className="grid grid-cols-1 gap-3">
              {VENUE_TYPES.map((venueType) => (
                <div key={venueType.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`venue-type-${venueType.value}`}
                    checked={(filters.venueType || []).includes(venueType.value)}
                    onCheckedChange={() => toggleVenueType(venueType.value)}
                  />
                  <Label 
                    htmlFor={`venue-type-${venueType.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {venueType.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Capacity</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Min</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.capacity?.min || ''}
                    onChange={(e) => updateCapacity('min', e.target.value)}
                    className="pl-10"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Max</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="500"
                    value={filters.capacity?.max || ''}
                    onChange={(e) => updateCapacity('max', e.target.value)}
                    className="pl-10"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Amenities</Label>
            <div className="grid grid-cols-1 gap-2">
              {COMMON_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={(filters.amenities || []).includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label 
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <Button 
            onClick={onSearch} 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search Venues'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}