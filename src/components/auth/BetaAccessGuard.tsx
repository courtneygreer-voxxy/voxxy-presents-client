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
    // Redirect vendors to their dashboard instead of /profile
    return <Navigate to="/vendor/dashboard" replace />
  }

  // V3.0: Vendors skip beta approval entirely
  if (userProfile.role === 'vendor' || userProfile.role === 'venue_owner') {
    return <>{children}</>
  }

  // Check beta status for authenticated users (producers/organizers need beta approval)
  // Handle both old and new data formats
  const betaStatus = userProfile.betaStatus || (userProfile.approvalStatus === 'approved' ? 'approved' : 'pending')
  const hasBetaAccess = userProfile.betaAccess || betaStatus === 'approved'

  if (!hasBetaAccess && betaStatus === 'pending') {
    return <BetaPendingPage />
  }

  if (betaStatus === 'denied') {
    // Could create a separate "BetaDeniedPage" if needed
    return <BetaPendingPage />
  }

  // User has approved beta access, render the protected content
  return <>{children}</>
}