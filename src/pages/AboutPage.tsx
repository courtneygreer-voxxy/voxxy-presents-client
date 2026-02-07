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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
      <Navigation activePage="about" />

      {/* Hero Section */}
      <section className="relative pt-[140px] pb-16 px-6 md:px-12 bg-gradient-to-br from-voxxy-purple-deep to-voxxy-purple-mid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-voxxy-purple-brand/15 via-transparent to-transparent"></div>

        <div className="container mx-auto max-w-[1000px] relative z-10">
          <div className="text-center">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-light mb-4">About</div>
            <h1 className="text-[48px] font-display font-bold text-white mb-4 leading-tight">Community is built in person</h1>
            <p className="text-[18px] text-white/60 max-w-[600px] mx-auto">
              Voxxy exists because we believe the best communities are formed face-to-face — at art markets, pop-ups, and the events that give neighborhoods their identity.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-[100px] px-6 md:px-12">
        <div className="container mx-auto max-w-[1200px]">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <p className="text-[17px] leading-relaxed text-gray-600 mb-6">
                We're a small team based in Brooklyn, building tools for the people who bring communities together. The event producers running art shows at local venues. The market organizers coordinating 100 vendors across a weekend. The people who believe that gathering in real life matters.
              </p>
              <p className="text-[17px] leading-relaxed text-gray-600 mb-6">
                We started Voxxy because we saw these organizers drowning in coordination work — juggling spreadsheets, manual emails, endless follow-ups, and disconnected tools — instead of doing what they do best: curating experiences that bring people together.
              </p>
              <p className="text-[17px] leading-relaxed text-gray-600">
                Our background is in community organizing, tech, and events. We've been on both sides — producing events and building the tools that power them. Voxxy is the platform we wished we had.
              </p>
            </div>

            <img
              src="/screenshots/team-photo.png"
              alt="Voxxy team in Brooklyn"
              className="rounded-2xl shadow-xl border border-gray-200 w-full"
              loading="lazy"
            />
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 gap-5 max-w-[900px] mt-10">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-[16px] font-display font-bold mb-1.5">🤝 Community First</h4>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                Everything we build starts with the question: does this help people connect in real life?
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-[16px] font-display font-bold mb-1.5">⚡ Simplicity Over Features</h4>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                We'd rather do 5 things perfectly than 50 things poorly. Our competitors have feature bloat. We have focus.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-[16px] font-display font-bold mb-1.5">🌍 Representation Matters</h4>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                We're committed to supporting underrepresented communities in events and tech. That's not a talking point — it's our founding story.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-[16px] font-display font-bold mb-1.5">🛠️ Built by Producers</h4>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                We produce events alongside our customers. We don't just build tools — we use them every week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-[42px] md:text-[48px] font-display font-bold text-gray-900 mb-6">
            Want to learn more?
          </h2>
          <p className="text-[18px] text-gray-700 mb-10">
            We'd love to hear about your events.
          </p>
          <TrackedLink
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-voxxy-purple-brand text-white hover:bg-purple-700 transition-all text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
