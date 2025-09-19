import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MapPin,
  Users,
  Filter,
  X,
  DollarSign,
  Clock,
  Search
} from 'lucide-react'
import { VenueSearchFilters } from '@/types/venue'

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

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = () => {
    return !!(
      filters.location ||
      filters.capacity?.min ||
      filters.capacity?.max ||
      filters.pricingType ||
      filters.availability
    )
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.location) count++
    if (filters.capacity?.min || filters.capacity?.max) count++
    if (filters.pricingType && filters.pricingType !== 'both') count++
    if (filters.availability) count++
    return count
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sticky top-4">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-300" />
            <h3 className="font-semibold text-white">Search Filters</h3>
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
          {/* Location */}
          <div>
            <Label className="text-sm font-medium mb-2 block text-gray-200">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Brooklyn, Manhattan, Queens..."
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/30"
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <Label className="text-sm font-medium mb-3 block text-gray-200">Capacity</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-300 mb-1 block">Min</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.capacity?.min || ''}
                    onChange={(e) => updateCapacity('min', e.target.value)}
                    className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/30"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-300 mb-1 block">Max</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="500"
                    value={filters.capacity?.max || ''}
                    onChange={(e) => updateCapacity('max', e.target.value)}
                    className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/30"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Type */}
          <div>
            <Label className="text-sm font-medium mb-3 block text-gray-200">Pricing</Label>
            <Select
              value={filters.pricingType || 'both'}
              onValueChange={(value) => updateFilter('pricingType', value)}
            >
              <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:bg-white/15 focus:border-white/30">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Select pricing type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="both" className="text-white hover:bg-gray-800">All Venues</SelectItem>
                <SelectItem value="free" className="text-white hover:bg-gray-800">Free Events Only</SelectItem>
                <SelectItem value="paid" className="text-white hover:bg-gray-800">Paid Events Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Availability - Coming Soon */}
          <div>
            <Label className="text-sm font-medium mb-3 block text-gray-200 flex items-center gap-2">
              Availability
              <Badge variant="secondary" className="bg-gray-600/50 text-gray-300 text-xs">
                Coming Soon
              </Badge>
            </Label>
            <Select disabled>
              <SelectTrigger className="bg-white/5 backdrop-blur-sm border-white/10 text-gray-500 cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Check venue availability" />
                </div>
              </SelectTrigger>
            </Select>
            <p className="text-xs text-gray-400 mt-1">Real-time availability checking coming soon</p>
          </div>

          {/* Search Button */}
          <Button
            onClick={onSearch}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Searching...' : 'Search Venues'}
          </Button>
        </div>
      </div>
    </div>
  )
}