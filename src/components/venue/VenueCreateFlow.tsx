import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { updateUser } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'
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

      // Mark venue owner onboarding as completed
      if (currentUser) {
        await updateUser(currentUser.uid, {
          venueOwnerProfile: {
            venueIds: userProfile?.venueOwnerProfile?.venueIds || [],
            businessInfo: userProfile?.venueOwnerProfile?.businessInfo || '',
            phone: userProfile?.venueOwnerProfile?.phone || '',
            preferredContactMethod: userProfile?.venueOwnerProfile?.preferredContactMethod || 'email',
            onboardingCompleted: true,
            ...userProfile?.venueOwnerProfile
          }
        })
      }

      setCurrentStep('submitted')

      // Redirect to venue dashboard after a short delay
      setTimeout(() => {
        navigate('/venues/dashboard')
      }, 2000)
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
          <div className="max-w-2xl mx-auto bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-400/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Venue Submitted Successfully!</h2>
              <p className="text-gray-300 text-lg mb-4">
                Your venue has been submitted for review by our team.
              </p>
              <p className="text-purple-400 text-sm mb-8">
                Redirecting to your venue dashboard in a moment...
              </p>

              <div className="bg-blue-400/10 backdrop-blur-sm border border-blue-400/30 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-semibold text-white mb-3">What happens next?</h3>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Our team will review your venue within 48 hours</li>
                      <li>• You'll receive an email notification when approved</li>
                      <li>• Once approved, you'll get access to your venue dashboard</li>
                      <li>• Event organizers can then discover and request your venue</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/voxxy-shop')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Return to Voxxy Shop
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep('venue-details')
                    setVenueData({})
                  }}
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                >
                  Create Another Venue
                </Button>
              </div>
            </div>
          </div>
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
    <div className="space-y-8">
      {/* Progress Steps */}
      {currentStep !== 'submitted' && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <div className="flex items-center justify-center space-x-4">
            {['venue-details', 'owner-info', 'review'].map((step, index) => {
              const stepNumber = index + 1
              const isActive = currentStep === step
              const isCompleted = stepNumbers[currentStep] > stepNumber

              return (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2
                    ${isCompleted ? 'bg-green-500 border-green-400 text-white' :
                      isActive ? 'bg-purple-600 border-purple-500 text-white' :
                      'bg-white/10 border-white/30 text-gray-300'}
                  `}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                  </div>
                  {index < 2 && (
                    <div className={`w-12 h-1 mx-2 rounded ${
                      stepNumbers[currentStep] > stepNumber ? 'bg-green-500' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step Titles */}
      {currentStep !== 'submitted' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {currentStep === 'venue-details' && 'Venue Details'}
            {currentStep === 'owner-info' && 'Owner Information'}
            {currentStep === 'review' && 'Review & Submit'}
          </h2>
          <p className="text-gray-300 text-lg">
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