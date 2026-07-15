import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { usePageTracking } from '@/hooks/usePageTracking'
import { useSectionTracking } from '@/hooks/useSectionTracking'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { TrackedButton } from '@/components/analytics/TrackedButton'
import { analytics } from '@/lib/analytics'
import { useFormTracking } from '@/hooks/useFormTracking'
import { useForceTheme } from '@/hooks/useForceTheme'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { ArrowRight, CheckCircle, Mail, MessageCircle, Instagram } from 'lucide-react'

// Inline types and API for contact form
interface CreateContactSubmissionData {
  type: string
  name: string
  email: string
  organizationName?: string
  eventFrequency?: string
  typicalAttendance?: string
  biggestChallenge?: string
  description?: string
  source?: string
}

class EmailServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmailServiceError'
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const contactFormApi = {
  async submitForm(data: CreateContactSubmissionData) {
    const response = await fetch(`${API_BASE_URL}/contact_submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_submission: data }),
    })
    if (!response.ok) {
      throw new EmailServiceError('Failed to submit contact form')
    }
    return response.json()
  },
}

interface ContactFormData {
  name: string
  email: string
  eventName: string
  message: string
}

export default function HomePage() {
  useForceTheme('dark')
  const { isAuthenticated, isProducer } = useAuth()
  const problemCardClass =
    'rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_22px_48px_rgba(15,23,42,0.08)]'
  const problemIconClass =
    'mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-voxxy-pink-light/30 bg-[linear-gradient(135deg,#faf5ff_0%,#f5f3ff_100%)] text-2xl shadow-sm'

  // Helper function to scroll to contact section
  const scrollToContact = useCallback(() => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      const navHeight = 100 // Account for fixed navigation height
      const elementPosition = contactSection.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - navHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }, [])

  // Handle initial scroll position - either to top or to contact section
  useEffect(() => {
    if (window.location.hash === '#contact') {
      setTimeout(scrollToContact, 100)
    } else {
      window.scrollTo(0, 0)
    }
  }, [scrollToContact])

  // Listen for hash changes (when clicking anchor links on same page)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#contact') {
        scrollToContact()
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [scrollToContact])

  usePageTracking('Home')

  const { sectionRef: heroRef } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Hero',
  })

  const { sectionRef: problemsRef } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Problems',
    threshold: 0.4,
  })

  const { sectionRef: featuresRef } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Features',
    threshold: 0.4,
  })

  // Contact form state
  const contactFormTracking = useFormTracking('contact', 'Home')
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    eventName: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [formStarted, setFormStarted] = useState(false)

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    if (!formStarted) {
      setFormStarted(true)
      contactFormTracking.trackFormStart('cta_form')
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting || isSubmitted) {
      return
    }

    setIsSubmitting(true)
    setSubmissionError(null)

    contactFormTracking.trackFormSubmit({})

    try {
      const submissionData: CreateContactSubmissionData = {
        type: 'contact',
        name: formData.name,
        email: formData.email,
        organizationName: formData.eventName || undefined,
        description: formData.message,
        source: 'home_page_cta',
      }

      await contactFormApi.submitForm(submissionData)
      setIsSubmitted(true)

      analytics.trackConversionStep('Contact Form Submitted', 'Home')
      analytics.setUserProperties({
        conversion_stage: 'submitted',
        profile_confidence: 'high',
      })
    } catch (error) {
      console.error('Contact form submission failed:', error)
      contactFormTracking.trackFormError(
        'submission',
        error instanceof Error ? error.message : 'Unknown error',
      )
      if (error instanceof EmailServiceError) {
        setSubmissionError(`Failed to submit: ${error.message}`)
      } else {
        setSubmissionError(
          'An unexpected error occurred. Please try again or email us at team@heyvoxxy.com',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="dark voxxy-public-page relative min-h-screen overflow-hidden voxxy-gradient-marketing-hero voxxy-gradient-mobile-safe">
      <Navigation activePage="home" />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 pb-20"
      >
        <div className="absolute inset-0 bg-gradient-radial from-voxxy-pink/12 via-voxxy-purple-brand/8 to-transparent opacity-60"></div>

        <div className="container mx-auto max-w-[1200px] relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-voxxy-pink/15 border border-voxxy-pink/25 px-4 py-1.5 rounded-full mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-glow"></div>
                <span className="text-[13px] font-semibold text-primary">
                  Now Live, Accepting Art Market Producers
                </span>
              </div>

              <h1 className="mb-5 text-[52px] font-display font-bold leading-[1.1] tracking-tight text-white md:text-[56px]">
                Built for the people who run{' '}
                <em className="not-italic bg-gradient-to-r from-[#cc30e8] via-[#9054e3] to-[#651ae9] bg-clip-text text-transparent">
                  art markets and shows.
                </em>
              </h1>

              <p className="mb-9 max-w-[500px] text-[18px] leading-relaxed text-white/68">
                The CRM for art markets, pop-ups, and recurring shows. Manage applications, automate
                your artist communications, and grow the network you pull from show after show.
              </p>

              <div className="flex gap-4 flex-wrap">
                <TrackedButton
                  className="h-auto inline-flex items-center rounded-xl voxxy-btn-brand px-6 py-3 text-[15px] font-semibold text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lg"
                  trackingData={{
                    button_text: 'Get Started',
                    button_location: 'hero',
                    page_name: 'Home',
                    is_primary_cta: true,
                  }}
                  onClick={() =>
                    analytics.track('hero_cta_clicked', {
                      button_text: 'Get Started',
                      page: 'landing',
                    })
                  }
                  asChild
                >
                  <Link to="/signup">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </TrackedButton>
                <TrackedButton
                  className="h-auto voxxy-btn-public-secondary inline-flex items-center rounded-xl px-6 py-3 text-[15px] font-semibold transition-all hover:-translate-y-0.5"
                  trackingData={{
                    button_text: 'See How It Works',
                    button_location: 'hero',
                    page_name: 'Home',
                    is_primary_cta: false,
                  }}
                  onClick={() =>
                    analytics.track('hero_cta_clicked', {
                      button_text: 'See How It Works',
                      page: 'landing',
                    })
                  }
                  asChild
                >
                  <Link to="/features">See How It Works</Link>
                </TrackedButton>
              </div>
            </div>

            {/* Hero Screenshot */}
            <div className="transform perspective-1000 hover:scale-[1.02] transition-transform duration-500">
              <div className="bg-gradient-to-br from-[#221469]/40 to-[#54309F]/40 rounded-2xl border border-voxxy-purple-brand/20 p-6 voxxy-image-elevated">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  <div className="flex gap-1 ml-auto">
                    <div className="px-3 py-1 bg-voxxy-purple-brand text-primary-foreground text-[11px] rounded-md font-medium">
                      Events
                    </div>
                    <div className="rounded-md px-3 py-1 text-[11px] text-white/40">Vendors</div>
                    <div className="rounded-md px-3 py-1 text-[11px] text-white/40">Messages</div>
                  </div>
                </div>
                <img
                  src="/screenshots/hero-dashboard.png"
                  alt="Voxxy dashboard showing event management, vendor applications, and automated workflows"
                  className="rounded-2xl shadow-2xl border border-voxxy-pink/20"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section ref={problemsRef} className="bg-[#faf9fc] py-[100px] px-6 md:px-12">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-brand mb-4">
              The Problem
            </div>
            <h2 className="mb-4 text-[42px] font-display font-bold leading-tight text-slate-950">
              Running your shows shouldn't be this hard.
            </h2>
            <p className="text-[18px] text-gray-600 max-w-[600px]">
              The bigger your show calendar grows, the more coordination eats your time and your
              margins.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className={problemCardClass}>
              <div className={problemIconClass}>📧</div>
              <h3 className="mb-3 text-[20px] font-display font-bold text-slate-950">
                Your tools don't talk to each other
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-600">
                You're managing artists across email, DMs, spreadsheets, and text threads. Nothing
                connects. Critical details get buried and deadlines slip through the cracks.
              </p>
            </div>

            <div className={problemCardClass}>
              <div className={problemIconClass}>⏱️</div>
              <h3 className="mb-3 text-[20px] font-display font-bold text-slate-950">
                Coordination that doesn't scale
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-600">
                Every show eats hours of back-and-forth. Your event calendar grows but your workflow
                stays manual. Growth just means more grind.
              </p>
            </div>

            <div className={problemCardClass}>
              <div className={problemIconClass}>📋</div>
              <h3 className="mb-3 text-[20px] font-display font-bold text-slate-950">
                200+ applications, no way to compare
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-600">
                You're scrolling profiles one by one. Great artists get lost in the pile. By
                application 80, you're approving on fatigue not fit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution / Features Section */}
      <section ref={featuresRef} className="py-[100px] px-6 md:px-12">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-pink mb-4">
              The Platform
            </div>
            <h2 className="mb-4 text-[42px] font-display font-bold leading-tight text-white">
              One place for everything
            </h2>
            <p className="max-w-[600px] text-[18px] text-white/60">
              Replace disconnected tools with a single platform built for how you actually run
              events.
            </p>
          </div>

          {/* Feature Block 1 */}
          <div className="mb-16 grid items-center gap-16 border-b border-white/10 pb-16 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-[28px] font-display font-bold leading-tight text-white">
                Automated emails that keep artists in the loop
              </h3>
              <p className="mb-5 text-[16px] leading-relaxed text-white/60">
                Application confirmations, approval notices, payment reminders, event-day details,
                all sent automatically from one branded email thread. Artists always know where they
                stand. You never write the same email twice.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="rounded-full border border-primary/20 bg-primary/15 px-3.5 py-1.5 text-[12px] font-semibold text-white/80">
                  Automated Sequences
                </span>
                <span className="rounded-full border border-fuchsia-400/20 bg-voxxy-pink/15 px-3.5 py-1.5 text-[12px] font-semibold text-fuchsia-100">
                  Branded Emails
                </span>
                <span className="rounded-full border border-primary/20 bg-primary/15 px-3.5 py-1.5 text-[12px] font-semibold text-white/80">
                  Zero Manual Follow-Up
                </span>
              </div>
            </div>
            <img
              src="/screenshots/email-flows.png"
              alt="Automated email sequences for vendor communication showing approval notices and payment reminders"
              className="rounded-2xl shadow-xl border border-voxxy-pink/20"
              loading="lazy"
            />
          </div>

          {/* Feature Block 2 - Reversed */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="md:order-2">
              <h3 className="mb-4 text-[28px] font-display font-bold leading-tight text-white">
                Artist relationships that compound
              </h3>
              <p className="mb-5 text-[16px] leading-relaxed text-white/60">
                Stop rebuilding your roster from scratch every season. Track applications, notes,
                tags, and ratings across all your shows. Your best artists are always one search
                away.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="rounded-full border border-fuchsia-400/20 bg-voxxy-pink/15 px-3.5 py-1.5 text-[12px] font-semibold text-fuchsia-100">
                  Artist CRM
                </span>
                <span className="rounded-full border border-primary/20 bg-primary/15 px-3.5 py-1.5 text-[12px] font-semibold text-white/80">
                  Performance Tracking
                </span>
                <span className="rounded-full border border-fuchsia-400/20 bg-voxxy-pink/15 px-3.5 py-1.5 text-[12px] font-semibold text-fuchsia-100">
                  CSV Import
                </span>
              </div>
            </div>
            <div className="md:order-1">
              <img
                src="/screenshots/vendor-crm.png"
                alt="Vendor CRM showing contact management, tags, ratings, and performance tracking across events"
                className="rounded-2xl shadow-xl border border-voxxy-pink/20"
                loading="lazy"
              />
            </div>
          </div>

          <div className="text-center mt-12">
            <TrackedLink
              to="/features"
              className="inline-flex items-center rounded-xl voxxy-btn-brand px-6 py-3 text-[15px] font-semibold text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lg"
              trackingData={{
                link_text: 'See All Features',
                destination_page: 'Features',
                current_page: 'Home',
                link_position: 'features_section',
              }}
            >
              See All Features <ArrowRight className="ml-2 h-5 w-5" />
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#faf9fc] py-[100px] px-6 md:px-12">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14 text-center">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-brand mb-4">
              How It Works
            </div>
            <h2 className="mb-4 text-[42px] font-display font-bold leading-tight text-slate-950">
              Live in minutes, not months
            </h2>
            <p className="text-[18px] text-gray-600 max-w-[600px] mx-auto">
              No enterprise onboarding. No implementation timeline. You can be running your next
              event through Voxxy today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-voxxy-pink text-2xl font-display font-bold text-white">
                1
              </div>
              <h3 className="mb-2.5 text-[20px] font-display font-bold text-slate-950">
                Build your roster
              </h3>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Import artist contacts via CSV or add them manually. Organize with categories, tags,
                and smart lists so your network is always ready to invite.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-voxxy-pink to-pink-500 text-2xl font-display font-bold text-white">
                2
              </div>
              <h3 className="mb-2.5 text-[20px] font-display font-bold text-slate-950">
                Launch your show
              </h3>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Create events, open applications, and review artists in table or focused view. Set
                payment preferences and booth categories per show.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-primary text-2xl font-display font-bold text-white">
                3
              </div>
              <h3 className="mb-2.5 text-[20px] font-display font-bold text-slate-950">
                Let Voxxy handle the rest
              </h3>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Automated email sequences handle confirmations, reminders, and follow-ups. Your CRM
                grows with every show. You stay focused on the floor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Contact Form */}
      <section id="contact" className="py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-[1200px]">
          {/* Header */}
          <div className="mb-12">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/60">
              TALK TO OUR TEAM
            </div>
            <h2 className="mb-4 text-[42px] font-display font-bold text-white md:text-[48px]">
              Your next event starts here
            </h2>
            <p className="max-w-[600px] text-[16px] text-white/60">
              Tell us about your events and we'll get you set up. Real humans, fast responses, no
              sales funnel.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-[24px] font-display font-bold text-white">
                  Let's talk about your events
                </h3>
                <p className="text-[15px] leading-relaxed text-white/60">
                  Whether you run art markets, curate shows, or produce pop-ups across the country,
                  we'd love to hear what you're building. We respond to every message within 1-2
                  business days.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/6">
                    <Mail className="w-5 h-5 text-voxxy-pink" />
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      EMAIL
                    </div>
                    <a
                      href="mailto:team@heyvoxxy.com"
                      className="text-[15px] text-white transition-colors hover:text-fuchsia-300"
                    >
                      team@heyvoxxy.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/6">
                    <MessageCircle className="w-5 h-5 text-voxxy-pink" />
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      NEWSLETTER
                    </div>
                    <a
                      href="https://artistdirectory.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] text-white transition-colors hover:text-fuchsia-300"
                      onClick={() =>
                        analytics.track('newsletter_link_clicked', { page: 'landing' })
                      }
                    >
                      Join our Newsletter
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/6">
                    <Instagram className="w-5 h-5 text-voxxy-pink" />
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      SOCIAL
                    </div>
                    <a
                      href="https://instagram.com/heyvoxxy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] text-white transition-colors hover:text-fuchsia-300"
                      onClick={() => analytics.track('instagram_link_clicked', { page: 'landing' })}
                    >
                      @heyvoxxy on Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div>
              {isSubmitted ? (
                <div className="voxxy-contact-form-shell p-10 text-center">
                  <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-300" />
                  </div>
                  <h3 className="mb-4 text-[24px] font-bold text-white">
                    Thanks for reaching out!
                  </h3>
                  <p className="mb-6 text-white/70">
                    We'll review your message and get back to you within 1-2 business days.
                  </p>
                </div>
              ) : (
                <div className="voxxy-contact-form-shell p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name and Email Row */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="voxxy-input-public-dark h-12"
                      />
                      <input
                        id="email"
                        type="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="voxxy-input-public-dark h-12"
                      />
                    </div>

                    {/* Event Name */}
                    <input
                      id="eventName"
                      placeholder="Event name (if you have one)"
                      value={formData.eventName}
                      onChange={(e) => handleInputChange('eventName', e.target.value)}
                      className="voxxy-input-public-dark h-12"
                    />

                    {/* Message */}
                    <textarea
                      id="message"
                      placeholder="Tell us about your events. What do you produce, how often, and what's your biggest headache right now?"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      rows={5}
                      className="voxxy-input-public-dark min-h-[120px] resize-none"
                    />

                    {submissionError && (
                      <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                        <p className="text-sm text-red-200">{submissionError}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center rounded-xl voxxy-btn-brand px-6 py-3 text-[15px] font-semibold text-white shadow-md shadow-primary/20 transition-all hover:brightness-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                      {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                    </button>

                    {/* Bottom Email Link */}
                    <p className="text-center text-[13px] text-white/50">
                      Or email us directly at{' '}
                      <a
                        href="mailto:team@heyvoxxy.com"
                        className="text-white/70 underline transition-colors hover:text-fuchsia-300"
                      >
                        team@heyvoxxy.com
                      </a>
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
