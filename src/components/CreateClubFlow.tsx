import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import CreateClubName from './CreateClubName'
import CreateClubDescription from './CreateClubDescription'
import CreateClubContact from './CreateClubContact'
import CreateClubLocation from './CreateClubLocation'
import CreateClubAbout from './CreateClubAbout'
import CreateClubBranding from './CreateClubBranding'
import CreateClubSocial from './CreateClubSocial'
import CreateClubPreview from './CreateClubPreview'
import { useNavigate } from 'react-router-dom'
import type { Organization } from '@/types/database'
import type { CreateClubData } from '@/types/createClub'
import { createClub } from '@/services/clubCreation'

const INITIAL_DATA: CreateClubData = {
  name: '',
  description: '',
  contactEmail: '',
  defaultLocation: '',
  defaultAddress: '',
  logoUrl: undefined,
  bannerUrl: undefined,
  socialLinks: {},
  aboutOfferings: ['']
}

export default function CreateClubFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CreateClubData>(INITIAL_DATA)
  const [isCreating, setIsCreating] = useState(false)

  const steps = [
    { id: 1, title: "What's your club called?", component: CreateClubName },
    { id: 2, title: 'Tell us about your club', component: CreateClubDescription },
    { id: 3, title: 'How can people reach you?', component: CreateClubContact },
    { id: 4, title: 'Where do you usually meet?', component: CreateClubLocation },
    { id: 5, title: 'Tell your story', component: CreateClubAbout },
    { id: 6, title: 'Make it yours', component: CreateClubBranding },
    { id: 7, title: 'Connect your socials', component: CreateClubSocial },
    { id: 8, title: 'Preview & Create', component: CreateClubPreview }
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
        return formData.name.trim().length > 0
      case 2:
        return formData.description.trim().length > 0
      case 3:
        return formData.contactEmail.trim().length > 0
      case 4:
        return true // Location is optional
      case 5:
        return true // About story is optional
      case 6:
        return true // Branding is optional
      case 7:
        return true // Social links are optional
      case 8:
        return true // Ready to create
      default:
        return false
    }
  }

  const navigate = useNavigate()

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      console.log('Creating club with data:', formData)
      
      const result = await createClub(formData)
      console.log('Club created successfully!', result)
      
      // Navigate to the new club's admin page
      navigate(`/${result.slug}/admin`)
      
    } catch (error) {
      console.error('Failed to create club:', error)
      alert('Failed to create club. Please try again.')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's create your club! 🎉</h1>
          <p className="text-gray-600">We'll get you set up in just a few quick steps</p>
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
          <CardContent className="pt-6">
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