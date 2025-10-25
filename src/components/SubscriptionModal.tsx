import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Heart,
  Sparkles,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  PartyPopper,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { subscriptionService } from "@/services/subscriptionService"
import type { Organization } from '@/types/database'

interface SubscriptionModalProps {
  organization: Organization
  trigger?: React.ReactNode
}

interface SubscriptionForm {
  contactMethod: 'email' | 'phone'
  contact: string
  name: string
}

const INITIAL_FORM: SubscriptionForm = {
  contactMethod: 'email',
  contact: '',
  name: ''
}

export function SubscriptionModal({ organization, trigger }: SubscriptionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<SubscriptionForm>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof SubscriptionForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    // Name validation
    if (formData.name.trim().length < 2) {
      toast({
        variant: "destructive",
        title: "Name Required",
        description: "Please enter your name (at least 2 characters)."
      })
      return false
    }

    // Contact validation based on method
    if (formData.contactMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.contact)) {
        toast({
          variant: "destructive",
          title: "Invalid Email",
          description: "Please enter a valid email address."
        })
        return false
      }
    } else {
      // Phone validation - remove all non-digits and check length
      const digitsOnly = formData.contact.replace(/\D/g, '')
      if (digitsOnly.length < 10) {
        toast({
          variant: "destructive",
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number (at least 10 digits)."
        })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await subscriptionService.createSubscription({
        organizationId: organization.id,
        email: formData.contactMethod === 'email' ? formData.contact : undefined,
        phone: formData.contactMethod === 'phone' ? formData.contact : undefined,
        name: formData.name,
        preferences: {
          events: true,
          newsletter: true,
          updates: true
        },
        source: 'club_page'
      })

      setIsSuccess(true)

      // Show success toast
      toast({
        title: "🎉 You're In!",
        description: `Welcome to the ${organization.name} family!`
      })

      // Reset form after delay
      setTimeout(() => {
        setFormData(INITIAL_FORM)
        setIsSuccess(false)
        setIsOpen(false)
      }, 3000)

    } catch (error) {
      console.error('Subscription failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      toast({
        variant: "destructive",
        title: "Oops!",
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setFormData(INITIAL_FORM)
    setIsSuccess(false)
    setIsOpen(false)
  }

  const defaultTrigger = (
    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2 transform transition-all hover:scale-105 shadow-lg hover:shadow-xl">
      <Heart className="h-4 w-4 animate-pulse" />
      Join the Community
    </Button>
  )

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={resetAndClose}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-purple-900/95 backdrop-blur-xl border-2 border-purple-400/50 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-purple-600/20 animate-pulse"></div>
          <div className="relative text-center py-12">
            <div className="mb-6 flex justify-center gap-4">
              <PartyPopper className="h-16 w-16 text-yellow-400 animate-bounce" />
              <Sparkles className="h-16 w-16 text-pink-400 animate-spin" style={{ animationDuration: '3s' }} />
              <PartyPopper className="h-16 w-16 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <h3 className="text-4xl font-bold text-white mb-4 animate-pulse">
              Welcome to the Family! 🎉
            </h3>
            <p className="text-xl text-purple-200 mb-2">
              You're officially part of {organization.name}!
            </p>
            <p className="text-purple-300">
              Get ready for amazing experiences 🚀
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-xl border-2 border-purple-400/50 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <DialogHeader className="space-y-4 relative z-10">
          <div className="flex justify-center">
            <div className="relative">
              <Zap className="h-12 w-12 text-yellow-400 animate-bounce" />
              <Sparkles className="h-6 w-6 text-pink-400 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Join {organization.name}!
          </DialogTitle>
          <p className="text-purple-200 text-center text-lg">
            🎊 Be the first to know about events, parties, and good vibes! 🎊
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6 relative z-10">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-purple-200 font-semibold">
              What's your name? ✨
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your awesome name"
              className="bg-white/10 border-purple-400/30 text-white placeholder-purple-300/50 focus:border-pink-400 focus:ring-pink-400 text-lg"
              disabled={isSubmitting}
            />
          </div>

          {/* Contact Method Toggle */}
          <div className="space-y-3">
            <Label className="text-purple-200 font-semibold">
              How should we reach you? 📱
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, contactMethod: 'email', contact: '' }))
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.contactMethod === 'email'
                    ? 'border-pink-400 bg-pink-500/20 shadow-lg shadow-pink-500/50'
                    : 'border-purple-400/30 bg-white/5 hover:border-purple-400/50'
                }`}
                disabled={isSubmitting}
              >
                <Mail className={`h-6 w-6 mx-auto mb-2 ${formData.contactMethod === 'email' ? 'text-pink-400' : 'text-purple-400'}`} />
                <span className="text-white font-medium">Email</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, contactMethod: 'phone', contact: '' }))
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.contactMethod === 'phone'
                    ? 'border-pink-400 bg-pink-500/20 shadow-lg shadow-pink-500/50'
                    : 'border-purple-400/30 bg-white/5 hover:border-purple-400/50'
                }`}
                disabled={isSubmitting}
              >
                <Phone className={`h-6 w-6 mx-auto mb-2 ${formData.contactMethod === 'phone' ? 'text-pink-400' : 'text-purple-400'}`} />
                <span className="text-white font-medium">Text</span>
              </button>
            </div>
          </div>

          {/* Contact Input */}
          <div className="space-y-2">
            <Label htmlFor="contact" className="text-purple-200 font-semibold flex items-center gap-2">
              {formData.contactMethod === 'email' ? (
                <>
                  <Mail className="h-4 w-4 text-pink-400" />
                  Your Email
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 text-pink-400" />
                  Your Phone Number
                </>
              )}
            </Label>
            <Input
              id="contact"
              type={formData.contactMethod === 'email' ? 'email' : 'tel'}
              required
              value={formData.contact}
              onChange={(e) => handleInputChange('contact', e.target.value)}
              placeholder={formData.contactMethod === 'email' ? 'your@email.com' : '(123) 456-7890'}
              className="bg-white/10 border-purple-400/30 text-white placeholder-purple-300/50 focus:border-pink-400 focus:ring-pink-400 text-lg"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className="flex-1 bg-white/10 border-purple-400/30 text-white hover:bg-white/20 hover:border-purple-400"
              disabled={isSubmitting}
            >
              Maybe Later
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5 mr-2 animate-pulse" />
                  Let's Go! 🚀
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-400/20 relative z-10">
          <p className="text-xs text-purple-200 text-center">
            🔒 Your info is safe with us. Unsubscribe anytime. No spam, just good vibes! ✌️
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
