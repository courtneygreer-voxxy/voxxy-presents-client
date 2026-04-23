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
      ? "font-medium text-white"
      : "text-white/70 hover:text-fuchsia-300 transition-colors"
  }

  const getMobileLinkClass = (page: string) => {
    return activePage === page
      ? "block py-2 font-medium text-white transition-colors"
      : "block py-2 text-white/70 hover:text-fuchsia-300 transition-colors"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[linear-gradient(90deg,rgba(37,18,57,0.96),rgba(49,23,72,0.96))] px-6 py-1 backdrop-blur-xl md:px-12">
      <div className="container mx-auto max-w-[1200px]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center -my-2">
            <img src="/voxxylogo.png" alt="Voxxy" className="h-16 md:h-20 w-auto" />
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
              className="rounded-lg border border-fuchsia-400/20 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_30px_rgba(217,70,239,0.22)] transition-all hover:-translate-y-0.5 hover:brightness-105"
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
        <div className="absolute left-0 right-0 top-full border-b border-white/10 bg-[linear-gradient(180deg,rgba(37,18,57,0.98),rgba(24,11,39,0.98))] md:hidden">
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
              className="block rounded-lg border border-fuchsia-400/20 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-6 py-3 text-center font-semibold text-white shadow-[0_10px_30px_rgba(217,70,239,0.22)]"
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
