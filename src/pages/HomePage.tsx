import { useEffect, useState, useCallback } from 'react'
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { usePageTracking } from "@/hooks/usePageTracking"
import { useSectionTracking } from "@/hooks/useSectionTracking"
import { TrackedLink } from "@/components/analytics/TrackedLink"
import { TrackedButton } from "@/components/analytics/TrackedButton"
import { analytics } from "@/lib/analytics"
import { useFormTracking } from "@/hooks/useFormTracking"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, CheckCircle, Mail, MessageCircle, Instagram } from "lucide-react"

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
      body: JSON.stringify({ contact_submission: data })
    })
    if (!response.ok) {
      throw new EmailServiceError('Failed to submit contact form')
    }
    return response.json()
  }
}

interface ContactFormData {
  name: string
  email: string
  eventName: string
  message: string
}

export default function HomePage() {
  const { isAuthenticated, isProducer } = useAuth()

  // Helper function to scroll to contact section
  const scrollToContact = useCallback(() => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      const navHeight = 100 // Account for fixed navigation height
      const elementPosition = contactSection.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - navHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
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
  })

  const { sectionRef: featuresRef } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Features',
  })

  // Contact form state
  const contactFormTracking = useFormTracking('contact', 'Home')
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    eventName: '',
    message: ''
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
    setFormData(prev => ({ ...prev, [field]: value }))
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
        source: 'home_page_cta'
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
      contactFormTracking.trackFormError('submission', error instanceof Error ? error.message : 'Unknown error')
      if (error instanceof EmailServiceError) {
        setSubmissionError(`Failed to submit: ${error.message}`)
      } else {
        setSubmissionError('An unexpected error occurred. Please try again or email us at team@voxxypresents.com')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <Navigation activePage="home" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-radial from-fuchsia-500/12 via-purple-600/8 to-transparent opacity-60"></div>

        <div className="container mx-auto max-w-[1200px] relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-fuchsia-500/15 border border-fuchsia-400/25 px-4 py-1.5 rounded-full mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-glow"></div>
                <span className="text-[13px] font-semibold text-purple-200">Now Live — Accepting Event Producers</span>
              </div>

              <h1 className="text-[52px] md:text-[56px] font-display font-bold leading-[1.1] text-white mb-5 tracking-tight">
                The Operating System for <em className="not-italic bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">Recurring Event Producers</em>
              </h1>

              <p className="text-[18px] leading-relaxed text-white/65 mb-9 max-w-[500px]">
                Manage vendor applications, automate communications, and grow your events — all from one platform. Built for art shows, markets, and pop-ups that happen more than once.
              </p>

              <div className="flex gap-4 flex-wrap">
                <TrackedButton
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 hover:from-purple-700 hover:via-fuchsia-600 hover:to-pink-600 text-white text-[16px] font-semibold rounded-xl transition-all shadow-lg shadow-fuchsia-500/25 hover:shadow-xl hover:-translate-y-0.5"
                  trackingData={{
                    button_text: 'Request Access',
                    button_location: 'hero',
                    page_name: 'Home',
                    is_primary_cta: true
                  }}
                  asChild
                >
                  <a href="#contact">
                    Request Access <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </TrackedButton>
                <TrackedButton
                  className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/15 hover:border-fuchsia-400/30 text-white text-[16px] font-medium rounded-xl transition-all"
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
                  className="rounded-2xl shadow-2xl border border-fuchsia-500/20"
                  loading="eager"
                />
              </div>
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
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-voxxy-purple-brand/30 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center text-2xl mb-5">📧</div>
              <h3 className="text-[20px] font-display font-bold mb-3 text-gray-900">5–7 Tools, Zero Visibility</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">
                You're chasing vendors across email, text, Instagram DMs, WhatsApp, and spreadsheets. Critical details get buried. Deadlines slip.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-voxxy-purple-brand/30 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center text-2xl mb-5">⏱️</div>
              <h3 className="text-[20px] font-display font-bold mb-3 text-gray-900">Hours of Unpaid Coordination</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">
                Every event eats hours of back-and-forth that doesn't scale. Your calendar grows, but your coordination workflow stays manual.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-voxxy-purple-brand/30 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center text-2xl mb-5">📋</div>
              <h3 className="text-[20px] font-display font-bold mb-3 text-gray-900">200+ Applications, No Way to Compare</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">
                You're scrolling social profiles one by one. Great vendors get lost in the pile. By application 80, you're approving on fatigue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution / Features Section */}
      <section ref={featuresRef} className="py-[100px] px-6 md:px-12">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-fuchsia-400 mb-4">The Platform</div>
            <h2 className="text-[42px] font-display font-bold leading-tight text-white mb-4">One place for everything</h2>
            <p className="text-[18px] text-white/60 max-w-[600px]">
              Replace disconnected tools with a single platform built for how you actually run events.
            </p>
          </div>

          {/* Feature Block 1 */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-16 pb-16 border-b border-white/10">
            <div>
              <h3 className="text-[28px] font-display font-bold leading-tight mb-4 text-white">Automated emails that keep vendors in the loop</h3>
              <p className="text-[16px] leading-relaxed text-white/60 mb-5">
                Application confirmations, approval notices, payment reminders, event-day details — all sent automatically from one branded email thread. Vendors always know where they stand. You never have to write the same email twice.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3.5 py-1.5 bg-purple-500/15 text-purple-300 text-[12px] font-semibold rounded-full border border-purple-400/20">Automated Sequences</span>
                <span className="px-3.5 py-1.5 bg-fuchsia-500/15 text-fuchsia-300 text-[12px] font-semibold rounded-full border border-fuchsia-400/20">Branded Emails</span>
                <span className="px-3.5 py-1.5 bg-purple-500/15 text-purple-300 text-[12px] font-semibold rounded-full border border-purple-400/20">Zero Manual Follow-Up</span>
              </div>
            </div>
            <img
              src="/screenshots/email-flows.png"
              alt="Automated email sequences for vendor communication showing approval notices and payment reminders"
              className="rounded-2xl shadow-xl border border-fuchsia-500/20"
              loading="lazy"
            />
          </div>

          {/* Feature Block 2 - Reversed */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="md:order-2">
              <h3 className="text-[28px] font-display font-bold leading-tight mb-4 text-white">Vendor relationships that compound</h3>
              <p className="text-[16px] leading-relaxed text-white/60 mb-5">
                Stop rebuilding your vendor list from scratch every season. Track performance, notes, tags, and ratings across all your events. Your best vendors are always one search away.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3.5 py-1.5 bg-fuchsia-500/15 text-fuchsia-300 text-[12px] font-semibold rounded-full border border-fuchsia-400/20">Vendor CRM</span>
                <span className="px-3.5 py-1.5 bg-purple-500/15 text-purple-300 text-[12px] font-semibold rounded-full border border-purple-400/20">Performance Tracking</span>
                <span className="px-3.5 py-1.5 bg-fuchsia-500/15 text-fuchsia-300 text-[12px] font-semibold rounded-full border border-fuchsia-400/20">CSV Import</span>
              </div>
            </div>
            <div className="md:order-1">
              <img
                src="/screenshots/vendor-crm.png"
                alt="Vendor CRM showing contact management, tags, ratings, and performance tracking across events"
                className="rounded-2xl shadow-xl border border-fuchsia-500/20"
                loading="lazy"
              />
            </div>
          </div>

          <div className="text-center mt-12">
            <TrackedLink
              to="/features"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-[16px] font-semibold rounded-xl transition-all shadow-lg shadow-fuchsia-500/20 hover:shadow-xl hover:-translate-y-0.5"
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
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white text-2xl font-display font-bold rounded-2xl flex items-center justify-center mx-auto mb-5">1</div>
              <h3 className="text-[20px] font-display font-bold mb-2.5 text-gray-900">Create your event</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Set up your event details, application form, and vendor categories. Import existing vendor lists via CSV if you have them.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white text-2xl font-display font-bold rounded-2xl flex items-center justify-center mx-auto mb-5">2</div>
              <h3 className="text-[20px] font-display font-bold mb-2.5 text-gray-900">Open applications</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Share your application link. Vendors apply with portfolios and details. Review and approve with side-by-side comparison tools.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 text-white text-2xl font-display font-bold rounded-2xl flex items-center justify-center mx-auto mb-5">3</div>
              <h3 className="text-[20px] font-display font-bold mb-2.5 text-gray-900">Coordinate and grow</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Automated emails handle the logistics. Vendor CRM tracks relationships across events. Your community grows with every show.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Traction / Testimonial */}
      <section className="py-[100px] px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-fuchsia-500/10 via-transparent to-transparent opacity-40"></div>

        <div className="container mx-auto max-w-[1200px] relative z-10">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-light mb-4">Already Live</div>
            <h2 className="text-[42px] font-display font-bold leading-tight text-white mb-4">Powering events across the country</h2>
            <p className="text-[18px] text-white/60 max-w-[600px]">
              From art shows in San Francisco to touring national events — Voxxy is where producers are moving their operations.
            </p>
          </div>

          <div className="bg-white/10 border border-fuchsia-400/15 rounded-2xl p-10 grid md:grid-cols-2 gap-12 items-center backdrop-blur-sm">
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
              className="rounded-2xl shadow-xl border border-fuchsia-500/20"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* CTA Section with Contact Form */}
      <section id="contact" className="py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-[1200px]">
          {/* Header */}
          <div className="mb-12">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-4">TALK TO OUR TEAM</div>
            <h2 className="text-[42px] md:text-[48px] font-display font-bold text-white mb-4">
              Your next event starts here
            </h2>
            <p className="text-[16px] text-white/60 max-w-[600px]">
              Tell us about your events and we'll get you set up. Real humans, fast responses, no sales funnel.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-[24px] font-display font-bold text-white mb-4">Let's talk about your events</h3>
                <p className="text-[15px] text-white/60 leading-relaxed">
                  Whether you're running 5 art markets a year or 50 pop-ups across the country, we'd love to hear what you're building. We respond to every message within 1–2 business days.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">EMAIL</div>
                    <a href="mailto:team@voxxypresents.com" className="text-[15px] text-white hover:text-fuchsia-400 transition-colors">
                      team@voxxypresents.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">COMMUNITY</div>
                    <a href="https://discord.gg/voxxypresents" target="_blank" rel="noopener noreferrer" className="text-[15px] text-white hover:text-fuchsia-400 transition-colors">
                      Join our Discord
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">SOCIAL</div>
                    <a href="https://instagram.com/voxxypresents" target="_blank" rel="noopener noreferrer" className="text-[15px] text-white hover:text-fuchsia-400 transition-colors">
                      @voxxypresents on Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div>
              {isSubmitted ? (
                <div className="bg-[#2d1b4e]/50 backdrop-blur-sm border border-white/10 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-300" />
                  </div>
                  <h3 className="text-[24px] font-bold text-white mb-4">Thanks for reaching out!</h3>
                  <p className="text-white/70 mb-6">
                    We'll review your message and get back to you within 1-2 business days.
                  </p>
                </div>
              ) : (
                <div className="bg-[#2d1b4e]/50 backdrop-blur-sm border border-fuchsia-400/10 rounded-2xl p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name and Email Row */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="bg-[#1a0a2e]/80 border-white/10 text-white placeholder:text-white/40 h-12 text-[15px] focus:bg-[#1a0a2e] focus:border-purple-400/50 transition-all rounded-lg"
                      />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="bg-[#1a0a2e]/80 border-white/10 text-white placeholder:text-white/40 h-12 text-[15px] focus:bg-[#1a0a2e] focus:border-purple-400/50 transition-all rounded-lg"
                      />
                    </div>

                    {/* Event Name */}
                    <Input
                      id="eventName"
                      placeholder="Event name (if you have one)"
                      value={formData.eventName}
                      onChange={(e) => handleInputChange('eventName', e.target.value)}
                      className="bg-[#1a0a2e]/80 border-white/10 text-white placeholder:text-white/40 h-12 text-[15px] focus:bg-[#1a0a2e] focus:border-purple-400/50 transition-all rounded-lg"
                    />

                    {/* Message */}
                    <Textarea
                      id="message"
                      placeholder="Tell us about your events — what do you produce, how often, and what's your biggest headache right now?"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      rows={5}
                      className="bg-[#1a0a2e]/80 border-white/10 text-white placeholder:text-white/40 text-[15px] focus:bg-[#1a0a2e] focus:border-purple-400/50 transition-all resize-none rounded-lg"
                    />

                    {submissionError && (
                      <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                        <p className="text-red-300 text-sm">{submissionError}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 hover:from-purple-700 hover:via-fuchsia-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white transition-all text-[15px] font-semibold rounded-xl shadow-lg shadow-fuchsia-500/20 hover:shadow-xl"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                      {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                    </button>

                    {/* Bottom Email Link */}
                    <p className="text-center text-[13px] text-white/50">
                      Or email us directly at{' '}
                      <a href="mailto:team@voxxypresents.com" className="text-white/70 hover:text-fuchsia-400 transition-colors underline">
                        team@voxxypresents.com
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
