import { useEffect } from 'react'
import {
  Shield,
  ArrowRight,
  CheckCircle,
  Mail,
  Users,
  Search,
  Zap
} from "lucide-react"
import { usePageTracking } from "@/hooks/usePageTracking"
import { useSectionTracking } from "@/hooks/useSectionTracking"
import { TrackedLink } from "@/components/analytics/TrackedLink"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { useForceTheme } from '@/hooks/useForceTheme'

export default function FeaturesPage() {
  useForceTheme('dark')
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  usePageTracking('Features')

  const { sectionRef: featuresRef } = useSectionTracking({
    pageName: 'Features',
    sectionName: 'Core Features',
  })

  const { sectionRef: trustRef } = useSectionTracking({
    pageName: 'Features',
    sectionName: 'Trust & Safety',
  })

  return (
    <div className="relative min-h-screen overflow-hidden voxxy-gradient-marketing-hero">
      <Navigation activePage="features" />

      {/* Hero Section */}
      <section className="relative pt-[140px] pb-16 px-6 md:px-12">
        <div className="absolute inset-0 bg-gradient-radial from-voxxy-pink/12 via-voxxy-purple-brand/8 to-transparent opacity-60"></div>

        <div className="container mx-auto max-w-[1200px] relative z-10">
          <div className="text-center max-w-[800px] mx-auto">
            <h1 className="mb-5 text-[52px] font-display font-bold leading-[1.1] tracking-tight text-white md:text-[56px]">
              Everything you need to <em className="not-italic bg-gradient-to-r from-[#cc30e8] via-[#9054e3] to-[#651ae9] bg-clip-text text-transparent">run better events</em>
            </h1>

            <p className="mx-auto mb-0 max-w-[600px] text-[18px] leading-relaxed text-white/65">
              Vendor coordination, automated communications, and relationship management — all in one platform designed for how you actually work.
            </p>
          </div>

          {/* Divider */}
          <div className="mt-16 flex items-center justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-voxxy-pink/40"></div>
            <div className="mx-4 w-2 h-2 rounded-full bg-voxxy-pink/40"></div>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-voxxy-pink/40"></div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section ref={featuresRef} className="bg-[#faf9fc] py-[100px] px-6 md:px-12">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-brand mb-4">Core Features</div>
            <h2 className="mb-4 text-[42px] font-display font-bold leading-tight text-slate-950">Built for your workflow</h2>
            <p className="text-[18px] text-gray-600 max-w-[600px]">
              Every feature designed to save you time and help you run more events with less stress.
            </p>
          </div>

          {/* Feature Block 1 - Automated Communication */}
          <div className="mb-16 grid items-center gap-16 border-b border-slate-200 pb-16 md:grid-cols-2">
            <div>
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center mb-5">
                <Mail className="h-6 w-6 text-violet-700" />
              </div>
              <h3 className="mb-4 text-[28px] font-display font-bold leading-tight text-slate-950">Automated vendor communication</h3>
              <p className="text-[16px] leading-relaxed text-gray-600 mb-5">
                Stop writing the same emails over and over. Application confirmations, approval notices, payment reminders, waitlist updates, and event-day details — all sent automatically from one branded email thread. Vendors always know where they stand.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">Automated email sequences for every event stage</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">Branded emails that feel personal</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">Zero manual follow-up required</span>
                </div>
              </div>
            </div>
            <img
              src="/screenshots/email-automation.png"
              alt="Automated email sequences showing vendor communication workflows"
              className="rounded-2xl border border-slate-200 shadow-xl"
              loading="lazy"
            />
          </div>

          {/* Feature Block 2 - Vendor CRM - Reversed */}
          <div className="mb-16 grid items-center gap-16 border-b border-slate-200 pb-16 md:grid-cols-2">
            <div className="md:order-2">
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center mb-5">
                <Users className="h-6 w-6 text-violet-700" />
              </div>
              <h3 className="mb-4 text-[28px] font-display font-bold leading-tight text-slate-950">Vendor relationships that compound</h3>
              <p className="text-[16px] leading-relaxed text-gray-600 mb-5">
                Stop rebuilding your vendor list from scratch every season. Track performance, notes, tags, and ratings across all your events. CSV import for existing lists. Your best vendors are always one search away.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">Unified vendor profiles across all events</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">Performance tracking and ratings</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">CSV import for existing vendor lists</span>
                </div>
              </div>
            </div>
            <div className="md:order-1">
              <img
                src="/screenshots/vendor-crm.png"
                alt="Vendor CRM showing contact management and performance tracking"
                className="rounded-2xl border border-slate-200 shadow-xl"
                loading="lazy"
              />
            </div>
          </div>

          {/* Feature Block 3 - Fast Application Review */}
          <div className="mb-16 grid items-center gap-16 border-b border-slate-200 pb-16 md:grid-cols-2">
            <div>
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center mb-5">
                <Search className="h-6 w-6 text-violet-700" />
              </div>
              <h3 className="mb-4 text-[28px] font-display font-bold leading-tight text-slate-950">Fast application review</h3>
              <p className="text-[16px] leading-relaxed text-gray-600 mb-5">
                Stop scrolling through 200 Instagram profiles one by one. Side-by-side portfolio comparison with integrated social profiles. One-click approve, waitlist, or reject. Bulk actions for faster decisions.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">Side-by-side application comparison</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">Integrated social profiles and portfolios</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">Bulk actions for efficiency</span>
                </div>
              </div>
            </div>
            <img
              src="/screenshots/application-review.png"
              alt="Application review interface with side-by-side comparison"
              className="rounded-2xl border border-slate-200 shadow-xl"
              loading="lazy"
            />
          </div>

          {/* Feature Block 4 - No-Code Automation */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="md:order-2">
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center mb-5">
                <Zap className="h-6 w-6 text-violet-700" />
              </div>
              <h3 className="mb-4 text-[28px] font-display font-bold leading-tight text-slate-950">Email automation without technical setup</h3>
              <p className="text-[16px] leading-relaxed text-gray-600 mb-5">
                No Mailgun, no SendGrid, no developer needed. Application confirmations, approvals, rejections, waitlist notifications, payment reminders, and day-of logistics — all automated and customizable.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">Automated email triggers for every action</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">Event-specific customization</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-700" />
                  <span className="text-[15px] text-gray-700">Zero technical setup required</span>
                </div>
              </div>
            </div>
            <div className="md:order-1">
              <img
                src="/screenshots/email-flows.png"
                alt="Email automation dashboard showing customizable templates"
                className="rounded-2xl border border-slate-200 shadow-xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section ref={trustRef} className="py-[100px] px-6 md:px-12">
        <div className="container mx-auto max-w-[1200px]">
          <div className="max-w-[800px] mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-voxxy-pink/15 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-voxxy-pink" />
              </div>
            </div>

            <div className="mb-10 text-center">
              <h2 className="mb-4 text-[36px] font-display font-bold text-white">Trust & Safety Commitment</h2>
              <p className="text-[18px] text-white/60">
                We found that our users — especially those focused on art and community — really care about their data. They want privacy and a commitment that their data won't be sold to third parties.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/6 p-10 backdrop-blur-sm">
              <p className="mb-6 text-[16px] leading-relaxed text-white/70">
                <strong className="text-white">Trust is a huge part of community</strong>, and we want our users to feel safe. That's why we:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-voxxy-pink flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Never sell your data</strong>
                    <span className="text-white/60"> to third parties without explicit consent</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-voxxy-pink flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Generate immediate safety reviews</strong>
                    <span className="text-white/60"> for all applications</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-voxxy-pink flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Always have human support</strong>
                    <span className="text-white/60"> available for any safety concerns</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-voxxy-pink flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Transparent about data usage</strong>
                    <span className="text-white/60"> — you always know what we do with your information</span>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center italic text-white/50">
                Your community's safety and privacy are foundational to everything we build.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 relative">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-[42px] font-display font-bold text-white md:text-[48px]">
            Ready to build your next event?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-[18px] text-white/70">
            Join event producers everywhere who are scaling their recurring events with Voxxy.
          </p>
          <TrackedLink
            to="/#contact"
            className="inline-flex items-center rounded-xl voxxy-btn-brand px-8 py-[18px] text-lg font-semibold text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lg"
            trackingData={{
              link_text: 'Request Access',
              destination_page: 'Contact',
              current_page: 'Features',
              link_position: 'cta_section'
            }}
          >
            Request Access <ArrowRight className="ml-2 h-5 w-5" />
          </TrackedLink>
        </div>
      </section>

      <Footer />
    </div>
  )
}
