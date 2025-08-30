import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PlatformConnectionStep } from './platform/PlatformConnectionStep'
import CreateClubName from './CreateClubName'
import CreateClubDescription from './CreateClubDescription'
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
import type { PlatformType } from '@/types/platformIntegration'
import { createClub } from '@/services/clubCreation'
import { initiatePlatformAuth, getPlatformOrganizations } from '@/services/platformIntegrationService'

const INITIAL_DATA: CreateClubData = {
  name: '',
  tagline: '',
  description: '',
  contactEmail: '',
  defaultLocation: '',
  defaultAddress: '',
  logoUrl: undefined,
  bannerUrl: undefined,
  socialLinks: {},
  aboutOfferings: ['']
}

export default function CreateClubFlowEnhanced() {
  const [currentStep, setCurrentStep] = useState(0) // Start at 0 for platform step
  const [formData, setFormData] = useState<CreateClubData>(INITIAL_DATA)
  const [isCreating, setIsCreating] = useState(false)
  const [connectedPlatforms, setConnectedPlatforms] = useState<PlatformType[]>([])
  const [platformDataImported, setPlatformDataImported] = useState(false)
  
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const steps = [
    { id: 0, title: "Connect your platform (optional)", component: PlatformConnectionStep, optional: true },
    { id: 1, title: "What's your club called?", component: CreateClubName },
    { id: 2, title: 'Describe your club', component: CreateClubDescription },
    { id: 3, title: 'How can people reach you?', component: CreateClubContact },
    { id: 4, title: 'Where do you usually meet?', component: CreateClubLocation },
    { id: 5, title: 'Tell your story', component: CreateClubAbout },
    { id: 6, title: 'Make it yours', component: CreateClubBranding },
    { id: 7, title: 'Connect your socials', component: CreateClubSocial },
    { id: 8, title: 'Preview & Create', component: CreateClubPreview }
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

  const skipPlatformStep = () => {
    setCurrentStep(1) // Skip to the name step
  }

  const handleCancel = () => {
    // Navigate back to dashboard/profile
    navigate('/profile')
  }

  const handlePlatformConnect = async (platform: PlatformType) => {
    if (!currentUser) return

    try {
      // Simulate successful connection (popup modal handles the auth flow)
      toast({
        title: "Connected",
        description: `Successfully connected to ${platform}!`
      })
      
      // Get platform organizations (mock data) and import data
      try {
        const platformOrgs = await getPlatformOrganizations(`mock-${platform}-connection`)
        
        if (platformOrgs.length > 0) {
          const org = platformOrgs[0]
          
          // Auto-fill form data from platform
          updateFormData({
            name: org.name || '',
            description: org.description || org.shortDescription || '',
            contactEmail: org.email || '',
            defaultLocation: org.location || '',
            logoUrl: org.logoUrl || undefined,
            bannerUrl: org.bannerUrl || undefined,
            socialLinks: {
              ...org.socialLinks,
              [platform]: org.platformUrl
            }
          })
          
          setPlatformDataImported(true)
          
          toast({
            title: "Data Imported",
            description: `Successfully imported club information from ${platform}!`
          })
        }
        
        // Add platform to connected list
        setConnectedPlatforms([...connectedPlatforms, platform])
        
      } catch (error) {
        console.error('Failed to import platform data:', error)
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "Failed to import data from platform, but connection was successful."
        })
        // Still add the platform as connected even if data import failed
        setConnectedPlatforms([...connectedPlatforms, platform])
      }
      
    } catch (error) {
      console.error(`Failed to connect to ${platform}:`, error)
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: `Failed to connect to ${platform}. You can try again later.`
      })
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Platform step is always optional
        return true
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
    const currentStepConfig = steps[currentStep]
    
    if (currentStep === 0) {
      // Platform connection step
      return (
        <PlatformConnectionStep
          onConnect={handlePlatformConnect}
          onSkip={skipPlatformStep}
          onContinue={nextStep}
          onCancel={handleCancel}
          connectedPlatforms={connectedPlatforms}
        />
      )
    }
    
    // Regular form steps
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's create your club! 🎉</h1>
          <p className="text-gray-600">
            {currentStep === 0 
              ? "First, let's see if we can speed things up by importing from your existing event platform"
              : "We'll get you set up in just a few quick steps"
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">{steps[currentStep].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
          {platformDataImported && currentStep > 0 && (
            <div className="text-xs text-green-600 mt-1">
              ✨ Data imported from connected platform
            </div>
          )}
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep > 0 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
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
        )}
      </div>
    </div>
  )
}