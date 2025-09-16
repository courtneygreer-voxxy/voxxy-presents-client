import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import CreateClubName from './CreateClubName'
import CreateClubContact from './CreateClubContact'
import CreateClubLocation from './CreateClubLocation'
import CreateClubAbout from './CreateClubAbout'
import CreateClubBranding from './CreateClubBranding'
import CreateClubSocial from './CreateClubSocial'
import CreateClubPreview from './CreateClubPreview'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
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

interface CreateClubFlowEnhancedProps {
  initialData?: CreateClubData
}

export default function CreateClubFlowEnhanced({
  initialData
}: CreateClubFlowEnhancedProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<CreateClubData>(initialData || INITIAL_DATA)
  const [isCreating, setIsCreating] = useState(false)
  
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const steps = [
    { id: 0, title: 'Name & describe your club', component: CreateClubName },
    { id: 1, title: 'How can people reach you?', component: CreateClubContact },
    { id: 2, title: 'Where do you usually meet?', component: CreateClubLocation },
    { id: 3, title: 'Tell your story', component: CreateClubAbout },
    { id: 4, title: 'Make it yours', component: CreateClubBranding },
    { id: 5, title: 'Connect your socials', component: CreateClubSocial },
    { id: 6, title: 'Preview & Create', component: CreateClubPreview }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const updateFormData = (updates: Partial<CreateClubData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }


  const handleCancel = () => {
    // Navigate back to dashboard/profile
    navigate('/profile')
  }


  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim().length > 0
      case 1:
        return formData.description.trim().length > 0
      case 2:
        return formData.contactEmail.trim().length > 0
      case 3:
        return true // Location is optional
      case 4:
        return true // About story is optional
      case 5:
        return true // Branding is optional
      case 6:
        return true // Social links are optional
      case 7:
        return true // Ready to create
      default:
        return false
    }
  }

  const handleCreate = async () => {
    if (!currentUser) {
      console.error('User must be authenticated to create a club')
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be signed in to create a club."
      })
      return
    }

    setIsCreating(true)
    try {
      console.log('Creating club with data:', formData)
      
      const result = await createClub(formData, currentUser.uid)
      console.log('Club created successfully!', result)
      
      toast({
        title: "Club Created!",
        description: `${formData.name} has been created successfully.`
      })
      
      // Navigate to the new club's admin page
      navigate(`/${result.slug}/admin`)
      
    } catch (error) {
      console.error('Failed to create club:', error)
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Failed to create club. Please try again."
      })
    } finally {
      setIsCreating(false)
    }
  }

  const renderCurrentStep = () => {
    // Regular form steps
    const currentStepConfig = steps[currentStep]
    const CurrentStepComponent = currentStepConfig.component
    
    const props: any = {
      data: formData,
      updateData: updateFormData,
      onNext: nextStep,
      isCreating: isCreating,
      onCreate: handleCreate
    }
    
    return <CurrentStepComponent {...props} />
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden py-8">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-white">
              Let's create your club! 🎉
            </h1>
          </div>
          <p className="text-gray-200">
            We'll get you set up in just a few quick steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-200">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-300">{steps[currentStep].title}</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg mb-8">
          <div className="p-6">
            {renderCurrentStep()}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          {currentStep > 0 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors duration-200 rounded-lg font-medium"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!canProceed() || isCreating}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors duration-200 rounded-lg font-medium"
            >
              {isCreating ? 'Creating...' : 'Create Club'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}