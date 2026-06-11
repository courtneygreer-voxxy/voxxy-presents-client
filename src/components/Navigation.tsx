import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

interface NavigationProps {
  activePage?: 'home' | 'features' | 'pricing' | 'about' | 'help' | 'contact'
}

export default function Navigation({ activePage }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getLinkClass = (page: string) => {
    return activePage === page
      ? 'font-medium text-white bg-white/15 px-3 py-2 rounded-md'
      : 'text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all'
  }

  const getMobileLinkClass = (page: string) => {
    return activePage === page
      ? 'block py-2 px-3 font-medium text-white bg-white/15 rounded-md transition-colors'
      : 'block py-2 px-3 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-all'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/15 voxxy-nav-surface px-6 py-3 md:px-12">
      <div className="container mx-auto max-w-[1200px]">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-md"
            aria-label="Voxxy home"
          >
            <span className="font-nav-logo text-xl font-black italic tracking-[0.08em] text-white uppercase md:text-[1.65rem] leading-none">
              VOXXY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">
            <Link to="/features" className={`text-[14px] font-medium ${getLinkClass('features')}`}>
              Features
            </Link>
            <Link to="/pricing" className={`text-[14px] font-medium ${getLinkClass('pricing')}`}>
              Pricing
            </Link>
            <Link to="/about" className={`text-[14px] font-medium ${getLinkClass('about')}`}>
              About
            </Link>
            <Link to="/help" className={`text-[14px] font-medium ${getLinkClass('help')}`}>
              Help
            </Link>
            <Link
              to="/#contact"
              className="voxxy-nav-cta-link text-[14px] font-semibold px-3 py-2 rounded-md transition-all"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-white/10 voxxy-gradient-marketing-hero md:hidden">
          <div className="container mx-auto px-6 py-4 space-y-4">
            <Link
              to="/features"
              className={getMobileLinkClass('features')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className={getMobileLinkClass('pricing')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className={getMobileLinkClass('about')}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/help"
              className={getMobileLinkClass('help')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Help
            </Link>
            <Link
              to="/#contact"
              className="block voxxy-nav-cta-link text-center text-[14px] font-semibold px-3 py-2 rounded-md transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
