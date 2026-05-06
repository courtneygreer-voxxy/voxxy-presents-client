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
      ? "font-medium text-white bg-white/15 px-3 py-1.5 rounded-md"
      : "text-white/80 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-md transition-all"
  }

  const getMobileLinkClass = (page: string) => {
    return activePage === page
      ? "block py-2 px-3 font-medium text-white bg-white/15 rounded-md transition-colors"
      : "block py-2 px-3 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-all"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 voxxy-nav-surface px-6 py-1 md:px-12">
      <div className="container mx-auto max-w-[1200px]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center -my-3">
            <img src="/voxxylogo.png" alt="Voxxy" className="h-20 md:h-24 w-auto" />
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
              className="rounded-lg voxxy-btn-brand px-6 py-3 text-[14px] font-semibold shadow-[0_10px_30px_rgba(144,84,227,0.22)] transition-all hover:-translate-y-0.5"
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
              className="block rounded-lg voxxy-btn-brand px-6 py-3 text-center font-semibold shadow-[0_10px_30px_rgba(144,84,227,0.22)]"
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
