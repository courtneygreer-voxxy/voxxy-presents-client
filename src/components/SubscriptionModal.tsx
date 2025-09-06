import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Heart, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X,
  MessageCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { subscriptionService } from "@/services/subscriptionService"
import type { Organization } from '@/types/database'

interface SubscriptionModalProps {
  organization: Organization
  trigger?: React.ReactNode
}

interface SubscriptionForm {
  email: string
  name: string
  message?: string
}

const INITIAL_FORM: SubscriptionForm = {
  email: '',
  name: '',
  message: ''
}

export function SubscriptionModal({ organization, trigger }: SubscriptionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<SubscriptionForm>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [userCaptchaAnswer, setUserCaptchaAnswer] = useState('')
  const { toast } = useToast()

  // Generate simple math CAPTCHA
  React.useEffect(() => {
    generateCaptcha()
  }, [isOpen])

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptchaQuestion(`${num1} + ${num2}`)
    setCaptchaAnswer((num1 + num2).toString())
    setUserCaptchaAnswer('')
  }

  const handleInputChange = (field: keyof SubscriptionForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }


  const validateForm = (): boolean => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address."
      })
      return false
    }

    // Name validation
    if (formData.name.trim().length < 2) {
      toast({
        variant: "destructive",
        title: "Name Required",
        description: "Please enter your name (at least 2 characters)."
      })
      return false
    }

    // CAPTCHA validation
    if (userCaptchaAnswer.trim() !== captchaAnswer) {
      toast({
        variant: "destructive",
        title: "CAPTCHA Failed",
        description: "Please solve the math problem correctly."
      })
      generateCaptcha() // Generate new CAPTCHA
      return false
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
        email: formData.email,
        name: formData.name,
        message: formData.message,
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
        title: "🎉 Subscribed Successfully!",
        description: `Welcome to ${organization.name}! You'll receive updates based on your preferences.`
      })

      // Reset form after short delay
      setTimeout(() => {
        setFormData(INITIAL_FORM)
        setIsSuccess(false)
        setIsOpen(false)
        generateCaptcha()
      }, 2000)

    } catch (error) {
      console.error('Subscription failed:', error)
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: "Something went wrong. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setFormData(INITIAL_FORM)
    setIsSuccess(false)
    setIsOpen(false)
    generateCaptcha()
  }

  const defaultTrigger = (
    <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
      <Heart className="h-4 w-4" />
      Subscribe for Updates
    </Button>
  )

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={resetAndClose}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white/15 backdrop-blur-md border-white/30 text-white">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Welcome to the Family! 🎉</h3>
            <p className="text-gray-300">
              You're now subscribed to {organization.name}. We'll keep you updated with all the exciting events and news!
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
      <DialogContent className="sm:max-w-lg bg-white/15 backdrop-blur-md border-white/30 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center text-white flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-purple-400" />
            Join {organization.name}
          </DialogTitle>
          <p className="text-gray-300 text-center">
            Stay connected and never miss out on events, updates, and community news!
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              disabled={isSubmitting}
            />
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Your Name *
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your full name"
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              disabled={isSubmitting}
            />
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-white flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Personal Message (Optional)
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Tell us a bit about yourself or what you're interested in..."
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 min-h-[80px]"
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-400">
              {formData.message?.length || 0}/500 characters
            </p>
          </div>


          {/* Security CAPTCHA */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-purple-400" />
                <Label className="text-white text-sm font-medium">Security Check</Label>
              </div>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">
                  Please solve this simple math problem:
                </p>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-purple-500/20 border-purple-400 text-purple-200 text-lg font-mono">
                    {captchaQuestion} = ?
                  </Badge>
                  <Input
                    type="text"
                    value={userCaptchaAnswer}
                    onChange={(e) => setUserCaptchaAnswer(e.target.value)}
                    placeholder="Answer"
                    className="w-20 bg-white/10 border-white/20 text-white text-center"
                    disabled={isSubmitting}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateCaptcha}
                    className="text-purple-400 hover:text-purple-300"
                    disabled={isSubmitting}
                  >
                    New Problem
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-gray-400 text-center">
            Your information is secure and will only be used to send you updates from {organization.name}. 
            You can unsubscribe at any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}