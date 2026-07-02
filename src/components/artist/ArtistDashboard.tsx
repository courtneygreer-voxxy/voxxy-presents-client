import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  User,
  Bell,
  BookOpen,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { mockArtistProfile, mockNotifications } from '@/mocks/artistPortalData'
import ArtistShowsTab from './ArtistShowsTab'
import ArtistProfileTab from './ArtistProfileTab'
import ArtistInboxTab from './ArtistInboxTab'
import ArtistResourcesTab from './ArtistResourcesTab'

type ArtistNav = 'shows' | 'profile' | 'inbox' | 'resources'

export default function ArtistDashboard() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState<ArtistNav>('shows')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const unreadCount = mockNotifications.filter((n) => !n.read).length

  const navItems = [
    { id: 'shows' as ArtistNav, label: 'My Shows', icon: Calendar },
    { id: 'profile' as ArtistNav, label: 'Profile', icon: User },
    { id: 'inbox' as ArtistNav, label: 'Inbox', icon: Bell, badge: unreadCount },
    { id: 'resources' as ArtistNav, label: 'Resources', icon: BookOpen },
  ]

  const getPageTitle = (): string => {
    switch (activeNav) {
      case 'shows':
        return 'My Shows'
      case 'profile':
        return 'Profile'
      case 'inbox':
        return 'Inbox'
      case 'resources':
        return 'Resources'
      default:
        return 'Dashboard'
    }
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'shows':
        return <ArtistShowsTab />
      case 'profile':
        return <ArtistProfileTab />
      case 'inbox':
        return <ArtistInboxTab />
      case 'resources':
        return <ArtistResourcesTab />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
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
        w-[180px]
        bg-sidebar dark:bg-sidebar/80 dark:backdrop-blur-sm text-sidebar-foreground flex flex-col transition-all duration-300
        border-r border-sidebar-border
        fixed lg:relative inset-y-0 left-0 z-50
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-sidebar-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="text-lg font-bold text-sidebar-foreground tracking-wider block mb-0.5">
                VOXXY
              </span>
              <p className="text-[10px] text-sidebar-foreground/70">Artist Portal</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-sidebar-foreground/80 hover:text-sidebar-foreground p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5">
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
                  w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                  text-xs font-medium transition-smooth
                  ${
                    isActive
                      ? 'voxxy-nav-tab-active shadow-lg'
                      : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge variant="destructive" className="ml-auto h-4 min-w-[16px] px-1 text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer - Artist Profile */}
        <div className="border-t border-sidebar-border">
          {/* Public Profile Link */}
          <div className="p-2 border-b border-sidebar-border">
            <button
              onClick={() => navigate(`/artists/${mockArtistProfile.slug}`)}
              className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-smooth"
            >
              <ExternalLink className="w-3 h-3" />
              View Public Profile
            </button>
          </div>

          {/* User Info */}
          <div className="p-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {mockArtistProfile.name}
                </p>
                <p className="text-[10px] text-sidebar-foreground/70">Artist</p>
              </div>
              <button
                onClick={() => navigate('/artist/login')}
                className="p-1 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-smooth"
                title="Sign out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-sidebar dark:bg-sidebar/80 dark:backdrop-blur-sm text-sidebar-foreground border-b border-sidebar-border pt-3">
          <div className="flex items-center gap-3 px-3 pb-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden rounded-md p-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 transition-smooth"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="text-sm text-sidebar-foreground font-semibold">{getPageTitle()}</h2>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
