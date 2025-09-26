import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Building2 } from 'lucide-react'
import { VenueDetailsForm } from './VenueDetailsForm'
import { VenueOwnerInfoForm } from './VenueOwnerInfoForm'
import { VenueSubmissionReview } from './VenueSubmissionReview'
import { VenueCreationRequest } from '@/types/venue'

type FlowStep = 'venue-details' | 'owner-info' | 'review' | 'submitted'

export function VenueCreateFlow() {
  const navigate = useNavigate()
  const { currentUser, userProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState<FlowStep>('venue-details')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [venueData, setVenueData] = useState<Partial<VenueCreationRequest>>({})

  const handleVenueDetailsComplete = (data: Partial<VenueCreationRequest>) => {
    setVenueData(prev => ({ ...prev, ...data }))
    setCurrentStep('owner-info')
  }

  const handleOwnerInfoComplete = (data: Partial<VenueCreationRequest>) => {
    setVenueData(prev => ({ ...prev, ...data }))
    setCurrentStep('review')
  }

  const handleSubmitVenue = async (finalData: VenueCreationRequest) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // TODO: Implement venue creation API call
      console.log('Submitting venue:', finalData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setCurrentStep('submitted')
    } catch (error) {
      console.error('Error submitting venue:', error)
      setSubmitError('Failed to submit venue. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'venue-details':
        return (
          <VenueDetailsForm
            initialData={venueData}
            onComplete={handleVenueDetailsComplete}
            onBack={() => navigate('/')}
          />
        )

      case 'owner-info':
        return (
          <VenueOwnerInfoForm
            initialData={venueData}
            userEmail={currentUser?.email || ''}
            userName={userProfile?.name || ''}
            onComplete={handleOwnerInfoComplete}
            onBack={() => setCurrentStep('venue-details')}
          />
        )

      case 'review':
        return (
          <VenueSubmissionReview
            venueData={venueData as VenueCreationRequest}
            onSubmit={handleSubmitVenue}
            onBack={() => setCurrentStep('owner-info')}
            isSubmitting={isSubmitting}
            error={submitError}
          />
        )

      case 'submitted':
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-900">Venue Submitted Successfully!</CardTitle>
              <CardDescription className="text-lg">
                Your venue has been submitted for review by our team.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-semibold text-blue-900 mb-1">What happens next?</h3>
                    <ul className="text-blue-800 space-y-1 text-sm">
                      <li>• Our team will review your venue within 48 hours</li>
                      <li>• You'll receive an email notification when approved</li>
                      <li>• Once approved, you'll get access to your venue dashboard</li>
                      <li>• Event organizers can then discover and request your venue</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button onClick={() => navigate('/')} className="w-full">
                  Return to Home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep('venue-details')
                    setVenueData({})
                  }}
                  className="w-full"
                >
                  Create Another Venue
                </Button>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  const stepNumbers = {
    'venue-details': 1,
    'owner-info': 2,
    'review': 3,
    'submitted': 4
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      {currentStep !== 'submitted' && (
        <div className="flex items-center justify-center space-x-4">
          {['venue-details', 'owner-info', 'review'].map((step, index) => {
            const stepNumber = index + 1
            const isActive = currentStep === step
            const isCompleted = stepNumbers[currentStep] > stepNumber

            return (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${isCompleted ? 'bg-green-600 text-white' :
                    isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                </div>
                {index < 2 && (
                  <div className={`w-12 h-1 mx-2 ${
                    stepNumbers[currentStep] > stepNumber ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Step Titles */}
      {currentStep !== 'submitted' && (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {currentStep === 'venue-details' && 'Venue Details'}
            {currentStep === 'owner-info' && 'Owner Information'}
            {currentStep === 'review' && 'Review & Submit'}
          </h2>
          <p className="text-gray-600">
            {currentStep === 'venue-details' && 'Tell us about your venue'}
            {currentStep === 'owner-info' && 'Share your contact information'}
            {currentStep === 'review' && 'Review your submission before sending'}
          </p>
        </div>
      )}

      {/* Current Step Content */}
      {renderStep()}
    </div>
  )
}