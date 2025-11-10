import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-800/50 backdrop-blur-sm border-t border-white/10 text-white py-12 relative z-10">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column - Takes more space like header logo */}
          <div className="md:col-span-5">
            <h3 className="text-2xl font-bold text-white mb-4">Voxxy Presents</h3>
            <p className="text-gray-300 leading-relaxed">
              Event infrastructure for recurring club organizers.
              Focus on building community experiences, we'll handle the coordination logistics.
            </p>
          </div>

          {/* Links Section - Condensed into 3 columns */}
          <div className="md:col-span-7 grid grid-cols-3 gap-6">
            {/* Product Column */}
            <div>
              <h4 className="font-semibold mb-3 text-white">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/features" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-semibold mb-3 text-white">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="font-semibold mb-3 text-white">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <p className="text-gray-400 text-sm">&copy; 2025 Voxxy, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
