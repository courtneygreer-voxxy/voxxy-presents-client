import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, ExternalLink } from "lucide-react"
import type { PlatformType } from '@/types/platformIntegration'

interface PlatformAuthModalProps {
  platform: PlatformType
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const platformConfig = {
  eventbrite: {
    name: 'Eventbrite',
    color: 'bg-orange-500',
    icon: '🎫',
    domain: 'eventbrite.com',
    description: 'Connect your Eventbrite account to import events and manage tickets'
  },
  luma: {
    name: 'Luma',
    color: 'bg-purple-500', 
    icon: '✨',
    domain: 'lu.ma',
    description: 'Connect your Luma account to sync events and communities'
  },
  meetup: {
    name: 'Meetup',
    color: 'bg-red-500',
    icon: '👥', 
    domain: 'meetup.com',
    description: 'Connect your Meetup account to import groups and events'
  }
}

export function PlatformAuthModal({ platform, isOpen, onClose, onSuccess }: PlatformAuthModalProps) {
  const [step, setStep] = useState<'consent' | 'login' | 'connecting'>('consent')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const config = platformConfig[platform]

  useEffect(() => {
    if (isOpen) {
      setStep('consent')
      setEmail('')
      setPassword('')
      setIsLoading(false)
    }
  }, [isOpen])

  const handleConsent = () => {
    setStep('login')
  }

  const handleLogin = async () => {
    if (!email || !password) return
    
    setIsLoading(true)
    setStep('connecting')
    
    // Simulate OAuth flow
    setTimeout(() => {
      onSuccess()
      onClose()
    }, 2000)
  }

  const handleClose = () => {
    setStep('consent')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'consent' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center text-white text-lg`}>
                  {config.icon}
                </div>
                <div>
                  <DialogTitle>Connect to {config.name}</DialogTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {config.domain}
                  </p>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {config.description}
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Voxxy Presents would like to:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• View your {platform} events and organizations</li>
                  <li>• Access event attendance and ticket sales data</li>
                  <li>• Read your profile information</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleConsent} className="flex-1">
                  Continue to {config.name}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'login' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded ${config.color} flex items-center justify-center text-white text-sm`}>
                  {config.icon}
                </div>
                <DialogTitle>Sign in to {config.name}</DialogTitle>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="text-xs text-gray-500">
                This is a mock login for demonstration purposes
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('consent')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleLogin} 
                  disabled={!email || !password || isLoading}
                  className="flex-1"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'connecting' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">Connecting...</DialogTitle>
            </DialogHeader>
            
            <div className="text-center py-8 space-y-4">
              <div className={`w-16 h-16 rounded-full ${config.color} flex items-center justify-center text-white text-2xl mx-auto`}>
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <div>
                <h3 className="font-medium">Authorizing with {config.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Setting up your account connection...
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}