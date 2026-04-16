import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LegalLayoutProps {
  children: React.ReactNode
}

export default function LegalLayout({ children }: LegalLayoutProps) {
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
    <div className="min-h-screen bg-background">
      {/* Tab Navigation */}
      <nav className="border-b border-border bg-background sticky top-0 z-40">
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
                      ? 'text-foreground border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
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
