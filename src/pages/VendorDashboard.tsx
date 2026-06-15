import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Settings, Store, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import SettingsPage from './SettingsPage'

type NavItem = 'events' | 'network' | 'settings'

export default function VendorDashboard() {
  const [activeNav, setActiveNav] = useState<NavItem>('events')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { userProfile, isAuthenticated, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, authLoading, navigate])

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const navItems = [
    { id: 'events' as NavItem, label: 'Events', icon: Calendar },
    { id: 'network' as NavItem, label: 'Network', icon: Users },
    { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`
        w-[220px]
        bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300
        fixed lg:relative inset-y-0 left-0 z-50
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="text-3xl font-bold text-sidebar-foreground tracking-wider block mb-2">
                VOXXY
              </span>
              <p className="text-sm text-sidebar-foreground/70">Vendor</p>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-sidebar-foreground/80 hover:text-sidebar-foreground p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'voxxy-nav-tab-active shadow-lg'
                      : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User Profile & Sign Out */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {userProfile?.name || userProfile?.email}
              </p>
              <p className="text-xs text-sidebar-foreground/70">Vendor</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Top Navbar */}
        <header className="h-14 bg-sidebar text-sidebar-foreground border-b border-sidebar-border flex items-center px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-sidebar-foreground/80 hover:text-sidebar-foreground mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h2 className="text-sidebar-foreground font-medium">
            {userProfile?.name || 'Vendor Dashboard'}
          </h2>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background text-foreground">
          {activeNav === 'settings' ? (
            <SettingsPage onBack={() => setActiveNav('events')} />
          ) : (
            <div className="p-4 lg:p-6">
              {/* Empty for now - content will be added later */}
              <div className="text-foreground/40 text-center mt-20">
                <p className="text-base lg:text-lg">Dashboard content coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
