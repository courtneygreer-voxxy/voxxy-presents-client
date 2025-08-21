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

  const handleBetaInputChange = (field: keyof BetaFormData, value: string) => {
    setBetaFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUpdatesInputChange = (field: keyof UpdatesFormData, value: string) => {
    setUpdatesFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionType('beta')
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleUpdatesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionType('updates')
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center border-0 shadow-xl">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription className="text-lg">
              We've received your message and will get back to you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {submissionType === 'beta' 
                  ? "We're excited to learn more about your community and will prioritize your beta application."
                  : submissionType === 'updates'
                  ? "You'll receive updates about Voxxy Presents and new features as they become available."
                  : "Our team is reviewing your message and will respond soon."}
              </p>
              <Button className="w-full" asChild>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="relative z-10 px-4 py-6">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-purple-600">
            Voxxy Presents
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/features">Features</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/help">Help</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Join the Voxxy Community
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Ready to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Transform Your Community?
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join community organizers everywhere who are building with Voxxy. 
            Let's create something amazing together.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Choose Your Path</CardTitle>
                <CardDescription>
                  Select the option that best fits your needs
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="beta" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="beta">Beta Access</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                    <TabsTrigger value="contact">Contact Team</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="beta">
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
                          <Label htmlFor="beta-organization">Organization/Club Name *</Label>
                          <Input
                            id="beta-organization"
                            type="text"
                            required
                            value={betaFormData.organizationName}
                            onChange={(e) => handleBetaInputChange('organizationName', e.target.value)}
                            placeholder="Your community or organization name"
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
                        <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Contact Our Team Directly</h3>
                        <p className="text-gray-600 mb-6">
                          Have questions or need personalized support? Reach out to our team directly.
                        </p>
                        <Button asChild className="bg-purple-600 hover:bg-purple-700">
                          <a href="mailto:team@voxxyai.com">
                            Email team@voxxyai.com
                            <Mail className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                      
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500 text-center">
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
              <Card className="border-2 border-purple-200 shadow-lg">
                <CardHeader>
                  <Badge className="bg-purple-600 text-white w-fit mb-3">
                    <Rocket className="h-4 w-4 mr-2" />
                    Paid Beta Program
                  </Badge>
                  <CardTitle>What's Included</CardTitle>
                  <CardDescription>
                    Early access with special benefits for founding communities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Sparkles className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Full Platform Access</p>
                        <p className="text-sm text-gray-600">All features at beta pricing</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Users className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">1-on-1 Onboarding</p>
                        <p className="text-sm text-gray-600">Personal setup and training</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <MessageCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Direct Product Input</p>
                        <p className="text-sm text-gray-600">Help shape the platform's future</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Common Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium mb-1">How quickly will you respond?</p>
                    <p className="text-sm text-gray-600">
                      We respond to all inquiries within 24 hours, usually much faster.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Is there a cost for the beta?</p>
                    <p className="text-sm text-gray-600">
                      Beta pricing starts at $15/month with special early-adopter benefits.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">What if I need help getting started?</p>
                    <p className="text-sm text-gray-600">
                      Every beta member gets 1-on-1 onboarding and ongoing support.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-purple-600" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Questions about Voxxy or need support?
                    </p>
                    <Button variant="outline" asChild>
                      <a href="mailto:team@voxxyai.com">
                        <Mail className="h-4 w-4 mr-2" />
                        team@voxxyai.com
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
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Other Ways to Connect
          </h2>
          <p className="text-gray-600 mb-8">
            Choose the method that works best for you
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Button variant="outline" size="lg" className="h-16" asChild>
              <Link to="/help">
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Help Center</p>
                    <p className="text-sm text-gray-500">Browse FAQs and guides</p>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" size="lg" className="h-16" asChild>
              <a href="mailto:team@voxxyai.com">
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <Mail className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Direct Email</p>
                    <p className="text-sm text-gray-500">team@voxxyai.com</p>
                  </div>
                </div>
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}