import React, { useEffect } from 'react'
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { usePageTracking } from "@/hooks/usePageTracking"
import { useSectionTracking } from "@/hooks/useSectionTracking"
import { TrackedLink } from "@/components/analytics/TrackedLink"
import { TrackedButton } from "@/components/analytics/TrackedButton"
import { analytics } from "@/lib/analytics"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { ArrowRight, Check } from "lucide-react"

export default function HomePage() {
  const { isAuthenticated, isProducer } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  usePageTracking('Home')

  const { sectionRef: heroRef } = useSectionTracking({
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <Navigation activePage="home" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-[140px] pb-20 px-6 md:px-12 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-radial from-voxxy-purple-brand/15 via-transparent to-transparent opacity-60"></div>

        <div className="container mx-auto max-w-[1200px] relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-voxxy-purple-brand/20 border border-voxxy-purple-brand/30 px-4 py-1.5 rounded-full mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-glow"></div>
                <span className="text-[13px] font-semibold text-purple-200">Now Live — Accepting Event Producers</span>
              </div>

              <h1 className="text-[52px] md:text-[56px] font-display font-bold leading-[1.1] text-white mb-5 tracking-tight">
                The Operating System for <em className="not-italic bg-gradient-to-r from-voxxy-purple-light to-voxxy-coral bg-clip-text text-transparent">Recurring Event Producers</em>
              </h1>

              <p className="text-[18px] leading-relaxed text-white/65 mb-9 max-w-[500px]">
                Manage vendor applications, automate communications, and grow your events — all from one platform. Built for art shows, markets, and pop-ups that happen more than once.
              </p>

              <div className="flex gap-4 flex-wrap">
                <TrackedButton
                  className="inline-flex items-center px-8 py-3.5 bg-voxxy-purple-brand hover:bg-purple-700 text-white text-[16px] font-semibold rounded-xl transition-all shadow-lg shadow-voxxy-purple-brand/30 hover:shadow-xl hover:-translate-y-0.5"
                  trackingData={{
                    button_text: 'Get Started',
                    button_location: 'hero',
                    page_name: 'Home',
                    is_primary_cta: true
                  }}
                  asChild
                >
                  <Link to="/contact">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </TrackedButton>
                <TrackedButton
                  className="inline-flex items-center px-8 py-3.5 bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/30 text-white text-[16px] font-medium rounded-xl transition-all"
                  trackingData={{
                    button_text: 'See How It Works',
                    button_location: 'hero',
                    page_name: 'Home',
                    is_primary_cta: false
                  }}
                  asChild
                >
                  <Link to="/features">
                    See How It Works
                  </Link>
                </TrackedButton>
              </div>
            </div>

            {/* Hero Screenshot */}
            <div className="transform perspective-1000 hover:scale-[1.02] transition-transform duration-500">
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-2xl border border-voxxy-purple-brand/20 p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  <div className="flex gap-1 ml-auto">
                    <div className="px-3 py-1 bg-voxxy-purple-brand text-white text-[11px] rounded-md font-medium">Events</div>
                    <div className="px-3 py-1 text-white/40 text-[11px] rounded-md">Vendors</div>
                    <div className="px-3 py-1 text-white/40 text-[11px] rounded-md">Messages</div>
                  </div>
                </div>
                <img
                  src="/screenshots/hero-dashboard.png"
                  alt="Voxxy Presents dashboard showing event management, vendor applications, and automated workflows"
                  className="rounded-2xl shadow-2xl border border-white/10"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="bg-gray-50 py-10 px-6 border-y border-gray-200">
        <div className="container mx-auto max-w-[1200px]">
          <div className="flex justify-center gap-16 flex-wrap">
            <div className="text-center">
              <div className="text-[36px] font-display font-bold text-voxxy-purple-brand mb-1">3,000+</div>
              <div className="text-[14px] text-gray-600">Artist Invites Sent This Week</div>
            </div>
            <div className="text-center">
              <div className="text-[36px] font-display font-bold text-voxxy-purple-brand mb-1">5</div>
              <div className="text-[14px] text-gray-600">Art Shows This Month</div>
            </div>
            <div className="text-center">
              <div className="text-[36px] font-display font-bold text-voxxy-purple-brand mb-1">2%</div>
              <div className="text-[14px] text-gray-600">Transaction Fee</div>
            </div>
            <div className="text-center">
              <div className="text-[36px] font-display font-bold text-voxxy-purple-brand mb-1">~5 min</div>
              <div className="text-[14px] text-gray-600">Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section ref={problemsRef} className="py-[100px] px-6 md:px-12 bg-white">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-brand mb-4">The Problem</div>
            <h2 className="text-[42px] font-display font-bold leading-tight text-gray-900 mb-4">Event coordination is broken</h2>
            <p className="text-[18px] text-gray-600 max-w-[600px]">
              The bigger your event calendar grows, the more coordination eats your time — and your margins.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center text-2xl mb-5">📧</div>
              <h3 className="text-[20px] font-display font-bold mb-3">5–7 Tools, Zero Visibility</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">
                You're chasing vendors across email, text, Instagram DMs, WhatsApp, and spreadsheets. Critical details get buried. Deadlines slip.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center text-2xl mb-5">⏱️</div>
              <h3 className="text-[20px] font-display font-bold mb-3">Hours of Unpaid Coordination</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">
                Every event eats hours of back-and-forth that doesn't scale. Your calendar grows, but your coordination workflow stays manual.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center text-2xl mb-5">📋</div>
              <h3 className="text-[20px] font-display font-bold mb-3">200+ Applications, No Way to Compare</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">
                You're scrolling social profiles one by one. Great vendors get lost in the pile. By application 80, you're approving on fatigue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution / Features Section */}
      <section ref={featuresRef} className="py-[100px] px-6 md:px-12 bg-gray-50">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-brand mb-4">The Platform</div>
            <h2 className="text-[42px] font-display font-bold leading-tight text-gray-900 mb-4">One place for everything</h2>
            <p className="text-[18px] text-gray-600 max-w-[600px]">
              Replace disconnected tools with a single platform built for how you actually run events.
            </p>
          </div>

          {/* Feature Block 1 */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-16 pb-16 border-b border-gray-200">
            <div>
              <h3 className="text-[28px] font-display font-bold leading-tight mb-4">Automated emails that keep vendors in the loop</h3>
              <p className="text-[16px] leading-relaxed text-gray-600 mb-5">
                Application confirmations, approval notices, payment reminders, event-day details — all sent automatically from one branded email thread. Vendors always know where they stand. You never have to write the same email twice.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3.5 py-1.5 bg-voxxy-purple-brand/10 text-voxxy-purple-brand text-[12px] font-semibold rounded-full border border-voxxy-purple-brand/20">Automated Sequences</span>
                <span className="px-3.5 py-1.5 bg-voxxy-purple-brand/10 text-voxxy-purple-brand text-[12px] font-semibold rounded-full border border-voxxy-purple-brand/20">Branded Emails</span>
                <span className="px-3.5 py-1.5 bg-voxxy-purple-brand/10 text-voxxy-purple-brand text-[12px] font-semibold rounded-full border border-voxxy-purple-brand/20">Zero Manual Follow-Up</span>
              </div>
            </div>
            <img
              src="/screenshots/email-automation.png"
              alt="Automated email sequences for vendor communication showing approval notices and payment reminders"
              className="rounded-2xl shadow-xl border border-gray-200"
              loading="lazy"
            />
          </div>

          {/* Feature Block 2 - Reversed */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="md:order-2">
              <h3 className="text-[28px] font-display font-bold leading-tight mb-4">Vendor relationships that compound</h3>
              <p className="text-[16px] leading-relaxed text-gray-600 mb-5">
                Stop rebuilding your vendor list from scratch every season. Track performance, notes, tags, and ratings across all your events. Your best vendors are always one search away.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3.5 py-1.5 bg-voxxy-purple-brand/10 text-voxxy-purple-brand text-[12px] font-semibold rounded-full border border-voxxy-purple-brand/20">Vendor CRM</span>
                <span className="px-3.5 py-1.5 bg-voxxy-purple-brand/10 text-voxxy-purple-brand text-[12px] font-semibold rounded-full border border-voxxy-purple-brand/20">Performance Tracking</span>
                <span className="px-3.5 py-1.5 bg-voxxy-purple-brand/10 text-voxxy-purple-brand text-[12px] font-semibold rounded-full border border-voxxy-purple-brand/20">CSV Import</span>
              </div>
            </div>
            <div className="md:order-1">
              <img
                src="/screenshots/vendor-crm.png"
                alt="Vendor CRM showing contact management, tags, ratings, and performance tracking across events"
                className="rounded-2xl shadow-xl border border-gray-200"
                loading="lazy"
              />
            </div>
          </div>

          <div className="text-center mt-12">
            <TrackedLink
              to="/features"
              className="inline-flex items-center px-8 py-3.5 bg-transparent hover:bg-voxxy-purple-brand/5 border-2 border-voxxy-purple-brand text-voxxy-purple-brand text-[16px] font-semibold rounded-xl transition-all"
              trackingData={{
                link_text: 'See All Features',
                destination_page: 'Features',
                current_page: 'Home',
                link_position: 'features_section'
              }}
            >
              See All Features <ArrowRight className="ml-2 h-5 w-5" />
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-[100px] px-6 md:px-12 bg-white">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14 text-center">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-brand mb-4">How It Works</div>
            <h2 className="text-[42px] font-display font-bold leading-tight text-gray-900 mb-4">Live in minutes, not months</h2>
            <p className="text-[18px] text-gray-600 max-w-[600px] mx-auto">
              No enterprise onboarding. No implementation timeline. You can be running your next event through Voxxy today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-voxxy-purple-brand text-white text-2xl font-display font-bold rounded-2xl flex items-center justify-center mx-auto mb-5">1</div>
              <h3 className="text-[20px] font-display font-bold mb-2.5">Create your event</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Set up your event details, application form, and vendor categories. Import existing vendor lists via CSV if you have them.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-voxxy-purple-brand text-white text-2xl font-display font-bold rounded-2xl flex items-center justify-center mx-auto mb-5">2</div>
              <h3 className="text-[20px] font-display font-bold mb-2.5">Open applications</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Share your application link. Vendors apply with portfolios and details. Review and approve with side-by-side comparison tools.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-voxxy-purple-brand text-white text-2xl font-display font-bold rounded-2xl flex items-center justify-center mx-auto mb-5">3</div>
              <h3 className="text-[20px] font-display font-bold mb-2.5">Coordinate and grow</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Automated emails handle the logistics. Vendor CRM tracks relationships across events. Your community grows with every show.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Traction / Testimonial */}
      <section className="py-[100px] px-6 md:px-12 bg-gradient-to-br from-voxxy-purple-deep to-voxxy-purple-mid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-voxxy-purple-brand/20 via-transparent to-transparent opacity-40"></div>

        <div className="container mx-auto max-w-[1200px] relative z-10">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-light mb-4">Already Live</div>
            <h2 className="text-[42px] font-display font-bold leading-tight text-white mb-4">Powering events across the country</h2>
            <p className="text-[18px] text-white/60 max-w-[600px]">
              From art shows in San Francisco to touring national events — Voxxy is where producers are moving their operations.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-10 grid md:grid-cols-2 gap-12 items-center backdrop-blur-sm">
            <div>
              <p className="text-[20px] italic leading-relaxed text-white/85 mb-6">
                "We've grown from one market every other month to two markets a month with Voxxy. The automation freed us up to focus on bringing more vendors and revenue to Brooklyn. Game changer."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-[32px]">❤️</div>
                <div>
                  <div className="font-bold text-white">Brooklyn Hearts Club</div>
                  <div className="text-[13px] text-white/50">Brooklyn art market series</div>
                </div>
              </div>
            </div>
            <img
              src="/screenshots/event-photo.png"
              alt="Vibrant art market event with vendors and attendees"
              className="rounded-2xl shadow-xl border border-white/10"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-y border-white/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-[42px] md:text-[48px] font-display font-bold text-white mb-6">
            Your next event starts here
          </h2>
          <p className="text-[18px] text-white/70 mb-10 max-w-2xl mx-auto">
            Tell us about your events and we'll get you set up. Real humans, fast responses, no sales funnel.
          </p>
          <TrackedLink
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-voxxy-purple-brand hover:bg-gray-100 transition-all text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl"
            trackingData={{
              link_text: 'Get Started',
              destination_page: 'Contact',
              current_page: 'Home',
              link_position: 'cta_section'
            }}
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </TrackedLink>
        </div>
      </section>

      <Footer />
    </div>
  )
}
