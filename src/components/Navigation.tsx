import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'

interface NavigationProps {
  activePage?: 'home' | 'features' | 'pricing' | 'about' | 'help' | 'contact'
}

export default function Navigation({ activePage }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getLinkClass = (page: string) => {
    return activePage === page
      ? "text-voxxy-purple-brand font-medium"
      : "text-gray-300 hover:text-voxxy-purple-brand transition-colors"
  }

  const getMobileLinkClass = (page: string) => {
    return activePage === page
      ? "block text-voxxy-purple-brand font-medium transition-colors py-2"
      : "block text-gray-300 hover:text-voxxy-purple-brand transition-colors py-2"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 bg-gradient-to-r from-voxxy-purple-deep/95 to-voxxy-purple-mid/95 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto max-w-[1200px]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-[22px] font-display font-bold text-white tracking-tight">
              VOXXY
            </span>
            <span className="text-[14px] text-voxxy-purple-brand ml-1.5 font-normal">presents</span>
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
              to="/contact"
              className="bg-voxxy-purple-brand text-white px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-purple-700 transition-all hover:-translate-y-0.5"
            >
              Get Started →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-gradient-to-r from-voxxy-purple-deep/95 to-voxxy-purple-mid/95 backdrop-blur-xl border-b border-white/10 md:hidden">
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
              to="/contact"
              className="block bg-voxxy-purple-brand text-white px-6 py-2.5 rounded-lg text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
