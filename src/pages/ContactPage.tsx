import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  ArrowRight, 
  CheckCircle,
  Users,
  Rocket,
  Sparkles,
  MessageCircle
} from "lucide-react"
import { Link } from "react-router-dom"
import { contactFormApi, EmailServiceError } from "@/services/emailService"
import { CreateContactSubmissionData } from "@/types/database"

interface BetaFormData {
  name: string
  email: string
  organizationName: string
  description: string
}

interface UpdatesFormData {
  name: string
  email: string
}

export default function ContactPage() {
  const [betaFormData, setBetaFormData] = useState<BetaFormData>({
    name: '',
    email: '',
    organizationName: '',
    description: ''
  })
  
  const [updatesFormData, setUpdatesFormData] = useState<UpdatesFormData>({
    name: '',
    email: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionType, setSubmissionType] = useState('')
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const handleBetaInputChange = (field: keyof BetaFormData, value: string) => {
    setBetaFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUpdatesInputChange = (field: keyof UpdatesFormData, value: string) => {
    setUpdatesFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGeneralContactSubmit = async () => {
    setIsSubmitting(true)
    setSubmissionType('contact')
    setSubmissionError(null)
    
    try {
      const submissionData: CreateContactSubmissionData = {
        type: 'general_contact',
        name: 'Contact Page User',
        email: 'team@voxxypresents.com',
        source: 'contact_page'
      }

      await contactFormApi.submitForm(submissionData)
      setIsSubmitted(true)
      
    } catch (error) {
      console.error('General contact submission failed:', error)
      if (error instanceof EmailServiceError) {
        setSubmissionError(`Failed to submit: ${error.message}`)
      } else {
        setSubmissionError('An unexpected error occurred. Please try again or contact us directly.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTabChange = () => {
    setSubmissionError(null)
  }

  const handleBetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionType('beta')
    setSubmissionError(null)
    
    try {
      const submissionData: CreateContactSubmissionData = {
        type: 'beta_request',
        name: betaFormData.name,
        email: betaFormData.email,
        organizationName: betaFormData.organizationName,
        description: betaFormData.description,
        source: 'contact_page'
      }

      await contactFormApi.submitForm(submissionData)
      setIsSubmitted(true)
      
    } catch (error) {
      console.error('Beta form submission failed:', error)
      if (error instanceof EmailServiceError) {
        setSubmissionError(`Failed to submit: ${error.message}`)
      } else {
        setSubmissionError('An unexpected error occurred. Please try again or contact us directly.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionType('updates')
    setSubmissionError(null)
    
    try {
      const submissionData: CreateContactSubmissionData = {
        type: 'newsletter_signup',
        name: updatesFormData.name,
        email: updatesFormData.email,
        source: 'contact_page'
      }

      await contactFormApi.submitForm(submissionData)
      setIsSubmitted(true)
      
    } catch (error) {
      console.error('Updates form submission failed:', error)
      if (error instanceof EmailServiceError) {
        setSubmissionError(`Failed to submit: ${error.message}`)
      } else {
        setSubmissionError('An unexpected error occurred. Please try again or contact us directly.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center px-4">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'pulse 8s ease-in-out infinite'
          }}
        />
        <Card className="max-w-md w-full text-center bg-white/10 backdrop-blur-sm border border-white/20 relative z-10">
          <CardHeader>
            <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-300" />
            </div>
            <CardTitle className="text-2xl text-white">Thank You!</CardTitle>
            <CardDescription className="text-lg text-gray-200">
              We've received your message and will get back to you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-300">
                {submissionType === 'beta' 
                  ? "We're excited to learn more about your community and will prioritize your beta application."
                  : submissionType === 'updates'
                  ? "You'll receive updates about Voxxy Presents and new features as they become available."
                  : "Our team is reviewing your message and will respond soon."}
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" asChild>
                <Link to="/">
                  Return to Homepage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-white/10 relative z-10 px-4 py-6">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">
            Voxxy Presents
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10" asChild>
              <Link to="/features">Features</Link>
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10" asChild>
              <Link to="/help">Help</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 px-4 z-10">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="bg-purple-500/20 border border-purple-400/30 text-purple-300 px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Join the Voxxy Community
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Transform Your Community?
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join community organizers everywhere who are building with Voxxy. 
            Let's create something amazing together.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Choose Your Path</CardTitle>
                <CardDescription className="text-gray-200">
                  Select the option that best fits your needs
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="beta" className="space-y-6" onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="beta">Beta Access</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                    <TabsTrigger value="contact">Contact Team</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="beta">
                    {submissionError && (
                      <div className="mb-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg">
                        <p className="text-sm text-red-200">{submissionError}</p>
                      </div>
                    )}
                    <form onSubmit={handleBetaSubmit} className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="beta-name">Name *</Label>
                          <Input
                            id="beta-name"
                            type="text"
                            required
                            value={betaFormData.name}
                            onChange={(e) => handleBetaInputChange('name', e.target.value)}
                            placeholder="Your full name"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="beta-email">Email *</Label>
                          <Input
                            id="beta-email"
                            type="email"
                            required
                            value={betaFormData.email}
                            onChange={(e) => handleBetaInputChange('email', e.target.value)}
                            placeholder="your@email.com"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="beta-organization">Club Name *</Label>
                          <Input
                            id="beta-organization"
                            type="text"
                            required
                            value={betaFormData.organizationName}
                            onChange={(e) => handleBetaInputChange('organizationName', e.target.value)}
                            placeholder="Your community or club name"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="beta-description">Brief Description *</Label>
                          <Textarea
                            id="beta-description"
                            required
                            value={betaFormData.description}
                            onChange={(e) => handleBetaInputChange('description', e.target.value)}
                            placeholder="Tell us about your community and what you're looking to achieve"
                            rows={3}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Request Paid Beta Access"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="updates">
                    {submissionError && (
                      <div className="mb-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg">
                        <p className="text-sm text-red-200">{submissionError}</p>
                      </div>
                    )}
                    <form onSubmit={handleUpdatesSubmit} className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="updates-name">Name *</Label>
                          <Input
                            id="updates-name"
                            type="text"
                            required
                            value={updatesFormData.name}
                            onChange={(e) => handleUpdatesInputChange('name', e.target.value)}
                            placeholder="Your full name"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="updates-email">Email *</Label>
                          <Input
                            id="updates-email"
                            type="email"
                            required
                            value={updatesFormData.email}
                            onChange={(e) => handleUpdatesInputChange('email', e.target.value)}
                            placeholder="your@email.com"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        Stay updated on Voxxy Presents features, community building tips, and product announcements.
                      </p>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Subscribing..." : "Get Product Updates"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="contact">
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <Mail className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-white">Contact Our Team Directly</h3>
                        <p className="text-gray-200 mb-6">
                          Have questions or need personalized support? Reach out to our team directly.
                        </p>
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={async () => {
                            await handleGeneralContactSubmit()
                            window.open('mailto:team@voxxypresents.com', '_self')
                          }}
                          disabled={isSubmitting}
                        >
                          {isSubmitting && submissionType === 'contact' ? 'Recording...' : 'Email team@voxxypresents.com'}
                          <Mail className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-sm text-gray-300 text-center">
                          We typically respond within 24 hours during business days.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Contact Info & Benefits */}
            <div className="space-y-8">
              
              {/* Beta Program Benefits */}
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                <CardHeader>
                  <Badge className="bg-purple-500/20 border border-purple-400/30 text-purple-300 w-fit mb-3">
                    <Rocket className="h-4 w-4 mr-2" />
                    Paid Beta Program
                  </Badge>
                  <CardTitle className="text-white">What's Included</CardTitle>
                  <CardDescription className="text-gray-200">
                    Early access with special benefits for founding communities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Sparkles className="h-5 w-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">Full Platform Access</p>
                        <p className="text-sm text-gray-300">All features at beta pricing</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Users className="h-5 w-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">1-on-1 Onboarding</p>
                        <p className="text-sm text-gray-300">Personal setup and training</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <MessageCircle className="h-5 w-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">Direct Product Input</p>
                        <p className="text-sm text-gray-300">Help shape the platform's future</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">Common Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium mb-1 text-white">How quickly will you respond?</p>
                    <p className="text-sm text-gray-300">
                      We respond to all inquiries within 24 hours, usually much faster.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1 text-white">Is there a cost for the beta?</p>
                    <p className="text-sm text-gray-300">
                      Beta pricing starts at $15/month with special early-adopter benefits.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1 text-white">What if I need help getting started?</p>
                    <p className="text-sm text-gray-300">
                      Every beta member gets 1-on-1 onboarding and ongoing support.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Mail className="h-5 w-5 mr-2 text-purple-400" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-300 mb-4">
                      Questions about Voxxy or need support?
                    </p>
                    <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30" asChild>
                      <a href="mailto:team@voxxypresents.com">
                        <Mail className="h-4 w-4 mr-2" />
                        team@voxxypresents.com
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Other Ways to Connect
          </h2>
          <p className="text-gray-200 mb-8">
            Choose the method that works best for you
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Button className="h-16 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200" size="lg" asChild>
              <Link to="/help">
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="w-8 h-8 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-blue-300" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Help Center</p>
                    <p className="text-sm text-gray-300">Browse FAQs and guides</p>
                  </div>
                </div>
              </Link>
            </Button>

            <Button 
              className="h-16 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200"
              size="lg" 
              onClick={async () => {
                await handleGeneralContactSubmit()
                window.open('mailto:team@voxxypresents.com', '_self')
              }}
              disabled={isSubmitting}
            >
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="w-8 h-8 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded flex items-center justify-center">
                    <Mail className="h-4 w-4 text-green-300" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">Direct Email</p>
                  <p className="text-sm text-gray-300">team@voxxypresents.com</p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}