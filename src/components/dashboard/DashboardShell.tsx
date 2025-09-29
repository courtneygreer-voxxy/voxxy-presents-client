import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User as UserV2 } from '@/types/database-v2'
import { User as UserV1 } from '@/types/database'
import UniversalHeader from './UniversalHeader'
import RoleBasedNavigation from './RoleBasedNavigation'
import DynamicContent from './DynamicContent'

// Helper function to convert V1 user to V2 compatible structure
const normalizeUserForV2 = (user: UserV1): UserV2 => {
  return {
    ...user,
    role: user.role === 'user' ? 'guest' : user.role as UserV2['role'],
    approvalStatus: user.betaStatus || 'pending',
    requestedAt: user.betaRequestedAt || user.createdAt,
    deniedReason: undefined,
  } as UserV2
}

interface DashboardShellProps {
  children?: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const { currentUser, userProfile, loading } = useAuth()

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated (should be handled by ProtectedRoute)
  if (!currentUser || !userProfile) {
    return null
  }

  // Normalize user profile for V2 compatibility
  const normalizedUser = normalizeUserForV2(userProfile)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Universal Header - same across all roles */}
      <UniversalHeader user={normalizedUser} />

      {/* Role-based Navigation */}
      <RoleBasedNavigation role={normalizedUser.role} />

      {/* Dynamic Content Area */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <DynamicContent role={normalizedUser.role}>
          {children}
        </DynamicContent>
      </main>
    </div>
  )
}

// Export dashboard shell with role-specific wrapper components
export { DashboardShell }

// Role-specific dashboard wrappers for clean component usage
export function OrganizerDashboard({ children }: { children?: React.ReactNode }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}

export function VenueOwnerDashboard({ children }: { children?: React.ReactNode }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}

export function AdminDashboard({ children }: { children?: React.ReactNode }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}

export function GuestDashboard({ children }: { children?: React.ReactNode }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}