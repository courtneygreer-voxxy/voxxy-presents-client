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

export default function FeaturesPage() {
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
    <div className="min-h-screen voxxy-gradient-page relative overflow-hidden">
      <Navigation activePage="features" />

      {/* Hero Section */}
      <section className="relative pt-[140px] pb-16 px-6 md:px-12">
        <div className="absolute inset-0 bg-gradient-radial from-fuchsia-500/12 via-purple-600/8 to-transparent opacity-60"></div>

        <div className="container mx-auto max-w-[1200px] relative z-10">
          <div className="text-center max-w-[800px] mx-auto">
            <h1 className="text-[52px] md:text-[56px] font-display font-bold leading-[1.1] text-foreground mb-5 tracking-tight">
              Everything you need to <em className="not-italic bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">run better events</em>
            </h1>

            <p className="text-[18px] leading-relaxed text-foreground/65 mb-0 max-w-[600px] mx-auto">
              Vendor coordination, automated communications, and relationship management — all in one platform designed for how you actually work.
            </p>
          </div>

          {/* Divider */}
          <div className="mt-16 flex items-center justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-fuchsia-500/40"></div>
            <div className="mx-4 w-2 h-2 rounded-full bg-fuchsia-500/40"></div>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-fuchsia-500/40"></div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section ref={featuresRef} className="py-[100px] px-6 md:px-12 bg-background">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-brand mb-4">Core Features</div>
            <h2 className="text-[42px] font-display font-bold leading-tight text-foreground mb-4">Built for your workflow</h2>
            <p className="text-[18px] text-gray-600 max-w-[600px]">
              Every feature designed to save you time and help you run more events with less stress.
            </p>
          </div>

          {/* Feature Block 1 - Automated Communication */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-16 pb-16 border-b border-border">
            <div>
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center mb-5">
                <Mail className="h-6 w-6 text-voxxy-purple-brand" />
              </div>
              <h3 className="text-[28px] font-display font-bold leading-tight mb-4 text-foreground">Automated vendor communication</h3>
              <p className="text-[16px] leading-relaxed text-gray-600 mb-5">
                Stop writing the same emails over and over. Application confirmations, approval notices, payment reminders, waitlist updates, and event-day details — all sent automatically from one branded email thread. Vendors always know where they stand.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">Automated email sequences for every event stage</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">Branded emails that feel personal</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">Zero manual follow-up required</span>
                </div>
              </div>
            </div>
            <img
              src="/screenshots/email-automation.png"
              alt="Automated email sequences showing vendor communication workflows"
              className="rounded-2xl shadow-xl border border-border"
              loading="lazy"
            />
          </div>

          {/* Feature Block 2 - Vendor CRM - Reversed */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-16 pb-16 border-b border-border">
            <div className="md:order-2">
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center mb-5">
                <Users className="h-6 w-6 text-voxxy-purple-brand" />
              </div>
              <h3 className="text-[28px] font-display font-bold leading-tight mb-4 text-foreground">Vendor relationships that compound</h3>
              <p className="text-[16px] leading-relaxed text-gray-600 mb-5">
                Stop rebuilding your vendor list from scratch every season. Track performance, notes, tags, and ratings across all your events. CSV import for existing lists. Your best vendors are always one search away.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">Unified vendor profiles across all events</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">Performance tracking and ratings</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">CSV import for existing vendor lists</span>
                </div>
              </div>
            </div>
            <div className="md:order-1">
              <img
                src="/screenshots/vendor-crm.png"
                alt="Vendor CRM showing contact management and performance tracking"
                className="rounded-2xl shadow-xl border border-border"
                loading="lazy"
              />
            </div>
          </div>

          {/* Feature Block 3 - Fast Application Review */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-16 pb-16 border-b border-border">
            <div>
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center mb-5">
                <Search className="h-6 w-6 text-voxxy-purple-brand" />
              </div>
              <h3 className="text-[28px] font-display font-bold leading-tight mb-4 text-foreground">Fast application review</h3>
              <p className="text-[16px] leading-relaxed text-gray-600 mb-5">
                Stop scrolling through 200 Instagram profiles one by one. Side-by-side portfolio comparison with integrated social profiles. One-click approve, waitlist, or reject. Bulk actions for faster decisions.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">Side-by-side application comparison</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">Integrated social profiles and portfolios</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">Bulk actions for efficiency</span>
                </div>
              </div>
            </div>
            <img
              src="/screenshots/application-review.png"
              alt="Application review interface with side-by-side comparison"
              className="rounded-2xl shadow-xl border border-border"
              loading="lazy"
            />
          </div>

          {/* Feature Block 4 - No-Code Automation */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="md:order-2">
              <div className="w-12 h-12 bg-voxxy-purple-brand/10 rounded-xl flex items-center justify-center mb-5">
                <Zap className="h-6 w-6 text-voxxy-purple-brand" />
              </div>
              <h3 className="text-[28px] font-display font-bold leading-tight mb-4 text-foreground">Email automation without technical setup</h3>
              <p className="text-[16px] leading-relaxed text-gray-600 mb-5">
                No Mailgun, no SendGrid, no developer needed. Application confirmations, approvals, rejections, waitlist notifications, payment reminders, and day-of logistics — all automated and customizable.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">Automated email triggers for every action</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">Event-specific customization</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-voxxy-purple-brand flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">Zero technical setup required</span>
                </div>
              </div>
            </div>
            <div className="md:order-1">
              <img
                src="/screenshots/email-flows.png"
                alt="Email automation dashboard showing customizable templates"
                className="rounded-2xl shadow-xl border border-border"
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
              <div className="w-16 h-16 bg-fuchsia-500/15 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-fuchsia-400" />
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-[36px] font-display font-bold text-foreground mb-4">Trust & Safety Commitment</h2>
              <p className="text-[18px] text-foreground/60">
                We found that our users — especially those focused on art and community — really care about their data. They want privacy and a commitment that their data won't be sold to third parties.
              </p>
            </div>

            <div className="bg-background/5 border border-border rounded-2xl p-10">
              <p className="text-[16px] text-foreground/70 mb-6 leading-relaxed">
                <strong className="text-foreground">Trust is a huge part of community</strong>, and we want our users to feel safe. That's why we:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Never sell your data</strong>
                    <span className="text-foreground/60"> to third parties without explicit consent</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Generate immediate safety reviews</strong>
                    <span className="text-foreground/60"> for all applications</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Always have human support</strong>
                    <span className="text-foreground/60"> available for any safety concerns</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Transparent about data usage</strong>
                    <span className="text-foreground/60"> — you always know what we do with your information</span>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-foreground/50 italic">
                Your community's safety and privacy are foundational to everything we build.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 relative">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-[42px] md:text-[48px] font-display font-bold text-foreground mb-6">
            Ready to build your next event?
          </h2>
          <p className="text-[18px] text-foreground/70 mb-10 max-w-2xl mx-auto">
            Join event producers everywhere who are scaling their recurring events with Voxxy.
          </p>
          <TrackedLink
            to="/#contact"
            className="inline-flex items-center px-8 py-[18px] voxxy-btn-cta-pink transition-all text-lg font-semibold rounded-xl shadow-md shadow-fuchsia-500/15 hover:shadow-lg dark:shadow-fuchsia-500/25 dark:hover:shadow-xl"
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
