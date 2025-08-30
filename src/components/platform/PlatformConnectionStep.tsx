import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, ExternalLink, ArrowRight, SkipForward, ArrowLeft } from "lucide-react"
import type { PlatformType } from '@/types/platformIntegration'
import { PlatformAuthModal } from './PlatformAuthModal'
import { PreviewBadge } from '@/components/ui/preview-badge'
import { PreviewDisclaimerModal } from '@/components/ui/preview-disclaimer-modal'
import { isFeatureEnabled } from '@/config/environments'

interface PlatformConnectionStepProps {
  onConnect: (platform: PlatformType) => Promise<void>
  onSkip: () => void
  onContinue: () => void
  onCancel?: () => void
  isConnecting?: boolean
  connectedPlatforms?: PlatformType[]
}

const platformOptions = [
  {
    platform: 'eventbrite' as PlatformType,
    name: 'Eventbrite',
    icon: '🎫',
    color: 'bg-orange-500',
    description: 'Import your events, attendees, and ticket sales',
    features: ['Event details', 'Ticket sales data', 'Attendee lists', 'Venue information'],
    popular: true
  },
  {
    platform: 'luma' as PlatformType,
    name: 'Luma',
    icon: '✨',
    color: 'bg-purple-500',
    description: 'Sync your Luma events and communities',
    features: ['Event details', 'Community data', 'RSVP information', 'Online event links'],
    popular: false
  },
  {
    platform: 'meetup' as PlatformType,
    name: 'Meetup',
    icon: '👥',
    color: 'bg-red-500',
    description: 'Connect your Meetup groups and events',
    features: ['Group information', 'Event details', 'Member data', 'Venue details'],
    popular: false
  }
]

export function PlatformConnectionStep({ 
  onConnect, 
  onSkip, 
  onContinue,
  onCancel,
  isConnecting = false,
  connectedPlatforms = []
}: PlatformConnectionStepProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null)
  const [showAllPlatforms, setShowAllPlatforms] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalPlatform, setAuthModalPlatform] = useState<PlatformType | null>(null)
  const [previewDisclaimerOpen, setPreviewDisclaimerOpen] = useState(false)
  const [pendingPlatform, setPendingPlatform] = useState<PlatformType | null>(null)
  
  // Check if we're in preview or beta mode
  const isPreviewMode = isFeatureEnabled('platformIntegrationPreview')
  const isBetaMode = isFeatureEnabled('platformIntegrationBeta')
  const previewMode = isBetaMode ? 'beta' : 'preview'
  const isComingSoonMode = !isPreviewMode && !isBetaMode // Production mode with teasers

  const handleConnect = async (platform: PlatformType) => {
    // If in preview/beta mode, show disclaimer first
    if (isPreviewMode || isBetaMode) {
      setPendingPlatform(platform)
      setPreviewDisclaimerOpen(true)
    } else {
      // Normal flow for production
      setAuthModalPlatform(platform)
      setAuthModalOpen(true)
    }
  }

  const handlePreviewContinue = () => {
    setPreviewDisclaimerOpen(false)
    if (pendingPlatform) {
      setAuthModalPlatform(pendingPlatform)
      setAuthModalOpen(true)
      setPendingPlatform(null)
    }
  }

  const handlePreviewCancel = () => {
    setPreviewDisclaimerOpen(false)
    setPendingPlatform(null)
  }

  const handleAuthSuccess = async () => {
    if (authModalPlatform) {
      setSelectedPlatform(authModalPlatform)
      
      // Call the parent's onConnect function
      await onConnect(authModalPlatform)
      
      setSelectedPlatform(null)
    }
    setAuthModalOpen(false)
    setAuthModalPlatform(null)
  }

  const handleAuthClose = () => {
    setAuthModalOpen(false)
    setAuthModalPlatform(null)
  }

  const hasAnyConnection = connectedPlatforms.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Connect Your Event Platform
              {(isPreviewMode || isBetaMode) && (
                <PreviewBadge 
                  variant={previewMode}
                  size="md"
                />
              )}
              {isComingSoonMode && (
                <PreviewBadge 
                  variant="coming-soon"
                  size="md"
                />
              )}
            </h2>
          </div>
        </div>
        <div className="text-center">
          <p className="text-gray-600 max-w-md mx-auto">
            {(isPreviewMode || isBetaMode) ? (
              <>
                Experience our upcoming platform integrations in {isBetaMode ? 'beta' : 'preview'} mode. 
                See how you'll be able to import information from your existing event platform.
              </>
            ) : isComingSoonMode ? (
              <>
                Platform integrations are coming soon! You'll be able to automatically import 
                information from your existing event platforms to speed up club creation.
              </>
            ) : (
              <>
                Speed up club creation by importing information from your existing event platform.
                You can always connect more platforms later.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Platform Options */}
      <div className="space-y-4">
        {platformOptions
          .filter((_, index) => showAllPlatforms || index === 0)
          .map(option => {
            const isConnected = connectedPlatforms.includes(option.platform)
            const isConnecting = selectedPlatform === option.platform

            return (
              <Card 
                key={option.platform}
                className={`transition-all cursor-pointer hover:shadow-md ${
                  isConnected ? 'ring-2 ring-green-200 bg-green-50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Platform Icon */}
                    <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center text-white text-xl flex-shrink-0`}>
                      {option.icon}
                    </div>
                    
                    {/* Platform Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {option.name}
                          </h3>
                          {option.popular && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Most Popular
                            </Badge>
                          )}
                          {(isPreviewMode || isBetaMode) && (
                            <PreviewBadge 
                              variant={previewMode}
                              size="sm"
                            />
                          )}
                          {isComingSoonMode && (
                            <PreviewBadge 
                              variant="coming-soon"
                              size="sm"
                            />
                          )}
                          {isConnected && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        
                        {/* Action Button - moved to title level, right side */}
                        <div>
                          {isConnected ? (
                            <Button variant="outline" size="sm" disabled className="h-8 px-3 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Button>
                          ) : isComingSoonMode ? (
                            <Button
                              disabled
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 text-xs cursor-not-allowed opacity-60"
                            >
                              Coming Soon
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleConnect(option.platform)}
                              disabled={isConnecting}
                              size="sm"
                              className="h-8 px-3 text-xs"
                            >
                              {isConnecting ? (
                                'Connecting...'
                              ) : (
                                <>
                                  Connect
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{option.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {option.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Show More Platforms */}
      {!showAllPlatforms && platformOptions.length > 1 && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setShowAllPlatforms(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            Show all platforms ({platformOptions.length - 1} more)
          </Button>
        </div>
      )}

      <Separator />

      {/* Benefits */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-gray-900 mb-3">
            Why connect your platform?
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              Auto-fill club information (name, description, logo)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              Import your existing events automatically
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              Keep ticket sales and attendee data in sync
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              Save time on setup and ongoing management
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end pt-6">
        {hasAnyConnection ? (
          <Button onClick={onContinue} className="flex items-center gap-2">
            Continue with connected platforms
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex items-center gap-2"
          >
            <SkipForward className="h-4 w-4" />
            Skip for now
          </Button>
        )}
      </div>

      {/* Skip Info */}
      <div className="text-center text-sm text-gray-500">
        You can always connect platforms later in your club settings
      </div>

      {/* Platform Auth Modal */}
      {authModalPlatform && (
        <PlatformAuthModal
          platform={authModalPlatform}
          isOpen={authModalOpen}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Preview Disclaimer Modal */}
      <PreviewDisclaimerModal
        isOpen={previewDisclaimerOpen}
        onClose={handlePreviewCancel}
        onContinue={handlePreviewContinue}
        mode={previewMode}
      />
    </div>
  )
}