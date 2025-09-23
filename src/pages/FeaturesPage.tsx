import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Palette, 
  MapPin, 
  MessageCircle, 
  BarChart3, 
  Globe,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Sparkles
} from "lucide-react"
import { Link } from "react-router-dom"

export default function FeaturesPage() {
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
          <div className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-purple-400 font-medium">Features</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link to="/products" className="text-gray-300 hover:text-white transition-colors">Products</Link>
            <Link to="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
            <Link to="/contact">Request Beta Access</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="bg-purple-500/20 border border-purple-400/30 text-purple-300 px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Event Infrastructure
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Scale Your Recurring Events
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
            From RSVP management to venue coordination, Voxxy Presents provides all the infrastructure
            club organizers need to build sustainable, recurring events without the logistics headaches.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link to="/contact">
                Request Beta Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30" size="lg" asChild>
              <Link to="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Core Event Infrastructure Features
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Built specifically for club organizers running recurring events and event series
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Smart RSVP Management</CardTitle>
                <CardDescription className="text-gray-200">
                  Convert "maybe" responses to confirmed attendance with automated follow-up sequences and predictive analytics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Venue Coordination Hub</CardTitle>
                <CardDescription className="text-gray-200">
                  Automated guest list sharing, real-time capacity tracking, and streamlined communication with venue partners.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Recurring Event Automation</CardTitle>
                <CardDescription className="text-gray-200">
                  Set up monthly pop-ups, weekly events, and seasonal series once. We handle all scheduling, registration, and member notifications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Member Database & Engagement</CardTitle>
                <CardDescription className="text-gray-200">
                  Track member participation across events, automate engagement between events, and build stronger community relationships.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Integrated Promotion Tools</CardTitle>
                <CardDescription className="text-gray-200">
                  Newsletter automation, social media amplification, and referral tracking that actually connects your marketing efforts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">White-Label Event Pages</CardTitle>
                <CardDescription className="text-gray-200">
                  Your events showcase your brand with custom colors, logos, and domain support - not ours.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Built for Club Organizers Who Want to Scale
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Features designed specifically for recurring event organizers who want professional infrastructure without enterprise complexity
            </p>
          </div>

          <div className="space-y-16">
            {/* Venue Partnerships */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-purple-500/20 border border-purple-400/30 text-purple-300 mb-4">Smart Attendance</Badge>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Turn "Maybe" into "Yes"
                </h3>
                <p className="text-gray-200 mb-6">
                  Smart follow-up sequences convert soft commits into confirmed attendance. Predictive analytics help you plan capacity and reduce no-shows for recurring events.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-gray-200">Automated "maybe" follow-up campaigns</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-gray-200">Attendance prediction algorithms</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-gray-200">No-show reduction tools</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 text-center hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                <MapPin className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-200 font-medium">
                  "Our attendance went from 60% to 95% confirmed. No more guessing how many people will actually show up."
                </p>
              </div>
            </div>

            {/* Revenue Tools */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 text-center order-2 md:order-1 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                <CreditCard className="h-16 w-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-200 font-medium">
                  "Venues love working with us now because the coordination is seamless. We've booked three new recurring partnerships."
                </p>
              </div>
              <div className="order-1 md:order-2">
                <Badge className="bg-green-500/20 border border-green-400/30 text-green-300 mb-4">Venue Relationships</Badge>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Venue Coordination That Actually Works
                </h3>
                <p className="text-gray-200 mb-6">
                  Automated guest list sharing, capacity management, and venue communication tools. Plus access to our network of community-friendly spaces looking for recurring events.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                    <span className="text-gray-200">Automated venue guest list sharing</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                    <span className="text-gray-200">Real-time capacity tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                    <span className="text-gray-200">Curated venue discovery network</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Community Engagement */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-blue-500/20 border border-blue-400/30 text-blue-300 mb-4">Sustainable Revenue</Badge>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Make Your Events Financially Sustainable
                </h3>
                <p className="text-gray-200 mb-6">
                  Simple pricing tools for recurring events - whether free community building, suggested donations, or paid experiences. Built for event organizers, not enterprise sales teams.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-300 mr-3" />
                    <span className="text-gray-200">Recurring membership management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-300 mr-3" />
                    <span className="text-gray-200">Flexible pricing options (free, donation, paid)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-300 mr-3" />
                    <span className="text-gray-200">Simple fee structure ($15/month + processing fees)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 text-center hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                <MessageCircle className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                <p className="text-gray-200 font-medium">
                  "We can finally focus on our community instead of wondering if events will break even. The pricing is transparent and fair."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Support */}
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Professional Infrastructure & Support
            </h2>
            <p className="text-lg text-gray-200">
              Reliable platform built for community organizers who need it to just work
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-white">Reliable & Secure</CardTitle>
                <CardDescription className="text-gray-200">
                  Professional hosting with automatic backups and data security for your member information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-white">99% Uptime</CardTitle>
                <CardDescription className="text-gray-200">
                  Dependable platform that works when your events go live and RSVPs are flowing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <Globe className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-white">Real Human Support</CardTitle>
                <CardDescription className="text-gray-200">
                  Priority support from people who understand recurring events and community building
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to see Voxxy Presents in action?
          </h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Join our beta program and see how this infrastructure can transform your recurring events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link to="/contact">
                Request Beta Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30" asChild>
              <Link to="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}