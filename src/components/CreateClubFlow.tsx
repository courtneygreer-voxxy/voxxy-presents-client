import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import CreateClubBasicInfo from './CreateClubBasicInfo'
import CreateClubBranding from './CreateClubBranding'
import CreateClubSocialAbout from './CreateClubSocialAbout'
import CreateClubPreview from './CreateClubPreview'
import type { Organization } from '@/types/database'

interface CreateClubData {
  // Basic Info
  name: string
  description: string
  contactEmail: string
  defaultLocation: string
  defaultAddress: string
  
  // Branding
  logoUrl?: string
  bannerUrl?: string
  aboutImageUrl?: string
  primaryColor: string
  backgroundColor: string
  
  // Social & About
  socialLinks: {
    instagram?: string
    website?: string
    eventbrite?: string
    venmo?: string
    other?: string
  }
  aboutStory?: string
  aboutOfferings?: string[]
}

const INITIAL_DATA: CreateClubData = {
  name: '',
  description: '',
  contactEmail: '',
  defaultLocation: '',
  defaultAddress: '',
  primaryColor: '#8B5CF6', // Purple
  backgroundColor: '#FFFFFF',
  socialLinks: {},
  aboutOfferings: ['']
}

export default function CreateClubFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CreateClubData>(INITIAL_DATA)
  const [isCreating, setIsCreating] = useState(false)

  const steps = [
    { id: 1, title: 'Basic Information', component: CreateClubBasicInfo },
    { id: 2, title: 'Branding & Style', component: CreateClubBranding },
    { id: 3, title: 'Social & About', component: CreateClubSocialAbout },
    { id: 4, title: 'Preview & Create', component: CreateClubPreview }
  ]

  const progress = (currentStep / steps.length) * 100

  const updateFormData = (updates: Partial<CreateClubData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.description && formData.contactEmail
      case 2:
        return true // Branding is optional
      case 3:
        return true // Social links are optional
      case 4:
        return true // Ready to create
      default:
        return false
    }
  }

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      // TODO: Implement club creation logic
      console.log('Creating club with data:', formData)
      
      // For now, just simulate creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // TODO: Navigate to new club
      console.log('Club created successfully!')
      
    } catch (error) {
      console.error('Failed to create club:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const CurrentStepComponent = steps[currentStep - 1].component

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Club</h1>
          <p className="text-gray-600">Let's set up your organization in just a few steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of {steps.length}</span>
            <span className="text-sm text-gray-500">{steps[currentStep - 1].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                {currentStep}
              </span>
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent 
              data={formData}
              updateData={updateFormData}
              onNext={nextStep}
              isCreating={isCreating}
              onCreate={handleCreate}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={!canProceed() || isCreating}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isCreating ? 'Creating...' : 'Create Club'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}