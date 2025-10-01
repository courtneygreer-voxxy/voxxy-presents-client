import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import BetaPendingPage from '@/pages/BetaPendingPage'

interface BetaAccessGuardProps {
  children: React.ReactNode
  requireNonVenueOwner?: boolean
}

export function BetaAccessGuard({ children, requireNonVenueOwner = false }: BetaAccessGuardProps) {
  const { userProfile, loading, isVenueOwner } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return null // Or a loading spinner
  }

  // If user is not authenticated, let the auth flow handle it
  if (!userProfile) {
    return <>{children}</>
  }

  // Check if this route requires non-venue-owner access
  if (requireNonVenueOwner && isVenueOwner) {
    // Redirect venue owners to their V2 dashboard instead of /profile
    return <Navigate to="/venue-owner/dashboard" replace />
  }

  // Check beta status for authenticated users (venue owners and club owners skip beta)
  const skipsBetaCheck = isVenueOwner || userProfile.role === 'club_owner'

  if (!skipsBetaCheck && userProfile.betaStatus === 'pending') {
    return <BetaPendingPage />
  }

  if (!skipsBetaCheck && userProfile.betaStatus === 'denied') {
    // Could create a separate "BetaDeniedPage" if needed
    return <BetaPendingPage />
  }

  // User has approved beta access, render the protected content
  return <>{children}</>
}