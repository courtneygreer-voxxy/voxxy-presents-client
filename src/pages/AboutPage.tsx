import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { usePageTracking } from '@/hooks/usePageTracking'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useForceTheme } from '@/hooks/useForceTheme'

export default function AboutPage() {
  useForceTheme('dark')
  usePageTracking('About')

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      // Small delay to ensure the DOM has fully painted before scrolling
      setTimeout(() => {
        const el = document.querySelector(hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } else {
      window.scrollTo(0, 0)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden voxxy-gradient-marketing-hero">
      <Navigation activePage="about" />

      {/* Hero Section */}
      <section className="relative pt-[140px] pb-20 px-6 md:px-12">
        <div className="absolute inset-0 bg-gradient-radial from-voxxy-purple-brand/15 via-transparent to-transparent opacity-60"></div>

        <div className="container mx-auto max-w-[900px] text-center relative z-10">
          <h1 className="mb-5 text-[52px] font-display font-bold leading-[1.1] tracking-tight text-white md:text-[56px]">
            Community is built{' '}
            <em className="not-italic bg-gradient-to-r from-[#cc30e8] via-[#9054e3] to-[#651ae9] bg-clip-text text-transparent">
              in person
            </em>
          </h1>
          <p className="mx-auto mb-0 max-w-[700px] text-[18px] leading-relaxed text-white/65">
            Voxxy exists because we believe the best communities are formed face-to-face — at art
            markets, pop-ups, and the events that give neighborhoods their identity.
          </p>

          {/* Divider */}
          <div className="mt-9 flex items-center justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-voxxy-pink/40"></div>
            <div className="mx-4 w-2 h-2 rounded-full bg-voxxy-pink/40"></div>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-voxxy-pink/40"></div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-[#faf9fc] py-[100px] px-6 md:px-12">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-brand mb-4">
              Our Story
            </div>
            <h2 className="mb-6 text-[42px] font-display font-bold leading-tight text-slate-950">
              Built by producers, for producers
            </h2>
          </div>

          {/* Story Content with Image Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
            <div className="space-y-6">
              <p className="text-[16px] text-gray-700 leading-relaxed">
                We're a small team based in Brooklyn, building tools for the people who bring
                communities together. The event producers running art shows at local venues. The
                market organizers coordinating 100 vendors across a weekend. The people who believe
                that gathering in real life matters.
              </p>
              <p className="text-[16px] text-gray-700 leading-relaxed">
                We started Voxxy because we saw these organizers drowning in coordination work —
                juggling spreadsheets, manual emails, endless follow-ups, and disconnected tools —
                instead of doing what they do best: curating experiences that bring people together.
              </p>
              <p className="text-[16px] text-gray-700 leading-relaxed">
                Our background is in community organizing, tech, and events. We've been on both
                sides — producing events and building the tools that power them. Voxxy is the
                platform we wished we had.
              </p>
            </div>

            {/* Image Grid: 1 large image on top, 2 smaller below */}
            <div className="space-y-4">
              <img
                src="/screenshots/event-photo.png"
                alt="Vibrant art market event with vendors and attendees"
                className="h-[300px] w-full rounded-xl border border-slate-200 shadow-lg object-cover"
                loading="lazy"
              />
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="/screenshots/event-photo-1.png"
                  alt="Brooklyn art market with vendors"
                  className="h-[180px] w-full rounded-xl border border-slate-200 shadow-lg object-cover"
                  loading="lazy"
                />
                <img
                  src="/screenshots/event-photo-2.png"
                  alt="Outdoor market vendors setup"
                  className="h-[180px] w-full rounded-xl border border-slate-200 shadow-lg object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="mx-auto grid max-w-[900px] gap-6 border-t border-slate-200 pt-12 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-2 text-[18px] font-bold text-slate-950">🤝 Community First</h4>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                Everything we build starts with the question: does this help people connect in real
                life?
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-2 text-[18px] font-bold text-slate-950">
                ⚡ Simplicity Over Features
              </h4>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                We'd rather do 5 things perfectly than 50 things poorly. Our competitors have
                feature bloat. We have focus.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-2 text-[18px] font-bold text-slate-950">
                🌍 Representation Matters
              </h4>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                We're committed to supporting underrepresented communities in events and tech.
                That's not a talking point — it's our founding story.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-2 text-[18px] font-bold text-slate-950">🛠️ Built by Producers</h4>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                We produce events alongside our customers. We don't just build tools — we use them
                every week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Pledge Section */}
      <section id="ai-pledge" className="voxxy-gradient-marketing-hero py-[100px] px-6 md:px-12">
        <div className="container mx-auto max-w-[900px]">
          <div className="mb-10">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-pink mb-4">Our Stance on AI</div>
            <h2 className="text-[42px] font-display font-bold leading-tight text-white">
              We are, first and foremost,{' '}
              <em className="not-italic bg-gradient-to-r from-[#cc30e8] via-[#9054e3] to-[#651ae9] bg-clip-text text-transparent">
                a company built for community.
              </em>
            </h2>
          </div>

          <div className="space-y-6 text-[16px] leading-relaxed text-white/70">
            <p>
              Our commitment to technology is simple: we will never introduce any feature or tool that causes unjust or undue harm to the people we serve. Given the still-growing unknowns around AI development and the real harm we have already seen it cause to independent artists and their livelihoods, we have made the decision not to incorporate AI into our product until we are confident it will be genuinely beneficial.
            </p>
            <p>
              And if that day comes, it will always be{' '}
              <strong className="text-white">opt-out. Never opt-in by default.</strong>
            </p>
            <p>
              We want you to feel safe here. Safe with your data. Safe with your art. Trust is not a feature for us — it is the foundation. If anything ever makes you feel unsafe, we want to know. Reach out and we will build toward something better together.
            </p>
          </div>

          {/* Voxxy AI, Inc. callout */}
          <div className="my-10 rounded-2xl border border-white/10 bg-white/6 p-8 backdrop-blur-sm">
            <p className="text-[16px] leading-relaxed text-white/70">
              You might notice our legal entity is{' '}
              <strong className="text-white">Voxxy AI, Inc.</strong>{' '}
              We will be honest with you about that. Early in our journey, AI was central to our product vision. After deep learning and harder conversations with our community, we stripped it out. We found no value in it for artists and found mostly harm. Changing a legal name is expensive and slow, but our values moved faster than our paperwork.
            </p>
          </div>

          <div className="space-y-6 text-[16px] leading-relaxed text-white/70">
            <p>
              Things could change. We are not naive enough to say never forever. But we will always put the safety and wellbeing of our artists before any trend, any pressure, or any shortcut.
            </p>
            <p>
              One more thing:{' '}
              <strong className="text-white">we do not use AI-generated art and it will never appear on our platform. Ever.</strong>
            </p>
            <p>
              If you see anything on Voxxy that feels contradictory to this statement, please call us out. Seriously.
            </p>
          </div>

          <div className="mt-10">
            <a
              href="mailto:team@heyvoxxy.com"
              className="text-[16px] font-semibold text-voxxy-pink transition-colors hover:text-white"
            >
              team@heyvoxxy.com
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y border-white/10 voxxy-gradient-marketing-hero py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-[42px] font-display font-bold text-white md:text-[48px]">
            Want to learn more?
          </h2>
          <p className="mb-10 text-[18px] text-white/70">We'd love to hear about your events.</p>
          <TrackedLink
            to="/contact"
            className="inline-flex items-center rounded-xl voxxy-btn-brand px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl"
            trackingData={{
              link_text: 'Get in Touch',
              destination_page: 'Contact',
              current_page: 'About',
              link_position: 'cta_section',
            }}
          >
            Get in Touch <ArrowRight className="ml-2 h-5 w-5" />
          </TrackedLink>
        </div>
      </section>

      <Footer />
    </div>
  )
}
