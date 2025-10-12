import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  ArrowRight,
  Sparkles,
  Users,
  Zap,
  Shield
} from "lucide-react"
import { Link } from "react-router-dom"
import { usePageTracking } from "@/hooks/usePageTracking"

export default function PricingPage() {
  usePageTracking('Pricing')

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
            <Link to="/pricing" className="text-purple-400 font-medium">Pricing</Link>
            <Link to="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link>
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
          <Badge className="bg-purple-500/20 border border-purple-400/30 text-purple-300 px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Limited Pilot Program Spots Available
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Simple,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Transparent Pricing
            </span>
          </h1>

          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
            Join our pilot program and help shape the future of Voxxy Presents
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="bg-white/10 backdrop-blur-sm border-2 border-purple-400/40 hover:border-purple-400/60 transition-all duration-300 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <Badge className="bg-purple-500/20 border border-purple-400/30 text-purple-300 px-4 py-2">
                  Pilot Program
                </Badge>
              </div>
              <CardTitle className="text-4xl font-bold text-white mb-2">$15/month</CardTitle>
              <CardDescription className="text-gray-200 text-lg">
                Everything you need to build your recurring event community
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* What's Included */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">What's Included:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start text-gray-200">
                    <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Full platform access</strong> - All Voxxy Presents features</span>
                  </li>
                  <li className="flex items-start text-gray-200">
                    <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Venue network</strong> - Access to our growing venue marketplace</span>
                  </li>
                  <li className="flex items-start text-gray-200">
                    <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Locked-in pricing</strong> - Your rate stays at $15/month forever</span>
                  </li>
                  <li className="flex items-start text-gray-200">
                    <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Priority support</strong> - Direct access to our team</span>
                  </li>
                  <li className="flex items-start text-gray-200">
                    <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Shape the product</strong> - Help us build features you need</span>
                  </li>
                </ul>
              </div>

              {/* Pilot Benefits */}
              <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Zap className="h-5 w-5 text-purple-400 mr-2" />
                  Pilot Program Benefits
                </h3>
                <ul className="space-y-2 text-gray-200">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-purple-400 mr-2 flex-shrink-0 mt-1" />
                    <span>Be part of building the future of Voxxy Presents</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-purple-400 mr-2 flex-shrink-0 mt-1" />
                    <span>Direct influence on feature roadmap</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-purple-400 mr-2 flex-shrink-0 mt-1" />
                    <span>Early access to new features</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-purple-400 mr-2 flex-shrink-0 mt-1" />
                    <span>Community of early adopters</span>
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6" asChild>
                  <Link to="/contact">
                    Request Pilot Access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-center text-gray-300 text-sm mt-4">
                  <Users className="h-4 w-4 inline mr-1" />
                  Limited spots available - join the waitlist today
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Pilot Section */}
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Join the Pilot Program?
            </h2>
            <p className="text-lg text-gray-200">
              We're in the pilot phase, taking limited spots to ensure quality and gather feedback
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Locked-In Price</h3>
              <p className="text-gray-200">
                Your $15/month rate is guaranteed forever, even as we add more features and value
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Build With Us</h3>
              <p className="text-gray-200">
                Direct input on features and roadmap—we're building this for you
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Priority Access</h3>
              <p className="text-gray-200">
                Join a curated community of recurring event organizers and get priority support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Join?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Request access to our pilot program today - limited spots available
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
