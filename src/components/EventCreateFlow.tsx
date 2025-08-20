import React, { useState } from 'react'
import EventTypeSelection from './EventTypeSelection'
import OneTimeEventForm from './OneTimeEventForm'
import RecurringEventFormNew from './RecurringEventFormNew'
import type { Organization } from '@/types/database'

interface EventCreateFlowProps {
  organization: Organization
  isOpen: boolean
  onClose: () => void
  onSuccess: (event: any) => void
}

type FlowStep = 'selection' | 'one-time' | 'recurring'

export default function EventCreateFlow({ organization, isOpen, onClose, onSuccess }: EventCreateFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('selection')

  const handleTypeSelection = (type: 'one-time' | 'recurring') => {
    setCurrentStep(type)
  }

  const handleBack = () => {
    setCurrentStep('selection')
  }

  const handleClose = () => {
    setCurrentStep('selection')
    onClose()
  }

  const handleSuccess = (event: any) => {
    setCurrentStep('selection')
    onSuccess(event)
  }

  return (
    <>
      {currentStep === 'selection' && (
        <EventTypeSelection
          organization={organization}
          isOpen={isOpen}
          onClose={handleClose}
          onSelectType={handleTypeSelection}
        />
      )}

      {currentStep === 'one-time' && (
        <OneTimeEventForm
          organization={organization}
          isOpen={isOpen}
          onClose={handleClose}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      )}

      {currentStep === 'recurring' && (
        <RecurringEventFormNew
          organization={organization}
          isOpen={isOpen}
          onClose={handleClose}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}