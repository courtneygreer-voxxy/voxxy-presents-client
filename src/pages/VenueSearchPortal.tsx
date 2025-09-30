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
import { venuesApi } from '@/services/api'

// Mock data for development - fallback only
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
      console.log('🏢 VENUE MARKETPLACE DEBUG: Loading venues from API')

      // Call real API to get all venues
      const apiResponse = await venuesApi.getAll({})

      console.log('🏢 VENUE MARKETPLACE DEBUG: API response:', apiResponse)

      if (apiResponse.success && apiResponse.venues) {
        console.log(`✅ VENUE MARKETPLACE DEBUG: Found ${apiResponse.venues.length} venues in API`)
        // Only show approved venues in the marketplace
        const approvedVenues = apiResponse.venues.filter((venue: Venue) => venue.claimStatus === 'approved')
        console.log(`✅ VENUE MARKETPLACE DEBUG: ${approvedVenues.length} approved venues`)
        setVenues(approvedVenues)
      } else {
        console.log('⚠️ VENUE MARKETPLACE DEBUG: API call failed or no venues found, using mock data')
        // Fallback to mock data for development
        const devVenues = getDevVenues()
        setVenues(devVenues)
      }
    } catch (err) {
      console.error('🚨 VENUE MARKETPLACE DEBUG: Error loading venues:', err)

      // Fallback to mock data if API fails
      try {
        console.log('⚠️ VENUE MARKETPLACE DEBUG: API failed, using mock data fallback')
        const devVenues = getDevVenues()
        setVenues(devVenues)
      } catch (fallbackErr) {
        console.error('🚨 VENUE MARKETPLACE DEBUG: Even fallback failed:', fallbackErr)
        setError('Failed to load venues. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    setError(null)

    // Update URL with search params
    const params = new URLSearchParams()
    if (filters.location) params.set('location', filters.location)
    if (filters.pricingType && filters.pricingType !== 'both') params.set('pricing', filters.pricingType)
    setSearchParams(params)

    try {
      console.log('🔍 VENUE MARKETPLACE DEBUG: Searching venues with filters:', filters)

      // Build API search parameters
      const searchParams: any = {}

      if (filters.location) {
        searchParams.location = filters.location
      }

      if (filters.capacity?.min) {
        searchParams.capacity_min = filters.capacity.min
      }

      if (filters.capacity?.max) {
        searchParams.capacity_max = filters.capacity.max
      }

      if (filters.pricingType && filters.pricingType !== 'both') {
        searchParams.pricing_type = filters.pricingType
      }

      // Only show approved venues
      searchParams.claim_status = 'approved'

      console.log('🔍 VENUE MARKETPLACE DEBUG: API search params:', searchParams)

      // Call real API with search filters
      const apiResponse = await venuesApi.getAll(searchParams)

      console.log('🔍 VENUE MARKETPLACE DEBUG: Search API response:', apiResponse)

      if (apiResponse.success && apiResponse.venues) {
        console.log(`✅ VENUE MARKETPLACE DEBUG: Found ${apiResponse.venues.length} matching venues`)
        setVenues(apiResponse.venues)
      } else {
        console.log('⚠️ VENUE MARKETPLACE DEBUG: Search API failed, using mock data with client-side filtering')

        // Fallback to mock data with client-side filtering
        const devVenues = getDevVenues()
        let filteredVenues = devVenues

        // Apply location filter
        if (filters.location) {
          const location = filters.location.toLowerCase()
          filteredVenues = filteredVenues.filter(venue =>
            venue.address.toLowerCase().includes(location) ||
            venue.name.toLowerCase().includes(location)
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

        // Apply pricing type filter
        if (filters.pricingType && filters.pricingType !== 'both') {
          filteredVenues = filteredVenues.filter(venue =>
            venue.pricingType === filters.pricingType || venue.pricingType === 'both'
          )
        }

        setVenues(filteredVenues)
      }
    } catch (err) {
      console.error('🚨 VENUE MARKETPLACE DEBUG: Search error:', err)
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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      
      {/* Header */}
      <div className="bg-gray-800 border-b border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/voxxy-shop')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </button>

            <div className="flex items-center gap-3 flex-1 justify-center">
              <Store className="h-8 w-8 text-purple-400" />
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white">Venue Marketplace</h1>
                <p className="text-gray-200">Find the perfect space for your next event</p>
              </div>
            </div>

            {/* Spacer to balance the layout */}
            <div className="flex-shrink-0 w-[140px]"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin text-purple-400" />
                    <span className="text-gray-200">Searching venues...</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-semibold">
                      {venues.length} {venues.length === 1 ? 'venue' : 'venues'} found
                    </p>
                    {filters.location && (
                      <p className="text-sm text-gray-300">
                        in {filters.location}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white/10 border border-white/20 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-all duration-200 rounded-l-lg ${
                      viewMode === 'grid'
                        ? 'bg-white/20 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-all duration-200 rounded-r-lg ${
                      viewMode === 'list'
                        ? 'bg-white/20 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-6 text-center">
                <p className="text-red-200 mb-4">{error}</p>
                <button
                  onClick={loadVenues}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && venues.length === 0 && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12 text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No venues found</h3>
                <p className="text-gray-300 mb-6">
                  Try adjusting your search criteria or browse all available venues.
                </p>
                <button
                  onClick={() => {
                    setFilters({})
                    handleSearch()
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 rounded-lg"
                >
                  View All Venues
                </button>
              </div>
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

            {/* Footer */}
            {!loading && venues.length > 0 && (
              <div className="mt-8 text-center py-6">
                <p className="text-gray-400 text-sm">
                  Voxxy Presents™
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}