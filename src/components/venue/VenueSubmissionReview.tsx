import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, MapPin, Users, AlertCircle, Loader } from 'lucide-react'
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
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
            <Building2 className="h-6 w-6 text-purple-400" />
            {venueData.name}
          </h2>
          <p className="text-gray-300">
            Review your venue submission before sending to our team
          </p>
        </div>
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-semibold text-white mb-3">Basic Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">{venueData.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">Capacity: {venueData.capacity} people</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">Type: {getVenueTypeLabel(venueData.venueType)}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/20"></div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-300">{venueData.description}</p>
          </div>

          <div className="h-px bg-white/20"></div>

          {/* Amenities */}
          {venueData.amenities && venueData.amenities.length > 0 && (
            <>
              <div>
                <h3 className="font-semibold text-white mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {venueData.amenities.map(amenity => (
                    <Badge key={amenity} className="bg-purple-600/80 text-white">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="h-px bg-white/20"></div>
            </>
          )}

          {/* Accessibility */}
          <div>
            <h3 className="font-semibold text-white mb-3">Accessibility Features</h3>
            <div className="space-y-2">
              {venueData.accessibility.wheelchairAccessible && (
                <Badge className="bg-green-600/80 text-white">♿ Wheelchair Accessible</Badge>
              )}
              {venueData.accessibility.lgbtqFriendly && (
                <Badge className="bg-rainbow-600/80 text-white">🏳️‍🌈 LGBTQ+ Friendly</Badge>
              )}
              {venueData.accessibility.genderNeutralBathrooms && (
                <Badge className="bg-blue-600/80 text-white">🚻 Gender Neutral Bathrooms</Badge>
              )}
              {!venueData.accessibility.wheelchairAccessible &&
               !venueData.accessibility.lgbtqFriendly &&
               !venueData.accessibility.genderNeutralBathrooms && (
                <span className="text-gray-400">No accessibility features specified</span>
              )}
            </div>
          </div>

          <div className="h-px bg-white/20"></div>

          {/* Owner Information */}
          <div>
            <h3 className="font-semibold text-white mb-3">Owner Contact</h3>
            <div className="space-y-1">
              <p className="text-gray-300"><span className="text-white font-medium">Name:</span> {venueData.ownerName}</p>
              <p className="text-gray-300"><span className="text-white font-medium">Email:</span> {venueData.ownerEmail}</p>
              {venueData.ownerPhone && (
                <p className="text-gray-300"><span className="text-white font-medium">Phone:</span> {venueData.ownerPhone}</p>
              )}
              <p className="text-gray-300"><span className="text-white font-medium">Preferred Contact:</span> {venueData.preferredContactMethod}</p>
            </div>
          </div>

          {venueData.businessInfo && (
            <>
              <div className="h-px bg-white/20"></div>
              <div>
                <h3 className="font-semibold text-white mb-2">Business Information</h3>
                <p className="text-gray-300">{venueData.businessInfo}</p>
              </div>
            </>
          )}

          {venueData.message && (
            <>
              <div className="h-px bg-white/20"></div>
              <div>
                <h3 className="font-semibold text-white mb-2">Additional Message</h3>
                <p className="text-gray-300">{venueData.message}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Submission Info */}
      <Alert className="bg-blue-400/10 border-blue-400/30">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-gray-300">
          By submitting this venue, you agree that the information provided is accurate and that you have the authority to represent this venue. Our team will review your submission and contact you within 48 hours.
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert className="bg-red-400/10 border-red-400/30">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 disabled:opacity-50"
        >
          Back to Edit
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
        >
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