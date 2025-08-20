import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Mail, 
  MessageCircle, 
  Calendar, 
  ArrowRight, 
  CheckCircle,
  Users,
  Rocket,
  Heart
} from "lucide-react"
import { Link } from "react-router-dom"

interface FormData {
  name: string
  email: string
  organization: string
  contactReason: string
  message: string
  joinNewsletter: boolean
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    organization: '',
    contactReason: '',
    message: '',
    joinNewsletter: false
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
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
                {formData.contactReason === 'pilot' 
                  ? "We're excited to learn more about your community and will prioritize your pilot application."
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
            Let's Build Together
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Ready to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Transform Your Community?
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join NYC's creative community organizers in our pilot program. 
            Let's build something amazing together.
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
                <CardTitle className="text-2xl">Get In Touch</CardTitle>
                <CardDescription>
                  Tell us about your community and how we can help you succeed
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="organization">Community/Organization</Label>
                    <Input
                      id="organization"
                      type="text"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      placeholder="Your community or organization name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactReason">I'm interested in *</Label>
                    <Select 
                      value={formData.contactReason} 
                      onValueChange={(value) => handleInputChange('contactReason', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary interest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pilot">Joining the Pilot Program</SelectItem>
                        <SelectItem value="demo">Booking a Demo</SelectItem>
                        <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                        <SelectItem value="support">Support & Technical Help</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Tell us about your community *</Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="What type of community do you organize? What are your biggest challenges? How can we help?"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.joinNewsletter}
                      onCheckedChange={(checked) => handleInputChange('joinNewsletter', !!checked)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Subscribe to updates about Voxxy Presents and community building tips
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : formData.contactReason === 'pilot' ? (
                      "Apply for Pilot Program"
                    ) : formData.contactReason === 'demo' ? (
                      "Request Demo"
                    ) : (
                      "Send Message"
                    )}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info & Benefits */}
            <div className="space-y-8">
              
              {/* Quick Contact */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-purple-600" />
                    Quick Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a 
                        href="mailto:hello@voxxypresents.com" 
                        className="text-purple-600 hover:text-purple-700"
                      >
                        hello@voxxypresents.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Response Time</p>
                      <p className="text-gray-600">Within 24 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pilot Program Benefits */}
              <Card className="border-2 border-purple-200 shadow-lg">
                <CardHeader>
                  <Badge className="bg-purple-600 text-white w-fit mb-3">
                    Pilot Program
                  </Badge>
                  <CardTitle>What's Included</CardTitle>
                  <CardDescription>
                    Early access with special benefits for founding communities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Rocket className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Full Platform Access</p>
                        <p className="text-sm text-gray-600">All features at pilot pricing</p>
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
                      <Heart className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
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
                    <p className="font-medium mb-1">Is there a cost for the pilot?</p>
                    <p className="text-sm text-gray-600">
                      Pilot pricing starts at $15/month with special early-adopter benefits.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">What if I need help getting started?</p>
                    <p className="text-sm text-gray-600">
                      Every pilot member gets 1-on-1 onboarding and ongoing support.
                    </p>
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
              <a href="mailto:support@voxxypresents.com">
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <Mail className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Direct Email</p>
                    <p className="text-sm text-gray-500">support@voxxypresents.com</p>
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