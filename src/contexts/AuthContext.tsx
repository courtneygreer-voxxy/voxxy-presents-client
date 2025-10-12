import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import {
  signUp,
  signIn,
  signOutUser,
  resetPassword,
  resendEmailVerification,
  getUserProfile,
  handleEmailVerification,
  checkForEmailVerificationInURL,
  AuthServiceError,
  type SignUpData,
  type SignInData
} from '@/services/authService'
import type { User } from '@/types/database'
import { analytics } from '@/lib/analytics'
import { getCachedUserProfile, cacheUserProfile, removeCachedUserProfile } from '@/utils/cache'

interface AuthContextType {
  // Current user state
  currentUser: FirebaseUser | null
  userProfile: User | null
  loading: boolean
  error: string | null
  
  // Auth actions
  signUp: (data: SignUpData) => Promise<void>
  signIn: (data: SignInData) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendVerification: () => Promise<void>
  clearError: () => void
  refreshUserProfile: () => Promise<void>
  
  // Helper methods
  isAuthenticated: boolean
  isEmailVerified: boolean
  needsEmailVerification: boolean

  // Role-specific helpers (v2.0.0)
  isAdmin: boolean
  isOrganizer: boolean
  isVenueOwner: boolean
  hasRole: (role: User['role']) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Derived state
  const isAuthenticated = !!currentUser
  const isEmailVerified = !!currentUser?.emailVerified
  const needsEmailVerification = isAuthenticated && !isEmailVerified

  // Clear error helper
  const clearError = () => setError(null)

  // Handle email verification from URL parameters
  useEffect(() => {
    const actionCode = checkForEmailVerificationInURL()
    if (actionCode) {
      handleEmailVerification(actionCode)
        .then(() => {
          // Clear URL parameters after successful verification
          const url = new URL(window.location.href)
          url.searchParams.delete('mode')
          url.searchParams.delete('oobCode')
          window.history.replaceState({}, '', url.toString())
          
          // Show success message or redirect
          console.log('Email verified successfully!')
        })
        .catch((error) => {
          console.error('Email verification failed:', error)
          setError(error.message)
        })
    }
  }, [])

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        // PERFORMANCE OPTIMIZATION: Try to load cached profile first
        const cachedProfile = getCachedUserProfile<User>(user.uid)

        if (cachedProfile) {
          // Load cached profile immediately for instant UI
          console.log('✓ Loading cached user profile (instant)')
          setUserProfile(cachedProfile)
          setLoading(false) // UI updates immediately!

          // Track sign in with cached data
          if (user.email) {
            analytics.trackUserSignIn(user.email, user.uid, cachedProfile.role)
          }
        }

        // Refresh profile in background (whether cached or not)
        try {
          const profile = await getUserProfile(user.uid)
          setUserProfile(profile)

          // Cache the fresh profile
          if (profile) {
            cacheUserProfile(user.uid, profile)
          }

          // Track user sign in for analytics (only if profile exists)
          if (profile && user.email && !cachedProfile) {
            analytics.trackUserSignIn(user.email, user.uid, profile.role)
          }

          // Only set loading false if we didn't have cache
          if (!cachedProfile) {
            setLoading(false)
          }
        } catch (err) {
          console.warn('Failed to load user profile (this is normal for new users):', err)
          // Don't set error for profile loading issues - user can still use the app
          if (!cachedProfile) {
            setUserProfile(null)
            setLoading(false)
          }
        }
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  // Sign up function
  const handleSignUp = async (data: SignUpData) => {
    try {
      setLoading(true)
      setError(null)
      await signUp(data)
      // Note: onAuthStateChanged will handle setting the user state
    } catch (err) {
      if (err instanceof AuthServiceError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred during sign up')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Sign in function
  const handleSignIn = async (data: SignInData) => {
    try {
      setLoading(true)
      setError(null)
      await signIn(data)
      // Note: onAuthStateChanged will handle setting the user state
    } catch (err) {
      if (err instanceof AuthServiceError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred during sign in')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const handleSignOut = async () => {
    try {
      setLoading(true)
      setError(null)

      // Clear cached profile before signing out
      if (currentUser) {
        removeCachedUserProfile(currentUser.uid)
      }

      await signOutUser()
      // Note: onAuthStateChanged will handle clearing the user state
    } catch (err) {
      if (err instanceof AuthServiceError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred during sign out')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Reset password function
  const handleResetPassword = async (email: string) => {
    try {
      setError(null)
      await resetPassword(email)
    } catch (err) {
      if (err instanceof AuthServiceError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred while resetting password')
      }
      throw err
    }
  }

  // Resend email verification
  const handleResendVerification = async () => {
    if (!currentUser) {
      setError('No user is currently signed in')
      return
    }

    try {
      setError(null)
      await resendEmailVerification(currentUser)
    } catch (err) {
      if (err instanceof AuthServiceError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred while sending verification email')
      }
      throw err
    }
  }

  // Refresh user profile from Firestore
  const handleRefreshUserProfile = async () => {
    if (!currentUser) return

    try {
      const profile = await getUserProfile(currentUser.uid)
      setUserProfile(profile)

      // Update cache with fresh profile
      if (profile) {
        cacheUserProfile(currentUser.uid, profile)
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err)
      // Don't show error to user - just continue without profile
    }
  }

  // Role-specific helper functions (v2.0.0)
  const isAdmin = userProfile?.role === 'admin'
  const isOrganizer = userProfile?.role === 'organizer'
  const isVenueOwner = userProfile?.role === 'venue_owner'
  const hasRole = (role: User['role']) => userProfile?.role === role

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    resendVerification: handleResendVerification,
    clearError,
    refreshUserProfile: handleRefreshUserProfile,
    isAuthenticated,
    isEmailVerified,
    needsEmailVerification,
    isAdmin,
    isOrganizer,
    isVenueOwner,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }