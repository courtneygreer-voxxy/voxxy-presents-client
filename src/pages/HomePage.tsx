import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, ArrowRight, Sparkles, LogIn, UserPlus, Menu, X } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export default function HomePage() {
  const { isAuthenticated, currentUser } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
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
            <Link to="/features" className="text-gray-300 hover:text-purple-400 transition-colors">Features</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-purple-400 transition-colors">Pricing</Link>
            <Link to="/products" className="text-gray-300 hover:text-purple-400 transition-colors">Products</Link>
            <Link to="/help" className="text-gray-300 hover:text-purple-400 transition-colors">Help Center</Link>
            <Link to="/contact" className="text-gray-300 hover:text-purple-400 transition-colors">Contact</Link>
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
                  <Link
                    to="/contact"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 rounded-lg flex items-center"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Request Beta Access
                  </Link>
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
            Community{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Management for Organizers
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Handle event coordination, member engagement, and ticketing from one platform so you can focus on creating meaningful experiences
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-6 bg-purple-600 hover:bg-purple-700 text-white text-lg font-medium rounded-lg transition-colors duration-200"
            >
              Request Paid Beta Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 text-lg font-medium rounded-lg"
            >
              Get Product Updates
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Community Building is Broken
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Organizers everywhere face the same challenges
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Breaking Through the Noise</h3>
              <p className="text-gray-300">
                Crowded social platforms and event sites make it impossible to reach your community effectively
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Complex Event Management</h3>
              <p className="text-gray-300">
                Managing event series without Eventbrite's overwhelming complexity and fees
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Lightweight Ticketing</h3>
              <p className="text-gray-300">
                Need simple ticket management for individuals and groups without enterprise overhead
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Platform Juggling</h3>
              <p className="text-gray-300">
                Managing events across multiple platforms creates confusion and missed opportunities
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Member Engagement</h3>
              <p className="text-gray-300">
                Keeping recurring members engaged between events without constant manual outreach
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Last-Minute Dropoffs</h3>
              <p className="text-gray-300">
                Unpredictable attendance affecting revenue and venue planning
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
              Meet Your Community Assistant
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Designed for community organizers everywhere. Voxxy does the work, not just provides tools.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Branded Community Pages</h3>
              <p className="text-gray-300">
                Showcase your unique identity with custom pages that reflect your community's personality
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Cross-Platform Management</h3>
              <p className="text-gray-300">
                Manage all your events from one place, no more juggling multiple platforms
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Ticket Management</h3>
              <p className="text-gray-300">
                Easy purchasing for individuals and groups with intelligent pricing and automation
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 bg-pink-500/20 backdrop-blur-sm border border-pink-400/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-pink-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Member Engagement Tools</h3>
              <p className="text-gray-300">
                Keep your community connected between events with automated engagement features
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="h-6 w-6 text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Revenue Optimization</h3>
              <p className="text-gray-300">
                Turn your passion into sustainable income with AI-powered revenue insights
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
              Community Organizers Choose Voxxy
            </h2>
            <p className="text-xl text-gray-200">
              Join the community organizers everywhere already building with Voxxy Presents
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="font-semibold mb-2 text-white">Art Collectives</h3>
              <p className="text-gray-300 text-sm">
                "Finally, tools that understand our creative process and help us focus on what matters - the art."
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="font-semibold mb-2 text-white">Cultural Events</h3>
              <p className="text-gray-300 text-sm">
                "Voxxy helped us turn our passion project into a sustainable community business."
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="font-semibold mb-2 text-white">Music Venues</h3>
              <p className="text-gray-300 text-sm">
                "The white-label approach means our brand stays front and center while Voxxy handles the tech."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to let AI handle your event coordination?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join community organizers everywhere who are building sustainable businesses with Voxxy
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
                Community management tools for organizers everywhere. 
                Focus on building community, we'll handle the coordination.
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
            <p className="text-gray-400">&copy; 2025 Voxxy AI, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}