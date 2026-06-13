import { Link } from 'react-router-dom'
import { analytics } from '@/lib/analytics'

const trackFooterLink = (label: string) => analytics.track('footer_link_clicked', { link_label: label, page: 'landing' })

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 voxxy-gradient-marketing-hero py-12 text-white">
      <div className="container mx-auto max-w-6xl px-6">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column - Takes more space like header logo */}
          <div className="md:col-span-5">
            <span className="mb-4 block text-2xl font-bold tracking-wider text-white md:text-3xl">
              VOXXY
            </span>
            <p className="leading-relaxed text-white/80">
              Event infrastructure for recurring event producers. Focus on creating experiences,
              we'll handle the vendor coordination.
            </p>
          </div>

          {/* Links Section - Condensed into 3 columns */}
          <div className="md:col-span-7 grid grid-cols-3 gap-6">
            {/* Product Column */}
            <div>
              <h4 className="mb-3 text-[15px] font-semibold text-white">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/features"
                    className="text-[14px] text-white/80 transition-colors hover:text-voxxy-pink-light"
                  >
                    For Artists
                  </Link>
                </li>
                <li>
                  <a
                    href="https://apps.apple.com/us/app/voxxy/id6746337878"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-white/80 transition-colors hover:text-voxxy-pink-light"
                  >
                    Voxxy Mobile
                  </a>
                </li>
                {/* Voxxy Mobile link hidden until re-enabled */}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="mb-3 text-[15px] font-semibold text-white">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-[14px] text-white/80 transition-colors hover:text-voxxy-pink-light"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="text-[14px] text-white/80 transition-colors hover:text-voxxy-pink-light"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-[14px] text-white/80 transition-colors hover:text-voxxy-pink-light"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="mb-3 text-[15px] font-semibold text-white">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/legal/terms"
                    className="text-[14px] text-white/80 transition-colors hover:text-voxxy-pink-light"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/privacy"
                    className="text-[14px] text-white/80 transition-colors hover:text-voxxy-pink-light"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/acceptable-use"
                    className="text-[14px] text-white/80 transition-colors hover:text-voxxy-pink-light"
                  >
                    Acceptable Use
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/cookies"
                    className="text-[14px] text-white/80 transition-colors hover:text-voxxy-pink-light"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-white/60">&copy; 2026 Voxxy AI, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
