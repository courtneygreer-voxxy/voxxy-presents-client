import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Redirect authenticated users away from auth pages
 * Used on login/signup pages to prevent already-logged-in users from accessing them
 */
export function RedirectIfAuthenticatedV2({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userProfile, loading } = useAuth()

  // Show nothing while loading to avoid flash
  if (loading) {
    return null
  }

  // If authenticated, redirect to appropriate holding screen based on role
  if (isAuthenticated && userProfile) {
    const role = userProfile.role

    // Producer roles (venue_owner = Producer in UI)
    if (role === 'producer' || role === 'venue_owner') {
      return <Navigate to="/producer/pending" replace />
    }

    // Vendor roles
    if (role === 'vendor') {
      return <Navigate to="/vendor/pending" replace />
    }

    // Consumer/Guest roles
    if (role === 'consumer' || role === 'guest') {
      return <Navigate to="/pending" replace />
    }

    // Admin
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }

    // Default fallback
    return <Navigate to="/" replace />
  }

  // Not authenticated - show the auth page
  return <>{children}</>
}

export default RedirectIfAuthenticatedV2
