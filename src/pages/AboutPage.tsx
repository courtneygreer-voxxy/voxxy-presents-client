import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '@/components/Footer'
import { usePageTracking } from '@/hooks/usePageTracking'
import { analytics } from '@/lib/analytics'

export default function AboutPage() {
  // Track page views
  usePageTracking('About')

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleEmailClick = () => {
    // Analytics tracking for email click
    console.log('Email link clicked on About Page')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 px-4 py-6 bg-gray-800/50 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-white">
              Voxxy Presents
            </Link>
            <Link
              to="/"
              className="text-gray-300 hover:text-purple-400 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative py-16 px-6 md:py-24">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <section className="mb-12 md:mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Making connection effortless
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Voxxy started as a way to fix messy group chats. We're building the operating system for gatherings so hosts and attendees can focus on what matters: time together.
            </p>
          </section>

          {/* Founders Section */}
          <section className="mb-12 md:mb-16">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1">
                <img
                  src="/courtandbeau.png"
                  alt="Courtney Greer and Beau Lazear"
                  className="w-full h-auto rounded-3xl object-cover shadow-2xl"
                  loading="lazy"
                />
              </div>
              <div className="order-1 md:order-2 space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Meet the founders
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  <strong className="text-white">Courtney Greer</strong> and <strong className="text-white">Beau Lazear</strong> are building Voxxy to bridge the gap between spontaneous hangouts and sustainable community.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  We believe software should amplify human warmth, not replace it.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Card */}
          <section>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-10 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Let's work together
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Interested in collaborating, partnering, or investing? Reach out at{' '}
                <a
                  href="mailto:team@voxxyai.com"
                  onClick={handleEmailClick}
                  className="text-purple-400 hover:text-purple-300 underline transition-colors"
                >
                  team@voxxyai.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
