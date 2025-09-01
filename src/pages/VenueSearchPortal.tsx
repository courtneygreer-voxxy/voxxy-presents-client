import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Grid3X3,
  List,
  Loader,
  Search,
  Store
} from 'lucide-react'
import { VenueCard } from '@/components/venue/VenueCard'
import { VenueFilters } from '@/components/venue/VenueFilters'
import { Venue, VenueSearchFilters } from '@/types/venue'

// Mock data for development - replace with API call
import { getDevVenues } from '../../scripts/seed-dev-venues'

type ViewMode = 'grid' | 'list'
type SortOption = 'name' | 'capacity' | 'type' | 'recent'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'capacity', label: 'Capacity (High to Low)' },
  { value: 'type', label: 'Venue Type' },
  { value: 'recent', label: 'Recently Added' }
]

export default function VenueSearchPortal() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // State
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  
  // Filters state
  const [filters, setFilters] = useState<VenueSearchFilters>({
    query: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
  })

  // Load venues
  useEffect(() => {
    loadVenues()
  }, [])

  const loadVenues = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // For development, use mock data
      const devVenues = getDevVenues()
      setVenues(devVenues)
    } catch (err) {
      console.error('Error loading venues:', err)
      setError('Failed to load venues. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    
    // Update URL with search params
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.location) params.set('location', filters.location)
    setSearchParams(params)
    
    try {
      // For development, filter mock data
      const devVenues = getDevVenues()
      let filteredVenues = devVenues

      // Apply query filter
      if (filters.query) {
        const query = filters.query.toLowerCase()
        filteredVenues = filteredVenues.filter(venue =>
          venue.name.toLowerCase().includes(query) ||
          venue.description.toLowerCase().includes(query) ||
          venue.amenities.some(amenity => amenity.toLowerCase().includes(query))
        )
      }

      // Apply location filter
      if (filters.location) {
        const location = filters.location.toLowerCase()
        filteredVenues = filteredVenues.filter(venue =>
          venue.address.toLowerCase().includes(location)
        )
      }

      // Apply venue type filter
      if (filters.venueType && filters.venueType.length > 0) {
        filteredVenues = filteredVenues.filter(venue =>
          filters.venueType!.includes(venue.venueType)
        )
      }

      // Apply capacity filter
      if (filters.capacity?.min || filters.capacity?.max) {
        filteredVenues = filteredVenues.filter(venue => {
          const capacity = venue.capacity
          const minMatch = !filters.capacity?.min || capacity >= filters.capacity.min
          const maxMatch = !filters.capacity?.max || capacity <= filters.capacity.max
          return minMatch && maxMatch
        })
      }

      // Apply amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        filteredVenues = filteredVenues.filter(venue =>
          filters.amenities!.some(amenity =>
            venue.amenities.includes(amenity)
          )
        )
      }

      setVenues(filteredVenues)
    } catch (err) {
      console.error('Error searching venues:', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sortVenues = (venues: Venue[], sortOption: SortOption): Venue[] => {
    const sorted = [...venues]
    
    switch (sortOption) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'capacity':
        return sorted.sort((a, b) => b.capacity - a.capacity)
      case 'type':
        return sorted.sort((a, b) => a.venueType.localeCompare(b.venueType))
      case 'recent':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      default:
        return sorted
    }
  }

  const displayVenues = sortVenues(venues, sortBy)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/voxxy-shop')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Venue Marketplace</h1>
              <p className="text-gray-600">Find the perfect space for your next event</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <VenueFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
              isLoading={loading}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-gray-600">Searching venues...</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-900 font-semibold">
                      {venues.length} {venues.length === 1 ? 'venue' : 'venues'} found
                    </p>
                    {(filters.query || filters.location) && (
                      <p className="text-sm text-gray-600">
                        {filters.query && `"${filters.query}"`}
                        {filters.query && filters.location && ' in '}
                        {filters.location && `${filters.location}`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <Card className="mb-6">
                <CardContent className="p-6 text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={loadVenues} variant="outline">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loading && !error && venues.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or browse all available venues.
                  </p>
                  <Button onClick={() => {
                    setFilters({ query: '' })
                    handleSearch()
                  }}>
                    View All Venues
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Venues Grid/List */}
            {!loading && !error && venues.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
                : 'space-y-4'
              }>
                {displayVenues.map((venue) => (
                  <VenueCard 
                    key={venue.id} 
                    venue={venue} 
                    compact={viewMode === 'list'}
                  />
                ))}
              </div>
            )}

            {/* Coming Soon Features */}
            {!loading && venues.length > 0 && (
              <Card className="mt-8 bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-blue-900 mb-2">Coming Soon</h3>
                  <p className="text-blue-800 text-sm mb-4">
                    Interactive map view, availability calendar, and direct booking
                  </p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    v1.5.0 Features
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}