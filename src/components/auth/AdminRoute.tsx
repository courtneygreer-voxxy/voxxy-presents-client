import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingTransition } from '@/components/LoadingTransition'

/**
 * Protect admin-only routes
 * Redirects non-admin users to home page
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  // Show loading while checking auth
  if (loading) {
    return <LoadingTransition message="Verifying admin access..." />
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  // Authenticated but not admin - redirect to home
  if (!isAdmin) {
    console.warn('🚫 Non-admin user attempted to access admin route')
    return <Navigate to="/" replace />
  }

  // Admin user - allow access
  return <>{children}</>
}

export default AdminRoute
