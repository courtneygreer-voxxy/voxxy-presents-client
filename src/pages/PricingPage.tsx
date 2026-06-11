import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTracking } from '@/hooks/usePageTracking'
import { useSectionTracking } from '@/hooks/useSectionTracking'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useForceTheme } from '@/hooks/useForceTheme'

export default function PricingPage() {
  useForceTheme('dark')

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
    <div className="relative min-h-screen overflow-hidden voxxy-gradient-marketing-hero">
      <Navigation activePage="pricing" />

      {/* Hero Section */}
      <section className="relative pt-[140px] pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-5 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            Simple,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#cc30e8] to-[#9054e3]">
              Transparent Pricing
            </span>
          </h1>

          <p className="mx-auto mb-0 max-w-3xl text-xl leading-relaxed text-white/65">
            Choose the plan that fits your event schedule
          </p>

          {/* Divider */}
          <div className="mt-9 flex items-center justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-voxxy-pink/40"></div>
            <div className="mx-4 w-2 h-2 rounded-full bg-voxxy-pink/40"></div>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-voxxy-pink/40"></div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section ref={pricingCardRef} className="relative z-10 bg-[#faf9fc] py-24">
        <div className="container mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Starter Plan */}
            <Card className="marketing-card pricing-card flex flex-col border-2 border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="mb-2 text-2xl font-bold text-slate-950">Starter</CardTitle>
                <div className="mb-2 text-4xl font-bold text-slate-950">$80</div>
                <CardDescription className="text-slate-600">per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-grow flex flex-col">
                <div className="flex-grow">
                  <ul className="space-y-3 min-h-[180px]">
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>Up to 10 events per year</span>
                    </li>
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>10k vendor contacts</span>
                    </li>
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>$ Marketplace Add ons</span>
                    </li>
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>2% transaction fee</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/#contact"
                  className="voxxy-btn-cta w-full inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-all"
                >
                  Request Access
                </Link>
              </CardContent>
            </Card>

            {/* Growth Plan */}
            <Card className="marketing-card-accent pricing-card relative flex flex-col border-2 border-voxxy-pink transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="border border-violet-300 bg-violet-200 px-4 py-1 text-sm text-slate-950">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="mb-2 text-2xl font-bold text-slate-950">Growth</CardTitle>
                <div className="mb-2 text-4xl font-bold text-slate-950">$160</div>
                <CardDescription className="text-slate-600">per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-grow flex flex-col">
                <div className="flex-grow">
                  <ul className="space-y-3 min-h-[180px]">
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>Up to 50 events per year</span>
                    </li>
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>50k vendor contacts</span>
                    </li>
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>$ Marketplace Add ons</span>
                    </li>
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>2% transaction fee</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/#contact"
                  className="voxxy-btn-cta w-full inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-all"
                >
                  Request Access
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="marketing-card pricing-card flex flex-col border-2 border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="mb-2 text-2xl font-bold text-slate-950">Pro</CardTitle>
                <div className="mb-2 text-4xl font-bold text-slate-950">$400</div>
                <CardDescription className="text-slate-600">per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-grow flex flex-col">
                <div className="flex-grow">
                  <ul className="space-y-3 min-h-[180px]">
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>Unlimited events</span>
                    </li>
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>Unlimited vendor contacts</span>
                    </li>
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>$ Marketplace Add ons</span>
                    </li>
                    <li className="flex items-start text-gray-800">
                      <Check className="h-5 w-5 text-voxxy-purple-brand mr-3 flex-shrink-0 mt-0.5" />
                      <span>2% transaction fee</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/#contact"
                  className="voxxy-btn-cta w-full inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-all"
                >
                  Request Access
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 border-y border-white/10 voxxy-gradient-marketing-hero py-24">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Ready to Get Started?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-white/70">
            Join event producers who are scaling their recurring events with Voxxy
          </p>
          <Link
            to="/#contact"
            className="voxxy-btn-brand inline-flex items-center justify-center rounded-lg px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl"
          >
            Request Access
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
