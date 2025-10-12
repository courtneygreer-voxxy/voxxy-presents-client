import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight, MessageCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { usePageTracking } from "@/hooks/usePageTracking"

export default function HelpPage() {
  usePageTracking('Help')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-white/10 relative z-10 px-4 py-6">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">
            Voxxy Presents
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link to="/help" className="text-purple-400 font-medium">Help Center</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
            <Link to="/contact">Request Access</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            How Can We{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Help You?
            </span>
          </h1>

          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
            We're here to support you during the pilot program
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Email Support */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-purple-300" />
                </div>
                <CardTitle className="text-2xl text-white">Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 mb-6">
                  Get in touch with our team directly for any questions or support needs.
                </p>
                <a
                  href="mailto:team@voxxypresents.com"
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  team@voxxypresents.com
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </CardContent>
            </Card>

            {/* Request Access */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-300" />
                </div>
                <CardTitle className="text-2xl text-white">Request Pilot Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 mb-6">
                  Ready to join the pilot program? Fill out our quick application form.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                  <Link to="/contact">
                    Request Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-white mb-2">Features</h3>
                <p className="text-gray-200 mb-4">
                  Learn about what Voxxy Presents can do for your recurring events
                </p>
                <Link to="/features" className="text-purple-400 hover:text-purple-300 inline-flex items-center">
                  View Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-white mb-2">Pricing</h3>
                <p className="text-gray-200 mb-4">
                  Simple, transparent pricing at $15/month for pilot program members
                </p>
                <Link to="/pricing" className="text-purple-400 hover:text-purple-300 inline-flex items-center">
                  View Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-white mb-2">Contact Us</h3>
                <p className="text-gray-200 mb-4">
                  Have questions? Reach out to our team
                </p>
                <Link to="/contact" className="text-purple-400 hover:text-purple-300 inline-flex items-center">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Voxxy Presents</h3>
              <p className="text-gray-300 mb-4">
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
