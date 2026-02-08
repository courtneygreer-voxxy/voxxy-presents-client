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
      <section className="relative pt-32 pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
            Community is built{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              in person
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Voxxy exists because we believe the best communities are formed face-to-face — at art markets, pop-ups, and the events that give neighborhoods their identity.
          </p>
        </div>
      </section>

      {/* Story Section with 2 Half-Screen Images */}
      <section className="py-24 bg-gray-800/30 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              We're a small team based in Brooklyn, building tools for the people who bring communities together. The event producers running art shows at local venues. The market organizers coordinating 100 vendors across a weekend. The people who believe that gathering in real life matters.
            </p>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              We started Voxxy because we saw these organizers drowning in coordination work — juggling spreadsheets, manual emails, endless follow-ups, and disconnected tools — instead of doing what they do best: curating experiences that bring people together.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Our background is in community organizing, tech, and events. We've been on both sides — producing events and building the tools that power them. Voxxy is the platform we wished we had.
            </p>
          </div>

          {/* 2 Images - Half Screen Layout */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-20">
            <img
              src="/screenshots/event-photo-1.png"
              alt="Brooklyn art market with vendors and visitors"
              className="rounded-xl shadow-2xl border border-white/10 w-full h-[400px] object-cover"
              loading="lazy"
            />
            <img
              src="/screenshots/event-photo-2.png"
              alt="Vibrant outdoor market event"
              className="rounded-xl shadow-2xl border border-white/10 w-full h-[400px] object-cover"
              loading="lazy"
            />
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">🤝 Community First</h4>
              <p className="text-gray-300 leading-relaxed">
                Everything we build starts with the question: does this help people connect in real life?
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">⚡ Simplicity Over Features</h4>
              <p className="text-gray-300 leading-relaxed">
                We'd rather do 5 things perfectly than 50 things poorly. Our competitors have feature bloat. We have focus.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">🌍 Representation Matters</h4>
              <p className="text-gray-300 leading-relaxed">
                We're committed to supporting underrepresented communities in events and tech. That's not a talking point — it's our founding story.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">🛠️ Built by Producers</h4>
              <p className="text-gray-300 leading-relaxed">
                We produce events alongside our customers. We don't just build tools — we use them every week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Want to learn more?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            We'd love to hear about your events.
          </p>
          <TrackedLink
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-purple-600 text-white hover:bg-purple-700 transition-all text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
