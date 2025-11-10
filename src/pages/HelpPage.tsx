import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight, MessageCircle, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { usePageTracking } from "@/hooks/usePageTracking"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function HelpPage() {

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  usePageTracking('Help')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <Navigation activePage="help" />

      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-purple-300 text-sm font-medium rounded-full">
              <Sparkles className="h-4 w-4 mr-2" />
              We're Here to Help
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
            How Can We{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Help You?
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            We're here to support you during the pilot program and beyond
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-24 bg-gray-800/30 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Email Support */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 group">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-purple-300" />
                </div>
                <CardTitle className="text-2xl text-white">Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 mb-4">
                  Questions about the pilot program? Want to learn more? Reach out directly.
                </p>
                <a
                  href="mailto:team@voxxypresents.com"
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors font-medium mb-4"
                >
                  team@voxxypresents.com
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <p className="text-gray-300 text-sm">
                  Response time: Within 24-48 hours
                </p>
              </CardContent>
            </Card>

            {/* Request Access */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 group">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-300" />
                </div>
                <CardTitle className="text-2xl text-white">Request Pilot Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 mb-6">
                  Ready to join? We're accepting 5 producers into our pilot program.
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
      <section className="py-24 bg-gray-800/30 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 group">
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

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 group">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-white mb-2">Pricing</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Simple, transparent pricing at $15/month for pilot program members
                </p>
                <Link to="/contact" className="text-purple-400 hover:text-purple-300 inline-flex items-center font-medium">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 group">
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

      <Footer />
    </div>
  )
}
