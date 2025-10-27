/**
 * VendorMarketplace - Unified marketplace for all vendor types
 *
 * Features:
 * - Tabbed interface for filtering by vendor type
 * - Search and filter functionality
 * - Grid/List view modes
 * - Sort options
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Building2,
  ChefHat,
  Mic2,
  ShoppingBag
} from 'lucide-react'
import { VendorCard } from '@/components/vendor/VendorCard'
import { Vendor, VendorType } from '@/types/vendor'
import { vendorService } from '@/services/vendorService'

type ViewMode = 'grid' | 'list'
type SortOption = 'name' | 'type' | 'recent'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'type', label: 'Vendor Type' },
  { value: 'recent', label: 'Recently Added' }
]

const VENDOR_TYPE_TABS: Array<{ type: VendorType | 'all'; label: string; icon: React.ReactNode; color: string }> = [
  { type: 'all', label: 'All Vendors', icon: <Grid3X3 className="h-4 w-4" />, color: 'purple' },
  { type: 'venue', label: 'Venues', icon: <Building2 className="h-4 w-4" />, color: 'purple' },
  { type: 'catering', label: 'Catering', icon: <ChefHat className="h-4 w-4" />, color: 'orange' },
  { type: 'entertainment', label: 'Entertainment', icon: <Mic2 className="h-4 w-4" />, color: 'pink' },
  { type: 'market_vendor', label: 'Market', icon: <ShoppingBag className="h-4 w-4" />, color: 'green' }
]

export default function VendorMarketplace() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // State
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [selectedType, setSelectedType] = useState<VendorType | 'all'>(
    (searchParams.get('type') as VendorType) || 'all'
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  // Load vendors on mount
  useEffect(() => {
    loadVendors()
  }, [])

  // Filter and sort vendors when filters change
  useEffect(() => {
    filterAndSortVendors()
  }, [vendors, selectedType, searchQuery, sortBy])

  const loadVendors = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🏪 VENDOR MARKETPLACE: Loading vendors from API')

      // For now, use venueService (backward compatible)
      // This will try /venues endpoint first, then fall back to /vendors
      const result = await vendorService.searchVenues({})

      if (result.venues) {
        console.log(`✅ VENDOR MARKETPLACE: Found ${result.venues.length} vendors`)
        // Convert venues to vendors format (they're already compatible)
        setVendors(result.venues as any[])
      } else {
        console.log('⚠️ VENDOR MARKETPLACE: No vendors found')
        setVendors([])
      }
    } catch (err) {
      console.error('🚨 VENDOR MARKETPLACE: Error loading vendors:', err)
      setError('Failed to load vendors. Please try again.')
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortVendors = () => {
    let result = [...vendors]

    // Filter by vendor type
    if (selectedType !== 'all') {
      result = result.filter(v => v.vendorType === selectedType)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query) ||
        (v.address && v.address.toLowerCase().includes(query))
      )
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'type':
        result.sort((a, b) => a.vendorType.localeCompare(b.vendorType))
        break
      case 'recent':
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        break
    }

    setFilteredVendors(result)
  }

  const handleTypeChange = (type: VendorType | 'all') => {
    setSelectedType(type)
    const params = new URLSearchParams(searchParams)
    if (type === 'all') {
      params.delete('type')
    } else {
      params.set('type', type)
    }
    setSearchParams(params)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const params = new URLSearchParams(searchParams)
    if (query.trim()) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    setSearchParams(params)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a]">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-white hover:text-purple-400"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <h1 className="text-4xl font-bold text-white mb-2">
            Vendor Marketplace
          </h1>
          <p className="text-gray-300">
            Discover venues, catering, entertainment, and market vendors for your events
          </p>
        </div>

        {/* Vendor Type Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {VENDOR_TYPE_TABS.map(tab => {
              const isActive = selectedType === tab.type
              const colorClasses = {
                purple: isActive ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20',
                orange: isActive ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20',
                pink: isActive ? 'bg-pink-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20',
                green: isActive ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }

              return (
                <button
                  key={tab.type}
                  onClick={() => handleTypeChange(tab.type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    colorClasses[tab.color as keyof typeof colorClasses]
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium whitespace-nowrap">{tab.label}</span>
                  {tab.type === 'all' && (
                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {vendors.length}
                    </span>
                  )}
                  {tab.type !== 'all' && (
                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {vendors.filter(v => v.vendorType === tab.type).length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search vendors..."
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-purple-500' : 'bg-white/5 border-white/20'}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-purple-500' : 'bg-white/5 border-white/20'}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-300">
          Showing {filteredVendors.length} {selectedType !== 'all' ? VENDOR_TYPE_TABS.find(t => t.type === selectedType)?.label.toLowerCase() : 'vendors'}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="h-12 w-12 text-purple-400 animate-spin mb-4" />
            <p className="text-white">Loading vendors...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={loadVendors} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredVendors.length === 0 && (
          <div className="bg-white/5 border border-white/20 rounded-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              {VENDOR_TYPE_TABS.find(t => t.type === selectedType)?.icon && (
                <div className="mb-4 flex justify-center text-gray-400">
                  {React.cloneElement(
                    VENDOR_TYPE_TABS.find(t => t.type === selectedType)!.icon as React.ReactElement,
                    { className: 'h-16 w-16' }
                  )}
                </div>
              )}
              <h3 className="text-xl font-semibold text-white mb-2">
                No {selectedType !== 'all' ? VENDOR_TYPE_TABS.find(t => t.type === selectedType)?.label.toLowerCase() : 'vendors'} found
              </h3>
              <p className="text-gray-300 mb-6">
                {searchQuery
                  ? `Try adjusting your search or filters`
                  : `Be the first to list your ${selectedType !== 'all' ? selectedType : 'business'}!`
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/venue-create')} className="bg-purple-500 hover:bg-purple-600">
                  List Your Business
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Vendors Grid/List */}
        {!loading && !error && filteredVendors.length > 0 && (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredVendors.map(vendor => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Backward-compatible export
export { VendorMarketplace as VenueSearchPortal }
