import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, ArrowRight, Sparkles, LogIn, UserPlus, Menu, X } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { usePageTracking } from "@/hooks/usePageTracking"
import { TrackedLink } from "@/components/analytics/TrackedLink"
import { TrackedButton } from "@/components/analytics/TrackedButton"

export default function HomePage() {
  const { isAuthenticated, currentUser } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Track page views and engagement
  usePageTracking('Home')
  
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
      <nav className="relative z-50 px-4 py-6 bg-gray-800/50 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            Voxxy Presents
          </div>
          <div className="hidden md:flex items-center gap-6">
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
              to="/pricing"
              className="text-gray-300 hover:text-purple-400 transition-colors"
              trackingData={{
                link_text: 'Pricing',
                destination_page: 'Pricing',
                current_page: 'Home',
                link_position: 'header'
              }}
            >
              Pricing
            </TrackedLink>
            <TrackedLink
              to="/products"
              className="text-gray-300 hover:text-purple-400 transition-colors"
              trackingData={{
                link_text: 'Products',
                destination_page: 'Products',
                current_page: 'Home',
                link_position: 'header'
              }}
            >
              Products
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
          <div className="flex items-center gap-4">
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
                  <Link
                    to="/create-club"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 rounded-lg"
                  >
                    Create Club
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg flex items-center"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                  <TrackedButton
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 rounded-lg flex items-center"
                    trackingData={{
                      button_text: 'Request Beta Access',
                      button_location: 'header',
                      page_name: 'Home',
                      is_primary_cta: true
                    }}
                    asChild
                  >
                    <Link to="/contact">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Request Beta Access
                    </Link>
                  </TrackedButton>
                </>
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
                to="/pricing" 
                className="block text-gray-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/products" 
                className="block text-gray-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
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
                    <Link 
                      to="/create-club" 
                      className="block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Create Club
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block text-gray-300 hover:text-purple-400 transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/contact" 
                      className="block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Request Beta Access
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-purple-300 text-sm font-medium rounded-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Private Beta
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Complete{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Event Infrastructure for Club Organizers
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            RSVP management, venue coordination, and promotion tools in one platform - so you can focus on creating experiences, not juggling logistics
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <TrackedButton
              className="inline-flex items-center px-8 py-6 bg-purple-600 hover:bg-purple-700 text-white text-lg font-medium rounded-lg transition-colors duration-200"
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
              className="inline-flex items-center px-8 py-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 text-lg font-medium rounded-lg"
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
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Event Coordination is Broken
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Club organizers everywhere face the same recurring challenges
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">"Maybe" RSVPs Kill Planning</h3>
              <p className="text-gray-300">
                Soft commits make venue coordination and capacity planning impossible to manage
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Venue Coordination Nightmare</h3>
              <p className="text-gray-300">
                Manually sharing guest lists, tracking capacity changes, constant email back-and-forth with venue staff
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Promotion Scattered Everywhere</h3>
              <p className="text-gray-300">
                Instagram posts, newsletter emails, word-of-mouth - nothing connects or tracks effectively
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Free Event Tools Don't Scale</h3>
              <p className="text-gray-300">
                Eventbrite works for one-offs but breaks down for recurring club events and series management
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Manual Contact Management</h3>
              <p className="text-gray-300">
                Pulling emails from multiple sources, no automated follow-up or member engagement
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">No Venue Network</h3>
              <p className="text-gray-300">
                Starting from scratch to find spaces for every event, no relationship management
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 relative">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Recurring Event Organizers
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Designed specifically for club organizers. Voxxy handles the logistics, you focus on the experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart RSVP Management</h3>
              <p className="text-gray-300">
                Convert "maybes" to "yes" with automated follow-up sequences and attendance prediction
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Venue Integration Hub</h3>
              <p className="text-gray-300">
                Automated guest list sharing, capacity tracking, and streamlined venue communication
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Integrated Promotion Tools</h3>
              <p className="text-gray-300">
                Newsletter automation, social media scheduling, and word-of-mouth referral tracking
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 bg-pink-500/20 backdrop-blur-sm border border-pink-400/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-pink-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Recurring Event Series</h3>
              <p className="text-gray-300">
                Set up your monthly pop-ups or weekly events once, manage them forever
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="h-6 w-6 text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Member Database & Engagement</h3>
              <p className="text-gray-300">
                Contact management across all events with automated member engagement between events
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-orange-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Venue Discovery Network</h3>
              <p className="text-gray-300">
                Access curated spaces that actively want recurring community events
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Club Organizers Choose Voxxy
            </h2>
            <p className="text-xl text-gray-200">
              Join the recurring event organizers already building sustainable communities with Voxxy Presents
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="font-semibold mb-2 text-white">Vinyl Listening Clubs</h3>
              <p className="text-gray-300 text-sm">
                "Voxxy turned our maybe RSVPs into actual attendees. Our Dumbo House events now consistently hit capacity."
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="font-semibold mb-2 text-white">Pop-up Event Series</h3>
              <p className="text-gray-300 text-sm">
                "No more venue coordination headaches - Voxxy handles all the guest list sharing automatically so we can focus on programming."
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-semibold mb-2 text-white">Community Event Organizers</h3>
              <p className="text-gray-300 text-sm">
                "We went from 20% no-shows to 95% attendance with their RSVP management tools. Game changer for free events."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to let AI handle your event logistics?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join club organizers everywhere who are building sustainable recurring events with Voxxy
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-6 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/25 hover:border-white/40 transition-all duration-200 text-lg font-medium rounded-lg"
          >
            Request Paid Beta Access
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
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
                Focus on building community experiences, we'll handle the coordination logistics.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
                <li><Link to="/voxxy-shop" className="hover:text-white transition-colors">Voxxy Shop</Link></li>
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