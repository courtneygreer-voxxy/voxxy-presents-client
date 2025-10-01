import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  applyActionCode,
  checkActionCode,
  User as FirebaseUser,
  UserCredential,
  AuthError
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createUser, getUser } from '@/lib/database'
import type { User } from '@/types/database'

export interface SignUpData {
  email: string
  password: string
  displayName: string
  userType?: 'club-owner' | 'venue-owner' // Optional, defaults to club-owner for backwards compatibility
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResult {
  user: FirebaseUser
  isNewUser?: boolean
}

// Custom error class for auth service
export class AuthServiceError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

// Rate limiting tracker for email verification
class EmailVerificationLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number; blocked: boolean }> = new Map()
  private readonly maxAttempts = 3
  private readonly cooldownPeriod = 5 * 60 * 1000 // 5 minutes
  private readonly blockPeriod = 15 * 60 * 1000 // 15 minutes

  canAttempt(email: string): boolean {
    const record = this.attempts.get(email)
    if (!record) return true

    const now = Date.now()
    
    // If blocked, check if block period has passed
    if (record.blocked) {
      if (now - record.lastAttempt > this.blockPeriod) {
        this.attempts.delete(email)
        return true
      }
      return false
    }

    // If cooldown period has passed, reset attempts
    if (now - record.lastAttempt > this.cooldownPeriod) {
      this.attempts.delete(email)
      return true
    }

    // Check if under limit
    return record.count < this.maxAttempts
  }

  recordAttempt(email: string, success: boolean): void {
    const now = Date.now()
    const record = this.attempts.get(email) || { count: 0, lastAttempt: now, blocked: false }
    
    if (success) {
      // Success - remove any record
      this.attempts.delete(email)
      return
    }

    // Failed attempt
    record.count += 1
    record.lastAttempt = now
    
    // Block if too many attempts
    if (record.count >= this.maxAttempts) {
      record.blocked = true
    }
    
    this.attempts.set(email, record)
  }

  getTimeUntilNextAttempt(email: string): number {
    const record = this.attempts.get(email)
    if (!record) return 0

    const now = Date.now()
    const waitPeriod = record.blocked ? this.blockPeriod : this.cooldownPeriod
    const timeLeft = (record.lastAttempt + waitPeriod) - now
    
    return Math.max(0, Math.ceil(timeLeft / 1000))
  }
}

const emailVerificationLimiter = new EmailVerificationLimiter()

// Sign up with email and password
export const signUp = async ({ email, password, displayName, userType = 'club-owner' }: SignUpData): Promise<AuthResult> => {
  let user: FirebaseUser | null = null

  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password)
    user = userCredential.user

    // Update the user's display name
    await updateProfile(user, {
      displayName: displayName
    })

    // Determine role based on userType
    const role: 'venue_owner' | 'organizer' = userType === 'venue-owner' ? 'venue_owner' : 'organizer'

    // Create user profile with different fields based on user type
    const baseUserData = {
      email: user.email!,
      name: displayName,
      role: role,
      organizationIds: [], // Will be populated when they create clubs/venues
      emailNotifications: true,
    }

    // Club owners go through beta approval process
    const clubOwnerData = userType === 'club-owner' ? {
      betaStatus: 'pending' as const,
      betaRequestedAt: new Date(),
    } : {}

    // Venue owners skip beta entirely and go straight to venue creation
    const venueOwnerData = userType === 'venue-owner' ? {
      venueOwnerProfile: {
        venueIds: [],
        businessInfo: '',
        phone: '',
        preferredContactMethod: 'email' as const,
        onboardingCompleted: false
      }
    } : {}

    // Create user profile in Firestore
    const userData = {
      ...baseUserData,
      ...clubOwnerData,
      ...venueOwnerData
    } as any

    await createUser(user.uid, userData)
    
    // Send email verification with rate limiting protection
    await sendEmailVerificationSafe(user)
    
    return { user, isNewUser: true }
  } catch (error) {
    console.error('Sign up error:', error)
    const authError = error as AuthError
    
    // Handle rate limiting specifically - if user was created successfully
    if (authError.code === 'auth/too-many-requests' && user) {
      // User account is created successfully, just email verification failed
      console.warn('Email verification rate limited during signup, but user account created')
      return { user, isNewUser: true }
    }
    
    throw new AuthServiceError(
      authError.code, 
      getAuthErrorMessage(authError.code)
    )
  }
}

// Sign in with email and password
export const signIn = async ({ email, password }: SignInData): Promise<AuthResult> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
    const { user } = userCredential
    
    return { user, isNewUser: false }
  } catch (error) {
    console.error('Sign in error:', error)
    throw new AuthServiceError(
      (error as AuthError).code,
      getAuthErrorMessage((error as AuthError).code)
    )
  }
}

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Sign out error:', error)
    throw new AuthServiceError(
      (error as AuthError).code,
      'Failed to sign out. Please try again.'
    )
  }
}

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error('Password reset error:', error)
    throw new AuthServiceError(
      (error as AuthError).code,
      getAuthErrorMessage((error as AuthError).code)
    )
  }
}

// Send email verification with rate limiting protection
const sendEmailVerificationSafe = async (user: FirebaseUser): Promise<void> => {
  if (!user.email) throw new Error('User email is required')
  
  // Check rate limiting
  if (!emailVerificationLimiter.canAttempt(user.email)) {
    const waitTime = emailVerificationLimiter.getTimeUntilNextAttempt(user.email)
    throw new AuthServiceError(
      'auth/too-many-requests',
      `Too many verification attempts. Please wait ${Math.ceil(waitTime / 60)} minutes before trying again.`
    )
  }

  try {
    // Try with custom action URL first
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/profile`,
        handleCodeInApp: true
      }
      await sendEmailVerification(user, actionCodeSettings)
    } catch (error) {
      const authError = error as AuthError
      if (authError.code === 'auth/unauthorized-continue-uri') {
        console.warn('Domain not allowlisted, using default email verification')
        await sendEmailVerification(user)
      } else {
        throw error
      }
    }
    
    // Record successful attempt
    emailVerificationLimiter.recordAttempt(user.email, true)
    
  } catch (error) {
    const authError = error as AuthError
    
    // Record failed attempt
    emailVerificationLimiter.recordAttempt(user.email, false)
    
    // Handle specific error cases
    if (authError.code === 'auth/too-many-requests') {
      const waitTime = emailVerificationLimiter.getTimeUntilNextAttempt(user.email)
      throw new AuthServiceError(
        authError.code,
        `Firebase is temporarily rate limiting verification emails. Please wait ${Math.ceil(waitTime / 60)} minutes before trying again.`
      )
    }
    
    throw error
  }
}

// Resend email verification
export const resendEmailVerification = async (user: FirebaseUser): Promise<void> => {
  await sendEmailVerificationSafe(user)
}

// Handle email verification action code
export const handleEmailVerification = async (actionCode: string): Promise<boolean> => {
  try {
    // Verify the action code is valid and not expired
    await checkActionCode(auth, actionCode)
    
    // Apply the action code to verify the email
    await applyActionCode(auth, actionCode)
    
    // Reload the current user to get updated emailVerified status
    if (auth.currentUser) {
      await auth.currentUser.reload()
    }
    
    return true
  } catch (error) {
    console.error('Email verification error:', error)
    const authError = error as AuthError
    
    // Handle specific error cases
    if (authError.code === 'auth/expired-action-code') {
      throw new AuthServiceError(authError.code, 'This verification link has expired. Please request a new one.')
    } else if (authError.code === 'auth/invalid-action-code') {
      throw new AuthServiceError(authError.code, 'This verification link is invalid. Please request a new one.')
    } else if (authError.code === 'auth/user-disabled') {
      throw new AuthServiceError(authError.code, 'This account has been disabled.')
    } else {
      throw new AuthServiceError(authError.code, 'Failed to verify email. Please try again.')
    }
  }
}

// Check if URL contains email verification parameters
export const checkForEmailVerificationInURL = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  const mode = urlParams.get('mode')
  const actionCode = urlParams.get('oobCode')
  
  if (mode === 'verifyEmail' && actionCode) {
    return actionCode
  }
  
  return null
}

// Get user profile from appropriate data source (environment-aware)
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    // Use environment-aware data source
    const { getUserDataSource, getCurrentEnvironment } = await import('@/config/environments')
    const dataSource = getUserDataSource()
    const currentEnv = getCurrentEnvironment()

    console.log('👤 USER DEBUG: Current environment:', currentEnv)
    console.log('👤 USER DEBUG: Data source for users:', dataSource)

    if (dataSource === 'api') {
      // Load user profile from API with Firebase fallback
      console.log('Loading user profile via API')
      try {
        const { usersApi } = await import('@/services/api')
        const response = await usersApi.getCurrentUser()
        console.log('👤 USER DEBUG: User profile from API:', response)
        return response || null
      } catch (apiError) {
        console.warn('API user profile failed, falling back to Firebase:', apiError)
        // Fallback to Firebase if API fails
        const profile = await getUser(uid)
        console.log('👤 USER DEBUG: User profile from Firebase (fallback):', profile)
        return profile
      }
    } else {
      // Load user profile from Firebase
      console.log('Loading user profile via Firebase')
      const profile = await getUser(uid)
      console.log('👤 USER DEBUG: User profile from Firebase:', profile)
      return profile
    }
  } catch (error) {
    console.error('Get user profile error:', error)
    return null
  }
}

// Convert Firebase Auth error codes to user-friendly messages
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email address is already registered. Please sign in or use a different email.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email address. Please check your email or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes before trying again.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please sign in again.',
    'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
    'auth/invalid-verification-id': 'Invalid verification ID. Please try again.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/missing-password': 'Please enter your password.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
  }
  
  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.'
}

// Password validation utility
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Email validation utility
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}