import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Building2, MapPin, Users, Clock, AlertCircle, Loader } from 'lucide-react'
import { VenueCreationRequest } from '@/types/venue'

interface VenueSubmissionReviewProps {
  venueData: VenueCreationRequest
  onSubmit: (data: VenueCreationRequest) => void
  onBack: () => void
  isSubmitting: boolean
  error: string | null
}

export function VenueSubmissionReview({ venueData, onSubmit, onBack, isSubmitting, error }: VenueSubmissionReviewProps) {

  const handleSubmit = () => {
    onSubmit(venueData)
  }

  const getVenueTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'bar': 'Bar',
      'restaurant': 'Restaurant',
      'community_center': 'Community Center',
      'outdoor': 'Outdoor Space',
      'event_space': 'Event Space',
      'other': 'Other'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {venueData.name}
          </CardTitle>
          <CardDescription>
            Review your venue submission before sending to our team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-semibold mb-3">Basic Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{venueData.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>Capacity: {venueData.capacity} people</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>Type: {getVenueTypeLabel(venueData.venueType)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{venueData.description}</p>
          </div>

          <Separator />

          {/* Amenities */}
          {venueData.amenities && venueData.amenities.length > 0 && (
            <>
              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {venueData.amenities.map(amenity => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Accessibility */}
          <div>
            <h3 className="font-semibold mb-3">Accessibility Features</h3>
            <div className="space-y-1">
              {venueData.accessibility.wheelchairAccessible && (
                <Badge variant="outline">♿ Wheelchair Accessible</Badge>
              )}
              {venueData.accessibility.lgbtqFriendly && (
                <Badge variant="outline">🏳️‍🌈 LGBTQ+ Friendly</Badge>
              )}
              {venueData.accessibility.genderNeutralBathrooms && (
                <Badge variant="outline">🚻 Gender Neutral Bathrooms</Badge>
              )}
              {!venueData.accessibility.wheelchairAccessible &&
               !venueData.accessibility.lgbtqFriendly &&
               !venueData.accessibility.genderNeutralBathrooms && (
                <span className="text-gray-500">No accessibility features specified</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Owner Information */}
          <div>
            <h3 className="font-semibold mb-3">Owner Contact</h3>
            <div className="space-y-1">
              <p><strong>Name:</strong> {venueData.ownerName}</p>
              <p><strong>Email:</strong> {venueData.ownerEmail}</p>
              {venueData.ownerPhone && (
                <p><strong>Phone:</strong> {venueData.ownerPhone}</p>
              )}
              <p><strong>Preferred Contact:</strong> {venueData.preferredContactMethod}</p>
            </div>
          </div>

          {venueData.businessInfo && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Business Information</h3>
                <p className="text-gray-700">{venueData.businessInfo}</p>
              </div>
            </>
          )}

          {venueData.message && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Additional Message</h3>
                <p className="text-gray-700">{venueData.message}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Submission Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          By submitting this venue, you agree that the information provided is accurate and that you have the authority to represent this venue. Our team will review your submission and contact you within 48 hours.
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back to Edit
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Venue'
          )}
        </Button>
      </div>
    </div>
  )
}