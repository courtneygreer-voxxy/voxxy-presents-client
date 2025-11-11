import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, ArrowRight, Sparkles, LogIn, UserPlus, Menu, X } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { usePageTracking } from "@/hooks/usePageTracking"
import { useSectionTracking } from "@/hooks/useSectionTracking"
import { TrackedLink } from "@/components/analytics/TrackedLink"
import { TrackedButton } from "@/components/analytics/TrackedButton"
import { analytics } from "@/lib/analytics"
import Footer from "@/components/Footer"

export default function HomePage() {
  const { isAuthenticated, currentUser, isProducer, userProfile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Track page views and engagement
  usePageTracking('Home')

  // Section tracking
  const { sectionRef: heroRef, trackInteraction: trackHeroInteraction } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Hero',
  })

  const { sectionRef: problemsRef } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Problems',
  })

  const { sectionRef: featuresRef } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Features',
  })

  // Track landing page interactions
  const trackLandingInteraction = (interactionType: string, elementName: string, sectionName?: string) => {
    analytics.trackLandingPageInteraction(interactionType, elementName, sectionName)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 px-4 py-3 md:py-6 bg-gray-800/50 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between md:grid md:grid-cols-3">
            {/* Logo - Left */}
            <Link to="/" className="md:justify-self-start">
              <img src="/PresentsHeader2.svg" alt="Voxxy Presents" className="h-16 md:h-20" />
            </Link>

            {/* Navigation - Center */}
            <div className="hidden md:flex items-center gap-6 justify-self-center">
              <TrackedLink
                to="/features"
                className="text-gray-300 hover:text-purple-400 transition-colors"
                trackingData={{
                  link_text: 'Features',
                  destination_page: 'Features',
                  current_page: 'Home',
                  link_position: 'header'
                }}
              >
                Features
              </TrackedLink>
              <TrackedLink
                to="/help"
                className="text-gray-300 hover:text-purple-400 transition-colors"
                trackingData={{
                  link_text: 'Help Center',
                  destination_page: 'Help',
                  current_page: 'Home',
                  link_position: 'header'
                }}
              >
                Help Center
              </TrackedLink>
              <TrackedLink
                to="/contact"
                className="text-gray-300 hover:text-purple-400 transition-colors"
                trackingData={{
                  link_text: 'Contact',
                  destination_page: 'Contact',
                  current_page: 'Home',
                  link_position: 'header'
                }}
              >
                Contact
              </TrackedLink>
            </div>

            {/* Actions - Right */}
            <div className="flex items-center gap-4 md:justify-self-end">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg"
                  >
                    Dashboard
                  </Link>
                  {/* Only show Create Club button for producers (organizers) */}
                  {isProducer && (
                    <Link
                      to="/create-club"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 rounded-lg"
                    >
                      Create Club
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg flex items-center"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-b border-white/10 md:hidden">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                to="/features"
                className="block text-gray-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/help"
                className="block text-gray-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Help Center
              </Link>
              <Link
                to="/contact"
                className="block text-gray-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="border-t border-white/10 pt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="block text-gray-300 hover:text-purple-400 transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {/* Only show Create Club button for producers (organizers) */}
                    {isProducer && (
                      <Link
                        to="/create-club"
                        className="block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create Club
                      </Link>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block text-gray-300 hover:text-purple-400 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-24 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-purple-300 text-sm font-medium rounded-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Private Beta
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
            The Operating System for {" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Recurring Event Producers
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Event coordination tools that help producers manage vendor relationships, automate logistics, and scale without burning out.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <TrackedButton
              className="inline-flex items-center px-8 py-6 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl min-h-[56px]"
              trackingData={{
                button_text: 'Request Paid Beta Access',
                button_location: 'hero',
                page_name: 'Home',
                is_primary_cta: true
              }}
              asChild
            >
              <Link to="/contact">
                Request Paid Beta Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </TrackedButton>
            <TrackedButton
              className="inline-flex items-center px-8 py-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 text-lg font-semibold rounded-lg min-h-[56px]"
              trackingData={{
                button_text: 'Get Product Updates',
                button_location: 'hero',
                page_name: 'Home',
                is_primary_cta: false
              }}
              asChild
            >
              <Link to="/contact">
                Get Product Updates
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </TrackedButton>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section ref={problemsRef} className="py-24 bg-gray-800/30 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Event Coordination is Broken
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Event producers managing recurring events face the same operational bottlenecks
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 cursor-pointer group"
              onClick={() => trackLandingInteraction('click', 'Communication Chaos Problem Card', 'Problems Section')}
            >
              <h3 className="text-xl font-semibold text-purple-400 mb-4 group-hover:text-purple-300 transition-colors">Scattered Communication Chaos</h3>
              <p className="text-gray-300 leading-relaxed">
                Vendor coordination scattered across texts, emails, Instagram DMs, and spreadsheets - you can't find conversations when you need them most
              </p>
            </div>

            <div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 cursor-pointer group"
              onClick={() => trackLandingInteraction('click', 'Manual Work Problem Card', 'Problems Section')}
            >
              <h3 className="text-xl font-semibold text-purple-400 mb-4 group-hover:text-purple-300 transition-colors">Manual Work Eating Your Time</h3>
              <p className="text-gray-300 leading-relaxed">
                Spending 15-20 hours per event on vendor logistics instead of creating experiences - coordination becomes unpaid labor that doesn't scale
              </p>
            </div>

            <div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 cursor-pointer group"
              onClick={() => trackLandingInteraction('click', 'Application Review Problem Card', 'Problems Section')}
            >
              <h3 className="text-xl font-semibold text-purple-400 mb-4 group-hover:text-purple-300 transition-colors">Application Review Bottleneck</h3>
              <p className="text-gray-300 leading-relaxed">
                Drowning in 200+ vendor applications across PDFs, emails, and Instagram profiles with no easy way to compare and decide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section ref={featuresRef} className="py-24 relative">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Built for Recurring Event Producers
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Voxxy handles vendor coordination so you can focus on creating unforgettable experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Unified Communication Hub */}
            <div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-indigo-400/30 transition-all duration-300 cursor-pointer group"
              onClick={() => trackLandingInteraction('click', 'Unified Communication Hub Feature', 'Solutions Section')}
            >
              <div className="w-14 h-14 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/30 transition-all">
                <Users className="h-7 w-7 text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-indigo-300 transition-colors">Unified Communication Hub</h3>
              <p className="text-gray-300 leading-relaxed">
                All vendor conversations in one place - no more switching between texts, emails, Instagram DMs, and WhatsApp to find what you need
              </p>
            </div>

            {/* Vendor CRM That Scales */}
            <div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300 cursor-pointer group"
              onClick={() => trackLandingInteraction('click', 'Vendor CRM Feature', 'Solutions Section')}
            >
              <div className="w-14 h-14 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-all">
                <MapPin className="h-7 w-7 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-300 transition-colors">Vendor CRM That Scales</h3>
              <p className="text-gray-300 leading-relaxed">
                Track vendor relationships across all your events with notes, history, and performance data that travels with them from show to show
              </p>
            </div>

            {/* Fast Application Review */}
            <div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-green-400/30 transition-all duration-300 cursor-pointer group"
              onClick={() => trackLandingInteraction('click', 'Fast Application Review Feature', 'Solutions Section')}
            >
              <div className="w-14 h-14 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-all">
                <Calendar className="h-7 w-7 text-green-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-green-300 transition-colors">Fast Application Review</h3>
              <p className="text-gray-300 leading-relaxed">
                Side-by-side portfolio comparison with one-click approve, waitlist, or reject - turn 200 applications into decisions in hours, not days
              </p>
            </div>

            {/* Email Automation */}
            <div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 cursor-pointer group"
              onClick={() => trackLandingInteraction('click', 'Email Automation Feature', 'Solutions Section')}
            >
              <div className="w-14 h-14 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-all">
                <ArrowRight className="h-7 w-7 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-purple-300 transition-colors">Email Automation Without the Setup</h3>
              <p className="text-gray-300 leading-relaxed">
                Application confirmations, approvals, rejections, payment reminders, and day-of logistics - automated and customizable without needing Mailgun or technical expertise
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to stop coordinating and start producing?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join event producers who are building sustainable recurring events with Voxxy
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 transition-all duration-200 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl"
          >
            Request Paid Beta Access
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}