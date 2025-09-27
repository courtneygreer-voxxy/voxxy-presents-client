import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  MapPin,
  Users,
  Mail,
  Phone,
  Loader
} from 'lucide-react'
import { Venue, VenueApprovalRequest } from '@/types/venue'
import { useAuth } from '@/contexts/AuthContext'

interface VenueApprovalCardProps {
  venue: Venue
  onApprove?: (request: VenueApprovalRequest) => Promise<void>
  onReject?: (request: VenueApprovalRequest) => Promise<void>
}

export function VenueApprovalCard({ venue, onApprove, onReject }: VenueApprovalCardProps) {
  const { userProfile } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const getStatusIcon = () => {
    switch (venue.approvalStatus) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadge = () => {
    switch (venue.approvalStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
    }
  }

  const handleApprove = async () => {
    if (!userProfile?.id || !onApprove) return

    setIsProcessing(true)
    setError(null)

    try {
      await onApprove({
        venueId: venue.id,
        action: 'approve',
        adminId: userProfile.id,
        adminNotes: adminNotes || undefined
      })
    } catch (err) {
      console.error('Error approving venue:', err)
      setError('Failed to approve venue. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!userProfile?.id || !onReject) return
    if (!rejectReason.trim()) {
      setError('Rejection reason is required')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      await onReject({
        venueId: venue.id,
        action: 'reject',
        adminId: userProfile.id,
        reason: rejectReason,
        adminNotes: adminNotes || undefined
      })
      setShowRejectForm(false)
      setRejectReason('')
      setAdminNotes('')
    } catch (err) {
      console.error('Error rejecting venue:', err)
      setError('Failed to reject venue. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-gray-600" />
            <div>
              <CardTitle className="text-lg">{venue.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                {venue.address}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Venue Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>Capacity: {venue.capacity}</span>
          </div>
          <div>
            <span className="font-medium">Type:</span> {venue.venueType}
          </div>
          <div>
            <span className="font-medium">Pricing:</span> {venue.pricingType}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-gray-700 text-sm line-clamp-2">
            {venue.description}
          </p>
        </div>

        {/* Owner Contact */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">Owner Contact</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {/* We'll need to get owner details from the user profile */}
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span>Owner ID: {venue.ownerId}</span>
            </div>
          </div>
        </div>

        {/* Submission Details */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Submitted: {formatDate(venue.createdAt)}</div>
          {venue.approvedAt && (
            <div>Approved: {formatDate(venue.approvedAt)}</div>
          )}
          {venue.approvedBy && (
            <div>Approved by: {venue.approvedBy}</div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Admin Actions */}
        {venue.approvalStatus === 'pending' && (userProfile?.role === 'admin') && (
          <div className="space-y-3 pt-4 border-t">
            {!showRejectForm ? (
              <>
                {/* Admin Notes */}
                <div>
                  <Label htmlFor={`notes-${venue.id}`} className="text-sm">
                    Admin Notes (Optional)
                  </Label>
                  <Textarea
                    id={`notes-${venue.id}`}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any internal notes about this venue..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Approve Venue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectForm(true)}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Rejection Form */}
                <div>
                  <Label htmlFor={`reject-reason-${venue.id}`} className="text-sm">
                    Rejection Reason *
                  </Label>
                  <Textarea
                    id={`reject-reason-${venue.id}`}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please explain why this venue is being rejected..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor={`admin-notes-${venue.id}`} className="text-sm">
                    Admin Notes (Optional)
                  </Label>
                  <Textarea
                    id={`admin-notes-${venue.id}`}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                {/* Reject Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectForm(false)
                      setRejectReason('')
                      setError(null)
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isProcessing || !rejectReason.trim()}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Confirm Reject
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Rejection Details */}
        {venue.approvalStatus === 'rejected' && venue.rejectedReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-medium text-red-900 text-sm mb-1">Rejection Reason</h4>
            <p className="text-red-800 text-sm">{venue.rejectedReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}