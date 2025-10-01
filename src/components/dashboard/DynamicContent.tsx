import React from 'react'
import { useLocation } from 'react-router-dom'
import { User } from '@/types/database-v2'
import { ClubsManagement } from '@/components/profile/ClubsManagement'
import { ProfileOverview } from '@/components/profile/ProfileOverview'

interface DynamicContentProps {
  role: User['role']
  children?: React.ReactNode
}

// Real components with working functionality restored
const OrganizerOverview = () => <ProfileOverview />

const OrganizerOrganizations = () => <ClubsManagement />

const OrganizerEvents = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Event Management</h3>
        <p className="text-gray-600">Event management interface coming soon...</p>
      </div>
    </div>
  </div>
)

const OrganizerAudience = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Audience Management</h3>
        <p className="text-gray-600">Audience analytics and management interface coming soon...</p>
      </div>
    </div>
  </div>
)

const VenueOwnerOverview = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Venue Owner Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900">My Venues</h4>
            <p className="text-2xl font-bold text-blue-600">2</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900">Pending Bookings</h4>
            <p className="text-2xl font-bold text-green-600">5</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900">Monthly Revenue</h4>
            <p className="text-2xl font-bold text-purple-600">$2,400</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const VenueOwnerVenues = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Venue Management</h3>
        <p className="text-gray-600">Venue management interface coming soon...</p>
      </div>
    </div>
  </div>
)

const VenueOwnerBookings = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Management</h3>
        <p className="text-gray-600">Booking calendar and management interface coming soon...</p>
      </div>
    </div>
  </div>
)

const VenueOwnerProfile = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Profile</h3>
        <p className="text-gray-600">Business profile and settings interface coming soon...</p>
      </div>
    </div>
  </div>
)

const AdminOverview = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900">Total Users</h4>
            <p className="text-2xl font-bold text-blue-600">1,234</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900">Pending Approvals</h4>
            <p className="text-2xl font-bold text-yellow-600">8</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900">Active Events</h4>
            <p className="text-2xl font-bold text-green-600">45</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900">Platform Health</h4>
            <p className="text-2xl font-bold text-purple-600">99.9%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const AdminApprovals = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Unified Approval Queue</h3>
        <p className="text-gray-600">Unified approval system for organizers and venue owners coming soon...</p>
      </div>
    </div>
  </div>
)

const AdminUsers = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
        <p className="text-gray-600">User management and analytics interface coming soon...</p>
      </div>
    </div>
  </div>
)

const AdminContent = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content Moderation</h3>
        <p className="text-gray-600">Content moderation and reporting interface coming soon...</p>
      </div>
    </div>
  </div>
)

const GuestOverview = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900">Events Attended</h4>
            <p className="text-2xl font-bold text-blue-600">8</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900">Upcoming Events</h4>
            <p className="text-2xl font-bold text-green-600">3</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900">Favorite Venues</h4>
            <p className="text-2xl font-bold text-purple-600">5</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const GuestRegistrations = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">My Events</h3>
        <p className="text-gray-600">Event registration history and upcoming events interface coming soon...</p>
      </div>
    </div>
  </div>
)

const GuestFavorites = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Favorites</h3>
        <p className="text-gray-600">Favorite organizations and venues interface coming soon...</p>
      </div>
    </div>
  </div>
)

const GuestSocial = () => (
  <div className="space-y-6">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social Activity</h3>
        <p className="text-gray-600">Social features and community interaction interface coming soon...</p>
      </div>
    </div>
  </div>
)

// Loading and Error components
const LoadingContent = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading content...</p>
    </div>
  </div>
)

const ErrorContent = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
    <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
    <p className="text-red-600">{message}</p>
  </div>
)

export default function DynamicContent({ role, children }: DynamicContentProps) {
  const location = useLocation()

  // If children are provided, render them (for custom content)
  if (children) {
    return <div className="space-y-6">{children}</div>
  }

  // Determine which component to render based on role and current path
  const getContentComponent = () => {
    const path = location.pathname

    try {
      switch (role) {
        case 'organizer':
          if (path.includes('/organizations')) return <OrganizerOrganizations />
          if (path.includes('/events')) return <OrganizerEvents />
          if (path.includes('/audience')) return <OrganizerAudience />
          return <OrganizerOverview /> // Default to overview

        case 'venue_owner':
          if (path.includes('/venues')) return <VenueOwnerVenues />
          if (path.includes('/bookings')) return <VenueOwnerBookings />
          if (path.includes('/profile')) return <VenueOwnerProfile />
          return <VenueOwnerOverview /> // Default to overview

        case 'admin':
          if (path.includes('/approvals')) return <AdminApprovals />
          if (path.includes('/users')) return <AdminUsers />
          if (path.includes('/content')) return <AdminContent />
          return <AdminOverview /> // Default to overview

        case 'guest':
          if (path.includes('/registrations')) return <GuestRegistrations />
          if (path.includes('/favorites')) return <GuestFavorites />
          if (path.includes('/social')) return <GuestSocial />
          return <GuestOverview /> // Default to overview

        default:
          return <ErrorContent message={`Unknown user role: ${role}`} />
      }
    } catch (error) {
      console.error('Error rendering content:', error)
      return <ErrorContent message="Failed to load content. Please try refreshing the page." />
    }
  }

  return (
    <div className="space-y-6">
      {getContentComponent()}
    </div>
  )
}