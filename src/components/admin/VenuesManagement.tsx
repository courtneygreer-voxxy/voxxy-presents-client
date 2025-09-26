import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Building2,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Plus
} from 'lucide-react'
import { VenueApprovalCard } from './VenueApprovalCard'
import { Venue, VenueApprovalRequest, VenueApprovalResult } from '@/types/venue'
import { useAuth } from '@/contexts/AuthContext'

interface VenuesManagementProps {
  venues: Venue[]
  onVenueUpdate?: (updatedVenue: Venue) => void
}

export function VenuesManagement({ venues, onVenueUpdate }: VenuesManagementProps) {
  const { userProfile } = useAuth()
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>(venues)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [isProcessing, setIsProcessing] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Filter venues based on search and status
  useEffect(() => {
    let filtered = venues

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(venue =>
        venue.name.toLowerCase().includes(query) ||
        venue.address.toLowerCase().includes(query) ||
        venue.venueType.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(venue => venue.approvalStatus === statusFilter)
    }

    setFilteredVenues(filtered)
  }, [venues, searchQuery, statusFilter])

  const handleVenueApproval = async (request: VenueApprovalRequest): Promise<void> => {
    setIsProcessing(true)

    try {
      // TODO: Replace with actual API call
      console.log('Approving venue:', request)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock successful response
      const updatedVenue = venues.find(v => v.id === request.venueId)
      if (updatedVenue && onVenueUpdate) {
        const updated: Venue = {
          ...updatedVenue,
          approvalStatus: 'approved',
          approvedBy: request.adminId,
          approvedAt: new Date()
        }
        onVenueUpdate(updated)
      }

      setNotification({
        type: 'success',
        message: 'Venue approved successfully!'
      })

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)

    } catch (error) {
      console.error('Error approving venue:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVenueRejection = async (request: VenueApprovalRequest): Promise<void> => {
    setIsProcessing(true)

    try {
      // TODO: Replace with actual API call
      console.log('Rejecting venue:', request)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock successful response
      const updatedVenue = venues.find(v => v.id === request.venueId)
      if (updatedVenue && onVenueUpdate) {
        const updated: Venue = {
          ...updatedVenue,
          approvalStatus: 'rejected',
          rejectedReason: request.reason,
          approvedBy: request.adminId,
          approvedAt: new Date()
        }
        onVenueUpdate(updated)
      }

      setNotification({
        type: 'success',
        message: 'Venue rejected successfully!'
      })

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)

    } catch (error) {
      console.error('Error rejecting venue:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusCounts = () => {
    return {
      total: venues.length,
      pending: venues.filter(v => v.approvalStatus === 'pending').length,
      approved: venues.filter(v => v.approvalStatus === 'approved').length,
      rejected: venues.filter(v => v.approvalStatus === 'rejected').length
    }
  }

  const counts = getStatusCounts()

  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <Alert>
        <AlertDescription>
          You don't have permission to manage venues. Admin access required.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Venues Management</h2>
          <p className="text-gray-600">Review and approve venue submissions</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Venue
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{counts.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search venues by name, address, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification */}
      {notification && (
        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {/* Venues List */}
      <div className="space-y-4">
        {filteredVenues.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No venues have been submitted yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVenues.map(venue => (
            <VenueApprovalCard
              key={venue.id}
              venue={venue}
              onApprove={handleVenueApproval}
              onReject={handleVenueRejection}
            />
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredVenues.length > 0 && (
        <div className="text-center text-gray-600">
          Showing {filteredVenues.length} of {venues.length} venues
        </div>
      )}
    </div>
  )
}