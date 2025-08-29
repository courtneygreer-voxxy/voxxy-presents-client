import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, ExternalLink, ArrowRight, Skip } from "lucide-react"
import type { PlatformType } from '@/types/platformIntegration'

interface PlatformConnectionStepProps {
  onConnect: (platform: PlatformType) => Promise<void>
  onSkip: () => void
  onContinue: () => void
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
  isConnecting = false,
  connectedPlatforms = []
}: PlatformConnectionStepProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null)
  const [showAllPlatforms, setShowAllPlatforms] = useState(false)

  const handleConnect = async (platform: PlatformType) => {
    setSelectedPlatform(platform)
    await onConnect(platform)
  }

  const hasAnyConnection = connectedPlatforms.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Event Platform
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Speed up club creation by importing information from your existing event platform.
          You can always connect more platforms later.
        </p>
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
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {option.name}
                        </h3>
                        {option.popular && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Most Popular
                          </Badge>
                        )}
                        {isConnected && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{option.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {option.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {isConnected ? (
                        <Button variant="outline" size="sm" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleConnect(option.platform)}
                          disabled={isConnecting}
                          size="sm"
                        >
                          {isConnecting ? (
                            'Connecting...'
                          ) : (
                            <>
                              Connect
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      )}
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

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="flex items-center gap-2 text-gray-600"
        >
          <Skip className="h-4 w-4" />
          Skip for now
        </Button>
        
        <div className="flex items-center gap-2">
          {hasAnyConnection ? (
            <Button onClick={onContinue} className="flex items-center gap-2">
              Continue with connected platforms
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <p className="text-sm text-gray-500">
              Connect a platform or skip to continue
            </p>
          )}
        </div>
      </div>

      {/* Skip Info */}
      <div className="text-center text-sm text-gray-500">
        You can always connect platforms later in your club settings
      </div>
    </div>
  )
}