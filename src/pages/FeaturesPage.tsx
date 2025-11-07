import React, { useEffect } from 'react'
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
import { useSectionTracking } from "@/hooks/useSectionTracking"
import { TrackedButton } from "@/components/analytics/TrackedButton"
import { analytics } from "@/lib/analytics"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function FeaturesPage() {

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  usePageTracking('Features')

  // Section tracking for key features
  const { sectionRef: rsvpRef } = useSectionTracking({
    pageName: 'Features',
    sectionName: 'RSVP Management',
  })

  const { sectionRef: venueRef } = useSectionTracking({
    pageName: 'Features',
    sectionName: 'Venue Coordination',
  })

  const { sectionRef: marketingRef } = useSectionTracking({
    pageName: 'Features',
    sectionName: 'Marketing Tools',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <Navigation activePage="features" />

      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-purple-300 text-sm font-medium rounded-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Built for Recurring Event Organizers
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
            Voxxy Presents{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Features
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Everything you need to manage recurring events, engage your community, and coordinate with venues—all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl font-semibold" asChild>
              <Link to="/contact">
                Request Beta Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 font-semibold" size="lg" asChild>
              <Link to="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section ref={rsvpRef} className="py-24 bg-gray-800/30 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Core Voxxy Presents Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Purpose-built tools for club organizers running recurring events
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Budget Management Tools */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-green-400/30 transition-all duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-all">
                  <DollarSign className="h-7 w-7 text-green-300" />
                </div>
                <CardTitle className="text-white text-xl mb-2">Budget Management Tools</CardTitle>
                <CardDescription className="text-gray-300 leading-relaxed">
                  Track event costs, venue fees, and revenue with automated expense reporting. Plan budgets for your entire event series and see real-time profitability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    Event budget planning and tracking
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    Automated expense categorization
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    Revenue and profitability reports
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Recurring Event Tools */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-all">
                  <Calendar className="h-7 w-7 text-purple-300" />
                </div>
                <CardTitle className="text-white text-xl mb-2">Recurring Event Tools</CardTitle>
                <CardDescription className="text-gray-300 leading-relaxed">
                  Set up monthly pop-ups or weekly events once. Generate event templates and manage your entire series with automated scheduling and notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" />
                    Event template generation
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" />
                    Automated recurring schedules
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" />
                    Series management dashboard
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Centralized Dashboard */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-indigo-400/30 transition-all duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-all">
                  <Users className="h-7 w-7 text-indigo-300" />
                </div>
                <CardTitle className="text-white text-xl mb-2">Centralized Subscriber Dashboard</CardTitle>
                <CardDescription className="text-gray-300 leading-relaxed">
                  Give your community a home base. Members can view all your events, manage their RSVPs, and stay engaged with your club—all from one beautiful page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />
                    Branded organization pages
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />
                    Member engagement tracking
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />
                    Automated notifications
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Vendor Support */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-all">
                  <MapPin className="h-7 w-7 text-blue-300" />
                </div>
                <CardTitle className="text-white text-xl mb-2">Vendor Support & Coordination</CardTitle>
                <CardDescription className="text-gray-300 leading-relaxed">
                  Streamline venue coordination with automated guest list sharing, capacity tracking, and direct venue communication tools. Access our growing venue network.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                    Automated guest list sharing
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                    Real-time capacity tracking
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                    Venue network access
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-10 md:p-14">
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
      <section className="py-24 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Build Your Community?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the pilot program and help shape the future of Voxxy Presents
          </p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl font-semibold" asChild>
            <Link to="/contact">
              Request Pilot Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
