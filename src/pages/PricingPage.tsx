import React, { useEffect } from 'react'
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
import { useSectionTracking } from "@/hooks/useSectionTracking"
import { analytics } from "@/lib/analytics"
import { TrackedButton } from "@/components/analytics/TrackedButton"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function PricingPage() {

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  usePageTracking('Pricing')

  // Section tracking
  const { sectionRef: pricingCardRef } = useSectionTracking({
    pageName: 'Pricing',
    sectionName: 'Pricing Cards',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <Navigation activePage="pricing" />

      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
            Simple,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Transparent Pricing
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Choose the plan that fits your event schedule
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section ref={pricingCardRef} className="py-24 bg-gray-800/30 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-400/30 transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-white mb-2">Starter</CardTitle>
                <div className="text-4xl font-bold text-white mb-2">$80</div>
                <CardDescription className="text-gray-300">per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-300 mb-4">Perfect for new producers</p>
                  <ul className="space-y-3">
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Up to 10 events per year</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>10,000 vendor contacts</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Automated email workflows</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Vendor CRM</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Email support</span>
                    </li>
                  </ul>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" asChild>
                  <Link to="/contact">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Growth Plan */}
            <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 hover:border-purple-400/70 transition-all duration-300 shadow-2xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white px-4 py-1 text-sm">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-2xl font-bold text-white mb-2">Growth</CardTitle>
                <div className="text-4xl font-bold text-white mb-2">$160</div>
                <CardDescription className="text-gray-300">per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-300 mb-4">For established producers</p>
                  <ul className="space-y-3">
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Up to 50 events per year</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>50,000 vendor contacts</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Advanced email automation</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Vendor CRM with tagging</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Priority email support</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Custom branding</span>
                    </li>
                  </ul>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" asChild>
                  <Link to="/contact">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-400/30 transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-white mb-2">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-white mb-2">$400</div>
                <CardDescription className="text-gray-300">per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-300 mb-4">For large-scale operations</p>
                  <ul className="space-y-3">
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Unlimited events</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Unlimited vendor contacts</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>White-label email automation</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Advanced CRM & analytics</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <Check className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>API access</span>
                    </li>
                  </ul>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" asChild>
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join event producers who are scaling their recurring events with Voxxy
          </p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl font-semibold" asChild>
            <Link to="/contact">
              Request Beta Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
