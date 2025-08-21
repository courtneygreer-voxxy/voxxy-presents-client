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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="relative z-10 px-4 py-6">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-purple-600">
            Voxxy Presents
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-purple-600 font-medium">Features</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Pricing</Link>
            <Link to="/products" className="text-gray-600 hover:text-purple-600 transition-colors">Products</Link>
            <Link to="/help" className="text-gray-600 hover:text-purple-600 transition-colors">Help Center</Link>
            <Link to="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</Link>
          </div>
          <Button asChild>
            <Link to="/contact">Request Beta Access</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Community Tools
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Scale Your Community
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            From community management to revenue generation, Voxxy Presents provides all the tools 
            creative organizers everywhere need to build sustainable, thriving communities with their AI planner friend.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link to="/contact">
                Request Beta Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Core Community Management Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built specifically for community organizers who want their AI planner friend to handle coordination
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>White-Label Branding</CardTitle>
                <CardDescription>
                  Your community pages showcase your brand, not ours. Custom colors, logos, and domain support.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Recurring Event Automation</CardTitle>
                <CardDescription>
                  Set up recurring workshops, classes, and meetups once. We handle scheduling, registration, and reminders.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Member Management</CardTitle>
                <CardDescription>
                  Track member engagement, manage subscriptions, and build stronger community relationships.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Automated Billing</CardTitle>
                <CardDescription>
                  Recurring subscriptions, one-time payments, and sliding scale options. Stripe integration included.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Community Messaging</CardTitle>
                <CardDescription>
                  Keep your community engaged with automated email campaigns and event notifications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Understand your community growth, event performance, and revenue trends with detailed reporting.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Creative Communities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Features designed specifically for community organizers who want to focus on creativity, not coordination
            </p>
          </div>

          <div className="space-y-16">
            {/* Venue Partnerships */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-purple-100 text-purple-800 mb-4">Partnership Network</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Venue Partnership Network
                </h3>
                <p className="text-gray-600 mb-6">
                  Access to partnerships with creative spaces and venues. We're building a network of 
                  community-friendly venues with special rates for our organizers.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                    <span>Pre-negotiated venue rates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                    <span>Integrated booking system</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                    <span>Venue availability calendar</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-8 text-center">
                <MapPin className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  "Having venue partnerships built-in saves us hours of research and coordination for every event."
                </p>
              </div>
            </div>

            {/* Revenue Tools */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-8 text-center order-2 md:order-1">
                <CreditCard className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  "We went from hobby to sustainable business in 3 months with Voxxy's revenue tools."
                </p>
              </div>
              <div className="order-1 md:order-2">
                <Badge className="bg-green-100 text-green-800 mb-4">Revenue Generation</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Turn Passion into Profit
                </h3>
                <p className="text-gray-600 mb-6">
                  Multiple revenue streams built-in: recurring memberships, workshop fees, merchandise sales, 
                  and sliding scale options for inclusive pricing.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span>Subscription management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span>Sliding scale pricing</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span>Automatic tax reporting</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Community Engagement */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-blue-100 text-blue-800 mb-4">Engagement</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Keep Your Community Connected
                </h3>
                <p className="text-gray-600 mb-6">
                  Automated communication tools that feel personal. From welcome sequences to event reminders, 
                  maintain that human touch while scaling your community.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <span>Automated welcome sequences</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <span>Event reminder campaigns</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <span>Community feedback tools</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-8 text-center">
                <MessageCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  "Our community feels more connected than ever, even as we've grown to 200+ members."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Support */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Security & Support
            </h2>
            <p className="text-lg text-gray-600">
              Professional infrastructure you can trust
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Secure & Compliant</CardTitle>
                <CardDescription>
                  SOC 2 compliant infrastructure with end-to-end encryption for all data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>99.9% Uptime</CardTitle>
                <CardDescription>
                  Reliable hosting with automatic backups and disaster recovery protocols
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>
                  Priority support from real humans who understand the creative community space
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to see Voxxy Presents in action?
          </h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Join our beta program and see how these features can transform your community with your AI planner friend
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link to="/contact">
                Request Beta Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-purple-600" asChild>
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