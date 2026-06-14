import React, { createContext, useContext, useEffect, useState } from 'react'
import { authApi, getAuthToken, clearAuthToken, ApiError } from '@/services/api'
import { getApiErrorMessage } from '@/errors/getApiErrorMessage'
import { getMessage } from '@/errors/catalog'
import { analytics } from '@/lib/analytics'
import { getCachedUserProfile, cacheUserProfile, removeCachedUserProfile } from '@/utils/cache'
import { resetThemePreference, restoreDashboardThemePreference } from '@/contexts/ThemeContext'

// Rails User type
interface User {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'
  confirmed_at: string | null
  avatar?: string
  profile_pic?: string
  username?: string
  status?: 'active' | 'suspended' | 'banned'
  product_context?: 'mobile' | 'presents' | 'both'
  paid?: boolean // LEGACY - Payment status for producers (deprecated, use subscription_active)
  organization_id?: number // For producers: their primary organization
  // V4.0: Stripe subscription status (replaces legacy 'paid' field)
  subscription_active?: boolean // True if organization has active subscription
  subscription_status?: string | null // 'active', 'inactive', 'past_due', 'canceled'
  subscription_display_status?: string // Human-readable status
  requires_payment?: boolean // True if user needs to pay (producers only)
}

interface SignUpData {
  email: string
  password: string
  displayName: string
  userType?:
    | 'venue_owner'
    | 'consumer'
    | 'producer'
    | 'vendor'
    | 'guest'
    | 'club-owner'
    | 'venue-owner' // Legacy support for club-owner, venue-owner
  role?: User['role']
}

interface SignInData {
  email: string
  password: string
}

interface AuthContextType {
  // Current user state
  currentUser: User | null
  userProfile: User | null
  loading: boolean
  error: string | null

  // Auth actions
  signUp: (data: SignUpData) => Promise<void>
  signIn: (data: SignInData) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
  refreshUserProfile: () => Promise<void>

  // Helper methods
  isAuthenticated: boolean
  isEmailVerified: boolean

  // Role-specific helpers
  isAdmin: boolean
  isProducer: boolean
  isVendor: boolean
  isGuest: boolean
  isOrganizer: boolean // DEPRECATED - alias for isProducer
  isVenueOwner: boolean // DEPRECATED - alias for isVendor
  hasRole: (role: User['role']) => boolean

  // Payment/Subscription helpers (V4.0)
  isPaid: boolean // True if user has active subscription (replaces legacy paid check)
  requiresPayment: boolean // True if user needs to pay
  hasActiveSubscription: boolean // True if subscription_active
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
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Derived state
  const isAuthenticated = !!currentUser

  // Clear error helper
  const clearError = () => setError(null)

  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken()

      if (!token) {
        setLoading(false)
        return
      }

      // Try to load cached profile first
      const cachedProfile = getCachedUserProfile<User>('rails-user')

      if (cachedProfile) {
        console.log('✓ Loading cached user profile (instant)', {
          email: cachedProfile.email,
          role: cachedProfile.role,
          id: cachedProfile.id,
        })
        setCurrentUser(cachedProfile)
        setUserProfile(cachedProfile)
        setLoading(false)

        // Track sign in with cached data
        analytics.trackUserSignIn(cachedProfile.email, String(cachedProfile.id), cachedProfile.role)
      }

      // Fetch fresh profile from API
      try {
        const user = await authApi.getCurrentUser()
        setCurrentUser(user)
        setUserProfile(user)

        // Cache the fresh profile
        if (user) {
          cacheUserProfile('rails-user', user)
        }

        // Track user sign in (only if not cached)
        if (user && !cachedProfile) {
          analytics.trackUserSignIn(user.email, String(user.id), user.role)
        }

        if (!cachedProfile) {
          setLoading(false)
        }
      } catch (err) {
        console.warn('Failed to load user profile:', err)
        // Token might be expired
        clearAuthToken()
        removeCachedUserProfile('rails-user')
        setCurrentUser(null)
        setUserProfile(null)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Sign up function
  const handleSignUp = async (data: SignUpData) => {
    // Don't set loading to true for signup - causes unnecessary re-renders
    // The signup page has its own loading state (isSubmitting)
    try {
      setError(null)

      // Map userType to role, or use explicit role if provided
      let role: User['role'] = 'consumer' // Default fallback

      if (data.role) {
        role = data.role
      } else if (data.userType) {
        // Map userType to roles (with legacy support)
        switch (data.userType) {
          case 'venue_owner':
            role = 'venue_owner'
            break
          case 'club-owner':
            role = 'producer'
            break
          case 'venue-owner':
            role = 'vendor'
            break
          case 'producer':
            role = 'producer'
            break
          case 'vendor':
            role = 'vendor'
            break
          case 'guest':
            role = 'guest'
            break
          default:
            role = 'consumer'
        }
      }

      console.log(`✓ Signing up user with role: ${role}`)

      const response = await authApi.signup({
        email: data.email,
        password: data.password,
        name: data.displayName,
        role: role,
      })

      // Login automatically saves the token
      if (response.token) {
        const user = await authApi.getCurrentUser()
        setCurrentUser(user)
        setUserProfile(user)
        cacheUserProfile('rails-user', user)
        restoreDashboardThemePreference()

        // Track sign up
        analytics.trackUserSignIn(user.email, String(user.id), user.role)
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? getApiErrorMessage(err, 'auth')
          : getMessage('auth.signUpFailed')
      )
      throw err
    }
    // Note: No finally block - don't change loading state for signup
    // The signup page manages its own loading state with isSubmitting
  }

  // Sign in function
  const handleSignIn = async (data: SignInData) => {
    // Don't set loading to true for login - causes unnecessary re-renders
    // The login page has its own loading state (isSubmitting)
    try {
      setError(null)

      // Step 1: Login to get JWT token
      const loginResponse = await authApi.login(data.email, data.password)
      // authApi.login() saves the token automatically

      // Step 2: Fetch full user profile (includes role and other fields)
      // This is critical because login response may not include all user fields
      console.log('✓ Login successful, fetching full user profile...')
      const user = await authApi.getCurrentUser()

      // Step 3: Set user data from full profile
      setCurrentUser(user)
      setUserProfile(user)
      cacheUserProfile('rails-user', user)
      restoreDashboardThemePreference()

      // Track sign in
      analytics.trackUserSignIn(user.email, String(user.id), user.role)

      console.log('✓ User profile loaded:', {
        email: user.email,
        role: user.role,
        confirmed: !!user.confirmed_at,
      })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? getApiErrorMessage(err, 'auth')
          : getMessage('auth.signInFailed')
      )
      throw err
    }
    // Note: No finally block - don't change loading state for login
    // The login page manages its own loading state with isSubmitting
  }

  // Sign out function
  const handleSignOut = async () => {
    try {
      setLoading(true)
      setError(null)

      // Clear cached profile
      removeCachedUserProfile('rails-user')

      // Call logout endpoint and clear token
      await authApi.logout()

      // Public brand pages should return to the default dark theme after sign-out.
      resetThemePreference()

      // Clear state
      setCurrentUser(null)
      setUserProfile(null)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? getApiErrorMessage(err)
          : getMessage('auth.signOutFailed')
      )
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Reset password function
  const handleResetPassword = async (email: string) => {
    try {
      setError(null)
      await authApi.requestPasswordReset(email)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? getApiErrorMessage(err, 'auth')
          : getMessage('auth.resetPasswordFailed')
      )
      throw err
    }
  }

  // Refresh user profile from API
  const handleRefreshUserProfile = async () => {
    try {
      console.log('🔄 Refreshing user profile from API...')
      const user = await authApi.getCurrentUser()
      setCurrentUser(user)
      setUserProfile(user)

      // Update cache with fresh profile
      if (user) {
        cacheUserProfile('rails-user', user)
      }

      console.log('✅ User profile refreshed:', { email: user.email, role: user.role })
    } catch (err) {
      console.error('❌ Failed to refresh user profile:', err)
      // Don't show error to user - just continue without profile
    }
  }

  // Role-specific helper functions
  const isAdmin = userProfile?.role === 'admin'
  const isProducer = userProfile?.role === 'producer' || userProfile?.role === 'venue_owner' // venue_owner = Producer
  const isVendor = userProfile?.role === 'vendor'
  const isGuest = userProfile?.role === 'guest' || userProfile?.role === 'consumer'

  // Email verification status
  const isEmailVerified = !!userProfile?.confirmed_at

  // DEPRECATED (but still work for backward compatibility)
  const isOrganizer = isProducer // Maps to producer role
  const isVenueOwner = isVendor // Maps to vendor role

  const hasRole = (role: User['role']) => userProfile?.role === role

  // Payment/Subscription helpers (V4.0)
  // These replace the legacy 'paid' boolean check with organization subscription status
  const hasActiveSubscription = userProfile?.subscription_active ?? false
  const requiresPayment = userProfile?.requires_payment ?? false
  const isPaid = hasActiveSubscription // New: based on subscription_active, not legacy paid field

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    clearError,
    refreshUserProfile: handleRefreshUserProfile,
    isAuthenticated,
    isEmailVerified,
    isAdmin,
    isProducer,
    isVendor,
    isGuest,
    isOrganizer, // DEPRECATED - use isProducer
    isVenueOwner, // DEPRECATED - use isVendor
    hasRole,
    // V4.0: Payment/Subscription helpers
    isPaid,
    requiresPayment,
    hasActiveSubscription,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
