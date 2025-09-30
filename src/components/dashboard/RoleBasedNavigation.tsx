import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  MapPin,
  BookOpen,
  UserCheck,
  FileText,
  Heart,
  Settings,
  Menu,
  X
} from 'lucide-react'
import { User } from '@/types/database-v2'

interface RoleBasedNavigationProps {
  role: User['role']
}

interface NavTab {
  id: string
  label: string
  icon: React.ReactNode
  path: string
}

// Define navigation tabs for each role
const getNavigationTabs = (role: User['role']): NavTab[] => {
  switch (role) {
    case 'organizer':
      return [
        {
          id: 'overview',
          label: 'Overview',
          icon: <LayoutDashboard className="h-4 w-4" />,
          path: '/organizer/dashboard'
        },
        {
          id: 'organizations',
          label: 'Organizations',
          icon: <Building2 className="h-4 w-4" />,
          path: '/organizer/organizations'
        },
        {
          id: 'events',
          label: 'Events',
          icon: <Calendar className="h-4 w-4" />,
          path: '/organizer/events'
        },
        {
          id: 'audience',
          label: 'Audience',
          icon: <Users className="h-4 w-4" />,
          path: '/organizer/audience'
        }
      ]

    case 'venue_owner':
      return [
        {
          id: 'overview',
          label: 'Overview',
          icon: <LayoutDashboard className="h-4 w-4" />,
          path: '/venue-owner/dashboard'
        },
        {
          id: 'venues',
          label: 'Venues',
          icon: <MapPin className="h-4 w-4" />,
          path: '/venue-owner/venues'
        },
        {
          id: 'bookings',
          label: 'Bookings',
          icon: <BookOpen className="h-4 w-4" />,
          path: '/venue-owner/bookings'
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: <Settings className="h-4 w-4" />,
          path: '/venue-owner/profile'
        }
      ]

    case 'admin':
      return [
        {
          id: 'overview',
          label: 'Overview',
          icon: <LayoutDashboard className="h-4 w-4" />,
          path: '/admin/dashboard'
        },
        {
          id: 'approvals',
          label: 'Approvals',
          icon: <UserCheck className="h-4 w-4" />,
          path: '/admin/approvals'
        },
        {
          id: 'users',
          label: 'Users',
          icon: <Users className="h-4 w-4" />,
          path: '/admin/users'
        },
        {
          id: 'content',
          label: 'Content',
          icon: <FileText className="h-4 w-4" />,
          path: '/admin/content'
        }
      ]

    case 'guest':
      return [
        {
          id: 'overview',
          label: 'Overview',
          icon: <LayoutDashboard className="h-4 w-4" />,
          path: '/guest/dashboard'
        },
        {
          id: 'registrations',
          label: 'My Events',
          icon: <Calendar className="h-4 w-4" />,
          path: '/guest/registrations'
        },
        {
          id: 'favorites',
          label: 'Favorites',
          icon: <Heart className="h-4 w-4" />,
          path: '/guest/favorites'
        },
        {
          id: 'social',
          label: 'Social',
          icon: <Users className="h-4 w-4" />,
          path: '/guest/social'
        }
      ]

    default:
      return []
  }
}

export default function RoleBasedNavigation({ role }: RoleBasedNavigationProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const tabs = getNavigationTabs(role)

  // Determine active tab based on current path
  const getActiveTab = () => {
    const currentPath = location.pathname
    const activeTab = tabs.find(tab => currentPath.startsWith(tab.path))
    return activeTab?.id || tabs[0]?.id || 'overview'
  }

  const activeTab = getActiveTab()

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      navigate(tab.path)
      setIsMobileMenuOpen(false) // Close mobile menu when navigating
    }
  }

  if (tabs.length === 0) {
    return null // No navigation for unknown roles
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="h-12 w-full justify-start bg-transparent border-none p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="h-12 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            {/* Current Tab Indicator */}
            <div className="flex items-center space-x-2">
              {tabs.find(tab => tab.id === activeTab)?.icon}
              <span className="font-medium text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="pb-3 border-t border-gray-200 mt-2">
              <div className="grid grid-cols-2 gap-2 mt-3">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTabChange(tab.id)}
                    className="justify-start h-10"
                  >
                    <div className="flex items-center space-x-2">
                      {tab.icon}
                      <span className="text-sm">{tab.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}