import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Copy
} from "lucide-react"
import { Link } from "react-router-dom"
import { usePageTracking } from "@/hooks/usePageTracking"

export default function FeaturesPage() {
  usePageTracking('Features')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-white/10 relative z-10 px-4 py-6">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">
            Voxxy Presents
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-purple-400 font-medium">Features</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
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
            Built for Recurring Event Organizers
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Voxxy Presents{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Features
            </span>
          </h1>

          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
            Everything you need to manage recurring events, engage your community, and coordinate with venues—all in one place.
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
              Core Voxxy Presents Features
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Purpose-built tools for club organizers running recurring events
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Budget Management Tools */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-green-300" />
                </div>
                <CardTitle className="text-white">Budget Management Tools</CardTitle>
                <CardDescription className="text-gray-200">
                  Track event costs, venue fees, and revenue with automated expense reporting. Plan budgets for your entire event series and see real-time profitability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Event budget planning and tracking
                  </li>
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Automated expense categorization
                  </li>
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Revenue and profitability reports
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Recurring Event Tools */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Recurring Event Tools</CardTitle>
                <CardDescription className="text-gray-200">
                  Set up monthly pop-ups or weekly events once. Generate event templates and manage your entire series with automated scheduling and notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Event template generation
                  </li>
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Automated recurring schedules
                  </li>
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Series management dashboard
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Centralized Dashboard */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-300" />
                </div>
                <CardTitle className="text-white">Centralized Subscriber Dashboard</CardTitle>
                <CardDescription className="text-gray-200">
                  Give your community a home base. Members can view all your events, manage their RSVPs, and stay engaged with your club—all from one beautiful page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Branded organization pages
                  </li>
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Member engagement tracking
                  </li>
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Automated notifications
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Vendor Support */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-300" />
                </div>
                <CardTitle className="text-white">Vendor Support & Coordination</CardTitle>
                <CardDescription className="text-gray-200">
                  Streamline venue coordination with automated guest list sharing, capacity tracking, and direct venue communication tools. Access our growing venue network.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Automated guest list sharing
                  </li>
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Real-time capacity tracking
                  </li>
                  <li className="flex items-center text-gray-200">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                    Venue network access
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 md:p-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-purple-300" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Trust & Safety Commitment
            </h2>

            <div className="space-y-4 text-gray-200 text-lg">
              <p>
                We found that our users—especially those focused on art and community—really care about their data.
                They want privacy and a commitment that their data won't be sold to third parties unless discussed upfront
                and agreed upon by users.
              </p>

              <p>
                <strong className="text-white">Trust is a huge part of community</strong>, and we want our users to feel safe.
                That's why we:
              </p>

              <ul className="space-y-3 mt-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Never sell your data</strong> to third parties without explicit consent</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Generate immediate safety reviews</strong> for all applications</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Always have human support</strong> available for any safety concerns</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Transparent about data usage</strong>—you always know what we do with your information</span>
                </li>
              </ul>

              <p className="mt-6 text-center text-gray-300 italic">
                Your community's safety and privacy are foundational to everything we build.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Build Your Community?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join the pilot program and help shape the future of Voxxy Presents
          </p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100" asChild>
            <Link to="/contact">
              Request Pilot Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Voxxy Presents</h3>
              <p className="text-gray-300 mb-4 max-w-md">
                Event infrastructure for recurring club organizers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/venue-owners" className="hover:text-white transition-colors">For Venue Owners</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="https://www.heyvoxxy.com/#/about-us" className="hover:text-white transition-colors">About Us</a></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="https://www.heyvoxxy.com/#/terms" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="https://www.heyvoxxy.com/#/privacy" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2025 Voxxy, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
