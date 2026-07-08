import { useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useForceTheme } from '@/hooks/useForceTheme'
import { analytics } from '@/lib/analytics'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function ArtistLandingPage() {
  useForceTheme('dark')

  const source = new URLSearchParams(window.location.search).get('source') ?? 'direct'

  // --- Per-route meta / OG ---
  useEffect(() => {
    const prevTitle = document.title
    const prevDescription =
      document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? ''
    const prevRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content ?? ''

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.name = name
        document.head.appendChild(el)
      }
      el.content = content
    }

    const setOg = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('property', property)
        document.head.appendChild(el)
      }
      el.content = content
    }

    document.title = 'Finally. Get Discovered. | Voxxy Artist Network'
    setMeta(
      'description',
      "There are curators and markets looking for artists exactly like you. They just can't find you yet. Join the Voxxy Artist Network.",
    )
    setMeta('robots', 'index, follow')
    setOg('og:title', 'Finally. Get Discovered. | Voxxy Artist Network')
    setOg(
      'og:description',
      "There are curators and markets looking for artists exactly like you. They just can't find you yet. Join the Voxxy Artist Network.",
    )
    setOg('og:image', 'https://www.voxxypresents.com/artists/hero.jpg')

    return () => {
      document.title = prevTitle
      setMeta('description', prevDescription)
      setMeta('robots', prevRobots)
    }
  }, [])

  // --- Analytics ---
  useEffect(() => {
    analytics.track('artist_landing_page_viewed', { source })
    window.scrollTo(0, 0)
  }, [source])

  const handleCTAClick = useCallback(() => {
    analytics.track('artist_cta_clicked', { source })
  }, [source])

  const handleQRClick = useCallback(() => {
    analytics.track('artist_qr_viewed', { source: 'qr' })
  }, [])

  return (
    <div className="dark voxxy-public-page voxxy-gradient-marketing-hero voxxy-gradient-mobile-safe flex min-h-screen flex-col">
      <Navigation activePage="home" />

      {/* ── Main split layout ── */}
      {/* Centers between nav and footer on desktop; flows naturally on mobile so the footer stays reachable */}
      <main className="flex flex-1 justify-center px-6 pt-24 pb-8 md:items-center md:px-12 md:pt-28">
        <div className="container mx-auto max-w-[1200px]">
          <div className="grid items-stretch gap-12 md:grid-cols-2 md:gap-16">
            {/* ── LEFT: Demo visual ── */}
            <div className="flex items-center justify-center">
              {/* Mobile app screenshot fills the column to match right side height */}
              {/* NOTE: artvoximage.png has a light gradient baked into its canvas (not transparent).
                  The radial mask below fades its edges into the dark page background as a stopgap;
                  swap in a transparent-background export to remove the mask entirely. */}
              <div className="relative w-full animate-hero-float motion-reduce:animate-none">
                <img
                  src="/screenshots/artvoximage.png"
                  alt="Voxxy app showing artist profile, portfolio, and event opportunities"
                  className="w-full drop-shadow-[0_24px_56px_rgba(101,26,233,0.35)] [mask-image:radial-gradient(ellipse_72%_72%_at_center,black_58%,transparent_96%)] [-webkit-mask-image:radial-gradient(ellipse_72%_72%_at_center,black_58%,transparent_96%)]"
                  loading="eager"
                />
              </div>
            </div>

            {/* ── RIGHT: Copy + CTA ── */}
            <div className="flex flex-col items-start">
              {/* Label */}
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                Art Call
              </p>

              {/* Headline */}
              <h1 className="mb-5 text-[48px] font-display font-bold leading-[1.05] tracking-tight text-white md:text-[56px]">
                Finally.{' '}
                <em className="not-italic bg-gradient-to-r from-[#cc30e8] via-[#9054e3] to-[#651ae9] bg-clip-text text-transparent">
                  Get Discovered.
                </em>
              </h1>

              {/* Subhead */}
              <p className="mb-8 max-w-[460px] text-[17px] leading-relaxed text-white/68">
                Curators and markets are actively searching for artists exactly like you. The gap
                isn't your work, it's that they can't find you yet.
              </p>

              {/* Outcome lines: stacked, no bullets, no pipes */}
              <ul className="mb-9 space-y-3" aria-label="Benefits">
                <li className="text-[15px] font-medium leading-snug text-white/80">
                  Opportunities come to you, stop chasing.
                </li>
                <li className="text-[15px] font-medium leading-snug text-white/80">
                  Apply in seconds. No gatekeeping, no fees.
                </li>
                <li className="text-[15px] font-medium leading-snug text-white/80">
                  Your work in front of curators and markets that actually want it.
                </li>
              </ul>

              {/* Primary CTA: opens the SMS opt-in flow, no visible phone number */}
              <a
                href="sms:+13478683150?&body=ARTIST"
                onClick={handleCTAClick}
                className="mb-4 inline-flex items-center justify-center rounded-xl voxxy-btn-brand px-7 py-4 text-[16px] font-bold text-white shadow-md shadow-primary/25 transition-all hover:brightness-105 hover:shadow-lg active:scale-[0.98]"
                aria-label="Opt in by text to join the Voxxy Artist Network mobile waitlist"
              >
                Opt In: Join the Mobile Waitlist
              </a>

              {/* TCPA consent disclosure */}
              <p className="mb-7 max-w-[420px] text-[10px] leading-relaxed text-white/30">
                By texting ARTIST, you agree to receive recurring automated marketing and
                informational texts from Voxxy at the number provided. Consent is not a condition of
                purchase. Msg &amp; data rates may apply. Msg frequency varies. Reply STOP to
                cancel, HELP for help. See our{' '}
                <Link
                  to="/legal/privacy"
                  className="underline transition-colors hover:text-white/55"
                >
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link to="/legal/terms" className="underline transition-colors hover:text-white/55">
                  Terms
                </Link>{' '}
                and our{' '}
                <Link
                  to="/about#ai-pledge"
                  className="underline transition-colors hover:text-white/55"
                >
                  AI Pledge
                </Link>
                .
              </p>

              {/* QR secondary CTA */}
              <div className="mb-7 flex items-center gap-5">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[12px] text-white/50">Or scan to join</p>
                  {/* QR CODE: qr-code-text.png */}
                  <img
                    src="/screenshots/qr-code-text.png"
                    alt="QR code to join the Voxxy Artist Network via SMS"
                    className="h-[130px] w-[130px] rounded-xl border border-white/15 bg-white p-1.5"
                    loading="lazy"
                    onClick={handleQRClick}
                  />
                </div>
                <p className="max-w-[180px] text-[12px] leading-relaxed text-white/40">
                  Scan with your phone camera to text us instantly.
                </p>
              </div>

              {/* Artist Directory click-out */}
              <a
                href="https://www.artistdirectory.net"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.track('artist_directory_link_clicked', { source })}
                className="text-[14px] font-medium text-white/60 underline underline-offset-4 transition-colors hover:text-white"
              >
                See more resources to grow your career at the Artist Directory →
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
