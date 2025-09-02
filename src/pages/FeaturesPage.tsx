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
            AI-Powered Community Tools
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Scale Your Community
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
            From community management to revenue generation, Voxxy Presents provides all the tools 
            creative organizers everywhere need to build sustainable, thriving communities.
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
              Core Community Management Features
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Built specifically for community organizers who want professional coordination tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">White-Label Branding</CardTitle>
                <CardDescription className="text-gray-200">
                  Your community pages showcase your brand, not ours. Custom colors, logos, and domain support.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Recurring Event Automation</CardTitle>
                <CardDescription className="text-gray-200">
                  Set up recurring workshops, classes, and meetups once. We handle scheduling, registration, and reminders.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Member Management</CardTitle>
                <CardDescription className="text-gray-200">
                  Track member engagement, manage subscriptions, and build stronger community relationships.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Automated Billing</CardTitle>
                <CardDescription className="text-gray-200">
                  Recurring subscriptions, one-time payments, and sliding scale options. Stripe integration included.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Community Messaging</CardTitle>
                <CardDescription className="text-gray-200">
                  Keep your community engaged with automated email campaigns and event notifications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Analytics & Insights</CardTitle>
                <CardDescription className="text-gray-200">
                  Understand your community growth, event performance, and revenue trends with detailed reporting.
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
              Built for Creative Communities
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Features designed specifically for community organizers who want to focus on creativity, not coordination
            </p>
          </div>

          <div className="space-y-16">
            {/* Venue Partnerships */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-purple-500/20 border border-purple-400/30 text-purple-300 mb-4">Partnership Network</Badge>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Venue Partnership Network
                </h3>
                <p className="text-gray-200 mb-6">
                  Access to partnerships with creative spaces and venues. We're building a network of 
                  community-friendly venues with special rates for our organizers.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-gray-200">Pre-negotiated venue rates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-gray-200">Integrated booking system</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-gray-200">Venue availability calendar</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 text-center hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                <MapPin className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-200 font-medium">
                  "Having venue partnerships built-in saves us hours of research and coordination for every event."
                </p>
              </div>
            </div>

            {/* Revenue Tools */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 text-center order-2 md:order-1 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                <CreditCard className="h-16 w-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-200 font-medium">
                  "We went from hobby to sustainable business in 3 months with Voxxy's revenue tools."
                </p>
              </div>
              <div className="order-1 md:order-2">
                <Badge className="bg-green-500/20 border border-green-400/30 text-green-300 mb-4">Revenue Generation</Badge>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Turn Passion into Profit
                </h3>
                <p className="text-gray-200 mb-6">
                  Multiple revenue streams built-in: recurring memberships, workshop fees, merchandise sales, 
                  and sliding scale options for inclusive pricing.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                    <span className="text-gray-200">Subscription management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                    <span className="text-gray-200">Sliding scale pricing</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                    <span className="text-gray-200">Automatic tax reporting</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Community Engagement */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-blue-500/20 border border-blue-400/30 text-blue-300 mb-4">Engagement</Badge>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Keep Your Community Connected
                </h3>
                <p className="text-gray-200 mb-6">
                  Automated communication tools that feel personal. From welcome sequences to event reminders, 
                  maintain that human touch while scaling your community.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-300 mr-3" />
                    <span className="text-gray-200">Automated welcome sequences</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-300 mr-3" />
                    <span className="text-gray-200">Event reminder campaigns</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-300 mr-3" />
                    <span className="text-gray-200">Community feedback tools</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 text-center hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                <MessageCircle className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                <p className="text-gray-200 font-medium">
                  "Our community feels more connected than ever, even as we've grown to 200+ members."
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
              Enterprise-Grade Security & Support
            </h2>
            <p className="text-lg text-gray-200">
              Professional infrastructure you can trust
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-white">Secure & Compliant</CardTitle>
                <CardDescription className="text-gray-200">
                  SOC 2 compliant infrastructure with end-to-end encryption for all data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-white">99.9% Uptime</CardTitle>
                <CardDescription className="text-gray-200">
                  Reliable hosting with automatic backups and disaster recovery protocols
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <Globe className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-white">24/7 Support</CardTitle>
                <CardDescription className="text-gray-200">
                  Priority support from real humans who understand the creative community space
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
            Join our beta program and see how these features can transform your community
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