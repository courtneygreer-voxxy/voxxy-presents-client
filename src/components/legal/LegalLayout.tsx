import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForceTheme } from '@/hooks/useForceTheme'

interface LegalLayoutProps {
  children: React.ReactNode
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  useForceTheme('light')
  const location = useLocation()

  const tabs = [
    { name: 'TERMS OF SERVICE', path: '/legal/terms' },
    { name: 'PRIVACY', path: '/legal/privacy' },
    { name: 'ACCEPTABLE USE', path: '/legal/acceptable-use' },
    { name: 'COOKIES', path: '/legal/cookies' },
    { name: 'MOBILE', path: '/legal/mobile' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    // Force light-mode appearance regardless of user's system/app theme
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 40%, #f0f4ff 100%)' }}>
      {/* Sticky nav bar */}
      <nav className="border-b border-violet-100 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
        {/* Brand header */}
        <div className="container mx-auto max-w-6xl px-4 pt-4 pb-1 flex items-center gap-2">
          <img src="/VoxxyTriangle.svg" className="w-5 h-5" alt="Voxxy" />
          <span className="gradient-text font-semibold text-sm tracking-wide">Voxxy</span>
        </div>

        {/* Tab strip */}
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`
                  py-4 px-2 text-sm font-medium whitespace-nowrap transition-colors
                  ${
                    isActive(tab.path)
                      ? 'text-slate-900 border-b-2 border-violet-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }
                `}
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {children}
      </div>
    </div>
  )
}
