import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, LogIn } from 'lucide-react'

interface NavigationProps {
  activePage?: 'home' | 'features' | 'pricing' | 'help' | 'contact'
}

export default function Navigation({ activePage }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getLinkClass = (page: string) => {
    return activePage === page
      ? "text-purple-400 font-medium"
      : "text-gray-300 hover:text-purple-400 transition-colors"
  }

  const getMobileLinkClass = (page: string) => {
    return activePage === page
      ? "block text-purple-400 font-medium transition-colors py-2"
      : "block text-gray-300 hover:text-purple-400 transition-colors py-2"
  }

  return (
    <nav className="relative z-50 px-4 py-3 md:py-6 bg-gray-800/50 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between md:grid md:grid-cols-3">
          {/* Logo - Left */}
          <Link to="/" className="md:justify-self-start">
            <img src="/PresentsHeader2.svg" alt="Voxxy Presents" className="h-16 md:h-20" />
          </Link>

          {/* Navigation - Center */}
          <div className="hidden md:flex items-center gap-6 justify-self-center">
            <Link to="/features" className={getLinkClass('features')}>Features</Link>
            <Link to="/help" className={getLinkClass('help')}>Help Center</Link>
            <Link to="/contact" className={getLinkClass('contact')}>Contact</Link>
          </div>

          {/* Actions - Right */}
          <div className="flex items-center gap-4 md:justify-self-end">
            <Link
              to="/login"
              className="hidden md:flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-b border-white/10 md:hidden">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              to="/features"
              className={getMobileLinkClass('features')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/help"
              className={getMobileLinkClass('help')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Help Center
            </Link>
            <Link
              to="/contact"
              className={getMobileLinkClass('contact')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="border-t border-white/10 pt-4">
              <Link
                to="/login"
                className="block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
