import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import BetaPendingPage from '@/pages/BetaPendingPage'

interface BetaAccessGuardProps {
  children: React.ReactNode
}

export function BetaAccessGuard({ children }: BetaAccessGuardProps) {
  const { userProfile, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return null // Or a loading spinner
  }

  // If user is not authenticated, let the auth flow handle it
  if (!userProfile) {
    return <>{children}</>
  }

  // Check beta status for authenticated users
  if (userProfile.betaStatus === 'pending') {
    return <BetaPendingPage />
  }

  if (userProfile.betaStatus === 'denied') {
    // Could create a separate "BetaDeniedPage" if needed
    return <BetaPendingPage />
  }

  // User has approved beta access, render the protected content
  return <>{children}</>
}