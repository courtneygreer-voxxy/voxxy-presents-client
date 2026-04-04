import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { usePageTracking } from '@/hooks/usePageTracking'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function AboutPage() {
  usePageTracking('About')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <Navigation activePage="about" />

      {/* Hero Section */}
      <section className="relative pt-[140px] pb-20 px-6 md:px-12">
        <div className="absolute inset-0 bg-gradient-radial from-voxxy-purple-brand/15 via-transparent to-transparent opacity-60"></div>

        <div className="container mx-auto max-w-[900px] text-center relative z-10">
          <h1 className="text-[52px] md:text-[56px] font-display font-bold leading-[1.1] text-white mb-5 tracking-tight">
            Community is built{" "}
            <em className="not-italic bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
              in person
            </em>
          </h1>
          <p className="text-[18px] leading-relaxed text-white/65 max-w-[700px] mx-auto mb-0">
            Voxxy exists because we believe the best communities are formed face-to-face — at art markets, pop-ups, and the events that give neighborhoods their identity.
          </p>

          {/* Divider */}
          <div className="mt-9 flex items-center justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-fuchsia-500/40"></div>
            <div className="mx-4 w-2 h-2 rounded-full bg-fuchsia-500/40"></div>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-fuchsia-500/40"></div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-[100px] px-6 md:px-12 bg-white">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-brand mb-4">Our Story</div>
            <h2 className="text-[42px] font-display font-bold leading-tight text-gray-900 mb-6">Built by producers, for producers</h2>
          </div>

          {/* Story Content with Image Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
            <div className="space-y-6">
              <p className="text-[16px] text-gray-700 leading-relaxed">
                We're a small team based in Brooklyn, building tools for the people who bring communities together. The event producers running art shows at local venues. The market organizers coordinating 100 vendors across a weekend. The people who believe that gathering in real life matters.
              </p>
              <p className="text-[16px] text-gray-700 leading-relaxed">
                We started Voxxy because we saw these organizers drowning in coordination work — juggling spreadsheets, manual emails, endless follow-ups, and disconnected tools — instead of doing what they do best: curating experiences that bring people together.
              </p>
              <p className="text-[16px] text-gray-700 leading-relaxed">
                Our background is in community organizing, tech, and events. We've been on both sides — producing events and building the tools that power them. Voxxy is the platform we wished we had.
              </p>
            </div>

            {/* Image Grid: 1 large image on top, 2 smaller below */}
            <div className="space-y-4">
              <img
                src="/screenshots/event-photo.png"
                alt="Vibrant art market event with vendors and attendees"
                className="rounded-xl shadow-lg border border-gray-200 w-full h-[300px] object-cover"
                loading="lazy"
              />
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="/screenshots/event-photo-1.png"
                  alt="Brooklyn art market with vendors"
                  className="rounded-xl shadow-lg border border-gray-200 w-full h-[180px] object-cover"
                  loading="lazy"
                />
                <img
                  src="/screenshots/event-photo-2.png"
                  alt="Outdoor market vendors setup"
                  className="rounded-xl shadow-lg border border-gray-200 w-full h-[180px] object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto pt-12 border-t border-gray-200">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h4 className="text-[18px] font-bold text-gray-900 mb-2">🤝 Community First</h4>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                Everything we build starts with the question: does this help people connect in real life?
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h4 className="text-[18px] font-bold text-gray-900 mb-2">⚡ Simplicity Over Features</h4>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                We'd rather do 5 things perfectly than 50 things poorly. Our competitors have feature bloat. We have focus.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h4 className="text-[18px] font-bold text-gray-900 mb-2">🌍 Representation Matters</h4>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                We're committed to supporting underrepresented communities in events and tech. That's not a talking point — it's our founding story.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h4 className="text-[18px] font-bold text-gray-900 mb-2">🛠️ Built by Producers</h4>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                We produce events alongside our customers. We don't just build tools — we use them every week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-y border-white/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-[42px] md:text-[48px] font-display font-bold text-white mb-6">
            Want to learn more?
          </h2>
          <p className="text-[18px] text-white/70 mb-10">
            We'd love to hear about your events.
          </p>
          <TrackedLink
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-voxxy-purple-brand hover:bg-gray-100 transition-all text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl"
            trackingData={{
              link_text: 'Get in Touch',
              destination_page: 'Contact',
              current_page: 'About',
              link_position: 'cta_section'
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
