import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#0f0a1a] border-t border-white/20 text-white py-12 relative z-10">
      <div className="container mx-auto max-w-6xl px-6">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column - Takes more space like header logo */}
          <div className="md:col-span-5">
            <span className="text-2xl md:text-3xl font-bold text-white tracking-wider block mb-4">VOXXY</span>
            <p className="text-white/70 leading-relaxed">
              Event infrastructure for recurring event producers.
              Focus on creating experiences, we'll handle the vendor coordination.
            </p>
          </div>

          {/* Links Section - Condensed into 3 columns */}
          <div className="md:col-span-7 grid grid-cols-3 gap-6">
            {/* Product Column */}
            <div>
              <h4 className="font-semibold mb-3 text-white text-[15px]">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/features" className="text-white/70 hover:text-fuchsia-400 transition-colors text-[14px]">
                    For Artists
                  </Link>
                </li>
                <li>
                  <a href="https://apps.apple.com/us/app/voxxy/id6746337878" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-fuchsia-400 transition-colors text-[14px]">
                    Voxxy Mobile
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-semibold mb-3 text-white text-[15px]">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-white/70 hover:text-fuchsia-400 transition-colors text-[14px]">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-white/70 hover:text-fuchsia-400 transition-colors text-[14px]">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-white/70 hover:text-fuchsia-400 transition-colors text-[14px]">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="font-semibold mb-3 text-white text-[15px]">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/legal/terms" className="text-white/70 hover:text-fuchsia-400 transition-colors text-[14px]">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/legal/privacy" className="text-white/70 hover:text-fuchsia-400 transition-colors text-[14px]">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/legal/acceptable-use" className="text-white/70 hover:text-fuchsia-400 transition-colors text-[14px]">
                    Acceptable Use
                  </Link>
                </li>
                <li>
                  <Link to="/legal/cookies" className="text-white/70 hover:text-fuchsia-400 transition-colors text-[14px]">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-white/20 mt-10 pt-6 text-center">
          <p className="text-white/60 text-sm">&copy; 2025 Voxxy, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
