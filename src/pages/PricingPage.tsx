import React, { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTracking } from '@/hooks/usePageTracking'
import { useSectionTracking } from '@/hooks/useSectionTracking'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useForceTheme } from '@/hooks/useForceTheme'

export default function PricingPage() {
  useForceTheme('dark')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  usePageTracking('Pricing')

  const { sectionRef: pricingCardRef } = useSectionTracking({
    pageName: 'Pricing',
    sectionName: 'Pricing Cards',
  })

  return (
    <div className="relative min-h-screen overflow-hidden voxxy-gradient-marketing-hero voxxy-gradient-mobile-safe">
      <Navigation activePage="pricing" />

      {/* Split Pricing Section */}
      <section ref={pricingCardRef} className="relative pt-[140px] pb-24 px-6 md:px-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Copy */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="border border-violet-400/30 bg-violet-500/20 px-4 py-1.5 text-sm font-medium text-white">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Limited Time Offer
                </Badge>
                <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
                  One plan.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#cc30e8] to-[#9054e3]">
                    Everything included.
                  </span>
                </h1>
                <p className="text-xl leading-relaxed text-white/70 max-w-lg">
                  Get full access to every feature for a flat monthly rate. No tiers, no upsells, no
                  surprises.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-white/50 uppercase tracking-wider">
                  What you get
                </p>
                <ul className="space-y-3">
                  {[
                    'Unlimited events',
                    'Unlimited artist contacts',
                    'Automated email campaigns',
                    'Vendor management & applications',
                    'Analytics & payment tracking',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-white/80">
                      <Check className="h-5 w-5 text-voxxy-pink flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Side - Pricing Card */}
            <div className="flex justify-center lg:justify-end">
              <Card className="w-full max-w-sm bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-[0_0_60px_rgba(144,84,227,0.2)] overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-voxxy-pink uppercase tracking-wider">
                      Producer Plan
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-6xl font-bold text-white">$40</span>
                      <span className="text-lg text-white/50">/mo</span>
                    </div>
                    <p className="text-sm text-white/60">
                      Special pricing for early customers
                    </p>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <ul className="space-y-3">
                    {[
                      'Full platform access',
                      'No event limits',
                      'No contact limits',
                      'Cancel anytime',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                        <div className="h-5 w-5 rounded-full bg-voxxy-pink/20 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-voxxy-pink" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/signup"
                    className="voxxy-btn-cta w-full inline-flex items-center justify-center rounded-lg px-5 py-3.5 text-sm font-semibold transition-all"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>

                  <p className="text-center text-xs text-white/40">
                    Secure payment via Stripe. Cancel anytime.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 border-y border-white/10 voxxy-gradient-marketing-hero py-24">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Ready to Get Started?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-white/70">
            Join the producers scaling their art markets and shows with Voxxy.
          </p>
          <Link
            to="/signup"
            className="voxxy-btn-brand inline-flex items-center justify-center rounded-lg px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
